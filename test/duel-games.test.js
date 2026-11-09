import test from 'node:test';
import assert from 'node:assert/strict';
import {harePoints,hareEdges,hareCreate,hareMoves,harePlay,hareAI,hexBoardCreate,hexBoardNeighbors,hexBoardPath,hexBoardPlay,hexBoardCanSwap,hexBoardAI,hexBoardDistance} from '../src/duel-engine.js';

test('Hare board has the 11 intersections and 22 undirected paths; hounds cannot retreat',()=>{
 assert.equal(harePoints.length,11);assert.equal(hareEdges.length,22);const s=hareCreate();assert.deepEqual(s.hounds,[0,1,3]);assert.equal(s.hare,10);
 for(const m of hareMoves(s))assert.ok(harePoints[m.to][0]>=harePoints[m.from][0]);
 assert.equal(harePlay(s,{from:1,to:0}),s);assert.equal(harePlay(s,{from:1,to:3}),s);
 const board={...s,hounds:[2,7,9]};assert.equal(harePlay(board,{from:2,to:4}),board,'No invented diagonal');
 const next=harePlay(s,{from:1,to:5});assert.equal(next.p,2);assert.deepEqual(s.hounds,[0,1,3]);assert.ok(next.hounds.includes(5));
});
test('Hare escape and complete enclosure decide the correct winner',()=>{
 const escape=harePlay({...hareCreate(),hounds:[4,5,6],hare:1,p:2},{from:1,to:0});assert.equal(escape.winner,2);assert.equal(escape.reason,'escape');
 const trap=harePlay({...hareCreate(),hounds:[7,8,5]},{from:5,to:9});assert.equal(trap.winner,1);assert.equal(trap.reason,'trap');assert.deepEqual(hareMoves(trap),[]);assert.equal(harePlay(trap,{from:7,to:4}),trap);
});
test('Ten consecutive sideways hound moves lose; hare turns preserve the count and forward moves reset it',()=>{
 const s={...hareCreate(),hounds:[1,5,9],stall:9};const lost=harePlay(s,{from:5,to:4});assert.equal(lost.winner,2);assert.equal(lost.reason,'stall');
 const forward=harePlay(s,{from:1,to:4});assert.equal(forward.stall,0);
 const hareTurn=harePlay({...s,p:2},{from:10,to:8});assert.equal(hareTurn.stall,9);
});
test('Hare AI finds an immediate capture and escape, returns legal moves and never mutates input',()=>{
 for(const s of [{...hareCreate(),hounds:[7,8,5]},{...hareCreate(),hounds:[4,5,6],hare:1,p:2}]){const before=structuredClone(s),m=hareAI(s,{budget:100,maxDepth:5});assert.ok(hareMoves(s).some(a=>a.from===m.from&&a.to===m.to));assert.equal(harePlay(s,m).winner,s.p);assert.deepEqual(s,before);}
 assert.equal(hareAI({...hareCreate(),winner:1}),null);
});
test('Seeded hare games finish under the anti-stalling rule and conserve all four pieces',()=>{
 let seed=16;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let game=0;game<40;game++){let s=hareCreate();while(!s.winner){const moves=hareMoves(s);assert.ok(moves.length);s=harePlay(s,moves[Math.floor(rand()*moves.length)]);assert.equal(new Set([...s.hounds,s.hare]).size,4);assert.ok(s.moves<200);}assert.ok([1,2].includes(s.winner));}
});
test('Hex adjacency is symmetric and excludes touching corners',()=>{
 const n=7;assert.deepEqual(hexBoardNeighbors(0,n).sort((a,b)=>a-b),[1,7]);assert.ok(!hexBoardNeighbors(8,n).includes(0));
 for(let i=0;i<n*n;i++)for(const j of hexBoardNeighbors(i,n))assert.ok(hexBoardNeighbors(j,n).includes(i));
 assert.equal(hexBoardNeighbors(24,n).length,6);
});
test('Hex detects both colors and slanting routes, but disconnected diagonals do not win',()=>{
 const n=7,b=Array(49).fill(0);for(let r=0;r<n;r++)b[r*n+3]=1;assert.equal(hexBoardPath(b,n,1).length,7);assert.equal(hexBoardDistance(b,n,1),0);
 b.fill(0);for(let c=0;c<n;c++)b[3*n+c]=2;assert.equal(hexBoardPath(b,n,2).length,7);
 b.fill(0);for(let r=0;r<n;r++)b[r*n+r]=1;assert.equal(hexBoardPath(b,n,1).length,0);
 b.fill(0);for(let r=0;r<n;r++)b[r*n+n-1-r]=1;assert.equal(hexBoardPath(b,n,1).length,7);
});
test('Hex first-move swap changes ownership, preserves the stone and consumes the second turn',()=>{
 const initial=hexBoardCreate(7);assert.equal(hexBoardPlay(initial,'swap'),initial);const first=hexBoardPlay(initial,24);assert.ok(hexBoardCanSwap(first));
 const swapped=hexBoardPlay(first,'swap');assert.deepEqual(swapped.colors,[2,1]);assert.deepEqual(swapped.board,first.board);assert.equal(swapped.p,1);assert.equal(swapped.moves,2);assert.ok(!hexBoardCanSwap(swapped));
 const next=hexBoardPlay(swapped,23);assert.equal(next.board[23],2);assert.equal(next.p,2);assert.equal(initial.board[24],0);
 const declined=hexBoardPlay(first,25);assert.equal(hexBoardCanSwap(declined),false);assert.equal(hexBoardPlay(declined,'swap'),declined);
});
test('Hex winning color maps back to the right player after swapping',()=>{
 const s={...hexBoardCreate(7),colors:[2,1],swapped:true,p:2,moves:13};for(let r=0;r<6;r++)s.board[r*7]=1;
 const n=hexBoardPlay(s,42);assert.equal(n.winner,2);assert.equal(n.path.length,7);assert.equal(hexBoardPlay(n,1),n);assert.equal(hexBoardAI(n),null);
 for(const bad of [-1,49,1.2,NaN])assert.equal(hexBoardPlay(s,bad),s);
});
test('Hex AI takes immediate wins, blocks immediate losses, and can choose the swap',()=>{
 const s={...hexBoardCreate(7),moves:12};for(let r=0;r<6;r++)s.board[r*7]=1;const before=structuredClone(s);assert.equal(hexBoardAI(s),42);assert.deepEqual(s,before);
 s.board.fill(0);for(let c=0;c<6;c++)s.board[c]=2;assert.equal(hexBoardAI(s),6);
 assert.equal(hexBoardAI(hexBoardPlay(hexBoardCreate(9),40)),'swap');
});
test('Full random Hex boards have exactly one connecting color at every supported size',()=>{
 let seed=92;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(const size of [7,9,11])for(let i=0;i<25;i++){const board=Array.from({length:size*size},()=>rand()<.5?1:2);assert.equal(Number(!!hexBoardPath(board,size,1).length)+Number(!!hexBoardPath(board,size,2).length),1);}
});
