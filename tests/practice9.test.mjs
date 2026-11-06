import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialRoom, CURRENT_TIME } from '../src/config/room.ts';
import { checkAvailability } from '../src/lib/checkAvailability.ts';
test('P9 fresh room instances do not share booking records',()=>{
 const a=createInitialRoom(), b=createInitialRoom(); assert.deepEqual(a,b);
 a.bookings[0].label='Changed locally'; a.blocked=true;
 assert.equal(b.bookings[0].label,'Calculus 201');assert.equal(b.blocked,false);
});
test('P9 fixture factory preserves contract and repeated calls do not mutate',()=>{
 const room=createInitialRoom(),before=structuredClone(room);
 for(const [start,end,expected] of [[540,570,false],[750,720,false],[720,841,false],[630,690,false],[660,720,true],[570,600,true],[1320,1440,true]]){
  assert.equal(checkAvailability(room,start,end,CURRENT_TIME).available,expected);
 }
 assert.equal(checkAvailability({...room,blocked:true},720,780,CURRENT_TIME).available,false);
 assert.deepEqual(room,before);
});
