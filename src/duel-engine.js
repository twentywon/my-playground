// Eleven intersections, with diagonals only where a path is drawn.
export const harePoints=[[0,1],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[3,0],[3,1],[3,2],[4,1]];
export const hareEdges=[[0,1],[0,2],[0,3],[1,2],[2,3],[1,4],[2,5],[3,6],[4,5],[5,6],[4,7],[5,8],[6,9],[7,8],[8,9],[7,10],[8,10],[9,10],[1,5],[3,5],[5,7],[5,9]];
const hareNeighbors=harePoints.map((_,i)=>hareEdges.flatMap(([a,b])=>a===i?[b]:b===i?[a]:[]));
export function hareCreate(){return {hounds:[0,1,3],hare:10,p:1,winner:0,reason:'',stall:0,moves:0,last:null};}
export function hareMoves(s){
 if(s.winner)return [];
 const occupied=new Set([...s.hounds,s.hare]);
 return (s.p===1?s.hounds:[s.hare]).flatMap(from=>hareNeighbors[from].filter(to=>!occupied.has(to)&&(s.p===2||harePoints[to][0]>=harePoints[from][0])).map(to=>({from,to})));
}
export function harePlay(s,move){
 if(!move||!hareMoves(s).some(m=>m.from===move.from&&m.to===move.to))return s;
 const n={...s,hounds:[...s.hounds],p:3-s.p,moves:s.moves+1,last:{...move,player:s.p}};
 if(s.p===1){n.hounds[n.hounds.indexOf(move.from)]=move.to;n.stall=harePoints[move.from][0]===harePoints[move.to][0]?s.stall+1:0;}else n.hare=move.to;
 if(n.hounds.every(i=>harePoints[n.hare][0]<harePoints[i][0])){n.winner=2;n.reason='escape';}
 else if(n.stall>=10){n.winner=2;n.reason='stall';}
 else if(!hareMoves({...n,p:2}).length){n.winner=1;n.reason='trap';}
 else if(!hareMoves({...n,p:1}).length){n.winner=2;n.reason='blocked';}
 return n;
}
export function hareAI(s,{budget=90,maxDepth=12}={}){
 const moves=hareMoves(s);if(!moves.length)return null;const root=s.p,deadline=performance.now()+budget;let nodes=0,expired=false,choice=moves[0];
 function evaluate(n){const h=harePoints[n.hare],mobility=hareMoves({...n,p:2}).length;
  const score=h[0]*35+n.hounds.reduce((v,i)=>v+harePoints[i][0]*16,0)-mobility*17-n.stall*8-((Math.max(...n.hounds.map(i=>harePoints[i][0]))-Math.min(...n.hounds.map(i=>harePoints[i][0])))*12);
  return root===1?score:-score;
 }
 function search(n,d,alpha,beta,cache){
  if(n.winner)return n.winner===root?10000+d:-10000-d;
  if((++nodes&127)===0&&(performance.now()>deadline||nodes>55000))expired=true;
  if(!d||expired)return evaluate(n);
  const key=n.hounds.slice().sort((a,b)=>a-b).join(',')+':'+n.hare+':'+n.p+':'+n.stall+':'+d;if(cache.has(key))return cache.get(key);
  const originalAlpha=alpha,originalBeta=beta,max=n.p===root;let value=max?-Infinity:Infinity,cut=false;
  for(const m of hareMoves(n)){const score=search(harePlay(n,m),d-1,alpha,beta,cache);value=max?Math.max(value,score):Math.min(value,score);if(max)alpha=Math.max(alpha,value);else beta=Math.min(beta,value);if(beta<=alpha||expired){cut=true;break;}}
  if(!cut&&value>originalAlpha&&value<originalBeta)cache.set(key,value);return value;
 }
 for(let d=1;d<=maxDepth;d++){let best=-Infinity,next=choice;const cache=new Map(),ordered=[choice,...moves.filter(m=>m.from!==choice.from||m.to!==choice.to)];
  for(const m of ordered){const value=search(harePlay(s,m),d-1,-Infinity,Infinity,cache);if(value>best){best=value;next=m;}if(expired)break;}
  if(expired)break;choice=next;
 }
 return choice;
}

