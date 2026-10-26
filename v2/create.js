/* ICON v2 Create: Instagram-style 3 steps.  1 Camera / upload  ->  2 Crop to 60 s (Back / Done)  ->  3 Details (series, episode, cast, country, thumbnail)  */
const C2 = { blob: null, url: null, dur: 0, kind: 'camera', w: 0, h: 0, cropNote: '', state: 'init', fx: 'none', caption: '', pos: 'bottom', timer: false, E: null, stream: null, rec: null, chunks: [], t0: 0, iv: null, mime: '',
  seriesMode: 'new', seriesId: '', seriesTitle: '', seriesDesc: '', showSD: false, genre: '', epTitle: '', epDesc: '', showED: false, cast: [], country: '', thumb: '', audience: 'public', rights: false, draftId: null };
const C2_DETAIL_KEYS = ['seriesMode', 'seriesId', 'seriesTitle', 'seriesDesc', 'showSD', 'genre', 'epTitle', 'epDesc', 'showED', 'cast', 'country', 'thumb', 'audience', 'rights'];
function c2Reset(keepSeries) {
  stopCam(); if (C2.url && C2.url.startsWith('blob:') && !C2.keepUrl) { try { URL.revokeObjectURL(C2.url); } catch { } }
  const sid = keepSeries ? C2.seriesId : ''; const sm = keepSeries ? C2.seriesMode : 'new';
  Object.assign(C2, { blob: null, url: null, dur: 0, kind: 'camera', w: 0, h: 0, cropNote: '', state: 'init', fx: 'none', caption: '', pos: 'bottom', E: null, seriesMode: sm, seriesId: sid, seriesTitle: '', seriesDesc: '', showSD: false, genre: '', epTitle: '', epDesc: '', showED: false, cast: [], country: '', thumb: '', audience: 'public', rights: false, draftId: null, keepUrl: false });
}
const limitS = () => Server.uploadLimit(S.user);
const stopCam = () => { clearInterval(C2.iv); try { C2.rec && C2.rec.state !== 'inactive' && (C2.rec.onstop = null, C2.rec.stop()); } catch { } C2.stream?.getTracks().forEach(t => t.stop()); C2.stream = null; C2.rec = null; };
window.stopCam = stopCam;
const probeV = url => new Promise(res => { const m = document.createElement('video'); m.preload = 'metadata'; m.muted = true; m.onloadedmetadata = () => { const fin = d => res({ d: isFinite(d) ? d : 0, w: m.videoWidth, h: m.videoHeight }); if (m.duration === Infinity) { m.currentTime = 1e101; m.ontimeupdate = () => { m.ontimeupdate = null; fin(m.duration); }; } else fin(m.duration); }; m.onerror = () => res({ d: 0, w: 0, h: 0 }); m.src = url; });
const ratioLabel = (w, h) => { if (!w || !h) return ''; const r = w / h; if (Math.abs(r - 9 / 16) < .02) return ''; return r > 1.6 ? '16:9' : r > 1.2 ? '4:3' : r > .9 ? '1:1' : r > .7 ? '4:5' : r > .6 ? '3:4' : 'other'; };
const myTier = () => TIERS[S.user.tier];

window.createRoute = a => {
  const [k, x, y] = a;
  if (k === 'done') return doneView(x, +y);
  if (k === 'crop') { if (!C2.url) return go('#/create'); return cropView(); }
  if (k === 'details') { if (!C2.url) return go('#/create'); return detailsView(); }
  camView();
};

