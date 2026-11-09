import {harePoints,hareEdges,hareCreate,hareMoves,harePlay,hareAI,hexBoardCreate,hexBoardPlay,hexBoardCanSwap,hexBoardAI} from './duel-engine.js';
import {rabbitImage,houndImage} from './duel-images.js';
import {gameSetupButton} from './game-setup.js';
import {gameGuide} from './game-guide.js';
import {playSound} from './audio.js';

export const duelGames=[
 {id:'harehounds',name:'토끼와 사냥개',en:'HARE & HOUNDS',desc:'세 마리의 포위망, 한 마리의 탈출',tag:'전략',color:'yellow',extra:true},
 {id:'hexboard',name:'헥스',en:'HEX',desc:'작은 육각형으로 잇는 나만의 길',tag:'전략',color:'mint',extra:true}
];
export function duelArtwork(id){
 if(id==='harehounds')return `<div class="art duel-preview"><svg viewBox="0 0 220 170" aria-hidden="true"><rect x="12" y="22" width="196" height="132" rx="26" fill="#dac393"/><rect x="12" y="16" width="196" height="132" rx="26" fill="#f0e0b6"/><path d="M28 85L70 40H150L192 85 150 126H70ZM28 85H192M70 40V126M150 40V126M70 40L150 126M150 40L70 126" stroke="#af966c" stroke-width="2" fill="none"/><circle cx="70" cy="40" r="23" fill="#c5d5b1"/><circle cx="70" cy="126" r="23" fill="#c5d5b1"/><circle cx="155" cy="83" r="31" fill="#fff8e2"/><image href="${houndImage}" x="42" y="12" width="56" height="56"/><image href="${houndImage}" x="42" y="98" width="56" height="56"/><image href="${rabbitImage}" x="118" y="46" width="74" height="74"/></svg></div>`;
 return `<div class="art duel-preview"><svg viewBox="0 0 220 170" aria-hidden="true"><g transform="translate(22 18)">${Array.from({length:25},(_,i)=>{const r=Math.floor(i/5),q=i%5,x=15+q*25+r*12.5,y=13+r*22;return `<path d="M${x} ${y-14}l12 7v14l-12 7-12-7v-14z" fill="${[1,6,11,12,17,22].includes(i)?'#cf7f6a':[4,8,13,18,19].includes(i)?'#4f958b':'#f5edda'}" stroke="#c5bda5" stroke-width="1.5"/>`;}).join('')}<path d="M0 -4H127M50 123H177" stroke="#cf7f6a" stroke-width="5" stroke-linecap="round"/><path d="M-7 8L44 111M133 9L184 111" stroke="#4f958b" stroke-width="5" stroke-linecap="round"/></g></svg></div>`;
}

