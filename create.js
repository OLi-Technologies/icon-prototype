/* Create wizard: Genre/Cast/Preferences -> Generate -> Story overview -> One-take recorder -> Publish */
const STEPS = ['Genre', 'Cast', 'Story', 'Record', 'Publish'];
const stepper = (n, kind = 'story') => { const labs = kind === 'story' ? STEPS : ['Plan', 'Record', 'Publish']; if (kind !== 'story') n = n === 4 ? 2 : n === 5 ? 3 : 1; return `<div class="steps" role="list" aria-label="Progress">${labs.map((s, i) => `${i ? '<div class="ln"></div>' : ''}<div class="s ${i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}" role="listitem" aria-current="${i + 1 === n ? 'step' : 'false'}"><b>${i + 1 < n ? ic('check').replace('class="i', 'style="width:16px" class="i') : i + 1}</b>${s}</div>`).join('')}</div>`; };
const SET = ['Modern Day', 'School / Campus', 'Small Town', 'Historical', 'Futuristic'];
const LANG = ['English', 'Filipino', 'Taglish'];
let C = { genre: 'Romance', mode: 'solo', actors: 2, friends: [], episodes: 1, lang: 'Taglish', setting: 'Modern Day', city: 'Manila', theme: '', op: null, touched: false, gen: false, kind: 'story', ftitle: '', fnotes: '' };
try { Object.assign(C, JSON.parse(sessionStorage.getItem('icon.draft') || '{}'), { gen: false }); } catch { }
const saveDraft = () => { try { sessionStorage.setItem('icon.draft', JSON.stringify(C)); } catch { } };
const topBar = (back = true) => `<div class="top">${back ? `<button class="iconbtn" style="border:0;background:none" data-act="back" aria-label="Back">${ic('chevL')}</button>` : ''}<div class="grow center">${logo(34, false)}</div><button class="pro" data-go="#/plans">${ic('crown').replace('class="i', 'style="width:17px" class="i')} ${TIERS[S.user.tier].name === 'Free' ? 'Upgrade' : TIERS[S.user.tier].name}</button><img class="avatar" src="${IMG('avatar')}" alt="" data-go="#/profile"></div>`;
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
  if (C.kind !== 'story') return freeSetup();
  const T = TIERS[S.user.tier], rem = Server.remaining(S.user.id, S.user.tier);
  const need = C.mode === 'friends' ? C.actors - 1 : 0; const accepted = C.friends.filter(f => f.ok).length; const blocked = C.mode === 'friends' && accepted < need;
  const step = C.touched ? 2 : 1;
  const gcell = ([g, i]) => `<button class="sel genre ${C.genre === g ? 'on' : ''}" data-act="cGenre" data-v="${g}" aria-pressed="${C.genre === g}"><span style="color:${C.genre === g ? '#ff3db8' : '#b9b8da'}">${ic(i)}</span>${g}</button>`;
  shell(`${topBar(false)}<h1 style="font-size:36px">Create<br><span class="gt">Your Own Story</span></h1><p style="margin:8px 0 0;color:#e6e4ff">Choose a genre. Get your script. Start acting today!</p>${kindTabs()}${stepper(step)}
  <div class="card" style="padding:12px;margin-bottom:16px"><div class="row sp sm"><span><b>${T.name}</b> · ${rem === Infinity ? 'fair-use unlimited stories' : `${rem} of ${T.stories} stories left`}</span><span class="xs mute">${rem === Infinity ? '' : 'Resets ' + Server.resetDate()}</span></div>${rem === Infinity ? '' : `<div class="bar" style="margin-top:8px"><i style="width:${(T.stories - rem) / T.stories * 100}%"></i></div>`}<div class="xs mute" style="margin-top:6px">Up to ${T.eps} episode${T.eps > 1 ? 's' : ''} · up to ${T.actors} actors per story</div></div>
  <div class="row sp"><h2>1. Choose a Genre</h2><button class="chip" style="height:32px;border-color:#6a3dff;font-size:12.5px" data-act="cSurprise">${ic('sparkle').replace('class="i', 'style="width:15px" class="i')} Not sure? Surprise Me!</button></div>
  <div class="grid4" style="margin-top:12px">${GENRES.map(gcell).join('')}</div>
  <h2 style="margin:22px 0 12px">2. Choose Your Cast</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">${[['solo', 'user', 'Solo', 'Just you'], ['friends', 'users', 'With Friends', 'Invite people you know'], ['match', 'search', 'Find Co-Stars', 'Meet new actors']].map(m => `<button class="sel ${C.mode === m[0] ? 'on' : ''}" style="padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;min-height:104px" data-act="cMode" data-v="${m[0]}" aria-pressed="${C.mode === m[0]}"><span style="color:${C.mode === m[0] ? '#d9b8ff' : '#b9b8da'}">${ic(m[1]).replace('class="i', 'style="width:30px;height:30px" class="i')}</span><b class="sm">${m[2]}</b><span class="xs mute">${m[3]}</span></button>`).join('')}</div>
  ${C.mode === 'friends' ? `<div class="card" style="margin-top:12px"><div class="row sp"><b>Actors in this story</b><div class="row"><button class="iconbtn" style="width:34px;height:34px" data-act="cActors" data-v="-1" aria-label="Fewer actors">−</button><b>${C.actors}</b><button class="iconbtn" style="width:34px;height:34px" data-act="cActors" data-v="1" aria-label="More actors">+</button></div></div><div class="xs mute" style="margin:4px 0 10px">${T.name} allows up to ${T.actors}. Friends join free: only you spend story allowance. Everyone films together on one phone, in one take.</div>
   <div class="chk on" style="padding:8px 0"><div class="bx">${ic('check').replace('class="i', 'style="width:14px" class="i')}</div><div class="grow"><b>${esc(S.user.name)}</b> <span class="pill">Owner</span></div></div>
   ${Array.from({ length: need }, (_, i) => { const f = C.friends[i] || {}; return `<div class="chk ${f.ok ? 'on' : ''}" style="align-items:center"><div class="bx">${f.ok ? ic('check').replace('class="i', 'style="width:14px" class="i') : ''}</div><div class="grow"><input data-act="noop" data-i="${i}" class="fn" value="${esc(f.name || '')}" placeholder="Friend ${i + 1} name" aria-label="Friend ${i + 1} name" style="background:none;border:0;outline:0;color:#fff;width:100%;font-weight:600"><div class="xs mute">${f.ok ? 'Accepted role' : f.sent ? 'Invite sent · expires in 48 h' : 'Not invited'}</div></div>${f.ok ? '<span class="pill ok">Accepted</span>' : `<button class="btn sm" style="height:34px" data-act="cInvite" data-i="${i}">${f.sent ? 'Resend' : 'Invite'}</button>${f.sent ? `<button class="btn sm" style="height:34px;margin-left:4px" data-act="cAccept" data-i="${i}" title="Demo: simulate your friend accepting">Accept</button>` : ''}`}</div>`; }).join('')}
   ${blocked ? `<div class="xs" style="color:var(--warn);margin-top:8px">Generation unlocks once every invited friend accepts. (Demo: tap Accept to simulate.)</div>` : ''}</div>` : ''}
  <div class="row sp" style="margin:22px 0 12px"><h2>3. Story Preferences <span class="mute sm" style="font-weight:400">(Optional)</span></h2><button class="link mute" data-act="cClear">Clear All</button></div>
  <div class="mute xs" style="margin-bottom:6px">Episodes</div><div class="chips" style="margin-bottom:12px">${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `<button class="chip ${C.episodes === n ? 'on' : ''}" style="min-width:44px;justify-content:center;${n > T.eps ? 'opacity:.55' : ''}" data-act="cEps" data-v="${n}">${n > T.eps ? ic('lock').replace('class="i', 'style="width:13px" class="i') : ''}${n}</button>`).join('')}</div>
  <div class="row" style="gap:8px;align-items:stretch">${[['lang', 'Language', LANG], ['setting', 'Setting', SET], ['city', 'Location', CITIES]].map(d => `<div style="flex:${d[0] === 'setting' ? 1.6 : 1};min-width:0">${dd('c-' + d[0], { label: d[1], title: d[1] === 'Location' ? 'Story location' : d[1], options: d[2], value: C[d[0]], onChange: v => { C[d[0]] = v; saveDraft(); } })}</div>`).join('')}</div>
  <div class="card" style="margin-top:10px;padding:10px 14px"><div class="row" style="align-items:flex-start;gap:12px">${ic('doc').replace('class="i', 'style="margin-top:6px;color:#b9b8da" class="i')}<textarea id="theme" maxlength="200" style="border:0;background:none;padding:4px 0;min-height:60px" placeholder="Any ideas or theme? e.g. second chance, office romance, best friends, time travel…" aria-label="Ideas or theme">${esc(C.theme)}</textarea></div><div class="xs mute" style="text-align:right" id="cnt">${C.theme.length}/200</div></div>
  <button class="btn pri" style="margin-top:18px;height:56px" id="genBtn" data-act="cGenerate" ${blocked ? 'disabled' : ''}>${ic('wand')} Generate My Story ${ic('chevR')}</button>
  <p class="center mute sm" style="margin:10px 0 0">AI will create a unique story just for you. You’ll film it in <b>one continuous take</b> per episode, as long as it needs.</p>`, { nav: 'create' });
  $('#theme').addEventListener('input', e => { C.theme = e.target.value; $('#cnt').textContent = C.theme.length + '/200'; saveDraft(); });
  $$('.fn').forEach(i => i.addEventListener('input', e => { C.friends[+i.dataset.i] = { ...(C.friends[+i.dataset.i] || {}), name: i.value }; saveDraft(); }));
}
const HC = window.HC = {
  noop() { },
  cKind(el) { C.kind = el.v; saveDraft(); setup(); },
  fStart() { const pid = Server.createFree(S.user, { kind: C.kind, title: C.ftitle, notes: C.fnotes.slice(0, 500) }); go('#/create/record/' + pid + '/1'); },
  cGenre(el) { C.genre = el.v; saveDraft(); setup(); }, cSurprise() { C.genre = GENRES[Math.floor(Math.random() * 6)][0]; saveDraft(); setup(); toast(`Surprise! Your genre is <b>${C.genre}</b>.`); },
  cMode(el) {
    if (el.v === 'match') return sheet(`<h2>Random co-stars</h2><p class="mute sm" style="line-height:1.5">Matching strangers needs mutual consent, safety controls and an operator to respond to reports. It’s <b>paused during the supervised beta</b>. You can film solo or invite friends right now.</p><button class="btn pri" data-act="closeSheet">Okay</button>`);
    C.mode = el.v; C.touched = true; if (el.v === 'friends') { C.actors = Math.min(Math.max(C.actors, 2), maxActors()); C.friends = C.friends.slice(0, C.actors - 1); } saveDraft(); setup();
  },
  cActors(el) { C.actors = Math.min(maxActors(), Math.max(2, C.actors + +el.v)); C.friends = C.friends.slice(0, C.actors - 1); if (+el.v > 0 && C.actors === maxActors() && TIERS[S.user.tier].actors < 5) toast(`${TIERS[S.user.tier].name} allows up to ${maxActors()} actors. Pro allows 5.`); saveDraft(); setup(); },
  cInvite(el) { const i = +el.i; C.friends[i] = { ...(C.friends[i] || {}), sent: true, name: $$('.fn')[i]?.value || `Friend ${i + 1}` }; const link = `${location.origin}${location.pathname}#/invite/${Math.random().toString(36).slice(2, 10)}`; navigator.clipboard?.writeText(link).catch(() => { }); toast('Invite link copied. It expires in 48 hours.'); saveDraft(); setup(); },
  cAccept(el) { const i = +el.i; C.friends[i].ok = true; saveDraft(); setup(); },
  cEps(el) { const n = +el.v, T = TIERS[S.user.tier]; if (n > T.eps) return sheet(`<h2>${T.name} allows ${T.eps} episode${T.eps > 1 ? 's' : ''}</h2><p class="mute sm">${T.name === 'Free' ? 'Plus allows up to 3 episodes per story; Pro allows up to 10.' : 'Pro allows up to 10 episodes per story.'}</p><button class="btn pri" data-go="#/plans">See plans</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Not now</button>`); C.episodes = n; saveDraft(); setup(); },
  cClear() { Object.assign(C, { episodes: 1, lang: 'Taglish', setting: 'Modern Day', city: 'Manila', theme: '' }); saveDraft(); setup(); },
  async cGenerate() {
    if (C.gen) return; const u = S.user; C.op = C.op || 'op' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); C.gen = true;
    const cast = [u.name.split(' ')[0], ...(C.mode === 'friends' ? C.friends.slice(0, C.actors - 1).map(f => f.name || 'Friend') : [])];
    const req = { genre: C.genre, cast, episodes: C.episodes, lang: C.lang, setting: C.setting, city: C.city, theme: C.theme.replace(/[<>]/g, '').slice(0, 200) };
    const errs = Server.validate(req, u.tier); if (errs.length) { C.gen = false; return toast(errs[0]); }
    const stages = ['Reserving your story allowance…', 'Planning the full story arc…', 'Writing Episode 1…', 'Checking cast, safety and filming feasibility…']; let si = 0;
    const draw = () => shell(`${topBar(false)}<h1 style="font-size:30px">Writing your story</h1>${stepper(3)}<div class="card" style="padding:20px">${stages.map((s, i) => `<div class="row" style="padding:9px 0;opacity:${i <= si ? 1 : .4}">${i < si ? ic('check').replace('class="i', 'style="color:#3ddc97" class="i') : i === si ? '<div class="spin"></div>' : '<div style="width:20px"></div>'}<span>${s}</span></div>`).join('')}</div><p class="mute sm center" style="margin-top:14px">Your private story bible stays on the server. Only the script for the episode you’re about to film is ever sent to your phone.</p>`, { nav: 'create' });
    draw(); const iv = setInterval(() => { if (si < stages.length - 1) { si++; draw(); } }, 480);
    const res = await Server.generate(u, req, C.op); clearInterval(iv); C.gen = false;
    if (!res.ok) { C.op = null; setup(); return res.quota ? sheet(`<h2>Monthly stories used</h2><p class="mute sm">${esc(res.error)}</p><button class="btn pri" data-go="#/plans">See plans</button>`) : toast(esc(res.error), 5000); }
    C.op = null; saveDraft(); notify(`Your story is ready. Episode 1 is unlocked.`); go('#/create/story/' + res.prodId);
  },
};

