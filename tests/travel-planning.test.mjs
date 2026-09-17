import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeConditions,planPlaces,estimateCosts,fitBudget,estimatedDayRoutes,validPlanning} from '../src/lib/travel-planning.ts';
import {getDrivingRoute} from '../src/lib/kakao-rest.ts';
const c=(extra={})=>normalizeConditions({days:1,people:2,budget:1000000,startRegion:'공주',...extra});
const p=(id,lat=36.45,code='NA010100',region='공주')=>({id,name_ko:id,address:`충청남도 ${region}시`,latitude:lat,longitude:127.1,category_code:code});
test('rejects invalid amounts, enum values and unknown interests',()=>{
 for(const bad of [{people:0},{people:21},{budget:NaN},{days:8},{transport:'air'},{startRegion:'x'},{focus:'unknown'}])assert.throws(()=>c(bad));
 assert.equal(c({budgetType:'1인 예산'}).people,2);
});
test('region, food interest, pacing and uniqueness affect selection',()=>{
 const candidates=[...Array.from({length:8},(_,i)=>p(String(i),36.45+i*.001,'FD010100')),p('other',36.45,'FD010100','태안'),p('nature')];
 const slow=planPlaces(candidates,c({focus:'로컬 음식',travelPace:'여유롭게'})).groups.flat();
 assert.equal(slow.length,2);assert.ok(slow.every(v=>v.category_code.startsWith('FD')&&v.address.includes('공주')));
 const fast=planPlaces(candidates,c({days:2,focus:'로컬 음식',travelPace:'많이 보기'})).groups.flat();assert.equal(fast.length,8);assert.equal(new Set(fast.map(v=>v.id)).size,8);
});
test('walking excludes distant stops and family excludes explicit unavailable facilities',()=>{
 const candidates=[p('a'),p('b',36.6),{...p('c'),place_facilities:[{facility_type:'baby_carriage',is_available:false}]}];
 const r=planPlaces(candidates,c({transport:'도보 중심',focus:'가족'}));assert.deepEqual(r.groups.flat().map(v=>v.id),['a']);assert.ok(r.warnings.length);
});
test('budget bases, meal inclusion and shared rooms/cars have correct arithmetic',()=>{
 const places=[p('meal',36.45,'FD010100'),p('park')];
 const base=c({days:2,people:3,budget:100000,transport:'렌터카'});
 const all=estimateCosts(base,places,[]),per=estimateCosts({...base,budgetType:'1인 예산'},places,[]);
 assert.equal(all.total,216000+160000+30000+140000);
 assert.equal(all.budgetTotal,100000);assert.equal(per.budgetTotal,300000);assert.equal(all.total,per.total);
 assert.equal(all.perPerson,Math.ceil(all.total/3));assert.equal(all.remaining,100000-all.total);
 assert.equal(estimateCosts(c({days:1,people:1,transport:'도보 중심'}),[],[]).breakdown.find(v=>v.label==='숙박비').amount,0);
});
test('day boundaries are excluded and budget trimming retains one stop each day',()=>{
 const groups=[[p('a'),p('b',36.451)],[p('c',36.8),p('d',36.801)]];
 assert.equal(estimatedDayRoutes(groups,'렌터카').length,2);
 assert.equal(fitBudget(groups,c({days:2,budget:1000})),true);assert.deepEqual(groups.map(g=>g.length),[1,1]);
});
test('saved planning snapshots reject incomplete or nonfinite cost inputs',()=>{
 const v={conditions:c(),warnings:[],routes:[],signature:'[]'};assert.ok(validPlanning(v));
 assert.equal(validPlanning({...v,conditions:{days:1}}),false);
 assert.equal(validPlanning({...v,routes:[{source:'kakao',distance:NaN,duration:1}]}),false);
});
test('Kakao handles valid summaries, no-route and authorization without zero-time success',async()=>{
 const oldFetch=global.fetch,oldKey=process.env.KAKAO_REST_API_KEY;process.env.KAKAO_REST_API_KEY='test-only';
 const a={lat:36.45,lng:127.1},b={lat:36.46,lng:127.11};
 try{
 global.fetch=async()=>new Response(JSON.stringify({routes:[{result_code:0,summary:{distance:1234,duration:125,fare:{taxi:5000,toll:0}}}]}),{status:200});
 const success=await getDrivingRoute(a,b);assert.equal(success.source,'kakao');assert.equal(success.distance,1.234);assert.equal(success.duration,3);
 global.fetch=async()=>new Response(JSON.stringify({routes:[{result_code:104}]}),{status:200});
 assert.equal((await getDrivingRoute(a,b)).source,'estimate');
 let calls=0;global.fetch=async()=>{calls++;return new Response('{}',{status:401});};
 const failed=await getDrivingRoute(a,b);assert.equal(failed.source,'estimate');assert.ok(failed.duration>0);await getDrivingRoute(a,b);assert.equal(calls,1);
 }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.KAKAO_REST_API_KEY;else process.env.KAKAO_REST_API_KEY=oldKey;}
});
