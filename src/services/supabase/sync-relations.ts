// 파일 위치: src/services/supabase/sync-relations.ts
// 파일 명: sync-relations.ts

import { getSupabaseAdmin } from './admin';

// 수작업으로 채워넣을 데이터를 찾기 위한 공통 식별자
const MISSING_VALUE_FLAG = 'NEED_UPDATE';

// 두 좌표 간의 직선거리를 km 단위로 계산하는 하버사인(Haversine) 공식 헬퍼 함수
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function syncRelationsFromRawData() {
  console.log('[DB 로직] 원본 데이터(raw_data) 기반 관계형 테이블 정규화/분배 시작...');
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    console.error('[오류] 서버 관리자 키(SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
    return { success: false, message: '서버 관리자 키가 설정되지 않았습니다.' };
  }

  /* =================================================================
     1. Places -> place_images, place_tags 분배 로직 (완료되어 주석 처리)
     =================================================================
  console.log('[DB 호출] Places 테이블 데이터 불러오는 중...');
  const { data: places, error: placesError } = await supabaseAdmin
    .from('places')
    .select('id, name_ko, raw_data');

  if (placesError) {
    console.error('[오류] Places 조회 에러:', placesError.message);
  } else if (places && places.length > 0) {
    const placeImagesToInsert: any[] = [];
    const placeTagsToInsert: any[] = [];
    const placeFacilitiesToInsert: any[] = [];

    places.forEach((place) => {
      const raw = place.raw_data as any;

      placeImagesToInsert.push({
        place_id: place.id,
        image_url: raw.firstimage || MISSING_VALUE_FLAG,
        thumbnail_url: raw.firstimage2 || null,
        alt_text: place.name_ko || null,
        source_url: 'TourAPI',
        sort_order: 1,
        is_primary: true,
      });

      placeTagsToInsert.push({
        place_id: place.id,
        tag: raw.cat3 || MISSING_VALUE_FLAG,
        source: 'TourAPI',
      });

      placeFacilitiesToInsert.push({
        place_id: place.id,
        facility_type: MISSING_VALUE_FLAG,
        is_available: false,
        details: 'API 상세조회 또는 수작업 필요',
      });
    });

    if (placeImagesToInsert.length > 0) {
      console.log(`[DB 적재] place_images 테이블에 ${placeImagesToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('place_images').insert(placeImagesToInsert);
    }
    if (placeTagsToInsert.length > 0) {
      console.log(`[DB 적재] place_tags 테이블에 ${placeTagsToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('place_tags').insert(placeTagsToInsert);
    }
    if (placeFacilitiesToInsert.length > 0) {
      console.log(`[DB 적재] place_facilities 테이블에 ${placeFacilitiesToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('place_facilities').insert(placeFacilitiesToInsert);
    }
  }
  ================================================================= */

  /* =================================================================
     2. Events -> event_images 분배 로직 (완료되어 주석 처리)
     ================================================================= 
  console.log('[DB 호출] Events 테이블 데이터 불러오는 중...');
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events') // 축제 테이블명
    .select('id, tour_api_content_id, title, raw_data');

  if (eventsError) {
    console.error('[오류] Events 조회 에러:', eventsError.message);
  } else if (events && events.length > 0) {
    const eventImagesToInsert: any[] = [];

    events.forEach((event) => {
      const raw = event.raw_data as any;

      eventImagesToInsert.push({
        event_id: event.id,
        tour_api_content_id: event.tour_api_content_id,
        image_url: raw.firstimage || MISSING_VALUE_FLAG,
        thumbnail_url: raw.firstimage2 || null,
        image_name: event.title || null,
        serial_number: 1,
        is_primary: true,
        copyright_type: 'TourAPI',
        source: 'TourAPI',
        raw_data: raw,
      });
    });

    if (eventImagesToInsert.length > 0) {
      console.log(`[DB 적재] event_images 테이블에 ${eventImagesToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('event_images').insert(eventImagesToInsert);
    }
  }
  ================================================================= */

  // =================================================================
  // Events 좌표와 Places 좌표를 비교하여 event 테이블(상세) N:M 매핑
  // =================================================================
  console.log('[DB 호출] 좌표 매핑을 위해 Places와 Events 데이터 불러오는 중...');

  // 1. 매핑에 필요한 Places 데이터 (id, 위도, 경도) 최소한으로 조회
  const { data: placesForMapping, error: placesMappingError } = await supabaseAdmin
    .from('places')
    .select('id, latitude, longitude');

  // 2. Events 데이터 (원본 raw_data 및 위도, 경도) 조회
  const { data: eventsForMapping, error: eventsMappingError } = await supabaseAdmin
    .from('events')
    .select('id, latitude, longitude, raw_data');

  if (placesMappingError || eventsMappingError) {
    console.error('[오류] 데이터 조회 에러:', placesMappingError?.message || eventsMappingError?.message);
    return { success: false };
  }

  if (placesForMapping && eventsForMapping) {
    const eventsDetailToInsert: any[] = [];

    eventsForMapping.forEach((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = event.raw_data as any;
      let isMappedToAnyPlace = false; // 3km 이내 관광지가 하나라도 있었는지 체크

      // 공통으로 들어갈 상세 정보 구성
      const startDate = raw.eventstartdate ? 
        `${raw.eventstartdate.slice(0, 4)}-${raw.eventstartdate.slice(4, 6)}-${raw.eventstartdate.slice(6, 8)}` : null;
      const endDate = raw.eventenddate ? 
        `${raw.eventenddate.slice(0, 4)}-${raw.eventenddate.slice(4, 6)}-${raw.eventenddate.slice(6, 8)}` : null;

      // 3. 축제의 위경도 데이터가 존재할 경우, 모든 관광지를 순회하며 3km 이내인지 검사
      if (event.latitude && event.longitude) {
        placesForMapping.forEach((place) => {
          if (place.latitude && place.longitude) {
            const distance = getDistanceFromLatLonInKm(
              event.latitude,
              event.longitude,
              place.latitude,
              place.longitude
            );

            // 수정된 핵심 로직: 3km 이내에 들어오는 '모든' 관광지에 대해 각각 행(Row) 생성
            if (distance <= 3) {
              isMappedToAnyPlace = true;
              eventsDetailToInsert.push({
                event_id: event.id,
                place_id: place.id, // 조건에 맞는 관광지 ID 매핑
                start_date: startDate,
                end_date: endDate,
                venue: raw.addr1 || MISSING_VALUE_FLAG,
                fee_info: MISSING_VALUE_FLAG,
                booking_url: MISSING_VALUE_FLAG,
              });
            }
          }
        });
      }

      // 4. 만약 3km 이내에 관광지가 단 하나도 없었다면, place_id를 null로 하여 1개의 행만 생성 (독립 축제용)
      if (!isMappedToAnyPlace) {
        eventsDetailToInsert.push({
          event_id: event.id,
          place_id: null,
          start_date: startDate,
          end_date: endDate,
          venue: raw.addr1 || MISSING_VALUE_FLAG,
          fee_info: MISSING_VALUE_FLAG,
          booking_url: MISSING_VALUE_FLAG,
        });
      }
    });

    // 5. DB 일괄 삽입
    if (eventsDetailToInsert.length > 0) {
      console.log(`[DB 적재] event 상세 테이블에 ${eventsDetailToInsert.length}개 적재 중... (N:M 다중 매핑 완료)`);
      const { error: insertError } = await supabaseAdmin.from('event').insert(eventsDetailToInsert);
      
      if (insertError) {
        console.error('[오류] event 테이블 삽입 에러:', insertError.message);
      }
    }
  }

  console.log('[안내] event 테이블 상세 정보 및 N:M 좌표 매핑 적재가 완료되었습니다.');
  return { success: true };
}