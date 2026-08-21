// 파일 위치: src/services/tour-api/area.ts
// 파일 명: area.ts

const KOR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2/areaBasedList2';
const ENG_BASE_URL = 'https://apis.data.go.kr/B551011/EngService2/areaBasedList2';

export interface TourApiPlaceItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  mapx?: string;
  mapy?: string;
  areacode?: string;
  lclsSystm1?: string;
  lclsSystm2?: string;
  lclsSystm3?: string;
  tel?: string;
  modifiedtime?: string;
  firstimage?: string;
  [key: string]: unknown;
}

export async function fetchChungnamTouristSpots(
  lang: 'kor' | 'eng' = 'kor', 
  pageNo: number = 1,
  contentTypeId?: string // 파라미터를 선택적(Optional)으로 변경
) {
  const baseUrl = lang === 'kor' ? KOR_BASE_URL : ENG_BASE_URL;
  const apiKey = process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error('.env.local에 TOUR_API_KEY가 없습니다.');
  }

  // 쿼리 파라미터 객체 구성
  const params: Record<string, string> = {
    serviceKey: apiKey,
    MobileOS: 'ETC',
    MobileApp: 'TravelWithMe',
    _type: 'json',
    arrange: 'O', // O: 제목순 정렬 및 이미지/분류코드 포함
    numOfRows: '100',
    pageNo: pageNo.toString(),
    lDongRegnCd: '44' // 충청남도
  };

  // contentTypeId가 인자로 넘어왔을 때만 파라미터에 추가. 없으면 '전체 타입' 조회.
  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  const queryParams = new URLSearchParams(params).toString();
  const url = `${baseUrl}?${queryParams}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tour API 통신 에러 (상태코드: ${response.status})`);
      console.error(`상세 에러 내용: ${errorText}`);
      throw new Error('API 통신 실패');
    }
    
    const data = await response.json();
    const items = data?.response?.body?.items?.item || [];
    
    return items as TourApiPlaceItem[];
  } catch (error) {
    console.error(`[${pageNo}페이지, Type: ${contentTypeId || 'ALL'}] Tour API 호출 에러:`, error);
    return [];
  }
}