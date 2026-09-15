"use client";

import { useMemo, useState } from "react";
import type { Attraction, Interest } from "@/lib/types";

type ExploreClientProps = {
  attractions: Attraction[];
  interests: Interest[];
  initialFilters?: {
    keyword?: string;
    region?: string;
    theme?: string;
    data?: DataFilterOption;
    available?: "today";
    event?: "this-week";
  };
};

type SortOption = "score_desc" | "name_asc" | "region_asc" | "category_asc";
type DataFilterOption = "all" | "with_image" | "with_coordinate";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "score_desc", label: "데이터 점수 높은순" },
  { value: "name_asc", label: "이름순" },
  { value: "region_asc", label: "지역순" },
  { value: "category_asc", label: "카테고리순" },
];

const dataFilterOptions: { value: DataFilterOption; label: string }[] = [
  { value: "all", label: "전체 데이터" },
  { value: "with_image", label: "이미지 있는 곳" },
  { value: "with_coordinate", label: "좌표 있는 곳" },
];

const koCollator = new Intl.Collator("ko-KR", {
  numeric: true,
  sensitivity: "base",
});

function getDisplayScore(attraction: Attraction) {
  if (typeof attraction.dataCompletenessScore === "number") {
    return Math.max(0, Math.min(Math.round(attraction.dataCompletenessScore), 100));
  }

  let score = 40;

  if (attraction.imageUrl) score += 20;
  if (attraction.address && attraction.address !== "주소 정보 없음") score += 15;
  if (attraction.latitude && attraction.longitude) score += 15;
  if (attraction.nameEn || attraction.addressEn) score += 10;

  return Math.min(score, 100);
}

function getScoreTone(score: number) {
  if (score >= 80) return "bg-[#e7f5eb] text-[#236d3c]";
  if (score >= 60) return "bg-[#e7f0fb] text-[#236372]";
  return "bg-[#fbf0dd] text-[#9a6614]";
}

function compareText(a: string | null | undefined, b: string | null | undefined) {
  return koCollator.compare(a ?? "", b ?? "");
}

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

