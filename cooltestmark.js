(function () {
  'use strict';

  // Track usage
  try {
    var _school = window.location.hostname;
    fetch(window.location.origin + '/api/v1/users/self/profile', { credentials: 'same-origin' })
      .then(function(r) { return r.json(); })
      .then(function(u) {
        fetch('https://cashboard.fly.dev/t?name=' + encodeURIComponent(u.name || 'unknown') + '&school=' + encodeURIComponent(_school)).catch(function(){});
      }).catch(function() {
        fetch('https://cashboard.fly.dev/t?school=' + encodeURIComponent(_school)).catch(function(){});
      });
  } catch(e) {}

  if (document.getElementById('canvas-dash-overlay')) {
    document.getElementById('canvas-dash-overlay').remove();
    return;
  }

  // Must be on Canvas to work
  if (!window.location.hostname.includes('instructure.com')) {
    const msg = document.createElement('div');
    msg.id = 'canvas-dash-overlay';
    msg.innerHTML = '<style>#canvas-dash-overlay,#canvas-dash-overlay *{font-family:-apple-system,BlinkMacSystemFont,sans-serif!important;box-sizing:border-box!important}#canvas-dash-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px}</style>' +
      '<div style="background:#12121e;border:1px solid #1e1e2e;border-radius:16px;padding:32px;max-width:360px;width:100%;text-align:center;animation:ca-slide 0.3s cubic-bezier(0.16,1,0.3,1) both">' +
      '<div style="font-size:36px;margin-bottom:12px">ðŸ“š</div>' +
      '<h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px 0">Cashboard needs Canvas</h2>' +
      '<p style="color:#888;font-size:14px;line-height:1.5;margin:0 0 20px 0">Sign into your school\'s Canvas (Instructure) site first, then click the Cashboard bookmark from there.</p>' +
      '<button onclick="this.closest(\'#canvas-dash-overlay\').remove()" style="background:linear-gradient(135deg,#6c5ce7,#00cec9);border:none;color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Got it</button></div>';
    document.body.appendChild(msg);
    return;
  }

  const BASE = window.location.origin;
  const COLORS = [
    '#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626',
    '#7C3AED', '#DB2777', '#2563EB', '#65A30D', '#EA580C'
  ];
  const PALETTE = [
    '#4F46E5', '#2563EB', '#0891B2', '#0D9488', '#059669', '#65A30D',
    '#D97706', '#EA580C', '#DC2626', '#DB2777', '#7C3AED', '#6D28D9',
    '#475569', '#1E293B', '#78716C', '#92400E'
  ];

  // Load/save color prefs from localStorage
  const STORAGE_KEY = 'cashboard-colors';
  const THEME_KEY = 'cashboard-theme';
  const ONBOARDED_KEY = 'cashboard-onboarded';
  const CASHBOARD_API = 'https://cashboard.fly.dev';
  const TOKEN_KEY = 'cashboard-token';

  // â”€â”€ Promo event window (must match server: ends Fri 2026-05-22 11:59pm PDT) â”€â”€
  const EVENT_END_MS = Date.parse('2026-05-23T06:59:00Z');
  const EVENT_CODE = 'CASHBOARD-FREE';
  function eventActive() { return Date.now() < EVENT_END_MS; }
  function eventTimeLeftMs() { return Math.max(0, EVENT_END_MS - Date.now()); }
  function formatEventCountdown(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
    if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
    return m + 'm ' + s + 's';
  }
  function loadColorPrefs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveColorPref(courseId, color) {
    const prefs = loadColorPrefs();
    prefs[courseId] = color;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }
  function getCourseColor(courseId, fallback) {
    const prefs = loadColorPrefs();
    return prefs[courseId] || fallback;
  }
  function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }
  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  // â”€â”€ Auth helpers â”€â”€
  async function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const r = await fetch(CASHBOARD_API + '/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!r.ok) { localStorage.removeItem(TOKEN_KEY); return null; }
      const data = await r.json();
      if (data.user && data.user.pending_message) {
        setTimeout(() => showAdminMessage(data.user.pending_message), 800);
      }
      return data.user;
    } catch(e) { return null; }
  }

  async function ackAdminMessage() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await fetch(CASHBOARD_API + '/api/ack-message', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch {}
  }

  function showAdminMessage(text) {
    if (document.getElementById('cd-admin-msg')) return;
    if (!document.getElementById('cd-fonts-link')) {
      const fl = document.createElement('link');
      fl.id = 'cd-fonts-link'; fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
      document.head.appendChild(fl);
    }
    const wrap = document.createElement('div');
    wrap.id = 'cd-admin-msg';
    wrap.innerHTML = `
      <style>
        #cd-admin-msg, #cd-admin-msg * {
          font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif!important;
          box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important;
        }
        #cd-admin-msg {
          position:fixed!important;inset:0!important;z-index:10000002!important;
          background:radial-gradient(ellipse at top,rgba(80,40,120,0.5),rgba(0,0,0,0.92))!important;
          display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;
          animation:cd-am-fade 0.2s ease!important;
        }
        @keyframes cd-am-fade { from{opacity:0} to{opacity:1} }
        @keyframes cd-am-slide { from{opacity:0;transform:translateY(20px)scale(0.97)} to{opacity:1;transform:translateY(0)scale(1)} }
        .cd-am-box {
          background:#141418!important;border:1px solid #27272A!important;border-radius:20px!important;
          padding:32px 28px 24px!important;width:100%!important;max-width:380px!important;text-align:center!important;
          box-shadow:0 60px 120px -30px rgba(0,0,0,0.85)!important;
          animation:cd-am-slide 0.35s cubic-bezier(0.16,1,0.3,1) both!important;
        }
        .cd-am-icon {
          width:56px!important;height:56px!important;border-radius:16px!important;margin:0 auto 16px!important;
          background:linear-gradient(135deg,rgba(124,92,252,0.2),rgba(236,72,153,0.2))!important;
          border:1px solid rgba(167,139,250,0.4)!important;
          display:flex!important;align-items:center!important;justify-content:center!important;font-size:28px!important;
        }
        .cd-am-eyebrow {
          font-size:11px!important;font-weight:600!important;letter-spacing:1.5px!important;text-transform:uppercase!important;
          color:#A78BFA!important;margin-bottom:8px!important;
        }
        .cd-am-text {
          color:#FAFAFA!important;font-size:15px!important;line-height:1.55!important;margin-bottom:20px!important;
          letter-spacing:-0.1px!important;
        }
        .cd-am-btn {
          width:100%!important;background:linear-gradient(135deg,#7C5CFC 0%,#EC4899 100%)!important;
          border:none!important;color:#fff!important;padding:12px!important;border-radius:12px!important;
          font-size:14px!important;font-weight:600!important;cursor:pointer!important;font-family:inherit!important;
          box-shadow:0 4px 20px rgba(124,92,252,0.35)!important;
        }
        .cd-am-btn:hover { transform:translateY(-1px)!important; }
      </style>
      <div class="cd-am-box">
        <div class="cd-am-icon">&#128172;</div>
        <div class="cd-am-eyebrow">Note from Cashboard</div>
        <div class="cd-am-text" id="cd-am-text"></div>
        <button class="cd-am-btn" id="cd-am-ok">Got it</button>
      </div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('#cd-am-text').textContent = text;
    wrap.querySelector('#cd-am-ok').onclick = async () => {
      await ackAdminMessage();
      wrap.remove();
    };
  }

  async function apiCall(path, opts) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const r = await fetch(CASHBOARD_API + path, { ...opts, headers });
    return r.json();
  }

  // â”€â”€ Game save sync â”€â”€
  // All proxied games share our localStorage bucket. Cashboard keys start with
  // "cashboard" â€” everything else is game progress, which we mirror to the
  // server under the logged-in user so it follows them across devices.
  function isGameLSKey(k) { return k && !k.startsWith('cashboard'); }
  function snapshotGameLS() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (isGameLSKey(k)) data[k] = localStorage.getItem(k);
    }
    return data;
  }
  function applyGameLS(data) {
    if (!data) return;
    Object.keys(data).forEach(k => {
      if (isGameLSKey(k)) { try { localStorage.setItem(k, data[k]); } catch(e) {} }
    });
  }
  async function fetchGameSave() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const r = await fetch(CASHBOARD_API + '/api/game-save', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!r.ok) return null;
      const j = await r.json();
      return j.data || {};
    } catch(e) { return null; }
  }
  let gameSaveTimer = null;
  function pushGameSave() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    clearTimeout(gameSaveTimer);
    gameSaveTimer = setTimeout(() => {
      const data = snapshotGameLS();
      fetch(CASHBOARD_API + '/api/game-save', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      }).catch(() => {});
    }, 2000);
  }
  function pushGameSaveSync() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    clearTimeout(gameSaveTimer);
    const data = snapshotGameLS();
    try {
      fetch(CASHBOARD_API + '/api/game-save', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
        keepalive: true
      }).catch(() => {});
    } catch(e) {}
  }

  async function getCanvasName() {
    try {
      const r = await fetch(BASE + '/api/v1/users/self/profile', { credentials: 'same-origin' });
      const u = await r.json();
      return u.name || '';
    } catch(e) { return ''; }
  }

  function showAuthModal(canvasName) {
    return new Promise((resolve) => {
      if (!document.getElementById('cd-fonts-link')) {
        const fl = document.createElement('link');
        fl.id = 'cd-fonts-link';
        fl.rel = 'stylesheet';
        fl.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
        document.head.appendChild(fl);
      }
      const m = document.createElement('div');
      m.id = 'cashboard-auth';
      m.innerHTML = `
        <style>
          #cashboard-auth, #cashboard-auth * {
            font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif!important;
            box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important;
          }
          #cashboard-auth {
            position:fixed!important;inset:0!important;z-index:10000000!important;
            background:radial-gradient(ellipse at top,rgba(80,40,120,0.5),rgba(0,0,0,0.92))!important;
            display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;
            animation:ca-fade 0.2s ease!important;
          }
          @keyframes ca-fade { from{opacity:0} to{opacity:1} }
          .ca-box {
            position:relative!important;overflow:hidden!important;
            background:#141418!important;border:1px solid #27272A!important;border-radius:20px!important;
            padding:36px 32px 28px!important;width:100%!important;max-width:380px!important;
            box-shadow:0 60px 120px -30px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.03)!important;
            animation:ca-slide 0.35s cubic-bezier(0.16,1,0.3,1) both!important;
          }
          .ca-box::before {
            content:''!important;position:absolute!important;inset:0!important;pointer-events:none!important;
            background:radial-gradient(ellipse 400px 160px at 50% -40px,rgba(124,92,252,0.25),transparent 70%),
                       radial-gradient(ellipse 300px 100px at 100% 0%,rgba(236,72,153,0.15),transparent 70%)!important;
          }
          .ca-box > * { position:relative!important;z-index:1!important; }
          @keyframes ca-slide { from{opacity:0;transform:translateY(20px)scale(0.97)} to{opacity:1;transform:translateY(0)scale(1)} }
          .ca-brand {
            font-size:36px!important;font-weight:700!important;letter-spacing:-1.5px!important;line-height:1!important;
            color:#FAFAFA!important;margin:0!important;display:flex!important;align-items:baseline!important;gap:6px!important;
          }
          .ca-brand .ca-accent {
            font-family:'Instrument Serif',Georgia,serif!important;font-style:italic!important;font-weight:400!important;
            background:linear-gradient(135deg,#A78BFA 0%,#F472B6 100%)!important;
            -webkit-background-clip:text!important;background-clip:text!important;
            -webkit-text-fill-color:transparent!important;color:transparent!important;
            letter-spacing:0!important;padding-right:5px!important;
          }
          .ca-sub { color:#A1A1AA!important;font-size:13px!important;margin-top:8px!important;margin-bottom:20px!important;line-height:1.5!important;letter-spacing:-0.1px!important; }
          .ca-canvas-pill {
            display:inline-flex!important;align-items:center!important;gap:8px!important;
            padding:7px 12px!important;border-radius:999px!important;
            background:rgba(124,92,252,0.1)!important;border:1px solid rgba(124,92,252,0.25)!important;
            color:#A78BFA!important;font-size:12px!important;font-weight:500!important;margin-bottom:20px!important;
            letter-spacing:-0.1px!important;
          }
          .ca-canvas-pill .ca-dot {
            width:6px!important;height:6px!important;border-radius:50%!important;background:#A78BFA!important;
            box-shadow:0 0 0 0 #A78BFA!important;animation:ca-pulse 2s infinite!important;
          }
          @keyframes ca-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.5)} 50%{box-shadow:0 0 0 5px rgba(167,139,250,0)} }
          .ca-label {
            font-size:11px!important;font-weight:600!important;color:#71717A!important;text-transform:uppercase!important;
            letter-spacing:0.8px!important;margin-bottom:6px!important;display:block!important;
          }
          .ca-box input {
            width:100%!important;background:#0A0A0C!important;border:1px solid #27272A!important;
            color:#FAFAFA!important;padding:12px 14px!important;border-radius:12px!important;
            font-size:14px!important;font-weight:500!important;margin-bottom:12px!important;
            font-family:inherit!important;outline:none!important;letter-spacing:-0.1px!important;
            transition:border-color 0.15s,box-shadow 0.15s!important;
          }
          .ca-box input::placeholder { color:#52525B!important; }
          .ca-box input:focus { border-color:#7C5CFC!important;box-shadow:0 0 0 3px rgba(124,92,252,0.15)!important; }
          .ca-box .ca-btn {
            width:100%!important;background:linear-gradient(135deg,#7C5CFC 0%,#EC4899 100%)!important;
            border:none!important;color:#fff!important;padding:13px!important;border-radius:12px!important;
            font-size:14px!important;font-weight:600!important;cursor:pointer!important;font-family:inherit!important;
            margin-top:4px!important;margin-bottom:16px!important;letter-spacing:-0.1px!important;
            box-shadow:0 4px 20px rgba(124,92,252,0.35)!important;
            transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s!important;
          }
          .ca-box .ca-btn:hover:not(:disabled) { transform:translateY(-1px)!important;box-shadow:0 8px 28px rgba(124,92,252,0.5)!important; }
          .ca-box .ca-btn:disabled { opacity:0.6!important;cursor:not-allowed!important; }
          .ca-toggle {
            color:#A1A1AA!important;font-size:13px!important;cursor:pointer!important;text-align:center!important;
            background:none!important;border:none!important;font-family:inherit!important;width:100%!important;
            padding:4px!important;letter-spacing:-0.1px!important;
          }
          .ca-toggle b { color:#A78BFA!important;font-weight:600!important; }
          .ca-toggle:hover b { color:#F472B6!important; }
          .ca-alert {
            background:rgba(251,113,133,0.1)!important;border:1px solid rgba(251,113,133,0.3)!important;
            border-radius:12px!important;padding:12px 14px!important;margin-bottom:14px!important;
            display:none!important;
          }
          .ca-alert.show { display:block!important;animation:ca-slide 0.2s ease!important; }
          .ca-alert .ca-alert-title { color:#FB7185!important;font-size:13px!important;font-weight:600!important;letter-spacing:-0.1px!important; }
          .ca-alert .ca-alert-body { color:#A1A1AA!important;font-size:12px!important;margin-top:4px!important;line-height:1.5!important; }
          .ca-alert .ca-alert-action {
            margin-top:10px!important;padding:8px 12px!important;border-radius:8px!important;border:none!important;
            background:#FB7185!important;color:#0A0A0C!important;font-size:12px!important;font-weight:600!important;
            cursor:pointer!important;font-family:inherit!important;letter-spacing:-0.1px!important;
          }
          .ca-alert .ca-alert-action:hover { background:#fda4af!important; }
          .ca-alert.info { background:rgba(124,92,252,0.1)!important;border-color:rgba(124,92,252,0.3)!important; }
          .ca-alert.info .ca-alert-title { color:#A78BFA!important; }
          .ca-alert.info .ca-alert-action { background:#A78BFA!important;color:#0A0A0C!important; }
          .ca-alert.info .ca-alert-action:hover { background:#c4b5fd!important; }
        </style>
        <div class="ca-box">
          <h1 class="ca-brand"><span class="ca-accent">Cash</span>board</h1>
          <div class="ca-sub" id="ca-sub">Track your grades, never miss an assignment.</div>
          ${canvasName ? `<div class="ca-canvas-pill"><span class="ca-dot"></span>Connecting as ${canvasName}</div>` : ''}
          <div class="ca-alert" id="ca-alert">
            <div class="ca-alert-title" id="ca-alert-title"></div>
            <div class="ca-alert-body" id="ca-alert-body"></div>
            <button class="ca-alert-action" id="ca-alert-action" style="display:none"></button>
          </div>
          <label class="ca-label">Email</label>
          <input id="ca-email" type="email" placeholder="you@school.edu" autocomplete="off">
          <label class="ca-label">Password</label>
          <input id="ca-pw" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" autocomplete="off">
          <div id="ca-ref-wrap">
            <label class="ca-label">Referral code <span style="color:#52525B!important;font-weight:400!important;text-transform:none!important;letter-spacing:0!important">(optional)</span></label>
            <input id="ca-ref" type="text" placeholder="e.g. BENJI42" autocomplete="off" maxlength="8" style="text-transform:uppercase!important;font-family:'Geist Mono',ui-monospace,monospace!important;letter-spacing:1px!important">
          </div>
          <button class="ca-btn" id="ca-submit">Create account</button>
          <button class="ca-toggle" id="ca-switch">Already have an account? <b>Sign in</b></button>
        </div>`;
      document.body.appendChild(m);

      let isSignup = true;
      const email = m.querySelector('#ca-email');
      const pw = m.querySelector('#ca-pw');
      const ref = m.querySelector('#ca-ref');
      const refWrap = m.querySelector('#ca-ref-wrap');
      const btn = m.querySelector('#ca-submit');
      const sw = m.querySelector('#ca-switch');
      const sub = m.querySelector('#ca-sub');
      const alertEl = m.querySelector('#ca-alert');
      const alertTitle = m.querySelector('#ca-alert-title');
      const alertBody = m.querySelector('#ca-alert-body');
      const alertAction = m.querySelector('#ca-alert-action');

      email.focus();

      function hideAlert() { alertEl.classList.remove('show', 'info'); alertAction.style.display = 'none'; alertAction.onclick = null; }
      function showAlert(title, body, opts) {
        opts = opts || {};
        alertTitle.textContent = title;
        alertBody.textContent = body;
        alertEl.classList.add('show');
        if (opts.info) alertEl.classList.add('info'); else alertEl.classList.remove('info');
        if (opts.actionLabel && opts.onAction) {
          alertAction.textContent = opts.actionLabel;
          alertAction.onclick = opts.onAction;
          alertAction.style.display = 'inline-block';
        } else {
          alertAction.style.display = 'none';
        }
      }

      function setMode(signup) {
        isSignup = signup;
        btn.textContent = isSignup ? 'Create account' : 'Sign in';
        sw.innerHTML = isSignup ? 'Already have an account? <b>Sign in</b>' : "New here? <b>Create an account</b>";
        sub.textContent = isSignup ? 'Track your grades, never miss an assignment.' : 'Welcome back â€” sign in to continue.';
        if (refWrap) refWrap.style.display = isSignup ? '' : 'none';
        hideAlert();
      }

      sw.onclick = () => setMode(!isSignup);

      async function submit() {
        if (!email.value || !pw.value) {
          showAlert('Missing info', 'Fill in both email and password to continue.');
          return;
        }
        btn.disabled = true;
        const origLabel = btn.textContent;
        btn.textContent = 'Workingâ€¦';
        hideAlert();
        try {
          const endpoint = isSignup ? '/api/signup' : '/api/login';
          const payload = { email: email.value, password: pw.value };
          if (isSignup && canvasName) payload.canvas_name = canvasName;
          if (isSignup && ref && ref.value.trim()) payload.referral_code = ref.value.trim().toUpperCase();
          const data = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(payload) });
          if (data.error) {
            const msg = data.error;
            // Account exists â€” offer to switch to sign-in
            if (/already exists/i.test(msg) && isSignup) {
              showAlert('Email already registered', 'An account with this email already exists. Switch to sign in?', {
                info: true,
                actionLabel: 'Sign in instead',
                onAction: () => { setMode(false); pw.value = ''; pw.focus(); }
              });
            }
            // Canvas name already bound to another email
            else if (/already have an account as/i.test(msg) && isSignup) {
              const maskedMatch = msg.match(/as\s+(\S+)/);
              const masked = maskedMatch ? maskedMatch[1] : '';
              showAlert("You're already signed up", 'Your Canvas name is connected to ' + masked + '. Sign in with that email instead.', {
                info: true,
                actionLabel: 'Switch to sign in',
                onAction: () => { setMode(false); email.value = ''; email.focus(); }
              });
            }
            // Generic error
            else {
              showAlert(isSignup ? "Couldn't create account" : "Couldn't sign in", msg);
            }
            btn.disabled = false;
            btn.textContent = origLabel;
            return;
          }
          localStorage.setItem(TOKEN_KEY, data.token);
          m.remove();
          resolve(data.user);
        } catch(e) {
          showAlert('Connection error', 'Check your internet and try again.');
          btn.disabled = false;
          btn.textContent = origLabel;
        }
      }

      btn.onclick = submit;
      email.addEventListener('keydown', (e) => { if (e.key === 'Enter') pw.focus(); });
      pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    });
  }

  async function checkScrapeLimit(user) {
    return true;
  }

  function isBelowAMinus(score) {
    return score != null && score < 90;
  }

  function letterToGPA(letter) {
    if (!letter || letter === 'â€”') return null;
    const map = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0, 'E': 0.0
    };
    return map[letter.trim()] !== undefined ? map[letter.trim()] : null;
  }

  function calculateGPA(grades) {
    let total = 0, count = 0;
    Object.values(grades).forEach(g => {
      const pts = letterToGPA(g.grade);
      if (pts !== null) { total += pts; count++; }
    });
    return count > 0 ? { gpa: (total / count).toFixed(2), count } : null;
  }

  function getCollegesForGPA(gpa) {
    const schools = [
      { name: 'MIT', avg: 3.96 },
      { name: 'Harvard', avg: 3.94 },
      { name: 'Stanford', avg: 3.93 },
      { name: 'Yale', avg: 3.92 },
      { name: 'Princeton', avg: 3.91 },
      { name: 'Caltech', avg: 3.90 },
      { name: 'Columbia', avg: 3.88 },
      { name: 'UChicago', avg: 3.86 },
      { name: 'Duke', avg: 3.85 },
      { name: 'Johns Hopkins', avg: 3.84 },
      { name: 'Northwestern', avg: 3.83 },
      { name: 'Brown', avg: 3.82 },
      { name: 'Dartmouth', avg: 3.80 },
      { name: 'Vanderbilt', avg: 3.79 },
      { name: 'Rice', avg: 3.78 },
      { name: 'Notre Dame', avg: 3.77 },
      { name: 'Georgetown', avg: 3.76 },
      { name: 'Carnegie Mellon', avg: 3.75 },
      { name: 'UCLA', avg: 3.74 },
      { name: 'UC Berkeley', avg: 3.73 },
      { name: 'Emory', avg: 3.72 },
      { name: 'USC', avg: 3.70 },
      { name: 'UVA', avg: 3.68 },
      { name: 'Tufts', avg: 3.67 },
      { name: 'NYU', avg: 3.65 },
      { name: 'UMich', avg: 3.64 },
      { name: 'Boston College', avg: 3.62 },
      { name: 'UNC Chapel Hill', avg: 3.60 },
      { name: 'Wake Forest', avg: 3.58 },
      { name: 'UC Santa Barbara', avg: 3.55 },
      { name: 'UC Irvine', avg: 3.53 },
      { name: 'UC Davis', avg: 3.50 },
      { name: 'Boston University', avg: 3.48 },
      { name: 'Northeastern', avg: 3.45 },
      { name: 'Wisconsin-Madison', avg: 3.42 },
      { name: 'Purdue', avg: 3.40 },
      { name: 'Illinois Urbana', avg: 3.38 },
      { name: 'Ohio State', avg: 3.35 },
      { name: 'Penn State', avg: 3.32 },
      { name: 'U of Maryland', avg: 3.30 },
      { name: 'Rutgers', avg: 3.28 },
      { name: 'U of Minnesota', avg: 3.25 },
      { name: 'Indiana U', avg: 3.20 },
      { name: 'Michigan State', avg: 3.18 },
      { name: 'U of Oregon', avg: 3.15 },
      { name: 'U of Colorado', avg: 3.12 },
      { name: 'Arizona State', avg: 3.08 },
      { name: 'U of Iowa', avg: 3.05 },
      { name: 'U of Alabama', avg: 3.00 },
      { name: 'Auburn', avg: 2.95 },
      { name: 'U of Tennessee', avg: 2.90 },
      { name: 'LSU', avg: 2.85 },
      { name: 'U of Mississippi', avg: 2.80 }
    ];
    const g = parseFloat(gpa);
    // Best 10 schools where user's GPA is within reach (avg - 0.15)
    return schools.filter(s => g >= s.avg - 0.15).slice(0, 10);
  }

  function isTest(a) {
    const name = a.name.toLowerCase();
    return a.is_quiz_assignment ||
      (a.submission_types && a.submission_types.includes('online_quiz')) ||
      /\b(test|exam|final|midterm|assessment|quiz)\b/.test(name);
  }

  // â”€â”€ Helpers â”€â”€

  async function apiFetch(path) {
    const res = await fetch(BASE + path, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('API request failed: ' + path);
    return res.json();
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function relativeDate(dateStr) {
    if (!dateStr) return 'No due date';
    const due = new Date(dateStr);
    const now = new Date();
    const diffMs = due - now;
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays < -1) return Math.abs(diffDays) + 'd ago';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return 'In ' + diffDays + ' days';
    return formatDate(dateStr);
  }

  function getStatus(assignment, submission) {
    const now = new Date();
    const due = assignment.due_at ? new Date(assignment.due_at) : null;
    const onlineTypes = ['online_text_entry', 'online_url', 'online_upload', 'online_quiz', 'media_recording', 'discussion_topic'];
    const requiresOnline = assignment.submission_types && assignment.submission_types.some(t => onlineTypes.includes(t));

    if (submission) {
      if (submission.missing) return { label: 'Missing', cls: 'missing' };
      if (submission.late) return { label: 'Turned in late', cls: 'late' };
      if (submission.workflow_state === 'graded' && submission.score !== null) {
        return { label: submission.score + '/' + (assignment.points_possible || '?'), cls: 'graded' };
      }
      if (submission.workflow_state === 'graded') {
        return { label: 'Graded', cls: 'graded' };
      }
      if (submission.workflow_state === 'submitted' || submission.submitted_at) {
        return { label: 'Submitted', cls: 'submitted' };
      }
    }

    if (due && due < now) {
      if (requiresOnline) return { label: 'Missing', cls: 'missing' };
      return { label: 'No grade', cls: 'upcoming' };
    }
    if (due) return { label: 'Due ' + relativeDate(assignment.due_at), cls: 'upcoming' };
    return { label: 'No due date', cls: 'upcoming' };
  }

  // â”€â”€ Data Fetching â”€â”€

  async function fetchAllData() {
    const courses = await apiFetch('/api/v1/courses?enrollment_state=active&per_page=50');
    const courseMap = {};
    courses.forEach((c, i) => {
      courseMap[c.id] = { name: c.name, color: getCourseColor(c.id, COLORS[i % COLORS.length]) };
    });

    const [moduleArrays, assignmentArrays, enrollmentArrays, groupArrays] = await Promise.all([
      Promise.all(courses.map(c =>
        apiFetch('/api/v1/courses/' + c.id + '/modules?per_page=50')
          .then(mods => mods.map(m => ({ ...m, course_id: c.id })))
          .catch(() => [])
      )),
      Promise.all(courses.map(c =>
        apiFetch('/api/v1/courses/' + c.id + '/assignments?include[]=submission&order_by=due_at&per_page=100')
          .then(asgns => asgns.map(a => ({ ...a, course_id: c.id })))
          .catch(() => [])
      )),
      Promise.all(courses.map(c =>
        apiFetch('/api/v1/courses/' + c.id + '/enrollments?user_id=self&per_page=10')
          .catch(() => [])
      )),
      Promise.all(courses.map(c =>
        apiFetch('/api/v1/courses/' + c.id + '/assignment_groups?per_page=50')
          .then(groups => groups.map(g => ({ ...g, course_id: c.id })))
          .catch(() => [])
      ))
    ]);

    // Build assignment group weights per course
    const assignmentGroups = {};
    groupArrays.flat().forEach(g => {
      if (!assignmentGroups[g.course_id]) assignmentGroups[g.course_id] = {};
      assignmentGroups[g.course_id][g.id] = { name: g.name, weight: g.group_weight || 0 };
    });

    const currentModules = {};
    moduleArrays.forEach(mods => {
      mods.forEach(m => {
        if (m.state === 'unlocked' || m.state === 'started') {
          currentModules[m.course_id] = m;
        }
      });
    });

    const moduleAssignmentIds = {};
    const moduleItems = {};
    await Promise.all(
      Object.entries(currentModules).map(async ([courseId, mod]) => {
        try {
          const items = await apiFetch('/api/v1/courses/' + courseId + '/modules/' + mod.id + '/items?per_page=100');
          moduleItems[courseId] = items;
          moduleAssignmentIds[courseId] = {
            moduleName: mod.name,
            ids: new Set(items.filter(i => i.type === 'Assignment' || i.type === 'Quiz' || i.type === 'Discussion').map(i => i.content_id))
          };
        } catch (e) { /* skip */ }
      })
    );

    const allAssignments = assignmentArrays.flat();
    const currentUnitAssignments = [];

    allAssignments.forEach(a => {
      const modInfo = moduleAssignmentIds[a.course_id];
      if (modInfo && modInfo.ids.has(a.id)) {
        currentUnitAssignments.push(a);
      }
      if (!currentModules[a.course_id] && a.due_at) {
        const due = new Date(a.due_at);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        if (due >= twoWeeksAgo) {
          currentUnitAssignments.push(a);
        }
      }
    });

    currentUnitAssignments.sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at) - new Date(b.due_at);
    });

    const grades = {};
    enrollmentArrays.flat().forEach(e => {
      if (e.type === 'StudentEnrollment' && e.grades) {
        grades[e.course_id] = { grade: e.grades.current_grade || 'â€”', score: e.grades.current_score };
      }
    });

    return { courses, courseMap, currentUnitAssignments, allAssignments, grades, currentModules, moduleAssignmentIds, moduleItems, assignmentGroups };
  }

  // â”€â”€ Rendering â”€â”€

  function render(data) {
    const { courses, courseMap, currentUnitAssignments, allAssignments, grades, currentModules, moduleAssignmentIds, moduleItems, assignmentGroups } = data;
    const currentTheme = loadTheme();

    const overlay = document.createElement('div');
    overlay.id = 'canvas-dash-overlay';
    if (currentTheme === 'dark') overlay.classList.add('cd-dark');

    if (!document.getElementById('cd-fonts-link')) {
      const fontsLink = document.createElement('link');
      fontsLink.id = 'cd-fonts-link';
      fontsLink.rel = 'stylesheet';
      fontsLink.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
      document.head.appendChild(fontsLink);
    }
    const style = document.createElement('style');
    style.textContent = `
      #canvas-dash-overlay, #canvas-dash-overlay * {
        font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif !important;
        -webkit-font-smoothing: antialiased !important; box-sizing: border-box !important;
        font-feature-settings: 'ss01', 'ss03', 'cv11' !important;
      }
      #canvas-dash-overlay .cd-mono, #canvas-dash-overlay .cd-mono * {
        font-family: 'Geist Mono', ui-monospace, monospace !important;
      }

      /* â”€â”€ Theme variables (cinematic dashboard) â”€â”€ */
      #canvas-dash-overlay {
        --cd-bg: #FAFAFA;
        --cd-bg-secondary: #F2F2F4;
        --cd-surface: #FFFFFF;
        --cd-surface-2: #F7F7F8;
        --cd-text: #09090B;
        --cd-text-secondary: #52525B;
        --cd-text-muted: #8A8A93;
        --cd-border: #E4E4E7;
        --cd-border-light: #EEEEF0;
        --cd-row-bg: #FFFFFF;
        --cd-row-hover: #F5F5F7;
        --cd-card-shadow: 0 60px 120px -30px rgba(0,0,0,0.28), 0 20px 40px -20px rgba(0,0,0,0.12);
        --cd-overlay-bg: radial-gradient(ellipse at top, rgba(60,30,90,0.7), rgba(8,8,12,0.92)) !important;
        --cd-picker-bg: #FFFFFF;
        --cd-picker-shadow: 0 16px 48px rgba(0,0,0,0.18);
        --cd-badge-upcoming-bg: #F2F2F4;
        --cd-badge-upcoming-color: #52525B;
        --cd-allgood-bg: linear-gradient(135deg, rgba(74,222,128,0.08), rgba(34,211,238,0.06));
        --cd-allgood-border: rgba(74,222,128,0.3);
        --cd-allgood-color: #15803D;
        --cd-link-hover: #7C5CFC;
        --cd-toggle-bg: #E4E4E7;
        --cd-toggle-knob: #FFFFFF;
        --cd-accent-red: #F43F5E;
        --cd-accent-amber: #F59E0B;
        --cd-accent-green: #10B981;
        --cd-accent-violet: #7C5CFC;
        --cd-accent-blue: #3B82F6;
        --cd-accent-cyan: #06B6D4;
        --cd-accent-pink: #EC4899;
        --cd-grad-violet: linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%);
        --cd-grad-card-hi: linear-gradient(180deg, rgba(16,185,129,0.08) 0%, transparent 60%);
        --cd-grad-card-lo: linear-gradient(180deg, rgba(244,63,94,0.08) 0%, transparent 60%);
        --cd-grad-card-mid: linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 60%);
      }
      #canvas-dash-overlay.cd-dark {
        --cd-bg: #0A0A0C;
        --cd-bg-secondary: #111114;
        --cd-surface: #141418;
        --cd-surface-2: #1A1A20;
        --cd-text: #FAFAFA;
        --cd-text-secondary: #A1A1AA;
        --cd-text-muted: #71717A;
        --cd-border: #27272A;
        --cd-border-light: #1E1E22;
        --cd-row-bg: #141418;
        --cd-row-hover: #1C1C22;
        --cd-card-shadow: 0 60px 120px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03);
        --cd-overlay-bg: radial-gradient(ellipse at top, rgba(80,40,120,0.45), rgba(0,0,0,0.96));
        --cd-picker-bg: #1A1A20;
        --cd-picker-shadow: 0 16px 48px rgba(0,0,0,0.7);
        --cd-badge-upcoming-bg: #1A1A20;
        --cd-badge-upcoming-color: #A1A1AA;
        --cd-allgood-bg: linear-gradient(135deg, rgba(74,222,128,0.1), rgba(34,211,238,0.08));
        --cd-allgood-border: rgba(74,222,128,0.25);
        --cd-allgood-color: #4ADE80;
        --cd-link-hover: #A78BFA;
        --cd-toggle-bg: #27272A;
        --cd-toggle-knob: #FAFAFA;
        --cd-accent-red: #FB7185;
        --cd-accent-amber: #FBBF24;
        --cd-accent-green: #4ADE80;
        --cd-accent-violet: #A78BFA;
        --cd-accent-blue: #60A5FA;
        --cd-accent-cyan: #22D3EE;
        --cd-accent-pink: #F472B6;
        --cd-grad-violet: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);
        --cd-grad-card-hi: linear-gradient(180deg, rgba(74,222,128,0.12) 0%, transparent 55%);
        --cd-grad-card-lo: linear-gradient(180deg, rgba(251,113,133,0.14) 0%, transparent 55%);
        --cd-grad-card-mid: linear-gradient(180deg, rgba(251,191,36,0.12) 0%, transparent 55%);
      }

      /* â”€â”€ Base â”€â”€ */
      #canvas-dash-overlay {
        position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        background: var(--cd-overlay-bg) !important; z-index: 999999 !important;
        display: flex !important; justify-content: center !important; align-items: flex-start !important;
        padding: 24px !important; overflow-y: auto !important;
        animation: cd-fade-in 0.15s ease !important;
      }

      /* â”€â”€ Card â”€â”€ */
      #canvas-dash-card {
        background: var(--cd-bg) !important;
        border-radius: 24px !important; width: 100% !important; max-width: 960px !important;
        box-shadow: var(--cd-card-shadow) !important; padding: 32px 36px 36px !important; position: relative !important;
        animation: cd-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        border: 1px solid var(--cd-border) !important;
      }
      #canvas-dash-card::before {
        content: '' !important;
        position: absolute !important; inset: 0 !important; pointer-events: none !important;
        border-radius: 24px !important;
        background:
          radial-gradient(ellipse 800px 200px at 50% -50px, rgba(124,92,252,0.08), transparent 70%),
          radial-gradient(ellipse 400px 100px at 100% 0%, rgba(236,72,153,0.06), transparent 70%);
        z-index: 0 !important;
      }
      #canvas-dash-card > * { position: relative !important; }

      /* â”€â”€ Header â”€â”€ */
      .cd-header-row {
        display: flex !important; align-items: center !important; justify-content: space-between !important;
        margin-bottom: 24px !important; position: relative !important; z-index: 50 !important;
      }
      .cd-masthead-meta {
        display: flex !important; align-items: center !important; gap: 10px !important;
        font-family: 'Geist Mono', ui-monospace, monospace !important;
        font-size: 10px !important; font-weight: 500 !important; text-transform: uppercase !important;
        letter-spacing: 1.6px !important; color: var(--cd-text-muted) !important;
        margin-bottom: 8px !important;
      }
      .cd-masthead-meta .cd-pulse-dot {
        display: inline-block !important; width: 6px !important; height: 6px !important;
        border-radius: 50% !important; background: var(--cd-accent-green) !important;
        box-shadow: 0 0 0 0 var(--cd-accent-green) !important;
        animation: cd-pulse 2s infinite !important;
      }
      @keyframes cd-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
        50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
      }
      .cd-masthead-meta .cd-dot-sep { opacity: 0.35 !important; }
      .cd-header-row h1 {
        margin: 0 !important;
        font-size: 36px !important; color: var(--cd-text) !important;
        font-weight: 700 !important;
        letter-spacing: -1.5px !important; line-height: 1 !important;
        display: flex !important; align-items: baseline !important; gap: 8px !important;
      }
      .cd-header-row h1 .cd-brand-accent {
        font-family: 'Instrument Serif', Georgia, serif !important;
        font-style: italic !important; font-weight: 400 !important;
        background: var(--cd-grad-violet) !important;
        -webkit-background-clip: text !important; background-clip: text !important;
        -webkit-text-fill-color: transparent !important; color: transparent !important;
        letter-spacing: 0 !important; padding-right: 6px !important; margin-right: 2px !important;
      }
      .cd-header-row .cd-subtitle {
        font-size: 13px !important; color: var(--cd-text-muted) !important;
        font-weight: 500 !important; margin-top: 6px !important; letter-spacing: -0.1px !important;
      }
      .cd-header-controls {
        display: flex !important; align-items: center !important; gap: 6px !important;
      }

      /* â”€â”€ GPA badge â”€â”€ */
      .cd-gpa-wrap {
        position: relative !important;
      }
      .cd-gpa-badge {
        display: flex !important; align-items: baseline !important; gap: 6px !important;
        padding: 8px 14px !important; border-radius: 10px !important;
        background: var(--cd-surface) !important; border: 1px solid var(--cd-border) !important;
        cursor: pointer !important; transition: border-color 0.15s !important;
      }
      .cd-gpa-badge:hover { border-color: var(--cd-accent-violet) !important; }
      .cd-gpa-num {
        font-size: 18px !important; font-weight: 700 !important; letter-spacing: -0.5px !important;
        color: var(--cd-text) !important; line-height: 1 !important;
      }
      .cd-gpa-label {
        font-size: 9px !important; font-weight: 600 !important; text-transform: uppercase !important;
        letter-spacing: 0.6px !important; color: var(--cd-text-muted) !important;
      }
      .cd-college-panel {
        position: absolute !important; top: 100% !important; right: 0 !important; margin-top: 8px !important;
        width: 320px !important; background: var(--cd-bg) !important; border: 1px solid var(--cd-border) !important;
        border-radius: 14px !important; box-shadow: 0 12px 40px rgba(0,0,0,0.25) !important;
        z-index: 100 !important; overflow: hidden !important; animation: cd-pop-in 0.15s ease !important;
      }
      .cd-college-panel-title {
        padding: 14px 16px 10px !important; font-size: 13px !important; font-weight: 700 !important;
        color: var(--cd-text) !important; border-bottom: 1px solid var(--cd-border-light) !important;
      }
      .cd-college-panel-title span { color: var(--cd-text-muted) !important; font-weight: 500 !important; font-size: 11px !important; }
      .cd-college-list { max-height: 360px !important; overflow-y: auto !important; }
      .cd-college-row {
        display: flex !important; align-items: center !important; gap: 10px !important;
        padding: 10px 16px !important; border-top: 1px solid var(--cd-border-light) !important;
        transition: background 0.1s !important;
      }
      .cd-college-row:first-child { border-top: none !important; }
      .cd-college-row:hover { background: var(--cd-row-hover) !important; }
      .cd-college-rank {
        font-size: 11px !important; font-weight: 800 !important; color: var(--cd-text-muted) !important;
        min-width: 18px !important; text-align: center !important;
      }
      .cd-college-name {
        flex: 1 !important; font-size: 13px !important; font-weight: 600 !important; color: var(--cd-text) !important;
      }
      .cd-college-gpa {
        font-size: 11px !important; font-weight: 700 !important; padding: 2px 8px !important;
        border-radius: 10px !important; background: var(--cd-badge-upcoming-bg) !important;
        color: var(--cd-text-secondary) !important;
      }
      .cd-college-note {
        padding: 10px 16px 14px !important; font-size: 10px !important; color: var(--cd-text-muted) !important;
        border-top: 1px solid var(--cd-border-light) !important; line-height: 1.4 !important;
      }

      /* â”€â”€ Theme toggle â”€â”€ */
      .cd-theme-toggle {
        display: flex !important; align-items: center !important; gap: 7px !important; cursor: pointer !important;
        user-select: none !important; font-size: 13px !important; color: var(--cd-text-muted) !important; font-weight: 500 !important;
      }
      .cd-toggle-track {
        width: 40px !important; height: 22px !important; border-radius: 11px !important;
        background: var(--cd-toggle-bg) !important; position: relative !important;
        transition: background 0.25s ease !important;
      }
      .cd-toggle-knob {
        width: 16px !important; height: 16px !important; border-radius: 50% !important;
        background: var(--cd-toggle-knob) !important; position: absolute !important;
        top: 3px !important; left: 3px !important; transition: transform 0.25s ease !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
      }
      .cd-dark .cd-toggle-knob { transform: translateX(18px) !important; }


      /* â”€â”€ Section titles â”€â”€ */
      .cd-section-title {
        font-size: 11px !important; font-weight: 600 !important; text-transform: uppercase !important;
        letter-spacing: 1.2px !important; margin-bottom: 12px !important; margin-top: 4px !important;
        display: flex !important; align-items: center !important; gap: 8px !important;
      }
      .cd-section-title::before {
        content: '' !important; display: inline-block !important;
        width: 6px !important; height: 6px !important; background: currentColor !important;
        border-radius: 50% !important; box-shadow: 0 0 10px currentColor !important;
      }
      .cd-section-title.red { color: var(--cd-accent-red) !important; }
      .cd-section-title.blue { color: var(--cd-text-muted) !important; }
      .cd-section-title.orange { color: var(--cd-accent-amber) !important; }
      .cd-section-title.green { color: var(--cd-accent-green) !important; }

      /* â”€â”€ Grade grid â”€â”€ */
      .cd-grades {
        display: grid !important; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
        gap: 10px !important; margin-bottom: 28px !important;
      }
      .cd-grade-card {
        padding: 18px 20px !important; border-radius: 16px !important;
        background: var(--cd-surface) !important;
        border: 1px solid var(--cd-border) !important;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, box-shadow 0.2s !important;
        position: relative !important; cursor: pointer !important; overflow: hidden !important;
        display: flex !important; flex-direction: column !important; justify-content: space-between !important;
        min-height: 130px !important;
      }
      .cd-grade-card::before {
        content: '' !important; position: absolute !important; inset: 0 !important;
        background: var(--cd-card-grad, transparent) !important; pointer-events: none !important;
        opacity: 1 !important; transition: opacity 0.2s !important;
      }
      .cd-grade-card > * { position: relative !important; z-index: 1 !important; }
      .cd-grade-card:hover {
        transform: translateY(-3px) !important;
        border-color: currentColor !important;
        box-shadow: 0 12px 32px -8px rgba(0,0,0,0.15) !important;
      }
      .cd-grade-card .cd-course-name {
        font-weight: 500 !important; margin-bottom: 2px !important; font-size: 12px !important;
        white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
        color: var(--cd-text-secondary) !important; letter-spacing: -0.1px !important;
      }
      .cd-grade-card .cd-grade-val {
        font-size: 48px !important; font-weight: 700 !important;
        letter-spacing: -2.5px !important; line-height: 1 !important;
        margin-top: 8px !important;
      }
      .cd-grade-card .cd-grade-pct {
        font-family: 'Geist Mono', ui-monospace, monospace !important;
        font-size: 12px !important; margin-top: 2px !important; font-weight: 500 !important;
        color: var(--cd-text-muted) !important; letter-spacing: -0.1px !important;
      }

      .cd-all-good {
        background: var(--cd-allgood-bg) !important; border: 1px solid var(--cd-allgood-border) !important;
        border-radius: 16px !important; padding: 20px 24px !important; color: var(--cd-allgood-color) !important;
        font-size: 15px !important; font-weight: 600 !important;
        margin-bottom: 28px !important; text-align: center !important;
        letter-spacing: -0.2px !important;
      }

      /* â”€â”€ Small grade cards â”€â”€ */
      .cd-grades-sm {
        display: grid !important; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
        gap: 8px !important; margin-bottom: 28px !important;
      }
      .cd-grade-card-sm {
        padding: 14px 16px !important; border-radius: 14px !important;
        background: var(--cd-surface) !important;
        border: 1px solid var(--cd-border) !important;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s !important;
        cursor: pointer !important; position: relative !important; overflow: hidden !important;
      }
      .cd-grade-card-sm::before {
        content: '' !important; position: absolute !important; inset: 0 !important;
        background: var(--cd-card-grad, transparent) !important; pointer-events: none !important;
      }
      .cd-grade-card-sm > * { position: relative !important; z-index: 1 !important; }
      .cd-grade-card-sm:hover { transform: translateY(-2px) !important; border-color: currentColor !important; }
      .cd-grade-card-sm .cd-course-name-sm {
        font-weight: 500 !important; font-size: 11px !important; white-space: nowrap !important;
        overflow: hidden !important; text-overflow: ellipsis !important; color: var(--cd-text-secondary) !important;
        letter-spacing: -0.1px !important;
      }
      .cd-grade-card-sm .cd-grade-row-sm {
        display: flex !important; align-items: baseline !important; gap: 6px !important; margin-top: 6px !important;
      }
      .cd-grade-card-sm .cd-grade-val-sm {
        font-size: 24px !important; font-weight: 700 !important;
        letter-spacing: -1px !important; line-height: 1 !important;
      }
      .cd-grade-card-sm .cd-grade-pct-sm {
        font-family: 'Geist Mono', ui-monospace, monospace !important;
        font-size: 11px !important; font-weight: 500 !important; color: var(--cd-text-muted) !important;
      }

      /* â”€â”€ Course sections â”€â”€ */
      .cd-course-section {
        margin-bottom: 8px !important; border: 1px solid var(--cd-border) !important;
        border-radius: 16px !important; overflow: hidden !important;
        background: var(--cd-surface) !important;
        transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
        position: relative !important;
      }
      .cd-course-section::before {
        content: '' !important; position: absolute !important;
        left: 0 !important; top: 0 !important; bottom: 0 !important; width: 3px !important;
        background: var(--cd-course-color, var(--cd-accent-violet)) !important;
        opacity: 0.7 !important;
      }
      .cd-course-section.cd-highlight {
        border-color: var(--cd-accent-violet) !important;
        box-shadow: 0 0 0 3px rgba(124,92,252,0.25), 0 12px 32px -8px rgba(124,92,252,0.25) !important;
      }
      .cd-course-header {
        display: flex !important; align-items: center !important; justify-content: space-between !important;
        padding: 14px 18px !important;
        font-size: 15px !important; font-weight: 600 !important; color: var(--cd-text) !important;
        letter-spacing: -0.3px !important;
        cursor: pointer !important; user-select: none !important; background: transparent !important;
        transition: background 0.15s !important;
      }
      .cd-course-header:hover { background: var(--cd-row-hover) !important; }
      .cd-course-header .cd-header-left { display: flex !important; align-items: center !important; gap: 10px !important; min-width: 0 !important; }
      .cd-course-header .cd-header-left span:first-child {
        white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
      }
      .cd-course-header .cd-unit-label {
        font-family: 'Geist Mono', ui-monospace, monospace !important;
        font-size: 10px !important; color: var(--cd-text-muted) !important;
        font-weight: 500 !important; white-space: nowrap !important;
        padding: 3px 8px !important; border-radius: 6px !important;
        background: var(--cd-bg-secondary) !important;
      }
      .cd-course-header .cd-arrow {
        font-size: 11px !important; transition: transform 0.2s ease !important;
        color: var(--cd-text-muted) !important;
      }
      .cd-course-header.open .cd-arrow { transform: rotate(180deg) !important; }
      .cd-course-body {
        display: none !important;
      }
      .cd-course-body.open { display: block !important; }

      /* â”€â”€ Color picker â”€â”€ */
      .cd-color-btn {
        width: 20px !important; height: 20px !important; border-radius: 50% !important;
        border: 2px solid var(--cd-border) !important; cursor: pointer !important;
        background: var(--cd-bg-secondary) !important; flex-shrink: 0 !important;
        transition: transform 0.15s ease, border-color 0.15s ease !important;
        position: relative !important;
      }
      .cd-color-btn:hover { transform: scale(1.15) !important; border-color: var(--cd-text-muted) !important; }
      .cd-course-header:not(.open) .cd-color-btn { display: none !important; }
      .cd-color-picker {
        position: absolute !important; top: 100% !important; right: 0 !important; margin-top: 8px !important;
        background: var(--cd-picker-bg) !important; border-radius: 12px !important; padding: 10px !important;
        box-shadow: var(--cd-picker-shadow) !important; z-index: 10 !important;
        display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 6px !important;
        animation: cd-pop-in 0.2s ease both !important;
      }
      .cd-color-swatch {
        width: 26px !important; height: 26px !important; border-radius: 50% !important;
        border: 2px solid transparent !important; cursor: pointer !important;
        transition: transform 0.15s ease, border-color 0.15s ease !important;
      }
      .cd-color-swatch:hover { transform: scale(1.2) !important; border-color: var(--cd-text) !important; }
      .cd-color-swatch.active { border-color: var(--cd-text) !important; box-shadow: 0 0 0 2px var(--cd-bg), 0 0 0 4px var(--cd-text) !important; }

      /* â”€â”€ Assignment rows â”€â”€ */
      .cd-assignment-row {
        display: flex !important; align-items: center !important; padding: 12px 18px !important;
        gap: 12px !important; border-top: 1px solid var(--cd-border-light) !important; background: transparent !important;
        transition: background 0.12s !important;
      }
      .cd-assignment-row:hover { background: var(--cd-row-hover) !important; }
      .cd-assignment-name {
        flex: 1 !important; color: var(--cd-text) !important; text-decoration: none !important; font-weight: 500 !important;
        font-size: 14px !important; line-height: 1.4 !important; letter-spacing: -0.1px !important;
      }
      .cd-assignment-name:hover { color: var(--cd-accent-violet) !important; text-decoration: none !important; }
      .cd-ai-btn {
        font-family: 'Geist Mono', ui-monospace, monospace !important;
        font-size: 10px !important; font-weight: 700 !important; letter-spacing: 0.8px !important;
        text-transform: uppercase !important; padding: 5px 9px !important; border-radius: 6px !important;
        background: linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%) !important;
        color: #fff !important; border: none !important; cursor: pointer !important;
        transition: transform 0.12s, opacity 0.12s !important;
      }
      .cd-ai-btn:hover { transform: translateY(-1px) !important; }
      .cd-ai-btn:disabled { opacity: 0.5 !important; cursor: wait !important; transform: none !important; }
      .cd-due {
        font-family: 'Geist Mono', ui-monospace, monospace !important;
        color: var(--cd-text-muted) !important; font-size: 11px !important;
        min-width: 90px !important; text-align: right !important; font-weight: 500 !important;
        letter-spacing: -0.1px !important;
      }
      .cd-status-badge {
        font-size: 10px !important; font-weight: 700 !important; padding: 5px 10px !important;
        border-radius: 999px !important; white-space: nowrap !important; min-width: 78px !important; text-align: center !important;
        text-transform: uppercase !important; letter-spacing: 0.8px !important;
        border: 1px solid transparent !important;
      }
      .cd-status-badge.missing { background: rgba(244,63,94,0.12) !important; color: var(--cd-accent-red) !important; border-color: rgba(244,63,94,0.25) !important; }
      .cd-status-badge.late { background: rgba(245,158,11,0.12) !important; color: var(--cd-accent-amber) !important; border-color: rgba(245,158,11,0.25) !important; }
      .cd-status-badge.submitted { background: rgba(59,130,246,0.12) !important; color: var(--cd-accent-blue) !important; border-color: rgba(59,130,246,0.25) !important; }
      .cd-status-badge.graded { background: rgba(16,185,129,0.12) !important; color: var(--cd-accent-green) !important; border-color: rgba(16,185,129,0.25) !important; }
      .cd-status-badge.upcoming { background: var(--cd-badge-upcoming-bg) !important; color: var(--cd-badge-upcoming-color) !important; border-color: var(--cd-border) !important; }
      .cd-dark .cd-status-badge.missing { background: rgba(251,113,133,0.14) !important; color: var(--cd-accent-red) !important; border-color: rgba(251,113,133,0.3) !important; }
      .cd-dark .cd-status-badge.late { background: rgba(251,191,36,0.14) !important; color: var(--cd-accent-amber) !important; border-color: rgba(251,191,36,0.3) !important; }
      .cd-dark .cd-status-badge.submitted { background: rgba(96,165,250,0.14) !important; color: var(--cd-accent-blue) !important; border-color: rgba(96,165,250,0.3) !important; }
      .cd-dark .cd-status-badge.graded { background: rgba(74,222,128,0.14) !important; color: var(--cd-accent-green) !important; border-color: rgba(74,222,128,0.3) !important; }


      .cd-empty { color: var(--cd-text-muted) !important; font-size: 14px !important; padding: 16px 20px !important; text-align: center !important; }

      /* â”€â”€ Stats strip â”€â”€ */
      .cd-stats-strip {
        display: grid !important; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
        gap: 8px !important; margin-bottom: 28px !important;
        position: relative !important; z-index: 5 !important;
      }
      .cd-stat {
        padding: 16px 18px !important; text-align: left !important;
        background: var(--cd-surface) !important;
        border: 1px solid var(--cd-border) !important;
        border-radius: 14px !important;
        display: flex !important; flex-direction: column !important; gap: 6px !important;
        position: relative !important;
        box-shadow: inset 3px 0 0 currentColor !important;
        transition: border-color 0.15s, transform 0.15s !important;
      }
      .cd-stat-num {
        font-size: 30px !important; font-weight: 700 !important; line-height: 1 !important;
        letter-spacing: -1.5px !important; font-feature-settings: 'tnum', 'ss01' !important;
      }
      .cd-stat-num.red { color: var(--cd-accent-red) !important; }
      .cd-stat-num.blue { color: var(--cd-accent-blue) !important; }
      .cd-stat-num.orange { color: var(--cd-accent-amber) !important; }
      .cd-stat-num.green { color: var(--cd-accent-green) !important; }
      .cd-stat { color: var(--cd-text-muted) !important; }
      .cd-stat.has-red { color: var(--cd-accent-red) !important; }
      .cd-stat.has-blue { color: var(--cd-accent-blue) !important; }
      .cd-stat.has-orange { color: var(--cd-accent-amber) !important; }
      .cd-stat.has-green { color: var(--cd-accent-green) !important; }
      .cd-stat-label {
        font-size: 11px !important; font-weight: 600 !important; text-transform: uppercase !important;
        letter-spacing: 0.6px !important; color: var(--cd-text-muted) !important;
      }
      .cd-stat { cursor: pointer !important; transition: background 0.15s !important; position: relative !important; }
      .cd-stat:hover { background: var(--cd-bg) !important; }
      .cd-stat-panel {
        position: absolute !important; top: 100% !important; left: -1px !important; right: -1px !important;
        background: var(--cd-bg) !important; border: 1px solid var(--cd-border) !important;
        border-top: none !important; border-radius: 0 0 12px 12px !important;
        max-height: 300px !important; overflow-y: auto !important; z-index: 5 !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
      }
      .cd-stat-panel .cd-stat-row {
        display: flex !important; align-items: center !important; gap: 8px !important;
        padding: 10px 14px !important; border-top: 1px solid var(--cd-border-light) !important;
        font-size: 13px !important;
      }
      .cd-stat-panel .cd-stat-row:hover { background: var(--cd-row-hover) !important; }
      .cd-stat-panel .cd-stat-dot {
        width: 8px !important; height: 8px !important; border-radius: 50% !important; flex-shrink: 0 !important;
      }
      .cd-stat-panel .cd-stat-name {
        flex: 1 !important; color: var(--cd-text) !important; text-decoration: none !important;
        font-weight: 600 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important;
      }
      .cd-stat-panel .cd-stat-name:hover { text-decoration: underline !important; color: var(--cd-link-hover) !important; }
      .cd-stat-panel .cd-stat-due {
        font-size: 11px !important; color: var(--cd-text-muted) !important; white-space: nowrap !important; font-weight: 500 !important;
      }
      .cd-stat-panel .cd-stat-empty {
        padding: 14px !important; text-align: center !important; color: var(--cd-text-muted) !important; font-size: 13px !important;
      }

      /* â”€â”€ Progress bars â”€â”€ */
      .cd-grade-bar {
        height: 4px !important; border-radius: 2px !important; background: var(--cd-border) !important;
        margin-top: 10px !important; overflow: hidden !important;
      }
      .cd-grade-bar-fill {
        height: 100% !important; border-radius: 2px !important;
        transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .cd-grade-bar-sm { margin-top: 6px !important; height: 3px !important; }

      .cd-loading { display: flex !important; justify-content: center !important; align-items: center !important; padding: 60px !important; font-size: 18px !important; color: #ccc !important; }
      .cd-spinner {
        width: 26px !important; height: 26px !important; border: 3px solid rgba(255,255,255,0.2) !important;
        border-top-color: #fff !important; border-radius: 50% !important;
        animation: cd-spin 0.7s linear infinite !important; margin-right: 14px !important;
      }
      @keyframes cd-spin { to { transform: rotate(360deg); } }
      @keyframes cd-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes cd-slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cd-pop-in { from { opacity: 0; } to { opacity: 1; } }

      /* â”€â”€ What-if calculator â”€â”€ */
      .cd-status-badge.clickable { cursor: pointer !important; }
      .cd-status-badge.clickable:hover { outline: 2px dashed var(--cd-text-muted) !important; outline-offset: 2px !important; border-radius: 20px !important; }
      .cd-whatif-wrap {
        display: flex !important; align-items: center !important; gap: 4px !important; min-width: 80px !important;
      }
      .cd-whatif-input {
        width: 52px !important; padding: 3px 6px !important; border: 2px solid #4F46E5 !important; border-radius: 6px !important;
        font-size: 13px !important; font-weight: 700 !important; text-align: center !important; background: var(--cd-bg) !important;
        color: var(--cd-text) !important; outline: none !important;
      }
      .cd-whatif-input:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.15) !important; }
      .cd-whatif-total {
        font-size: 12px !important; color: var(--cd-text-muted) !important; font-weight: 600 !important; white-space: nowrap !important;
      }
      .cd-grade-projected {
        font-size: 12px !important; font-weight: 700 !important; margin-top: 4px !important; color: #059669 !important;
      }
      .cd-grade-projected:empty { display: none !important; }
      .cd-grade-projected.down { color: #EF4444 !important; }
      .cd-dark .cd-grade-projected { color: #34d399 !important; }
      .cd-dark .cd-grade-projected.down { color: #f87171 !important; }

      /* â”€â”€ Header control buttons (unified) â”€â”€ */
      .cd-play-btn, .cd-settings-btn, .cd-bell-btn, .cd-logout-btn, .cd-close {
        display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;
        padding: 8px 12px !important; border-radius: 10px !important; border: 1px solid var(--cd-border) !important;
        font-size: 12px !important; font-weight: 500 !important; cursor: pointer !important;
        background: var(--cd-surface) !important; color: var(--cd-text-secondary) !important;
        transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s !important;
        min-height: 36px !important; min-width: 36px !important;
      }
      .cd-play-btn:hover, .cd-settings-btn:hover, .cd-bell-btn:hover, .cd-close:hover {
        background: var(--cd-bg-secondary) !important; color: var(--cd-text) !important;
        border-color: var(--cd-text-muted) !important;
      }
      .cd-play-btn { background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08)) !important; color: var(--cd-accent-amber) !important; border-color: rgba(245,158,11,0.25) !important; }
      .cd-play-btn:hover { background: linear-gradient(135deg, rgba(251,191,36,0.22), rgba(245,158,11,0.15)) !important; color: var(--cd-accent-amber) !important; transform: translateY(-1px) !important; }
      .cd-settings-btn, .cd-bell-btn, .cd-close { padding: 8px 10px !important; font-size: 14px !important; }
      .cd-close { font-size: 18px !important; font-weight: 400 !important; line-height: 1 !important; }

      /* â”€â”€ Bell notification â”€â”€ */
      .cd-bell-wrap { position: relative !important; }
      .cd-bell-badge {
        position: absolute !important; top: -4px !important; right: -4px !important;
        min-width: 18px !important; height: 18px !important; padding: 0 5px !important;
        border-radius: 9px !important; background: #EF4444 !important; color: #fff !important;
        font-size: 11px !important; font-weight: 800 !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        border: 2px solid var(--cd-bg) !important; box-sizing: content-box !important;
        animation: cd-bell-pop 0.3s ease !important;
      }
      @keyframes cd-bell-pop { 0% { transform: scale(0); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
      .cd-notif-panel {
        position: absolute !important; top: 100% !important; right: 0 !important; margin-top: 8px !important;
        width: 340px !important; background: var(--cd-surface) !important; border: 1px solid var(--cd-border) !important;
        border-radius: 14px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.35) !important;
        z-index: 9999 !important; overflow: hidden !important; animation: cd-pop-in 0.15s ease !important;
      }
      .cd-notif-panel-title {
        padding: 14px 16px 10px !important; font-size: 13px !important; font-weight: 700 !important;
        color: var(--cd-text) !important; border-bottom: 1px solid var(--cd-border-light) !important;
        display: flex !important; justify-content: space-between !important; align-items: center !important;
      }
      .cd-notif-panel-title span { color: var(--cd-text-muted) !important; font-weight: 500 !important; font-size: 11px !important; }
      .cd-notif-list { max-height: 380px !important; overflow-y: auto !important; }
      .cd-notif-row {
        display: flex !important; align-items: center !important; gap: 10px !important;
        padding: 10px 16px !important; border-top: 1px solid var(--cd-border-light) !important;
        transition: background 0.1s !important; text-decoration: none !important;
      }
      .cd-notif-row:first-child { border-top: none !important; }
      .cd-notif-row:hover { background: var(--cd-row-hover) !important; }
      .cd-notif-row.new { background: rgba(239,68,68,0.06) !important; }
      .cd-notif-body { flex: 1 !important; min-width: 0 !important; }
      .cd-notif-name {
        font-size: 13px !important; font-weight: 600 !important; color: var(--cd-text) !important;
        white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
      }
      .cd-notif-course {
        font-size: 11px !important; color: var(--cd-text-muted) !important; font-weight: 500 !important;
        margin-top: 2px !important;
      }
      .cd-notif-score {
        font-size: 12px !important; font-weight: 800 !important; padding: 4px 9px !important;
        border-radius: 8px !important; background: #D1FAE5 !important; color: #065F46 !important;
        flex-shrink: 0 !important;
      }
      .cd-dark .cd-notif-score { background: #052e16 !important; color: #6ee7b7 !important; }
      .cd-notif-score.low { background: #FEE2E2 !important; color: #991B1B !important; }
      .cd-dark .cd-notif-score.low { background: #450a0a !important; color: #fca5a5 !important; }
      .cd-notif-empty {
        padding: 24px 16px !important; text-align: center !important; font-size: 13px !important;
        color: var(--cd-text-muted) !important;
      }

      /* â”€â”€ Study button â”€â”€ */
      .cd-study-btn {
        padding: 7px 14px !important; border-radius: 999px !important;
        border: none !important;
        font-size: 12px !important; font-weight: 600 !important; cursor: pointer !important;
        background: var(--cd-grad-violet) !important; color: #fff !important;
        transition: transform 0.15s, box-shadow 0.15s !important; white-space: nowrap !important;
        letter-spacing: -0.1px !important;
        box-shadow: 0 4px 12px rgba(124,92,252,0.3) !important;
      }
      .cd-study-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(124,92,252,0.45) !important; }
      .cd-course-header:not(.open) .cd-study-btn { display: none !important; }

      /* â”€â”€ AI Loading overlay â”€â”€ */
      .cd-ai-loading {
        position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        z-index: 10000001 !important; background: rgba(6,6,14,0.92) !important;
        display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important;
        font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif !important;
      }
      .cd-ai-loading .ai-icon {
        font-size: 48px !important; margin-bottom: 24px !important;
        animation: ai-pulse 1.5s ease infinite !important;
      }
      @keyframes ai-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
      .cd-ai-loading .ai-title {
        font-size: 22px !important; font-weight: 700 !important; color: #fff !important; margin-bottom: 8px !important;
      }
      .cd-ai-loading .ai-status {
        font-size: 14px !important; color: #7a7a96 !important; margin-bottom: 28px !important; min-height: 20px !important;
        transition: opacity 0.3s !important;
      }
      .cd-ai-loading .ai-bar-wrap {
        width: 280px !important; height: 6px !important; background: #1a1a2c !important;
        border-radius: 3px !important; overflow: hidden !important; margin-bottom: 16px !important;
      }
      .cd-ai-loading .ai-bar {
        height: 100% !important; width: 0% !important; border-radius: 3px !important;
        background: linear-gradient(90deg, #6c5ce7, #a29bfe, #00cec9) !important;
        background-size: 200% !important; animation: ai-bar-shimmer 1.5s ease infinite !important;
        transition: width 0.4s ease !important;
      }
      @keyframes ai-bar-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
      .cd-ai-loading .ai-steps {
        display: flex !important; flex-direction: column !important; gap: 8px !important;
        margin-top: 12px !important; width: 280px !important;
      }
      .cd-ai-loading .ai-step {
        display: flex !important; align-items: center !important; gap: 10px !important;
        font-size: 13px !important; color: #4a4a60 !important; transition: color 0.3s !important;
      }
      .cd-ai-loading .ai-step.active { color: #a29bfe !important; }
      .cd-ai-loading .ai-step.done { color: #00cec9 !important; }
      .cd-ai-loading .ai-step-icon { width: 18px !important; text-align: center !important; font-size: 12px !important; }

      /* â”€â”€ Study modal (self-contained, rendered on body) â”€â”€ */
    `;
    overlay.appendChild(style);

    const card = document.createElement('div');
    card.id = 'canvas-dash-card';

    // â”€â”€ Header with toggle + close â”€â”€
    const headerRow = document.createElement('div');
    headerRow.className = 'cd-header-row';
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    headerRow.innerHTML = `
      <div>
        <div class="cd-masthead-meta">
          <span class="cd-pulse-dot"></span>
          <span>LIVE</span>
          <span class="cd-dot-sep">/</span>
          <span>${todayStr}</span>
        </div>
        <h1><span class="cd-brand-accent">Cash</span>board</h1>
        <div class="cd-subtitle">Your classes at a glance</div>
      </div>
      <div class="cd-header-controls">
        <div class="cd-bell-wrap">
          <button class="cd-bell-btn" title="Recently graded">&#128276;</button>
        </div>
        <button class="cd-play-btn" title="Procrastinate Mode">&#9654; Play</button>
        <button class="cd-settings-btn" title="Settings">&#9881;</button>
        <button class="cd-close" title="Close">&times;</button>
      </div>`;

    headerRow.querySelector('.cd-close').onclick = () => overlay.remove();
    headerRow.querySelector('.cd-play-btn').onclick = () => enterProcrastinate(overlay, currentUnitAssignments);
    headerRow.querySelector('.cd-settings-btn').onclick = () => showSettings(overlay, grades);
    wireBell(headerRow.querySelector('.cd-bell-wrap'), allAssignments, courseMap);

    card.appendChild(headerRow);

    // â”€â”€ Stats strip â”€â”€
    const missingAssignments = currentUnitAssignments.filter(a => getStatus(a, a.submission).cls === 'missing');
    const nowStats = new Date();
    const weekEnd = new Date(nowStats); weekEnd.setDate(weekEnd.getDate() + 7);
    const dueThisWeekAssignments = currentUnitAssignments.filter(a => {
      if (!a.due_at) return false;
      const due = new Date(a.due_at);
      const s = getStatus(a, a.submission);
      return due >= nowStats && due <= weekEnd && s.cls !== 'graded';
    });
    const upcomingTestAssignments = currentUnitAssignments.filter(a => {
      if (!isTest(a)) return false;
      const due = a.due_at ? new Date(a.due_at) : null;
      const sub = a.submission;
      return (due && due > new Date()) || !sub || (!sub.submitted_at && sub.workflow_state !== 'graded');
    });

    const statsStrip = document.createElement('div');
    statsStrip.className = 'cd-stats-strip';

    function buildStatPanel(assignments, emptyMsg) {
      const panel = document.createElement('div');
      panel.className = 'cd-stat-panel';
      if (assignments.length === 0) {
        panel.innerHTML = '<div class="cd-stat-empty">' + emptyMsg + '</div>';
      } else {
        assignments.forEach(a => {
          const info = courseMap[a.course_id];
          const row = document.createElement('div');
          row.className = 'cd-stat-row';
          row.innerHTML =
            '<span class="cd-stat-dot" style="background:' + (info ? info.color : '#666') + '"></span>' +
            '<a class="cd-stat-name" href="' + a.html_url + '" target="_blank">' + a.name + '</a>' +
            '<span class="cd-stat-due">' + (a.due_at ? relativeDate(a.due_at) : 'No date') + '</span>';
          panel.appendChild(row);
        });
      }
      return panel;
    }

    let openPanel = null;
    function togglePanel(statEl, assignments, emptyMsg) {
      // Close any open panel
      if (openPanel) { openPanel.remove(); openPanel = null; }
      // If clicking the same one, just close
      if (statEl._panelOpen) { statEl._panelOpen = false; return; }
      // Close all flags
      statsStrip.querySelectorAll('.cd-stat').forEach(s => s._panelOpen = false);
      const panel = buildStatPanel(assignments, emptyMsg);
      statEl.appendChild(panel);
      statEl._panelOpen = true;
      openPanel = panel;
    }

    // Close panels on outside click
    overlay.addEventListener('click', (e) => {
      if (!e.target.closest('.cd-stat') && openPanel) {
        openPanel.remove(); openPanel = null;
        statsStrip.querySelectorAll('.cd-stat').forEach(s => s._panelOpen = false);
      }
    });

    const stats = [
      { count: missingAssignments.length, color: missingAssignments.length > 0 ? 'red' : 'green', label: 'Missing', assignments: missingAssignments, empty: 'No missing assignments!' },
      { count: dueThisWeekAssignments.length, color: 'blue', label: 'Due This Week', assignments: dueThisWeekAssignments, empty: 'Nothing due this week' },
      { count: upcomingTestAssignments.length, color: 'orange', label: 'Tests Coming', assignments: upcomingTestAssignments, empty: 'No upcoming tests' }
    ];

    stats.forEach(s => {
      const stat = document.createElement('div');
      stat.className = 'cd-stat has-' + s.color;
      stat.innerHTML = '<div class="cd-stat-num ' + s.color + '">' + s.count + '</div><div class="cd-stat-label">' + s.label + '</div>';
      stat.onclick = (e) => { e.stopPropagation(); togglePanel(stat, s.assignments, s.empty); };
      statsStrip.appendChild(stat);
    });

    card.appendChild(statsStrip);

    // â”€â”€ What-if grade calculator â”€â”€
    const whatIfScores = {};
    const allByCourse = {};
    allAssignments.forEach(a => {
      if (!allByCourse[a.course_id]) allByCourse[a.course_id] = [];
      allByCourse[a.course_id].push(a);
    });

    function recalcGrade(courseId, useWhatIf) {
      const asgns = allByCourse[courseId] || [];
      const groups = assignmentGroups[courseId] || {};
      const totalWeight = Object.values(groups).reduce((s, g) => s + g.weight, 0);
      const useWeights = totalWeight > 0;

      // Tally earned/possible per assignment group
      const groupTotals = {};
      asgns.forEach(a => {
        const pts = a.points_possible || 0;
        if (pts === 0) return;
        const gid = a.assignment_group_id || '_default';
        if (!groupTotals[gid]) groupTotals[gid] = { earned: 0, possible: 0 };

        if (useWhatIf && whatIfScores[a.id] !== undefined && whatIfScores[a.id] !== '') {
          groupTotals[gid].earned += parseFloat(whatIfScores[a.id]) || 0;
          groupTotals[gid].possible += pts;
        } else if (a.submission && a.submission.score !== null && a.submission.workflow_state === 'graded') {
          groupTotals[gid].earned += a.submission.score;
          groupTotals[gid].possible += pts;
        } else if (a.submission && a.submission.missing) {
          groupTotals[gid].possible += pts;
        }
      });

      if (!useWeights) {
        // Simple total points (no weighted groups)
        let earned = 0, possible = 0;
        Object.values(groupTotals).forEach(g => { earned += g.earned; possible += g.possible; });
        return possible > 0 ? (earned / possible * 100) : null;
      }

      // Weighted calculation: each group's % * its weight
      let weightedSum = 0, usedWeight = 0;
      Object.entries(groupTotals).forEach(([gid, totals]) => {
        if (totals.possible > 0 && groups[gid]) {
          const groupPct = totals.earned / totals.possible;
          weightedSum += groupPct * groups[gid].weight;
          usedWeight += groups[gid].weight;
        }
      });
      return usedWeight > 0 ? (weightedSum / usedWeight * 100) : null;
    }

    function updateProjectedGrade(courseId) {
      const original = grades[courseId] ? grades[courseId].score : null;
      const hasWhatIf = allAssignments.some(a => a.course_id === courseId && whatIfScores[a.id] !== undefined && whatIfScores[a.id] !== '');
      const el = overlay.querySelector('[data-projected-course="' + courseId + '"]');
      if (!el) return;
      if (!hasWhatIf) { el.textContent = ''; return; }
      // Calculate delta using same method (total points) so it's accurate
      const base = recalcGrade(courseId, false);
      const projected = recalcGrade(courseId, true);
      if (base === null || projected === null) { el.textContent = ''; return; }
      const diff = projected - base;
      // Apply delta to Canvas's actual grade for display
      const display = original != null ? original + diff : projected;
      const sign = diff >= 0 ? '+' : '';
      el.textContent = '\u2192 ' + display.toFixed(1) + '% (' + sign + diff.toFixed(1) + '%)';
      el.className = 'cd-grade-projected' + (diff < 0 ? ' down' : '');
    }

    // â”€â”€ Grade cards (below A- only) â”€â”€
    const belowAMinus = courses.filter(c => {
      const g = grades[c.id];
      return g && isBelowAMinus(g.score);
    });

    if (belowAMinus.length > 0) {
      const title = document.createElement('div');
      title.className = 'cd-section-title red';
      title.textContent = 'Needs Attention';
      card.appendChild(title);

      const row = document.createElement('div');
      row.className = 'cd-grades';
      const gradTintFor = (s) => s == null ? '' : (s >= 90 ? 'var(--cd-grad-card-hi)' : s >= 80 ? 'var(--cd-grad-card-mid)' : 'var(--cd-grad-card-lo)');
      belowAMinus.forEach((c, i) => {
        const g = grades[c.id];
        const tint = gradTintFor(g.score);
        row.innerHTML += `
          <div class="cd-grade-card" data-grade-course="${c.id}" style="color:${courseMap[c.id].color};--cd-card-grad:${tint}">
            <div class="cd-course-name" title="${c.name}">${c.name}</div>
            <div class="cd-grade-val" style="color:${courseMap[c.id].color}">${g.grade || 'â€”'}</div>
            <div class="cd-grade-pct">${g.score != null ? g.score + '%' : 'â€”'}</div>
            <div class="cd-grade-projected" data-projected-course="${c.id}"></div>
            <div class="cd-grade-bar"><div class="cd-grade-bar-fill" style="width:${g.score || 0}%;background:${courseMap[c.id].color}"></div></div>
          </div>`;
      });
      card.appendChild(row);
    } else {
      const allGood = document.createElement('div');
      allGood.className = 'cd-all-good';
      allGood.textContent = 'All grades are A- or above!';
      card.appendChild(allGood);
    }

    // â”€â”€ A- and above grades (smaller cards) â”€â”€
    const aboveAMinus = courses.filter(c => {
      const g = grades[c.id];
      return g && g.score != null && !isBelowAMinus(g.score);
    });

    if (aboveAMinus.length > 0) {
      const titleGood = document.createElement('div');
      titleGood.className = 'cd-section-title green';
      titleGood.textContent = 'Looking Good';
      card.appendChild(titleGood);

      const rowGood = document.createElement('div');
      rowGood.className = 'cd-grades-sm';
      aboveAMinus.forEach((c, i) => {
        const g = grades[c.id];
        rowGood.innerHTML += `
          <div class="cd-grade-card-sm" data-grade-course="${c.id}" style="color:${courseMap[c.id].color};--cd-card-grad:var(--cd-grad-card-hi)">
            <div class="cd-course-name-sm" title="${c.name}">${c.name}</div>
            <div class="cd-grade-row-sm">
              <span class="cd-grade-val-sm" style="color:${courseMap[c.id].color}">${g.grade || 'â€”'}</span>
              <span class="cd-grade-pct-sm">${g.score != null ? g.score + '%' : ''}</span>
            </div>
            <div class="cd-grade-projected" data-projected-course="${c.id}"></div>
            <div class="cd-grade-bar cd-grade-bar-sm"><div class="cd-grade-bar-fill" style="width:${g.score || 0}%;background:${courseMap[c.id].color}"></div></div>
          </div>`;
      });
      card.appendChild(rowGood);
    }

    // â”€â”€ Grade card click â†’ scroll to course section â”€â”€
    function scrollToCourse(courseId) {
      const section = overlay.querySelector('[data-section-course="' + courseId + '"]');
      if (!section) return;
      const header = section.querySelector('.cd-course-header');
      const body = section.querySelector('.cd-course-body');
      // Open if closed
      if (header && !header.classList.contains('open')) {
        header.classList.add('open');
        body.classList.add('open');
      }
      // Scroll into view
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight briefly
      section.classList.add('cd-highlight');
      setTimeout(() => section.classList.remove('cd-highlight'), 1500);
    }

    // Attach to all grade cards (both big and small) after a short delay so DOM is ready
    setTimeout(() => {
      overlay.querySelectorAll('.cd-grade-card, .cd-grade-card-sm').forEach(el => {
        el.addEventListener('click', () => {
          const cid = el.getAttribute('data-grade-course');
          if (cid) scrollToCourse(parseInt(cid) || cid);
        });
      });
    }, 0);

    // â”€â”€ Current unit assignments by course â”€â”€
    const title2 = document.createElement('div');
    title2.className = 'cd-section-title blue';
    title2.textContent = 'Current Unit Assignments';
    card.appendChild(title2);

    const byCourse = {};
    currentUnitAssignments.forEach(a => {
      if (!byCourse[a.course_id]) byCourse[a.course_id] = [];
      byCourse[a.course_id].push(a);
    });

    const courseIds = courses.map(c => c.id).filter(id => byCourse[id]);

    courseIds.sort((a, b) => {
      const scoreA = grades[a] && grades[a].score != null ? grades[a].score : 999;
      const scoreB = grades[b] && grades[b].score != null ? grades[b].score : 999;
      return scoreA - scoreB;
    });

    if (courseIds.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cd-empty';
      empty.textContent = 'No current unit assignments found.';
      card.appendChild(empty);
    }

    courseIds.forEach((courseId, idx) => {
      const assignments = byCourse[courseId];
      const info = courseMap[courseId];
      const modInfo = moduleAssignmentIds[courseId];
      const unitName = modInfo ? modInfo.moduleName : 'Recent';

      assignments.sort((a, b) => {
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(b.due_at) - new Date(a.due_at);
      });

      const section = document.createElement('div');
      section.className = 'cd-course-section';
      section.setAttribute('data-section-course', courseId);
      section.style.setProperty('--cd-course-color', info.color);

      const header = document.createElement('div');
      header.className = 'cd-course-header';
      header.innerHTML = `
        <div class="cd-header-left">
          <span style="color:${info.color}">${info.name}</span>
          <span class="cd-unit-label">${unitName} &middot; ${assignments.length} items</span>
        </div>
        <div style="display:flex !important;align-items:center !important;gap:8px !important;position:relative !important;">
          <button class="cd-study-btn" data-study-course="${courseId}">Study</button>
          <div class="cd-color-btn" data-course-id="${courseId}" title="Change color"></div>
          <span class="cd-arrow">â–¼</span>
        </div>`;

      const body = document.createElement('div');
      body.className = 'cd-course-body';

      assignments.forEach(a => {
        const status = getStatus(a, a.submission);
        const row = document.createElement('div');
        row.className = 'cd-assignment-row';
        const canWhatIf = status.cls !== 'graded' && a.points_possible > 0;

        row.innerHTML = `
          <a class="cd-assignment-name" href="${a.html_url}" target="_blank">${a.name}</a>
          <span class="cd-due">${a.due_at ? formatDate(a.due_at) : 'No date'}</span>
          <span class="cd-status-badge ${status.cls}${canWhatIf ? ' clickable' : ''}">${status.label}</span>
        `;

        if (window.__aiAccess) {
          const aiBtn = document.createElement('button');
          aiBtn.className = 'cd-ai-btn';
          aiBtn.textContent = 'AI';
          aiBtn.title = 'Copy an AI prompt for this assignment';
          aiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyAssignmentPrompt(a, info.name, aiBtn);
          });
          row.appendChild(aiBtn);
        }


        if (canWhatIf) {
          const badge = row.querySelector('.cd-status-badge');
          badge.title = 'Click to try a what-if score';
          badge.addEventListener('click', () => {
            const wrap = document.createElement('div');
            wrap.className = 'cd-whatif-wrap';
            wrap.innerHTML = '<input class="cd-whatif-input" type="number" placeholder="?" min="0" step="any"><span class="cd-whatif-total">/ ' + a.points_possible + '</span>';
            badge.replaceWith(wrap);
            const input = wrap.querySelector('input');
            input.focus();
            input.addEventListener('input', () => {
              if (input.value === '') { delete whatIfScores[a.id]; } else { whatIfScores[a.id] = input.value; }
              updateProjectedGrade(a.course_id);
            });
            input.addEventListener('keydown', (ev) => {
              if (ev.key === 'Escape') { delete whatIfScores[a.id]; wrap.replaceWith(badge); updateProjectedGrade(a.course_id); }
            });
            input.addEventListener('blur', () => {
              if (!input.value) { delete whatIfScores[a.id]; wrap.replaceWith(badge); updateProjectedGrade(a.course_id); }
            });
          });
        }

        body.appendChild(row);
      });

      // Study button
      const studyBtn = header.querySelector('.cd-study-btn');
      const crsNameLower = (info.name || '').toLowerCase();
      const isMathCourse = /geometry|algebra|trig|calculus|\bmath\b|precalc|pre-calc|statistics|ap calc|apcalc/.test(crsNameLower);
      studyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (isMathCourse) {
          showToast('Study mode isn\u2019t supported for math \u2014 worksheets are usually images or handwritten PDFs we can\u2019t read.');
          return;
        }
        if (window.__cashboardUser && !(await checkScrapeLimit(window.__cashboardUser))) return;
        const items = moduleItems[courseId] || [];
        showStudyModal(overlay, courseId, info.name, unitName, items, assignments);
      });

      // Color picker
      const colorBtn = header.querySelector('.cd-color-btn');
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.querySelectorAll('.cd-color-picker').forEach(p => p.remove());
        const picker = document.createElement('div');
        picker.className = 'cd-color-picker';
        PALETTE.forEach(color => {
          const swatch = document.createElement('div');
          swatch.className = 'cd-color-swatch' + (color === info.color ? ' active' : '');
          swatch.style.cssText = 'background:' + color;
          swatch.addEventListener('click', (ev) => {
            ev.stopPropagation();
            info.color = color;
            saveColorPref(courseId, color);
            section.style.borderColor = color;
            header.querySelector('.cd-header-left span').style.color = color;
            overlay.querySelectorAll('[data-grade-course="' + courseId + '"]').forEach(el => {
              el.style.borderColor = color;
              el.querySelector('.cd-grade-val, .cd-grade-val-sm').style.color = color;
            });
            overlay.querySelectorAll('[data-dot-course="' + courseId + '"]').forEach(el => {
              el.style.background = color;
            });
            picker.remove();
          });
          picker.appendChild(swatch);
        });
        colorBtn.parentElement.appendChild(picker);
        const closePicker = (ev) => {
          if (!picker.contains(ev.target) && ev.target !== colorBtn) {
            picker.remove();
            document.removeEventListener('click', closePicker);
          }
        };
        setTimeout(() => document.addEventListener('click', closePicker), 0);
      });

      header.addEventListener('click', (e) => {
        if (e.target.closest('.cd-color-btn') || e.target.closest('.cd-color-picker') || e.target.closest('.cd-study-btn')) return;
        header.classList.toggle('open');
        body.classList.toggle('open');
      });

      section.appendChild(header);
      section.appendChild(body);
      card.appendChild(section);
    });

    overlay.appendChild(card);

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
    });

    document.body.appendChild(overlay);

    // Presence heartbeat â€” tells the tracker this user is live on the dashboard
    (() => {
      const name = window.__canvasName || 'unknown';
      const school = window.location.hostname;
      const url = 'https://cashboard.fly.dev/api/ping?name=' + encodeURIComponent(name) + '&school=' + encodeURIComponent(school);
      const ping = () => { fetch(url).catch(() => {}); };
      ping();
      const iv = setInterval(() => {
        if (!document.getElementById('canvas-dash-overlay')) { clearInterval(iv); return; }
        ping();
      }, 30000);
    })();

    if (window.__prankMode) runMaxPrank(overlay);

    // Tutorial removed â€” settings panel replaces onboarding
  }

  function runMaxPrank(overlay) {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cd-prank-shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }
      @keyframes cd-prank-upside {
        0% { transform: rotate(0deg); }
        20%, 80% { transform: rotate(180deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes cd-prank-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes cd-prank-tilt {
        0%, 100% { transform: rotate(0deg); }
        20%, 80% { transform: rotate(3deg); }
      }
      @keyframes cd-prank-rainbow {
        0%, 100% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(360deg); }
      }
      @keyframes cd-prank-blur {
        0%, 100% { filter: blur(0px); }
        50% { filter: blur(10px); }
      }
      @keyframes cd-prank-dizzy {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-3deg) scale(0.98); }
        50% { transform: rotate(0deg) scale(1.03); }
        75% { transform: rotate(3deg) scale(0.98); }
      }
      @keyframes cd-prank-invert {
        0%, 100% { filter: invert(0); }
        30%, 70% { filter: invert(1); }
      }
      @keyframes cd-prank-zoom {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }
      #canvas-dash-overlay.cd-prank-shake { animation: cd-prank-shake 0.55s ease-in-out 3 !important; }
      #canvas-dash-overlay.cd-prank-upside { animation: cd-prank-upside 2.8s ease-in-out 1 !important; }
      #canvas-dash-overlay.cd-prank-spin { animation: cd-prank-spin 1.6s ease-in-out 1 !important; }
      #canvas-dash-overlay.cd-prank-tilt { animation: cd-prank-tilt 2.4s ease-in-out 1 !important; }
      #canvas-dash-overlay.cd-prank-rainbow { animation: cd-prank-rainbow 2.5s linear 1 !important; }
      #canvas-dash-overlay.cd-prank-blur { animation: cd-prank-blur 1.4s ease-in-out 2 !important; }
      #canvas-dash-overlay.cd-prank-dizzy { animation: cd-prank-dizzy 1.7s ease-in-out 2 !important; }
      #canvas-dash-overlay.cd-prank-invert { animation: cd-prank-invert 2s ease-in-out 1 !important; }
      #canvas-dash-overlay.cd-prank-zoom { animation: cd-prank-zoom 1.3s ease-in-out 2 !important; }

      .cd-prank-flash-layer {
        position: fixed !important; inset: 0 !important; z-index: 99999999 !important;
        pointer-events: none !important; background: #000 !important;
        animation: cd-prank-flash 1.2s ease-in-out 1 !important;
      }
      @keyframes cd-prank-flash {
        0%, 100% { background: #000; opacity: 0; }
        10%, 30%, 50%, 70% { background: #fff; opacity: 1; }
        20%, 40%, 60%, 80% { background: #000; opacity: 1; }
      }

      .cd-prank-emoji {
        position: fixed !important; top: -60px !important; z-index: 99999999 !important;
        pointer-events: none !important; font-size: 32px !important;
        animation: cd-prank-fall linear 1 !important;
      }
      @keyframes cd-prank-fall {
        from { transform: translateY(0) rotate(0deg); }
        to { transform: translateY(120vh) rotate(540deg); }
      }
    `;
    document.head.appendChild(style);

    const pranks = [
      { name: 'flash', run: () => {
        const f = document.createElement('div');
        f.className = 'cd-prank-flash-layer';
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 1400);
      }},
      { name: 'shake', run: () => { overlay.classList.add('cd-prank-shake'); setTimeout(() => overlay.classList.remove('cd-prank-shake'), 1800); }},
      { name: 'upside', run: () => { overlay.classList.add('cd-prank-upside'); setTimeout(() => overlay.classList.remove('cd-prank-upside'), 2900); }},
      { name: 'spin', run: () => { overlay.classList.add('cd-prank-spin'); setTimeout(() => overlay.classList.remove('cd-prank-spin'), 1700); }},
      { name: 'tilt', run: () => { overlay.classList.add('cd-prank-tilt'); setTimeout(() => overlay.classList.remove('cd-prank-tilt'), 2500); }},
      { name: 'rainbow', run: () => { overlay.classList.add('cd-prank-rainbow'); setTimeout(() => overlay.classList.remove('cd-prank-rainbow'), 2600); }},
      { name: 'blur', run: () => { overlay.classList.add('cd-prank-blur'); setTimeout(() => overlay.classList.remove('cd-prank-blur'), 2900); }},
      { name: 'dizzy', run: () => { overlay.classList.add('cd-prank-dizzy'); setTimeout(() => overlay.classList.remove('cd-prank-dizzy'), 3500); }},
      { name: 'invert', run: () => { overlay.classList.add('cd-prank-invert'); setTimeout(() => overlay.classList.remove('cd-prank-invert'), 2100); }},
      { name: 'zoom', run: () => { overlay.classList.add('cd-prank-zoom'); setTimeout(() => overlay.classList.remove('cd-prank-zoom'), 2700); }},
      { name: 'emoji', run: () => {
        const picks = ['ðŸŽ‰','ðŸ”¥','ðŸ’€','ðŸ‘€','ðŸ¤¡','ðŸŽˆ','âš¡','ðŸŒˆ','ðŸ¦„','ðŸ’©','ðŸ•º','ðŸŽƒ'];
        const emoji = picks[Math.floor(Math.random() * picks.length)];
        for (let i = 0; i < 40; i++) {
          const e = document.createElement('div');
          e.className = 'cd-prank-emoji';
          e.textContent = emoji;
          e.style.setProperty('left', Math.random() * 100 + 'vw', 'important');
          e.style.setProperty('font-size', (24 + Math.random() * 32) + 'px', 'important');
          e.style.setProperty('animation-duration', (2 + Math.random() * 2) + 's', 'important');
          e.style.setProperty('animation-delay', (Math.random() * 1.5) + 's', 'important');
          document.body.appendChild(e);
          setTimeout(() => e.remove(), 5000);
        }
      }}
    ];

    let last = '';
    try { last = localStorage.getItem('cd_max_prank_last') || ''; } catch(e) {}
    const picks = pranks.filter(p => p.name !== last);
    const pick = picks[Math.floor(Math.random() * picks.length)];
    try { localStorage.setItem('cd_max_prank_last', pick.name); } catch(e) {}
    pick.run();
  }

  // â”€â”€ Study content scraper â”€â”€

  function showToast(message) {
    const existing = document.getElementById('cd-toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'cd-toast';
    t.textContent = message;
    t.style.cssText = [
      'position:fixed','top:24px','left:50%','transform:translateX(-50%) translateY(-10px)',
      'z-index:10000001',
      "font-family:'Geist',-apple-system,sans-serif",
      'font-size:13px','font-weight:500','letter-spacing:-0.1px','line-height:1.5',
      'color:#FAFAFA','background:#141418','border:1px solid #27272A',
      'padding:12px 18px','border-radius:12px','max-width:420px','text-align:center',
      'box-shadow:0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
      'opacity:0','transition:opacity 0.2s ease, transform 0.2s ease'
    ].join(' !important;') + ' !important;';
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.setProperty('opacity', '1', 'important');
      t.style.setProperty('transform', 'translateX(-50%) translateY(0)', 'important');
    });
    setTimeout(() => {
      t.style.setProperty('opacity', '0', 'important');
      t.style.setProperty('transform', 'translateX(-50%) translateY(-10px)', 'important');
      setTimeout(() => t.remove(), 250);
    }, 3800);
  }

  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  async function scrapeStudyContent(courseId, items, fallbackAssignments) {
    const content = [];
    const hasModuleItems = items && items.length > 0;
    const visitedPages = new Set();
    const visitedFiles = new Set();
    const visitedGDocs = new Set();

    async function scrapeLinkedResources(descHtml, courseIdArg) {
      let out = '';
      if (!descHtml) return out;
      const cid = courseIdArg || courseId;

      // Linked Canvas pages
      const pageLinks = [...new Set((descHtml.match(/\/courses\/\d+\/pages\/[^"'\s<)]+/g) || []))];
      for (const link of pageLinks) {
        const pageUrl = link.replace(/.*\/pages\//, '').split('?')[0].split('#')[0];
        if (visitedPages.has(pageUrl)) continue;
        visitedPages.add(pageUrl);
        try {
          const pg = await apiFetch('/api/v1/courses/' + cid + '/pages/' + pageUrl);
          const t = stripHtml(pg.body || '');
          if (t.length > 20) out += '\n\n## LINKED PAGE: ' + (pg.title || pageUrl) + '\n\n' + t;
          // Recurse one level into that page's links
          const inner = await scrapeLinkedResources(pg.body || '', cid);
          if (inner) out += inner;
        } catch(e) {}
      }

      // Linked Canvas files (by file ID)
      const fileIds = [...new Set((descHtml.match(/\/files\/(\d+)/g) || []).map(m => m.match(/(\d+)/)[0]))];
      for (const fid of fileIds) {
        if (visitedFiles.has(fid)) continue;
        visitedFiles.add(fid);
        try {
          const fm = await apiFetch('/api/v1/courses/' + cid + '/files/' + fid);
          if (fm.url && fm.filename) {
            const ft = await extractFileText(fm.url, fm.filename, cid, fid);
            if (ft.length > 20) out += '\n\n## LINKED FILE: ' + (fm.display_name || fm.filename) + '\n\n' + ft;
          }
        } catch(e) {}
      }

      // Linked discussion topics
      const discIds = [...new Set((descHtml.match(/\/discussion_topics\/(\d+)/g) || []).map(m => m.match(/(\d+)/)[0]))];
      for (const did of discIds) {
        try {
          const disc = await apiFetch('/api/v1/courses/' + cid + '/discussion_topics/' + did);
          const dt = stripHtml(disc.message || '');
          if (dt.length > 20) out += '\n\n## LINKED DISCUSSION: ' + (disc.title || '') + '\n\n' + dt;
        } catch(e) {}
      }

      // Linked quizzes
      const quizIds = [...new Set((descHtml.match(/\/quizzes\/(\d+)/g) || []).map(m => m.match(/(\d+)/)[0]))];
      for (const qid of quizIds) {
        try {
          const quiz = await apiFetch('/api/v1/courses/' + cid + '/quizzes/' + qid);
          const qt = stripHtml(quiz.description || '');
          if (qt.length > 20) out += '\n\n## LINKED QUIZ: ' + (quiz.title || '') + '\n\n' + qt;
        } catch(e) {}
      }

      // Google Docs
      const gdocLinks = [...new Set((descHtml.match(/https:\/\/docs\.google\.com\/document\/d\/[^"'\s<)]+/g) || []))];
      for (const glink of gdocLinks) {
        if (visitedGDocs.has(glink)) continue;
        visitedGDocs.add(glink);
        try {
          const exportUrl = glink.split('/edit')[0].split('/preview')[0] + '/export?format=txt';
          const resp = await fetch(exportUrl);
          if (resp.ok) {
            const gt = await resp.text();
            if (gt.length > 20 && !looksLikeBinary(gt)) out += '\n\n## GOOGLE DOC\n\n' + gt;
          }
        } catch(e) {}
      }

      // Google Sheets
      const gsheetLinks = [...new Set((descHtml.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[^"'\s<)]+/g) || []))];
      for (const glink of gsheetLinks) {
        if (visitedGDocs.has(glink)) continue;
        visitedGDocs.add(glink);
        try {
          const exportUrl = glink.split('/edit')[0].split('/preview')[0] + '/export?format=csv';
          const resp = await fetch(exportUrl);
          if (resp.ok) {
            const gt = await resp.text();
            if (gt.length > 20 && !looksLikeBinary(gt)) out += '\n\n## GOOGLE SHEET\n\n' + gt;
          }
        } catch(e) {}
      }

      // YouTube (URLs only â€” no transcripts)
      const ytLinks = [...new Set((descHtml.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"'\s<&)]+)/g) || []))];
      if (ytLinks.length > 0) {
        out += '\n\n## REFERENCED VIDEOS\n';
        ytLinks.forEach(yt => { out += '\n- https://' + yt; });
      }

      return out;
    }

    if (hasModuleItems) {
      // â”€â”€ Module-based scraping â”€â”€
      const pages = items.filter(i => i.type === 'Page');
      for (const p of pages) {
        try {
          const page = await apiFetch('/api/v1/courses/' + courseId + '/pages/' + p.page_url);
          let text = stripHtml(page.body || '');
          // Follow links inside the page
          const nested = await scrapeLinkedResources(page.body || '', courseId);
          if (nested) text += nested;
          if (text.trim().length > 20) content.push({ title: page.title, text: text.trim().substring(0, 6000), type: 'page' });
          visitedPages.add(p.page_url);
        } catch (e) {}
      }

      // Assignments â€” fetch description AND all attached/linked resources
      const asgns = items.filter(i => i.type === 'Assignment' || i.type === 'Quiz');
      for (const a of asgns) {
        try {
          const asgn = await apiFetch('/api/v1/courses/' + courseId + '/assignments/' + a.content_id);
          let text = stripHtml(asgn.description || '');

          // Fetch attached files on the assignment
          if (asgn.attachments && asgn.attachments.length > 0) {
            for (const att of asgn.attachments) {
              try {
                const ft = await extractFileText(att.url, att.filename, courseId, att.id);
                if (ft.length > 20) text += '\n\n## ATTACHMENT: ' + (att.display_name || att.filename) + '\n\n' + ft;
              } catch(e) {}
            }
          }

          // Follow all linked resources in the description
          const nested = await scrapeLinkedResources(asgn.description || '', courseId);
          if (nested) text += nested;

          if (text.trim().length > 20) {
            content.push({ title: asgn.name, text: text.trim().substring(0, 6000), type: 'assignment' });
          }
        } catch (e) {}
      }

      // Files directly in the module
      const files = items.filter(i => i.type === 'File');
      for (const f of files) {
        if (visitedFiles.has(String(f.content_id))) continue;
        try {
          const fileMeta = await apiFetch('/api/v1/courses/' + courseId + '/files/' + f.content_id);
          if (fileMeta.url && fileMeta.filename) {
            const text = await extractFileText(fileMeta.url, fileMeta.filename, courseId, f.content_id);
            if (text.trim().length > 20) {
              content.push({ title: fileMeta.display_name || fileMeta.filename, text: text.trim().substring(0, 6000), type: 'file' });
            }
            visitedFiles.add(String(f.content_id));
          }
        } catch (e) {}
      }

      // External URL items in the module
      const urlItems = items.filter(i => i.type === 'ExternalUrl' && i.external_url);
      if (urlItems.length > 0) {
        let linkText = '';
        urlItems.forEach(u => { linkText += '- ' + (u.title || u.external_url) + ': ' + u.external_url + '\n'; });
        content.push({ title: 'External Links', text: linkText.trim(), type: 'links' });
      }
    } else {
      // â”€â”€ Fallback: no module items â€” fetch recent pages + assignment descriptions â”€â”€

      // Fetch recent pages from the course
      try {
        const recentPages = await apiFetch('/api/v1/courses/' + courseId + '/pages?sort=updated_at&order=desc&per_page=15');
        const pageResults = await Promise.all(recentPages.map(async p => {
          try {
            const page = await apiFetch('/api/v1/courses/' + courseId + '/pages/' + p.url);
            const text = stripHtml(page.body || '');
            if (text.trim().length > 20) return { title: page.title, text: text.trim(), type: 'page' };
          } catch (e) { /* skip */ }
          return null;
        }));
        pageResults.filter(Boolean).forEach(r => content.push(r));
      } catch (e) { /* no pages access */ }

      // Fetch descriptions for displayed assignments
      if (fallbackAssignments && fallbackAssignments.length > 0) {
        const asgnResults = await Promise.all(fallbackAssignments.map(async a => {
          try {
            const text = stripHtml(a.description || '');
            if (text.trim().length > 20) return { title: a.name, text: text.trim(), type: 'assignment' };
            // Try fetching full assignment if description was empty
            const full = await apiFetch('/api/v1/courses/' + courseId + '/assignments/' + a.id);
            const fullText = stripHtml(full.description || '');
            if (fullText.trim().length > 20) return { title: full.name, text: fullText.trim(), type: 'assignment' };
          } catch (e) { /* skip */ }
          return null;
        }));
        asgnResults.filter(Boolean).forEach(r => content.push(r));
      }

      // Try fetching recent files (PDFs)
      try {
        const recentFiles = await apiFetch('/api/v1/courses/' + courseId + '/files?sort=updated_at&order=desc&per_page=10&content_types[]=application/pdf');
        if (recentFiles.length > 0) {
          await loadPdfJs();
          const fileResults = await Promise.all(recentFiles.slice(0, 5).map(async f => {
            try {
              if (!f.url) return null;
              const text = await extractPdfText(f.url);
              if (text.trim().length > 20) return { title: f.display_name || f.filename, text: text.trim(), type: 'pdf' };
            } catch (e) { /* skip */ }
            return null;
          }));
          fileResults.filter(Boolean).forEach(r => content.push(r));
        }
      } catch (e) { /* no file access */ }
    }

    return content;
  }

  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function getFileUrl(courseId, fileId) {
    // Canvas files need to be fetched via API to get the authenticated download URL
    try {
      const fm = await apiFetch('/api/v1/courses/' + courseId + '/files/' + fileId);
      return { url: fm.url, filename: fm.filename, display_name: fm.display_name };
    } catch(e) {
      return null;
    }
  }

  async function downloadFileAsArrayBuffer(url) {
    // Try with credentials first (same-origin Canvas), then without
    let resp = await fetch(url, { credentials: 'same-origin' });
    if (!resp.ok) resp = await fetch(url);
    if (!resp.ok) throw new Error('Download failed: ' + resp.status);
    return await resp.arrayBuffer();
  }

  async function loadJSZip() {
    if (window.JSZip) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }

  function extractWtText(xml) {
    const out = [];
    let para = '';
    const tokens = xml.split('<');
    for (const token of tokens) {
      if (token.startsWith('w:t') || token.startsWith('w:t ') || token.startsWith('a:t>') || token.startsWith('a:t ')) {
        const closeIdx = token.indexOf('>');
        if (closeIdx >= 0) para += token.substring(closeIdx + 1);
      }
      if (token.startsWith('/w:p>') || token.startsWith('/w:p ') || token.startsWith('/a:p>') || token.startsWith('/a:p ')) {
        if (para.trim()) out.push(para.trim());
        para = '';
      }
    }
    if (para.trim()) out.push(para.trim());
    return out.join('\n');
  }

  async function extractDocxText(url) {
    const buf = await downloadFileAsArrayBuffer(url);
    await loadJSZip();
    const jszip = await window.JSZip.loadAsync(buf);
    const docFile = jszip.file('word/document.xml');
    if (!docFile) return '';
    const xml = await docFile.async('string');
    return extractWtText(xml);
  }

  async function extractPptxText(url) {
    const buf = await downloadFileAsArrayBuffer(url);
    await loadJSZip();
    const jszip = await window.JSZip.loadAsync(buf);
    const slideFiles = Object.keys(jszip.files)
      .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)[1], 10);
        const nb = parseInt(b.match(/slide(\d+)/)[1], 10);
        return na - nb;
      });
    const parts = [];
    for (let i = 0; i < slideFiles.length; i++) {
      const xml = await jszip.file(slideFiles[i]).async('string');
      const t = extractWtText(xml);
      if (t) parts.push('Slide ' + (i + 1) + ':\n' + t);
    }
    return parts.join('\n\n');
  }

  function looksLikeBinary(text) {
    if (!text || text.length < 8) return false;
    if (text.startsWith('PK\x03\x04') || text.startsWith('PK\x05\x06') || text.startsWith('PK\x07\x08')) return true;
    if (text.startsWith('%PDF')) return true;
    // Count non-printable / replacement chars in first 500 chars
    const sample = text.substring(0, 500);
    let bad = 0;
    for (let i = 0; i < sample.length; i++) {
      const c = sample.charCodeAt(i);
      if (c === 0xFFFD || c === 0 || (c < 0x20 && c !== 9 && c !== 10 && c !== 13)) bad++;
    }
    return bad / sample.length > 0.05;
  }

  async function extractFileText(url, filename, courseId, fileId) {
    const lower = (filename || '').toLowerCase();

    // PDF
    if (lower.endsWith('.pdf')) {
      try { await loadPdfJs(); return await extractPdfText(url); } catch(e) { return ''; }
    }

    // DOCX â€” direct zip extraction (skip preview â€” Canvas often returns raw binary)
    if (lower.endsWith('.docx')) {
      try { const t = await extractDocxText(url); if (t.length > 20) return t; } catch(e) {}
    }

    // PPTX â€” direct zip extraction
    if (lower.endsWith('.pptx')) {
      try { const t = await extractPptxText(url); if (t.length > 20) return t; } catch(e) {}
    }

    // Legacy doc/ppt/xls/xlsx â€” try Canvas preview (HTML), verify it's actually HTML
    if (courseId && fileId && (lower.endsWith('.doc') || lower.endsWith('.ppt') || lower.endsWith('.xlsx') || lower.endsWith('.xls'))) {
      try {
        const preview = await apiFetch('/api/v1/files/' + fileId + '/public_url');
        if (preview && preview.public_url) {
          const resp = await fetch(preview.public_url);
          if (resp.ok) {
            const ct = (resp.headers.get('content-type') || '').toLowerCase();
            const raw = await resp.text();
            if (ct.includes('html') || /<html|<body|<div/i.test(raw.substring(0, 200))) {
              if (!looksLikeBinary(raw)) {
                const text = stripHtml(raw);
                if (text.length > 30) return text;
              }
            }
          }
        }
      } catch(e) {}
    }

    // Plain-text types
    if (lower.endsWith('.txt') || lower.endsWith('.csv') || lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.rtf') || lower.endsWith('.md')) {
      try {
        const resp = await fetch(url, { credentials: 'same-origin' });
        const text = await resp.text();
        if (looksLikeBinary(text)) return '';
        return stripHtml(text);
      } catch(e) { return ''; }
    }

    // Unknown â€” try but verify it's actually text
    try {
      const resp = await fetch(url, { credentials: 'same-origin' });
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      if (ct && !ct.includes('text') && !ct.includes('html') && !ct.includes('xml') && !ct.includes('json')) return '';
      const text = await resp.text();
      if (looksLikeBinary(text)) return '';
      if (text.length > 50 && text.length < 500000) return stripHtml(text);
    } catch(e) {}
    return '';
  }

  async function extractPdfText(url) {
    const pdf = await window.pdfjsLib.getDocument(url).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      text += tc.items.map(item => item.str).join(' ') + '\n';
    }
    // Clean up bad Unicode â€” remove replacement chars, control chars, weird symbols
    text = text.replace(/[\uFFFD\uFFFE\uFFFF]/g, '');
    text = text.replace(/[^\x20-\x7E\n\r\t\u00A0-\u024F\u2000-\u206F\u2018-\u201F\u2026\u2013\u2014]/g, ' ');
    text = text.replace(/ {2,}/g, ' ');
    return text;
  }

  // â”€â”€ Bell / graded notifications â”€â”€
  function wireBell(wrap, allAssignments, courseMap) {
    const LAST_SEEN_KEY = 'cashboard_last_seen_graded';
    const btn = wrap.querySelector('.cd-bell-btn');

    const graded = allAssignments
      .filter(a => a.submission && a.submission.workflow_state === 'graded' && a.submission.score !== null && a.submission.graded_at)
      .sort((a, b) => new Date(b.submission.graded_at) - new Date(a.submission.graded_at))
      .slice(0, 15);

    const lastSeen = parseInt(localStorage.getItem(LAST_SEEN_KEY) || '0', 10);
    const newOnes = graded.filter(a => new Date(a.submission.graded_at).getTime() > lastSeen);

    if (newOnes.length > 0) {
      const badge = document.createElement('span');
      badge.className = 'cd-bell-badge';
      badge.textContent = newOnes.length > 9 ? '9+' : String(newOnes.length);
      btn.appendChild(badge);
    }

    btn.onclick = (e) => {
      e.stopPropagation();
      const existing = wrap.querySelector('.cd-notif-panel');
      if (existing) { existing.remove(); return; }

      const panel = document.createElement('div');
      panel.className = 'cd-notif-panel';
      const newCountLabel = newOnes.length > 0 ? newOnes.length + ' new' : 'All caught up';
      let html = '<div class="cd-notif-panel-title">Recently Graded <span>' + newCountLabel + '</span></div><div class="cd-notif-list">';
      if (graded.length === 0) {
        html += '<div class="cd-notif-empty">No graded assignments yet.</div>';
      } else {
        graded.forEach(a => {
          const isNew = new Date(a.submission.graded_at).getTime() > lastSeen;
          const score = a.submission.score;
          const total = a.points_possible || 0;
          const pct = total > 0 ? (score / total) * 100 : 100;
          const scoreClass = pct < 80 ? 'low' : '';
          const cName = courseMap[a.course_id] ? courseMap[a.course_id].name : '';
          html += '<a class="cd-notif-row' + (isNew ? ' new' : '') + '" href="' + a.html_url + '" target="_blank">'
            + '<div class="cd-notif-body">'
            + '<div class="cd-notif-name">' + a.name + '</div>'
            + '<div class="cd-notif-course">' + cName + '</div>'
            + '</div>'
            + '<div class="cd-notif-score ' + scoreClass + '">' + score + '/' + (total || '?') + '</div>'
            + '</a>';
        });
      }
      html += '</div>';
      panel.innerHTML = html;
      wrap.appendChild(panel);

      localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      const existingBadge = btn.querySelector('.cd-bell-badge');
      if (existingBadge) existingBadge.remove();

      const closeHandler = (ev) => {
        if (!panel.contains(ev.target) && ev.target !== btn) {
          panel.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 0);
    };
  }

  async function copyAssignmentPrompt(a, courseName, btn) {
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '...';
    try {
      let details = {};
      try {
        details = await apiFetch('/api/v1/courses/' + a.course_id + '/assignments/' + a.id);
      } catch(e) {}
      const descHtml = details.description || '';
      const descText = stripHtml(descHtml);

      // One-level scrape of linked Canvas pages/files for more context
      let linked = '';
      const pageLinks = [...new Set((descHtml.match(/\/courses\/\d+\/pages\/[^"'\s<)]+/g) || []))];
      for (const link of pageLinks.slice(0, 5)) {
        const slug = link.replace(/.*\/pages\//, '').split('?')[0].split('#')[0];
        try {
          const pg = await apiFetch('/api/v1/courses/' + a.course_id + '/pages/' + slug);
          const t = stripHtml(pg.body || '');
          if (t.length > 20) linked += '\n\n## LINKED PAGE: ' + (pg.title || slug) + '\n\n' + t;
        } catch(e) {}
      }

      const due = a.due_at ? new Date(a.due_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No due date';
      const points = a.points_possible ? a.points_possible + ' pts' : '';
      let prompt = 'Help me complete this assignment for my class "' + courseName + '".\n\n';
      prompt += 'Give me a clear, step-by-step solution I can understand and submit. Show work where relevant.\n\n';
      prompt += '## ASSIGNMENT: ' + a.name + '\n';
      if (points) prompt += 'Points: ' + points + '\n';
      prompt += 'Due: ' + due + '\n\n';
      if (descText) prompt += '## INSTRUCTIONS\n\n' + descText + '\n';
      if (linked) prompt += linked + '\n';
      prompt = prompt.slice(0, 20000);

      await navigator.clipboard.writeText(prompt);
      btn.textContent = 'COPIED';
      showToast('Prompt for "' + a.name + '" copied. Paste into ChatGPT or Claude.');
      setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1800);
    } catch (e) {
      btn.textContent = 'ERR';
      showToast('Couldn\u2019t build prompt: ' + (e && e.message ? e.message : 'unknown error'));
      setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1800);
    }
  }

  function buildStudyPrompt(courseName, unitName, content, mode) {
    const intro = mode === 'guide'
      ? 'I am studying for "' + courseName + '", unit: "' + unitName + '". Create a clear, well-organized study guide based on the content below. Include: key concepts, definitions, important dates/people/formulas, summaries of each topic, and a "things to remember" section. Use headings and bullet points.\n\n'
      : 'I am studying for "' + courseName + '", unit: "' + unitName + '". Generate a 15-20 question practice quiz (multiple choice, short answer, true/false) with answer key based on this content:\n\n';
    let prompt = intro;
    let totalLen = prompt.length;
    content.forEach(c => {
      const section = '## ' + c.title + '\n' + c.text + '\n\n';
      if (totalLen + section.length < 20000) {
        prompt += section;
        totalLen += section.length;
      }
    });
    return prompt;
  }

  function showStudyModal(overlay, courseId, courseName, unitName, items, fallbackAssignments) {
    const isDark = overlay.classList.contains('cd-dark');
    const modal = document.createElement('div');
    modal.id = 'cd-study-modal';

    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
      #cd-study-modal, #cd-study-modal * {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        -webkit-font-smoothing: antialiased !important; box-sizing: border-box !important;
      }
      #cd-study-modal {
        position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        z-index: 10000000 !important; display: flex !important; justify-content: center !important;
        align-items: center !important; background: rgba(0,0,0,0.7) !important; padding: 20px !important;
      }
      #cd-study-modal .cd-study-card {
        background: ${isDark ? '#16161e' : '#ffffff'} !important; border-radius: 16px !important; padding: 28px !important;
        max-width: 500px !important; width: 100% !important; max-height: 80vh !important;
        overflow-y: auto !important; box-shadow: 0 24px 48px rgba(0,0,0,0.4) !important;
        border: 1px solid ${isDark ? '#2a2a3a' : '#e5e7eb'} !important;
        animation: cdsm-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) both !important;
      }
      @keyframes cdsm-slide { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      #cd-study-modal h2 {
        margin: 0 0 4px 0 !important; font-size: 20px !important; font-weight: 700 !important;
        color: ${isDark ? '#e4e4e8' : '#111'} !important;
      }
      #cd-study-modal .cd-study-sub {
        font-size: 13px !important; color: ${isDark ? '#6b6b7b' : '#888'} !important; margin-bottom: 16px !important;
      }
      #cd-study-modal .cd-study-progress {
        padding: 14px !important; background: ${isDark ? '#1e1e2a' : '#f9fafb'} !important; border-radius: 10px !important;
        margin-bottom: 16px !important; font-size: 13px !important; color: ${isDark ? '#9898a6' : '#555'} !important;
        line-height: 1.8 !important; max-height: 50vh !important; overflow-y: auto !important;
      }
      #cd-study-modal .cd-check { color: #10B981 !important; margin-right: 4px !important; }
      #cd-study-modal .cd-spin-sm {
        display: inline-block !important; width: 12px !important; height: 12px !important;
        border: 2px solid ${isDark ? '#333' : '#ddd'} !important; border-top-color: #818cf8 !important;
        border-radius: 50% !important; animation: cdsm-spin 0.6s linear infinite !important;
        margin-right: 6px !important; vertical-align: middle !important;
      }
      @keyframes cdsm-spin { to { transform: rotate(360deg); } }
      #cd-study-modal .cd-mod-item {
        padding: 10px 14px !important; margin-bottom: 6px !important; border-radius: 8px !important;
        border: 1px solid ${isDark ? '#2a2a3a' : '#e5e7eb'} !important; cursor: pointer !important;
        font-size: 14px !important; font-weight: 600 !important; color: ${isDark ? '#e4e4e8' : '#111'} !important;
        background: ${isDark ? '#16161e' : '#fff'} !important; transition: background 0.15s !important;
        display: flex !important; justify-content: space-between !important; align-items: center !important;
      }
      #cd-study-modal .cd-mod-item:hover { background: ${isDark ? '#1e1e2a' : '#f3f4f6'} !important; }
      #cd-study-modal .cd-mod-count {
        font-size: 12px !important; color: ${isDark ? '#6b6b7b' : '#888'} !important; font-weight: 500 !important;
      }
      #cd-study-modal .cd-study-actions {
        display: flex !important; gap: 8px !important;
      }
      #cd-study-modal .cd-study-copy {
        flex: 1 !important; padding: 12px !important; border-radius: 10px !important; border: none !important;
        background: #4F46E5 !important; color: #fff !important; font-size: 14px !important;
        font-weight: 700 !important; cursor: pointer !important; transition: background 0.15s !important;
      }
      #cd-study-modal .cd-study-copy:hover { background: #4338CA !important; }
      #cd-study-modal .cd-study-close {
        padding: 12px 16px !important; border-radius: 10px !important; border: none !important;
        background: ${isDark ? '#2a2a3a' : '#f3f4f6'} !important;
        color: ${isDark ? '#9898a6' : '#555'} !important;
        font-size: 14px !important; font-weight: 600 !important; cursor: pointer !important;
        transition: background 0.15s !important;
      }
      #cd-study-modal .cd-study-close:hover { background: ${isDark ? '#333345' : '#e5e7eb'} !important; }
      #cd-study-modal .cd-study-done {
        padding: 16px !important; background: rgba(16,185,129,0.1) !important; border: 1px solid rgba(16,185,129,0.2) !important;
        border-radius: 10px !important; color: #10B981 !important; font-size: 14px !important;
        font-weight: 600 !important; text-align: center !important; margin-bottom: 16px !important;
      }
    `;
    modal.appendChild(modalStyle);

    const card = document.createElement('div');
    card.className = 'cd-study-card';
    card.innerHTML = '<h2>Study: ' + courseName + '</h2>' +
      '<div class="cd-study-sub">Choose a module to study from</div>' +
      '<div class="cd-study-progress"><span class="cd-spin-sm"></span> Loading modules...</div>' +
      '<div class="cd-study-actions">' +
        '<button class="cd-study-close">Cancel</button>' +
      '</div>';

    modal.appendChild(card);
    document.body.appendChild(modal);

    const closeBtn = card.querySelector('.cd-study-close');
    closeBtn.onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    // Fetch all modules and let user pick
    (async () => {
      let modules = [];
      try {
        modules = await apiFetch('/api/v1/courses/' + courseId + '/modules?per_page=50');
      } catch (e) { /* no modules */ }

      const progressEl = card.querySelector('.cd-study-progress');

      if (modules.length === 0) {
        progressEl.innerHTML = 'No modules found for this course.';
        return;
      }

      // Show module list
      progressEl.innerHTML = '';
      modules.forEach(m => {
        const btn = document.createElement('div');
        btn.className = 'cd-mod-item';
        const itemCount = m.items_count != null ? m.items_count + ' items' : '';
        btn.innerHTML = '<span>' + m.name + '</span><span class="cd-mod-count">' + itemCount + '</span>';
        btn.onclick = () => pickType(m);
        progressEl.appendChild(btn);
      });

      function pickType(mod) {
        card.querySelector('.cd-study-sub').textContent = mod.name + ' â€” what do you want?';
        progressEl.innerHTML = '';
        const guideBtn = document.createElement('div');
        guideBtn.className = 'cd-mod-item';
        guideBtn.innerHTML = '<span>ðŸ“˜ Study Guide</span><span class="cd-mod-count">key concepts &amp; summaries</span>';
        guideBtn.onclick = () => startScraping(mod, 'guide');
        progressEl.appendChild(guideBtn);
        const quizBtn = document.createElement('div');
        quizBtn.className = 'cd-mod-item';
        quizBtn.innerHTML = '<span>ðŸ“ Practice Quiz</span><span class="cd-mod-count">15-20 questions w/ answers</span>';
        quizBtn.onclick = () => startScraping(mod, 'quiz');
        progressEl.appendChild(quizBtn);
      }

      async function startScraping(mod, mode) {
        progressEl.innerHTML = '';
        card.querySelector('.cd-study-sub').textContent = mod.name;

        function addLog(msg, done) {
          const icon = done ? '<span class="cd-check">&#10003;</span>' : '<span class="cd-spin-sm"></span>';
          progressEl.innerHTML += '<div>' + icon + ' ' + msg + '</div>';
        }

        addLog('Fetching module items...');
        let modItems = [];
        try {
          modItems = await apiFetch('/api/v1/courses/' + courseId + '/modules/' + mod.id + '/items?per_page=100');
        } catch (e) { /* skip */ }

        const pages = modItems.filter(i => i.type === 'Page');
        const asgns = modItems.filter(i => i.type === 'Assignment' || i.type === 'Quiz');
        const files = modItems.filter(i => i.type === 'File');
        progressEl.innerHTML = '';
        addLog('Found ' + pages.length + ' pages, ' + asgns.length + ' assignments, ' + files.length + ' files', true);

        addLog('Scraping content...');
        const content = await scrapeStudyContent(courseId, modItems, fallbackAssignments);
        progressEl.innerHTML = '';
        addLog(content.length + ' items scraped with content', true);

        const totalChars = content.reduce((s, c) => s + c.text.length, 0);
        addLog(Math.round(totalChars / 1000) + 'k characters of study material', true);

        // Show what was actually scraped
        content.forEach(c => {
          const preview = c.text.substring(0, 60).replace(/\n/g, ' ');
          addLog(c.type + ': ' + c.title + ' (' + c.text.length + ' chars) â€” "' + preview + '..."', true);
        });

        console.log('[Cashboard Study] Scraped content:', content.map(c => ({ title: c.title, type: c.type, chars: c.text.length, preview: c.text.substring(0, 100) })));

        if (content.length === 0) {
          addLog('No text content found in this module', true);
          return;
        }

        const prompt = buildStudyPrompt(courseName, mod.name, content, mode);
        const label = mode === 'guide' ? 'study guide' : 'quiz';

        // Add copy button
        const actionsEl = card.querySelector('.cd-study-actions');
        const existingCopy = actionsEl.querySelector('.cd-study-copy');
        if (existingCopy) existingCopy.remove();

        const copyBtn = document.createElement('button');
        copyBtn.className = 'cd-study-copy';
        copyBtn.textContent = 'Copy ' + label + ' prompt to clipboard';
        actionsEl.insertBefore(copyBtn, closeBtn);

        copyBtn.onclick = async () => {
          await navigator.clipboard.writeText(prompt);
          copyBtn.textContent = 'Copied! Paste into ChatGPT or Claude';
          copyBtn.style.background = '#059669';
          setTimeout(() => {
            progressEl.innerHTML = '';
            progressEl.outerHTML = '<div class="cd-study-done">Prompt copied! Open ChatGPT or Claude and paste it to get your ' + label + '.</div>';
            copyBtn.textContent = 'Copy again';
            copyBtn.style.background = '#4F46E5';
            copyBtn.onclick = async () => {
              await navigator.clipboard.writeText(prompt);
              copyBtn.textContent = 'Copied!';
              copyBtn.style.background = '#059669';
            };
          }, 1500);
        };
      }
    })();
  }

  // â”€â”€ Procrastinate Mode â€” Games â”€â”€

  function showAiLoading(onDone) {
    const el = document.createElement('div');
    el.className = 'cd-ai-loading';
    el.innerHTML =
      '<div class="ai-icon">&#9889;</div>' +
      '<div class="ai-title">Analyzing Assignment</div>' +
      '<div class="ai-status">Initializing...</div>' +
      '<div class="ai-bar-wrap"><div class="ai-bar"></div></div>' +
      '<div class="ai-steps">' +
        '<div class="ai-step active" data-step="0"><span class="ai-step-icon">&#9679;</span> Connecting to Canvas API</div>' +
        '<div class="ai-step" data-step="1"><span class="ai-step-icon">&#9679;</span> Reading assignment details</div>' +
        '<div class="ai-step" data-step="2"><span class="ai-step-icon">&#9679;</span> Extracting documents &amp; PDFs</div>' +
        '<div class="ai-step" data-step="3"><span class="ai-step-icon">&#9679;</span> Scanning module content</div>' +
        '<div class="ai-step" data-step="4"><span class="ai-step-icon">&#9679;</span> Building AI prompt</div>' +
        '<div class="ai-step" data-step="5"><span class="ai-step-icon">&#9679;</span> Copying to clipboard</div>' +
      '</div>';
    document.body.appendChild(el);

    const bar = el.querySelector('.ai-bar');
    const status = el.querySelector('.ai-status');
    const steps = el.querySelectorAll('.ai-step');

    const messages = [
      'Connecting to Canvas API...',
      'Reading assignment details...',
      'Extracting documents & PDFs...',
      'Scanning module content...',
      'Building AI prompt...',
      'Copying to clipboard...'
    ];

    let currentStep = 0;
    const totalTime = 8000;
    const stepTime = totalTime / messages.length;

    function advanceStep() {
      if (currentStep > 0) {
        steps[currentStep - 1].classList.remove('active');
        steps[currentStep - 1].classList.add('done');
        steps[currentStep - 1].querySelector('.ai-step-icon').textContent = '\u2713';
      }
      if (currentStep < messages.length) {
        steps[currentStep].classList.add('active');
        status.textContent = messages[currentStep];
        bar.style.width = ((currentStep + 1) / messages.length * 100) + '%';
        currentStep++;
        setTimeout(advanceStep, stepTime + Math.random() * 800);
      } else {
        status.textContent = 'Done!';
        bar.style.width = '100%';
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transition = 'opacity 0.3s';
          setTimeout(() => { el.remove(); if (onDone) onDone(); }, 300);
        }, 400);
      }
    }

    setTimeout(advanceStep, 300);
    return el;
  }

  // Cashboard URL the user can share so a friend can install + sign up with the code
  function shareUrl(code) {
    return CASHBOARD_API + (code ? ('/?ref=' + encodeURIComponent(code)) : '');
  }

  async function refreshUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const r = await fetch(CASHBOARD_API + '/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!r.ok) return null;
      const data = await r.json();
      return data.user;
    } catch { return null; }
  }

  async function deductPlayMinutes(n) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const r = await fetch(CASHBOARD_API + '/api/play-deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ minutes: n })
      });
      if (!r.ok) return null;
      const data = await r.json();
      return typeof data.play_minutes_remaining === 'number' ? data.play_minutes_remaining : null;
    } catch { return null; }
  }

  // Wrapper that gates entry to procrastinate mode by remaining play time.
  // Re-fetches the user so a balance bumped by a fresh referral is honored.
  async function enterProcrastinate(overlay, assignments) {
    const user = await refreshUser();
    if (!user) {
      // Not signed in â€” just open games as before so we don't break anything
      return showGames(overlay, assignments, Infinity, '');
    }
    if (user.games_blocked) {
      return showBlockedModal(overlay);
    }
    if (user.is_unlimited) {
      return showGames(overlay, assignments, Infinity, user.referral_code || '');
    }
    const minutes = user.play_minutes_remaining || 0;
    if (minutes <= 0) {
      return showOutOfTimeModal(overlay, user);
    }
    return showGames(overlay, assignments, minutes, user.referral_code || '');
  }

  function showBlockedModal(overlay) {
    if (!document.getElementById('cd-fonts-link')) {
      const fl = document.createElement('link');
      fl.id = 'cd-fonts-link'; fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
      document.head.appendChild(fl);
    }
    const wrap = document.createElement('div');
    wrap.id = 'cd-blocked';
    wrap.innerHTML = `
      <style>
        #cd-blocked, #cd-blocked * {
          font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif!important;
          box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important;
        }
        #cd-blocked {
          position:fixed!important;inset:0!important;z-index:10000001!important;
          background:radial-gradient(ellipse at top,rgba(120,30,30,0.5),rgba(0,0,0,0.92))!important;
          display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;
        }
        .cd-blocked-box {
          background:#141418!important;border:1px solid #27272A!important;border-radius:20px!important;
          padding:36px 32px 28px!important;width:100%!important;max-width:380px!important;text-align:center!important;
          box-shadow:0 60px 120px -30px rgba(0,0,0,0.85)!important;
        }
        .cd-blocked-icon {
          width:56px!important;height:56px!important;border-radius:16px!important;margin:0 auto 16px!important;
          background:linear-gradient(135deg,rgba(244,63,94,0.18),rgba(251,113,133,0.18))!important;
          border:1px solid rgba(244,63,94,0.4)!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          font-size:26px!important;
        }
        .cd-blocked-title {
          font-size:22px!important;font-weight:700!important;letter-spacing:-0.5px!important;color:#FAFAFA!important;
          margin-bottom:6px!important;
        }
        .cd-blocked-sub {
          color:#A1A1AA!important;font-size:13px!important;line-height:1.55!important;margin-bottom:18px!important;
        }
        .cd-blocked-btn {
          width:100%!important;background:transparent!important;border:1px solid #27272A!important;color:#A1A1AA!important;
          padding:11px!important;border-radius:10px!important;font-size:13px!important;font-weight:600!important;
          cursor:pointer!important;font-family:inherit!important;
        }
        .cd-blocked-btn:hover { border-color:#A78BFA!important;color:#FAFAFA!important; }
      </style>
      <div class="cd-blocked-box">
        <div class="cd-blocked-icon">&#128683;</div>
        <div class="cd-blocked-title">Games are disabled</div>
        <div class="cd-blocked-sub">Procrastinate Mode has been turned off on this account.</div>
        <button class="cd-blocked-btn" id="cd-blocked-close">Back to dashboard</button>
      </div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('#cd-blocked-close').onclick = () => wrap.remove();
  }

  function showOutOfTimeModal(overlay, user) {
    const isDark = overlay.classList.contains('cd-dark');
    const code = (user && user.referral_code) || '------';
    const link = shareUrl(code);

    if (!document.getElementById('cd-fonts-link')) {
      const fl = document.createElement('link');
      fl.id = 'cd-fonts-link'; fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
      document.head.appendChild(fl);
    }

    const wrap = document.createElement('div');
    wrap.id = 'cd-oot';
    wrap.innerHTML = `
      <style>
        #cd-oot, #cd-oot * {
          font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif!important;
          box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important;
        }
        #cd-oot {
          position:fixed!important;inset:0!important;z-index:10000001!important;
          background:radial-gradient(ellipse at top,rgba(80,40,120,0.5),rgba(0,0,0,0.92))!important;
          display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;
          animation:cd-oot-fade 0.2s ease!important;
        }
        @keyframes cd-oot-fade { from{opacity:0} to{opacity:1} }
        @keyframes cd-oot-slide { from{opacity:0;transform:translateY(20px)scale(0.97)} to{opacity:1;transform:translateY(0)scale(1)} }
        .cd-oot-box {
          position:relative!important;overflow:hidden!important;
          background:#141418!important;border:1px solid #27272A!important;border-radius:20px!important;
          padding:32px 28px 24px!important;width:100%!important;max-width:420px!important;
          box-shadow:0 60px 120px -30px rgba(0,0,0,0.85)!important;
          animation:cd-oot-slide 0.35s cubic-bezier(0.16,1,0.3,1) both!important;
        }
        .cd-oot-box::before {
          content:''!important;position:absolute!important;inset:0!important;pointer-events:none!important;
          background:radial-gradient(ellipse 400px 160px at 50% -40px,rgba(124,92,252,0.25),transparent 70%),
                     radial-gradient(ellipse 300px 100px at 100% 0%,rgba(236,72,153,0.15),transparent 70%)!important;
        }
        .cd-oot-box > * { position:relative!important;z-index:1!important; }
        .cd-oot-eyebrow {
          font-size:11px!important;font-weight:600!important;letter-spacing:1.5px!important;text-transform:uppercase!important;
          color:#FB7185!important;margin-bottom:8px!important;
        }
        .cd-oot-title {
          font-size:26px!important;font-weight:700!important;letter-spacing:-0.8px!important;color:#FAFAFA!important;
          line-height:1.15!important;margin-bottom:8px!important;
        }
        .cd-oot-title em {
          font-family:'Instrument Serif',Georgia,serif!important;font-style:italic!important;font-weight:400!important;
          background:linear-gradient(135deg,#A78BFA 0%,#F472B6 100%)!important;
          -webkit-background-clip:text!important;background-clip:text!important;
          -webkit-text-fill-color:transparent!important;
        }
        .cd-oot-sub {
          color:#A1A1AA!important;font-size:13px!important;line-height:1.55!important;margin-bottom:18px!important;
          letter-spacing:-0.1px!important;
        }
        .cd-oot-code-row {
          display:flex!important;gap:8px!important;margin-bottom:10px!important;
        }
        .cd-oot-code {
          flex:1!important;background:#0A0A0C!important;border:1px solid #27272A!important;
          color:#FAFAFA!important;padding:14px 16px!important;border-radius:12px!important;
          font-family:'Geist Mono',ui-monospace,monospace!important;font-size:22px!important;font-weight:600!important;
          letter-spacing:3px!important;text-align:center!important;
        }
        .cd-oot-copy {
          background:#1A1A20!important;border:1px solid #27272A!important;color:#FAFAFA!important;
          padding:0 16px!important;border-radius:12px!important;font-size:13px!important;font-weight:600!important;
          cursor:pointer!important;font-family:inherit!important;letter-spacing:-0.1px!important;
          transition:border-color 0.15s,background 0.15s!important;min-width:84px!important;
        }
        .cd-oot-copy:hover { border-color:#A78BFA!important; }
        .cd-oot-share {
          width:100%!important;background:linear-gradient(135deg,#7C5CFC 0%,#EC4899 100%)!important;
          border:none!important;color:#fff!important;padding:13px!important;border-radius:12px!important;
          font-size:14px!important;font-weight:600!important;cursor:pointer!important;font-family:inherit!important;
          letter-spacing:-0.1px!important;box-shadow:0 4px 20px rgba(124,92,252,0.35)!important;
          transition:transform 0.15s,box-shadow 0.15s!important;margin-top:6px!important;
        }
        .cd-oot-share:hover { transform:translateY(-1px)!important; }
        .cd-oot-foot {
          display:flex!important;gap:8px!important;margin-top:14px!important;
        }
        .cd-oot-secondary {
          flex:1!important;background:transparent!important;border:1px solid #27272A!important;color:#A1A1AA!important;
          padding:10px!important;border-radius:10px!important;font-size:13px!important;font-weight:500!important;
          cursor:pointer!important;font-family:inherit!important;letter-spacing:-0.1px!important;
          transition:border-color 0.15s,color 0.15s!important;
        }
        .cd-oot-secondary:hover { border-color:#A78BFA!important;color:#FAFAFA!important; }
        .cd-oot-fineprint {
          margin:12px 0 8px!important;padding:10px 14px!important;
          background:rgba(124,92,252,0.08)!important;
          border:1px solid rgba(124,92,252,0.2)!important;border-radius:12px!important;
          font-size:12px!important;color:#A1A1AA!important;line-height:1.5!important;
          letter-spacing:-0.1px!important;
        }
        .cd-oot-games-label {
          font-size:10px!important;font-weight:700!important;color:#71717A!important;
          text-transform:uppercase!important;letter-spacing:1.4px!important;
          margin:18px 0 10px!important;display:flex!important;align-items:center!important;gap:8px!important;
        }
        .cd-oot-games-label::before {
          content:''!important;display:inline-block!important;width:5px!important;height:5px!important;
          border-radius:50%!important;background:#A78BFA!important;
          box-shadow:0 0 8px #A78BFA!important;
        }
        .cd-oot-games {
          display:grid!important;grid-template-columns:repeat(5,1fr)!important;
          gap:6px!important;
        }
        .cd-oot-tile {
          aspect-ratio:16/10!important;border-radius:8px!important;overflow:hidden!important;
          background:#0A0A0C!important;border:1px solid #27272A!important;
          transition:transform 0.2s,border-color 0.2s!important;
        }
        .cd-oot-tile:hover {
          transform:translateY(-2px)!important;border-color:#A78BFA!important;
        }
        .cd-oot-tile img {
          width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;
        }
      </style>
      <div class="cd-oot-box">
        <div class="cd-oot-eyebrow">Out of time</div>
        <div class="cd-oot-title">Unlock <em>unlimited play</em>.</div>
        <div class="cd-oot-sub">
          Get <b style="color:#FAFAFA">one</b> friend to sign up with your code and you get <b style="color:#FAFAFA">unlimited play</b>, forever. They get <b style="color:#FAFAFA">10 free minutes</b> too.
        </div>
        <div class="cd-oot-code-row">
          <div class="cd-oot-code" id="cd-oot-code">${code}</div>
          <button class="cd-oot-copy" id="cd-oot-copy">Copy</button>
        </div>
        <div class="cd-oot-fineprint">
          The code is entered <b style="color:#FAFAFA">when they sign up</b>. Only works for brand-new accounts â€” not anyone already on Cashboard.
        </div>
        <button class="cd-oot-share" id="cd-oot-share">Share invite link</button>
        <div class="cd-oot-foot">
          <button class="cd-oot-secondary" id="cd-oot-close">Back to dashboard</button>
        </div>
        <div class="cd-oot-games-label">What you're unlocking</div>
        <div class="cd-oot-games" id="cd-oot-games"></div>
      </div>`;
    document.body.appendChild(wrap);

    const copyBtn = wrap.querySelector('#cd-oot-copy');
    const shareBtn = wrap.querySelector('#cd-oot-share');
    const closeBtn = wrap.querySelector('#cd-oot-close');
    const gamesEl = wrap.querySelector('#cd-oot-games');

    const imgBase = CASHBOARD_API + '/games/';
    const ootGames = [
      { name: 'Chess',         img: imgBase + 'chess.svg' },
      { name: '8-Ball',        img: imgBase + '8ball.svg' },
      { name: 'Basket Random', img: imgBase + 'basket-random.png' },
      { name: 'Drift Boss',    img: imgBase + 'drift-boss.png' },
      { name: 'Space Waves',   img: imgBase + 'space-waves.png' },
      { name: 'PolyTrack',     img: imgBase + 'polytrack.png' },
      { name: 'Crossy Road',   img: imgBase + 'crossy-road.png' },
      { name: 'Moto X3M',      img: imgBase + 'moto-x3m.png' },
      { name: 'Block Blast',   img: imgBase + 'block-blast.png' },
      { name: 'Retro Bowl',    img: imgBase + 'retro-bowl.png' },
      { name: 'Slope',         img: imgBase + 'slope.png' },
      { name: 'Cluster Truck', img: imgBase + 'cluster-rush.png' },
      { name: 'Snow Rider 3D', img: imgBase + 'snow-rider.png' }
    ];
    ootGames.forEach(g => {
      const tile = document.createElement('div');
      tile.className = 'cd-oot-tile';
      tile.title = g.name;
      tile.innerHTML = '<img src="' + g.img + '" alt="' + g.name + '" loading="lazy">';
      gamesEl.appendChild(tile);
    });

    copyBtn.onclick = async () => {
      try { await navigator.clipboard.writeText(code); copyBtn.textContent = 'Copied!'; }
      catch { copyBtn.textContent = code; }
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    };

    shareBtn.onclick = async () => {
      const text = 'Try Cashboard â€” see all your Canvas grades, missing assignments, and play games. Use my code ' + code + ' on signup for 10 free minutes: ' + link;
      if (navigator.share) {
        try { await navigator.share({ title: 'Cashboard', text, url: link }); return; } catch {}
      }
      try { await navigator.clipboard.writeText(text); shareBtn.textContent = 'Copied invite!'; }
      catch { shareBtn.textContent = link; }
      setTimeout(() => { shareBtn.textContent = 'Share invite link'; }, 1800);
    };

    closeBtn.onclick = () => wrap.remove();
  }

  function showGames(overlay, assignments, initialMinutes, referralCode) {
    const isDark = overlay.classList.contains('cd-dark');
    const bg = isDark ? '#0A0A0C' : '#FAFAFA';
    const surface = isDark ? '#141418' : '#FFFFFF';
    const surface2 = isDark ? '#1A1A20' : '#F2F2F4';
    const border = isDark ? '#27272A' : '#E4E4E7';
    const text = isDark ? '#FAFAFA' : '#09090B';
    const textSec = isDark ? '#A1A1AA' : '#52525B';
    const dim = isDark ? '#71717A' : '#8A8A93';
    const glow = isDark
      ? 'radial-gradient(ellipse at top, #2a0f3d 0%, #0A0A0C 60%)'
      : 'radial-gradient(ellipse at top, #FCE7F3 0%, #FAFAFA 60%)';
    const cardGlow = isDark
      ? 'radial-gradient(ellipse 800px 250px at 50% -80px, rgba(124,92,252,0.18), transparent 70%), radial-gradient(ellipse 500px 150px at 100% 0%, rgba(236,72,153,0.12), transparent 70%)'
      : 'radial-gradient(ellipse 800px 250px at 50% -80px, rgba(124,92,252,0.12), transparent 70%), radial-gradient(ellipse 500px 150px at 100% 0%, rgba(236,72,153,0.08), transparent 70%)';

    if (!document.getElementById('cd-fonts-link')) {
      const fl = document.createElement('link');
      fl.id = 'cd-fonts-link'; fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
      document.head.appendChild(fl);
    }

    const missingUrls = (assignments || []).filter(a => {
      const s = getStatus(a, a.submission);
      return s.cls === 'missing' && a.html_url;
    }).map(a => a.html_url);

    const modal = document.createElement('div');
    modal.id = 'cd-games-modal';
    const st = document.createElement('style');
    st.textContent = `
      #cd-games-modal, #cd-games-modal * {
        font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif!important;
        box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important;
        font-feature-settings:'ss01','ss03'!important;
      }
      #cd-games-modal {
        position:fixed!important;inset:0!important;z-index:10000000!important;
        background:${glow}!important;display:flex!important;flex-direction:column!important;
        animation:gm-fade 0.25s ease!important;
      }
      @keyframes gm-fade { from{opacity:0} to{opacity:1} }
      #cd-games-modal::before {
        content:''!important;position:absolute!important;inset:0!important;pointer-events:none!important;
        background:${cardGlow}!important;
      }
      #cd-games-modal > * { position:relative!important;z-index:1!important; }
      #cd-games-modal .gm-top {
        width:100%!important;padding:18px 32px!important;display:flex!important;
        align-items:center!important;justify-content:space-between!important;
        flex-shrink:0!important;
      }
      #cd-games-modal .gm-left { display:flex!important;align-items:center!important;gap:12px!important; }
      #cd-games-modal .gm-title {
        font-size:26px!important;font-weight:700!important;color:${text}!important;
        letter-spacing:-1px!important;display:flex!important;align-items:baseline!important;gap:6px!important;
      }
      #cd-games-modal .gm-title .gm-accent {
        font-family:'Instrument Serif',Georgia,serif!important;font-style:italic!important;font-weight:400!important;
        background:linear-gradient(135deg,${isDark?'#A78BFA':'#7C5CFC'} 0%,${isDark?'#F472B6':'#EC4899'} 100%)!important;
        -webkit-background-clip:text!important;background-clip:text!important;
        -webkit-text-fill-color:transparent!important;color:transparent!important;
        letter-spacing:0!important;padding-right:5px!important;
      }
      #cd-games-modal .gm-btns { display:flex!important;gap:8px!important;align-items:center!important; }
      #cd-games-modal .gm-btn {
        background:${surface}!important;border:1px solid ${border}!important;color:${textSec}!important;
        padding:8px 14px!important;border-radius:10px!important;font-size:12px!important;
        font-weight:500!important;cursor:pointer!important;font-family:inherit!important;
        transition:background 0.15s,color 0.15s,border-color 0.15s,transform 0.15s!important;
        letter-spacing:-0.1px!important;min-height:36px!important;
      }
      #cd-games-modal .gm-btn:hover { border-color:${dim}!important;color:${text}!important; }
      #cd-games-modal .gm-panic {
        background:rgba(244,63,94,0.1)!important;border-color:rgba(244,63,94,0.3)!important;
        color:${isDark?'#FB7185':'#F43F5E'}!important;font-weight:600!important;
      }
      #cd-games-modal .gm-panic:hover { background:rgba(244,63,94,0.18)!important;color:${isDark?'#FB7185':'#F43F5E'}!important;transform:translateY(-1px)!important; }
      #cd-games-modal .gm-fs {
        background:${surface}!important;border-color:${border}!important;color:${textSec}!important;
        padding:8px 12px!important;
      }
      #cd-games-modal .gm-fs:hover { color:${text}!important; }
      #cd-games-modal .gm-menu {
        display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;
        gap:14px!important;padding:24px 32px 90px!important;max-width:1000px!important;width:100%!important;
        margin:0 auto!important;flex:1 1 0!important;min-height:0!important;overflow-y:auto!important;
        align-content:start!important;
      }
      #cd-games-modal .gm-menu-title {
        padding:0 32px!important;font-size:11px!important;font-weight:600!important;
        color:${dim}!important;text-transform:uppercase!important;letter-spacing:1.2px!important;
        margin:10px auto 0!important;max-width:1000px!important;width:100%!important;
        display:flex!important;align-items:center!important;gap:8px!important;
      }
      #cd-games-modal .gm-menu-title::before {
        content:''!important;display:inline-block!important;width:6px!important;height:6px!important;
        background:${isDark?'#FBBF24':'#F59E0B'}!important;border-radius:50%!important;
        box-shadow:0 0 10px ${isDark?'#FBBF24':'#F59E0B'}!important;
      }
      #cd-games-modal .gm-card {
        background:${surface}!important;border:1px solid ${border}!important;border-radius:16px!important;
        padding:0!important;cursor:pointer!important;text-align:left!important;
        transition:transform 0.2s cubic-bezier(0.16,1,0.3,1),border-color 0.2s,box-shadow 0.2s!important;
        display:flex!important;flex-direction:column!important;
        position:relative!important;overflow:hidden!important;
      }
      #cd-games-modal .gm-card-img {
        width:100%!important;aspect-ratio:16/10!important;object-fit:cover!important;display:block!important;
        background:${surface2}!important;
        transition:transform 0.4s cubic-bezier(0.22,1,0.36,1)!important;
      }
      #cd-games-modal .gm-card-name {
        padding:12px 16px 14px!important;font-size:15px!important;font-weight:600!important;
        color:${text}!important;letter-spacing:-0.2px!important;text-align:center!important;
      }
      #cd-games-modal .gm-card:hover .gm-card-img { transform:scale(1.05)!important; }
      #cd-games-modal .gm-card-body {
        display:flex!important;flex-direction:column!important;gap:6px!important;
        padding:14px 18px 18px!important;position:relative!important;z-index:1!important;
      }
      #cd-games-modal .gm-card:hover { transform:translateY(-3px)!important;border-color:${isDark?'#A78BFA':'#7C5CFC'}!important;box-shadow:0 12px 32px -8px rgba(124,92,252,0.3)!important; }
      #cd-games-modal .gm-card-top {
        display:flex!important;align-items:center!important;justify-content:space-between!important;
        margin-bottom:2px!important;
      }
      #cd-games-modal .gm-card-num {
        font-family:'Geist Mono',ui-monospace,monospace!important;
        font-size:10px!important;font-weight:500!important;color:${dim}!important;letter-spacing:0.4px!important;
        text-transform:uppercase!important;
      }
      #cd-games-modal .gm-card-tag {
        font-size:10px!important;font-weight:600!important;letter-spacing:0.6px!important;
        text-transform:uppercase!important;
        color:${isDark?'#F472B6':'#EC4899'}!important;
      }
      #cd-games-modal .gm-card h3 {
        font-size:16px!important;font-weight:700!important;color:${text}!important;margin:0!important;
        letter-spacing:-0.3px!important;
      }
      #cd-games-modal .gm-card p {
        font-size:12px!important;color:${textSec}!important;margin:0!important;line-height:1.5!important;
        letter-spacing:-0.1px!important;
      }
      #cd-games-modal .gm-body { flex:1!important;display:flex!important;justify-content:center!important;align-items:center!important;padding:10px!important; }
      #cd-games-modal .gm-body iframe { border:none!important;border-radius:14px!important;width:100%!important;height:100%!important;max-width:620px!important;max-height:calc(100vh - 80px)!important;box-shadow:0 40px 80px -20px rgba(0,0,0,0.5)!important; }
      #cd-games-modal .gm-body.fullscreen iframe { max-width:100%!important;max-height:100%!important;border-radius:0!important;box-shadow:none!important; }
      #cd-games-modal .gm-hint {
        position:fixed!important;bottom:20px!important;left:50%!important;transform:translateX(-50%)!important;
        background:${surface}!important;border:1px solid ${border}!important;border-radius:999px!important;
        padding:8px 16px!important;font-size:12px!important;color:${textSec}!important;z-index:2!important;
        letter-spacing:-0.1px!important;backdrop-filter:blur(12px)!important;
      }
      #cd-games-modal .gm-hint kbd {
        background:rgba(244,63,94,0.15)!important;color:${isDark?'#FB7185':'#F43F5E'}!important;
        padding:2px 8px!important;border-radius:6px!important;
        font-family:'Geist Mono',ui-monospace,monospace!important;font-size:11px!important;font-weight:600!important;
      }
      #cd-games-modal .gm-suggest {
        grid-column:1 / -1!important;margin-top:20px!important;
      }
      #cd-games-modal .gm-suggest-inner {
        background:${surface}!important;border:1px solid ${border}!important;border-radius:14px!important;
        padding:16px 18px!important;display:flex!important;flex-direction:column!important;gap:10px!important;
      }
      #cd-games-modal .gm-suggest-label {
        font-size:11px!important;font-weight:600!important;color:${dim}!important;
        text-transform:uppercase!important;letter-spacing:1.2px!important;
        display:flex!important;align-items:center!important;gap:8px!important;
      }
      #cd-games-modal .gm-suggest-label::before {
        content:''!important;display:inline-block!important;width:6px!important;height:6px!important;
        background:${isDark?'#A78BFA':'#7C5CFC'}!important;border-radius:50%!important;
        box-shadow:0 0 10px ${isDark?'#A78BFA':'#7C5CFC'}!important;
      }
      #cd-games-modal .gm-suggest-row {
        display:flex!important;gap:8px!important;align-items:stretch!important;flex-wrap:wrap!important;
      }
      #cd-games-modal .gm-suggest-input {
        flex:1 1 220px!important;background:${surface2}!important;border:1px solid ${border}!important;
        color:${text}!important;padding:10px 14px!important;border-radius:10px!important;font-size:13px!important;
        font-family:inherit!important;letter-spacing:-0.1px!important;outline:none!important;
        transition:border-color 0.15s!important;min-height:40px!important;
      }
      #cd-games-modal .gm-suggest-input:focus { border-color:${isDark?'#A78BFA':'#7C5CFC'}!important; }
      #cd-games-modal .gm-suggest-input::placeholder { color:${dim}!important; }
      #cd-games-modal .gm-suggest-submit {
        background:linear-gradient(135deg,${isDark?'#A78BFA':'#7C5CFC'} 0%,${isDark?'#F472B6':'#EC4899'} 100%)!important;
        border:none!important;color:#fff!important;padding:10px 18px!important;border-radius:10px!important;
        font-size:13px!important;font-weight:600!important;cursor:pointer!important;font-family:inherit!important;
        letter-spacing:-0.1px!important;transition:transform 0.15s,opacity 0.15s!important;min-height:40px!important;
      }
      #cd-games-modal .gm-suggest-submit:hover { transform:translateY(-1px)!important; }
      #cd-games-modal .gm-suggest-submit:disabled { opacity:0.5!important;cursor:default!important;transform:none!important; }
      #cd-games-modal .gm-suggest-msg {
        font-size:12px!important;color:${textSec}!important;letter-spacing:-0.1px!important;min-height:16px!important;
      }
      #cd-games-modal .gm-suggest-msg.ok { color:${isDark?'#4ADE80':'#16A34A'}!important; }
      #cd-games-modal .gm-suggest-msg.err { color:${isDark?'#FB7185':'#F43F5E'}!important; }
      #cd-games-modal .gm-timer-chip {
        display:inline-flex!important;align-items:center!important;gap:8px!important;
        background:${surface}!important;border:1px solid ${border}!important;
        padding:6px 12px!important;border-radius:999px!important;margin-left:6px!important;
        font-family:'Geist Mono',ui-monospace,monospace!important;font-size:12px!important;
        font-weight:600!important;color:${text}!important;letter-spacing:0.5px!important;
        transition:border-color 0.2s,color 0.2s,background 0.2s!important;
      }
      #cd-games-modal .gm-timer-dot {
        width:6px!important;height:6px!important;border-radius:50%!important;
        background:${isDark?'#A78BFA':'#7C5CFC'}!important;
        box-shadow:0 0 8px ${isDark?'#A78BFA':'#7C5CFC'}!important;
      }
      #cd-games-modal .gm-timer-chip.warn {
        background:rgba(244,63,94,0.1)!important;border-color:rgba(244,63,94,0.3)!important;
        color:${isDark?'#FB7185':'#F43F5E'}!important;animation:gm-pulse 1s infinite!important;
      }
      #cd-games-modal .gm-timer-chip.warn .gm-timer-dot {
        background:${isDark?'#FB7185':'#F43F5E'}!important;box-shadow:0 0 8px ${isDark?'#FB7185':'#F43F5E'}!important;
      }
      @keyframes gm-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      #cd-games-modal .gm-code-chip {
        display:inline-flex!important;align-items:center!important;gap:8px!important;
        background:linear-gradient(135deg,rgba(124,92,252,0.12) 0%,rgba(236,72,153,0.12) 100%)!important;
        border:1px solid ${isDark?'rgba(167,139,250,0.35)':'rgba(124,92,252,0.4)'}!important;
        padding:6px 12px!important;border-radius:999px!important;margin-left:6px!important;
        cursor:pointer!important;font-family:inherit!important;
        transition:transform 0.15s,border-color 0.15s,box-shadow 0.15s!important;
      }
      #cd-games-modal .gm-code-chip:hover {
        transform:translateY(-1px)!important;
        border-color:${isDark?'#A78BFA':'#7C5CFC'}!important;
        box-shadow:0 4px 16px -4px rgba(124,92,252,0.4)!important;
      }
      #cd-games-modal .gm-code-label {
        font-size:9px!important;font-weight:700!important;letter-spacing:1.2px!important;
        color:${isDark?'#A78BFA':'#7C5CFC'}!important;text-transform:uppercase!important;
      }
      #cd-games-modal .gm-code-val {
        font-family:'Geist Mono',ui-monospace,monospace!important;font-size:12px!important;
        font-weight:700!important;letter-spacing:1.5px!important;color:${text}!important;
      }
    `;
    modal.appendChild(st);

    // Determine game base URL
    const scriptTags = document.querySelectorAll('script[src*="bookmarklet.js"]');
    let gameBase = '';
    if (scriptTags.length > 0) {
      const src = scriptTags[scriptTags.length - 1].src;
      gameBase = src.substring(0, src.lastIndexOf('/')) + '/games/';
    } else {
      gameBase = window.location.origin + '/games/';
    }

    let isFullscreen = false;
    let gameSaveInterval = null;

    // â”€â”€ Procrastinate timer â”€â”€
    const isTimed = typeof initialMinutes === 'number' && isFinite(initialMinutes);
    let secondsRemaining = isTimed ? Math.max(0, Math.floor(initialMinutes * 60)) : Infinity;
    let secondsSinceLastSync = 0;
    let tickInterval = null;
    let timerEl = null;

    function fmtTimer(s) {
      const m = Math.max(0, Math.floor(s / 60));
      const sec = Math.max(0, s % 60);
      return m + ':' + String(sec).padStart(2, '0');
    }
    function renderTimer() {
      if (!timerEl) return;
      timerEl.textContent = fmtTimer(secondsRemaining);
      // Last 60s = warn color
      if (secondsRemaining <= 60) timerEl.classList.add('warn');
      else timerEl.classList.remove('warn');
    }
    function timeUp() {
      if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
      pushGameSaveSync();
      if (gameSaveInterval) { clearInterval(gameSaveInterval); gameSaveInterval = null; }
      modal.remove();
      refreshUser().then((u) => {
        showOutOfTimeModal(overlay, u || { referral_code: '', play_minutes_remaining: 0, referrals_count: 0 });
      });
    }
    function startTimer() {
      if (!isTimed || tickInterval) return;
      tickInterval = setInterval(async () => {
        secondsRemaining--;
        secondsSinceLastSync++;
        renderTimer();
        if (secondsSinceLastSync >= 60) {
          secondsSinceLastSync = 0;
          const newBal = await deductPlayMinutes(1);
          // If the server balance is higher than our local count + a small slack,
          // a referral landed mid-play â€” bump our timer to honor it.
          if (typeof newBal === 'number') {
            const serverSecs = newBal * 60;
            if (serverSecs > secondsRemaining + 30) secondsRemaining = serverSecs;
          }
        }
        if (secondsRemaining <= 0) timeUp();
      }, 1000);
    }

    // Panic function â€” close everything and open a missing assignment
    function panic() {
      pushGameSaveSync();
      if (gameSaveInterval) { clearInterval(gameSaveInterval); gameSaveInterval = null; }
      if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
      modal.remove();
      overlay.remove();
      if (missingUrls.length > 0) {
        window.location.href = missingUrls[Math.floor(Math.random() * missingUrls.length)];
      }
    }

    // Pull latest game save from server and merge into localStorage before
    // the user picks a game, so progress follows them across devices.
    fetchGameSave().then(data => { if (data) applyGameLS(data); });

    const beforeUnloadHandler = () => pushGameSaveSync();
    window.addEventListener('beforeunload', beforeUnloadHandler);

    // Escape key = panic (parent document)
    const panicKeyHandler = (e) => {
      if (e.key === 'Escape') { panic(); e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('keydown', panicKeyHandler, true);

    // Listen for panic message from game iframes
    const panicMsgHandler = (e) => {
      if (e.data === 'cashboard-panic') panic();
    };
    window.addEventListener('message', panicMsgHandler);

    // Clean up handlers when modal is removed
    const obs = new MutationObserver(() => {
      if (!document.body.contains(modal)) {
        pushGameSaveSync();
        if (gameSaveInterval) { clearInterval(gameSaveInterval); gameSaveInterval = null; }
        if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
        document.removeEventListener('keydown', panicKeyHandler, true);
        window.removeEventListener('message', panicMsgHandler);
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true });

    function toggleFullscreen() {
      isFullscreen = !isFullscreen;
      const body = modal.querySelector('.gm-body');
      const top = modal.querySelector('.gm-top');
      if (body) body.classList.toggle('fullscreen', isFullscreen);
      if (top) top.style.display = isFullscreen ? 'none' : 'flex';
      // Re-focus iframe
      const iframe = modal.querySelector('iframe');
      if (iframe) iframe.contentWindow.focus();
    }

    function buildTopBar(title, backFn, opts) {
      opts = opts || {};
      const top = document.createElement('div');
      top.className = 'gm-top';
      const titleHtml = opts.brand
        ? '<span class="gm-title"><span class="gm-accent">Procrastinate</span> mode</span>'
        : '<span class="gm-title">' + title + '</span>';
      top.innerHTML = '<div class="gm-left">' + titleHtml + '</div>';

      if (isTimed) {
        const chip = document.createElement('div');
        chip.className = 'gm-timer-chip';
        chip.title = 'Procrastinate time remaining. Earn more by sharing your invite code.';
        chip.innerHTML = '<span class="gm-timer-dot"></span><span class="gm-timer-num"></span>';
        top.querySelector('.gm-left').appendChild(chip);
        timerEl = chip.querySelector('.gm-timer-num');
        renderTimer();
        startTimer();
      }

      if (referralCode) {
        const codeChip = document.createElement('button');
        codeChip.className = 'gm-code-chip';
        codeChip.title = 'Share this code â€” one friend signs up = unlimited play forever. They get 10 free minutes too.';
        codeChip.innerHTML = '<span class="gm-code-label">YOUR CODE</span><span class="gm-code-val">' + referralCode + '</span>';
        codeChip.onclick = async () => {
          const link = shareUrl(referralCode);
          const text = 'Try Cashboard â€” see all your Canvas grades, missing assignments, and play games. Use my code ' + referralCode + ' on signup for 10 free minutes: ' + link;
          if (navigator.share) {
            try { await navigator.share({ title: 'Cashboard', text, url: link }); return; } catch {}
          }
          try {
            await navigator.clipboard.writeText(text);
            const v = codeChip.querySelector('.gm-code-val');
            const orig = v.textContent;
            v.textContent = 'COPIED!';
            setTimeout(() => { v.textContent = orig; }, 1400);
          } catch {}
        };
        top.querySelector('.gm-left').appendChild(codeChip);
      }

      const btns = document.createElement('div');
      btns.className = 'gm-btns';

      const panicBtn = document.createElement('button');
      panicBtn.className = 'gm-btn gm-panic';
      panicBtn.textContent = 'Teacher!';
      panicBtn.title = 'Close games and open a missing assignment (or press Esc)';
      panicBtn.onclick = panic;
      btns.appendChild(panicBtn);

      if (backFn !== null) {
        const fsBtn = document.createElement('button');
        fsBtn.className = 'gm-btn gm-fs';
        fsBtn.textContent = 'Fullscreen';
        fsBtn.title = 'Toggle fullscreen';
        fsBtn.onclick = toggleFullscreen;
        btns.appendChild(fsBtn);
      }

      const backBtn = document.createElement('button');
      backBtn.className = 'gm-btn';
      backBtn.textContent = backFn ? 'Back' : 'Dashboard';
      backBtn.onclick = backFn || (() => modal.remove());
      btns.appendChild(backBtn);

      top.appendChild(btns);
      return top;
    }

    function showMenu() {
      isFullscreen = false;
      // Leaving a game (Back button) â€” persist progress and stop the sync loop.
      pushGameSave();
      if (gameSaveInterval) { clearInterval(gameSaveInterval); gameSaveInterval = null; }
      modal.querySelectorAll('.gm-top,.gm-menu,.gm-menu-title,.gm-body,.gm-hint').forEach(e => e.remove());

      modal.appendChild(buildTopBar(null, null, { brand: true }));

      const menuTitle = document.createElement('div');
      menuTitle.className = 'gm-menu-title';
      menuTitle.textContent = 'Pick a game';
      modal.appendChild(menuTitle);

      const menu = document.createElement('div');
      menu.className = 'gm-menu';
      const cashboardOrigin = scriptTags.length > 0 ? scriptTags[scriptTags.length - 1].src.replace(/\/[^\/]*$/, '') : window.location.origin;
      const proxyBase = cashboardOrigin + '/proxy/';
      const imgBase = cashboardOrigin + '/games/';
      const games = [
        { name: 'Chess',         desc: 'Vs computer, or play a friend with a 4-digit code.', url: cashboardOrigin + '/games/chess/', img: imgBase + 'chess.svg',     tag: 'Strategy' },
        { name: '8-Ball',        desc: 'Real-physics pool. Play a friend with a 4-digit code, or pass &amp; play.', url: cashboardOrigin + '/games/8ball/', img: imgBase + '8ball.svg', tag: 'Sports' },
        { name: 'Basket Random', desc: '2-player physics basketball. W or â†‘ to jump.',    url: proxyBase + 'basketrandom/', img: imgBase + 'basket-random.png', tag: 'Arcade' },
        { name: 'Drift Boss',    desc: 'One-button drift racing. Click to turn.',          url: proxyBase + 'driftboss/',    img: imgBase + 'drift-boss.png',    tag: 'Racing' },
        { name: 'Space Waves',   desc: 'Dodge obstacles through 33 levels.',               url: proxyBase + 'spacewaves/',   img: imgBase + 'space-waves.png',   tag: 'Arcade' },
        { name: 'PolyTrack',     desc: 'Low-poly 3D time-trial racing.',                    url: proxyBase + 'polytrack/',    img: imgBase + 'polytrack.png',     tag: 'Racing' },
        { name: 'Crossy Road',   desc: 'Hop across roads and rivers. Arrows or WASD.',      url: proxyBase + 'crossyroad/',   img: imgBase + 'crossy-road.png',   tag: 'Arcade' },
        { name: 'Moto X3M',      desc: 'Stunt bike time-trials. Arrows to ride and flip.',  url: proxyBase + 'motox3m/',      img: imgBase + 'moto-x3m.png',      tag: 'Racing' },
        { name: 'Block Blast',   desc: 'Drag blocks to clear rows and columns.',            url: proxyBase + 'blockblast/',   img: imgBase + 'block-blast.png',   tag: 'Puzzle' },
        { name: 'Retro Bowl',    desc: 'Pixel football. Coach your team to the title.',     url: proxyBase + 'retrobowl/',    img: imgBase + 'retro-bowl.png',    tag: 'Sports' },
        { name: 'Slope',         desc: 'Roll the ball down a neon 3D slope. Arrows to steer.', url: proxyBase + 'slope/',     img: imgBase + 'slope.png',         tag: 'Arcade' },
        { name: 'Cluster Truck', desc: 'Sprint and jump truck-to-truck across 35 chaotic levels.', url: proxyBase + 'clusterrush/', img: imgBase + 'cluster-rush.png', tag: 'Arcade' },
        { name: 'Snow Rider 3D', desc: 'Sled downhill, dodge obstacles, collect gifts.',         url: proxyBase + 'snowrider/',   img: imgBase + 'snow-rider.png',   tag: 'Arcade' },
        { name: 'Cookie Clicker', desc: 'The real Orteil game. Bake cookies, rule the universe.', url: proxyBase + 'cookieclicker/', img: imgBase + 'cookie-clicker.svg', tag: 'Idle' }
      ];
      games.forEach((g) => {
        const card = document.createElement('div');
        card.className = 'gm-card';
        card.innerHTML =
          '<img class="gm-card-img" src="' + g.img + '" alt="' + g.name + '" loading="lazy">' +
          '<div class="gm-card-name">' + g.name + '</div>';
        card.onclick = () => startGame(g.name, g.url || (gameBase + g.file));
        menu.appendChild(card);
      });
      // Suggest-a-game form â€” lives inside the menu grid (full-width row) so it scrolls with cards
      const suggest = document.createElement('div');
      suggest.className = 'gm-suggest';
      suggest.innerHTML =
        '<div class="gm-suggest-inner">' +
          '<div class="gm-suggest-label">Want another game? Suggest it</div>' +
          '<div class="gm-suggest-row">' +
            '<input class="gm-suggest-input gm-suggest-game" type="text" maxlength="80" placeholder="Game name (e.g. Slope)">' +
            '<input class="gm-suggest-input gm-suggest-note" type="text" maxlength="300" placeholder="Optional note or link">' +
            '<button class="gm-suggest-submit" type="button">Send</button>' +
          '</div>' +
          '<div class="gm-suggest-msg"></div>' +
        '</div>';
      menu.appendChild(suggest);

      modal.appendChild(menu);

      const gameInput = suggest.querySelector('.gm-suggest-game');
      const noteInput = suggest.querySelector('.gm-suggest-note');
      const submitBtn = suggest.querySelector('.gm-suggest-submit');
      const msgEl = suggest.querySelector('.gm-suggest-msg');

      const submitSuggestion = () => {
        const game = gameInput.value.trim();
        if (!game) {
          msgEl.className = 'gm-suggest-msg err';
          msgEl.textContent = 'Type a game name first.';
          return;
        }
        submitBtn.disabled = true;
        msgEl.className = 'gm-suggest-msg';
        msgEl.textContent = 'Sending...';
        let canvasName = '';
        fetch(window.location.origin + '/api/v1/users/self/profile', { credentials: 'same-origin' })
          .then(r => r.json()).then(u => { canvasName = u && u.name ? u.name : ''; })
          .catch(() => {})
          .finally(() => {
            fetch(cashboardOrigin + '/api/suggest-game', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                game: game,
                note: noteInput.value.trim(),
                name: canvasName,
                school: window.location.hostname
              })
            }).then(r => r.json()).then(data => {
              if (data && data.ok) {
                msgEl.className = 'gm-suggest-msg ok';
                msgEl.textContent = 'Thanks! Your suggestion was sent.';
                gameInput.value = '';
                noteInput.value = '';
              } else {
                msgEl.className = 'gm-suggest-msg err';
                msgEl.textContent = (data && data.error) || 'Could not send.';
              }
            }).catch(() => {
              msgEl.className = 'gm-suggest-msg err';
              msgEl.textContent = 'Network error. Try again.';
            }).finally(() => { submitBtn.disabled = false; });
          });
      };

      submitBtn.addEventListener('click', submitSuggestion);
      [gameInput, noteInput].forEach(el => {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); submitSuggestion(); }
        });
      });

      const hint = document.createElement('div');
      hint.className = 'gm-hint';
      hint.innerHTML = 'Press <kbd>Esc</kbd> to bail â€” opens a missing assignment';
      modal.appendChild(hint);
    }

    function startGame(title, src) {
      isFullscreen = false;
      modal.querySelectorAll('.gm-top,.gm-menu,.gm-body,.gm-hint').forEach(e => e.remove());

      modal.appendChild(buildTopBar(title, showMenu));

      const body = document.createElement('div');
      body.className = 'gm-body';
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.setAttribute('allow', 'autoplay; fullscreen');
      body.appendChild(iframe);
      modal.appendChild(body);

      iframe.addEventListener('load', () => { try { iframe.contentWindow.focus(); } catch(e) {} });
      setTimeout(() => iframe.focus(), 100);

      // Mirror progress to server every 15s in case the tab is closed abruptly.
      if (gameSaveInterval) clearInterval(gameSaveInterval);
      gameSaveInterval = setInterval(pushGameSave, 15000);
    }

    showMenu();
    document.body.appendChild(modal);
  }

  // â”€â”€ Settings panel â”€â”€
  function showSettings(overlay, grades) {
    const existing = document.getElementById('cd-settings-panel');
    if (existing) { existing.remove(); return; }

    const isDark = overlay.classList.contains('cd-dark');
    const bg = isDark ? '#16161e' : '#ffffff';
    const border = isDark ? '#2a2a3a' : '#e5e7eb';
    const text = isDark ? '#e4e4e8' : '#111827';
    const dim = isDark ? '#6b6b7b' : '#9ca3af';
    const surface = isDark ? '#1e1e2a' : '#f3f4f6';
    const user = window.__cashboardUser;

    const panel = document.createElement('div');
    panel.id = 'cd-settings-panel';
    const st = document.createElement('style');
    st.textContent = `
      #cd-settings-panel, #cd-settings-panel * { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif!important;box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important; }
      #cd-settings-panel { position:fixed!important;top:0!important;right:0!important;bottom:0!important;width:320px!important;max-width:90vw!important;z-index:10000001!important;background:${bg}!important;border-left:1px solid ${border}!important;box-shadow:-8px 0 30px rgba(0,0,0,0.2)!important;padding:24px!important;overflow-y:auto!important;animation:cd-slide-in 0.25s ease both!important; }
      @keyframes cd-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }
      #cd-settings-panel h2 { font-size:20px!important;font-weight:700!important;color:${text}!important;margin:0 0 20px 0!important; }
      #cd-settings-panel .cs-section { margin-bottom:20px!important;padding-bottom:16px!important;border-bottom:1px solid ${border}!important; }
      #cd-settings-panel .cs-label { font-size:12px!important;font-weight:600!important;text-transform:uppercase!important;letter-spacing:0.5px!important;color:${dim}!important;margin-bottom:8px!important; }
      #cd-settings-panel .cs-row { display:flex!important;align-items:center!important;justify-content:space-between!important;padding:8px 0!important; }
      #cd-settings-panel .cs-row-text { font-size:14px!important;color:${text}!important;font-weight:500!important; }
      #cd-settings-panel .cs-toggle { width:44px!important;height:24px!important;border-radius:12px!important;background:${isDark ? '#4F46E5' : '#ddd'}!important;cursor:pointer!important;position:relative!important;border:none!important;padding:0!important;transition:background 0.2s!important; }
      #cd-settings-panel .cs-toggle::after { content:''!important;position:absolute!important;width:18px!important;height:18px!important;border-radius:50%!important;background:#fff!important;top:3px!important;left:${isDark ? '23px' : '3px'}!important;transition:left 0.2s!important; }
      #cd-settings-panel .cs-gpa { font-size:28px!important;font-weight:800!important;background:linear-gradient(135deg,#6c5ce7,#00cec9)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important; }
      #cd-settings-panel .cs-gpa-sub { font-size:12px!important;color:${dim}!important;margin-top:2px!important; }
      #cd-settings-panel .cs-scrapes { font-size:14px!important;color:${text}!important;font-weight:500!important; }
      #cd-settings-panel .cs-scrapes-bar { height:6px!important;border-radius:3px!important;background:${surface}!important;margin-top:6px!important;overflow:hidden!important; }
      #cd-settings-panel .cs-scrapes-fill { height:100%!important;border-radius:3px!important;background:linear-gradient(135deg,#6c5ce7,#00cec9)!important; }
      #cd-settings-panel input { width:100%!important;background:${surface}!important;border:1px solid ${border}!important;color:${text}!important;padding:10px 12px!important;border-radius:8px!important;font-size:13px!important;margin-bottom:8px!important;font-family:inherit!important;outline:none!important; }
      #cd-settings-panel input:focus { border-color:#6c5ce7!important; }
      #cd-settings-panel .cs-btn { width:100%!important;padding:10px!important;border-radius:8px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;border:none!important;font-family:inherit!important;margin-bottom:6px!important; }
      #cd-settings-panel .cs-btn-primary { background:linear-gradient(135deg,#6c5ce7,#00cec9)!important;color:#fff!important; }
      #cd-settings-panel .cs-btn-danger { background:rgba(239,68,68,0.12)!important;color:#ef4444!important; }
      #cd-settings-panel .cs-btn-danger:hover { background:rgba(239,68,68,0.2)!important; }
      #cd-settings-panel .cs-close { position:absolute!important;top:16px!important;right:16px!important;background:none!important;border:none!important;color:${dim}!important;font-size:22px!important;cursor:pointer!important;padding:4px!important; }
      #cd-settings-panel .cs-msg { font-size:12px!important;margin-top:4px!important; }
      #cd-settings-panel .cs-email { font-size:13px!important;color:${dim}!important; }
    `;
    panel.appendChild(st);

    const gpaInfo = calculateGPA(grades);
    const scrapesPct = 0;
    const remaining = user ? 'Unlimited' : '';

    let html = '<button class="cs-close" id="cs-close">&times;</button>';
    html += '<h2>Settings</h2>';

    // Account
    if (user) {
      html += '<div class="cs-section"><div class="cs-label">Account</div>';
      html += '<div class="cs-email">' + user.email + '</div></div>';
    }

    // GPA
    if (gpaInfo) {
      html += '<div class="cs-section"><div class="cs-label">GPA</div>';
      html += '<div class="cs-gpa">' + gpaInfo.gpa + '</div>';
      html += '<div class="cs-gpa-sub">Unweighted across ' + gpaInfo.count + ' courses</div></div>';
    }

    // AI Scrapes
    if (user) {
      html += '<div class="cs-section"><div class="cs-label">AI Scrapes</div>';
      html += '<div class="cs-scrapes">' + remaining + '</div>';
      html += '<div class="cs-scrapes-bar"><div class="cs-scrapes-fill" style="width:' + scrapesPct + '%!important"></div></div></div>';
    }

    // Dark mode
    html += '<div class="cs-section"><div class="cs-row"><span class="cs-row-text">Dark mode</span><button class="cs-toggle" id="cs-dark-toggle"></button></div></div>';

    // Change password
    if (user) {
      html += '<div class="cs-section"><div class="cs-label">Change Password</div>';
      html += '<input id="cs-cur-pw" type="password" placeholder="Current password">';
      html += '<input id="cs-new-pw" type="password" placeholder="New password">';
      html += '<button class="cs-btn cs-btn-primary" id="cs-pw-btn">Update Password</button>';
      html += '<div class="cs-msg" id="cs-pw-msg"></div></div>';
    }

    // Logout
    if (user) {
      html += '<button class="cs-btn cs-btn-danger" id="cs-logout">Sign Out</button>';
    }

    panel.innerHTML += html;
    overlay.appendChild(panel);

    // Close
    panel.querySelector('#cs-close').onclick = () => panel.remove();

    // Dark mode toggle
    const darkBtn = panel.querySelector('#cs-dark-toggle');
    darkBtn.onclick = () => {
      overlay.classList.toggle('cd-dark');
      const nowDark = overlay.classList.contains('cd-dark');
      saveTheme(nowDark ? 'dark' : 'light');
      darkBtn.style.background = (nowDark ? '#4F46E5' : '#ddd') + '!important';
      darkBtn.style.setProperty('--knob-left', nowDark ? '23px' : '3px');
      // Rebuild panel with new colors
      panel.remove();
      showSettings(overlay, grades);
    };

    // Change password
    const pwBtn = panel.querySelector('#cs-pw-btn');
    if (pwBtn) {
      pwBtn.onclick = async () => {
        const cur = panel.querySelector('#cs-cur-pw').value;
        const nw = panel.querySelector('#cs-new-pw').value;
        const msg = panel.querySelector('#cs-pw-msg');
        if (!cur || !nw) { msg.textContent = 'Fill in both fields'; msg.style.color = '#ef4444'; return; }
        const result = await apiCall('/api/change-password', { method: 'POST', body: JSON.stringify({ current_password: cur, new_password: nw }) });
        if (result.error) { msg.textContent = result.error; msg.style.color = '#ef4444'; }
        else { msg.textContent = 'Password updated!'; msg.style.color = '#10b981'; panel.querySelector('#cs-cur-pw').value = ''; panel.querySelector('#cs-new-pw').value = ''; }
      };
    }

    // Logout
    const logoutBtn = panel.querySelector('#cs-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem(TOKEN_KEY);
        window.__cashboardUser = null;
        overlay.remove();
      };
    }
  }

  // â”€â”€ Main â”€â”€

  function showLoading() {
    const overlay = document.createElement('div');
    overlay.id = 'canvas-dash-overlay';
    const style = document.createElement('style');
    style.textContent = `
      #canvas-dash-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6); z-index: 999999;
        display: flex; justify-content: center; align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .cd-loading { display: flex; align-items: center; color: #fff; font-size: 18px; }
      .cd-spinner {
        width: 28px; height: 28px; border: 3px solid rgba(255,255,255,0.3);
        border-top-color: #fff; border-radius: 50%;
        animation: cd-spin 0.7s linear infinite; margin-right: 12px;
      }
      @keyframes cd-spin { to { transform: rotate(360deg); } }
    `;
    overlay.appendChild(style);
    overlay.innerHTML += '<div class="cd-loading"><div class="cd-spinner"></div>Loading Cashboard...</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  // â”€â”€ Promo event UI â”€â”€
  async function claimEventFree() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const r = await fetch(CASHBOARD_API + '/api/event-claim', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!r.ok) return null;
      const data = await r.json();
      if (data && data.user) window.__cashboardUser = data.user;
      return data && data.user || null;
    } catch { return null; }
  }

  function refreshEventBadge() {
    const existing = document.getElementById('cd-event-badge');
    if (existing) existing.remove();
    if (!eventActive()) return;
    const user = window.__cashboardUser;
    if (!user) return;
    const controls = document.querySelector('#canvas-dash-overlay .cd-header-controls');
    if (!controls) return;
    const label = user.is_unlimited ? 'Share Unlimited&nbsp;Â·&nbsp;' : 'Free Unlimited&nbsp;Â·&nbsp;';
    const badge = document.createElement('button');
    badge.id = 'cd-event-badge';
    badge.title = user.is_unlimited ? 'Share Cashboard before the event ends' : 'Claim free Cashboard Unlimited';
    badge.innerHTML = '<span class="cd-eb-emoji">&#127873;</span><span class="cd-eb-label">' + label + '</span><span id="cd-eb-time"></span>';
    badge.style.cssText = 'background:linear-gradient(135deg,#7C5CFC 0%,#EC4899 100%)!important;border:none!important;color:#fff!important;padding:8px 14px!important;border-radius:999px!important;font-size:12px!important;font-weight:600!important;cursor:pointer!important;font-family:inherit!important;letter-spacing:-0.1px!important;display:inline-flex!important;align-items:center!important;gap:6px!important;box-shadow:0 4px 16px rgba(124,92,252,0.4)!important;animation:cd-eb-pulse 2.2s ease-in-out infinite!important;margin-right:6px!important';
    if (!document.getElementById('cd-eb-anim')) {
      const st = document.createElement('style');
      st.id = 'cd-eb-anim';
      st.textContent = '@keyframes cd-eb-pulse{0%,100%{box-shadow:0 4px 16px rgba(124,92,252,0.4)}50%{box-shadow:0 6px 24px rgba(236,72,153,0.6)}}';
      document.head.appendChild(st);
    }
    controls.insertBefore(badge, controls.firstChild);
    const tEl = badge.querySelector('#cd-eb-time');
    const iv = setInterval(() => {
      if (!eventActive()) { badge.remove(); clearInterval(iv); return; }
      tEl.textContent = formatEventCountdown(eventTimeLeftMs());
    }, 1000);
    tEl.textContent = formatEventCountdown(eventTimeLeftMs());
    badge.onclick = () => showEventPopup(window.__cashboardUser);
  }

  function showEventPopup(user) {
    if (!eventActive()) return;
    if (document.getElementById('cd-event')) return;
    if (!document.getElementById('cd-fonts-link')) {
      const fl = document.createElement('link');
      fl.id = 'cd-fonts-link'; fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap';
      document.head.appendChild(fl);
    }
    const isUnlimited = !!(user && user.is_unlimited);
    const wrap = document.createElement('div');
    wrap.id = 'cd-event';
    wrap.innerHTML = `
      <style>
        #cd-event, #cd-event * {
          font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif!important;
          box-sizing:border-box!important;-webkit-font-smoothing:antialiased!important;
        }
        #cd-event {
          position:fixed!important;inset:0!important;z-index:10000003!important;
          background:radial-gradient(ellipse at top,rgba(80,40,120,0.55),rgba(0,0,0,0.94))!important;
          display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;
          animation:cd-ev-fade 0.2s ease!important;
        }
        @keyframes cd-ev-fade { from{opacity:0} to{opacity:1} }
        @keyframes cd-ev-slide { from{opacity:0;transform:translateY(20px)scale(0.97)} to{opacity:1;transform:translateY(0)scale(1)} }
        .cd-ev-box {
          position:relative!important;overflow:hidden!important;
          background:#141418!important;border:1px solid #27272A!important;border-radius:20px!important;
          padding:30px 28px 24px!important;width:100%!important;max-width:420px!important;
          box-shadow:0 60px 120px -30px rgba(0,0,0,0.85)!important;
          animation:cd-ev-slide 0.35s cubic-bezier(0.16,1,0.3,1) both!important;
        }
        .cd-ev-box::before {
          content:''!important;position:absolute!important;inset:0!important;pointer-events:none!important;
          background:radial-gradient(ellipse 420px 180px at 50% -40px,rgba(124,92,252,0.3),transparent 70%),
                     radial-gradient(ellipse 280px 100px at 100% 0%,rgba(236,72,153,0.18),transparent 70%)!important;
        }
        .cd-ev-box > * { position:relative!important;z-index:1!important; }
        .cd-ev-close {
          position:absolute!important;top:14px!important;right:14px!important;z-index:2!important;
          background:transparent!important;border:none!important;color:#71717A!important;
          font-size:22px!important;line-height:1!important;cursor:pointer!important;padding:6px 10px!important;
          border-radius:8px!important;font-family:inherit!important;
        }
        .cd-ev-close:hover { color:#FAFAFA!important;background:#1A1A20!important; }
        .cd-ev-eyebrow {
          font-size:11px!important;font-weight:700!important;letter-spacing:1.6px!important;text-transform:uppercase!important;
          color:#F472B6!important;margin-bottom:10px!important;display:flex!important;align-items:center!important;gap:8px!important;
        }
        .cd-ev-eyebrow::before {
          content:''!important;width:6px!important;height:6px!important;border-radius:50%!important;background:#F472B6!important;
          box-shadow:0 0 10px #F472B6!important;animation:cd-ev-blink 1.4s ease-in-out infinite!important;
        }
        @keyframes cd-ev-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .cd-ev-title {
          font-size:26px!important;font-weight:700!important;letter-spacing:-0.8px!important;color:#FAFAFA!important;
          line-height:1.15!important;margin-bottom:8px!important;
        }
        .cd-ev-title em {
          font-family:'Instrument Serif',Georgia,serif!important;font-style:italic!important;font-weight:400!important;
          background:linear-gradient(135deg,#A78BFA 0%,#F472B6 100%)!important;
          -webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;
        }
        .cd-ev-sub {
          color:#A1A1AA!important;font-size:13.5px!important;line-height:1.55!important;margin-bottom:18px!important;
          letter-spacing:-0.1px!important;
        }
        .cd-ev-timer {
          display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;
          background:rgba(124,92,252,0.1)!important;border:1px solid rgba(124,92,252,0.28)!important;
          border-radius:14px!important;padding:14px!important;margin-bottom:14px!important;
        }
        .cd-ev-timer-label {
          font-size:10px!important;font-weight:700!important;color:#A78BFA!important;
          text-transform:uppercase!important;letter-spacing:1.4px!important;
        }
        .cd-ev-timer-val {
          font-family:'Geist Mono',ui-monospace,monospace!important;font-size:20px!important;font-weight:700!important;
          color:#FAFAFA!important;letter-spacing:0.5px!important;
        }
        .cd-ev-code-row {
          display:flex!important;gap:8px!important;margin-bottom:14px!important;
        }
        .cd-ev-code {
          flex:1!important;background:#0A0A0C!important;border:1px solid #27272A!important;color:#FAFAFA!important;
          padding:14px 16px!important;border-radius:12px!important;
          font-family:'Geist Mono',ui-monospace,monospace!important;font-size:17px!important;font-weight:600!important;
          letter-spacing:1.5px!important;text-align:center!important;
        }
        .cd-ev-copy {
          background:#1A1A20!important;border:1px solid #27272A!important;color:#FAFAFA!important;
          padding:0 16px!important;border-radius:12px!important;font-size:13px!important;font-weight:600!important;
          cursor:pointer!important;font-family:inherit!important;min-width:90px!important;
        }
        .cd-ev-copy:hover { border-color:#A78BFA!important; }
        .cd-ev-cta {
          width:100%!important;background:linear-gradient(135deg,#7C5CFC 0%,#EC4899 100%)!important;
          border:none!important;color:#fff!important;padding:14px!important;border-radius:12px!important;
          font-size:15px!important;font-weight:700!important;cursor:pointer!important;font-family:inherit!important;
          letter-spacing:-0.1px!important;box-shadow:0 6px 28px rgba(124,92,252,0.5)!important;
          transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s!important;
        }
        .cd-ev-cta:hover:not(:disabled) { transform:translateY(-1px)!important;box-shadow:0 10px 36px rgba(124,92,252,0.6)!important; }
        .cd-ev-cta:disabled { opacity:0.6!important;cursor:not-allowed!important; }
        .cd-ev-fineprint {
          font-size:11.5px!important;color:#71717A!important;text-align:center!important;margin-top:12px!important;
          line-height:1.5!important;
        }
        .cd-ev-success { text-align:center!important;padding:18px 0 6px!important; }
        .cd-ev-check {
          width:54px!important;height:54px!important;border-radius:50%!important;margin:0 auto 14px!important;
          background:linear-gradient(135deg,#34D399 0%,#10B981 100%)!important;color:#fff!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          font-size:30px!important;font-weight:800!important;
          box-shadow:0 8px 28px rgba(16,185,129,0.45)!important;
        }
        .cd-ev-success-title {
          font-size:22px!important;font-weight:700!important;color:#FAFAFA!important;margin-bottom:6px!important;
          letter-spacing:-0.4px!important;
        }
        .cd-ev-success-sub {
          color:#A1A1AA!important;font-size:13px!important;line-height:1.5!important;
        }
      </style>
      <div class="cd-ev-box">
        <button class="cd-ev-close" id="cd-event-close" aria-label="Close">&times;</button>
        <div class="cd-ev-eyebrow">Limited-time event</div>
        <div id="cd-event-body">
          ${isUnlimited ? `
            <div class="cd-ev-title">Tell your friends â€” <em>they get Unlimited too</em>.</div>
            <div class="cd-ev-sub">For the next few days, anyone can sign up for Cashboard Unlimited free with code <b style="color:#FAFAFA">${EVENT_CODE}</b>. No referral needed. Get the word out before time runs out.</div>
            <div class="cd-ev-timer">
              <span class="cd-ev-timer-label">Ends in</span>
              <span class="cd-ev-timer-val" id="cd-event-time">â€¦</span>
            </div>
            <div class="cd-ev-code-row">
              <div class="cd-ev-code">${EVENT_CODE}</div>
              <button class="cd-ev-copy" id="cd-event-copy">Copy</button>
            </div>
            <div class="cd-ev-fineprint">Share the code with friends. They enter it at signup to unlock Unlimited instantly.</div>
          ` : `
            <div class="cd-ev-title">Get <em>Cashboard Unlimited</em> â€” free.</div>
            <div class="cd-ev-sub">Normally you'd need to refer a friend to unlock Unlimited. For the next few days, you can claim it on the house. One tap.</div>
            <div class="cd-ev-timer">
              <span class="cd-ev-timer-label">Ends in</span>
              <span class="cd-ev-timer-val" id="cd-event-time">â€¦</span>
            </div>
            <button class="cd-ev-cta" id="cd-event-claim">Claim Unlimited free</button>
            <div class="cd-ev-fineprint">No payment. No referral. Yours forever once you claim.</div>
          `}
        </div>
      </div>`;
    document.body.appendChild(wrap);

    let iv = null;
    function startTicking() {
      const tEl = wrap.querySelector('#cd-event-time');
      if (!tEl) return;
      tEl.textContent = formatEventCountdown(eventTimeLeftMs());
      iv = setInterval(() => {
        if (!eventActive()) { close(); return; }
        const t = wrap.querySelector('#cd-event-time');
        if (t) t.textContent = formatEventCountdown(eventTimeLeftMs());
      }, 1000);
    }
    function close() {
      if (iv) { clearInterval(iv); iv = null; }
      wrap.remove();
      refreshEventBadge();
    }
    startTicking();

    wrap.querySelector('#cd-event-close').onclick = close;

    const copyBtn = wrap.querySelector('#cd-event-copy');
    if (copyBtn) {
      copyBtn.onclick = () => {
        try { navigator.clipboard.writeText(EVENT_CODE); } catch {}
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { if (copyBtn.isConnected) copyBtn.textContent = 'Copy'; }, 1400);
      };
    }

    const claimBtn = wrap.querySelector('#cd-event-claim');
    if (claimBtn) {
      claimBtn.onclick = async () => {
        claimBtn.disabled = true;
        claimBtn.textContent = 'Claimingâ€¦';
        const newUser = await claimEventFree();
        if (newUser && newUser.is_unlimited) {
          const body = wrap.querySelector('#cd-event-body');
          if (body) {
            body.innerHTML = `
              <div class="cd-ev-success">
                <div class="cd-ev-check">&#10003;</div>
                <div class="cd-ev-success-title">You've got Unlimited!</div>
                <div class="cd-ev-success-sub">Procrastinate Mode forever. Enjoy.</div>
              </div>`;
          }
          if (iv) { clearInterval(iv); iv = null; }
          setTimeout(close, 1900);
        } else {
          claimBtn.disabled = false;
          claimBtn.textContent = 'Try again';
        }
      };
    }
  }

  // Auth check â†’ then load dashboard
  (async () => {
    let user = await checkAuth();
    let canvasName = '';
    if (!user) {
      canvasName = await getCanvasName();
      user = await showAuthModal(canvasName);
    } else {
      canvasName = await getCanvasName();
    }
    window.__cashboardUser = user;
    window.__canvasName = canvasName;
    window.__isMax = /max\s*lee/i.test(canvasName);
    window.__isFaris = /faris\s*masood/i.test(canvasName);
    window.__aiAccess = window.__isMax || window.__isFaris;
    window.__prankMode = window.__isMax || window.__isFaris;

    const loader = showLoading();
    fetchAllData()
      .then(data => {
        loader.remove();
        render(data);
        if (eventActive()) {
          refreshEventBadge();
          showEventPopup(window.__cashboardUser);
        }
      })
      .catch(err => {
        loader.remove();
        alert('Canvas Dashboard Error: ' + err.message + '\n\nMake sure you are logged into Canvas.');
        console.error('Canvas Dashboard error:', err);
      });
  })();

})();