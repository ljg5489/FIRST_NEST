// 파일 위치: src/lib/openai.ts
// 파일 명: openai.ts

import OpenAI from 'openai';

// 서버 환경에서만 실행되므로 NEXT_PUBLIC_ 이 붙지 않는 안전한 환경변수 사용
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 여행자 프로필 타입 정의
export interface TravelerProfile {
  name: string;
  country: string;
  focus: string;
  duration: string;
}

/**
 * 확정된 코스 데이터를 바탕으로 OpenAI를 호출하여 맞춤형 추천 이유(Storytelling)를 생성합니다.
 * @param traveler 대표 여행자 프로필 정보
 * @param placeNames 방문할 관광지 이름 배열 (예: ['공산성', '무령왕릉', '부여소부리'])
 * @returns AI가 작성한 영문 추천 근거 텍스트
 */
export async function generateCourseStory(
  traveler: TravelerProfile,
  placeNames: string[]
) {
  // 1. API 키 누락 방지 (로컬 테스트 시 에러 나지 않도록 더미 텍스트 반환)
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[경고] OPENAI_API_KEY가 없습니다. 더미 텍스트를 반환합니다.');
    return `[Dummy] This route (${placeNames.join(' → ')}) is highly recommended for you, ${traveler.name}! It perfectly matches your interest in ${traveler.focus}.`;
  }

  // 2. 프롬프트 엔지니어링 (환각 방지를 위해 선택된 관광지를 명시하고 '이유'만 설명하게 통제)
  const prompt = `
    You are an expert local tour guide in Chungcheongnam-do, South Korea.
    Your client is ${traveler.name} from ${traveler.country}.
    Their travel focus is: "${traveler.focus}".
    Their trip duration is: "${traveler.duration}".
    
    You have already planned the following perfect itinerary for them:
    [${placeNames.join(' -> ')}]

    Write a warm, engaging, and highly personalized short explanation (3-4 sentences) explaining WHY this specific route perfectly matches their focus and background. 
    Do not invent new places. Only explain the value of the provided itinerary.
    Write the response in English.
  `;

  try {
    // 3. OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // MVP 단계에서는 빠르고 가성비 좋은 4o-mini 권장
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // 0.7 정도가 너무 뻔하지 않으면서 안정적인 문장을 출력함
      max_tokens: 300,
    });

    return response.choices[0].message.content?.trim() || "Enjoy your personalized trip to Chungcheongnam-do!";
  } catch (error) {
    console.error('[오류] OpenAI 추천 이유 생성 실패:', error);
    return "An error occurred while generating the course explanation, but this route is carefully selected based on your preferences.";
  }
}