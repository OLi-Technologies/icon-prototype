/* ICON v2 UI: floating nav, header, Home (Home + Discover merged), Search, Clips, Story, Player, Comments with replies */
window.HC = window.HC || {};
const UI = { muted: true };
const ordTxt = ['1st', '2nd', '3rd'];

/* ---------- Floating bottom nav (line icons off, filled icons on, avatar with stroke) ---------- */
function navBar(a) {
  const b = (id, on, off, l, h) => `<button class="${a === id ? 'on' : ''}" data-go="${h}" aria-label="${l}" ${a === id ? 'aria-current="page"' : ''}>${a === id ? on : off}<span>${l}</span></button>`;
  return `<nav aria-label="Main">${b('home', ic('home', 'fs'), ic('home'), 'Home', '#/home')}${b('clips', ic('clipsF', 'f'), ic('clips'), 'Clips', '#/clips')}${b('create', ic('plusqF', 'f'), ic('plusq'), 'Create', '#/create')}${b('leaderboard', ic('trophy', 'fs'), ic('trophy'), 'Ranks', '#/leaderboard')}<button class="${a === 'profile' ? 'on' : ''}" data-go="#/profile" aria-label="Profile" ${a === 'profile' ? 'aria-current="page"' : ''}><img class="me" src="${IMG('avatar')}" alt=""><span>Profile</span></button></nav>`;
}
function header() {
  const n = unread();
  return `<div class="hdr"><div data-go="#/home" class="hlogo" role="link" aria-label="ICON home">${logo(22, false)}</div><div class="row" style="gap:0"><button class="hbtn" data-go="#/search" aria-label="Search">${ic('search')}</button><button class="hbtn" style="position:relative" data-go="#/notifications" aria-label="Notifications${n ? ', ' + n + ' new' : ''}">${ic('bell')}${n ? `<span class="dot">${Math.min(n, 9)}</span>` : ''}</button></div></div>`;
}
const topBack = (title, right = '') => `<div class="hdr"><button class="hbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><b class="htitle">${title}</b><div class="hside">${right}</div></div>`;
const tabsRow = (list, cur, act) => `<div class="tabs" role="tablist">${list.map(t => `<button role="tab" aria-selected="${cur === t[0]}" class="${cur === t[0] ? 'on' : ''}" data-act="${act}" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>`;
const filterChip = (id, { label, options, value, onChange, show, title }) => { DD[id] = { title: title || label, options: options.map(ddOpt), value: value == null ? '' : String(value), onChange }; const cur = DD[id].options.find(o => o[0] === DD[id].value); return `<button type="button" class="fc ${value && value !== 'All' && value !== 'Global' ? 'on' : ''}" data-act="ddOpen" data-id="${id}" aria-haspopup="dialog" aria-label="${esc(label)}: ${esc(cur ? cur[1] : '')}"><span id="ddv-${id}">${show || esc(cur ? cur[1] : label)}</span>${ic('chevD')}</button>`; };
const countryDD = (id, value, onChange, allLabel = 'All countries') => filterChip(id, { label: 'Country', title: 'Country', options: [['All', allLabel], ...CNAMES], value: value || 'All', onChange, show: value && value !== 'All' ? `${flag(value)} ${esc(value)}` : flag('Global') + ' ' + allLabel });

/* ---------- Cards ---------- */
function vcard(s, { w = 116, h = 160, rank } = {}) {
  return `<div class="vc" style="width:${w}px" data-go="#/story/${s.id}" role="link" tabindex="0" aria-label="${esc(s.title)}"><div class="poster" style="height:${h}px;border-radius:10px"><img src="${IMG(s.img)}" alt="" loading="lazy">${rank ? `<span class="rk">${rank}</span>` : ''}<span class="fg" title="${esc(s.country)}">${flag(s.country)}</span><span class="pl">${icf('play')}</span><div class="in"><div class="vt">${esc(s.title)}</div><div class="vs">${ic('eye')}${fmt(sv(s))}</div></div></div></div>`;
}
const egrid = (list, rank = false) => list.length ? `<div class="eg">${list.map((s, i) => `<div class="egi" data-go="#/story/${s.id}" role="link" tabindex="0" aria-label="${esc(s.title)}"><img src="${IMG(s.img)}" alt="" loading="lazy">${rank ? `<span class="rk">${i + 1}</span>` : ''}<span class="fg">${flag(s.country)}</span><div class="egm">${ic('eye')}${fmt(sv(s))}</div><div class="egt">${esc(s.title)}</div></div>`).join('')}</div>` : `<div class="empty">Nothing here yet.</div>`;
const ring = (img, size = 56, extra = '') => `<span class="ring" style="width:${size}px;height:${size}px"><img src="${IMG(img)}" alt="" ${extra}></span>`;

/* ---------- Home (Home + Discover) ---------- */
const HERO = ['s1', 's12', 's5', 's15', 's9'];
const HTABS = [['foryou', 'For you'], ['trending', 'Trending'], ['new', 'New releases'], ['genre', 'Genre'], ['actors', 'Actors'], ['country', 'Country']];
function prefGenres() {
  const w = {}; const add = (id, wt) => { const s = getStory(id); if (s && s.genre) w[s.genre] = (w[s.genre] || 0) + wt; };
  S.likes.forEach(id => add(id, 3)); S.saved.forEach(id => add(id, 2)); Object.keys(S.views).forEach(k => { if (k.startsWith('p_')) add(k.slice(2), 2); });
  const a = Object.entries(w).sort((x, y) => y[1] - x[1]).map(x => x[0]); return a.length ? a.slice(0, 2) : ['Romance', 'Drama'];
}
function nextWatch() {
  const pg = prefGenres(); const seen = new Set(Object.keys(S.views).filter(k => k.startsWith('p_')).map(k => k.slice(2)));
  const pool = allStories().filter(s => !HERO.includes(s.id) && !seen.has(s.id));
  const l = pool.filter(s => pg.includes(s.genre)); pool.filter(s => !l.includes(s) && pg.some(g => s.tags.includes(g))).forEach(s => l.push(s));
  pool.filter(s => !l.includes(s)).forEach(s => l.push(s)); return { list: l.slice(0, 9), pg };
}
function heroHtml() {
  return `<div class="hero2"><div class="hslides" id="hslides">${HERO.map((id, i) => { const s = getStory(id); const f = S.follows.includes(id); return `<div class="hs2" data-i="${i}"><video ${i ? '' : `src="${s.clip}" autoplay`} data-src="${s.clip}" poster="${IMG(s.img)}" muted playsinline preload="${i ? 'none' : 'auto'}"></video><div class="hsh"></div><div class="hin" data-go="#/story/${id}"><span class="pill pk">Featured series</span><h1>${esc(s.title)}</h1><div class="htag">${esc(s.tagline)}</div><div class="hmeta">${flag(s.country)} · ${s.genre} · ${s.eps} episodes · ${ic('eye').replace('class="i', 'style="width:12px;vertical-align:-2px" class="i')} ${fmt(sv(s))}</div></div><div class="hbtns"><button class="btn pri sm" data-go="#/story/${id}">${icf('play').replace('class="i', 'style="width:12px" class="i')} Watch now</button><button class="btn sm glass" data-act="followStory" data-v="${id}">${f ? 'Following' : '+ My list'}</button></div></div>`; }).join('')}</div><button class="hmute" data-act="hMute" aria-label="Turn sound on">${ic('mute')}</button><div class="hdots" id="hdots">${HERO.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>`;
}
function initHero() {
  const h = $('#hslides'); if (!h) return; const slides = $$('.hs2', h);
  const act = i => { slides.forEach((sl, k) => { const v = $('video', sl); if (k === i) { if (!v.getAttribute('src')) v.src = v.dataset.src; v.muted = UI.muted; try { v.currentTime = 0; } catch { } v.play().catch(() => { }); } else v.pause(); }); $$('#hdots i').forEach((d, k) => d.classList.toggle('on', k === i)); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) act(+e.target.dataset.i); }), { root: h, threshold: [.6] });
  slides.forEach(sl => { io.observe(sl); $('video', sl).addEventListener('ended', () => { const nx = (+sl.dataset.i + 1) % slides.length; h.scrollTo({ left: nx * h.clientWidth, behavior: 'smooth' }); }); });
}
function peopleRow(p, right) {
  return `<div class="urow"><div class="row grow" style="min-width:0;cursor:pointer" data-go="#/actor/${p.id}">${ring(p.img, 44)}<div style="min-width:0"><b class="un">${esc(p.name)}</b><div class="xs mute ell">@${esc(p.handle)} · ${flag(p.country)} · ${fmt(p.followers)} followers</div></div></div>${right}</div>`;
}
const followBtn = id => `<button class="btn sm ${S.aFollows.includes(id) ? '' : 'pri'}" data-act="pFollow" data-v="${id}" style="min-width:84px">${S.aFollows.includes(id) ? 'Following' : 'Follow'}</button>`;
function home() {
  if (!S.user) return landing();
  if (!HTABS.some(t => t[0] === S.homeTab)) S.homeTab = 'foryou';
  const T = S.homeTab; let body = '';
  const all = allStories();
  if (T === 'foryou') {
    const tr = [...all].filter(s => !HERO.includes(s.id)).sort((a, b) => sv(b) - sv(a)).slice(0, 9); const nw = nextWatch();
    body = `${heroHtml()}
    ${secHead('Trending stories', 'See all', 'data-act="homeTab" data-v="trending"')}<div class="hs">${tr.map((s, i) => vcard(s, { rank: i + 1 })).join('')}</div>
    ${secHead('Your next watch', '', '')}<div class="xs mute" style="margin:-4px 0 8px">Because you like ${nw.pg.join(' & ')}</div><div class="hs">${nw.list.map(s => vcard(s, { w: 116, h: 150 })).join('')}</div>
    ${secHead('Popular actors', 'See all', 'data-act="homeTab" data-v="actors"')}<div class="hs" style="gap:14px">${ACTORS.map(a => `<div class="center" style="width:62px;flex:none;cursor:pointer" data-go="#/actor/${a.id}">${ring(a.img, 58)}<div class="xs ell" style="margin-top:5px;font-weight:600">${esc(a.name.split(' ')[0])}</div><div class="xs mute">${flag(a.country)}</div></div>`).join('')}</div>
    <div class="cta" data-go="#/create" role="link" tabindex="0">${ic('plusq').replace('class="i', 'style="width:26px;height:26px;color:#c9a8ff" class="i')}<div class="grow"><b>Share your own series</b><div class="xs mute">Record or upload a 60-second episode, 9:16.</div></div>${ic('chevR')}</div>`;
  } else if (T === 'trending') body = egrid([...all].sort((a, b) => sv(b) - sv(a)).slice(0, 18), true);
  else if (T === 'new') body = egrid([...userStories(), ...[...STORIES].reverse()].slice(0, 18));
  else if (T === 'genre') { const g = S.hGenre; const gs = ['All', ...GENRES.map(x => x[0])]; body = `<div class="chips sub">${gs.map(x => `<button class="chip ${g === x ? 'on' : ''}" data-act="hGenre" data-v="${x}">${x === 'All' ? 'All genres' : x}</button>`).join('')}</div>${egrid(all.filter(s => g === 'All' || s.genre === g || s.tags.includes(g)).sort((a, b) => sv(b) - sv(a)))}`; }
  else if (T === 'actors') body = `<div style="margin-top:6px">${PEOPLE.filter(p => p.actor).map(p => peopleRow(p, followBtn(p.id))).join('')}</div>`;
  else { const c = S.hCountry; body = `<div class="fline">${countryDD('hc', c, v => { S.hCountry = v; save(); router(); })}</div>${egrid(all.filter(s => c === 'All' || s.country === c).sort((a, b) => sv(b) - sv(a)))}`; }
  shell(`${header()}${tabsRow(HTABS, T, 'homeTab')}${body}`, { nav: 'home' });
  if (T === 'foryou') initHero();
}
Object.assign(H, {
  hGenre(el) { S.hGenre = el.v; save(); router(); },
  hMute() { UI.muted = !UI.muted; $$('.hs2 video').forEach(v => v.muted = UI.muted); $('.hmute').innerHTML = ic(UI.muted ? 'mute' : 'volume'); },
});

/* ---------- Search ---------- */
function searchPage() {
  const q = S.disc.q || '';
  shell(`<div class="hdr"><button class="hbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><label class="search">${ic('search')}<input id="sq" placeholder="Search series, actors, countries" value="${esc(q)}" aria-label="Search" autocomplete="off"></label></div><div id="sres">${searchRes(q)}</div>`, { nav: 'home' });
  const i = $('#sq'); i.addEventListener('input', () => { S.disc.q = i.value; $('#sres').innerHTML = searchRes(i.value); }); if (!q) i.focus();
}
function searchRes(q) {
  q = q.trim().toLowerCase();
  if (!q) return `<div class="sec"><h2>Try searching</h2></div><div class="chips sub">${['Romance', 'Comedy', 'Philippines', 'Thriller', 'Singapore', 'Mystery'].map(x => `<button class="chip" data-act="sqTry" data-v="${x}">${x}</button>`).join('')}</div>${secHead('Trending now')}${egrid([...allStories()].sort((a, b) => sv(b) - sv(a)).slice(0, 6))}`;
  const ss = allStories().filter(s => (s.title + ' ' + s.genre + ' ' + s.country + ' ' + s.tags.join(' ')).toLowerCase().includes(q));
  const pp = PEOPLE.filter(p => (p.name + ' ' + p.handle + ' ' + p.country).toLowerCase().includes(q));
  return `${pp.length ? secHead('People') + pp.map(p => peopleRow(p, followBtn(p.id))).join('') : ''}${ss.length ? secHead('Series') + egrid(ss) : ''}${!pp.length && !ss.length ? '<div class="empty">No results.</div>' : ''}`;
}
Object.assign(H, { sqTry(el) { S.disc.q = el.v; searchPage(); } });