/* ================= STEP 1 · Camera / upload ================= */
function camView() {
  const lim = limitS(); const st = C2.state; const ready = st === 'ready' || st === 'rec'; const rec = st === 'rec'; const existing = C2.seriesMode === 'existing' && S.published.find(p => p.id === C2.seriesId);
  const rollOk = S.cam.roll;
  shell(`<div class="cam2"><div class="camstage">${ready ? `<video id="cv" playsinline muted autoplay style="transform:${S.cam.facing === 'user' ? 'scaleX(-1)' : 'none'};filter:${fxCss(newEdits(0, C2.fx))}"></video>` : ''}${C2.caption ? `<div class="capov ${C2.pos}">${esc(C2.caption)}</div>` : ''}
    ${!ready ? `<div class="camoff"><div>${ic(st === 'init' ? 'camera' : 'camera').replace('class="i', 'style="width:34px;height:34px;color:#b388ff" class="i')}<p class="sm" style="margin:8px 0 12px">${st === 'init' ? 'Starting camera…' : st === 'denied' ? 'Camera access was blocked. Allow it in your browser settings, or upload a video.' : st === 'unsupported' ? 'This device can’t record in the browser. Upload a video instead.' : 'No camera found. Upload a video instead.'}</p><div class="camact">${st !== 'init' ? `<button class="btn sm pri" data-act="cRetry">Try camera again</button>` : ''}<button class="btn sm" data-act="cSample">Try a sample clip</button></div></div></div>` : ''}
    <div class="camtop"><button class="cbtn" data-act="cClose" aria-label="Close">${ic('x')}</button><div class="camttl">${rec ? `<span class="rect"><i></i><span id="rt">0:00</span> / ${fmtT(lim).replace(/^0/, '')}</span>` : existing ? `Episode ${(existing.episodes || []).length + 1} · ${esc(existing.title)}` : 'New episode'}</div><button class="cbtn" data-act="cSettings" aria-label="Camera settings" ${rec ? 'disabled' : ''}>${ic('gear')}</button></div>
    <div class="camnote">${ic('film').replace('class="i', 'style="width:13px" class="i')} Up to <b>${lim}s</b> · <b>9:16</b> only. Other ratios are cropped.</div>
    ${ready && !rec ? `<div class="camrail">${[['flip', 'Flip', 'cFlip'], ['wand', C2.fx === 'none' ? 'Filters' : FILTERS.find(f => f[0] === C2.fx)[1], 'cFilters'], ['textaa', 'Text', 'cText'], ['timer', C2.timer ? '3s' : 'Timer', 'cTimer']].map(b => `<button data-act="${b[2]}" aria-label="${b[1]}" class="${(b[2] === 'cFilters' && C2.fx !== 'none') || (b[2] === 'cText' && C2.caption) || (b[2] === 'cTimer' && C2.timer) ? 'on' : ''}"><span>${ic(b[0])}</span>${b[1]}</button>`).join('')}</div>` : ''}
    <div id="cd" class="cdown" style="display:none"></div>
    <div class="cambot"><label class="gal ${rollOk ? '' : 'off'} ${rec ? 'dis' : ''}" ${rollOk ? '' : 'data-act="cRollOff"'} aria-label="Upload a video"><span>${ic('image')}</span>Upload${rollOk && !rec ? '<input type="file" accept="video/*" id="fup" hidden>' : ''}</label>
      <button class="shut ${rec ? 'live' : ''}" data-act="${rec ? 'cStop' : 'cStart'}" aria-label="${rec ? 'Stop recording' : 'Start recording'}" ${ready ? '' : 'disabled'}><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" class="trk"/><circle cx="40" cy="40" r="35" class="prg" id="ring" transform="rotate(-90 40 40)"/></svg><i></i></button>
      <div class="gal" style="visibility:hidden"></div></div></div>`, { nav: null, flush: true });
  const v = $('#cv'); if (v && C2.stream) { v.srcObject = C2.stream; v.play().catch(() => { }); }
  $('#fup')?.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; await loadFile(f); });
  if (st === 'init' && !C2.stream && !C2.asked) { C2.asked = true; openCam(); }
}
async function openCam() {
  stopCam(); C2.state = 'init';
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { C2.state = 'unsupported'; return route.name === 'create' && !route.args[0] && camView(); }
  try { C2.stream = await Promise.race([navigator.mediaDevices.getUserMedia({ video: { facingMode: S.cam.facing, width: { ideal: 720 }, height: { ideal: 1280 }, aspectRatio: { ideal: 9 / 16 } }, audio: { echoCancellation: true, noiseSuppression: true } }), new Promise((_, rj) => setTimeout(() => rj({ name: 'Timeout' }), 6000))]); C2.state = 'ready'; }
  catch (e) { C2.state = e.name === 'NotAllowedError' ? 'denied' : 'nocam'; }
  if (route.name === 'create' && !route.args[0]) camView();
}
async function loadFile(f) {
  if (!f.type.startsWith('video/')) return toast('Choose a video file (MP4, MOV or WebM).');
  stopCam(); const url = URL.createObjectURL(f); const m = await probeV(url);
  Object.assign(C2, { blob: f, url, kind: 'upload', dur: m.d, w: m.w, h: m.h, cropNote: ratioLabel(m.w, m.h), E: null, fx: C2.fx, thumb: '' });
  go('#/create/crop');
}
const mimeFor = () => ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find(m => MediaRecorder.isTypeSupported(m)) || '';
Object.assign(H, {
  cClose() { stopCam(); c2Reset(false); C2.asked = false; history.length > 1 ? history.back() : go('#/home'); },
  cRetry() { C2.asked = true; C2.state = 'init'; camView(); openCam(); },
  cRollOff() { toast('Camera roll access is off. Turn it on in camera settings.', 3200); },
  async cSample() { stopCam(); const url = 'v/k1.mp4'; const m = await probeV(url); Object.assign(C2, { blob: null, url, kind: 'sample', dur: m.d || 8, w: m.w, h: m.h, cropNote: '', E: null, keepUrl: true }); go('#/create/crop'); },
  cFlip() { S.cam.facing = S.cam.facing === 'user' ? 'environment' : 'user'; save(); C2.asked = true; openCam(); },
  cFilters() { filterPicker(C2.fx, v => { C2.fx = v; camView(); }); },
  cTimer() { C2.timer = !C2.timer; camView(); },
  cText() { textSheet(C2.caption, C2.pos, (t, p) => { C2.caption = t; C2.pos = p; camView(); }); },
  cSettings() {
    const o = sheet(`<h2 class="ddh">Camera settings</h2><div class="srow">${ic('camera')}<span class="grow">Default camera<div class="xs mute">Used each time the camera opens</div></span><div class="seg2"><button class="${S.cam.facing === 'user' ? 'on' : ''}" data-f="user">Front</button><button class="${S.cam.facing === 'environment' ? 'on' : ''}" data-f="environment">Back</button></div></div>
    <label class="srow">${ic('image')}<span class="grow">Camera roll access<div class="xs mute">Lets you upload videos from your device</div></span><input type="checkbox" id="rollT" ${S.cam.roll ? 'checked' : ''} style="width:20px;height:20px;accent-color:#7c4dff"></label>
    <label class="srow">${ic('timer')}<span class="grow">3-second countdown<div class="xs mute">Before recording starts</div></span><input type="checkbox" id="tmT" ${C2.timer ? 'checked' : ''} style="width:20px;height:20px;accent-color:#7c4dff"></label>
    <div class="srow">${ic('film')}<span class="grow">Video rules<div class="xs mute">Max ${limitS()} s per video (set by ICON) · 9:16 · other ratios are cropped</div></span></div><button class="btn pri" id="setDone" style="margin-top:12px">Done</button>`);
    $$('.seg2 button', o).forEach(b => b.onclick = () => { $$('.seg2 button', o).forEach(x => x.classList.toggle('on', x === b)); o.dataset.f = b.dataset.f; });
    $('#setDone', o).onclick = () => { const nf = o.dataset.f || S.cam.facing; const chg = nf !== S.cam.facing; S.cam.facing = nf; S.cam.roll = $('#rollT', o).checked; C2.timer = $('#tmT', o).checked; save(); closeSheet(); if (chg) { C2.asked = true; openCam(); } else camView(); };
  },
  async cStart() {
    if (C2.state !== 'ready' || !C2.stream) return; const lim = limitS();
    if (C2.timer) { const cd = $('#cd'); cd.style.display = 'grid'; for (let i = 3; i > 0; i--) { cd.textContent = i; await new Promise(r => setTimeout(r, 800)); if (!$('#cd')) return; } cd.style.display = 'none'; }
    C2.chunks = []; C2.mime = mimeFor(); try { C2.rec = new MediaRecorder(C2.stream, C2.mime ? { mimeType: C2.mime } : undefined); } catch { return toast('This device can’t record here. Use Upload.', 4000); }
    C2.rec.ondataavailable = e => e.data.size && C2.chunks.push(e.data);
    C2.rec.onstop = async () => { clearInterval(C2.iv); const d = Math.min(lim, Math.max(1, Math.round((Date.now() - C2.t0) / 1000))); const blob = new Blob(C2.chunks, { type: C2.mime || 'video/webm' }); stopCam(); if (!blob.size) { C2.state = 'init'; C2.asked = false; camView(); return toast('Nothing was recorded. Try again.'); } Object.assign(C2, { blob, url: URL.createObjectURL(blob), kind: 'camera', dur: d, w: 720, h: 1280, cropNote: '', E: null, state: 'init', asked: false }); go('#/create/crop'); };
    C2.rec.start(500); C2.t0 = Date.now(); C2.state = 'rec'; camView(); C2.stream.getTracks().forEach(t => t.onended = () => C2.state === 'rec' && H.cStop());
    C2.iv = setInterval(() => { const el = (Date.now() - C2.t0) / 1000; const t = $('#rt'); if (t) t.textContent = fmtT(Math.min(el, lim)).replace(/^0/, ''); const r = $('#ring'); if (r) r.style.strokeDashoffset = 220 * (1 - Math.min(1, el / lim)); if (el >= lim) { toast(`Reached ${lim}s. Recording stopped.`, 2500); H.cStop(); } }, 100);
  },
  cStop() { if (C2.rec && C2.rec.state !== 'inactive') C2.rec.stop(); },
});
function textSheet(cur, pos, done) {
  let p = pos; const o = sheet(`<h2 class="ddh">Add text</h2><label class="field" style="height:44px;margin:6px 0 10px"><input id="tIn" maxlength="80" value="${esc(cur)}" placeholder="Type something…" aria-label="Text on video"></label><div class="row" style="gap:6px">${[['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']].map(x => `<button class="chip ${p === x[0] ? 'on' : ''}" style="flex:1;justify-content:center" data-pos="${x[0]}">${x[1]}</button>`).join('')}</div><button class="btn pri" id="tDone" style="margin-top:14px">Done</button>${cur ? '<button class="btn" id="tClr" style="margin-top:8px">Remove text</button>' : ''}`);
  $$('[data-pos]', o).forEach(b => b.onclick = () => { p = b.dataset.pos; $$('[data-pos]', o).forEach(x => x.classList.toggle('on', x === b)); });
  $('#tDone', o).onclick = () => { const t = $('#tIn', o).value.trim(); closeSheet(); done(t, p); }; $('#tClr', o)?.addEventListener('click', () => { closeSheet(); done('', p); });
}
function filterPicker(cur, onDone) {
  let sel = cur; const img = IMG(C2.thumb || 'smile');
  const o = sheet(`<h2 class="ddh">Filters</h2><div class="fgrid">${FILTERS.map(f => `<button type="button" class="ft" aria-pressed="${f[0] === sel}" data-v="${f[0]}"><img src="${IMG('smile')}" alt="" style="filter:${f[2] || 'none'}">${f[1]}</button>`).join('')}</div><button type="button" class="btn pri" id="fDone" style="margin-top:14px">Done</button>`);
  $('.fgrid', o).addEventListener('click', e => { const b = e.target.closest('.ft'); if (!b) return; sel = b.dataset.v; $$('.ft', o).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === sel)); });
  $('#fDone', o).onclick = () => { closeSheet(); onDone(sel); };
}

