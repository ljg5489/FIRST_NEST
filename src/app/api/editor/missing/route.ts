import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/services/supabase/admin';

export async function POST(request: Request) {
  try {
    const { table, columns } = await request.json();
    
    if (!table || !columns || columns.length === 0) {
      return NextResponse.json({ error: '테이블 또는 컬럼 정보 누락' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. 테이블이 비어있는지 먼저 확인
    const { count, error: countError } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(countError.message);
    if (count === 0) return NextResponse.json({ isEmptyTable: true, data: null }, { status: 200 });

    // 2. 💡 자료형(Type)에 맞춰서 안전한 OR 쿼리문 생성
    const orConditions = columns.map((col: { key: string, type: string }) => {
      // 텍스트형이면 null, 빈문자열(eq.), 임시값(NEED_UPDATE) 모두 잡음
      if (col.type === 'text') {
        return `${col.key}.is.null,${col.key}.eq.,${col.key}.eq.NEED_UPDATE`;
      }
      // 숫자(number), 논리(boolean), 날짜(date)형은 null인지만 체크하여 타입 에러 방지
      return `${col.key}.is.null`;
    }).join(',');

    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .or(orConditions)
      .order('id', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message); // 진짜 서버 에러 발생
    }

    return NextResponse.json({ isEmptyTable: false, data: data || null }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [API] 범용 결측치 조회 에러:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}