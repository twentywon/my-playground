export function randomStep(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
export function newSeed(){return Math.floor(Math.random()*4294967295)||1}
export const ladderLinks={4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91,17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};
export function laddersCreate(){return {positions:[0,0],p:0,winner:0,last:0,trail:[]}}
export function laddersRoll(state,dice){if(state.winner||dice<1||dice>6)return state;const s=structuredClone(state),from=s.positions[s.p],landing=from+dice<=100?from+dice:from;s.trail=Array.from({length:Math.max(0,landing-from)},(_,i)=>from+i+1);const end=ladderLinks[landing]||landing;if(end!==landing)s.trail.push(end);s.positions[s.p]=end;s.last=dice;if(end===100)s.winner=s.p+1;else s.p=1-s.p;return s}
export function snakeCreate(seed=1){return {seed,body:[{x:5,y:10},{x:4,y:10},{x:3,y:10}],dir:{x:1,y:0},next:{x:1,y:0},food:{x:14,y:10},score:0,over:false,ticks:0}}
export function snakeDirection(s,x,y){if(x===-s.dir.x&&y===-s.dir.y)return false;if(Math.abs(x)+Math.abs(y)!==1)return false;s.next={x,y};return true}
export function snakeTick(state){if(state.over)return state;const s=structuredClone(state);s.dir=s.next;const head={x:s.body[0].x+s.dir.x,y:s.body[0].y+s.dir.y},eats=head.x===s.food.x&&head.y===s.food.y,body=eats?s.body:s.body.slice(0,-1);s.ticks++;if(head.x<0||head.x>=20||head.y<0||head.y>=20||body.some(p=>p.x===head.x&&p.y===head.y)){s.over=true;return s}s.body.unshift(head);if(eats){s.score+=10;if(s.body.length>=400){s.over=true;s.won=true;return s}const empty=[];for(let y=0;y<20;y++)for(let x=0;x<20;x++)if(!s.body.some(p=>p.x===x&&p.y===y))empty.push({x,y});s.food=empty[Math.floor(randomStep(s)*empty.length)]}else s.body.pop();return s}
export function snakeAI(s){let best=null,value=-Infinity;for(const [x,y]of [[1,0],[-1,0],[0,1],[0,-1]]){if(x===-s.dir.x&&y===-s.dir.y)continue;const n=structuredClone(s);snakeDirection(n,x,y);const next=snakeTick(n);if(next.over)continue;const h=next.body[0],occupied=new Set(next.body.slice(1,-1).map(p=>p.x+','+p.y)),visited=new Set([h.x+','+h.y]),queue=[h];for(let k=0;k<queue.length;k++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=queue[k].x+dx,yy=queue[k].y+dy,key=xx+','+yy;if(xx>=0&&xx<20&&yy>=0&&yy<20&&!occupied.has(key)&&!visited.has(key)){visited.add(key);queue.push({x:xx,y:yy})}}const score=visited.size*2-(Math.abs(h.x-next.food.x)+Math.abs(h.y-next.food.y));if(score>value){value=score;best={x,y}}}return best||s.dir}
export function gridCreate(seed=1){const s={seed,board:Array(16).fill(0),score:0,over:false,won:false};spawnGrid(s);spawnGrid(s);return s}
function spawnGrid(s){const free=s.board.flatMap((v,i)=>!v?[i]:[]);if(free.length){const i=free[Math.floor(randomStep(s)*free.length)];s.board[i]=randomStep(s)<.9?2:4}}
export function gridSlide(state,direction,spawn=true){if(state.over)return state;const s=structuredClone(state);let changed=false;for(let a=0;a<4;a++){const indices=Array.from({length:4},(_,b)=>direction==='left'?a*4+b:direction==='right'?a*4+3-b:direction==='up'?b*4+a:(3-b)*4+a),values=indices.map(i=>s.board[i]).filter(Boolean),out=[];for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){out.push(values[i]*2);s.score+=values[i]*2;i++}else out.push(values[i])}while(out.length<4)out.push(0);indices.forEach((i,j)=>{if(s.board[i]!==out[j])changed=true;s.board[i]=out[j]})}if(!changed)return state;if(spawn)spawnGrid(s);s.won=s.board.some(v=>v>=2048);s.over=!s.board.some(v=>!v)&&!s.board.some((v,i)=>i%4<3&&v===s.board[i+1]||i<12&&v===s.board[i+4]);s.moves=(s.moves||0)+1;return s}
export function gridAI(s){let best=null,value=-Infinity;for(const dir of ['left','down','right','up']){const n=gridSlide(s,dir,false);if(n===s)continue;const max=Math.max(...n.board),corners=[n.board[0],n.board[3],n.board[12],n.board[15]],empty=n.board.filter(v=>!v).length;let smooth=0;for(let i=0;i<16;i++){if(i%4<3)smooth-=Math.abs(Math.log2(n.board[i]||1)-Math.log2(n.board[i+1]||1));if(i<12)smooth-=Math.abs(Math.log2(n.board[i]||1)-Math.log2(n.board[i+4]||1))}const score=empty*40+smooth*2+(corners.includes(max)?Math.log2(max)*12:0)+(n.score-s.score)*.3;if(score>value){value=score;best=dir}}return best}
export const tetrominoes={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
export function rotateMatrix(matrix){return matrix[0].map((_,i)=>matrix.map(row=>row[i]).reverse())}
function takeTetromino(s){if(!s.bag.length){s.bag=Object.keys(tetrominoes);for(let i=6;i>0;i--){const j=Math.floor(randomStep(s)*(i+1));[s.bag[i],s.bag[j]]=[s.bag[j],s.bag[i]]}}return s.bag.pop()}
function tetSpawn(s,type=null){const key=type||s.next;s.next=type?s.next:takeTetromino(s);s.active={type:key,m:structuredClone(tetrominoes[key]),x:Math.floor((10-tetrominoes[key][0].length)/2),y:0};if(tetCollision(s,s.active))s.over=true}
export function tetrisCreate(seed=1){const s={seed,board:Array.from({length:20},()=>Array(10).fill('')),bag:[],score:0,lines:0,pieces:0,held:null,holdUsed:false,over:false};s.next=takeTetromino(s);tetSpawn(s);return s}
export function tetCollision(s,a){return a.m.some((row,y)=>row.some((v,x)=>v&&(a.x+x<0||a.x+x>=10||a.y+y>=20||a.y+y>=0&&s.board[a.y+y][a.x+x])))}
export function tetMove(s,dx,dy){if(s.over)return false;const a={...s.active,x:s.active.x+dx,y:s.active.y+dy};if(tetCollision(s,a))return false;s.active=a;return true}
export function tetRotate(s){if(s.over)return false;const m=rotateMatrix(s.active.m);for(const [dx,dy]of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]]){const a={...s.active,m,x:s.active.x+dx,y:s.active.y+dy};if(!tetCollision(s,a)){s.active=a;return true}}return false}
function tetLock(s){s.active.m.forEach((row,y)=>row.forEach((v,x)=>{if(v){if(s.active.y+y<0)s.over=true;else s.board[s.active.y+y][s.active.x+x]=s.active.type}}));if(s.over)return;const kept=s.board.filter(row=>row.some(v=>!v)),cleared=20-kept.length;while(kept.length<20)kept.unshift(Array(10).fill(''));s.board=kept;s.score+=[0,100,300,500,800][cleared]*(Math.floor(s.lines/10)+1);s.lines+=cleared;s.pieces++;s.holdUsed=false;tetSpawn(s)}
export function tetDrop(s,hard=false){if(s.over)return;if(hard){let n=0;while(tetMove(s,0,1))n++;s.score+=n*2;tetLock(s)}else if(!tetMove(s,0,1))tetLock(s)}
export function tetHold(s){if(s.holdUsed||s.over)return;const type=s.active.type;if(s.held)tetSpawn(s,s.held);else tetSpawn(s);s.held=type;s.holdUsed=true}
export function tetrisAI(s){if(s.over)return;let best=null,value=-Infinity,m=structuredClone(s.active.m);for(let rot=0;rot<4;rot++){for(let x=-1;x<10;x++){const n=structuredClone(s);n.active={...n.active,m:structuredClone(m),x,y:0};if(tetCollision(n,n.active))continue;tetDrop(n,true);const heights=n.board[0].map((_,c)=>{const i=n.board.findIndex(row=>row[c]);return i<0?0:20-i});let holes=0;for(let c=0;c<10;c++){let filled=false;for(let r=0;r<20;r++){if(n.board[r][c])filled=true;else if(filled)holes++}}const score=(n.lines-s.lines)*120-holes*45-heights.reduce((a,b)=>a+b,0)*3-heights.slice(1).reduce((a,h,i)=>a+Math.abs(h-heights[i]),0)*4-(n.over?10000:0);if(score>value){value=score;best=n}}m=rotateMatrix(m)}if(best)Object.assign(s,best)}
export const mazeMap=['###################','#o......#......o..#','#.##.##.#.##.##.#.#','#.................#','#.##.#.#####.#.##.#','#....#...#...#....#','####.###.#.###.####','#....#.......#....#','#.##.#.##.##.#.##.#','#......#...#......#','#.####.#...#.####.#','#.................#','#.##.##.#.##.##.#.#','#o......#.......o.#','###################'];
export function mazeCreate(seed=1){const pellets={};mazeMap.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='.'||v==='o')pellets[x+','+y]=v==='o'?50:10}));delete pellets['1,13'];return {seed,x:1,y:13,dir:{x:0,y:0},next:{x:0,y:0},ghosts:[{x:8,y:9},{x:9,y:9},{x:10,y:9},{x:9,y:8}],pellets,score:0,lives:1,power:0,ticks:0,over:false,won:false,invulnerable:20}}
function mazeOpen(x,y){return mazeMap[y]?.[x]&&mazeMap[y][x]!=='#'}
export function mazeDirection(s,x,y){if(Math.abs(x)+Math.abs(y)===1)s.next={x,y}}
const mazeGhostHomes=[[8,9],[9,9],[10,9],[9,8]];
const mazePatrols=[[[1,1],[7,3],[1,5]],[[17,1],[11,3],[17,5]],[[1,13],[6,11],[4,7]],[[17,13],[12,11],[14,7]]];
function mazeGhostMove(s,g,i){
 if(g.respawn>0)return;
 g.cooldown=Math.max(0,(g.cooldown||0)-1);g.chase=Math.max(0,(g.chase||0)-1);
 if(!g.chase&&!g.cooldown&&Math.abs(g.x-s.x)+Math.abs(g.y-s.y)<=4){g.chase=7+i;g.cooldown=28+i*3;}
 let waypoint=g.waypoint||0;const route=mazePatrols[i%4];
 if(Math.abs(g.x-route[waypoint][0])+Math.abs(g.y-route[waypoint][1])<=1)waypoint=(waypoint+1)%route.length;
 g.waypoint=waypoint;
 const target=g.chase&&!s.power?{x:s.x+(i===1?s.dir.x*2:0),y:s.y+(i===1?s.dir.y*2:0)}:{x:route[waypoint][0],y:route[waypoint][1]};
 const moves=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>mazeOpen(g.x+dx,g.y+dy));
 let best=null,value=Infinity;
 for(const [dx,dy]of moves){
  const xx=g.x+dx,yy=g.y+dy;
  let score=s.power?-Math.abs(xx-s.x)-Math.abs(yy-s.y):mazePathDistance(xx,yy,target.x,target.y);
  if(g.prevX===xx&&g.prevY===yy&&moves.length>1)score+=6;
  if(s.ghosts.slice(0,i).some(o=>o.x===xx&&o.y===yy))score++;
  if(score<value){value=score;best={x:xx,y:yy};}
 }
 if(best){g.prevX=g.x;g.prevY=g.y;g.x=best.x;g.y=best.y;}
}
const mazeSamePoint=(a,b)=>a.x===b.x&&a.y===b.y;
export function mazeTick(state){
 if(state.over)return state;
 const s={...state,dir:{...state.dir},next:{...state.next},ghosts:state.ghosts.map(g=>({...g})),pellets:{...state.pellets},ticks:state.ticks+1,collision:null};
 if(mazeOpen(s.x+s.next.x,s.y+s.next.y))s.dir={...s.next};
 if(mazeOpen(s.x+s.dir.x,s.y+s.dir.y)){s.x+=s.dir.x;s.y+=s.dir.y;}
 const destination={x:s.x,y:s.y},key=s.x+','+s.y,pellet=s.pellets[key]||0;
 // Plan both actors' moves before deciding contact. Following a departing ghost
 // is safe; sharing a destination or swapping places in a corridor is contact.
 s.ghosts.forEach((g,i)=>mazeGhostMove(s,g,i));
 const contacts=[];
 s.ghosts.forEach((g,i)=>{
  const old=state.ghosts[i];if(old.respawn>0)return;
  const atStart=mazeSamePoint(state,old),swap=mazeSamePoint(state,g)&&mazeSamePoint(destination,old),atEnd=mazeSamePoint(destination,g);
  if(atStart||swap||atEnd)contacts.push({i,time:atStart?0:swap?.5:1});
 });
 contacts.sort((a,b)=>a.time-b.time);
 const eaten=new Set();
 for(const {i,time}of contacts){
  const g=s.ghosts[i],powered=state.power>0||pellet===50&&time===1;
  if(powered){
   s.score+=200;eaten.add(i);const [x,y]=mazeGhostHomes[i%4];
   Object.assign(g,{x,y,prevX:x,prevY:y,respawn:8,chase:0,cooldown:12});
  }else if(!state.invulnerable){
   s.lives=0;s.over=true;s.won=false;
   s.x=state.x+(destination.x-state.x)*time;s.y=state.y+(destination.y-state.y)*time;
   s.ghosts.forEach((ghost,j)=>{if(eaten.has(j))return;const old=state.ghosts[j];ghost.x=old.x+(ghost.x-old.x)*time;ghost.y=old.y+(ghost.y-old.y)*time;});
   s.collision={x:s.x,y:s.y,ghost:i,time};break;
  }
 }
 // A power pellet protects at arrival, not retroactively during an earlier swap.
 // Death takes precedence over clearing the board on the same move.
 if(pellet&&(!s.over||s.collision.time===1)){
  s.score+=pellet;delete s.pellets[key];if(pellet===50)s.power=45;
 }
 if(pellet!==50||s.over)s.power=Math.max(0,state.power-1);
 s.invulnerable=Math.max(0,state.invulnerable-1);
 s.ghosts.forEach((g,i)=>{if(!eaten.has(i)&&g.respawn>0)g.respawn--;});
 if(!s.over&&!Object.keys(s.pellets).length){s.over=true;s.won=true;s.score+=500;}
 return s;
}
export function mazeAI(s){const queue=[{x:s.x,y:s.y,first:null}],seen=new Set([s.x+','+s.y]);for(let i=0;i<queue.length;i++){const p=queue[i];if(p.first&&s.pellets[p.x+','+p.y])return p.first;for(const [x,y]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=p.x+x,yy=p.y+y,k=xx+','+yy;if(!mazeOpen(xx,yy)||seen.has(k)||!s.power&&s.ghosts.some(g=>Math.abs(g.x-xx)+Math.abs(g.y-yy)<=1))continue;seen.add(k);queue.push({x:xx,y:yy,first:p.first||{x,y}})}}return [[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x,y})).filter(d=>mazeOpen(s.x+d.x,s.y+d.y)).sort((a,b)=>Math.min(...s.ghosts.map(g=>Math.abs(g.x-s.x-b.x)+Math.abs(g.y-s.y-b.y)))-Math.min(...s.ghosts.map(g=>Math.abs(g.x-s.x-a.x)+Math.abs(g.y-s.y-a.y))))[0]||{x:0,y:0}}
export function breakoutCreate(seed=1,map='classic'){return {seed,map,paddle:250,ball:{x:250,y:405,vx:2.8,vy:-3.5},bricks:Array.from({length:48},(_,i)=>({x:20+i%8*58,y:40+Math.floor(i/8)*24,on:true,row:Math.floor(i/8),col:i%8})).filter(b=>map==='pyramid'?Math.abs(b.col-3.5)<=b.row*.7+.5:map==='tunnel'?b.row===0||b.row===5||b.col===0||b.col===7||b.row>=2&&b.row<=3&&b.col>=3&&b.col<=4:map==='checker'?(b.row+b.col)%2===0:map==='fortress'?b.col<=1||b.col>=6||b.row===0||b.row===3||b.row===5:true),score:0,lives:3,over:false,won:false,extraBalls:[],items:[],effects:{wide:0,slow:0,sticky:0,laser:0,fire:0},lasers:[],shield:0,paddleWidth:92,frames:0}}
export const breakoutItemTypes=['wide','slow','multi','life','sticky','laser','fire','shield'];
export function breakoutPickup(s,type){s.pickupCount=(s.pickupCount||0)+1;
 if(type==='wide'){s.effects.wide=700;s.paddleWidth=145;s.paddle=Math.max(72.5,Math.min(427.5,s.paddle))}
 if(type==='slow'){if(!s.effects.slow)for(const b of [s.ball,...s.extraBalls]){b.vx*=.65;b.vy*=.65}s.effects.slow=600}
 if(type==='life')s.lives=Math.min(5,s.lives+1);
 if(type==='sticky')s.effects.sticky=600;
 if(type==='laser')s.effects.laser=600;
 if(type==='fire')s.effects.fire=500;
 if(type==='shield')s.shield=Math.min(3,s.shield+2);
 if(type==='multi'){const b=s.ball;for(const angle of [-.45,.45])if(s.extraBalls.length<5){const vx=b.vx||2.5,vy=b.vy||-3.5;s.extraBalls.push({...b,attached:false,vx:vx*Math.cos(angle)-vy*Math.sin(angle),vy:vx*Math.sin(angle)+vy*Math.cos(angle)})}}
 s.lastPickup=type;return s;
}
export function breakoutLaunch(s){for(const b of [s.ball,...s.extraBalls])if(b.attached){b.attached=false;b.vx=b.releaseVx||2.8;b.vy=b.releaseVy||-3.5}}
export function breakoutTick(state,dt=1){
 if(state.over)return state;const s=structuredClone(state);s.extraBalls??=[];s.items??=[];s.lasers??=[];s.effects??={};s.frames=(s.frames||0)+dt;s.paddleWidth=s.effects.wide>0?145:92;
 for(const key of Object.keys(s.effects))if(s.effects[key]>0){s.effects[key]=Math.max(0,s.effects[key]-dt);if(!s.effects[key]&&key==='slow')for(const b of [s.ball,...s.extraBalls]){b.vx/=.65;b.vy/=.65}}
 const hitBrick=brick=>{brick.on=false;s.score+=10;if(randomStep(s)<.3)s.items.push({x:brick.x+26,y:brick.y+10,type:breakoutItemTypes[Math.floor(randomStep(s)*breakoutItemTypes.length)]})};
 const balls=[s.ball,...s.extraBalls],survivors=[];
 for(const b of balls){if(b.attached){b.x=s.paddle+(b.offset||0);b.y=439;survivors.push(b);continue}let lost=false;
 for(let sub=0;sub<2;sub++){const prevX=b.x,prevY=b.y;b.x+=b.vx*dt/2;b.y+=b.vy*dt/2;if(b.x<7){b.x=7;b.vx=Math.abs(b.vx)}if(b.x>493){b.x=493;b.vx=-Math.abs(b.vx)}if(b.y<7){b.y=7;b.vy=Math.abs(b.vy)}
 if(b.vy>0&&b.y>=440&&b.y<=455&&Math.abs(b.x-s.paddle)<s.paddleWidth/2+5){b.y=439;s.bounces=(s.bounces||0)+1;const speed=s.effects.slow>0?3.25:5;b.vx=(b.x-s.paddle)/(s.paddleWidth/2)*speed*.9;b.vy=-Math.sqrt(Math.max(2,speed*speed-b.vx*b.vx));if(s.effects.sticky>0){b.attached=true;b.offset=b.x-s.paddle;b.releaseVx=b.vx;b.releaseVy=b.vy;break}}
 for(const brick of s.bricks)if(brick.on&&b.x+6>=brick.x&&b.x-6<=brick.x+52&&b.y+6>=brick.y&&b.y-6<=brick.y+18){hitBrick(brick);if(!s.effects.fire){if(prevX+6<=brick.x||prevX-6>=brick.x+52)b.vx*=-1;else b.vy*=-1;b.x=prevX;b.y=prevY}break}
 if(b.y>487&&b.vy>0&&s.shield>0){s.shield--;b.y=486;b.vy=-Math.abs(b.vy)}if(b.y>510){lost=true;break}}
 if(!lost)survivors.push(b);
 }
 if(!survivors.length){s.lives--;if(s.lives<=0)s.over=true;else survivors.push({x:s.paddle,y:405,vx:(randomStep(s)>.5?2.8:-2.8)*(s.effects.slow>0?.65:1),vy:-3.5*(s.effects.slow>0?.65:1)})}
 if(survivors.length){s.ball=survivors[0];s.extraBalls=survivors.slice(1)}
 if(s.effects.laser>0&&Math.floor(s.frames)%15===0)s.lasers.push({x:s.paddle-s.paddleWidth*.35,y:438},{x:s.paddle+s.paddleWidth*.35,y:438});
 s.lasers=s.lasers.filter(l=>{l.y-=8*dt;if(l.y<0)return false;const brick=s.bricks.find(b=>b.on&&l.x>=b.x&&l.x<=b.x+52&&l.y>=b.y&&l.y<=b.y+18);if(brick){hitBrick(brick);return false}return true});
 s.items=s.items.filter(item=>{item.y+=1.7*dt;if(item.y>=435&&item.y<=463&&Math.abs(item.x-s.paddle)<s.paddleWidth/2+12){breakoutPickup(s,item.type);return false}return item.y<515});
 if(s.bricks.every(b=>!b.on)){s.won=true;s.over=true;s.score+=200}return s;
}

