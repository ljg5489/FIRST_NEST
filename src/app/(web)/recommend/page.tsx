import { getTravelConditionOptions } from "@/lib/data";

export default async function RecommendPage() {
  const options = await getTravelConditionOptions();

  return (
    <main className="page-shell">
      <div className="mb-8">
        <p className="section-label">/recommend</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">여행 조건 입력</h1>
        <p className="mt-3 max-w-2xl text-[#4f5b52]">
          여행일수, 인원수, 예산, 관심사, 이동수단을 입력받는 추천 시작 화면입니다.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <form action="/results" className="soft-card rounded-lg p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              국적
              <select className="field-control" name="nationality" defaultValue="" required>
                <option value="" disabled>국적 선택</option>
                {options.nationalities.map((nationality) => (
                  <option key={nationality}>{nationality}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              언어
              <select className="field-control" name="language" defaultValue="" required>
                <option value="" disabled>언어 선택</option>
                {options.languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              여행일수
              <select className="field-control" name="tripDays" defaultValue="" required>
                <option value="" disabled>여행일수 선택</option>
                {options.tripDays.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              인원수
              <input
                type="number"
                min="1"
                placeholder="예: 2"
                className="field-control"
                name="people"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              사용 가능 예산
              <input
                type="number"
                min="10000"
                step="10000"
                placeholder="예: 300000"
                className="field-control"
                name="budget"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              예산 기준
              <select className="field-control" name="budgetType" defaultValue="" required>
                <option value="" disabled>예산 기준 선택</option>
                {options.budgetTypes.map((budgetType) => (
                  <option key={budgetType}>{budgetType}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              출발 지역
              <select className="field-control" name="startRegion" defaultValue="" required>
                <option value="" disabled>출발 지역 선택</option>
                {options.startRegions.map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              여행 속도
              <select className="field-control" name="travelPace" defaultValue="">
                <option value="">선택 안 함</option>
                {options.travelPaces.map((pace) => (
                  <option key={pace}>{pace}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold">관심사</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.interests.map((interest) => (
                <label
                  key={interest}
                  className="choice-chip"
                >
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

          <div className="mt-6">
            <p className="text-sm font-semibold">이동수단</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {options.transportOptions.map((option) => (
                <label
                  key={option}
                  className="flex min-h-11 items-center rounded-md border border-[#d9ded4] bg-[#f7f8f5] px-3 text-sm font-semibold"
                >
                  <input
                    type="radio"
                    className="mr-2"
                    name="transport"
                    value={option}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-button mt-6 w-full border-0">
            추천 결과 보기
          </button>
        </form>

        <aside className="soft-card rounded-lg p-4 sm:p-5">
          <h2 className="text-xl font-bold">입력 조건 요약</h2>
          <p className="mt-4 rounded-md bg-[#f7f8f5] p-3 text-sm leading-6 text-[#5d675f]">
            왼쪽 조건을 입력하고 추천 결과 보기 버튼을 누르면 입력값이 결과 화면으로 전달됩니다.
          </p>
        </aside>
      </section>
    </main>
  );
}
