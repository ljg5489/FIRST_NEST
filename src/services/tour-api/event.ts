// 파일 위치: src/services/tour-api/event.ts
// 파일 명: event.ts

const KOR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2';
const ENG_BASE_URL = 'https://apis.data.go.kr/B551011/EngService2/searchFestival2';

// 키워드 기반 검색 (pageNo 매개변수 추가)
export async function fetchFestival(eventDate: number, lang: 'kor' | 'eng' = 'kor', pageNo: number = 1) {
  /* 받은 매개변수가 kor 이면 KOR_BASE_URL로 아니면 ENG_BASE_URL로 작업하라는 삼항연산자*/
  const baseUrl = lang === 'kor' ? KOR_BASE_URL : ENG_BASE_URL;
  //env 파일에서 api 키를 받아옴
  const apiKey = process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error('.env.local에 TOUR_API_KEY가 없습니다.');
  }

  //areaBasedList2(지역기반 관광정보 조회)에 대한 파라미터
  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: 'ETC',
    MobileApp: 'TravelWithMe',
    _type: 'json',
    numOfRows: '100',
    pageNo: pageNo.toString(), // 매개변수로 받은 pageNo 동적 적용
    arrange: 'A',
    eventStartDate: eventDate.toString(), //파라미터로 받은 검색어를 적용
    lDongRegnCd: '44' //충남 일부만 검색
  }).toString();


  const url = `${baseUrl}?${queryParams}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      // 에러가 날 경우 터미널에 공공데이터포털 서버의 실제 에러 원인을 찍음
      const errorText = await response.text();
      console.error(`Tour API 통신 에러 (상태코드: ${response.status})`);
      console.error(`상세 에러 내용: ${errorText}`);
      throw new Error('API 통신 실패');
    }
    
    const data = await response.json();
    
    const items = data?.response?.body?.items?.item || [];
    return items;
  } catch (error) {
    console.error(`[축제 ${pageNo}페이지] Tour API 호출 에러:`, error);
    return [];
  }
}