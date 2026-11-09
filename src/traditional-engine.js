// Janggi: board coordinates run from the upper Han side to the lower Cho side.
export const janggiNames={K:'楚',A:'士',R:'車',C:'包',H:'馬',E:'象',S:'兵',k:'漢',a:'士',r:'車',c:'包',h:'馬',e:'象',s:'卒'};
const jSide=v=>!v?0:v===v.toUpperCase()?1:2;
const jPalace=(x,y)=>x>=3&&x<=5&&(y<=2||y>=7);
const jDiagonals=[[3,13,23],[5,13,21],[66,76,86],[68,76,84]];
const jConnected=(a,b)=>jDiagonals.some(l=>l.includes(a)&&l.includes(b)&&Math.abs(l.indexOf(a)-l.indexOf(b))===1);
// Orders are read from each player's own left; Han's row is mirrored on screen.
export const janggiSetups = [
 {id:'inner', name:'상 안쪽', order:['H','E','E','H']},
 {id:'outer', name:'상 바깥쪽', order:['E','H','H','E']},
 {id:'left', name:'왼쪽 상 안쪽', order:['H','E','H','E']},
 {id:'right', name:'오른쪽 상 안쪽', order:['E','H','E','H']}
];
export function janggiCreate(cho='inner',han='inner') {
 const board=Array(90).fill('');
 for(const p of [1,2]) {
  const row=p===1?9:0, sign=p===1?-1:1;
  const order=janggiSetups.find(v=>v.id===(p===1?cho:han))?.order||janggiSetups[0].order;
  const flank=p===1?order:[...order].reverse();
  const put=(x,y,t)=>board[y*9+x]=p===1?t:t.toLowerCase();
  ['R',flank[0],flank[1],'A','', 'A',flank[2],flank[3],'R'].forEach((t,x)=>{if(t)put(x,row,t)});
  put(4,row+sign,'K');for(const x of [1,7])put(x,row+2*sign,'C');
  for(const x of [0,2,4,6,8])put(x,row+3*sign,'S');
 }
 return {board,p:1,winner:0,last:null,passes:0,ply:0,seen:{[board.join(',')+':1']:1},facing:false};
}
export function janggiFacing(s){const a=s.board.indexOf('K'),b=s.board.indexOf('k');if(a<0||b<0||a%9!==b%9)return false;for(let i=Math.min(a,b)+9;i<Math.max(a,b);i+=9)if(s.board[i])return false;return true}
function jPseudo(s,from){const b=s.board,v=b[from];if(!v)return [];const p=jSide(v),type=v.toUpperCase(),x=from%9,y=Math.floor(from/9),out=[];const add=(xx,yy)=>{if(xx>=0&&xx<9&&yy>=0&&yy<10&&jSide(b[yy*9+xx])!==p)out.push(yy*9+xx)};
 if(type==='K'||type==='A'){for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,yy=y+dy,to=yy*9+xx;if(jPalace(xx,yy)&&(p===1?yy>=7:yy<=2)&&(!dx||!dy||jConnected(from,to)))add(xx,yy)}}
 if(type==='S'){const f=p===1?-1:1;add(x-1,y);add(x+1,y);add(x,y+f);for(const dx of [-1,1])if(jPalace(x,y)&&(p===1?y<=2:y>=7)&&jConnected(from,(y+f)*9+x+dx))add(x+dx,y+f)}
 if(type==='H'||type==='E'){for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])for(const sign of [-1,1]){const a=[x+dx,y+dy],b2=dx?[x+dx*2,y+sign]:[x+sign,y+dy*2],end=type==='H'?(dx?[x+dx*2,y+sign]:[x+sign,y+dy*2]):dx?[x+dx*3,y+sign*2]:[x+sign*2,y+dy*3];if(a[0]<0||a[0]>8||a[1]<0||a[1]>9||s.board[a[1]*9+a[0]])continue;if(type==='E'&&(b2[0]<0||b2[0]>8||b2[1]<0||b2[1]>9||s.board[b2[1]*9+b2[0]]))continue;add(...end)}}
 if(type==='R'||type==='C'){const rays=[];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const ray=[];for(let n=1;x+dx*n>=0&&x+dx*n<9&&y+dy*n>=0&&y+dy*n<10;n++)ray.push((y+dy*n)*9+x+dx*n);rays.push(ray)}for(const line of jDiagonals)if(line.includes(from)){const i=line.indexOf(from);rays.push(line.slice(i+1),line.slice(0,i).reverse())}for(const ray of rays){let screen=false;for(const to of ray){const target=b[to];if(type==='C'&&!screen){if(target){if(target.toUpperCase()==='C')break;screen=true}continue}if(target){if(jSide(target)!==p&&(type!=='C'||target.toUpperCase()!=='C'))out.push(to);break}out.push(to)}}}
 return [...new Set(out)]}
