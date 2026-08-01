// 파일 위치: src/app/admin/api-test/page.tsx
// 파일 명: page.tsx

// 이 페이지는 관리자용 API 테스트 페이지

import { fetchChungnamTouristSpots } from '../../../services/tour-api/area';
import { fetchDongCodes } from '../../../services/tour-api/dongcode'; 
import { fetchKeyWord } from '../../../services/tour-api/keyword';
// 🌟 새로 추가된 축제/행사 API 불러오기 
import { fetchFestival } from '../../../services/tour-api/event'; 
import KakaoMap from '../../../features/map/ui/KakaoMap'; 

export default async function ApiTestPage() {
  // Promise.all을 사용해 API를 동시에 병렬로 호출 (fetchFestival 추가)
  const [spots, dongCodes, keywordSpots, festivals] = await Promise.all([
    fetchChungnamTouristSpots('kor'),
    fetchDongCodes(),
    fetchKeyWord('순대', 'kor'),
    fetchFestival(20260801, 'kor') // 테스트용 임시 date 값으로 2026년 8월 1일을 사용
  ]);

  return (
    <main className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">🛠️ API 데이터 테스트 랩 (Admin)</h1>
        <p className="mt-2 text-gray-600">DB 적재 전 Tour API 원본 데이터를 검증하고 지도와 연동을 테스트하는 공간입니다.</p>
      </header>

      {/* 🗺️ 카카오맵 섹션 */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">🗺️ 원본 API 관광지 지도 뷰</h2>
        <KakaoMap places={spots} />
      </section>

      {/* 지역기반 관광지 목록 섹션 */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">📍 충남 추천 관광지 목록 (API 원본)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spots.map((spot: any) => (
              <div key={spot.contentid} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-48 bg-gray-200 w-full">
                  {spot.firstimage ? (
                    <img 
                      src={spot.firstimage} 
                      alt={spot.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{spot.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{spot.addr1} {spot.addr2}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-red-500">데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </section>

      {/* 🌟 새로 추가된 축제/행사 기반 관광지 목록 섹션 */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">🎉 충남 행사/축제 목록 (API 원본 테스트)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals && festivals.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            festivals.map((festival: any) => (
              <div key={festival.contentid} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border-blue-100">
                <div className="h-48 bg-gray-200 w-full relative">
                  {festival.firstimage ? (
                    <img 
                      src={festival.firstimage} 
                      alt={festival.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 bg-blue-50">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
                    축제
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{festival.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{festival.addr1} {festival.addr2}</p>
                  
                  {/* 행사 날짜 출력 부분 */}
                  {(festival.eventstartdate || festival.eventenddate) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-blue-600">
                      📅 {festival.eventstartdate} ~ {festival.eventenddate}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-red-500">현재 예정된 행사/축제 데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </section>

      {/* 키워드 기반 관광지 목록 섹션 */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">📍 키워드 관광지 목록 (API 원본)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keywordSpots.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            keywordSpots.map((spot: any) => (
              <div key={spot.contentid} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-48 bg-gray-200 w-full">
                  {spot.firstimage ? (
                    <img 
                      src={spot.firstimage} 
                      alt={spot.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{spot.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{spot.addr1} {spot.addr2}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-red-500">데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </section>

      {/* 동/지역 코드 확인 섹션 */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">🗺️ 행정동 코드 목록 (디버깅 확인용)</h2>
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {dongCodes.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dongCodes.map((dong: any, index: number) => (
              <div key={index} className="px-3 py-1 bg-gray-100 border rounded text-sm text-gray-700">
                {JSON.stringify(dong)}
              </div>
            ))
          ) : (
            <p className="text-red-500">지역 코드 데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}