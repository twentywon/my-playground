import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mazeCreate,mazeTick} from '../src/arcade-engine.js';
function scene({x=3,y=3,dir={x:1,y:0},ghosts=[{x:5,y:3,chase:5,cooldown:20}],power=0,invulnerable=0,pellets={'17,13':10}}={}){
 return {...mazeCreate(),x,y,dir,next:{...dir},ghosts,power,invulnerable,pellets};
}
test('Maze does not kill a player following a ghost that leaves the square simultaneously',()=>{
 const s=scene({ghosts:[{x:4,y:3,prevX:3,prevY:3,chase:5,cooldown:20}]}),before=structuredClone(s),n=mazeTick(s);
 assert.equal(n.x,4);assert.equal(n.ghosts[0].x,5);assert.equal(n.over,false);assert.deepEqual(s,before);
});
test('Maze same-destination and head-on crossing contacts kill once, at the contact point',()=>{
 let n=mazeTick(scene());assert.equal(n.over,true);assert.equal(n.won,false);assert.equal(n.lives,0);assert.equal(n.x,4);assert.equal(n.y,3);assert.equal(n.collision.time,1);
 n=mazeTick(scene({ghosts:[{x:4,y:3,prevX:5,prevY:3,chase:5,cooldown:20}]}));
 assert.equal(n.over,true);assert.equal(n.x,3.5);assert.equal(n.collision.time,.5);assert.equal(mazeTick(n),n);
});
test('Maze stationary contacts, multiple ghosts and the original four ghosts do not respawn the dead player',()=>{
 const s=scene({dir:{x:0,y:0},ghosts:[{x:3,y:3},{x:3,y:3},{x:9,y:9},{x:9,y:8}]}),n=mazeTick(s);
 assert.equal(n.over,true);assert.equal(n.lives,0);assert.equal(n.x,3);assert.equal(n.y,3);assert.equal(n.ghosts.length,4);assert.equal(n.invulnerable,0);
});
test('Maze death cannot be overwritten by a simultaneous last-pellet win',()=>{
 const n=mazeTick(scene({pellets:{'4,3':10}}));assert.equal(n.over,true);assert.equal(n.won,false);assert.equal(n.score,10);
 const win=mazeTick(scene({pellets:{'4,3':10},ghosts:[]}));assert.equal(win.over,true);assert.equal(win.won,true);assert.equal(win.score,510);assert.equal(mazeTick(win).score,510);
});
test('Maze power pickup saves a same-destination collision but not an earlier crossing',()=>{
 let n=mazeTick(scene({pellets:{'4,3':50,'17,13':10}}));assert.equal(n.over,false);assert.equal(n.power,45);assert.equal(n.score,250);assert.equal(n.ghosts[0].respawn,8);
 n=mazeTick(scene({ghosts:[{x:4,y:3,prevX:5,prevY:3,chase:5,cooldown:20}],pellets:{'4,3':50,'17,13':10}}));
 assert.equal(n.over,true);assert.equal(n.score,0);assert.equal(n.pellets['4,3'],50);
});
test('Maze power and spawn shield last through their final active tick',()=>{
 let n=mazeTick(scene({invulnerable:1}));assert.equal(n.over,false);assert.equal(n.invulnerable,0);
 n=mazeTick(n);assert.equal(n.over,true);
 n=mazeTick(scene({power:1,ghosts:[{x:3,y:3}]}));assert.equal(n.over,false);assert.equal(n.power,0);assert.equal(n.score,200);
 n=mazeTick(scene({power:0,ghosts:[{x:3,y:3}]}));assert.equal(n.over,true);
});
test('Eaten ghosts have a return grace period and cannot score twice in one tick or kill on respawn',()=>{
 let s=scene({x:9,y:9,dir:{x:0,y:0},power:20,ghosts:[{x:1,y:1,respawn:20},{x:9,y:9}]});
 s=mazeTick(s);assert.equal(s.score,200);assert.equal(s.ghosts[1].respawn,8);
 s={...s,power:0};
 for(let i=0;i<8;i++){s=mazeTick(s);assert.equal(s.over,false);assert.equal(s.score,200);}
 assert.equal(s.ghosts[1].respawn,0);
});
