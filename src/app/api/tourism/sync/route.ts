// 파일 위치: src/app/api/tourism/sync/route.ts
// 파일 명: route.ts

import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

// 사용하지 않는 기존 동기화 함수 임포트 주석 처리 - DB에 직접 적재할 때 사용했던 함수
// import { syncTouristSpotsToDB } from '../../../../services/supabase/sync';

// 관계형 테이블 분배 함수 임포트
import { syncRelationsFromRawData } from '../../../../services/supabase/sync-relations';

function isAuthorized(request: Request) {
  const expectedSecret = process.env.SYNC_SECRET;
  const authorization = request.headers.get('authorization');
  const providedSecret = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!expectedSecret || !providedSecret) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSecret);
  const providedBuffer = Buffer.from(providedSecret);

  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function POST(request: Request) {
  if (!process.env.SYNC_SECRET) {
    return NextResponse.json(
      { success: false, message: 'SYNC_SECRET이 설정되지 않았습니다.' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: '인증되지 않은 요청입니다.' },
      { status: 401 },
    );
  }

  try {
    // 기존 데이터 수집 함수 실행 주석 처리
    // const result = await syncTouristSpotsToDB();
    
    // 원본 데이터 기반 관계형 테이블 분배 함수 실행 sync-relations.ts 파일에 있는 함수 실행!!!!
    const result = await syncRelationsFromRawData();

    return NextResponse.json(result, {
      status: result.success ? 200 : 502,
    });
  } catch (error) {
    console.error('동기화 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '동기화 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}