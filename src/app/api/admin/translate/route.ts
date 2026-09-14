// 파일 위치: src/app/api/admin/translate/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { translatePlaceInfo } from '@/lib/openai';

import {guardAdminRequest} from '@/lib/admin-auth';

export async function POST(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  try {
    const { name_ko, address } = await request.json();

    if (typeof name_ko !== 'string' || !name_ko.trim() || name_ko.length > 200 || (address !== undefined && address !== null && (typeof address !== 'string' || address.length > 1000))) {
      return NextResponse.json({ error: '한국어 이름이 없습니다.' }, { status: 400 });
    }

    const translatedData = await translatePlaceInfo(name_ko, address);

    return NextResponse.json(translatedData, { status: 200 });

  } catch (error: any) {
    console.error('❌ [API] AI 번역 에러:', error);
    return NextResponse.json({ error: 'AI 번역 실패' }, { status: 500 });
  }
}
