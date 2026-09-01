"use client";

// 파일 위치: src/lib/supabase/courses.ts
// 파일 명: courses.ts

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const supabase = createBrowserSupabaseClient();

// ==========================================
// 타입 정의
// ==========================================

export interface CourseInsert {
  title: string;
  description?: string | null;
  is_public?: boolean;
  total_duration_minutes?: number | null;
  total_distance_m?: number | null;
  estimated_travel_minutes?: number | null;
  estimated_cost_krw?: number | null;
  transport_modes?: string[];
  ai_story?: string | null;
  route_reliability?: number | null;
  routing_provider?: string | null;
  metrics_calculated_at?: string | null;
}

export interface CourseStopInsert {
  place_id: string;
  stop_order: number;
  stay_minutes?: number;
  note?: string | null;
}

export interface CourseUpdate {
  title?: string;
  description?: string | null;
  is_public?: boolean;
  total_duration_minutes?: number | null;
  total_distance_m?: number | null;
  estimated_travel_minutes?: number | null;
  estimated_cost_krw?: number | null;
  transport_modes?: string[];
  ai_story?: string | null;
  route_reliability?: number | null;
  routing_provider?: string | null;
  metrics_calculated_at?: string | null;
}

// ==========================================
// DB 조작 함수군
// ==========================================

/**
 * 1. [Create] 코스와 해당 코스의 경유지(Stops)들을 일괄 저장합니다.
 * @param courseData 코스 기본 정보
 * @param stopsData 코스 경유지 배열
 * @returns 생성된 코스 ID
 */
export async function createCourseWithStops(
  courseData: CourseInsert,
  stopsData: CourseStopInsert[]
) {
  // 1-1. 코스 기본 정보 삽입
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert([courseData])
    .select('id')
    .single();

  if (courseError) {
    console.error('코스 생성 실패:', courseError.message);
    throw new Error(`코스 생성 실패: ${courseError.message}`);
  }

  const courseId = course.id;

  // 1-2. 생성된 코스 ID를 매핑하여 경유지 배열 구성
  if (stopsData.length > 0) {
    const stopsToInsert = stopsData.map((stop) => ({
      course_id: courseId,
      place_id: stop.place_id,
      stop_order: stop.stop_order,
      stay_minutes: stop.stay_minutes ?? 60,
      note: stop.note || null,
    }));

    const { error: stopsError } = await supabase
      .from('course_stops')
      .insert(stopsToInsert);

    if (stopsError) {
      console.error('코스 경유지 저장 실패:', stopsError.message);
      // 무결성을 위해 코스 자체를 삭제하는 롤백 처리 고려 가능
      await supabase.from('courses').delete().eq('id', courseId);
      throw new Error(`경유지 저장 실패로 코스 생성이 취소되었습니다: ${stopsError.message}`);
    }
  }

  return courseId;
}

/**
 * 2. [Read] 특정 코스 ID를 기반으로 코스 상세 정보와 연결된 장소(places) 정보를 모두 조회합니다.
 * @param courseId 조회할 코스 ID
 */
export async function getCourseWithDetails(courseId: number) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_stops (
        id,
        stop_order,
        stay_minutes,
        note,
        places (
          id,
          name_ko,
          address,
          latitude,
          longitude
        )
      )
    `)
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('코스 조회 실패:', error.message);
    throw new Error(`코스 조회 실패: ${error.message}`);
  }

  // 데이터 정렬: course_stops를 stop_order 기준으로 오름차순 정렬
  if (data && data.course_stops) {
    data.course_stops.sort((a: any, b: any) => a.stop_order - b.stop_order);
  }

  return data;
}

/**
 * 3. [Read] 특정 사용자가 생성한 코스 목록을 조회합니다.
 * @param userId 사용자 UUID
 */
export async function getUserCourses(userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, is_public, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('사용자 코스 목록 조회 실패:', error.message);
    throw new Error(`사용자 코스 목록 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 4. [Update] 코스 기본 정보(제목, 설명 등)를 수정합니다.
 * @param courseId 코스 ID
 * @param updates 수정할 정보 객체
 */
export async function updateCourseInfo(courseId: number, updates: CourseUpdate) {
  const { data, error } = await supabase
    .from('courses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) {
    console.error('코스 수정 실패:', error.message);
    throw new Error(`코스 수정 실패: ${error.message}`);
  }

  return data;
}

/**
 * 5. [Delete] 코스를 삭제합니다. (Cascade 설정에 의해 course_stops도 자동 삭제됨)
 * @param courseId 삭제할 코스 ID
 */
export async function deleteCourse(courseId: number) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    console.error('코스 삭제 실패:', error.message);
    throw new Error(`코스 삭제 실패: ${error.message}`);
  }

  return true;
}

/**
 * 6. [Update/Delete/Create] 특정 코스의 경유지 목록을 프론트엔드 상태와 완벽히 동기화합니다.
 * 기존 경유지를 모두 삭제하고 전달받은 새 배열로 덮어씁니다.
 * @param courseId 코스 ID
 * @param newStops 새로 갱신될 경유지 배열
 */
export async function syncCourseStops(courseId: number, newStops: CourseStopInsert[]) {
  // 1. 기존 경유지 일괄 삭제
  const { error: deleteError } = await supabase
    .from('course_stops')
    .delete()
    .eq('course_id', courseId);

  if (deleteError) {
    console.error('기존 경유지 삭제 실패:', deleteError.message);
    throw new Error(`기존 경유지 삭제 실패: ${deleteError.message}`);
  }

  // 2. 새 경유지 배열 삽입
  if (newStops.length > 0) {
    const stopsToInsert = newStops.map((stop) => ({
      course_id: courseId,
      place_id: stop.place_id,
      stop_order: stop.stop_order,
      stay_minutes: stop.stay_minutes ?? 60,
      note: stop.note || null,
    }));

    const { error: insertError } = await supabase
      .from('course_stops')
      .insert(stopsToInsert);

    if (insertError) {
      console.error('새 경유지 삽입 실패:', insertError.message);
      throw new Error(`새 경유지 삽입 실패: ${insertError.message}`);
    }
  }

  // 3. courses 테이블의 updated_at 갱신
  await supabase
    .from('courses')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', courseId);

  return true;
}

/**
 * 7. [Read] 탐색 탭을 위한 공개(Public) 코스 목록을 조회합니다.
 * @param limit 가져올 레코드 수 (기본값 20)
 */
export async function getPublicCourses(limit: number = 20) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, updated_at, total_duration_minutes')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('공개 코스 목록 조회 실패:', error.message);
    throw new Error(`공개 코스 목록 조회 실패: ${error.message}`);
  }

  return data;
}
