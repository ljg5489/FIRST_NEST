// 파일 위치: lib/tourism-codes.ts
// 파일 명: tourism-codes.ts

const CHUNGNAM_SIGUNGU_BY_CODE: Record<string, string> = {
  "1": "공주",
  "2": "금산",
  "3": "논산",
  "4": "당진",
  "5": "보령",
  "6": "부여",
  "7": "서산",
  "8": "서천",
  "9": "아산",
  "11": "예산",
  "12": "천안",
  "13": "청양",
  "14": "태안",
  "15": "홍성",
  "16": "계룡",
};

const CONTENT_TYPE_BY_CODE: Record<string, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/공연/행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
};

const CHUNGNAM_REGION_NAMES = [
  "천안",
  "공주",
  "보령",
  "아산",
  "서산",
  "논산",
  "계룡",
  "당진",
  "금산",
  "부여",
  "서천",
  "청양",
  "홍성",
  "예산",
  "태안",
];

export function getChungnamRegionName(
  code: string,
  fallback = "충남",
  address?: string | null,
) {
  const regionFromAddress = CHUNGNAM_REGION_NAMES.find((region) =>
    address?.includes(`${region}시`) || address?.includes(`${region}군`),
  );

  if (regionFromAddress) {
    return regionFromAddress;
  }

  return CHUNGNAM_SIGUNGU_BY_CODE[code] ?? fallback;
}

export function getContentTypeName(code: string, fallback = "관광지") {
  return CONTENT_TYPE_BY_CODE[code] ?? fallback;
}
