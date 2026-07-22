// 파일 위치: src/app/(web)/layout.tsx
// 최상위 레이아웃 파일
import '../globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TRAVEL WITH ME',
  description: '공공데이터 기반 스마트 관광 플랫폼',
}

export default function RootLayout({
  children, // 👈 여기에 반드시 중괄호가 있어야 합니다.
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}