export function createDuel(id,root,shell,options={}){
 const hunt=id==='harehounds',meta=duelGames.find(g=>g.id===id),mode=options.mode||'ai',humanSeat=hunt?(options.hareSide==='hare'?2:1):Number(options.hexSeat)||1;
 let s,history=[],selected=null,zoom=false,busy=false,dead=false,timer=0,revision=0,animation=null;
 const name=p=>mode==='local'?`플레이어 ${p}`:p===humanSeat?'나':'컴퓨터';
 const human=()=>mode==='local'||s.p===humanSeat;
 const role=p=>hunt?(p===1?'사냥개':'토끼'):(s.colors[p-1]===1?'코랄 · 위 ↔ 아래':'청록 · 왼쪽 ↔ 오른쪽');
 const piece=p=>`<img src="${p===1?houndImage:rabbitImage}" alt="${p===1?'사냥개':'토끼'}" draggable="false">`;
 function reset(){revision++;clearTimeout(timer);animation?.cancel();busy=false;selected=null;history=[];s=hunt?hareCreate():hexBoardCreate(Number(options.hexBoardSize)||9);render();}
 function status(){
  if(s.winner){if(!hunt)return `${name(s.winner)} 승리! · 두 변이 연결됐어요.`;return `${name(s.winner)} · ${role(s.winner)} 승리! ${({escape:'포위망을 빠져나왔어요.',trap:'토끼가 움직일 길이 없어요.',stall:'사냥개가 10번 연속 전진하지 않았어요.',blocked:'사냥개가 더 움직일 수 없어요.'})[s.reason]}`;}
  if(busy)return hunt?'길을 따라 이동 중…':'돌을 놓고 있어요…';
  return `${name(s.p)} · ${role(s.p)}의 차례${human()?'':' · 생각 중…'}`;
 }
 function canUndo(){return !busy&&history.some(old=>mode==='local'||old.p===humanSeat);}
 function render(){if(dead)return;const oldViewport=root.querySelector('.hexlink-viewport'),scroll=oldViewport?{x:oldViewport.scrollLeft,y:oldViewport.scrollTop}:null;
  root.innerHTML=shell()+`<main class="game-page duel-page ${hunt?'hunt-page':'hexlink-page'}"><button class="back" data-action="home">← 게임 라운지</button><div class="game-heading"><div><div class="eyebrow">${meta.en} · A LITTLE STRATEGY</div><h1>${meta.name}</h1></div>${gameSetupButton(id)}</div><section class="duel-room"><div class="duel-main"><div class="duel-status ${s.winner?'is-result':''}" role="status" aria-live="polite">${status()}</div>${hunt?huntBoard():hexBoard()}<div class="duel-under"><span>${s.moves}수 진행</span><span>${hunt?`사냥개 제자리 이동 ${s.stall} / 10`:s.swapped?'첫 수 교환 완료':s.moves<2?'첫 수 교환 규칙 사용':'서로의 두 변을 연결하세요'}</span></div></div><aside class="duel-aside"><div class="duel-players">${[1,2].map(p=>`<div class="duel-player ${s.p===p&&!s.winner?'active':''}">${hunt?`<i class="hunt-token side-${p}">${piece(p)}</i>`:`<i class="hexlink-token color-${s.colors[p-1]}"></i>`}<div><strong>${name(p)}</strong><small>${role(p)}${!hunt&&p===1?' · 선공':''}</small></div></div>`).join('')}</div><p class="duel-lead">${hunt?'작은 길 위에서,<br>포위와 탈출의 한 수.':'한 칸이 길이 되고,<br>길이 승리가 됩니다.'}</p><div class="duel-tip">${hunt?'사냥개는 오른쪽·위·아래로,<br>토끼는 연결된 모든 방향으로.':'코랄은 위아래, 청록은 좌우.<br>같은 색의 맞은편 테두리를 이으세요.'}</div>${!hunt&&hexBoardCanSwap(s)?`<div class="hexlink-swap"><strong>첫 돌을 가져올까요?</strong><p>교환하면 돌은 그대로 두고 서로 맡은 색과 목표 변을 바꿉니다. 이번 차례를 사용합니다.</p><button data-duel="swap" ${busy||!human()?'disabled':''}>첫 수 교환 · 색 바꾸기</button><small>그냥 빈칸에 두면 교환하지 않습니다.</small></div>`:''}<div class="duel-actions"><button data-duel="undo" ${canUndo()?'':'disabled'}>↶ 되돌리기</button><button data-action="restart">새 게임</button></div>${gameGuide(id)}${hunt?'<p class="duel-credit">동물 이미지: <a href="https://openmoji.org/" target="_blank" rel="noreferrer">OpenMoji</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p>':''}</aside></section></main>`;
  if(scroll){const viewport=root.querySelector('.hexlink-viewport');if(viewport){viewport.scrollLeft=scroll.x;viewport.scrollTop=scroll.y;}}
  schedule();
 }
 function huntBoard(){const moves=hareMoves(s),from=s.p===2?s.hare:selected,targets=new Set(moves.filter(m=>m.from===from).map(m=>m.to));
  return `<div class="hunt-board" role="group" aria-label="토끼와 사냥개 판. 사냥개는 오른쪽으로 전진하고 토끼는 왼쪽으로 탈출합니다."><div class="hunt-escape">← 토끼의 탈출 방향</div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g class="hunt-paths">${hareEdges.map(([a,b])=>`<line x1="${10+harePoints[a][0]*20}" y1="${20+harePoints[a][1]*30}" x2="${10+harePoints[b][0]*20}" y2="${20+harePoints[b][1]*30}"/>`).join('')}</g></svg>${harePoints.map(([x,y],i)=>{const owner=s.hare===i?2:s.hounds.includes(i)?1:0,can=human()&&!busy&&!s.winner&&(owner===s.p||targets.has(i));return `<button class="hunt-node ${owner?'occupied side-'+owner:''} ${owner===s.p&&i===from?'chosen':''} ${targets.has(i)?'target':''} ${s.last?.to===i?'last':''}" data-hunt-node="${i}" style="left:${10+x*20}%;top:${20+y*30}%" ${can?'':'disabled'} aria-label="${i+1}번 자리 · ${owner?(owner===1?'사냥개':'토끼'):targets.has(i)?'이동 가능':'빈 자리'}" aria-pressed="${owner===s.p&&i===from}">${owner?`<span class="hunt-token side-${owner}" data-hunt-piece="${i}">${piece(owner)}</span>`:'<i></i>'}</button>`;}).join('')}<p class="hunt-board-note">${s.winner?'다시 한 판, 다른 진영에도 도전해 보세요.':s.p===2?'토끼는 연결된 빈 점으로 한 칸 이동합니다.':selected===null?'움직일 사냥개 한 마리를 골라 주세요.':'빛나는 빈 점을 눌러 이동하세요.'}</p></div>`;
 }
 function hexBoard(){const n=s.size,pad=1.1,w=n+(n-1)*.5+pad*2,h=(n-1)*.866+1.155+pad*2;
  const pos=i=>({x:pad+.5+i%n+Math.floor(i/n)*.5,y:pad+.5775+Math.floor(i/n)*.866});
  const a=pos(0),b=pos(n-1),c=pos(n*(n-1)),d=pos(n*n-1),allowed=human()&&!busy&&!s.winner;
  return `<div class="hexlink-viewport ${zoom?'is-zoomed':''}" style="--hex-zoom:${w*44}px" tabindex="${zoom?0:-1}" aria-label="헥스 판 ${zoom?'확대됨. 좌우로 밀어 이동하세요.':'전체 보기'}"><div class="hexlink-board" style="aspect-ratio:${w}/${h}" role="group" aria-label="${n} 곱하기 ${n} 헥스 판"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path class="hexlink-border color-1" d="M${a.x-.5} ${a.y-.76}H${b.x+.5}M${c.x-.5} ${c.y+.76}H${d.x+.5}"/><path class="hexlink-border color-2" d="M${a.x-.73} ${a.y-.23}L${c.x-.73} ${c.y+.23}M${b.x+.73} ${b.y-.23}L${d.x+.73} ${d.y+.23}"/></svg>${s.board.map((v,i)=>{const {x,y}=pos(i);return `<button class="hexlink-cell color-${v} ${s.path.includes(i)?'connected':''} ${s.last?.index===i?'last':''}" data-hexlink-cell="${i}" style="left:${x/w*100}%;top:${y/h*100}%;width:${1/w*100}%;height:${1.155/h*100}%" ${allowed&&!v?'':'disabled'} aria-label="${Math.floor(i/n)+1}행 ${i%n+1}열 · ${v?(v===1?'코랄':'청록'):'빈칸'}"><span>${v?'<i></i>':''}</span></button>`;}).join('')}</div></div><div class="hexlink-legend"><span><i class="color-1"></i> 코랄 · 위 ↔ 아래</span><span><i class="color-2"></i> 청록 · 왼쪽 ↔ 오른쪽</span><button data-duel="zoom" aria-pressed="${zoom}" ${busy?'disabled':''}>${zoom?'− 전체 보기':'+ 판 확대'}</button></div>${zoom?'<p class="hexlink-pan-hint">판을 좌우로 밀어 이동하세요.</p>':''}`;
 }
 function schedule(){clearTimeout(timer);if(dead||busy||s.winner||human())return;const rev=revision;timer=setTimeout(()=>{if(dead||rev!==revision)return;const action=hunt?hareAI(s):hexBoardAI(s);if(action!==null)apply(action);},620);}
 async function apply(action){if(busy||dead)return;const next=hunt?harePlay(s,action):hexBoardPlay(s,action);if(next===s)return;
  const old=hunt?root.querySelector(`[data-hunt-piece="${action.from}"]`)?.getBoundingClientRect():null;history.push(s);s=next;selected=null;busy=true;const rev=++revision;render();
  const el=hunt?root.querySelector(`[data-hunt-piece="${action.to}"]`):action==='swap'?root.querySelector('.duel-players'):root.querySelector(`[data-hexlink-cell="${action}"] span`);
  if(el&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let frames;
   if(hunt&&old){const to=el.getBoundingClientRect(),dx=old.left-to.left,dy=old.top-to.top;frames=[{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${dx*.5}px,${dy*.5-17}px) scale(1.05)`,offset:.5},{transform:'translate(0,0) scale(1)'}];}
   else frames=[{opacity:.3,transform:'scale(.75)'},{opacity:1,transform:'scale(1)'}];
   animation=el.animate(frames,{duration:hunt?380:230,easing:'ease-out'});await animation.finished.catch(()=>{});
  }
  if(dead||rev!==revision)return;busy=false;playSound(s.winner?'win':'place');render();
 }
 function click(b){
  if(b.dataset.duel==='zoom'&&!busy){zoom=!zoom;render();return;}
  if(b.dataset.duel==='undo'&&canUndo()){clearTimeout(timer);revision++;do{s=history.pop();}while(mode==='ai'&&s.p!==humanSeat&&history.length);selected=null;render();return;}
  if(busy||!human()||s.winner)return;
  if(hunt&&b.dataset.huntNode!==undefined){const i=+b.dataset.huntNode;if(s.p===1&&s.hounds.includes(i)){selected=selected===i?null:i;playSound('click');render();return;}const from=s.p===2?s.hare:selected;if(from!==null)apply({from,to:i});}
  if(!hunt&&b.dataset.hexlinkCell!==undefined)apply(+b.dataset.hexlinkCell);
  if(!hunt&&b.dataset.duel==='swap')apply('swap');
 }
 reset();return {handleClick:click,handleChange(){},restart:reset,destroy(){dead=true;revision++;clearTimeout(timer);animation?.cancel();}};
}
