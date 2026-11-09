// Kalah: six pits per player, four stones per pit, 48 stones in total.
export function mancalaCreate(){return {board:Array.from({length:14},(_,i)=>i===6||i===13?0:4),p:1,winner:0,moves:0,last:null};}
const mancalaOwn=(p,i)=>p===1?i>=0&&i<6:i>=7&&i<13;
export function mancalaMoves(s){return s.winner?[]:s.board.flatMap((n,i)=>n&&mancalaOwn(s.p,i)?[i]:[]);}
export function mancalaPlay(s,pit){
 if(!Number.isInteger(pit)||!mancalaMoves(s).includes(pit))return s;
 const board=[...s.board],store=s.p===1?6:13,opponentStore=s.p===1?13:6,route=[];
 let remaining=board[pit],at=pit;board[pit]=0;
 while(remaining){at=(at+1)%14;if(at===opponentStore)continue;board[at]++;remaining--;route.push(at);}
 let capture=null;
 if(mancalaOwn(s.p,at)&&board[at]===1&&board[12-at]>0){capture={from:[at,12-at],to:store,count:board[at]+board[12-at]};board[store]+=capture.count;board[at]=board[12-at]=0;}
 const sweep=[];let winner=0,again=at===store;
 if(board.slice(0,6).every(n=>!n)||board.slice(7,13).every(n=>!n)){
  for(let i=0;i<14;i++)if(i!==6&&i!==13&&board[i]){const to=i<6?6:13;sweep.push({from:i,to,count:board[i]});board[to]+=board[i];board[i]=0;}
  winner=board[6]===board[13]?3:board[6]>board[13]?1:2;again=false;
 }
 return {board,p:winner||again?s.p:3-s.p,winner,moves:s.moves+1,last:{player:s.p,pit,route,land:at,capture,sweep,again}};
}
export function mancalaAI(s,{budget=90,maxDepth=8}={}){
 const legal=mancalaMoves(s);if(!legal.length)return null;
 const player=s.p,store=player===1?6:13,other=19-store,deadline=performance.now()+budget,stop=Symbol('search limit');let nodes=0,best=legal[0];
 function evaluate(n){if(n.winner)return n.winner===3?0:n.winner===player?10000+n.board[store]:-10000-n.board[other];const own=n.board.slice(player===1?0:7,player===1?6:13).reduce((a,b)=>a+b,0),op=n.board.slice(player===1?7:0,player===1?13:6).reduce((a,b)=>a+b,0);return (n.board[store]-n.board[other])*12+(own-op)*.3;}
 function search(n,depth,alpha,beta){if(++nodes>22000||nodes%64===0&&performance.now()>deadline)throw stop;if(!depth||n.winner)return evaluate(n);const maximize=n.p===player;let value=maximize?-Infinity:Infinity;const children=mancalaMoves(n).map(i=>mancalaPlay(n,i)).sort((a,b)=>Number(b.last.again)-Number(a.last.again)+(b.last.capture?.count||0)-(a.last.capture?.count||0));for(const child of children){const score=search(child,depth-1,alpha,beta);value=maximize?Math.max(value,score):Math.min(value,score);if(maximize)alpha=Math.max(alpha,value);else beta=Math.min(beta,value);if(alpha>=beta)break;}return value;}
 for(let depth=1;depth<=maxDepth;depth++){
  let candidate=best,value=-Infinity;
  try{for(const pit of [best,...legal.filter(i=>i!==best)]){const score=search(mancalaPlay(s,pit),depth-1,-Infinity,Infinity);if(score>value){value=score;candidate=pit;}}best=candidate;}catch(e){if(e!==stop)throw e;break;}
 }
 return best;
}
