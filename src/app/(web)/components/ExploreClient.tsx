"use client";

import { useMemo, useState } from "react";
import type { Attraction, Interest } from "@/lib/types";

type ExploreClientProps = {
  attractions: Attraction[];
  interests: Interest[];
};

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

export function ExploreClient({ attractions, interests }: ExploreClientProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체 지역");
  const [selectedTheme, setSelectedTheme] = useState("전체 테마");

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

  const resetFilters = () => {
    setKeyword("");
    setSelectedRegion("전체 지역");
    setSelectedTheme("전체 테마");
  };

  return (
    <>
      <section className="soft-card mt-6 rounded-lg p-4 sm:mt-8 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            className="field-control"
            placeholder="키워드 검색"
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
          <button type="button" className="primary-button border-0" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
        <p className="mt-3 text-sm font-bold text-[#2f7f8f]">
          검색 결과 {filteredAttractions.length.toLocaleString("ko-KR")}개
        </p>
      </section>

      {filteredAttractions.length > 0 ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAttractions.map((attraction) => {
            const score = getDisplayScore(attraction);

            return (
              <a
                key={attraction.id}
                href={`/attractions/${attraction.id}`}
                className="group soft-card overflow-hidden rounded-lg transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(23,33,27,0.12)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#dfe9e4]">
                  {attraction.imageUrl ? (
                    <img
                      src={attraction.imageUrl}
                      alt={attraction.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e7f0fb,#e7f5eb)] px-6 text-center">
                      <span className="text-lg font-black text-[#174d3c]">
                        {attraction.name}
                      </span>
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow-sm ${getScoreTone(
                      score,
                    )}`}
                  >
                    데이터 점수 {score}
                  </span>
                </div>

                <div className="grid min-h-[210px] gap-3 p-4 sm:p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#eef7f6] px-3 py-1 text-xs font-black text-[#236372]">
                      {attraction.region}
                    </span>
                    <span className="rounded-full bg-[#f7f8f6] px-3 py-1 text-xs font-black text-[#5d675f]">
                      {attraction.category}
                    </span>
                  </div>

                  <div>
                    <h2 className="line-clamp-2 text-lg font-black leading-6">
                      {attraction.name}
                    </h2>
                    {attraction.nameEn ? (
                      <p className="mt-1 line-clamp-1 text-xs font-bold text-[#667165]">
                        {attraction.nameEn}
                      </p>
                    ) : null}
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-[#4f5b52]">
                    {attraction.summary}
                  </p>

                  <div className="mt-auto grid gap-2 border-t border-[#e4e9e0] pt-3 text-xs font-bold text-[#667165]">
                    <p className="line-clamp-1">{attraction.address}</p>
                    <p className="text-[#2f7f8f]">상세 정보 보기</p>
                  </div>
                </div>
              </a>
            );
          })}
        </section>
      ) : (
        <section className="soft-card mt-6 rounded-lg p-6 text-sm text-[#667165]">
          조건에 맞는 관광지가 없습니다. 필터를 초기화하거나 다른 키워드를 입력해보세요.
        </section>
      )}
    </>
  );
}
