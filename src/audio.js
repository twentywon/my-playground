import {soundFiles} from './sound-data.js';
const liveSounds=new Set(),decodedSounds=new Map();
let audioContext=null,muted=false,lastSound=-Infinity;
try{muted=localStorage.getItem('tc-muted')==='true'}catch{}
export function soundMuted(){return muted}
export function toggleSound(){muted=!muted;try{localStorage.setItem('tc-muted',String(muted))}catch{}if(muted){for(const source of liveSounds){try{source.stop()}catch{}}}else playSound('click');return muted}
function loadSound(key){if(!decodedSounds.has(key)){const uri=soundFiles[key]||soundFiles.click,raw=atob(uri.split(',')[1]),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));decodedSounds.set(key,audioContext.decodeAudioData(bytes.buffer))}return decodedSounds.get(key)}
export function playSound(kind='click'){
 if(muted)return;
 try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;audioContext??=new Context();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});const now=audioContext.currentTime;if(now-lastSound<(kind==='click'?.055:kind==='arcade'?.085:.015))return;lastSound=now;
 const sequence=kind==='roll'?[['roll',0,.55],['rollEnd',.55,.65]]:[[soundFiles[kind]?kind:'place',0,kind==='win'?.55:.42]];
 for(const [key,delay,volume]of sequence)loadSound(key).then(buffer=>{if(muted)return;const source=audioContext.createBufferSource(),gain=audioContext.createGain();source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(audioContext.destination);liveSounds.add(source);source.onended=()=>{liveSounds.delete(source);source.disconnect();gain.disconnect()};source.start(audioContext.currentTime+delay)}).catch(()=>{});
 }catch{/* Audio may be unavailable under browser policy. */}
}
