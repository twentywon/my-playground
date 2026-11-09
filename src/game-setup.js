import {gonuMaps} from './gonu-engine.js';

const versus=['mode','함께하는 방식',[['ai','컴퓨터 대전'],['local','둘이서 플레이']]];
const setupFields={
 carrom:[versus],quoridor:[versus],pentago:[versus],
 rummikub:[versus],domino:[versus,['dominoRule','게임 규칙',[['draw','드로우 · 못 놓으면 타일 가져오기'],['block','블록 · 못 놓으면 차례 넘기기']]]],battleship:[versus],
 harehounds:[versus,['hareSide','내 진영',[['hounds','사냥개 3마리 · 선공'],['hare','토끼 1마리 · 후공']]]],
 hexboard:[versus,['hexBoardSize','보드 크기',[[7,'7 × 7 · 작은 판'],[9,'9 × 9 · 기본'],[11,'11 × 11 · 정규 크기']]],['hexSeat','내 차례',[[1,'선공 · 코랄로 시작'],[2,'후공 · 첫 수 교환 가능']]]],
 reversi:[versus],hex:[versus,['hexShape','맵 모양',[['hexagon','육각형'],['diamond','마름모'],['ring','고리']]],['hexRadius','맵 크기',[[4,'크게'],[5,'아주 크게']]]],
 gomoku:[versus,['gomokuRule','33 규칙',[['free','33 허용'],['black33','흑만 33 금지']]]],yacht:[versus],
 dots:[versus,['dotsSize','보드 크기',[[3,'3 × 3'],[4,'4 × 4'],[5,'5 × 5'],[6,'6 × 6']]]],morris:[versus],checkers:[versus],chess:[versus],
 spider:[['suits','무늬 수',[[1,'1무늬 · 입문'],[2,'2무늬 · 보통'],[4,'4무늬 · 도전']]],['resume','시작 방법',[['continue','저장된 판 이어하기'],['new','새 카드 배치']]]],
 sutda:[['sutdaCards','섯다 모드',[[2,'두 장 섯다'],[3,'세 장 섯다']]]],ladders:[versus],
 flick:[versus,['flickStyle','말 종류',[['stones','바둑알'],['janggi','장기말 · 기본 진형']]],['flickCount','팀당 알 개수',Array.from({length:20},(_,i)=>[i+1,`${i+1}개`])]],
 maze:[['speed','게임 속도',[[340,'여유롭게'],[280,'기본']]]],
 breakout:[['breakoutMap','맵',[['classic','클래식'],['pyramid','피라미드'],['tunnel','터널'],['checker','체커'],['fortress','요새']]]],
 janggi:[versus],yut:[versus],gonu:[versus,['map','고누 맵',gonuMaps.map(m=>[m.id,m.name])]],mancala:[versus],connect4:[versus],
 hitblow:[['duplicates','색상 중복',[['no','중복 없이 · 6색 중 4색'],['yes','중복 허용 · 같은 색도 가능']]]]
};
const setupDefaults={dominoRule:'draw',hareSide:'hounds',hexBoardSize:9,hexSeat:1,mode:'ai',hexShape:'hexagon',hexRadius:4,gomokuRule:'free',dotsSize:4,suits:1,resume:'continue',sutdaCards:2,flickStyle:'stones',flickCount:7,speed:340,breakoutMap:'classic',map:'well',duplicates:'no'};
export const hasGameSetup=id=>!!setupFields[id];
export function gameSetupButton(id){return hasGameSetup(id)?'<div class="mode-switch setup-switch"><button data-action="setup">⚙ 모드 변경</button></div>':'';}
export function openGameSetup(game,previous,onStart){
 document.querySelector('.game-setup-dialog')?.remove();
 const focus=document.activeElement,values={...setupDefaults,...previous},dialog=document.createElement('dialog');
 dialog.className='game-setup-dialog';dialog.setAttribute('aria-labelledby','setup-title');
 dialog.innerHTML=`<form><span class="setup-eyebrow">MAKE YOUR TABLE</span><h2 id="setup-title">${game.name}</h2><p>오늘은 어떻게 즐겨 볼까요?</p><div class="setup-fields">${setupFields[game.id].map(([key,label,choices])=>`<label>${label}<select name="${key}">${choices.map(([value,text])=>`<option value="${value}" ${String(values[key])===String(value)?'selected':''}>${text}</option>`).join('')}</select></label>`).join('')}</div><p class="setup-note">${game.id==='spider'?'선택한 무늬와 저장된 판이 같으면 이어서 시작합니다.':previous?'시작하면 선택한 설정으로 새 판을 엽니다.':'설정을 고르고 시작하면 게임판이 준비됩니다.'}</p><div class="setup-actions"><button type="button" data-setup-cancel>돌아가기</button><button type="submit" class="primary">게임 시작 <span>→</span></button></div></form>`;
 const update=()=>{for(const key of ['hareSide','hexSeat']){const field=dialog.querySelector(`[name=${key}]`);if(field)field.disabled=dialog.querySelector('[name=mode]').value==='local';}const count=dialog.querySelector('[name=flickCount]');if(count){const janggi=dialog.querySelector('[name=flickStyle]').value==='janggi';count.disabled=janggi;if(janggi)count.value='16';}};
 dialog.addEventListener('change',update);dialog.addEventListener('keydown',e=>e.stopPropagation());update();
 function close(){dialog.close();dialog.remove();if(focus?.isConnected)focus.focus({preventScroll:true});}
 dialog.querySelector('[data-setup-cancel]').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const result={...values,...Object.fromEntries(new FormData(e.target))};close();onStart(result);};
 document.body.append(dialog);dialog.showModal();
}
