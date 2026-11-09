// A game requests frames only while it has work. Input can wake an idle loop;
// destroy permanently prevents a late timer from starting it again.
export function createFrameLoop(step){
 let frame=0,disposed=false;
 function tick(now){frame=0;if(disposed)return;if(step(now)!==false)start();}
 function start(){if(!disposed&&!frame)frame=requestAnimationFrame(tick);}
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
 return {start,stop,get running(){return !!frame;},destroy(){disposed=true;stop();}};
}
