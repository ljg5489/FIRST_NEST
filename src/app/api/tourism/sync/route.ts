// 파일 위치: src/app/api/tourism/sync/route.ts
// 파일 명: route.ts

import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

// 새로 추가된 영어 매핑 함수 임포트
import { syncEnglishPlacesToDB } from '../../../../services/supabase/sync';

function isAuthorized(request: Request) {
  const expectedSecret = process.env.SYNC_SECRET;
  const authorization = request.headers.get('authorization');
  const providedSecret = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!expectedSecret || !providedSecret) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSecret);
  const providedBuffer = Buffer.from(providedSecret);

  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function POST(request: Request) {
  if (!process.env.SYNC_SECRET) {
    return NextResponse.json(
      { success: false, message: 'SYNC_SECRET이 설정되지 않았습니다.' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: '인증되지 않은 요청입니다.' },
      { status: 401 },
    );
  }

  try {
    // 다국어(영어) 데이터 매핑 함수 실행
    const result = await syncEnglishPlacesToDB();

    return NextResponse.json(result, {
      status: result.success ? 200 : 502,
    });
  } catch (error) {
    console.error('동기화 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '동기화 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}



// import { timingSafeEqual } from 'node:crypto';
// import { NextResponse } from 'next/server';

// // 장소 추가 적재 작업은 끝났으므로 주석 처리
// // import { syncMissingPlacesToDB } from '../../../../services/supabase/sync';

// // 💡 관계형 테이블(place_tags) 분배 함수 임포트 활성화
// import { syncRelationsFromRawData } from '../../../../services/supabase/sync-relations';

// function isAuthorized(request: Request) {
//   const expectedSecret = process.env.SYNC_SECRET;
//   const authorization = request.headers.get('authorization');
//   const providedSecret = authorization?.startsWith('Bearer ')
//     ? authorization.slice('Bearer '.length)
//     : '';

//   if (!expectedSecret || !providedSecret) {
//     return false;
//   }

//   const expectedBuffer = Buffer.from(expectedSecret);
//   const providedBuffer = Buffer.from(providedSecret);

//   return (
//     expectedBuffer.length === providedBuffer.length &&
//     timingSafeEqual(expectedBuffer, providedBuffer)
//   );
// }

// export async function POST(request: Request) {
//   if (!process.env.SYNC_SECRET) {
//     return NextResponse.json(
//       { success: false, message: 'SYNC_SECRET이 설정되지 않았습니다.' },
//       { status: 503 },
//     );
//   }

//   if (!isAuthorized(request)) {
//     return NextResponse.json(
//       { success: false, message: '인증되지 않은 요청입니다.' },
//       { status: 401 },
//     );
//   }

//   try {
//     // 1단계: 장소 적재 완료 (주석 처리)
//     // const result = await syncMissingPlacesToDB();
    
//     // 2단계: 💡 place_tags 테이블 적재 시작
//     const result = await syncRelationsFromRawData();

//     return NextResponse.json(result, {
//       status: result.success ? 200 : 502,
//     });
//   } catch (error) {
//     console.error('동기화 API 오류:', error);
//     return NextResponse.json(
//       { success: false, message: '동기화 중 오류가 발생했습니다.' },
//       { status: 500 },
//     );
//   }
// }

// 다시 사용 가능성이 있는 코드라 주석으로 남겨둠 
// // 파일 위치: src/app/api/tourism/sync/route.ts
// // 파일 명: route.ts

// import { timingSafeEqual } from 'node:crypto';
// import { NextResponse } from 'next/server';

// // 사용하지 않는 기존 동기화 함수 임포트 주석 처리 - DB에 직접 적재할 때 사용했던 함수
// // import { syncTouristSpotsToDB } from '../../../../services/supabase/sync';

// // 관계형 테이블 분배 함수 임포트
// import { syncRelationsFromRawData } from '../../../../services/supabase/sync-relations';

// function isAuthorized(request: Request) {
//   const expectedSecret = process.env.SYNC_SECRET;
//   const authorization = request.headers.get('authorization');
//   const providedSecret = authorization?.startsWith('Bearer ')
//     ? authorization.slice('Bearer '.length)
//     : '';

//   if (!expectedSecret || !providedSecret) {
//     return false;
//   }

//   const expectedBuffer = Buffer.from(expectedSecret);
//   const providedBuffer = Buffer.from(providedSecret);

//   return (
//     expectedBuffer.length === providedBuffer.length &&
//     timingSafeEqual(expectedBuffer, providedBuffer)
//   );
// }

// export async function POST(request: Request) {
//   if (!process.env.SYNC_SECRET) {
//     return NextResponse.json(
//       { success: false, message: 'SYNC_SECRET이 설정되지 않았습니다.' },
//       { status: 503 },
//     );
//   }

//   if (!isAuthorized(request)) {
//     return NextResponse.json(
//       { success: false, message: '인증되지 않은 요청입니다.' },
//       { status: 401 },
//     );
//   }

//   try {
//     // 기존 데이터 수집 함수 실행 주석 처리
//     // const result = await syncTouristSpotsToDB();
    
//     // 원본 데이터 기반 관계형 테이블 분배 함수 실행 sync-relations.ts 파일에 있는 함수 실행!!!!
//     const result = await syncRelationsFromRawData();

//     return NextResponse.json(result, {
//       status: result.success ? 200 : 502,
//     });
//   } catch (error) {
//     console.error('동기화 API 오류:', error);
//     return NextResponse.json(
//       { success: false, message: '동기화 중 오류가 발생했습니다.' },
//       { status: 500 },
//     );
//   }
// }