/* ICON app core: state, router, auth, Home, Discover, Leaderboard, Profile, Plans, Story, Player */
const KEY = 'icon.app.v1';
const DEF = { user: null, accounts: {}, seen: false, follows: [], aFollows: [], friends: [], reqIn: null, reqOut: [], likes: [], saved: [], playlists: [], published: [], comments: {}, cl: {}, views: {}, notifs: [], prefs: { notif: true }, homeTab: 'foryou', homeGenre: 'Romance', hGenre: 'All', hCountry: 'All', cr: {}, drafts: [], followers: null, nf: null, cam: { facing: 'user', roll: true }, profTab: 'stories', upFilter: 'All', upSort: 'Latest', disc: { tab: 'All', genre: 'All Genres', loc: 'Global', sort: 'Trending', period: 'All Time', q: '' }, lb: { entity: 'Stories', rank: 'Most Watched', genre: 'All', geo: 'Global', period: 'This Week' } };
let S;
try { S = Object.assign(structuredClone(DEF), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = structuredClone(DEF); }
try { if (S.user && S.remember === false && !sessionStorage.getItem('icon.alive')) S.user = null; } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { } };
const Blobs = new Map(); // pid:ep -> object URL (kept in memory only)
const app = $('#app');
let route = { name: '', args: [] };
let navAfterAuth = null;

/* ---------- helpers ---------- */
const gimg = g => ({ Romance: 'couple', Comedy: 'roommates', Drama: 'smile', Horror: 'beyond', Thriller: 'encounter', Mystery: 'lastmsg', Vlog: 'smile', Podcast: 'man' })[g] || 'couple';
const allStories = () => [...userStories(), ...STORIES];
const userStories = () => S.published.filter(p => p.status === 'published' && p.vis !== 'draft').map(p => { const eps = p.episodes || []; return { id: 'u_' + p.id, uid: p.id, title: p.title, genre: p.genre, tags: [p.genre], city: '', country: p.country || 'Philippines', img: p.thumb || gimg(p.genre), eps: eps.length || p.eps || 1, views: p.views || 0, likes: p.likes || 0, comments: p.comments || 0, tagline: p.desc || p.caption || 'New on ICON', syn: p.desc || p.caption || 'A new series made on ICON.', cast: [...new Set(eps.flatMap(e => e.cast || []))], mine: true, prodId: p.id, vis: p.vis, episodes: eps }; });
const getStory = id => allStories().find(s => s.id === id) || CLIPS.find(s => s.id === id);
const epViews = (s, n) => { const own = S.views['ev_' + s.id + '_' + n] || 0; if (s.mine) return own; const r = .78; return Math.round(s.views * Math.pow(r, n - 1) * (1 - r) / (1 - Math.pow(r, s.eps))) + own; };
const shares = s => Math.round((s.likes || 0) * .06) + (S.views['sh_' + s.id] || 0) + (S.views['lo_' + s.id] || 0);
function imgToData(src, w, h) {
  return new Promise((res, rej) => { const u = URL.createObjectURL(src); const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const r = Math.max(w / im.width, h / im.height), sw = w / r, sh = h / r; x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, 0, 0, w, h); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .85)); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); }; im.src = u; });
}
const sv = s => s.views + ((S.views['add_' + s.id]) || 0);
const ccount = s => s.comments + (S.comments[s.id]?.length || 0) + Object.values(S.cr || {}).reduce((t, a) => t + a.filter(r => r.sid === s.id).length, 0);
const slikes = s => s.likes + (S.likes.includes(s.id) ? 1 : 0);
const isAuthed = () => !!S.user;
const tierOf = () => TIERS[S.user?.tier || 'free'];
function toast(msg, ms = 2800) { $('.toast')?.remove(); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = msg; app.append(t); setTimeout(() => t.remove(), ms); }
function go(h) { if (location.hash === h) router(); else location.hash = h; }
function need(why) { if (isAuthed()) return true; navAfterAuth = location.hash; toast(`Create a free account to ${why}.`); setTimeout(() => go('#/signup'), 700); return false; }
function notify(text) { S.notifs.unshift({ id: Date.now(), text, at: Date.now(), read: false }); save(); }
async function sha(s) { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch { return btoa(s); } }
function sheet(html, onClose) {
  $('.overlay')?.remove();
  const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  o.addEventListener('click', e => { if (e.target === o) closeSheet(); });
  app.append(o); return o;
}
const closeSheet = () => $('.overlay')?.remove();
const unread = () => (window.unreadN ? unreadN() : 0);

