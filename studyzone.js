(function(){
if(document.getElementById('sz-root')){document.getElementById('sz-root').remove();}

var s=document.createElement('style');
s.textContent=`
#sz-root *{box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif;}
#sz-root{all:initial;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;background:rgba(0,0,0,0.88);}
#sz-win{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#161920;border:1px solid #2a2f42;border-radius:16px;width:95vw;max-width:1100px;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.9);pointer-events:all;}
#sz-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #2a2f42;background:#0d0f14;flex-shrink:0;}
#sz-logo{font-weight:800;font-size:1.1rem;color:#5b8af5;user-select:none;}
#sz-tabs{display:flex;gap:4px;background:#1e2230;border:1px solid #2a2f42;border-radius:8px;padding:3px;}
.sz-tab{padding:5px 14px;border-radius:6px;border:none;background:transparent;color:#6b7280;font-size:.8rem;cursor:pointer;font-family:inherit;transition:all .15s;}
.sz-tab:hover{color:#e8eaf0;}
.sz-tab.active{background:#5b8af5;color:#fff;}
#sz-xbtn{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:.82rem;font-family:inherit;transition:all .15s;}
#sz-xbtn:hover{background:rgba(248,113,113,.3);}
#sz-body{flex:1;overflow-y:auto;padding:1.5rem;color:#e8eaf0;}
.sz-sec{display:none;}.sz-sec.active{display:block;}
.sz-ph-h{font-weight:800;font-size:1.5rem;color:#e8eaf0;margin:0 0 4px;}
.sz-ph-p{color:#6b7280;font-size:.85rem;margin:0 0 1.25rem;}
.sz-card{background:#1e2230;border:1px solid #2a2f42;border-radius:12px;padding:1rem;margin-bottom:1rem;}
.sz-card-h{color:#e8eaf0;font-size:.9rem;font-weight:700;margin:0 0 .75rem;}
.sz-inp{background:#161920;border:1px solid #2a2f42;border-radius:8px;padding:8px 12px;color:#e8eaf0;font-size:.82rem;outline:none;width:100%;font-family:inherit;transition:border-color .15s;}
.sz-inp:focus{border-color:#5b8af5;}
.sz-row{display:flex;gap:6px;margin-bottom:6px;align-items:center;}
.sz-row .sz-inp{width:auto;flex:1;}
.sz-btn{padding:7px 14px;border-radius:8px;border:none;background:#5b8af5;color:#fff;font-size:.8rem;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s;}
.sz-btn:hover{background:#4a79e4;}
.sz-btn.del{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);}
.sz-btn.del:hover{background:rgba(248,113,113,.3);}
.sz-btn.sml{padding:4px 9px;font-size:.72rem;}
.sz-chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1rem;}
.sz-chip{padding:4px 12px;border-radius:20px;border:1px solid #2a2f42;background:transparent;color:#6b7280;font-size:.75rem;cursor:pointer;font-family:inherit;transition:all .15s;}
.sz-chip:hover{color:#e8eaf0;}
.sz-chip.active{background:#5b8af5;border-color:#5b8af5;color:#fff;}
.bm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;}
.bm-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;display:flex;flex-direction:column;gap:6px;}
.bm-top{display:flex;align-items:center;gap:8px;}
.bm-icon{width:32px;height:32px;border-radius:7px;background:#161920;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
.bm-name{font-weight:600;font-size:.85rem;color:#e8eaf0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bm-url{font-size:.7rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bm-cat{font-size:.65rem;padding:2px 7px;border-radius:8px;background:rgba(91,138,245,.15);color:#5b8af5;width:fit-content;}
.bm-acts{display:flex;gap:5px;margin-top:auto;}
.gsc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1rem;}
.sum-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;text-align:center;}
.sum-n{font-size:1.6rem;font-weight:800;line-height:1;margin-bottom:3px;}
.sum-l{font-size:.72rem;color:#6b7280;}
.cls-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;margin-bottom:.75rem;}
.cls-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.cls-name{font-weight:600;font-size:.88rem;color:#e8eaf0;}
.sz-pb{height:5px;background:#161920;border-radius:3px;overflow:hidden;margin-bottom:6px;}
.sz-pf{height:100%;border-radius:3px;}
.sz-at{width:100%;border-collapse:collapse;font-size:.75rem;margin-bottom:6px;}
.sz-at th{text-align:left;padding:4px 6px;color:#6b7280;border-bottom:1px solid #2a2f42;}
.sz-at td{padding:3px 6px;color:#e8eaf0;border-bottom:1px solid rgba(42,47,66,.5);}
.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;}
.gc{background:#1e2230;border:1px solid #2a2f42;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s,border-color .2s;}
.gc:hover{transform:translateY(-2px);border-color:rgba(91,138,245,.4);}
.gt{height:90px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;position:relative;}
.gt::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(22,25,32,.9));}
.gi3{padding:8px 10px 10px;}
.gtt{font-weight:600;font-size:.8rem;color:#e8eaf0;margin-bottom:3px;}
.gm2{display:flex;justify-content:space-between;align-items:center;}
.gtag{font-size:.65rem;padding:2px 7px;border-radius:8px;border:1px solid #2a2f42;color:#6b7280;}
.gpb3{font-size:.68rem;padding:3px 9px;border-radius:5px;border:none;background:#5b8af5;color:#fff;cursor:pointer;font-family:inherit;transition:background .15s;}
.gpb3:hover{background:#4a79e4;}
/* Game iframe modal */
.gmod{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;pointer-events:all;}
.gmod.open{display:flex;}
.gmi2{background:#161920;border:1px solid #2a2f42;border-radius:14px;width:96vw;max-width:1000px;display:flex;flex-direction:column;height:90vh;}
.gmh2{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border-bottom:1px solid #2a2f42;flex-shrink:0;}
.gmt2{font-weight:700;font-size:.9rem;color:#e8eaf0;}
.gframe{flex:1;border:none;background:#000;border-radius:0 0 14px 14px;}
/* Browser modal */
.brow-modal{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.88);display:none;align-items:center;justify-content:center;padding:1rem;pointer-events:all;}
.brow-modal.open{display:flex;}
.brow-win{background:#161920;border:1px solid #2a2f42;border-radius:14px;width:100%;max-width:1050px;height:86vh;display:flex;flex-direction:column;overflow:hidden;}
.brow-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #2a2f42;background:#1e2230;flex-shrink:0;}
.brow-dots{display:flex;gap:5px;}
.brow-dot{width:11px;height:11px;border-radius:50%;cursor:pointer;flex-shrink:0;}
.brow-dot.r{background:#f87171;}.brow-dot.y{background:#fbbf24;}.brow-dot.g{background:#34d399;}
.brow-urlbar{flex:1;background:#161920;border:1px solid #2a2f42;border-radius:7px;padding:5px 10px;font-size:.78rem;color:#6b7280;font-family:inherit;}
.brow-body2{flex:1;position:relative;}
.brow-body2 iframe{position:absolute;inset:0;width:100%;height:100%;border:none;}
.brow-blocked{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;background:#0d0f14;text-align:center;padding:2rem;}
.brow-blocked h2{color:#e8eaf0;font-size:1.1rem;margin:0;}
.brow-blocked p{color:#6b7280;font-size:.82rem;max-width:300px;margin:0;line-height:1.5;}
.brow-blocked a{color:#5b8af5;font-size:.85rem;}
`;
document.head.appendChild(s);

// ── STORAGE ──────────────────────────────────────
var LS={get:function(k){try{return localStorage.getItem(k);}catch(e){return null;}},set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}}};