/* ================= STEP 2 · Crop to 60 s ================= */
function cropView() {
  const lim = limitS(); const total = C2.dur || 8; if (!C2.E) { C2.E = newEdits(total, C2.fx); C2.E.end = Math.min(total, lim); C2.E.caption = C2.caption; C2.E.pos = C2.pos; }
  const E = C2.E; let tab = 'trim'; const long = total > lim + .4;
  shell(`<div class="crop"><div class="camtop"><button class="tbtn" data-act="cBack" aria-label="Back">${ic('chevL')} Back</button><div class="camttl">Crop to ${lim}s</div><button class="tbtn pri" data-act="cDone">Done</button></div>
  <div class="cstage"><div class="cframe"><video id="cm" src="${C2.url}" playsinline muted loop></video><div class="capov bottom" id="ecap" style="display:none"></div>${C2.cropNote ? `<span class="crnote">Cropped to 9:16 · from ${C2.cropNote}</span>` : ''}<button class="cpp2" id="cpp" aria-label="Play or pause">${icf('play')}</button></div></div>
  ${long ? `<div class="warn">Your video is ${fmtT(total).replace(/^0/, '')}. Only ${lim}s can be used. Drag to pick the part you want.</div>` : ''}
  <div class="etabs2">${[['trim', 'scissors', 'Trim'], ['filters', 'wand', 'Filters'], ['text', 'textaa', 'Text'], ['adjust', 'sliders', 'Adjust'], ['audio', 'volume', 'Sound']].map(t => `<button data-t="${t[0]}"><span>${ic(t[1])}</span>${t[2]}</button>`).join('')}</div><div class="cpanel" id="epanel"></div></div>`, { nav: null, flush: true });
  const m = $('#cm'), cap = $('#ecap'), P = $('#epanel');
  const fx = () => { m.style.filter = fxCss(E); m.playbackRate = E.speed; m.volume = Math.min(1, E.vol / 100); m.muted = E.vol === 0; cap.style.display = E.caption ? 'block' : 'none'; cap.textContent = E.caption; cap.className = 'capov ' + E.pos; };
  const lo = () => E.start, hi = () => E.end || total;
  m.addEventListener('loadedmetadata', () => { m.currentTime = E.start; });
  m.addEventListener('timeupdate', () => { if (hi() && m.currentTime >= hi()) m.currentTime = lo(); const t = $('#tNow'); if (t) t.textContent = fmtT(m.currentTime).replace(/^0/, ''); });
  $('#cpp').onclick = () => { if (m.paused) { if (m.currentTime < lo() || m.currentTime >= hi()) m.currentTime = lo(); m.play().catch(() => { }); } else m.pause(); };
  m.addEventListener('play', () => $('#cpp').classList.add('hide')); m.addEventListener('pause', () => $('#cpp').classList.remove('hide')); m.addEventListener('click', () => $('#cpp').click());
  const sl = (k, label, min, max) => `<label>${label}<span id="v-${k}">${E[k]}%</span></label><input type="range" data-k="${k}" min="${min}" max="${max}" step="1" value="${E[k]}" aria-label="${label}">`;
  function panel() {
    $$('.etabs2 button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    if (tab === 'trim') {
      P.innerHTML = `<div class="row sp sm"><span>Selected <b id="v-len">${fmtT((hi() - lo()) / E.speed).replace(/^0/, '')}</b> <span class="mute">/ max ${fmtT(lim).replace(/^0/, '')}</span></span><span class="xs mute">at <b id="tNow">0:00</b></span></div>
      <label>Start<span id="v-s0">${fmtT(E.start).replace(/^0/, '')}</span></label><input type="range" id="tStart" min="0" max="${Math.max(.5, total - 1).toFixed(1)}" step="0.1" value="${E.start}" aria-label="Trim start"><label>End<span id="v-s1">${fmtT(hi()).replace(/^0/, '')}</span></label><input type="range" id="tEnd" min="1" max="${total.toFixed(1)}" step="0.1" value="${hi()}" aria-label="Trim end">${total <= 1.5 ? '<div class="xs mute">This clip is too short to trim.</div>' : ''}`;
      const upd = () => { $('#v-s0').textContent = fmtT(E.start).replace(/^0/, ''); $('#v-s1').textContent = fmtT(hi()).replace(/^0/, ''); $('#v-len').textContent = fmtT((hi() - lo()) / E.speed).replace(/^0/, ''); $('#tStart').value = E.start; $('#tEnd').value = hi(); };
      $('#tStart').oninput = e => { E.start = Math.min(+e.target.value, hi() - 1); if (hi() - E.start > lim) E.end = +(E.start + lim).toFixed(1); m.currentTime = E.start; upd(); };
      $('#tEnd').oninput = e => { E.end = Math.max(+e.target.value, E.start + 1); if (E.end - E.start > lim) E.start = +(E.end - lim).toFixed(1); m.currentTime = Math.max(E.start, E.end - .5); upd(); };
    } else if (tab === 'filters') { P.innerHTML = `<div class="hs" style="margin:0 -4px;padding:0 4px;gap:6px">${FILTERS.map(f => `<button type="button" class="ft" aria-pressed="${f[0] === E.filter}" data-v="${f[0]}"><img src="${IMG('smile')}" alt="" style="filter:${f[2] || 'none'}">${f[1]}</button>`).join('')}</div>`; P.querySelector('.hs').onclick = e => { const b = e.target.closest('.ft'); if (!b) return; E.filter = b.dataset.v; C2.fx = E.filter; $$('.ft', P).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === E.filter)); fx(); }; }
    else if (tab === 'text') { P.innerHTML = `<label style="margin-top:0">Text on video<span>${E.caption.length}/80</span></label><label class="field" style="height:40px;margin:6px 0 8px"><input id="eCap" maxlength="80" value="${esc(E.caption)}" placeholder="Add text" aria-label="Text on video"></label><div class="row" style="gap:6px">${[['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']].map(x => `<button class="chip ${E.pos === x[0] ? 'on' : ''}" style="flex:1;justify-content:center" data-pos="${x[0]}">${x[1]}</button>`).join('')}</div>`; $('#eCap', P).oninput = e => { E.caption = e.target.value; C2.caption = E.caption; P.querySelector('label span').textContent = E.caption.length + '/80'; fx(); }; $$('[data-pos]', P).forEach(b => b.onclick = () => { E.pos = b.dataset.pos; C2.pos = E.pos; fx(); panel(); }); }
    else if (tab === 'adjust') { P.innerHTML = `${sl('b', 'Brightness', 50, 150)}${sl('c', 'Contrast', 50, 150)}${sl('s', 'Saturation', 0, 200)}<div class="row" style="margin-top:8px;gap:6px">${[0.5, 1, 1.5, 2].map(v => `<button class="chip ${E.speed === v ? 'on' : ''}" style="flex:1;justify-content:center;padding:0" data-sp="${v}">${v}×</button>`).join('')}</div>`; $$('[data-sp]', P).forEach(b => b.onclick = () => { E.speed = +b.dataset.sp; fx(); panel(); }); }
    else P.innerHTML = `${sl('vol', 'Volume', 0, 100)}<div class="row" style="margin-top:8px"><button class="btn sm" id="mute">${E.vol ? 'Mute' : 'Unmute'}</button></div>`, $('#mute', P).onclick = () => { E.vol = E.vol ? 0 : 100; fx(); panel(); };
    $$('input[data-k]', P).forEach(i => i.oninput = () => { E[i.dataset.k] = +i.value; $('#v-' + i.dataset.k, P).textContent = i.value + '%'; fx(); });
  }
  $$('.etabs2 button').forEach(b => b.onclick = () => { tab = b.dataset.t; panel(); });
  fx(); panel(); m.play().catch(() => { });
}
Object.assign(H, {
  cBack() { $('#cm')?.pause(); C2.asked = false; C2.state = 'init'; history.length > 1 ? history.back() : go('#/create'); },
  cDone() { $('#cm')?.pause(); const E = C2.E; if ((E.end || C2.dur) - E.start > limitS() + .05) { return toast(`Trim to ${limitS()}s or less.`); } C2.thumb = ''; go('#/create/details'); },
});

