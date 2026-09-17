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
  language?: string;
}

/**
 * 확정된 코스 데이터를 바탕으로 OpenAI를 호출하여 맞춤형 추천 이유(Storytelling)를 생성합니다.
 * @param traveler 대표 여행자 프로필 정보
 * @param placeNames 방문할 관광지 이름 배열 (예: ['공산성', '무령왕릉', '부여소부리'])
 * @returns AI가 작성한 영문/국문 추천 근거 텍스트
 */
export async function generateCourseStory(
  traveler: TravelerProfile,
  placeNames: string[]
) {
  const fallbackText:Record<string,string>={Korean:'선택한 조건으로 여행 일정을 구성했습니다. 운영시간과 실제 이용 요금은 방문 전에 확인해 주세요.',English:'Your itinerary follows the selected preferences. Please check opening hours and actual prices before visiting.',Japanese:'選択した条件で旅行日程を作成しました。訪問前に営業時間と実際の料金をご確認ください。',Vietnamese:'Lịch trình được lập theo các lựa chọn của bạn. Vui lòng kiểm tra giờ mở cửa và giá thực tế trước khi đến.'};
  const fallback = fallbackText[traveler.language || 'Korean'] || fallbackText.Korean;

  if (!process.env.OPENAI_API_KEY) {
    console.warn("[경고] OPENAI_API_KEY가 없어 기본 추천 설명을 반환합니다.");
    return fallback;
  }

  const prompt = `
    # ROLE

    You are a professional local tour storyteller for Chungcheongnam-do, South Korea.

    Your role is NOT to recommend destinations.
    The itinerary has already been selected by our recommendation system.
    Your only job is to explain why this itinerary suits the traveler.

    # TRAVELER PROFILE

    Name: ${traveler.name}
    Country: ${traveler.country}
    Travel Focus: ${traveler.focus}
    Trip Duration: ${traveler.duration}

    # CONFIRMED ITINERARY

    ${placeNames.map((place, index) => `${index + 1}. ${place}`).join("\n")}

    # STRICT RULES

    - Do NOT add, remove, replace, or recommend any destinations.
    - Do NOT invent festivals, events, restaurants, activities, facilities, transportation options, or historical facts.
    - Do NOT assume seasonal events unless they are explicitly provided.
    - Only use the traveler profile and the confirmed itinerary.
    - If information is insufficient, simply avoid making unsupported claims.
    - Keep the tone warm, elegant, and inspiring, like a premium travel magazine.

    # TASK

    Write a short personalized explanation (3–4 sentences) describing why this itinerary matches the traveler's interests and travel style.

    Write only in the requested language: ${traveler.language || "Korean"}. Do not claim budget compliance, accessibility, seasonal availability or actual transport verification.
    # OUTPUT FORMAT

    Return 3-4 sentences in the requested language. Do not use bilingual sections.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    return response.choices[0].message.content?.trim() || fallback;
  } catch (error) {
    console.error("[오류] OpenAI 추천 이유 생성 실패:", error);
    return fallback;
  }
}


/**
 * [관리자 전용] 프롬프트 랩(Prompt Lab)에서 실시간으로 프롬프트를 테스트하기 위한 함수
 * @param prompt 사용자가 직접 작성한 프롬프트 문자열
 */
export async function testCustomPrompt(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 없습니다.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800, // 넉넉하게 설정
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error: any) {
    console.error('[오류] 프롬프트 테스트 실패:', error);
    throw new Error(error.message);
  }
}

/**
 * [관리자 전용] 관광지 한국어 이름과 주소를 영문으로 자동 번역합니다.
 * @param nameKo 한국어 이름
 * @param addressKo 한국어 주소
 */
export async function translatePlaceInfo(nameKo: string, addressKo: string | null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 없습니다.');
  }

  // JSON 형태로 확실히 받기 위한 프롬프트
  const prompt = `
    You are an expert Korean to English translator for a tourism platform.
    Translate the following Korean tourist attraction name and address into natural English.
    
    Korean Name: ${nameKo}
    Korean Address: ${addressKo || 'N/A'}

    Return ONLY a valid JSON object with EXACTLY these two keys:
    - "name_en": The translated English name.
    - "address_en": The translated English address (leave as empty string if N/A).
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // 번역은 창의성보다 정확성이 중요하므로 낮게 설정
      response_format: { type: "json_object" }, // JSON 출력 강제
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error: any) {
    console.error('[오류] AI 자동 번역 실패:', error);
    throw new Error(error.message);
  }
}

/**
 * [관리자 전용] 관광지의 결측치 데이터(설명, 전화번호, 웹사이트, 운영시간, 휴무일)를 AI를 통해 생성/검색합니다.
 * @param nameKo 한국어 관광지 이름
 * @param addressKo 한국어 주소
 */
export async function generateMissingPlaceData(nameKo: string, addressKo: string | null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 없습니다.');
  }

  // 1. 카카오 로컬 API를 통해 정확한 전화번호와 웹사이트(place_url) 검색
  let fetchedPhone = null;
  let fetchedWebsite = null;
  
  if (process.env.KAKAO_REST_API_KEY) {
    try {
      // 주소 또는 이름으로 카카오 장소 검색
      const query = addressKo ? `${addressKo} ${nameKo}` : nameKo;
      const kakaoRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`, {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
      });
      
      if (kakaoRes.ok) {
        const kakaoData = await kakaoRes.json();
        if (kakaoData.documents && kakaoData.documents.length > 0) {
          const doc = kakaoData.documents[0];
          fetchedPhone = doc.phone || null;
          fetchedWebsite = doc.place_url || null;
        }
      }
    } catch (e) {
      console.error('카카오 로컬 API 검색 실패:', e);
    }
  }

  // 2. OpenAI에는 정보가 없는 컬럼(설명, 운영시간, 휴무일)의 생성만 요청
  const prompt = `
    You are a local guide for Chungcheongnam-do, South Korea.
    Target Attraction:
    - Name: ${nameKo}
    - Address: ${addressKo || 'N/A'}

    Return ONLY a valid JSON object with exactly these 3 keys. Use null if unsure.
    
    - "description": A natural Korean description (3-4 sentences) explaining what this place is and its features.
    - "opening_hours": Operating hours in Korean (e.g., "09:00 - 18:00").
    - "closed_days": Closed days in Korean (e.g., "매주 월요일 휴무", "연중무휴").
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }, 
    });

    const content = response.choices[0].message.content || "{}";
    const aiData = JSON.parse(content);

    // 3. 카카오 검색 결과와 AI 생성 결과를 병합하여 반환
    return {
      description: aiData.description || null,
      phone: fetchedPhone,
      website: fetchedWebsite,
      opening_hours: aiData.opening_hours || null,
      closed_days: aiData.closed_days || null
    };

  } catch (error: any) {
    console.error(`[오류] AI 결측치 생성 실패 (${nameKo}):`, error);
    throw new Error(error.message);
  }
}
