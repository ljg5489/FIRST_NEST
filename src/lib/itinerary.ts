export type ItineraryPlace = {id:string;name:string;region:string;address?:string;latitude?:number;longitude?:number;nearbyEvents?:string[]};
export type ItineraryDay = {day:string;region:string;attractions:ItineraryPlace[]};
export type Itinerary = {version:1;title:string;startDate:string;days:ItineraryDay[];aiStory?:string};
export type DraftEnvelope = {itinerary:Itinerary;requestId:string;courseId?:number;updatedAt?:string};
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text=(s:unknown,n:number)=>typeof s==='string'&&s.length<=n;
export function validItinerary(value:unknown): value is Itinerary {
  if(!value||typeof value!=='object')return false;
  const v=value as Itinerary;
  if(v.version!==1||!text(v.title,120)||!v.title.trim()||!text(v.startDate,10)||v.startDate&&!/^\d{4}-\d{2}-\d{2}$/.test(v.startDate)||v.aiStory!==undefined&&!text(v.aiStory,30000)||!Array.isArray(v.days)||v.days.length<1||v.days.length>7)return false;
  let count=0;const ids=new Set<string>();
  return v.days.every((d,index)=>d&&d.day===`Day ${index+1}`&&text(d.region,100)&&Array.isArray(d.attractions)&&d.attractions.every(p=>{
    if(!p||!text(p.id,90)||!UUID.test(p.id)&&!/^custom-[a-zA-Z0-9-]{1,80}$/.test(p.id)||!text(p.name,200)||!p.name.trim()||!text(p.region,100)||ids.has(p.id)||++count>50)return false;
    ids.add(p.id);
    return (p.address===undefined||text(p.address,1000))&&(p.latitude===undefined||Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90)&&(p.longitude===undefined||Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180)&&(p.nearbyEvents===undefined||Array.isArray(p.nearbyEvents)&&p.nearbyEvents.length<=30&&p.nearbyEvents.every(e=>text(e,300)));
  }));
}
export function itineraryMapPlaces(itinerary:Itinerary) {
  return itinerary.days.flatMap(d=>d.attractions).filter(p=>UUID.test(p.id)&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude));
}
