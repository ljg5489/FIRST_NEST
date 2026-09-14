import 'server-only';
import {createHmac} from 'node:crypto';
import {headers} from 'next/headers';
import {getSupabaseAdmin} from '@/services/supabase/admin';

// Shared database counters apply across Vercel instances; raw IP addresses are not stored.
export async function allowAIRequest(kind:'recommend'|'admin', userId?:string) {
  const incoming = await headers();
  const address = process.env.VERCEL ? incoming.get('x-vercel-forwarded-for') || incoming.get('x-forwarded-for') || 'unknown' : 'local';
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return false;
  const bucket = `${kind}:${createHmac('sha256',secret).update(userId || address.split(',')[0].trim()).digest('hex')}`;
  const {data,error} = await getSupabaseAdmin().rpc('consume_ai_request',{p_bucket:bucket,p_limit:kind === 'admin' ? 30 : 20});
  return !error && data === true;
}