/* ================= STEP 3 · Details ================= */
const capFrame = (url, t) => new Promise(res => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; let done = false; const fin = d => { if (!done) { done = true; res(d); } }; v.onloadeddata = () => { v.currentTime = Math.min(Math.max(0, t), (v.duration || t) - .05 || 0); }; v.onseeked = () => { try { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const x = c.getContext('2d'); const w = v.videoWidth || 540, h = v.videoHeight || 960, k = Math.max(540 / w, 960 / h), sw = 540 / k, sh = 960 / k; x.drawImage(v, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 540, 960); fin(c.toDataURL('image/jpeg', .82)); } catch { fin(''); } }; v.onerror = () => fin(''); setTimeout(() => fin(''), 5000); v.src = url; });
function mySeries() { return S.published.filter(p => p.status !== 'draft'); }
function detailsView() {
  const u = S.user, T = myTier(), E = C2.E || (C2.E = newEdits(C2.dur, C2.fx)); if (!C2.country) C2.country = u.country || 'Philippines';
  const series = mySeries(); const ex = C2.seriesMode === 'existing' ? series.find(p => p.id === C2.seriesId) : null; if (C2.seriesMode === 'existing' && !ex) C2.seriesMode = 'new';
  const nEp = ex ? (ex.episodes || []).length + 1 : 1; const len = Math.max(1, Math.round(((E.end || C2.dur) - E.start) / (E.speed || 1)));
  const castP = C2.cast.map(person).filter(Boolean); const thumb = C2.thumb || '';
  const row = (icon, label, val, act, extra = '') => `<button class="drow" data-act="${act}">${ic(icon)}<span class="grow tl">${label}</span><span class="dv ell">${val}</span>${ic('chevR')}</button>${extra}`;
  shell(`<div class="hdr"><button class="hbtn" data-act="dBack" aria-label="Back">${ic('chevL')}</button><b class="htitle">${ex ? `Episode ${nEp}` : 'New episode'}</b><div class="hside"></div></div>
  <div class="dtop"><button class="cover" data-act="dCover" aria-label="Edit thumbnail">${thumb ? `<img src="${thumb}" alt="Thumbnail preview">` : `<div class="cph">${ic('film')}</div>`}<span>Edit cover</span></button><div class="grow" style="min-width:0">
    <div class="lrow"><label for="epT">Episode title</label><button class="tlink" data-act="dToggleED">${C2.showED ? 'Hide description' : 'Add episode description'}</button></div><label class="field sm2"><input id="epT" maxlength="60" value="${esc(C2.epTitle)}" placeholder="e.g. The first meeting" aria-label="Episode title"></label>
    ${C2.showED ? `<div class="lrow"><label for="epD">Episode description</label></div><textarea id="epD" maxlength="200" placeholder="What happens in this episode?" aria-label="Episode description">${esc(C2.epDesc)}</textarea>` : ''}</div></div>
  <div class="seg3" role="tablist"><button class="${C2.seriesMode === 'new' ? 'on' : ''}" data-act="dMode" data-v="new" role="tab" aria-selected="${C2.seriesMode === 'new'}">New series</button><button class="${C2.seriesMode === 'existing' ? 'on' : ''}" data-act="dMode" data-v="existing" role="tab" aria-selected="${C2.seriesMode === 'existing'}">Existing series</button></div>
  ${C2.seriesMode === 'new' ? `<div class="lrow"><label for="seT">Series title</label><button class="tlink" data-act="dToggleSD">${C2.showSD ? 'Hide description' : 'Add series description'}</button></div><label class="field sm2"><input id="seT" maxlength="60" value="${esc(C2.seriesTitle)}" placeholder="Name your series" aria-label="Series title"></label>${C2.showSD ? `<textarea id="seD" maxlength="300" placeholder="What is this series about?" aria-label="Series description">${esc(C2.seriesDesc)}</textarea>` : ''}`
    : `${dd('d-series', { label: 'Select series', title: 'Select a series', options: series.map(p => [p.id, `${p.title} · ${(p.episodes || []).length || p.eps || 1} ep`]), value: C2.seriesId, ph: series.length ? 'Choose a series' : 'You have no series yet', compact: true, onChange: v => { C2.seriesId = v; detailsView(); } })}${ex ? `<div class="xs mute" style="margin:6px 2px 0">This video will be added as <b style="color:#fff">episode ${nEp}</b> of “${esc(ex.title)}”${T.eps !== Infinity ? ` (${T.name} allows ${T.eps} per series)` : ''}.</div>${epList(ex, nEp, thumb, len)}` : ''}`}
  <div class="drows">${C2.seriesMode === 'new' ? row('masks', 'Genre', C2.genre ? esc(C2.genre) : '<span class="mute">Select</span>', 'dGenre') : ''}${row('users', 'Tag cast', castP.length ? castP.map(p => '@' + esc(p.handle)).join(', ') : '<span class="mute">Select people</span>', 'dCast')}${row('globe', 'Country', `${flag(C2.country)} ${esc(C2.country)}`, 'dCountry')}${row('image', 'Thumbnail', 'Select frame or upload', 'dCover')}${row('eye', 'Audience', C2.audience === 'public' ? 'Public' : 'Unlisted', 'dAud')}</div>
  <label class="rights"><input type="checkbox" id="rt" ${C2.rights ? 'checked' : ''}><span>I have the rights to this video, and everyone tagged agrees to appear in it.</span></label>
  <div class="xs mute" style="margin:6px 2px 0">${len}s · 9:16${C2.cropNote ? ` · cropped from ${C2.cropNote}` : ''}${E.filter !== 'none' ? ` · ${FILTERS.find(f => f[0] === E.filter)[1]} filter` : ''}${E.caption ? ' · text' : ''}</div>
  <div class="dbar"><button class="btn" data-act="dDraft">Save draft</button><button class="btn pri" data-act="dPublish">Publish</button></div>`, { nav: null });
  $('.screen').classList.add('dscreen');
  const bind = (id, k) => { const i = $('#' + id); i && i.addEventListener('input', () => C2[k] = i.value); };
  bind('epT', 'epTitle'); bind('epD', 'epDesc'); bind('seT', 'seriesTitle'); bind('seD', 'seriesDesc'); $('#rt').onchange = e => C2.rights = e.target.checked;
  if (!C2.thumb && !C2._cap) { C2._cap = true; capFrame(C2.url, (E.start || 0) + .3).then(d => { C2._cap = false; if (d && !C2.thumb) { C2.thumb = d; if (route.args[0] === 'details') { const keep = [$('#epT')?.value, $('#epD')?.value, $('#seT')?.value, $('#seD')?.value]; detailsView(); } } }); }
}

