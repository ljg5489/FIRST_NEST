// 파일 위치: lib/supabase/client.ts
// 파일 명: client.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabasePublicConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabasePublicClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey);
}
