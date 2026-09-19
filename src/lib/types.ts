// 파일 위치: src/lib/types.ts
// 파일 명: types.ts

export type Interest =
  | "역사"
  | "로컬 음식"
  | "자연"
  | "축제"
  | "가족"
  | "사진 명소";

export type TravelConditionOption = {
  nationalities: string[];
  languages: string[];
  tripDays: string[];
  startRegions: string[];
  budgetTypes: string[];
  travelPaces: string[];
  transportOptions: string[];
  interests: Interest[];
};

export type Attraction = {
  id: string;
  tourApiContentId?: string;
  name: string;
  nameEn?: string | null;
  region: string;
  category: string;
  address: string;
  addressEn?: string | null;
  summary: string;
  source: string;
  estimatedCost: number;
  mapUrl: string;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string;
  dataCompletenessScore?: number | null;
  hasOperationInfo?: boolean;
  operationStatus?: "available_today" | "closed_today" | "unknown";
  operationLabel?: string;
  operationNotice?: string;
  operationHours?: string | null;
  operationInfoSource?: "tour_api" | "unverified" | "none";
  hasThisWeekEvent?: boolean;
  eventLabel?: string | null;
};

export type ItineraryDay = {
  day: string;
  region: string;
  attractionIds: string[];
};

export type RecommendedCourse = {
  id: string;
  title: string;
  conditionSummary: {
    tripDays: string;
    people: string;
    budget: string;
    interests: string;
  };
  totalEstimatedCost: number;
  perPersonEstimatedCost: number;
  remainingBudget: number;
  days: ItineraryDay[];
};
