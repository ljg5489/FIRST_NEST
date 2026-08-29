// 파일 위치: src/app/api/recommend/route.ts
// 파일 명: route.ts
//
// 병합 내역:
// - (기존 route.ts) Kakao REST 실거리 계산, reliability 규칙, OpenAI 스토리텔링 → 유지
// - (recommend.ts) 카테고리(HS/NA/EX/VE) 기반 필터링, day/sequence 구조, 근처 축제 연동 → 신규 결합
// - 버그 수정: traveler.focus(자유 영단어) → place_tags 코드 직접 매칭 시 0건이 나던 문제
//   → INTEREST_TO_CATEGORY 매핑 레이어 추가

import { NextResponse } from "next/server";
import { generateCourseStory } from "@/lib/openai";
import { getDrivingRoute } from "@/lib/kakao-rest";
import { getAttractionsByCategory, CategoryCode } from "@/lib/recommend";
import { INTEREST_MAP, ALL_CATEGORIES, FacilityType } from "@/lib/interest-mapping";
import { supabase } from "@/services/supabase/client";

// ============================================================
// 관심사 → DB 조건 변환
// 매핑 정의는 interest-mapping.ts에서 관리 (카테고리 체계가 바뀌어도 이 함수는 안 바뀜)
// ============================================================
interface ResolvedConditions {
  categories: CategoryCode[];
  requiredFacilities: FacilityType[];
  prioritizeFestival: boolean;
}

function resolveConditionsFromFocus(focus: string): ResolvedConditions {
  const interests = focus.split(",").map((s) => s.trim());
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

  // 카테고리 매칭이 하나도 없으면(예: "가족"만 선택) 전체 카테고리로 폴백
  return {
    categories: categories.size > 0 ? Array.from(categories) : ALL_CATEGORIES,
    requiredFacilities: Array.from(facilities),
    prioritizeFestival,
  };
}

