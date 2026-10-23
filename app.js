/* ICON app core: state, router, auth, Home, Discover, Leaderboard, Profile, Plans, Story, Player */
const KEY = 'icon.app.v1';
const DEF = { user: null, accounts: {}, seen: false, follows: [], aFollows: [], friends: [], reqIn: null, reqOut: [], likes: [], saved: [], playlists: [], published: [], comments: {}, cl: {}, views: {}, notifs: [], prefs: { notif: true }, homeTab: 'foryou', homeGenre: 'Romance', profTab: 'stories', upFilter: 'All', upSort: 'Latest', disc: { tab: 'All', genre: 'All Genres', loc: 'Global', sort: 'Trending', period: 'All Time', q: '' }, lb: { entity: 'Stories', rank: 'Most Watched', genre: 'All', geo: 'Global', period: 'This Week' } };
let S;
try { S = Object.assign(structuredClone(DEF), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = structuredClone(DEF); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { } };
const Blobs = new Map(); // pid:ep -> object URL (kept in memory only)
const app = $('#app');
let route = { name: '', args: [] };
let navAfterAuth = null;

/* ---------- helpers ---------- */
const gimg = g => ({ Romance: 'couple', Comedy: 'roommates', Drama: 'smile', Horror: 'beyond', Thriller: 'encounter', Mystery: 'lastmsg', Vlog: 'smile', Podcast: 'man' })[g] || 'couple';
const allStories = () => [...userStories(), ...STORIES];
const userStories = () => S.published.filter(p => p.status === 'published' && p.vis !== 'draft').map(p => ({ id: 'u_' + p.id, uid: p.id, title: p.title, genre: p.genre, tags: [p.genre], city: p.city || 'Manila', img: p.thumb || gimg(p.genre), eps: p.eps, views: p.views || 0, likes: p.likes || 0, comments: p.comments || 0, tagline: p.caption || 'New on ICON', syn: p.caption || 'A new story made on ICON.', cast: [], mine: true, prodId: p.prodId, vis: p.vis }));
const getStory = id => allStories().find(s => s.id === id);
const epViews = (s, n) => { const own = S.views['ev_' + s.id + '_' + n] || 0; if (s.mine) return own; const r = .78; return Math.round(s.views * Math.pow(r, n - 1) * (1 - r) / (1 - Math.pow(r, s.eps))) + own; };
const shares = s => Math.round((s.likes || 0) * .06) + (S.views['sh_' + s.id] || 0) + (S.views['lo_' + s.id] || 0);
function imgToData(src, w, h) {
  return new Promise((res, rej) => { const u = URL.createObjectURL(src); const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const r = Math.max(w / im.width, h / im.height), sw = w / r, sh = h / r; x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, 0, 0, w, h); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .85)); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); }; im.src = u; });
}
const sv = s => s.views + ((S.views['add_' + s.id]) || 0);
const ccount = s => s.comments + (S.comments[s.id]?.length || 0);
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
const unread = () => S.notifs.filter(n => !n.read).length;

