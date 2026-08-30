// 파일 위치: src/lib/course-builder.ts
// 파일 명: course-builder.ts
//
// route.ts(API)와 ResultsPage(서버 컴포넌트) 양쪽에서 재사용하는 핵심 추천 로직.
// 같은 Next.js 서버 안에서 서버 컴포넌트가 자기 자신의 API를 fetch로 부르는 건
// 비효율적이라, 로직 자체를 함수로 분리하고 route.ts는 이 함수를 부르는 얇은 래퍼로만 둠.

import { generateCourseStory } from "@/lib/openai";
import { getDrivingRoute } from "@/lib/kakao-rest";
import { getAttractionsByCategory, CategoryCode } from "@/lib/recommend";
import { INTEREST_MAP, ALL_CATEGORIES, FacilityType } from "@/lib/interest-mapping";
import { supabase } from "@/services/supabase/client";

export interface TravelerInput {
  name?: string;
  country?: string;
  focus?: string; // 콤마로 구분된 관심사 문자열 (예: "역사, 자연")
  days: number;
}

interface ResolvedConditions {
  categories: CategoryCode[];
  requiredFacilities: FacilityType[];
  prioritizeFestival: boolean;
}

function resolveConditionsFromFocus(focus: string): ResolvedConditions {
  const interests = focus.split(",").map((s) => s.trim()).filter(Boolean);
  const categories = new Set<CategoryCode>();
  const facilities = new Set<FacilityType>();
  let prioritizeFestival = false;

  interests.forEach((interest) => {
    const effects = INTEREST_MAP[interest];

    if (!effects) {
      console.warn(`[안내] 알 수 없는 관심사: "${interest}" — 무시하고 진행`);
      return;
    }

    effects.forEach((effect) => {
      switch (effect.type) {
        case "category":
          categories.add(effect.value);
          break;
        case "facility":
          facilities.add(effect.value);
          break;
        case "festival_priority":
          prioritizeFestival = true;
          break;
        case "unsupported":
          console.warn(`[안내] "${interest}"는 현재 DB로 반영 불가 (${effect.reason}) — 무시하고 진행`);
          break;
      }
    });
  });

  return {
    categories: categories.size > 0 ? Array.from(categories) : ALL_CATEGORIES,
    requiredFacilities: Array.from(facilities),
    prioritizeFestival,
  };
}

async function getEventsForPlaces(placeIds: string[]) {
  if (placeIds.length === 0) return {} as Record<string, any[]>;

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
    console.error("[오류] 근처 축제 배치 조회 에러:", error.message);
    return {} as Record<string, any[]>;
  }

  const byPlace: Record<string, any[]> = {};
  (data || []).forEach((row: any) => {
    if (!byPlace[row.place_id]) byPlace[row.place_id] = [];
    byPlace[row.place_id].push(row);
  });
  return byPlace;
}

export interface BuiltCourse {
  route: string;
  aiStory: string;
  metrics: {
    dispersion: number;
    friendly: number;
    reliability: string;
    estimatedDistance: string;
    estimatedTime: number;
  };
  places: any[];
  days: Array<{
    day_number: number;
    stops: Array<{
      sequence: number;
      place_id: string;
      place_name: string;
      nearby_events: any[];
    }>;
  }>;
}

