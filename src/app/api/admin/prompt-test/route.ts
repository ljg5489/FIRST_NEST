// 파일 위치: src/app/api/admin/prompt-test/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { testCustomPrompt } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '프롬프트 내용이 없습니다.' }, { status: 400 });
    }

    const result = await testCustomPrompt(prompt);

    return NextResponse.json({ result }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [API] 프롬프트 테스트 에러:', error);
    return NextResponse.json({ error: error.message || '서버 업데이트 실패' }, { status: 500 });
  }
}