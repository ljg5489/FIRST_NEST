// 파일 위치: src/app/api/recommend/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { generateCourseStory } from '@/lib/openai';
import { getDrivingRoute } from '@/lib/kakao-rest';
import { getAttractions } from '@/lib/data'; // 💡 실제 DB 연동 함수 임포트

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { traveler } = body;

    if (!traveler) {
      return NextResponse.json({ error: '여행자 정보가 부족합니다.' }, { status: 400 });
    }

    console.log(`[API] 동적 추천 엔진 가동 시작 - 대상: ${traveler.name || 'Custom'}`);

    // =====================================================================
    // STEP 1: 규칙 기반(Rule-based) DB 후보 선정
    // =====================================================================
    // 1-1. 관심사 문자열("History, Local Food")을 태그 배열로 파싱
    const tags = traveler.focus 
      ? traveler.focus.split(',').map((t: string) => t.trim()) 
      : [];
    
    // 1-2. DB에서 태그와 일치하는 관광지 1차 추출
    let candidatePlaces = await getAttractions(tags);
    
    // 만약 조건에 맞는 데이터가 0개라면, 전체 관광지 목록으로 폴백(Fallback)
    if (!candidatePlaces || candidatePlaces.length === 0) {
      console.warn('[안내] 태그에 맞는 관광지가 부족하여 전체 DB에서 탐색합니다.');
      candidatePlaces = await getAttractions();
    }

    // 1-3. 카카오맵 검증을 위해 위도/경도가 확실히 있는 데이터만 필터링
    const validPlaces = candidatePlaces.filter(
      (p: any) => p.latitude && p.longitude
    );

    // 1-4. 여행 일수(days)에 비례하여 코스 갯수 선정 (기본 하루에 2곳씩)
    const days = Number(traveler.days) || 1;
    const targetCount = Math.max(2, days * 2); 
    
    // 1-5. 매번 똑같은 결과가 나오지 않도록 가벼운 셔플(Shuffle) 적용
    const shuffled = validPlaces.sort(() => 0.5 - Math.random());
    const selectedPlaces = shuffled.slice(0, targetCount);

    if (selectedPlaces.length === 0) {
       return NextResponse.json({ error: 'DB에 유효한 관광지 데이터가 없습니다.' }, { status: 404 });
    }

    // 화면 및 프롬프트용 문자열 생성
    const placeNames = selectedPlaces.map((p: any) => p.name_ko);
    const routeString = placeNames.join(' ➔ ');

    // =====================================================================
    // STEP 2: 이동 거리/시간 검증 (Kakao REST API 연동)
    // =====================================================================
    let totalDistance = 0;
    let totalDuration = 0;
    let reliability = 'High';

    // 선택된 N개의 관광지를 순서대로 돌면서 (A->B, B->C, C->D) 거리 누적
    for (let i = 0; i < selectedPlaces.length - 1; i++) {
      const origin = { lat: selectedPlaces[i].latitude, lng: selectedPlaces[i].longitude };
      const destination = { lat: selectedPlaces[i+1].latitude, lng: selectedPlaces[i+1].longitude };
      
      const routeInfo = await getDrivingRoute(origin, destination);
      
      if (routeInfo) {
        totalDistance += parseFloat(routeInfo.distance);
        totalDuration += routeInfo.duration;
      }
    }

    // [Rule-based 알고리즘] 총 이동 시간이 (일수 * 90분)을 초과하면 피로도가 높다고 판단해 신뢰도를 낮춤
    if (totalDuration > days * 90) {
      reliability = 'Medium';
    }
    if (totalDuration > days * 150) {
      reliability = 'Low';
    }

    // =====================================================================
    // STEP 3: AI 맞춤형 스토리텔링 생성 (OpenAI 연동)
    // =====================================================================
    const aiStory = await generateCourseStory(
      {
        name: traveler.name,
        country: traveler.country,
        focus: traveler.focus,
        duration: `${days} Days`,
      },
      placeNames
    );

    // =====================================================================
    // STEP 4: 최종 데이터 응답 구조화
    // =====================================================================
    const result = {
      route: routeString,
      aiStory: aiStory,
      metrics: {
        dispersion: Math.floor(Math.random() * 15) + 80, // (8월 2주차에 실제 로직으로 교체 예정)
        friendly: Math.floor(Math.random() * 10) + 85,   
        reliability: reliability, 
        estimatedDistance: totalDistance.toFixed(1), // 계산된 진짜 거리
        estimatedTime: totalDuration, // 계산된 진짜 시간
      },
      // 💡 프론트엔드가 지도에 마커를 찍거나 상세 페이지를 렌더링할 수 있도록 원본 객체 배열도 같이 내려줌
      places: selectedPlaces, 
    };

    console.log(`[API] 동적 추천 완료 - 코스: ${routeString}`);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[오류] 동적 API 라우트 처리 실패:', error);
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}