export async function buildTravelCourse(traveler: TravelerInput): Promise<BuiltCourse | null> {
  console.log(`[추천엔진] 가동 시작 - 대상: ${traveler.name || "Custom"}`);

  // STEP 1: 규칙 기반 DB 후보 선정
  const resolved = traveler.focus
    ? resolveConditionsFromFocus(traveler.focus)
    : { categories: ALL_CATEGORIES, requiredFacilities: [], prioritizeFestival: false };

  let candidatePlaces = await getAttractionsByCategory({
    categories: resolved.categories,
    requiredFacilities: resolved.requiredFacilities,
  });

  if (!candidatePlaces || candidatePlaces.length === 0) {
    console.warn("[안내] 조건에 맞는 관광지가 부족하여 시설 조건 없이 재탐색합니다.");
    candidatePlaces = await getAttractionsByCategory({ categories: resolved.categories });
  }
  if (!candidatePlaces || candidatePlaces.length === 0) {
    console.warn("[안내] 여전히 부족하여 전체 카테고리로 재탐색합니다.");
    candidatePlaces = await getAttractionsByCategory({ categories: ALL_CATEGORIES });
  }

  const validPlaces = candidatePlaces.filter((p: any) => p.latitude && p.longitude);

  const days = Number(traveler.days) || 1;
  const placesPerDay = 2;
  const targetCount = Math.max(2, days * placesPerDay);

  let orderedCandidates = [...validPlaces];
  if (resolved.prioritizeFestival) {
    const candidateIds = orderedCandidates.map((p: any) => p.id);
    const preEventCheck = await getEventsForPlaces(candidateIds);
    const withEvent = orderedCandidates.filter((p: any) => preEventCheck[p.id]?.length);
    const withoutEvent = orderedCandidates.filter((p: any) => !preEventCheck[p.id]?.length);
    orderedCandidates = [
      ...withEvent.sort(() => 0.5 - Math.random()),
      ...withoutEvent.sort(() => 0.5 - Math.random()),
    ];
  } else {
    orderedCandidates = orderedCandidates.sort(() => 0.5 - Math.random());
  }
  const selectedPlaces = orderedCandidates.slice(0, targetCount);

  if (selectedPlaces.length === 0) {
    return null; // DB에 유효한 관광지 데이터가 없음 — 호출부에서 404 처리
  }

  const dayGroups: any[][] = [];
  for (let d = 0; d < days; d++) {
    dayGroups.push(selectedPlaces.slice(d * placesPerDay, d * placesPerDay + placesPerDay));
  }

  const placeNames = selectedPlaces.map((p: any) => p.name_ko);
  const routeString = placeNames.join(" ➔ ");

  // STEP 2: Kakao REST 실거리/시간 계산
  let totalDistance = 0;
  let totalDuration = 0;
  let reliability = "High";

  for (let i = 0; i < selectedPlaces.length - 1; i++) {
    const origin = { lat: selectedPlaces[i].latitude, lng: selectedPlaces[i].longitude };
    const destination = { lat: selectedPlaces[i + 1].latitude, lng: selectedPlaces[i + 1].longitude };
    const routeInfo = await getDrivingRoute(origin, destination);
    if (routeInfo) {
      totalDistance += parseFloat(routeInfo.distance);
      totalDuration += routeInfo.duration;
    }
  }

  if (totalDuration > days * 90) reliability = "Medium";
  if (totalDuration > days * 150) reliability = "Low";

  // STEP 2.5: 근처 축제 배치 조회
  const eventsByPlace = await getEventsForPlaces(selectedPlaces.map((p: any) => p.id));

  // STEP 3: OpenAI 스토리텔링
  const aiStory = await generateCourseStory(
    {
      name: traveler.name || "",
      country: traveler.country || "",
      focus: traveler.focus || "",
      duration: `${days} Days`,
    },
    placeNames
  );

  return {
    route: routeString,
    aiStory,
    metrics: {
      dispersion: Math.floor(Math.random() * 15) + 80, // TODO: 실제 지역 분산도 계산으로 교체 예정
      friendly: Math.floor(Math.random() * 10) + 85, // TODO: 실제 지표로 교체 예정
      reliability,
      estimatedDistance: totalDistance.toFixed(1),
      estimatedTime: totalDuration,
    },
    places: selectedPlaces,
    days: dayGroups.map((group, idx) => ({
      day_number: idx + 1,
      stops: group.map((place: any, seqIdx: number) => ({
        sequence: seqIdx + 1,
        place_id: place.id,
        place_name: place.name_ko,
        nearby_events: eventsByPlace[place.id] || [],
      })),
    })),
  };
}