// ── DATA ─────────────────────────────────────────
var BMS=[];try{BMS=JSON.parse(LS.get('sz_bm')||'[]');}catch(e){}
if(!BMS.length){BMS=[
  {id:1,name:'Canvas',url:'https://canvas.instructure.com',emoji:'🎓',cat:'School'},
  {id:2,name:'Khan Academy',url:'https://www.khanacademy.org',emoji:'📐',cat:'Resources'},
  {id:3,name:'Quizlet',url:'https://quizlet.com',emoji:'🃏',cat:'Resources'},
  {id:4,name:'Desmos',url:'https://www.desmos.com/calculator',emoji:'📈',cat:'Tools'},
  {id:5,name:'Google Drive',url:'https://drive.google.com',emoji:'💾',cat:'Tools'},
];LS.set('sz_bm',JSON.stringify(BMS));}

var CLS=[];try{CLS=JSON.parse(LS.get('sz_cls')||'[]');}catch(e){}

var GAMES=[
  {id:1,title:'Polytrack',emoji:'🏎️',cat:'Racing',color:'#1a0a2a',url:'https://gist.githubusercontent.com/Moai2222/f89d8c3e2982f853f38fecfffa021e34/raw/4fd784c33c1dde727b1df25d49f850ffd81206bd/polytrack.html'},
];

