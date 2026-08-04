// 파일 위치: lib/supabase/places.ts
// 파일 명: places.ts

import type { Attraction } from "../types";
import { createKakaoDirectionUrl } from "../kakao-map";
import { getChungnamRegionName, getContentTypeName } from "../tourism-codes";
import { getSupabasePublicClient } from "./client";

export type PlaceListItem = {
  id: string;
  tour_api_content_id: string;
  name_ko: string;
  name_en: string | null;
  address: string | null;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  raw_data: Record<string, unknown> | null;
};

function getStringFromRawData(
  rawData: Record<string, unknown> | null,
  key: string,
  fallback = "",
) {
  const value = rawData?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mapPlaceToAttraction(place: PlaceListItem): Attraction {
  const sigunguCode = getStringFromRawData(place.raw_data, "sigungucode");
  const contentTypeId = getStringFromRawData(place.raw_data, "contenttypeid");
  const region = getChungnamRegionName(sigunguCode, "충남", place.address);
  const category = getContentTypeName(contentTypeId, "관광지");

  return {
    id: place.id,
    tourApiContentId: place.tour_api_content_id,
    name: place.name_ko,
    nameEn: place.name_en,
    region,
    category,
    address: place.address ?? "주소 정보 없음",
    addressEn: place.address_en,
    summary: getStringFromRawData(
      place.raw_data,
      "overview",
      "TourAPI 기반 충남 관광지 데이터입니다.",
    ),
    source: "Korea Tourism Organization TourAPI",
    estimatedCost: 0,
    mapUrl: createKakaoDirectionUrl({
      name: place.name_ko,
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
    }),
    latitude: place.latitude,
    longitude: place.longitude,
    imageUrl: getStringFromRawData(place.raw_data, "firstimage"),
  };
}

export async function getPlacesFromDB() {
  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("places")
    .select(
      "id, tour_api_content_id, name_ko, name_en, address, address_en, latitude, longitude, raw_data",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DB 조회 에러:", error.message);
    return [];
  }

  return (data as PlaceListItem[]).map(mapPlaceToAttraction);
}
