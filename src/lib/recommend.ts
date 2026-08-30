// 파일 위치: src/lib/recommend.ts
// 파일 명: recommend.ts
//
// AI/규칙 기반 코스 추천 로직
// data.ts의 기존 컨벤션(null/빈배열/DB에러 3분기 처리)을 그대로 따름
// A안(대분류 4개 직접 노출) 기준으로 작성 — 나중에 페르소나(B안)로 확장할 때는
// resolveCategoriesFromPersona() 함수 하나만 앞단에 추가하면 됨

import { supabase } from "@/services/supabase/client";

// ============================================================
// 타입 정의
// ============================================================

// 우리 프로젝트 DB에 실제로 존재하는 대분류 4종
// (TourAPI_분류체계코드_계층형.txt 기준, HS/NA/EX/VE 외 다른 대분류는 데이터 없음)
export type CategoryCode = "HS" | "NA" | "EX" | "VE";

export const CATEGORY_LABELS: Record<CategoryCode, string> = {
  HS: "역사관광",
  NA: "자연관광",
  EX: "체험관광",
  VE: "문화관광",
};

export interface CourseConditions {
  categories: CategoryCode[]; // 사용자가 선택한 대분류 (1개 이상)
  subCategories?: string[]; // 선택: 소분류 코드까지 (예: "HS010900")
  days: number; // 여행 일수
  placesPerDay?: number; // 일당 방문 장소 수 (기본 2, 하경님 임시로직 값 유지)
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
  conditions: Pick<CourseConditions, "categories" | "subCategories" | "requiredFacilities">
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

// ============================================================
// Stage 2. 코스 구성 (일자 배분 + 동선 정렬)
// ============================================================

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371; // km
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 최근접 이웃 휴리스틱으로 동선 정렬 (하루 방문지 5~8곳 수준이라 2-opt 없이 충분)
function orderByNearestNeighbor(places: CandidatePlace[]): CandidatePlace[] {
  if (places.length <= 2) return places;

  const remaining = [...places];
  const ordered: CandidatePlace[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((p, idx) => {
      const dist = haversineDistance(
        [last.latitude, last.longitude],
        [p.latitude, p.longitude]
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return ordered;
}

// 후보군에서 필요한 만큼 뽑아 day별로 배분
// TODO: 지금은 앞에서부터 순서대로 자르는 방식. 나중에 지역 클러스터링(예: 좌표 기준
// k-means로 하루 동선이 안 겹치게)으로 고도화 가능 — 지금은 MVP 우선
function assignToDays(
  places: CandidatePlace[],
  days: number,
  placesPerDay: number
): CandidatePlace[][] {
  const result: CandidatePlace[][] = [];
  let cursor = 0;

  for (let d = 0; d < days; d++) {
    const chunk = places.slice(cursor, cursor + placesPerDay);
    result.push(orderByNearestNeighbor(chunk));
    cursor += placesPerDay;
  }

  return result;
}

// ============================================================
// Stage 2.5. 근처 이벤트(축제) 배치 조회
// ============================================================

// N+1 방지를 위해 선택된 관광지 전체를 한 번에 조회 (getAttractionById의 event 조회 패턴 재사용)
async function getEventsForPlaces(placeIds: string[]) {
  if (placeIds.length === 0) return {};

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("place_events") // ⚠️ 하경님 표현 기준 복수형. 정확한 스펠링 재확인 예정
    .select(
      `
      place_id,
      start_date,
      end_date,
      fee_info,
      booking_url,
      events!inner ( id, title, first_image_url )
    `
    )
    .in("place_id", placeIds)
    .gte("end_date", today);

  if (error) {
    console.error("[오류] 코스용 근처 축제 배치 조회 에러:", error.message);
    // 이벤트 조회 실패가 전체 코스 추천을 막을 이유는 없으므로 에러를 던지지 않고 빈 결과로 처리
    return {};
  }

  const byPlace: Record<string, typeof data> = {};
  (data || []).forEach((row: any) => {
    if (!byPlace[row.place_id]) byPlace[row.place_id] = [];
    byPlace[row.place_id].push(row);
  });

  return byPlace;
}

// ============================================================
// Stage 3. LLM 보정 (코스 설명/추천 이유 생성)
// ============================================================

// 하경님이 검증한 세팅 그대로 사용: gpt-4o-mini, max_tokens 600
// ⚠️ API 키는 반드시 환경변수(OPENAI_API_KEY)로만 참조 — 절대 코드/커밋에 하드코딩 금지
async function generateCourseNarrative(
  days: CandidatePlace[][],
  conditions: CourseConditions
): Promise<string> {
  const summary = days
    .map(
      (day, i) =>
        `Day ${i + 1}: ${day.map((p) => p.name_ko).join(" → ")}`
    )
    .join("\n");

  const prompt = `다음은 사용자 조건(관심사: ${conditions.categories
    .map((c) => CATEGORY_LABELS[c])
    .join(", ")}, ${conditions.days}일 여행)에 맞춰 구성한 여행 코스입니다.

${summary}

각 날짜별로 왜 이 동선이 자연스러운지, 방문지들이 어떤 매력이 있는지 자연스러운 한국어로 짧게 설명해주세요.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const json = await response.json();
    return json.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[오류] LLM 코스 설명 생성 실패:", err);
    // LLM 실패해도 코스 자체(장소/순서)는 살아있어야 하므로 빈 설명으로 폴백
    return "";
  }
}

// ============================================================
// 최종 진입점: 조건 → 코스 생성
// ============================================================

export interface GeneratedCourseStop {
  day_number: number;
  sequence: number;
  place_id: string;
  place_name: string;
  notes: string; // LLM이 생성한 설명 중 해당 day 부분(또는 추후 스탑 단위로 세분화)
  nearby_events: any[];
}

export interface GeneratedCourse {
  conditions: CourseConditions;
  stops: GeneratedCourseStop[];
}

export async function generateRecommendedCourse(
  conditions: CourseConditions
): Promise<GeneratedCourse | null> {
  const placesPerDay = conditions.placesPerDay ?? 2;

  // 1. 후보 조회
  let candidates = await getAttractionsByCategory(conditions);

  // 조건에 맞는 후보가 없으면 조건 없는 전체 조회로 폴백 (하경님 임시로직과 동일)
  if (candidates.length === 0) {
    console.warn("[안내] 조건 매칭 결과 없음 → 전체 조회로 폴백");
    candidates = await getAttractionsByCategory({
      categories: ["HS", "NA", "EX", "VE"],
    });
  }

  if (candidates.length === 0) {
    return null; // 전체 조회로도 후보가 없으면 DB 자체가 비어있는 상태
  }

  const needed = conditions.days * placesPerDay;
  const selected = candidates.slice(0, needed);

  // 2. day별 배분 + 동선 정렬
  const dayGroups = assignToDays(selected, conditions.days, placesPerDay);

  // 3. 근처 이벤트 배치 조회
  const allPlaceIds = selected.map((p) => p.id);
  const eventsByPlace = await getEventsForPlaces(allPlaceIds);

  // 4. LLM 설명 생성
  const narrative = await generateCourseNarrative(dayGroups, conditions);

  // 5. course_stops 형태로 조립
  const stops: GeneratedCourseStop[] = [];
  dayGroups.forEach((day, dayIdx) => {
    day.forEach((place, seqIdx) => {
      stops.push({
        day_number: dayIdx + 1,
        sequence: seqIdx + 1,
        place_id: place.id,
        place_name: place.name_ko,
        notes: narrative, // TODO: 지금은 전체 설명을 통째로 넣음. 나중에 day/스탑 단위로 분리 가능
        nearby_events: eventsByPlace[place.id] || [],
      });
    });
  });

  return { conditions, stops };
}