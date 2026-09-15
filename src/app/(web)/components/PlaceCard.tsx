'use client';
import {useState} from 'react';
import {TravelIcon} from './TravelIcon';
export function PlaceCard({id,name,region,category,imageUrl,summary}:{id:string;name:string;region:string;category?:string;imageUrl?:string|null;summary?:string}) {
  const [failed,setFailed]=useState(false);
  return <a className="place-card" href={`/attractions/${id}`}><div className="place-card-photo">{imageUrl&&!failed?<img src={imageUrl.replace(/^http:/,'https:')} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<div className="photo-placeholder"><TravelIcon name="leaf" size={36}/><span>{region}의 새로운 발견</span></div>}<span className="place-location"><TravelIcon name="pin" size={12}/>{region}</span></div><div className="place-card-body"><p className="place-category">{category||'충남 여행지'}</p><h3>{name}</h3>{summary&&<p className="place-summary">{summary.replace(/<[^>]*>/g,' ').slice(0,160)}</p>}<div className="place-card-link">장소 살펴보기<TravelIcon name="arrow" size={16}/></div></div></a>;
}