export function janggiCheck(s,p=s.p){const king=s.board.indexOf(p===1?'K':'k');return king<0||s.board.some((v,i)=>jSide(v)===3-p&&jPseudo(s,i).includes(king))}
export function janggiMoves(s){if(s.winner)return [];const out=[];for(let from=0;from<90;from++)if(jSide(s.board[from])===s.p)for(const to of jPseudo(s,from)){if(s.board[to]?.toUpperCase()==='K')continue;const b=[...s.board];b[to]=b[from];b[from]='';const n={...s,board:b};if(!janggiCheck(n,s.p)&&(!s.facing||!janggiFacing(n)))out.push({from,to})}return out}
export function janggiPlay(s,move){if(s.winner)return s;if(move==='draw')return s.facing?{...s,winner:3}:s;if(move==='pass'){if(janggiCheck(s)||s.facing)return s;return {...s,p:3-s.p,passes:s.passes+1,winner:s.passes?3:0,last:null}}if(!janggiMoves(s).some(v=>v.from===move.from&&v.to===move.to))return s;const n={...s,board:[...s.board],seen:{...s.seen},p:3-s.p,last:move,passes:0,ply:s.ply+1};n.board[move.to]=n.board[move.from];n.board[move.from]='';n.facing=janggiFacing(n);const key=n.board.join(',')+':'+n.p;n.seen[key]=(n.seen[key]||0)+1;if(!n.facing&&janggiCheck(n)&&!janggiMoves(n).length)n.winner=s.p;else if(n.seen[key]>=3||n.ply>=300)n.winner=3;return n}
const jValues={K:10000,R:130,C:70,H:50,E:30,A:30,S:20};
function jSearchStep(s,m){
 const board=[...s.board];board[m.to]=board[m.from];board[m.from]='';
 const n={...s,board,p:3-s.p,passes:0,ply:s.ply+1,last:m};n.facing=janggiFacing(n);return n;
}
function jEvaluate(s){
 let score=0;
 for(let i=0;i<90;i++){
  const v=s.board[i];if(!v)continue;
  const side=jSide(v),type=v.toUpperCase(),x=i%9,y=Math.floor(i/9),advance=side===1?9-y:y,center=4-Math.abs(x-4);
  let value=jValues[type]*10;
  if(type==='S')value+=advance*9+center*8;
  if(type==='H'||type==='E')value+=center*7+Math.min(advance,5)*4;
  if(type==='R'||type==='C')value+=center*3+Math.min(advance,6)*3;
  if(type==='K')value+=x===4?8:0;
  score+=(side===s.p?1:-1)*value;
 }
 return score;
}
export function janggiAI(s,{budget=360,maxDepth=4,nodeBudget=22000}={}){
 if(s.winner)return null;
 const root=janggiMoves(s);if(!root.length)return s.facing?'draw':'pass';
 const deadline=Date.now()+budget,cache=new Map(),path=new Map();let nodes=0,timedOut=false;
 const order=(n,moves,pv)=>[...moves].sort((a,b)=>{
  const value=m=>(pv&&m.from===pv.from&&m.to===pv.to?1e7:0)+(n.board[m.to]?jValues[n.board[m.to].toUpperCase()]*100-jValues[n.board[m.from].toUpperCase()]:0);
  return value(b)-value(a);
 });
 function search(n,depth,alpha,beta,ply,quiet=2){
  if(++nodes>nodeBudget||Date.now()>=deadline){timedOut=true;return jEvaluate(n);}
  const key=n.board.join(',')+':'+n.p,visits=(n.seen?.[key]||0)+(path.get(key)||0);
  if(visits>=3||n.ply>=300)return 0;
  const checked=janggiCheck(n),legal=janggiMoves(n);
  if(!legal.length)return checked&&!n.facing?-100000+ply:0;
  // Resolve captures and checks at the search horizon to avoid hanging a piece.
  let moves=legal,stand=jEvaluate(n);
  if(depth<=0){
   if(!quiet)return stand;
   if(!checked){if(stand>=beta)return stand;alpha=Math.max(alpha,stand);moves=legal.filter(m=>n.board[m.to]);if(!moves.length)return stand;}
  }
  const originalAlpha=alpha,cacheKey=key+':'+depth+':'+quiet+':'+visits,entry=cache.get(cacheKey);
  if(entry){if(entry.flag==='exact')return entry.score;if(entry.flag==='lower')alpha=Math.max(alpha,entry.score);if(entry.flag==='upper')beta=Math.min(beta,entry.score);if(alpha>=beta)return entry.score;}
  let value=n.facing?0:depth<=0&&!checked?stand:-Infinity,best=null;
  if(n.facing)alpha=Math.max(alpha,0); // The defender can accept bikjang.
  path.set(key,(path.get(key)||0)+1);
  for(const m of order(n,moves,entry?.best)){
   const score=-search(jSearchStep(n,m),depth-1,-beta,-alpha,ply+1,depth<=0?quiet-1:quiet);
   if(score>value){value=score;best=m;}alpha=Math.max(alpha,value);
   if(alpha>=beta||timedOut)break;
  }
  path.set(key,path.get(key)-1);
  if(!timedOut)cache.set(cacheKey,{score:value,best,flag:value<=originalAlpha?'upper':value>=beta?'lower':'exact'});
  return value;
 }
 let best=order(s,root)[0];
 for(let depth=1;depth<=maxDepth;depth++){
  let value=s.facing?0:-Infinity,candidate=s.facing?'draw':best,alpha=-Infinity;
  for(const move of order(s,root,typeof best==='object'?best:null)){
   const score=-search(jSearchStep(s,move),depth-1,-Infinity,-alpha,1);
   if(score>value){value=score;candidate=move;}alpha=Math.max(alpha,value);
   if(timedOut)break;
  }
  if(timedOut)break;best=candidate;if(value>99000)break;
 }
 return best;
}
// Yut house rules: marked fourth stick makes back-do; at first point it returns
// to the starting corner (20). A back-do with no movable on-board token is lost.
export const yutPoints=Array.from({length:21},(_,i)=>i<=5?[90,90-i*16]:i<=10?[90-(i-5)*16,10]:i<=15?[10,10+(i-10)*16]:[10+(i-15)*16,90]).concat([[76.7,23.3],[63.3,36.7],[50,50],[36.7,63.3],[23.3,76.7],[23.3,23.3],[36.7,36.7],[63.3,63.3],[76.7,76.7]]);
export const yutNames=Object.freeze({'-1':'빽도',1:'도',2:'개',3:'걸',4:'윷',5:'모'});
export function yutCreate(){return {p:1,tokens:[Array.from({length:4},()=>({pos:-1,lane:'',trail:[]})),Array.from({length:4},()=>({pos:-1,lane:'',trail:[]}))],queue:[],phase:'throw',winner:0,last:null,motion:null,message:'윷 네 개를 눌러 던져 보세요.'}}
function yutSettle(s) {
 if(s.phase!=='move'||s.winner)return s;
 const canMove=s.queue.some((_,qi)=>s.tokens[s.p-1].some((_,i)=>yutMoves(s,i,qi).length));
 if(canMove)return s;
 return {...s,queue:[],p:3-s.p,phase:'throw',message:'움직일 말이 없어 빽도를 버립니다. 다음 차례예요.'};
}
export function yutThrow(s,sticks){
 if(s.phase!=='throw'||s.winner||!Array.isArray(sticks)||sticks.length!==4)return s;
 const flat=sticks.filter(Boolean).length,n=flat===1&&sticks[3]?-1:flat||5;
 return yutSettle({...s,queue:[...s.queue,n],phase:n>=4?'throw':'move',last:{n,sticks:[...sticks]},motion:null,message:yutNames[n]+'! '+(n>=4?'한 번 더 던지세요.':'결과와 움직일 말을 고르세요.')});
}
function yutBack(token) {
 const trail=[...(token.trail||[])];
 if(trail.length){const prev=trail.pop();return {...prev,trail,path:[prev.pos]};}
 // Fallback for loaded positions without route history.
 const reverse={21:5,22:21,23:token.lane==='a'?22:27,24:23,25:24,26:10,27:26,28:23,29:28};
 const pos=token.pos===1?20:reverse[token.pos]??token.pos-1;
 return {pos,lane:pos>20?token.lane:'',trail,path:[pos]};
}
function yutAdvance(token,n,branch){
 if(n===-1)return yutBack(token);
 let pos=token.pos,lane=token.lane;const trail=[...(token.trail||[])],path=[];
 if(pos===-1)pos=0;
 for(let step=0;step<n;step++){
  if(pos===99)break;
  trail.push({pos:pos===0?20:pos,lane});
  if(step===0&&branch==='shortcut'&&(pos===5||pos===10)){lane=pos===5?'a':'b';pos=pos===5?21:26;}
  else if(pos===23){if(step===0&&branch==='finish')lane='b';pos=lane==='a'?24:28;}
  else if(pos===21)pos=22;else if(pos===22||pos===27)pos=23;
  else if(pos===24)pos=25;else if(pos===25){pos=15;lane='';}
  else if(pos===26)pos=27;else if(pos===28)pos=29;else if(pos===29){pos=20;lane='';}
  else if(pos===20)pos=99;else pos++;
  path.push(pos);
 }
 return {pos,lane,trail,path};
}
export function yutMoves(s,index,qi=0){
 if(s.winner||s.phase!=='move'||!Number.isInteger(qi)||!s.queue[qi])return [];
 const token=s.tokens[s.p-1][index],n=s.queue[qi];
 if(!token||token.pos===99||n===-1&&token.pos<1)return [];
 const branches=n===-1?['back']:token.pos===5||token.pos===10?['outer','shortcut']:token.pos===23?['continue','finish']:['continue'];
 const out=branches.map(branch=>({index,qi,branch,...yutAdvance(token,n,branch)}));
 return out.filter((m,i)=>!out.slice(0,i).some(v=>v.pos===m.pos&&v.lane===m.lane));
}
export function yutPlay(s,move){
 if(!move)return s;
 const dest=yutMoves(s,move.index,move.qi).find(v=>v.branch===move.branch);if(!dest)return s;
 const n=structuredClone(s),own=n.tokens[s.p-1],other=n.tokens[2-s.p],from=own[move.index].pos,used=n.queue[move.qi];
 const group=own.flatMap((v,i)=>i===move.index||from>=1&&from!==99&&v.pos===from?[i]:[]);
 for(const i of group)own[i]={pos:dest.pos,lane:dest.lane,trail:structuredClone(dest.trail)};
 if(dest.pos!==99)for(const token of own)if(token.pos===dest.pos){token.lane=dest.lane;token.trail=structuredClone(dest.trail);}
 const captured=[];
 if(dest.pos!==99)for(const [i,v]of other.entries())if(v.pos===dest.pos){v.pos=-1;v.lane='';v.trail=[];captured.push(i);}
 n.motion={p:s.p,indices:group,from,to:dest.pos,path:dest.path,captured};
 n.queue.splice(move.qi,1);
 if(own.every(v=>v.pos===99)){n.winner=s.p;n.message='네 말 모두 완주!';return n;}
 // A yut/mo already earned its extra throw; catching with it does not earn another.
 if(captured.length&&used<4){n.phase='throw';n.message='상대 말을 잡았어요! 한 번 더 던지세요.';}
 else if(n.queue.length){n.phase='move';n.message=captured.length?'말을 잡았어요. 윷·모의 추가 던지기는 이미 받았어요.':'남은 윷 결과를 사용하세요.';}
 else{n.p=3-s.p;n.phase='throw';n.message=captured.length?'말을 잡았어요. 다음 차례입니다.':'다음 차례 · 윷을 던지세요.';}
 return yutSettle(n);
}
export function yutAI(s){let best=null,value=-Infinity;s.queue.forEach((n,qi)=>s.tokens[s.p-1].forEach((token,index)=>yutMoves(s,index,qi).forEach(m=>{const capture=s.tokens[2-s.p].filter(v=>v.pos===m.pos&&m.pos!==99).length,stack=s.tokens[s.p-1].filter((v,i)=>i!==index&&v.pos===m.pos&&m.pos!==99).length,score=(m.pos===99?100:0)+capture*35+stack*8+n+(m.branch==='shortcut'?12:0)+(n===-1&&m.pos===20?20:0);if(score>value){value=score;best=m;}})));return best;}
