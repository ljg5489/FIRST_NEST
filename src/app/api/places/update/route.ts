// 파일 위치: src/app/api/places/update/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/services/supabase/admin';
import {validAdminUpdate} from '@/lib/admin-policy';

import {guardAdminRequest} from '@/lib/admin-auth';

export async function POST(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  try {
    const { id, name_en, address_en } = await request.json();
    if (!validAdminUpdate('places',id,{name_en,address_en:address_en??null})) return NextResponse.json({error:'잘못된 값입니다.'},{status:400});

    if (!id || !name_en) {
      return NextResponse.json({ error: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // DB 업데이트 실행 (select는 제외하여 에러 원천 차단)
    const { error } = await supabaseAdmin
      .from('places')
      .update({ 
        name_en: name_en, 
        address_en: address_en || null 
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('❌ [API] 영문 데이터 업데이트 에러:', error);
    return NextResponse.json({ error: '서버 업데이트 실패' }, { status: 500 });
  }
}
