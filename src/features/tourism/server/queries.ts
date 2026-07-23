// 파일 위치: src/features/tourism/server/queries.ts
import { supabase } from '../../../services/supabase/client';

// 프론트엔드 화면에서 호출할 함수: Supabase에서만 데이터를 빠르게 꺼내옴
export async function getPlacesFromDB() {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('DB 조회 에러:', error.message);
    return [];
  }

  return data;
}