// 파일 위치: src/app/api/admin/db-viewer/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/services/supabase/admin';
import {isAdminTable} from '@/lib/admin-policy';

import {guardAdminRequest} from '@/lib/admin-auth';

export async function POST(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  try {
    const { table } = await request.json();
    if (!isAdminTable(table)) return NextResponse.json({error:'허용되지 않은 테이블입니다.'},{status:400});
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      throw new Error('서버 관리자 키가 설정되지 않았습니다.');
    }

    // count: 'exact' 옵션으로 전체 데이터 개수를 가져오고, 실제 데이터는 성능을 위해 최근 100건만 조회
    const { data, count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact' })
      .order('id', { ascending: false }) // 최신 데이터 우선
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data, count });
  } catch (error: any) {
    console.error('DB Viewer 에러:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
