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
    .from("place_events")
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

// 후보군을 day별로 "지리적으로 가까운 것끼리" 묶어서 배분.
// 기존엔 카테고리/축제 우선순위로 정렬된 후보를 앞에서부터 그냥 잘라 day에 나눴는데,
// 그러면 하루 동선이 여러 지역에 흩어질 수 있음 → 하루는 한 지역 위주로 돌게끔 개선.
//
// 동작:
// 1. 이번 날의 "시작점"은 지금까지 선택된 모든 장소의 중심에서 가장 먼 후보로 선택
//    (day끼리 지역이 최대한 안 겹치게)
// 2. 그 시작점 기준으로 최근접 이웃을 순서대로 채워서 하루 분량을 완성
// 3. 다음 날도 동일하게 반복
//
// ⚠️ 트레이드오프: 완전히 거리 기준이라, 카테고리/축제 우선순위로 앞쪽에 있던 후보가
// 지리적으로 멀면 뒤로 밀릴 수 있음. "지역 응집도"를 "선호 우선순위"보다 우선한 설계.
function clusterPlacesByDay(
  orderedCandidates: any[],
  days: number,
  placesPerDay: number
): any[][] {
  const pool = [...orderedCandidates];
  const dayGroups: any[][] = [];

  for (let d = 0; d < days; d++) {
    if (pool.length === 0) break;

    let seedIdx = 0;

    if (dayGroups.length > 0) {
      const chosenSoFar = dayGroups.flat();
      const centroid = {
        lat: chosenSoFar.reduce((s, p) => s + p.latitude, 0) / chosenSoFar.length,
        lng: chosenSoFar.reduce((s, p) => s + p.longitude, 0) / chosenSoFar.length,
      };

      let maxDist = -1;
      pool.forEach((p, idx) => {
        const dist = haversineDistance([centroid.lat, centroid.lng], [p.latitude, p.longitude]);
        if (dist > maxDist) {
          maxDist = dist;
          seedIdx = idx;
        }
      });
    }

    const dayPlaces = [pool.splice(seedIdx, 1)[0]];

    while (dayPlaces.length < placesPerDay && pool.length > 0) {
      const last = dayPlaces[dayPlaces.length - 1];
      let nearestIdx = 0;
      let nearestDist = Infinity;

      pool.forEach((p, idx) => {
        const dist = haversineDistance([last.latitude, last.longitude], [p.latitude, p.longitude]);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });

      dayPlaces.push(pool.splice(nearestIdx, 1)[0]);
    }

    dayGroups.push(dayPlaces);
  }

  return dayGroups;
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
    perDay?: Array<{ day_number: number; distance: number; duration: number }>; // day별 상세 (신규)
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
  const preliminarySelection = orderedCandidates.slice(0, targetCount);

  if (preliminarySelection.length === 0) {
    return null; // DB에 유효한 관광지 데이터가 없음 — 호출부에서 404 처리
  }

  // day 배분: 기존 "앞에서부터 자르기" 대신 지리적 클러스터링 사용
  // (orderedCandidates 전체를 넘겨서, targetCount 넘는 후보 중에서도 지역적으로 더 나은 조합을 고를 여지를 줌)
  const dayGroups = clusterPlacesByDay(orderedCandidates, days, placesPerDay);
  const selectedPlaces = dayGroups.flat(); // 클러스터링 후 실제로 선택된 전체 장소 목록

  const placeNames = selectedPlaces.map((p: any) => p.name_ko);
  const routeString = placeNames.join(" ➔ ");

  // STEP 2: Kakao REST 실거리/시간 계산
  // ⚠️ day 경계를 넘는 구간(예: Day1 마지막 장소 → Day2 첫 장소)은 계산에서 제외.
  // 실제로는 하루 끝나고 숙소로 복귀했다가 다음날 다시 출발하는 거라, 그 구간까지
  // 이동거리에 합산하면 신뢰도(reliability) 계산이 왜곡됨.
  let totalDistance = 0;
  let totalDuration = 0;
  let reliability = "High";
  const perDayMetrics: Array<{ day_number: number; distance: number; duration: number }> = [];

  for (const dayPlaces of dayGroups) {
    let dayDistance = 0;
    let dayDuration = 0;

    for (let i = 0; i < dayPlaces.length - 1; i++) {
      const origin = { lat: dayPlaces[i].latitude, lng: dayPlaces[i].longitude };
      const destination = { lat: dayPlaces[i + 1].latitude, lng: dayPlaces[i + 1].longitude };
      const routeInfo = await getDrivingRoute(origin, destination);
      if (routeInfo) {
        dayDistance += parseFloat(routeInfo.distance);
        dayDuration += routeInfo.duration;
      }
    }

    perDayMetrics.push({
      day_number: perDayMetrics.length + 1,
      distance: Number(dayDistance.toFixed(1)),
      duration: dayDuration,
    });

    totalDistance += dayDistance;
    totalDuration += dayDuration;
  }

  // reliability는 "하루 최대 이동시간" 기준으로 판단 (여행 전체 총합보다 하루 단위가 실제 피로도에 더 가까움)
  const maxDayDuration = Math.max(...perDayMetrics.map((d) => d.duration), 0);
  if (maxDayDuration > 90) reliability = "Medium";
  if (maxDayDuration > 150) reliability = "Low";

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
      perDay: perDayMetrics,
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