// 파일 위치: src/app/admin/layout.tsx
// 파일 명: layout.tsx

// 이 레이아웃은 관리자용 페이지들의 공통 레이아웃

import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        {/* 모든 admin 하위 페이지들은 이 children 안으로 들어옵니다 */}
        {children}
      </body>
    </html>
  );
}