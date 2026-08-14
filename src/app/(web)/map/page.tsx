import { getRecommendedCourseWithAttractions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const course = await getRecommendedCourseWithAttractions();
  const route = course.days.flatMap((day) => day.attractions);

  return (
    <main className="page-shell">
      <p className="section-label">/map</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">지도/동선 확인</h1>
      <p className="mt-3 max-w-2xl text-[#4f5b52]">
        Kakao Map 연동 전에는 placeholder로 코스 순서와 길찾기 버튼 위치를 먼저 잡습니다.
      </p>

      <section className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[1fr_0.45fr]">
        <div className="soft-card flex min-h-[360px] items-center justify-center rounded-lg bg-[#cbded7] text-center font-bold text-[#4f5b52] sm:min-h-[520px]">
          Kakao Map 표시 영역
        </div>
        <aside className="soft-card rounded-lg p-5">
          <h2 className="text-xl font-bold">코스 순서</h2>
          <ol className="mt-4 grid gap-3">
            {route.map((place, index) => (
              <li key={place.id} className="rounded-md bg-[#f7f8f5] px-4 py-3 text-sm font-semibold">
                {index + 1}. {place.name}
              </li>
            ))}
          </ol>
          <a
            href="https://map.kakao.com"
            className="primary-button mt-6 w-full"
          >
            카카오맵에서 길찾기
          </a>
        </aside>
      </section>
    </main>
  );
}
