/* Create wizard: Genre/Cast/Preferences -> Generate -> Story overview -> One-take recorder -> Publish */
const STEPS = ['Setup', 'Episodes', 'Record', 'Publish'];
const stepper = (n, kind = 'story') => { const labs = kind === 'story' ? STEPS : ['Plan', 'Record', 'Publish']; if (kind !== 'story') n = n === 3 ? 2 : n === 4 ? 3 : 1; return `<div class="steps" role="list" aria-label="Progress">${labs.map((s, i) => `${i ? '<div class="ln"></div>' : ''}<div class="s ${i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}" role="listitem" aria-current="${i + 1 === n ? 'step' : 'false'}"><b>${i + 1 < n ? ic('check').replace('class="i', 'style="width:16px" class="i') : i + 1}</b>${s}</div>`).join('')}</div>`; };
let C = { genre: 'Romance', title: '', actors: 1, friends: [], runtime: 5, city: 'Manila', op: null, kind: 'story', ftitle: '', fnotes: '' };
try { Object.assign(C, JSON.parse(sessionStorage.getItem('icon.draft') || '{}')); } catch { }
C.kind = 'story'; C.friends = (C.friends || []).filter(x => typeof x === 'string');
const saveDraft = () => { try { sessionStorage.setItem('icon.draft', JSON.stringify(C)); } catch { } };
const topBar = (back = true) => `<div class="top">${back ? `<button class="iconbtn" style="border:0;background:none" data-act="back" aria-label="Back">${ic('chevL')}</button>` : ''}<div class="grow center">${logo(34, false)}</div><button class="pro" data-go="#/plans">${ic('crown').replace('class="i', 'style="width:17px" class="i')} ${TIERS[S.user.tier].name === 'Free' ? 'Upgrade' : TIERS[S.user.tier].name}</button><img class="avatar" src="${IMG('avatar')}" alt="" data-go="#/profile"></div>`;
const personName = id => (typeof PEOPLE !== 'undefined' && PEOPLE.find(p => p.id === id)?.name) || 'Friend';
const maxActors = () => TIERS[S.user.tier].actors;

window.createRoute = (a) => {
  const [k, pid, ep] = a;
  if (k === 'story') return storyView(pid); if (k === 'record') return recordView(pid, +ep || 1); if (k === 'publish') return publishView(pid); if (k === 'done') return doneView(pid);
  setup();
};