// ============================================================
// 선택된 관광지들의 근처 진행중 축제 배치 조회 (N+1 방지)
// ============================================================
async function getEventsForPlaces(placeIds: string[]) {
  if (placeIds.length === 0) return {} as Record<string, any[]>;

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("event")
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { traveler } = body;

    if (!traveler) {
      return NextResponse.json({ error: "여행자 정보가 부족합니다." }, { status: 400 });
    }

    console.log(`[API] 동적 추천 엔진 가동 시작 - 대상: ${traveler.name || "Custom"}`);

    // =====================================================================
    // STEP 1: 규칙 기반(Rule-based) DB 후보 선정
    // =====================================================================
    // 1-1. 관심사 문자열 → 카테고리/시설/축제우선순위 세 축으로 분해 (기존 버그 수정 지점)
    const resolved = traveler.focus
      ? resolveConditionsFromFocus(traveler.focus)
      : { categories: ALL_CATEGORIES, requiredFacilities: [], prioritizeFestival: false };

    // 1-2. DB에서 카테고리(+시설 조건)와 일치하는 관광지 1차 추출
    let candidatePlaces = await getAttractionsByCategory({
      categories: resolved.categories,
      requiredFacilities: resolved.requiredFacilities,
    });

    // 조건에 맞는 데이터가 0개라면, 시설 조건부터 완화 후 그래도 없으면 전체 카테고리로 폴백
    if (!candidatePlaces || candidatePlaces.length === 0) {
      console.warn("[안내] 조건에 맞는 관광지가 부족하여 시설 조건 없이 재탐색합니다.");
      candidatePlaces = await getAttractionsByCategory({ categories: resolved.categories });
    }
    if (!candidatePlaces || candidatePlaces.length === 0) {
      console.warn("[안내] 여전히 부족하여 전체 카테고리로 재탐색합니다.");
      candidatePlaces = await getAttractionsByCategory({
        categories: ALL_CATEGORIES,
      });
    }

    // 1-3. 좌표가 확실히 있는 데이터만 필터링 (getAttractionsByCategory 내부에서 이미 처리되지만 방어적으로 유지)
    const validPlaces = candidatePlaces.filter((p: any) => p.latitude && p.longitude);

    // 1-4. 여행 일수(days)에 비례하여 코스 갯수 선정 (기본 하루에 2곳씩)
    const days = Number(traveler.days) || 1;
    const placesPerDay = 2;
    const targetCount = Math.max(2, days * placesPerDay);

    // 1-5. 매번 똑같은 결과가 나오지 않도록 가벼운 셔플 적용 (같은 카테고리 내 동점 처리 — 지난번 논의대로 태그만으론 순위差 없음)
    // "축제" 관심사가 선택된 경우, 순수 랜덤 대신 근처 이벤트가 있는 장소를 먼저 배치
    let orderedCandidates = [...validPlaces];
    if (resolved.prioritizeFestival) {
      const candidateIds = orderedCandidates.map((p: any) => p.id);
      const preEventCheck = await getEventsForPlaces(candidateIds);
      orderedCandidates.sort((a: any, b: any) => {
        const aHas = preEventCheck[a.id]?.length ? 1 : 0;
        const bHas = preEventCheck[b.id]?.length ? 1 : 0;
        return bHas - aHas; // 이벤트 있는 쪽이 앞으로
      });
      // 우선순위 그룹 내에서만 가볍게 섞어서 매번 똑같은 순서가 되는 건 방지
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
      return NextResponse.json({ error: "DB에 유효한 관광지 데이터가 없습니다." }, { status: 404 });
    }

    // 1-6. day_number/sequence 구조로 분할 (courses/course_stops 스키마에 맞춤)
    const dayGroups: any[][] = [];
    for (let d = 0; d < days; d++) {
      dayGroups.push(selectedPlaces.slice(d * placesPerDay, d * placesPerDay + placesPerDay));
    }

    const placeNames = selectedPlaces.map((p: any) => p.name_ko);
    const routeString = placeNames.join(" ➔ ");

    // =====================================================================
    // STEP 2: 이동 거리/시간 검증 (Kakao REST API 연동)
    // =====================================================================
    // ⚠️ getDrivingRoute가 A→B 단건만 지원하므로, 전체 코스를 순서대로 순회하며 누적
    // (day 경계를 넘는 구간도 포함 — 하루 끝나고 다음날 시작 지점까지의 이동은 실제로는
    //  숙소 기준으로 재계산해야 더 정확하지만, 지금은 MVP라 순서 그대로 누적)
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

    if (totalDuration > days * 90) {
      reliability = "Medium";
    }
    if (totalDuration > days * 150) {
      reliability = "Low";
    }

    // =====================================================================
    // STEP 2.5: 근처 축제(이벤트) 배치 조회 (신규 결합 지점)
    // =====================================================================
    const eventsByPlace = await getEventsForPlaces(selectedPlaces.map((p: any) => p.id));

    // =====================================================================
    // STEP 3: AI 맞춤형 스토리텔링 생성 (OpenAI 연동, 기존 함수 그대로 사용)
    // =====================================================================
    const aiStory = await generateCourseStory(
      {
        name: traveler.name,
        country: traveler.country,
        focus: traveler.focus,
        duration: `${days} Days`,
      },
      placeNames
    );

    // =====================================================================
    // STEP 4: 최종 데이터 응답 구조화
    // =====================================================================
    const result = {
      route: routeString,
      aiStory: aiStory,
      metrics: {
        dispersion: Math.floor(Math.random() * 15) + 80, // TODO: 실제 지역 분산도 계산으로 교체 예정
        friendly: Math.floor(Math.random() * 10) + 85, // TODO: 실제 지표로 교체 예정
        reliability: reliability,
        estimatedDistance: totalDistance.toFixed(1),
        estimatedTime: totalDuration,
      },
      places: selectedPlaces,
      // 신규 결합: day별 구조 + 근처 축제 (courses/course_stops 저장 시 이 형태를 그대로 사용 가능)
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

    console.log(`[API] 동적 추천 완료 - 코스: ${routeString}`);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[오류] 동적 API 라우트 처리 실패:", error);
    return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
  }
}