import test from 'node:test';
import assert from 'node:assert/strict';
import {isAdminUser,validAdminUpdate,validAdminColumns} from '../src/lib/admin-policy.ts';
import {validItinerary,itineraryMapPlaces} from '../src/lib/itinerary.ts';
const place={id:'11111111-1111-4111-8111-111111111111',name:'공산성',region:'공주',latitude:36.4,longitude:127.1};
const itinerary=()=>({version:1,title:'공주 여행',startDate:'',days:[{day:'Day 1',region:'공주',attractions:[{...place}]}]});
test('administrator requires verified email and server-controlled role',()=>{
  assert.equal(isAdminUser({email_confirmed_at:'2026-01-01',app_metadata:{role:'admin'}}),true);
  for(const user of [null,{app_metadata:{role:'admin'}},{email_confirmed_at:'2026-01-01',user_metadata:{role:'admin'}},{email_confirmed_at:'2026-01-01',app_metadata:{role:'user'}}]) assert.equal(isAdminUser(user),false);
});
test('editor rejects ownership changes, prototype keys and filter injection',()=>{
  assert.equal(validAdminUpdate('places',place.id,{name_en:'Gongsanseong'}),true);
  for(const [table,id,values] of [['courses',1,{user_id:place.id}],['places',place.id,{raw_data:{}}],['__proto__',1,{toString:'x'}],['places',place.id,{toString:'x'}],['places','-'.repeat(36),{name_en:'x'}]]) assert.equal(validAdminUpdate(table,id,values),false);
  assert.equal(validAdminColumns('places',[{key:'name_en',type:'text'}]),true);
  assert.equal(validAdminColumns('places',[{key:'name_en.is.null,id',type:'text'}]),false);
});
test('itinerary rejects duplicate places, invalid coordinates and excessive stops',()=>{
  assert.equal(validItinerary(itinerary()),true);
  const duplicate=itinerary();duplicate.days[0].attractions.push({...place});assert.equal(validItinerary(duplicate),false);
  const bad=itinerary();bad.days[0].attractions[0].latitude=Infinity;assert.equal(validItinerary(bad),false);
  const large=itinerary();large.days[0].attractions=Array.from({length:51},(_,i)=>({...place,id:`custom-${i}`}));assert.equal(validItinerary(large),false);
});
test('map preserves itinerary order and excludes personal notes',()=>{
  const value=itinerary();value.days[0].attractions.unshift({...place,id:'custom-note'});
  assert.equal(validItinerary(value),true);
  assert.deepEqual(itineraryMapPlaces(value).map(p=>p.id),[place.id]);
});
