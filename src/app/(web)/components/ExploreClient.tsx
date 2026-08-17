"use client";

import { useMemo, useState } from "react";
import type { Attraction, Interest } from "@/lib/types";

type ExploreClientProps = {
  attractions: Attraction[];
  interests: Interest[];
};

type SortOption = "score_desc" | "name_asc" | "region_asc" | "category_asc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "score_desc", label: "데이터 점수 높은순" },
  { value: "name_asc", label: "이름순" },
  { value: "region_asc", label: "지역순" },
  { value: "category_asc", label: "카테고리순" },
];

const koCollator = new Intl.Collator("ko-KR", {
  numeric: true,
  sensitivity: "base",
});

function getDisplayScore(attraction: Attraction) {
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

export function ExploreClient({ attractions, interests }: ExploreClientProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체 지역");
  const [selectedTheme, setSelectedTheme] = useState("전체 테마");
  const [sortOption, setSortOption] = useState<SortOption>("score_desc");
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

      return matchesKeyword && matchesRegion && matchesTheme;
    });
  }, [attractions, keyword, selectedRegion, selectedTheme]);

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

  const resetFilters = () => {
    setKeyword("");
    setSelectedRegion("전체 지역");
    setSelectedTheme("전체 테마");
    setSortOption("score_desc");
    setVisibleCount(8);
  };

  return (
    <>
      <section className="soft-card mt-6 rounded-lg p-4 sm:mt-8 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <input
            className="field-control"
            placeholder="키워드 검색"
            aria-label="키워드 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            className="field-control"
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
          >
            <option>전체 지역</option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
          <select
            className="field-control"
            value={selectedTheme}
            onChange={(event) => setSelectedTheme(event.target.value)}
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
            onChange={(event) => setSortOption(event.target.value as SortOption)}
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
        <p className="mt-3 text-sm font-bold text-[#2f7f8f]">
          검색 결과 {filteredAttractions.length.toLocaleString("ko-KR")}개 ·{" "}
          {sortOptions.find((option) => option.value === sortOption)?.label}
        </p>
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
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="line-clamp-2 font-black leading-6 drop-shadow">
                      {attraction.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm font-bold text-white/90">
                      {attraction.region} · {attraction.category} · 데이터 점수 {score}
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
        <section className="soft-card mt-6 rounded-lg p-6 text-sm text-[#667165]">
          조건에 맞는 관광지가 없습니다. 필터를 초기화하거나 다른 키워드를 입력해보세요.
        </section>
      ) : null}
    </>
  );
}
