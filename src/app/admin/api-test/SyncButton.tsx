// 파일 위치: src/app/admin/api-test/SyncButton.tsx
// 파일 명: SyncButton.tsx

'use client';

import { useState } from 'react';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!confirm('DB 동기화를 실행하시겠습니까? 시간이 소요될 수 있습니다.')) return;
    
    setLoading(true);
    try {
      // 작성해두신 API 라우트를 호출합니다. (GET 방식 가정)
      const res = await fetch('/api/tourism/sync');
      
      if (res.ok) {
        alert('동기화가 완료되었습니다. 터미널 로그를 확인해주세요.');
      } else {
        alert('동기화 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('API 호출에 실패했습니다. 서버 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={loading}
      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 transition"
    >
      {loading ? '실행 중...' : 'DB 동기화 실행'}
    </button>
  );
}