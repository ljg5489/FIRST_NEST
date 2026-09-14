// 파일 위치: src/app/api/recommend/route.ts
// 파일 명: route.ts
//
// 실제 로직은 course-builder.ts로 옮김 (ResultsPage 서버 컴포넌트와 공유하기 위함).
// 이 파일은 그 함수를 부르는 얇은 API 래퍼 역할만 함.
// 프론트에서 클라이언트 사이드로 재추천(예: "다시 추천받기" 버튼)이 필요할 때 이 엔드포인트를 씀.

import { NextResponse } from "next/server";
import { buildTravelCourse, TravelerInput } from "@/lib/course-builder";
import {allowAIRequest} from '@/lib/ai-rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { traveler } = body as { traveler: TravelerInput };

    if (!traveler || !Number.isInteger(traveler.days) || traveler.days < 1 || traveler.days > 7 || [traveler.name,traveler.country,traveler.focus].some(v => v !== undefined && (typeof v !== 'string' || v.length > 300))) {
      return NextResponse.json({ error: "여행자 정보가 부족합니다." }, { status: 400 });
    }

    if (!await allowAIRequest('recommend')) return NextResponse.json({error:'잠시 후 다시 추천받아 주세요.'},{status:429});
    const course = await buildTravelCourse(traveler);

    if (!course) {
      return NextResponse.json({ error: "DB에 유효한 관광지 데이터가 없습니다." }, { status: 404 });
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("[오류] 동적 API 라우트 처리 실패:", error);
    return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
  }
}
