// 파일 위치: src/app/api/admin/prompt-test/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { testCustomPrompt } from '@/lib/openai';

import {guardAdminRequest} from '@/lib/admin-auth';

export async function POST(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  try {
    const { prompt } = await request.json();
    if (typeof prompt!=='string'||prompt.length>10000) return NextResponse.json({error:'프롬프트는 10,000자 이내로 입력하세요.'},{status:400});

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
