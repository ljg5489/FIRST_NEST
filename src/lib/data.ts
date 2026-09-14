// 파일 위치: src/lib/data.ts
// 파일 명: data.ts

import { attractions, travelConditionOptions, recommendedCourse } from "./mock-data";
import type { Attraction } from "./types";
import { supabase } from "@/services/supabase/client";

// 배열에서 유효한 관광지 객체만 필터링하기 위한 타입 가드 헬퍼 함수
function isAttraction(attraction: any): attraction is Attraction {
  return Boolean(attraction);
}

// 검색 조건 및 태그 옵션 반환
// 현재 기획 단계이므로 기존 정적(Mock) 데이터를 그대로 반환
export async function getTravelConditionOptions() {
  return travelConditionOptions;
}

// 전체 관광지 목록 조회 (전체 및 필터 검색 동시 지원)
// 파라미터가 없거나 빈 배열이 들어오면 전체 관광지 목록을 반환하고 특정 태그 배열이 들어오면 해당 태그를 가진 관광지만 반환
// DB 조회가 실패하거나 데이터가 비어있을 경우, 화면 에러를 방지하기 위해 Mock 데이터(attractions)를 반환
export async function getAttractions(selectedTags?: string[]) {
  const hasTags = selectedTags && selectedTags.length > 0;
  console.log('[DB 호출] 관광지 목록을 불러옵니다...', hasTags ? `필터: ${selectedTags}` : '전체');
  
  // 동적 조인 처리: 필터가 있을 때만 교집합(!inner)을 적용하고, 아닐 때는 일반 조인을 사용하여 태그가 없는 관광지도 누락되지 않도록 처리
  const tagSelect = hasTags ? 'place_tags!inner ( tag )' : 'place_tags ( tag )';

  // 기본 쿼리 작성
  let query = supabase
    .from('places')
    .select(`
      *,
      place_images ( image_url, alt_text ),
      ${tagSelect}
    `)
    .eq('place_images.is_primary', true)
    .order('id', { ascending: true });

  // 파라미터가 들어오면 동적으로 쿼리 추가
  if (hasTags) {
    // place_tags 테이블의 tag 컬럼 값이 파라미터로 넘어온 배열 안의 값과 일치하는 것만 필터링
    query = query.in('place_tags.tag', selectedTags);
  }

  // 최종 데이터 100개 제한 호출 (추후 프론트엔드에서 페이지네이션 처리 가능(페이지를 넘기면서 추가 호출 것))
  const { data, error } = await query.limit(100);

  // 4-1. DB 쿼리 실행 중 에러가 발생한 경우 로컬 화면 확인을 위해 Mock 데이터로 대체
  if (error) {
    console.error('[오류] 관광지 필터 호출 에러:', error.message);
    return attractions;
  }

  // 4-2. 결과가 비어있으면 비어있다고(빈 배열) 프론트엔드에 전달
  if (!data || data.length === 0) {
    console.log('[안내] 해당 조건에 맞는 관광지 결과가 없습니다.');
    // 프론트엔드가 "검색 결과가 없습니다"라는 화면을 띄울 수 있도록 빈 배열 전달
    return [];
  }

  return data;
}

// 특정 관광지 상세 정보 및 주변 축제 동시 조회
// 관광지 상세 페이지 렌더링 시 사용
// 반환되는 객체 내부에 'activeEvents' 배열이 포함되어 있으며, 여기에 반경 3km 이내의 진행 중인 축제 정보가 담김
// DB에 해당 ID의 관광지가 없으면 null을 반환하여 프론트엔드에서 404(Not Found) 처리를 할 수 있도록 함
export async function getAttractionById(id: string) {
  console.log(`[DB 호출] 관광지 상세 정보 및 주변 축제 호출 중... (ID: ${id})`);
  
  const today = new Date().toISOString().split('T')[0];

  // 관광지 상세 정보 조회
  const { data: placeData, error: placeError } = await supabase
    .from('places')
    .select(`
      *,
      place_images ( image_url, alt_text, is_primary ),
      place_tags ( tag, source ),
      place_facilities ( facility_type, is_available, details )
    `)
    .eq('id', id)
    .single();

  // DB 서버 에러 처리 (데이터 0건일 때 발생하는 PGRST116 코드는 제외)
  if (placeError && placeError.code !== 'PGRST116') {
    console.error(`[오류] 관광지 상세 조회 DB 에러:`, placeError.message);
    throw new Error(`DB_FETCH_ERROR: ${placeError.message}`);
  }

  // 데이터가 없으면 null을 반환
  if (!placeData) {
    console.warn(`[경고] DB에 ID [${id}] 관광지가 없습니다. (null 반환)`);
    return null;
  }

  // 해당 관광지에 매핑된 진행/예정 축제 조회
  const { data: activeEvents, error: eventsError } = await supabase
    .from('place_events')
    .select(`
      start_date,
      end_date,
      fee_info,
      booking_url,
      events!inner ( 
        id, 
        title, 
        first_image_url,
        event_images ( image_url ) 
      ) 
    `)
    .eq('place_id', id)
    .gte('end_date', today); 

  if (eventsError) {
    console.error('[오류] 연결된 주변 축제 호출 에러:', eventsError.message);
    return {
      ...placeData,
      activeEvents: [],
    };
  }

  return {
    ...placeData,
    activeEvents: activeEvents && activeEvents.length > 0 ? activeEvents : [],
  };
}

