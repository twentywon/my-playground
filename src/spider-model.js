import {spiderRun,spiderMove} from './extra-engine.js';
export function spiderSuggestions(s){
 const choices=[];
 for(let from=0;from<10;from++)for(let index=0;index<s.columns[from].length;index++){
  if(!spiderRun(s.columns[from],index))continue;
  for(let to=0;to<10;to++){
   if(from===to||index===0&&!s.columns[to].length)continue;
   const next=spiderMove(s,from,index,to);if(next===s)continue;
   const top=s.columns[to].at(-1),card=s.columns[from][index];
   const score=(next.completed-s.completed)*1000+(index>0&&!s.columns[from][index-1].up?100:0)+(top?.suit===card.suit?40:0)+(index===0?15:0)-(top?0:10);
   choices.push({from,index,to,score});
  }
 }
 return choices.sort((a,b)=>b.score-a.score);
}
export function spiderValidSave(s){
 if(!s||![1,2,4].includes(s.suits)||!Array.isArray(s.columns)||s.columns.length!==10||!s.columns.every(Array.isArray)||!Array.isArray(s.stock)||s.stock.length>50||s.stock.length%10||!Number.isInteger(s.completed)||s.completed<0||s.completed>8||!Number.isInteger(s.moves)||s.moves<0||s.winner!==(s.completed===8?1:0))return false;
 const cards=[...s.columns.flat(),...s.stock];
 if(cards.length+s.completed*13!==104||new Set(cards.map(c=>c?.id)).size!==cards.length)return false;
 if(!cards.every(c=>c&&Number.isInteger(c.id)&&c.id>=0&&c.id<104&&Number.isInteger(c.rank)&&c.rank>=1&&c.rank<=13&&Number.isInteger(c.suit)&&c.suit>=0&&c.suit<s.suits&&typeof c.up==='boolean'&&c.rank===c.id%13+1&&c.suit===Math.floor(c.id/13)%s.suits))return false;
 return s.columns.every(col=>!col.length||col.at(-1).up&&col.every((c,i)=>!i||!col[i-1].up||c.up));
}
