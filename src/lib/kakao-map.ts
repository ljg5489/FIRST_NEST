// 파일 위치: lib/kakao-map.ts
// 파일 명: kakao-map.ts

type KakaoDestination = {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
};

function encodeMapValue(value: string) {
  return encodeURIComponent(value.trim());
}

export function createKakaoDirectionUrl(destination: KakaoDestination) {
  if (
    typeof destination.latitude === "number" &&
    typeof destination.longitude === "number"
  ) {
    return `https://map.kakao.com/link/to/${encodeMapValue(destination.name)},${destination.latitude},${destination.longitude}`;
  }

  const searchKeyword = destination.address || destination.name;
  return `https://map.kakao.com/?q=${encodeMapValue(searchKeyword)}`;
}

export function hasCoordinate(destination: KakaoDestination) {
  return (
    typeof destination.latitude === "number" &&
    typeof destination.longitude === "number"
  );
}
