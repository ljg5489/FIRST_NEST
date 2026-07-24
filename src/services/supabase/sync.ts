import { fetchChungnamTouristSpots } from '../tour-api/area';
import { getSupabaseAdmin } from './admin';

function parseTourApiTimestamp(value?: string) {
  if (!value || !/^\d{14}$/.test(value)) {
    return null;
  }

  const formatted = [
    value.slice(0, 4),
    '-',
    value.slice(4, 6),
    '-',
    value.slice(6, 8),
    'T',
    value.slice(8, 10),
    ':',
    value.slice(10, 12),
    ':',
    value.slice(12, 14),
    '+09:00',
  ].join('');

  return new Date(formatted).toISOString();
}

export async function syncTouristSpotsToDB() {
  const supabaseAdmin = getSupabaseAdmin();
  const spots = await fetchChungnamTouristSpots('kor');

  if (spots.length === 0) {
    return {
      success: false,
      message: 'TourAPI에서 데이터를 불러오지 못했습니다.',
    };
  }

  const syncedAt = new Date().toISOString();
  const placesToInsert = spots
    .filter((spot) => spot.contentid && spot.contenttypeid && spot.title)
    .map((spot) => ({
      tour_api_content_id: spot.contentid,
      content_type_id: Number.parseInt(spot.contenttypeid, 10),
      name_ko: spot.title,
      address: [spot.addr1, spot.addr2].filter(Boolean).join(' ') || null,
      latitude: spot.mapy ? Number.parseFloat(spot.mapy) : null,
      longitude: spot.mapx ? Number.parseFloat(spot.mapx) : null,
      region_code: spot.areacode || null,
      district_code: spot.sigungucode || null,
      category_code: spot.cat3 || null,
      phone: spot.tel || null,
      source_updated_at: parseTourApiTimestamp(spot.modifiedtime),
      synced_at: syncedAt,
      raw_data: spot,
    }));

  const { data, error } = await supabaseAdmin
    .from('places')
    .upsert(placesToInsert, {
      onConflict: 'tour_api_content_id',
    })
    .select('id');

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    count: data?.length ?? 0,
    skipped: spots.length - placesToInsert.length,
  };
}
