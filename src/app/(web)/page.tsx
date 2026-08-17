import { getTravelConditionOptions } from "@/lib/data";

const flowSteps = [
  "조건 입력",
  "코스 추천",
  "일정 확인",
  "지도 길찾기",
];
const techSources = ["Korea Tourism Organization TourAPI", "Kakao Map", "Vercel"];

export default async function Home() {
  const options = await getTravelConditionOptions();

  return (
    <main>
      <section className="page-shell overflow-hidden">
        <div className="grid min-w-0 gap-6 py-3 sm:gap-8 sm:py-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <section className="min-w-0 max-w-2xl">
            <p className="section-label mb-3">CHUNGNAM TRAVEL COURSE MVP</p>
            <h1 className="break-keep text-2xl font-black leading-tight text-[#17211b] sm:text-4xl lg:text-5xl">
              여행 조건을 넣으면 충남 코스를 바로 추천합니다.
            </h1>
            <p className="mt-4 break-keep text-sm leading-7 text-[#4f5b52] sm:mt-5 sm:text-base">
              외국인 관광객이 예산, 인원수, 여행일수, 관심사, 이동수단을 직접
              입력하고 추천 코스와 예상 비용, 지도 동선까지 한 화면에서 확인하는
              공공데이터 기반 웹 MVP입니다.
            </p>

            <div className="mt-6 grid max-w-xl grid-cols-2 gap-2 sm:mt-7 sm:grid-cols-4 sm:gap-3">
              {flowSteps.map((step, index) => (
                <div key={step} className="hairline-card rounded-lg p-3 sm:p-3">
                  <span className="text-xs font-black text-[#2f7f8f]">
                    0{index + 1}
                  </span>
                  <p className="mt-2 text-sm font-black">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <form action="/results" className="soft-card min-w-0 rounded-xl p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="section-label">START</p>
                <h2 className="mt-1 text-xl font-black sm:text-2xl">직접 여행 조건 입력</h2>
              </div>
              <span className="rounded-md bg-[#e8f1eb] px-3 py-2 text-xs font-black text-[#174d3c]">
                MVP
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <label className="grid gap-2 text-sm font-bold">
                국적
                <select className="field-control" name="nationality" defaultValue="" required>
                  <option value="" disabled>국적 선택</option>
                  {options.nationalities.map((nationality) => (
                    <option key={nationality}>{nationality}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                언어
                <select className="field-control" name="language" defaultValue="" required>
                  <option value="" disabled>언어 선택</option>
                  {options.languages.map((language) => (
                    <option key={language}>{language}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                여행일수
                <select className="field-control" name="tripDays" defaultValue="" required>
                  <option value="" disabled>여행일수 선택</option>
                  {options.tripDays.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                인원수
                <input className="field-control" type="number" min="1" placeholder="예: 2" name="people" required />
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
                  <option value="" disabled>이동수단 선택</option>
                  {options.transportOptions.map((transport) => (
                    <option key={transport}>{transport}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
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

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm leading-6 text-[#5d675f]">
                입력값은 추천 결과 화면에서 조건 요약, 예상 비용, 일자별 코스에 반영됩니다.
              </p>
              <button type="submit" className="primary-button w-full border-0 sm:w-auto">
                코스 추천 보기
              </button>
            </div>
          </form>
        </div>

        <section className="mt-8 grid gap-4 border-t border-[#dce2d7] pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-black">연동 및 사용 기술</h2>
            <p className="mt-2 text-sm text-[#5d675f]">
              실제 API 연동 전에는 mock data로 화면 흐름을 먼저 완성합니다.
            </p>
          </div>
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
