// 파일 위치: src/features/tourism/server/queries.ts
import { supabase } from '../../../services/supabase/client';

export interface PlaceListItem {
  id: string;
  tour_api_content_id: string;
  name_ko: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  raw_data: Record<string, unknown> | null;
}

export async function getPlacesFromDB() {
  const { data, error } = await supabase
    .from('places')
    .select(
      'id, tour_api_content_id, name_ko, address, latitude, longitude, raw_data',
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('DB 조회 에러:', error.message);
    return [];
  }

  return data as PlaceListItem[];
}
