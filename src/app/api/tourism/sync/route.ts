// 진규 코드

import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import { syncTouristSpotsToDB } from '../../../../services/supabase/sync';

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
    const result = await syncTouristSpotsToDB();

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