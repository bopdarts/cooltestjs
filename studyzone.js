(function(){
'use strict';

// Remove old instance
var old=document.getElementById('sz-root');
if(old)old.remove();

// ── STORAGE ──────────────────────────────────────
var LS={
  get:function(k){try{return localStorage.getItem(k);}catch(e){return null;}},
  set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}}
};

// ── DATA ─────────────────────────────────────────
var BMS=[];
try{BMS=JSON.parse(LS.get('sz_bm')||'[]');}catch(e){}
if(!BMS.length){
  BMS=[
    {id:1,name:'Canvas',url:'https://canvas.instructure.com',emoji:'🎓',cat:'School'},
    {id:2,name:'Khan Academy',url:'https://www.khanacademy.org',emoji:'📐',cat:'Resources'},
    {id:3,name:'Quizlet',url:'https://quizlet.com',emoji:'🃏',cat:'Resources'},
    {id:4,name:'Desmos',url:'https://www.desmos.com/calculator',emoji:'📈',cat:'Tools'},
    {id:5,name:'Google Drive',url:'https://drive.google.com',emoji:'💾',cat:'Tools'},
  ];
  LS.set('sz_bm',JSON.stringify(BMS));
}

var CLS=[];
try{CLS=JSON.parse(LS.get('sz_cls')||'[]');}catch(e){}

var GAMES=[
  {id:1,title:'Polytrack',emoji:'🏎️',cat:'Racing',color:'#1a0a2a',
   url:'https://gist.githubusercontent.com/Moai2222/f89d8c3e2982f853f38fecfffa021e34/raw/4fd784c33c1dde727b1df25d49f850ffd81206bd/polytrack.html'},
];

var bmF='All', gCat='All';

