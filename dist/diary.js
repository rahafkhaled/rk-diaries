// photos: {label} renders a placeholder frame; add src:'assets/your-pic.jpg' to show a real photo.
const entries=[
{section:'DEAR DIARY',date:'25 SEPT 2026',title:'Dear diary,',burst:'her first<br>page!',sticker:'camera',photos:[{label:'a pic that feels like u',shape:'wide'}],body:`<p>I wanted a little corner of the internet that felt like me.</p><p>Somewhere for work days, side projects, cleaning resets, and the ordinary bits in between.</p><p>So here it is. A place for all of it, even when it doesn’t quite fit into one category.</p><p>Consider this the first page.</p><p class="signoff">Rahaf ♡</p><a href="https://www.tiktok.com/@rka_diaries" target="_blank" rel="noopener noreferrer">The video version lives here ↗</a><br><a href="https://www.instagram.com/rka_diaries/" target="_blank" rel="noopener noreferrer">Photos on Instagram ↗</a>`},
{section:'EXCLUSIVE',date:'PROJECT NOTES',title:'Too many tabs open.',burst:'4 projects<br>1 girl',sticker:'phone',photos:[{label:'QCapsule'},{label:'RK Techhub'},{label:'DaClimb'}],body:`<p>There’s my work in emerging tech. Then there are all the things I want to build outside of it.</p><p>QCapsule. RK Techhub. DaClimb. And this little diary.</p><p>Different projects, different parts of me. I’m trying to give each one its own time instead of trying to work on everything at once.</p><p class="signoff">One thing at a time.<br>In theory.</p>`},
{section:'LIFESTYLE',date:'EVERYDAY NOTES',title:'The little resets.',burst:'reset<br>mode: on',sticker:'butterfly',photos:[{label:'ur reset / clean space pic',shape:'tall'}],body:`<p>This page is for the quieter things.</p><p>Getting organised. Cleaning my space. Making room for the week ahead.</p><p>I want the everyday parts to have a place here too. The bits that don’t need a big announcement.</p><p class="signoff">A little reset ♡</p>`},
{section:'THE WEEK',date:'ROUTINE NOTES',title:'One day, one theme.',burst:'which day<br>are u?',sticker:'cd',photos:[],body:`<p>A home for each of the things I want to make time for.</p><div class="week"><div><b>SUN</b>QCapsule</div><div><b>MON</b>RK Techhub</div><div><b>TUE</b>DaClimb</div><div><b>WED</b>RK Diaries</div><div><b>THU</b>Messages & catching up</div><div><b>FRI</b>Cleaning</div><div><b>SAT</b>Food, fitness & family</div></div><p class="small-note">The idea: fewer decisions about what to work on next.</p>`}
];
const $=id=>document.getElementById(id);