/* ---------- Setup (steps 1–2) ---------- */
const kindTabs = () => `<div class="seg" role="tablist" aria-label="What are you making?">${[['story', 'wand', 'AI Story'], ['vlog', 'camera', 'Vlog'], ['podcast', 'mic', 'Podcast']].map(k => `<button class="chip ${C.kind === k[0] ? 'on' : ''}" role="tab" aria-selected="${C.kind === k[0]}" data-act="cKind" data-v="${k[0]}">${ic(k[1])}${k[2]}</button>`).join('')}</div>`;
function freeSetup() {
  const pod = C.kind === 'podcast';
  shell(`${topBar(false)}<h1 style="font-size:36px">Create<br><span class="gt">${pod ? 'Your Podcast' : 'Your Vlog'}</span></h1><p style="margin:8px 0 0;color:#e6e4ff">${pod ? 'Record an audio episode, polish it, and publish it.' : 'Record a video, add filters, trim it, and publish it.'}</p>${kindTabs()}${stepper(1, C.kind)}
  <div class="card" style="padding:12px;margin-bottom:16px;font-size:13px">${ic('shield').replace('class="i', 'style="width:16px;vertical-align:-3px;margin-right:6px;color:var(--ok)" class="i')}${pod ? 'Podcasts' : 'Vlogs'} don’t use your story allowance and have no time limit.</div>
  <h2 style="margin-bottom:10px">1. Title</h2><label class="field" style="margin-bottom:6px"><input id="ftitle" maxlength="60" value="${esc(C.ftitle)}" placeholder="${pod ? 'e.g. Episode 1: Why I started' : 'e.g. A day in Manila'}" aria-label="Title"></label>
  <h2 style="margin:18px 0 10px">2. Talking points <span class="mute sm" style="font-weight:400">(Optional)</span></h2><div class="card" style="padding:10px 14px"><textarea id="fnotes" maxlength="500" style="border:0;background:none;padding:4px 0;min-height:110px" placeholder="Jot down what you want to cover. It shows beside the recorder." aria-label="Talking points">${esc(C.fnotes)}</textarea><div class="xs mute" style="text-align:right" id="fcnt">${C.fnotes.length}/500</div></div>
  <button class="btn pri" style="margin-top:18px;height:56px" data-act="fStart">${ic(pod ? 'mic' : 'camera')} Start recording ${ic('chevR')}</button>
  <p class="center mute sm" style="margin:10px 0 0">You can also upload a finished ${pod ? 'audio or video file' : 'video'} on the next screen.</p>`, { nav: 'create' });
  $('#ftitle').addEventListener('input', e => { C.ftitle = e.target.value; saveDraft(); });
  $('#fnotes').addEventListener('input', e => { C.fnotes = e.target.value; $('#fcnt').textContent = C.fnotes.length + '/500'; saveDraft(); });
}
function setup() {
  C.kind = 'story'; const T = TIERS[S.user.tier], rem = Server.remaining(S.user.id, S.user.tier), limit = Server.uploadLimit(S.user);
  const maxA = maxActors(); C.actors = Math.min(Math.max(1, C.actors), maxA); C.friends = C.friends.slice(0, C.actors - 1);
  const mins = [1, 2, 3, 5, 10, 15, 20, 30].filter(m => m <= T.eps); if (!mins.includes(C.runtime)) C.runtime = mins.includes(5) ? 5 : mins[mins.length - 1];
  const eps = Math.ceil(C.runtime * 60 / limit); const need = C.actors - 1; const names = C.friends.map(personName);
  shell(`${topBar(false)}<h1 style="font-size:28px;margin-bottom:2px">Create <span class="gt">Your Story</span></h1>${stepper(1)}
  <div class="row sp sm" style="margin-bottom:10px"><span><b>${T.name}</b> · ${rem === Infinity ? 'fair-use unlimited stories' : `${rem} of ${T.stories} stories left`}</span><span class="xs mute">${rem === Infinity ? '' : 'Resets ' + Server.resetDate()}</span></div>
  <label class="field" style="margin-bottom:10px"><input id="stitle" maxlength="60" value="${esc(C.title)}" placeholder="Story title" aria-label="Story title"></label>
  <div class="row" style="gap:8px;align-items:stretch;margin-bottom:8px"><div style="flex:1;min-width:0">${dd('c-genre', { label: 'Genre', title: 'Choose a genre', options: GENRES.map(g => g[0]), value: C.genre, onChange: v => { C.genre = v; saveDraft(); } })}</div><div style="flex:1;min-width:0">${dd('c-actors', { label: 'Cast', title: 'Choose your cast', options: Array.from({ length: maxA }, (_, i) => [i + 1, i === 0 ? 'Just me' : `${i + 1} actors`]), value: C.actors, onChange: v => { C.actors = +v; C.friends = C.friends.slice(0, C.actors - 1); saveDraft(); setup(); } })}</div></div>
  <div class="row" style="gap:8px;align-items:stretch"><div style="flex:1;min-width:0">${dd('c-run', { label: 'Planned runtime', title: 'Planned runtime', options: mins.map(m => [m, m + ' min']), value: C.runtime, onChange: v => { C.runtime = +v; saveDraft(); setup(); } })}</div><div style="flex:1;min-width:0">${dd('c-city', { label: 'Location', title: 'Story location', options: PHC, value: C.city, onChange: v => { C.city = v; saveDraft(); } })}</div></div>
  ${need ? `<button class="dd" style="margin-top:8px" data-act="cPick"><span class="ddt"><span class="ddl">Co-actors (${C.friends.length}/${need})</span><span class="ddv ${names.length ? '' : 'ph'}">${names.length ? esc(names.join(', ')) : 'Choose from your friends'}</span></span>${ic('chevD')}</button>` : ''}
  <div class="card" style="margin-top:12px;padding:12px;font-size:13px;line-height:1.45">${ic('film').replace('class="i', 'style="width:16px;vertical-align:-3px;margin-right:6px;color:#b388ff" class="i')}<b>${C.runtime} min</b> of material = <b>${eps} episode${eps > 1 ? 's' : ''}</b> of up to ${limit} s each. Record in the app or upload a file for every episode.<div class="xs mute" style="margin-top:4px">${T.name} plans up to ${T.eps} min and ${T.actors} actors per story.</div></div>
  <button class="btn pri" style="margin-top:14px;height:56px" data-act="cStart">Start my story ${ic('chevR')}</button>`, { nav: 'create' });
  $('#stitle').addEventListener('input', e => { C.title = e.target.value; saveDraft(); });
}
const HC = window.HC = {
  noop() { },
  cKind(el) { C.kind = el.v; saveDraft(); setup(); },
  fStart() { const pid = Server.createFree(S.user, { kind: C.kind, title: C.ftitle, notes: C.fnotes.slice(0, 500) }); go('#/create/record/' + pid + '/1'); },
  cPick() {
    const need = C.actors - 1; const fr = S.friends || []; let sel = [...C.friends];
    const rows = () => fr.map(id => { const p = PEOPLE.find(x => x.id === id); return p ? `<button type="button" class="ddr" role="option" aria-selected="${sel.includes(id)}" data-v="${id}"><span class="row" style="gap:10px"><img class="avatar" style="width:34px;height:34px;border-width:1px" src="${IMG(p.img)}" alt="">${esc(p.name)} <span class="xs mute">@${esc(p.handle)}</span></span>${ic('check')}</button>` : ''; }).join('');
    const o = sheet(`<h2 class="ddh">Choose co-actors</h2><div class="xs mute" id="cpn" style="margin:-4px 0 8px">Pick ${need} friend${need > 1 ? 's' : ''}. Each one approves publishing at the end.</div>${fr.length ? `<div class="ddlist">${rows()}</div>` : `<div class="empty">You have no friends on ICON yet.<br><button class="link" style="color:#a98bff;display:inline;margin-top:8px" data-go="#/people">Find people</button></div>`}<button type="button" class="btn pri" id="cpDone" style="margin-top:18px">Done</button>`);
    $('.ddlist', o)?.addEventListener('click', e => { const r = e.target.closest('.ddr'); if (!r) return; const id = r.dataset.v; if (sel.includes(id)) sel = sel.filter(x => x !== id); else if (sel.length < need) sel.push(id); else return toast(`Only ${need} co-actor${need > 1 ? 's' : ''} for this cast size.`); $$('.ddr', o).forEach(x => x.setAttribute('aria-selected', sel.includes(x.dataset.v))); });
    $('#cpDone', o).onclick = () => { C.friends = sel; saveDraft(); closeSheet(); setup(); };
  },
  cStart() {
    const u = S.user; if (C.friends.length < C.actors - 1) return toast(`Choose ${C.actors - 1} co-actor${C.actors > 2 ? 's' : ''} from your friends, or set Cast to Just me.`, 4500);
    C.op = C.op || 'op' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const episodes = Math.ceil(C.runtime * 60 / Server.uploadLimit(u));
    const res = Server.createStory(u, { title: C.title, genre: C.genre, cast: [u.name, ...C.friends.map(personName)], runtimeMin: C.runtime, episodes, city: C.city }, C.op);
    if (!res.ok) { C.op = null; return res.quota ? sheet(`<h2>Monthly stories used</h2><p class="mute sm">${esc(res.error)}</p><button class="btn pri" data-go="#/plans">See plans</button>`) : toast(esc(res.error), 5000); }
    C.op = null; C.title = ''; saveDraft(); notify('Your story is set up. Episode 1 is ready to record or upload.'); go('#/create/story/' + res.prodId);
  },
};

/* ---------- Story overview (step 3) ---------- */
function storyView(pid) {
  const o = Server.overview(pid); if (!o) return go('#/create');
  const next = o.accepted < o.total ? o.accepted + 1 : null; const pub = S.published.find(p => p.prodId === pid);
  shell(`${topBar()}<h1 style="font-size:28px">${esc(o.title)}</h1>${stepper(2, o.kind)}
  <div class="card"><span class="pill vi">${o.genre}</span>${o.runtimeMin ? `<p style="margin:10px 0 0;line-height:1.5">Planned runtime <b>${o.runtimeMin} min</b> · ${o.total} episodes of up to ${Server.uploadLimit(S.user)} s each.</p>` : `<p style="margin:10px 0 0;line-height:1.5">${esc(o.premise) || '<span class="mute">No talking points.</span>'}</p>`}</div>
  ${o.kind !== 'story' ? '' : secHead('Cast')}${o.kind !== 'story' ? '' : ''}${o.kind !== 'story' ? '' : o.roles.map(r => `<div class="ep"><div class="n">${r.role + 1}</div><div class="grow"><b>${esc(CHAR_NAMES[r.role])}</b><div class="xs mute">Played by ${esc(r.actor)}${r.role === 0 ? ' (you)' : ''}</div></div></div>`).join('')}
  ${secHead('Episodes')}${Array.from({ length: o.total }, (_, i) => i + 1).map(n => { const t = o.takes[n]; return n <= o.accepted ? `<div class="ep"><div class="n" style="background:rgba(61,220,151,.18);color:var(--ok)">${ic('check')}</div><div class="grow"><b>Episode ${n}</b><div class="xs mute">Take accepted · ${t.kind === 'upload' ? 'uploaded file' : t.kind === 'demo' ? 'demo take' : t.audio ? 'audio' : o.kind === 'story' ? 'one-take' : 'recorded'} · ${fmtT(t.dur)}${t.edits && editSummary(t.edits, 0).length ? ' · edited' : ''}</div></div><span class="pill ok">Ready</span></div>` : n === next ? `<div class="ep" style="border-color:#a05bff"><div class="n">${n}</div><div class="grow"><b>Episode ${n}</b><div class="xs mute">Unlocked · ready to record or upload</div></div><span class="pill vi">Unlocked</span></div>` : `<div class="lock">${ic('lock')}<div><b>Episode ${n}</b><div class="xs">Unlocks after Episode ${n - 1} is recorded or uploaded, accepted and processed.</div></div></div>`; }).join('<div style="height:9px"></div>')}
  <div style="height:16px"></div>${next ? `<button class="btn pri" data-go="#/create/record/${pid}/${next}">${ic('camera')} Record or upload Episode ${next}</button>` : ''}${o.accepted ? `<button class="btn ${next ? '' : 'pri'}" style="margin-top:10px" data-go="#/create/publish/${pid}">${pub ? 'Update publication' : 'Review & Publish'} ${ic('chevR')}</button>` : ''}`, { nav: 'create' });
}

