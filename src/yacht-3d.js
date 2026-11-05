// One lit WebGL scene; deterministic settling keeps the top faces equal to scores.
export function createYachtScene(host,onCup,onDie){
 const T=window.THREE;if(!T)return null;let renderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:false})}catch{return null}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor('#ede1c0');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,80);camera.position.set(0,9.8,9.8);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight(0xfff9e8,0x586347,2));const light=new T.DirectionalLight(0xfff4dd,3.2);light.position.set(-3,8,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-6,right:6,top:6,bottom:-6});light.shadow.normalBias=.025;scene.add(light);
 const mat=(color,roughness=.5)=>new T.MeshStandardMaterial({color,roughness});
 const mesh=(geo,material,parent=scene)=>{const m=new T.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const tray=mesh(new T.BoxGeometry(8.4,.28,5.6),mat('#285b4b',.95));tray.position.y=-.18;
 for(const [x,z,w,d]of [[0,-2.85,8.8,.24],[0,2.85,8.8,.24],[-4.3,0,.24,5.8],[4.3,0,.24,5.8]]){const rail=mesh(new T.BoxGeometry(w,.34,d),mat('#a97843'));rail.position.set(x,.04,z)}
 const cup=new T.Group();scene.add(cup);cup.position.set(-2.85,0,-1.35);
 const profile=[[0,0],[.65,0],[.86,1.7],[.76,1.7],[.55,.12],[0,.12]].map(([x,y])=>new T.Vector2(x,y));mesh(new T.LatheGeometry(profile,64),mat('#8c542e',.63),cup);
 const rim=mesh(new T.TorusGeometry(.81,.055,12,64),mat('#e0b37a',.4),cup);rim.rotation.x=Math.PI/2;rim.position.y=1.7;
 const base=mesh(new T.TorusGeometry(.65,.035,12,64),mat('#d9a96b'),cup);base.rotation.x=Math.PI/2;base.position.y=.05;
 const dots={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
 const textures=[];const faces=[3,4,1,6,2,5].map(n=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#fff7dc';g.fillRect(0,0,256,256);g.strokeStyle='#d3cbb5';g.lineWidth=6;g.strokeRect(3,3,250,250);for(const dot of dots[n]){const x=58+dot%3*70,y=58+Math.floor(dot/3)*70;const grad=g.createRadialGradient(x+4,y+5,0,x,y,18);grad.addColorStop(0,'#40574a');grad.addColorStop(1,'#112820');g.fillStyle=grad;g.beginPath();g.arc(x,y,18,0,7);g.fill()}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);return new T.MeshStandardMaterial({map:tex,roughness:.3})});
 const normals={1:[0,1,0],6:[0,-1,0],2:[0,0,1],5:[0,0,-1],3:[1,0,0],4:[-1,0,0]};
 const targetQ=n=>new T.Quaternion().setFromUnitVectors(new T.Vector3(...normals[n]),new T.Vector3(0,1,0));
 const roundedCube=new T.BoxGeometry(.78,.78,.78,8,8,8);const positions=roundedCube.attributes.position;for(let i=0;i<positions.count;i++){const v=new T.Vector3().fromBufferAttribute(positions,i),core=v.clone().clampScalar(-.31,.31);v.sub(core).normalize().multiplyScalar(.08).add(core);positions.setXYZ(i,v.x,v.y,v.z)}roundedCube.computeVertexNormals();
 const dice=Array.from({length:5},(_,i)=>{const d=mesh(roundedCube,faces);d.userData.index=i;return d});
 const rings=dice.map(()=>{const r=mesh(new T.TorusGeometry(.59,.035,8,48),mat('#e9ca76'));r.rotation.x=Math.PI/2;r.position.y=.015;return r});
 let frame=0,resolveRoll=null,disposed=false,rolling=false,values=[1,2,3,4,5],holds=Array(5).fill(false);
 const rest=(i)=>new T.Vector3((i-2)*1.34,.39,.9+(i%2)*.22);
 function draw(){if(!disposed)renderer.render(scene,camera)}
 function resize(){if(disposed)return;const width=host.clientWidth||600,height=Math.max(270,width*.7);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw()}
 const observer=new ResizeObserver(resize);observer.observe(host);host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D 주사위 통과 주사위 5개');
 const ray=new T.Raycaster();function click(e){if(rolling)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects([...dice,cup],true)[0];if(!hit)return;if(dice.includes(hit.object))onDie(hit.object.userData.index);else onCup()}
 renderer.domElement.addEventListener('click',click);
 function sync(next,held){values=[...next];holds=[...held];dice.forEach((d,i)=>{d.visible=true;d.position.copy(rest(i));d.quaternion.copy(targetQ(values[i]));rings[i].position.set(d.position.x,.025,d.position.z);rings[i].visible=holds[i]});cup.rotation.set(0,0,0);cup.position.set(-2.85,0,-1.35);draw()}
 function roll(next,held,reduced){rolling=true;const start=performance.now(),duration=reduced?1:2400;return new Promise(resolve=>{resolveRoll=resolve;function tick(now){if(disposed)return;const t=Math.min(1,(now-start)/duration);cup.rotation.z=t<.23?Math.sin(t*100)*.09:t<.42?-(t-.23)/.19*1.35:t<.8?-1.35:-(1-t)/.2*1.35;cup.position.y=t<.23?.05+Math.abs(Math.sin(t*80))*.08:t<.42?.05+(t-.23)/.19*.7:t<.8?.75:.05+(1-t)/.2*.7;dice.forEach((d,i)=>{if(held[i])return;const u=Math.max(0,Math.min(1,(t-.4-i*.012)/.5));d.visible=t>=.4+i*.012;if(!d.visible)return;const end=rest(i);d.position.set(-1.2+(end.x+1.2)*u,.39+(1-u)*.7+Math.abs(Math.sin(u*Math.PI*2.5))*(1-u)*1.35,-1+(end.z+1)*u);const endQ=targetQ(next[i]);if(u<.72)d.rotation.set(u*12+i,u*8+i*.3,u*10);else{const from=new T.Quaternion().setFromEuler(new T.Euler(.72*12+i,.72*8+i*.3,.72*10));d.quaternion.slerpQuaternions(from,endQ,Math.min(1,(u-.72)/.28))}if(u===1){d.position.copy(end);d.quaternion.copy(endQ)}});draw();if(t<1)frame=requestAnimationFrame(tick);else{rolling=false;sync(next,held);resolveRoll=null;resolve()}}frame=requestAnimationFrame(tick)})}
 resize();sync(values,holds);
 return {sync,roll,attach(el){host=el;host.append(renderer.domElement);observer.disconnect();observer.observe(host);resize()},dispose(){disposed=true;cancelAnimationFrame(frame);resolveRoll?.();observer.disconnect();renderer.domElement.removeEventListener('click',click);scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()});textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss()}};
}
