// 파일 위치: src/app/api/tourism/sync/route.ts
import { NextResponse } from 'next/server';
import { syncTouristSpotsToDB } from '../../../../services/supabase/sync';

// GET 요청이 오면 동기화 함수를 실행합니다.
export async function GET() {
  try {
    console.log('API 라우트 호출됨: 수동 DB 동기화 시작');
    const result = await syncTouristSpotsToDB();
    
    // 결과를 화면(브라우저)에 JSON 형태로 보여줍니다.
    return NextResponse.json({
      message: '동기화 완료',
      result
    });
  } catch (error) {
    console.error('동기화 API 에러:', error);
    return NextResponse.json(
      { success: false, message: '동기화 중 에러 발생' }, 
      { status: 500 }
    );
  }
}