/* ---------- Recorder (step 4) ---------- */
let R = { stream: null, rec: null, chunks: [], facing: 'user', timer: true, state: 'idle', t0: 0, pg: 0, accepted: false, iv: null, blob: null, url: null, mime: '', fx: 'none', ac: null };
const pickMime = audio => (audio ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'] : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']).find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
const stopStream = () => { R.stream?.getTracks().forEach(t => t.stop()); R.stream = null; try { R.ac?.close(); } catch { } R.ac = null; clearInterval(R.mv); };
const probe = (url, audio) => new Promise(res => { const m = document.createElement(audio ? 'audio' : 'video'); m.preload = 'metadata'; m.onloadedmetadata = () => { if (m.duration === Infinity) { m.currentTime = 1e101; m.ontimeupdate = () => { m.ontimeupdate = null; res(m.duration); }; } else res(m.duration); }; m.onerror = () => res(0); m.src = url; });
const mediaOf = o => ({ kind: o.kind || 'story' });

function recordView(pid, ep) {
  const o = Server.overview(pid); if (!o) return go('#/create');
  const kind = o.kind, free = kind !== 'story', audio = kind === 'podcast';
  if (R.pid !== pid || R.ep !== ep) { stopStream(); clearInterval(R.iv); Object.assign(R, { pid, ep, state: 'idle', pg: 0, fx: 'none', accepted: !!o.takes[ep] && o.takes[ep].state === 'ready' }); }
  const r = Server.getScript(pid, ep);
  if (!r.ok) return shell(`${topBar()}${stepper(3, kind)}<div class="lock">${ic('lock')}<div><b>Episode ${ep} is locked</b><div class="xs">${esc(r.error)}</div></div></div><button class="btn" style="margin-top:14px" data-go="#/create/story/${pid}">Back to production</button>`, { nav: 'create' });
  const sc = r.script, pages = []; for (let i = 0; i < sc.lines.length; i += 3) pages.push(sc.lines.slice(i, i + 3)); const pg = Math.min(R.pg, Math.max(0, pages.length - 1));
  const limit = Server.uploadLimit(S.user); const manual = !sc.lines.length; const planCard = `<b>Episode ${ep} of ${o.total}</b><div class="mute sm" style="margin-top:6px;line-height:1.45">Act it your way. Record up to <b>${limit} s</b> or upload a finished clip.${o.runtimeMin ? `<br>Plan: ${o.runtimeMin} min total.` : ''}</div>`; const st = R.state, live = st === 'recording'; const fxName = FILTERS.find(f => f[0] === R.fx)[1];
  const accept = audio ? 'audio/*,video/*' : 'video/*';
  const title = { story: 'Act – Record Your Scene', vlog: 'Record Your Vlog', podcast: 'Record Your Episode' }[kind];
  const sub = { story: 'Follow the script, be yourself, and bring the story to life.', vlog: 'Talk to the camera. Add filters and trim it after.', podcast: 'Talk it through. Trim and polish it after.' }[kind];
  const idle = st === 'idle';
  const camBody = idle ? `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:20px;background:linear-gradient(180deg,rgba(6,6,26,.55),rgba(6,6,26,.95)),url(${IMG(audio ? 'man' : 'smile')}) center/cover"><div>${ic(audio ? 'mic' : 'camera').replace('class="i', 'style="width:40px;height:40px;color:#b388ff" class="i')}<p class="sm" style="margin:10px 0 14px">${audio ? 'Your microphone' : 'Camera and microphone'} ${audio ? 'is' : 'are'} requested only when you tap below.</p><button class="btn pri" data-act="rCam">${audio ? 'Enable microphone' : 'Enable camera & mic'}</button></div></div>`
    : audio ? `<div style="position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,rgba(124,77,255,.35),#06061a 70%)"><div class="center">${ic('mic').replace('class="i', 'style="width:54px;height:54px;color:#d9b8ff" class="i')}<div class="mic" id="mic">${Array.from({ length: 21 }, () => '<i></i>').join('')}</div><div class="xs mute" style="margin-top:14px">${live ? 'Recording audio…' : 'Mic ready. Say something to test your level.'}</div></div></div>`
      : `<video id="cv" playsinline muted autoplay class="${R.facing === 'environment' ? 'back' : ''}" style="filter:${fxCss(newEdits(0, R.fx))}"></video>`;
  const side = !idle && !audio ? `<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:grid;gap:16px;z-index:3">${[['flip', 'Flip', 'rFlip'], ['wand', R.fx === 'none' ? 'Filters' : fxName, 'rFilters'], ['timer', R.timer ? '3s' : 'Timer', 'rTimer']].map(b => `<button class="center xs" data-act="${b[2]}" ${live && b[2] !== 'rFilters' ? 'disabled style="opacity:.4"' : ''} aria-label="${b[1]}"><span class="iconbtn" style="background:rgba(0,0,0,.45);margin:0 auto 2px;${b[2] === 'rFilters' && R.fx !== 'none' ? 'border-color:#ff3de8' : ''}">${ic(b[0])}</span>${b[1]}</button>`).join('')}</div>` : (!idle ? `<div style="position:absolute;right:10px;top:14px;z-index:3"><button class="center xs" data-act="rTimer" ${live ? 'disabled style="opacity:.4"' : ''}><span class="iconbtn" style="background:rgba(0,0,0,.45);margin:0 auto 2px">${ic('timer')}</span>${R.timer ? '3s' : 'Timer'}</button></div>` : '');
  const tips = { story: ['Be natural', 'Look at the camera or your co-actor', 'One take only. Keep going if you slip', `Up to ${limit} seconds per episode`], vlog: ['Good light on your face', 'Hold the phone at eye level', 'Open with a hook', 'Trim the ends after'], podcast: ['Use headphones', 'Find a quiet room', 'Speak close to the mic', 'Trim silences after'] }[kind];
  shell(`${topBar()}<h1 style="font-size:25px" class="center">${title}</h1><p class="center mute sm" style="margin:4px 0 0">${sub}</p>${stepper(3, kind)}
  <div class="card row" style="margin-bottom:10px;padding:10px"><div class="poster" style="width:62px;height:62px;border-radius:10px"><img src="${IMG(gimg(o.genre))}" alt=""></div><div class="grow"><b>${esc(sc.series)}</b><div class="sm mute">${free ? (audio ? 'Podcast' : 'Vlog') + ' episode' : `Episode ${ep} of ${o.total}`}</div><div class="row" style="margin-top:4px"><span class="pill pk">${o.genre}</span>${free ? '' : `<span class="xs">${ic('loc').replace('class="i', 'style="width:12px;vertical-align:-2px" class="i')} ${esc(sc.loc)}</span>`}</div></div></div>
  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:10px"><div class="teleprompter">${manual && !free ? planCard : free ? `<b>Talking points</b><div style="margin-top:8px;white-space:pre-wrap">${sc.setup ? esc(sc.setup) : '<span class="mute">No script. Just press record and talk.</span>'}</div>` : `<div class="row sp"><b>Your Script – Episode ${ep}</b><span class="row xs" style="gap:4px"><button data-act="rPg" data-v="-1" aria-label="Previous page" ${pg === 0 ? 'disabled style="opacity:.3"' : ''}>${ic('chevL').replace('class="i', 'style="width:14px" class="i')}</button>${pg + 1}/${pages.length}<button data-act="rPg" data-v="1" aria-label="Next page" ${pg >= pages.length - 1 ? 'disabled style="opacity:.3"' : ''}>${ic('chevR').replace('class="i', 'style="width:14px" class="i')}</button></span></div>${pg === 0 ? `<div style="margin-top:8px"><b>Scene ${ep} – ${esc(sc.title)}</b><div class="mute sm" style="font-style:italic;margin:4px 0">${esc(sc.setup)}</div></div>` : ''}${pages[pg].map(l => `<div class="line" style="margin-top:6px"><b>${esc(CHAR_NAMES[l.role])}${l.role === 0 ? ' (you)' : ''}:</b> “${esc(l.text)}”</div>`).join('')}${pg === pages.length - 1 ? `<div class="xs mute" style="margin-top:8px">Acting cue: ${esc(sc.cue)}</div>` : ''}`}</div>
  <div class="teleprompter" style="font-size:12.5px"><b>${ic('sparkle').replace('class="i', 'style="width:15px;vertical-align:-3px;color:#ffd966" class="i')} Tips</b><div style="margin-top:6px;display:grid;gap:6px;color:#e6e4ff">${tips.map(t => `<span>✓ ${t}</span>`).join('')}</div></div></div>
  <div class="cam" style="margin-top:10px">${camBody}${!idle ? `<div class="rec-t ${live ? 'live' : ''}"><i></i><span id="rt">${live ? fmtT((Date.now() - R.t0) / 1000) : '00:00'} / ${fmtT(limit)}</span></div>${side}<div id="cd" style="position:absolute;inset:0;display:none;place-items:center;font-size:110px;font-weight:800;background:rgba(0,0,0,.35);z-index:4"></div><div style="position:absolute;left:0;right:0;bottom:14px;display:grid;place-items:center;gap:8px"><button class="recbtn ${live ? 'live' : ''}" data-act="${live ? 'rStop' : 'rStart'}" aria-label="${live ? 'Stop recording' : 'Start recording'}"><i></i></button><span class="xs"><b style="color:#d9b8ff">${audio ? 'Audio' : 'Video'}</b> · ${kind === 'story' ? `one take · up to ${limit} s` : `up to ${limit} s`}</span></div>` : ''}</div>
  ${!R.accepted ? (idle ? `<div class="upl"><div class="row" style="align-items:flex-start">${ic('upload').replace('class="i', 'style="width:28px;height:28px;color:#c9a8ff;margin-top:2px" class="i')}<div><b style="font-size:16px">Already have an episode recorded?</b><div class="sm mute" style="margin-top:3px">Use the upload button. You can still trim it, add filters and more before you accept it.</div></div></div><label class="btn pri" style="cursor:pointer">${ic('upload')} Upload file<input type="file" accept="${accept}" id="fup" hidden></label><div class="xs mute" style="margin-top:8px">Up to ${limit} s per ${audio ? 'file' : 'video'}. Uploads are labelled as uploads.</div></div><div class="center" style="margin-top:10px"><button class="xs mute" style="text-decoration:underline" data-act="rDemo">Try a demo take</button></div>` : live ? `<button class="btn" style="margin-top:12px" disabled>${ic('upload')} Upload file (stop recording first)</button>` : `<label class="btn" style="margin-top:12px;cursor:pointer">${ic('upload')} Upload a file instead<input type="file" accept="${accept}" id="fup" hidden></label>`) : ''}
  <button class="btn" id="nextBtn" style="margin-top:14px;height:54px" data-act="rNext" ${R.accepted ? '' : 'disabled'}>Next ${ic('chevR')}</button><p class="center mute sm" style="margin:10px 0 0">${R.accepted ? `Episode ${ep} accepted. ${free ? 'Next: publish.' : ep < o.total ? 'The next script is now unlocked.' : 'That’s the final episode!'}` : kind === 'story' ? 'Record your scene or upload a clip to continue. There’s no pause or splicing: stop ends the take.' : 'Record or upload your episode to continue.'}</p>`, { nav: 'create' });
  const v = $('#cv'); if (v && R.stream) { v.srcObject = R.stream; v.play().catch(() => { }); }
  if (audio && R.stream && !R.mv) meter();
  $('#fup')?.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const isA = f.type.startsWith('audio'); const u = URL.createObjectURL(f); const d = await probe(u, isA); URL.revokeObjectURL(u); if (d && d > limit + .5) { e.target.value = ''; return toast(`That ${isA ? 'file' : 'video'} is ${fmtT(d)} long. The limit is ${limit} s. Trim it and upload again.`, 6000); } reviewTake(f, 'upload', Math.round(d || 0), null, isA); });
}
function meter() {
  try {
    const ac = R.ac = new (window.AudioContext || window.webkitAudioContext)(); const an = ac.createAnalyser(); an.fftSize = 64; ac.createMediaStreamSource(R.stream).connect(an); const buf = new Uint8Array(an.frequencyBinCount);
    R.mv = setInterval(() => { const bars = $$('#mic i'); if (!bars.length) return; an.getByteFrequencyData(buf); bars.forEach((b, i) => b.style.height = Math.max(8, buf[Math.floor(i * buf.length / bars.length)] / 255 * 100) + '%'); }, 80);
  } catch { }
}
Object.assign(HC, {
  rPg(el) { R.pg += +el.v; recordView(R.pid, R.ep); },
  async rCam() {
    const audio = Server.overview(R.pid).kind === 'podcast';
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('Recording isn’t supported in this browser. Use Upload file instead.', 4500);
    try { stopStream(); clearInterval(R.mv); R.mv = null; R.stream = await navigator.mediaDevices.getUserMedia(audio ? { audio: { echoCancellation: true, noiseSuppression: true } } : { video: { facingMode: R.facing, width: { ideal: 720 }, height: { ideal: 1280 } }, audio: { echoCancellation: true, noiseSuppression: true } }); R.state = 'ready'; recordView(R.pid, R.ep); }
    catch (e) { R.state = 'idle'; toast(e.name === 'NotAllowedError' ? 'Permission was denied. Allow access in your browser settings, or use Upload file.' : 'No usable camera or microphone was found. Use Upload file instead.', 5500); }
  },
  async rFlip() { R.facing = R.facing === 'user' ? 'environment' : 'user'; await HC.rCam(); },
  rFilters() { filterPicker(R.fx, v => { R.fx = v; recordView(R.pid, R.ep); }); },
  rTimer() { R.timer = !R.timer; recordView(R.pid, R.ep); },
  async rStart() {
    if (R.state === 'recording' || !R.stream) return; const cd = $('#cd'); const audio = Server.overview(R.pid).kind === 'podcast';
    if (R.timer) { cd.style.display = 'grid'; for (let i = 3; i > 0; i--) { cd.textContent = i; await new Promise(r => setTimeout(r, 800)); if (!$('#cd')) return; } cd.style.display = 'none'; }
    R.chunks = []; R.mime = pickMime(audio); try { R.rec = new MediaRecorder(R.stream, R.mime ? { mimeType: R.mime } : undefined); } catch { return toast('This device can’t record in a supported format. Use Upload file.', 5000); }
    R.rec.ondataavailable = e => e.data.size && R.chunks.push(e.data);
    R.rec.onstop = () => { const dur = Math.max(1, Math.round((Date.now() - R.t0) / 1000)); clearInterval(R.iv); stopStream(); R.state = 'idle'; const blob = new Blob(R.chunks, { type: R.mime || (audio ? 'audio/webm' : 'video/webm') }); recordView(R.pid, R.ep); if (!blob.size) return toast('Nothing was recorded. Try again.'); reviewTake(blob, 'camera', dur, null, audio); };
    R.rec.start(1000); R.t0 = Date.now(); R.state = 'recording'; const keep = R.mv; recordView(R.pid, R.ep); if (audio && R.stream && !R.mv) meter();
    const lim = Server.uploadLimit(S.user); R.iv = setInterval(() => { const el = (Date.now() - R.t0) / 1000; const t = $('#rt'); if (t) t.textContent = `${fmtT(Math.min(el, lim))} / ${fmtT(lim)}`; if (el >= lim) { toast(`Reached the ${lim} s limit. Your take was stopped.`, 4000); HC.rStop(); } }, 250);
    R.stream.getTracks().forEach(t => t.onended = () => R.state === 'recording' && HC.rStop());
  },
  rStop() { if (R.rec && R.rec.state !== 'inactive') R.rec.stop(); },
  rDemo() { reviewTake(null, 'demo', Math.min(32, Server.uploadLimit(S.user)), null, Server.overview(R.pid).kind === 'podcast'); },
  rNext() { const o = Server.overview(R.pid); go(o.kind === 'story' ? '#/create/story/' + R.pid : '#/create/publish/' + R.pid); },
  reshoot() { closeSheet(); if (R.url) URL.revokeObjectURL(R.url); R.url = null; R.blob = null; R.state = 'idle'; recordView(R.pid, R.ep); },
  rEdit() { const p = R.pending; closeSheet(); openEditor(p, E => reviewTake(R.blob, p.kind, p.dur, E, p.audio, true)); },
  async acceptTake() {
    const info = R.pending; const E = info.edits; const box = $('#up'); $('#acc').disabled = true; $('#rsh').disabled = true; $('#edb').disabled = true;
    const full = info.dur || 0; info.dur = Math.max(1, Math.round((((E.end || full) - E.start) || full) / (E.speed || 1)));
    const o = await Server.acceptTake(R.pid, R.ep, info, (s, p) => { box.innerHTML = s === 'uploading' ? `<div class="row sm">${ic('upload')} Uploading… ${p}%</div><div class="bar" style="margin-top:8px"><i style="width:${p}%"></i></div>` : s === 'processing' ? `<div class="row sm"><div class="spin"></div> Processing${editSummary(E, full).length ? ' and applying your edits' : ''}…</div>` : `<div class="row sm" style="color:var(--ok)">${ic('check')} Ready</div>`; });
    if (R.blob) { Blobs.set(`${R.pid}:${R.ep}`, URL.createObjectURL(R.blob)); } R.accepted = true; closeSheet();
    const free = o.kind !== 'story';
    notify(`Episode ${R.ep} accepted${!free && R.ep < o.total ? `. Episode ${R.ep + 1} is unlocked.` : '.'}`);
    toast(!free && R.ep < o.total ? `Episode ${R.ep} accepted. <b>Episode ${R.ep + 1} unlocked.</b>` : 'Episode accepted!'); recordView(R.pid, R.ep);
  },
});

