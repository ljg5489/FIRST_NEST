// 파일 위치: src/app/api/admin/export-csv/route.ts
// 파일 명: route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/services/supabase/admin';
import {isAdminTable} from '@/lib/admin-policy';

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '';
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

import {guardAdminRequest} from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    if (!isAdminTable(table)) return NextResponse.json({error:'허용되지 않은 테이블입니다.'},{status:400});

    if (!table) {
      return NextResponse.json({ error: '테이블 파라미터가 필요합니다.' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      return NextResponse.json({ error: '유효하지 않은 테이블 이름입니다.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      throw new Error('서버 관리자 키가 설정되지 않았습니다.');
    }

    let allData: Record<string, any>[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    // Supabase 최대 반환 제한을 우회하기 위해 1000건씩 분할 반복 조회
    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .order('id', { ascending: false })
        .range(from, from + step - 1);

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        allData = allData.concat(data);
        from += step;
        
        // 가져온 데이터가 요청한 단위(1000)보다 적으면 마지막 페이지로 간주
        if (data.length < step) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (allData.length === 0) {
      return NextResponse.json({ error: '해당 테이블에 데이터가 존재하지 않습니다.' }, { status: 404 });
    }

    const headers = Object.keys(allData[0]);
    const csvRows = [headers.map(escapeCsvField).join(',')];

    for (const row of allData) {
      const values = headers.map(header => escapeCsvField(row[header]));
      csvRows.push(values.join(','));
    }

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const filename = `${table}_export_전체_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error: any) {
    console.error('CSV Export 에러:', error);
    return NextResponse.json({ error: error.message || '알 수 없는 에러가 발생했습니다.' }, { status: 500 });
  }
}