var bmF='All',gCat='All';

// ── BUILD UI ──────────────────────────────────────
var root=document.createElement('div');
root.id='sz-root';
root.innerHTML=`
<div id="sz-win">
  <div id="sz-nav">
    <div id="sz-logo">📚 StudyZone</div>
    <div id="sz-tabs">
      <button class="sz-tab active" data-sec="sz-bm">🔖 Bookmarks</button>
      <button class="sz-tab" data-sec="sz-gr">📊 Grades</button>
      <button class="sz-tab" data-sec="sz-gm">🎮 Games</button>
    </div>
    <button id="sz-xbtn">✕ Close</button>
  </div>
  <div id="sz-body">

    <div id="sz-bm" class="sz-sec active">
      <p class="sz-ph-h">Bookmarks</p>
      <p class="sz-ph-p">Your saved sites — opens right here on top of Canvas</p>
      <div class="sz-card">
        <p class="sz-card-h">+ Add Bookmark</p>
        <div class="sz-row"><input class="sz-inp" id="sz-bn" placeholder="Name"><input class="sz-inp" id="sz-bu" placeholder="URL"></div>
        <div class="sz-row">
          <input class="sz-inp" id="sz-be" placeholder="Emoji" style="max-width:80px;">
          <select class="sz-inp" id="sz-bc" style="flex:0;width:auto;"><option>School</option><option>Tools</option><option>Resources</option><option>Other</option></select>
          <button class="sz-btn" id="sz-addBM-btn">Add</button>
        </div>
      </div>
      <div class="sz-chips" id="sz-bm-chips">
        <button class="sz-chip active" data-cat="All">All</button>
        <button class="sz-chip" data-cat="School">School</button>
        <button class="sz-chip" data-cat="Tools">Tools</button>
        <button class="sz-chip" data-cat="Resources">Resources</button>
        <button class="sz-chip" data-cat="Other">Other</button>
      </div>
      <div class="bm-grid" id="sz-bm-grid"></div>
    </div>

    <div id="sz-gr" class="sz-sec">
      <p class="sz-ph-h">Grade Tracker</p>
      <p class="sz-ph-p">Track Canvas grades & GPA</p>
      <div class="gsc">
        <div class="sum-card"><div class="sum-n" id="sz-sc" style="color:#5b8af5">0</div><div class="sum-l">Classes</div></div>
        <div class="sum-card"><div class="sum-n" id="sz-sa" style="color:#34d399">—</div><div class="sum-l">Avg Grade</div></div>
        <div class="sum-card"><div class="sum-n" id="sz-sg" style="color:#a78bfa">—</div><div class="sum-l">GPA</div></div>
      </div>
      <div class="sz-card">
        <p class="sz-card-h">+ Add Class</p>
        <div class="sz-row"><input class="sz-inp" id="sz-cn" placeholder="Class name"><input class="sz-inp" id="sz-ct" placeholder="Teacher (optional)"></div>
        <button class="sz-btn" id="sz-addCLS-btn">Add Class</button>
      </div>
      <div id="sz-cls-list"></div>
    </div>

    <div id="sz-gm" class="sz-sec">
      <p class="sz-ph-h">Games</p>
      <p class="sz-ph-p">Click a game to play it fullscreen</p>
      <input class="sz-inp" id="sz-gsearch" placeholder="🔍 Search games..." style="margin-bottom:.75rem;">
      <div class="sz-chips" id="sz-gf">
        <button class="sz-chip active" data-gcat="All">All</button>
        <button class="sz-chip" data-gcat="Racing">Racing</button>
        <button class="sz-chip" data-gcat="Arcade">Arcade</button>
        <button class="sz-chip" data-gcat="Puzzle">Puzzle</button>
        <button class="sz-chip" data-gcat="Action">Action</button>
      </div>
      <div class="gg" id="sz-gg"></div>
    </div>

  </div>
</div>

<div class="brow-modal" id="sz-brow">
  <div class="brow-win">
    <div class="brow-bar">
      <div class="brow-dots">
        <div class="brow-dot r" id="sz-brow-x"></div>
        <div class="brow-dot y"></div>
        <div class="brow-dot g"></div>
      </div>
      <div class="brow-urlbar" id="sz-brow-url">about:blank</div>
    </div>
    <div class="brow-body2">
      <div class="brow-blocked" id="sz-brow-blocked" style="display:none;">
        <div style="font-size:2.5rem;">🚫</div>
        <h2>Can't embed this site</h2>
        <p>This site blocks iframes. Open it directly instead.</p>
        <a id="sz-brow-link" href="#" target="_blank">Open in new tab →</a>
      </div>
      <iframe id="sz-brow-iframe" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    </div>
  </div>
</div>

<div class="gmod" id="sz-gmod">
  <div class="gmi2">
    <div class="gmh2">
      <div class="gmt2" id="sz-gtitle">Game</div>
      <button class="sz-btn del sml" id="sz-gmod-x">✕ Close</button>
    </div>
    <iframe class="gframe" id="sz-gframe" allow="fullscreen" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"></iframe>
  </div>
</div>
`;
document.body.appendChild(root);