/* ---------- render shell ---------- */
function shell(inner, { nav = null, noNav = false, flush = false, landing = false } = {}) {
  const sc = $('.screen'); const top = sc && sc.dataset.h === location.hash ? sc.scrollTop : 0;
  app.innerHTML = `<div class="screen ${nav ? '' : 'noNav'} ${flush ? 'flush' : ''} ${landing ? 'gsl' : ''}" data-h="${location.hash}">${inner}</div>${nav ? navBar(nav) : ''}`;
  const n = $('.screen'); if (top) n.scrollTop = top;
}
const poster = (img, inner = '', cls = '', style = '', tl = '') => `<div class="poster ${cls}" style="${style}"><img src="${IMG(img)}" alt="" loading="lazy">${tl ? `<div class="tl">${tl}</div>` : ''}<div class="in">${inner}</div></div>`;
const secHead = (t, link = '', act = '') => `<div class="sec"><h2>${t}</h2>${link ? `<button class="link" ${act}>${link} ${ic('chevR').replace('class="i', 'style="width:15px;height:15px" class="i')}</button>` : ''}</div>`;

/* ---------- Bottom-sheet dropdown (replaces every native <select>) ---------- */
const DD = {};
const ddOpt = o => Array.isArray(o) ? [String(o[0]), String(o[1])] : [String(o), String(o)];
function dd(id, { label, title, options, value, onChange, ph = 'Select', compact = false }) {
  DD[id] = { title: title || label, options: options.map(ddOpt), value: value == null ? '' : String(value), onChange };
  const cur = DD[id].options.find(o => o[0] === DD[id].value);
  return `<button type="button" class="dd ${compact ? 'cmp' : ''}" data-act="ddOpen" data-id="${id}" aria-haspopup="dialog" aria-label="${esc(label)}${cur ? ': ' + esc(cur[1]) : ''}"><span class="ddt"><span class="ddl">${esc(label)}</span><span class="ddv ${cur ? '' : 'ph'}" id="ddv-${id}">${esc(cur ? cur[1] : ph)}</span></span>${ic('chevD')}</button>`;
}
function ddOpen(id) {
  const d = DD[id]; if (!d) return; let sel = d.value;
  const rows = () => d.options.map(([v, l]) => `<button type="button" class="ddr" role="option" aria-selected="${v === sel}" data-v="${esc(v)}"><span>${esc(l)}</span>${ic('check')}</button>`).join('');
  const o = sheet(`<h2 class="ddh">${esc(d.title)}</h2><div class="ddlist" role="listbox" aria-label="${esc(d.title)}">${rows()}</div><button type="button" class="btn pri" id="ddDone" style="margin-top:18px">Done</button>`);
  const list = $('.ddlist', o);
  list.addEventListener('click', e => { const r = e.target.closest('.ddr'); if (!r) return; sel = r.dataset.v; $$('.ddr', list).forEach(x => x.setAttribute('aria-selected', x.dataset.v === sel)); });
  $('#ddDone', o).onclick = () => { const changed = sel !== d.value; d.value = sel; const cur = d.options.find(x => x[0] === sel); const t = $('#ddv-' + id); if (t && cur) { t.textContent = cur[1]; t.classList.remove('ph'); } closeSheet(); if (changed && d.onChange) d.onChange(sel, cur ? cur[1] : sel); };
  list.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'center' });
}

