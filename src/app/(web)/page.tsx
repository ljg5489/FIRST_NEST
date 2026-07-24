// 파일 위치: src/app/(web)/page.tsx
// 메인화면 파일
import { fetchChungnamTouristSpots } from '../../services/tour-api/area';
import { fetchDongCodes } from '../../services/tour-api/dongcode'; 
import { fetchKeyWord } from '../../services/tour-api/keyword'; 
// 방금 만든 카카오맵 컴포넌트 불러오기
import KakaoMap from '../../features/map/ui/KakaoMap'; 

export default async function Home() {
  // Promise.all을 사용해 API를 동시에 병렬로 호출
  const [spots, dongCodes, keywordSpots] = await Promise.all([
    fetchChungnamTouristSpots('kor'),
    fetchDongCodes(),
    fetchKeyWord('순대', 'kor')
  ]);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-blue-600">TRAVEL WITH ME</h1>
        <p className="mt-2 text-gray-700">충남 맞춤 여행 코스 추천 플랫폼 - Tour API & 지도 연동 완료!</p>
      </header>

      {/* 🗺️ 새로 추가된 카카오맵 섹션 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">🗺️ 충남 관광지 지도 뷰</h2>
        {/* spots 데이터를 places라는 이름으로 카카오맵에 넘겨줍니다 */}
        <KakaoMap places={spots} />
      </section>

      {/* 지역기반 관광지 목록 섹션 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">📍 충남 추천 관광지 목록 (미리보기)</h2>
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

      {/* 키워드 기반 관광지 목록 섹션 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">📍 충남 키워드 관광지 목록 (미리보기)</h2>
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
      <section>
        <h2 className="text-xl font-semibold mb-4">🗺️ 행정동 코드 목록 (디버깅 확인용)</h2>
        <div className="flex flex-col gap-2">
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