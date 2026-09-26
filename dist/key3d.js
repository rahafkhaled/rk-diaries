import * as THREE from 'three';
import {RoomEnvironment} from './vendor/three/RoomEnvironment.min.js';

// Each canvas maps world units onto its host box (w×h, origin top-left, y up) and overflows it by pad,
// so diary.js can keep aiming at fixed points in the box (KEY_TIP, .keyhole) while things spin or swing past its edges.
const state=window.rkKey,reduced=matchMedia('(prefers-reduced-motion: reduce)');
const V2=(x,y)=>new THREE.Vector2(x,y);
const heartPts=(s,dy=0,sx=1)=>Array.from({length:96},(_,i)=>{const t=i/96*Math.PI*2;return V2(16*Math.sin(t)**3/17*s*sx,((13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17+.15)*s+dy)});
const extrude=(shape,depth,bevel,segments=5)=>{const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:segments,curveSegments:32});g.center();return g};
const pill=(w,h)=>{const r=w/2,s=new THREE.Shape();s.moveTo(-r,h/2-r);s.absarc(0,h/2-r,r,Math.PI,0,true);s.lineTo(r,-h/2+r);s.absarc(0,-h/2+r,r,0,Math.PI,true);s.closePath();return s};

function view(host,cls,w,h,pad){
 const canvas=document.createElement('canvas');canvas.className=cls;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
 const scene=new THREE.Scene();
 scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
 scene.environmentIntensity=.8;
 const rim=new THREE.DirectionalLight(0xffb8f0,2.2);rim.position.set(-4,3,-2);scene.add(rim);
 const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(3,5,6);scene.add(sun);
 const x0=-pad.l*w,x1=(1+pad.r)*w,yT=pad.t*h,yB=-(1+pad.b)*h,dist=40;
 const camera=new THREE.PerspectiveCamera(2*Math.atan((yT-yB)/2/dist)*180/Math.PI,(x1-x0)/(yT-yB),1,100);
 camera.position.set((x0+x1)/2,(yT+yB)/2,dist);
 Object.assign(canvas.style,{left:-pad.l*100+'%',top:-pad.t*100+'%',width:(1+pad.l+pad.r)*100+'%',height:(1+pad.t+pad.b)*100+'%'});
 host.append(canvas);
 const resize=()=>{if(canvas.clientWidth)renderer.setSize(canvas.clientWidth,canvas.clientHeight,false)};
 new ResizeObserver(resize).observe(host);resize();
 return {renderer,scene,camera};
}

function materials(){
 return {
  chrome:new THREE.MeshPhysicalMaterial({color:0xc4bcd8,metalness:1,roughness:.22,clearcoat:1,clearcoatRoughness:.08}),
  lilac:new THREE.MeshPhysicalMaterial({color:0x9f88cc,metalness:.9,roughness:.28,clearcoat:1,clearcoatRoughness:.12,iridescence:.35,iridescenceIOR:1.3}),
  holo:new THREE.MeshPhysicalMaterial({color:0xffd9f7,metalness:1,roughness:.12,clearcoat:1,iridescence:1,iridescenceIOR:1.8,iridescenceThicknessRange:[250,900]}),
  mirror:new THREE.MeshStandardMaterial({vertexColors:true,metalness:1,roughness:.05,flatShading:true}),
  ink:new THREE.MeshPhysicalMaterial({color:0x1b1026,metalness:.2,roughness:.35,clearcoat:1}),
 };
}

