// 파일 위치: src/features/tourism/server/queries.ts
// 파일 명: queries.ts

// 진규 코드에서 이번에 추가한 name_en, address_en 필드가 포함된 PlaceListItem 타입 정의와 getPlacesFromDB 함수 정의

import { supabase } from '../../../services/supabase/client';

export interface PlaceListItem {
  id: string;
  tour_api_content_id: string;
  name_ko: string;
  name_en: string | null;      // 추가됨: 영어 이름
  address: string | null;
  address_en: string | null;   // 추가됨: 영어 주소
  latitude: number | null;
  longitude: number | null;
  raw_data: Record<string, unknown> | null;
}

export async function getPlacesFromDB() {
  const { data, error } = await supabase
    .from('places')
    .select(
      // 추가됨: name_en, address_en 조회
      'id, tour_api_content_id, name_ko, name_en, address, address_en, latitude, longitude, raw_data',
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('DB 조회 에러:', error.message);
    return [];
  }

  return data as PlaceListItem[];
}