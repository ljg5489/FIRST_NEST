import { generateCourseStory } from '@/lib/openai';
import { getDrivingRoute } from '@/lib/kakao-rest';
import { supabase } from '@/services/supabase/client';
import { normalizeConditions, planPlaces, fitBudget, point, fallbackRoute, estimateCosts, type Conditions, type PlanningPlace, type RouteEstimate, type CostEstimate } from './travel-planning';
export type TravelerInput = {days:number;name?:string;country?:string;focus?:string;people?:number;budget?:number;budgetType?:string;startRegion?:string;travelPace?:string;transport?:string;language?:string};
export interface BuiltCourse {
  route:string; aiStory:string; routes:RouteEstimate[]; conditions:Conditions; warnings:string[]; cost:CostEstimate;
  metrics:{dispersion:null;friendly:null;reliability:string;estimatedDistance:string;estimatedTime:number;source:string;perDay:{day_number:number;distance:number;duration:number}[]};
  places:PlanningPlace[];
  days:{day_number:number;stops:{sequence:number;place_id:string;place_name:string;nearby_events:any[]}[]}[];
}
export async function buildTravelCourse(input:TravelerInput):Promise<BuiltCourse|null> {
  const conditions=normalizeConditions(input as unknown as Record<string,unknown>);
  // Fetch only the requested region, in stable pages; avoid arbitrary first-100 truncation.
  const candidates:PlanningPlace[]=[];
  for(let page=0;page<10;page++) {
    const {data,error}=await supabase.from('places').select('id,name_ko,address,latitude,longitude,category_code,place_images(image_url),place_facilities(facility_type,is_available)').eq('is_active',true).ilike('address',`%${conditions.startRegion}%`).order('id').range(page*500,page*500+499);
    if(error) throw new Error('여행지 정보를 불러오지 못했습니다.');
    candidates.push(...(data||[]) as PlanningPlace[]);
    if(!data||data.length<500) break;
  }
  const {groups,warnings}=planPlaces(candidates,conditions);
  if(!groups.flat().length) return null;
  const trimmed=fitBudget(groups,conditions);
  if(trimmed) warnings.push('입력한 예산에 맞추기 위해 방문지 수를 줄였습니다.');
  const places=groups.flat();const routes:RouteEstimate[]=[];
  const perDay:{day_number:number;distance:number;duration:number}[]=[];
  const routingStarted=Date.now();
  for(const [day,dayPlaces] of groups.entries()) {
    const dayRoutes:RouteEstimate[]=[];
    for(let i=1;i<dayPlaces.length;i++) {
      dayRoutes.push(['렌터카','택시'].includes(conditions.transport)&&Date.now()-routingStarted<12000?await getDrivingRoute(point(dayPlaces[i-1]),point(dayPlaces[i])):fallbackRoute(point(dayPlaces[i-1]),point(dayPlaces[i]),conditions.transport));
    }
    routes.push(...dayRoutes);
    perDay.push({day_number:day+1,distance:dayRoutes.reduce((s,r)=>s+r.distance,0),duration:dayRoutes.reduce((s,r)=>s+r.duration,0)});
  }
  const approximate=routes.some(r=>r.source==='estimate');
  if(approximate) warnings.push(conditions.transport==='대중교통'?'대중교통 시간은 거리와 대기시간을 이용한 추정이며 실제 노선 조회 결과가 아닙니다.':conditions.transport==='도보 중심'?'도보 시간은 거리 기반 추정입니다. 보행 가능한 길인지 지도에서 확인해 주세요.':'자동차 경로를 확인하지 못한 구간은 거리 기반 추정으로 표시합니다.');
  const cost=estimateCosts(conditions,places,routes);
  if(cost.remaining<0) warnings.push(`현재 조건의 예상 비용이 예산보다 ${(-cost.remaining).toLocaleString('ko-KR')}원 높습니다. 인원·일수·이동수단 또는 예산을 조정해 주세요.`);
  const eventsByPlace:Record<string,any[]>={};
  const {data:events}=await supabase.from('place_events').select('place_id,start_date,end_date,events(title)').in('place_id',places.map(p=>p.id)).gte('end_date',new Date().toISOString().slice(0,10));
  for(const e of events||[]) (eventsByPlace[e.place_id]??=[]).push(e);
  const aiStory=await generateCourseStory({name:conditions.name||'',country:conditions.country,focus:conditions.focus,duration:`${conditions.days} days; ${conditions.people} people; ${conditions.travelPace}; ${conditions.transport}; budget ${cost.budgetTotal} KRW`,language:conditions.language},places.map(p=>p.name_ko));
  return {route:places.map(p=>p.name_ko).join(' → '),aiStory,routes,conditions,warnings,cost,metrics:{dispersion:null,friendly:null,reliability:approximate?'Estimated':routes.length?'Verified route':'No travel segments',estimatedDistance:routes.reduce((s,r)=>s+r.distance,0).toFixed(1),estimatedTime:routes.reduce((s,r)=>s+r.duration,0),source:approximate?'estimate':routes.length?'kakao':'no_travel',perDay},places,days:groups.map((g,i)=>({day_number:i+1,stops:g.map((p,j)=>({sequence:j+1,place_id:p.id,place_name:p.name_ko,nearby_events:eventsByPlace[p.id]||[]}))}))};
}