/* ---------- Welcome / Auth ---------- */
const WEL = [['AI Generates Unique Scripts', 'wand', 'AI-powered storytelling for everyone. Write less. Create more. Be an ICON.'], ['Act Solo or with Friends', 'users', 'Perform alone or invite friends. One continuous take per episode.'], ['Create on Your Phone', 'film', 'Record, preview and publish straight from your phone. No editing suite.'], ['Share & Be Discovered', 'globe', 'Act. Be Famous. Win. Climb city, country and global leaderboards.']];
function landing() {
  const FEAT = [['Write<br>Your Stories', 'edit'], ['Play the Lead<br>or with Friends', 'users'], ['Create & Share<br>to the World', 'film'], ['Be<br>Discovered', 'star']];
  shell(`<div class="gs-hero"><img src="img/gs-hero.jpg" alt="ICON: Act. Be Famous. Win."></div>
  <h1 class="gs-h">Write and play<br>on <span class="gt">your own stories.</span></h1>
  <p class="gs-p">Act the lead solo or with your friends, share your series with the world and get discovered.</p>
  <div class="gs-feat">${FEAT.map(w => `<div>${ic(w[1])}<span>${w[0]}</span></div>`).join('')}</div>
  <button class="btn pri gs-cta" data-go="#/signup">Get Started ${ic('chevR')}</button>
  <div class="gs-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>
  <p class="center gs-login">Already have an account? <a href="#/login">Log In</a></p>`, { landing: true });
}
const welcome = landing;
function authHead(title, sub) { return `<div class="row sp"><button class="iconbtn" style="border:0;background:none" data-act="back" aria-label="Back">${ic('chevL')}</button><a href="#/${title.startsWith('Create') ? 'login' : 'signup'}" style="font-weight:600;text-decoration:none;color:#a98bff">${title.startsWith('Create') ? 'Log In' : 'Sign Up'}</a></div><div class="center" style="margin:-4px 0 20px">${logo(54)}</div><h1 class="center" style="font-size:21px">${title}</h1><p class="center mute" style="margin:6px 0 20px">${sub}</p>`; }
const sha2 = async (salt, pw) => sha(salt + '|' + pw);
function signup(err = {}, v = {}) {
  const yrs = []; const Y = new Date().getFullYear(); for (let y = Y - 18; y >= Y - 100; y--) yrs.push(y);
  const f = (k, i, ph, type = 'text', extra = '', ac = 'off') => `<label class="field ${err[k] ? 'bad' : ''}">${ic(i)}<input name="${k}" type="${type}" placeholder="${ph}" value="${esc(v[k] || '')}" autocomplete="${ac}" autocapitalize="none" aria-label="${ph}">${extra}</label>${err[k] ? `<div class="err-t" role="alert">${err[k]}</div>` : ''}`;
  const other = v.gender === 'Prefer to self-describe';
  shell(`${authHead('Create Your Account', 'Join a global community of creators and storytellers.')}
  <form id="sf" novalidate>${f('username', 'user', 'Username', 'text', '', 'username')}${f('email', 'mail', 'Email Address', 'email', '', 'email')}${f('pw', 'lock', 'Password (8+ characters)', 'password', `<button type="button" data-act="eye" aria-label="Show password">${ic('eye')}</button>`, 'new-password')}
  <div class="row" style="margin:6px 0 8px;color:#e6e4ff">${ic('cal')}<span>Date of Birth</span></div>
  <div class="row" style="gap:10px;margin-bottom:6px;align-items:stretch">${[['mo', 'Month', ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => [i + 1, m])], ['dy', 'Day', Array.from({ length: 31 }, (_, i) => i + 1)], ['yr', 'Year', yrs]].map(([k, l, o]) => `<div style="flex:1;min-width:0">${dd('dob-' + k, { label: l, title: 'Select ' + l.toLowerCase(), options: o, value: v[k], ph: l, compact: true, onChange: x => { $('[name=' + k + ']').value = x; } })}<input type="hidden" name="${k}" value="${esc(v[k] || '')}"></div>`).join('')}</div>
  <div class="xs mute" style="margin-bottom:${err.dob ? 4 : 14}px">You must be at least 18 years old to join the ICON beta.</div>${err.dob ? `<div class="err-t" role="alert">${err.dob}</div>` : ''}
  <div class="row" style="gap:10px;align-items:stretch;margin-bottom:${err.country || err.gender ? 4 : 12}px"><div style="flex:1;min-width:0">${dd('su-country', { label: 'Country', title: 'Country', options: CNAMES, value: v.country, ph: 'Select', onChange: x => { $('[name=country]').value = x; } })}<input type="hidden" name="country" value="${esc(v.country || '')}"></div><div style="flex:1;min-width:0">${dd('su-gender', { label: 'Gender', title: 'Gender', options: GENDERS, value: v.gender, ph: 'Select', onChange: x => { $('[name=gender]').value = x; $('#gotherw').style.display = x === 'Prefer to self-describe' ? 'block' : 'none'; if (x === 'Prefer to self-describe') $('[name=gother]').focus(); } })}<input type="hidden" name="gender" value="${esc(v.gender || '')}"></div></div>
  ${err.country ? `<div class="err-t" role="alert">${err.country}</div>` : ''}${err.gender ? `<div class="err-t" role="alert">${err.gender}</div>` : ''}
  <div id="gotherw" style="display:${other ? 'block' : 'none'}"><label class="field ${err.gother ? 'bad' : ''}">${ic('edit')}<input name="gother" maxlength="40" placeholder="How do you describe your gender?" value="${esc(v.gother || '')}" aria-label="Self-described gender"></label>${err.gother ? `<div class="err-t" role="alert">${err.gother}</div>` : ''}</div>
  <label class="row" style="margin:6px 0 ${err.terms ? 4 : 18}px;align-items:flex-start;font-size:14px"><input type="checkbox" name="terms" ${v.terms ? 'checked' : ''} style="width:24px;height:24px;accent-color:#7c4dff;flex:none"> <span>I agree to the <a href="#/legal/terms">Terms of Service</a> and <a href="#/legal/privacy">Privacy Policy</a>. My username, stories and country are public. My email, birth date and gender are not.</span></label>${err.terms ? `<div class="err-t" role="alert">${err.terms}</div>` : ''}
  <button class="btn pri" type="submit">Create Account ${ic('chevR')}</button></form>
  <p class="center mute" style="margin-top:16px">Already have an account? <a href="#/login">Log In</a></p>`);
  $('#sf').addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); d.terms = !!$('[name=terms]').checked; const er = {};
    d.username = (d.username || '').trim(); d.email = (d.email || '').trim();
    if (!/^[A-Za-z0-9._]{3,20}$/.test(d.username)) er.username = 'Use 3 to 20 letters, numbers, dots or underscores.';
    else if (Object.values(S.accounts).some(a => (a.username || '').toLowerCase() === d.username.toLowerCase())) er.username = 'That username is taken. Try another.';
    if (!/^\S+@\S+\.\S+$/.test(d.email)) er.email = 'Enter a valid email address.';
    if ((d.pw || '').length < 8) er.pw = 'Use at least 8 characters.';
    if (!d.mo || !d.dy || !d.yr) er.dob = 'Select your full date of birth.'; else { const b = new Date(d.yr, d.mo - 1, d.dy); if (b.getMonth() !== d.mo - 1) er.dob = 'That date doesn’t exist.'; else { const a = new Date(); let age = a.getFullYear() - b.getFullYear(); if (a < new Date(a.getFullYear(), b.getMonth(), b.getDate())) age--; if (age < 18) er.dob = 'ICON is currently 18+ only during the supervised beta.'; } }
    if (!d.country) er.country = 'Select the country you are based in.';
    if (!d.gender) er.gender = 'Select a gender option.'; else if (d.gender === 'Prefer to self-describe' && !(d.gother || '').trim()) er.gother = 'Tell us how you describe your gender.';
    if (!d.terms) er.terms = 'Please accept the Terms and Privacy Policy.';
    if (!er.email && S.accounts[d.email.toLowerCase()]) er.email = 'We couldn’t create an account with these details. Try logging in.';
    if (Object.keys(er).length) return signup(er, d);
    const salt = Math.random().toString(36).slice(2, 12); const hash = await sha2(salt, d.pw); const em = d.email.toLowerCase();
    S.accounts[em] = { hash, salt, username: d.username, name: d.username, dob: `${d.yr}-${d.mo}-${d.dy}`, country: d.country, city: '', gender: d.gender, gender_other: d.gender === 'Prefer to self-describe' ? d.gother.trim() : '', id: 'u' + Date.now().toString(36), joined: new Date().toISOString() }; S.remember = true; S.lastId = d.username; try { sessionStorage.setItem("icon.alive", "1"); } catch { } startSession(em); save();
  });
}
function login(err = '') {
  shell(`${authHead('Welcome Back', 'Log in to keep creating.')}<form id="lf" novalidate>
  <label class="field ${err ? 'bad' : ''}">${ic('user')}<input name="email" type="text" placeholder="Email or username" autocomplete="username" autocapitalize="none" aria-label="Email or username" value="${esc(S.lastId || '')}"></label>
  <label class="field ${err ? 'bad' : ''}">${ic('lock')}<input name="pw" type="password" placeholder="Password" autocomplete="current-password" aria-label="Password"><button type="button" data-act="eye" aria-label="Show password">${ic('eye')}</button></label>
  <label class="row" style="gap:8px;margin:2px 2px 10px;font-size:13px;align-items:center"><input type="checkbox" name="remember" ${S.remember === false ? '' : 'checked'} style="width:18px;height:18px;accent-color:#7c4dff"> Remember me on this device</label>
  ${err ? `<div class="err-t" role="alert">${err}</div>` : ''}<button class="btn pri" type="submit" style="margin-top:6px">Log In ${ic('chevR')}</button></form>
  <p class="center mute" style="margin-top:16px">New here? <a href="#/signup">Create an account</a></p>`);
  $('#lf').addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const id = (d.email || '').trim().toLowerCase();
    const em = S.accounts[id] ? id : Object.keys(S.accounts).find(k => (S.accounts[k].username || '').toLowerCase() === id); const a = em && S.accounts[em];
    if (!a || !a.hash || a.hash !== (a.salt ? await sha2(a.salt, d.pw || '') : await sha(d.pw || ''))) return login('Username/email or password is incorrect.');
    S.remember = !!d.remember; S.lastId = S.remember ? (a.username || id) : ''; try { sessionStorage.setItem('icon.alive', '1'); } catch { }
    startSession(em);
  });
}
function startSession(em, demo) {
  const a = S.accounts[em]; const keep = S.user && S.user.id === a.id ? S.user : null; const nm = a.username || a.name;
  S.user = keep || { id: a.id, name: nm, username: nm, email: em, handle: (a.username || (a.name.split(' ')[0] + a.id.slice(-3))).toLowerCase().replace(/[^a-z0-9._]/g, ''), tier: a.tier || 'free', city: '', country: a.country || 'Philippines', gender: a.gender || '', photo: a.photo || '', joined: a.joined || new Date().toISOString(), demo: !!demo };
  a.joined = S.user.joined; S.seen = true; save();
  const n = navAfterAuth; navAfterAuth = null; go(n || '#/home'); toast(`Welcome${demo ? '' : ' back'}, ${esc(nm)}!`);
}
function ssoLogin(p) {
  const em = 'mia.santos@' + p + '.demo'; if (!S.accounts[em]) S.accounts[em] = { hash: '', name: 'Mia Santos', id: 'umia', dob: '1998-05-14', tier: 'pro' };
  const first = !S.user; startSession(em, true); S.user.demo = true; S.user.handle = 'miasantos'; S.user.tier = S.accounts[em].tier || 'pro'; S.user.verified = true;
  if (!S.notifs.length) ['Aaron Cruz followed you', 'Your episode “The Second Chance” passed review', 'New leaderboard update: you’re #4 in Manila this week'].forEach(t => S.notifs.push({ id: Math.random(), text: t, at: Date.now(), read: false })); save();
}

