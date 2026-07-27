// 파일 위치: src/services/supabase/sync.ts
// 파일 명: sync.ts

import { fetchChungnamTouristSpots } from '../tour-api/area';
import { getSupabaseAdmin } from './admin';

// Tour API의 14자리 문자열 (YYYYMMDDHHMMSS) 시간 데이터를 ISO 포맷으로 변환하는 함수
function parseTourApiTimestamp(value?: string) {
  if (!value || !/^\d{14}$/.test(value)) {
    return null;
  }
  const formatted = [
    value.slice(0, 4), '-',
    value.slice(4, 6), '-',
    value.slice(6, 8), 'T',
    value.slice(8, 10), ':',
    value.slice(10, 12), ':',
    value.slice(12, 14),
    '+09:00',
  ].join('');
  return new Date(formatted).toISOString();
}

export async function syncTouristSpotsToDB() {
  console.log('🔄 Tour API 다국어(한/영) 전체 데이터 수집 시작...');
  
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    console.error('❌ 서버 관리자 키(SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
    return { success: false, message: '서버 관리자 키가 설정되지 않았습니다.' };
  }

  // 1. 한국어 데이터 수집 (무한 스크롤)
  let pageNoKo = 1;
  let allKorSpots: any[] = [];
  while (true) {
    console.log(`📡 [한국어 ${pageNoKo}페이지] 데이터 호출 중...`);
    const spots = await fetchChungnamTouristSpots('kor', pageNoKo);
    if (!spots || spots.length === 0) break;
    allKorSpots = allKorSpots.concat(spots);
    pageNoKo++;
  }
  console.log(`✅ 한국어 관광지 총 ${allKorSpots.length}개 수집 완료!`);

  // 2. 영어 데이터 수집 (무한 스크롤)
  let pageNoEn = 1;
  let allEngSpots: any[] = [];
  while (true) {
    console.log(`📡 [영어 ${pageNoEn}페이지] 데이터 호출 중...`);
    const spots = await fetchChungnamTouristSpots('eng', pageNoEn);
    if (!spots || spots.length === 0) break;
    allEngSpots = allEngSpots.concat(spots);
    pageNoEn++;
  }
  console.log(`✅ 영어 관광지 총 ${allEngSpots.length}개 수집 완료!`);

  // 3. 영어 데이터를 빠른 검색을 위해 Map 객체로 변환 
  // 🌟 핵심 수정: contentid가 다르므로, 좌표(mapx_mapy)를 고유 키로 사용합니다.
  const engSpotsMap = new Map();
  allEngSpots.forEach(spot => {
    if (spot.mapx && spot.mapy) {
      const coordKey = `${spot.mapx}_${spot.mapy}`;
      engSpotsMap.set(coordKey, spot);
    }
  });

  console.log('🔄 다국어 데이터 병합(좌표 기준) 및 DB 적재 준비 중...');
  const syncedAt = new Date().toISOString();

  // 4. 한국어 데이터를 기준으로 영어 데이터를 찾아 병합(Merge)
  const placesToInsert = allKorSpots
    .filter((spot) => spot.contentid && spot.contenttypeid && spot.title)
    .map((korSpot) => {
      // 🌟 한국어 데이터의 좌표와 정확히 일치하는 영어 데이터 찾기
      const coordKey = `${korSpot.mapx}_${korSpot.mapy}`;
      const engSpot = (korSpot.mapx && korSpot.mapy) ? engSpotsMap.get(coordKey) : undefined;

      return {
        tour_api_content_id: korSpot.contentid,
        content_type_id: Number.parseInt(korSpot.contenttypeid, 10),
        name_ko: korSpot.title,
        name_en: engSpot?.title || null, // 짝이 맞으면 영어 이름 병합
        address: [korSpot.addr1, korSpot.addr2].filter(Boolean).join(' ') || null,
        // 빈 문자열이 아닌 완벽한 null로 들어가도록 수정
        address_en: engSpot ? [engSpot.addr1, engSpot.addr2].filter(Boolean).join(' ') || null : null,
        latitude: korSpot.mapy ? Number.parseFloat(korSpot.mapy) : null,
        longitude: korSpot.mapx ? Number.parseFloat(korSpot.mapx) : null,
        region_code: korSpot.areacode || null,
        district_code: korSpot.sigungucode || null,
        category_code: korSpot.cat3 || null,
        phone: korSpot.tel || null,
        source_updated_at: parseTourApiTimestamp(korSpot.modifiedtime),
        synced_at: syncedAt,
        raw_data: korSpot, 
      };
    });

  // 5. Supabase에 Upsert (기존 데이터 덮어쓰기)
  const { data, error } = await supabaseAdmin
    .from('places')
    .upsert(placesToInsert, {
      onConflict: 'tour_api_content_id',
    })
    .select('id');

  if (error) {
    console.error('❌ DB 저장 에러:', error.message);
    return { success: false, message: error.message };
  }

  const skippedCount = allKorSpots.length - placesToInsert.length;
  console.log(`🎉 한/영 다국어 관광지 ${data?.length || 0}개 데이터 DB 동기화 완료! (스킵된 불량 데이터: ${skippedCount}개)`);
  
  return {
    success: true,
    count: data?.length ?? 0,
    skipped: skippedCount,
  };
}