/* ---------- render shell ---------- */
function shell(inner, { nav = null, noNav = false } = {}) {
  const sc = $('.screen'); const top = sc && sc.dataset.h === location.hash ? sc.scrollTop : 0;
  app.innerHTML = `<div class="screen ${nav ? '' : 'noNav'}" data-h="${location.hash}">${inner}</div>${nav ? navBar(nav) : ''}`;
  const n = $('.screen'); if (top) n.scrollTop = top;
}
function navBar(a) {
  const b = (id, i, l, h) => `<button class="${a === id ? 'on' : ''}" data-go="${h}" aria-label="${l}" ${a === id ? 'aria-current="page"' : ''}>${ic(i)}${l}</button>`;
  return `<nav>${b('home', 'home', 'Home', '#/home')}${b('discover', 'compass', 'Discover', '#/discover')}<button class="plus ${a === 'create' ? 'on' : ''}" data-go="#/create" aria-label="Create"><i>${ic('plus')}</i>Create</button>${b('leaderboard', 'trophy', 'Leaderboard', '#/leaderboard')}${b('profile', 'user', 'Profile', '#/profile')}</nav>`;
}
function header({ search = true } = {}) {
  const av = S.user ? `<img class="avatar" src="${IMG('avatar')}" alt="Profile" data-go="#/profile">` : `<button class="btn sm pri" data-go="#/login" style="height:34px;padding:0 14px">Log in</button>`;
  return `<div class="top"><div data-go="#/home" style="cursor:pointer">${logo(34, false)}</div>${search ? `<label class="search">${ic('search')}<input id="gsearch" placeholder="Search stories, actors, or genres…" value="${esc(S.disc.q)}" aria-label="Search"></label>` : '<div class="grow"></div>'}${S.user ? `<button class="iconbtn" style="position:relative" data-go="#/notifications" aria-label="Notifications">${ic('bell')}${unread() ? `<span class="badge">${unread()}</span>` : ''}</button>` : ''}${av}</div>`;
}
const poster = (img, inner = '', cls = '', style = '', tl = '') => `<div class="poster ${cls}" style="${style}"><img src="${IMG(img)}" alt="" loading="lazy">${tl ? `<div class="tl">${tl}</div>` : ''}<div class="in">${inner}</div></div>`;
function storyCard(s, { rank, w = 118, h = 168, loc, stats = true } = {}) {
  return `<div data-go="#/story/${s.id}" style="width:${w}px;flex:none;cursor:pointer" role="link" tabindex="0">${poster(s.img, `<div style="font-weight:700;font-size:13px;line-height:1.15;margin-bottom:3px">${esc(s.title)}</div><div class="xs mute">${s.eps} Episode${s.eps > 1 ? 's' : ''}</div>${stats ? `<div class="stat xs" style="margin-top:5px;gap:9px"><span>${ic('eye')}${fmt(sv(s))}</span><span style="color:#ff5ad0">${icf('heart')}${fmt(slikes(s))}</span></div>` : ''}`, '', `height:${h}px;border-radius:14px`, rank ? `<span class="pill vi" style="font-size:12px;font-weight:800">#${rank}</span>` : loc ? `<span class="pill" style="background:rgba(0,0,0,.55)">${ic('loc').replace('class="i', 'style="width:11px;height:11px" class="i')}${esc(s.city)}</span>` : '')}</div>`;
}
const secHead = (t, link = '', act = '') => `<div class="sec"><h2>${t}</h2>${link ? `<button class="link" ${act}>${link} ${ic('chevR').replace('class="i', 'style="width:15px;height:15px" class="i')}</button>` : ''}</div>`;
const genreChips = (sel, act) => `<div class="chips">${GENRES.map(g => `<button class="chip ${sel === g[0] ? 'on' : ''}" style="flex-direction:column;justify-content:center;height:74px;width:72px;border-radius:14px;gap:6px;font-size:12px;${sel === g[0] ? 'border:1.5px solid #ff3de8;background:rgba(255,43,214,.08);box-shadow:0 0 14px rgba(255,43,214,.35)' : ''}" data-act="${act}" data-v="${g[0]}"><span style="color:${sel === g[0] ? '#ff3db8' : '#b9b8da'}">${ic(g[1]).replace('class="i', 'style="width:26px;height:26px" class="i')}</span>${g[0]}</button>`).join('')}<button class="chip" style="flex-direction:column;justify-content:center;height:74px;width:72px;border-radius:14px;gap:6px;font-size:12px" data-act="${act}" data-v="All Genres"><span style="color:#b9b8da">${ic('grid').replace('class="i', 'style="width:26px;height:26px" class="i')}</span>All Genres</button></div>`;

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
  const FEAT = [['Write Your Stories', 'edit'], ['Act Solo or with Friends', 'users'], ['Record & Edit on Your Phone', 'film'], ['Share to the World', 'globe']];
  shell(`<div class="row" style="justify-content:center;margin-top:2px">${logo(58)}</div>
  <div class="collage" style="height:292px" aria-hidden="true">
   ${poster('man', '', '', 'left:-10px;top:14px;width:132px;height:190px;transform:rotate(-4deg)')}
   ${poster('smile', '', '', 'left:92px;top:34px;width:200px;height:230px;transform:rotate(-7deg);z-index:2')}
   ${poster('church2', '', '', 'right:12px;top:0;width:104px;height:116px;transform:rotate(6deg)')}
   ${poster('beyond', '', '', 'right:-4px;top:128px;width:120px;height:150px;transform:rotate(6deg)')}
   <div class="hand" style="position:absolute;right:84px;top:176px;font-size:21px;line-height:1.15;transform:rotate(-10deg);z-index:3;width:156px;text-shadow:0 2px 8px rgba(0,0,0,.6)">Your Story. Your Act. Your Audience.</div>
   <div class="xs" style="position:absolute;left:30px;top:150px;line-height:1.75;letter-spacing:.8px;color:#d9d7f5;z-index:3">ROMANCE<br>COMEDY<br>DRAMA<br>HORROR<br>THRILLER<br>MYSTERY<br>AND MORE</div></div>
  <h1 style="font-size:40px;margin-top:6px">Write<br><span class="gt">Your Stories.</span></h1>
  <p style="font-size:17px;line-height:1.4;margin:10px 0 14px;color:#e6e4ff">Create your own stories, act with or without friends, and share to the world.</p>
  <div class="feat">${FEAT.map(w => `<div>${ic(w[1])}${w[0]}</div>`).join('')}</div>
  <button class="btn pri" style="margin-top:22px" data-go="#/signup">Get Started ${ic('chevR')}</button>
  <p class="center" style="margin:16px 0 0">Already have an account? <a href="#/login">Log In</a></p>`);
}
const welcome = landing;
function authHead(title, sub) { return `<div class="row sp"><button class="iconbtn" style="border:0;background:none" data-act="back" aria-label="Back">${ic('chevL')}</button><a href="#/${title.startsWith('Create') ? 'login' : 'signup'}" style="font-weight:600;text-decoration:none;color:#a98bff">${title.startsWith('Create') ? 'Log In' : 'Sign Up'}</a></div><div class="center" style="margin:-4px 0 20px">${logo(54)}</div><h1 class="center" style="font-size:27px">${title}</h1><p class="center mute" style="margin:6px 0 20px">${sub}</p>`; }
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
  <div class="row" style="gap:10px;align-items:stretch;margin-bottom:${err.city || err.gender ? 4 : 12}px"><div style="flex:1;min-width:0">${dd('su-city', { label: 'Based in', title: 'Which city are you based in?', options: PHC, value: v.city, ph: 'City', onChange: x => { $('[name=city]').value = x; } })}<input type="hidden" name="city" value="${esc(v.city || '')}"></div><div style="flex:1;min-width:0">${dd('su-gender', { label: 'Gender', title: 'Gender', options: GENDERS, value: v.gender, ph: 'Select', onChange: x => { $('[name=gender]').value = x; $('#gotherw').style.display = x === 'Prefer to self-describe' ? 'block' : 'none'; if (x === 'Prefer to self-describe') $('[name=gother]').focus(); } })}<input type="hidden" name="gender" value="${esc(v.gender || '')}"></div></div>
  ${err.city ? `<div class="err-t" role="alert">${err.city}</div>` : ''}${err.gender ? `<div class="err-t" role="alert">${err.gender}</div>` : ''}
  <div id="gotherw" style="display:${other ? 'block' : 'none'}"><label class="field ${err.gother ? 'bad' : ''}">${ic('edit')}<input name="gother" maxlength="40" placeholder="How do you describe your gender?" value="${esc(v.gother || '')}" aria-label="Self-described gender"></label>${err.gother ? `<div class="err-t" role="alert">${err.gother}</div>` : ''}</div>
  <label class="row" style="margin:6px 0 ${err.terms ? 4 : 18}px;align-items:flex-start;font-size:14px"><input type="checkbox" name="terms" ${v.terms ? 'checked' : ''} style="width:24px;height:24px;accent-color:#7c4dff;flex:none"> <span>I agree to the <a href="#/legal/terms">Terms of Service</a> and <a href="#/legal/privacy">Privacy Policy</a>. My username, stories and city are public. My email, birth date and gender are not.</span></label>${err.terms ? `<div class="err-t" role="alert">${err.terms}</div>` : ''}
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
    if (!d.city) er.city = 'Select the city you are based in.';
    if (!d.gender) er.gender = 'Select a gender option.'; else if (d.gender === 'Prefer to self-describe' && !(d.gother || '').trim()) er.gother = 'Tell us how you describe your gender.';
    if (!d.terms) er.terms = 'Please accept the Terms and Privacy Policy.';
    if (!er.email && S.accounts[d.email.toLowerCase()]) er.email = 'We couldn’t create an account with these details. Try logging in.';
    if (Object.keys(er).length) return signup(er, d);
    const salt = Math.random().toString(36).slice(2, 12); const hash = await sha2(salt, d.pw); const em = d.email.toLowerCase();
    S.accounts[em] = { hash, salt, username: d.username, name: d.username, dob: `${d.yr}-${d.mo}-${d.dy}`, city: d.city, gender: d.gender, gender_other: d.gender === 'Prefer to self-describe' ? d.gother.trim() : '', id: 'u' + Date.now().toString(36), joined: new Date().toISOString() }; startSession(em); save();
  });
}
function login(err = '') {
  shell(`${authHead('Welcome Back', 'Log in to keep creating.')}<form id="lf" novalidate>
  <label class="field ${err ? 'bad' : ''}">${ic('user')}<input name="email" type="text" placeholder="Email or username" autocomplete="username" autocapitalize="none" aria-label="Email or username"></label>
  <label class="field ${err ? 'bad' : ''}">${ic('lock')}<input name="pw" type="password" placeholder="Password" autocomplete="current-password" aria-label="Password"><button type="button" data-act="eye" aria-label="Show password">${ic('eye')}</button></label>
  ${err ? `<div class="err-t" role="alert">${err}</div>` : ''}<button class="btn pri" type="submit" style="margin-top:6px">Log In ${ic('chevR')}</button></form>
  <p class="center mute" style="margin-top:16px">New here? <a href="#/signup">Create an account</a></p>`);
  $('#lf').addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const id = (d.email || '').trim().toLowerCase();
    const em = S.accounts[id] ? id : Object.keys(S.accounts).find(k => (S.accounts[k].username || '').toLowerCase() === id); const a = em && S.accounts[em];
    if (!a || !a.hash || a.hash !== (a.salt ? await sha2(a.salt, d.pw || '') : await sha(d.pw || ''))) return login('Username/email or password is incorrect.');
    startSession(em);
  });
}
function startSession(em, demo) {
  const a = S.accounts[em]; const keep = S.user && S.user.id === a.id ? S.user : null; const nm = a.username || a.name;
  S.user = keep || { id: a.id, name: nm, username: nm, email: em, handle: (a.username || (a.name.split(' ')[0] + a.id.slice(-3))).toLowerCase().replace(/[^a-z0-9._]/g, ''), tier: a.tier || 'free', city: a.city || 'Manila', gender: a.gender || '', photo: a.photo || '', joined: a.joined || new Date().toISOString(), demo: !!demo };
  a.joined = S.user.joined; S.seen = true; save();
  const n = navAfterAuth; navAfterAuth = null; go(n || '#/home'); toast(`Welcome${demo ? '' : ' back'}, ${esc(nm)}!`);
}
function ssoLogin(p) {
  const em = 'mia.santos@' + p + '.demo'; if (!S.accounts[em]) S.accounts[em] = { hash: '', name: 'Mia Santos', id: 'umia', dob: '1998-05-14', tier: 'pro' };
  const first = !S.user; startSession(em, true); S.user.demo = true; S.user.handle = 'miasantos'; S.user.tier = S.accounts[em].tier || 'pro'; S.user.verified = true;
  if (!S.notifs.length) ['Aaron Cruz followed you', 'Your episode “The Second Chance” passed review', 'New leaderboard update: you’re #4 in Manila this week'].forEach(t => S.notifs.push({ id: Math.random(), text: t, at: Date.now(), read: false })); save();
}

