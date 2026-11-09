import {soundFiles} from './sound-data.js';
const liveSounds=new Set(),decodedSounds=new Map(),lastSounds=new Map();
let audioContext=null,muted=false,soundRevision=0;
try{muted=localStorage.getItem('tc-muted')==='true'}catch{}
export function soundMuted(){return muted}
export function toggleSound(){muted=!muted;soundRevision++;try{localStorage.setItem('tc-muted',String(muted))}catch{}if(muted){for(const source of liveSounds){try{source.stop()}catch{}}}else playSound('click');return muted}
function loadSound(key){if(!decodedSounds.has(key)){const uri=soundFiles[key]||soundFiles.click,raw=atob(uri.split(',')[1]),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));decodedSounds.set(key,audioContext.decodeAudioData(bytes.buffer))}return decodedSounds.get(key)}
export function playSound(kind='click'){
 if(muted)return;
 try{
 const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
 audioContext??=new Context();
 const resumed=audioContext.state==='suspended'?audioContext.resume():Promise.resolve();
 // Debounce repeated sounds of the same kind, never a roll following a click.
 const now=performance.now(),last=lastSounds.get(kind)??-Infinity;
 if(now-last<(kind==='click'?55:kind==='arcade'?85:15))return;
 lastSounds.set(kind,now);const revision=soundRevision;
 const sequence=kind==='roll'?[['roll',0,.55],['rollEnd',.55,.65]]:[[soundFiles[kind]?kind:'place',0,kind==='win'?.55:.42]];
 Promise.all([resumed,...sequence.map(([key])=>loadSound(key))]).then(([, ...buffers])=>{
  if(muted||revision!==soundRevision)return;
  const start=audioContext.currentTime;
  sequence.forEach(([,delay,volume],i)=>{
   const source=audioContext.createBufferSource(),gain=audioContext.createGain();source.buffer=buffers[i];gain.gain.value=volume;
   source.connect(gain);gain.connect(audioContext.destination);liveSounds.add(source);
   source.onended=()=>{liveSounds.delete(source);source.disconnect();gain.disconnect();};source.start(start+delay);
  });
 }).catch(()=>{});

 }catch{/* Audio may be unavailable under browser policy. */}
}
