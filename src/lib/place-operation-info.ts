// 파일 위치: src/lib/place-operation-info.ts
// 파일 명: place-operation-info.ts

const OPERATION_HOUR_KEYS = [
  "usetime",
  "usetimeculture",
  "usetimeleports",
  "usetimefestival",
];

const CLOSED_DAY_KEYS = [
  "restdate",
  "restdateculture",
  "restdateleports",
];

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

type PlaceOperationSource = {
  opening_hours?: unknown;
  closed_days?: unknown;
  raw_data?: Record<string, unknown> | null;
};

export type PlaceOperationInfo = {
  hasOperationInfo: boolean;
  operationStatus: "available_today" | "closed_today" | "unknown";
  operationLabel: string;
  operationNotice: string;
  operationHours: string | null;
  closedDays: string | null;
  operationInfoSource: "tour_api" | "unverified" | "none";
};

function getText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getRawText(place: PlaceOperationSource, keys: string[]) {
  for (const key of keys) {
    const value = getText(place.raw_data?.[key]);
    if (value) return value;
  }
  return "";
}

export function getPlaceOperationInfo(
  place: PlaceOperationSource,
  now = new Date(),
): PlaceOperationInfo {
  const operationHours = getRawText(place, OPERATION_HOUR_KEYS);
  const closedDays = getRawText(place, CLOSED_DAY_KEYS);
  const hasTourApiInfo = Boolean(operationHours || closedDays);

  if (!hasTourApiInfo) {
    const hasUnverifiedStoredInfo = Boolean(
      getText(place.opening_hours) || getText(place.closed_days),
    );

    return {
      hasOperationInfo: false,
      operationStatus: "unknown",
      operationLabel: "운영정보 확인 필요",
      operationNotice: hasUnverifiedStoredInfo
        ? "원본 출처가 확인되지 않은 운영정보는 표시하지 않습니다. 방문 전 공식 채널에서 확인해 주세요."
        : "운영정보 데이터가 부족해 방문 전 공식 채널에서 확인이 필요합니다.",
      operationHours: null,
      closedDays: null,
      operationInfoSource: hasUnverifiedStoredInfo ? "unverified" : "none",
    };
  }

  const todayName = DAY_NAMES[now.getDay()];
  const normalizedClosedDays = closedDays.replace(/\s/g, "");
  const isAlwaysOpen =
    normalizedClosedDays.includes("연중무휴") ||
    normalizedClosedDays.includes("휴무없음") ||
    normalizedClosedDays === "없음";
  const isClosedToday =
    !isAlwaysOpen &&
    (normalizedClosedDays.includes(`${todayName}요일`) ||
      normalizedClosedDays.includes(`매주${todayName}`) ||
      normalizedClosedDays.includes(`${todayName}휴무`));

  if (isClosedToday) {
    return {
      hasOperationInfo: true,
      operationStatus: "closed_today",
      operationLabel: "오늘 휴무 가능성",
      operationNotice: `${todayName}요일 휴무 정보가 있습니다. 방문 전 공식 채널에서 다시 확인해 주세요.`,
      operationHours: operationHours || null,
      closedDays: closedDays || null,
      operationInfoSource: "tour_api",
    };
  }

  return {
    hasOperationInfo: true,
    operationStatus: "available_today",
    operationLabel: "오늘 휴무 표기 없음",
    operationNotice:
      operationHours
        ? `${operationHours} · 방문 전 공식 채널에서 최신 정보를 확인해 주세요.`
        : "TourAPI 운영정보가 있으나 방문 전 공식 채널에서 최신 정보를 확인해 주세요.",
    operationHours: operationHours || null,
    closedDays: closedDays || null,
    operationInfoSource: "tour_api",
  };
}
