import {gameSetupButton} from './game-setup.js';
import {yutView} from './yut-view.js';
import {gameGuide} from './game-guide.js';
import {janggiCreate,janggiSetups,janggiMoves,janggiPlay,janggiCheck,janggiAI,janggiNames,yutCreate,yutThrow,yutMoves,yutPlay,yutAI,yutPoints,yutNames} from './traditional-engine.js';
import {playSound} from './audio.js';

export const traditionalGames=[{id:'janggi',name:'장기',en:'JANGGI',tag:'전략',color:'peach',desc:'궁성을 지키고, 한 수 앞을 읽어요',extra:true},{id:'yut',name:'윷놀이',en:'YUT NORI',tag:'주사위',color:'yellow',desc:'던지고 업고 잡으며 함께 한 바퀴',extra:true}];
const jLabels={K:'궁',A:'사',R:'차',C:'포',H:'마',E:'상',S:'병·졸'};
// Original octagonal artwork. Traditional three size classes, scaled to the board.
// Ratios follow the three visual size classes in the referenced traditional set.
const jScale={K:1,R:.82,C:.82,H:.82,E:.82,A:.60,S:.60};
function jPiece(v){return `<svg class="j-piece ${v===v.toUpperCase()?'cho':'han'}" data-size="${v.toUpperCase()}" style="--piece-scale:${jScale[v.toUpperCase()]}" viewBox="0 0 100 106" aria-hidden="true"><polygon points="29,8 71,8 98,35 98,77 71,104 29,104 2,77 2,35" fill="#9a6937"/><polygon points="29,2 71,2 98,29 98,71 71,98 29,98 2,71 2,29" fill="#cba46c" stroke="#96652f" stroke-width="1.6"/><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#f2d9a7"/><path d="M6 30L30 6H70L94 30M8 30L30 8H70" stroke="#fff3d1" stroke-width="3" fill="none"/><polygon points="33,13 67,13 87,33 87,67 67,87 33,87 13,67 13,33" fill="#f8e5bd" stroke="#c39a60" stroke-width="1.4"/><path d="M24 28Q48 24 76 28M19 70Q48 65 81 70M30 81Q50 77 70 81" stroke="#b98e4c" stroke-opacity=".12" fill="none"/><text x="50" y="69" text-anchor="middle" fill="currentColor" font-size="60" font-family="Noto Serif CJK KR, serif" font-weight="700">${janggiNames[v]}</text></svg>`;}
export function traditionalArtwork(id){
 if(id==='yut')return `<div class="art"><svg class="scene-preview" viewBox="0 0 200 170" aria-hidden="true"><defs><linearGradient id="yn-thumb-wood" x2="1" y2=".3"><stop stop-color="#f5dca4"/><stop offset=".5" stop-color="#fff0c4"/><stop offset="1" stop-color="#bd945c"/></linearGradient></defs><g transform="translate(13 5) rotate(-7 80 80)"><rect x="8" y="12" width="143" height="143" rx="12" fill="#204e3d"/><rect x="16" y="19" width="127" height="127" rx="7" fill="#f7efd9"/><path d="M29 32H130V133H29zM29 32L130 133M130 32L29 133" fill="none" stroke="#b5a073" stroke-width="1"/>${[...yutPoints.slice(1)].map(([x,y],i)=>`<circle cx="${16+x*1.27}" cy="${19+y*1.27}" r="${[4,9,14,19,22].includes(i)?4.4:2.5}" fill="#fffaf0" stroke="#baa370" stroke-width=".8"/>`).join('')}<circle cx="130" cy="73" r="9" fill="#2c8064" stroke="#225c44"/><circle cx="80" cy="82" r="9" fill="#c66d57" stroke="#974636"/></g><g transform="translate(146 65) rotate(17)">${[0,1,2].map(i=>`<rect x="${i*13}" y="${i*3}" width="10" height="68" rx="5" fill="${i===1?'#bc8a50':'url(#yn-thumb-wood)'}" stroke="#906c40" stroke-width=".7"/>${i===1?'<text x="18" y="28" text-anchor="middle" fill="#241d16" font-size="13" font-weight="800">×<tspan x="18" dy="15">×</tspan><tspan x="18" dy="15">×</tspan></text>':''}`).join('')}</g></svg></div>`;
 return `<div class="art"><svg class="scene-preview" viewBox="0 0 200 170" aria-hidden="true"><rect x="20" y="10" width="160" height="150" rx="14" fill="#dec18a"/><path d="M40 30h120v110H40zM40 30l120 110M160 30L40 140" stroke="#987144" stroke-width="2" fill="none"/>${id==='janggi'?`<svg x="46" y="35" width="64" height="68">${jPiece('K')}</svg><svg x="112" y="88" width="52" height="55">${jPiece('r')}</svg>`:Array.from({length:4},(_,i)=>`<rect x="${46+i*27}" y="40" width="18" height="84" rx="9" fill="${i%2?'#82502d':'#fff0bf'}" stroke="#9b713e" transform="rotate(${i*7-10} 100 85)"/>`).join('')}</svg></div>`;}

