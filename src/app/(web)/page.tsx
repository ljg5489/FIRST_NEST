// 진규 코드 

import KakaoMap from '../../features/map/ui/KakaoMap';
import { getPlacesFromDB } from '../../features/tourism/server/queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const places = await getPlacesFromDB();

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-blue-600">TRAVEL WITH ME</h1>
        <p className="mt-2 text-gray-700">충남 맞춤 여행 코스 추천 플랫폼</p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">충남 관광지 지도</h2>
        <KakaoMap places={places} />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">충남 추천 관광지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.length > 0 ? (
            places.map((place) => {
              const imageUrl =
                typeof place.raw_data?.firstimage === 'string'
                  ? place.raw_data.firstimage
                  : null;

              return (
                <article
                  key={place.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="h-48 bg-gray-200 w-full">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={place.name_ko}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1">
                      {place.name_ko}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {place.address || '주소 정보 없음'}
                    </p>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="text-gray-500">표시할 관광지 데이터가 없습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}