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