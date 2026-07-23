// 파일 위치: src/services/supabase/sync.ts
// 수정 내용: 일반 supabase 클라이언트 대신, RLS 보안을 무시하는 supabaseAdmin 클라이언트 사용
import { supabaseAdmin } from './client';
import { fetchChungnamTouristSpots } from '../tour-api/area';

export async function syncTouristSpotsToDB() {
  console.log('🔄 Tour API 데이터 수집 시작...');
  
  // 안전장치: 관리자 키 세팅이 안 되어 있으면 중단
  if (!supabaseAdmin) {
    console.error('❌ 서버 관리자 키(SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
    return { success: false, message: '서버 관리자 키가 설정되지 않았습니다.' };
  }

  // 1. 공공데이터포털에서 데이터 가져오기
  const spots = await fetchChungnamTouristSpots('kor');
  
  if (!spots || spots.length === 0) {
    console.error('❌ 불러올 관광지 데이터가 없습니다.');
    return { success: false, message: '데이터 로드 실패' };
  }

  // 2. Supabase places 테이블 스키마에 맞게 매핑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placesToInsert = spots.map((spot: any) => ({
    tour_api_content_id: spot.contentid,
    content_type_id: parseInt(spot.contenttypeid, 10),
    name_ko: spot.title,
    address: spot.addr1 + (spot.addr2 ? ` ${spot.addr2}` : ''),
    latitude: spot.mapy ? parseFloat(spot.mapy) : null,
    longitude: spot.mapx ? parseFloat(spot.mapx) : null,
    region_code: spot.areacode,
    district_code: spot.sigungucode,
    // 원본 데이터 통째로 JSON 저장
    raw_data: spot,
  }));

  // 3. Supabase에 Upsert (이미 있는 데이터는 덮어쓰기)
  // 🌟 여기서 supabase 대신 supabaseAdmin을 사용합니다!
  const { data, error } = await supabaseAdmin
    .from('places')
    .upsert(placesToInsert, {
      onConflict: 'tour_api_content_id',
    })
    .select();

  if (error) {
    console.error('❌ DB 저장 에러:', error.message);
    return { success: false, error };
  }

  console.log(`✅ ${data?.length || 0}개의 관광지 데이터 DB 동기화 완료!`);
  return { success: true, count: data?.length || 0 };
}