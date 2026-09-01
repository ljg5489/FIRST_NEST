const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabasePublicConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL과 Supabase publishable key가 필요합니다.",
    );
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}