/* ---------- Story overview (step 3) ---------- */
function storyView(pid) {
  const o = Server.overview(pid); if (!o) return go('#/create');
  const next = o.accepted < o.total ? o.accepted + 1 : null; const pub = S.published.find(p => p.prodId === pid);
  shell(`${topBar()}<h1 style="font-size:28px">${esc(o.title)}</h1>${stepper(3, o.kind)}
  <div class="card"><span class="pill vi">${o.genre}</span><p style="margin:10px 0 0;line-height:1.5">${esc(o.premise) || '<span class="mute">No talking points.</span>'}</p></div>
  ${o.kind !== 'story' ? '' : secHead('Cast')}${o.kind !== 'story' ? '' : ''}${o.kind !== 'story' ? '' : o.roles.map(r => `<div class="ep"><div class="n">${r.role + 1}</div><div class="grow"><b>${esc(CHAR_NAMES[r.role])}</b><div class="xs mute">Played by ${esc(r.actor)}${r.role === 0 ? ' (you)' : ''}</div></div></div>`).join('')}
  ${secHead('Episodes')}${Array.from({ length: o.total }, (_, i) => i + 1).map(n => { const t = o.takes[n]; return n <= o.accepted ? `<div class="ep"><div class="n" style="background:rgba(61,220,151,.18);color:var(--ok)">${ic('check')}</div><div class="grow"><b>Episode ${n}</b><div class="xs mute">Take accepted · ${t.kind === 'upload' ? 'uploaded file' : t.kind === 'demo' ? 'demo take' : t.audio ? 'audio' : o.kind === 'story' ? 'one-take' : 'recorded'} · ${fmtT(t.dur)}${t.edits && editSummary(t.edits, 0).length ? ' · edited' : ''}</div></div><span class="pill ok">Ready</span></div>` : n === next ? `<div class="ep" style="border-color:#a05bff"><div class="n">${n}</div><div class="grow"><b>Episode ${n}</b><div class="xs mute">Unlocked · script ready to rehearse</div></div><span class="pill vi">Unlocked</span></div>` : `<div class="lock">${ic('lock')}<div><b>Episode ${n}</b><div class="xs">Unlocks after Episode ${n - 1} is recorded, accepted and processed. Details stay private to avoid spoilers.</div></div></div>`; }).join('<div style="height:9px"></div>')}
  <div style="height:16px"></div>${next ? `<button class="btn pri" data-go="#/create/record/${pid}/${next}">${ic('camera')} Rehearse & Record Episode ${next}</button>` : ''}${o.accepted ? `<button class="btn ${next ? '' : 'pri'}" style="margin-top:10px" data-go="#/create/publish/${pid}">${pub ? 'Update publication' : 'Review & Publish'} ${ic('chevR')}</button>` : ''}`, { nav: 'create' });
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
  if (!r.ok) return shell(`${topBar()}${stepper(4, kind)}<div class="lock">${ic('lock')}<div><b>Episode ${ep} is locked</b><div class="xs">${esc(r.error)}</div></div></div><button class="btn" style="margin-top:14px" data-go="#/create/story/${pid}">Back to production</button>`, { nav: 'create' });
  const sc = r.script, pages = []; for (let i = 0; i < sc.lines.length; i += 3) pages.push(sc.lines.slice(i, i + 3)); const pg = Math.min(R.pg, Math.max(0, pages.length - 1));
  const st = R.state, live = st === 'recording'; const fxName = FILTERS.find(f => f[0] === R.fx)[1];
  const accept = audio ? 'audio/*,video/*' : 'video/*';
  const title = { story: 'Act – Record Your Scene', vlog: 'Record Your Vlog', podcast: 'Record Your Episode' }[kind];
  const sub = { story: 'Follow the script, be yourself, and bring the story to life.', vlog: 'Talk to the camera. Add filters and trim it after.', podcast: 'Talk it through. Trim and polish it after.' }[kind];
  const idle = st === 'idle';
  const camBody = idle ? `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:20px;background:linear-gradient(180deg,rgba(6,6,26,.55),rgba(6,6,26,.95)),url(${IMG(audio ? 'man' : 'smile')}) center/cover"><div>${ic(audio ? 'mic' : 'camera').replace('class="i', 'style="width:40px;height:40px;color:#b388ff" class="i')}<p class="sm" style="margin:10px 0 14px">${audio ? 'Your microphone' : 'Camera and microphone'} ${audio ? 'is' : 'are'} requested only when you tap below.</p><button class="btn pri" data-act="rCam">${audio ? 'Enable microphone' : 'Enable camera & mic'}</button></div></div>`
    : audio ? `<div style="position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,rgba(124,77,255,.35),#06061a 70%)"><div class="center">${ic('mic').replace('class="i', 'style="width:54px;height:54px;color:#d9b8ff" class="i')}<div class="mic" id="mic">${Array.from({ length: 21 }, () => '<i></i>').join('')}</div><div class="xs mute" style="margin-top:14px">${live ? 'Recording audio…' : 'Mic ready. Say something to test your level.'}</div></div></div>`
      : `<video id="cv" playsinline muted autoplay class="${R.facing === 'environment' ? 'back' : ''}" style="filter:${fxCss(newEdits(0, R.fx))}"></video>`;
  const side = !idle && !audio ? `<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:grid;gap:16px;z-index:3">${[['flip', 'Flip', 'rFlip'], ['wand', R.fx === 'none' ? 'Filters' : fxName, 'rFilters'], ['timer', R.timer ? '3s' : 'Timer', 'rTimer']].map(b => `<button class="center xs" data-act="${b[2]}" ${live && b[2] !== 'rFilters' ? 'disabled style="opacity:.4"' : ''} aria-label="${b[1]}"><span class="iconbtn" style="background:rgba(0,0,0,.45);margin:0 auto 2px;${b[2] === 'rFilters' && R.fx !== 'none' ? 'border-color:#ff3de8' : ''}">${ic(b[0])}</span>${b[1]}</button>`).join('')}</div>` : (!idle ? `<div style="position:absolute;right:10px;top:14px;z-index:3"><button class="center xs" data-act="rTimer" ${live ? 'disabled style="opacity:.4"' : ''}><span class="iconbtn" style="background:rgba(0,0,0,.45);margin:0 auto 2px">${ic('timer')}</span>${R.timer ? '3s' : 'Timer'}</button></div>` : '');
  const tips = { story: ['Be natural', 'Look at the camera or your co-actor', 'One take only. Keep going if you slip', 'Take as long as the scene needs'], vlog: ['Good light on your face', 'Hold the phone at eye level', 'Open with a hook', 'Trim the ends after'], podcast: ['Use headphones', 'Find a quiet room', 'Speak close to the mic', 'Trim silences after'] }[kind];
  shell(`${topBar()}<h1 style="font-size:25px" class="center">${title}</h1><p class="center mute sm" style="margin:4px 0 0">${sub}</p>${stepper(4, kind)}
  <div class="card row" style="margin-bottom:10px;padding:10px"><div class="poster" style="width:62px;height:62px;border-radius:10px"><img src="${IMG(gimg(o.genre))}" alt=""></div><div class="grow"><b>${esc(sc.series)}</b><div class="sm mute">${free ? (audio ? 'Podcast' : 'Vlog') + ' episode' : `Episode ${ep} of ${o.total}`}</div><div class="row" style="margin-top:4px"><span class="pill pk">${o.genre}</span>${free ? '' : `<span class="xs">${ic('loc').replace('class="i', 'style="width:12px;vertical-align:-2px" class="i')} ${esc(sc.loc)}</span>`}</div></div></div>
  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:10px"><div class="teleprompter">${free ? `<b>Talking points</b><div style="margin-top:8px;white-space:pre-wrap">${sc.setup ? esc(sc.setup) : '<span class="mute">No script. Just press record and talk.</span>'}</div>` : `<div class="row sp"><b>Your Script – Episode ${ep}</b><span class="row xs" style="gap:4px"><button data-act="rPg" data-v="-1" aria-label="Previous page" ${pg === 0 ? 'disabled style="opacity:.3"' : ''}>${ic('chevL').replace('class="i', 'style="width:14px" class="i')}</button>${pg + 1}/${pages.length}<button data-act="rPg" data-v="1" aria-label="Next page" ${pg >= pages.length - 1 ? 'disabled style="opacity:.3"' : ''}>${ic('chevR').replace('class="i', 'style="width:14px" class="i')}</button></span></div>${pg === 0 ? `<div style="margin-top:8px"><b>Scene ${ep} – ${esc(sc.title)}</b><div class="mute sm" style="font-style:italic;margin:4px 0">${esc(sc.setup)}</div></div>` : ''}${pages[pg].map(l => `<div class="line" style="margin-top:6px"><b>${esc(CHAR_NAMES[l.role])}${l.role === 0 ? ' (you)' : ''}:</b> “${esc(l.text)}”</div>`).join('')}${pg === pages.length - 1 ? `<div class="xs mute" style="margin-top:8px">Acting cue: ${esc(sc.cue)}</div>` : ''}`}</div>
  <div class="teleprompter" style="font-size:12.5px"><b>${ic('sparkle').replace('class="i', 'style="width:15px;vertical-align:-3px;color:#ffd966" class="i')} Tips</b><div style="margin-top:6px;display:grid;gap:6px;color:#e6e4ff">${tips.map(t => `<span>✓ ${t}</span>`).join('')}</div></div></div>
  <div class="cam" style="margin-top:10px">${camBody}${!idle ? `<div class="rec-t ${live ? 'live' : ''}"><i></i><span id="rt">${live ? fmtT((Date.now() - R.t0) / 1000) : '00:00'}</span></div>${side}<div id="cd" style="position:absolute;inset:0;display:none;place-items:center;font-size:110px;font-weight:800;background:rgba(0,0,0,.35);z-index:4"></div><div style="position:absolute;left:0;right:0;bottom:14px;display:grid;place-items:center;gap:8px"><button class="recbtn ${live ? 'live' : ''}" data-act="${live ? 'rStop' : 'rStart'}" aria-label="${live ? 'Stop recording' : 'Start recording'}"><i></i></button><span class="xs"><b style="color:#d9b8ff">${audio ? 'Audio' : 'Video'}</b> · ${kind === 'story' ? 'one continuous take' : 'no time limit'}</span></div>` : ''}</div>
  ${idle && !R.accepted ? `<div class="upl"><div class="row" style="align-items:flex-start">${ic('upload').replace('class="i', 'style="width:28px;height:28px;color:#c9a8ff;margin-top:2px" class="i')}<div><b style="font-size:16px">Already have an episode recorded?</b><div class="sm mute" style="margin-top:3px">Use the upload button. You can still trim it, add filters and more before you accept it.</div></div></div><label class="btn pri" style="cursor:pointer">${ic('upload')} Upload file<input type="file" accept="${accept}" id="fup" hidden></label><div class="xs mute" style="margin-top:8px">${kind === 'story' ? 'Uploads are labelled as uploads, since they can’t be verified as a single take.' : 'Uploads are labelled as uploads.'}</div></div><div class="center" style="margin-top:10px"><button class="xs mute" style="text-decoration:underline" data-act="rDemo">Try a demo take</button></div>` : ''}
  <button class="btn" id="nextBtn" style="margin-top:14px;height:54px" data-act="rNext" ${R.accepted ? '' : 'disabled'}>Next ${ic('chevR')}</button><p class="center mute sm" style="margin:10px 0 0">${R.accepted ? `Episode ${ep} accepted. ${free ? 'Next: publish.' : ep < o.total ? 'The next script is now unlocked.' : 'That’s the final episode!'}` : kind === 'story' ? 'Record your scene to continue. There’s no pause or splicing: stop ends the take.' : 'Record or upload your episode to continue.'}</p>`, { nav: 'create' });
  const v = $('#cv'); if (v && R.stream) { v.srcObject = R.stream; v.play().catch(() => { }); }
  if (audio && R.stream && !R.mv) meter();
  $('#fup')?.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const isA = f.type.startsWith('audio'); const u = URL.createObjectURL(f); const d = await probe(u, isA); URL.revokeObjectURL(u); reviewTake(f, 'upload', Math.round(d || 0), null, isA); });
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
    R.iv = setInterval(() => { const t = $('#rt'); if (t) t.textContent = fmtT((Date.now() - R.t0) / 1000); }, 250);
    R.stream.getTracks().forEach(t => t.onended = () => R.state === 'recording' && HC.rStop());
  },
  rStop() { if (R.rec && R.rec.state !== 'inactive') R.rec.stop(); },
  rDemo() { reviewTake(null, 'demo', 32, null, Server.overview(R.pid).kind === 'podcast'); },
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
  if (PF.pid !== pid) PF = { pid, title: ex?.title || o.title, caption: ex?.caption || (o.kind === 'story' ? o.premise : (o.premise || '').slice(0, 200)), vis: ex?.vis || 'public', city: o.meta.city || 'Manila', rights: false, mature: ['Horror', 'Thriller'].includes(o.genre), consent: o.roles.map(() => false) };
  const ok = PF.rights && PF.consent.every(Boolean) && PF.title.trim();
  const chk = (on, act, v, label, sub = '', dis = false) => `<div class="chk ${on ? 'on' : ''}" ${dis ? '' : `data-act="${act}" data-v="${v}" role="checkbox" aria-checked="${on}" tabindex="0" style="cursor:pointer"`}><div class="bx">${on ? ic('check').replace('class="i', 'style="width:14px" class="i') : ''}</div><div><div>${label}</div>${sub ? `<div class="xs mute">${sub}</div>` : ''}</div></div>`;
  shell(`${topBar()}<h1 style="font-size:27px">Publish</h1>${stepper(5, o.kind)}
  <div class="card row"><div class="poster" style="width:70px;height:70px;border-radius:12px"><img src="${IMG(gimg(o.genre))}" alt=""></div><div class="grow"><b>${esc(o.title)}</b><div class="xs mute">${o.accepted} of ${o.total} episodes ready · ${o.genre}</div></div></div>
  <div style="height:14px"></div><label class="field" style="margin-bottom:10px"><input id="pt" maxlength="60" value="${esc(PF.title)}" placeholder="Title" aria-label="Title"></label><textarea id="pc" maxlength="200" placeholder="Caption" aria-label="Caption">${esc(PF.caption)}</textarea>
  <div class="row" style="gap:8px;margin-top:10px"><div style="flex:1">${dd('p-city', { label: 'Production city', title: 'Production city', options: CITIES, value: PF.city, onChange: v => { PF.city = v; } })}</div></div>
  <h3 style="margin:18px 0 8px">Visibility</h3><div class="row" style="gap:8px">${[['public', 'Public'], ['unlisted', 'Unlisted'], ['draft', 'Save draft']].map(v => `<button class="chip ${PF.vis === v[0] ? 'on' : ''}" style="flex:1;justify-content:center" data-act="pVis" data-v="${v[0]}">${v[1]}</button>`).join('')}</div><div class="xs mute" style="margin-top:6px">${PF.vis === 'unlisted' ? 'Unlisted: anyone with the link can watch. It won’t appear in feeds or rankings.' : PF.vis === 'draft' ? 'Draft: only you and your cast can see it.' : 'Public episodes appear in feeds and eligible leaderboards after review.'}</div>
  <h3 style="margin:18px 0 0">Disclosures & consent</h3>${o.kind === 'story' ? chk(true, '', '', 'Contains an AI-written script', 'Always shown to viewers', true) : ''}${chk(PF.mature, 'pTog', 'mature', 'Contains frightening or mature themes')}
  ${o.roles.map((r, i) => chk(PF.consent[i], 'pCons', i, `<b>${esc(r.actor)}</b> approves public release of this ${o.kind === 'story' ? 'performance' : o.kind === 'podcast' ? 'episode' : 'video'}`, i === 0 ? 'You (owner)' : 'Demo: your friend confirms on this device. Consent is stored with the media revision.')).join('')}${chk(PF.rights, 'pTog', 'rights', 'I have the rights to everything in this video', 'No copyrighted music, logos or third-party footage.')}
  <button class="btn pri" style="margin-top:18px" id="sub" data-act="pSubmit" ${ok ? '' : 'disabled'}>${PF.vis === 'draft' ? 'Save draft' : 'Submit for review'} ${ic('chevR')}</button><p class="center mute sm" style="margin:10px 0 0">${ok ? 'Publishing happens only after moderation, consent and processing checks pass.' : 'Every actor’s approval and the rights affirmation are required.'}</p>`, { nav: 'create' });
  const upd = () => { const ok = PF.rights && PF.consent.every(Boolean) && PF.title.trim(); $('#sub').disabled = !ok; };
  $('#pt').oninput = e => { PF.title = e.target.value; upd(); }; $('#pc').oninput = e => PF.caption = e.target.value;
}
Object.assign(HC, {
  pVis(el) { PF.vis = el.v; publishView(PF.pid); }, pTog(el) { PF[el.v] = !PF[el.v]; publishView(PF.pid); }, pCons(el) { PF.consent[+el.v] = !PF.consent[+el.v]; publishView(PF.pid); },
  pSubmit() {
    const o = Server.overview(PF.pid); const ex = S.published.find(p => p.prodId === PF.pid);
    const rec = { id: ex?.id || 'pb' + Date.now().toString(36), prodId: PF.pid, title: PF.title.trim(), caption: PF.caption.trim(), genre: o.genre, city: PF.city, eps: o.accepted, vis: PF.vis === 'draft' ? 'draft' : PF.vis, status: PF.vis === 'draft' ? 'draft' : 'review', date: Date.now(), views: ex?.views || 0, likes: ex?.likes || 0, comments: ex?.comments || 0, consent: { v: 1, at: Date.now(), cast: o.roles.map(r => r.actor) } };
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
