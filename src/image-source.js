// Keep original, offline-ready image bytes in the bundle. Decode each image only
// when first used, then reuse a short URL across renders and game sessions.
export function lazyImage(data){
 let source=data,ready=false;
 return ()=>{
  if(ready)return source;
  ready=true;
  if(typeof window==='undefined'||typeof URL.createObjectURL!=='function')return source;
  try{
   const comma=source.indexOf(','),header=source.slice(0,comma);
   if(!header.startsWith('data:image/'))return source;
   const mime=header.slice(5).split(';')[0],payload=source.slice(comma+1);
   const bytes=header.includes(';base64')?Uint8Array.from(atob(payload),c=>c.charCodeAt(0)):decodeURIComponent(payload);
   source=URL.createObjectURL(new Blob([bytes],{type:mime}));
  }catch{/* A browser without blob URLs can still display the original data URL. */}
  return source;
 };
}

export function imageSources(sources){
 for(const key of Object.keys(sources)){
  const resolve=lazyImage(sources[key]);
  Object.defineProperty(sources,key,{configurable:true,enumerable:true,get(){
   const value=resolve();Object.defineProperty(sources,key,{value,enumerable:true});return value;
  }});
 }
 return sources;
}