/* Filter picker: bottom sheet with a staged choice and a Done button */
function filterPicker(cur, onDone) {
  let sel = cur;
  const tiles = () => FILTERS.map(f => `<button type="button" class="ft" aria-pressed="${f[0] === sel}" data-v="${f[0]}"><img src="${IMG('smile')}" alt="" style="filter:${f[2] || 'none'}">${f[1]}</button>`).join('');
  const o = sheet(`<h2 class="ddh">Filters</h2><div class="fgrid">${tiles()}</div><button type="button" class="btn pri" id="fDone" style="margin-top:18px">Done</button>`);
  $('.fgrid', o).addEventListener('click', e => { const b = e.target.closest('.ft'); if (!b) return; sel = b.dataset.v; $$('.ft', o).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === sel)); });
  $('#fDone', o).onclick = () => { closeSheet(); onDone(sel); };
}

/* Review sheet, with edit, reshoot and accept */
function reviewTake(blob, kind, dur, edits, audio, reuse) {
  if (!reuse) { if (R.url) URL.revokeObjectURL(R.url); R.url = blob ? URL.createObjectURL(blob) : null; }
  R.blob = blob; const E = edits || newEdits(dur || 0, R.fx); if (!E.end) E.end = dur || 0; R.pending = { kind, dur: dur || 0, audio: !!audio, edits: E };
  const sum = editSummary(E, dur); const fin = Math.max(1, Math.round((((E.end || dur) - E.start) || dur) / (E.speed || 1)));
  const media = R.url ? (audio ? `<img src="${IMG('man')}" alt="" style="width:100%;height:100%;object-fit:cover"><audio id="rv" src="${R.url}" controls style="position:absolute;left:8px;right:8px;bottom:8px;width:calc(100% - 16px)"></audio>` : `<video id="rv" src="${R.url}" controls playsinline style="transform:none;filter:${fxCss(E)}"></video>`) : `<img src="${IMG(audio ? 'man' : 'smile')}" alt="" style="width:100%;height:100%;object-fit:cover;filter:${fxCss(E)}">`;
  sheet(`<h2 class="ddh">Review your take</h2><div class="sm mute" style="margin:0 0 12px">${kind === 'upload' ? 'Uploaded file, labelled as an upload.' : kind === 'demo' ? 'Demo take: simulated for testing, with no media recorded.' : (audio ? 'Audio recording' : 'One continuous take')}${dur ? ` · ${fmtT(fin)}` : ''}</div>
  <div class="cam" style="aspect-ratio:3/4;max-height:300px;margin:0 auto">${media}${E.caption ? `<div class="capov ${E.pos}">${esc(E.caption)}</div>` : ''}</div>
  ${sum.length ? `<div class="row wrap" style="margin-top:10px;gap:6px">${sum.map(t => `<span class="pill vi">${esc(t)}</span>`).join('')}</div>` : ''}
  <div id="up" style="margin:12px 0 0"></div><button class="btn" id="edb" style="margin-top:12px" data-act="rEdit">${ic('edit')} Edit: trim, filters & more</button><div class="row" style="margin-top:10px"><button class="btn" id="rsh" data-act="reshoot">${kind === 'upload' ? 'Choose another' : 'Reshoot'}</button><button class="btn pri" id="acc" data-act="acceptTake">${ic('check')} Accept</button></div><div class="xs mute" style="margin-top:8px">Edits are saved with your take and applied on playback. Accepting uploads it. ${R.pending && kind !== 'upload' ? '' : ''}</div>`);
  const rv = $('#rv'); if (rv) { rv.playbackRate = E.speed || 1; rv.volume = Math.min(1, E.vol / 100); rv.addEventListener('loadedmetadata', () => { if (E.start) rv.currentTime = E.start; }); rv.addEventListener('timeupdate', () => { if (E.end && rv.currentTime >= E.end) { rv.currentTime = E.start; } }); }
}

