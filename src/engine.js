export const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
export function flips(b,r,c,p){if(b[r]?.[c]!==0)return [];let out=[];for(const [dr,dc]of dirs){let a=[],y=r+dr,x=c+dc;while(b[y]?.[x]===3-p){a.push([y,x]);y+=dr;x+=dc}if(b[y]?.[x]===p)out.push(...a)}return out}
export function moves(b,p){return b.flatMap((row,r)=>row.flatMap((_,c)=>flips(b,r,c,p).length?[[r,c]]:[]))}
export function five(b,r,c,p){return [[1,0],[0,1],[1,1],[1,-1]].some(([dy,dx])=>{let n=1;for(const s of [-1,1]){let y=r+dy*s,x=c+dx*s;while(b[y]?.[x]===p){n++;y+=dy*s;x+=dx*s}}return n>=5})}
export function hexDist(a,b){return Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]),Math.abs(a[0]+a[1]-b[0]-b[1]))}
// Axial neighbors are stable across maps. Enumerate 18 reachable cells instead of
// scanning the entire board for every piece.
const hexSteps=[];
for(let q=-2;q<=2;q++)for(let r=-2;r<=2;r++){
 const distance=hexDist([0,0],[q,r]);if(distance===1||distance===2)hexSteps.push([q,r,distance]);
}
export function hexActions(board,player){
 const actions=[];
 for(const from in board)if(board[from]===player){
  const [q,r]=from.split(',').map(Number);
  for(const [dq,dr]of hexSteps){const to=`${q+dq},${r+dr}`;if(board[to]===0)actions.push([from,to]);}
 }
 return actions;
}
export function hexGain(board,from,to,player){
 const [q,r]=to.split(',').map(Number);let score=hexDist(from.split(',').map(Number),[q,r])===1?1:0;
 for(const [dq,dr,d]of hexSteps)if(d===1&&board[`${q+dq},${r+dr}`]===3-player)score+=2;
 return score;
}
export function hexPlay(board,from,to,player){
 if(board[from]!==player||board[to]!==0)return board;
 const [q,r]=to.split(',').map(Number),distance=hexDist(from.split(',').map(Number),[q,r]);
 if(distance!==1&&distance!==2)return board;
 const next={...board};if(distance===2)next[from]=0;next[to]=player;
 for(const [dq,dr,d]of hexSteps){const key=`${q+dq},${r+dr}`;if(d===1&&next[key]===3-player)next[key]=player;}
 if(!Object.values(next).includes(3-player))for(const k of Object.keys(next))next[k]=player;
 return next;
}
export const categories=['에이스','듀얼','트리플','쿼드','펜타','헥사','초이스','포 카드','풀 하우스','스몰 스트레이트','라지 스트레이트','야찌'];
export function yachtScore(d,i){const sum=d.reduce((a,b)=>a+b,0), counts=Array.from({length:6},(_,n)=>d.filter(v=>v===n+1).length),u=[...new Set(d)].sort().join('');if(i<6)return counts[i]*(i+1);if(i===6)return sum;if(i===7)return Math.max(...counts)>=4?sum:0;if(i===8)return counts.includes(3)&&counts.includes(2)?sum:0;if(i===9)return ['1234','2345','3456'].some(s=>u.includes(s))?15:0;if(i===10)return ['12345','23456'].includes(u)?30:0;return counts.includes(5)?50:0}
export function createHexMap(shape='hexagon',radius=4){
 const board={};
 for(let q=-radius;q<=radius;q++)for(let r=-radius;r<=radius;r++){
  if(shape!=='diamond'&&Math.abs(q+r)>radius)continue;
  if(shape==='ring'&&hexDist([0,0],[q,r])<=1)continue;
  board[`${q},${r}`]=0;
 }
 const starts=shape==='diamond'?[[`-${radius},-${radius}`,`${radius},${radius}`],[`-${radius},${radius}`,`${radius},-${radius}`]]:[[`-${radius},0`,`${radius},-${radius}`,`0,${radius}`],[`0,-${radius}`,`${radius},0`,`-${radius},${radius}`]];
 starts.forEach((keys,i)=>keys.forEach(k=>board[k]=i+1));
 return board;
}
