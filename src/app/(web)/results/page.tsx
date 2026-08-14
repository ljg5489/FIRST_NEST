import { getRecommendedCourseWithAttractions } from "@/lib/data";
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

export const dynamic = "force-dynamic";

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const course = await getRecommendedCourseWithAttractions();
  const hasSubmittedConditions = Boolean(params.tripDays || params.people || params.budget);
  const tripDays = getSingleParam(params, "tripDays", "");
  const people = getSingleParam(params, "people", "");
  const budget = getSingleParam(params, "budget", "");
  const transport = getSingleParam(params, "transport", "");
  const interests = getMultiParam(params, "interests", "선택 안 함");
  const budgetLabel = `${Number(budget).toLocaleString("ko-KR")}원`;
  const mapHref = `/map?tripDays=${encodeURIComponent(tripDays)}&people=${encodeURIComponent(people)}&transport=${encodeURIComponent(transport)}`;

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
            <dd className="mt-1 font-semibold">{budget ? budgetLabel : "입력 없음"}</dd>
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

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <EditableItinerary initialDays={course.days} />
        <aside className="soft-card rounded-lg p-4 sm:p-5">
          <h2 className="text-xl font-bold">예상 비용</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#667165]">총 예상 비용</dt>
              <dd className="font-semibold">{wonFormatter.format(course.totalEstimatedCost)}원</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#667165]">1인 예상 비용</dt>
              <dd className="font-semibold">{wonFormatter.format(course.perPersonEstimatedCost)}원</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#667165]">남은 예산</dt>
              <dd className="font-semibold text-[#1f6b4f]">{wonFormatter.format(course.remainingBudget)}원</dd>
            </div>
          </dl>
          <a
            href={mapHref}
            className="primary-button mt-6 w-full"
          >
            지도에서 동선 확인
          </a>
        </aside>
      </section>
        </>
      )}
    </main>
  );
}