/* Editor: non-destructive trim, filters, adjustments, caption and audio. Trim keeps one continuous clip. */
function openEditor(p, done) {
  const E = JSON.parse(JSON.stringify(p.edits)); const audio = p.audio; const total = p.dur || 0;
  let tab = 'trim'; const hasMedia = !!R.url;
  const o = document.createElement('div'); o.className = 'player editor';
  const mediaHtml = hasMedia ? (audio ? `<img src="${IMG('man')}" alt=""><audio id="em" src="${R.url}"></audio>` : `<video id="em" src="${R.url}" playsinline style="transform:none"></video>`) : `<img id="em" src="${IMG(audio ? 'man' : 'smile')}" alt="">`;
  o.innerHTML = `<div class="ui"><div class="row sp"><button class="btn sm" id="eCancel">Cancel</button><b>Edit</b><button class="btn sm pri" id="eDone">Done</button></div>
  <div class="stage">${mediaHtml}<div class="capov bottom" id="ecap" style="display:none"></div></div>
  ${hasMedia ? `<div class="row" style="gap:10px"><button class="iconbtn" id="ePlay" aria-label="Play">${icf('play')}</button><input type="range" id="eSeek" min="0" max="${total || 1}" step="0.05" value="${E.start}" style="flex:1;accent-color:#a05bff" aria-label="Seek"><span class="xs mute" id="eTime" style="min-width:76px;text-align:right">00:00 / ${fmtT(total)}</span></div>` : '<div class="xs mute center">Demo take has no media. Your edits are still saved.</div>'}
  <div class="etabs">${[['trim', 'Trim'], ['filters', 'Filters'], ['adjust', 'Adjust'], ['text', 'Text'], ['audio', 'Audio']].filter(t => !(audio && ['filters', 'adjust'].includes(t[0]))).map(t => `<button class="chip" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div class="panel" id="epanel"></div></div>`;
  app.append(o); const m = $('#em', o); const cap = $('#ecap', o);
  const rng = () => ({ lo: E.start, hi: E.end || total });
  function fx() { if (m && m.tagName !== 'AUDIO') m.style.filter = fxCss(E); if (m && hasMedia) { m.playbackRate = E.speed; m.volume = Math.min(1, E.vol / 100); } cap.style.display = E.caption ? 'block' : 'none'; cap.textContent = E.caption; cap.className = 'capov ' + E.pos; }
  if (hasMedia) {
    m.addEventListener('loadedmetadata', () => { if (m.duration === Infinity) { m.currentTime = 1e101; m.addEventListener('timeupdate', function f() { m.removeEventListener('timeupdate', f); m.currentTime = E.start; }); } else m.currentTime = E.start; });
    m.addEventListener('timeupdate', () => { const { lo, hi } = rng(); if (!m.paused && hi && m.currentTime >= hi) { m.currentTime = lo; } $('#eTime', o).textContent = `${fmtT(m.currentTime)} / ${fmtT(total)}`; $('#eSeek', o).value = m.currentTime; });
    $('#eSeek', o).oninput = e => { m.currentTime = +e.target.value; };
    $('#ePlay', o).onclick = () => { const { lo, hi } = rng(); if (m.paused) { if (m.currentTime < lo || (hi && m.currentTime >= hi)) m.currentTime = lo; m.play(); } else m.pause(); };
    m.addEventListener('play', () => $('#ePlay', o).innerHTML = ic('pause')); m.addEventListener('pause', () => $('#ePlay', o).innerHTML = icf('play'));
  }
  const sl = (k, label, min, max, unit = '%', step = 1) => `<label>${label}<span id="v-${k}">${E[k]}${unit}</span></label><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${E[k]}" aria-label="${label}">`;
  function panel() {
    $$('.etabs .chip', o).forEach(c => c.classList.toggle('on', c.dataset.t === tab)); const P = $('#epanel', o);
    if (tab === 'trim') { const hi = E.end || total; P.innerHTML = `<div class="xs mute">Keep one continuous clip. Drag the ends in. No cutting or stitching.</div><label>Start<span id="v-s0">${fmtT(E.start)}</span></label><input type="range" id="tStart" min="0" max="${Math.max(0, total - 0.5)}" step="0.1" value="${E.start}" ${total ? '' : 'disabled'} aria-label="Trim start"><label>End<span id="v-s1">${fmtT(hi)}</span></label><input type="range" id="tEnd" min="0.5" max="${total || 1}" step="0.1" value="${hi}" ${total ? '' : 'disabled'} aria-label="Trim end"><div class="row sp" style="margin-top:6px"><span class="sm">Final length <b id="v-len">${fmtT(Math.max(0, (hi - E.start) / E.speed))}</b></span><button class="btn sm" id="tReset" style="height:32px">Reset</button></div>`;
      const upd = () => { const hi2 = E.end || total; $('#v-s0', P).textContent = fmtT(E.start); $('#v-s1', P).textContent = fmtT(hi2); $('#v-len', P).textContent = fmtT(Math.max(0, (hi2 - E.start) / E.speed)); };
      $('#tStart', P).oninput = e => { E.start = Math.min(+e.target.value, (E.end || total) - 0.5); if (m && hasMedia) m.currentTime = E.start; upd(); };
      $('#tEnd', P).oninput = e => { E.end = Math.max(+e.target.value, E.start + 0.5); if (m && hasMedia) m.currentTime = Math.max(E.start, E.end - 0.5); upd(); };
      $('#tReset', P).onclick = () => { E.start = 0; E.end = total; panel(); };
    } else if (tab === 'filters') { P.innerHTML = `<div class="hs" style="margin:0 -4px;padding:0 4px;gap:6px">${FILTERS.map(f => `<button type="button" class="ft" aria-pressed="${f[0] === E.filter}" data-v="${f[0]}"><img src="${IMG('smile')}" alt="" style="filter:${f[2] || 'none'}">${f[1]}</button>`).join('')}</div>`; P.querySelector('.hs').onclick = e => { const b = e.target.closest('.ft'); if (!b) return; E.filter = b.dataset.v; $$('.ft', P).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === E.filter)); fx(); }; }
    else if (tab === 'adjust') { P.innerHTML = `${sl('b', 'Brightness', 50, 150)}${sl('c', 'Contrast', 50, 150)}${sl('s', 'Saturation', 0, 200)}<div class="row" style="margin-top:10px;gap:6px">${[0.5, 0.75, 1, 1.25, 1.5, 2].map(v => `<button class="chip" style="height:32px;flex:1;justify-content:center;padding:0" data-sp="${v}" aria-pressed="${E.speed === v}">${v}×</button>`).join('')}</div>`; $$('[data-sp]', P).forEach(b => { b.classList.toggle('on', +b.dataset.sp === E.speed); b.onclick = () => { E.speed = +b.dataset.sp; fx(); panel(); }; }); }
    else if (tab === 'text') { P.innerHTML = `<label style="margin-top:0">Caption on video<span>${E.caption.length}/80</span></label><label class="field" style="height:46px;margin:6px 0 10px"><input id="eCap" maxlength="80" value="${esc(E.caption)}" placeholder="Add a caption or title" aria-label="Caption"></label><div class="row" style="gap:6px">${[['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']].map(x => `<button class="chip ${E.pos === x[0] ? 'on' : ''}" style="flex:1;justify-content:center" data-pos="${x[0]}">${x[1]}</button>`).join('')}</div>`; $('#eCap', P).oninput = e => { E.caption = e.target.value; P.querySelector('label span').textContent = E.caption.length + '/80'; fx(); }; $$('[data-pos]', P).forEach(b => b.onclick = () => { E.pos = b.dataset.pos; fx(); panel(); }); }
    else { P.innerHTML = `${sl('vol', 'Volume', 0, 100)}<div class="row" style="margin-top:10px"><button class="btn sm" id="mute">${E.vol ? 'Mute' : 'Unmute'}</button></div>`; $('#mute', P).onclick = () => { E.vol = E.vol ? 0 : 100; fx(); panel(); }; }
    $$('input[data-k]', P).forEach(i => i.oninput = () => { E[i.dataset.k] = +i.value; $('#v-' + i.dataset.k, P).textContent = i.value + '%'; fx(); });
  }
  $$('.etabs .chip', o).forEach(c => c.onclick = () => { tab = c.dataset.t; panel(); });
  $('#eCancel', o).onclick = () => { m?.pause?.(); o.remove(); reviewTake(R.blob, p.kind, p.dur, p.edits, p.audio, true); };
  $('#eDone', o).onclick = () => { m?.pause?.(); o.remove(); done(E); };
  fx(); panel();
}