let playTimer = null;
function legal(k) { shell(`<div class="row"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><h2>${k === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2></div><div class="card" style="margin-top:14px;line-height:1.6;font-size:14px">${k === 'terms' ? '<p>ICON is currently a supervised, <b>adults-only (18+) beta</b>. You are responsible for content you publish. Every actor in a production must approve public release of their performance. Content is moderated before publication.</p><p>Rankings use deduplicated engagement. Paid plans increase creation limits and never buy ranking.</p>' : '<p>Your public profile shows your name, handle, avatar and chosen city. We never show your email, date of birth or precise location. Account deletion removes your productions, takes and derived rankings.</p>'}<p class="xs mute">Placeholder text for the beta build. Replace with counsel-reviewed policies before launch.</p></div>`, { nav: null }); }

/* ---------- Plans ---------- */
function plans() {
  const cur = S.user?.tier || 'free';
  const feats = t => [t.stories === Infinity ? 'Fair-use unlimited series / month' : `${t.stories} new series per month`, `Up to ${t.eps} episodes per series`, 'Every episode up to 60 seconds, 9:16', `Tag up to ${t.actors} cast per episode`, 'Never affects leaderboard rank'];
  shell(`<div class="row sp"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><h2>Plans</h2><div style="width:40px"></div></div><p class="mute sm center" style="margin:10px 0 16px">Viewing and discovery are always free. Paid plans raise creation limits, never ranking.</p>
  ${Object.entries(TIERS).map(([k, t]) => `<div class="tier ${cur === k ? 'cur' : ''} ${k === 'pro' ? 'rec' : ''}"><div class="row sp"><h2>${k === 'pro' ? ic('crown').replace('class="i', 'style="width:18px;color:#ffd966;vertical-align:-3px" class="i') + ' ' : ''}${t.name}</h2>${cur === k ? '<span class="pill ok">Current plan</span>' : S.user?.pendingTier === k ? '<span class="pill warn">Starts at renewal</span>' : ''}</div><div style="margin-top:4px"><b style="font-size:30px">₱${t.price}</b><span class="mute">/mo${t.price ? ' · proposed' : ''}</span></div><ul>${feats(t).map(f => `<li>${ic('check')}${f}</li>`).join('')}</ul>${cur === k ? '' : `<button class="btn ${k === 'pro' ? 'pri' : ''}" data-act="choosePlan" data-v="${k}">${Object.keys(TIERS).indexOf(k) > Object.keys(TIERS).indexOf(cur) ? 'Upgrade to ' + t.name : 'Switch to ' + t.name}</button>`}</div>`).join('')}
  <div class="xs mute" style="line-height:1.5">Prices are proposed and subject to validation. Allowances reset on the 1st of each month (Asia/Manila). Pro fair use covers concurrency, automation and abuse; it does not mean unlimited video storage. Cancelling billing is separate from deleting your account.</div>`, { nav: null });
}