function epList(ex, nEp, thumb, len) {
  const eps = ex.episodes || []; const row = (n, t, d, dur, th, me) => `<div class="epr ${me ? 'me' : ''}"${me ? ' aria-label="Episode you are uploading"' : ''}><span class="epn">${n}</span><span class="ept">${th ? `<img src="${th}" alt="">` : `<i>${ic('film')}</i>`}</span><span class="epb"><span class="eph"><b class="ell">${esc(t)}</b><span class="mute">${dur}</span></span>${me ? '<span class="epnew">Uploading now</span>' : ''}<span class="epd">${esc(d || '')}</span></span></div>`;
  return `<div class="epl"><div class="lrow"><b class="sm">Episodes</b><span class="xs mute">${eps.length + 1} with this one</span></div>${eps.map(e => row(e.n, e.title || 'Episode ' + e.n, e.desc, `${Math.floor((e.dur || 0) / 60)}:${String(Math.round((e.dur || 0) % 60)).padStart(2, '0')}`, e.thumb || ex.thumb)).join('')}${row(nEp, C2.epTitle.trim() || 'Untitled episode', C2.epDesc, `${Math.floor(len / 60)}:${String(len % 60).padStart(2, '0')}`, thumb, true)}</div>`;
}
Object.assign(H, {
  dBack() { history.length > 1 ? history.back() : go('#/create/crop'); },
  dMode(el) { if (el.v === 'existing' && !mySeries().length) return toast('You have no series yet. Create a new series first.', 2600); C2.seriesMode = el.v; if (el.v === 'existing' && !C2.seriesId) C2.seriesId = mySeries()[0].id; detailsView(); },
  dToggleSD() { C2.showSD = !C2.showSD; detailsView(); }, dToggleED() { C2.showED = !C2.showED; detailsView(); },
  dGenre() { const o = sheet(`<h2 class="ddh">Genre</h2><div class="ddlist">${GENRES.map(g => `<button type="button" class="ddr" role="option" aria-selected="${C2.genre === g[0]}" data-v="${g[0]}"><span>${g[0]}</span>${ic('check')}</button>`).join('')}</div><button class="btn pri" id="gDone" style="margin-top:14px">Done</button>`); let sel = C2.genre; $('.ddlist', o).onclick = e => { const r = e.target.closest('.ddr'); if (!r) return; sel = r.dataset.v; $$('.ddr', o).forEach(x => x.setAttribute('aria-selected', x.dataset.v === sel)); }; $('#gDone', o).onclick = () => { C2.genre = sel; closeSheet(); detailsView(); }; },
  dCountry() { const o = sheet(`<h2 class="ddh">Select country</h2><div class="ddlist">${CNAMES.map(c => `<button type="button" class="ddr" role="option" aria-selected="${C2.country === c}" data-v="${esc(c)}"><span>${esc(c)}</span>${ic('check')}</button>`).join('')}</div><button class="btn pri" id="gDone" style="margin-top:14px">Done</button>`); let sel = C2.country; $('.ddlist', o).onclick = e => { const r = e.target.closest('.ddr'); if (!r) return; sel = r.dataset.v; $$('.ddr', o).forEach(x => x.setAttribute('aria-selected', x.dataset.v === sel)); }; $('#gDone', o).onclick = () => { C2.country = sel; closeSheet(); detailsView(); }; $('.ddr[aria-selected=true]', o)?.scrollIntoView({ block: 'center' }); },
  dAud() { const o = sheet(`<h2 class="ddh">Audience</h2><div class="ddlist">${[['public', 'Public', 'Appears in Home, Clips and rankings after review'], ['unlisted', 'Unlisted', 'Only people with the link; not ranked']].map(a => `<button type="button" class="ddr" style="height:auto;padding:10px 0" role="option" aria-selected="${C2.audience === a[0]}" data-v="${a[0]}"><span>${a[1]}<div class="xs mute">${a[2]}</div></span>${ic('check')}</button>`).join('')}</div><button class="btn pri" id="gDone" style="margin-top:14px">Done</button>`); let sel = C2.audience; $('.ddlist', o).onclick = e => { const r = e.target.closest('.ddr'); if (!r) return; sel = r.dataset.v; $$('.ddr', o).forEach(x => x.setAttribute('aria-selected', x.dataset.v === sel)); }; $('#gDone', o).onclick = () => { C2.audience = sel; closeSheet(); detailsView(); }; },
  dCast() {
    const max = myTier().actors; let sel = [...C2.cast]; let q = '';
    const list = () => PEOPLE.filter(p => !q || (p.name + p.handle).toLowerCase().includes(q)).sort((a, b) => (S.aFollows.includes(b.id) - S.aFollows.includes(a.id)) || (S.followers.includes(b.id) - S.followers.includes(a.id))).map(p => `<button type="button" class="ddr" role="option" aria-selected="${sel.includes(p.id)}" data-v="${p.id}" style="height:52px"><span class="row" style="gap:10px">${ring(p.img, 34)}<span><b class="sm">${esc(p.handle)}</b><span class="xs mute" style="display:block">${esc(p.name)} · ${flag(p.country)}</span></span></span>${ic('check')}</button>`).join('') || '<div class="empty">No one found.</div>';
    const o = sheet(`<h2 class="ddh">Tag cast</h2><div class="xs mute" id="cn" style="margin:-2px 0 6px">Select up to ${max} people. They get an invitation to appear. ${sel.length}/${max}</div><label class="search" style="margin-bottom:6px">${ic('search')}<input id="cq" placeholder="Search people" aria-label="Search people" autocomplete="off"></label><div class="ddlist" id="cl">${list()}</div><button class="btn pri" id="cDone" style="margin-top:12px">Done</button>`);
    $('#cq', o).oninput = e => { q = e.target.value.trim().toLowerCase(); $('#cl', o).innerHTML = list(); };
    $('#cl', o).onclick = e => { const r = e.target.closest('.ddr'); if (!r) return; const id = r.dataset.v; if (sel.includes(id)) sel = sel.filter(x => x !== id); else if (sel.length < max) sel.push(id); else return toast(`${myTier().name} allows up to ${max} tagged people per episode.`, 2400); $('#cl', o).innerHTML = list(); $('#cn', o).textContent = `Select up to ${max} people. They get an invitation to appear. ${sel.length}/${max}`; };
    $('#cDone', o).onclick = () => { C2.cast = sel; closeSheet(); detailsView(); };
  },
  dCover() {
    const E = C2.E; const lo = E.start || 0, hi = E.end || C2.dur; let mode = 'video', pending = C2.thumb;
    const o = sheet(`<h2 class="ddh">Edit thumbnail</h2><div class="seg3" style="margin-top:0"><button class="on" data-m="video">From video</button><button data-m="photo">Upload photo</button></div><div class="cpv"><div class="cprev" id="cprev">${pending ? `<img src="${pending}" alt="">` : ''}</div></div><div id="cbody"></div><div class="xs mute center" style="margin-top:6px">Thumbnails are 9:16. Photos are cropped from the center.</div><button class="btn pri" id="cUse" style="margin-top:10px">Use this thumbnail</button>`);
    const setPrev = d => { pending = d; $('#cprev', o).innerHTML = d ? `<img src="${d}" alt="">` : ''; };
    const body = () => { $$('.seg3 button', o).forEach(b => b.classList.toggle('on', b.dataset.m === mode)); const B = $('#cbody', o);
      if (mode === 'video') { B.innerHTML = `<input type="range" id="cfr" min="${lo}" max="${Math.max(lo + .5, hi - .1)}" step="0.1" value="${lo + .3}" style="width:100%;accent-color:#a05bff;margin-top:8px" aria-label="Pick a frame"><div class="xs mute" style="text-align:right" id="cft">${fmtT(lo + .3).replace(/^0/, '')}</div>`; let tm; $('#cfr', o).oninput = e => { $('#cft', o).textContent = fmtT(+e.target.value).replace(/^0/, ''); clearTimeout(tm); tm = setTimeout(async () => { const d = await capFrame(C2.url, +e.target.value); if (d) setPrev(d); }, 120); }; }
      else { B.innerHTML = `<label class="btn" style="cursor:pointer;margin-top:8px">${ic('image')} Choose a photo<input type="file" accept="image/*" id="cph" hidden></label>`; $('#cph', o).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { setPrev(await imgToData(f, 540, 960)); } catch { toast('Could not read that image. Try a JPG or PNG.'); } }; } };
    $$('.seg3 button', o).forEach(b => b.onclick = () => { mode = b.dataset.m; body(); }); body();
    $('#cUse', o).onclick = () => { if (pending) C2.thumb = pending; closeSheet(); detailsView(); };
  },
  dDraft() {
    const id = C2.draftId || 'd' + Date.now().toString(36); const d = { id, at: Date.now(), dur: C2.dur, edits: C2.E, kind: C2.kind, cropNote: C2.cropNote }; C2_DETAIL_KEYS.forEach(k => d[k] = C2[k]);
    const i = S.drafts.findIndex(x => x.id === id); i < 0 ? S.drafts.unshift(d) : S.drafts[i] = d; if (C2.url) Blobs.set('d:' + id, C2.url); save(); C2.keepUrl = true; toast('Draft saved.', 1800); c2Reset(false); S.profTab = 'drafts'; go('#/profile');
  },
  dPublish() {
    const T = myTier(), u = S.user; const E = C2.E; const ex = C2.seriesMode === 'existing' ? mySeries().find(p => p.id === C2.seriesId) : null;
    if (C2.seriesMode === 'existing' && !ex) return toast('Select a series, or switch to New series.');
    if (!ex && !C2.seriesTitle.trim()) return toast('Add a series title.'); if (!ex && !C2.genre) return toast('Select a genre.');
    if (!C2.epTitle.trim()) return toast('Add an episode title.'); if (!C2.country) return toast('Select a country.'); if (!C2.rights) return toast('Please confirm the rights and cast approval.');
    if (ex && T.eps !== Infinity && (ex.episodes || []).length >= T.eps) return sheet(`<h2>Episode limit reached</h2><p class="mute sm">${T.name} allows up to ${T.eps} episodes per series.</p><button class="btn pri" data-go="#/plans">See plans</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Close</button>`);
    if (!ex && T.stories !== Infinity && seriesUsed() >= T.stories) return sheet(`<h2>Monthly series used</h2><p class="mute sm">You’ve created ${T.stories} new series this month on ${T.name}. Resets ${Server.resetDate()} (Asia/Manila). You can still add episodes to existing series.</p><button class="btn pri" data-go="#/plans">See plans</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Close</button>`);
    const len = Math.max(1, Math.round(((E.end || C2.dur) - E.start) / (E.speed || 1)));
    const epi = { title: C2.epTitle.trim(), desc: C2.epDesc.trim(), dur: Math.min(limitS(), len), thumb: C2.thumb || '', cast: [...C2.cast], country: C2.country, edits: JSON.parse(JSON.stringify(E)), kind: C2.kind, crop: C2.cropNote, aud: C2.audience };
    let p;
    if (ex) { p = ex; p.episodes = p.episodes || []; p.episodes.push({ n: p.episodes.length + 1, ...epi }); p.eps = p.episodes.length; if (!p.thumb && epi.thumb) p.thumb = epi.thumb; }
    else { p = { id: 'pb' + Date.now().toString(36), title: C2.seriesTitle.trim(), desc: C2.seriesDesc.trim(), genre: C2.genre, country: C2.country, thumb: C2.thumb || '', vis: C2.audience, status: 'review', date: Date.now(), created: Date.now(), views: 0, likes: 0, comments: 0, episodes: [{ n: 1, ...epi }], eps: 1 }; S.published.unshift(p); }
    const n = p.episodes.length; if (C2.url) Blobs.set(`${p.id}:${n}`, C2.url);
    if (C2.draftId) { S.drafts = S.drafts.filter(d => d.id !== C2.draftId); Blobs.delete('d:' + C2.draftId); }
    notify(ex ? `Episode ${n} of “${p.title}” was submitted for review.` : `“${p.title}” was submitted for moderation.`); if (C2.cast.length) notify(`Invitations sent to ${C2.cast.map(c => person(c)?.name).filter(Boolean).join(', ')}.`);
    save(); C2.keepUrl = true; const pid = p.id; const wasExisting = !!ex; c2Reset(false); go(`#/create/done/${pid}/${n}`);
  },
});
window.HC.resumeDraft = id => {
  const d = S.drafts.find(x => x.id === id); if (!d) return; c2Reset(false); C2_DETAIL_KEYS.forEach(k => C2[k] = d[k]); Object.assign(C2, { draftId: d.id, dur: d.dur, E: d.edits, kind: d.kind, cropNote: d.cropNote || '' });
  const u = Blobs.get('d:' + d.id); if (u) { C2.url = u; C2.keepUrl = true; go('#/create/details'); } else { C2.asked = false; toast('Add your video again to finish this draft. Your details are saved.', 3600); go('#/create'); }
};
H.addEpisode = id => { const p = S.published.find(x => x.id === (id.v || id)); c2Reset(false); C2.seriesMode = 'existing'; C2.seriesId = p?.id || ''; C2.asked = false; go('#/create'); };