/* ---------- Publish (step 5) ---------- */
let PF = {};
function publishView(pid) {
  const o = Server.overview(pid); if (!o || !o.accepted) return go('#/create/story/' + pid);
  const ex = S.published.find(p => p.prodId === pid);
  if (PF.pid !== pid) PF = { pid, title: ex?.title || o.title, caption: ex?.caption || (o.kind === 'story' ? o.premise : (o.premise || '').slice(0, 200)), vis: ex?.vis || 'public', city: o.meta.city || 'Manila', thumb: ex?.thumb || '', rights: false, mature: ['Horror', 'Thriller'].includes(o.genre), consent: o.roles.map(() => false) };
  const ok = PF.rights && PF.consent.every(Boolean) && PF.title.trim();
  const chk = (on, act, v, label, sub = '', dis = false) => `<div class="chk ${on ? 'on' : ''}" ${dis ? '' : `data-act="${act}" data-v="${v}" role="checkbox" aria-checked="${on}" tabindex="0" style="cursor:pointer"`}><div class="bx">${on ? ic('check').replace('class="i', 'style="width:14px" class="i') : ''}</div><div><div>${label}</div>${sub ? `<div class="xs mute">${sub}</div>` : ''}</div></div>`;
  shell(`${topBar()}<h1 style="font-size:27px">Publish</h1>${stepper(4, o.kind)}
  <div class="card row"><div class="poster" style="width:70px;height:70px;border-radius:12px"><img src="${IMG(PF.thumb || gimg(o.genre))}" alt=""></div><div class="grow"><b>${esc(o.title)}</b><div class="xs mute">${o.accepted} of ${o.total} episodes ready · ${o.genre}</div></div></div>
  <div style="height:14px"></div><label class="field" style="margin-bottom:10px"><input id="pt" maxlength="60" value="${esc(PF.title)}" placeholder="Title" aria-label="Title"></label><textarea id="pc" maxlength="200" placeholder="Caption" aria-label="Caption">${esc(PF.caption)}</textarea>
  <h3 style="margin:18px 0 8px">Thumbnail</h3><div class="row" style="gap:14px;align-items:center"><div class="poster" style="width:84px;height:112px;border-radius:12px;flex:none"><img src="${IMG(PF.thumb || gimg(o.genre))}" alt="Thumbnail preview"></div><div class="grow" style="display:grid;gap:8px"><label class="btn" style="cursor:pointer;height:44px">${ic('image')} Upload image<input type="file" accept="image/*" id="thUp" hidden></label><button class="btn" style="height:44px" data-act="thFrame">${ic('film')} Choose a frame</button>${PF.thumb ? '<button class="link mute" data-act="thClear">Use default</button>' : ''}</div></div>
  <div class="row" style="gap:8px;margin-top:10px"><div style="flex:1">${dd('p-city', { label: 'Production city', title: 'Production city', options: CITIES, value: PF.city, onChange: v => { PF.city = v; } })}</div></div>
  <h3 style="margin:18px 0 8px">Visibility</h3><div class="row" style="gap:8px">${[['public', 'Public'], ['unlisted', 'Unlisted'], ['draft', 'Save draft']].map(v => `<button class="chip ${PF.vis === v[0] ? 'on' : ''}" style="flex:1;justify-content:center" data-act="pVis" data-v="${v[0]}">${v[1]}</button>`).join('')}</div><div class="xs mute" style="margin-top:6px">${PF.vis === 'unlisted' ? 'Unlisted: anyone with the link can watch. It won’t appear in feeds or rankings.' : PF.vis === 'draft' ? 'Draft: only you and your cast can see it.' : 'Public episodes appear in feeds and eligible leaderboards after review.'}</div>
  <h3 style="margin:18px 0 0">Disclosures & consent</h3>${o.kind === 'story' ? '' : ''}${chk(PF.mature, 'pTog', 'mature', 'Contains frightening or mature themes')}
  ${o.roles.map((r, i) => chk(PF.consent[i], 'pCons', i, `<b>${esc(r.actor)}</b> approves public release of this ${o.kind === 'story' ? 'performance' : o.kind === 'podcast' ? 'episode' : 'video'}`, i === 0 ? 'You (owner)' : 'Demo: your friend confirms on this device. Consent is stored with the media revision.')).join('')}${chk(PF.rights, 'pTog', 'rights', 'I have the rights to everything in this video', 'No copyrighted music, logos or third-party footage.')}
  <button class="btn pri" style="margin-top:18px" id="sub" data-act="pSubmit" ${ok ? '' : 'disabled'}>${PF.vis === 'draft' ? 'Save draft' : 'Submit for review'} ${ic('chevR')}</button><p class="center mute sm" style="margin:10px 0 0">${ok ? 'Publishing happens only after moderation, consent and processing checks pass.' : 'Every actor’s approval and the rights affirmation are required.'}</p>`, { nav: 'create' });
  const upd = () => { const ok = PF.rights && PF.consent.every(Boolean) && PF.title.trim(); $('#sub').disabled = !ok; };
  $('#thUp').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { PF.thumb = await imgToData(f, 480, 640); publishView(PF.pid); } catch { toast('Could not read that image. Try a JPG or PNG.'); } };
  $('#pt').oninput = e => { PF.title = e.target.value; upd(); }; $('#pc').oninput = e => PF.caption = e.target.value;
}
Object.assign(HC, {
  thClear() { PF.thumb = ''; publishView(PF.pid); },
  thFrame() {
    const o = Server.overview(PF.pid); const eps = Array.from({ length: o.total }, (_, i) => i + 1).filter(n => Blobs.get(`${PF.pid}:${n}`));
    if (!eps.length) return toast('Choosing a frame needs a recorded or uploaded video. Demo takes have no frames, so upload an image instead.', 5500);
    let ep = eps[0];
    const sh = sheet(`<h2 class="ddh">Choose a frame</h2>${eps.length > 1 ? `<div class="chips" id="thEps" style="margin-bottom:8px">${eps.map(n => `<button class="chip ${n === ep ? 'on' : ''}" data-ep="${n}">Episode ${n}</button>`).join('')}</div>` : ''}<video id="thv" muted playsinline preload="auto" style="width:100%;max-height:300px;background:#000;border-radius:14px;object-fit:contain"></video><input type="range" id="thr" min="0" max="1" step="0.05" value="0" style="width:100%;margin-top:12px;accent-color:#a05bff" aria-label="Pick a moment"><div class="xs mute" id="tht" style="text-align:right">00:00</div><button class="btn pri" id="thUse" style="margin-top:12px">Use this frame</button>`);
    const v = $('#thv', sh), r = $('#thr', sh); const load = () => { v.src = Blobs.get(`${PF.pid}:${ep}`); };
    v.onloadedmetadata = () => { if (v.duration === Infinity) { v.currentTime = 1e101; v.ontimeupdate = () => { v.ontimeupdate = null; r.max = v.duration || o.takes[ep]?.dur || 1; v.currentTime = 0; }; } else r.max = v.duration || 1; };
    r.oninput = () => { v.currentTime = +r.value; $('#tht', sh).textContent = fmtT(+r.value); };
    $('#thEps', sh)?.addEventListener('click', e => { const b = e.target.closest('[data-ep]'); if (!b) return; ep = +b.dataset.ep; $$('#thEps .chip', sh).forEach(x => x.classList.toggle('on', x === b)); r.value = 0; load(); });
    $('#thUse', sh).onclick = () => { try { const c = document.createElement('canvas'); c.width = 480; c.height = 640; const x = c.getContext('2d'); const w = v.videoWidth || 480, h = v.videoHeight || 640, k = Math.max(480 / w, 640 / h), sw = 480 / k, shh = 640 / k; x.drawImage(v, (w - sw) / 2, (h - shh) / 2, sw, shh, 0, 0, 480, 640); PF.thumb = c.toDataURL('image/jpeg', .85); closeSheet(); publishView(PF.pid); } catch { toast('Could not capture that frame. Try another moment.'); } };
    load();
  },
  pVis(el) { PF.vis = el.v; publishView(PF.pid); }, pTog(el) { PF[el.v] = !PF[el.v]; publishView(PF.pid); }, pCons(el) { PF.consent[+el.v] = !PF.consent[+el.v]; publishView(PF.pid); },
  pSubmit() {
    const o = Server.overview(PF.pid); const ex = S.published.find(p => p.prodId === PF.pid);
    const rec = { id: ex?.id || 'pb' + Date.now().toString(36), prodId: PF.pid, title: PF.title.trim(), caption: PF.caption.trim(), genre: o.genre, city: PF.city, thumb: PF.thumb || '', eps: o.accepted, vis: PF.vis === 'draft' ? 'draft' : PF.vis, status: PF.vis === 'draft' ? 'draft' : 'review', date: Date.now(), views: ex?.views || 0, likes: ex?.likes || 0, comments: ex?.comments || 0, consent: { v: 1, at: Date.now(), cast: o.roles.map(r => r.actor) } };
    if (ex) Object.assign(ex, rec); else S.published.unshift(rec); save();
    if (rec.status === 'review') notify(`“${rec.title}” was submitted for moderation.`);
    go('#/create/done/' + PF.pid);
  },
  approve(el) { const p = S.published.find(x => x.prodId === el.v); if (!p) return; p.status = 'published'; p.date = Date.now(); save(); notify(`“${p.title}” passed review and is live.`); toast('Moderator approved (demo). Your story is live!'); go('#/story/u_' + p.id); },
});
function doneView(pid) {
  const p = S.published.find(x => x.prodId === pid); if (!p) return go('#/create');
  const draft = p.status === 'draft', pub = p.status === 'published';
  shell(`<div class="center" style="padding-top:50px">${logo(46, false)}<div style="margin:30px auto 16px;width:84px;height:84px;border-radius:50%;display:grid;place-items:center;background:${pub ? 'rgba(61,220,151,.18)' : 'rgba(255,176,32,.15)'};color:${pub ? 'var(--ok)' : draft ? '#a98bff' : 'var(--warn)'}">${ic(pub ? 'check' : draft ? 'doc' : 'shield').replace('class="i', 'style="width:42px;height:42px" class="i')}</div><h1 style="font-size:26px">${draft ? 'Draft saved' : pub ? 'You’re live!' : 'Submitted for review'}</h1><p class="mute" style="margin:10px 20px 24px;line-height:1.5">${draft ? 'Only you and your cast can see this. Publish when you’re ready.' : pub ? 'Your story is now in Discover and New Releases.' : 'A moderator will check rights, consent and media before it goes live. If anything is rejected, you’ll get the reason and a way to appeal.'}</p></div>
  ${!draft && !pub ? `<button class="btn pri" data-act="approve" data-v="${pid}">Simulate moderator approval (demo)</button><div style="height:10px"></div>` : ''}<button class="btn ${pub ? 'pri' : ''}" data-go="${pub ? '#/story/u_' + p.id : '#/profile'}">${pub ? 'View my story' : 'Go to my profile'}</button><button class="btn" style="margin-top:10px" data-go="#/create/story/${pid}">Back to production</button>`, { nav: null });
}

router();