// ── STYLES ───────────────────────────────────────
var style=document.createElement('style');
style.textContent=[
'#sz-root{all:initial;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;background:rgba(0,0,0,.88);font-family:Segoe UI,Arial,sans-serif;}',
'#sz-root *{box-sizing:border-box;font-family:Segoe UI,Arial,sans-serif;margin:0;padding:0;}',
'#sz-win{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#161920;border:1px solid #2a2f42;border-radius:16px;width:95vw;max-width:1100px;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px #000;}',
'#sz-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #2a2f42;background:#0d0f14;flex-shrink:0;}',
'#sz-logo{font-weight:800;font-size:1.1rem;color:#5b8af5;}',
'#sz-tabs{display:flex;gap:4px;background:#1e2230;border:1px solid #2a2f42;border-radius:8px;padding:3px;}',
'.sz-tab{padding:5px 14px;border-radius:6px;border:none;background:transparent;color:#6b7280;font-size:.8rem;cursor:pointer;}',
'.sz-tab:hover{color:#e8eaf0;}',
'.sz-tab.active{background:#5b8af5;color:#fff;}',
'#sz-xbtn{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:.82rem;}',
'#sz-xbtn:hover{background:rgba(248,113,113,.3);}',
'#sz-body{flex:1;overflow-y:auto;padding:1.5rem;color:#e8eaf0;}',
'.sz-sec{display:none;}.sz-sec.active{display:block;}',
'.sz-ph-h{font-weight:800;font-size:1.5rem;color:#e8eaf0;margin-bottom:4px;display:block;}',
'.sz-ph-p{color:#6b7280;font-size:.85rem;margin-bottom:1.25rem;display:block;}',
'.sz-card{background:#1e2230;border:1px solid #2a2f42;border-radius:12px;padding:1rem;margin-bottom:1rem;}',
'.sz-card-h{color:#e8eaf0;font-size:.9rem;font-weight:700;margin-bottom:.75rem;display:block;}',
'.sz-inp{background:#161920;border:1px solid #2a2f42;border-radius:8px;padding:8px 12px;color:#e8eaf0;font-size:.82rem;outline:none;width:100%;}',
'.sz-inp:focus{border-color:#5b8af5;}',
'.sz-row{display:flex;gap:6px;margin-bottom:6px;align-items:center;}',
'.sz-row .sz-inp{width:auto;flex:1;}',
'.sz-btn{padding:7px 14px;border-radius:8px;border:none;background:#5b8af5;color:#fff;font-size:.8rem;cursor:pointer;white-space:nowrap;}',
'.sz-btn:hover{background:#4a79e4;}',
'.sz-btn.del{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);}',
'.sz-btn.del:hover{background:rgba(248,113,113,.3);}',
'.sz-btn.sml{padding:4px 9px;font-size:.72rem;}',
'.sz-chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1rem;}',
'.sz-chip{padding:4px 12px;border-radius:20px;border:1px solid #2a2f42;background:transparent;color:#6b7280;font-size:.75rem;cursor:pointer;}',
'.sz-chip:hover{color:#e8eaf0;}',
'.sz-chip.active{background:#5b8af5;border-color:#5b8af5;color:#fff;}',
'.bm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;}',
'.bm-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;display:flex;flex-direction:column;gap:6px;}',
'.bm-top{display:flex;align-items:center;gap:8px;}',
'.bm-icon{width:32px;height:32px;border-radius:7px;background:#161920;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}',
'.bm-name{font-weight:600;font-size:.85rem;color:#e8eaf0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.bm-url{font-size:.7rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.bm-cat{font-size:.65rem;padding:2px 7px;border-radius:8px;background:rgba(91,138,245,.15);color:#5b8af5;width:fit-content;}',
'.bm-acts{display:flex;gap:5px;margin-top:auto;}',
'.gsc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1rem;}',
'.sum-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;text-align:center;}',
'.sum-n{font-size:1.6rem;font-weight:800;line-height:1;margin-bottom:3px;display:block;}',
'.sum-l{font-size:.72rem;color:#6b7280;display:block;}',
'.cls-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;margin-bottom:.75rem;}',
'.cls-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}',
'.cls-name{font-weight:600;font-size:.88rem;color:#e8eaf0;display:block;}',
'.sz-pb{height:5px;background:#161920;border-radius:3px;overflow:hidden;margin-bottom:6px;}',
'.sz-pf{height:100%;border-radius:3px;}',
'.sz-at{width:100%;border-collapse:collapse;font-size:.75rem;margin-bottom:6px;}',
'.sz-at th{text-align:left;padding:4px 6px;color:#6b7280;border-bottom:1px solid #2a2f42;}',
'.sz-at td{padding:3px 6px;color:#e8eaf0;border-bottom:1px solid rgba(42,47,66,.5);}',
'.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;}',
'.gc{background:#1e2230;border:1px solid #2a2f42;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s,border-color .2s;}',
'.gc:hover{transform:translateY(-2px);border-color:rgba(91,138,245,.4);}',
'.gt{height:90px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;position:relative;}',
'.gt::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(22,25,32,.9));}',
'.gi3{padding:8px 10px 10px;}',
'.gtt{font-weight:600;font-size:.8rem;color:#e8eaf0;margin-bottom:3px;display:block;}',
'.gm2{display:flex;justify-content:space-between;align-items:center;}',
'.gtag{font-size:.65rem;padding:2px 7px;border-radius:8px;border:1px solid #2a2f42;color:#6b7280;}',
'.gpb3{font-size:.68rem;padding:3px 9px;border-radius:5px;border:none;background:#5b8af5;color:#fff;cursor:pointer;}',
'.gpb3:hover{background:#4a79e4;}',
'.sz-modal{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;}',
'.sz-modal.open{display:flex;}',
'.sz-modal-win{background:#161920;border:1px solid #2a2f42;border-radius:14px;width:96vw;max-width:1050px;display:flex;flex-direction:column;height:90vh;}',
'.sz-modal-head{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border-bottom:1px solid #2a2f42;flex-shrink:0;}',
'.sz-modal-title{font-weight:700;font-size:.9rem;color:#e8eaf0;}',
'.sz-iframe{flex:1;border:none;background:#000;border-radius:0 0 14px 14px;width:100%;}',
'.brow-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #2a2f42;background:#1e2230;flex-shrink:0;}',
'.brow-dots{display:flex;gap:5px;}',
'.brow-dot{width:11px;height:11px;border-radius:50%;cursor:pointer;flex-shrink:0;}',
'.brow-dot.r{background:#f87171;}.brow-dot.y{background:#fbbf24;}.brow-dot.g{background:#34d399;}',
'.brow-urlbar{flex:1;background:#161920;border:1px solid #2a2f42;border-radius:7px;padding:5px 10px;font-size:.78rem;color:#6b7280;}',
'.brow-blocked{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;background:#0d0f14;text-align:center;padding:2rem;flex:1;border-radius:0 0 14px 14px;}',
'.brow-blocked-title{color:#e8eaf0;font-size:1.1rem;font-weight:700;display:block;}',
'.brow-blocked-txt{color:#6b7280;font-size:.82rem;max-width:300px;line-height:1.5;display:block;}',
'.brow-link{color:#5b8af5;font-size:.85rem;}',
'.sz-empty{color:#6b7280;padding:1rem;display:block;}',
].join('');
document.head.appendChild(style);

