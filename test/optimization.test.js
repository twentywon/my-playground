import test from 'node:test';
import assert from 'node:assert/strict';
import {imageSources,lazyImage} from '../src/image-source.js';
import {createFrameLoop} from '../src/frame-loop.js';
import {hexBoardDistance,hexBoardNeighbors} from '../src/duel-engine.js';

test('Images are decoded on first use, preserve bytes and reuse one URL across renders',async()=>{
 const previous=globalThis.window;globalThis.window={};const urls=[];
 try{
  const bytes=Uint8Array.from([137,80,78,71,13,10,26,10]),source='data:image/png;base64,'+Buffer.from(bytes).toString('base64');
  const images=imageSources({card:source});assert.equal(typeof Object.getOwnPropertyDescriptor(images,'card').get,'function');
  const first=images.card;urls.push(first);assert.match(first,/^blob:/);assert.equal(images.card,first);assert.equal(Object.getOwnPropertyDescriptor(images,'card').get,undefined);
  const response=await fetch(first);assert.equal(response.headers.get('content-type'),'image/png');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
  const svg='<svg xmlns="http://www.w3.org/2000/svg"><text>한글</text></svg>',resolve=lazyImage('data:image/svg+xml,'+encodeURIComponent(svg));const url=resolve();urls.push(url);assert.equal(resolve(),url);assert.equal(await (await fetch(url)).text(),svg);
 }finally{for(const url of urls)URL.revokeObjectURL(url);if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
test('Image fallback keeps the original source outside a browser',()=>{
 const source='data:image/png;base64,AA==';assert.equal(lazyImage(source)(),source);
});
test('Frame scheduler sleeps, wakes once, cancels pending work and cannot wake after destroy',()=>{
 const oldRequest=globalThis.requestAnimationFrame,oldCancel=globalThis.cancelAnimationFrame,queue=new Map();let next=1,calls=0,keep=true;
 globalThis.requestAnimationFrame=fn=>{const id=next++;queue.set(id,fn);return id;};globalThis.cancelAnimationFrame=id=>queue.delete(id);
 try{
  const loop=createFrameLoop(()=>{calls++;return keep;});assert.equal(queue.size,0);loop.start();loop.start();assert.equal(queue.size,1);
  const tick=()=>{const [id,fn]=queue.entries().next().value;queue.delete(id);fn(16);};tick();assert.equal(calls,1);assert.equal(queue.size,1);
  keep=false;tick();assert.equal(queue.size,0);assert.equal(loop.running,false);loop.start();assert.equal(queue.size,1);loop.stop();assert.equal(queue.size,0);
  loop.start();loop.destroy();loop.start();assert.equal(queue.size,0);
 }finally{globalThis.requestAnimationFrame=oldRequest;globalThis.cancelAnimationFrame=oldCancel;}
});
test('Hex 0–1 search agrees with independent Dijkstra costs on partial and blocked boards',()=>{
 function reference(board,size,color){const dist=Array(board.length).fill(Infinity),seen=new Set();for(let i=0;i<size;i++){const at=color===1?i:i*size;if(board[at]!==3-color)dist[at]=board[at]===color?0:1;}
  while(seen.size<board.length){let at=-1;for(let i=0;i<board.length;i++)if(!seen.has(i)&&(at<0||dist[i]<dist[at]))at=i;if(at<0||!Number.isFinite(dist[at]))return board.length;
   if(color===1?Math.floor(at/size)===size-1:at%size===size-1)return dist[at];seen.add(at);
   for(const j of hexBoardNeighbors(at,size))if(board[j]!==3-color)dist[j]=Math.min(dist[j],dist[at]+(board[j]===color?0:1));
  }return board.length;
 }
 let seed=177;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(const size of [7,9,11])for(let run=0;run<25;run++){const board=Array.from({length:size*size},()=>Math.floor(random()*3));for(const color of [1,2])assert.equal(hexBoardDistance(board,size,color),reference(board,size,color));}
 for(const color of [1,2]){assert.equal(hexBoardDistance(Array(49).fill(0),7,color),7);assert.equal(hexBoardDistance(Array(49).fill(3-color),7,color),49);}
 const neighbors=hexBoardNeighbors(0,7);neighbors.length=0;assert.deepEqual(hexBoardNeighbors(0,7),[7,1]);
});
