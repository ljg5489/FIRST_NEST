alter table public.courses add column if not exists itinerary jsonb not null default '{}'::jsonb;
alter table public.courses add column if not exists client_request_id uuid;
create unique index if not exists courses_owner_request_idx on public.courses(user_id,client_request_id);

create or replace function public.save_travel_course(
  p_title text, p_itinerary jsonb, p_request_id uuid,
  p_course_id bigint default null, p_expected_updated_at timestamptz default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_id bigint; v_updated timestamptz; v_day jsonb; v_place jsonb;
  v_order integer := 0; v_count integer := 0; v_place_id uuid;
  v_seen uuid[] := '{}'::uuid[]; v_new boolean := false;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_title is null or length(btrim(p_title)) not between 1 and 120 or p_request_id is null
     or p_itinerary is null or jsonb_typeof(p_itinerary) <> 'object'
     or octet_length(p_itinerary::text)>100000 or p_itinerary->>'version' is distinct from '1'
     or jsonb_typeof(p_itinerary->'days') is distinct from 'array' then
    raise exception 'Invalid itinerary' using errcode='22023';
  end if;
  if jsonb_array_length(p_itinerary->'days') not between 1 and 7 then raise exception 'Invalid day count' using errcode='22023'; end if;
  for v_day in select value from jsonb_array_elements(p_itinerary->'days') loop
    if jsonb_typeof(v_day->'attractions') is distinct from 'array' then raise exception 'Invalid day' using errcode='22023'; end if;
    for v_place in select value from jsonb_array_elements(v_day->'attractions') loop
      v_count := v_count+1;
      if v_count>50 or length(coalesce(v_place->>'name','')) not between 1 and 200 then raise exception 'Invalid stop' using errcode='22023'; end if;
      if coalesce(v_place->>'id','') !~ '^custom-[a-zA-Z0-9-]{1,80}$' then
        v_place_id := (v_place->>'id')::uuid;
        if v_place_id is null or v_place_id=any(v_seen) or not exists(select 1 from public.places where id=v_place_id and is_active) then
          raise exception 'Unknown or duplicate place' using errcode='22023';
        end if;
        v_seen := array_append(v_seen,v_place_id);
      end if;
    end loop;
  end loop;
  if p_course_id is null then
    insert into public.courses(user_id,title,itinerary,client_request_id,ai_story)
    values(auth.uid(),btrim(p_title),p_itinerary,p_request_id,p_itinerary->>'aiStory')
    on conflict(user_id,client_request_id) do nothing returning id into v_id;
    if v_id is null then
      select id into v_id from public.courses where user_id=auth.uid() and client_request_id=p_request_id;
      return (select jsonb_build_object('id',id,'updated_at',updated_at,'itinerary',itinerary) from public.courses where id=v_id and user_id=auth.uid());
    end if;
    v_new := true;
  else
    select id,updated_at into v_id,v_updated from public.courses where id=p_course_id and user_id=auth.uid() for update;
    if v_id is null then raise exception 'Course not found' using errcode='42501'; end if;
    if p_expected_updated_at is null or v_updated<>p_expected_updated_at then raise exception 'Course changed. Reload before saving.' using errcode='PT409'; end if;
    update public.courses set title=btrim(p_title),itinerary=p_itinerary,ai_story=p_itinerary->>'aiStory',
      total_distance_m=null,estimated_travel_minutes=null,total_duration_minutes=null,route_reliability=null,metrics_calculated_at=null,updated_at=clock_timestamp()
      where id=v_id and user_id=auth.uid();
    delete from public.course_legs where course_id=v_id;
    delete from public.course_stops where course_id=v_id;
  end if;
  for v_day in select value from jsonb_array_elements(p_itinerary->'days') loop
    for v_place in select value from jsonb_array_elements(v_day->'attractions') loop
      if v_place->>'id' !~ '^custom-' then
        insert into public.course_stops(course_id,place_id,stop_order,stay_minutes,note)
        values(v_id,(v_place->>'id')::uuid,v_order,60,jsonb_build_object('day',v_day->>'day')::text);
        v_order := v_order+1;
      end if;
    end loop;
  end loop;
  return (select jsonb_build_object('id',id,'updated_at',updated_at,'itinerary',itinerary) from public.courses where id=v_id and user_id=auth.uid());
end;
$$;
revoke all on function public.save_travel_course(text,jsonb,uuid,bigint,timestamptz) from public,anon;
grant execute on function public.save_travel_course(text,jsonb,uuid,bigint,timestamptz) to authenticated;
