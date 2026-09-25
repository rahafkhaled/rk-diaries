const entries=[
{date:'25 SEPTEMBER 2026 · FIRST PAGE',title:'Dear diary,',body:`<p>I wanted a little corner of the internet that felt like me.</p><p>Somewhere for work days, side projects, cleaning resets, and the ordinary bits in between.</p><p>So here it is. A place for all of it, even when it doesn’t quite fit into one category.</p><p>Consider this the first page.</p><p class="signoff">Rahaf ♡</p><a href="https://www.tiktok.com/@rka_diaries" target="_blank" rel="noopener noreferrer">The video version lives here ↗</a><br><a href="https://www.instagram.com/rka_diaries/" target="_blank" rel="noopener noreferrer">Photos on Instagram ↗</a>`},
{date:'PROJECT NOTES · PAGE 02',title:'Too many tabs open.',body:`<p>There’s my work in emerging tech. Then there are all the things I want to build outside of it.</p><p>QCapsule. RK Techhub. DaClimb. And this little diary.</p><p>Different projects, different parts of me. I’m trying to give each one its own time instead of trying to work on everything at once.</p><p class="signoff">One thing at a time.<br>In theory.</p>`},
{date:'EVERYDAY NOTES · PAGE 03',title:'The little resets.',body:`<p>This page is for the quieter things.</p><p>Getting organised. Cleaning my space. Making room for the week ahead.</p><p>I want the everyday parts to have a place here too. The bits that don’t need a big announcement.</p><p class="signoff">A little reset ♡</p>`},
{date:'ROUTINE NOTES · PAGE 04',title:'One day, one theme.',body:`<p>A home for each of the things I want to make time for.</p><div class="week"><div><b>SUN</b>QCapsule</div><div><b>MON</b>RK Techhub</div><div><b>TUE</b>DaClimb</div><div><b>WED</b>RK Diaries</div><div><b>THU</b>Messages & catching up</div><div><b>FRI</b>Cleaning</div><div><b>SAT</b>Food, fitness & family</div></div><p class="small-note">The idea: fewer decisions about what to work on next.</p>`}
];
const $=id=>document.getElementById(id);

const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let book, current=1, saved=null, locked=false, zoomed=false;
try{const value=localStorage.getItem('rk-diary-sheet');if(value!==null&&Number.isInteger(Number(value))&&Number(value)>0&&Number(value)<7)saved=Number(value);else{const old=localStorage.getItem('rk-diary-bookmark');if(old!==null&&Number.isInteger(Number(old))&&Number(old)>=0&&Number(old)<4)saved=Number(old)+2}}catch{}
function pagesHTML(){
 const cover=`<article class="page cover-page" data-density="hard" aria-label="Glitter diary cover"><div class="page-content cover-content"><span class="cover-kicker">THE PERSONAL ARCHIVES</span><div class="nameplate"><h1>RK<span>DIARIES</span></h1><span class="heart" aria-hidden="true">★</span></div><button class="open-cover" data-open>open my diary ↗</button></div></article>`;
 const contents=`<article class="page" aria-label="Contents"><div class="page-content"><div class="page-header"><span>THE INSIDE COVER</span><span class="mini-heart" aria-hidden="true">♡</span></div><div class="inscription"><span class="label">THIS DIARY BELONGS TO</span><h2>Rahaf<span>Abutarbush</span></h2><p>a little work, a little life,<br>a lot going on.</p></div><nav class="contents-nav" aria-label="Contents">${entries.map((e,i)=>`<button data-page="${i+2}">${e.title}<span>0${i+2} ↗</span></button>`).join('')}</nav><p class="tiny-note">Make yourself at home ♡</p><div class="page-footer"><span>RK / FIRST EDITION</span><span>01</span></div></div></article>`;
 const inside=entries.map((e,i)=>`<article class="page entry-page" aria-label="${e.title}"><div class="page-content"><div class="page-header"><span>${e.date.split(' · ')[0]}</span><span class="mini-heart" aria-hidden="true">✧</span></div><h2>${e.title}</h2><div class="entry-copy">${e.body}</div><div class="page-footer"><span>DRAFT ENTRY</span><span>0${i+2}</span></div></div></article>`).join('');
 const end=`<article class="page" aria-label="Until next time"><div class="page-content ending"><span class="cover-kicker">THE LAST PAGE, FOR NOW</span><h2>To be<br>continued…</h2><div class="entry-copy"><p>The everyday bits keep going.</p><a class="entry-link" href="https://www.tiktok.com/@rka_diaries" target="_blank" rel="noopener noreferrer">Watch the video diaries ↗</a><br><a class="entry-link" href="https://www.instagram.com/rka_diaries/" target="_blank" rel="noopener noreferrer">Follow on Instagram ↗</a><p class="signoff">Rahaf ♡</p></div><div class="page-footer"><span>RK / FIRST EDITION</span><span>06</span></div></div></article>`;
 const back=`<article class="page cover-page back-cover" data-density="hard" aria-label="Back cover"><div class="page-content cover-content"><div class="nameplate"><h1>rk ♡</h1></div><span class="cover-name">until the next entry</span><button class="open-cover" data-page="0">back to the beginning ↗</button></div></article>`;
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
 $('helper').textContent=current===0?'Click to open. Then drag a corner to turn the page.':current===7?'That’s the last page. Head back whenever you like.':'Drag a corner, swipe, or use the arrows to turn a page.';
 document.querySelectorAll('.chapters [data-page]').forEach(button=>{const active=visible.includes(Number(button.dataset.page));button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
 [...document.querySelectorAll('#book .page')].forEach((page,i)=>{const active=visible.includes(i);page.setAttribute('aria-hidden',String(!active));page.inert=!active});
}
function goTo(index){if(locked||index<0||index>7)return;if(reducedQuery.matches)book.turnToPage(index);else book.flip(index,'bottom')}
function next(){if(current>=7||locked)return;if(reducedQuery.matches)book.turnToNextPage();else book.flipNext('bottom')}
function previous(){if(current===0||locked)return;if(reducedQuery.matches)book.turnToPrevPage();else book.flipPrev('bottom')}
function createBook(start=1){
 const root=$('book');root.innerHTML=pagesHTML();
 book=new St.PageFlip(root,{width:480,height:680,size:'stretch',minWidth:150,maxWidth:480,minHeight:100,maxHeight:680,showCover:true,startPage:start,usePortrait:false,autoSize:true,drawShadow:true,maxShadowOpacity:.36,flippingTime:1000,mobileScrollSupport:true,useMouseEvents:true,clickEventForward:true,showPageCorners:!reducedQuery.matches,disableFlipByClick:false,swipeDistance:40});
 book.on('flip',updateUI);book.on('changeOrientation',()=>{requestAnimationFrame(updateUI)});book.on('changeState',event=>{locked=event.data==='flipping'||event.data==='user_fold';$('stage').classList.toggle('turning',locked)});
 book.loadFromHTML(root.querySelectorAll('.page'));updateUI();
 root.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.page))));root.querySelector('[data-open]').addEventListener('click',next);
}
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
