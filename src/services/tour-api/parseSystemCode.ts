// 파일 위치: src/services/tour-api/parseSystemCode.ts
// 파일 명: parseSystemCode.ts
// systemcode.json 파싱 및 매핑 하는 코드 

import systemCodes from './systemcode.json';

interface RawSystemCode {
  lclsSystm1Cd: string;
  lclsSystm1Nm: string;
  lclsSystm2Cd: string;
  lclsSystm2Nm: string;
  lclsSystm3Cd: string;
  lclsSystm3Nm: string;
  rnum: number;
}

export function getGroupedSystemCodes() {
  const codes = systemCodes as RawSystemCode[];
  const tree: Record<string, any> = {};

  codes.forEach((item) => {
    const {
      lclsSystm1Cd: code1, lclsSystm1Nm: name1,
      lclsSystm2Cd: code2, lclsSystm2Nm: name2,
      lclsSystm3Cd: code3, lclsSystm3Nm: name3
    } = item;

    // 1. 대분류 (lclsSystm1) 객체 초기화
    if (!tree[code1]) {
      tree[code1] = { 
        name: name1, 
        children: {} 
      };
    }

    // 2. 중분류 (lclsSystm2) 객체 초기화
    if (!tree[code1].children[code2]) {
      tree[code1].children[code2] = { 
        name: name2, 
        children: {} 
      };
    }

    // 3. 소분류 (lclsSystm3) 매핑
    tree[code1].children[code2].children[code3] = name3;
  });

  return tree;
}

// 터미널 또는 서버 로그에 출력하기 위한 함수
export function printGroupedCodes() {
  const groupedData = getGroupedSystemCodes();
  console.log(JSON.stringify(groupedData, null, 2));
}