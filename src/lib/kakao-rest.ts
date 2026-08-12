// 파일 위치: src/lib/kakao-rest.ts
// 파일 명: kakao-rest.ts
// 용도 (백엔드): AI가 코스를 추천하기 전에 "A 관광지에서 B 관광지까지 차로 몇 분이 걸리지?"를 파악하기 위해, 
// 서버 내부에서 카카오 모빌리티 서버로 시간/거리 데이터를 요청하고 계산하는 두뇌

/**
 * 카카오 모빌리티(자동차 길찾기) REST API를 호출하여 두 좌표 간의 거리와 시간을 계산합니다.
 * @param origin 출발지 { lat, lng }
 * @param destination 도착지 { lat, lng }
 * @returns { distance: km, duration: 분 }
 */
export async function getDrivingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY;

  if (!KAKAO_REST_KEY) {
    console.error('[오류] KAKAO_REST_API_KEY가 설정되지 않았습니다.');
    return null;
  }

  // 카카오 모빌리티 길찾기 API 엔드포인트 (좌표는 경도(X), 위도(Y) 순서로 쉼표 구분)
  const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`카카오 REST API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    
    // 경로 탐색 결과가 있는 경우
    if (data.routes && data.routes.length > 0) {
      const summary = data.routes[0].summary;
      return {
        distance: (summary.distance / 1000).toFixed(1), // 미터를 킬로미터로 변환 (예: 12.5)
        duration: Math.ceil(summary.duration / 60), // 초를 분으로 변환 후 올림 (예: 45)
      };
    }
    
    return null;
  } catch (error) {
    console.error('[오류] 길찾기 계산 중 에러 발생:', error);
    return null;
  }
}