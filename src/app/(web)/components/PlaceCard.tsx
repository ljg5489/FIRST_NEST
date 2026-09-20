'use client';
import {useState} from 'react';
import {TravelIcon} from './TravelIcon';
import {useI18n} from '@/features/i18n/I18nProvider';
export function PlaceCard({id,name,region,category,imageUrl,summary}:{id:string;name:string;region:string;category?:string;imageUrl?:string|null;summary?:string}) {
  const [failed,setFailed]=useState(false);
  const {t,value}=useI18n();
  return <a className="place-card" href={`/attractions/${id}`}><div className="place-card-photo">{imageUrl&&!failed?<img src={imageUrl.replace(/^http:/,'https:')} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<div className="photo-placeholder"><TravelIcon name="leaf" size={36}/><span>{value(region)} · {t('새로운 발견')}</span></div>}<span className="place-location"><TravelIcon name="pin" size={12}/>{value(region)}</span></div><div className="place-card-body"><p className="place-category">{category?value(category):t('충남 여행지')}</p><h3>{name}</h3>{summary&&<p className="place-summary">{summary.replace(/<[^>]*>/g,' ').slice(0,160)}</p>}<div className="place-card-link">{t('장소 살펴보기')}<TravelIcon name="arrow" size={16}/></div></div></a>;
}
