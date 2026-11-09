import test from 'node:test';
import assert from 'node:assert/strict';
import {connectCreate,connectPlay,connectMoves,connectAI,hitCreate,hitPlay,hitScore} from '../src/classic-engine.js';

test('Connect Four gravity, immutable transitions, full columns and invalid moves',()=>{
 const original=connectCreate();let s=original;for(let i=0;i<6;i++)s=connectPlay(s,0);
 assert.equal(original.board.filter(Boolean).length,0);assert.deepEqual([0,7,14,21,28,35].map(i=>s.board[i]),[2,1,2,1,2,1]);
 for(const c of [0,-1,7,1.5,NaN])assert.equal(connectPlay(s,c),s);assert.ok(!connectMoves(s).includes(0));
});
test('Connect Four detects horizontal and vertical victories and stops accepting moves',()=>{
 for(const moves of [[0,0,1,1,2,2,3],[0,1,0,1,0,2,0]]){let s=connectCreate();for(const c of moves)s=connectPlay(s,c);assert.equal(s.winner,1);assert.equal(s.line.length,4);assert.deepEqual(connectMoves(s),[]);assert.equal(connectPlay(s,4),s);}
});
test('Connect Four detects both diagonal slopes',()=>{
 for(const mirror of [false,true]){let s=connectCreate();for(const col of [0,1,1,2,4,2,2,3,4,3,5,3,3])s=connectPlay(s,mirror?6-col:col);assert.equal(s.winner,1);assert.equal(s.line.length,4);}
});
test('Connect Four AI takes wins and blocks immediate losses without changing state',()=>{
 let s=connectCreate();for(const c of [0,6,1,6,2])s=connectPlay(s,c);const copy=structuredClone(s);assert.equal(connectAI(s,{budget:500,depth:4}),3);assert.deepEqual(s,copy);
 s=connectCreate();for(const c of [0,6,1,6,2,5])s=connectPlay(s,c);assert.equal(connectAI(s),3);
});
test('Connect Four random games preserve gravity, terminate, and handle draws',()=>{
 let seed=71;const rng=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let run=0;run<150;run++){let s=connectCreate();while(!s.winner){const choices=connectMoves(s);s=connectPlay(s,choices[Math.floor(rng()*choices.length)]);assert.ok(s.moves<=42);for(let c=0;c<7;c++){let occupied=false;for(let r=0;r<6;r++){if(s.board[r*7+c])occupied=true;else assert.ok(!occupied);}}}if(s.winner===3){assert.equal(s.moves,42);}}
 const almost=connectCreate();almost.board=Array.from({length:42},(_,i)=>(Math.floor(i/7)+Math.floor(i%7/2))%2+1);almost.board[0]=0;almost.moves=41;assert.equal(connectPlay(almost,0).winner,3);
});
test('Hit and Blow scoring counts repeated colors once and prioritizes hits',()=>{
 assert.deepEqual(hitScore([0,0,1,2],[0,1,0,0]),{hit:1,blow:2});
 assert.deepEqual(hitScore([0,0,1,1],[0,0,0,0]),{hit:2,blow:0});
 assert.deepEqual(hitScore([0,1,2,3],[3,2,1,0]),{hit:0,blow:4});
 assert.deepEqual(hitScore([0,1,2,3],[0,1,2,3]),{hit:4,blow:0});
});
test('Hit and Blow secrets honor duplicate settings and illegal guesses do not consume attempts',()=>{
 const s=hitCreate(false,()=>0);assert.deepEqual(s.secret,[0,1,2,3]);assert.deepEqual(hitCreate(true,()=>0).secret,[0,0,0,0]);
 for(const guess of [[0,0,1,2],[0,1,2],[0,1,2,6],[0,1,2,null],[0,1,2,2.1]])assert.equal(hitPlay(s,guess),s);
 assert.equal(s.guesses.length,0);
});
test('Hit and Blow wins, reveals after ten guesses, and rejects further attempts',()=>{
 const initial=hitCreate(false,()=>0),won=hitPlay(initial,[0,1,2,3]);assert.ok(won.won&&won.over);assert.equal(initial.guesses.length,0);assert.equal(hitPlay(won,[0,1,2,3]),won);
 let s=initial;for(let i=0;i<10;i++)s=hitPlay(s,[5,4,3,2]);assert.ok(s.over&&!s.won);assert.equal(s.guesses.length,10);assert.equal(hitPlay(s,[0,1,2,3]),s);
});
