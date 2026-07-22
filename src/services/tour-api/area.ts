// 파일 위치: src/services/tour-api/area.ts
// 파일 명: area.ts

const KOR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2/areaBasedList2';
const ENG_BASE_URL = 'https://apis.data.go.kr/B551011/EngService2/areaBasedList2';

/*다른 파일에서도 접근이 가능하게 export 로 api 불러오기/ 파일 읽기 처럼 비동치 처리를 할 수 있도록
async 로 만든 fetchChungnamTouristSpots 함수 매개변수로 kor, 이나 eng를 받고 만약 아무것도 안 받으면
kor 로 작업*/
export async function fetchChungnamTouristSpots(lang: 'kor' | 'eng' = 'kor') {
  /* 받은 매개변수가 kor 이면 KOR_BASE_URL로 아니면 ENG_BASE_URL로 작업하라는 삼항연산자*/
  const baseUrl = lang === 'kor' ? KOR_BASE_URL : ENG_BASE_URL;
  //env 파일에서 api 키를 받아옴
  const apiKey = process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error('.env.local에 TOUR_API_KEY가 없습니다.');
  }

  //오퍼레이션에 들어갈 콘텐트 타입 ID
  //12 : 관광지, 14: 문화시설, 15: 축제공연행사, 25: 여행코스, 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점)
  const contentTypeId = lang === 'kor' ? '12' : '76';

  //areaBasedList2(지역기반 관광정보 조회)에 대한 파라미터
  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: 'ETC',
    MobileApp: 'TravelWithMe',
    _type: 'json',
    arrange: 'A',
    numOfRows: '100',
    pageNo: '1',
    contentTypeId: contentTypeId,
    lDongRegnCd: '44' //충청남도 일부분 코드로 검색(충남 안에서도 여러 코드가 있음 또한 같은 코드를 가지고 있는 시가 있음 확인은 dongcode.ts 가 불러온 json 결과 확인)
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
    console.error('Tour API 호출 에러:', error);
    return [];
  }
}