/* ---------- Home ---------- */
const HERO = ['s1', 's2', 's5', 's3', 's4'];
function home() {
  if (!S.user) return landing();
  const tabs = [['foryou', 'For You'], ['following', 'Following'], ['trending', 'Trending'], ['new', 'New Releases']];
  let body = '';
  const grid = list => list.length ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:16px">${list.map(s => `<div>${storyCard(s, { w: '100%', h: 170 })}</div>`).join('')}</div>` : `<div class="empty">${ic('film', '').replace('class="i', 'style="width:40px;height:40px;color:#6b6d99" class="i')}<p>Nothing here yet.</p></div>`;
  if (S.homeTab === 'foryou') {
    const gs = allStories().filter(s => S.homeGenre === 'All Genres' || s.genre === S.homeGenre || s.tags.includes(S.homeGenre));
    body = `<div class="hero"><div class="slides" id="hero">${HERO.map(id => { const s = getStory(id); const f = S.follows.includes(id); return `<div class="slide"><img src="${IMG(s.img)}" alt=""><span class="pill pk" style="align-self:flex-start;margin-bottom:8px;letter-spacing:.5px">FEATURED SERIES</span><h1 style="font-size:35px;max-width:230px">${esc(s.title).replace(' ', '<br>')}</h1><div class="hand" style="font-size:22px;margin:8px 0;max-width:220px">${esc(s.tagline)}</div><div class="stat" style="margin:4px 0 8px"><span>${ic('play')}${s.eps} Episodes</span><span style="color:#ff5ad0">${icf('heart')}${fmt(slikes(s))}</span><span>${ic('loc')}${esc(s.city)}</span></div><div class="sm mute" style="max-width:260px;margin-bottom:14px">${esc(s.syn)}</div><div class="row"><button class="btn sm pri" style="height:44px;padding:0 24px" data-go="#/story/${id}">${ic('play').replace('class="i', 'style="width:15px" class="i f')} Watch Now</button><button class="btn sm ghost" style="height:44px;color:#fff;border-color:rgba(255,255,255,.4)" data-act="followStory" data-v="${id}">${f ? ic('check') + ' Following' : ic('plus') + ' Follow'}</button></div></div>`; }).join('')}</div><div class="dots" id="hdots" style="position:absolute;right:16px;bottom:18px">${HERO.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>
    <div style="margin-top:14px">${genreChips(S.homeGenre, 'homeGenre')}</div>
    ${secHead('Trending Stories', 'See All', 'data-go="#/discover"')}<div class="hs">${gs.length ? gs.slice(0, 8).map((s, i) => storyCard(s, { rank: i + 1, w: 124, h: 178 })).join('') : '<div class="empty" style="width:100%">No stories in this genre yet.</div>'}</div>
    ${secHead('New from the Philippines', 'See All', 'data-go="#/discover"')}<div class="hs">${[...STORIES].filter(s => s.city !== 'Global').slice(5).concat(STORIES.filter(s => s.city !== 'Global').slice(0, 5)).slice(0, 7).map(s => storyCard(s, { w: 124, h: 150, loc: 1 })).join('')}</div>
    ${secHead('Popular Actors', 'See All', 'data-go="#/leaderboard"')}<div class="hs" style="gap:16px;align-items:flex-start">${ACTORS.map((a, i) => `<div class="center" style="width:76px;flex:none;cursor:pointer" data-go="#/actor/${a.id}"><div style="position:relative;width:68px;margin:auto"><img src="${IMG(a.img)}" class="avatar" style="width:68px;height:68px;border-color:${['#ffc83d', '#c9d1ff', '#ff9a3d', '#5aa0ff', '#d04bff'][i]}" alt=""><b style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:${['#e5a300', '#8d97c9', '#d27a1d', '#2d62b8', '#7c3aed'][i]};border-radius:50%;width:22px;height:22px;display:grid;place-items:center;font-size:12px;border:2px solid var(--bg)">${i + 1}</b></div><div class="xs" style="margin-top:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</div><div class="xs mute" style="white-space:nowrap">${fmt(a.followers)}</div></div>`).join('')}</div>
    <div class="card" style="margin-top:22px;background:linear-gradient(135deg,rgba(91,52,255,.25),rgba(255,43,214,.12))"><div class="row" style="align-items:flex-start">${ic('clap').replace('class="i', 'style="width:44px;height:44px;color:#b388ff" class="i')}<div class="grow"><h3>Create Your Own Story</h3><div class="xs mute" style="margin:4px 0 12px">Choose a genre. Get your script. Start acting today!</div><button class="btn sm pri" style="height:38px" data-go="#/create">Create Now ${ic('chevR')}</button></div></div></div>`;
  } else if (S.homeTab === 'following') {
    const l = allStories().filter(s => S.follows.includes(s.id)); body = l.length ? grid(l) : `<div class="empty">${S.user ? 'You aren’t following any stories yet. Tap Follow on a series to see it here.' : 'Log in to follow stories and actors.'}</div>`;
  } else if (S.homeTab === 'trending') body = grid([...allStories()].sort((a, b) => sv(b) - sv(a)).slice(0, 12));
  else body = grid([...userStories(), ...[...STORIES].reverse()].slice(0, 12));
  shell(`${header()}<div class="t-tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${S.homeTab === t[0]}" class="${S.homeTab === t[0] ? 'on' : ''}" data-act="homeTab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>${S.homeTab === 'foryou' ? '' : ''}${body}`, { nav: 'home' });
  const h = $('#hero'); h?.addEventListener('scroll', () => { const i = Math.round(h.scrollLeft / h.clientWidth); $$('#hdots i').forEach((d, k) => d.classList.toggle('on', k === i)); });
  bindSearch();
}
function bindSearch() { const i = $('#gsearch'); i?.addEventListener('keydown', e => { if (e.key === 'Enter') { S.disc.q = i.value; S.disc.tab = 'All'; save(); go('#/discover'); } }); }

