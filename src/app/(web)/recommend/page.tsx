// 파일 위치: src/app/(web)/recommend/page.tsx
// 파일 명: page.tsx

import {preferredLanguageByLocale} from '@/features/i18n/config';
import {getServerLocale} from '@/features/i18n/server';
import {getTravelConditionOptions} from '@/lib/data';
import {TripPlanner} from '../components/TripPlanner';
export default async function RecommendPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [options,params,locale]=await Promise.all([getTravelConditionOptions(),searchParams,getServerLocale()]);
 const initial=Object.fromEntries(Object.entries(params).map(([k,v])=>[k,Array.isArray(v)?v[0]:v||'']));
 return <main className="page-shell planning-page"><div className="page-heading"><p className="eyebrow">MAKE IT YOURS</p><h1>여행도, 내 취향대로.</h1><p>간단한 선택으로 시작하는 나만의 충남 여행.</p></div><TripPlanner options={options} initial={initial} preferredLanguage={preferredLanguageByLocale[locale]}/></main>;
}
