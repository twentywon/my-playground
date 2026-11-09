// Independent rules for tile and hidden-fleet games. UI drafts never mutate a committed turn.
export function shuffled(items,seed=Date.now()) {let x=seed>>>0;const a=[...items];for(let i=a.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const outcome=points=>points[0]===points[1]?3:points[0]<points[1]?1:2;
export const tileValue=t=>t.joker?30:t.n;
export function rummyCreate(seed){const tiles=[];for(let copy=0;copy<2;copy++)for(let c=0;c<4;c++)for(let n=1;n<=13;n++)tiles.push({id:tiles.length,c,n});tiles.push({id:104,joker:true},{id:105,joker:true});const deck=shuffled(tiles,seed);return {hands:[deck.slice(0,14),deck.slice(14,28)],stock:deck.slice(28),table:[],opened:[false,false],p:1,winner:0,passes:0,turn:1,last:'타일을 골라 첫 조합을 만들어 보세요.'};}
export function rummyMeld(tiles){
 if(tiles.length<3||tiles.length>13)return null;
 const fixed=tiles.filter(t=>!t.joker),wild=tiles.length-fixed.length;
 if(!fixed.length||wild>2)return null;
 let group=null;
 if(tiles.length<=4&&fixed.every(t=>t.n===fixed[0].n)&&new Set(fixed.map(t=>t.c)).size===fixed.length)
  group={kind:'group',value:fixed[0].n*tiles.length,label:`${fixed[0].n} 그룹`};
 if(fixed.every(t=>t.c===fixed[0].c)&&new Set(fixed.map(t=>t.n)).size===fixed.length){
  const nums=fixed.map(t=>t.n),lo=Math.max(1,Math.max(...nums)-tiles.length+1),hi=Math.min(Math.min(...nums),14-tiles.length);
  if(lo<=hi){const run={kind:'run',start:hi,value:tiles.length*(2*hi+tiles.length-1)/2,label:`${hi}–${hi+tiles.length-1} 런`};if(!group||run.value>group.value)return run;}
 }
 return group;
}
export function rummyDraftStatus(s,table,hand){
 const original=new Set(s.table.flat().map(t=>t.id));
 const points=table.filter(row=>row.length&&row.every(t=>!original.has(t.id))).reduce((sum,row)=>sum+(rummyMeld(row)?.value||0),0);
 const added=s.hands[s.p-1].filter(t=>!hand.some(h=>h.id===t.id)).length;
 const {error}=rummyCommit(s,table,hand);
 return {points,added,error,valid:!error,changed:JSON.stringify(table.map(r=>r.map(t=>t.id)))!==JSON.stringify(s.table.map(r=>r.map(t=>t.id)))||hand.length!==s.hands[s.p-1].length};
}
export function rummyCommit(s,table,hand){
 const bad=message=>({state:s,error:message});if(s.winner)return bad('이미 끝난 게임입니다.');const p=s.p-1,original=s.hands[p],available=[...s.table.flat(),...original],ids=new Map(available.map(t=>[t.id,t]));
 if(!Array.isArray(table)||!Array.isArray(hand)||table.some(row=>!Array.isArray(row)))return bad('타일 구성을 확인하세요.');
 const all=[...table.flat(),...hand];if(all.length!==available.length||new Set(all.map(t=>t?.id)).size!==all.length||all.some(t=>!ids.has(t?.id)))return bad('모든 타일이 정확히 한 번씩 있어야 합니다.');
 // Resolve canonical tiles by id; a draft cannot change a tile's face or value.
 table=table.filter(row=>row.length).map(row=>row.map(t=>ids.get(t.id)));hand=hand.map(t=>ids.get(t.id));
 if(hand.some(t=>!original.some(o=>o.id===t.id)))return bad('테이블에 있던 타일은 손에 가져올 수 없습니다.');
 const added=original.filter(t=>!hand.some(h=>h.id===t.id));if(!added.length)return bad('내 타일을 최소 한 개 내려놓아야 합니다.');
 const melds=table.map(rummyMeld);if(melds.some(m=>!m))return bad('모든 조합은 3개 이상의 올바른 그룹 또는 런이어야 합니다.');
 if(!s.opened[p]){const oldIds=new Set(s.table.flat().map(t=>t.id));for(const row of s.table){if(!table.some(next=>next.length===row.length&&row.every(t=>next.some(n=>n.id===t.id))))return bad('첫 등록 전에는 기존 조합을 바꿀 수 없습니다.');}
  const fresh=table.filter(row=>row.every(t=>!oldIds.has(t.id)));if(fresh.flat().length!==added.length)return bad('첫 등록은 내 타일만으로 새 조합을 만드세요.');
  if(fresh.reduce((n,row)=>n+rummyMeld(row).value,0)<30)return bad('첫 등록은 조합의 숫자 합이 30점 이상이어야 합니다.');
 }
 const hands=s.hands.map((h,i)=>i===p?hand:h),opened=[...s.opened];opened[p]=true;return {state:{...s,hands,table,opened,p:3-s.p,winner:hand.length?0:s.p,passes:0,turn:s.turn+1,last:`플레이어 ${s.p} · ${added.length}개 타일 등록`},error:''};
}
export function rummyDraw(s){if(s.winner)return s;const hands=s.hands.map(h=>[...h]),stock=[...s.stock],passes=stock.length?0:s.passes+1;if(stock.length)hands[s.p-1].push(stock.pop());return {...s,hands,stock,passes,p:3-s.p,turn:s.turn+1,winner:passes>=2?outcome(hands.map(h=>h.reduce((n,t)=>n+tileValue(t),0))):0,last:passes?'남은 타일이 없어 차례를 넘겼습니다.':'타일 1개를 가져왔습니다.'};}
export function rummyCandidates(hand){
 const found=new Map(),wild=hand.filter(t=>t.joker),fixed=hand.filter(t=>!t.joker);
 function add(row){const meld=rummyMeld(row);if(meld){const key=row.map(t=>t.id).sort((a,b)=>a-b).join(',');found.set(key,{tiles:row,value:meld.value});}}
 for(let n=1;n<=13;n++){const colors=[0,1,2,3].map(c=>fixed.find(t=>t.n===n&&t.c===c)).filter(Boolean);for(let mask=1;mask<1<<colors.length;mask++){const base=colors.filter((_,i)=>mask>>i&1);for(let w=0;w<=wild.length;w++)if(base.length+w>=3&&base.length+w<=4)add([...base,...wild.slice(0,w)]);}}
 for(let c=0;c<4;c++)for(let start=1;start<=11;start++){const row=[],used=[];for(let n=start;n<=13;n++){const t=fixed.find(t=>t.c===c&&t.n===n);if(t)row.push(t);else if(used.length<wild.length){row.push(wild[used.length]);used.push(1);}else break;if(row.length>=3)add([...row]);}}
 for(const row of [...found.values()]){
  const alternate=row.tiles.map(t=>hand.find(other=>other.id!==t.id&&(t.joker?other.joker:!other.joker&&other.c===t.c&&other.n===t.n))||t);
  add(alternate);
 }
 return [...found.values()].sort((a,b)=>b.tiles.length-a.tiles.length||b.value-a.value);
}
export function rummyAI(s){
 const hand=s.hands[s.p-1],candidates=rummyCandidates(hand).slice(0,160);let best=[],bestCount=0,nodes=0;
 function visit(at,used,rows,value){if(++nodes>6000)return;const count=used.size;if((s.opened[s.p-1]||value>=30)&&count>bestCount){bestCount=count;best=rows;}for(let i=at;i<candidates.length;i++){const row=candidates[i];if(row.tiles.some(t=>used.has(t.id)))continue;visit(i+1,new Set([...used,...row.tiles.map(t=>t.id)]),[...rows,row.tiles],value+row.value);}}
 visit(0,new Set(),[],0);let table=s.table.map(row=>[...row]).concat(best),used=new Set(best.flat().map(t=>t.id)),remaining=hand.filter(t=>!used.has(t.id));
 if(s.opened[s.p-1]){let changed=true;while(changed){changed=false;for(const t of remaining){const row=table.find(r=>rummyMeld([...r,t]));if(row){row.push(t);remaining=remaining.filter(v=>v.id!==t.id);changed=true;break;}}}}
 const next=rummyCommit(s,table,remaining);return next.error?rummyDraw(s):next.state;
}
export function dominoCreate(rule='draw',seed){const tiles=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)tiles.push({id:tiles.length,a,b});const deck=shuffled(tiles,seed);return {rule:rule==='block'?'block':'draw',hands:[deck.slice(0,7),deck.slice(7,14)],stock:deck.slice(14),chain:[],p:1,winner:0,passes:0,turn:1,last:'첫 타일은 원하는 것을 놓을 수 있어요.'};}
export function dominoMoves(s){if(s.winner)return [];const left=s.chain[0]?.a,right=s.chain.at(-1)?.b;return s.hands[s.p-1].flatMap(t=>!s.chain.length?[{id:t.id,side:'right'}]:[...(t.a===left||t.b===left?[{id:t.id,side:'left'}]:[]),...(t.a===right||t.b===right?[{id:t.id,side:'right'}]:[])]);}
export function dominoPlay(s,id,side){if(!dominoMoves(s).some(m=>m.id===id&&m.side===side))return s;const tile=s.hands[s.p-1].find(t=>t.id===id),chain=[...s.chain];let t={...tile};if(chain.length){const end=side==='left'?chain[0].a:chain.at(-1).b;if(side==='left'?t.b!==end:t.a!==end)[t.a,t.b]=[t.b,t.a];}side==='left'?chain.unshift(t):chain.push(t);const hands=s.hands.map((h,i)=>i===s.p-1?h.filter(t=>t.id!==id):h);return {...s,hands,chain,p:3-s.p,winner:hands[s.p-1].length?0:s.p,passes:0,turn:s.turn+1,last:`플레이어 ${s.p} · ${tile.a}–${tile.b} 연결`};}
export function dominoDraw(s){if(s.winner||dominoMoves(s).length||s.rule!=='draw'||!s.stock.length)return s;const stock=[...s.stock],hands=s.hands.map(h=>[...h]);hands[s.p-1].push(stock.pop());return {...s,hands,stock,last:'타일 1개를 가져왔어요. 연결할 수 있는지 확인하세요.'};}
export function dominoPass(s){if(s.winner||dominoMoves(s).length||s.rule==='draw'&&s.stock.length)return s;const passes=s.passes+1;return {...s,passes,p:3-s.p,turn:s.turn+1,winner:passes>=2?outcome(s.hands.map(h=>h.reduce((n,t)=>n+t.a+t.b,0))):0,last:'연결할 타일이 없어 차례를 넘겼습니다.'};}
export function dominoAI(s){let n=s;while(!dominoMoves(n).length&&n.rule==='draw'&&n.stock.length)n=dominoDraw(n);const moves=dominoMoves(n).sort((a,b)=>{const value=m=>{const t=n.hands[n.p-1].find(t=>t.id===m.id);return t.a+t.b+(t.a===t.b?3:0);};return value(b)-value(a);});return moves.length?dominoPlay(n,moves[0].id,moves[0].side):dominoPass(n);}
export const fleetLengths=[5,4,3,3,2],fleetNames=['항공모함','전함','순양함','잠수함','구축함'];
export function fleetCells(start,length,vertical=false){if(!Number.isInteger(start)||start<0||start>=100)return null;const row=Math.floor(start/10),col=start%10;if(vertical?row+length>10:col+length>10)return null;return Array.from({length},(_,i)=>start+i*(vertical?10:1));}
export function fleetPlace(fleet,index,start,vertical=false){if(index<0||index>=5||!Number.isInteger(index))return null;const cells=fleetCells(start,fleetLengths[index],vertical);if(!cells||fleet.some((ship,i)=>i!==index&&ship?.some(cell=>cells.includes(cell))))return null;const next=fleet.map(ship=>ship&&[...ship]);next[index]=cells;return next;}
export function fleetValid(fleet){return Array.isArray(fleet)&&fleet.length===5&&fleet.every((ship,i)=>ship?.length===fleetLengths[i]&&[false,true].some(v=>JSON.stringify(fleetCells(Math.min(...ship),ship.length,v))===JSON.stringify([...ship].sort((a,b)=>a-b))))&&new Set(fleet.flat()).size===17;}
export function fleetRandom(seed=Date.now()){let fleet=Array(5).fill(null);for(let i=0;i<5;i++){const options=shuffled(Array.from({length:200},(_,n)=>[n%100,n>=100]),seed+i*7919);for(const [at,v]of options){const next=fleetPlace(fleet,i,at,v);if(next){fleet=next;break;}}}return fleet;}
export function battleCreate(){return {fleets:[Array(5).fill(null),Array(5).fill(null)],shots:[[],[]],p:1,phase:'setup',winner:0,last:null,log:[],turn:1};}
export function battleReady(s,fleet){if(s.phase!=='setup'||!fleetValid(fleet))return s;const fleets=s.fleets.map((f,i)=>i===s.p-1?fleet.map(ship=>[...ship]):f);return {...s,fleets,p:s.p===1?2:1,phase:s.p===2?'play':'setup'};}
export function battleFire(s,cell){if(s.phase!=='play'||s.winner||!Number.isInteger(cell)||cell<0||cell>=100||s.shots[s.p-1].includes(cell))return s;const shots=s.shots.map((list,i)=>i===s.p-1?[...list,cell]:list),fleet=s.fleets[2-s.p],ship=fleet.findIndex(v=>v.includes(cell)),sunk=ship>=0&&fleet[ship].every(c=>shots[s.p-1].includes(c)),won=fleet.flat().every(c=>shots[s.p-1].includes(c));const last={player:s.p,cell,hit:ship>=0,sunk,ship:sunk?ship:null};return {...s,shots,p:3-s.p,winner:won?s.p:0,turn:s.turn+1,last,log:[...(s.log||[]),last]};}
// Uses only observed hit/miss/sunk feedback, never unhit enemy positions.
export function battleKnowledge(s,p=s.p){const fleet=s.fleets[2-p],shots=s.shots[p-1],hits=shots.filter(c=>fleet.some(ship=>ship.includes(c))),sunk=fleet.map((ship,i)=>ship.every(c=>shots.includes(c))?i:-1).filter(i=>i>=0);return {shots,hits,sunkCells:sunk.flatMap(i=>fleet[i]),remaining:fleetLengths.filter((_,i)=>!sunk.includes(i))};}
export function battleTarget({shots,hits,sunkCells,remaining}){const fired=new Set(shots),hitSet=new Set(hits),active=hits.filter(c=>!sunkCells.includes(c)),blocked=new Set([...shots.filter(c=>!hitSet.has(c)),...sunkCells]),scores=Array(100).fill(0);for(const length of remaining)for(let at=0;at<100;at++)for(const v of [false,true]){const cells=fleetCells(at,length,v);if(!cells||cells.some(c=>blocked.has(c)))continue;const matches=cells.filter(c=>active.includes(c)).length;if(active.length&&!matches)continue;for(const c of cells)if(!fired.has(c))scores[c]+=matches?20*matches*matches:1;}let best=-1;for(let c=0;c<100;c++)if(!fired.has(c)&&(best<0||scores[c]>scores[best]))best=c;return best;}
