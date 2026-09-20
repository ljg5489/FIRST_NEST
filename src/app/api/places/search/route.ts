import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase/server';
export async function GET(request:Request){
  const q=new URL(request.url).searchParams.get('q')?.trim()??'';
  if(q.length<2||q.length>80)return NextResponse.json({places:[]});
  const searchTerm=q.replace(/[^\p{L}\p{N}\s-]/gu,'').trim();
  if(searchTerm.length<2)return NextResponse.json({places:[]});
  const supabase=await createServerSupabaseClient();
  const {data,error}=await supabase.from('places').select('id,name_ko,name_en,address,address_en,latitude,longitude').eq('is_active',true).or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`).order('name_ko').limit(10);
  if(error)return NextResponse.json({error:'장소를 검색하지 못했습니다.'},{status:503});
  return NextResponse.json({places:data});
}