// ── BUILD HTML ────────────────────────────────────
var root=document.createElement('div');
root.id='sz-root';

// Main window
var win=document.createElement('div');
win.id='sz-win';

// Nav
var nav=document.createElement('div');
nav.id='sz-nav';
nav.innerHTML='<span id="sz-logo">📚 StudyZone</span>';

var tabs=document.createElement('div');
tabs.id='sz-tabs';
['🔖 Bookmarks','📊 Grades','🎮 Games'].forEach(function(label,i){
  var btn=document.createElement('button');
  btn.className='sz-tab'+(i===0?' active':'');
  btn.textContent=label;
  btn.dataset.sec=['sz-bm','sz-gr','sz-gm'][i];
  tabs.appendChild(btn);
});
nav.appendChild(tabs);

var xbtn=document.createElement('button');
xbtn.id='sz-xbtn';
xbtn.textContent='✕ Close';
nav.appendChild(xbtn);
win.appendChild(nav);

// Body
var body=document.createElement('div');
body.id='sz-body';

// --- Bookmarks section ---
var bmSec=document.createElement('div');
bmSec.id='sz-bm';
bmSec.className='sz-sec active';
bmSec.innerHTML=
  '<span class="sz-ph-h">Bookmarks</span>'+
  '<span class="sz-ph-p">Your saved sites — opens right here on top of Canvas</span>'+
  '<div class="sz-card">'+
    '<span class="sz-card-h">+ Add Bookmark</span>'+
    '<div class="sz-row"><input class="sz-inp" id="sz-bn" placeholder="Name"><input class="sz-inp" id="sz-bu" placeholder="URL"></div>'+
    '<div class="sz-row">'+
      '<input class="sz-inp" id="sz-be" placeholder="Emoji" style="max-width:80px;">'+
      '<select class="sz-inp" id="sz-bc" style="flex:0;width:auto;"><option>School</option><option>Tools</option><option>Resources</option><option>Other</option></select>'+
      '<button class="sz-btn" id="sz-addbm">Add</button>'+
    '</div>'+
  '</div>'+
  '<div class="sz-chips" id="sz-bm-chips"></div>'+
  '<div class="bm-grid" id="sz-bm-grid"></div>';
body.appendChild(bmSec);

