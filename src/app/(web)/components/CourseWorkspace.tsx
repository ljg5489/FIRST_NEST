'use client';
import {TravelEstimate} from './TravelEstimate';

import {useEffect, useState} from 'react';
import KakaoMap from '@/features/map/ui/KakaoMap';
import {createKakaoDirectionUrl} from '@/lib/kakao-map';
import {type DraftEnvelope, type Itinerary, type ItineraryPlace, UUID, validItinerary, itineraryMapPlaces} from '@/lib/itinerary';

type Props = {initialItinerary?: Itinerary; draftId?: string; courseId?: string; mapOnly?: boolean};
const button = 'rounded-md border border-[#dce2d7] bg-white px-3 py-2 text-sm font-bold disabled:opacity-40';

export function CourseWorkspace({initialItinerary, draftId, courseId, mapOnly = false}: Props) {
  const [draft, setDraft] = useState<DraftEnvelope>();
  const [localId, setLocalId] = useState('');
  const [message, setMessage] = useState('일정을 불러오는 중입니다.');
  const [loginRequired, setLoginRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [query, setQuery] = useState('');
  const [dayIndex, setDayIndex] = useState(0);
  const [matches, setMatches] = useState<ItineraryPlace[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let next: DraftEnvelope;
        if (draftId) {
          if (!UUID.test(draftId)) throw new Error('잘못된 임시 일정입니다.');
          const stored = sessionStorage.getItem(`firstnest:draft:${draftId}`);
          if (!stored) throw new Error('이 브라우저에 임시 일정이 없습니다. 내 계정에서 저장한 코스를 열어 주세요.');
          next = JSON.parse(stored);
        } else if (courseId) {
          const response = await fetch(`/api/courses?id=${encodeURIComponent(courseId)}`, {cache:'no-store'});
          const data = await response.json();
          if (!response.ok) {
            if (!cancelled) setLoginRequired(response.status === 401);
            throw new Error(data.error);
          }
          next = {itinerary:data.itinerary, courseId:data.id, updatedAt:data.updated_at, requestId:data.client_request_id || crypto.randomUUID()};
        } else if (initialItinerary) {
          next = {itinerary:initialItinerary, requestId:crypto.randomUUID()};
        } else throw new Error('추천 결과나 내 계정에서 코스를 선택해 주세요.');
        if (!validItinerary(next.itinerary) || !UUID.test(next.requestId)) throw new Error('일정 형식을 확인할 수 없습니다. 다시 추천받아 주세요.');
        if (!cancelled) {
          const id = draftId || crypto.randomUUID();
          setLocalId(id); setDraft(next); setMessage(next.courseId ? '저장한 코스를 불러왔습니다.' : '이 탭에 임시 보관됩니다. 계정에 저장하면 다른 기기에서도 열 수 있습니다.');
          if (!courseId) window.history.replaceState(null, '', `${mapOnly ? '/map' : '/results'}?draft=${id}`);
        }
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : '일정을 불러오지 못했습니다.'); }
    }
    void load();
    return () => { cancelled = true; };
  }, [initialItinerary, draftId, courseId, mapOnly]);

  useEffect(() => {
    if (!draft || !localId) return;
    try { sessionStorage.setItem(`firstnest:draft:${localId}`, JSON.stringify(draft)); setStorageReady(true); }
    catch { setStorageReady(false); setMessage('브라우저 임시 저장 공간을 사용할 수 없습니다. 화면을 이동하기 전에 계정에 저장해 주세요.'); }
  }, [draft, localId]);

  function edit(itinerary: Itinerary) {
    setDraft(current => current ? {...current, itinerary} : current);
    setMessage('변경사항을 계정에 저장해 주세요.');
  }
  function addPlace(place: ItineraryPlace) {
    if (!draft) return;
    if (draft.itinerary.days.some(d => d.attractions.some(p => p.id === place.id))) {setSearchMessage('이미 일정에 포함된 장소입니다.'); return;}
    if (draft.itinerary.days.flatMap(d => d.attractions).length >= 50) {setSearchMessage('장소와 메모는 최대 50개까지 추가할 수 있습니다.'); return;}
    edit({...draft.itinerary, days:draft.itinerary.days.map((d,i) => i === dayIndex ? {...d, attractions:[...d.attractions, place]} : d)});
    setSearchMessage('일정에 추가했습니다.');
  }
  async function search() {
    setSearching(true); setMatches([]);
    try {
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setMatches(data.places.map((p: {id:string;name_ko:string;address:string|null;latitude:number|null;longitude:number|null}) => ({id:p.id,name:p.name_ko,region:'충남',address:p.address ?? undefined,latitude:p.latitude == null ? undefined : Number(p.latitude),longitude:p.longitude == null ? undefined : Number(p.longitude)})));
      setSearchMessage(data.places.length ? '추가할 장소를 선택해 주세요.' : '검색 결과가 없습니다. 다른 이름으로 검색하거나 메모를 추가해 주세요.');
    } catch {setSearchMessage('검색하지 못했습니다. 잠시 후 다시 시도해 주세요.');}
    finally {setSearching(false);}
  }
  async function save() {
    if (!draft) return;
    if (!validItinerary(draft.itinerary)) {setMessage('여행 제목과 일정 내용을 확인해 주세요.'); return;}
    setSaving(true); setLoginRequired(false);
    try {
      const response = await fetch('/api/courses', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
      const data = await response.json();
      if (!response.ok) {setLoginRequired(response.status === 401); throw new Error(data.error);}
      setDraft({...draft, courseId:data.id, updatedAt:data.updated_at, itinerary:data.itinerary});
      window.history.replaceState(null, '', `${mapOnly ? '/map' : '/results'}?courseId=${data.id}`);
      setMessage('계정에 저장했습니다. 내 계정에서 다시 열 수 있습니다.');
    } catch(error) {setMessage(error instanceof Error ? error.message : '저장하지 못했습니다. 다시 시도해 주세요.');}
    finally {setSaving(false);}
  }
  const returnPath = `${mapOnly ? '/map' : '/results'}?${localId ? `draft=${localId}` : `courseId=${encodeURIComponent(courseId || '')}`}`;
  const otherPath = storageReady ? `${mapOnly ? '/results' : '/map'}?draft=${localId}` : undefined;

  return <section className="mt-6 grid gap-5">
    <p role="status" className="rounded-lg bg-[#eef6f2] p-4 text-sm">{message}</p>
    {loginRequired && <a className="primary-button w-fit" href={`/login?next=${encodeURIComponent(returnPath)}`}>로그인하고 계속하기</a>}
    {!draft ? <a href="/account" className={button}>내 계정에서 코스 열기</a> : <>
      <div className="soft-card grid gap-4 rounded-xl p-5">
        <label className="grid gap-2 font-bold">여행 제목<input disabled={saving} maxLength={120} value={draft.itinerary.title} onChange={e => edit({...draft.itinerary,title:e.target.value})} className="rounded border p-3" /></label>
        <label className="grid gap-2 text-sm">출발일<input disabled={saving} type="date" value={draft.itinerary.startDate} onChange={e => edit({...draft.itinerary,startDate:e.target.value})} className="w-fit rounded border p-2" /></label>
        <div className="flex flex-wrap gap-3">
          <button disabled={saving} onClick={save} className="primary-button border-0 disabled:opacity-40">{saving ? '저장 중…' : '계정에 저장'}</button>
          {otherPath && <a href={otherPath} className={button}>{mapOnly ? '일정 편집하기' : '같은 일정 지도에서 보기'}</a>}
          <a href="/account" className={button}>내 저장 코스</a>
          {draft.courseId && <a href={`/results?courseId=${draft.courseId}`} className={button}>마지막 저장본 열기</a>}
        </div>
      </div>
      <TravelEstimate itinerary={draft.itinerary} />
      {mapOnly && <KakaoMap places={itineraryMapPlaces(draft.itinerary)} />}
      {draft.itinerary.days.map((day, di) => <section key={day.day} className="soft-card rounded-xl p-5">
        <h2 className="text-lg font-bold">{day.day} · {day.region}</h2>
        {!day.attractions.length && <p className="mt-3 text-sm">장소를 추가해 주세요.</p>}
        <ol className="mt-3 grid gap-3">{day.attractions.map((place, pi) => <li key={place.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3">
          <div><p className="font-bold">{pi + 1}. {place.name}</p><p className="text-sm text-[#667165]">{place.id.startsWith('custom-') ? '메모 · 지도에 표시되지 않습니다' : place.address || place.region}</p>
          {!place.id.startsWith('custom-') && <a className="text-sm underline" href={createKakaoDirectionUrl(place)} target="_blank" rel="noreferrer">카카오맵 길찾기</a>}</div>
          {!mapOnly && <div className="flex gap-2">{[-1,1].map(offset => <button key={offset} aria-label={`${place.name} ${offset < 0 ? '위로' : '아래로'}`} disabled={saving || pi+offset < 0 || pi+offset >= day.attractions.length} className={button} onClick={() => {
            const attractions = [...day.attractions]; [attractions[pi],attractions[pi+offset]] = [attractions[pi+offset],attractions[pi]];
            edit({...draft.itinerary,days:draft.itinerary.days.map((d,i) => i === di ? {...d,attractions} : d)});
          }}>{offset < 0 ? '↑' : '↓'}</button>)}<button disabled={saving} className={button} onClick={() => edit({...draft.itinerary,days:draft.itinerary.days.map((d,i) => i === di ? {...d,attractions:d.attractions.filter(p => p.id !== place.id)} : d)})}>삭제</button></div>}
        </li>)}</ol>
      </section>)}
      {!mapOnly && <fieldset disabled={saving} className="soft-card grid gap-3 rounded-xl p-5">
        <legend className="font-bold">일정에 장소 추가</legend>
        <label>추가할 날짜 <select value={dayIndex} onChange={e => setDayIndex(Number(e.target.value))} className="rounded border p-2">{draft.itinerary.days.map((d,i) => <option key={d.day} value={i}>{d.day}</option>)}</select></label>
        <div className="flex gap-2"><input aria-label="장소 이름" className="min-w-0 flex-1 rounded border p-2" maxLength={80} value={query} onChange={e => setQuery(e.target.value)} placeholder="장소 이름 두 글자 이상" /><button className={button} disabled={searching || query.trim().length < 2} onClick={search}>{searching ? '검색 중…' : '검색'}</button></div>
        <p role="status" className="text-sm">{searchMessage}</p>
        {matches.map(p => <button key={p.id} className={`${button} text-left`} onClick={() => addPlace(p)}>{p.name} · {p.address} +</button>)}
        <div className="flex gap-2"><input aria-label="일정 메모" className="min-w-0 flex-1 rounded border p-2" value={note} maxLength={200} onChange={e => setNote(e.target.value)} placeholder="식사·휴식 등 개인 메모" /><button className={button} disabled={!note.trim()} onClick={() => {addPlace({id:`custom-${crypto.randomUUID()}`,name:note.trim(),region:draft.itinerary.days[dayIndex].region});setNote('');}}>메모 추가</button></div>
      </fieldset>}
      {draft.itinerary.aiStory && <section className="soft-card rounded-xl p-5"><h2 className="font-bold">최초 추천 설명</h2><p className="mt-3 whitespace-pre-line text-sm">{draft.itinerary.aiStory}</p><p className="mt-3 text-sm text-[#667165]">일정을 편집해도 최초 추천 설명은 유지됩니다. 이동 시간과 비용은 확정되지 않았습니다.</p></section>}
    </>}
  </section>;
}
