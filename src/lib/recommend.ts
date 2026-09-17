// 파일 위치: src/lib/recommend.ts
// 파일 명: recommend.ts
//
// 카테고리/시설 조건 기반 관광지 후보 조회 담당.
// 코스 생성 전체 흐름(day 배분, 거리 계산, LLM 호출)은 course-builder.ts에 있고,
// 이 파일은 그 중 "DB에서 후보를 뽑아오는" 단계만 담당함.
// data.ts의 기존 컨벤션(null/빈배열/DB에러 3분기 처리)을 그대로 따름.

import { supabase } from "@/services/supabase/client";

// ============================================================
// 타입 정의
// ============================================================

// 우리 프로젝트 DB에 실제로 존재하는 대분류
// (2026-09-04 전체 DB 2421행 재분석 기준. AC/SH/C0는 places에 존재하지만
// 코스 추천 대상에서 의도적으로 제외 — interest-mapping.ts의 ALL_CATEGORIES 주석 참고)
export type CategoryCode = "HS" | "NA" | "EX" | "VE" | "FD" | "LS" | "AC" | "SH" | "EV" | "C0";

export const CATEGORY_LABELS: Record<CategoryCode, string> = {
  HS: "역사관광",
  NA: "자연관광",
  EX: "체험관광",
  VE: "문화관광",
  FD: "음식",
  LS: "레저스포츠",
  AC: "숙박",
  SH: "쇼핑",
  EV: "축제/공연/행사",
  C0: "추천코스",
};

// 후보 조회 조건 (여행 일수/일당 장소 수 등 코스 구성 관련 조건은 course-builder.ts가 담당)
export interface PlaceQueryConditions {
  categories: CategoryCode[]; // 사용자가 선택한 대분류 (1개 이상)
  subCategories?: string[]; // 선택: 소분류 코드까지 (예: "HS010900")
  requiredFacilities?: Array<"parking" | "baby_carriage" | "credit_card" | "pet">; // 필수 시설 조건
}

interface CandidatePlace {
  id: string;
  name_ko: string;
  address: string;
  latitude: number;
  longitude: number;
  place_images: { image_url: string; alt_text: string }[];
  place_tags: { tag: string }[];
  // requiredFacilities 조건이 있을 때만 조인되어 채워짐 (없으면 undefined)
  place_facilities?: { facility_type: string; is_available: boolean }[];
}

// ============================================================
// Stage 1. 후보 관광지 조회 (카테고리 + 시설 조건)
// ============================================================

// place_tags.tag는 "HS010900"처럼 대분류(2자리)+중분류+소분류가 이어붙은 코드라
// 정확히 일치(=)가 아니라 접두어(prefix) 매칭이 필요함 → .like()로 OR 조건 구성
export async function getAttractionsByCategory(
  conditions: PlaceQueryConditions
): Promise<CandidatePlace[]> {
  const { categories, subCategories, requiredFacilities } = conditions;

  console.log("[DB 호출] 카테고리 기반 관광지 후보 조회 중...", categories, subCategories);

  const needsFacilityJoin = !!requiredFacilities?.length;

  // Supabase는 .select() 문자열을 컴파일타임에 파싱해서 타입을 생성하기 때문에,
  // 문자열 안에서 삼항연산자로 조각을 끼워 넣으면(동적 문자열) 파서가 처리를 못 해서
  // ParserError 타입이 나옴 → 정적인 두 분기로 완전히 분리해서 각각 리터럴로 작성
  const baseQuery = needsFacilityJoin
    ? supabase.from("places").select(
        `
        id,
        name_ko,
        address,
        latitude,
        longitude,
        place_images ( image_url, alt_text ),
        place_tags!inner ( tag ),
        place_facilities!inner ( facility_type, is_available )
      `
      )
    : supabase.from("places").select(
        `
        id,
        name_ko,
        address,
        latitude,
        longitude,
        place_images ( image_url, alt_text ),
        place_tags!inner ( tag )
      `
      );

  let query = baseQuery.eq("place_images.is_primary", true);

  // 소분류가 지정되면 소분류 우선(더 구체적인 조건), 아니면 대분류 접두어로 매칭
  if (subCategories && subCategories.length > 0) {
    query = query.in("place_tags.tag", subCategories);
  } else {
    const orFilter = categories.map((c) => `tag.like.${c}%`).join(",");
    query = query.or(orFilter, { foreignTable: "place_tags" });
  }

  const { data, error } = await query.limit(200);

  if (error) {
    console.error("[오류] 카테고리 관광지 후보 조회 에러:", error.message);
    throw new Error(`DB_FETCH_ERROR: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn("[안내] 조건에 맞는 후보가 없습니다. 빈 배열 반환.");
    return [];
  }

  // 좌표 누락 데이터 제외 (하경님 임시로직과 동일한 처리)
  const withCoords = data.filter(
    (p: any) => p.latitude != null && p.longitude != null
  ) as CandidatePlace[];

  // 시설 조건이 있으면 클라이언트 사이드에서 한 번 더 필터
  // (facility 행이 아예 없는 place는 "정보 없음"이지 "불가능"이 아니므로 제외하지 않고,
  //  명시적으로 is_available=false인 경우만 걸러냄)
  if (requiredFacilities && requiredFacilities.length > 0) {
    return withCoords.filter((p: any) => {
      return requiredFacilities.every((f) => {
        const rows = (p.place_facilities || []).filter((pf: any) => pf.facility_type === f);
        if (rows.length === 0) return true; // 정보 없음 → 배제하지 않음
        return rows.some((pf: any) => pf.is_available === true);
      });
    });
  }

  return withCoords;
}