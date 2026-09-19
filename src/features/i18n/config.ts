// 파일 위치: src/features/i18n/config.ts
// 파일 명: config.ts

export const supportedLocales = ["ko", "en", "ja", "vi"] as const;

export type Locale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE_NAME = "firstnest-locale";

export const localeOptions: ReadonlyArray<{
  value: Locale;
  label: string;
  shortLabel: string;
}> = [
  { value: "ko", label: "한국어", shortLabel: "KO" },
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "ja", label: "日本語", shortLabel: "JA" },
  { value: "vi", label: "Tiếng Việt", shortLabel: "VI" },
];

export function normalizeLocale(value: unknown): Locale {
  return typeof value === "string" && supportedLocales.includes(value as Locale)
    ? (value as Locale)
    : DEFAULT_LOCALE;
}

export const preferredLanguageByLocale: Record<Locale, string> = {
  ko: "Korean",
  en: "English",
  ja: "Japanese",
  vi: "Vietnamese",
};

export const navigationMessages: Record<
  Locale,
  {
    home: string;
    explore: string;
    recommend: string;
    myTrip: string;
    account: string;
    login: string;
    desktopNavLabel: string;
    mobileNavLabel: string;
    languageLabel: string;
    footerTagline: string;
    footerDescription: string;
    footerNotice: string;
    terms: string;
    privacy: string;
  }
> = {
  ko: {
    home: "홈",
    explore: "여행지 탐색",
    recommend: "코스 만들기",
    myTrip: "내 여행",
    account: "내 계정",
    login: "로그인 / 회원가입",
    desktopNavLabel: "주요 화면",
    mobileNavLabel: "모바일 주요 화면",
    languageLabel: "추천 언어 선택",
    footerTagline: "가까운 곳에서 시작하는, 새로운 여행.",
    footerDescription: "충남의 장소를 발견하고 나만의 일정으로 이어보세요.",
    footerNotice: "방문 전 운영시간과 이용 요금은 해당 장소에서 확인해 주세요.",
    terms: "이용약관",
    privacy: "개인정보처리방침",
  },
  en: {
    home: "Home",
    explore: "Explore",
    recommend: "Plan a trip",
    myTrip: "My trip",
    account: "My account",
    login: "Sign in / Sign up",
    desktopNavLabel: "Main navigation",
    mobileNavLabel: "Mobile navigation",
    languageLabel: "Select recommendation language",
    footerTagline: "A new journey, starting close to home.",
    footerDescription: "Discover Chungnam and turn places into your own itinerary.",
    footerNotice: "Check current hours and prices with each venue before visiting.",
    terms: "Terms",
    privacy: "Privacy",
  },
  ja: {
    home: "ホーム",
    explore: "観光地を探す",
    recommend: "コース作成",
    myTrip: "旅行プラン",
    account: "マイアカウント",
    login: "ログイン / 会員登録",
    desktopNavLabel: "メインメニュー",
    mobileNavLabel: "モバイルメニュー",
    languageLabel: "おすすめ言語を選択",
    footerTagline: "身近な場所から始まる、新しい旅。",
    footerDescription: "忠清南道の場所を見つけ、自分だけの日程を作りましょう。",
    footerNotice: "営業時間と料金は訪問前に各施設へご確認ください。",
    terms: "利用規約",
    privacy: "プライバシー",
  },
  vi: {
    home: "Trang chủ",
    explore: "Khám phá",
    recommend: "Tạo lịch trình",
    myTrip: "Chuyến đi",
    account: "Tài khoản",
    login: "Đăng nhập / Đăng ký",
    desktopNavLabel: "Điều hướng chính",
    mobileNavLabel: "Điều hướng di động",
    languageLabel: "Chọn ngôn ngữ gợi ý",
    footerTagline: "Hành trình mới bắt đầu từ những nơi gần bạn.",
    footerDescription: "Khám phá Chungnam và tạo lịch trình của riêng bạn.",
    footerNotice: "Vui lòng kiểm tra giờ mở cửa và giá trước khi đến.",
    terms: "Điều khoản",
    privacy: "Quyền riêng tư",
  },
};
