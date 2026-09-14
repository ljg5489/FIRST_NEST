import 'server-only';
import {NextResponse} from 'next/server';
import {redirect} from 'next/navigation';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {isAdminUser} from '@/lib/admin-policy';
import {allowAIRequest} from '@/lib/ai-rate-limit';

export async function getAdminIdentity() {
  const supabase=await createServerSupabaseClient();
  const {data:{user},error}=await supabase.auth.getUser();
  return {user:error?null:user,admin:!error&&isAdminUser(user)};
}
export async function requireAdminPage() {
  const {user,admin}=await getAdminIdentity();
  if(!user)redirect('/login?next=/admin');
  if(!admin)redirect('/account?error=admin-only');
}
export async function guardAdminRequest(request: Request) {
  const {user,admin}=await getAdminIdentity();
  if(!user)return NextResponse.json({error:'로그인이 필요합니다.'},{status:401});
  if(!admin)return NextResponse.json({error:'관리자 권한이 필요합니다.'},{status:403});
  const origin=request.headers.get('origin');
  if(!['GET','HEAD'].includes(request.method)&&origin!==new URL(request.url).origin)return NextResponse.json({error:'허용되지 않은 요청 출처입니다.'},{status:403});
  if(Number(request.headers.get('content-length')||0)>65536)return NextResponse.json({error:'요청이 너무 큽니다.'},{status:413});
  if (['/api/admin/translate','/api/admin/generate-data','/api/admin/prompt-test'].includes(new URL(request.url).pathname) && !await allowAIRequest('admin',user.id)) return NextResponse.json({error:'AI 요청이 많습니다. 10분 뒤 다시 시도해 주세요.'},{status:429});
  return null;
}