// --- Grades section ---
var grSec=document.createElement('div');
grSec.id='sz-gr';
grSec.className='sz-sec';
grSec.innerHTML=
  '<span class="sz-ph-h">Grade Tracker</span>'+
  '<span class="sz-ph-p">Track Canvas grades & GPA</span>'+
  '<div class="gsc">'+
    '<div class="sum-card"><span class="sum-n" id="sz-sc" style="color:#5b8af5;">0</span><span class="sum-l">Classes</span></div>'+
    '<div class="sum-card"><span class="sum-n" id="sz-sa" style="color:#34d399;">—</span><span class="sum-l">Avg Grade</span></div>'+
    '<div class="sum-card"><span class="sum-n" id="sz-sg" style="color:#a78bfa;">—</span><span class="sum-l">GPA</span></div>'+
  '</div>'+
  '<div class="sz-card">'+
    '<span class="sz-card-h">+ Add Class</span>'+
    '<div class="sz-row"><input class="sz-inp" id="sz-cn" placeholder="Class name"><input class="sz-inp" id="sz-ct" placeholder="Teacher (optional)"></div>'+
    '<button class="sz-btn" id="sz-addcls">Add Class</button>'+
  '</div>'+
  '<div id="sz-cls-list"></div>';
body.appendChild(grSec);

// --- Games section ---
var gmSec=document.createElement('div');
gmSec.id='sz-gm';
gmSec.className='sz-sec';
gmSec.innerHTML=
  '<span class="sz-ph-h">Games</span>'+
  '<span class="sz-ph-p">Click a game to play it fullscreen</span>'+
  '<input class="sz-inp" id="sz-gsearch" placeholder="🔍 Search games..." style="margin-bottom:.75rem;">'+
  '<div class="sz-chips" id="sz-gf"></div>'+
  '<div class="gg" id="sz-gg"></div>';
body.appendChild(gmSec);

win.appendChild(body);
root.appendChild(win);

// --- Browser modal ---
var browMod=document.createElement('div');
browMod.id='sz-brow';
browMod.className='sz-modal';
var browWin=document.createElement('div');
browWin.className='sz-modal-win';

var browBar=document.createElement('div');
browBar.className='brow-bar';
browBar.innerHTML='<div class="brow-dots"><div class="brow-dot r" id="sz-brow-x"></div><div class="brow-dot y"></div><div class="brow-dot g"></div></div>';
var browUrl=document.createElement('div');
browUrl.className='brow-urlbar';
browUrl.id='sz-brow-url';
browUrl.textContent='about:blank';
browBar.appendChild(browUrl);
browWin.appendChild(browBar);

var browBody=document.createElement('div');
browBody.style.cssText='flex:1;position:relative;';

var browBlocked=document.createElement('div');
browBlocked.id='sz-brow-blocked';
browBlocked.className='brow-blocked';
browBlocked.style.display='none';
browBlocked.innerHTML='<span style="font-size:2.5rem;">🚫</span><span class="brow-blocked-title">Can\'t embed this site</span><span class="brow-blocked-txt">This site blocks iframes. Open it directly instead.</span><a class="brow-link" id="sz-brow-link" href="#" target="_blank">Open in new tab →</a>';
browBody.appendChild(browBlocked);

var browIfr=document.createElement('iframe');
browIfr.id='sz-brow-iframe';
browIfr.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups');
browIfr.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none;';
browBody.appendChild(browIfr);
browWin.appendChild(browBody);
browMod.appendChild(browWin);
root.appendChild(browMod);

// --- Game modal ---
var gMod=document.createElement('div');
gMod.id='sz-gmod';
gMod.className='sz-modal';
var gWin=document.createElement('div');
gWin.className='sz-modal-win';

var gHead=document.createElement('div');
gHead.className='sz-modal-head';
var gTitle=document.createElement('span');
gTitle.className='sz-modal-title';
gTitle.id='sz-gtitle';
gTitle.textContent='Game';
var gClose=document.createElement('button');
gClose.className='sz-btn del sml';
gClose.id='sz-gmod-x';
gClose.textContent='✕ Close';
gHead.appendChild(gTitle);
gHead.appendChild(gClose);
gWin.appendChild(gHead);