function discoBall(r){
 const g=new THREE.SphereGeometry(r,20,14).toNonIndexed(),p=g.attributes.position,colors=[];
 const tones=[0xffffff,0xe6dcff,0xffd0f2,0xb9aee0,0x8f84b8].map(c=>new THREE.Color(c));
 for(let i=0;i<p.count;i+=3){
  const cx=p.getX(i)+p.getX(i+1)+p.getX(i+2),cy=p.getY(i)+p.getY(i+1)+p.getY(i+2),cz=p.getZ(i)+p.getZ(i+1)+p.getZ(i+2);
  const tile=Math.round(Math.atan2(cz,cx)*20/Math.PI)*31+Math.round(cy/r*9)*17;
  const c=tones[Math.abs(tile)%tones.length];for(let k=0;k<3;k++)colors.push(c.r,c.g,c.b);
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 return g;
}

function starShape(R,r){
 const s=new THREE.Shape();
 for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,d=i%2?r:R;i?s.lineTo(Math.cos(a)*d,Math.sin(a)*d):s.moveTo(Math.cos(a)*d,Math.sin(a)*d)}
 return s;
}

function buildKey(host){
 const W=6.4,H=2.16,AXIS=-.46*H;
 const {renderer,scene,camera}=view(host,'key-canvas',W,H,{l:.08,r:.08,t:.35,b:1.1});
 const m=materials();
 // Pivot sits on the shaft axis at the key's middle so it spins about itself and turns about the shaft.
 const pivot=new THREE.Group();pivot.position.set(W/2,AXIS,0);scene.add(pivot);
 const at=(obj,x,y=0,z=0)=>{obj.position.set(x-W/2,y,z);pivot.add(obj);return obj};

 const BOW=5.36;
 const bow=new THREE.Shape(heartPts(1.02));bow.holes.push(new THREE.Path(heartPts(.5,.08)));
 at(new THREE.Mesh(extrude(bow,.24,.17),m.lilac),BOW).rotation.z=-Math.PI/2;
 const shaft=at(new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,4.2,32),m.chrome),2.3);shaft.rotation.z=Math.PI/2;
 [[4.18,.3,.16],[4.42,.26,.14],[1.55,.24,.12]].forEach(([x,r,l])=>{const c=at(new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,32),m.chrome),x);c.rotation.z=Math.PI/2});
 at(new THREE.Mesh(new THREE.SphereGeometry(.19,24,16),m.chrome),.2).scale.x=.6;
 const bitGeo=new THREE.ExtrudeGeometry(new THREE.Shape([[.06,.1],[1.35,.1],[1.35,-.62],[1.02,-.62],[1.02,-.4],[.8,-.4],[.8,-.62],[.42,-.62],[.42,-.46],[.06,-.46]].map(([x,y])=>V2(x,y))),{depth:.18,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:3});
 bitGeo.translate(0,0,-.09);at(new THREE.Mesh(bitGeo,m.chrome),0);

 // Split ring threads through the bow's hole and round its lower rim; chains hang from its bottom.
 const RING={x:BOW+.32,y:-.78,r:.44};
 const ring=at(new THREE.Mesh(new THREE.TorusGeometry(RING.r,.045,14,72),m.chrome),RING.x,RING.y);ring.rotation.set(.25,.8,0);
 const linkGeo=new THREE.TorusGeometry(.065,.019,10,24);linkGeo.scale(1,1.5,1);
 const chain=(g,n)=>{for(let i=0;i<n;i++){const l=new THREE.Mesh(linkGeo,m.chrome);l.position.y=-.09-i*.15;l.rotation.y=i%2?Math.PI/2:0;g.add(l)}return -.09-(n-1)*.15-.1};
 const hang=(n,z)=>{const g=new THREE.Group();at(g,RING.x,RING.y-RING.r,z);return {g,end:chain(g,n)}};

 const star=hang(5,-.07);
 const starMesh=new THREE.Mesh(extrude(starShape(.46,.2),.12,.07,4),m.holo);
 starMesh.position.y=star.end-.48;star.g.add(starMesh);

 const disco=hang(2,.08);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,.08,16),m.chrome);cap.position.y=disco.end-.04;disco.g.add(cap);
 const ball=new THREE.Mesh(discoBall(.36),m.mirror);ball.position.y=disco.end-.43;disco.g.add(ball);

 host.classList.add('is-3d');state.ready=true;
 const charms=[star.g,disco.g],rest=[-.3,.34];
 let rx=0,ry=0,bob=0,last=0;
 renderer.setAnimationLoop(t=>{
  if(host.closest('[hidden]'))return;
  const dt=last?Math.min(.05,(t-last)/1000):.016;last=t;
  const still=state.flying||reduced.matches,s=t/1000;
  const tx=(still?0:Math.sin(s*1.35)*.2)+state.tilt.x*Math.PI/180+state.turn*Math.PI*.45;
  const ty=(still?0:Math.sin(s*.68)*.42)+state.tilt.y*Math.PI/180;
  const ease=state.flying?.25:.08;
  rx+=(tx-rx)*(state.turn?1:ease);ry+=(ty-ry)*ease;bob+=((still?0:Math.sin(s*1.35)*.07)-bob)*ease;
  pivot.rotation.set(rx,ry,0);pivot.position.y=AXIS+bob;
  state.charms.forEach((c,i)=>{charms[i].rotation.set(c.v*.0012,0,rest[i]-c.a*Math.PI/180)});
  if(!reduced.matches){ball.rotation.y+=dt*1.1;starMesh.rotation.y=Math.sin(s*.9)*.5}
  renderer.render(scene,camera);
 });
}

