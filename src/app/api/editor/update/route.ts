// 파일 위치: src/app/api/editor/update/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/services/supabase/admin';
import {validAdminUpdate} from '@/lib/admin-policy';

import {guardAdminRequest} from '@/lib/admin-auth';

export async function POST(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  try {
    const { table, id, updates } = await request.json();
    if (!validAdminUpdate(table,id,updates)) return NextResponse.json({error:'수정할 수 없는 필드 또는 잘못된 값입니다.'},{status:400});

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
