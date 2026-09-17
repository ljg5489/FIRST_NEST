import { fallbackRoute, type RouteEstimate } from './travel-planning.ts';
let blockedUntil=0;
export async function getDrivingRoute(origin:{lat:number;lng:number},destination:{lat:number;lng:number}):Promise<RouteEstimate> {
  const fallback=fallbackRoute(origin,destination,'렌터카');
  const key=process.env.KAKAO_REST_API_KEY?.trim();
  if(!key) return {...fallback,reason:'missing_key'};
  if(Date.now()<blockedUntil) return {...fallback,reason:'authorization'};
  try {
    const url=new URL('https://apis-navi.kakaomobility.com/v1/directions');
    url.searchParams.set('origin',`${origin.lng},${origin.lat}`);
    url.searchParams.set('destination',`${destination.lng},${destination.lat}`);
    url.searchParams.set('summary','true');
    const response=await fetch(url,{headers:{Authorization:`KakaoAK ${key}`},signal:AbortSignal.timeout(5000),cache:'no-store'});
    if(!response.ok) {
      if(response.status===401||response.status===403) blockedUntil=Date.now()+60000;
      return {...fallback,reason:response.status===401||response.status===403?'authorization':`http_${response.status}`};
    }
    const data=await response.json();const route=data.routes?.[0],summary=route?.summary;
    if(route?.result_code!==0||!summary||!Number.isFinite(summary.distance)||!Number.isFinite(summary.duration)||summary.distance<0||summary.duration<0) return {...fallback,reason:'no_route'};
    return {distance:summary.distance/1000,duration:Math.ceil(summary.duration/60),source:'kakao',toll:Number.isFinite(summary.fare?.toll)?summary.fare.toll:undefined,taxi:Number.isFinite(summary.fare?.taxi)?summary.fare.taxi:undefined};
  } catch {return {...fallback,reason:'unavailable'};}
}