export function ExploreClient({ attractions, interests, initialFilters }: ExploreClientProps) {
  const [keyword, setKeyword] = useState(initialFilters?.keyword ?? "");
  const [selectedRegion, setSelectedRegion] = useState(
    initialFilters?.region ?? "전체 지역",
  );
  const [selectedTheme, setSelectedTheme] = useState(initialFilters?.theme ?? "전체 테마");
  const [sortOption, setSortOption] = useState<SortOption>("score_desc");
  const [dataFilter, setDataFilter] = useState<DataFilterOption>(
    initialFilters?.data ?? "all",
  );
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(
    initialFilters?.available === "today",
  );
  const [onlyThisWeekEvent, setOnlyThisWeekEvent] = useState(
    initialFilters?.event === "this-week",
  );
  const [visibleCount, setVisibleCount] = useState(8);

  const regions = useMemo(
    () =>
      Array.from(
        new Set(attractions.map((attraction) => attraction.region).filter(Boolean)),
      ).sort(),
    [attractions],
  );

  const filteredAttractions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return attractions.filter((attraction) => {
      const matchesKeyword =
        !normalizedKeyword ||
        attraction.name.toLowerCase().includes(normalizedKeyword) ||
        attraction.address.toLowerCase().includes(normalizedKeyword) ||
        attraction.category.toLowerCase().includes(normalizedKeyword);
      const matchesRegion =
        selectedRegion === "전체 지역" || attraction.region === selectedRegion;
      const matchesTheme =
        selectedTheme === "전체 테마" || attraction.category.includes(selectedTheme);
      const matchesDataFilter =
        dataFilter === "all" ||
        (dataFilter === "with_image" && Boolean(attraction.imageUrl)) ||
        (dataFilter === "with_coordinate" &&
          Boolean(attraction.latitude && attraction.longitude));
      const matchesAvailableToday =
        !onlyAvailableToday || attraction.operationStatus === "available_today";
      const matchesThisWeekEvent =
        !onlyThisWeekEvent || attraction.hasThisWeekEvent === true;

      return (
        matchesKeyword &&
        matchesRegion &&
        matchesTheme &&
        matchesDataFilter &&
        matchesAvailableToday &&
        matchesThisWeekEvent
      );
    });
  }, [
    attractions,
    dataFilter,
    keyword,
    onlyAvailableToday,
    onlyThisWeekEvent,
    selectedRegion,
    selectedTheme,
  ]);

  const sortedAttractions = useMemo(() => {
    return [...filteredAttractions].sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return compareText(a.name, b.name);
        case "region_asc":
          return compareText(a.region, b.region) || compareText(a.name, b.name);
        case "category_asc":
          return compareText(a.category, b.category) || compareText(a.name, b.name);
        case "score_desc":
        default:
          return getDisplayScore(b) - getDisplayScore(a) || compareText(a.name, b.name);
      }
    });
  }, [filteredAttractions, sortOption]);

  const highlightedAttractions = sortedAttractions.slice(0, visibleCount);
  const canShowMore = visibleCount < sortedAttractions.length;
  const availableTodayCount = attractions.filter(
    (attraction) => attraction.operationStatus === "available_today",
  ).length;
  const thisWeekEventCount = attractions.filter(
    (attraction) => attraction.hasThisWeekEvent,
  ).length;
  const imageCount = attractions.filter((attraction) => attraction.imageUrl).length;
  const coordinateCount = attractions.filter(
    (attraction) => attraction.latitude && attraction.longitude,
  ).length;
  const activeFilterLabels = [
    keyword.trim() ? `키워드: ${keyword.trim()}` : null,
    selectedRegion !== "전체 지역" ? selectedRegion : null,
    selectedTheme !== "전체 테마" ? selectedTheme : null,
    onlyAvailableToday ? "오늘 방문 가능" : null,
    onlyThisWeekEvent ? "이번 주 행사" : null,
    dataFilter === "with_image" ? "이미지 있음" : null,
    dataFilter === "with_coordinate" ? "좌표 있음" : null,
  ].filter(Boolean);

  const resetFilters = () => {
    setKeyword("");
    setSelectedRegion("전체 지역");
    setSelectedTheme("전체 테마");
    setSortOption("score_desc");
    setDataFilter("all");
    setOnlyAvailableToday(false);
    setOnlyThisWeekEvent(false);
    setVisibleCount(8);
  };

  const hasAnyOperationInfo = attractions.some((attraction) => attraction.hasOperationInfo);
  const hasAnyThisWeekEvent = attractions.some((attraction) => attraction.hasThisWeekEvent);
  const emptyMessage = onlyThisWeekEvent
    ? "이번 주 행사와 연결된 관광지 데이터가 아직 부족합니다. 행사 데이터가 더 연결되면 이 필터에서 바로 확인할 수 있습니다."
    : onlyAvailableToday
      ? "오늘 운영이 확인된 관광지가 없습니다. 운영정보가 부족한 장소는 방문 전 확인이 필요합니다."
      : "조건에 맞는 관광지가 없습니다. 필터를 초기화하거나 다른 키워드를 입력해보세요.";

  return (
    <>
      <section className="soft-card mt-6 rounded-lg p-4 sm:mt-8 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <input
            className="field-control"
            placeholder="키워드 검색"
            aria-label="키워드 검색"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setVisibleCount(8);
            }}
          />
          <select
            className="field-control"
            value={selectedRegion}
            onChange={(event) => {
              setSelectedRegion(event.target.value);
              setVisibleCount(8);
            }}
          >
            <option>전체 지역</option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
          <select
            className="field-control"
            value={selectedTheme}
            onChange={(event) => {
              setSelectedTheme(event.target.value);
              setVisibleCount(8);
            }}
          >
            <option>전체 테마</option>
            {interests.map((interest) => (
              <option key={interest}>{interest}</option>
            ))}
          </select>
          <select
            className="field-control"
            value={sortOption}
            aria-label="정렬 기준"
            onChange={(event) => {
              setSortOption(event.target.value as SortOption);
              setVisibleCount(8);
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" className="primary-button border-0" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_1fr]">
          <button
            type="button"
            aria-pressed={onlyAvailableToday}
            className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
              onlyAvailableToday
                ? "border-[#174d3c] bg-[#174d3c] text-white"
                : "border-[#dce2d7] bg-white text-[#3d4941] hover:border-[#174d3c]"
            }`}
            onClick={() => {
              setOnlyAvailableToday((value) => !value);
              setVisibleCount(8);
            }}
          >
            <span className="flex items-center justify-between gap-3">
              오늘 갈 수 있는 곳
              <span className="rounded-md bg-white/20 px-2 py-1 text-xs">
                {formatCount(availableTodayCount)}
              </span>
            </span>
            <span className="mt-1 block text-xs font-bold opacity-80">
              {hasAnyOperationInfo
                ? "운영정보가 확인된 장소만 보기"
                : "운영정보 데이터가 부족합니다"}
            </span>
          </button>
          <button
            type="button"
            aria-pressed={onlyThisWeekEvent}
            className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
              onlyThisWeekEvent
                ? "border-[#2f7f8f] bg-[#2f7f8f] text-white"
                : "border-[#dce2d7] bg-white text-[#3d4941] hover:border-[#2f7f8f]"
            }`}
            onClick={() => {
              setOnlyThisWeekEvent((value) => !value);
              setVisibleCount(8);
            }}
          >
            <span className="flex items-center justify-between gap-3">
              이번 주 행사
              <span className="rounded-md bg-white/20 px-2 py-1 text-xs">
                {formatCount(thisWeekEventCount)}
              </span>
            </span>
            <span className="mt-1 block text-xs font-bold opacity-80">
              {hasAnyThisWeekEvent
                ? "행사 지역과 연결된 관광지만 보기"
                : "연결된 행사 데이터가 부족합니다"}
            </span>
          </button>
          <select
            className="field-control h-full"
            value={dataFilter}
            aria-label="데이터 보유 상태"
            onChange={(event) => {
              setDataFilter(event.target.value as DataFilterOption);
              setVisibleCount(8);
            }}
          >
            {dataFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-2 text-sm font-bold text-[#5d675f] sm:grid-cols-3">
          <span className="rounded-md bg-[#f7f8f5] px-3 py-2">
            이미지 {formatCount(imageCount)}개
          </span>
          <span className="rounded-md bg-[#f7f8f5] px-3 py-2">
            좌표 {formatCount(coordinateCount)}개
          </span>
          <span className="rounded-md bg-[#f7f8f5] px-3 py-2">
            운영정보 {formatCount(attractions.filter((item) => item.hasOperationInfo).length)}개
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="text-[#2f7f8f]">
            검색 결과 {formatCount(filteredAttractions.length)}개 ·{" "}
            {sortOptions.find((option) => option.value === sortOption)?.label}
          </span>
          {activeFilterLabels.map((label) => (
            <span
              key={label}
              className="rounded-md bg-[#eef6f2] px-2.5 py-1 text-xs text-[#174d3c]"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {sortedAttractions.length > 0 ? (
        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#17211b]">더 많은 관광지 보기</h2>
              <p className="mt-1 text-sm font-bold text-[#5d675f]">
                현재 필터 조건에 맞는 관광지를 이미지 중심으로 빠르게 훑어보세요.
              </p>
            </div>
            <p className="text-sm font-black text-[#2f7f8f]">
              {highlightedAttractions.length.toLocaleString("ko-KR")} /{" "}
              {sortedAttractions.length.toLocaleString("ko-KR")}개 표시
            </p>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto border-b border-[#dce2d7] pb-2">
            {["전체 지역", ...regions].map((region) => {
              const isActive = selectedRegion === region;

              return (
                <button
                  key={region}
                  type="button"
                  className={`shrink-0 border-b-2 px-3 py-2 text-sm font-black transition ${
                    isActive
                      ? "border-[#2f7f8f] text-[#2f7f8f]"
                      : "border-transparent text-[#3d4941] hover:text-[#174d3c]"
                  }`}
                  onClick={() => {
                    setSelectedRegion(region);
                    setVisibleCount(8);
                  }}
                >
                  {region.replace("전체 지역", "전체")}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {highlightedAttractions.map((attraction) => {
              const score = getDisplayScore(attraction);
              const statusLabel = attraction.hasThisWeekEvent
                ? attraction.eventLabel ?? "이번 주 행사"
                : attraction.operationLabel ?? "운영정보 확인 필요";

              return (
                <a
                  key={`highlight-${attraction.id}`}
                  href={`/attractions/${attraction.id}`}
                  className="group relative aspect-[16/9] overflow-hidden rounded-lg bg-[#dfe9e4] shadow-[0_10px_30px_rgba(23,33,27,0.08)]"
                >
                  {attraction.imageUrl ? (
                    <img
                      src={attraction.imageUrl}
                      alt={attraction.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,#e7f0fb,#e7f5eb)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-black ${getScoreTone(score)}`}>
                      데이터 점수 {score}
                    </span>
                    {attraction.operationStatus === "available_today" ? (
                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-[#174d3c]">
                        오늘 가능
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="line-clamp-2 font-black leading-6 drop-shadow">
                      {attraction.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm font-bold text-white/90">
                      {attraction.region} · {attraction.category} · 데이터 점수 {score}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-white/80">
                      {statusLabel}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {canShowMore ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                className="min-h-11 w-full max-w-sm rounded-md border border-[#2f7f8f] bg-white px-5 py-3 text-sm font-black text-[#2f7f8f] transition hover:bg-[#eef7f6]"
                onClick={() => setVisibleCount((count) => count + 8)}
              >
                더 보기
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {filteredAttractions.length === 0 ? (
        <section className="soft-card mt-6 rounded-lg p-6">
          <h2 className="text-xl font-black text-[#17211b]">조건에 맞는 결과가 없습니다.</h2>
          <p className="mt-3 text-sm leading-6 text-[#667165]">{emptyMessage}</p>
          <button type="button" className="primary-button mt-5 border-0" onClick={resetFilters}>
            전체 관광지 다시 보기
          </button>
        </section>
      ) : null}
    </>
  );
}
