// 파일 위치: src/app/api/tourism/preview/route.ts
// 파일 명: route.ts

import { NextResponse } from 'next/server';
import { fetchChungnamTouristSpots } from '@/services/tour-api/area';
import { fetchSystemCodes } from '@/services/tour-api/systemcode';
import { getGroupedSystemCodes } from '@/services/tour-api/parseSystemCode';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'spots'; 

    // 1. 분류 체계 코드 스캔 요청인 경우
    if (type === 'codes') {
      console.log('[미리보기] Tour API 분류체계 스캔 시작...');
      let codePageNo = 1;
      let allSystemCodes: any[] = [];
      
      while (true) {
        const codes = await fetchSystemCodes(codePageNo);
        if (!codes || codes.length === 0) break;
        allSystemCodes = allSystemCodes.concat(codes);
        codePageNo++;
      }

      const groupedCodes = getGroupedSystemCodes();   

      return NextResponse.json({
        success: true,
        type: 'codes',
        systemCodesCount: allSystemCodes.length,
        systemCodes: allSystemCodes,
        groupedSystemCodes: groupedCodes
      });
    }

    // 2. 지역 기반 데이터 스캔 요청인 경우 (기본값)
    console.log('[미리보기] Tour API 지역 기반 데이터 스캔 시작...');
    let pageNo = 1;
    let allItems: any[] = [];
    
    while (true) {
      const spots = await fetchChungnamTouristSpots('kor', pageNo);
      if (!spots || spots.length === 0) break;
      allItems = allItems.concat(spots);
      pageNo++;
    }

    const typeSummary = allItems.reduce((acc, curr) => {
      const t = curr.contenttypeid || 'Unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const samples = allItems.slice(0, 50);

    return NextResponse.json({
      success: true,
      type: 'spots',
      totalCount: allItems.length,
      typeSummary,
      samples
    });

  } catch (error: any) {
    console.error('미리보기 에러:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}