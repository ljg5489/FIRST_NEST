// 파일 위치: src/services/supabase/sync.ts
// 파일 명: sync.ts

import { getSupabaseAdmin } from './admin';
import { fetchChungnamTouristSpots } from '../tour-api/area';

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

export async function syncMissingPlacesToDB() {
  console.log('[DB 로직] 타입 12 제외 전체 장소 데이터 추가 적재 시작...');
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    console.error('서버 관리자 키가 설정되지 않았습니다.');
    return { success: false, message: '서버 관리자 키 누락' };
  }

  let pageNoKo = 1;
  let allKorSpots: any[] = [];
  while (true) {
    const spots = await fetchChungnamTouristSpots('kor', pageNoKo);
    if (!spots || spots.length === 0) break;
    allKorSpots = allKorSpots.concat(spots);
    pageNoKo++;
  }

  // 핵심 로직: contenttypeid가 '12'(관광지)인 데이터 제외
  const missingSpots = allKorSpots.filter(spot => spot.contenttypeid !== '12');

  let pageNoEn = 1;
  let allEngSpots: any[] = [];
  while (true) {
    const spots = await fetchChungnamTouristSpots('eng', pageNoEn);
    if (!spots || spots.length === 0) break;
    allEngSpots = allEngSpots.concat(spots);
    pageNoEn++;
  }

  const engSpotsMap = new Map();
  allEngSpots.forEach(spot => {
    if (spot.mapx && spot.mapy) {
      const coordKey = `${spot.mapx}_${spot.mapy}`;
      engSpotsMap.set(coordKey, spot);
    }
  });

  const syncedAt = new Date().toISOString();

  const placesToInsert = missingSpots
    .filter((spot) => spot.contentid && spot.contenttypeid && spot.title)
    .map((korSpot) => {
      const coordKey = `${korSpot.mapx}_${korSpot.mapy}`;
      const engSpot = (korSpot.mapx && korSpot.mapy) ? engSpotsMap.get(coordKey) : undefined;

      return {
        tour_api_content_id: korSpot.contentid,
        content_type_id: Number.parseInt(korSpot.contenttypeid, 10),
        name_ko: korSpot.title,
        name_en: engSpot?.title || null,
        address: [korSpot.addr1, korSpot.addr2].filter(Boolean).join(' ') || null,
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

  if (placesToInsert.length === 0) {
    return { success: true, count: 0, message: '추가할 데이터가 없습니다.' };
  }

  // ignoreDuplicates: true 를 통해 기존에 적재된 데이터와의 충돌 방지 및 수작업 데이터 보존
  const { error } = await supabaseAdmin
    .from('places')
    .upsert(placesToInsert, {
      onConflict: 'tour_api_content_id',
      ignoreDuplicates: true 
    });

  if (error) {
    console.error('DB 저장 에러:', error.message);
    return { success: false, message: error.message };
  }

  console.log(`타입 12 제외 데이터 ${placesToInsert.length}개 추가 적재 완료.`);
  return { success: true, count: placesToInsert.length };
}


// 지난 코드 혹시 몰라 남겨둠 
// // 파일 위치: src/services/supabase/sync.ts
// // 파일 명: sync.ts








// import { getSupabaseAdmin } from './admin';
// import { fetchFestival } from '../tour-api/event';
// // 사용하지 않는 기존 모듈 임포트 주석 처리
// // import { fetchChungnamTouristSpots } from '../tour-api/area'; 

// // Tour API의 14자리 문자열 (YYYYMMDDHHMMSS) 시간 데이터를 ISO 포맷으로 변환하는 함수
// function parseTourApiTimestamp(value?: string) {
//   if (!value || !/^\d{14}$/.test(value)) {
//     return null;
//   }
//   const formatted = [
//     value.slice(0, 4), '-',
//     value.slice(4, 6), '-',
//     value.slice(6, 8), 'T',
//     value.slice(8, 10), ':',
//     value.slice(10, 12), ':',
//     value.slice(12, 14),
//     '+09:00',
//   ].join('');
//   return new Date(formatted).toISOString();
// }

// // 🌟 새로 추가: YYYYMMDD 문자열을 YYYY-MM-DD 형태의 date 포맷으로 변환하는 함수
// function parseTourApiDate(value?: string) {
//   if (!value || !/^\d{8}$/.test(value)) {
//     return null;
//   }
//   return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
// }

// // 오늘 날짜를 YYYYMMDD 형태의 숫자로 반환하는 헬퍼 함수 (축제 검색용)
// function getTodayYYYYMMDD(): number {
//   const today = new Date();
//   const yyyy = today.getFullYear();
//   const mm = String(today.getMonth() + 1).padStart(2, '0');
//   const dd = String(today.getDate()).padStart(2, '0');
//   return Number(`${yyyy}${mm}${dd}`);
// }

// export async function syncTouristSpotsToDB() {
//   console.log('🔄 Tour API 축제 데이터 수집 시작...');
  
//   const supabaseAdmin = getSupabaseAdmin();
  
//   if (!supabaseAdmin) {
//     console.error('❌ 서버 관리자 키(SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
//     return { success: false, message: '서버 관리자 키가 설정되지 않았습니다.' };
//   }

//   /* ==========================================================
//      기존 관광지 다국어(한/영) 수집 및 병합 코드 (사용 안 함 - 주석 처리)
//      ==========================================================
//   // 1. 한국어 데이터 수집 (무한 스크롤)
//   let pageNoKo = 1;
//   let allKorSpots: any[] = [];
//   while (true) {
//     console.log(`📡 [한국어 ${pageNoKo}페이지] 데이터 호출 중...`);
//     const spots = await fetchChungnamTouristSpots('kor', pageNoKo);
//     if (!spots || spots.length === 0) break;
//     allKorSpots = allKorSpots.concat(spots);
//     pageNoKo++;
//   }
//   console.log(`✅ 한국어 관광지 총 ${allKorSpots.length}개 수집 완료!`);

//   // 2. 영어 데이터 수집 (무한 스크롤)
//   let pageNoEn = 1;
//   let allEngSpots: any[] = [];
//   while (true) {
//     console.log(`📡 [영어 ${pageNoEn}페이지] 데이터 호출 중...`);
//     const spots = await fetchChungnamTouristSpots('eng', pageNoEn);
//     if (!spots || spots.length === 0) break;
//     allEngSpots = allEngSpots.concat(spots);
//     pageNoEn++;
//   }
//   console.log(`✅ 영어 관광지 총 ${allEngSpots.length}개 수집 완료!`);

//   // 3. 영어 데이터를 빠른 검색을 위해 Map 객체로 변환 
//   const engSpotsMap = new Map();
//   allEngSpots.forEach(spot => {
//     if (spot.mapx && spot.mapy) {
//       const coordKey = `${spot.mapx}_${spot.mapy}`;
//       engSpotsMap.set(coordKey, spot);
//     }
//   });

//   console.log('🔄 다국어 데이터 병합(좌표 기준) 및 DB 적재 준비 중...');
//   const syncedAt = new Date().toISOString();

//   // 4. 한국어 데이터를 기준으로 영어 데이터를 찾아 병합(Merge)
//   const placesToInsert = allKorSpots
//     .filter((spot) => spot.contentid && spot.contenttypeid && spot.title)
//     .map((korSpot) => {
//       const coordKey = `${korSpot.mapx}_${korSpot.mapy}`;
//       const engSpot = (korSpot.mapx && korSpot.mapy) ? engSpotsMap.get(coordKey) : undefined;

//       return {
//         tour_api_content_id: korSpot.contentid,
//         content_type_id: Number.parseInt(korSpot.contenttypeid, 10),
//         name_ko: korSpot.title,
//         name_en: engSpot?.title || null,
//         address: [korSpot.addr1, korSpot.addr2].filter(Boolean).join(' ') || null,
//         address_en: engSpot ? [engSpot.addr1, engSpot.addr2].filter(Boolean).join(' ') || null : null,
//         latitude: korSpot.mapy ? Number.parseFloat(korSpot.mapy) : null,
//         longitude: korSpot.mapx ? Number.parseFloat(korSpot.mapx) : null,
//         region_code: korSpot.areacode || null,
//         district_code: korSpot.sigungucode || null,
//         category_code: korSpot.cat3 || null,
//         phone: korSpot.tel || null,
//         source_updated_at: parseTourApiTimestamp(korSpot.modifiedtime),
//         synced_at: syncedAt,
//         raw_data: korSpot, 
//       };
//     });
//   ========================================================== */

//   // 1. 축제 데이터 수집 (한국어 버전만 수집, 제공해주신 축제 스키마 기준)
//   const todayDateInt = getTodayYYYYMMDD();
//   let pageNoFest = 1;
//   let allFests: any[] = [];
  
//   while (true) {
//     console.log(`📡 [축제 데이터 ${pageNoFest}페이지] 호출 중...`);
//     const fests = await fetchFestival(todayDateInt, 'kor', pageNoFest);
//     if (!fests || fests.length === 0) break;
//     allFests = allFests.concat(fests);
//     pageNoFest++;
//   }
//   console.log(`✅ 축제/행사 총 ${allFests.length}개 수집 완료!`);

//   const syncedAt = new Date().toISOString();

//   // 2. 제공된 축제 DB 스키마에 맞게 매핑
//   const festivalsToInsert = allFests
//     .filter((fest) => fest.contentid && fest.contenttypeid && fest.title)
//     .map((fest) => ({
//       tour_api_content_id: fest.contentid,
//       content_type_id: Number.parseInt(fest.contenttypeid, 10),
//       title: fest.title, // name_ko 가 아닌 title 로 변경됨
//       event_start_date: parseTourApiDate(fest.eventstartdate),
//       event_end_date: parseTourApiDate(fest.eventenddate),
//       address: fest.addr1 || null,
//       address_detail: fest.addr2 || null, // 배열 결합 없이 분리 저장
//       region_code: fest.areacode || null,
//       district_code: fest.sigungucode || null,
//       category_code: fest.cat3 || null,
//       latitude: fest.mapy ? Number.parseFloat(fest.mapy) : null,
//       longitude: fest.mapx ? Number.parseFloat(fest.mapx) : null,
//       phone: fest.tel || null,
//       homepage: null, // 목록 API에는 제공되지 않음 (디테일 API 필요)
//       overview: null, // 목록 API에는 제공되지 않음
//       first_image_url: fest.firstimage || null,
//       first_image_thumbnail_url: fest.firstimage2 || null,
//       source: 'TourAPI', // 출처 명시
//       source_created_at: parseTourApiTimestamp(fest.createdtime),
//       source_updated_at: parseTourApiTimestamp(fest.modifiedtime),
//       synced_at: syncedAt,
//       raw_data: fest,
//     }));

//   // 3. Supabase에 Upsert (새로운 축제 테이블에 적재)
//   // 🚨 주의: 테이블 이름이 다를 경우 'festivals' 부분을 실제 테이블명으로 변경하세요.
//   const { data, error } = await supabaseAdmin
//     .from('events') 
//     .upsert(festivalsToInsert, {
//       onConflict: 'tour_api_content_id',
//     })
//     .select('id');

//   if (error) {
//     console.error('❌ DB 저장 에러:', error.message);
//     return { success: false, message: error.message };
//   }

//   const skippedCount = allFests.length - festivalsToInsert.length;
//   console.log(`🎉 축제/행사 ${data?.length || 0}개 데이터 DB 동기화 완료! (스킵된 불량 데이터: ${skippedCount}개)`);
  
//   return {
//     success: true,
//     count: data?.length ?? 0,
//     skipped: skippedCount,
//   };
// }