/* ---------- Discover ---------- */
function discover() {
  const D = S.disc; const q = D.q.trim().toLowerCase();
  let list = allStories();
  if (D.genre !== 'All Genres') list = list.filter(s => s.genre === D.genre || s.tags.includes(D.genre));
  if (D.loc !== 'Global') list = list.filter(s => s.city === D.loc);
  const pf = { 'All Time': 1, 'This Year': .8, 'This Month': .4, 'This Week': .12 }[D.period];
  if (D.sort === 'Most Followed') list.sort((a, b) => slikes(b) - slikes(a)); else list.sort((a, b) => sv(b) - sv(a));
  let qa = ACTORS;
  if (q) { list = list.filter(s => (s.title + s.genre + s.city + s.tags.join(' ')).toLowerCase().includes(q)); qa = ACTORS.filter(a => (a.name + a.city).toLowerCase().includes(q)); }
  const tabs = ['All', 'Series', 'Actors', 'Genres', 'Locations', 'Playlists'];
  let main = '';
  const showStories = ['All', 'Series'].includes(D.tab) || q;
  if (q || D.tab === 'Actors') main += `${secHead(q ? `Results for “${esc(D.q)}”` : 'Actors')}${qa.length ? qa.map(a => `<div class="lb" data-go="#/actor/${a.id}" style="cursor:pointer"><img src="${IMG(a.img)}" style="border-radius:50%" alt=""><div class="grow"><b>${a.name}</b><div class="xs mute">@${a.handle} · ${fmt(a.followers)} followers</div></div>${ic('chevR')}</div>`).join('') : '<div class="empty">No actors match.</div>'}`;
  if (showStories || D.tab === 'Genres' || D.tab === 'Locations') {
    if (!q && D.tab === 'All') main += `${secHead('Featured This Week', 'See All')}<div class="hs">${list.slice(0, 4).map((s, i) => `<div data-go="#/story/${s.id}" style="width:296px;flex:none;cursor:pointer">${poster(s.img, `<h2 style="font-size:20px;margin-bottom:6px">${esc(s.title)}</h2><div class="row wrap" style="margin-bottom:6px"><span class="pill vi">${s.genre}</span>${s.tags[1] ? `<span class="pill">${s.tags[1]}</span>` : ''}<span class="xs" style="display:inline-flex;gap:3px;align-items:center">${ic('loc').replace('class="i', 'style="width:13px" class="i')}${s.city}</span></div><div class="hand" style="font-size:18px;opacity:.9;margin-bottom:6px">${esc(s.tagline)}</div><div class="row sp"><div class="stat"><span>${ic('eye')}${fmt(sv(s))}</span><span style="color:#ff5ad0">${icf('heart')}${fmt(slikes(s))}</span><span>${ic('comment')}${fmt(s.comments)}</span></div><span class="iconbtn" style="width:42px;height:42px;background:rgba(0,0,0,.4)">${icf('play')}</span></div>`, '', 'height:210px;border-radius:20px', `<span class="pill pk" style="font-size:12px">#${i + 1} Trending</span>`)}</div>`).join('') || '<div class="empty" style="width:100%">No matches for these filters.</div>'}</div>`;
    else main += `${secHead(q ? 'Stories' : D.tab === 'Series' ? 'All Series' : 'Stories')}${list.length ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px">${list.map(s => storyCard(s, { w: '100%', h: 170 })).join('')}</div>` : `<div class="empty">No stories match. <button class="link" style="color:#a98bff;display:inline" data-act="resetDisc">Reset filters</button></div>`}`;
  }
  if (!q && ['All', 'Genres'].includes(D.tab)) main += `${secHead('Browse by Genre', 'See All')}<div class="chips">${[...GENRES, ['All Genres', 'grid']].map(g => `<button class="chip ${D.genre === g[0] ? 'on' : ''}" style="flex-direction:column;justify-content:center;height:74px;width:82px;border-radius:14px;gap:6px;font-size:12.5px;${D.genre === g[0] ? 'border:1.5px solid #ff3de8;background:rgba(255,43,214,.08)' : ''}" data-act="discGenre" data-v="${g[0]}"><span style="color:${D.genre === g[0] ? '#ff3db8' : '#b9b8da'}">${ic(g[1]).replace('class="i', 'style="width:26px;height:26px" class="i')}</span>${g[0]}</button>`).join('')}</div>`;
  if (!q && ['All', 'Locations'].includes(D.tab)) main += `${secHead('Stories from the Philippines', 'See All')}<div class="hs">${STORIES.filter(s => s.city !== 'Global').slice(5).concat(STORIES.slice(0, 5)).slice(0, 7).map(s => storyCard(s, { w: 128, h: 150, loc: 1 })).join('')}</div>`;
  if (!q && ['All', 'Playlists'].includes(D.tab)) main += `${secHead('Recommended Playlists', 'See All')}<div class="hs">${PLAYLISTS.map(p => `<div style="width:108px;flex:none">${poster(p[1], `<b style="font-size:13px">${p[0]}</b>`, '', 'height:150px;border-radius:12px')}</div>`).join('')}</div>`;
  shell(`${header()}<h1 style="font-size:36px;margin:2px 0 14px">Discover</h1><div class="chips">${tabs.map(t => `<button class="chip ${D.tab === t ? 'on' : ''}" data-act="discTab" data-v="${t}">${t}</button>`).join('')}</div>
  ${main}`, { nav: 'discover' });
  bindSearch();
}

/* ---------- Story page & player ---------- */
function story(id) {
  const s = getStory(id); if (!s) return shell(`<div class="empty">This story isn’t available.</div><button class="btn" data-go="#/home">Back to Home</button>`, { nav: 'home' });
  const f = S.follows.includes(id), lk = S.likes.includes(id), sd = S.saved.includes(id); const cast = s.cast.map(c => ACTORS.find(a => a.id === c)).filter(Boolean);
  const eps = Array.from({ length: s.eps }, (_, i) => i + 1); const seen = S.views['p_' + id] || 0;
  shell(`<div class="row sp" style="margin-bottom:12px"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><div class="row"><button class="iconbtn" data-act="share" data-v="${id}" aria-label="Share">${ic('share')}</button><button class="iconbtn" data-act="report" data-v="${id}" aria-label="Report">${ic('flag')}</button></div></div>
  ${poster(s.img, `<h1 style="font-size:30px">${esc(s.title)}</h1><div class="row wrap" style="margin:8px 0"><span class="pill vi">${s.genre}</span>${s.tags[1] ? `<span class="pill">${s.tags[1]}</span>` : ''}<span class="pill">${ic('loc').replace('class="i', 'style="width:11px" class="i')} ${s.city}</span>${s.mine ? '<span class="pill ok">Yours</span>' : ''}</div><div class="hand" style="font-size:20px">${esc(s.tagline)}</div>`, '', 'height:330px;border-radius:22px')}
  <div class="row" style="margin:14px 0"><button class="btn pri" style="flex:1" data-act="play" data-v="${id}|1">${icf('play')} ${seen ? 'Continue' : 'Watch Episode 1'}</button><button class="iconbtn" style="width:52px;height:52px;${lk ? 'color:#ff3db8' : ''}" data-act="like" data-v="${id}" aria-pressed="${lk}" aria-label="Like">${ic('heart', lk ? 'f' : '')}</button><button class="iconbtn" style="width:52px;height:52px;${sd ? 'color:#a98bff' : ''}" data-act="save" data-v="${id}" aria-label="Save">${ic('bookmark', sd ? 'f' : '')}</button></div>
  <div class="stat" style="margin-bottom:12px"><span>${ic('eye')}${fmt(sv(s))} views</span><span style="color:#ff5ad0">${icf('heart')}${fmt(slikes(s))}</span><button data-act="comments" data-v="${id}" class="stat" style="gap:5px">${ic('comment')}<span id="ccnt">${fmt(ccount(s))}</span> comments</button><span>${ic('share')}<span id="shc">${fmt(shares(s))}</span> shares</span></div>
  <p style="line-height:1.5;color:#e6e4ff">${esc(s.syn)}</p><div class="xs mute">Spoiler-safe synopsis. Unreleased scripts are never sent to viewers.</div>
  <button class="btn ghost" style="margin-top:14px" data-act="followStory" data-v="${id}">${f ? ic('check') + ' Following this story' : ic('plus') + ' Follow this story'}</button>
  ${cast.length ? `${secHead('Cast')}<div class="hs" style="gap:14px">${cast.map(a => `<div class="center" style="width:78px;flex:none;cursor:pointer" data-go="#/actor/${a.id}"><img class="avatar" style="width:64px;height:64px" src="${IMG(a.img)}" alt=""><div class="xs" style="margin-top:6px;font-weight:600">${a.name}</div></div>`).join('')}</div>` : ''}
  ${secHead('Episodes')}${eps.map(n => `<div class="ep"><div class="n">${n}</div><div class="grow"><b>Episode ${n}</b><div class="xs mute">${n === 1 ? 'Start here' : 'Watch in order'} · ${[40, 50, 60][n % 3]}s · <span style="white-space:nowrap">${ic('eye').replace('class="i', 'style="width:12px;vertical-align:-2px" class="i')} ${fmt(epViews(s, n))} views</span></div></div><button class="btn sm pri" style="height:36px" data-act="play" data-v="${id}|${n}">${icf('play')}</button></div>`).join('')}`, { nav: null });
}
let playTimer = null;
function play(id, n) {
  if (!S.user) return;
  const s = getStory(id); if (!s) return; if (n > 1 && !S.views[`q_${id}_${n - 1}`] && !confirm(`Episode ${n - 1} hasn't been watched yet. Watching in order avoids spoilers. Continue anyway?`)) return;
  const blob = s.mine ? Blobs.get(`${s.prodId}:${n}`) : null; const T = s.mine ? Server.overview(s.prodId)?.takes?.[n] : null; const E = T?.edits || null; const isAudio = !!T?.audio; const dur = blob ? 0 : [40, 50, 60][n % 3]; let muted = true, paused = false, t = 0;
  const o = document.createElement('div'); o.className = 'player'; const lk = S.likes.includes(id);
  const mediaTag = blob ? (isAudio ? `<audio src="${blob}" autoplay muted loop></audio>` : `<video src="${blob}" playsinline autoplay muted loop style="filter:${E ? fxCss(E) : 'none'}"></video>`) : '';
  const cover = (!blob || isAudio) ? `<img class="pimg" src="${IMG(isAudio ? 'man' : s.img)}" alt="" style="${E && !isAudio ? 'filter:' + fxCss(E) : ''}">` : '';
  o.innerHTML = `${cover}${mediaTag}${E?.caption ? `<div class="capov ${E.pos}">${esc(E.caption)}</div>` : ''}<div class="shade"></div><div class="ui"><div class="row sp"><button class="iconbtn" data-x="close" aria-label="Close">${ic('chevL')}</button><span class="pill">Episode ${n} of ${s.eps}</span><button class="iconbtn" data-x="mute" aria-label="Unmute">${ic('mute')}</button></div><div class="grow" data-x="pp" style="display:grid;place-items:center"><span id="pbig" style="display:none;width:78px;height:78px;border-radius:50%;background:rgba(0,0,0,.5);place-items:center">${icf('play').replace('class="i', 'style="width:36px;height:36px" class="i')}</span></div><div class="rail"><button data-x="like" aria-label="Like" style="${lk ? 'color:#ff3db8' : ''}">${ic('heart', lk ? 'f' : '')}${fmt(slikes(s))}</button><button data-x="vw" aria-label="Views" style="pointer-events:none">${ic('eye')}<span id="pvw">${fmt(epViews(s, n))}</span></button><button data-x="cm" aria-label="Comments">${ic('comment')}<span id="pcc">${fmt(ccount(s))}</span></button><button data-x="sh" aria-label="Share">${ic('share')}<span id="pshc">${fmt(shares(s))}</span></button><button data-x="rp" aria-label="Report">${ic('flag')}Report</button></div><div style="max-width:78%"><h2>${esc(s.title)}</h2><div class="sm" style="margin:4px 0 12px;color:#ddd">${esc(s.tagline)}</div></div><div class="bar" style="height:4px"><i id="pbar" style="width:0"></i></div><div class="xs mute" style="margin-top:6px">Muted autoplay · tap to pause · view counts after 10 s or 50% watched</div></div>`;
  app.append(o); const vid = $('video', o) || $('audio', o); if (vid && E) { vid.playbackRate = E.speed || 1; vid.volume = Math.min(1, (E.vol ?? 100) / 100); const lo = E.start || 0, hi = E.end || 0; vid.addEventListener('loadedmetadata', () => { if (lo) vid.currentTime = lo; }); vid.addEventListener('timeupdate', () => { if (hi && vid.currentTime >= hi) vid.currentTime = lo; }); } const total = () => vid && vid.duration && isFinite(vid.duration) ? vid.duration : dur;
  const counted = () => { const k = `q_${id}_${n}`, day = new Date().toDateString(); if (S.views[k] !== day) { S.views[k] = day; S.views['add_' + id] = (S.views['add_' + id] || 0) + 1; S.views['ev_' + id + '_' + n] = (S.views['ev_' + id + '_' + n] || 0) + 1; { const pv = $('#pvw'); if (pv) pv.textContent = fmt(epViews(s, n)); } S.views['p_' + id] = n; save(); const p = S.published.find(x => 'u_' + x.id === id); if (p) { p.views = (p.views || 0) + 1; save(); } } };
  clearInterval(playTimer); playTimer = setInterval(() => { if (paused) return; t = vid ? vid.currentTime : t + .25; const T = total() || 1; $('#pbar', o).style.width = Math.min(100, t / T * 100) + '%'; if (t >= Math.min(10, T * .5)) counted(); if (!vid && t >= T) { t = 0; } }, 250);
  const close = () => { clearInterval(playTimer); o.remove(); route.name === 'story' ? 0 : 0; };
  o.addEventListener('click', e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') { close(); router(); } else if (x === 'mute') { muted = !muted; if (vid) vid.muted = muted; e.target.closest('button').innerHTML = ic(muted ? 'mute' : 'volume'); }
    else if (x === 'pp') { paused = !paused; vid && (paused ? vid.pause() : vid.play()); $('#pbig', o).style.display = paused ? 'grid' : 'none'; }
    else if (x === 'like') { if (!need('like stories')) return; H.like({ v: id }, true); const b = e.target.closest('button'); const l = S.likes.includes(id); b.style.color = l ? '#ff3db8' : ''; b.innerHTML = ic('heart', l ? 'f' : '') + fmt(slikes(s)); }
    else if (x === 'cm') H.comments({ v: id }); else if (x === 'sh') H.share({ v: id }); else if (x === 'rp') H.report({ v: id });
  });
}

