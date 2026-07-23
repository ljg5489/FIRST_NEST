// 파일 위치: src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 관리자 키 불러오기
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('.env.local에 Supabase 환경변수가 누락되었습니다.');
}

// 프론트엔드/일반 사용자용 (읽기 전용, RLS 적용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버/관리자용 (쓰기/삭제 가능, RLS 무시)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;