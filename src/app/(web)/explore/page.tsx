import { getAttractions, getFestivals, getTravelConditionOptions } from "@/lib/data";
import type { Attraction } from "@/lib/types";
import { ExploreClient } from "../components/ExploreClient";

export const dynamic = "force-dynamic";

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getRegionFromAddress(address: string | null | undefined, fallback = "충남") {
  return address?.split(" ")[1] ?? fallback;
}

function getRawText(place: any, key: string, fallback = "") {
  return getText(place.raw_data?.[key], fallback);
}

function getOperationInfo(place: any) {
  const operationHours =
    getText(place.opening_hours) ||
    getRawText(place, "usetime") ||
    getRawText(place, "usetimeculture") ||
    getRawText(place, "usetimeleports") ||
    getRawText(place, "usetimefestival");
  const closedDays =
    getText(place.closed_days) ||
    getRawText(place, "restdate") ||
    getRawText(place, "restdateculture") ||
    getRawText(place, "restdateleports");
  const hasOperationInfo = Boolean(operationHours || closedDays);

  if (!hasOperationInfo) {
    return {
      hasOperationInfo: false,
      operationStatus: "unknown" as const,
      operationLabel: "운영정보 확인 필요",
      operationNotice: "운영정보 데이터가 부족해 방문 전 확인이 필요합니다.",
      operationHours: null,
    };
  }

  const todayName = dayNames[new Date().getDay()];
  const normalizedClosedDays = closedDays.replace(/\s/g, "");
  const isAlwaysOpen =
    normalizedClosedDays.includes("연중무휴") ||
    normalizedClosedDays.includes("휴무없음") ||
    normalizedClosedDays.includes("없음");
  const isClosedToday =
    !isAlwaysOpen &&
    (normalizedClosedDays.includes(`${todayName}요일`) ||
      normalizedClosedDays.includes(`매주${todayName}`) ||
      normalizedClosedDays.includes(`${todayName}휴무`));

  if (isClosedToday) {
    return {
      hasOperationInfo: true,
      operationStatus: "closed_today" as const,
      operationLabel: "오늘 휴무 가능성",
      operationNotice: `${todayName}요일 휴무 정보가 있어 방문 전 확인이 필요합니다.`,
      operationHours,
    };
  }

  return {
    hasOperationInfo: true,
    operationStatus: "available_today" as const,
    operationLabel: "오늘 방문 가능",
    operationNotice: operationHours || "운영정보가 확인된 관광지입니다.",
    operationHours,
  };
}

function isThisWeekEvent(event: any) {
  const startDate = getText(event.event_start_date);
  const endDate = getText(event.event_end_date);

  if (!startDate || !endDate) {
    return false;
  }

  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 6);

  return new Date(startDate) <= weekEnd && new Date(endDate) >= today;
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const [attractions, options, festivals] = await Promise.all([
    getAttractions(),
    getTravelConditionOptions(),
    getFestivals().catch(() => []),
  ]);
  const eventRegions = new Set(
    (festivals as any[])
      .filter(isThisWeekEvent)
      .map((event) => getRegionFromAddress(event.address, "").replace(/(시|군)$/, ""))
      .filter(Boolean),
  );

  const exploreAttractions: Attraction[] = attractions.map((place: any) => {
    const name = place.name_ko ?? place.name ?? "관광지";
    const address = place.address ?? "주소 정보 없음";
    const region = (place.region ?? getRegionFromAddress(place.address, "충남")).replace(/(시|군)$/, '');
    const categoryLabels: Record<string,string> = {HS:'역사',NA:'자연',EX:'체험',VE:'문화',FD:'음식',AC:'숙박',SH:'쇼핑',LS:'레저',EV:'축제'};
    const category = categoryLabels[(place.category_code || '').slice(0,2)] ?? place.category ?? '여행지';
    const operationInfo = getOperationInfo(place);
    const hasThisWeekEvent = eventRegions.has(region);

    return {
      id: place.id,
      name,
      nameEn: place.name_en ?? place.nameEn,
      region,
      category,
      address,
      addressEn: place.address_en ?? place.addressEn,
      summary:
        place.summary ??
        place.description ??
        getRawText(place, "overview", "한국관광공사 TourAPI 기반 충남 관광지입니다."),
      source: "Korea Tourism Organization TourAPI",
      estimatedCost: place.estimatedCost ?? 0,
      mapUrl: place.mapUrl ?? `https://map.kakao.com/link/search/${encodeURIComponent(name)}`,
      latitude: place.latitude,
      longitude: place.longitude,
      imageUrl: place.imageUrl ?? place.place_images?.[0]?.image_url,
      dataCompletenessScore: place.data_completeness_score ?? null,
      ...operationInfo,
      hasThisWeekEvent,
      eventLabel: hasThisWeekEvent ? `${region} 이번 주 행사` : null,
    };
  });

  return (
    <main className="page-shell">
      <div className="page-heading"><p className="eyebrow">FIND YOUR NEXT PLACE</p><h1>마음이 가는 곳을 찾아보세요.</h1><p>익숙한 동네부터 처음 만나는 풍경까지, 충남의 다양한 여행지.</p></div>
      <ExploreClient
        attractions={exploreAttractions}
        interests={options.interests}
        initialFilters={{
          keyword: getSearchParam(params, "keyword"),
          region: getSearchParam(params, "region"),
          theme: getSearchParam(params, "theme"),
          data:
            getSearchParam(params, "data") === "with_image" ||
            getSearchParam(params, "data") === "with_coordinate"
              ? (getSearchParam(params, "data") as "with_image" | "with_coordinate")
              : undefined,
          available: getSearchParam(params, "available") === "today" ? "today" : undefined,
          event:
            getSearchParam(params, "event") === "this-week" ? "this-week" : undefined,
        }}
      />
    </main>
  );
}
