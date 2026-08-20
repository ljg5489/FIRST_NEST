// 파일 위치: src/services/tour-api/systemcode.ts
// 파일 명: systemcode.ts

const baseUrl = 'https://apis.data.go.kr/B551011/KorService2/lclsSystmCode2';

// 이벤트 검색 (pageNo 매개변수 추가)
export async function fetchSystemCodes(pageNo: number = 1) {
  //env 파일에서 api 키를 받아옴
  const apiKey = process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error('.env.local에 TOUR_API_KEY가 없습니다.');
  }

  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: pageNo.toString(), 
    MobileOS: 'ETC',
    MobileApp: 'TravelWithMe',
    _type: 'json',
    numOfRows: '100',
    lclsSystmListYn: 'Y'
  }).toString();


  const url = `${baseUrl}?${queryParams}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tour API 분류체계 코드 통신 에러 (상태코드: ${response.status})`);
      console.error(`상세 에러 내용: ${errorText}`);
      throw new Error('API 통신 실패');
    }
    
    const data = await response.json();
    
    const items = data?.response?.body?.items?.item || [];
    return items;
  } catch (error) {
    console.error(`[분류체계 코드 조회 ${pageNo}페이지] Tour API 호출 에러:`, error);
    return [];
  }
}