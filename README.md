# ✈️ FIRST_NEST (Travel With Me)

충남 맞춤 여행 코스 추천 플랫폼을 위한 프로젝트 저장소입니다. 
Next.js App Router와 **도메인 주도 설계(DDD, Domain-Driven Design)** 아키텍처를 기반으로 설계되어 프론트엔드 UI와 백엔드 API/서버 로직의 관심사를 명확하게 분리했습니다.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📂 프로젝트 폴더 구조
> **최신 업데이트:** 2026.07.22.

기능(Feature)과 서비스(Service) 단위로 폴더를 분리하여 확장성과 유지보수성을 극대화한 아키텍처입니다.

```text
src
 ├─app                    # Next.js 라우팅 및 전역 설정 계층
 │  ├─globals.css
 │  ├─(web)
 │  │  ├─layout.tsx
 │  │  └─page.tsx
 │  └─api                 # Next.js 내부 API 라우트
 │      ├─map
 │      ├─recommend
 │      └─tourism
 ├─features               # 핵심 도메인별 기능 계층 (UI & Server Action)
 │  ├─map
 │  │  ├─server
 │  │  └─ui
 │  ├─recommend
 │  │  ├─server
 │  │  └─ui
 │  └─tourism
 │      ├─server
 │      └─ui
 ├─services               # 외부 API 통신 및 DB 접근 인프라 계층
 │  ├─kakao-map
 │  ├─openai
 │  ├─supabase
 │  └─tour-api
 │      ├─area.ts         
 │      ├─dongcode.ts     
 │      └─keyword.ts      
 ├─shared                 # 도메인에 종속되지 않는 공통 UI 및 라이브러리
 │  ├─lib
 │  └─ui
 └─types                  # 전역 TypeScript 타입 정의
