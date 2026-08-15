// 파일 위치: src/lib/admin-data.ts
// 파일 명: admin-data.ts

import { supabase } from "@/services/supabase/client";

/**
 * [관리자 전용] 데이터 동기화 로그 호출
 * - 용도: src/app/admin/ 페이지 하위에서 동기화 상태 모니터링 시 사용
 */
export async function getSyncLogs() {
  console.log('📡 [Admin] DB에서 동기화 로그를 불러옵니다...');
  
  const { data, error } = await supabase
    .from('data_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50); // 최신 로그 50개만 호출

  if (error) {
    console.error('❌ 동기화 로그 호출 에러:', error.message);
    return [];
  }
  
  return data;
}

// 향후 관리자 페이지에서 필요한 유저 통계, 어드민 전용 데이터 호출 함수들은
// 모두 이 파일(admin-data.ts)에 추가하면 됨

/**
 * [관리자 전용] 영문 이름(name_en)이 없는 관광지 1개 호출
 */
export async function getPlaceNeedingTranslation() {
  const { data, error } = await supabase
    .from('places')
    .select('id, name_ko, name_en, address, address_en, description')
    .is('name_en', null) // name_en이 비어있는 데이터만 필터링
    .order('id', { ascending: true })
    .limit(1)
    .single();

  // PGRST116은 결과가 0건일 때 뜨는 에러코드 (모두 번역 완료됨을 의미)
  if (error && error.code !== 'PGRST116') {
    console.error('❌ 번역 필요 데이터 호출 에러:', error.message);
    return null;
  }
  
  return data; // 없으면 null 반환
}

/**
 * [관리자 전용] 특정 관광지의 영문 데이터 업데이트
 */
export async function updatePlaceTranslation(
  id: string, 
  updates: { name_en: string; address_en: string }
) {
  const { error } = await supabase
    .from('places')
    .update({ 
      name_en: updates.name_en, 
      address_en: updates.address_en 
    })
    .eq('id', id);

  if (error) {
    console.error('❌ 영문 데이터 업데이트 에러:', error.message);
    throw new Error(error.message);
  }

  return true; // 성공 시 true 반환
}