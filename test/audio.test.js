import {test} from 'node:test';
import assert from 'node:assert/strict';
test('A user click cannot suppress dice-roll audio; roll and landing keep their timing',async()=>{
 const oldWindow=globalThis.window,starts=[];
 class FakeAudioContext{
  state='suspended';currentTime=5;destination={};
  resume(){this.state='running';return Promise.resolve();}
  decodeAudioData(){return Promise.resolve({});}
  createBufferSource(){return {connect(){},disconnect(){},stop(){},start(time){starts.push(time);}};}
  createGain(){return {gain:{value:0},connect(){},disconnect(){}};}
 }
 globalThis.window={AudioContext:FakeAudioContext};
 try{
  const {playSound}=await import('../src/audio.js?roll-regression');
  playSound('click');playSound('roll');await new Promise(resolve=>setImmediate(resolve));
  assert.equal(starts.length,3);assert.equal(starts[0],5);assert.equal(starts[1],5);assert.equal(starts[2],5.55);
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;}
});