export function hexBoardCreate(size=9){const n=[7,9,11].includes(Number(size))?Number(size):9;return {size:n,board:Array(n*n).fill(0),p:1,colors:[1,2],moves:0,winner:0,path:[],last:null,swapped:false};}
const hexTopologyCache=new Map();
function hexTopology(size){
 if(hexTopologyCache.has(size))return hexTopologyCache.get(size);
 const neighbors=Array.from({length:size*size},(_,index)=>{const r=Math.floor(index/size),c=index%size;return [[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c+1],[r+1,c-1]].filter(([y,x])=>y>=0&&y<size&&x>=0&&x<size).map(([y,x])=>y*size+x);});
 if(hexTopologyCache.size>=8)hexTopologyCache.delete(hexTopologyCache.keys().next().value);
 hexTopologyCache.set(size,neighbors);return neighbors;
}
export function hexBoardNeighbors(index,size){return [...hexTopology(size)[index]];}
export function hexBoardPath(board,size,color){
 const queue=[],parent=Array(board.length).fill(-2),neighbors=hexTopology(size);
 for(let i=0;i<size;i++){const at=color===1?i:i*size;if(board[at]===color){queue.push(at);parent[at]=-1;}}
 for(let head=0;head<queue.length;head++){const at=queue[head];if(color===1?Math.floor(at/size)===size-1:at%size===size-1){const path=[];for(let p=at;p!==-1;p=parent[p])path.push(p);return path.reverse();}
  for(const next of neighbors[at])if(parent[next]===-2&&board[next]===color){parent[next]=at;queue.push(next);}
 }return [];
}
export function hexBoardCanSwap(s){return !s.winner&&s.p===2&&s.moves===1&&!s.swapped;}
export function hexBoardPlay(s,action){
 if(s.winner)return s;
 if(action==='swap'){if(!hexBoardCanSwap(s))return s;return {...s,colors:[2,1],p:1,moves:2,swapped:true,last:{type:'swap',index:s.last.index}};}
 if(!Number.isInteger(action)||action<0||action>=s.board.length||s.board[action])return s;
 const color=s.colors[s.p-1],board=[...s.board];board[action]=color;const path=hexBoardPath(board,s.size,color);
 return {...s,board,p:3-s.p,moves:s.moves+1,path,winner:path.length?s.p:0,last:{type:'place',index:action,player:s.p,color}};
}
// Empty cells cost one, connected own stones cost zero; opponents block a route.
export function hexBoardDistance(board,size,color){
 // 0–1 BFS visits each edge at most once instead of scanning every cell for
 // the next cheapest one. The deque has room for all six edges per vertex.
 const count=board.length,neighbors=hexTopology(size),dist=new Uint16Array(count).fill(count+1),done=new Uint8Array(count),queue=new Int32Array(count*14+size*2+4);
 let head=count*7+size,tail=head;
 for(let i=0;i<size;i++){const at=color===1?i:i*size;if(board[at]===3-color)continue;const cost=board[at]===color?0:1;dist[at]=cost;if(cost)queue[tail++]=at;else queue[--head]=at;}
 while(head<tail){const at=queue[head++];if(done[at])continue;done[at]=1;const best=dist[at];
  if(color===1?Math.floor(at/size)===size-1:at%size===size-1)return best;
  for(const next of neighbors[at])if(!done[next]&&board[next]!==3-color){const cost=board[next]===color?0:1;if(best+cost<dist[next]){dist[next]=best+cost;if(cost)queue[tail++]=next;else queue[--head]=next;}}
 }
 return count;
}
export function hexBoardAI(s,{budget=110}={}){
 if(s.winner)return null;const empty=s.board.flatMap((v,i)=>v?[]:[i]);if(!empty.length)return null;
 const n=s.size,color=s.colors[s.p-1],opponent=3-color,mid=(n-1)/2;
 if(hexBoardCanSwap(s)){const first=s.last.index;if(Math.abs(Math.floor(first/n)-mid)+Math.abs(first%n-mid)<=n*.55)return 'swap';}
 const board=[...s.board];
 for(const at of empty){board[at]=color;const wins=hexBoardPath(board,n,color).length;board[at]=0;if(wins)return at;}
 for(const at of empty){board[at]=opponent;const threat=hexBoardPath(board,n,opponent).length;board[at]=0;if(threat)return at;}
 const deadline=performance.now()+budget;
 const centered=at=>Math.abs(Math.floor(at/n)-mid)+Math.abs(at%n-mid);
 const choices=empty.sort((a,b)=>centered(a)-centered(b));let best=-Infinity,choice=choices[0];
 for(const at of choices){board[at]=color;const own=hexBoardDistance(board,n,color),other=hexBoardDistance(board,n,opponent);board[at]=0;
  const friends=hexBoardNeighbors(at,n).filter(i=>board[i]===color).length,enemies=hexBoardNeighbors(at,n).filter(i=>board[i]===opponent).length;
  const score=other*11-own*13+Math.min(friends,2)*.8+Math.min(enemies,2)*.35-centered(at)*.09;
  if(score>best){best=score;choice=at;}if(performance.now()>deadline)break;
 }return choice;
}
