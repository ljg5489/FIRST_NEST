import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {UUID,validItinerary} from '@/lib/itinerary';

export async function GET(request:Request) {
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'로그인이 필요합니다.'},{status:401});
  const id=Number(new URL(request.url).searchParams.get('id'));
  if(!Number.isSafeInteger(id)||id<=0)return NextResponse.json({error:'잘못된 코스입니다.'},{status:400});
  const {data,error}=await supabase.from('courses').select('id,title,itinerary,updated_at,client_request_id').eq('id',id).eq('user_id',user.id).maybeSingle();
  if(error)return NextResponse.json({error:'코스를 불러오지 못했습니다.'},{status:500});
  if(!data)return NextResponse.json({error:'코스를 찾을 수 없습니다.'},{status:404});
  return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(request:Request) {
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'로그인 후 저장할 수 있습니다.'},{status:401});
  if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'허용되지 않은 요청입니다.'},{status:403});
  try {
    const raw=await request.text();if(raw.length>100000)return NextResponse.json({error:'일정이 너무 큽니다.'},{status:413});
    const {itinerary,requestId,courseId,updatedAt}=JSON.parse(raw);
    if(!validItinerary(itinerary)||typeof requestId!=='string'||!UUID.test(requestId)||courseId!==undefined&&(!Number.isSafeInteger(courseId)||courseId<=0)||courseId!==undefined&&(typeof updatedAt!=='string'||!Number.isFinite(Date.parse(updatedAt))))return NextResponse.json({error:'일정 정보를 확인해 주세요.'},{status:400});
    const {data,error}=await supabase.rpc('save_travel_course',{p_title:itinerary.title,p_itinerary:itinerary,p_request_id:requestId,p_course_id:courseId??null,p_expected_updated_at:updatedAt??null});
    if(error){const status=error.code==='PT409'?409:error.code==='42501'?404:error.code==='22023'||error.code==='22P02'?400:500;return NextResponse.json({error:status===409?'다른 창에서 수정된 일정입니다. 다시 열어 확인한 뒤 저장해 주세요.':status===404?'저장할 코스를 찾을 수 없습니다.':'저장하지 못했습니다. 일정을 확인하고 다시 시도해 주세요.'},{status});}
    return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}});
  }catch{return NextResponse.json({error:'올바른 일정 정보를 보내 주세요.'},{status:400});}
}