var gFrame=document.createElement('iframe');
gFrame.className='sz-iframe';
gFrame.id='sz-gframe';
gFrame.setAttribute('allow','fullscreen');
gFrame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock');
gWin.appendChild(gFrame);
gMod.appendChild(gWin);
root.appendChild(gMod);

document.body.appendChild(root);

// ── WIRE EVENTS ───────────────────────────────────

// Close main
document.getElementById('sz-xbtn').addEventListener('click',function(){
  document.getElementById('sz-root').remove();
});

// Nav tabs
document.getElementById('sz-tabs').addEventListener('click',function(e){
  var btn=e.target.closest('.sz-tab');
  if(!btn||!btn.dataset.sec)return;
  document.querySelectorAll('#sz-tabs .sz-tab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('#sz-body .sz-sec').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById(btn.dataset.sec).classList.add('active');
});

// Add bookmark
document.getElementById('sz-addbm').addEventListener('click',function(){
  var n=document.getElementById('sz-bn').value.trim();
  var u=document.getElementById('sz-bu').value.trim();
  var e=document.getElementById('sz-be').value.trim()||'🌐';
  var c=document.getElementById('sz-bc').value;
  if(!n||!u){alert('Enter a name and URL.');return;}
  BMS.push({id:Date.now(),name:n,url:u.startsWith('http')?u:'https://'+u,emoji:e,cat:c});
  LS.set('sz_bm',JSON.stringify(BMS));
  document.getElementById('sz-bn').value='';
  document.getElementById('sz-bu').value='';
  document.getElementById('sz-be').value='';
  renderBM();
});

// Bookmark chips
document.getElementById('sz-bm-chips').addEventListener('click',function(e){
  var chip=e.target.closest('.sz-chip');
  if(!chip)return;
  document.querySelectorAll('#sz-bm-chips .sz-chip').forEach(function(c){c.classList.remove('active');});
  chip.classList.add('active');
  bmF=chip.dataset.cat||'All';
  renderBM();
});

// Bookmark grid
document.getElementById('sz-bm-grid').addEventListener('click',function(e){
  var ob=e.target.closest('[data-open]');
  var db=e.target.closest('[data-del]');
  if(ob){openBrow(ob.dataset.open,ob.dataset.name||'');}
  if(db){
    var id=parseInt(db.dataset.del);
    BMS=BMS.filter(function(b){return b.id!==id;});
    LS.set('sz_bm',JSON.stringify(BMS));
    renderBM();
  }
});

// Browser close
document.getElementById('sz-brow-x').addEventListener('click',closeBrow);
document.getElementById('sz-brow').addEventListener('click',function(e){if(e.target===this)closeBrow();});

// Add class
document.getElementById('sz-addcls').addEventListener('click',function(){
  var n=document.getElementById('sz-cn').value.trim();
  var t=document.getElementById('sz-ct').value.trim();
  if(!n){alert('Enter a class name.');return;}
  CLS.push({id:Date.now(),name:n,teacher:t,asgns:[]});
  LS.set('sz_cls',JSON.stringify(CLS));
  document.getElementById('sz-cn').value='';
  document.getElementById('sz-ct').value='';
  renderCLS();
});

// Class list delegation
document.getElementById('sz-cls-list').addEventListener('click',function(e){
  var delc=e.target.closest('[data-delcls]');
  var dela=e.target.closest('[data-dela]');
  var adda=e.target.closest('[data-adda]');
  if(delc){
    var id=parseInt(delc.dataset.delcls);
    CLS=CLS.filter(function(c){return c.id!==id;});
    LS.set('sz_cls',JSON.stringify(CLS));
    renderCLS();
  }
  if(dela){
    var cid=parseInt(dela.dataset.cid),aid=parseInt(dela.dataset.dela);
    var cl=CLS.find(function(c){return c.id===cid;});
    if(cl){cl.asgns=cl.asgns.filter(function(a){return a.id!==aid;});}
    LS.set('sz_cls',JSON.stringify(CLS));
    renderCLS();
  }
  if(adda){
    var cid=parseInt(adda.dataset.adda);
    var ne=document.getElementById('sz-an-'+cid);
    var ee=document.getElementById('sz-ae-'+cid);
    var te=document.getElementById('sz-at-'+cid);
    if(!ne||!ee||!te)return;
    var nm=ne.value.trim()||'Assignment';
    var earned=parseFloat(ee.value);
    var total=parseFloat(te.value);
    if(isNaN(earned)||isNaN(total)||total<=0){alert('Enter valid points.');return;}
    var cl=CLS.find(function(c){return c.id===cid;});
    if(cl){cl.asgns.push({id:Date.now(),name:nm,earned:earned,total:total});}
    ne.value='';ee.value='';te.value='';
    LS.set('sz_cls',JSON.stringify(CLS));
    renderCLS();
  }
});

// Game category chips
document.getElementById('sz-gf').addEventListener('click',function(e){
  var chip=e.target.closest('.sz-chip');
  if(!chip)return;
  document.querySelectorAll('#sz-gf .sz-chip').forEach(function(c){c.classList.remove('active');});
  chip.classList.add('active');
  gCat=chip.dataset.gcat||'All';
  renderGames();
});

// Game search
document.getElementById('sz-gsearch').addEventListener('input',renderGames);

// Game grid
document.getElementById('sz-gg').addEventListener('click',function(e){
  var btn=e.target.closest('[data-gid]');
  if(!btn)return;
  var id=parseInt(btn.dataset.gid);
  var game=GAMES.find(function(g){return g.id===id;});
  if(game)openGame(game);
});

// Game modal close
document.getElementById('sz-gmod-x').addEventListener('click',closeGame);
document.getElementById('sz-gmod').addEventListener('click',function(e){if(e.target===this)closeGame();});

// Escape key
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  if(document.getElementById('sz-gmod').classList.contains('open')){closeGame();return;}
  if(document.getElementById('sz-brow').classList.contains('open')){closeBrow();return;}
  var r=document.getElementById('sz-root');
  if(r)r.remove();
});

