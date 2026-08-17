// 파일 위치: lib/kakao-map.ts
// 파일 명: kakao-map.ts
// kakao-map.ts (프론트엔드 역할): 유저가 화면에서 '길찾기' 버튼을 클릭했을 때, 카카오맵 앱이나 웹사이트로 넘겨주는 단순 URL 링크 생성기

type KakaoDestination = {
  name: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  address?: string | null;
};

function encodeMapValue(value: string) {
  return encodeURIComponent(value.trim());
}

function getValidCoordinate(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

export function createKakaoDirectionUrl(destination: KakaoDestination) {
  const latitude = getValidCoordinate(destination.latitude);
  const longitude = getValidCoordinate(destination.longitude);

  if (latitude !== null && longitude !== null) {
    return `https://map.kakao.com/link/to/${encodeMapValue(destination.name)},${latitude},${longitude}`;
  }

  const searchKeyword = destination.address || destination.name;
  return `https://map.kakao.com/link/search/${encodeMapValue(searchKeyword)}`;
}

export function hasCoordinate(destination: KakaoDestination) {
  return (
    getValidCoordinate(destination.latitude) !== null &&
    getValidCoordinate(destination.longitude) !== null
  );
}