// ── WIRE UP ALL EVENTS via delegation ────────────
// This avoids onclick= in HTML which can be blocked by CSP

// Close main
root.querySelector('#sz-xbtn').addEventListener('click',function(){root.remove();});

// Nav tabs
root.querySelector('#sz-tabs').addEventListener('click',function(e){
  var btn=e.target.closest('.sz-tab');
  if(!btn)return;
  root.querySelectorAll('.sz-tab').forEach(function(t){t.classList.remove('active');});
  root.querySelectorAll('.sz-sec').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  root.getElementById ? root.getElementById(btn.dataset.sec) : document.getElementById(btn.dataset.sec);
  document.getElementById(btn.dataset.sec).classList.add('active');
});

// Bookmark category chips
root.querySelector('#sz-bm-chips').addEventListener('click',function(e){
  var chip=e.target.closest('.sz-chip');
  if(!chip)return;
  root.querySelectorAll('#sz-bm-chips .sz-chip').forEach(function(c){c.classList.remove('active');});
  chip.classList.add('active');
  bmF=chip.dataset.cat;
  szRenderBM();
});

// Add bookmark
root.querySelector('#sz-addBM-btn').addEventListener('click',function(){
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
  szRenderBM();
});

// Bookmark grid delegation (open/delete)
document.getElementById('sz-bm-grid').addEventListener('click',function(e){
  var ob=e.target.closest('[data-open]');
  var db=e.target.closest('[data-del]');
  if(ob){szOpenBrow(ob.dataset.open,ob.dataset.name);}
  if(db){BMS=BMS.filter(function(b){return b.id!=db.dataset.del;});LS.set('sz_bm',JSON.stringify(BMS));szRenderBM();}
});

// Browser modal close
document.getElementById('sz-brow-x').addEventListener('click',szCloseBrow);
document.getElementById('sz-brow').addEventListener('click',function(e){if(e.target===this)szCloseBrow();});

// Add class
root.querySelector('#sz-addCLS-btn').addEventListener('click',function(){
  var n=document.getElementById('sz-cn').value.trim();
  var t=document.getElementById('sz-ct').value.trim();
  if(!n){alert('Enter a class name.');return;}
  CLS.push({id:Date.now(),name:n,teacher:t,asgns:[]});
  LS.set('sz_cls',JSON.stringify(CLS));
  document.getElementById('sz-cn').value='';
  document.getElementById('sz-ct').value='';
  szRenderCLS();
});

// Class list delegation
document.getElementById('sz-cls-list').addEventListener('click',function(e){
  var delc=e.target.closest('[data-delcls]');
  var dela=e.target.closest('[data-dela]');
  var adda=e.target.closest('[data-adda]');
  if(delc){CLS=CLS.filter(function(c){return c.id!=delc.dataset.delcls;});LS.set('sz_cls',JSON.stringify(CLS));szRenderCLS();}
  if(dela){var cid=parseInt(dela.dataset.cid),aid=parseInt(dela.dataset.dela);var cl=CLS.find(function(c){return c.id===cid;});cl.asgns=cl.asgns.filter(function(a){return a.id!==aid;});LS.set('sz_cls',JSON.stringify(CLS));szRenderCLS();}
  if(adda){
    var cid=parseInt(adda.dataset.adda);
    var ne=document.getElementById('sz-an-'+cid),ee=document.getElementById('sz-ae-'+cid),te=document.getElementById('sz-at-'+cid);
    var nm=ne.value.trim()||'Assignment',earned=parseFloat(ee.value),total=parseFloat(te.value);
    if(isNaN(earned)||isNaN(total)||total<=0){alert('Enter valid points.');return;}
    CLS.find(function(c){return c.id===cid;}).asgns.push({id:Date.now(),name:nm,earned:earned,total:total});
    ne.value='';ee.value='';te.value='';
    LS.set('sz_cls',JSON.stringify(CLS));szRenderCLS();
  }
});