/* ---------- Story page ---------- */
function story(id) {
  const s = getStory(id); if (!s) return shell(`${topBack('Series')}<div class="empty">This series isn’t available.</div>`, { nav: 'home' });
  if (s.isClip) return go('#/clips');
  const f = S.follows.includes(id), lk = S.likes.includes(id), sd = S.saved.includes(id); const cast = s.cast.map(person).filter(Boolean);
  const seen = S.views['p_' + id] || 0; const eps = Array.from({ length: s.eps }, (_, i) => i + 1);
  shell(`<div class="shero"><img src="${IMG(s.img)}" alt=""><div class="shade2"></div><div class="stop"><button class="gbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><div class="row" style="gap:8px"><button class="gbtn" data-act="share" data-v="${id}" aria-label="Share">${ic('share')}</button><button class="gbtn" data-act="report" data-v="${id}" aria-label="Report">${ic('flag')}</button></div></div><div class="sinfo"><div class="row wrap" style="gap:6px;margin-bottom:6px"><span class="pill vi">${s.genre}</span><span class="pill">${flag(s.country)} ${esc(s.country)}</span>${s.mine ? '<span class="pill ok">Yours</span>' : ''}</div><h1>${esc(s.title)}</h1><div class="hand" style="font-size:17px;margin-top:3px">${esc(s.tagline)}</div></div></div>
  <div class="row" style="margin:12px 0 10px;gap:8px"><button class="btn pri grow" data-act="play" data-v="${id}|1">${icf('play').replace('class="i', 'style="width:14px" class="i')} ${seen ? 'Continue' : 'Watch episode 1'}</button><button class="sqb ${lk ? 'on' : ''}" data-act="like" data-v="${id}" aria-pressed="${lk}" aria-label="Like">${ic('heart', lk ? 'f' : '')}</button><button class="sqb ${sd ? 'on2' : ''}" data-act="save" data-v="${id}" aria-label="Save">${ic('bookmark', sd ? 'f' : '')}</button></div>
  <div class="stat sstat"><span>${ic('eye')}${fmt(sv(s))}</span><span style="color:#ff5ad0">${icf('heart')}${fmt(slikes(s))}</span><button data-act="comments" data-v="${id}" class="stat" style="gap:5px">${ic('comment')}<span id="ccnt">${fmt(ccount(s))}</span></button><span class="mute">${s.eps} episode${s.eps > 1 ? 's' : ''}</span></div>
  <p class="syn">${esc(s.syn)}</p>
  <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm ${f ? '' : 'pri'} grow" style="height:32px" data-act="followStory" data-v="${id}">${f ? 'Following series' : 'Follow series'}</button>${s.mine ? `<button class="btn sm grow" style="height:32px" data-act="addEpisode" data-v="${s.prodId}">${ic('plus')} Add episode</button>` : ''}</div>
  ${cast.length ? `${secHead('Cast')}<div class="hs" style="gap:14px">${cast.map(a => `<div class="center" style="width:58px;flex:none;cursor:pointer" data-go="#/actor/${a.id}">${ring(a.img, 52)}<div class="xs ell" style="margin-top:4px;font-weight:600">${esc(a.name.split(' ')[0])}</div></div>`).join('')}</div>` : ''}
  ${secHead('Episodes')}${eps.map(n => { const e = s.episodes?.[n - 1]; return `<div class="eprow" data-act="play" data-v="${id}|${n}" role="button" tabindex="0"><div class="poster" style="width:46px;height:72px;border-radius:8px;flex:none"><img src="${IMG(e?.thumb || s.img)}" alt=""><span class="pl">${icf('play')}</span></div><div class="grow" style="min-width:0"><b class="sm ell" style="display:block">${n}. ${esc(e?.title || 'Episode ' + n)}</b><div class="xs mute">0:${String(e?.dur ? Math.min(60, Math.round(e.dur)) : [45, 52, 60][n % 3]).padStart(2, '0')} · ${ic('eye').replace('class="i', 'style="width:11px;vertical-align:-2px" class="i')} ${fmt(epViews(s, n))}</div>${e?.desc ? `<div class="xs mute ell">${esc(e.desc)}</div>` : ''}</div></div>`; }).join('')}`, { nav: 'home' });
}

