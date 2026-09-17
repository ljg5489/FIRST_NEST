// Pure planning rules: all fallback amounts are planning allowances, not quoted prices.
export const REGIONS = ['공주','부여','보령','서천','태안','청양'] as const;
export const TRANSPORTS = ['대중교통','택시','렌터카','도보 중심'] as const;
export const PACES = ['여유롭게','보통','많이 보기'] as const;
export const INTERESTS = ['역사','로컬 음식','자연','축제','가족','사진 명소'] as const;
export type Conditions = {days:number;people:number;budget:number;budgetType:'전체 예산'|'1인 예산';startRegion:string;travelPace:string;transport:string;language:string;country:string;focus:string;name?:string};
export function normalizeConditions(input: Record<string, unknown>): Conditions {
  const integer = (key:string, fallback:number,min:number,max:number) => {
    const value = input[key] === undefined ? fallback : Number(input[key]);
    if (!Number.isInteger(value) || value<min || value>max) throw new Error(`${key}: invalid`);
    return value;
  };
  const choice = (key:string,values:readonly string[],fallback:string) => {
    const value = input[key] === undefined ? fallback : input[key];
    if (typeof value !== 'string' || !values.includes(value)) throw new Error(`${key}: invalid`);
    return value;
  };
  const focus = input.focus ?? '';
  if (typeof focus !== 'string' || focus.length>300 || focus.split(',').map(s=>s.trim()).filter(Boolean).some(i=>!INTERESTS.includes(i as typeof INTERESTS[number]))) throw new Error('focus: invalid');
  if (input.name !== undefined && (typeof input.name !== 'string' || input.name.length>100)) throw new Error('name: invalid');
  return {days:integer('days',1,1,7),people:integer('people',2,1,20),budget:integer('budget',100000,1,100000000),budgetType:choice('budgetType',['전체 예산','1인 예산'],'전체 예산') as Conditions['budgetType'],startRegion:choice('startRegion',REGIONS,'공주'),travelPace:choice('travelPace',PACES,'보통'),transport:choice('transport',TRANSPORTS,'대중교통'),language:choice('language',['Korean','English','Japanese','Vietnamese'],'Korean'),country:choice('country',['Korea','USA','Japan','Vietnam',''],'Korea'),focus,name:input.name as string|undefined};
}
export type PlanningPlace = {id:string;name_ko:string;address:string;latitude:number;longitude:number;category_code?:string;place_facilities?:{facility_type:string;is_available:boolean|null}[];place_images?:{image_url:string}[]};
export function distanceKm(a:{lat:number;lng:number},b:{lat:number;lng:number}) {
  const rad = Math.PI/180, dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
  return 6371*2*Math.asin(Math.min(1,Math.sqrt(h)));
}
export const point = (p:PlanningPlace) => ({lat:p.latitude,lng:p.longitude});
const interestCodes:Record<string,string[]> = {'역사':['HS'],'자연':['NA'],'로컬 음식':['FD'],'가족':['EX','NA','VE'],'사진 명소':['NA','HS','VE'],'축제':['EV']};
export function planPlaces(candidates:PlanningPlace[],c:Conditions) {
  const interests=c.focus.split(',').map(s=>s.trim()).filter(Boolean);
  const warnings:string[]=[];
  // Keep the chosen region: never silently replace it with a distant area.
  let pool=candidates.filter(p=>p.address?.includes(`${c.startRegion}시`) || p.address?.includes(`${c.startRegion}군`) || p.address?.split(' ')[1]===c.startRegion);
  pool=pool.filter(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=90&&Math.abs(p.longitude)<=180);
  if(interests.includes('가족')) {
    pool=pool.filter(p=>!p.place_facilities?.some(f=>f.facility_type==='baby_carriage'&&f.is_available===false));
    warnings.push('가족 여행은 유모차 이용 불가로 확인된 장소를 제외합니다. 나머지 장소의 편의시설은 방문 전 확인해 주세요.');
  }
  if(interests.includes('사진 명소')) warnings.push('사진 취향은 자연·역사·문화 장소를 우선합니다. 사진 촬영 적합성이나 인기도가 검증된 목록은 아닙니다.');
  if(interests.includes('축제')) warnings.push('축제는 일정이 바뀔 수 있으니 행사 기간을 확인해 주세요.');
  const allowed=new Set(interests.flatMap(i=>interestCodes[i]||[]));
  const sightseeing=pool.filter(p=>allowed.size?allowed.has(p.category_code?.slice(0,2)||''):['HS','NA','EX','VE','LS'].includes(p.category_code?.slice(0,2)||''));
  pool=sightseeing;
  const perDay=c.travelPace==='여유롭게'?2:c.travelPace==='많이 보기'?4:3;
  const maxLeg=c.transport==='도보 중심'?3:c.transport==='대중교통'?20:40;
  const groups:PlanningPlace[][]=[];
  const used=new Set<string>();
  let last:PlanningPlace|undefined;
  for(let day=0;day<c.days;day++) {
    const group:PlanningPlace[]=[];
    const covered=new Set<string>();
    for(let stop=0;stop<perDay;stop++) {
      const choices=pool.filter(p=>!used.has(p.id)&&(!last||distanceKm(point(last),point(p))<=maxLeg));
      choices.sort((a,b)=>{
        const score=(p:PlanningPlace)=> (last?distanceKm(point(last),point(p)):0) - interests.filter(i=>!covered.has(i)&&interestCodes[i]?.includes(p.category_code?.slice(0,2)||'')).length*4;
        return score(a)-score(b)||a.id.localeCompare(b.id);
      });
      const selected=choices[0]; if(!selected) break;
      group.push(selected);used.add(selected.id);last=selected;
      interests.filter(i=>interestCodes[i]?.includes(selected.category_code?.slice(0,2)||'')).forEach(i=>covered.add(i));
    }
    groups.push(group);
  }
  if(groups.some(g=>g.length<perDay)) warnings.push('지역·관심사·이동 거리 조건에 맞는 장소가 부족해 일부 일정이 짧습니다. 조건을 바꾸거나 장소를 직접 추가해 주세요.');
  return {groups,warnings};
}
export type RouteEstimate={distance:number;duration:number;source:'kakao'|'estimate';reason?:string;toll?:number;taxi?:number};
export function fallbackRoute(a:{lat:number;lng:number},b:{lat:number;lng:number},transport:string):RouteEstimate {
  const distance=distanceKm(a,b)*(transport==='도보 중심'?1.2:1.35);
  const speed=transport==='도보 중심'?4:transport==='대중교통'?22:35;
  return {distance:Math.round(distance*10)/10,duration:Math.ceil(distance/speed*60)+(transport==='대중교통'&&distance>0?15:0),source:'estimate'};
}
export type CostEstimate={total:number;perPerson:number;budgetTotal:number;remaining:number;breakdown:{label:string;amount:number;basis:string}[]};
export type PlanningSnapshot={conditions:Conditions;warnings:string[];routes:RouteEstimate[];signature:string};
export function validPlanning(value:unknown):value is PlanningSnapshot {
  if(!value||typeof value!=='object')return false;
  const v=value as PlanningSnapshot;
  try {const c=normalizeConditions(v.conditions as unknown as Record<string,unknown>);if(Object.keys(c).some(k=>k!=='name'&&v.conditions[k]!==c[k]))return false;}catch{return false;}
  return typeof v.signature==='string'&&v.signature.length<12000&&Array.isArray(v.warnings)&&v.warnings.length<=20&&v.warnings.every(s=>typeof s==='string'&&s.length<=1500)&&Array.isArray(v.routes)&&v.routes.length<=49&&v.routes.every(r=>r&&['kakao','estimate'].includes(r.source)&&[r.distance,r.duration].every(n=>Number.isFinite(n)&&n>=0&&n<100000)&&[r.toll,r.taxi].every(n=>n===undefined||Number.isFinite(n)&&n>=0&&n<10000000));
}
export function estimatedDayRoutes(groups:PlanningPlace[][],transport:string) {
  return groups.flatMap(g=>g.slice(1).map((p,i)=>fallbackRoute(point(g[i]),point(p),transport)));
}
export function fitBudget(groups:PlanningPlace[][],conditions:Conditions) {
  let trimmed=false;
  while(estimateCosts(conditions,groups.flat(),estimatedDayRoutes(groups,conditions.transport)).remaining<0) {
    const group=[...groups].reverse().find(g=>g.length>1);if(!group)break;
    group.pop();trimmed=true;
  }
  return trimmed;
}
export function estimateCosts(c:Conditions,places:PlanningPlace[],routes:RouteEstimate[]):CostEstimate {
  const cars=Math.ceil(c.people/4),rooms=Math.ceil(c.people/2),nights=c.days-1;
  const meals=c.days*3*c.people*12000;
  const lodging=nights*rooms*80000;
  const visit=places.filter(p=>!['FD','AC'].includes(p.category_code?.slice(0,2)||'')).length*c.people*10000;
  const km=routes.reduce((s,r)=>s+r.distance,0);
  const transport=c.transport==='도보 중심'?0:c.transport==='대중교통'?c.days*c.people*10000:c.transport==='택시'?Math.ceil(routes.reduce((s,r)=>s+(r.taxi??5000+r.distance*1200),0)*cars):Math.ceil((c.days*70000+km*180+routes.reduce((s,r)=>s+(r.toll??0),0))*cars);
  const breakdown=[{label:'식비',amount:meals,basis:'1인 1일 3끼 × 끼니당 12,000원. 음식점 방문도 여기에 포함합니다.'},{label:'숙박비',amount:lodging,basis:`${nights}박 × 2인 1실 ${rooms}실 × 80,000원`},{label:'입장·체험비',amount:visit,basis:'음식점·숙박을 제외한 방문지당 1인 10,000원 예비비. 무료 여부는 미확인입니다.'},{label:'이동비',amount:transport,basis:c.transport==='렌터카'?`4인당 차량 1대(${cars}대), 하루 70,000원 + km당 180원 + 확인된 통행료`:c.transport==='택시'?`4인당 택시 1대(${cars}대), 제공 요금 또는 구간당 5,000원 + km당 1,200원`:c.transport==='대중교통'?'1인 1일 10,000원 이동 예비비. 실제 노선·요금은 미확인입니다.':'도보 이동 기준 0원. 다른 교통수단 이용료는 별도입니다.'}];
  const total=breakdown.reduce((s,b)=>s+b.amount,0),budgetTotal=c.budget*(c.budgetType==='1인 예산'?c.people:1);
  return {total,perPerson:Math.ceil(total/c.people),budgetTotal,remaining:budgetTotal-total,breakdown};
}
