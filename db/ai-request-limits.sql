create table if not exists public.ai_request_limits (
  bucket text primary key,
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0)
);
alter table public.ai_request_limits enable row level security;
revoke all on public.ai_request_limits from anon, authenticated;
grant all on public.ai_request_limits to service_role;
create or replace function public.consume_ai_request(p_bucket text,p_limit integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  if length(p_bucket) > 100 or p_limit not between 1 and 100 then return false; end if;
  delete from public.ai_request_limits where window_start < now() - interval '1 day';
  insert into public.ai_request_limits(bucket,window_start,request_count)
    values(p_bucket,now(),1)
  on conflict(bucket) do update set
    window_start=case when public.ai_request_limits.window_start < now()-interval '10 minutes' then now() else public.ai_request_limits.window_start end,
    request_count=case when public.ai_request_limits.window_start < now()-interval '10 minutes' then 1 else public.ai_request_limits.request_count+1 end
  returning request_count into v_count;
  return v_count<=p_limit;
end $$;
revoke all on function public.consume_ai_request(text,integer) from public,anon,authenticated;
grant execute on function public.consume_ai_request(text,integer) to service_role;