/* ---------- Actor ---------- */
function actor(id) {
  const a = ACTORS.find(x => x.id === id); if (!a) return go('#/home'); const f = S.aFollows.includes(id); const st = STORIES.filter(s => s.cast.includes(id));
  shell(`<div class="row sp"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><button class="iconbtn" data-act="report" data-v="${id}" aria-label="Report">${ic('flag')}</button></div><div class="center" style="margin:6px 0 16px"><img class="avatar" style="width:110px;height:110px;border-width:3px" src="${IMG(a.img)}" alt=""><h1 style="font-size:26px;margin-top:12px">${a.name}</h1><div class="mute">@${a.handle} · ${ic('loc').replace('class="i', 'style="width:13px;vertical-align:-2px" class="i')} ${a.city}</div></div>
  <div class="stats"><div><b>${st.length}</b><span>Stories</span></div><div><b>${fmt(a.followers + (f ? 1 : 0))}</b><span>Followers</span></div><div><b>${fmt(st.reduce((t, s) => t + s.views, 0))}</b><span>Views</span></div><div><b>${fmt(st.reduce((t, s) => t + s.likes, 0))}</b><span>Likes</span></div><div><b>#${ACTORS.indexOf(a) + 1}</b><span>PH rank</span></div></div>
  <div class="row" style="margin:14px 0"><button class="btn ${f ? 'ghost' : 'pri'}" style="flex:1" data-act="followActor" data-v="${id}">${f ? 'Following' : '+ Follow'}</button><button class="btn" style="flex:1" data-act="friendBtn" data-v="${id}">${(S.friends || []).includes(id) ? ic('check') + ' Friends' : (S.reqOut || []).includes(id) ? 'Requested' : ic('userplus') + ' Add friend'}</button><button class="iconbtn" style="width:52px;height:52px" data-act="share" data-v="${id}" aria-label="Share">${ic('share')}</button></div>
  ${secHead('Productions')}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px">${st.map(s => storyCard(s, { w: '100%', h: 160 })).join('') || '<div class="empty" style="grid-column:1/-1">No public productions yet.</div>'}</div><div class="xs mute" style="margin-top:14px">Statistics reflect visible, eligible content. Recognition shows dated windows only.</div>`, { nav: 'discover' });
}

