(function(){
if(document.getElementById('sz-root'))return;

// ── STYLES ──────────────────────────────────────
var s=document.createElement('style');
s.textContent=`
#sz-root{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;font-family:'Segoe UI',sans-serif;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px)}
#sz-win{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#161920;border:1px solid #2a2f42;border-radius:16px;width:95vw;max-width:1100px;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.8)}
#sz-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #2a2f42;background:#0d0f14;flex-shrink:0}
#sz-logo{font-weight:800;font-size:1.1rem;color:#5b8af5}
#sz-tabs{display:flex;gap:4px;background:#1e2230;border:1px solid #2a2f42;border-radius:8px;padding:3px}
.sz-tab{padding:5px 14px;border-radius:6px;border:none;background:transparent;color:#6b7280;font-size:.8rem;cursor:pointer;font-family:inherit}
.sz-tab.active{background:#5b8af5;color:#fff}
#sz-close-btn{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:5px 12px;cursor:pointer;font-size:.82rem;font-family:inherit}
#sz-body{flex:1;overflow-y:auto;padding:1.5rem}
.sz-sec{display:none}.sz-sec.active{display:block}
.sz-ph h1{font-weight:800;font-size:1.5rem;color:#e8eaf0;margin:0 0 4px}
.sz-ph p{color:#6b7280;font-size:.85rem;margin:0 0 1.25rem}
.sz-card{background:#1e2230;border:1px solid #2a2f42;border-radius:12px;padding:1rem;margin-bottom:1rem}
.sz-card h3{color:#e8eaf0;font-size:.9rem;font-weight:700;margin:0 0 .75rem}
.sz-inp{background:#161920;border:1px solid #2a2f42;border-radius:8px;padding:8px 12px;color:#e8eaf0;font-size:.82rem;outline:none;width:100%;box-sizing:border-box;font-family:inherit}
.sz-inp:focus{border-color:#5b8af5}
.sz-row{display:flex;gap:6px;margin-bottom:6px}
.sz-row .sz-inp{width:auto;flex:1}
.sz-btn{padding:7px 14px;border-radius:8px;border:none;background:#5b8af5;color:#fff;font-size:.8rem;cursor:pointer;font-family:inherit;white-space:nowrap}
.sz-btn.del{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3)}
.sz-btn.sml{padding:4px 9px;font-size:.72rem}
.sz-chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1rem}
.sz-chip{padding:4px 12px;border-radius:20px;border:1px solid #2a2f42;background:transparent;color:#6b7280;font-size:.75rem;cursor:pointer;font-family:inherit}
.sz-chip.active{background:#5b8af5;border-color:#5b8af5;color:#fff}
.bm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.bm-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;display:flex;flex-direction:column;gap:6px}
.bm-top{display:flex;align-items:center;gap:8px}
.bm-icon{width:32px;height:32px;border-radius:7px;background:#161920;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.bm-name{font-weight:600;font-size:.85rem;color:#e8eaf0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bm-url{font-size:.7rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bm-cat{font-size:.65rem;padding:2px 7px;border-radius:8px;background:rgba(91,138,245,.15);color:#5b8af5;width:fit-content}
.bm-acts{display:flex;gap:5px;margin-top:auto}
.gsc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1rem}
.sum-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;text-align:center}
.sum-n{font-size:1.6rem;font-weight:800;line-height:1;margin-bottom:3px}
.sum-l{font-size:.72rem;color:#6b7280}
.cls-card{background:#1e2230;border:1px solid #2a2f42;border-radius:10px;padding:.85rem;margin-bottom:.75rem}
.cls-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.cls-name{font-weight:600;font-size:.88rem;color:#e8eaf0}
.pb{height:5px;background:#161920;border-radius:3px;overflow:hidden;margin-bottom:6px}
.pf{height:100%;border-radius:3px}
.at{width:100%;border-collapse:collapse;font-size:.75rem;margin-bottom:6px}
.at th{text-align:left;padding:4px 6px;color:#6b7280;border-bottom:1px solid #2a2f42}
.at td{padding:3px 6px;color:#e8eaf0;border-bottom:1px solid rgba(42,47,66,.5)}
.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px}
.gc{background:#1e2230;border:1px solid #2a2f42;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s}
.gc:hover{transform:translateY(-2px);border-color:rgba(91,138,245,.4)}
.gt{height:88px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;position:relative}
.gt::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(22,25,32,.9))}
.gi3{padding:8px 10px 10px}
.gtt{font-weight:600;font-size:.8rem;color:#e8eaf0;margin-bottom:3px}
.gm2{display:flex;justify-content:space-between;align-items:center}
.gtag{font-size:.65rem;padding:2px 7px;border-radius:8px;border:1px solid #2a2f42;color:#6b7280}
.gpb3{font-size:.68rem;padding:3px 9px;border-radius:5px;border:none;background:#5b8af5;color:#fff;cursor:pointer;font-family:inherit}
/* Game modal */
.gmod{position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center}
.gmod.open{display:flex}
.gmi2{background:#161920;border:1px solid #2a2f42;border-radius:14px;width:95vw;max-width:800px;display:flex;flex-direction:column;max-height:92vh}
.gmh2{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border-bottom:1px solid #2a2f42;flex-shrink:0}
.gmt2{font-weight:700;font-size:.9rem;color:#e8eaf0}
.gcw{background:#111;flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:400px}
.gcw canvas{display:block;max-width:100%;max-height:440px}
.ghud{position:absolute;top:6px;left:8px;right:8px;display:flex;justify-content:space-between;pointer-events:none;font-size:.78rem;color:#fff;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)}
.gctrl2{padding:6px 12px;border-top:1px solid #2a2f42;font-size:.72rem;color:#6b7280;flex-shrink:0}
/* Browser modal */
.brow-modal{position:fixed;inset:0;z-index:9999998;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;padding:1rem}
.brow-modal.open{display:flex}
.brow-win{background:#161920;border:1px solid #2a2f42;border-radius:14px;width:100%;max-width:1050px;height:86vh;display:flex;flex-direction:column;overflow:hidden}
.brow-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #2a2f42;background:#1e2230;flex-shrink:0}
.brow-dots{display:flex;gap:5px}
.brow-dot{width:11px;height:11px;border-radius:50%;cursor:pointer}
.brow-dot.r{background:#f87171}.brow-dot.y{background:#fbbf24}.brow-dot.g{background:#34d399}
.brow-url-bar{flex:1;background:#161920;border:1px solid #2a2f42;border-radius:7px;padding:5px 10px;font-size:.78rem;color:#6b7280;font-family:inherit}
.brow-body2{flex:1;position:relative}
.brow-body2 iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.brow-blocked{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;background:#0d0f14;text-align:center;padding:2rem}
.brow-blocked h2{color:#e8eaf0;font-size:1.1rem;margin:0}
.brow-blocked p{color:#6b7280;font-size:.82rem;max-width:300px;margin:0}
.brow-blocked a{color:#5b8af5;font-size:.85rem}
`;
document.head.appendChild(s);

// ── LOCALSTORAGE WRAPPER ─────────────────────────
var LS=(function(){var m={};return{get:function(k){try{return localStorage.getItem(k);}catch(e){return m[k]||null;}},set:function(k,v){try{localStorage.setItem(k,v);}catch(e){m[k]=v;}}};})();

// ── DATA ────────────────────────────────────────
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
  {id:1,title:'Snake',emoji:'🐍',cat:'Classic',color:'#0d2b0d',desc:'Arrow keys · Space restart'},
  {id:2,title:'Breakout',emoji:'🧱',cat:'Arcade',color:'#1a1a3a',desc:'Mouse or ← → · Space restart'},
  {id:3,title:'2048',emoji:'🔢',cat:'Puzzle',color:'#2d1e0f',desc:'Arrow keys to slide'},
  {id:4,title:'Flappy Bird',emoji:'🐦',cat:'Arcade',color:'#0a2a3a',desc:'Click or Space to flap'},
  {id:5,title:'Tetris',emoji:'🧩',cat:'Classic',color:'#0d0d2b',desc:'← → ↑ rotate Space drop'},
  {id:6,title:'Asteroids',emoji:'🚀',cat:'Action',color:'#0a0a1a',desc:'← → ↑ Space shoot'},
  {id:7,title:'Memory',emoji:'🃏',cat:'Puzzle',color:'#1a0d2b',desc:'Click pairs'},
  {id:8,title:'Whack-a-Mole',emoji:'🐹',cat:'Arcade',color:'#1a2d0a',desc:'Click the moles!'},
  {id:9,title:'Pong',emoji:'🏓',cat:'Classic',color:'#0d0d0d',desc:'W/S vs ↑/↓'},
  {id:10,title:'Minesweeper',emoji:'💣',cat:'Puzzle',color:'#2a1a0a',desc:'Click reveal · Right-click flag'},
  {id:11,title:'Space Invaders',emoji:'👾',cat:'Action',color:'#00050f',desc:'← → Space shoot'},
  {id:12,title:'Pac-Man',emoji:'🟡',cat:'Arcade',color:'#000a00',desc:'Arrow keys'},
];
var bmF='All',gCat='All',gLoop=null,gKeys={},gActive=false;

// ── HTML ─────────────────────────────────────────
var root=document.createElement('div');
root.id='sz-root';
root.innerHTML=`
<div id="sz-win">
  <div id="sz-nav">
    <div id="sz-logo">📚 StudyZone</div>
    <div id="sz-tabs">
      <button class="sz-tab active" onclick="szTab('bm',this)">🔖 Bookmarks</button>
      <button class="sz-tab" onclick="szTab('gr',this)">📊 Grades</button>
      <button class="sz-tab" onclick="szTab('gm',this)">🎮 Games</button>
    </div>
    <button id="sz-close-btn">✕ Close</button>
  </div>
  <div id="sz-body">
    <div id="sz-bm" class="sz-sec active">
      <div class="sz-ph"><h1>Bookmarks</h1><p>Your saved sites — opens right here on top of Canvas</p></div>
      <div class="sz-card"><h3>+ Add Bookmark</h3>
        <div class="sz-row"><input class="sz-inp" id="sz-bn" placeholder="Name"><input class="sz-inp" id="sz-bu" placeholder="URL"></div>
        <div class="sz-row"><input class="sz-inp" id="sz-be" placeholder="Emoji"><select class="sz-inp" id="sz-bc" style="width:auto;flex:0"><option>School</option><option>Tools</option><option>Resources</option><option>Other</option></select><button class="sz-btn" onclick="szAddBM()">Add</button></div>
      </div>
      <div class="sz-chips" id="sz-bm-chips">
        <button class="sz-chip active" onclick="szFilterBM('All',this)">All</button>
        <button class="sz-chip" onclick="szFilterBM('School',this)">School</button>
        <button class="sz-chip" onclick="szFilterBM('Tools',this)">Tools</button>
        <button class="sz-chip" onclick="szFilterBM('Resources',this)">Resources</button>
        <button class="sz-chip" onclick="szFilterBM('Other',this)">Other</button>
      </div>
      <div class="bm-grid" id="sz-bm-grid"></div>
    </div>
    <div id="sz-gr" class="sz-sec">
      <div class="sz-ph"><h1>Grade Tracker</h1><p>Track Canvas grades & GPA without logging in</p></div>
      <div class="gsc">
        <div class="sum-card"><div class="sum-n" id="sz-sc" style="color:#5b8af5">0</div><div class="sum-l">Classes</div></div>
        <div class="sum-card"><div class="sum-n" id="sz-sa" style="color:#34d399">—</div><div class="sum-l">Avg Grade</div></div>
        <div class="sum-card"><div class="sum-n" id="sz-sg" style="color:#a78bfa">—</div><div class="sum-l">GPA</div></div>
      </div>
      <div class="sz-card"><h3>+ Add Class</h3>
        <div class="sz-row"><input class="sz-inp" id="sz-cn" placeholder="Class name"><input class="sz-inp" id="sz-ct" placeholder="Teacher (optional)"></div>
        <button class="sz-btn" onclick="szAddCLS()">Add Class</button>
      </div>
      <div id="sz-cls-list"></div>
    </div>
    <div id="sz-gm" class="sz-sec">
      <div class="sz-ph"><h1>Games</h1><p>All run in your browser — nothing to block</p></div>
      <input class="sz-inp" id="sz-gsearch" placeholder="🔍 Search games..." oninput="szFilterG()" style="margin-bottom:.75rem">
      <div class="sz-chips" id="sz-gf">
        <button class="sz-chip active" onclick="szGCat('All',this)">All</button>
        <button class="sz-chip" onclick="szGCat('Arcade',this)">Arcade</button>
        <button class="sz-chip" onclick="szGCat('Puzzle',this)">Puzzle</button>
        <button class="sz-chip" onclick="szGCat('Action',this)">Action</button>
        <button class="sz-chip" onclick="szGCat('Classic',this)">Classic</button>
      </div>
      <div class="gg" id="sz-gg"></div>
    </div>
  </div>
</div>
<div class="brow-modal" id="sz-brow">
  <div class="brow-win">
    <div class="brow-bar">
      <div class="brow-dots">
        <div class="brow-dot r" id="sz-brow-close"></div>
        <div class="brow-dot y"></div>
        <div class="brow-dot g"></div>
      </div>
      <div class="brow-url-bar" id="sz-brow-url">about:blank</div>
    </div>
    <div class="brow-body2">
      <div class="brow-blocked" id="sz-brow-blocked" style="display:none">
        <div style="font-size:2.5rem">🚫</div>
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
      <button class="sz-btn del sml" onclick="szCloseGame()">✕ Close</button>
    </div>
    <div class="gcw" id="sz-gcw">
      <div class="ghud"><span id="sz-hl"></span><span id="sz-hr"></span></div>
    </div>
    <div class="gctrl2" id="sz-gctrl"></div>
  </div>
</div>`;
document.body.appendChild(root);

// ── EVENTS ───────────────────────────────────────
document.getElementById('sz-close-btn').onclick=function(){szCloseGame();root.remove();};
document.getElementById('sz-brow-close').onclick=szCloseBrow;
document.addEventListener('keydown',function(e){gKeys[e.key]=true;if(gActive&&[' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(e.key==='Escape'&&!gActive)root.remove();});
document.addEventListener('keyup',function(e){gKeys[e.key]=false;});

// ── NAV ──────────────────────────────────────────
window.szTab=function(id,el){
  document.querySelectorAll('.sz-sec').forEach(function(s){s.classList.remove('active');});
  document.querySelectorAll('.sz-tab').forEach(function(t){t.classList.remove('active');});
  document.getElementById('sz-'+id).classList.add('active');
  el.classList.add('active');
};

// ── BOOKMARKS ────────────────────────────────────
window.szAddBM=function(){
  var n=document.getElementById('sz-bn').value.trim();
  var u=document.getElementById('sz-bu').value.trim();
  var e=document.getElementById('sz-be').value.trim()||'🌐';
  var c=document.getElementById('sz-bc').value;
  if(!n||!u){alert('Enter name and URL');return;}
  BMS.push({id:Date.now(),name:n,url:u.startsWith('http')?u:'https://'+u,emoji:e,cat:c});
  LS.set('sz_bm',JSON.stringify(BMS));
  document.getElementById('sz-bn').value='';
  document.getElementById('sz-bu').value='';
  document.getElementById('sz-be').value='';
  szRenderBM();
};
window.szDelBM=function(id){BMS=BMS.filter(function(b){return b.id!==id;});LS.set('sz_bm',JSON.stringify(BMS));szRenderBM();};
window.szFilterBM=function(cat,el){bmF=cat;document.querySelectorAll('#sz-bm-chips .sz-chip').forEach(function(c){c.classList.remove('active');});el.classList.add('active');szRenderBM();};
window.szOpenBrow=function(url,name){
  var m=document.getElementById('sz-brow');
  var ifr=document.getElementById('sz-brow-iframe');
  var bl=document.getElementById('sz-brow-blocked');
  document.getElementById('sz-brow-url').textContent=url;
  document.getElementById('sz-brow-link').href=url;
  bl.style.display='none';ifr.style.display='block';
  ifr.src='';
  setTimeout(function(){ifr.src=url;ifr.onerror=function(){bl.style.display='flex';ifr.style.display='none';};},10);
  m.classList.add('open');
};
window.szCloseBrow=function(){document.getElementById('sz-brow').classList.remove('open');document.getElementById('sz-brow-iframe').src='';};
window.szRenderBM=function(){
  var g=document.getElementById('sz-bm-grid');
  var list=bmF==='All'?BMS:BMS.filter(function(b){return b.cat===bmF;});
  if(!list.length){g.innerHTML='<p style="color:#6b7280;padding:1rem">No bookmarks yet.</p>';return;}
  g.innerHTML=list.map(function(b){
    var safeUrl=b.url.replace(/'/g,"\\'");
    var safeName=b.name.replace(/'/g,"\\'");
    return '<div class="bm-card"><div class="bm-top"><div class="bm-icon">'+b.emoji+'</div><div style="min-width:0"><div class="bm-name">'+b.name+'</div><div class="bm-url">'+b.url+'</div></div></div><div class="bm-cat">'+b.cat+'</div><div class="bm-acts"><button class="sz-btn sml" style="flex:1" onclick="szOpenBrow(\''+safeUrl+'\',\''+safeName+'\')">'+b.emoji+' Open</button><button class="sz-btn del sml" onclick="szDelBM('+b.id+')">✕</button></div></div>';
  }).join('');
};

// ── GRADES ───────────────────────────────────────
window.szAddCLS=function(){
  var n=document.getElementById('sz-cn').value.trim();
  var t=document.getElementById('sz-ct').value.trim();
  if(!n){alert('Enter class name');return;}
  CLS.push({id:Date.now(),name:n,teacher:t,asgns:[]});
  LS.set('sz_cls',JSON.stringify(CLS));
  document.getElementById('sz-cn').value='';document.getElementById('sz-ct').value='';
  szRenderCLS();
};
window.szDelCLS=function(id){CLS=CLS.filter(function(c){return c.id!==id;});LS.set('sz_cls',JSON.stringify(CLS));szRenderCLS();};
window.szAddA=function(cid){
  var ne=document.getElementById('sz-an-'+cid),ee=document.getElementById('sz-ae-'+cid),te=document.getElementById('sz-at-'+cid);
  var nm=ne.value.trim()||'Assignment',earned=parseFloat(ee.value),total=parseFloat(te.value);
  if(isNaN(earned)||isNaN(total)||total<=0){alert('Enter valid points');return;}
  CLS.find(function(c){return c.id===cid;}).asgns.push({id:Date.now(),name:nm,earned:earned,total:total});
  ne.value='';ee.value='';te.value='';LS.set('sz_cls',JSON.stringify(CLS));szRenderCLS();
};
window.szDelA=function(cid,aid){var cls=CLS.find(function(c){return c.id===cid;});cls.asgns=cls.asgns.filter(function(a){return a.id!==aid;});LS.set('sz_cls',JSON.stringify(CLS));szRenderCLS();};
function szCG(a){if(!a.length)return null;var e=a.reduce(function(s,x){return s+x.earned;},0),t=a.reduce(function(s,x){return s+x.total;},0);return t>0?e/t*100:null;}
function szGL(g){if(g>=93)return{l:'A',c:'#34d399'};if(g>=90)return{l:'A−',c:'#34d399'};if(g>=87)return{l:'B+',c:'#fbbf24'};if(g>=83)return{l:'B',c:'#fbbf24'};if(g>=80)return{l:'B−',c:'#fbbf24'};if(g>=70)return{l:'C',c:'#f87171'};if(g>=60)return{l:'D',c:'#f87171'};return{l:'F',c:'#f87171'};}
function szGP(g){if(g>=93)return 4;if(g>=90)return 3.7;if(g>=87)return 3.3;if(g>=83)return 3;if(g>=80)return 2.7;if(g>=70)return 2;if(g>=60)return 1;return 0;}
window.szRenderCLS=function(){
  var list=document.getElementById('sz-cls-list');
  var graded=CLS.map(function(c){return szCG(c.asgns);}).filter(function(g){return g!==null;});
  document.getElementById('sz-sc').textContent=CLS.length;
  if(graded.length){var avg=graded.reduce(function(a,b){return a+b;},0)/graded.length,gpa=graded.reduce(function(a,b){return a+szGP(b);},0)/graded.length;document.getElementById('sz-sa').textContent=avg.toFixed(1)+'%';document.getElementById('sz-sg').textContent=gpa.toFixed(2);}
  else{document.getElementById('sz-sa').textContent='—';document.getElementById('sz-sg').textContent='—';}
  if(!CLS.length){list.innerHTML='<p style="color:#6b7280;padding:1rem">No classes yet.</p>';return;}
  list.innerHTML=CLS.map(function(cls){
    var grade=szCG(cls.asgns),pct=grade!==null?grade.toFixed(1):null,letter=pct?szGL(parseFloat(pct)):null;
    var bc=pct?(parseFloat(pct)>=80?'#34d399':parseFloat(pct)>=70?'#fbbf24':'#f87171'):'#2a2f42',bw=pct?Math.min(parseFloat(pct),100):0;
    return '<div class="cls-card"><div class="cls-top"><div><div class="cls-name">'+cls.name+'</div>'+(cls.teacher?'<div style="font-size:.72rem;color:#6b7280">'+cls.teacher+'</div>':'')+
    '</div><div style="display:flex;align-items:center;gap:8px">'+(pct?'<div style="text-align:right"><div style="font-size:1.1rem;font-weight:800;color:'+letter.c+'">'+letter.l+'</div><div style="font-size:.7rem;color:#6b7280">'+pct+'%</div></div>':'<span style="font-size:.78rem;color:#6b7280">No grades</span>')+
    '<button class="sz-btn del sml" onclick="szDelCLS('+cls.id+')">✕</button></div></div>'+
    '<div class="pb"><div class="pf" style="width:'+bw+'%;background:'+bc+'"></div></div>'+
    (cls.asgns.length?'<table class="at"><tr><th>Name</th><th>Got</th><th>Of</th><th>%</th><th></th></tr>'+cls.asgns.map(function(a){var ap=a.earned/a.total*100;return'<tr><td>'+a.name+'</td><td style="text-align:center">'+a.earned+'</td><td style="text-align:center">'+a.total+'</td><td style="text-align:center;color:'+(ap>=80?'#34d399':ap>=70?'#fbbf24':'#f87171')+'">'+ap.toFixed(0)+'%</td><td><button class="sz-btn del sml" onclick="szDelA('+cls.id+','+a.id+')">✕</button></td></tr>';}).join('')+'</table>':'')+
    '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:6px">'+
    '<input class="sz-inp" id="sz-an-'+cls.id+'" placeholder="Assignment" style="flex:2;min-width:80px">'+
    '<input class="sz-inp" id="sz-ae-'+cls.id+'" placeholder="Got" type="number" style="width:60px">'+
    '<input class="sz-inp" id="sz-at-'+cls.id+'" placeholder="Of" type="number" style="width:60px">'+
    '<button class="sz-btn sml" onclick="szAddA('+cls.id+')">+ Add</button></div></div>';
  }).join('');
};

// ── GAMES LIST ───────────────────────────────────
window.szFilterG=function(){var q=document.getElementById('sz-gsearch').value.toLowerCase();szRenderG(GAMES.filter(function(g){return g.title.toLowerCase().includes(q)&&(gCat==='All'||g.cat===gCat);}));};
window.szGCat=function(cat,el){gCat=cat;document.querySelectorAll('#sz-gf .sz-chip').forEach(function(c){c.classList.remove('active');});el.classList.add('active');szFilterG();};
window.szRenderG=function(list){
  var g=document.getElementById('sz-gg');
  if(!list.length){g.innerHTML='<p style="color:#6b7280">No games found.</p>';return;}
  g.innerHTML=list.map(function(gm){return'<div class="gc"><div class="gt" style="background:'+gm.color+'"><span style="position:relative;z-index:1">'+gm.emoji+'</span></div><div class="gi3"><div class="gtt">'+gm.title+'</div><div class="gm2"><span class="gtag">'+gm.cat+'</span><button class="gpb3" onclick="szOpenGame('+gm.id+')">▶ Play</button></div></div></div>';}).join('');
};

// ── GAME ENGINE ──────────────────────────────────
function szStopGame(){gActive=false;if(gLoop){cancelAnimationFrame(gLoop);gLoop=null;}gKeys={};}
window.szCloseGame=function(){szStopGame();document.getElementById('sz-gmod').classList.remove('open');var w=document.getElementById('sz-gcw'),c=w.querySelector('canvas');if(c)c.remove();};
window.szOpenGame=function(id){
  szStopGame();
  var game=GAMES.find(function(g){return g.id===id;});
  document.getElementById('sz-gtitle').textContent=game.emoji+' '+game.title;
  document.getElementById('sz-gctrl').textContent='🕹️ '+game.desc;
  document.getElementById('sz-gmod').classList.add('open');
  var wrap=document.getElementById('sz-gcw'),old=wrap.querySelector('canvas');if(old)old.remove();
  var cv=document.createElement('canvas');cv.width=580;cv.height=420;cv.style.cssText='display:block;max-width:100%;max-height:420px;';
  wrap.appendChild(cv);
  document.getElementById('sz-hl').textContent='';document.getElementById('sz-hr').textContent='';
  gActive=true;gKeys={};
  setTimeout(function(){
    if(id===1)szSnake(cv);else if(id===2)szBreakout(cv);else if(id===3)sz2048(cv);
    else if(id===4)szFlappy(cv);else if(id===5)szTetris(cv);else if(id===6)szAsteroids(cv);
    else if(id===7)szMemory(cv);else if(id===8)szWhack(cv);else if(id===9)szPong(cv);
    else if(id===10)szMine(cv);else if(id===11)szInvaders(cv);else if(id===12)szPacman(cv);
  },30);
};
function szHud(l,r){document.getElementById('sz-hl').textContent=l;document.getElementById('sz-hr').textContent=r;}

// ── SNAKE ────────────────────────────────────────
function szSnake(cv){var ctx=cv.getContext('2d');var S=20,C=cv.width/S,R=cv.height/S,snake,dir,nd,food,sc,dead;function rs(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};nd={x:1,y:0};sc=0;dead=false;sf();}function sf(){food={x:Math.floor(Math.random()*C),y:Math.floor(Math.random()*R)};}rs();document.addEventListener('keydown',ok);function ok(e){if(!gActive){document.removeEventListener('keydown',ok);return;}if(e.key==='ArrowUp'&&dir.y!==1)nd={x:0,y:-1};if(e.key==='ArrowDown'&&dir.y!==-1)nd={x:0,y:1};if(e.key==='ArrowLeft'&&dir.x!==1)nd={x:-1,y:0};if(e.key==='ArrowRight'&&dir.x!==-1)nd={x:1,y:0};if(dead&&e.key===' ')rs();}var last=0;function loop(ts){if(!gActive)return;gLoop=requestAnimationFrame(loop);if(ts-last>130){last=ts;if(!dead){dir=nd;var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.x>=C||h.y<0||h.y>=R||snake.some(function(s){return s.x===h.x&&s.y===h.y;})){dead=true;}else{snake.unshift(h);if(h.x===food.x&&h.y===food.y){sc++;sf();}else snake.pop();}}}ctx.fillStyle='#0d2b0d';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#f87171';ctx.beginPath();ctx.arc(food.x*S+S/2,food.y*S+S/2,S/2-2,0,Math.PI*2);ctx.fill();snake.forEach(function(s,i){ctx.fillStyle=i===0?'#34d399':'#1d7a56';ctx.fillRect(s.x*S+1,s.y*S+1,S-2,S-2);});if(dead){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText('Game Over',cv.width/2,cv.height/2-14);ctx.font='16px sans-serif';ctx.fillText('Score: '+sc,cv.width/2,cv.height/2+12);ctx.fillText('Space to restart',cv.width/2,cv.height/2+38);}szHud('🐍 Snake','Score: '+sc);}gLoop=requestAnimationFrame(loop);}

// ── BREAKOUT ─────────────────────────────────────
function szBreakout(cv){var ctx=cv.getContext('2d');var W=cv.width,H=cv.height,px,py,pw,bx,by,bdx,bdy,br,bricks,sc,lives,dead,won;var BC=['#f87171','#fbbf24','#34d399','#5b8af5','#a78bfa'];function rs(){px=W/2-50;py=H-28;pw=100;br=7;bx=W/2;by=py-18;bdx=4;bdy=-4;sc=0;lives=3;dead=false;won=false;bricks=[];for(var r=0;r<5;r++)for(var c=0;c<10;c++)bricks.push({x:c*(W/10)+2,y:r*28+45,w:W/10-4,h:20,alive:true,color:BC[r]});}rs();cv.addEventListener('mousemove',function(e){var rect=cv.getBoundingClientRect();px=Math.max(0,Math.min(W-pw,(e.clientX-rect.left)*(W/rect.width)-pw/2));});document.addEventListener('keydown',ok2);function ok2(e){if(!gActive){document.removeEventListener('keydown',ok2);return;}if((dead||won)&&e.key===' ')rs();}function step(){if(dead||won)return;if(gKeys['ArrowLeft'])px=Math.max(0,px-6);if(gKeys['ArrowRight'])px=Math.min(W-pw,px+6);bx+=bdx;by+=bdy;if(bx-br<0){bx=br;bdx=Math.abs(bdx);}if(bx+br>W){bx=W-br;bdx=-Math.abs(bdx);}if(by-br<0){by=br;bdy=Math.abs(bdy);}if(by+br>py&&by-br<py+10&&bx>px&&bx<px+pw){by=py-br;bdy=-Math.abs(bdy);}if(by>H){lives--;if(lives<=0)dead=true;else{bx=W/2;by=py-18;bdx=4;bdy=-4;}}for(var i=0;i<bricks.length;i++){var b=bricks[i];if(!b.alive)continue;if(bx+br>b.x&&bx-br<b.x+b.w&&by+br>b.y&&by-br<b.y+b.h){b.alive=false;sc+=10;bdy*=-1;break;}}if(bricks.every(function(b){return !b.alive;}))won=true;}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();ctx.fillStyle='#1a1a3a';ctx.fillRect(0,0,W,H);bricks.forEach(function(b){if(!b.alive)return;ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);});ctx.fillStyle='#5b8af5';ctx.fillRect(px,py,pw,10);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();if(dead||won){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText(won?'You Win! 🎉':'Game Over',W/2,H/2-14);ctx.font='16px sans-serif';ctx.fillText('Score: '+sc+'  Space to restart',W/2,H/2+14);}szHud('🧱 Breakout','Score: '+sc+'  ❤️×'+lives);}gLoop=requestAnimationFrame(loop);}

// ── 2048 ─────────────────────────────────────────
function sz2048(cv){var ctx=cv.getContext('2d');var N=4,P=8,O=50,TC={'0':'#1e2230','2':'#3b4a6b','4':'#4a5a80','8':'#e67e22','16':'#e74c3c','32':'#c0392b','64':'#9b59b6','128':'#f1c40f','256':'#e67e22','512':'#e74c3c','1024':'#8e44ad','2048':'#27ae60'},grid,sc,best;best=parseInt(LS.get('sz_2048')||'0');function ng(){return[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];}function ar(g){var e=[];for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(!g[r][c])e.push([r,c]);if(!e.length)return;var p=e[Math.floor(Math.random()*e.length)];g[p[0]][p[1]]=Math.random()<.9?2:4;}function rs(){grid=ng();sc=0;ar(grid);ar(grid);}rs();function slide(row){var f=row.filter(function(x){return x;}),res=[],i=0;while(i<f.length){if(i+1<f.length&&f[i]===f[i+1]){res.push(f[i]*2);sc+=f[i]*2;i+=2;}else{res.push(f[i]);i++;}}while(res.length<N)res.push(0);return res;}function move(dir){var g=grid.map(function(r){return r.slice();}),ch=false;if(dir==='left'){g=g.map(function(r){var n=slide(r);if(n.join()!==r.join())ch=true;return n;});}else if(dir==='right'){g=g.map(function(r){var n=slide(r.slice().reverse()).reverse();if(n.join()!==r.join())ch=true;return n;});}else if(dir==='up'){for(var c=0;c<N;c++){var col=g.map(function(r){return r[c];}),ns=slide(col);ns.forEach(function(v,r){if(v!==g[r][c])ch=true;g[r][c]=v;});}}else if(dir==='down'){for(var c=0;c<N;c++){var col=g.map(function(r){return r[c];}).reverse(),ns=slide(col).reverse();ns.forEach(function(v,r){if(v!==g[r][c])ch=true;g[r][c]=v;});}}if(ch){grid=g;ar(grid);if(sc>best){best=sc;LS.set('sz_2048',best);}}}document.addEventListener('keydown',ok3);function ok3(e){if(!gActive){document.removeEventListener('keydown',ok3);return;}var m={'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'up','ArrowDown':'down'};if(m[e.key])move(m[e.key]);}var TW=(cv.width-P*(N+1))/N,TH=(cv.height-O-P*(N+1))/N;function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);ctx.fillStyle='#0d1117';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#e8eaf0';ctx.font='bold 16px sans-serif';ctx.textAlign='left';ctx.fillText('2048',P,34);ctx.textAlign='right';ctx.fillText('Score:'+sc+' Best:'+best,cv.width-P,34);for(var r=0;r<N;r++)for(var c=0;c<N;c++){var v=grid[r][c],x=P*2+c*(TW+P),y=O+P+r*(TH+P);ctx.fillStyle=TC[Math.min(v,2048).toString()]||'#6c3483';ctx.fillRect(x,y,TW,TH);if(v){ctx.fillStyle='#fff';var fs=v>999?18:v>99?22:28;ctx.font='bold '+fs+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v,x+TW/2,y+TH/2);ctx.textBaseline='alphabetic';}}szHud('🔢 2048','');}gLoop=requestAnimationFrame(loop);}

// ── FLAPPY ───────────────────────────────────────
function szFlappy(cv){var ctx=cv.getContext('2d');var W=cv.width,H=cv.height,by,bvy,pipes,sc,dead,started,fn;function rs(){by=H/2;bvy=0;pipes=[];sc=0;dead=false;started=false;fn=0;}rs();function flap(){if(dead){rs();return;}started=true;bvy=-8;}cv.addEventListener('click',flap);document.addEventListener('keydown',ok4);function ok4(e){if(!gActive){document.removeEventListener('keydown',ok4);return;}if(e.key===' ')flap();}function step(){if(!started||dead)return;fn++;bvy+=.45;by+=bvy;if(fn%90===0)pipes.push({x:W,top:55+Math.random()*(H-170),sc:false});pipes.forEach(function(p){p.x-=3;if(!p.sc&&p.x+40<90){p.sc=true;sc++;}});pipes=pipes.filter(function(p){return p.x>-60;});if(by+13>H||by-13<0)dead=true;pipes.forEach(function(p){if(90+13>p.x&&90-13<p.x+42&&(by-13<p.top||by+13>p.top+130))dead=true;});}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();ctx.fillStyle='#0a2a4a';ctx.fillRect(0,0,W,H);pipes.forEach(function(p){ctx.fillStyle='#34d399';ctx.fillRect(p.x,0,42,p.top);ctx.fillRect(p.x,p.top+130,42,H-p.top-130);ctx.fillStyle='#2ebd87';ctx.fillRect(p.x-4,p.top-16,50,16);ctx.fillRect(p.x-4,p.top+130,50,16);});ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.ellipse(90,by,13,11,0,0,Math.PI*2);ctx.fill();if(!started){ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('Click or Space to Start',W/2,H/2);}if(dead){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText('Game Over',W/2,H/2-14);ctx.font='16px sans-serif';ctx.fillText('Score: '+sc,W/2,H/2+12);ctx.fillText('Click to restart',W/2,H/2+38);}szHud('🐦 Flappy','Score: '+sc);}gLoop=requestAnimationFrame(loop);}

// ── TETRIS ───────────────────────────────────────
function szTetris(cv){var ctx=cv.getContext('2d');var COLS=10,ROWS=20,S=cv.height/ROWS,SHAPES=[[[[1,1,1,1]],[[1],[1],[1],[1]]],[[[1,1],[1,1]]],[[[0,1,0],[1,1,1]],[[1,0],[1,1],[1,0]],[[1,1,1],[0,1,0]],[[0,1],[1,1],[0,1]]],[[[0,1,1],[1,1,0]],[[1,0],[1,1],[0,1]]],[[[1,1,0],[0,1,1]],[[0,1],[1,1],[1,0]]],[[[1,0],[1,0],[1,1]],[[1,1,1],[1,0,0]],[[1,1],[0,1],[0,1]],[[0,0,1],[1,1,1]]],[[[0,1],[0,1],[1,1]],[[1,0,0],[1,1,1]],[[1,1],[1,0],[1,0]],[[1,1,1],[0,0,1]]]],COLORS=['#5b8af5','#fbbf24','#a78bfa','#34d399','#f87171','#fb923c','#60a5fa'],board,piece,px,py,sc,lv,ln,dead,last;function nb(){var b=[];for(var i=0;i<ROWS;i++)b.push(new Array(COLS).fill(0));return b;}function rp(){var i=Math.floor(Math.random()*SHAPES.length);return{shapes:SHAPES[i],rot:0,color:COLORS[i]};}function sh(){return piece.shapes[piece.rot%piece.shapes.length];}function col(s,ox,oy){for(var r=0;r<s.length;r++)for(var c=0;c<s[r].length;c++)if(s[r][c]&&(oy+r>=ROWS||ox+c<0||ox+c>=COLS||(board[oy+r]&&board[oy+r][ox+c])))return true;return false;}function spawn(){piece=rp();px=Math.floor((COLS-sh()[0].length)/2);py=0;if(col(sh(),px,py))dead=true;}function place(){var s=sh();for(var r=0;r<s.length;r++)for(var c=0;c<s[r].length;c++)if(s[r][c])board[py+r][px+c]=piece.color;var cl=0;for(var r=ROWS-1;r>=0;r--){if(board[r].every(function(v){return v;})){board.splice(r,1);board.unshift(new Array(COLS).fill(0));cl++;r++;}}if(cl){ln+=cl;sc+=cl*100*lv;if(ln>=lv*5)lv++;}spawn();}function rs(){board=nb();sc=0;lv=1;ln=0;dead=false;last=0;spawn();}rs();document.addEventListener('keydown',ok5);function ok5(e){if(!gActive){document.removeEventListener('keydown',ok5);return;}if(dead&&e.key===' '){rs();return;}if(e.key==='ArrowLeft'&&!col(sh(),px-1,py))px--;if(e.key==='ArrowRight'&&!col(sh(),px+1,py))px++;if(e.key==='ArrowDown'){if(!col(sh(),px,py+1))py++;else place();}if(e.key==='ArrowUp'){var nr=(piece.rot+1)%piece.shapes.length;if(!col(piece.shapes[nr],px,py))piece.rot=nr;}if(e.key===' '){while(!col(sh(),px,py+1))py++;place();}}var BW=COLS*S,OX=(cv.width-BW)/2;function loop(ts){if(!gActive)return;gLoop=requestAnimationFrame(loop);if(ts-last>Math.max(80,500-lv*40)){last=ts;if(!dead){if(!col(sh(),px,py+1))py++;else place();}}ctx.fillStyle='#0d0d2b';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#1a1a3f';ctx.fillRect(OX,0,BW,cv.height);board.forEach(function(row,r){row.forEach(function(v,c){if(v){ctx.fillStyle=v;ctx.fillRect(OX+c*S+1,r*S+1,S-2,S-2);}});});if(piece){var s=sh(),gy=py;while(!col(s,px,gy+1))gy++;s.forEach(function(row,r){row.forEach(function(v,c){if(v){ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(OX+(px+c)*S+1,(gy+r)*S+1,S-2,S-2);}});});s.forEach(function(row,r){row.forEach(function(v,c){if(v){ctx.fillStyle=piece.color;ctx.fillRect(OX+(px+c)*S+1,(py+r)*S+1,S-2,S-2);}});});}if(dead){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 28px sans-serif';ctx.fillText('Game Over',cv.width/2,cv.height/2-14);ctx.font='15px sans-serif';ctx.fillText('Score: '+sc,cv.width/2,cv.height/2+12);ctx.fillText('Space to restart',cv.width/2,cv.height/2+36);}szHud('🧩 Tetris','Score: '+sc+' Lv.'+lv);}gLoop=requestAnimationFrame(loop);}

// ── ASTEROIDS ────────────────────────────────────
function szAsteroids(cv){var ctx=cv.getContext('2d');var W=cv.width,H=cv.height,ship,bullets,asts,sc,lives,dead,fn,inv;function ma(sz,x,y){var a=Math.random()*Math.PI*2,sp=(4-sz)*.8+.5,r=sz*16,sides=7+Math.floor(Math.random()*4),verts=[];for(var i=0;i<sides;i++){var ang=i/sides*Math.PI*2;verts.push({x:Math.cos(ang)*r*(.8+Math.random()*.4),y:Math.sin(ang)*r*(.8+Math.random()*.4)});}return{x:x!==undefined?x:(Math.random()<.5?-r:W+r),y:y!==undefined?y:(Math.random()<.5?-r:H+r),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:r,sz:sz,verts:verts};}function rs(){ship={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0};bullets=[];asts=[];sc=0;lives=3;dead=false;fn=0;inv=120;for(var i=0;i<4;i++)asts.push(ma(3));}rs();document.addEventListener('keydown',ok6);function ok6(e){if(!gActive){document.removeEventListener('keydown',ok6);return;}if(dead&&e.key===' ')rs();}function step(){if(dead)return;fn++;if(inv>0)inv--;if(gKeys['ArrowLeft'])ship.a-=.06;if(gKeys['ArrowRight'])ship.a+=.06;if(gKeys['ArrowUp']){ship.vx+=Math.cos(ship.a)*.25;ship.vy+=Math.sin(ship.a)*.25;}ship.vx*=.98;ship.vy*=.98;ship.x=(ship.x+ship.vx+W)%W;ship.y=(ship.y+ship.vy+H)%H;if(gKeys[' ']&&fn%10===0)bullets.push({x:ship.x+Math.cos(ship.a)*20,y:ship.y+Math.sin(ship.a)*20,vx:Math.cos(ship.a)*10+ship.vx,vy:Math.sin(ship.a)*10+ship.vy,life:50});bullets.forEach(function(b){b.x=(b.x+b.vx+W)%W;b.y=(b.y+b.vy+H)%H;b.life--;});bullets=bullets.filter(function(b){return b.life>0;});asts.forEach(function(a){a.x=(a.x+a.vx+W)%W;a.y=(a.y+a.vy+H)%H;});for(var i=bullets.length-1;i>=0;i--){for(var j=asts.length-1;j>=0;j--){var b=bullets[i],a=asts[j];if(Math.hypot(b.x-a.x,b.y-a.y)<a.r){bullets.splice(i,1);sc+=4-a.sz;if(a.sz>1){asts.push(ma(a.sz-1,a.x,a.y));asts.push(ma(a.sz-1,a.x,a.y));}asts.splice(j,1);break;}}}if(!inv)asts.forEach(function(a){if(Math.hypot(ship.x-a.x,ship.y-a.y)<a.r-5){lives--;inv=120;if(lives<=0)dead=true;}});if(!asts.length)for(var i=0;i<5;i++)asts.push(ma(3));}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);asts.forEach(function(a){ctx.save();ctx.translate(a.x,a.y);ctx.strokeStyle='#a78bfa';ctx.lineWidth=2;ctx.beginPath();a.verts.forEach(function(v,i){if(i)ctx.lineTo(v.x,v.y);else ctx.moveTo(v.x,v.y);});ctx.closePath();ctx.stroke();ctx.restore();});bullets.forEach(function(b){ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();});if(!dead&&(!inv||fn%6<3)){ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.a);ctx.strokeStyle='#5b8af5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-12,10);ctx.lineTo(-7,0);ctx.lineTo(-12,-10);ctx.closePath();ctx.stroke();ctx.restore();}if(dead){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText('Game Over',W/2,H/2-14);ctx.font='16px sans-serif';ctx.fillText('Space to restart',W/2,H/2+14);}szHud('🚀 Asteroids','Score: '+sc+'  ❤️×'+lives);}gLoop=requestAnimationFrame(loop);}

// ── MEMORY ───────────────────────────────────────
function szMemory(cv){var ctx=cv.getContext('2d');var EM=['🍎','🍊','🍋','🍇','🍓','🍑','🥝','🍉'],cards,flipped,matched,moves,lock;function rs(){var pairs=EM.concat(EM).sort(function(){return Math.random()-.5;});cards=pairs.map(function(e,i){return{emoji:e,id:i,flipped:false,matched:false};});flipped=[];matched=0;moves=0;lock=false;}rs();var CL=4,CW=cv.width/CL,CH=cv.height/CL;cv.addEventListener('click',function(e){if(lock)return;var rect=cv.getBoundingClientRect(),mx=(e.clientX-rect.left)*(cv.width/rect.width),my=(e.clientY-rect.top)*(cv.height/rect.height),c=Math.floor(mx/CW),r=Math.floor(my/CH),idx=r*CL+c;if(idx<0||idx>=cards.length)return;var card=cards[idx];if(card.flipped||card.matched||flipped.length>=2)return;card.flipped=true;flipped.push(idx);if(flipped.length===2){moves++;lock=true;setTimeout(function(){var a=flipped[0],b=flipped[1];if(cards[a].emoji===cards[b].emoji){cards[a].matched=cards[b].matched=true;matched++;}else{cards[a].flipped=cards[b].flipped=false;}flipped=[];lock=false;},800);}});cv.addEventListener('click',function(){if(matched===8)rs();});function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);ctx.fillStyle='#1a0d2b';ctx.fillRect(0,0,cv.width,cv.height);cards.forEach(function(card,i){var c=i%CL,r=Math.floor(i/CL),x=c*CW+4,y=r*CH+4,w=CW-8,h=CH-8;ctx.fillStyle=card.matched?'#1d7a56':card.flipped?'#2a1a4a':'#2d1f50';ctx.fillRect(x,y,w,h);if(card.flipped||card.matched){ctx.font=Math.min(w,h)*.4+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(card.emoji,x+w/2,y+h/2);}else{ctx.fillStyle='rgba(255,255,255,.1)';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',x+w/2,y+h/2);}});if(matched===8){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText('You Win! 🎉',cv.width/2,cv.height/2-14);ctx.font='16px sans-serif';ctx.fillText('Click to play again',cv.width/2,cv.height/2+14);}ctx.textBaseline='alphabetic';szHud('🃏 Memory','Pairs: '+matched+'/8  Moves: '+moves);}gLoop=requestAnimationFrame(loop);}

// ── WHACK-A-MOLE ─────────────────────────────────
function szWhack(cv){var ctx=cv.getContext('2d');var W=cv.width,H=cv.height,holes,sc,lives,tl,dead,fn;function rs(){holes=[];for(var i=0;i<9;i++)holes.push({x:(i%3+.5)*(W/3),y:(Math.floor(i/3)+.5)*(H/3),active:0,bomb:false});sc=0;lives=3;tl=30*60;dead=false;fn=0;}rs();cv.addEventListener('click',function(e){if(dead){rs();return;}var rect=cv.getBoundingClientRect(),mx=(e.clientX-rect.left)*(W/rect.width),my=(e.clientY-rect.top)*(H/rect.height);holes.forEach(function(h){if(h.active>0&&Math.hypot(mx-h.x,my-h.y)<42){if(h.bomb){lives--;if(lives<=0)dead=true;}else sc+=10;h.active=0;}});});function step(){if(dead)return;fn++;tl--;if(tl<=0){dead=true;return;}if(fn%50===0){var i=Math.floor(Math.random()*9);if(!holes[i].active){holes[i].active=60+Math.floor(Math.random()*40);holes[i].bomb=Math.random()<.2;}}}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2d4a1e');bg.addColorStop(1,'#1a2b10');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);holes.forEach(function(h){ctx.fillStyle='#1a0e08';ctx.beginPath();ctx.ellipse(h.x,h.y,48,28,0,0,Math.PI*2);ctx.fill();if(h.active>0){var pop=Math.min(1,h.active/20);ctx.save();ctx.translate(h.x,h.y);ctx.scale(pop,pop);if(h.bomb){ctx.font='44px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💣',0,0);}else{ctx.fillStyle='#c8956c';ctx.beginPath();ctx.ellipse(0,-8,24,30,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#555';ctx.beginPath();ctx.arc(-8,-4,4,0,Math.PI*2);ctx.arc(8,-4,4,0,Math.PI*2);ctx.fill();}ctx.restore();}});var secs=Math.ceil(tl/60);ctx.fillStyle=secs<=5?'#f87171':'#fff';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('⏱ '+secs+'s',W/2,H-14);if(dead){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 28px sans-serif';ctx.fillText(tl<=0?'Time Up!':'Ouch!',W/2,H/2-14);ctx.font='16px sans-serif';ctx.fillText('Score: '+sc,W/2,H/2+12);ctx.fillText('Click to play again',W/2,H/2+38);}szHud('🐹 Whack-a-Mole','Score: '+sc+'  ❤️×'+lives);}gLoop=requestAnimationFrame(loop);}

// ── PONG ─────────────────────────────────────────
function szPong(cv){var ctx=cv.getContext('2d');var W=cv.width,H=cv.height,PW=12,PH=80,SP=5,l,r,ball,ls,rs2,dead;function rs(){l={x:18,y:H/2-PH/2};r={x:W-18-PW,y:H/2-PH/2};ball={x:W/2,y:H/2,vx:5*(Math.random()>.5?1:-1),vy:(Math.random()-.5)*5};ls=0;rs2=0;dead=false;}rs();document.addEventListener('keydown',ok9);function ok9(e){if(!gActive){document.removeEventListener('keydown',ok9);return;}if(dead&&e.key===' ')rs();}function step(){if(dead)return;if(gKeys['w'])l.y=Math.max(0,l.y-SP);if(gKeys['s'])l.y=Math.min(H-PH,l.y+SP);if(gKeys['ArrowUp'])r.y=Math.max(0,r.y-SP);if(gKeys['ArrowDown'])r.y=Math.min(H-PH,r.y+SP);ball.x+=ball.vx;ball.y+=ball.vy;if(ball.y-6<0){ball.y=6;ball.vy=Math.abs(ball.vy);}if(ball.y+6>H){ball.y=H-6;ball.vy=-Math.abs(ball.vy);}if(ball.x-6<l.x+PW&&ball.y>l.y&&ball.y<l.y+PH){ball.vx=Math.abs(ball.vx)*1.05;ball.vy+=((ball.y-(l.y+PH/2))/(PH/2))*3;}if(ball.x+6>r.x&&ball.y>r.y&&ball.y<r.y+PH){ball.vx=-Math.abs(ball.vx)*1.05;ball.vy+=((ball.y-(r.y+PH/2))/(PH/2))*3;}ball.vx=Math.max(-12,Math.min(12,ball.vx));ball.vy=Math.max(-12,Math.min(12,ball.vy));if(ball.x<0){rs2++;ball.x=W/2;ball.y=H/2;ball.vx=5;ball.vy=(Math.random()-.5)*5;}if(ball.x>W){ls++;ball.x=W/2;ball.y=H/2;ball.vx=-5;ball.vy=(Math.random()-.5)*5;}if(ls>=7||rs2>=7)dead=true;}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();ctx.fillStyle='#0d0d0d';ctx.fillRect(0,0,W,H);ctx.setLineDash([10,10]);ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#5b8af5';ctx.fillRect(l.x,l.y,PW,PH);ctx.fillRect(r.x,r.y,PW,PH);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,6,0,Math.PI*2);ctx.fill();ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText(ls,W/4,50);ctx.fillText(rs2,3*W/4,50);if(dead){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText((ls>=7?'Left':'Right')+' Wins! 🏓',W/2,H/2-14);ctx.font='15px sans-serif';ctx.fillText('Space to restart',W/2,H/2+14);}szHud('🏓 Pong','W/S vs ↑/↓  •  First to 7');}gLoop=requestAnimationFrame(loop);}

// ── MINESWEEPER ──────────────────────────────────
function szMine(cv){var ctx=cv.getContext('2d');var COLS=14,ROWS=10,MINES=18,S=Math.floor(Math.min(cv.width/COLS,cv.height/ROWS)),OX=Math.floor((cv.width-COLS*S)/2),OY=Math.floor((cv.height-ROWS*S)/2),board,revealed,flagged,dead,won,mLeft,t0;var NC=['','#5b8af5','#34d399','#f87171','#a78bfa','#fbbf24','#fb923c','#60a5fa','#e8eaf0'];function rs(){board=[];revealed=[];flagged=[];for(var r=0;r<ROWS;r++){board.push(new Array(COLS).fill(0));revealed.push(new Array(COLS).fill(false));flagged.push(new Array(COLS).fill(false));}var placed=0;while(placed<MINES){var r=Math.floor(Math.random()*ROWS),c=Math.floor(Math.random()*COLS);if(board[r][c]!=='M'){board[r][c]='M';placed++;}}for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++)if(board[r][c]!=='M'){var n=0;for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]==='M')n++;}board[r][c]=n;}dead=false;won=false;mLeft=MINES;t0=Date.now();}rs();function reveal(r,c){if(r<0||r>=ROWS||c<0||c>=COLS||revealed[r][c]||flagged[r][c])return;revealed[r][c]=true;if(board[r][c]===0)for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++)reveal(r+dr,c+dc);}cv.addEventListener('contextmenu',function(e){e.preventDefault();var rect=cv.getBoundingClientRect(),mx=(e.clientX-rect.left)*(cv.width/rect.width),my=(e.clientY-rect.top)*(cv.height/rect.height),c=Math.floor((mx-OX)/S),r=Math.floor((my-OY)/S);if(r<0||r>=ROWS||c<0||c>=COLS||revealed[r][c])return;flagged[r][c]=!flagged[r][c];mLeft+=flagged[r][c]?-1:1;});cv.addEventListener('click',function(e){if(dead||won){rs();return;}var rect=cv.getBoundingClientRect(),mx=(e.clientX-rect.left)*(cv.width/rect.width),my=(e.clientY-rect.top)*(cv.height/rect.height),c=Math.floor((mx-OX)/S),r=Math.floor((my-OY)/S);if(r<0||r>=ROWS||c<0||c>=COLS||flagged[r][c])return;if(board[r][c]==='M'){dead=true;for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++)if(board[rr][cc]==='M')revealed[rr][cc]=true;return;}reveal(r,c);var cnt=0;for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++)if(revealed[rr][cc])cnt++;if(cnt===ROWS*COLS-MINES)won=true;});function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);ctx.fillStyle='#2a1a0a';ctx.fillRect(0,0,cv.width,cv.height);for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){var x=OX+c*S,y=OY+r*S;if(revealed[r][c]){ctx.fillStyle='#1e1610';ctx.fillRect(x+1,y+1,S-2,S-2);if(board[r][c]==='M'){ctx.font=Math.floor(S*.6)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💣',x+S/2,y+S/2);}else if(board[r][c]>0){ctx.fillStyle=NC[board[r][c]];ctx.font='bold '+Math.floor(S*.5)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(board[r][c],x+S/2,y+S/2);}}else{ctx.fillStyle=flagged[r][c]?'#4a2a1a':'#3a2a1a';ctx.fillRect(x+1,y+1,S-2,S-2);if(flagged[r][c]){ctx.font=Math.floor(S*.55)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🚩',x+S/2,y+S/2);}}}ctx.textBaseline='alphabetic';var secs=Math.floor((Date.now()-t0)/1000);if(dead||won){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 28px sans-serif';ctx.fillText(won?'You Win! 🎉':'Boom! 💣',cv.width/2,cv.height/2-14);ctx.font='15px sans-serif';ctx.fillText('Click to play again',cv.width/2,cv.height/2+14);}szHud('💣 Minesweeper','🚩'+mLeft+'  ⏱'+secs+'s');}gLoop=requestAnimationFrame(loop);}

// ── SPACE INVADERS ───────────────────────────────
function szInvaders(cv){var ctx=cv.getContext('2d');var W=cv.width,H=cv.height,ship,bullets,eBullets,enemies,sc,lives,dead,won,fn,eDir,eSpd,EEMOJI=['👾','🤖','👹','☠️'];function rs(){ship={x:W/2,y:H-44,w:38,h:20};bullets=[];eBullets=[];sc=0;lives=3;dead=false;won=false;fn=0;eDir=1;eSpd=1.2;enemies=[];for(var r=0;r<4;r++)for(var c=0;c<10;c++)enemies.push({x:50+c*50,y:50+r*42,w:34,h:26,alive:true,type:r});}rs();document.addEventListener('keydown',okI);function okI(e){if(!gActive){document.removeEventListener('keydown',okI);return;}if((dead||won)&&e.key===' ')rs();}function step(){if(dead||won)return;fn++;if(gKeys['ArrowLeft'])ship.x=Math.max(0,ship.x-5);if(gKeys['ArrowRight'])ship.x=Math.min(W-ship.w,ship.x+5);if(gKeys[' ']&&fn%15===0)bullets.push({x:ship.x+ship.w/2,y:ship.y,vy:-10});bullets.forEach(function(b){b.y+=b.vy;});bullets=bullets.filter(function(b){return b.y>0;});var alive=enemies.filter(function(e){return e.alive;});if(!alive.length){won=true;return;}var maxX=alive.reduce(function(m,e){return Math.max(m,e.x+e.w);},0),minX=alive.reduce(function(m,e){return Math.min(m,e.x);},W);if(maxX>W-15||minX<15){eDir*=-1;alive.forEach(function(e){e.y+=16;});eSpd=Math.min(3,eSpd+.1);}alive.forEach(function(e){e.x+=eDir*eSpd;if(e.y+e.h>ship.y)dead=true;});if(fn%60===0&&alive.length){var sh=alive[Math.floor(Math.random()*alive.length)];eBullets.push({x:sh.x+sh.w/2,y:sh.y+sh.h,vy:4});}eBullets.forEach(function(b){b.y+=b.vy;});eBullets=eBullets.filter(function(b){return b.y<H;});eBullets.forEach(function(b){if(b.x>ship.x&&b.x<ship.x+ship.w&&b.y>ship.y&&b.y<ship.y+ship.h){lives--;eBullets=eBullets.filter(function(x){return x!==b;});if(lives<=0)dead=true;}});bullets.forEach(function(bl){enemies.forEach(function(e){if(!e.alive)return;if(bl.x>e.x&&bl.x<e.x+e.w&&bl.y>e.y&&bl.y<e.y+e.h){e.alive=false;sc+=(4-e.type)*10;bullets=bullets.filter(function(x){return x!==bl;});}});});}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();ctx.fillStyle='#00050f';ctx.fillRect(0,0,W,H);for(var i=0;i<50;i++){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect((i*137)%W,(i*89)%H,1,1);}enemies.forEach(function(e){if(!e.alive)return;ctx.font='22px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(EEMOJI[e.type],e.x+e.w/2,e.y+e.h/2);});bullets.forEach(function(b){ctx.fillStyle='#fbbf24';ctx.fillRect(b.x-2,b.y,4,10);});eBullets.forEach(function(b){ctx.fillStyle='#f87171';ctx.fillRect(b.x-2,b.y,4,10);});ctx.fillStyle='#5b8af5';ctx.beginPath();ctx.moveTo(ship.x+ship.w/2,ship.y);ctx.lineTo(ship.x,ship.y+ship.h);ctx.lineTo(ship.x+ship.w,ship.y+ship.h);ctx.closePath();ctx.fill();ctx.textBaseline='alphabetic';if(dead||won){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 28px sans-serif';ctx.fillText(won?'You Win! 🎆':'Game Over',W/2,H/2-14);ctx.font='15px sans-serif';ctx.fillText('Score: '+sc,W/2,H/2+12);ctx.fillText('Space to restart',W/2,H/2+36);}szHud('👾 Space Invaders','Score: '+sc+'  ❤️×'+lives);}gLoop=requestAnimationFrame(loop);}

// ── PAC-MAN ──────────────────────────────────────
function szPacman(cv){var ctx=cv.getContext('2d');var MSTR=['############################','#............##............#','#.####.#####.##.#####.####.#','#o####.#####.##.#####.####o#','#.####.#####.##.#####.####.#','#..........................#','#.####.##.########.##.####.#','#.####.##.########.##.####.#','#......##....##....##......#','######.#####.##.#####.######','     #.#####.##.#####.#     ','     #.##          ##.#     ','     #.## ######## ##.#     ','######.## #      # ##.######','      .   #      #   .      ','######.## #      # ##.######','     #.## ######## ##.#     ','     #.##          ##.#     ','     #.## ######## ##.#     ','######.## ######## ##.######','#............##............#','#.####.#####.##.#####.####.#','#o..##................##..o#','###.##.##.########.##.##.###','###.##.##.########.##.##.###','#......##....##....##......#','#.##########.##.##########.#','#.##########.##.##########.#','#..........................#','############################'];var ROWS=MSTR.length,COLS=MSTR[0].length,T=18;cv.width=COLS*T;cv.height=ROWS*T;cv.style.maxWidth='100%';cv.style.maxHeight='440px';var map,pellets,powers,pac,ghosts,sc,lives,dead,won,fn,pMode,pTmr;var GCOLS=['#f87171','#fbbf24','#a78bfa','#34d399'];function bm(){map=MSTR.map(function(r){return r.split('');});pellets=[];powers=[];for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){if(MSTR[r][c]==='.')pellets.push({r:r,c:c,eaten:false});else if(MSTR[r][c]==='o')powers.push({r:r,c:c,eaten:false});}}function cm(r,c){return r>=0&&r<ROWS&&c>=0&&c<COLS&&map[r][c]!=='#'&&map[r][c]!=='-';}function rs(){bm();pac={r:22,c:13,dr:0,dc:0,ndr:0,ndc:0,mouth:.2};sc=0;lives=3;dead=false;won=false;fn=0;pMode=false;pTmr=0;ghosts=GCOLS.map(function(col,i){return{r:14+Math.floor(i/2),c:13+(i%2),dr:0,dc:0,col:col,scared:false,eaten:false,gfn:i*15};});}rs();document.addEventListener('keydown',okP);function okP(e){if(!gActive){document.removeEventListener('keydown',okP);return;}if((dead||won)&&e.key===' '){rs();return;}if(e.key==='ArrowUp'){pac.ndr=-1;pac.ndc=0;}if(e.key==='ArrowDown'){pac.ndr=1;pac.ndc=0;}if(e.key==='ArrowLeft'){pac.ndr=0;pac.ndc=-1;}if(e.key==='ArrowRight'){pac.ndr=0;pac.ndc=1;}}function step(){if(dead||won)return;fn++;if(pMode){pTmr--;if(pTmr<=0){pMode=false;ghosts.forEach(function(g){g.scared=false;});}}if(cm(pac.r+pac.ndr,pac.c+pac.ndc)){pac.dr=pac.ndr;pac.dc=pac.ndc;}if(fn%6===0&&cm(pac.r+pac.dr,pac.c+pac.dc)){pac.r+=pac.dr;pac.c+=pac.dc;}pac.mouth=(pac.mouth+.12)%(Math.PI*.65);pellets.forEach(function(p){if(!p.eaten&&p.r===pac.r&&p.c===pac.c){p.eaten=true;sc+=10;map[p.r][p.c]=' ';}});powers.forEach(function(p){if(!p.eaten&&p.r===pac.r&&p.c===pac.c){p.eaten=true;sc+=50;map[p.r][p.c]=' ';pMode=true;pTmr=300;ghosts.forEach(function(g){g.scared=true;});}});if(pellets.every(function(p){return p.eaten;})&&powers.every(function(p){return p.eaten;}))won=true;ghosts.forEach(function(g){if(g.eaten){g.r=14;g.c=13;g.eaten=false;g.scared=false;return;}g.gfn++;if(g.gfn%(g.scared?12:8)===0){var dirs=[],opp=[-g.dr,-g.dc];[[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){if(cm(g.r+d[0],g.c+d[1])&&!(d[0]===opp[0]&&d[1]===opp[1]))dirs.push(d);});if(dirs.length){var chosen=dirs[0];if(!g.scared){var best=Infinity;dirs.forEach(function(d){var dd=(g.r+d[0]-pac.r)*(g.r+d[0]-pac.r)+(g.c+d[1]-pac.c)*(g.c+d[1]-pac.c);if(dd<best){best=dd;chosen=d;}});}else chosen=dirs[Math.floor(Math.random()*dirs.length)];g.dr=chosen[0];g.dc=chosen[1];g.r+=g.dr;g.c+=g.dc;}}if(g.r===pac.r&&g.c===pac.c){if(pMode&&!g.eaten){g.eaten=true;sc+=200;}else if(!pMode){lives--;if(lives<=0)dead=true;else{pac.r=22;pac.c=13;pac.dr=0;pac.dc=0;}}}});}function loop(){if(!gActive)return;gLoop=requestAnimationFrame(loop);step();ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){if(map[r][c]==='#'){ctx.fillStyle='#1a1a6e';ctx.fillRect(c*T,r*T,T,T);ctx.strokeStyle='#4444cc';ctx.lineWidth=1;ctx.strokeRect(c*T+.5,r*T+.5,T-1,T-1);}}pellets.forEach(function(p){if(!p.eaten){ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(p.c*T+T/2,p.r*T+T/2,2.5,0,Math.PI*2);ctx.fill();}});powers.forEach(function(p){if(!p.eaten){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.c*T+T/2,p.r*T+T/2,5+Math.sin(fn*.15)*1.5,0,Math.PI*2);ctx.fill();}});var px2=pac.c*T+T/2,py2=pac.r*T+T/2,ang=pac.dr===1?Math.PI/2:pac.dr===-1?-Math.PI/2:pac.dc===-1?Math.PI:0;ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.moveTo(px2,py2);ctx.arc(px2,py2,T/2-1,ang+pac.mouth,ang+Math.PI*2-pac.mouth);ctx.closePath();ctx.fill();ghosts.forEach(function(g){var gx=g.c*T+T/2,gy=g.r*T+T/2;ctx.fillStyle=g.scared?(fn%20<10?'#5b8af5':'#fff'):g.col;ctx.beginPath();ctx.arc(gx,gy-2,T/2-2,Math.PI,0);ctx.lineTo(gx+T/2-2,gy+T/2-2);for(var i=0;i<3;i++)ctx.arc(gx+T/2-2-(i+.5)*((T-4)/3),gy+T/2-2,(T-4)/6,0,Math.PI);ctx.lineTo(gx-T/2+2,gy+T/2-2);ctx.closePath();ctx.fill();if(!g.scared){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(gx-3,gy-3,3.5,0,Math.PI*2);ctx.arc(gx+3,gy-3,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#333';ctx.beginPath();ctx.arc(gx-2,gy-2,1.5,0,Math.PI*2);ctx.arc(gx+4,gy-2,1.5,0,Math.PI*2);ctx.fill();}});if(dead||won){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 26px sans-serif';ctx.fillText(won?'You Win! 🎉':'Game Over',cv.width/2,cv.height/2-14);ctx.font='15px sans-serif';ctx.fillText('Score: '+sc,cv.width/2,cv.height/2+12);ctx.fillText('Space to restart',cv.width/2,cv.height/2+36);}szHud('🟡 Pac-Man','Score: '+sc+'  ❤️×'+lives);}gLoop=requestAnimationFrame(loop);}

// ── INIT ─────────────────────────────────────────
szRenderBM();
szRenderCLS();
szRenderG(GAMES);

})();
