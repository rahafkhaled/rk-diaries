// Each entry has a stable URL and occupies a two-page spread.
const STORY_START=3, ARCHIVE_PAGE=STORY_START+diaryEntries.length*2,
 EDIT_PAGE=ARCHIVE_PAGE+2, RKEYZ_PAGE=EDIT_PAGE+2, BACK_PAGE=RKEYZ_PAGE+2;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shortDate=date=>new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
const entryPage=e=>STORY_START+diaryEntries.indexOf(e)*2;
const entryLink=e=>'#entry/'+e.slug;
function pageRoute(page){
 if(page===0)return '#cover';
 if(page<STORY_START)return '#latest';
 if(page<ARCHIVE_PAGE)return entryLink(diaryEntries[Math.floor((page-STORY_START)/2)]);
 if(page<EDIT_PAGE)return '#archive';
 if(page<RKEYZ_PAGE)return '#edit';
 if(page<BACK_PAGE)return '#rkeyz';
 return '#back';
}
function routePage(hash){
 const fixed={'#cover':0,'#latest':1,'#archive':ARCHIVE_PAGE,'#edit':EDIT_PAGE,'#rkeyz':RKEYZ_PAGE,'#back':BACK_PAGE};
 if(hash in fixed)return fixed[hash];
 const entry=diaryEntries.find(e=>entryLink(e)===hash);
 return entry?entryPage(entry):null;
}
function entryArt(e,cls=''){
 return e.image?`<img class="editorial-photo ${cls}" src="${escapeHTML(e.image)}" alt="${escapeHTML(e.alt)}">`:
 `<div class="editorial-art ${cls}" aria-hidden="true"><span class="art-orbit"></span><img src="assets/sticker-${e.art}.webp" alt=""><span class="art-label">${escapeHTML(e.category)}</span></div>`;
}
function storyCards(list,compact=false){return list.map(e=>`<a class="story-card ${compact?'compact':''}" href="${entryLink(e)}">${entryArt(e)}<span><small>${escapeHTML(e.category)} · ${shortDate(e.date)}</small><strong>${escapeHTML(e.title)}</strong>${compact?'':`<span class="card-summary">${escapeHTML(e.summary)}</span>`}</span><b aria-hidden="true">↗</b></a>`).join('');}
function pagesHTML(){
 const sticker=(name,cls='')=>`<img class="sticker ${cls}" src="assets/sticker-${name}.webp" alt="" aria-hidden="true">`;
 const page=(num,section,body,cls='')=>`<article class="page editorial-page ${cls}" aria-label="${escapeHTML(section)}"><div class="page-content"><div class="page-header"><span>${escapeHTML(section)}</span><span>RK DIARIES</span></div>${body}<div class="page-footer"><span>RAHAF’S PERSONAL PAGES</span><span>${String(num).padStart(2,'0')}</span></div></div></article>`;
 const first=diaryEntries[0];
 const cover=`<article class="page cover-page mag-cover" data-density="hard" aria-label="RK Diaries cover"><div class="page-content cover-content"><div class="cover-art"><img class="cover-photo" src="assets/rahaf-night-out.png" alt="Rahaf in silver and rhinestones"><div class="cover-strip"><span>RK DIARIES</span><span>PERSONAL PAGES</span><span>PREVIEW</span></div><h1 class="masthead">RK<span>diaries</span></h1><div class="coverlines cl-left"><a class="cl cl-big" href="${entryLink(first)}">After<em>dark</em></a><a class="cl" href="#entry/georgia-notes"><b>Georgia</b>in the margins ↗</a><a class="cl" href="#edit"><b>The Edit</b>a few things worth keeping</a></div><div class="coverlines cl-right"><a class="cl" href="#entry/purple-and-chrome"><b>Purple<br>&amp; chrome</b>a visual note</a><a class="cl" href="#rkeyz"><b>RKEYZ</b>the roll call ↗</a></div>${sticker('disco','cover-disco')}${sticker('star','cover-star')}<div class="cover-bottom"><button class="open-cover" data-open>open RK Diaries ↗</button><span class="barcode" aria-hidden="true"></span></div></div></div></article>`;
 const latest=page(1,'The contents',`<p class="eyebrow">NEWEST FIRST · PREVIEW EDITION</p><h2>Latest<span class="serif-word">entries.</span></h2><p class="editorial-deck">Style, places, and whatever stays with me.</p><div class="story-list">${storyCards(diaryEntries,true)}</div><a class="text-link" href="#archive">Browse the archive <span>↗</span></a><p class="preview-note">Sample posts &amp; dates for this preview.</p>`,'contents-page');
 const featured=page(2,'In focus',`<a class="feature-photo" href="${entryLink(first)}">${entryArt(first)}<span>OPEN THE STORY ↗</span></a><p class="eyebrow">${escapeHTML(first.category)} · ${shortDate(first.date)}</p><a class="feature-title" href="${entryLink(first)}">${escapeHTML(first.title)}</a><p class="editorial-deck">${escapeHTML(first.summary)}</p>`,'feature-page');
 const stories=diaryEntries.map((e,i)=>{
  const n=entryPage(e);
  return page(n,e.category,`<p class="eyebrow">${shortDate(e.date)} · SAMPLE ENTRY</p><h2 class="story-title">${escapeHTML(e.title)}</h2><figure class="story-visual">${entryArt(e)}<figcaption>${escapeHTML(e.caption)}</figcaption></figure>`,'story-opener')+
   page(n+1,e.kicker,`<p class="story-number">0${i+1}<span> / ENTRY</span></p><p class="editorial-deck story-deck">${escapeHTML(e.summary)}</p><div class="editorial-body">${e.paragraphs.map(p=>`<p>${escapeHTML(p)}</p>`).join('')}</div><p class="margin-note">${escapeHTML(e.note)}</p><div class="story-actions"><button class="text-link" data-share="${e.slug}">Copy entry link ↗</button><a class="text-link" href="#archive">All entries ↗</a></div><p class="preview-note">Preview copy · not a finished post</p>`,'story-text');
 }).join('');
 const archive=page(ARCHIVE_PAGE,'The archive',`<p class="eyebrow">THE FULL INDEX</p><h2>Nothing<span class="serif-word">lost.</span></h2><p class="editorial-deck">Every entry, in one place.<br>Start with the latest, or follow a thread.</p><div class="archive-filters"><label for="archive-search">Find an entry<input id="archive-search" type="search" placeholder="Search titles or topics…"></label><label for="archive-topic">Topic<select id="archive-topic"><option value="">All topics</option>${[...new Set(diaryEntries.map(e=>e.category))].map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</select></label><label for="archive-month">Month<select id="archive-month"><option value="">All months</option>${[...new Set(diaryEntries.map(e=>e.date.slice(0,7)))].map(m=>`<option value="${m}">${new Date(m+'-01T12:00:00Z').toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'})}</option>`).join('')}</select></label></div>`)+
 page(ARCHIVE_PAGE+1,'All entries',`<p class="eyebrow" id="archive-count" aria-live="polite">${diaryEntries.length} ENTRIES · NEWEST FIRST</p><div id="archive-results" class="archive-results">${storyCards(diaryEntries)}</div><p class="preview-note">Sample publication dates shown.</p>`);
 const edit=page(EDIT_PAGE,'The Edit',`<p class="eyebrow">THE VISUAL FILE</p><h2>On<span class="serif-word">my radar.</span></h2><p class="editorial-deck">Colours, textures, and details I keep coming back to.</p><div class="edit-collage">${sticker('disco','edit-disco')}${sticker('purse-sparkle','edit-purse')}<span>Purple.<br>Silver.<br>A little shine.</span></div><p class="preview-note">Visual direction · not product recommendations</p>`)+
 page(EDIT_PAGE+1,'The shortlist',`<p class="eyebrow">CURRENT REFERENCES</p><div class="edit-item"><span>01 / COLOUR</span><h3>Deep purple</h3><p>Plum, violet, and lilac in the shadows.</p><div class="colour-chips" aria-label="Plum, violet, lilac and silver colour palette"><i></i><i></i><i></i><i></i></div></div><div class="edit-item"><span>02 / TEXTURE</span><h3>Light-catching</h3><p>Glitter, rhinestones, mirrored surfaces.</p></div><div class="edit-item"><span>03 / REFERENCE</span><h3>Magazine margins</h3><p>Fashion pages, cut-out details, a personal point of view.</p></div><a class="text-link" href="#entry/purple-and-chrome">Read the visual note ↗</a>`);
 const fans=page(RKEYZ_PAGE,'RKEYZ',`<p class="eyebrow">THE PEOPLE IN THESE PAGES</p><h2>For the<span class="serif-word">RKEYZ.</span></h2><p class="editorial-deck">A little space for the people reading along.</p><div class="fan-art">${sticker('star')}${sticker('cd')}<span>RK<br>EY Z</span></div><p class="preview-note">Demo roll call. These usernames are fictional placeholders.</p>`)+
 page(RKEYZ_PAGE+1,'The roll call',`<p class="eyebrow">RKEYZ / COMMUNITY</p><div class="rkeyz-list">${rkeyz.map((name,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><strong>${name}</strong><b aria-hidden="true">✧</b></div>`).join('')}</div><p class="preview-note">No real accounts are linked in this preview.</p>`);
 const back=`<article class="page cover-page back-cover" data-density="hard" aria-label="Back cover"><div class="page-content cover-content">${sticker('disco','back-disco')}<p class="masthead">RK<span>diaries</span></p><p class="back-line">More, whenever.</p><button class="open-cover" data-page="1">back to latest ↗</button></div></article>`;
 return cover+latest+featured+stories+archive+edit+fans+back;
}
function filterArchive(){
 const search=document.getElementById('archive-search').value.toLowerCase().trim(),topic=document.getElementById('archive-topic').value,month=document.getElementById('archive-month').value;
 const matches=diaryEntries.filter(e=>(!topic||e.category===topic)&&(!month||e.date.startsWith(month))&&`${e.title} ${e.summary} ${e.category}`.toLowerCase().includes(search));
 document.getElementById('archive-count').textContent=`${matches.length} ${matches.length===1?'ENTRY':'ENTRIES'} · NEWEST FIRST`;
 document.getElementById('archive-results').innerHTML=matches.length?storyCards(matches):'<div class="archive-empty"><h3>No entries found.</h3><p>Try another word, topic, or month.</p><button class="text-link" id="reset-archive">Clear filters ↗</button></div>';
}
