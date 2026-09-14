// 파일 위치: src/app/(web)/page.tsx
// 파일 명: page.tsx

import { getAttractions, getFestivals, getTravelConditionOptions } from "@/lib/data";

export const dynamic = "force-dynamic";

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
const fallbackImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80";

const quickLinks = [
  { href: "/explore", label: "장소 둘러보기", description: "사진과 지역으로 먼저 훑어보기" },
  { href: "/map", label: "지도에서 보기", description: "가고 싶은 곳의 위치 한눈에 보기" },
  { href: "/results", label: "코스 미리보기", description: "여행 일정 흐름 확인하기" },
];

const techSources = ["TourAPI", "Kakao Map", "Supabase", "Next.js"];

function getText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getRegionFromAddress(address: string | null | undefined, fallback = "충남") {
  return address?.split(" ")[1] ?? fallback;
}

function getRawText(item: any, key: string, fallback = "") {
  return getText(item.raw_data?.[key], fallback);
}

function getPlaceImage(place: any) {
  return (
    place.imageUrl ??
    place.first_image_url ??
    place.place_images?.find((image: any) => image.image_url)?.image_url ??
    null
  );
}

function getEventImage(event: any) {
  return (
    event.first_image_url ??
    event.event_images?.find((image: any) => image.image_url)?.image_url ??
    null
  );
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

  if (!operationHours && !closedDays) {
    return {
      status: "unknown",
      label: "운영정보 확인 필요",
      notice: "방문 전 운영시간 확인이 필요합니다.",
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
      status: "closed_today",
      label: "오늘 휴무 가능성",
      notice: `${todayName}요일은 쉬어갈 수 있어 방문 전 확인해 주세요.`,
    };
  }

  return {
    status: "available_today",
    label: "오늘 방문 가능",
    notice: operationHours || "오늘 들러보기 좋은 장소입니다.",
  };
}

function isThisWeekEvent(event: any) {
  const startDate = getText(event.event_start_date);
  const endDate = getText(event.event_end_date);

  if (!startDate || !endDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 6);

  return new Date(startDate) <= weekEnd && new Date(endDate) >= today;
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "일정 확인 필요";
  }

  return date.replaceAll("-", ".");
}

function makeExploreHref(params: Record<string, string | null | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `/explore?${query}` : "/explore";
}