function buildLock(host){
 const W=3.63,H=4,CX=.39*W,HOLE=-.67*H;
 const {renderer,scene,camera}=view(host,'lock-canvas',W,H,{l:.1,r:.1,t:.1,b:.1});
 const m=materials();
 const lock=new THREE.Group();lock.position.x=CX;scene.add(lock);

 const body=new THREE.Mesh(extrude(new THREE.Shape(heartPts(1.35,0,.93)),.3,.15),m.lilac.clone());body.material.color.set(0x8a73bd);
 body.position.y=-2.72;lock.add(body);
 const plate=new THREE.Mesh(extrude(pill(.4,.72),.05,.03,3),m.chrome);plate.position.set(0,HOLE,.34);lock.add(plate);
 const hole=new THREE.Shape();hole.absarc(0,.1,.08,-Math.PI/4,Math.PI*1.25,false);hole.lineTo(-.045,-.2);hole.lineTo(.045,-.2);hole.closePath();
 const slot=new THREE.Mesh(new THREE.ExtrudeGeometry(hole,{depth:.02,bevelEnabled:false,curveSegments:24}),m.ink);slot.position.set(0,HOLE,.4);lock.add(slot);

 // Shackle hinges on its right leg: it lifts, then swings out about that leg when unlocked.
 const LEG=.62,TUBE=.08,ARCH=-.92;
 const shackle=new THREE.Group();shackle.position.x=LEG;lock.add(shackle);
 const arch=new THREE.Mesh(new THREE.TorusGeometry(LEG,TUBE,20,64,Math.PI),m.chrome);arch.position.set(-LEG,ARCH,0);shackle.add(arch);
 [-2*LEG,0].forEach(x=>{const leg=new THREE.Mesh(new THREE.CylinderGeometry(TUBE,TUBE,1.05,24),m.chrome);leg.position.set(x,ARCH-.52,0);shackle.add(leg)});

 host.classList.add('is-3d');
 const hanging=host.closest('.hanging-lock');
 let open=0,yaw=0;
 renderer.setAnimationLoop(t=>{
  if(!hanging.offsetParent)return;
  open+=((hanging.classList.contains('is-open')?1:0)-open)*.16;
  shackle.position.y=Math.min(1,open*2)*.3;
  shackle.rotation.y=-Math.max(0,open*1.6-.6)*Math.PI*.9;
  yaw+=((reduced.matches?0:(state.lockAngle||0)*.035+Math.sin(t/1700)*.12)-yaw)*.1;
  lock.rotation.y=yaw;
  renderer.render(scene,camera);
 });
}

const keyHost=document.querySelector('.key-3d'),lockHost=document.querySelector('.lock-swing');
if(state){
 try{if(keyHost)buildKey(keyHost)}catch(e){console.warn('3D key unavailable',e)}
 try{if(lockHost)buildLock(lockHost)}catch(e){console.warn('3D lock unavailable',e)}
}
