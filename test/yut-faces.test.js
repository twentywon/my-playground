import {test} from 'node:test';
import assert from 'node:assert/strict';
import {yutCreate,yutThrow} from '../src/traditional-engine.js';
import {yutView} from '../src/yut-view.js';

test('All 16 throws count flat bellies; only the marked flat belly gives back-do',()=>{
 for(let mask=0;mask<16;mask++){
  const sticks=Array.from({length:4},(_,i)=>Boolean(mask&(1<<i)));
  const count=sticks.filter(Boolean).length;
  const s=yutThrow(yutCreate(),sticks);
  assert.equal(s.last.n,count===0?5:mask===8?-1:count);
  assert.deepEqual(s.last.sticks,sticks);
 }
});
test('Every displayed throw keeps X on the rounded back and the back-do mark on the flat belly',()=>{
 for(let mask=0;mask<16;mask++){
  const sticks=Array.from({length:4},(_,i)=>Boolean(mask&(1<<i)));
  const s=yutThrow(yutCreate(),sticks);
  const html=yutView(s,{name:p=>`팀 ${p}`,human:true,busy:false,rolling:false,faces:null,cast:0,selected:null,qi:0,history:0,notice:false});
  const faces=[...html.matchAll(/class="yn-stick-body (flat|round)" style="--face:(0|180)deg"><span class="yn-stick-face yn-flat">(.*?)<\/span><span class="yn-stick-face yn-round">(.*?)<\/span><\/span>/g)];
  assert.equal(faces.length,4);
  faces.forEach((face,i)=>{
   assert.equal(face[1],sticks[i]?'flat':'round');
   assert.equal(+face[2],sticks[i]?0:180);
   assert.ok(!face[3].includes('×'));
   assert.equal(face[3].includes('●'),i===3);
   assert.equal((face[4].match(/×/g)||[]).length,3);
  });
  assert.ok(html.includes(`평평한 면 ${sticks.filter(Boolean).length}개 · 둥근 면 ${sticks.filter(v=>!v).length}개`));
 }
});
