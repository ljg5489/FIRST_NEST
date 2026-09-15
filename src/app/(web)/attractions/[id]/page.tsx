import { getAttractionById } from "@/lib/data";
import { createKakaoDirectionUrl, hasCoordinate } from "@/lib/kakao-map";
import { notFound } from "next/navigation";

type AttractionDetail = {
  id: string;
  name?: string;
  name_ko?: string;
  region?: string;
  category?: string;
  category_code?: string;
  description?: string;
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
  place_facilities?: Array<{
    facility_type?: string | null;
    is_available?: boolean | null;
    details?: string | null;
  }> | null;
  activeEvents?: Array<{
    start_date?: string | null;
    end_date?: string | null;
    fee_info?: string | null;
    booking_url?: string | null;
    events?: {
      id?: string | null;
      title?: string | null;
      first_image_url?: string | null;
      event_images?: Array<{
        image_url?: string | null;
      }> | null;
    } | null;
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

function getRawDetail(attraction: AttractionDetail, keys: string[]) {
  for (const key of keys) {
    const value = getRawString(attraction.raw_data, key);

    if (value) {
      return value;
    }
  }

  return "";
}

function getUrlFromText(value: string) {
  const match = value.match(/https?:\/\/[^"'<>\s]+/);

  return match?.[0] ?? "";
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "일정 확인 필요";
  }

  return date.replaceAll("-", ".");
}

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { id } = await params;
  const attraction = await getAttractionById(id) as AttractionDetail | null;

  if (!attraction) {
    notFound();
  }

  const name = attraction.name ?? attraction.name_ko ?? "관광지";
  const labels: Record<string,string> = {HS:"역사",NA:"자연",EX:"체험",VE:"문화",FD:"음식",AC:"숙박",SH:"쇼핑",LS:"레저",EV:"축제"};
  const category = attraction.category ?? labels[(attraction.category_code || "").slice(0,2)] ?? "여행지";
  const region = (attraction.region ?? attraction.address?.split(" ")[1] ?? "충남").replace(/(시|군)$/, "");
  const summary =
    attraction.summary ?? attraction.description ??
    attraction.overview ??
    getRawString(attraction.raw_data, "overview", "한국관광공사 TourAPI 기반 충남 관광지입니다.");
  const source = attraction.source ?? "Korea Tourism Organization TourAPI";
  const estimatedCost = attraction.estimatedCost ?? 0;
  const imageUrl = getDetailImage(attraction);
  const tags = Array.from(
    new Set(
      (attraction.place_tags ?? [])
        .map((tag) => tag.tag)
        .filter((tag): tag is string => Boolean(tag)),
    ),
  ).slice(0, 8);
  const facilities = (attraction.place_facilities ?? [])
    .filter((facility) => facility.facility_type)
    .slice(0, 6);
  const events = (attraction.activeEvents ?? []).slice(0, 3);
  const usageTime = getRawDetail(attraction, [
    "usetime",
    "usetimeculture",
    "usetimeleports",
    "usetimefestival",
  ]);
  const restDate = getRawDetail(attraction, [
    "restdate",
    "restdateculture",
    "restdateleports",
  ]);
  const tel = getRawDetail(attraction, ["tel", "infocenter", "infocenterculture"]);
  const homepage = getUrlFromText(getRawDetail(attraction, ["homepage"]));
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
    <main className="page-shell attraction-detail">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav className="detail-breadcrumb" aria-label="현재 위치"><a href="/explore">여행지 탐색</a><span>›</span><span>{region}</span></nav>
          <h1 className="mt-2 break-keep text-3xl font-black text-[#17211b] sm:text-4xl">
            {name}
          </h1>
        </div>
        <a
          href={`/explore?region=${encodeURIComponent(region)}&theme=${encodeURIComponent(category)}`}
          className="inline-flex min-h-10 items-center rounded-md border border-[#dce2d7] bg-white px-4 text-sm font-black text-[#174d3c] transition hover:border-[#174d3c]"
        >
          비슷한 장소 보기
        </a>
      </div>

      <section className="detail-layout mt-6">
        <div className="detail-photo">
          {imageUrl ? (
            <img
              src={imageUrl.replace(/^http:/, "https:")}
              alt={name}
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto lg:min-h-[520px]"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center px-6 text-center text-xl font-black text-[#174d3c] lg:min-h-[520px]">
              {name}
            </div>
          )}
        </div>
        <div className="detail-info">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-[#eef6f2] px-3 py-2 text-sm font-black text-[#174d3c]">
              {region}
            </span>
            <span className="rounded-md bg-[#eff7f8] px-3 py-2 text-sm font-black text-[#2f7f8f]">
              {category}
            </span>
            <span className="rounded-md bg-[#f7f8f5] px-3 py-2 text-sm font-black text-[#5d675f]">
              {hasMapCoordinate ? "지도에서 위치 보기" : "위치 확인 필요"}
            </span>
          </div>
          <p className="mt-4 leading-7 text-[#4f5b52]">
            {summary.replace(/<[^>]*>/g, " ")}
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-[#f7f8f5] p-4">
              <dt className="text-[#667165]">주소</dt>
              <dd className="mt-1 font-bold">{attraction.address ?? "주소 정보 없음"}</dd>
            </div>
            <div className="rounded-md bg-[#f7f8f5] p-4">
              <dt className="text-[#667165]">예상 비용</dt>
              <dd className="mt-1 font-bold">
                {estimatedCost > 0
                  ? `입장/체험비 ${estimatedCost.toLocaleString("ko-KR")}원`
                  : "장소별 이용 요금을 확인해 주세요"}
              </dd>
            </div>
            <div className="rounded-md bg-[#f7f8f5] p-4">
              <dt className="text-[#667165]">운영시간</dt>
              <dd className="mt-1 font-bold">{usageTime || "운영정보 확인 필요"}</dd>
            </div>
            <div className="rounded-md bg-[#f7f8f5] p-4">
              <dt className="text-[#667165]">휴무일</dt>
              <dd className="mt-1 font-bold">{restDate || "휴무정보 확인 필요"}</dd>
            </div>
            <div className="rounded-md bg-[#f7f8f5] p-4">
              <dt className="text-[#667165]">문의</dt>
              <dd className="mt-1 font-bold">{tel || "문의처 데이터 없음"}</dd>
            </div>
            <div className="rounded-md bg-[#f7f8f5] p-4">
              <dt className="text-[#667165]">출처</dt>
              <dd className="mt-1 font-bold">{source}</dd>
            </div>
          </dl>

          {tags.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-black text-[#17211b]">태그</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[#dce2d7] bg-white px-3 py-2 text-sm font-bold text-[#3d4941]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href={directionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button w-full sm:w-auto"
            >
              카카오맵 길찾기
            </a>
            {homepage ? (
              <a
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#dce2d7] bg-white px-5 py-3 text-sm font-black text-[#174d3c]"
              >
                공식 정보 보기
              </a>
            ) : null}
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#667165]">
            {hasMapCoordinate
              ? "카카오맵에서 위치와 이동 경로를 확인할 수 있어요."
              : "카카오맵에서 장소를 검색해 위치를 확인해 주세요."}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="soft-card rounded-lg p-5">
          <h2 className="text-xl font-black">편의 정보</h2>
          {facilities.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {facilities.map((facility, index) => (
                <div key={`${facility.facility_type}-${index}`} className="rounded-md bg-[#f7f8f5] p-4">
                  <p className="font-black">{facility.facility_type}</p>
                  <p className="mt-1 text-sm font-bold text-[#5d675f]">
                    {facility.is_available === false ? "확인 필요" : "이용 가능"}
                  </p>
                  {facility.details ? (
                    <p className="mt-2 text-sm leading-6 text-[#667165]">{facility.details}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-[#f7f8f5] p-4 text-sm font-semibold leading-6 text-[#667165]">
              편의시설 데이터가 아직 부족합니다. 방문 전 공식 정보 확인이 필요합니다.
            </p>
          )}
        </div>

        <div className="soft-card rounded-lg p-5">
          <h2 className="text-xl font-black">주변 행사</h2>
          {events.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {events.map((event, index) => (
                <div key={event.events?.id ?? index} className="rounded-md bg-[#f7f8f5] p-4">
                  <p className="font-black">{event.events?.title ?? "행사명 확인 필요"}</p>
                  <p className="mt-1 text-sm font-bold text-[#5d675f]">
                    {formatDate(event.start_date)} ~ {formatDate(event.end_date)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#667165]">
                    {event.fee_info || "요금 정보 확인 필요"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-[#f7f8f5] p-4 text-sm font-semibold leading-6 text-[#667165]">
              이 관광지와 연결된 진행/예정 행사가 아직 없습니다.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}