export const janggiTypes=[{label:'漢',r:28,mass:3.3,power:1.45},{label:'車',r:26,mass:2.9,power:1.35},{label:'包',r:25,mass:2.6,power:1.28},{label:'馬',r:23,mass:2.1,power:1.15},{label:'象',r:23,mass:2.1,power:1.15},{label:'士',r:21,mass:1.6,power:1.05},{label:'卒',r:18,mass:1,power:.95}];
export function flickCreate(count=7,setup=false,pieceMode='stones'){if(pieceMode==='janggi'){const layout=[[0,4,1],[1,0,0],[1,8,0],[2,1,2],[2,7,2],[3,1,0],[3,7,0],[4,2,0],[4,6,0],[5,3,0],[5,5,0],...[0,2,4,6,8].map(c=>[6,c,3])];return {count:16,pieceMode,p:1,phase:'aim',winner:0,shots:0,stones:[1,2].flatMap(p=>layout.map(([t,c,r],i)=>({id:(p-1)*16+i,p,x:60+c*60,y:p===1?45+r*56.6667:555-r*56.6667,...janggiTypes[t],vx:0,vy:0,on:true})))}}const n=Math.max(1,Math.min(20,Math.floor(Number(count)||7))),cols=Math.min(5,n),rows=Math.ceil(n/cols);return {count:n,pieceMode,stones:Array.from({length:n*2},(_,i)=>{const side=i<n?1:2,j=i%n,row=Math.floor(j/cols),col=j%cols,x=cols===1?300:30+Math.round(1+col*10/(cols-1))*45,base=30+row*45,type=pieceMode==='janggi'?janggiTypes[j%janggiTypes.length]:{r:20,mass:1,power:1,label:''};return {id:i,p:side,x,y:side===1?base:600-base,vx:0,vy:0,...type,on:true}}),p:1,phase:setup?'setup':'aim',winner:0,shots:0}}
export const flickHinges=[{x:18,y:284,w:28,h:32},{x:554,y:284,w:28,h:32}];
export function flickSnap(x,y,player){return {x:30+Math.max(0,Math.min(12,Math.round((x-30)/45)))*45,y:30+Math.max(player===1?0:8,Math.min(player===1?4:12,Math.round((y-30)/45)))*45}}
export function flickAutoPlace(s,player=2,rng=Math.random){if(s.pieceMode==='janggi')return s;const spots=[];for(let row=player===1?0:8;row<=(player===1?4:12);row++)for(let col=0;col<13;col++)spots.push({x:30+45*col,y:30+45*row});for(let i=spots.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[spots[i],spots[j]]=[spots[j],spots[i]]}for(const stone of s.stones.filter(v=>v.on&&v.p===player))Object.assign(stone,spots.pop());return s}
function hingeCollision(stone,box){const cx=Math.max(box.x,Math.min(box.x+box.w,stone.x)),cy=Math.max(box.y,Math.min(box.y+box.h,stone.y));let dx=stone.x-cx,dy=stone.y-cy,dist=Math.hypot(dx,dy);if(dist>=stone.r)return;if(dist<.0001){const sides=[{d:stone.x-box.x,nx:-1,ny:0},{d:box.x+box.w-stone.x,nx:1,ny:0},{d:stone.y-box.y,nx:0,ny:-1},{d:box.y+box.h-stone.y,nx:0,ny:1}].sort((a,b)=>a.d-b.d);dx=sides[0].nx;dy=sides[0].ny;dist=-sides[0].d}else{dx/=dist;dy/=dist}stone.x+=dx*(stone.r-dist+.01);stone.y+=dy*(stone.r-dist+.01);const vn=stone.vx*dx+stone.vy*dy;if(vn<0){stone.vx-=1.65*vn*dx;stone.vy-=1.65*vn*dy;const tangent=-stone.vx*dy+stone.vy*dx;stone.vx+=tangent*.12*dy;stone.vy-=tangent*.12*dx;stone.spin=(stone.spin||0)+tangent/stone.r*.12}}

