import { getAttractionById } from "@/lib/data";
import { createKakaoDirectionUrl, hasCoordinate } from "@/lib/kakao-map";
import { notFound } from "next/navigation";

type AttractionDetail = {
  id: string;
  name?: string;
  name_ko?: string;
  region?: string;
  category?: string;
  address?: string | null;
  summary?: string;
  overview?: string;
  source?: string;
  estimatedCost?: number;
  mapUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  firstimage?: string | null;
  imageUrl?: string | null;
  place_images?: Array<{
    image_url?: string | null;
    is_primary?: boolean | null;
  }> | null;
  place_tags?: Array<{
    tag?: string | null;
  }> | null;
  raw_data?: Record<string, unknown> | null;
};

type AttractionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

function getRawString(
  rawData: Record<string, unknown> | null | undefined,
  key: string,
  fallback = "",
) {
  const value = rawData?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getDetailImage(attraction: AttractionDetail) {
  return (
    attraction.imageUrl ??
    attraction.firstimage ??
    attraction.place_images?.find((image) => image.is_primary)?.image_url ??
    attraction.place_images?.find((image) => image.image_url)?.image_url ??
    getRawString(attraction.raw_data, "firstimage") ??
    undefined
  );
}

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { id } = await params;
  const attraction = await getAttractionById(id) as AttractionDetail | null;

  if (!attraction) {
    notFound();
  }

  const name = attraction.name ?? attraction.name_ko ?? "관광지";
  const category = attraction.category ?? attraction.place_tags?.[0]?.tag ?? "관광지";
  const region = attraction.region ?? attraction.address?.split(" ")[1] ?? "충남";
  const summary =
    attraction.summary ??
    attraction.overview ??
    getRawString(attraction.raw_data, "overview", "한국관광공사 TourAPI 기반 충남 관광지입니다.");
  const source = attraction.source ?? "Korea Tourism Organization TourAPI";
  const estimatedCost = attraction.estimatedCost ?? 0;
  const imageUrl = getDetailImage(attraction);
  const directionUrl = createKakaoDirectionUrl({
    name,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    address: attraction.address,
  });
  const hasMapCoordinate = hasCoordinate({
    name,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
  });

  return (
    <main className="page-shell">
      <p className="section-label">/attractions/{id}</p>
      <section className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-80 overflow-hidden rounded-lg bg-[#cbded7]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full min-h-80 w-full object-cover"
            />
          ) : (
            <div className="grid h-full min-h-80 place-items-center px-6 text-center text-xl font-black text-[#174d3c]">
              {name}
            </div>
          )}
        </div>
        <div className="soft-card rounded-lg p-6">
          <p className="text-sm font-semibold text-[#667165]">
            {region} · {category}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{name}</h1>
          <p className="mt-4 leading-7 text-[#4f5b52]">
            {summary}
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="text-[#667165]">주소</dt>
              <dd className="font-semibold">{attraction.address ?? "주소 정보 없음"}</dd>
            </div>
            <div>
              <dt className="text-[#667165]">예상 비용</dt>
              <dd className="font-semibold">입장/체험비 {estimatedCost.toLocaleString("ko-KR")}원</dd>
            </div>
            <div>
              <dt className="text-[#667165]">출처</dt>
              <dd className="font-semibold">{source}</dd>
            </div>
          </dl>
          <a
            href={directionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button mt-6"
          >
            카카오맵 길찾기
          </a>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#667165]">
            {hasMapCoordinate
              ? "좌표 기반 카카오맵 길찾기 링크를 새 탭으로 엽니다. 모바일에서는 카카오맵 앱 연결을 우선 사용합니다."
              : "좌표가 부족해 장소명 또는 주소 검색 링크로 연결합니다."}
          </p>
        </div>
      </section>
    </main>
  );
}
