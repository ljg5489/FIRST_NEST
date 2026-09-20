// 파일 위치: src/app/(web)/explore/page.tsx
// 파일 명: page.tsx

import { getAttractions, getFestivals, getTravelConditionOptions } from "@/lib/data";
import { getPlaceOperationInfo } from "@/lib/place-operation-info";
import type { Attraction } from "@/lib/types";
import { ExploreClient } from "../components/ExploreClient";
import {getServerLocale} from "@/features/i18n/server";
import {translate} from "@/features/i18n/messages";

export const dynamic = "force-dynamic";

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
  const [attractions, options, festivals, locale] = await Promise.all([
    getAttractions(),
    getTravelConditionOptions(),
    getFestivals().catch(() => []),
    getServerLocale(),
  ]);
  const t=(source:string)=>translate(locale,source);
  const eventRegions = new Set(
    (festivals as any[])
      .filter(isThisWeekEvent)
      .map((event) => getRegionFromAddress(event.address, "").replace(/(시|군)$/, ""))
      .filter(Boolean),
  );

  const exploreAttractions: Attraction[] = attractions.map((place: any) => {
    const name = locale === 'ko' ? (place.name_ko ?? place.name ?? t("관광지")) : (place.name_en ?? place.name_ko ?? place.name ?? t("관광지"));
    const address = locale === 'ko' ? (place.address ?? t("주소 정보 없음")) : (place.address_en ?? place.address ?? t("주소 정보 없음"));
    const region = (place.region ?? getRegionFromAddress(place.address, "충남")).replace(/(시|군)$/, '');
    const categoryLabels: Record<string,string> = {HS:'역사',NA:'자연',EX:'체험',VE:'문화',FD:'음식',AC:'숙박',SH:'쇼핑',LS:'레저',EV:'축제'};
    const category = categoryLabels[(place.category_code || '').slice(0,2)] ?? place.category ?? '여행지';
    const operationInfo = getPlaceOperationInfo(place);
    const hasThisWeekEvent = eventRegions.has(region);

    return {
      id: place.id,
      name,
      nameEn: place.name_en ?? place.nameEn,
      region,
      category,
      address,
      addressEn: place.address_en ?? place.addressEn,
      summary: locale === 'ko' ? (place.summary ?? place.description ?? getRawText(place, "overview", t("한국관광공사 TourAPI 기반 충남 관광지입니다."))) : t("한국관광공사 TourAPI 기반 충남 관광지입니다."),
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
      <div className="page-heading"><p className="eyebrow">FIND YOUR NEXT PLACE</p><h1>{t("마음이 가는 곳을 찾아보세요.")}</h1><p>{t("익숙한 동네부터 처음 만나는 풍경까지, 충남의 다양한 여행지.")}</p></div>
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