export function flickShoot(s,id,dx,dy){if(s.phase!=='aim'||s.winner)return false;const stone=s.stones.find(v=>v.id===id&&v.on&&v.p===s.p);if(!stone)return false;const power=Math.min(16,Math.hypot(dx,dy)*.11),len=Math.hypot(dx,dy);if(len<5)return false;const speed=power*(stone.power||1)/Math.sqrt(stone.mass||1);stone.vx=dx/len*speed;stone.vy=dy/len*speed;s.phase='moving';s.shots++;return true}
export function flickTick(s,dt=1){if(s.phase!=='moving')return;dt=Math.max(0,Math.min(3,dt));const steps=Math.max(2,Math.ceil(Math.max(...s.stones.map(v=>Math.hypot(v.vx,v.vy)))*dt/6)),step=dt/steps;for(let sub=0;sub<steps;sub++){const active=s.stones.filter(v=>v.on);for(const a of active){a.x+=a.vx*step;a.y+=a.vy*step;a.vx*=Math.pow(.96,step);a.vy*=Math.pow(.96,step);a.angle=(a.angle||0)+(a.spin||0)*step;a.spin=(a.spin||0)*Math.pow(.93,step);if(s.pieceMode==='janggi')for(const hinge of flickHinges)hingeCollision(a,hinge);if(a.x<-a.r||a.x>600+a.r||a.y<-a.r||a.y>600+a.r)a.on=false}for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const a=active[i],b=active[j];if(!a.on||!b.on)continue;const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.01;if(dist<a.r+b.r){const nx=dx/dist,ny=dy/dist,overlap=(a.r+b.r-dist)/2;const ma=a.mass||1,mb=b.mass||1;a.x-=nx*overlap*2*mb/(ma+mb);a.y-=ny*overlap*2*mb/(ma+mb);b.x+=nx*overlap*2*ma/(ma+mb);b.y+=ny*overlap*2*ma/(ma+mb);const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rel>0){const impulse=1.84*rel/(1/ma+1/mb);a.vx-=impulse/ma*nx;a.vy-=impulse/ma*ny;b.vx+=impulse/mb*nx;b.vy+=impulse/mb*ny;const tangent=(b.vx-a.vx)*(-ny)+(b.vy-a.vy)*nx,friction=Math.max(-impulse*.08,Math.min(impulse*.08,-tangent/(1/ma+1/mb)));a.vx-=friction*(-ny)/ma;a.vy-=friction*nx/ma;b.vx+=friction*(-ny)/mb;b.vy+=friction*nx/mb;a.spin=(a.spin||0)+friction/(ma*a.r);b.spin=(b.spin||0)+friction/(mb*b.r)}}}}if(s.stones.filter(v=>v.on).every(v=>Math.hypot(v.vx,v.vy)<.13)){s.stones.forEach(v=>{v.vx=0;v.vy=0});const a=s.stones.filter(v=>v.on&&v.p===1).length,b=s.stones.filter(v=>v.on&&v.p===2).length;s.winner=!a&&!b?3:!a?2:!b?1:0;s.phase='aim';s.p=3-s.p}}
export function flickAI(s){
 if(s.phase!=='aim'||s.winner)return null;
 const own=s.stones.filter(v=>v.on&&v.p===s.p),enemy=s.stones.filter(v=>v.on&&v.p!==s.p),candidates=[];
 for(const a of own)for(const b of enemy){
  const distance=Math.hypot(b.x-a.x,b.y-a.y);if(distance<.001)continue;
  const ux=(b.x-a.x)/distance,uy=(b.y-a.y)/distance;
  const blocked=s.stones.some(o=>o.on&&o.id!==a.id&&o.id!==b.id&&o.p===s.p&&((o.x-a.x)*ux+(o.y-a.y)*uy)>0&&((o.x-a.x)*ux+(o.y-a.y)*uy)<distance&&Math.abs((o.x-a.x)*uy-(o.y-a.y)*ux)<a.r+o.r);
  const edge=Math.min(b.x,b.y,600-b.x,600-b.y);
  for(const strength of [110,145])candidates.push({id:a.id,dx:ux*strength,dy:uy*strength,priority:distance+edge*.3+(blocked?400:0),target:b.id});
 }
 candidates.sort((a,b)=>a.priority-b.priority);let best=candidates[0]||null,value=-Infinity;
 const deadline=performance.now()+65;
 // Evaluate bounded physical rollouts; friendly losses are more costly than gains.
 for(const shot of candidates.slice(0,14)){
  if(performance.now()>deadline)break;
  const n=structuredClone(s);flickShoot(n,shot.id,shot.dx,shot.dy);
  let ticks=0;while(n.phase==='moving'&&ticks++<200){flickTick(n);if(ticks%20===0&&performance.now()>deadline)break;}
  const a=n.stones.filter(v=>v.on&&v.p===s.p),b=n.stones.filter(v=>v.on&&v.p!==s.p);
  const target=n.stones.find(v=>v.id===shot.target),before=s.stones.find(v=>v.id===shot.target),push=target&&Math.hypot(target.x-before.x,target.y-before.y)||0;
  const approach=a.length&&b.length?Math.min(...a.flatMap(v=>b.map(o=>Math.hypot(v.x-o.x,v.y-o.y)))):0;
  const score=(enemy.length-b.length)*1000-(own.length-a.length)*1400+push*.3-approach*.15-(n.winner===s.p?0:shot.priority*.005);
  if(score>value){value=score;best=shot;}
 }
 return best?{id:best.id,dx:best.dx,dy:best.dy}:null;
}

const mazeDistanceCache=new Map();
function mazePathDistance(x,y,tx,ty){const key=tx+','+ty;if(!mazeDistanceCache.has(key)){let target=null,best=Infinity;for(let yy=0;yy<mazeMap.length;yy++)for(let xx=0;xx<mazeMap[yy].length;xx++)if(mazeOpen(xx,yy)){const d=Math.abs(xx-tx)+Math.abs(yy-ty);if(d<best){best=d;target=[xx,yy]}}const distances=new Map([[target.join(','),0]]),queue=[target];for(let i=0;i<queue.length;i++){const [xx,yy]=queue[i],d=distances.get(xx+','+yy);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=xx+dx,b=yy+dy,k=a+','+b;if(mazeOpen(a,b)&&!distances.has(k)){distances.set(k,d+1);queue.push([a,b])}}}if(mazeDistanceCache.size>=64)mazeDistanceCache.delete(mazeDistanceCache.keys().next().value);mazeDistanceCache.set(key,distances)}return mazeDistanceCache.get(key).get(x+','+y)??1000}
