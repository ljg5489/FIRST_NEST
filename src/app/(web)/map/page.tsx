import {CourseWorkspace} from '../components/CourseWorkspace';
export const dynamic = 'force-dynamic';
export default async function MapPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params = await searchParams;
  const single = (key:string) => Array.isArray(params[key]) ? params[key][0] : params[key];
  return <main className="page-shell"><h1 className="text-2xl font-bold">내 일정 지도</h1><p className="mt-3 text-sm">선택한 일정의 장소를 표시합니다. 실제 이동 안내는 장소별 카카오맵 길찾기에서 확인하세요.</p><CourseWorkspace draftId={single('draft')} courseId={single('courseId')} mapOnly /></main>;
}
