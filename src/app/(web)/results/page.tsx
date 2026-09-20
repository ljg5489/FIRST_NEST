import {normalizeConditions} from '@/lib/travel-planning';
import {buildTravelCourse} from '@/lib/course-builder';
import {adaptToEditableItineraryDays} from '@/lib/course-adapter';
import {CourseWorkspace} from '../components/CourseWorkspace';
import {allowAIRequest} from '@/lib/ai-rate-limit';
import {getServerLocale} from '@/features/i18n/server';
import {translate,translateValue} from '@/features/i18n/messages';

export const dynamic = 'force-dynamic';
export default async function ResultsPage({searchParams}: {searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const [params,locale] = await Promise.all([searchParams,getServerLocale()]);
  const t=(source:string)=>translate(locale,source); const v=(source:string)=>translateValue(locale,source);
  const single = (key:string) => Array.isArray(params[key]) ? params[key][0] : params[key];
  const draftId = single('draft'); const courseId = single('courseId');
  if (draftId || courseId) return <main className="page-shell"><h1 className="text-2xl font-bold">{t('내 여행 일정')}</h1><CourseWorkspace draftId={draftId} courseId={courseId} /></main>;
  if (!params.tripDays && !params.people && !params.budget) return <main className="page-shell"><h1 className="text-2xl font-bold">{t('여행 조건을 먼저 입력해 주세요.')}</h1><a href="/recommend" className="primary-button mt-6">{t('추천받기')}</a></main>;
  const days = Number((single('tripDays') || '1').replace(/일$/, ''));
  const interests = Array.isArray(params.interests) ? params.interests.join(', ') : params.interests;
  if (!await allowAIRequest('recommend')) return <main className="page-shell"><h1 className="text-xl font-bold">{t('지금은 추천 요청을 처리할 수 없습니다.')}</h1><p className="mt-3">{t('요청이 많거나 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.')}</p><a href="/account" className="primary-button mt-6">{t('저장한 코스 열기')}</a></main>;
  let conditions;
  try {conditions=normalizeConditions({days,focus:interests,people:single('people'),budget:single('budget'),budgetType:single('budgetType'),startRegion:single('startRegion'),travelPace:single('travelPace'),transport:single('transport'),language:single('language'),country:single('nationality')});}
  catch {return <main className="page-shell"><h1>{t('여행 조건을 확인해 주세요.')}</h1><a href="/recommend" className="primary-button mt-6">{t('조건 다시 입력하기')}</a></main>;}
  const built = await buildTravelCourse(conditions).catch(()=>null);
  const editableDays=built?adaptToEditableItineraryDays(built):[];
  if (!built) return <main className="page-shell"><h1 className="text-2xl font-bold">{t('선택한 지역과 조건에 맞는 장소가 없습니다.')}</h1><a className="primary-button mt-6" href="/recommend">{t('조건 다시 입력하기')}</a></main>;
  return <main className="page-shell"><h1 className="text-2xl font-bold">{t('추천 여행 일정')}</h1><p className="mt-3 text-sm">{days} · {t('관심사')} {interests ? interests.split(', ').map(v).join(', ') : t('전체')} · {t('장소를 편집하고 계정에 저장할 수 있습니다.')}</p><CourseWorkspace initialItinerary={{version:1,title:`${v('충남')} ${days}`,startDate:'',days:editableDays,planning:{conditions:built.conditions,warnings:built.warnings,routes:built.routes,signature:JSON.stringify(editableDays.map(d=>d.attractions.map(p=>[p.id,p.latitude,p.longitude])))},aiStory:built.aiStory || undefined}} /></main>;
}