const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let book, current=1, saved=null, locked=false, zoomed=false, diaryLocked=true, unlocking=false;
// Where the key's tip sits inside assets/key.webp, as fractions of its width/height.
const KEY_TIP={x:.01,y:.46},KEY_INSERT=.3;
try{const value=localStorage.getItem('rk-diary-sheet');if(value!==null&&Number.isInteger(Number(value))&&Number(value)>0&&Number(value)<7)saved=Number(value);else{const old=localStorage.getItem('rk-diary-bookmark');if(old!==null&&Number.isInteger(Number(old))&&Number(old)>=0&&Number(old)<4)saved=Number(old)+2}}catch{}
function pagesHTML(){
 const sticker=(name,cls='')=>`<img class="sticker ${cls}" src="assets/sticker-${name}.webp" alt="" aria-hidden="true">`;
 const burst=(html,cls='')=>`<span class="burst ${cls}" aria-hidden="true"><span>${html}</span></span>`;
 const footer=n=>`<div class="page-footer"><span>RK DIARIES ✦ VOL. 01</span><span>${n}</span></div>`;
 const cover=`<article class="page cover-page mag-cover" data-density="hard" aria-label="RK Diaries magazine cover"><div class="page-content cover-content"><div class="cover-art"><img class="cover-photo" src="assets/rahaf-night-out.png" alt="Rahaf in a silver hijab and rhinestone jeans at a party"><div class="cover-strip"><span>VOL. 01</span><span>✦ THE CHAOS ISSUE ✦</span><span>SEPT 2026</span></div><h1 class="masthead">RK<span>diaries</span></h1><div class="coverlines cl-left"><p class="cl cl-big">welcome<br>to the<em>chaos!</em></p><p class="cl"><b>too many tabs</b>4 side projects &amp; 1 diary</p><p class="cl"><b>little resets</b>that keep her sane</p></div><div class="coverlines cl-right"><p class="cl"><b>quiz!</b>which day of her week are u?</p><p class="cl"><b>doha</b>work, life &amp; a lot going on</p></div>${burst('free<br>stickers<br>inside!','cover-burst')}${sticker('disco','cover-disco')}${sticker('star','cover-star')}<div class="cover-bottom"><button class="open-cover" data-open>open the issue ↗</button><span class="barcode" aria-hidden="true"></span></div></div></div></article>`;
 const collage=['purse-sparkle','lipstick','palette','purse-black','heel','platform'].map(name=>sticker(name,`s-${name}`)).join('');
 const contents=`<article class="page chaos-page" aria-label="Welcome to the chaos"><div class="page-content"><div class="page-header"><span class="section-tag">IN THIS ISSUE</span><span>THE INSIDE COVER</span></div><div class="chaos"><figure class="chaos-photo"><img src="assets/rahaf-night-out.png" alt="Rahaf in a silver hijab, white top, and rhinestone jeans at a party"></figure>${collage}<p class="chaos-title">welcome<span>to the chaos</span></p><p class="chaos-note">this diary belongs to <b>Rahaf</b> ♡</p></div>${footer('01')}</div></article>`;
 const photo=p=>`<figure class="snap snap-${p.shape||'square'}${p.src?'':' is-placeholder'}">${p.src?`<img src="${p.src}" alt="${p.alt||p.label}">`:`<div class="ph"><span class="ph-icon" aria-hidden="true">✦</span><span>photo here</span></div>`}<figcaption>${p.label}</figcaption></figure>`;
 const inside=entries.map((e,i)=>`<article class="page entry-page entry-${i}" aria-label="${e.title}"><div class="page-content"><div class="page-header"><span class="section-tag">${e.section}</span><span>${e.date}</span></div><h2>${e.title}</h2>${e.photos.length?`<div class="snaps snaps-${e.photos.length}">${e.photos.map(photo).join('')}</div>`:''}<div class="entry-copy">${e.body}</div>${burst(e.burst)}${sticker(e.sticker,'page-sticker')}${footer('0'+(i+2))}</div></article>`).join('');
 const end=`<article class="page ending-page" aria-label="Until next time"><div class="page-content ending"><div class="page-header"><span class="section-tag">NEXT ISSUE</span><span>COMING SOON</span></div><h2>To be<em>continued…</em></h2>${photo({label:'sneak peek of what’s next',shape:'wide'})}<div class="entry-copy"><p>The everyday bits keep going.</p><div class="pill-links"><a class="pill" href="https://www.tiktok.com/@rka_diaries" target="_blank" rel="noopener noreferrer">watch the video diaries ↗</a><a class="pill" href="https://www.instagram.com/rka_diaries/" target="_blank" rel="noopener noreferrer">follow on instagram ↗</a></div><p class="signoff">Rahaf ♡</p></div>${burst('stay<br>tuned!','end-burst')}${sticker('star','end-star')}${footer('06')}</div></article>`;
 const back=`<article class="page cover-page back-cover" data-density="hard" aria-label="Back cover"><div class="page-content cover-content">${sticker('disco','back-disco')}<p class="masthead">RK<span>diaries</span></p><p class="back-line">see u next issue ♡</p><button class="open-cover" data-page="0">back to the cover ↗</button><span class="barcode" aria-hidden="true"></span></div></article>`;
 return cover+contents+inside+end+back;
}
function visiblePages(){const landscape=book.getOrientation()==='landscape';return current===0||current===7||!landscape?[current]:[current,current+1]}
function updateUI(){
 current=book.getCurrentPageIndex();const visible=visiblePages();
 $('stage').classList.toggle('is-front',current===0);$('stage').classList.toggle('is-back',current===7);$('stage').classList.toggle('portrait',book.getOrientation()==='portrait');
 $('prev').disabled=current===0;$('next').disabled=current===7;
 $('next').querySelector('span').textContent=current===0?'open diary':'next';$('next').setAttribute('aria-label',current===0?'Open diary':'Next page');
 $('position').textContent=current===0?'THE COVER':current===7?'THE END':visible.map(x=>String(x).padStart(2,'0')).join(' – ')+' / 06';
 $('close').hidden=current===0;$('bookmark').hidden=current===0||current===7;
 const isSaved=saved!==null&&visible.includes(saved);$('bookmark').textContent=isSaved?'♥ page saved':'♡ save page';$('bookmark').setAttribute('aria-pressed',String(isSaved));
 $('bookmark').setAttribute('aria-label',isSaved?'Remove bookmark':'Bookmark this page');$('return-saved').hidden=saved===null||isSaved;
 $('helper').textContent=current===0?(diaryLocked?'This diary is locked… click the key to open it ♡':'Click to open. Then drag a corner to turn the page.'):current===7?'That’s the last page. Head back whenever you like.':'Drag a corner, swipe, or use the arrows to turn a page.';
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
function goTo(index){if(diaryLocked){if(index!==0)unlock(()=>goTo(index));return}if(locked||index<0||index>7)return;if(reducedQuery.matches)book.turnToPage(index);else book.flip(index,'bottom')}
function next(){if(diaryLocked){unlock(next);return}if(current>=7||locked)return;if(reducedQuery.matches)book.turnToNextPage();else book.flipNext('bottom')}
function previous(){if(current===0||locked)return;if(reducedQuery.matches)book.turnToPrevPage();else book.flipPrev('bottom')}
function createBook(start=0){
 const root=$('book');root.innerHTML=pagesHTML();
 book=new St.PageFlip(root,{width:480,height:680,size:'stretch',minWidth:150,maxWidth:480,minHeight:100,maxHeight:680,showCover:true,startPage:start,usePortrait:false,autoSize:true,drawShadow:true,maxShadowOpacity:.36,flippingTime:1000,mobileScrollSupport:true,useMouseEvents:true,clickEventForward:true,showPageCorners:!reducedQuery.matches,disableFlipByClick:false,swipeDistance:40});
 book.on('flip',event=>{if(diaryLocked&&event.data!==0)finishUnlock();updateUI()});book.on('changeOrientation',()=>{requestAnimationFrame(updateUI)});book.on('changeState',event=>{locked=event.data==='flipping'||event.data==='user_fold';$('stage').classList.toggle('turning',locked)});
 book.loadFromHTML(root.querySelectorAll('.page'));root.append(lockStrap,hangingLock,lockStaple);updateUI();
 root.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.page))));root.querySelector('[data-open]').addEventListener('click',next);
}
$('key').addEventListener('click',()=>unlock(next));$('lock-shield').addEventListener('click',nudgeLock);
$('next').addEventListener('click',next);$('prev').addEventListener('click',previous);$('close').addEventListener('click',()=>goTo(0));$('return-saved').addEventListener('click',()=>{if(saved!==null)goTo(saved)});
document.querySelectorAll('.chapters [data-page]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.page))));
$('bookmark').addEventListener('click',()=>{saved=saved!==null&&visiblePages().includes(saved)?null:current;try{if(saved===null){localStorage.removeItem('rk-diary-sheet');localStorage.removeItem('rk-diary-bookmark')}else localStorage.setItem('rk-diary-sheet',String(saved))}catch{}updateUI()});
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowRight'){event.preventDefault();next()}if(event.key==='ArrowLeft'){event.preventDefault();previous()}});
function fitBook(){const stage=$('stage');const scale=zoomed?1:Math.min(1,stage.clientWidth/960);stage.style.setProperty('--book-scale',scale);stage.style.setProperty('--page-scale',scale);stage.style.setProperty('--reading-width',Math.min(480,stage.clientWidth)+'px');stage.style.height=(680*scale+12)+'px';stage.classList.toggle('zoomed',zoomed);$('zoom').textContent=zoomed?'Fit both pages':'Enlarge book';$('zoom').setAttribute('aria-pressed',String(zoomed));$('zoom').hidden=stage.clientWidth>=960;$('read-left').hidden=!zoomed;$('read-right').hidden=!zoomed;if(book)book.update();}
$('zoom').addEventListener('click',()=>{zoomed=!zoomed;fitBook();$('stage').scrollLeft=0});
$('read-left').addEventListener('click',()=>$('stage').scrollTo({left:0,behavior:reducedQuery.matches?'instant':'smooth'}));
$('read-right').addEventListener('click',()=>$('stage').scrollTo({left:480,behavior:reducedQuery.matches?'instant':'smooth'}));
window.addEventListener('resize',fitBook);
createBook();
fitBook();
setTimeout(()=>kickSwing(70),900);
