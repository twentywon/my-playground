export function connectCreate(){return {board:Array(42).fill(0),p:1,winner:0,last:null,line:[],moves:0};}
export function connectMoves(s){return s.winner?[]:[3,2,4,1,5,0,6].filter(c=>!s.board[c]);}
export function connectPlay(s,col){
 if(!Number.isInteger(col)||col<0||col>6||s.winner||s.board[col])return s;
 let row=5;while(s.board[row*7+col])row--;
 const index=row*7+col,n={...s,board:[...s.board],p:3-s.p,last:index,moves:s.moves+1,line:[]};n.board[index]=s.p;
 for(const [dy,dx]of [[0,1],[1,0],[1,1],[1,-1]]){
  const line=[index];for(const sign of [-1,1]){let y=row+dy*sign,x=col+dx*sign;while(y>=0&&y<6&&x>=0&&x<7&&n.board[y*7+x]===s.p){line.push(y*7+x);y+=dy*sign;x+=dx*sign;}}
  if(line.length>=4){n.winner=s.p;n.line=line;break;}
 }
 if(!n.winner&&n.board.every(Boolean))n.winner=3;return n;
}
export function connectAI(s,{budget=100,depth=7}={}){
 const legal=connectMoves(s);if(!legal.length)return null;
 for(const col of legal)if(connectPlay(s,col).winner===s.p)return col;
 const root=s.p,deadline=performance.now()+budget;let nodes=0,expired=false,best=legal[0];
 function value(n){let score=0;for(let r=0;r<6;r++)score+=n.board[r*7+3]===root?5:n.board[r*7+3]?-5:0;
  for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dy,dx]of [[0,1],[1,0],[1,1],[1,-1]]){
   if(r+dy*3>=6||c+dx*3<0||c+dx*3>=7)continue;let own=0,opp=0;for(let i=0;i<4;i++){const p=n.board[(r+dy*i)*7+c+dx*i];own+=p===root;opp+=p===3-root;}
   if(!opp)score+=[0,1,8,55,10000][own];if(!own)score-=[0,1,9,65,10000][opp];
  }return score;
 }
 function search(n,d,a,b){if(n.winner)return n.winner===3?0:n.winner===root?100000+d:-100000-d;
  if((++nodes&127)===0&&(performance.now()>deadline||nodes>60000))expired=true;
  if(!d||expired)return value(n);const max=n.p===root;let v=max?-Infinity:Infinity;
  for(const col of connectMoves(n)){const score=search(connectPlay(n,col),d-1,a,b);v=max?Math.max(v,score):Math.min(v,score);if(max)a=Math.max(a,v);else b=Math.min(b,v);if(a>=b||expired)break;}return v;
 }
 for(let d=1;d<=depth;d++){let high=-Infinity,candidate=best;for(const col of [best,...legal.filter(c=>c!==best)]){const score=search(connectPlay(s,col),d-1,-Infinity,Infinity);if(score>high){high=score;candidate=col;}if(expired)break;}if(expired)break;best=candidate;}
 return best;
}

export function hitScore(secret,guess){
 let hit=0;const a=Array(6).fill(0),b=Array(6).fill(0);
 for(let i=0;i<4;i++){if(secret[i]===guess[i])hit++;else{a[secret[i]]++;b[guess[i]]++;}}
 return {hit,blow:a.reduce((sum,n,i)=>sum+Math.min(n,b[i]),0)};
}
export function hitCreate(duplicates=false,rng=Math.random){
 const colors=[0,1,2,3,4,5],secret=[];for(let i=0;i<4;i++){const at=Math.floor(rng()*colors.length);secret.push(colors[at]);if(!duplicates)colors.splice(at,1);}
 return {secret,duplicates,guesses:[],over:false,won:false};
}
export function hitPlay(s,guess){
 if(s.over||!Array.isArray(guess)||guess.length!==4||guess.some(c=>!Number.isInteger(c)||c<0||c>5)||!s.duplicates&&new Set(guess).size<4)return s;
 const result=hitScore(s.secret,guess),guesses=[...s.guesses,{colors:[...guess],...result}],won=result.hit===4;
 return {...s,guesses,won,over:won||guesses.length===10};
}