// 추천 코스 정보 조회
// courses 테이블에서 추천 코스 기본 정보를 조회
// 아직 코스 DB에 데이터가 없으므로 자동으로 Mock 데이터(recommendedCourse)를 반환
export async function getRecommendedCourse() {
  console.log('[DB 호출] 추천 코스 기본 정보를 불러옵니다...');
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .limit(1)
    .single();

  // DB 쿼리 실행 중 에러가 발생한 경우 로컬 화면 확인을 위해 Mock 코스로 대체
  if (error && error.code !== 'PGRST116') {
    console.error('[오류] 추천 코스 DB 조회 에러:', error.message);
    return recommendedCourse;
  }

  if (!data) {
    console.warn('[경고] DB에 코스 데이터가 없습니다. Mock 데이터로 대체합니다.');
    return recommendedCourse;
  }

  return data;
}

// 프론트엔드 렌더링 규격에 맞춘 추천 코스 상세 조회
// getRecommendedCourse()의 결과물과 전체 관광지 데이터를 결합하여
// 기존 프론트엔드 컴포넌트가 요구하는 days 단위의 배열 형태로 데이터를 가공하여 반환
// 다른 형식이 필요하면 말해줘
export async function getRecommendedCourseWithAttractions() {
  const course = await getRecommendedCourse();
  const allAttractions = await getAttractions();
  const attractionPool = "course_stops" in course ? allAttractions : attractions;

  if (!course.days && !course.course_stops) {
    console.warn('[경고] DB 코스 데이터에 상세 일정(course_stops)이 부족합니다. Mock 데이터 구조를 사용합니다.');
    return {
      ...recommendedCourse,
      days: recommendedCourse.days.map((day) => ({
        ...day,
        attractions: day.attractionIds
          .map((id) => attractionPool.find((attraction: any) => attraction.id === id))
          .filter(isAttraction),
      })),
    };
  }

  return {
    ...course,
    days: (course.days || recommendedCourse.days).map((day: any) => ({
      ...day,
      attractions: (day.attractionIds || []).map((id: string) => 
        attractionPool.find((attraction: any) => attraction.id === id)
      ).filter(isAttraction),
    })),
  };
}

// 전체 축제 목록 단독 조회
// 특정 관광지에 종속되지 않고 진행 중이거나 예정된 모든 축제 목록만 필요할 때 사용(예: 축제 페이지, 축제 검색 등)
export async function getFestivals() {
  console.log('[DB 호출] 단독 축제 목록을 불러옵니다...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      event_start_date,
      event_end_date,
      address,
      first_image_url,
      event_images ( image_url )
    `)
    .gte('event_end_date', today)
    .order('event_start_date', { ascending: true });

  // DB 통신 실패 시 에러 던짐
  if (error) {
    console.error('[오류] 진행 중인 축제 데이터 조회 에러:', error.message);
    throw new Error(`DB_FETCH_ERROR: ${error.message}`);
  }

  // 정상 조회되었으나 데이터가 0건일 때
  if (!data || data.length === 0) {
    console.warn('[경고] DB에 진행 중인 축제 데이터가 없습니다. (빈 배열 반환)');
    return [];
  }

  return data;
}
