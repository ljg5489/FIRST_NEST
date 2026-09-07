import { getRecommendedCourseWithAttractions } from "@/lib/data";
import { createKakaoDirectionUrl } from "@/lib/kakao-map";
import KakaoMap, { type KakaoMapPlace } from "@/features/map/ui/KakaoMap";

type RoutePlace = KakaoMapPlace & {
  mapUrl?: string;
};

type MapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function getPlaceName(place: RoutePlace) {
  return place.name ?? place.name_ko ?? place.title ?? "관광지";
}

function getPlaceAddress(place: RoutePlace) {
  return place.address ?? "주소 정보 없음";
}

function getPlaceDirectionUrl(place: RoutePlace) {
  return createKakaoDirectionUrl({
    name: getPlaceName(place),
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
  });
}

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function getMultiParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value.join(", ") : value;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const course = await getRecommendedCourseWithAttractions();
  const route: RoutePlace[] = course.days.flatMap((day) => day.attractions);
  const firstRoute = route[0];
  const firstDirectionUrl = firstRoute
    ? getPlaceDirectionUrl(firstRoute)
    : "https://map.kakao.com";
  const conditionSummary = [
    getSingleParam(params, "tripDays"),
    getSingleParam(params, "people")
      ? `${getSingleParam(params, "people")}명`
      : null,
    getSingleParam(params, "transport"),
    getMultiParam(params, "interests"),
  ].filter(Boolean);

  return (
    <main className="page-shell">
      <p className="section-label">/map</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">지도/동선 확인</h1>
      <p className="mt-3 max-w-2xl text-[#4f5b52]">
        추천 코스에 포함된 관광지를 Kakao Map 위에 표시하고, 실제 이동 안내는 카카오맵 외부 링크로 연결합니다.
      </p>
      {conditionSummary.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {conditionSummary.map((condition) => (
            <span
              key={condition}
              className="rounded-md bg-[#eef6f2] px-3 py-2 text-sm font-black text-[#174d3c]"
            >
              {condition}
            </span>
          ))}
        </div>
      ) : null}

      <section className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[1fr_0.45fr]">
        <KakaoMap places={route} />
        <aside className="soft-card rounded-lg p-5">
          <h2 className="text-xl font-bold">코스 순서</h2>
          {route.length > 0 ? (
            <ol className="mt-4 grid gap-3">
              {route.map((place, index) => (
                <li
                  key={place.id ?? `${getPlaceName(place)}-${index}`}
                  className="rounded-md bg-[#f7f8f5] px-4 py-3 text-sm font-semibold"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p>{index + 1}. {getPlaceName(place)}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-[#667165]">
                        {getPlaceAddress(place)}
                      </p>
                    </div>
                    <a
                      href={getPlaceDirectionUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-black text-[#174d3c]"
                    >
                      길찾기
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-md bg-[#f7f8f5] p-4 text-sm font-semibold text-[#667165]">
              표시할 추천 코스가 아직 없습니다. 조건 입력 후 추천 결과를 먼저 확인해 주세요.
            </p>
          )}
          <a
            href={firstDirectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button mt-6 w-full"
          >
            카카오맵에서 길찾기
          </a>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#667165]">
            웹에서는 새 탭으로 열고, 모바일에서는 카카오맵 앱 연결을 우선 사용합니다. 여러 경유지 자동 길찾기는 추후 코스 API와 함께 확장합니다.
          </p>
        </aside>
      </section>
    </main>
  );
}