// Game category chips
document.getElementById('sz-gf').addEventListener('click',function(e){
  var chip=e.target.closest('.sz-chip');
  if(!chip)return;
  document.querySelectorAll('#sz-gf .sz-chip').forEach(function(c){c.classList.remove('active');});
  chip.classList.add('active');
  gCat=chip.dataset.gcat;
  szFilterG();
});

// Game search
document.getElementById('sz-gsearch').addEventListener('input',szFilterG);

// Game grid delegation
document.getElementById('sz-gg').addEventListener('click',function(e){
  var btn=e.target.closest('[data-gid]');
  if(!btn)return;
  var game=GAMES.find(function(g){return g.id==btn.dataset.gid;});
  if(game)szOpenGame(game);
});

// Game modal close
document.getElementById('sz-gmod-x').addEventListener('click',szCloseGame);
document.getElementById('sz-gmod').addEventListener('click',function(e){if(e.target===this)szCloseGame();});

// Close on Escape
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if(document.getElementById('sz-gmod').classList.contains('open'))szCloseGame();
    else if(document.getElementById('sz-brow').classList.contains('open'))szCloseBrow();
    else if(document.getElementById('sz-root'))document.getElementById('sz-root').remove();
  }
});

// ── FUNCTIONS ────────────────────────────────────

function szRenderBM(){
  var g=document.getElementById('sz-bm-grid');
  var list=bmF==='All'?BMS:BMS.filter(function(b){return b.cat===bmF;});
  if(!list.length){g.innerHTML='<p style="color:#6b7280;padding:1rem;">No bookmarks yet.</p>';return;}
  g.innerHTML=list.map(function(b){
    return '<div class="bm-card">'+
      '<div class="bm-top"><div class="bm-icon">'+b.emoji+'</div>'+
      '<div style="min-width:0;"><div class="bm-name">'+b.name+'</div><div class="bm-url">'+b.url+'</div></div></div>'+
      '<div class="bm-cat">'+b.cat+'</div>'+
      '<div class="bm-acts">'+
      '<button class="sz-btn sml" style="flex:1;" data-open="'+encodeHTML(b.url)+'" data-name="'+encodeHTML(b.name)+'">'+b.emoji+' Open</button>'+
      '<button class="sz-btn del sml" data-del="'+b.id+'">✕</button>'+
      '</div></div>';
  }).join('');
}

