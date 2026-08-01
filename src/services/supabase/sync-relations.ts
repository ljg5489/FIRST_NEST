// 파일 위치: src/services/supabase/sync-relations.ts
// 파일 명: sync-relations.ts

import { getSupabaseAdmin } from './admin';

// 수작업으로 채워넣을 데이터를 찾기 위한 공통 식별자
const MISSING_VALUE_FLAG = 'NEED_UPDATE';

export async function syncRelationsFromRawData() {
  console.log('🔄 원본 데이터(raw_data) 기반 관계형 테이블 정규화/분배 시작...');
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    console.error('❌ 서버 관리자 키(SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
    return { success: false, message: '서버 관리자 키가 설정되지 않았습니다.' };
  }

  // =================================================================
  // 1. Places -> place_images, place_tags 분배 로직
  // =================================================================
  console.log('📡 Places 테이블 데이터 불러오는 중...');
  const { data: places, error: placesError } = await supabaseAdmin
    .from('places')
    .select('id, name_ko, raw_data');

  if (placesError) {
    console.error('❌ Places 조회 에러:', placesError.message);
  } else if (places && places.length > 0) {
    const placeImagesToInsert: any[] = [];
    const placeTagsToInsert: any[] = [];
    const placeFacilitiesToInsert: any[] = [];

    places.forEach((place) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = place.raw_data as any;

      // 이미지 분배 (place_images 스키마 적용)
      placeImagesToInsert.push({
        place_id: place.id,
        image_url: raw.firstimage || MISSING_VALUE_FLAG,
        thumbnail_url: raw.firstimage2 || null,
        alt_text: place.name_ko || null,
        source_url: 'TourAPI',
        sort_order: 1,
        is_primary: true,
      });

      // 태그 분배 (place_tags 스키마 적용)
      placeTagsToInsert.push({
        place_id: place.id,
        tag: raw.cat3 || MISSING_VALUE_FLAG,
        source: 'TourAPI',
      });

      // 편의시설 분배 (place_facilities 스키마 적용 - 초기 결측치 세팅용)
      // TourAPI 목록 조회(areaBasedList)에는 상세 편의시설 정보가 없으므로 수작업 마킹용으로 생성
      // 즉 여기는 모두 수작업으로 해야함 허허 난 자신없음 948개를? AI 시대에?
      placeFacilitiesToInsert.push({
        place_id: place.id,
        facility_type: MISSING_VALUE_FLAG,
        is_available: false,
        details: 'API 상세조회 또는 수작업 필요',
      });
    });

    // DB 일괄 삽입 (Insert)
    // 데이터가 있는 상태에서 중복 실행을 막으려면 사전에 기존 데이터를 비우거나 고유키 설정이 필요함
    if (placeImagesToInsert.length > 0) {
      console.log(`💾 place_images 테이블에 ${placeImagesToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('place_images').insert(placeImagesToInsert);
    }
    if (placeTagsToInsert.length > 0) {
      console.log(`💾 place_tags 테이블에 ${placeTagsToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('place_tags').insert(placeTagsToInsert);
    }
    if (placeFacilitiesToInsert.length > 0) {
      console.log(`💾 place_facilities 테이블에 ${placeFacilitiesToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('place_facilities').insert(placeFacilitiesToInsert);
    }
  }

  // =================================================================
  // 2. Events -> event_images 분배 로직
  // =================================================================
  console.log('📡 Events 테이블 데이터 불러오는 중...');
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events') // 축제 테이블명
    .select('id, tour_api_content_id, title, raw_data');

  if (eventsError) {
    console.error('❌ Events 조회 에러:', eventsError.message);
  } else if (events && events.length > 0) {
    const eventImagesToInsert: any[] = [];
    const eventsDetailToInsert: any[] = [];

    events.forEach((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = event.raw_data as any;

      // 축제 이미지 분배 (event_images 스키마 적용)
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
        raw_data: raw, // 원본 백업
      });

      // 이벤트 상세 브릿지 테이블 분배 (events 스키마 적용)
      eventsDetailToInsert.push({
        place_id: null, // 추후 위치 기반 매핑 필요 (places 테이블과의 관계 설정을 해야하는데 현재는 빠져 있음 그래서 추후에 해야 함 events 테이블 특성상 쩔수)
        start_date: raw.eventstartdate ? 
          `${raw.eventstartdate.slice(0, 4)}-${raw.eventstartdate.slice(4, 6)}-${raw.eventstartdate.slice(6, 8)}` : null,
        end_date: raw.eventenddate ? 
          `${raw.eventenddate.slice(0, 4)}-${raw.eventenddate.slice(4, 6)}-${raw.eventenddate.slice(6, 8)}` : null,
        venue: raw.addr1 || MISSING_VALUE_FLAG,
        fee_info: MISSING_VALUE_FLAG,
        booking_url: MISSING_VALUE_FLAG,
      });
    });

    if (eventImagesToInsert.length > 0) {
      console.log(`💾 event_images 테이블에 ${eventImagesToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('event_images').insert(eventImagesToInsert);
    }
    
    if (eventsDetailToInsert.length > 0) {
      console.log(`💾 event 상세 테이블에 ${eventsDetailToInsert.length}개 적재 중...`);
      await supabaseAdmin.from('event').insert(eventsDetailToInsert);
    }
  }

  console.log('🎉 모든 관계형 테이블 분배 및 결측치 마킹이 완료되었습니다!');
  return { success: true };
}