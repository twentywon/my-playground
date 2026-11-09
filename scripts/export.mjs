import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {build,transform} from 'esbuild';
const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(process.argv[2]||path.join(root,'dist'));
const read=p=>readFile(path.join(root,p),'utf8');
const [js,styles]=await Promise.all([
 build({absWorkingDir:root,entryPoints:['src/app.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020',legalComments:'inline',charset:'utf8'}),
 read('src/style.css').then(css=>transform(css.replace(/^@import[^\n]*\n/,''),{loader:'css',minify:true,target:'es2020',legalComments:'inline',charset:'utf8'}))
]);
const bundled=js.outputFiles[0].text,css=styles.code;
const vendor=await read('src/vendor/three.min.js');
const html=`<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Table Club</title><style>${css}</style></head><body><div id="app"></div><script>${vendor}</script><script type="module">${bundled}</script></body></html>`;
await mkdir(output,{recursive:true});await writeFile(path.join(output,'Table-Club.html'),html);console.log(path.join(output,'Table-Club.html'));
