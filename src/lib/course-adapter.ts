// 파일 위치: src/lib/course-adapter.ts
// 파일 명: course-adapter.ts
//
// buildTravelCourse()의 결과(우리 DB 기준)를 기존 UI 컴포넌트가 기대하는 형태로 변환.
//
// EditableItinerary 컴포넌트 실제 코드 확인 결과, place당 필요한 필드는
// id / name / region 세 개뿐이라 (category, summary, estimatedCost, mapUrl,
// imageUrl은 렌더링에 전혀 안 쓰임) — 이 어댑터는 그 세 필드만 만들어줌.
// "예상 비용" 카드(ResultsPage aside)는 별도로 totalEstimatedCost 등을 쓰는데,
// DB에 비용 필드가 없어서 이 값들은 0으로 두고 화면에서 "산정 불가"로 안내함.

import type { BuiltCourse, TravelerInput } from "@/lib/course-builder";

// mock-data.ts의 startRegions 목록 — 주소 문자열에서 지역명을 뽑아내기 위한 참고용
// (DB places 테이블에 별도 region 컬럼이 없어서 주소 문자열 매칭으로 추정)
const KNOWN_REGIONS = ["공주", "부여", "보령", "서천", "태안", "청양"];

function extractRegion(address: string | null | undefined): string {
  if (!address) return "충남";
  const found = KNOWN_REGIONS.find((r) => address.includes(r));
  return found ?? "충남";
}

// EditableItinerary가 기대하는 정확한 형태
export interface EditableItineraryDay {
  day: string;
  region: string;
  attractions: Array<{ id: string; name: string; region: string; nearbyEvents?: string[] }>;
}

export function adaptToEditableItineraryDays(built: BuiltCourse): EditableItineraryDay[] {
  const placeById = new Map(built.places.map((p: any) => [p.id, p]));

  return built.days.map((dayGroup) => {
    const firstPlace = placeById.get(dayGroup.stops[0]?.place_id);
    const dayRegion = extractRegion(firstPlace?.address);

    return {
      day: `Day ${dayGroup.day_number}`,
      region: dayRegion,
      attractions: dayGroup.stops.map((stop) => {
        const place = placeById.get(stop.place_id);
        const eventTitles = Array.from(
          new Set(
            (stop.nearby_events || [])
              .map((e: any) => e.events?.title)
              .filter(Boolean)
          )
        );
        return {
          id: stop.place_id,
          name: stop.place_name,
          region: extractRegion(place?.address),
          nearbyEvents: eventTitles.length > 0 ? eventTitles : undefined,
        };
      }),
    };
  });
}

// "예상 비용" 카드용 요약 — DB에 비용 데이터가 없어서 실제 금액은 계산하지 않고
// 조건 요약(title, interests 등)만 채워줌. 팀이 비용 데이터/계산 방식을 정하면
// totalEstimatedCost 등을 실제 값으로 교체하면 됨.
export interface CostSummary {
  title: string;
  interests: string;
  totalEstimatedCost: number;
  perPersonEstimatedCost: number;
  remainingBudget: number;
  costAvailable: boolean; // false면 화면에서 "산정 불가" 안내 표시용
}

export function adaptToCostSummary(
  built: BuiltCourse,
  traveler: TravelerInput,
  regions: string[]
): CostSummary {
  return {
    title: `${regions.join("-")} ${traveler.days}일 코스`,
    interests: traveler.focus || "선택 안 함",
    totalEstimatedCost: 0, // TODO: DB에 비용 필드 없음 — 팀 논의 필요
    perPersonEstimatedCost: 0,
    remainingBudget: 0,
    costAvailable: false,
  };
}