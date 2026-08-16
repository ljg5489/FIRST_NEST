// 파일 위치: src/app/api/editor/update/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/services/supabase/admin';

export async function POST(request: Request) {
  try {
    const { table, id, updates } = await request.json();

    if (!table || !id || !updates) {
      return NextResponse.json({ error: '필수 데이터 누락' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [API] 범용 업데이트 에러:', error);
    return NextResponse.json({ error: '서버 업데이트 실패' }, { status: 500 });
  }
}