// ── RENDER FUNCTIONS ─────────────────────────────

function renderBMChips(){
  var chips=document.getElementById('sz-bm-chips');
  chips.innerHTML='';
  ['All','School','Tools','Resources','Other'].forEach(function(cat){
    var c=document.createElement('button');
    c.className='sz-chip'+(cat===bmF?' active':'');
    c.dataset.cat=cat;
    c.textContent=cat;
    chips.appendChild(c);
  });
}

function renderBM(){
  var grid=document.getElementById('sz-bm-grid');
  var list=bmF==='All'?BMS:BMS.filter(function(b){return b.cat===bmF;});
  if(!list.length){grid.innerHTML='<span class="sz-empty">No bookmarks yet.</span>';return;}
  grid.innerHTML='';
  list.forEach(function(b){
    var card=document.createElement('div');
    card.className='bm-card';
    card.innerHTML=
      '<div class="bm-top"><div class="bm-icon">'+b.emoji+'</div>'+
      '<div style="min-width:0;"><div class="bm-name">'+esc(b.name)+'</div><div class="bm-url">'+esc(b.url)+'</div></div></div>'+
      '<div class="bm-cat">'+esc(b.cat)+'</div>'+
      '<div class="bm-acts">'+
      '<button class="sz-btn sml" style="flex:1;" data-open="'+esc(b.url)+'" data-name="'+esc(b.name)+'">'+b.emoji+' Open</button>'+
      '<button class="sz-btn del sml" data-del="'+b.id+'">✕</button>'+
      '</div>';
    grid.appendChild(card);
  });
}