/* ---------- Event handlers ---------- */
const H = {
  ddOpen(el) { ddOpen(el.id); },
  back() { history.length > 1 ? history.back() : go('#/home'); },
  lmenu() { sheet(`<h2>ICON</h2><a class="btn" style="margin-top:12px" href="#/legal/terms" onclick="closeSheet()">Terms of Service</a><a class="btn" style="margin-top:8px" href="#/legal/privacy" onclick="closeSheet()">Privacy Policy</a><button class="btn" style="margin-top:8px" data-act="closeSheet">Close</button>`); },
  skip() { go('#/home'); },
  sso(el) { ssoLogin(el.v); toast('Signed in with a <b>demo account</b> (social login is simulated in this build).', 4000); },
  eye(el, e) { const i = e.target.closest('label').querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; },
  homeTab(el) { S.homeTab = el.v; save(); router(); }, homeGenre(el) { S.homeGenre = el.v; save(); router(); },
  followStory(el) { if (!need('follow stories')) return; const i = S.follows.indexOf(el.v); i < 0 ? S.follows.push(el.v) : S.follows.splice(i, 1); save(); toast(i < 0 ? 'Following. You’ll see it in the Following tab.' : 'Unfollowed.'); router(); },
  followActor(el) { if (!need('follow actors')) return; const i = S.aFollows.indexOf(el.v); i < 0 ? S.aFollows.push(el.v) : S.aFollows.splice(i, 1); save(); router(); },
  like(el, q) { if (!need('like stories')) return; const i = S.likes.indexOf(el.v); i < 0 ? S.likes.push(el.v) : S.likes.splice(i, 1); save(); if (q !== true) router(); },
  save(el) { if (!need('save stories')) return; const i = S.saved.indexOf(el.v); i < 0 ? S.saved.push(el.v) : S.saved.splice(i, 1); save(); toast(i < 0 ? 'Added to My list.' : 'Removed from My list.'); router(); },
  play(el) { const [id, n] = el.v.split('|'); play(id, +n); },
  async share(el) {
    const id = el.v, isA = ACTORS.some(a => a.id === id); closeSheet();
    const url = location.href.split('#')[0] + '#/' + (isA ? 'actor/' : 'story/') + id + (S.user ? '?ref=' + encodeURIComponent(S.user.handle) : '');
    const counted = () => { if (isA) return; S.views['sh_' + id] = (S.views['sh_' + id] || 0) + 1; save(); const s = getStory(id); if (!s) return; ['#shc', '#pshc'].forEach(q => { const n = $(q); if (n) n.textContent = fmt(shares(s)); }); };
    if (navigator.share) { try { await navigator.share({ title: 'ICON', text: 'Watch this on ICON', url }); counted(); return toast('Shared. Thanks for spreading the word!'); } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(url); counted(); return toast('Link copied. Anyone who opens it counts toward shares.'); } catch { }
    const o = sheet(`<h2>Share link</h2><p class="mute sm">Copy this link and send it anywhere. Opens through your link are counted as shares.</p><label class="field" style="margin-top:10px"><input id="shl" readonly value="${esc(url)}" aria-label="Share link"></label><button class="btn pri" id="shc2">Copy link</button>`);
    $('#shc2', o).onclick = () => { const i = $('#shl', o); i.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { } if (ok) { counted(); closeSheet(); toast('Link copied.'); } else toast('Press and hold the link to copy it.'); };
  },
  report(el) { const RR = ['Spam or scam', 'Harassment or hate', 'Sexual or violent content', 'Someone’s likeness without consent', 'AI actors / AI-generated video', 'Other']; let sel = null;
    const o = sheet(`<h2>Report</h2><p class="mute sm">Reports open a tracked review case. You can also block this creator afterwards.</p><div class="rpl">${RR.map(r => `<button type="button" class="rpo" data-r="${esc(r)}" aria-pressed="false"><span class="rd"></span><span>${esc(r)}</span></button>`).join('')}</div><div id="rpai" class="xs mute" style="display:none;margin:8px 4px 0">Use this if the people in the video are AI-generated or the video itself is AI-made and isn’t labelled as such.</div><div id="rpx" style="display:none;margin-top:10px"><textarea id="rptxt" class="rpt" maxlength="500" rows="4" placeholder="Describe why you’re reporting this"></textarea><div class="xs mute" id="rpc" style="text-align:right">0 / 500</div></div><button type="button" class="btn pri" id="rpgo" style="margin-top:14px" disabled>Submit report</button>`);
    const upd = () => { const ok = sel && (sel !== 'Other' || $('#rptxt', o).value.trim().length >= 5); $('#rpgo', o).disabled = !ok; };
    $$('.rpo', o).forEach(b => b.onclick = () => { sel = b.dataset.r; $$('.rpo', o).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#rpx', o).style.display = sel === 'Other' ? 'block' : 'none'; $('#rpai', o).style.display = sel.startsWith('AI') ? 'block' : 'none'; if (sel === 'Other') $('#rptxt', o).focus(); upd(); });
    $('#rptxt', o).oninput = e => { $('#rpc', o).textContent = e.target.value.length + ' / 500'; upd(); };
    $('#rpgo', o).onclick = () => { closeSheet(); toast(`Report received (${sel}). Case #${Math.floor(Math.random() * 90000 + 10000)} is in review.`); }; },
  comments(el) { openComments(el.v); },
  like2() { }, soon() { toast('Coming soon in a later beta release.'); },
  discTab(el) { S.disc.tab = el.v; S.disc.q = ''; save(); router(); }, discGenre(el) { S.disc.genre = el.v; save(); router(); },
  resetDisc() { S.disc = structuredClone(DEF.disc); save(); router(); },
  lb(el) { S.lb[el.k] = el.v; save(); router(); }, resetLb() { S.lb = structuredClone(DEF.lb); save(); router(); },
  formula() { sheet(`<h2>How ranks work (v1)</h2><div class="sm" style="line-height:1.6"><p><b>Most Watched</b>: qualified views (≥ 10 s or 50% watched) inside the period window. One per signed-in viewer per episode per day. Prizes are awarded on this ranking.</p><p><b>Most Popular</b>: unique likers + 3 × unique followers in the window.</p><p><b>Most Commented</b>: accepted non-spam comments, max 3 per person per story per day.</p><p>Windows run on Asia/Manila time: weeks Monday to Sunday, calendar months, and calendar quarters. Actors share full credit for each credited production. Hidden content, sanctioned accounts and confirmed fraud are excluded. <b>Paid status has zero effect.</b></p></div><button class="btn" style="margin-top:8px" data-act="closeSheet">Got it</button>`); },
  prizes() { sheet(`<h2>Prizes &amp; rules</h2><div class="ptable"><div class="ph"><span></span><span>1st</span><span>2nd</span><span>3rd</span></div>${PERIODS.map(p => `<div><span>${p.replace('This ', '')}</span>${PRIZES[p].map(x => `<b>${peso(x)}</b>`).join('')}</div>`).join('')}</div><ul class="sm" style="line-height:1.55;padding-left:18px;margin:14px 0 0"><li>Prizes go to the most-viewed story or actor of each period (Most Watched, qualified views only).</li><li>Winners must be 18+, with a verified account and a clean moderation record.</li><li>Fraud, view farming and removed content are disqualified.</li><li>Subscription tier never affects ranking or prizes.</li><li>Winners are announced after each period closes. Tax and ID checks may apply before payout.</li></ul><div class="xs mute" style="margin:10px 0 0">Beta placeholder amounts. Final prizes and terms are set by ICON and may change.</div><button class="btn pri" style="margin-top:14px" data-act="closeSheet">Got it</button>`); },
  lbMenu(el) { sheet(`<h2 class="ddh">${esc(el.nm)}</h2><button class="btn" style="margin-top:8px;justify-content:flex-start;padding-left:18px" data-go="${el.go2}" onclick="closeSheet()">${ic('play')} Open</button>${el.sid !== 'me' ? `<button class="btn" style="margin-top:8px;justify-content:flex-start;padding-left:18px" data-act="share" data-v="${el.sid}">${ic('share')} Share</button><button class="btn" style="margin-top:8px;justify-content:flex-start;padding-left:18px" data-act="report" data-v="${el.sid}">${ic('flag')} Report</button>` : ''}<button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`); },
  closeSheet,
  photo() {
    const u = S.user; const o = sheet(`<h2 class="ddh">Profile photo</h2><div class="center" style="margin:6px 0 14px"><img class="avatar" style="width:110px;height:110px;border-width:3px;object-fit:cover" src="${IMG('avatar')}" alt="Current photo"></div>
    <label class="btn pri" style="cursor:pointer">${ic('camera')} Take a photo<input type="file" accept="image/*" capture="user" id="phCam" hidden></label>
    <label class="btn" style="margin-top:8px;cursor:pointer">${ic('image')} Choose from library<input type="file" accept="image/*" id="phLib" hidden></label>
    ${u.photo ? `<button class="btn danger" style="margin-top:8px" data-act="photoRemove">${ic('trash')} Remove photo</button>` : ''}<button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button><div class="xs mute" style="margin-top:10px">Your photo is public on your profile, comments and leaderboards.</div>`);
    const pick = async e => { const f = e.target.files[0]; if (!f) return; try { const d = await imgToData(f, 320, 320); S.user.photo = d; const a = S.accounts[S.user.email]; if (a) a.photo = d; save(); closeSheet(); toast('Profile photo updated.'); router(); } catch { toast('Could not read that image. Try a JPG or PNG.'); } };
    $('#phCam', o).onchange = pick; $('#phLib', o).onchange = pick;
  },
  photoRemove() { S.user.photo = ''; const a = S.accounts[S.user.email]; if (a) a.photo = ''; save(); closeSheet(); toast('Photo removed.'); router(); },
  profTab(el) { S.profTab = el.v; save(); router(); }, upFilter(el) { S.upFilter = el.v; save(); router(); },
  newPl() { const o = sheet(`<h2>New playlist</h2><label class="field" style="margin-top:12px"><input id="pn" maxlength="30" placeholder="Playlist name" aria-label="Playlist name"></label><button class="btn pri" id="pc">Create</button>`); $('#pc', o).onclick = () => { const v = $('#pn', o).value.trim(); if (!v) return; S.playlists.push(v); save(); closeSheet(); router(); }; },
  settings() {
    sheet(`<h2>Settings</h2><label class="chk on" style="align-items:center"><span class="grow">Episode release notifications<div class="xs mute">Opt-in. Safety and account messages are always sent.</div></span><input type="checkbox" id="nt" ${S.prefs.notif ? 'checked' : ''} style="width:22px;height:22px;accent-color:#7c4dff"></label>
    <button class="btn" style="margin-top:12px" data-act="exportData">${ic('upload')} Export my data</button><button class="btn" style="margin-top:8px" data-act="soon">${ic('flag')} Appeal a moderation decision</button><button class="btn" style="margin-top:8px" data-act="logout">${ic('logout')} Log out</button><button class="btn danger" style="margin-top:8px" data-act="delAcct">${ic('trash')} Delete account</button><div class="xs mute" style="margin-top:10px">Cancelling a subscription and deleting your account are separate actions.</div>`);
    $('#nt').onchange = e => { S.prefs.notif = e.target.checked; save(); };
  },
  exportData() { const b = new Blob([JSON.stringify({ profile: S.user, productions: Server.mine(S.user.id), published: S.published, follows: S.follows }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'icon-data.json'; a.click(); toast('Data export downloaded.'); },
  logout() { closeSheet(); S.user = null; save(); go('#/home'); toast('Logged out.'); },
  delAcct() { sheet(`<h2>Delete account?</h2><p class="mute sm">This permanently removes your profile, productions, takes and derived rankings. It does not by itself cancel a paid subscription.</p><button class="btn danger" data-act="delYes">Yes, delete everything</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`); },
  delYes() { Server.removeAll(S.user.id); S.published = []; S.user = null; S.notifs = []; save(); closeSheet(); go('#/welcome'); toast('Your account was deleted.'); },
  choosePlan(el) {
    if (!need('change plan')) return; const k = el.v, t = TIERS[k], up = Object.keys(TIERS).indexOf(k) > Object.keys(TIERS).indexOf(S.user.tier);
    sheet(`<h2>${up ? 'Upgrade' : 'Switch'} to ${t.name}</h2>${up ? `<p class="sm mute">₱${t.price}/month, renews monthly. Your current month ceiling increases immediately; stories already used still count. Proration is shown at checkout.</p><div class="card sm">${ic('shield').replace('class="i', 'style="width:16px;vertical-align:-3px" class="i')} Demo build: no payment provider is connected, so no money is taken. In production, access is granted only after a verified provider event, never by a browser redirect.</div>` : '<p class="sm mute">Downgrades apply at your next renewal. Your existing productions keep their entitlements.</p>'}<button class="btn pri" style="margin-top:12px" data-act="confirmPlan" data-v="${k}">${up ? 'Continue to checkout (demo)' : 'Schedule change'}</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Not now</button>`);
  },
  confirmPlan(el) {
    const k = el.v, up = Object.keys(TIERS).indexOf(k) > Object.keys(TIERS).indexOf(S.user.tier); closeSheet();
    if (!up) { S.user.pendingTier = k; save(); toast(`${TIERS[k].name} will start at your next renewal.`); return router(); }
    toast('Waiting for payment confirmation…', 1500); setTimeout(() => { S.user.tier = k; delete S.user.pendingTier; const a = S.accounts[S.user.email]; if (a) a.tier = k; notify(`Payment confirmed. You’re on ${TIERS[k].name}.`); save(); toast(`You’re now on <b>${TIERS[k].name}</b>.`); router(); }, 1500);
  },
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); const g = e.target.closest('[data-go]');
  if (a) { const d = a.dataset; const fn = H[d.act] || (window.HC && HC[d.act]); if (fn) { e.preventDefault(); fn({ ...d }, e); } return; }
  if (g) { e.preventDefault(); go(g.dataset.go); }
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=link]')) { e.preventDefault(); e.target.click(); } });
document.addEventListener('change', e => { const b = e.target.dataset?.bind; if (!b) return; if (b.startsWith('disc.')) S.disc[b.slice(5)] = e.target.value; else S[b] = e.target.value; save(); router(); });

/* ---------- Router ---------- */
const GATED = { create: 'create stories', profile: null };
function router() {
  clearInterval(playTimer); $('.player')?.remove(); closeSheet();
  const h = location.hash || '#/home'; const parts = h.replace(/^#\//, '').split('?')[0].split('/'); route = { name: parts[0], args: parts.slice(1) };
  const r = route.name;
  if (r !== 'create' && window.stopCam) stopCam();
  if (r === 'story' && h.includes('?ref=')) { const ref = decodeURIComponent((h.split('?ref=')[1] || '').split('&')[0]); const id = parts[1]; const day = new Date().toDateString(), k = 'lk_' + id + '_' + ref; if (ref && S.user && S.user.handle !== ref && S.views[k] !== day) { S.views[k] = day; S.views['lo_' + id] = (S.views['lo_' + id] || 0) + 1; save(); } }
  if (!S.user && !['signup', 'login', 'legal', 'home', 'welcome', 'discover'].includes(r)) { navAfterAuth = null; return go('#/home'); }
  if (S.user && r === 'welcome') return go('#/home');
  if (r === 'create' && !isAuthed()) { navAfterAuth = h; toast('Log in or create an account to create stories.'); return signup(); }
  if (r === 'create') return window.createRoute(route.args);
  if (r === 'discover') return go('#/home');
  ({ welcome, signup: () => signup(), login: () => login(), home, clips, search: () => searchPage(), leaderboard, profile, plans, notifications, story: () => story(parts[1]), actor: () => actor(parts[1]), legal: () => legal(parts[1]), people: () => peopleView(parts[1]) }[r] || home)();
}
window.addEventListener('hashchange', router);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });

/* mouse drag-to-scroll for horizontal rows */
(() => { let el = null, x0 = 0, s0 = 0, moved = false;
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; el = e.target.closest('.chips,.hs,.slides,.tabs,.fline'); if (el) { x0 = e.clientX; s0 = el.scrollLeft; moved = false; } });
  document.addEventListener('pointermove', e => { if (!el) return; const d = e.clientX - x0; if (Math.abs(d) > 5) { moved = true; el.style.scrollSnapType = 'none'; el.scrollLeft = s0 - d; } });
  document.addEventListener('pointerup', () => { if (el) { const t = el; setTimeout(() => t.style.scrollSnapType = '', 50); } el = null; });
  document.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
})();

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

