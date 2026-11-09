import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gomokuForbidden} from '../src/engine.js';
const board=()=>Array.from({length:15},()=>Array(15).fill(0));
test('Gomoku 33 switch restricts black only or both players without mutating the board',()=>{
 for(const p of [1,2]){const b=board();for(const [r,c]of [[6,7],[8,7],[7,6],[7,8]])b[r][c]=p;const before=structuredClone(b);
 assert.equal(gomokuForbidden(b,7,7,p,'free'),false);
 assert.equal(gomokuForbidden(b,7,7,p,'black33'),p===1);
 assert.equal(gomokuForbidden(b,7,7,p,'both33'),true);assert.deepEqual(b,before);}
});
test('Gomoku identifies broken open threes but not blocked or edge-bound threes',()=>{
 let b=board();for(const [r,c]of [[7,6],[7,9],[6,7],[9,7]])b[r][c]=1;
 assert.equal(gomokuForbidden(b,7,7,1,'black33'),true);
 b[7][5]=2;assert.equal(gomokuForbidden(b,7,7,1,'black33'),false);
 b=board();for(const [r,c]of [[0,1],[0,2],[1,0],[2,0]])b[r][c]=1;
 assert.equal(gomokuForbidden(b,0,0,1,'black33'),false);
 b=board();b[7][6]=b[7][8]=1;assert.equal(gomokuForbidden(b,7,7,1,'black33'),false);
});
test('A completed five takes priority; 44 and overlines remain allowed',()=>{
 const b=board();for(const [r,c]of [[6,7],[8,7],[6,6],[8,8],[7,3],[7,4],[7,5],[7,6]])b[r][c]=1;
 assert.equal(gomokuForbidden(b,7,7,1,'black33'),false);
 const four=board();for(const [r,c]of [[7,4],[7,5],[7,6],[4,7],[5,7],[6,7]])four[r][c]=1;
 assert.equal(gomokuForbidden(four,7,7,1,'black33'),false);
});
