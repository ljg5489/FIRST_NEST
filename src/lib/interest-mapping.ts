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
// 2026-09-04 전체 DB(2421행) 재분석 결과: FD(음식) 대분류 확인됨 → "로컬 음식" 매핑 추가
// 여기만 수정하면 팀이 카테고리 체계를 바꿔도 로직은 그대로 재사용됨
// ============================================================
export const INTEREST_MAP: Record<string, InterestEffect[]> = {
  역사: [{ type: "category", value: "HS" }],
  자연: [{ type: "category", value: "NA" }],
  가족: [{ type: "facility", value: "baby_carriage" }],
  축제: [{ type: "festival_priority" }],
  "로컬 음식": [{ type: "category", value: "FD" }],
  "사진 명소": [
    { type: "unsupported", reason: "평점/인기도 등 포토스팟 판단 근거 필드가 DB에 없음" },
  ],

  // 예시: 나중에 "체험", "문화유산" 같은 관심사가 추가되면 아래처럼 한 줄만 더하면 됨
  // 체험: [{ type: "category", value: "EX" }],
  // 문화유산: [{ type: "category", value: "VE" }],
};

// 코스 추천에 쓸 카테고리 전체 목록 (폴백용)
// ⚠️ 2026-09-04 전체 DB 재분석 결과, DB에는 HS/NA/EX/VE/FD 외에도
// AC(숙박)/SH(쇼핑)/EV(축제)/LS(레포츠)/C0(추천코스)가 존재함을 확인.
// 이 중 AC(숙박)/SH(쇼핑)/C0(추천코스)는 "방문 코스"에 넣을 성격이 아니라서 의도적으로 제외.
// EV(축제)는 별도로 "축제" 관심사(festival_priority)가 place_events 조회로 처리하고 있어서
// 카테고리 필터에는 안 넣음 (중복 처리 방지).
// LS(레포츠)는 포함 여부가 팀 판단 필요 — 일단 관광 코스 성격상 포함해둠, 필요시 제외.
export const ALL_CATEGORIES: CategoryCode[] = ["HS", "NA", "EX", "VE", "FD", "LS"];