function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function openBrow(url,name){
  var ifr=document.getElementById('sz-brow-iframe');
  var bl=document.getElementById('sz-brow-blocked');
  var urlBar=document.getElementById('sz-brow-url');
  var lnk=document.getElementById('sz-brow-link');
  urlBar.textContent=url;
  lnk.href=url;
  bl.style.display='none';
  ifr.style.display='block';
  ifr.src='';
  setTimeout(function(){
    ifr.src=url;
    ifr.onerror=function(){bl.style.display='flex';ifr.style.display='none';};
  },10);
  document.getElementById('sz-brow').classList.add('open');
}

function closeBrow(){
  document.getElementById('sz-brow').classList.remove('open');
  document.getElementById('sz-brow-iframe').src='';
}

function calcGrade(asgns){
  if(!asgns.length)return null;
  var e=asgns.reduce(function(s,a){return s+a.earned;},0);
  var t=asgns.reduce(function(s,a){return s+a.total;},0);
  return t>0?e/t*100:null;
}
function gradeToLetter(g){
  if(g>=93)return{l:'A',c:'#34d399'};if(g>=90)return{l:'A−',c:'#34d399'};
  if(g>=87)return{l:'B+',c:'#fbbf24'};if(g>=83)return{l:'B',c:'#fbbf24'};if(g>=80)return{l:'B−',c:'#fbbf24'};
  if(g>=70)return{l:'C',c:'#f87171'};if(g>=60)return{l:'D',c:'#f87171'};
  return{l:'F',c:'#f87171'};
}
function gradeToGPA(g){if(g>=93)return 4;if(g>=90)return 3.7;if(g>=87)return 3.3;if(g>=83)return 3;if(g>=80)return 2.7;if(g>=70)return 2;if(g>=60)return 1;return 0;}

function renderCLS(){
  var list=document.getElementById('sz-cls-list');
  var graded=CLS.map(function(c){return calcGrade(c.asgns);}).filter(function(g){return g!==null;});
  document.getElementById('sz-sc').textContent=CLS.length;
  if(graded.length){
    var avg=graded.reduce(function(a,b){return a+b;},0)/graded.length;
    var gpa=graded.reduce(function(a,b){return a+gradeToGPA(b);},0)/graded.length;
    document.getElementById('sz-sa').textContent=avg.toFixed(1)+'%';
    document.getElementById('sz-sg').textContent=gpa.toFixed(2);
  }else{
    document.getElementById('sz-sa').textContent='—';
    document.getElementById('sz-sg').textContent='—';
  }
  if(!CLS.length){list.innerHTML='<span class="sz-empty">No classes yet.</span>';return;}
  list.innerHTML='';
  CLS.forEach(function(cls){
    var grade=calcGrade(cls.asgns);
    var pct=grade!==null?grade.toFixed(1):null;
    var letter=pct?gradeToLetter(parseFloat(pct)):null;
    var bc=pct?(parseFloat(pct)>=80?'#34d399':parseFloat(pct)>=70?'#fbbf24':'#f87171'):'#2a2f42';
    var bw=pct?Math.min(parseFloat(pct),100):0;

    var card=document.createElement('div');
    card.className='cls-card';

    var top=document.createElement('div');
    top.className='cls-top';
    top.innerHTML=
      '<div><span class="cls-name">'+esc(cls.name)+'</span>'+(cls.teacher?'<span style="font-size:.72rem;color:#6b7280;">'+esc(cls.teacher)+'</span>':'')+
      '</div><div style="display:flex;align-items:center;gap:8px;">'+
      (pct?'<div style="text-align:right;"><span style="font-size:1.1rem;font-weight:800;color:'+letter.c+';">'+letter.l+'</span><span style="font-size:.7rem;color:#6b7280;display:block;">'+pct+'%</span></div>':'<span style="font-size:.78rem;color:#6b7280;">No grades</span>')+
      '<button class="sz-btn del sml" data-delcls="'+cls.id+'">✕</button></div>';
    card.appendChild(top);

    var pb=document.createElement('div');pb.className='sz-pb';
    var pf=document.createElement('div');pf.className='sz-pf';
    pf.style.cssText='width:'+bw+'%;background:'+bc+';';
    pb.appendChild(pf);card.appendChild(pb);

    if(cls.asgns.length){
      var tbl=document.createElement('table');tbl.className='sz-at';
      tbl.innerHTML='<tr><th>Name</th><th>Got</th><th>Of</th><th>%</th><th></th></tr>'+
        cls.asgns.map(function(a){
          var ap=a.earned/a.total*100;
          var ac=ap>=80?'#34d399':ap>=70?'#fbbf24':'#f87171';
          return'<tr><td>'+esc(a.name)+'</td><td style="text-align:center;">'+a.earned+'</td><td style="text-align:center;">'+a.total+'</td><td style="text-align:center;color:'+ac+';">'+ap.toFixed(0)+'%</td><td><button class="sz-btn del sml" data-dela="'+a.id+'" data-cid="'+cls.id+'">✕</button></td></tr>';
        }).join('');
      card.appendChild(tbl);
    }

    var addRow=document.createElement('div');
    addRow.style.cssText='display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:6px;';
    addRow.innerHTML=
      '<input class="sz-inp" id="sz-an-'+cls.id+'" placeholder="Assignment" style="flex:2;min-width:80px;">'+
      '<input class="sz-inp" id="sz-ae-'+cls.id+'" placeholder="Got" type="number" style="width:60px;">'+
      '<input class="sz-inp" id="sz-at-'+cls.id+'" placeholder="Of" type="number" style="width:60px;">'+
      '<button class="sz-btn sml" data-adda="'+cls.id+'">+ Add</button>';
    card.appendChild(addRow);
    list.appendChild(card);
  });
}