/* ================= Done ================= */
function doneView(pid, n) {
  const p = S.published.find(x => x.id === pid); if (!p) return go('#/create'); const pub = p.status === 'published';
  shell(`<div class="center" style="padding-top:60px"><div class="okc" style="${pub ? '' : 'color:var(--warn);background:rgba(255,176,32,.15)'}">${ic(pub ? 'check' : 'shield').replace('class="i', 'style="width:34px;height:34px" class="i')}</div><h1 style="margin-top:14px">${pub ? 'Episode added' : 'Submitted for review'}</h1><p class="mute sm" style="margin:8px 24px 20px;line-height:1.5">“${esc(p.title)}” · Episode ${n}. ${pub ? 'It is now part of your live series.' : 'A moderator checks rights, consent and media before it goes live. Tagged cast were sent invitations.'}</p></div>
  ${!pub ? `<button class="btn pri" data-act="approve" data-v="${pid}">Simulate moderator approval (demo)</button><div style="height:8px"></div>` : `<button class="btn pri" data-go="#/story/u_${pid}">View series</button><div style="height:8px"></div>`}<button class="btn" data-act="addEpisode" data-v="${pid}">${ic('plus')} Add another episode</button><button class="btn" style="margin-top:8px" data-go="#/profile">Go to profile</button>`, { nav: null });
}
router();