function FeatureCard({
  href,
  label,
  title,
  description,
  meta,
  imageUrl,
}: {
  href: string;
  label: string;
  title: string;
  description: string;
  meta: string;
  imageUrl?: string | null;
}) {
  return (
    <a
      href={href}
      className="group relative min-h-[300px] w-[82vw] max-w-[520px] shrink-0 snap-start overflow-hidden rounded-lg bg-[#17211b] text-white shadow-[0_18px_45px_rgba(23,33,27,0.14)] sm:w-[520px]"
    >
      <img
        src={imageUrl || fallbackImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="relative flex min-h-[300px] flex-col justify-between p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-white px-3 py-2 text-xs font-black text-[#174d3c]">
            {label}
          </span>
          <span className="text-xs font-black text-white/80">자세히 보기</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white/80">{meta}</p>
          <h3 className="mt-2 line-clamp-2 break-keep text-2xl font-black leading-tight sm:text-3xl">
            {title}
          </h3>
          <p className="mt-3 line-clamp-2 break-keep text-sm leading-6 text-white/85">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}

export default async function Home() {
  const [options, attractions, festivals] = await Promise.all([
    getTravelConditionOptions(),
    getAttractions(),
    getFestivals().catch(() => []),
  ]);

  const normalizedPlaces = attractions.map((place: any) => {
    const name = place.name_ko ?? place.name ?? "관광지";
    const address = place.address ?? "주소 정보 없음";
    const operation = getOperationInfo(place);

    return {
      id: place.id,
      name,
      region: place.region ?? getRegionFromAddress(address, "충남"),
      category: place.category ?? place.place_tags?.[0]?.tag ?? "관광지",
      address,
      imageUrl: getPlaceImage(place),
      summary:
        place.summary ??
        place.description ??
        getRawText(place, "overview", "충남에서 가볍게 들러보기 좋은 여행지입니다."),
      ...operation,
    };
  });

  const todayPlaces = normalizedPlaces.filter((place) => place.status === "available_today");
  const imagePlaces = normalizedPlaces.filter((place) => place.imageUrl);
  const thisWeekEvents = (festivals as any[]).filter(isThisWeekEvent);
  const heroPlace = todayPlaces[0] ?? imagePlaces[0] ?? normalizedPlaces[0];
  const thisWeekEvent = thisWeekEvents[0];
  const secondaryPlace =
    imagePlaces.find((place) => place.id !== heroPlace?.id) ?? normalizedPlaces[1];

  const curationCards = [
    {
      href: makeExploreHref({
        available: "today",
        region: heroPlace?.region,
      }),
      label: "오늘 갈 수 있는 곳",
      title: heroPlace?.name ?? "운영정보 확인 중",
      description:
        heroPlace?.summary ??
        "오늘 바로 들를 수 있는 장소를 준비하고 있습니다.",
      meta: heroPlace
        ? `${heroPlace.region} · ${heroPlace.category}`
        : "방문 가능 장소 준비 중",
      imageUrl: heroPlace?.imageUrl,
    },
    {
      href: makeExploreHref({
        event: "this-week",
        region: thisWeekEvent ? getRegionFromAddress(thisWeekEvent.address, "") : null,
      }),
      label: "이번 주 행사",
      title: thisWeekEvent?.title ?? "행사 데이터 준비 중",
      description: thisWeekEvent
        ? `${formatDate(thisWeekEvent.event_start_date)} ~ ${formatDate(
            thisWeekEvent.event_end_date,
          )}`
        : "이번 주 충남에서 열리는 축제와 행사를 준비하고 있습니다.",
      meta: thisWeekEvent?.address ?? "곧 만날 수 있는 충남 행사",
      imageUrl: thisWeekEvent ? getEventImage(thisWeekEvent) : null,
    },
    {
      href: makeExploreHref({
        region: secondaryPlace?.region,
        theme: secondaryPlace?.category,
      }),
      label: "충남 추천 관광지",
      title: secondaryPlace?.name ?? "관광지 데이터 준비 중",
      description:
        secondaryPlace?.summary ??
        "사진으로 먼저 보고 마음에 드는 여행지를 골라보세요.",
      meta: secondaryPlace
        ? `${secondaryPlace.region} · ${secondaryPlace.category}`
        : "추천 여행지",
      imageUrl: secondaryPlace?.imageUrl,
    },
  ];

  return (
    <main>
      <section className="page-shell pb-4 pt-5 sm:pb-6 sm:pt-7">
        <section className="relative overflow-hidden rounded-lg border border-[#dce2d7] bg-white shadow-[0_18px_46px_rgba(23,33,27,0.08)]">
          <div className="grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase text-[#2f7f8f]">
                TRAVEL WITH ME
              </p>
              <h1 className="mt-3 max-w-2xl break-keep text-3xl font-black leading-tight text-[#17211b] sm:text-5xl">
                오늘의 충남 여행을 더 쉽게 골라보세요.
              </h1>
              <p className="mt-4 max-w-xl break-keep text-sm leading-7 text-[#4f5b52] sm:text-base">
                예산, 일정, 관심사를 넣으면 지금 가기 좋은 장소와 여행 코스를
                한 번에 이어서 볼 수 있습니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="#travel-condition" className="primary-button">
                  내 여행 조건 넣기
                </a>
                <a
                  href="/explore"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#dce2d7] bg-white px-5 py-3 text-sm font-black text-[#174d3c] transition hover:border-[#174d3c]"
                >
                  장소 먼저 둘러보기
                </a>
              </div>
            </div>
            <div className="grid content-end gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-lg bg-[#f7f8f5] p-4">
                <p className="text-sm font-bold text-[#5d675f]">등록 관광지</p>
                <p className="mt-1 text-2xl font-black text-[#17211b]">
                  {normalizedPlaces.length.toLocaleString("ko-KR")}곳
                </p>
              </div>
              <div className="rounded-lg bg-[#eef6f2] p-4">
                <p className="text-sm font-bold text-[#5d675f]">오늘 보기 좋은 곳</p>
                <p className="mt-1 text-2xl font-black text-[#174d3c]">
                  {todayPlaces.length.toLocaleString("ko-KR")}곳
                </p>
              </div>
              <div className="rounded-lg bg-[#eff7f8] p-4">
                <p className="text-sm font-bold text-[#5d675f]">이번 주 행사</p>
                <p className="mt-1 text-2xl font-black text-[#2f7f8f]">
                  {thisWeekEvents.length.toLocaleString("ko-KR")}개
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="travel-condition"
          className="soft-card relative z-[1] mx-auto mt-5 max-w-5xl rounded-lg p-4 sm:mt-6 sm:p-5 lg:p-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label">PLAN YOUR TRIP</p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">어떤 여행을 원하세요?</h2>
            </div>
            <p className="text-sm font-semibold text-[#5d675f]">
              간단히 고르면 일정과 예산에 맞춰 코스를 보여드릴게요.
            </p>
          </div>

          <form action="/results" className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold">
                국적
                <select className="field-control" name="nationality" defaultValue="" required>
                  <option value="" disabled>
                    국적 선택
                  </option>
                  {options.nationalities.map((nationality) => (
                    <option key={nationality}>{nationality}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                언어
                <select className="field-control" name="language" defaultValue="" required>
                  <option value="" disabled>
                    언어 선택
                  </option>
                  {options.languages.map((language) => (
                    <option key={language}>{language}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                여행일수
                <select className="field-control" name="tripDays" defaultValue="" required>
                  <option value="" disabled>
                    여행일수 선택
                  </option>
                  {options.tripDays.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                인원수
                <input
                  className="field-control"
                  type="number"
                  min="1"
                  placeholder="예: 2"
                  name="people"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                사용 가능 예산
                <input
                  className="field-control"
                  type="number"
                  min="10000"
                  step="10000"
                  placeholder="예: 300000"
                  name="budget"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                이동수단
                <select className="field-control" name="transport" defaultValue="" required>
                  <option value="" disabled>
                    이동수단 선택
                  </option>
                  {options.transportOptions.map((transport) => (
                    <option key={transport}>{transport}</option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm font-bold">관심사</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {options.interests.map((interest) => (
                  <label key={interest} className="choice-chip">
                    <input
                      type="checkbox"
                      className="mr-2"
                      name="interests"
                      value={interest}
                    />
                    {interest}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#dce2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-2 sm:grid-cols-3">
                <span className="text-sm font-bold text-[#5d675f]">
                  관광지 {normalizedPlaces.length.toLocaleString("ko-KR")}개
                </span>
                <span className="text-sm font-bold text-[#5d675f]">
                  오늘 가능 {todayPlaces.length.toLocaleString("ko-KR")}개
                </span>
                <span className="text-sm font-bold text-[#5d675f]">
                  이번 주 행사 {thisWeekEvents.length.toLocaleString("ko-KR")}개
                </span>
              </div>
              <button type="submit" className="primary-button w-full border-0 sm:w-auto">
                내 코스 보기
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10 sm:mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label">TODAY'S PICK</p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                지금 보기 좋은 여행 카드
              </h2>
            </div>
            <p className="text-sm font-bold text-[#5d675f]">옆으로 넘겨보세요</p>
          </div>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
            {curationCards.map((card) => (
              <FeatureCard key={card.label} {...card} />
            ))}
          </div>
          <div className="mt-1 flex justify-center gap-2">
            {curationCards.map((card) => (
              <span
                key={card.label}
                className="h-1.5 w-8 rounded-full bg-[#b6c9c2]"
                aria-hidden="true"
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hairline-card rounded-lg p-4 transition hover:-translate-y-0.5 hover:border-[#9eb9ae] hover:bg-white"
            >
              <p className="text-base font-black">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-[#5d675f]">{item.description}</p>
            </a>
          ))}
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#dce2d7] pt-5">
          <p className="text-sm font-semibold text-[#5d675f]">
            TourAPI와 지도 데이터를 바탕으로 충남 여행지를 더 쉽게 탐색합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {techSources.map((source) => (
              <span
                key={source}
                className="rounded-md border border-[#dce2d7] bg-white px-3 py-2 text-sm font-bold text-[#3d4941]"
              >
                {source}
              </span>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
