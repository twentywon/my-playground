import {orb} from './graphics.js';
import {flickHinges} from './arcade-engine.js';

// Draw in the same 600 × 600 coordinates used by placement and physics.
const flickBoards=new Map();
function flickBoardImage(kind){
 if(flickBoards.has(kind))return flickBoards.get(kind);
 const image=document.createElement('canvas');image.width=image.height=1200;const c=image.getContext('2d');c.scale(2,2);const wood=c.createLinearGradient(0,0,600,600);wood.addColorStop(0,'#f0d49d');wood.addColorStop(1,'#d5ad70');c.fillStyle=wood;c.fillRect(0,0,600,600);c.strokeStyle='#885b250a';c.lineWidth=1;for(let i=0;i<12;i++){const y=i*53;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(200,y+15,400,y-12,600,y+4);c.stroke();}
 c.strokeStyle='#805e36';c.lineWidth=1.25;c.lineCap='butt';c.setLineDash([]);c.beginPath();
 if(kind==='janggi'){
  for(let col=0;col<9;col++){c.moveTo(60+col*60,45);c.lineTo(60+col*60,555);}
  for(let row=0;row<10;row++){const y=45+row*56.6667;c.moveTo(60,y);c.lineTo(540,y);}
  for(const y of [45,441.6667]){c.moveTo(240,y);c.lineTo(360,y+113.3333);c.moveTo(360,y);c.lineTo(240,y+113.3333);}
 }else{
  for(let i=0;i<13;i++){const p=30+i*45;c.moveTo(30,p);c.lineTo(570,p);c.moveTo(p,30);c.lineTo(p,570);}
 }
 c.stroke();
 if(kind==='stones')for(const x of [165,300,435])for(const y of [165,300,435]){c.fillStyle='#805e36';c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.fill();}
 c.strokeStyle='#ad874e';c.lineWidth=5;c.strokeRect(3,3,594,594);
 if(kind==='janggi'){
  c.fillStyle='#816141';c.fillRect(0,299,600,2);
  for(const h of flickHinges){const g=c.createLinearGradient(h.x,0,h.x+h.w,0);g.addColorStop(0,'#a88b4e');g.addColorStop(.5,'#e7d29a');g.addColorStop(1,'#92713a');c.fillStyle=g;c.fillRect(h.x,h.y,h.w,h.h);c.strokeStyle='#74572f';c.lineWidth=1;c.strokeRect(h.x,h.y,h.w,h.h);c.fillStyle='#735e3c';c.fillRect(h.x,h.y+14,h.w,3);for(const x of [h.x+6,h.x+22])for(const y of [h.y+6,h.y+26]){c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();}}
 }
 flickBoards.set(kind,image);return image;
}
export function drawFlickTable(c,s,drag){
 c.save();c.fillStyle='#163b30';c.fillRect(0,0,728,728);c.translate(64,64);c.drawImage(flickBoardImage(s.pieceMode),0,0,600,600);
 if(s.phase==='setup'){c.fillStyle='#fff8d528';c.fillRect(16,s.p===1?16:375,568,209);}
 for(const stone of s.stones.filter(v=>v.on)){
  if(s.pieceMode!=='janggi'){orb(c,stone.x,stone.y,stone.r,stone.p===1?'#fffef3':'#5f6a66',stone.p===1?'#c9c2ae':'#151e1a');continue;}
  c.save();c.translate(stone.x,stone.y);c.rotate(stone.angle||0);c.shadowColor='#0004';c.shadowBlur=7;c.shadowOffsetY=3;c.fillStyle='#eddfbc';c.strokeStyle='#b89863';c.lineWidth=2;c.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4,x=Math.cos(a)*stone.r,y=Math.sin(a)*stone.r;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();c.stroke();c.shadowBlur=0;c.shadowOffsetY=0;c.fillStyle=stone.p===1?'#a33f31':'#2d7161';c.font=`bold ${stone.r*1.2}px serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(stone.p===2?({漢:'楚',卒:'兵'})[stone.label]||stone.label:stone.label,0,1);c.restore();
 }
 if(drag&&!drag.placing){const dx=drag.x-drag.px,dy=drag.y-drag.py,len=Math.hypot(dx,dy),scale=Math.min(160,len)/Math.max(1,len);c.strokeStyle='#fff8dc';c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.moveTo(drag.x,drag.y);c.lineTo(drag.x+dx*scale,drag.y+dy*scale);c.stroke();c.setLineDash([]);c.fillStyle='#a58c60';c.fillRect(170,580,260,8);c.fillStyle='#fff0ac';c.fillRect(170,580,Math.min(260,len/145*260),8);}
 c.restore();
}
