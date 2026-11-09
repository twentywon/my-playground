import {test} from 'node:test';import assert from 'node:assert/strict';
import {janggiCreate,janggiMoves,janggiPlay,janggiCheck,janggiAI,yutCreate,yutThrow,yutMoves,yutPlay,yutAI} from '../src/traditional-engine.js';
const bare=()=>({...janggiCreate(),board:Array(90).fill(''),seen:{}});
test('Janggi starts with 32 pieces, legal moves, legal AI and reversible immutable transitions',()=>{const s=janggiCreate(),before=structuredClone(s);assert.equal(s.board.filter(Boolean).length,32);assert.ok(janggiMoves(s).length);const m=janggiAI(s);const n=janggiPlay(s,m);assert.notEqual(n,s);assert.equal(n.p,2);assert.deepEqual(s,before);assert.equal(janggiCheck(n,1),false)});
test('Janggi horse and elephant blockers, cannon screen restrictions and palace',()=>{let s=bare();s.board[76]='K';s.board[13]='k';s.board[40]='H';assert.ok(janggiMoves(s).some(m=>m.from===40&&m.to===21));s.board[31]='S';assert.ok(!janggiMoves(s).some(m=>m.from===40&&m.to===21));s.board[40]='E';s.board[31]='';assert.ok(janggiMoves(s).some(m=>m.from===40&&m.to===11));s.board[21]='S';assert.ok(!janggiMoves(s).some(m=>m.from===40&&m.to===11));s=bare();s.board[76]='K';s.board[13]='k';s.board[45]='C';s.board[47]='S';s.board[50]='r';assert.ok(janggiMoves(s).some(m=>m.from===45&&m.to===50));s.board[50]='c';assert.ok(!janggiMoves(s).some(m=>m.from===45&&m.to===50));s.board[47]='C';assert.ok(!janggiMoves(s).some(m=>m.from===45));assert.ok(janggiMoves(s).filter(m=>m.from===76).every(m=>m.to%9>=3&&m.to%9<=5&&Math.floor(m.to/9)>=7))});
test('Janggi rejects self-check, supports passing and facing-king draw',()=>{let s=bare();s.board[76]='K';s.board[12]='k';s.board[4]='r';s.board[40]='R';assert.ok(!janggiMoves(s).some(m=>m.from===40&&m.to===41));s=janggiCreate();s=janggiPlay(s,'pass');s=janggiPlay(s,'pass');assert.equal(s.winner,3);s={...bare(),facing:true};s.board[76]='K';s.board[13]='k';assert.equal(janggiPlay(s,'draw').winner,3);assert.equal(janggiPlay(s,'pass'),s)});
test('Yut throws count sticks, grants extra throws and queues multiple results',()=>{let s=yutCreate();s=yutThrow(s,[true,true,true,true]);assert.equal(s.phase,'throw');assert.deepEqual(s.queue,[4]);s=yutThrow(s,[false,false,false,false]);assert.deepEqual(s.queue,[4,5]);s=yutThrow(s,[true,false,false,false]);assert.equal(s.phase,'move');assert.deepEqual(s.queue,[4,5,1]);assert.ok(yutAI(s))});
test('Yut shortcuts, center continuation, stacking, capture and completion',()=>{let s=yutCreate();s.phase='move';s.queue=[3];s.tokens[0][0]={pos:5,lane:''};const moves=yutMoves(s,0);assert.equal(moves.find(m=>m.branch==='shortcut').pos,23);s=yutPlay(s,moves.find(m=>m.branch==='shortcut'));s.p=1;s.phase='move';s.queue=[1];assert.equal(yutMoves(s,0).find(m=>m.branch==='continue').pos,24);assert.equal(yutMoves(s,0).find(m=>m.branch==='finish').pos,28);s=yutCreate();s.phase='move';s.queue=[1];s.tokens[0][0]={pos:2,lane:''};s.tokens[0][1]={pos:2,lane:''};s.tokens[1][0]={pos:3,lane:''};s=yutPlay(s,yutMoves(s,0)[0]);assert.equal(s.tokens[0][1].pos,3);assert.equal(s.tokens[1][0].pos,-1);assert.equal(s.phase,'throw');s.phase='move';s.queue=[1];s.tokens[0]=[{pos:20,lane:''},...Array.from({length:3},()=>({pos:99,lane:''}))];s=yutPlay(s,yutMoves(s,0)[0]);assert.equal(s.winner,1)});

