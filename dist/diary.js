const $=id=>document.getElementById(id);

const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let book, current=1, saved=null, locked=false, zoomed=false, diaryLocked=true, unlocking=false;
// Where the key's tip sits inside assets/key.webp, as fractions of its width/height.
const KEY_TIP={x:.01,y:.46},KEY_INSERT=.3;
try{const route=localStorage.getItem('rk-diary-route');const page=routePage(route);if(page>0&&page<BACK_PAGE)saved=page}catch{}

function visiblePages(){const landscape=book.getOrientation()==='landscape';return current===0||current===BACK_PAGE||!landscape?[current]:[current,current+1]}
function updateUI(){
 current=book.getCurrentPageIndex();const visible=visiblePages();
 $('stage').classList.toggle('is-front',current===0);$('stage').classList.toggle('is-back',current===BACK_PAGE);$('stage').classList.toggle('portrait',book.getOrientation()==='portrait');
 $('prev').disabled=current===0;$('next').disabled=current===BACK_PAGE;
 $('next').querySelector('span').textContent=current===0?'open diary':'next';$('next').setAttribute('aria-label',current===0?'Open diary':'Next page');
 $('position').textContent=current===0?'THE COVER':current===BACK_PAGE?'THE END':visible.map(x=>String(x).padStart(2,'0')).join(' – ')+' / '+String(BACK_PAGE-1).padStart(2,'0');
 $('close').hidden=current===0;$('bookmark').hidden=current===0||current===BACK_PAGE;
 const isSaved=saved!==null&&visible.includes(saved);$('bookmark').textContent=isSaved?'♥ page saved':'♡ save page';$('bookmark').setAttribute('aria-pressed',String(isSaved));
 $('bookmark').setAttribute('aria-label',isSaved?'Remove bookmark':'Bookmark this page');$('return-saved').hidden=saved===null||isSaved;
 $('helper').textContent=current===0?(diaryLocked?'This diary is locked… click the key to open it ♡':'Click to open. Then drag a corner to turn the page.'):current===BACK_PAGE?'That’s the last page. Head back whenever you like.':'Drag a corner, swipe, or use the arrows to turn a page.';
 document.querySelectorAll('.chapters [data-page]').forEach(button=>{const active=visible.includes(Number(button.dataset.page));button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
 [...document.querySelectorAll('#book .page')].forEach((page,i)=>{const active=visible.includes(i);page.setAttribute('aria-hidden',String(!active));page.inert=!active});
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Hanging lock as a damped pendulum (angle in degrees, velocity in deg/s).
const swing=document.querySelector('.lock-swing'),lockStrap=$('lock-strap'),hangingLock=$('hanging-lock'),lockStaple=$('lock-staple');
let swingAngle=0,swingVel=0,swingLast=0,swingRAF=0,swingHold=false;
function stepSwing(t){
 const dt=swingLast?Math.min(.034,(t-swingLast)/1000):.016;swingLast=t;
 const rest=swingHold?0:Math.sin(t/1100)*1.4+Math.sin(t/430)*.35;
 const stiffness=swingHold?90:42,damping=swingHold?14:1.6;
 swingVel+=(-stiffness*(swingAngle-rest)-damping*swingVel)*dt;
 swingAngle+=swingVel*dt;
 swing.style.transform=`rotate(${swingAngle.toFixed(2)}deg)`;
 if(window.rkKey)rkKey.lockAngle=swingAngle;
 swingRAF=diaryLocked||unlocking?requestAnimationFrame(stepSwing):0;
}
function kickSwing(v){
 if(reducedQuery.matches)return;
 swingVel=Math.max(-220,Math.min(220,swingVel+v));
 if(!swingRAF){swingLast=0;swingRAF=requestAnimationFrame(stepSwing)}
}
// Key charms: two damped pendulums that clink when they cross.
const key3d=document.querySelector('.key-3d');
key3d.innerHTML='<img class="key-fallback" src="assets/key-3d.webp" alt="">';
const charms=[0,1].map(i=>({a:0,v:0,k:i?52:34,d:i?1.6:1.3}));
// Shared with key3d.js, which renders the three.js key from this state.
window.rkKey={charms,tilt:{x:0,y:0},flying:false,turn:0,ready:false};
let charmRAF=0,charmLast=0,audio=null;
function clink(gain=1){
 if(!audio||audio.state!=='running')return;
 const t=audio.currentTime,out=audio.createGain(),base=4300+Math.random()*1300;
 out.gain.value=.045*gain;out.connect(audio.destination);
 [1,1.49,2.21,2.93].forEach((m,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=base*m;g.gain.setValueAtTime(1/(i+1),t);g.gain.exponentialRampToValueAtTime(.0001,t+.32/(1+i*.6));o.connect(g).connect(out);o.start(t);o.stop(t+.45)});
}
function stepCharms(t){
 const dt=charmLast?Math.min(.034,(t-charmLast)/1000):.016;charmLast=t;
 const before=charms[0].a-charms[1].a;let moving=false;
 charms.forEach(c=>{c.v+=(-c.k*c.a-c.d*c.v)*dt;c.a+=c.v*dt;if(Math.abs(c.v)>3||Math.abs(c.a)>.4)moving=true});
 const after=charms[0].a-charms[1].a;
 if(Math.sign(after)!==Math.sign(before)&&Math.abs(charms[0].v-charms[1].v)>70)clink(Math.min(1,Math.abs(charms[0].v-charms[1].v)/300));
 if(moving)charmRAF=requestAnimationFrame(stepCharms);else{charmRAF=0;charmLast=0}
}
function shakeCharms(amount){charms.forEach((c,i)=>{c.v=Math.max(-320,Math.min(320,c.v+amount*(i?-.8:1)))});if(!charmRAF&&!reducedQuery.matches)charmRAF=requestAnimationFrame(stepCharms)}
function jingle(strength=1){
 if(reducedQuery.matches)return;
 shakeCharms((150+Math.random()*90)*strength*(Math.random()<.5?-1:1));
 clink(strength);setTimeout(()=>clink(.55*strength),80+Math.random()*70);
}
['pointerdown','keydown'].forEach(type=>addEventListener(type,()=>{try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();audio.resume()}catch{}},{once:true,capture:true}));
{
 const key=$('key');
 key.addEventListener('pointerenter',()=>jingle(1));
 key.addEventListener('pointermove',event=>{
  if(unlocking)return;
  const r=key.getBoundingClientRect(),nx=(event.clientX-r.left)/r.width-.5,ny=(event.clientY-r.top)/r.height-.5;
  rkKey.tilt={x:-ny*30,y:nx*50};
  if(event.movementX)shakeCharms(event.movementX*3);
 });
 key.addEventListener('pointerleave',()=>{rkKey.tilt={x:0,y:0};shakeCharms(60)});
}
let lastScroll=scrollY;
window.addEventListener('pointermove',event=>{
 if(!diaryLocked||unlocking||!event.movementX)return;
 const r=swing.getBoundingClientRect(),cx=r.left+r.width*.4,cy=r.top+r.height*.6;
 if(Math.hypot(event.clientX-cx,event.clientY-cy)<Math.max(90,r.width*.9))kickSwing(-event.movementX*2.6);
},{passive:true});
window.addEventListener('scroll',()=>{const dy=scrollY-lastScroll;lastScroll=scrollY;if(diaryLocked)kickSwing(Math.max(-60,Math.min(60,dy*.8)))},{passive:true});
function finishUnlock(){diaryLocked=false;unlocking=false;$('stage').classList.add('unlocked');$('key').hidden=true;$('lock-shield').hidden=true;updateUI()}
async function unlock(after){
 if(!diaryLocked){if(after)after();return}
 if(unlocking)return;
 unlocking=true;
 const key=$('key'),img=key.querySelector('.key-body'),lock=$('hanging-lock'),strap=$('lock-strap'),hole=lock.querySelector('.keyhole');
 if(reducedQuery.matches||!hole||current!==0||!img.animate){finishUnlock();if(after)after();return}
 key.classList.add('is-flying');rkKey.flying=true;
 swingHold=true;kickSwing(0);jingle(1.2);
 const tilt=swing.style.transform;swing.style.transform='none';
 const k=img.getBoundingClientRect(),h=hole.getBoundingClientRect();
 swing.style.transform=tilt;
 const dx=h.left+h.width/2-(k.left+k.width*KEY_TIP.x),dy=h.top+h.height*.5-(k.top+k.height*KEY_TIP.y);
 const scale=Math.max(.2,Math.min(.6,h.width*5.5/k.width));
 const atHole=`translate(${dx}px,${dy}px) scale(${scale})`,push=k.width*KEY_INSERT*scale;
 const inHole=`translate(${dx-push}px,${dy}px) scale(${scale})`,hidden=`inset(-60% -40% -160% ${(KEY_TIP.x+KEY_INSERT)*100}%)`;
 await img.animate([{transform:'none'},{transform:`translate(${dx*.5}px,${dy*.5-70}px) scale(${(1+scale)/2}) rotate(-14deg)`,offset:.55},{transform:atHole}],{duration:800,easing:'cubic-bezier(.45,0,.3,1)',fill:'forwards'}).finished;
 await img.animate([{transform:atHole,clipPath:`inset(-60% -40% -160% ${KEY_TIP.x*100}%)`},{transform:inHole,clipPath:hidden}],{duration:260,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'}).finished;
 jingle(.5);
 if(rkKey.ready)await new Promise(done=>{const t0=performance.now(),step=t=>{const p=Math.min(1,(t-t0)/340);rkKey.turn=p<.5?2*p*p:1-(-2*p+2)**2/2;if(p<1)requestAnimationFrame(step);else done()};requestAnimationFrame(step)});
 else await img.animate([{transform:inHole,clipPath:hidden},{transform:`${inHole} perspective(260px) rotateX(75deg)`,clipPath:hidden}],{duration:340,easing:'ease-in-out',fill:'forwards'}).finished;
 jingle(.8);
 lock.classList.add('is-open');
 $('stage').classList.add('revealing');
 swingHold=false;kickSwing(-90);
 await wait(500);
 lock.classList.add('is-dropping');
 strap.classList.add('is-dropping');lockStaple.classList.add('is-dropping');
 img.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'});
 await wait(650);
 finishUnlock();
 if(after)after();
}
function nudgeLock(){
 const key=$('key');
 key.classList.remove('is-nudged');void key.offsetWidth;key.classList.add('is-nudged');
 kickSwing(swingVel>0?-160:160);
}
function goTo(index){if(diaryLocked){if(index!==0)unlock(()=>goTo(index));return}if(locked||index<0||index>BACK_PAGE)return;if(reducedQuery.matches)book.turnToPage(index);else book.flip(index,'bottom')}
function next(){if(diaryLocked){unlock(next);return}if(current>=BACK_PAGE||locked)return;if(reducedQuery.matches)book.turnToNextPage();else book.flipNext('bottom')}
function previous(){if(current===0||locked)return;if(reducedQuery.matches)book.turnToPrevPage();else book.flipPrev('bottom')}
function createBook(start=0){
 const root=$('book');root.innerHTML=pagesHTML();
 book=new St.PageFlip(root,{width:480,height:680,size:'stretch',minWidth:150,maxWidth:480,minHeight:100,maxHeight:680,showCover:true,startPage:start,usePortrait:false,autoSize:true,drawShadow:true,maxShadowOpacity:.36,flippingTime:1000,mobileScrollSupport:true,useMouseEvents:true,clickEventForward:true,showPageCorners:!reducedQuery.matches,disableFlipByClick:true,swipeDistance:40});
 book.on('flip',event=>{if(diaryLocked&&event.data!==0)finishUnlock();updateUI();history.replaceState(null,'',pageRoute(current))});book.on('changeOrientation',()=>{requestAnimationFrame(updateUI)});book.on('changeState',event=>{locked=event.data==='flipping'||event.data==='user_fold';$('stage').classList.toggle('turning',locked)});
 book.loadFromHTML(root.querySelectorAll('.page'));root.append(lockStrap,hangingLock,lockStaple);updateUI();
 root.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.page))));root.querySelector('[data-open]').addEventListener('click',next);
}
$('key').addEventListener('click',()=>unlock(next));$('lock-shield').addEventListener('click',nudgeLock);
$('next').addEventListener('click',next);$('prev').addEventListener('click',previous);$('close').addEventListener('click',()=>goTo(0));$('return-saved').addEventListener('click',()=>{if(saved!==null)goTo(saved)});
document.querySelectorAll('.chapters [data-page]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.page))));
$('bookmark').addEventListener('click',()=>{saved=saved!==null&&visiblePages().includes(saved)?null:current;try{if(saved===null){localStorage.removeItem('rk-diary-route')}else localStorage.setItem('rk-diary-route',pageRoute(saved))}catch{}updateUI()});
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,select,textarea,[contenteditable]'))return;if(event.key==='ArrowRight'){event.preventDefault();next()}if(event.key==='ArrowLeft'){event.preventDefault();previous()}});
function fitBook(){const stage=$('stage');const scale=zoomed?1:Math.min(1,stage.clientWidth/960);stage.style.setProperty('--book-scale',scale);stage.style.setProperty('--page-scale',scale);stage.style.setProperty('--reading-width',Math.min(480,stage.clientWidth)+'px');stage.style.height=(680*scale+12)+'px';stage.classList.toggle('zoomed',zoomed);$('zoom').textContent=zoomed?'Fit both pages':'Enlarge book';$('zoom').setAttribute('aria-pressed',String(zoomed));$('zoom').hidden=stage.clientWidth>=960;$('read-left').hidden=!zoomed;$('read-right').hidden=!zoomed;if(book)book.update();}
$('zoom').addEventListener('click',()=>{zoomed=!zoomed;fitBook();$('stage').scrollLeft=0});
$('read-left').addEventListener('click',()=>$('stage').scrollTo({left:0,behavior:reducedQuery.matches?'instant':'smooth'}));
$('read-right').addEventListener('click',()=>$('stage').scrollTo({left:480,behavior:reducedQuery.matches?'instant':'smooth'}));
window.addEventListener('resize',fitBook);
document.querySelectorAll('[data-section]').forEach(button=>{button.dataset.page=String(routePage('#'+button.dataset.section));button.addEventListener('click',()=>goTo(Number(button.dataset.page)))});
const initialRoute=location.hash;
createBook();
fitBook();
function openRoute(){const target=routePage(location.hash);if(target!==null){if(diaryLocked)finishUnlock();goTo(target)}}
if(initialRoute&&routePage(initialRoute)!==null){finishUnlock();book.turnToPage(routePage(initialRoute))}
window.addEventListener('hashchange',openRoute);
document.addEventListener('click',async event=>{
 const share=event.target.closest('[data-share]');
 if(share){try{await navigator.clipboard.writeText(new URL('#entry/'+share.dataset.share,location.href).href);share.textContent='Link copied ✓'}catch{share.textContent='Copy the link from your address bar'}return}
 if(event.target.closest('#reset-archive')){for(const id of ['archive-search','archive-topic','archive-month'])$(id).value='';filterArchive();return}
 const link=event.target.closest('a[href^="#"]');
 if(link&&routePage(link.hash)!==null){event.preventDefault();if(locked)return;history.pushState(null,'',link.hash);goTo(routePage(link.hash))}
});
$('archive-search').addEventListener('input',filterArchive);
$('archive-topic').addEventListener('change',filterArchive);
$('archive-month').addEventListener('change',filterArchive);
setTimeout(()=>kickSwing(70),900);