/* ---------- Actor / person page ---------- */
function actor(id) {
  const a = person(id); if (!a) return go('#/home'); const f = S.aFollows.includes(id); const st = STORIES.filter(s => s.cast.includes(id));
  shell(`${topBack('@' + esc(a.handle), `<button class="hbtn" data-act="report" data-v="${id}" aria-label="Report">${ic('flag')}</button>`)}
  <div class="row" style="gap:16px;margin:6px 0 10px">${ring(a.img, 76)}<div class="grow"><div class="pstats"><div><b>${st.length}</b><span>Series</span></div><div><b>${fmt(a.followers + (f ? 1 : 0))}</b><span>Followers</span></div><div><b>${fmt(st.reduce((t, s) => t + s.views, 0))}</b><span>Views</span></div></div></div></div>
  <div><b>${esc(a.name)}</b></div><div class="xs mute" style="margin:2px 0 10px">${flag(a.country)} ${esc(a.country)}${a.actor ? ` · #${ACTORS.indexOf(ACTORS.find(x => x.id === id)) + 1} actor` : ''}</div>
  <div class="row" style="gap:8px"><button class="btn sm ${f ? '' : 'pri'} grow" style="height:32px" data-act="pFollow" data-v="${id}">${f ? 'Following' : 'Follow'}</button><button class="btn sm grow" style="height:32px" data-act="share" data-v="${id}">Share profile</button></div>
  ${secHead('Series')}${st.length ? egrid(st) : '<div class="empty">No public series yet.</div>'}`, { nav: 'home' });
}

/* ---------- Reel body shared by the player and Clips ---------- */
function ownerOf(s) {
  if (s.mine) return { id: S.user.id, name: S.user.name, img: 'avatar', self: true };
  const id = s.actor || s.cast[0]; const p = person(id); return p ? { id: p.id, name: p.name, img: p.img } : { id: 'a1', name: 'ICON', img: 'a1' };
}
function reelBody(s, n = 1, ep = null) {
  const lk = S.likes.includes(s.id), sd = S.saved.includes(s.id), o = ownerOf(s);
  const sub = s.isClip ? esc(s.cap || s.tagline) : esc(ep?.desc || s.tagline);
  return `<div class="rail2"><button data-act="rLike" data-v="${s.id}" class="${lk ? 'on' : ''}" aria-label="Like" aria-pressed="${lk}">${ic('heart', lk ? 'f' : '')}<span>${fmt(slikes(s))}</span></button><button data-act="rCm" data-v="${s.id}" aria-label="Comments">${ic('comment')}<span class="cc-${s.id}">${fmt(ccount(s))}</span></button><button data-act="rShare" data-v="${s.id}" aria-label="Share">${ic('share')}</button><button data-act="rSave" data-v="${s.id}" class="${sd ? 'on2' : ''}" aria-label="Save">${ic('bookmark', sd ? 'f' : '')}</button><button data-act="rMore" data-v="${s.id}" aria-label="More">${ic('dotsh')}</button></div>
  <div class="rinfo"><div class="row" style="gap:8px"><span data-go="${o.self ? '#/profile' : '#/actor/' + o.id}" class="row" style="gap:8px;cursor:pointer">${ring(o.img, 30)}<b class="rn">${esc(o.name)}</b></span>${o.self ? '' : `<button class="fbtn" data-act="rFollow" data-v="${o.id}">${S.aFollows.includes(o.id) ? 'Following' : 'Follow'}</button>`}</div><div class="rt">${s.isClip ? '' : `<b>${esc(s.title)}</b> · ${s.eps > 1 || !s.isClip ? `Ep ${n}` : ''} `}<span class="rcap">${sub}</span></div><div class="rm">${ic('eye')}<span class="vw-${s.id}">${fmt(s.isClip ? sv(s) : epViews(s, n))}</span> · ${flag(s.country)} ${esc(s.country)}${s.isClip && s.series ? ` · <button class="rlink" data-go="#/story/${s.series}">Watch series ›</button>` : ''}</div></div>`;
}
Object.assign(H, {
  rLike(el, e) { if (!need('like videos')) return; H.like({ v: el.v }, true); const b = e.target.closest('button'); const s = getStory(el.v), l = S.likes.includes(el.v); b.classList.toggle('on', l); b.setAttribute('aria-pressed', l); b.innerHTML = ic('heart', l ? 'f' : '') + `<span>${fmt(slikes(s))}</span>`; },
  rCm(el) { openComments(el.v); },
  rShare(el) { H.share({ v: el.v }); },
  rSave(el, e) { if (!need('save videos')) return; const i = S.saved.indexOf(el.v); i < 0 ? S.saved.push(el.v) : S.saved.splice(i, 1); save(); const b = e.target.closest('button'); b.classList.toggle('on2', i < 0); b.innerHTML = ic('bookmark', i < 0 ? 'f' : ''); toast(i < 0 ? 'Saved.' : 'Removed from saved.', 1400); },
  rFollow(el) { if (!need('follow people')) return; const i = S.aFollows.indexOf(el.v); i < 0 ? S.aFollows.push(el.v) : S.aFollows.splice(i, 1); save(); $$(`[data-act=rFollow][data-v="${el.v}"]`).forEach(b => b.textContent = i < 0 ? 'Following' : 'Follow'); },
  rMore(el) { sheet(`<h2 class="ddh">More</h2><button class="btn" style="margin-top:6px;justify-content:flex-start;padding-left:14px" data-act="share" data-v="${el.v}">${ic('share')} Share</button><button class="btn" style="margin-top:8px;justify-content:flex-start;padding-left:14px" data-act="report" data-v="${el.v}">${ic('flag')} Report</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`); },
});

/* ---------- Player (Reels style) ---------- */
function play(id, n) {
  if (!S.user) return;
  const s = getStory(id); if (!s) return;
  const ep = s.mine ? (s.episodes || [])[n - 1] : null; const E = ep?.edits || null;
  const blob = s.mine ? Blobs.get(`${s.prodId}:${n}`) : null; const src = blob || (!s.mine ? s.clip : null); const dur = 8;
  const o = document.createElement('div'); o.className = 'player'; let paused = false;
  o.innerHTML = `${src ? `<video src="${src}" playsinline autoplay muted loop style="filter:${E ? fxCss(E) : 'none'}"></video>` : `<img class="pimg" src="${IMG(ep?.thumb || s.img)}" alt="">`}${E?.caption ? `<div class="capov ${E.pos}">${esc(E.caption)}</div>` : ''}<div class="shade"></div>
  <div class="ptop"><button class="pbtn" data-x="close" aria-label="Back">${ic('chevL')}</button><span class="pep">Episode ${n} of ${s.eps}</span><button class="pbtn" data-x="mute" aria-label="Sound">${ic(UI.muted ? 'mute' : 'volume')}</button></div>
  <div class="pmid" data-x="pp"><span id="pbig" class="bigplay" style="display:none">${icf('play')}</span></div>${reelBody(s, n, ep)}<div class="pbar"><i id="pbar"></i></div>
  ${!src && s.mine ? '<div class="pnote">Video files aren’t kept after a reload in this prototype.</div>' : ''}`;
  app.append(o); const vid = $('video', o);
  if (vid) { vid.muted = UI.muted; if (E) { vid.playbackRate = E.speed || 1; vid.volume = Math.min(1, (E.vol ?? 100) / 100); const lo = E.start || 0, hi = E.end || 0; vid.addEventListener('loadedmetadata', () => { if (lo) vid.currentTime = lo; }); vid.addEventListener('timeupdate', () => { if (hi && vid.currentTime >= hi) vid.currentTime = lo; }); } }
  const total = () => vid && vid.duration && isFinite(vid.duration) ? vid.duration : dur; let t = 0;
  const counted = () => { const k = `q_${id}_${n}`, day = new Date().toDateString(); if (S.views[k] !== day) { S.views[k] = day; S.views['add_' + id] = (S.views['add_' + id] || 0) + 1; S.views['ev_' + id + '_' + n] = (S.views['ev_' + id + '_' + n] || 0) + 1; const pv = $('.vw-' + id, o); if (pv) pv.textContent = fmt(epViews(s, n)); S.views['p_' + id] = n; save(); const p = S.published.find(x => 'u_' + x.id === id); if (p) { p.views = (p.views || 0) + 1; save(); } } };
  clearInterval(playTimer); playTimer = setInterval(() => { if (paused) return; t = vid ? vid.currentTime : t + .25; const T = total() || 1; const st = (E?.start) || 0; $('#pbar', o).style.width = Math.min(100, Math.max(0, (t - st) / ((E?.end || T) - st || 1) * 100)) + '%'; if (t >= Math.min(10, T * .5)) counted(); }, 250);
  o.addEventListener('click', e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') { clearInterval(playTimer); o.remove(); router(); } else if (x === 'mute') { UI.muted = !UI.muted; if (vid) vid.muted = UI.muted; e.target.closest('button').innerHTML = ic(UI.muted ? 'mute' : 'volume'); }
    else if (x === 'pp') { paused = !paused; vid && (paused ? vid.pause() : vid.play()); $('#pbig', o).style.display = paused ? 'grid' : 'none'; }
  });
}

/* ---------- Clips: vertical 9:16 feed ---------- */
function clipItem(c) {
  return `<section class="clip" data-id="${c.id}" aria-label="${esc(c.cap)}"><video data-src="${c.src}" poster="${IMG(c.img)}" muted playsinline loop preload="none"></video><div class="shade"></div><span class="bigplay cpp" style="display:none">${icf('play')}</span><span class="hpop">${icf('heart')}</span>${reelBody(c, 1)}<div class="pbar"><i></i></div></section>`;
}
function clips() {
  shell(`<div class="ctop"><h2>Clips</h2><div class="row" style="gap:0"><button class="hbtn" data-act="cSound" id="csound" aria-label="Sound">${ic(UI.muted ? 'mute' : 'volume')}</button><button class="hbtn" data-go="#/search" aria-label="Search">${ic('search')}</button><button class="hbtn" data-go="#/create" aria-label="Record a clip">${ic('camera')}</button></div></div><div class="clips" id="clips">${CLIPS.map(clipItem).join('')}</div>`, { nav: 'clips', flush: true });
  const root = $('#clips'); const secs = $$('.clip', root); let cur = null;
  const load = sc => { const v = $('video', sc); if (v && !v.getAttribute('src')) v.src = v.dataset.src; return v; };
  const activate = sc => {
    secs.forEach(x => { if (x !== sc) { const v = $('video', x); if (v) { v.pause(); } } }); cur = sc; const v = load(sc); v.muted = UI.muted; v.play().catch(() => { });
    const i = secs.indexOf(sc); if (secs[i + 1]) load(secs[i + 1]);
    clearTimeout(sc._t); sc._t = setTimeout(() => { const c = getStory(sc.dataset.id), k = 'q_' + c.id, day = new Date().toDateString(); if (cur === sc && S.views[k] !== day) { S.views[k] = day; S.views['add_' + c.id] = (S.views['add_' + c.id] || 0) + 1; save(); const w = $('.vw-' + c.id, sc); if (w) w.textContent = fmt(sv(c)); } }, 3000);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) activate(e.target); }), { root, threshold: [.7] });
  secs.forEach(sc => { io.observe(sc); const v = $('video', sc); v.addEventListener('timeupdate', () => { if (v.duration) $('.pbar i', sc).style.width = v.currentTime / v.duration * 100 + '%'; }); let last = 0;
    sc.addEventListener('click', e => { if (e.target.closest('button,a,[data-go]')) return; const now = Date.now(); if (now - last < 300) { last = 0; sc.classList.remove('pop'); void sc.offsetWidth; sc.classList.add('pop'); if (!S.likes.includes(sc.dataset.id)) $('[data-act=rLike]', sc).click(); return; } last = now; setTimeout(() => { if (last !== now) return; last = 0; if (v.paused) { v.play().catch(() => { }); $('.cpp', sc).style.display = 'none'; } else { v.pause(); $('.cpp', sc).style.display = 'grid'; } }, 310); }); });
}
Object.assign(H, { cSound() { UI.muted = !UI.muted; $$('.clip video').forEach(v => v.muted = UI.muted); $('#csound').innerHTML = ic(UI.muted ? 'mute' : 'volume'); toast(UI.muted ? 'Sound off' : 'Sound on', 900); } });

/* ---------- Comments with replies ---------- */
const CM = { id: null, sort: 'Top', editing: null, deleting: null, draft: '', reply: null, open: new Set() };
const cmReplies = c => [...(c.r || []), ...(S.cr[c.id] || [])].sort((a, b) => a.at - b.at);
function cmList(id) {
  const s = getStory(id); const mine = (S.comments[id] = S.comments[id] || []);
  mine.forEach((c, i) => { if (!c.id) { c.id = 'c' + id + i; c.uid = c.uid || S.user?.id; c.at = c.at || Date.now(); } });
  const all = [...mine, ...seedComments(s)]; const lk = c => (c.base || 0) + (S.cl[c.id]?.length || 0);
  return all.sort((a, b) => CM.sort === 'Top' ? (lk(b) - lk(a)) || (b.at - a.at) : b.at - a.at);
}
function cmRow(c, top, parent) {
  const uid = S.user?.id, own = c.uid === uid, liked = !!S.cl[c.id]?.includes(uid), n = (c.base || 0) + (S.cl[c.id]?.length || 0);
  const av = IMG(own ? 'avatar' : ['a1', 'a2', 'a3', 'a4', 'a5'][c.n.length % 5]); const ed = CM.editing === c.id;
  const body = ed ? `<textarea id="cmEdit" maxlength="300" aria-label="Edit comment" style="min-height:56px;margin:4px 0">${esc(c.t)}</textarea><div class="row"><button class="btn sm pri" style="height:28px" data-act="cmSave" data-cid="${c.id}">Save</button><button class="btn sm" style="height:28px" data-act="cmCancel">Cancel</button><span class="xs mute" id="cmEc" style="margin-left:auto">${c.t.length}/300</span></div>` : `<div class="cmt">${esc(c.t)}</div>`;
  const acts = ed ? '' : CM.deleting === c.id ? `<div class="cmact"><span class="xs">Delete this ${top ? 'comment' : 'reply'}?</span><button class="cmlink" style="color:var(--err)" data-act="cmDelYes" data-cid="${c.id}">Delete</button><button class="cmlink" data-act="cmCancel">Cancel</button></div>` : `<div class="cmact"><button class="cmlink" data-act="cmReply" data-cid="${top ? c.id : parent.id}" data-nm="${esc(c.n)}" ${top ? '' : 'data-m="1"'}>Reply</button>${own ? `<button class="cmlink" data-act="cmEdit" data-cid="${c.id}">Edit</button><button class="cmlink" data-act="cmDel" data-cid="${c.id}">Delete</button>` : ''}</div>`;
  let reps = '';
  if (top) { const rs = cmReplies(c); if (rs.length) { const open = CM.open.has(c.id); reps = `<button class="cmview" data-act="cmToggle" data-cid="${c.id}" aria-expanded="${open}"><i></i>${open ? 'Hide replies' : `View ${rs.length} ${rs.length > 1 ? 'replies' : 'reply'}`}</button>${open ? `<div class="cmreps">${rs.map(r => cmRow(r, false, c)).join('')}</div>` : ''}`; } }
  return `<div class="cmi ${top ? '' : 'rp'}" data-cid="${c.id}"><img class="cav" src="${av}" alt=""><div class="grow"><div class="cmh"><b>${esc(c.n)}</b>${own ? '<span class="you">You</span>' : ''}<span class="mute">${ago(c.at)}${c.edited ? ' · edited' : ''}</span></div>${body}${acts}${reps}</div><button class="cmlk ${liked ? 'on' : ''}" data-act="cmLike" data-cid="${c.id}" aria-pressed="${liked}" aria-label="Like ${top ? 'comment' : 'reply'}">${ic('heart', liked ? 'f' : '')}<span>${n || ''}</span></button></div>`;
}
const cmHtml = id => { const l = cmList(id); return l.length ? l.map(c => cmRow(c, true)).join('') : `<div class="empty">No comments yet.<br>Start the conversation.</div>`; };
function cmRefresh(keep = true) {
  const l = $('#cmList'); if (!l) return; const top = l.scrollTop; l.innerHTML = cmHtml(CM.id);
  const s = getStory(CM.id); const n = ccount(s); const h = $('#cmCount'); if (h) h.textContent = fmt(n);
  if (keep) l.scrollTop = top; $$('.cc-' + CM.id).forEach(x => x.textContent = fmt(n)); const c = $('#ccnt'); if (c) c.textContent = fmt(n);
  $('#cmEdit')?.addEventListener('input', e => { $('#cmEc').textContent = e.target.value.length + '/300'; });
  const rb = $('#cmReplyBar'); if (rb) { rb.style.display = CM.reply ? 'flex' : 'none'; if (CM.reply) $('#cmReplyTo').textContent = CM.reply.nm; }
  const inp = $('#cmIn'); if (inp) inp.placeholder = CM.reply ? `Reply to ${CM.reply.nm}…` : 'Add a comment…';
}
function openComments(id) {
  CM.id = id; CM.editing = null; CM.deleting = null; CM.reply = null; const s = getStory(id); if (!s) return;
  const o = sheet(`<div class="cmhead"><b>Comments <span class="mute" id="cmCount"></span></b><button class="chip" style="height:26px;font-size:11.5px;padding:0 10px" data-act="cmSort" id="cmSort">${CM.sort === 'Top' ? 'Top' : 'Newest'} ${ic('sort').replace('class="i', 'style="width:12px" class="i')}</button></div><div id="cmList" class="cmlist"></div>
  <div class="cmrb" id="cmReplyBar" style="display:none"><span>Replying to <b id="cmReplyTo"></b></span><button class="cmlink" data-act="cmCancelReply" aria-label="Cancel reply">${ic('x').replace('class="i', 'style="width:14px" class="i')}</button></div>
  <div class="cmbar"><img class="cav" src="${IMG('avatar')}" alt=""><label class="cmfield"><input id="cmIn" maxlength="300" placeholder="Add a comment…" aria-label="Add a comment" autocomplete="off"></label><button class="cmpost" id="cmPost" disabled>Post</button></div>`);
  $('.sheet', o).classList.add('cmsheet'); cmRefresh(false);
  const inp = $('#cmIn', o), post = $('#cmPost', o);
  inp.value = CM.draft; post.disabled = !inp.value.trim(); inp.addEventListener('input', () => { CM.draft = inp.value; post.disabled = !inp.value.trim(); });
  const send = () => {
    if (!need('comment')) return; const t = inp.value.trim(); if (!t) return;
    const base = { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), uid: S.user.id, n: S.user.name, at: Date.now(), base: 0 };
    let wasReply = false;
    if (CM.reply) { wasReply = true; const r = CM.reply; (S.cr[r.cid] = S.cr[r.cid] || []).push({ ...base, sid: id, t: (r.mention ? '@' + r.nm + ' ' : '') + t }); CM.open.add(r.cid); CM.reply = null; }
    else { const mine = (S.comments[id] = S.comments[id] || []); if (mine.some(c => c.t === t && Date.now() - c.at < 60000)) return toast('You already posted that.'); mine.unshift({ ...base, t }); CM.sort = 'Newest'; $('#cmSort', o).firstChild.textContent = 'Newest '; }
    save(); inp.value = ''; CM.draft = ''; post.disabled = true; cmRefresh(false); if (!wasReply) $('#cmList').scrollTop = 0;
  };
  post.onclick = send; inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
}
function cmFind(cid) {
  const a = S.comments[CM.id] || []; let i = a.findIndex(x => x.id === cid); if (i >= 0) return { arr: a, i, c: a[i] };
  for (const k of Object.keys(S.cr)) { i = S.cr[k].findIndex(x => x.id === cid); if (i >= 0) return { arr: S.cr[k], i, c: S.cr[k][i] }; } return null;
}
Object.assign(H, {
  cmSort() { CM.sort = CM.sort === 'Top' ? 'Newest' : 'Top'; $('#cmSort').firstChild.textContent = CM.sort + ' '; cmRefresh(false); },
  cmLike(el) { if (!need('like comments')) return; const a = (S.cl[el.cid] = S.cl[el.cid] || []); const i = a.indexOf(S.user.id); i < 0 ? a.push(S.user.id) : a.splice(i, 1); save(); cmRefresh(); },
  cmEdit(el) { CM.editing = el.cid; CM.deleting = null; cmRefresh(); $('#cmEdit')?.focus(); },
  cmSave(el) { const t = $('#cmEdit').value.trim(); if (!t) return toast('It can’t be empty.'); const f = cmFind(el.cid); if (!f || f.c.uid !== S.user.id) return; if (t !== f.c.t) { f.c.t = t; f.c.edited = true; save(); } CM.editing = null; cmRefresh(); },
  cmCancel() { CM.editing = null; CM.deleting = null; cmRefresh(); },
  cmDel(el) { CM.deleting = el.cid; CM.editing = null; cmRefresh(); },
  cmDelYes(el) { const f = cmFind(el.cid); if (f && f.c.uid === S.user.id) { f.arr.splice(f.i, 1); delete S.cl[el.cid]; if (S.cr[el.cid]) delete S.cr[el.cid]; save(); } CM.deleting = null; cmRefresh(); toast('Deleted.', 1500); },
  cmReply(el) { if (!need('reply')) return; CM.reply = { cid: el.cid, nm: el.nm, mention: !!el.m }; CM.open.add(el.cid); cmRefresh(); $('#cmIn')?.focus(); },
  cmCancelReply() { CM.reply = null; cmRefresh(); },
  cmToggle(el) { CM.open.has(el.cid) ? CM.open.delete(el.cid) : CM.open.add(el.cid); cmRefresh(); },
});