const jDescriptions={
 K:'궁성 안에서 선을 따라 한 칸. 중앙에서는 여덟 방향, 모서리에서는 가로·세로와 중앙 쪽 대각선으로 움직입니다.',
 A:'궁과 똑같이 내 궁성 안의 선을 따라 한 칸. 궁성을 벗어날 수 없습니다.',
 R:'가로·세로로 원하는 만큼 이동합니다. 도중의 말을 뛰어넘을 수 없고 궁성에서는 그어진 대각선도 이용합니다.',
 C:'포가 아닌 말 하나를 반드시 넘어야 합니다. 넘은 뒤 빈 곳에 놓거나 상대 말을 잡습니다. 포를 넘거나 잡을 수 없습니다. 궁성 대각선에서도 가운데 말 하나를 넘어야 합니다.',
 H:'직선으로 한 칸, 이어서 대각선으로 한 칸. 첫 직선 자리에 말이 있으면 그 방향으로 갈 수 없습니다. 체스 나이트와 달리 뛰어넘지 못합니다.',
 E:'직선으로 한 칸, 이어서 같은 대각선으로 두 칸. 중간 두 자리가 모두 비어 있어야 합니다. 판 전체를 다닐 수 있습니다.',
 S:'앞으로 또는 옆으로 한 칸. 뒤로는 갈 수 없습니다. 상대 궁성 안에서는 그어진 선을 따라 앞으로 대각선 한 칸도 가능합니다. 끝줄에서도 승격하지 않습니다.'
};
function jDiagram(type){
 const palace=type==='K'||type==='A',size=palace?3:7,origin=palace?[1,1]:type==='C'?[3,5]:[3,3],at=(x,y)=>[10+x*80/(size-1),10+y*80/(size-1)];
 const moves=[],paths=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=x-origin[0],dy=y-origin[1],ax=Math.abs(dx),ay=Math.abs(dy);
  const legal=palace?Math.max(ax,ay)===1:type==='R'?(ax===0||ay===0)&&(ax+ay>0):type==='H'?ax*ay===2:type==='E'?ax*ay===6&&ax+ay===5:type==='S'?dy===-1&&dx===0||dy===0&&ax===1:x===3&&y<3;
  if(legal)moves.push([x,y]);
 }
 if(type==='H')paths.push([[3,3],[3,2],[4,1]]);
 if(type==='E')paths.push([[3,3],[3,2],[4,1],[5,0]]);
 const [cx,cy]=at(...origin);
 return `<svg class="j-move-diagram" viewBox="0 0 100 100" role="img" aria-label="${jLabels[type]} 이동 예시: ${type==='C'?'가운데 말 하나를 넘어 이동':'초록 점이 이동 가능한 자리'}"><rect width="100" height="100" rx="5" fill="#f5e6c6"/>${Array.from({length:size},(_,i)=>`<path d="M${at(i,0)[0]} 10V90M10 ${at(0,i)[1]}H90"/>`).join('')}${palace?'<path d="M10 10L90 90M90 10L10 90"/>':''}${paths.map(path=>`<polyline points="${path.map(([x,y])=>at(x,y).join(',')).join(' ')}" class="j-route"/>`).join('')}${moves.map(([x,y])=>`<circle cx="${at(x,y)[0]}" cy="${at(x,y)[1]}" r="3" fill="#38765c"/>`).join('')}${type==='C'?'<rect x="46" y="46" width="8" height="8" rx="2" fill="#c18c37"/>':''}${paths.flatMap(path=>path.slice(1,-1)).map(([x,y])=>`<rect x="${at(x,y)[0]-3}" y="${at(x,y)[1]-3}" width="6" height="6" fill="#c18c37"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="6" fill="#fff7e0" stroke="#347056"/><text x="${cx}" y="${cy+3}" text-anchor="middle" font-size="8" fill="#285943">${janggiNames[type]}</text></svg>`;
}
function jRules(){return `<p class="guide-intro">선을 만나는 자리에 말을 놓습니다. 내 말을 누른 뒤 초록색 목적지를 누르세요. 상대 말을 잡으면 그 자리에 내 말이 놓입니다.</p><div class="j-guide-legend"><span>● 이동 가능</span><span>■ 길목·넘는 말</span><span>— 예시 이동 경로</span></div><div class="j-help-grid">${Object.keys(jLabels).map(type=>`<section><h3>${jPiece(type)}${jLabels[type]}</h3>${jDiagram(type)}<p>${jDescriptions[type]}</p></section>`).join('')}</div><div class="trad-guide-sections"><section><h3>01 · 마와 상 배치</h3><p>한(빨강)이 먼저, 초(청록)가 나중에 배치를 고릅니다. 양쪽의 마·상은 서로 자리를 바꿀 수 있어 네 가지 배치가 가능합니다. 선택판은 각 선수의 시선 기준입니다. 초가 첫 수를 둡니다.</p></section><section><h3>02 · 장군과 외통</h3><p>상대가 다음 수에 궁을 잡을 수 있으면 장군입니다. 궁을 피하거나, 공격을 막거나, 공격한 말을 잡아 해소해야 합니다. 내 궁이 공격받는 수는 둘 수 없습니다. 장군을 해소할 수 있는 수가 없으면 외통으로 패배합니다.</p></section><section><h3>03 · 빅장과 한 수 쉬기</h3><p>두 궁이 같은 세로줄에서 사이에 말 없이 마주 보면 빅장입니다. 다음 선수는 무승부를 수락하거나, 궁을 옮기거나 말을 사이에 넣어 마주봄을 해소합니다. 장군·빅장이 아닐 때는 한 수 쉴 수 있습니다.</p></section><section><h3>04 · 이 게임의 무승부 규칙</h3><p>빅장 수락, 양쪽이 연속으로 한 수 쉬기, 둘 차례까지 같은 국면 3회 반복, 또는 300수에 이르면 무승부입니다. 점수로 승패를 가르는 대회 규칙 대신 친선 대국 규칙을 사용합니다.</p></section><section><h3>실물 장기말을 닮은 크기</h3><p>팔각형 목제 말의 대·중·소 구분을 적용했습니다. 궁이 가장 크고, 차·포·마·상은 중간, 사·병·졸은 작습니다. 화면에 맞춰 함께 확대·축소됩니다.</p><a href="https://github.com/pychess/pychess-variants/blob/master/static/docs/janggi.md" target="_blank" rel="noopener noreferrer">참고 자료 · PyChess 장기 가이드 ↗</a></section></div>`;}
function yRules(){return `<p class="guide-intro">각 팀의 말 네 개를 먼저 모두 완주시키면 승리합니다. 윷 네 개를 직접 눌러 던지고, 사용할 결과 → 내 말 → 목적지 순서로 선택하세요.</p><p class="guide-intro">X가 새겨진 쪽은 둥근 등면, 표시 없는 밝은 쪽은 평평한 면입니다. 평평한 면이 1·2·3·4개면 도·개·걸·윷, 네 개 모두 X 등면이면 모입니다. 빽도용 윷만 평평한 면에 붉은 점이 있습니다.</p><div class="y-rule-results">${[-1,1,2,3,4,5].map(n=>`<div><strong>${yutNames[n]}</strong><b>${n===-1?'← 1':n}칸</b><small>${n===-1?'빽도 표시한 윷만 평평한 면':n===5?'X 등면 4개':`평평한 면 ${n}개`}</small></div>`).join('')}</div><div class="trad-guide-sections"><section><h3>01 · 던지기와 이동</h3><p>윷·모가 나오면 한 번 더 던집니다. 추가 던지기를 모두 마친 후 쌓인 결과를 원하는 순서로 사용하세요. 결과 하나는 한 말 또는 업힌 말 묶음 전체에 사용합니다. 결과를 여러 말에 나눌 수는 없습니다.</p></section><section><h3>02 · 지름길</h3><p>오른쪽 위·왼쪽 위 모서리에서 출발할 때 바깥길이나 안쪽 지름길을 고를 수 있습니다. 중앙에 멈췄다면 다음 이동에서 도착 쪽 길을 고를 수 있습니다. 모서리나 중앙을 지나가기만 할 때는 진행하던 길을 계속 갑니다.</p></section><section><h3>03 · 업기와 잡기</h3><p>내 말이 있는 곳에 도착하면 업고 함께 움직입니다. 상대 말이 있는 곳에 정확히 도착하면 그 칸의 상대 말을 모두 대기 자리로 돌려보냅니다. 지나치는 말은 잡지 않습니다. 도·개·걸·빽도로 잡으면 한 번 더 던집니다. 윷·모는 이미 추가 던지기를 받았으므로 잡기 보너스가 중복되지 않습니다.</p></section><section><h3>04 · 빽도</h3><p>붉은 표시가 있는 윷 하나만 평평한 면으로 나오면 빽도입니다. 판 위의 말을 한 칸 뒤로 옮깁니다. 지름길에서는 그 말이 들어온 길을 되짚습니다. 업힌 말도 함께 뒤로 갑니다.</p><p>이 판의 약속: 첫째 칸에서 빽도면 출발·도착 모서리로 돌아오며, 이후 앞으로 한 칸 이상 움직이면 완주합니다. 대기 말은 빽도로 출발할 수 없고, 완주한 말은 돌아오지 않습니다. 움직일 말이 전혀 없고 빽도만 남으면 버리고 차례를 넘깁니다.</p></section><section><h3>05 · 완주</h3><p>출발·도착 모서리에 닿는 것만으로 끝나지 않습니다. 그곳에서 한 칸 이상 더 나가야 완주입니다. 완주한 말은 자기 쪽 완주 자리에 놓이고, 네 말 모두 완주하면 승리합니다.</p></section></div><p class="guide-footnote">빽도·잡기 보너스에는 지역별 차이가 있습니다. 이 화면의 약속을 두 팀에 똑같이 적용합니다.</p>`;}

export function createTraditional(id,root,shell,options={}){
 let showJMoves=true;try{showJMoves=localStorage.getItem('tc-janggi-moves')!=='false';}catch{}
 let mode=options.mode||'ai',setups=['inner','inner'],setupPlayer=id==='janggi'?1:0;
 let s=id==='janggi'?janggiCreate():yutCreate(),selected=null,qi=0,timer=0,dead=false,busy=false,dialog=null,history=[],motionVersion=0;
 let rolling=false,throwFaces=null,cast=0,notice=false,pendingYut=null;
 const animations=new Set(),ghosts=new Set();
 const name=p=>mode==='ai'?(p===1?'나':'컴퓨터'):`플레이어 ${p}`;
 const human=()=>mode==='local'||s.p===1;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const canY=()=>human()&&!busy&&!s.winner&&s.phase==='move';
 const tokenSelector=(p,i)=>`[data-y-owner="${p}"][data-y-members~="${i}"]`;
 function prepare(){
  setupPlayer=id==='janggi'?(mode==='local'?2:1):0;
  if(id==='janggi'&&mode==='ai')setups[1]=janggiSetups[Math.floor(Math.random()*4)].id;
  s=id==='janggi'?janggiCreate(...setups):yutCreate();
 }
 function jSetup(){if(!setupPlayer)return '';return `<section class="j-setup"><div><strong>${setupPlayer===1?'초 · 청록':'한 · 빨강'}의 마·상 배치</strong><p>${mode==='ai'?'컴퓨터가 먼저 배치를 골랐어요. ':setupPlayer===2?'한이 먼저 고르고, 초가 이어서 고릅니다. ':''}내 쪽에서 본 왼쪽과 오른쪽입니다.</p></div><div class="j-setup-options">${janggiSetups.map(v=>`<button data-j-setup="${v.id}" class="${setups[setupPlayer-1]===v.id?'on':''}" aria-pressed="${setups[setupPlayer-1]===v.id}"><span>${v.name}</span><span class="j-setup-row">${v.order.map((t,i)=>`${i===2?'<em>궁</em>':''}${jPiece(setupPlayer===1?t:t.toLowerCase())}`).join('')}</span></button>`).join('')}</div><button class="primary" data-trad="ready">${setupPlayer===2?'한 배치 확정 · 초 배치 고르기':'배치 확정 · 대국 시작'}</button></section>`;}
 function jBoard(){
  const legal=setupPlayer||!showJMoves?[]:janggiMoves(s).filter(m=>m.from===selected),check=!setupPlayer&&janggiCheck(s);
  return `<div class="j-board ${setupPlayer?'setting-up':''}"><svg viewBox="0 0 100 110" aria-hidden="true">${Array.from({length:9},(_,i)=>`<path d="M${10+i*10} 10V100"/>`).join('')}${Array.from({length:10},(_,i)=>`<path d="M10 ${10+i*10}H90"/>`).join('')}<path d="M40 10L60 30M60 10L40 30M40 80L60 100M60 80L40 100"/>${[19,25,27,29,31,33,35,54,56,58,60,62,64,70].map(i=>{const x=10+i%9*10,y=10+Math.floor(i/9)*10;return `<path d="M${x-1} ${y-3}v2h-2m4-2v2h2m-6 2h2v2m2 0v-2h2" stroke-width=".3"/>`;}).join('')}</svg>${s.board.map((v,i)=>`<button data-j-point="${i}" class="j-point ${i===selected?'selected':''} ${legal.some(m=>m.to===i)?'target':''} ${s.last?.to===i?'j-last':''} ${s.last?.from===i?'j-from':''} ${check&&v===(s.p===1?'K':'k')?'in-check':''}" style="left:${10+i%9*10}%;top:${(10+Math.floor(i/9)*10)/110*100}%" ${!human()||s.winner||busy||setupPlayer?'disabled':''} aria-label="${Math.floor(i/9)+1}행 ${i%9+1}열 ${v?`${v===v.toUpperCase()?'초':'한'} ${jLabels[v.toUpperCase()]}`:'빈자리'}${legal.some(m=>m.to===i)?' 이동 가능':''}" aria-pressed="${i===selected}">${v?jPiece(v):''}</button>`).join('')}</div>`;
 }
 function status(){return setupPlayer?`${setupPlayer===1?'초':'한'} · 시작할 마와 상 위치를 골라 주세요`:s.winner?s.winner===3?'무승부':name(s.winner)+' 승리!':name(s.p)+'의 차례'+(id==='janggi'?(janggiCheck(s)?' · 장군!':s.facing?' · 빅장':''):' · '+s.message);}
 function render(){
  if(dead)return;
  if(id==='yut'){
   const focus=document.activeElement?.closest('[data-y-result],[data-y-token],[data-y-branch],[data-trad="throw"]');
   const focusKey=focus?['data-y-result','data-y-token','data-y-owner','data-y-branch','data-trad'].filter(k=>focus.hasAttribute(k)).map(k=>`[${k}="${focus.getAttribute(k)}"]`).join(''):null;
   root.innerHTML=shell()+`<main class="game-page traditional-yut"><button class="back" data-action="home">← 게임 라운지</button><div class="game-heading"><div><div class="eyebrow">THE TABLE COLLECTION · YUT NORI</div><h1>윷놀이 <span class="yn-heading-note">함께 돌아오는 길</span></h1></div>${gameSetupButton(id)}</div>${yutView(s,{name,human:human(),busy,rolling,faces:throwFaces,cast,selected,qi,history:history.length,notice})}<details class="yn-how"><summary>이렇게 플레이해요 <span>던지기부터 빽도까지</span></summary>${gameGuide(id)}</details></main>`;
   if(focusKey&&!busy)root.querySelector(focusKey)?.focus({preventScroll:true});
   schedule();return;
  }
  root.innerHTML=shell()+`<main class="game-page traditional-${id}"><button class="back" data-action="home">← 게임 라운지</button><div class="game-heading"><div><div class="eyebrow">${id==='janggi'?'JANGGI':'YUT NORI'}</div><h1>${id==='janggi'?'장기':'윷놀이'}</h1></div>${gameSetupButton(id)}</div><div class="play-layout"><section class="play-surface ${id==='janggi'?'peach':'yellow'}" aria-busy="${busy}"><div class="turn-banner" role="status">${status()}</div>${id==='janggi'?`${jSetup()}<div class="j-table-label han">${name(2)} · 漢</div>${jBoard()}<div class="j-table-label cho">${name(1)} · 楚</div>`:''}</section><aside>${gameGuide(id)}${id==='janggi'&&selected!==null&&s.board[selected]?`<div class="j-selection-info"><strong>${jLabels[s.board[selected].toUpperCase()]}</strong><p>${jDescriptions[s.board[selected].toUpperCase()]}</p></div>`:''}<div class="traditional-actions"><button class="secondary" data-trad="rules" ${busy?'disabled':''}>${id==='janggi'?'말 이동 · 게임 규칙':'윷놀이 규칙 · 빽도 안내'}</button>${id==='janggi'?`<button class="secondary j-hints-toggle" data-trad="hints" ${busy?'disabled':''} aria-pressed="${showJMoves}">이동 가능 위치 ${showJMoves?'ON':'OFF'}</button><button class="secondary" data-trad="pass" ${!human()||s.winner||busy||setupPlayer||janggiCheck(s)||s.facing?'disabled':''}>한 수 쉬기</button>${s.facing?`<button class="secondary" data-trad="draw" ${!human()||busy?'disabled':''}>빅장 무승부 수락</button>`:''}`:''}<button class="secondary" data-action="restart">↻ 새 게임</button><button class="secondary" data-trad="undo" ${history.length&&!busy&&!setupPlayer?'':'disabled'}>되돌리기</button></div><p class="aside-note">${id==='janggi'?'팔각 목제 말 · 초 선공 · 한 후공':'각 팀 4말 · 빽도 포함'}</p></aside></div></main>`;
  schedule();
 }
 function schedule(){
  clearTimeout(timer);if(dead||busy||setupPlayer||dialog?.open||human()||s.winner)return;
  timer=setTimeout(()=>{if(dead)return;if(id==='janggi')apply(janggiPlay(s,janggiAI(s)));else if(s.phase==='throw')throwSticks();else{const move=yutAI(s);if(move)apply(yutPlay(s,move));}},id==='yut'?1200:600);
 }
 function cancelMotion(){motionVersion++;clearTimeout(timer);for(const a of animations)a.cancel();animations.clear();for(const g of ghosts)g.remove();ghosts.clear();busy=false;rolling=false;throwFaces=null;pendingYut=null;}
 function animateMove(next,source,rect){
  if(!source||!rect||reduced())return false;
  const target=root.querySelector(`[data-j-point="${next.last.to}"]`);
  if(!target)return false;
  const end=target.getBoundingClientRect(),ghost=source.cloneNode(true),version=motionVersion;
  ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.classList.add('traditional-moving');
  Object.assign(ghost.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',margin:'0',transform:'none',zIndex:'1000',pointerEvents:'none'});
  document.body.append(ghost);ghosts.add(ghost);target.style.visibility='hidden';
  const frames=[{transform:'translate(0,0) scale(1)'}];
  frames.push({transform:`translate(${(end.left-rect.left)/2}px,${(end.top-rect.top)/2-7}px) scale(1.06)`});
  frames.push({transform:`translate(${end.left+end.width/2-rect.left-rect.width/2}px,${end.top+end.height/2-rect.top-rect.height/2}px) scale(${end.width/rect.width})`});
  const animation=ghost.animate(frames,{duration:300,easing:'ease-in-out',fill:'forwards'});animations.add(animation);
  animation.finished.then(()=>{if(dead||version!==motionVersion)return;ghost.remove();ghosts.delete(ghost);animations.delete(animation);busy=false;render();},()=>{});
  return true;
 }
 // Keep the old position visible until the moving piece lands. Captures and
 // finishing tokens follow afterwards, then the turn and available controls change.
 async function applyYut(next){
  if(busy)return;
  history.push(s);if(history.length>100)history.shift();notice=false;
  const motion=next.motion,version=motionVersion;
  if(!motion||reduced()){s=next;selected=null;qi=0;playSound(s.winner?'win':motion?.captured.length?'capture':'place');render();return;}
  pendingYut=next;busy=true;selected=null;render();
  const source=root.querySelector(tokenSelector(motion.p,motion.indices[0]));
  if(!source){s=next;pendingYut=null;busy=false;render();return;}
  const center=el=>{const r=el.getBoundingClientRect();return {x:r.left+scrollX+r.width/2,y:r.top+scrollY+r.height/2,size:r.width};};
  const clonePiece=(el,point)=>{
   const ghost=el.cloneNode(true);ghost.classList.add('yn-motion');ghost.classList.remove('selected');ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;
   for(const attr of [...ghost.attributes])if(attr.name.startsWith('data-'))ghost.removeAttribute(attr.name);
   Object.assign(ghost.style,{position:'absolute',left:point.x-point.size/2+'px',top:point.y-point.size/2+'px',width:point.size+'px',height:point.size+'px',margin:'0',transform:'none',zIndex:'1000',pointerEvents:'none'});
   document.body.append(ghost);ghosts.add(ghost);return ghost;
  };
  const run=async(el,frames,duration)=>{
   if(dead||version!==motionVersion)return false;
   const a=el.animate(frames,{duration,fill:'forwards',easing:'linear'});animations.add(a);
   try{await a.finished;}catch{return false;}
   animations.delete(a);return !dead&&version===motionVersion;
  };
  const board=root.querySelector('.yn-board'),br=board.getBoundingClientRect(),size=board.clientWidth*.085;
  const point=pos=>({x:br.left+scrollX+board.clientLeft+board.clientWidth*yutPoints[pos][0]/100,y:br.top+scrollY+board.clientTop+board.clientHeight*yutPoints[pos][1]/100,size});
  const start=center(source),ghost=clonePiece(source,start);source.style.visibility='hidden';
  let current=start;
  const transform=(p,lift=0,scale=1)=>`translate(${p.x-start.x}px,${p.y-start.y-lift}px) scale(${p.size/start.size*scale})`;
  const route=[...(motion.from===-1?[20]:[]),...motion.path.filter(p=>p!==99)];
  for(const pos of route){
   const end=point(pos),mid={x:(current.x+end.x)/2,y:(current.y+end.y)/2,size:(current.size+end.size)/2};
   const ok=await run(ghost,[{transform:transform(current),offset:0,easing:'cubic-bezier(.2,.55,.3,1)'},{transform:transform(mid,Math.min(23,size*.42),1.06),offset:.46,easing:'cubic-bezier(.4,0,.8,.5)'},{transform:transform(end,0,.97),offset:.88,easing:'ease-out'},{transform:transform(end),offset:1}],pos===route[0]&&motion.from===-1?460:360);
   if(!ok)return;current=end;playSound('place');
  }
  if(motion.captured.length){
   playSound('capture');const captured=root.querySelector(tokenSelector(3-motion.p,motion.captured[0]));
   if(captured){
    const from=center(captured);captured.style.visibility='hidden';
    const flights=motion.captured.map((i,order)=>{
     const end=center(root.querySelector(`[data-y-slot="home-${3-motion.p}-${i}"]`)),g=clonePiece(captured,from);g.style.visibility='visible';g.innerHTML=`<b>${i+1}</b>`;
     return run(g,[{transform:'translate(0,0) scale(1)',opacity:1,offset:0,easing:'cubic-bezier(.25,.7,.3,1)'},{transform:`translate(${(end.x-from.x)*.5}px,${(end.y-from.y)*.5-35}px) scale(.85)`,opacity:.85,offset:.5,easing:'ease-in'},{transform:`translate(${end.x-from.x}px,${end.y-from.y}px) scale(${end.size/from.size})`,opacity:1,offset:1}],540+order*75);
    });
    if(!(await Promise.all(flights)).every(Boolean))return;
   }
  }
  if(motion.to===99){
   const flights=motion.indices.map((i,order)=>{
    const end=center(root.querySelector(`[data-y-slot="finish-${motion.p}-${i}"]`)),g=clonePiece(source,current);g.style.visibility='visible';g.innerHTML=`<b>${i+1}</b>`;
    return run(g,[{transform:'translate(0,0) scale(1)',opacity:1,offset:0,easing:'ease-out'},{transform:`translate(${(end.x-current.x)*.5}px,${(end.y-current.y)*.5-24}px) scale(.9)`,offset:.5,easing:'ease-in-out'},{transform:`translate(${end.x-current.x}px,${end.y-current.y}px) scale(${end.size/current.size})`,offset:1}],580+order*75);
   });ghost.style.visibility='hidden';if(!(await Promise.all(flights)).every(Boolean))return;playSound('win');
  }else{
   const stack=next.tokens[motion.p-1].filter(t=>t.pos===motion.to).length;
   if(stack>motion.indices.length){
    ghost.innerHTML=`<b>${stack}</b><small>업기</small>`;
    if(!await run(ghost,[{transform:transform(current)},{transform:transform(current,5,1.12)},{transform:transform(current)}],270))return;
   }
  }
  if(dead||version!==motionVersion)return;
  for(const g of ghosts)g.remove();ghosts.clear();s=next;pendingYut=null;busy=false;selected=null;qi=0;
  if(s.winner&&motion.to!==99)playSound('win');render();
 }
 // Finish a move cleanly if a viewport change invalidates the measured route.
 function onViewportChange(){if(id!=='yut'||!pendingYut)return;const next=pendingYut;cancelMotion();s=next;selected=null;qi=0;render();}
 window.addEventListener('resize',onViewportChange);
 function apply(next){
  if(next===s)return;
  if(id==='yut'){applyYut(next);return;}
  const previous=s,source=next.last?root.querySelector(`[data-j-point="${next.last.from}"]`):null;
  const clone=source?.cloneNode(true),rect=source?.getBoundingClientRect();
  history.push(s);if(history.length>100)history.shift();s=next;selected=null;qi=0;busy=!!clone&&!reduced();
  playSound(s.winner?'win':s.last&&previous.board[s.last.to]?'capture':'place');render();
  if(busy&&!animateMove(next,clone,rect)){busy=false;render();}
 }
 function throwSticks(){
  if(busy||s.phase!=='throw'||s.winner)return;
  clearTimeout(timer);const before=s,version=motionVersion;
  throwFaces=Array.from({length:4},()=>Math.random()<.5);cast++;rolling=true;notice=false;
  busy=true;selected=null;playSound('roll');render();
  timer=setTimeout(()=>{timer=0;if(dead||version!==motionVersion)return;history.push(before);if(history.length>100)history.shift();s=yutThrow(before,throwFaces);qi=0;busy=false;rolling=false;throwFaces=null;notice=true;playSound('place');render();revealYutBoard();},reduced()?1:1650);
 }
 function revealYutBoard(){
  if(id==='yut'&&human()&&s.phase==='move'&&window.innerWidth<=800){
   root.querySelector('.yn-board')?.scrollIntoView({block:'center',behavior:reduced()?'instant':'smooth'});
  }
 }
 function reset(){cancelMotion();dialog?.close();selected=null;qi=0;history=[];cast=0;notice=false;prepare();render();}
 function help(){
  if(busy||dialog)return;clearTimeout(timer);
  dialog=document.createElement('dialog');dialog.className='rank-dialog traditional-guide';dialog.setAttribute('aria-labelledby','traditional-guide-title');
  dialog.innerHTML=`<form method="dialog"><button class="guide-close" aria-label="규칙 닫기">×</button></form><div class="eyebrow">${id==='janggi'?'JANGGI GUIDE':'YUT NORI GUIDE'}</div><h2 id="traditional-guide-title">${id==='janggi'?'장기 · 말 이동과 규칙':'윷놀이 · 한 판의 약속'}</h2>${id==='janggi'?jRules():yRules()}<form method="dialog"><button class="secondary">확인 · 게임으로 돌아가기</button></form>`;
  document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();dialog=null;if(!dead){root.querySelector('[data-trad="rules"]')?.focus();schedule();}},{once:true});dialog.showModal();
 }
 prepare();render();
 return {restart:reset,handleChange(){},handleClick(b){
  if(b.dataset.trad==='hints'&&id==='janggi'&&!busy){showJMoves=!showJMoves;try{localStorage.setItem('tc-janggi-moves',String(showJMoves));}catch{}render();return;}if(b.dataset.tradMode){mode=b.dataset.tradMode;reset();return;}
  if(b.dataset.trad==='rules'){help();return;}
  if(b.dataset.trad==='undo'&&!busy&&history.length&&!setupPlayer){cancelMotion();s=history.pop();while(mode==='ai'&&s.p===2&&history.length)s=history.pop();selected=null;qi=0;render();return;}
  if(setupPlayer){
   if(b.dataset.jSetup&&janggiSetups.some(v=>v.id===b.dataset.jSetup)){setups[setupPlayer-1]=b.dataset.jSetup;s=janggiCreate(...setups);render();}
   if(b.dataset.trad==='ready'){setupPlayer=setupPlayer===2?1:0;playSound('place');render();}
   return;
  }
  if(!human()||busy||s.winner)return;
  if(b.dataset.trad==='throw'){throwSticks();return;}
  if(id==='janggi'){
   if(b.dataset.trad==='pass'||b.dataset.trad==='draw'){apply(janggiPlay(s,b.dataset.trad));return;}
   if(b.dataset.jPoint!==undefined){const n=+b.dataset.jPoint,v=s.board[n];if(v&&(v===v.toUpperCase()?1:2)===s.p){selected=selected===n?null:n;render();}else if(selected!==null)apply(janggiPlay(s,{from:selected,to:n}));}
  }else{
   if(b.dataset.yResult!==undefined&&s.phase==='move'&&s.queue[+b.dataset.yResult]){qi=+b.dataset.yResult;selected=null;notice=false;render();revealYutBoard();}
   if(b.dataset.yToken!==undefined&&+b.dataset.yOwner===s.p&&s.phase==='move'){selected=selected===+b.dataset.yToken?null:+b.dataset.yToken;notice=false;render();}
   if(b.dataset.yBranch){const move=yutMoves(s,selected,qi).find(v=>v.branch===b.dataset.yBranch);if(move)apply(yutPlay(s,move));}
  }
 },destroy(){dead=true;window.removeEventListener('resize',onViewportChange);cancelMotion();dialog?.close();dialog?.remove();}};
}
