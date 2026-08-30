import { buildTravelCourse } from "@/lib/course-builder";
import { adaptToEditableItineraryDays, adaptToCostSummary } from "@/lib/course-adapter";
import { EditableItinerary } from "../components/EditableItinerary";

const wonFormatter = new Intl.NumberFormat("ko-KR");

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

function getMultiParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : fallback;
  }
  return value ?? fallback;
}

// "1일" / "2일" 같은 문자열에서 숫자만 뽑아냄. 매칭 안 되면 1일로 폴백
function parseTripDays(tripDaysLabel: string): number {
  const match = tripDaysLabel.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

export const dynamic = "force-dynamic";

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const hasSubmittedConditions = Boolean(params.tripDays || params.people || params.budget);

  const tripDays = getSingleParam(params, "tripDays", "");
  const people = getSingleParam(params, "people", "");
  const budget = getSingleParam(params, "budget", "");
  const transport = getSingleParam(params, "transport", "");
  const interests = getMultiParam(params, "interests", "선택 안 함");
  const budgetLabel = budget ? `${Number(budget).toLocaleString("ko-KR")}원` : "입력 없음";
  const mapHref = `/map?tripDays=${encodeURIComponent(tripDays)}&people=${encodeURIComponent(people)}&transport=${encodeURIComponent(transport)}`;

  // 조건 미입력 시엔 추천 로직(카카오/OpenAI 호출 포함)을 아예 안 돌림 — 불필요한 API 비용/지연 방지
  let itineraryDays: ReturnType<typeof adaptToEditableItineraryDays> | null = null;
  let costSummary: ReturnType<typeof adaptToCostSummary> | null = null;
  let aiStory: string | null = null;
  let metrics: { reliability: string; estimatedDistance: string; estimatedTime: number } | null = null;
  let noResultReason: string | null = null;

  if (hasSubmittedConditions) {
    const traveler = {
      days: parseTripDays(tripDays || "1일"),
      focus: interests === "선택 안 함" ? undefined : interests,
    };
    const built = await buildTravelCourse(traveler);

    if (!built) {
      noResultReason = "조건에 맞는 관광지를 찾지 못했습니다. DB에 데이터가 있는지 확인이 필요합니다.";
    } else {
      itineraryDays = adaptToEditableItineraryDays(built);
      costSummary = adaptToCostSummary(
        built,
        traveler,
        itineraryDays.map((d) => d.region)
      );
      aiStory = built.aiStory;
      metrics = built.metrics;
    }
  }

  return (
    <main className="page-shell">
      <p className="section-label">/results</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">추천 결과</h1>
      <p className="mt-3 max-w-2xl text-[#4f5b52]">
        입력 조건을 바탕으로 일자별 코스와 예상 비용을 보여주는 화면입니다.
      </p>

      {!hasSubmittedConditions ? (
        <section className="soft-card mt-6 rounded-lg p-6 sm:mt-8">
          <h2 className="text-xl font-bold">아직 입력된 여행 조건이 없습니다.</h2>
          <p className="mt-3 text-sm leading-6 text-[#5d675f]">
            여행일수, 인원수, 예산, 관심사를 먼저 입력하면 추천 결과가 이 화면에 표시됩니다.
          </p>
          <a href="/recommend" className="primary-button mt-6">
            조건 입력하러 가기
          </a>
        </section>
      ) : noResultReason ? (
        <section className="soft-card mt-6 rounded-lg p-6 sm:mt-8">
          <h2 className="text-xl font-bold">추천 결과를 만들지 못했습니다.</h2>
          <p className="mt-3 text-sm leading-6 text-[#5d675f]">{noResultReason}</p>
          <a href="/recommend" className="primary-button mt-6">
            조건 다시 입력하기
          </a>
        </section>
      ) : (
        <>
          <section className="soft-card mt-6 rounded-lg p-4 sm:mt-8 sm:p-5">
            <h2 className="text-lg font-bold">입력 조건 요약</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-[#667165]">여행일수</dt>
                <dd className="mt-1 font-semibold">{tripDays}</dd>
              </div>
              <div>
                <dt className="text-[#667165]">인원수</dt>
                <dd className="mt-1 font-semibold">{people}명</dd>
              </div>
              <div>
                <dt className="text-[#667165]">예산</dt>
                <dd className="mt-1 font-semibold">{budgetLabel}</dd>
              </div>
              <div>
                <dt className="text-[#667165]">관심사</dt>
                <dd className="mt-1 font-semibold">{interests}</dd>
              </div>
              <div>
                <dt className="text-[#667165]">이동수단</dt>
                <dd className="mt-1 font-semibold">{transport}</dd>
              </div>
            </dl>
          </section>

          {aiStory && (
            <section className="soft-card mt-6 rounded-lg p-4 sm:p-5">
              <h2 className="text-lg font-bold">AI 추천 이유</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#3f473f]">{aiStory}</p>
            </section>
          )}

          {metrics && (
            <section className="soft-card mt-6 rounded-lg p-4 sm:p-5">
              <h2 className="text-lg font-bold">동선 신뢰도</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[#667165]">이동 신뢰도</dt>
                  <dd className="mt-1 font-semibold">{metrics.reliability}</dd>
                </div>
                <div>
                  <dt className="text-[#667165]">예상 총 이동거리</dt>
                  <dd className="mt-1 font-semibold">{metrics.estimatedDistance} km</dd>
                </div>
                <div>
                  <dt className="text-[#667165]">예상 총 이동시간</dt>
                  <dd className="mt-1 font-semibold">{metrics.estimatedTime}분</dd>
                </div>
              </dl>
            </section>
          )}

          <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.7fr]">
            <EditableItinerary initialDays={itineraryDays!} />
            <aside className="soft-card rounded-lg p-4 sm:p-5">
              <h2 className="text-xl font-bold">예상 비용</h2>
              {!costSummary!.costAvailable && (
                // TODO: DB에 비용 필드가 없어서 아직 실제 계산이 불가능합니다.
                // 팀 논의 후 비용 데이터/계산 로직이 정해지면 이 안내 대신 아래 dl에 실제 값을 채워주세요.
                <p className="mt-4 rounded-md bg-[#fff7e6] p-3 text-sm leading-6 text-[#8a6d00]">
                  예상 비용은 현재 데이터 기준으로 산정할 수 없습니다. (관광지 비용 데이터 미확보 — 팀 논의 필요)
                </p>
              )}
              <dl className="mt-4 grid gap-3 text-sm opacity-50">
                <div className="flex justify-between">
                  <dt className="text-[#667165]">총 예상 비용</dt>
                  <dd className="font-semibold">{wonFormatter.format(costSummary!.totalEstimatedCost)}원</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#667165]">1인 예상 비용</dt>
                  <dd className="font-semibold">{wonFormatter.format(costSummary!.perPersonEstimatedCost)}원</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#667165]">남은 예산</dt>
                  <dd className="font-semibold text-[#1f6b4f]">{wonFormatter.format(costSummary!.remainingBudget)}원</dd>
                </div>
              </dl>
              <a href={mapHref} className="primary-button mt-6 w-full">
                지도에서 동선 확인
              </a>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}