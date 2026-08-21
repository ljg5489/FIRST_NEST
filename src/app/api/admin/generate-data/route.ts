// 파일 위치: src/app/api/admin/generate-data/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { generateMissingPlaceData } from '@/lib/openai';
import { getSupabaseAdmin } from '@/services/supabase/admin';

export async function POST(request: Request) {
  try {
    const { id, name_ko, address } = await request.json();

    if (!id || !name_ko) {
      return NextResponse.json({ success: false, error: 'ID와 관광지 이름이 필요합니다.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      throw new Error('서버 관리자 키가 설정되지 않았습니다.');
    }

    // 1. OpenAI를 통해 결측치 데이터 5개 생성
    const aiData = await generateMissingPlaceData(name_ko, address);

    // 2. DB 업데이트 수행
    const { error: updateError } = await supabaseAdmin
      .from('places')
      .update({
        description: aiData.description,
        phone: aiData.phone,
        website: aiData.website,
        opening_hours: aiData.opening_hours,
        closed_days: aiData.closed_days,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw new Error(`DB 업데이트 실패: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, data: aiData });

  } catch (error: any) {
    console.error('결측치 데이터 생성 라우트 에러:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}