test('Janggi supports all 16 independent horse/elephant formations, mirrored for Han',()=>{
 const ids=['inner','outer','left','right'],orders={inner:'HEEH',outer:'EHHE',left:'HEHE',right:'EHEH'};
 const rows=new Set();
 for(const cho of ids)for(const han of ids){
  const s=janggiCreate(cho,han);
  assert.equal([82,83,87,88].map(i=>s.board[i]).join(''),orders[cho]);
  assert.equal([1,2,6,7].map(i=>s.board[i]).join(''),[...orders[han]].reverse().join('').toLowerCase());
  assert.equal(s.board.filter(Boolean).length,32);assert.equal(janggiCheck(s),false);
  assert.ok(janggiMoves(s).length);rows.add(s.board.join(','));
 }
 assert.equal(rows.size,16);
});
test('Janggi palace diagonals, cannon screens and pawn direction obey the same capture rules',()=>{
 let s=bare();s.board[76]='K';s.board[12]='k';s.board[3]='R';
 assert.ok(janggiMoves(s).some(m=>m.from===3&&m.to===23));
 s.board[3]='C';assert.ok(!janggiMoves(s).some(m=>m.from===3&&m.to===23));
 s.board[13]='S';assert.ok(janggiMoves(s).some(m=>m.from===3&&m.to===23));
 s.board[23]='c';assert.ok(!janggiMoves(s).some(m=>m.from===3&&m.to===23));
 s=bare();s.board[76]='K';s.board[12]='k';s.board[23]='S';
 assert.ok(janggiMoves(s).some(m=>m.from===23&&m.to===13));
 assert.ok(!janggiMoves(s).some(m=>m.from===23&&m.to===33));
});
test('Janggi recognizes mate and will not let a pinned defender expose the king',()=>{
 const s=bare();s.board[13]='k';s.board[76]='K';s.board[30]='R';s.board[8]='R';s.board[45]='R';
 // Three files of attack cover all palace escapes after the rook advances.
 s.board[8]='';s.board[45]='';s.board[3]='R';s.board[5]='R';
 const n=janggiPlay(s,{from:30,to:31});
 assert.notEqual(n,s);assert.equal(janggiCheck(n),true);assert.equal(n.winner,1);
});
const movingYut=(queue=[1])=>({...yutCreate(),phase:'move',queue});
const moveYut=(s,index=0,branch='continue',qi=0)=>yutPlay(s,yutMoves(s,index,qi).find(m=>m.branch===branch));
test('Yut marked stick makes back-do and unusable back-do passes the turn without a deadlock',()=>{
 let s=yutThrow(yutCreate(),[false,false,false,true]);
 assert.equal(s.last.n,-1);assert.equal(s.p,2);assert.equal(s.phase,'throw');assert.deepEqual(s.queue,[]);
 s=yutCreate();s.tokens[0][0]={pos:4,lane:''};s=yutThrow(s,[false,false,false,true]);
 assert.equal(s.phase,'move');assert.equal(yutMoves(s,0)[0].pos,3);assert.deepEqual(yutMoves(s,1),[]);
 for(const i of [0,1,2]){const sticks=[false,false,false,false];sticks[i]=true;assert.equal(yutThrow(yutCreate(),sticks).last.n,1);}
});
test('Yut back-do retraces each shortcut and the entered center path',()=>{
 for(const [start,branch,expected]of [[5,'shortcut',22],[10,'shortcut',27]]){
  let s=movingYut([3]);s.tokens[0][0]={pos:start,lane:''};s=moveYut(s,0,branch);
  assert.equal(s.tokens[0][0].pos,23);
  s={...s,p:1,phase:'move',queue:[-1]};s=moveYut(s,0,'back');assert.equal(s.tokens[0][0].pos,expected);
  s={...s,p:1,phase:'move',queue:[-1]};s=moveYut(s,0,'back');
  s={...s,p:1,phase:'move',queue:[-1]};s=moveYut(s,0,'back');assert.equal(s.tokens[0][0].pos,start);
 }
 let s=movingYut([3]);s.tokens[0][0]={pos:23,lane:'a'};s=moveYut(s,0,'finish');assert.equal(s.tokens[0][0].pos,20);
 s={...s,p:1,phase:'move',queue:[-1]};assert.equal(yutMoves(s,0)[0].pos,29);
});
test('Yut first-step back-do returns to start, then requires a forward move to finish',()=>{
 let s=moveYut(movingYut());assert.equal(s.tokens[0][0].pos,1);
 s={...s,p:1,phase:'move',queue:[-1]};s=moveYut(s,0,'back');assert.equal(s.tokens[0][0].pos,20);assert.equal(s.winner,0);
 s={...s,p:1,phase:'move',queue:[1]};s=moveYut(s);assert.equal(s.tokens[0][0].pos,99);
 s={...s,p:1,phase:'move',queue:[-1]};assert.deepEqual(yutMoves(s,0),[]);
});
test('Yut back-do moves a stack, captures a stack, and grants a throw',()=>{
 let s=movingYut([-1]);s.tokens[0][0]={pos:4,lane:''};s.tokens[0][1]={pos:4,lane:''};
 s.tokens[1][0]={pos:3,lane:''};s.tokens[1][1]={pos:3,lane:''};const before=structuredClone(s);
 const n=moveYut(s,0,'back');assert.deepEqual(s,before);
 assert.equal(n.tokens[0][0].pos,3);assert.equal(n.tokens[0][1].pos,3);
 assert.equal(n.tokens[1][0].pos,-1);assert.equal(n.tokens[1][1].pos,-1);
 assert.equal(n.phase,'throw');assert.equal(n.p,1);assert.equal(n.motion.captured.length,2);
});
test('Yut/mo captures do not duplicate the extra throw; stored back-do can follow a forward move',()=>{
 let s=movingYut([4,1]);s.tokens[1][0]={pos:4,lane:''};s=moveYut(s);
 assert.equal(s.phase,'move');assert.deepEqual(s.queue,[1]);assert.equal(s.tokens[1][0].pos,-1);
 s=movingYut([-1,2]);assert.deepEqual(yutMoves(s,0,0),[]);assert.ok(yutAI(s));
 s=moveYut(s,0,'continue',1);assert.equal(s.phase,'move');assert.deepEqual(s.queue,[-1]);
 s=moveYut(s,0,'back');assert.equal(s.tokens[0][0].pos,1);assert.equal(s.p,2);
});
test('Seeded Yut AI games with back-do finish while conserving all eight tokens',()=>{
 for(let seed=1;seed<=8;seed++){
  let rng=seed,s=yutCreate(),actions=0;
  const random=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/2**32;};
  while(!s.winner&&actions++<2500){
   if(s.phase==='throw')s=yutThrow(s,Array.from({length:4},()=>random()<.5));
   else{const move=yutAI(s);assert.ok(move,`stalled at seed ${seed}`);s=yutPlay(s,move);}
   assert.equal(s.tokens.flat().length,8);assert.ok(s.tokens.flat().every(t=>t.pos===-1||t.pos===99||t.pos>=1&&t.pos<=29));
   assert.ok(!s.tokens[0].some(t=>t.pos>0&&t.pos!==99&&s.tokens[1].some(v=>v.pos===t.pos)));
  }
  assert.ok(s.winner,`seed ${seed} must finish`);
 }
});
test('Janggi simultaneous check and bikjang still offers the agreed draw',()=>{
 const s=bare();s.board[13]='k';s.board[76]='K';
 for(const i of [3,5,21,27])s.board[i]='R';
 const n=janggiPlay(s,{from:27,to:9});
 assert.notEqual(n,s);assert.equal(n.facing,true);assert.equal(janggiCheck(n),true);
 assert.equal(n.winner,0);assert.equal(janggiPlay(n,'draw').winner,3);
});
test('Stronger Janggi AI finds mate, rejects a poisoned capture and respects a tiny budget',()=>{
 let s=bare();s.board[13]='k';s.board[76]='K';s.board[30]='R';s.board[3]='R';s.board[5]='R';
 const mate=janggiAI(s,{budget:1500,maxDepth:3});assert.equal(janggiPlay(s,mate).winner,1);
 s=bare();s.board[76]='K';s.board[14]='k';s.board[45]='R';s.board[48]='s';s.board[3]='r';
 const before=structuredClone(s),m=janggiAI(s,{budget:1500,maxDepth:3});
 assert.ok(janggiMoves(s).some(v=>v.from===m.from&&v.to===m.to));assert.notDeepEqual(m,{from:45,to:48});assert.deepEqual(s,before);
 const fallback=janggiAI(janggiCreate(),{budget:0});assert.ok(janggiMoves(janggiCreate()).some(v=>v.from===fallback.from&&v.to===fallback.to));
});
