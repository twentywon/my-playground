// Original, simplified top views. Board lengths are game rules, not real-world scale.
export const navalFeatures=[
 '넓은 비행갑판 · 우현 함교 · 함재기',
 '뾰족한 선수 · 대형 주포탑 3기',
 '가느다란 선체 · 중형 포탑 · 상부구조',
 '유선형 선체 · 중앙 함교 · 꼬리날개',
 '작은 함포 · 두 굴뚝 · 후방 갑판'
];
const hulls=[
 'M49 8 Q73 18 78 58 L83 116 L83 438 Q80 474 66 488 L34 488 Q20 474 17 438 L17 116 L22 58 Q27 18 49 8Z',
 'M50 8 Q65 30 74 78 Q84 132 84 198 L81 400 Q80 455 62 489 L38 489 Q20 455 19 400 L16 198 Q16 132 26 78 Q35 30 50 8Z',
 'M50 9 Q71 45 77 107 L78 398 Q77 458 61 488 L39 488 Q23 458 22 398 L23 107 Q29 45 50 9Z',
 'M50 12 C77 12 77 71 77 130 L77 365 Q77 444 55 480 L45 480 Q23 444 23 365 L23 130 C23 71 23 12 50 12Z',
 'M50 10 Q69 41 77 101 L80 186 L76 401 Q74 456 61 487 L39 487 Q26 456 24 401 L20 186 L23 101 Q31 41 50 10Z'
];
function turret(y,reverse=false,small=false){const width=small?22:36,barrels=small?2:3;return `<g transform="translate(50 ${y})${reverse?' rotate(180)':''}"><path d="M${-width/2} 14v-26l8-9h${width-16}l8 9v26Z" fill="#8eaaa8" stroke="#32545e" stroke-width="2.5"/>${Array.from({length:barrels},(_,i)=>`<path d="M${(i-(barrels-1)/2)*8} -17v-31" stroke="#324e58" stroke-width="4.5" stroke-linecap="round"/>`).join('')}<path d="M${-width/2+4} 6h${width-8}" stroke="#dbe4ca" stroke-width="2"/></g>`;}
const plane=(x,y)=>`<path d="M0-12L3-3L12 3v3L3 3v8l4 3v2L0 14l-7 2v-2l4-3V3l-9 3V3l9-6Z" transform="translate(${x} ${y})" fill="#e1e8d5" stroke="#607f84" stroke-width="1.5"/>`;
function details(type){
 if(type===0)return `<path d="M25 40L58 30 76 71 76 429 63 470H28L22 444V99Z" fill="#5f7d83" stroke="#d0d6bf" stroke-width="2.5"/><path d="M42 55v388M49 55v388" stroke="#cbd4bd" stroke-width="1.7"/><path d="M29 449L61 180M36 449L68 180" stroke="#d7d7b9" stroke-width="2"/><path d="M31 456h30M31 443h31M33 430h31" stroke="#f0d59b" stroke-width="2"/><rect x="66" y="172" width="23" height="113" rx="5" fill="#b4c6bc" stroke="#2c505d" stroke-width="3"/><rect x="70" y="191" width="15" height="34" rx="3" fill="#476670"/><path d="M76 181v-29m-8 9h17" stroke="#d9e0c4" stroke-width="3"/>${plane(31,121)}${plane(31,163)}${plane(57,316)}${plane(57,359)}`;
 if(type===1)return `<path d="M50 42v39M50 444v24" stroke="#748f86" stroke-width="2"/>${turret(119)}${turret(182)}<path d="M34 218h32l6 45-7 44H35l-7-44Z" fill="#819e9c" stroke="#36545d" stroke-width="3"/><rect x="37" y="226" width="26" height="26" rx="4" fill="#dbe1cc"/><path d="M50 215v66m-20-26h40m-32 15h24" stroke="#355867" stroke-width="3"/><rect x="40" y="298" width="20" height="31" rx="5" fill="#44636c" stroke="#9cb6af" stroke-width="3"/><rect x="40" y="343" width="20" height="26" rx="5" fill="#44636c"/>${turret(405,true)}${[235,285,337].flatMap(y=>[24,76].map(x=>`<rect x="${x-5}" y="${y}" width="10" height="19" rx="3" fill="#9eb5ab" stroke="#476575" stroke-width="2"/>`)).join('')}`;
 if(type===2)return `${turret(112,false,true)}${turret(172,false,true)}<path d="M35 203h30l7 64-9 26H37l-9-26Z" fill="#8aa6a3" stroke="#355563" stroke-width="3"/><rect x="37" y="219" width="26" height="24" rx="4" fill="#d7ddc7"/><path d="M50 202v77m-18-28h36" stroke="#365565" stroke-width="3"/><rect x="41" y="303" width="18" height="35" rx="6" fill="#3b5b66"/><rect x="41" y="353" width="18" height="30" rx="6" fill="#3b5b66"/>${turret(427,true,true)}<path d="M32 462h36" stroke="#9eb1a2" stroke-width="3"/>`;
 if(type===3)return `<path d="M50 28v425" stroke="#92aaa1" stroke-width="2"/><path d="M39 183Q50 168 61 183v103q-11 17-22 0Z" fill="#bfd1c5" stroke="#284b5b" stroke-width="3"/><rect x="43" y="196" width="14" height="48" rx="5" fill="#4b6b72"/><path d="M46 189v-22m8 25v-33" stroke="#d5e0ce" stroke-width="3"/><path d="M24 355L9 371v15l16-8M76 355l15 16v15l-16-8M43 451l-13 27h40l-13-27" fill="#6b8c92" stroke="#294e5d" stroke-width="3"/><path d="M40 112h20m-20 18h20m-20 14h20" stroke="#9cb2aa" stroke-width="2"/>`;
 return `${turret(108,false,true)}<path d="M32 169h36l5 68-11 24H38l-11-24Z" fill="#8da7a0" stroke="#355361" stroke-width="3"/><rect x="35" y="184" width="30" height="22" rx="4" fill="#cbd8c4"/><path d="M50 165v83m-20-29h40" stroke="#365364" stroke-width="3"/><rect x="38" y="274" width="24" height="39" rx="8" fill="#3e5d67" stroke="#a5bab0" stroke-width="3"/><rect x="38" y="335" width="24" height="34" rx="7" fill="#3e5d67" stroke="#a5bab0" stroke-width="3"/>${turret(420,true,true)}<path d="M33 466h34M33 476h34" stroke="#486572" stroke-width="3"/>`;
}
export function navalShipSvg(type,{horizontal=false}={}){
 const hull=hulls[type];if(!hull)return '';
 return `<svg class="bs-ship-art" viewBox="${horizontal?'0 0 500 100':'0 0 100 500'}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g${horizontal?' transform="matrix(0 -1 1 0 0 100)"':''}><path d="${hull}" transform="translate(3 4)" fill="#071f2a" opacity=".4"/><path d="${hull}" fill="${type===3?'#64868c':'#abbca8'}" stroke="#244958" stroke-width="3.5"/><path d="M31 94Q24 150 28 385M69 94q7 56 3 291" fill="none" stroke="#e2e7cf" stroke-width="2" opacity=".6"/>${details(type)}</g></svg>`;
}
export function navalFleetOverlay(fleet,shots,{reveal=false,selected=-1,setup=false}={}){
 return `<div class="bs-fleet-layer" aria-hidden="true">${fleet.map((cells,i)=>{
  if(!cells)return '';const sunk=cells.every(c=>shots.includes(c));if(!reveal&&!sunk)return '';
  const vertical=cells[1]-cells[0]===10,row=Math.floor(cells[0]/10)+2,col=cells[0]%10+2;
  return `<div class="bs-vessel ${sunk?'wreck':''} ${setup&&selected===i?'selected':''}" data-vessel="${i}" style="grid-column:${col} / span ${vertical?1:cells.length};grid-row:${row} / span ${vertical?cells.length:1}">${navalShipSvg(i,{horizontal:!vertical})}</div>`;
 }).join('')}</div>`;
}
