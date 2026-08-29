// 파일 위치: src/lib/interest-mapping.ts
// 파일 명: interest-mapping.ts
//
// 관심사(체크박스 값) → DB 조건 매핑 설정 파일
// ⚠️ TourAPI 카테고리 코드 체계나 프론트 관심사 목록이 바뀌면 이 파일만 수정하면 됩니다.
// route.ts / recommend.ts의 로직 코드는 건드릴 필요 없음.
//
// 새 관심사를 추가/변경하려면 아래 INTEREST_MAP에 한 줄만 추가하면 됨.
// 하나의 관심사가 카테고리+시설처럼 여러 효과를 동시에 가져도 배열로 표현 가능.

import type { CategoryCode } from "./recommend";

export type FacilityType = "parking" | "baby_carriage" | "credit_card" | "pet";

export type InterestEffect =
  | { type: "category"; value: CategoryCode }
  | { type: "facility"; value: FacilityType }
  | { type: "festival_priority" } // 카테고리 필터가 아니라, 근처 이벤트 있는 장소를 우선 정렬
  | { type: "unsupported"; reason: string }; // 현재 DB로 반영 불가 — 무시하되 사유를 남김

// ============================================================
// 실제 매핑 테이블 (mock-data.ts travelConditionOptions.interests 기준, 2026-08-20 확인)
// 여기만 수정하면 팀이 카테고리 체계를 바꿔도 로직은 그대로 재사용됨
// ============================================================
export const INTEREST_MAP: Record<string, InterestEffect[]> = {
  역사: [{ type: "category", value: "HS" }],
  자연: [{ type: "category", value: "NA" }],
  가족: [{ type: "facility", value: "baby_carriage" }],
  축제: [{ type: "festival_priority" }],
  "로컬 음식": [
    { type: "unsupported", reason: "places 테이블이 TourAPI 관광지 contentType만 수집해서 음식점 데이터 없음" },
  ],
  "사진 명소": [
    { type: "unsupported", reason: "평점/인기도 등 포토스팟 판단 근거 필드가 DB에 없음" },
  ],

  // 예시: 나중에 "체험", "문화유산" 같은 관심사가 추가되면 아래처럼 한 줄만 더하면 됨
  // 체험: [{ type: "category", value: "EX" }],
  // 문화유산: [{ type: "category", value: "VE" }],
};

// 전체 카테고리 목록 (폴백용) — 코드 체계 자체가 바뀌면 여기만 수정
export const ALL_CATEGORIES: CategoryCode[] = ["HS", "NA", "EX", "VE"];