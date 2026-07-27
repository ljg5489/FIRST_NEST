// 파일 위치: src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    '.env.local에 NEXT_PUBLIC_SUPABASE_URL과 Supabase publishable key가 필요합니다.',
  );
}

// 공개 조회용 클라이언트입니다. places의 RLS 정책이 항상 적용됩니다.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);