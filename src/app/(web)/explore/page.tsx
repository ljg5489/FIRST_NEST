import { getAttractions, getTravelConditionOptions } from "@/lib/data";
import type { Attraction } from "@/lib/types";
import { ExploreClient } from "../components/ExploreClient";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const [attractions, options] = await Promise.all([
    getAttractions(),
    getTravelConditionOptions(),
  ]);

  const exploreAttractions: Attraction[] = attractions.map((place) => ({
    id: place.id,
    name: place.name_ko,
    region: place.address?.split(" ")[1] ?? "충남",
    category: place.place_tags?.[0]?.tag ?? "관광지",
    address: place.address ?? "주소 정보 없음",
    summary: "한국관광공사 TourAPI 기반 충남 관광지입니다.",
    source: "Korea Tourism Organization TourAPI",
    estimatedCost: 0,
    mapUrl: `https://map.kakao.com/link/search/${encodeURIComponent(place.name_ko)}`,
    latitude: place.latitude,
    longitude: place.longitude,
    imageUrl: place.place_images?.[0]?.image_url,
  }));

  return (
    <main className="page-shell">
      <p className="section-label">/explore</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">관광지 탐색</h1>
      <p className="mt-3 max-w-2xl text-[#4f5b52]">
        지역, 테마, 키워드 기준으로 충남 관광지를 카드 목록에서 확인하는 화면입니다.
        데이터 점수는 이미지, 주소, 좌표, 다국어 정보 보유 여부를 기준으로 임시 표시합니다.
      </p>
      <p className="mt-2 text-sm font-bold text-[#2f7f8f]">
        현재 표시 데이터 {exploreAttractions.length.toLocaleString("ko-KR")}개
      </p>
      <ExploreClient attractions={exploreAttractions} interests={options.interests} />
    </main>
  );
}