/* ---------- Leaderboard ---------- */
function leaderboard() {
  if (!PERIODS.includes(S.lb.period)) S.lb.period = 'This Week';
  const L = S.lb; const pf = { 'This Week': .1, 'This Month': .38, 'This Quarter': 1 }[L.period];
  let pool = allStories().filter(s => (L.genre === 'All' || s.genre === L.genre) && (L.geo === 'Global' || (L.geo === 'Philippines' ? s.city !== 'Global' : s.city === L.geo)));
  const metric = s => L.rank === 'Most Watched' ? sv(s) : L.rank === 'Most Popular' ? slikes(s) + 3 * Math.round(slikes(s) * .21) : s.comments + (S.comments[s.id]?.length || 0);
  let rows;
  if (L.entity === 'Stories') rows = pool.map(s => ({ id: s.id, name: s.title, sub: s.genre, pill: s.genre, city: s.city, img: s.img, v: Math.round(metric(s) * pf), mine: s.mine, go: `#/story/${s.id}` }));
  else { const m = {}; pool.forEach(s => (s.cast.length ? s.cast : []).forEach(c => m[c] = (m[c] || 0) + metric(s))); if (S.user) { const mine = pool.filter(s => s.mine); if (mine.length) m['me'] = mine.reduce((t, s) => t + metric(s), 0); } rows = Object.entries(m).map(([k, v]) => { const a = ACTORS.find(x => x.id === k); return k === 'me' ? { id: 'me', name: S.user.name, sub: 'You', pill: 'You', city: S.user.city || 'Manila', img: 'avatar', v: Math.round(v * pf), mine: true, go: '#/profile' } : { id: k, name: a.name, sub: `@${a.handle}`, pill: '@' + a.handle, city: a.city, img: a.img, v: Math.round(v * pf), go: `#/actor/${k}` }; }); }
  rows = rows.filter(r => r.v > 0).sort((a, b) => b.v - a.v).slice(0, 10);
  const me = rows.findIndex(r => r.mine); const upd = new Date(Math.floor(Date.now() / 9e5) * 9e5).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
  const lbdd = (k, label, opts, title) => dd('lb-' + k, { label, title: title || label, options: opts, value: L[k], onChange: v => { S.lb[k] = v; save(); router(); } });
  const prized = L.rank === 'Most Watched', PR = PRIZES[L.period], rg = periodRange(L.period); const ord = ['1st', '2nd', '3rd'];
  const unit = { 'Most Watched': 'qualified views', 'Most Popular': 'popularity', 'Most Commented': 'comments' }[L.rank];
  const crown = ic('crown').replace('class="i', 'style="width:20px;color:#ffc83d" class="i');
  const pod = (r, i) => `<div class="pod p${i + 1}" data-go="${r.go}" role="link" tabindex="0" aria-label="${ord[i]} place: ${esc(r.name)}"><img src="${IMG(r.img)}" alt="" style="${L.entity === 'Actors' ? 'object-position:center 20%' : ''}"><div class="shade"></div><div class="rn">${crown}<b>${i + 1}</b></div><div class="info"><b class="pt">${esc(r.name)}</b><span class="pill vi pg">${esc(r.pill)}</span><div class="pv">${ic('eye')}${fmt(r.v)}</div>${prized ? `<span class="prz">${peso(PR[i])}</span>` : ''}</div></div>`;
  const podium = rows.length >= 3 ? `<div class="podium">${[1, 0, 2].map(i => pod(rows[i], i)).join('')}</div>` : '';
  const rest = rows.length >= 3 ? rows.slice(3) : rows; const off = rows.length >= 3 ? 3 : 0;
  shell(`${header({ search: false })}<h1 class="lbt">Leaderboard</h1><p class="center mute" style="margin:-2px 0 12px">Top stories. Real actors. Global stage.</p><div class="row" style="gap:8px;margin-bottom:10px">${['Stories', 'Actors'].map(e => `<button class="btn ${L.entity === e ? 'pri' : ''}" style="height:44px" data-act="lb" data-k="entity" data-v="${e}">${e}</button>`).join('')}</div>
  <div class="row" style="gap:8px;align-items:stretch"><div style="flex:1;min-width:0">${lbdd('rank', 'Rank by', ['Most Watched', 'Most Popular', 'Most Commented'])}</div><div style="flex:1;min-width:0">${lbdd('period', 'Period', PERIODS)}</div></div>
  <div class="row" style="gap:8px;align-items:stretch;margin-top:8px"><div style="flex:1;min-width:0">${lbdd('genre', 'Genre', ['All', ...GENRES.map(g => g[0])], 'Genre')}</div><div style="flex:1;min-width:0">${lbdd('geo', 'Location', ['Global', 'Philippines', ...CITIES])}</div></div>
  <div class="prizecard">${prized ? `<div class="row sp"><div class="row" style="gap:8px">${ic('trophy').replace('class="i', 'style="width:22px;color:#ffc83d" class="i')}<b>${L.period} prizes</b></div><span class="xs" style="color:#ffd98a">${rg.left}</span></div><div class="xs mute" style="margin:2px 0 10px">${rg.label} · Asia/Manila</div><div class="prow">${PR.map((p, i) => `<div class="pz p${i + 1}"><span>${ord[i]}</span><b>${peso(p)}</b></div>`).join('')}</div><button class="link" style="color:#a98bff;margin-top:10px" data-act="prizes">Prizes &amp; rules ${ic('chevR').replace('class="i', 'style="width:14px" class="i')}</button>` : `<div class="row" style="gap:8px">${ic('trophy').replace('class="i', 'style="width:22px;color:#ffc83d" class="i')}<b>Prizes go to the most-viewed</b></div><div class="xs mute" style="margin:4px 0 8px">Switch <b>Rank by</b> to Most Watched to see this ${L.period.toLowerCase().replace('this ', '')}’s prizes and countdown.</div><button class="btn sm pri" style="height:36px" data-act="lb" data-k="rank" data-v="Most Watched">Show Most Watched</button>`}</div>
  ${podium}
  <div class="row sp" style="margin:${podium ? 4 : 16}px 0 10px"><span class="xs mute">Updated ${upd} (Asia/Manila) · ${rg.label}</span><button class="link" style="color:#a98bff" data-act="formula">How ranks work</button></div>
  ${rows.length ? rest.map((r, i) => `<div class="lbr ${r.mine ? 'me' : ''}" data-go="${r.go}" style="cursor:pointer"><div class="rk">${i + off + 1}</div><img src="${IMG(r.img)}" style="${L.entity === 'Actors' ? 'border-radius:50%' : ''}" alt=""><div class="grow" style="min-width:0"><b class="tt">${esc(r.name)}</b>${r.mine ? ' <span class="pill pk">You</span>' : ''}<div style="margin-top:3px"><span class="pill vi pg">${esc(r.pill)}</span></div></div><div style="text-align:right;flex:none"><b class="vw">${ic('eye')}${fmt(r.v)}</b><div class="xs mute lc">${ic('loc').replace('class="i', 'style="width:12px;vertical-align:-2px" class="i')} ${esc(r.city)}</div></div><button class="dotsb" data-act="lbMenu" data-go2="${r.go}" data-sid="${r.id}" data-nm="${esc(r.name)}" aria-label="More options for ${esc(r.name)}">${ic('dots').replace('class="i', 'style="width:20px;transform:rotate(90deg)" class="i')}</button></div>`).join('') : `<div class="empty">No eligible entries for this filter yet.<br><button class="link" style="color:#a98bff;display:inline;margin-top:8px" data-act="resetLb">Reset filters</button></div>`}
  <div class="card" style="margin-top:12px;font-size:13px">${isAuthed() ? (me >= 0 ? `Your best rank here: <b>#${me + 1}</b>.` : 'You’re not ranked in this view yet. Publish an episode and earn qualified views to enter.') : 'Log in to see your personal rank.'}</div>
  <div class="row xs mute" style="margin-top:12px;align-items:flex-start">${ic('shield').replace('class="i', 'style="width:16px;margin-top:1px" class="i')}<span>Subscription tier never affects rankings. Only deduplicated, qualified engagement counts.</span></div>`, { nav: 'leaderboard' });
}

function profile() {
  if (!S.user) return shell(`${header({ search: false })}<div class="empty" style="padding-top:60px">${ic('user').replace('class="i', 'style="width:56px;height:56px;color:#6b6d99" class="i')}<h2 style="margin:12px 0 6px;color:#fff">Your ICON profile</h2><p>Log in to create stories, follow actors and track your stats.</p><div class="row" style="margin-top:20px"><button class="btn pri" data-go="#/signup">Create Account</button><button class="btn" data-go="#/login">Log In</button></div></div>`, { nav: 'profile' });
  const u = S.user, T = TIERS[u.tier], mine = S.published, demo = u.demo;
  const tv = mine.reduce((t, p) => t + (p.views || 0), 0) + (demo ? 15600000 : 0), tl = mine.reduce((t, p) => t + (p.likes || 0), 0) + (demo ? 482000 : 0);
  const rem = Server.remaining(u.id, u.tier), used = Server.used(u.id);
  const prods = Server.mine(u.id);
  const seeded = demo ? [['City Lights', 'cafe', 320000, '2 days ago', '00:58', 'couple2'], ['Coffee and Confessions', 'couple2', 560000, '5 days ago', '01:24', 'couple2'], ['Just Friends?', 'smile', 780000, '1 week ago', '00:45', 'smile'], ['Beyond Tomorrow', 'beyond', 410000, '1 week ago', '01:12', 'beyond'], ['The Last Message', 'lastmsg', 690000, '2 weeks ago', '00:52', 'lastmsg']].map(x => ({ t: x[0], img: x[5], v: x[2], d: x[3], dur: x[4], kind: 'Shorts' })) : [];
  const ups = [...mine.map(p => ({ t: p.title, img: p.thumb || gimg(p.genre), v: p.views || 0, d: new Date(p.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), dur: p.eps > 1 ? p.eps + ' eps' : '1 ep', kind: p.status === 'review' ? 'Scheduled' : p.vis === 'draft' ? 'Drafts' : 'Series', st: p.status, go: p.status === 'published' ? `#/story/u_${p.id}` : null, pid: p.id })), ...seeded];
  const uf = S.upFilter; let fu = ups.filter(x => uf === 'All' || x.kind === uf); if (S.upSort === 'Most viewed') fu.sort((a, b) => b.v - a.v);
  const pins = (demo ? ['s1', 's9', 's8'] : []).map(getStory);
  const tab = S.profTab; let content = '';
  if (tab === 'stories') content = `${pins.length ? `<div class="sec"><h2>${ic('pin').replace('class="i', 'style="width:18px;vertical-align:-3px;margin-right:4px" class="i')}Pinned</h2><button class="link" data-act="soon">Manage Pins</button></div><div class="hs">${pins.map(s => `<div data-go="#/story/${s.id}" style="width:220px;flex:none;cursor:pointer">${poster(s.img, `<b style="font-size:17px">${esc(s.title)}</b><div class="xs mute" style="margin:2px 0 6px">${s.eps} Episodes · ${s.genre}</div><div class="stat xs"><span>${ic('eye')}${fmt(s.views)}</span><span style="color:#ff5ad0">${icf('heart')}${fmt(s.likes)}</span><span>${ic('comment')}${fmt(s.comments)}</span></div>`, '', 'height:176px;border-radius:16px', '<span class="pill pk">Pinned</span>')}</div>`).join('')}</div>` : ''}
  <div class="sec"><h2>My Uploads</h2><div style="width:150px">${dd('upSort', { label: 'Sort by', options: ['Latest', 'Most viewed'], value: S.upSort, onChange: v => { S.upSort = v; save(); router(); } })}</div></div><div class="chips">${['All', 'Series', 'Shorts', 'Drafts', 'Scheduled'].map(f => `<button class="chip ${uf === f ? 'on' : ''}" style="height:32px;font-size:12.5px" data-act="upFilter" data-v="${f}">${f === 'Scheduled' ? 'In review' : f}</button>`).join('')}</div>
  <div class="hs" style="margin-top:12px">${fu.length ? fu.map(x => `<div class="thumb" ${x.go ? `data-go="${x.go}"` : ''} style="${x.go ? 'cursor:pointer' : ''}"><div class="poster">${`<img src="${IMG(x.img)}" alt="">`}<span class="dur">${x.dur}</span></div><div class="row sp" style="margin-top:6px"><b class="sm" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.t)}</b></div><div class="xs mute row" style="gap:5px">${x.st === 'review' ? '<span class="pill warn">In moderation</span>' : `${ic('eye').replace('class="i', 'style="width:13px" class="i')}${fmt(x.v)}`}</div><div class="xs mute">${x.d}</div></div>`).join('') : '<div class="empty" style="width:100%;padding:18px">Nothing here yet. Tap <b>Create</b> to make your first story.</div>'}</div>
  <div class="sec"><h2>My Playlists</h2><button class="link" data-act="soon">See All ${ic('chevR').replace('class="i', 'style="width:14px" class="i')}</button></div><div class="hs"><button class="pl" style="height:104px;display:grid;place-items:center;color:#a98bff;font-size:12px;width:96px" data-act="newPl"><div class="center">${ic('plus').replace('class="i', 'style="width:38px;height:38px" class="i')}<div style="color:#fff;margin-top:6px">Create Playlist</div></div></button>${[...S.playlists.map(n => [n, 'smile', 'list', '0 stories']), ...(demo ? [['My Favorites', 'couple2', 'heart', '24 stories'], ['Feel Good', 'smile', 'sun', '18 stories'], ['Drama Hits', 'beyond', 'masks', '16 stories'], ['Comedy Time', 'trio', 'smile', '12 stories'], ['Watch Later', 'couple', 'clock', '8 stories']] : [['Watch Later', 'couple', 'clock', S.saved.length + ' stories']])].map(p => `<div class="pl">${poster(p[1], '', '', 'height:62px')}<div class="m">${ic(p[2]).replace('class="i', 'style="width:20px;color:#ff5ad0" class="i')}<div><div>${esc(p[0])}</div><div class="xs mute" style="font-weight:400">${p[3]}</div></div></div></div>`).join('')}</div>`;
  else if (tab === 'drafts') content = `<div class="sec"><h2>My Drafts</h2></div>${prods.length ? prods.map(p => `<div class="ep" style="cursor:pointer" data-go="#/create/story/${p.id}"><div class="n">${ic('doc').replace('class="i', 'style="width:20px" class="i')}</div><div class="grow"><b>${esc(p.title)}</b><div class="xs mute">${p.genre} · ${p.accepted}/${p.total} episodes recorded</div></div>${ic('chevR')}</div>`).join('') : '<div class="empty">No productions in progress.</div>'}`;
  else if (tab === 'liked' || tab === 'saved') { const l = allStories().filter(s => S[tab === 'liked' ? 'likes' : 'saved'].includes(s.id)); content = `<div class="sec"><h2>${tab === 'liked' ? 'Liked' : 'Saved'}</h2></div>${l.length ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px">${l.map(s => storyCard(s, { w: '100%', h: 160 })).join('')}</div>` : `<div class="empty">${tab === 'liked' ? 'Stories you like' : 'Stories you save'} will show up here.</div>`}`; }
  else if (tab === 'playlists') content = `<div class="sec"><h2>Playlists</h2><button class="btn sm pri" data-act="newPl">+ New</button></div>${S.playlists.map(n => `<div class="ep"><div class="n">${ic('list')}</div><b>${esc(n)}</b></div>`).join('') || '<div class="empty">Create a playlist to organise stories.</div>'}`;
  else { const ach = [['First Take', 'Record and accept your first episode', prods.some(p => p.accepted > 0)], ['Series Starter', 'Publish a multi-episode series', mine.some(p => p.eps > 1 && p.status === 'published')], ['Published', 'Pass moderation and go live', mine.some(p => p.status === 'published')], ['Top 5 · Manila · Oct 2026', 'Weekly window, scoring v1 (demo account)', demo]]; content = `<div class="sec"><h2>Achievements</h2></div>${ach.map(a => `<div class="ep"><div class="n" style="${a[2] ? 'background:rgba(255,200,61,.2);color:#ffc83d' : 'opacity:.4'}">${ic('trophy')}</div><div class="grow"><b>${a[0]}</b><div class="xs mute">${a[1]}</div></div>${a[2] ? '<span class="pill ok">Earned</span>' : ic('lock')}</div>`).join('')}`; }
  shell(`<div class="row sp" style="margin-bottom:6px"><div>${logo(34, false)}</div><div class="row"><button class="pro" data-go="#/plans">${ic('crown').replace('class="i', 'style="width:17px" class="i')} ${T.name === 'Free' ? 'Upgrade' : T.name}</button><button class="iconbtn" style="position:relative" data-go="#/notifications" aria-label="Notifications">${ic('bell')}${unread() ? `<span class="badge">${unread()}</span>` : ''}</button><button class="iconbtn" data-act="settings" aria-label="Settings" style="border:0;background:none">${ic('gear')}</button></div></div>
  <div class="row" style="align-items:flex-start;gap:14px;margin:14px 0"><div style="position:relative;cursor:pointer" data-act="photo" role="button" tabindex="0" aria-label="Change profile photo"><img class="avatar" style="width:92px;height:92px;border-width:3px;object-fit:cover" src="${IMG('avatar')}" alt=""><span style="position:absolute;right:-2px;bottom:-2px;width:34px;height:34px;border-radius:50%;background:#1d2a6b;border:3px solid var(--bg);display:grid;place-items:center">${ic('camera').replace('class="i', 'style="width:16px" class="i')}</span></div><div class="grow"><h1 style="font-size:26px">${esc(u.name)} ${u.verified ? `<span style="color:#8b5cf6" title="Verified">${icf('check').replace('class="i f', 'class="i').replace('<svg', '<svg style="width:20px;background:#6a3dff;border-radius:50%;padding:3px;stroke:#fff;fill:none;stroke-width:3"')}</span>` : ''}</h1><div class="mute sm">@${esc(u.handle)}</div><div class="sm" style="margin:6px 0">${demo ? 'Stories make life more interesting. 💜' : 'New on ICON ✨'}</div><div class="xs mute row wrap" style="gap:12px"><span class="row" style="gap:4px">${ic('loc').replace('class="i', 'style="width:14px" class="i')}${demo ? 'Manila, Philippines' : esc(u.city) + ', Philippines'}</span><span class="row" style="gap:4px">${ic('cal').replace('class="i', 'style="width:14px" class="i')}Joined ${new Date(u.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></div></div></div>
  <div class="stats"><div><b>${demo ? 128 + mine.length : prods.length}</b><span>Stories</span></div><div><b>${demo ? '1.2M' : '0'}</b><span>Followers</span></div><div><b>${demo ? 345 : S.follows.length + S.aFollows.length}</b><span>Following</span></div><div><b>${fmt(tv)}</b><span>Total Views</span></div><div><b>${fmt(tl)}</b><span>Total Likes</span></div></div>
  <button class="btn" style="margin-top:12px;justify-content:space-between;padding:0 18px" data-go="#/people"><span class="row" style="gap:10px">${ic('users')} Friends &amp; people</span><span class="row" style="gap:8px"><b>${(S.friends || []).length}</b>${S.reqIn === null || (S.reqIn || []).length ? `<span class="badge" style="position:static">${(S.reqIn === null ? 2 : S.reqIn.length)}</span>` : ''}${ic('chevR')}</span></button>
  <div class="card" style="margin-top:12px"><div class="row sp"><b>${T.name} plan</b><button class="link" style="color:#a98bff" data-go="#/plans">Manage</button></div><div class="bar" style="margin:10px 0 6px"><i style="width:${T.stories === Infinity ? 100 : used / T.stories * 100}%"></i></div><div class="xs mute">${T.stories === Infinity ? `${used} stories this month · fair-use unlimited` : `${used} of ${T.stories} stories used · ${rem} left · resets ${Server.resetDate()}`}</div></div>
  <div class="chips" style="margin-top:14px">${[['stories', 'play', 'My Stories'], ['drafts', 'doc', 'My Drafts'], ['liked', 'heart', 'Liked'], ['saved', 'bookmark', 'Saved'], ['playlists', 'list', 'Playlists'], ['ach', 'trophy', 'Achievements']].map(t => `<button class="chip ${tab === t[0] ? 'on' : ''}" data-act="profTab" data-v="${t[0]}">${ic(t[1])}${t[2]}</button>`).join('')}</div>${content}`, { nav: 'profile' });
}
function notifications() {
  S.notifs.forEach(n => n.read = true); save();
  shell(`<div class="row sp" style="margin-bottom:10px"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><h2>Notifications</h2><div style="width:40px"></div></div>${S.notifs.length ? S.notifs.map(n => `<div class="ep"><div class="n">${ic('bell').replace('class="i', 'style="width:18px" class="i')}</div><div class="grow sm">${esc(n.text)}<div class="xs mute">${new Date(n.at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div></div>`).join('') : '<div class="empty">You’re all caught up.</div>'}`, { nav: null });
}
function legal(k) { shell(`<div class="row"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><h2>${k === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2></div><div class="card" style="margin-top:14px;line-height:1.6;font-size:14px">${k === 'terms' ? '<p>ICON is currently a supervised, <b>adults-only (18+) beta</b>. You are responsible for content you publish. Every actor in a production must approve public release of their performance. Content is moderated before publication.</p><p>Rankings use deduplicated engagement. Paid plans increase creation limits and never buy ranking.</p>' : '<p>Your public profile shows your name, handle, avatar and chosen city. We never show your email, date of birth or precise location. Account deletion removes your productions, takes and derived rankings.</p>'}<p class="xs mute">Placeholder text for the beta build. Replace with counsel-reviewed policies before launch.</p></div>`, { nav: null }); }

/* ---------- Plans ---------- */
function plans() {
  const cur = S.user?.tier || 'free';
  const feats = t => [t.stories === Infinity ? 'Fair-use unlimited stories / month' : `${t.stories} stories per month`, `Plan up to ${t.eps} min per story`, `Up to ${t.actors} actors`, 'All 6 genres · watch & discover free', 'Never affects leaderboard rank'];
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
  save(el) { if (!need('save stories')) return; const i = S.saved.indexOf(el.v); i < 0 ? S.saved.push(el.v) : S.saved.splice(i, 1); save(); toast(i < 0 ? 'Saved to Watch Later.' : 'Removed from Saved.'); router(); },
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
  if (r === 'story' && h.includes('?ref=')) { const ref = decodeURIComponent((h.split('?ref=')[1] || '').split('&')[0]); const id = parts[1]; const day = new Date().toDateString(), k = 'lk_' + id + '_' + ref; if (ref && S.user && S.user.handle !== ref && S.views[k] !== day) { S.views[k] = day; S.views['lo_' + id] = (S.views['lo_' + id] || 0) + 1; save(); } }
  if (!S.user && !['signup', 'login', 'legal', 'home', 'welcome'].includes(r)) { navAfterAuth = null; return go('#/home'); }
  if (S.user && r === 'welcome') return go('#/home');
  if (r === 'create' && !isAuthed()) { navAfterAuth = h; toast('Log in or create an account to create stories.'); return signup(); }
  if (r === 'create') return window.createRoute(route.args);
  ({ welcome, signup: () => signup(), login: () => login(), home, discover, leaderboard, profile, plans, notifications, story: () => story(parts[1]), actor: () => actor(parts[1]), legal: () => legal(parts[1]), people: () => window.peopleView() }[r] || home)();
}
window.addEventListener('hashchange', router);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });

/* mouse drag-to-scroll for horizontal rows */
(() => { let el = null, x0 = 0, s0 = 0, moved = false;
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; el = e.target.closest('.chips,.hs,.slides'); if (el) { x0 = e.clientX; s0 = el.scrollLeft; moved = false; } });
  document.addEventListener('pointermove', e => { if (!el) return; const d = e.clientX - x0; if (Math.abs(d) > 5) { moved = true; el.style.scrollSnapType = 'none'; el.scrollLeft = s0 - d; } });
  document.addEventListener('pointerup', () => { if (el) { const t = el; setTimeout(() => t.style.scrollSnapType = '', 50); } el = null; });
  document.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
})();

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

/* ---------- Comments: post, view, edit, like, delete (every video) ---------- */
const CM = { id: null, sort: 'Top', editing: null, deleting: null, draft: '' };
function cmList(id) {
  const s = getStory(id); const mine = (S.comments[id] = S.comments[id] || []);
  mine.forEach((c, i) => { if (!c.id) { c.id = 'c' + id + i; c.uid = c.uid || S.user?.id; c.at = c.at || Date.now(); } });
  const all = [...mine, ...seedComments(s)]; const lk = c => (c.base || 0) + (S.cl[c.id]?.length || 0);
  return all.sort((a, b) => CM.sort === 'Top' ? (lk(b) - lk(a)) || (b.at - a.at) : b.at - a.at);
}
function cmHtml(id) {
  const list = cmList(id); const uid = S.user?.id;
  if (!list.length) return `<div class="empty">No comments yet.<br>Be the first to comment.</div>`;
  return list.map(c => {
    const own = c.uid === uid, liked = !!S.cl[c.id]?.includes(uid), n = (c.base || 0) + (S.cl[c.id]?.length || 0);
    const body = CM.editing === c.id ? `<textarea id="cmEdit" maxlength="300" aria-label="Edit comment" style="min-height:64px;margin:6px 0">${esc(c.t)}</textarea><div class="row"><button class="btn sm pri" style="height:34px" data-act="cmSave" data-cid="${c.id}">Save</button><button class="btn sm" style="height:34px" data-act="cmCancel">Cancel</button><span class="xs mute" id="cmEc" style="margin-left:auto">${c.t.length}/300</span></div>` : `<div class="cmt">${esc(c.t)}</div>`;
    const actions = CM.editing === c.id ? '' : CM.deleting === c.id ? `<div class="row cmact"><span class="xs">Delete this comment?</span><button class="cmlink" style="color:var(--err)" data-act="cmDelYes" data-cid="${c.id}">Delete</button><button class="cmlink" data-act="cmCancel">Cancel</button></div>` : `<div class="row cmact"><button class="cmlike ${liked ? 'on' : ''}" data-act="cmLike" data-cid="${c.id}" aria-pressed="${liked}" aria-label="Like comment">${ic('heart', liked ? 'f' : '')}<span>${n}</span></button>${own ? `<button class="cmlink" data-act="cmEdit" data-cid="${c.id}">Edit</button><button class="cmlink" data-act="cmDel" data-cid="${c.id}">Delete</button>` : ''}</div>`;
    return `<div class="cmi" data-cid="${c.id}"><img class="avatar" style="width:36px;height:36px;border-width:1px" src="${IMG(own ? 'avatar' : ['a1', 'a2', 'a3', 'a4', 'a5'][c.n.length % 5])}" alt=""><div class="grow"><div class="row" style="gap:6px;flex-wrap:wrap"><b class="sm">${esc(c.n)}</b>${own ? '<span class="pill pk" style="padding:1px 7px">You</span>' : ''}<span class="xs mute">${ago(c.at)}${c.edited ? ' · edited' : ''}</span></div>${body}${actions}</div></div>`;
  }).join('');
}
function cmRefresh(keepScroll = true) {
  const l = $('#cmList'); if (!l) return; const top = l.scrollTop; l.innerHTML = cmHtml(CM.id);
  const s = getStory(CM.id); const n = ccount(s); const h = $('#cmCount'); if (h) h.textContent = fmt(n);
  if (keepScroll) l.scrollTop = top; const p = $('#pcc'); if (p) p.textContent = fmt(n); const c = $('#ccnt'); if (c) c.textContent = fmt(n);
  $('#cmEdit')?.addEventListener('input', e => { $('#cmEc').textContent = e.target.value.length + '/300'; });
}
function openComments(id) {
  CM.id = id; CM.editing = null; CM.deleting = null; const s = getStory(id); if (!s) return;
  const o = sheet(`<div class="row sp" style="margin:2px 0 8px"><h2 class="ddh" style="margin:0">Comments <span class="mute" id="cmCount" style="font-weight:600"></span></h2><button class="chip" style="height:32px;font-size:12.5px" data-act="cmSort" id="cmSort">${CM.sort === 'Top' ? 'Top' : 'Newest'} ${ic('sort').replace('class="i', 'style="width:14px" class="i')}</button></div><div id="cmList" class="cmlist"></div>
  <div class="cmbar"><img class="avatar" style="width:36px;height:36px;border-width:1px" src="${IMG('avatar')}" alt=""><label class="field" style="margin:0;height:46px;flex:1;padding:0 14px"><input id="cmIn" maxlength="300" placeholder="Add a comment…" aria-label="Add a comment" autocomplete="off"></label><button class="btn sm pri" id="cmPost" style="height:46px" disabled>Post</button></div><div class="xs mute" style="margin-top:6px;text-align:right" id="cmCnt">0/300</div>`);
  $('.sheet', o).classList.add('cmsheet'); cmRefresh(false);
  const inp = $('#cmIn', o), post = $('#cmPost', o);
  inp.value = CM.draft; inp.addEventListener('input', () => { CM.draft = inp.value; post.disabled = !inp.value.trim(); $('#cmCnt', o).textContent = inp.value.length + '/300'; });
  const send = () => {
    if (!need('comment')) return; const t = inp.value.trim(); if (!t) return;
    const mine = (S.comments[id] = S.comments[id] || []);
    if (mine.some(c => c.t === t && Date.now() - c.at < 60000)) return toast('You already posted that.');
    mine.unshift({ id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), uid: S.user.id, n: S.user.name, t, at: Date.now(), base: 0 });
    save(); inp.value = ''; CM.draft = ''; post.disabled = true; $('#cmCnt', o).textContent = '0/300'; CM.sort = 'Newest'; $('#cmSort', o).firstChild.textContent = 'Newest '; cmRefresh(false); $('#cmList').scrollTop = 0;
  };
  post.onclick = send; inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
}
Object.assign(H, {
  cmSort() { CM.sort = CM.sort === 'Top' ? 'Newest' : 'Top'; $('#cmSort').firstChild.textContent = CM.sort + ' '; cmRefresh(false); },
  cmLike(el) { if (!need('like comments')) return; const a = (S.cl[el.cid] = S.cl[el.cid] || []); const i = a.indexOf(S.user.id); i < 0 ? a.push(S.user.id) : a.splice(i, 1); save(); cmRefresh(); },
  cmEdit(el) { CM.editing = el.cid; CM.deleting = null; cmRefresh(); $('#cmEdit')?.focus(); },
  cmSave(el) { const t = $('#cmEdit').value.trim(); if (!t) return toast('A comment can’t be empty.'); const c = (S.comments[CM.id] || []).find(x => x.id === el.cid); if (!c || c.uid !== S.user.id) return; if (t !== c.t) { c.t = t; c.edited = true; save(); } CM.editing = null; cmRefresh(); },
  cmCancel() { CM.editing = null; CM.deleting = null; cmRefresh(); },
  cmDel(el) { CM.deleting = el.cid; CM.editing = null; cmRefresh(); },
  cmDelYes(el) { const a = S.comments[CM.id] || []; const i = a.findIndex(x => x.id === el.cid && x.uid === S.user.id); if (i >= 0) { a.splice(i, 1); delete S.cl[el.cid]; save(); } CM.deleting = null; cmRefresh(); toast('Comment deleted.'); },
});
