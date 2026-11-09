import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spiderCreate,spiderMove,spiderDeal} from '../src/extra-engine.js';
import {spiderValidSave,spiderSuggestions} from '../src/spider-model.js';
import {flickCreate,flickAI,flickShoot,flickTick} from '../src/arcade-engine.js';

test('Spider saves conserve cards across deals/moves and reject corrupted saves',()=>{
 for(const suits of [1,2,4]){
  let s=spiderCreate(suits);assert.ok(spiderValidSave(s));
  for(let i=0;i<20;i++){const action=spiderSuggestions(s)[0];s=action?spiderMove(s,action.from,action.index,action.to):spiderDeal(s);assert.ok(spiderValidSave(JSON.parse(JSON.stringify(s))));}
  for(const bad of [{...s,completed:9},{...s,columns:[]},{...s,stock:[{}]},{...s,winner:7},{...s,moves:-1}])assert.equal(spiderValidSave(bad),false);
 }
 const s=spiderCreate();s.columns[0][0].id=s.columns[1][0].id;assert.equal(spiderValidSave(s),false);
});
test('Spider hints are legal and never mutate the current game',()=>{
 const s=spiderCreate(4),before=structuredClone(s),hints=spiderSuggestions(s);for(const hint of hints)assert.notEqual(spiderMove(s,hint.from,hint.index,hint.to),s);assert.deepEqual(s,before);
});
test('Flick AI produces finite legal shots without changing the board',()=>{
 for(const kind of ['stones','janggi']){const s=flickCreate(7,false,kind),before=structuredClone(s),shot=flickAI(s);assert.ok(shot);assert.ok(Number.isFinite(shot.dx)&&Number.isFinite(shot.dy));assert.deepEqual(s,before);assert.ok(flickShoot(s,shot.id,shot.dx,shot.dy));for(let i=0;i<500&&s.phase==='moving';i++)flickTick(s);assert.equal(s.phase,'aim');assert.ok(s.stones.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)));}
 const setup=flickCreate(7,true);assert.equal(flickAI(setup),null);
});