function renderGameChips(){
  var gf=document.getElementById('sz-gf');
  gf.innerHTML='';
  var cats=['All','Racing','Arcade','Puzzle','Action','Classic'];
  cats.forEach(function(cat){
    var c=document.createElement('button');
    c.className='sz-chip'+(cat===gCat?' active':'');
    c.dataset.gcat=cat;
    c.textContent=cat;
    gf.appendChild(c);
  });
}

function renderGames(){
  var q=document.getElementById('sz-gsearch').value.toLowerCase();
  var list=GAMES.filter(function(g){
    return g.title.toLowerCase().includes(q)&&(gCat==='All'||g.cat===gCat);
  });
  var grid=document.getElementById('sz-gg');
  if(!list.length){grid.innerHTML='<span class="sz-empty">No games found.</span>';return;}
  grid.innerHTML='';
  list.forEach(function(g){
    var card=document.createElement('div');
    card.className='gc';
    card.dataset.gid=g.id;
    card.innerHTML=
      '<div class="gt" style="background:'+g.color+'"><span style="position:relative;z-index:1;">'+g.emoji+'</span></div>'+
      '<div class="gi3"><span class="gtt">'+esc(g.title)+'</span>'+
      '<div class="gm2"><span class="gtag">'+esc(g.cat)+'</span>'+
      '<button class="gpb3" data-gid="'+g.id+'">▶ Play</button></div></div>';
    grid.appendChild(card);
  });
}

function openGame(game){
  document.getElementById('sz-gtitle').textContent=game.emoji+' '+game.title;
  document.getElementById('sz-gframe').src=game.url;
  document.getElementById('sz-gmod').classList.add('open');
}

function closeGame(){
  document.getElementById('sz-gmod').classList.remove('open');
  document.getElementById('sz-gframe').src='';
}

// ── INIT ─────────────────────────────────────────
renderBMChips();
renderBM();
renderCLS();
renderGameChips();
renderGames();

})();