function encodeHTML(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function szOpenBrow(url,name){
  var ifr=document.getElementById('sz-brow-iframe');
  var bl=document.getElementById('sz-brow-blocked');
  document.getElementById('sz-brow-url').textContent=decodeURIComponent(url);
  document.getElementById('sz-brow-link').href=decodeURIComponent(url);
  bl.style.display='none';ifr.style.display='block';
  ifr.src='';
  setTimeout(function(){
    ifr.src=decodeURIComponent(url);
    ifr.onerror=function(){bl.style.display='flex';ifr.style.display='none';};
  },10);
  document.getElementById('sz-brow').classList.add('open');
}

function szCloseBrow(){
  document.getElementById('sz-brow').classList.remove('open');
  document.getElementById('sz-brow-iframe').src='';
}

function szCG(a){if(!a.length)return null;var e=a.reduce(function(s,x){return s+x.earned;},0),t=a.reduce(function(s,x){return s+x.total;},0);return t>0?e/t*100:null;}
function szGL(g){if(g>=93)return{l:'A',c:'#34d399'};if(g>=90)return{l:'A−',c:'#34d399'};if(g>=87)return{l:'B+',c:'#fbbf24'};if(g>=83)return{l:'B',c:'#fbbf24'};if(g>=80)return{l:'B−',c:'#fbbf24'};if(g>=70)return{l:'C',c:'#f87171'};if(g>=60)return{l:'D',c:'#f87171'};return{l:'F',c:'#f87171'};}
function szGP(g){if(g>=93)return 4;if(g>=90)return 3.7;if(g>=87)return 3.3;if(g>=83)return 3;if(g>=80)return 2.7;if(g>=70)return 2;if(g>=60)return 1;return 0;}

function szRenderCLS(){
  var list=document.getElementById('sz-cls-list');
  var graded=CLS.map(function(c){return szCG(c.asgns);}).filter(function(g){return g!==null;});
  document.getElementById('sz-sc').textContent=CLS.length;
  if(graded.length){
    var avg=graded.reduce(function(a,b){return a+b;},0)/graded.length;
    var gpa=graded.reduce(function(a,b){return a+szGP(b);},0)/graded.length;
    document.getElementById('sz-sa').textContent=avg.toFixed(1)+'%';
    document.getElementById('sz-sg').textContent=gpa.toFixed(2);
  }else{document.getElementById('sz-sa').textContent='—';document.getElementById('sz-sg').textContent='—';}
  if(!CLS.length){list.innerHTML='<p style="color:#6b7280;padding:1rem;">No classes yet.</p>';return;}
  list.innerHTML=CLS.map(function(cls){
    var grade=szCG(cls.asgns),pct=grade!==null?grade.toFixed(1):null,letter=pct?szGL(parseFloat(pct)):null;
    var bc=pct?(parseFloat(pct)>=80?'#34d399':parseFloat(pct)>=70?'#fbbf24':'#f87171'):'#2a2f42',bw=pct?Math.min(parseFloat(pct),100):0;
    return '<div class="cls-card">'+
      '<div class="cls-top"><div><div class="cls-name">'+cls.name+'</div>'+(cls.teacher?'<div style="font-size:.72rem;color:#6b7280;">'+cls.teacher+'</div>':'')+
      '</div><div style="display:flex;align-items:center;gap:8px;">'+(pct?'<div style="text-align:right;"><div style="font-size:1.1rem;font-weight:800;color:'+letter.c+';">'+letter.l+'</div><div style="font-size:.7rem;color:#6b7280;">'+pct+'%</div></div>':'<span style="font-size:.78rem;color:#6b7280;">No grades</span>')+
      '<button class="sz-btn del sml" data-delcls="'+cls.id+'">✕</button></div></div>'+
      '<div class="sz-pb"><div class="sz-pf" style="width:'+bw+'%;background:'+bc+';"></div></div>'+
      (cls.asgns.length?'<table class="sz-at"><tr><th>Name</th><th>Got</th><th>Of</th><th>%</th><th></th></tr>'+
        cls.asgns.map(function(a){var ap=a.earned/a.total*100;return'<tr><td>'+a.name+'</td><td style="text-align:center;">'+a.earned+'</td><td style="text-align:center;">'+a.total+'</td><td style="text-align:center;color:'+(ap>=80?'#34d399':ap>=70?'#fbbf24':'#f87171')+';">'+ap.toFixed(0)+'%</td><td><button class="sz-btn del sml" data-dela="'+a.id+'" data-cid="'+cls.id+'">✕</button></td></tr>';}).join('')+'</table>':'')+
      '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:6px;">'+
      '<input class="sz-inp" id="sz-an-'+cls.id+'" placeholder="Assignment" style="flex:2;min-width:80px;">'+
      '<input class="sz-inp" id="sz-ae-'+cls.id+'" placeholder="Got" type="number" style="width:60px;">'+
      '<input class="sz-inp" id="sz-at-'+cls.id+'" placeholder="Of" type="number" style="width:60px;">'+
      '<button class="sz-btn sml" data-adda="'+cls.id+'">+ Add</button></div></div>';
  }).join('');
}

function szFilterG(){
  var q=document.getElementById('sz-gsearch').value.toLowerCase();
  var list=GAMES.filter(function(g){return g.title.toLowerCase().includes(q)&&(gCat==='All'||g.cat===gCat);});
  var grid=document.getElementById('sz-gg');
  if(!list.length){grid.innerHTML='<p style="color:#6b7280;">No games found.</p>';return;}
  grid.innerHTML=list.map(function(g){
    return '<div class="gc" data-gid="'+g.id+'">'+
      '<div class="gt" style="background:'+g.color+'"><span style="position:relative;z-index:1;">'+g.emoji+'</span></div>'+
      '<div class="gi3"><div class="gtt">'+g.title+'</div>'+
      '<div class="gm2"><span class="gtag">'+g.cat+'</span><button class="gpb3" data-gid="'+g.id+'">▶ Play</button></div></div></div>';
  }).join('');
}

function szOpenGame(game){
  document.getElementById('sz-gtitle').textContent=game.emoji+' '+game.title;
  document.getElementById('sz-gframe').src=game.url;
  document.getElementById('sz-gmod').classList.add('open');
}

function szCloseGame(){
  document.getElementById('sz-gmod').classList.remove('open');
  document.getElementById('sz-gframe').src='';
}

// ── INIT ─────────────────────────────────────────
szRenderBM();
szRenderCLS();
szFilterG();

})();
