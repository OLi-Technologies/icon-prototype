/* ICON v2 social: people, follow requests, invites, Instagram-style notifications, profile, leaderboard, settings */
const PEOPLE = [...ACTORS.map(a => ({ ...a, actor: true })),
  { id: 'x1', name: 'Ria Mendoza', handle: 'riamendoza', img: 'smile', followers: 12400, country: 'Philippines' },
  { id: 'x2', name: 'Paolo Dizon', handle: 'paolodizon', img: 'man', followers: 8300, country: 'Japan' },
  { id: 'x3', name: 'Lia Cortez', handle: 'liacortez', img: 'encounter', followers: 5100, country: 'Philippines' },
  { id: 'x4', name: 'Migs Ramos', handle: 'migsramos', img: 'trio', followers: 3900, country: 'Australia' },
  { id: 'x5', name: 'Jessa Tan', handle: 'jessatan', img: 'roommates', followers: 2800, country: 'Singapore' }];
const person = id => PEOPLE.find(p => p.id === id);
const ago2 = ts => { const m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : m < 10080 ? Math.round(m / 1440) + 'd' : Math.round(m / 10080) + 'w'; };

/* seed demo social graph + notification feed the first time a signed-in user opens it */
function soc() {
  if (S.followers === null) S.followers = ['a2', 'x1', 'x4'];
  if (S.reqIn === null) S.reqIn = ['a4', 'x3', 'x5'];
  if (!S.nf) {
    const H = 3600e3, D = 24 * H, now = Date.now(); const mine = S.published.find(p => p.status === 'published'); const my = mine ? 'u_' + mine.id : 's9';
    S.nf = [
      { id: 'n1', type: 'invite', who: 'a1', story: 's1', at: now - 2 * H, read: false },
      { id: 'n2', type: 'rank', story: 's2', at: now - 1 * D, read: false },
      { id: 'n3', type: 'like', who: 'a2', story: my, at: now - 5 * H, read: false },
      { id: 'n4', type: 'follow', who: 'x1', at: now - 1.2 * D, read: false },
      { id: 'n5', type: 'comment', who: 'x2', story: my, text: 'Beautiful framing!', at: now - 2 * D, read: true },
      { id: 'n6', type: 'suggest', who: 'x3', at: now - 3 * D, read: true },
      { id: 'n7', type: 'follow', who: 'x4', at: now - 9 * D, read: true },
      { id: 'n8', type: 'system', text: 'Welcome to ICON. Every video is up to 60 seconds, shot or cropped to 9:16.', at: now - 12 * D, read: true },
    ]; save();
  }
}
function unreadN() { if (!S.user) return 0; soc(); return S.reqIn.length + S.nf.filter(n => !n.read && !n.done).length + S.notifs.filter(n => !n.read).length; }
const seriesUsed = () => { const k = d => { const x = new Date(d + 8 * 3600e3); return x.getUTCFullYear() + '-' + x.getUTCMonth(); }; const now = k(Date.now()); return S.published.filter(p => k(p.created || p.date) === now).length; };

/* ---------- Notifications (Instagram structure) ---------- */
function nText(n) {
  const p = n.who ? person(n.who) : null; const st = n.story ? getStory(n.story) : null; const nm = p ? `<b>${esc(p.name)}</b>` : '';
  return { invite: `${nm} invited you to act in <b>“${esc(st?.title || 'a series')}”</b>.`, rank: `<b>“${esc(st?.title || 'Your series')}”</b> is #1 in ${flag(st?.country)} ${esc(st?.country || 'Global')} for Most Watched this week.`, like: `${nm} liked your series <b>“${esc(st?.title || '')}”</b>.`, comment: `${nm} commented: “${esc(n.text || '')}”`, follow: `${nm} started following you.`, suggest: `${nm}, who you might know, is on ICON.`, system: esc(n.text || '') }[n.type];
}
function nRight(n) {
  const st = n.story ? getStory(n.story) : null; const th = st ? `<span class="nth" data-go="#/story/${st.id}"><img src="${IMG(st.img)}" alt=""></span>` : '';
  if (n.type === 'invite') return n.done ? `<span class="xs mute">${n.done === 'accepted' ? 'Accepted' : 'Declined'}</span>` : `<div class="row" style="gap:6px;flex:none"><button class="btn sm pri" data-act="nfAccept" data-v="${n.id}">Accept</button><button class="btn sm" data-act="nfDecline" data-v="${n.id}">Decline</button></div>`;
  if (n.type === 'follow' || n.type === 'suggest') { const f = S.aFollows.includes(n.who); return `<button class="btn sm ${f ? '' : 'pri'}" data-act="pFollow" data-v="${n.who}" style="flex:none;min-width:84px">${f ? 'Following' : n.type === 'follow' ? 'Follow back' : 'Follow'}</button>`; }
  return th;
}
function nRow(n) {
  const p = n.who ? person(n.who) : null;
  const av = p ? `<span class="ring ${n.read ? '' : 'new'}" style="width:44px;height:44px"><img src="${IMG(p.img)}" alt=""></span>` : `<span class="sysav">${logo(10, false).replace(/<small.*?<\/small>/, '')}<i>${ic(n.type === 'rank' ? 'trophy' : 'bell')}</i></span>`;
  return `<div class="nrow ${n.read ? '' : 'unr'}" data-nid="${n.id}">${av}<div class="grow nt" ${p && n.type !== 'invite' ? `data-go="#/actor/${p.id}"` : ''}>${nText(n)} <span class="mute">${ago2(n.at)}</span></div>${nRight(n)}</div>`;
}
function notifications() {
  soc(); S.notifs.forEach(n => n.read = true);
  const all = [...S.nf, ...S.notifs.map(n => ({ id: 'sn' + n.id, type: 'system', text: n.text, at: n.at, read: true }))].sort((a, b) => b.at - a.at);
  const feat = all.filter(n => n.type === 'invite' || n.type === 'rank'); const rest = all.filter(n => !feat.includes(n));
  const wk = rest.filter(n => Date.now() - n.at < 7 * 864e5), old = rest.filter(n => !wk.includes(n));
  const rq = S.reqIn.map(person).filter(Boolean);
  const reqRow = rq.length ? `<div class="nrow reqrow" data-go="#/people/requests" role="link" tabindex="0"><span class="stack">${rq.slice(0, 2).map((p, i) => `<img src="${IMG(p.img)}" alt="" style="${i ? 'right:0;bottom:0' : 'left:0;top:0'}">`).join('')}</span><div class="grow"><b>Follow requests</b><div class="xs mute">${esc(rq[0].handle)}${rq.length > 1 ? ` + ${rq.length - 1} other${rq.length > 2 ? 's' : ''}` : ''}</div></div><i class="bdot"></i>${ic('chevR')}</div>` : '';
  const sec = (t, l) => l.length ? `<div class="nsec">${t}</div>${l.map(nRow).join('')}` : '';
  shell(`${topBack('Notifications')}${reqRow}${sec('Featured', feat)}${sec('Last 7 days', wk)}${sec('Earlier', old)}${!all.length && !rq.length ? '<div class="empty">You’re all caught up.</div>' : ''}`, { nav: 'home' });
  S.nf.forEach(n => n.read = true); save();
}
Object.assign(H, {
  nfAccept(el) { const n = S.nf.find(x => x.id === el.v); if (!n) return; n.done = 'accepted'; save(); toast('You’re in! You can now record your part.', 2200); notifications(); },
  nfDecline(el) { const n = S.nf.find(x => x.id === el.v); if (!n) return; n.done = 'declined'; save(); notifications(); },
  pFollow(el) {
    if (!need('follow people')) return; const i = S.aFollows.indexOf(el.v); i < 0 ? S.aFollows.push(el.v) : S.aFollows.splice(i, 1); save();
    $$(`[data-act=pFollow][data-v="${el.v}"]`).forEach(b => { const on = i < 0; b.classList.toggle('pri', !on); const was = b.textContent.trim(); b.textContent = on ? 'Following' : (was === 'Following' && b.dataset.fb ? 'Follow back' : 'Follow'); });
  },
  reqConfirm(el) { soc(); S.reqIn = S.reqIn.filter(x => x !== el.v); if (!S.followers.includes(el.v)) S.followers.push(el.v); save(); toast(`<b>${esc(person(el.v).name)}</b> now follows you.`, 1800); peopleView('requests'); },
  reqDelete(el) { S.reqIn = S.reqIn.filter(x => x !== el.v); save(); peopleView('requests'); },
  pTab(el) { go('#/people/' + el.v); },
  pInvite() { const url = location.href.split('#')[0] + '#/signup?invite=' + (S.user?.handle || ''); (navigator.clipboard?.writeText(url).then(() => toast('Invite link copied.')).catch(() => toast('Copy the link from your address bar.'))) || toast('Copy the link from your address bar.'); },
});

/* ---------- Followers / Following / Invites / Requests ---------- */
const PQ = { q: '' };
function peopleView(tab = 'followers') {
  soc(); if (!['followers', 'following', 'invites', 'requests'].includes(tab)) tab = 'followers';
  const fl = S.followers.map(person).filter(Boolean), fg = S.aFollows.map(person).filter(Boolean), inv = S.nf.filter(n => n.type === 'invite');
  const q = PQ.q.trim().toLowerCase(); const match = p => !q || (p.name + p.handle).toLowerCase().includes(q);
  const row = (p, right) => `<div class="urow"><div class="row grow" style="min-width:0;cursor:pointer" data-go="#/actor/${p.id}">${ring(p.img, 44)}<div style="min-width:0"><b class="un">${esc(p.handle)}</b><div class="xs mute ell">${esc(p.name)} · ${flag(p.country)}</div></div></div>${right}</div>`;
  let body = '';
  if (tab === 'followers') body = fl.filter(match).map(p => row(p, `<button class="btn sm ${S.aFollows.includes(p.id) ? '' : 'pri'}" data-act="pFollow" data-v="${p.id}" data-fb="1" style="min-width:90px">${S.aFollows.includes(p.id) ? 'Following' : 'Follow back'}</button>`)).join('') || '<div class="empty">No followers yet.<br>Share your series to grow your audience.</div>';
  else if (tab === 'following') body = fg.filter(match).map(p => row(p, `<button class="btn sm" data-act="pFollow" data-v="${p.id}" style="min-width:90px">Following</button>`)).join('') || '<div class="empty">You’re not following anyone yet.<br><button class="link" style="color:#a98bff;display:inline;margin-top:8px" data-go="#/home">Find actors on Home</button></div>';
  else if (tab === 'invites') body = `<div class="card row" style="margin:10px 0;gap:10px">${ic('userplus').replace('class="i', 'style="width:24px;height:24px;color:#b388ff" class="i')}<div class="grow"><b class="sm">Invite friends to ICON</b><div class="xs mute">Share your link. They join, you grow your cast.</div></div><button class="btn sm pri" data-act="pInvite">${ic('share')} Invite</button></div>${secHead('Cast invitations')}${inv.length ? inv.map(n => { const p = person(n.who), st = getStory(n.story); return `<div class="urow"><div class="row grow" style="min-width:0">${ring(p.img, 44)}<div style="min-width:0"><b class="un">${esc(p.handle)}</b><div class="xs mute ell">invited you to “${esc(st?.title || '')}” · ${ago2(n.at)}</div></div></div>${n.done ? `<span class="xs mute">${n.done === 'accepted' ? 'Accepted' : 'Declined'}</span>` : `<div class="row" style="gap:6px"><button class="btn sm pri" data-act="nfAcc2" data-v="${n.id}">Accept</button><button class="btn sm" data-act="nfDec2" data-v="${n.id}">Decline</button></div>`}</div>`; }).join('') : '<div class="empty">No cast invitations right now.</div>'}`;
  else body = S.reqIn.map(person).filter(Boolean).map(p => row(p, `<div class="row" style="gap:6px;flex:none"><button class="btn sm pri" data-act="reqConfirm" data-v="${p.id}">Confirm</button><button class="btn sm" data-act="reqDelete" data-v="${p.id}">Delete</button></div>`)).join('') || '<div class="empty">No follow requests.</div>';
  const T = [['followers', `${fmt(S.followers.length + (S.user.demo ? 1200000 : 0))} followers`], ['following', `${S.aFollows.length + (S.user.demo ? 345 : 0)} following`], ['invites', `Invites${inv.filter(n => !n.done).length ? ' · ' + inv.filter(n => !n.done).length : ''}`]];
  shell(`${topBack(tab === 'requests' ? 'Follow requests' : '@' + esc(S.user.handle))}${tab === 'requests' ? '' : `<div class="tabs3" role="tablist">${T.map(t => `<button role="tab" aria-selected="${tab === t[0]}" class="${tab === t[0] ? 'on' : ''}" data-act="pTab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>`}${['followers', 'following'].includes(tab) ? `<label class="search" style="margin:10px 0 4px">${ic('search')}<input id="pq" placeholder="Search" value="${esc(PQ.q)}" aria-label="Search people" autocomplete="off"></label>` : ''}<div id="plist">${body}</div>`, { nav: 'profile' });
  $('#pq')?.addEventListener('input', e => { PQ.q = e.target.value; const pos = e.target.selectionStart; peopleView(tab); const i = $('#pq'); i.focus(); i.setSelectionRange(pos, pos); });
}
Object.assign(H, {
  nfAcc2(el) { H.nfAccept(el); peopleView('invites'); },
  nfDec2(el) { H.nfDecline(el); peopleView('invites'); },
});
window.peopleView = peopleView;

/* ---------- Profile ---------- */
function statsBreak(kind) {
  const u = S.user, demo = u.demo; const key = kind === 'views' ? 'views' : 'likes';
  const mine = S.published.filter(p => p.status === 'published').map(p => ({ t: p.title, img: p.thumb || gimg(p.genre), v: p[key] || 0 }));
  const seed = demo ? [['City Lights', 'man', 320000], ['Coffee and Confessions', 'couple2', 560000], ['Just Friends?', 'smile', 780000], ['Beyond Tomorrow', 'beyond', 410000], ['The Last Message', 'lastmsg', 690000]].map(x => ({ t: x[0], img: x[1], v: kind === 'views' ? x[2] * 6 : Math.round(x[2] / 20) })) : [];
  const rows = [...mine, ...seed].sort((a, b) => b.v - a.v); const tot = rows.reduce((t, r) => t + r.v, 0) + (demo ? (kind === 'views' ? 15600000 - 3 * 2000000 : 0) : 0);
  sheet(`<h2 class="ddh">Total ${kind}</h2><div class="gt" style="font-size:26px;font-weight:800;margin:0 0 8px">${fmt(kind === 'views' ? Math.max(tot, rows.reduce((t, r) => t + r.v, 0)) : rows.reduce((t, r) => t + r.v, 0))}</div><div class="ddlist" style="max-height:44dvh">${rows.map(r => `<div class="urow"><div class="poster" style="width:38px;height:50px;border-radius:7px;flex:none"><img src="${IMG(r.img)}" alt=""></div><b class="grow sm ell">${esc(r.t)}</b><b class="sm">${fmt(r.v)}</b></div>`).join('') || '<div class="empty">Publish a series to see your numbers here.</div>'}</div><button class="btn" style="margin-top:12px" data-act="closeSheet">Close</button>`);
}
function profileMain() {
  if (!S.user) return shell(`<div class="empty" style="padding-top:70px">${ic('user').replace('class="i', 'style="width:48px;height:48px;color:#6b6d99" class="i')}<h2 style="margin:10px 0 4px;color:#fff">Your ICON profile</h2><p>Log in to create series, follow actors and track your stats.</p><div class="row" style="margin-top:16px"><button class="btn pri" data-go="#/signup">Create account</button><button class="btn" data-go="#/login">Log in</button></div></div>`, { nav: 'profile' });
  soc(); const u = S.user, demo = u.demo, mine = S.published; const live = mine.filter(p => p.status === 'published');
  const tv = mine.reduce((t, p) => t + (p.views || 0), 0) + (demo ? 15600000 : 0), tl = mine.reduce((t, p) => t + (p.likes || 0), 0) + (demo ? 482000 : 0);
  const seeded = demo ? [['City Lights', 'man', 320000, '2 days ago'], ['Coffee and Confessions', 'couple2', 560000, '5 days ago'], ['Just Friends?', 'smile', 780000, '1 week ago'], ['Beyond Tomorrow', 'beyond', 410000, '1 week ago'], ['The Last Message', 'lastmsg', 690000, '2 weeks ago']].map(x => ({ t: x[0], img: x[1], v: x[2], kind: 'Published', st: 'seed' })) : [];
  const ups = [...mine.map(p => ({ t: p.title, img: p.thumb || gimg(p.genre), v: p.views || 0, kind: p.status === 'review' ? 'In review' : 'Published', st: p.status, id: p.id, n: (p.episodes || []).length || p.eps || 1 })), ...S.drafts.map(d => ({ t: d.epTitle || d.seriesTitle || 'Untitled draft', img: d.thumb || gimg(d.genre || 'Drama'), v: 0, kind: 'Drafts', st: 'draft', id: d.id })), ...seeded];
  const uf = S.upFilter; const fl = ups.filter(x => uf === 'All' || x.kind === uf); const tab = S.profTab; let content = '';
  const TABS = [['stories', 'grid', 'Series'], ['drafts', 'doc', 'Drafts'], ['liked', 'heart', 'Liked'], ['saved', 'bookmark', 'My list'], ['playlists', 'list', 'Playlists'], ['ach', 'trophy', 'Achievements']];
  if (tab === 'stories') content = `<div class="chips sub" style="margin-top:10px">${['All', 'Published', 'In review', 'Drafts'].map(f => `<button class="chip ${uf === f ? 'on' : ''}" data-act="upFilter" data-v="${f}">${f}</button>`).join('')}</div>${fl.length ? `<div class="eg" style="margin-top:8px">${fl.map(x => `<div class="egi" ${x.st === 'published' ? `data-go="#/story/u_${x.id}"` : x.st === 'seed' ? '' : `data-act="${x.st === 'draft' ? 'draftOpen' : 'reviewOpen'}" data-v="${x.id}"`} role="button" tabindex="0"><img src="${IMG(x.img)}" alt="">${x.kind === 'In review' ? '<span class="stag warn">In review</span>' : x.kind === 'Drafts' ? '<span class="stag">Draft</span>' : ''}<div class="egm">${ic('eye')}${fmt(x.v)}</div><div class="egt">${esc(x.t)}</div></div>`).join('')}</div>` : `<div class="empty">Nothing here yet.<br><button class="link" style="color:#a98bff;display:inline;margin-top:8px" data-go="#/create">Create your first series</button></div>`}`;
  else if (tab === 'drafts') { const d = S.drafts; content = d.length ? d.map(p => `<div class="urow"><div class="poster" style="width:44px;height:60px;border-radius:8px;flex:none"><img src="${IMG(p.thumb || gimg(p.genre || 'Drama'))}" alt=""></div><div class="grow" style="min-width:0"><b class="sm ell" style="display:block">${esc(p.epTitle || p.seriesTitle || 'Untitled draft')}</b><div class="xs mute">${p.seriesMode === 'existing' ? 'New episode' : esc(p.seriesTitle || 'New series')} · draft</div></div><button class="btn sm pri" data-act="draftOpen" data-v="${p.id}">Continue</button><button class="iconbtn" data-act="draftDel" data-v="${p.id}" aria-label="Delete draft">${ic('trash')}</button></div>`).join('') : '<div class="empty">No drafts. Tap Save draft when creating.</div>'; }
  else if (tab === 'liked' || tab === 'saved') { const l = allStories().filter(s => S[tab === 'liked' ? 'likes' : 'saved'].includes(s.id)); content = `<div class="row sp" style="margin:10px 0 6px"><b>${tab === 'liked' ? 'Liked' : 'My list'}</b><span class="xs mute">${l.length} ${l.length === 1 ? 'series' : 'series'}</span></div>` + (l.length ? egrid(l) : `<div class="empty">${tab === 'liked' ? 'Series you like' : 'Tap + My list on a series to add it here'} will show up here.</div>`); }
  else if (tab === 'playlists') content = `<div class="row sp" style="margin:12px 0 6px"><b>Playlists</b><button class="btn sm pri" data-act="newPl">+ New</button></div>${[...S.playlists.map(n => [n, 0]), ...(demo ? [['My favorites', 24], ['Feel good', 18], ['Drama hits', 16]] : [])].map(p => `<div class="urow"><span class="plic">${ic('list')}</span><div class="grow"><b class="sm">${esc(p[0])}</b><div class="xs mute">${p[1]} series</div></div></div>`).join('') || '<div class="empty">Create a playlist to organise series.</div>'}<div class="urow"><span class="plic">${ic('clock')}</span><div class="grow"><b class="sm">Watch later</b><div class="xs mute">${S.saved.length} saved</div></div></div>`;
  else { const ach = [['First episode', 'Publish your first episode', live.length > 0], ['Series starter', 'Publish a series with 2+ episodes', mine.some(p => (p.episodes || []).length > 1 && p.status === 'published')], ['Going live', 'Pass moderation', live.length > 0], ['Top 5 · Philippines · Oct 2026', 'Weekly window (demo account)', demo]]; content = `<div style="margin-top:10px">${ach.map(a => `<div class="urow"><span class="plic" style="${a[2] ? 'background:rgba(255,200,61,.2);color:#ffc83d' : 'opacity:.45'}">${ic('trophy')}</span><div class="grow"><b class="sm">${a[0]}</b><div class="xs mute">${a[1]}</div></div>${a[2] ? '<span class="pill ok">Earned</span>' : ic('lock')}</div>`).join('')}</div>`; }
  const stat = (n, l, act) => `<button class="pst" data-act="${act}"><b>${n}</b><span>${l}</span></button>`;
  shell(`<div class="hdr"><b class="htitle left">@${esc(u.handle)}</b><div class="row" style="gap:0"><button class="hbtn" data-go="#/create" aria-label="Create">${ic('plusq')}</button><button class="hbtn" style="position:relative" data-go="#/messages" aria-label="Messages">${ic('msg')}${msgUnread() ? `<span class="dot">${Math.min(msgUnread(), 9)}</span>` : ''}</button><button class="hbtn" style="position:relative" data-go="#/notifications" aria-label="Notifications">${ic('bell')}${unread() ? `<span class="dot">${Math.min(unread(), 9)}</span>` : ''}</button><button class="hbtn" data-act="settings" aria-label="Settings">${ic('gear')}</button></div></div>
  <div class="row" style="gap:14px;margin:4px 0 10px;align-items:center"><div style="position:relative;cursor:pointer" data-act="photo" role="button" tabindex="0" aria-label="Change profile photo"><span class="ring" style="width:76px;height:76px"><img src="${IMG('avatar')}" alt=""></span><span class="camb">${ic('camera').replace('class="i', 'style="width:12px" class="i')}</span></div><div class="grow"><b style="font-size:15px">${esc(u.name)}</b>${u.verified ? ' <span class="vfy">✓</span>' : ''}<div class="xs mute" style="margin-top:2px">${flag(u.country)} ${esc(u.country || 'Philippines')} · Joined ${new Date(u.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div><div class="sm" style="margin-top:4px">${demo ? 'Stories make life more interesting. 💜' : 'New on ICON ✨'}</div></div></div>
  <div class="pstats5">${stat(demo ? 128 + live.length : live.length, 'Series', 'pStories')}${stat(fmt((demo ? 1200000 : 0) + S.followers.length), 'Followers', 'pFollowers')}${stat(fmt((demo ? 345 : 0) + S.aFollows.length), 'Following', 'pFollowing')}${stat(fmt(tv), 'Views', 'pViews')}${stat(fmt(tl), 'Likes', 'pLikes')}</div>
  <div class="row" style="gap:8px;margin:10px 0 12px"><button class="btn sm grow" style="height:32px" data-act="editProfile">Edit profile</button><button class="btn sm grow" style="height:32px" data-act="share" data-v="${u.id}">Share profile</button><button class="btn sm" style="height:32px;width:36px;padding:0" data-go="#/people/invites" aria-label="Invites">${ic('userplus')}</button></div>
  <div class="ptabs" role="tablist">${TABS.map(t => `<button role="tab" aria-selected="${tab === t[0]}" aria-label="${t[2]}" class="${tab === t[0] ? 'on' : ''}" data-act="profTab" data-v="${t[0]}">${ic(t[1], tab === t[0] && ['heart', 'bookmark'].includes(t[1]) ? 'fs' : '')}</button>`).join('')}</div>${content}`, { nav: 'profile' });
}
Object.assign(H, {
  pStories() { H.profTab({ v: 'stories' }); $('.ptabs')?.scrollIntoView({ block: 'start' }); },
  pFollowers() { go('#/people/followers'); }, pFollowing() { go('#/people/following'); }, pViews() { statsBreak('views'); }, pLikes() { statsBreak('likes'); },
  draftOpen(el) { HC.resumeDraft(el.v); },
  draftDel(el) { sheet(`<h2>Delete draft?</h2><p class="mute sm">This removes the draft and its episodes.</p><button class="btn danger" data-act="draftDelYes" data-v="${el.v}">Delete draft</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`); },
  draftDelYes(el) { S.drafts = S.drafts.filter(p => p.id !== el.v); save(); closeSheet(); router(); },
  reviewOpen(el) { const p = S.published.find(x => x.id === el.v); sheet(`<h2 class="ddh">${esc(p?.title || 'In review')}</h2><p class="mute sm">A moderator is checking rights, consent and media. You’ll be notified when it goes live.</p><button class="btn pri" data-act="approve" data-v="${el.v}">Simulate moderator approval (demo)</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Close</button>`); },
  approve(el) { const p = S.published.find(x => x.id === el.v || x.prodId === el.v); if (!p) return; p.status = 'published'; p.date = Date.now(); save(); notify(`“${p.title}” passed review and is live.`); closeSheet(); toast('Approved (demo). Your series is live!'); go('#/story/u_' + p.id); },
  settings() {
    const u = S.user, T = TIERS[u.tier], used = seriesUsed(), lim = Server.uploadLimit(u);
    const o = sheet(`<h2 class="ddh">Settings</h2><div class="card" style="margin-bottom:10px"><div class="row sp"><b>${ic('crown').replace('class="i', 'style="width:15px;vertical-align:-3px;color:#ffd966" class="i')} ${T.name} plan</b><button class="link" style="color:#a98bff" data-go="#/plans" onclick="closeSheet()">${T.name === 'Free' ? 'Upgrade' : 'Manage'}</button></div><div class="bar" style="margin:8px 0 5px;height:6px"><i style="width:${T.stories === Infinity ? 100 : Math.min(100, used / T.stories * 100)}%"></i></div><div class="xs mute">${T.stories === Infinity ? `${used} series this month · fair-use unlimited` : `${used} of ${T.stories} new series this month · resets ${Server.resetDate()}`} · up to ${T.eps} episodes per series</div></div>
    <div class="srow">${ic('film')}<span class="grow">Max video length<div class="xs mute">Set by ICON for your account</div></span><b>${lim}s</b></div>
    <label class="srow">${ic('bell')}<span class="grow">Episode notifications<div class="xs mute">Safety and account messages are always sent.</div></span><input type="checkbox" id="nt" ${S.prefs.notif ? 'checked' : ''} style="width:20px;height:20px;accent-color:#7c4dff"></label>
    <button class="srow" data-go="#/messages/blocked" onclick="closeSheet()">${ic('ban')}<span class="grow" style="text-align:left">Blocked users${(S.blocked || []).length ? ` <span class="xs mute">(${S.blocked.length})</span>` : ''}</span></button><button class="srow" data-act="exportData">${ic('upload')}<span class="grow" style="text-align:left">Export my data</span></button><button class="srow" data-act="soon">${ic('flag')}<span class="grow" style="text-align:left">Appeal a moderation decision</span></button><button class="srow" data-act="logout">${ic('logout')}<span class="grow" style="text-align:left">Log out</span></button><button class="srow" style="color:#ff8da1" data-act="delAcct">${ic('trash')}<span class="grow" style="text-align:left">Delete account</span></button><div class="xs mute" style="margin-top:8px">Cancelling a subscription and deleting your account are separate actions.</div>`);
    $('#nt', o).onchange = e => { S.prefs.notif = e.target.checked; save(); };
  },
});

/* ---------- Leaderboard ---------- */
function leaderboard() {
  if (!PERIODS.includes(S.lb.period)) S.lb.period = 'This Week'; const L = S.lb; if (L.geo !== 'Global' && !CNAMES.includes(L.geo)) L.geo = 'Global';
  const pf = { 'This Week': .1, 'This Month': .38, 'This Quarter': 1 }[L.period];
  const pool = allStories().filter(s => (L.genre === 'All' || s.genre === L.genre) && (L.geo === 'Global' || s.country === L.geo));
  const metric = s => L.rank === 'Most Watched' ? sv(s) : L.rank === 'Most Popular' ? slikes(s) + 3 * Math.round(slikes(s) * .21) : ccount(s);
  let rows;
  if (L.entity === 'Stories') rows = pool.map(s => ({ id: s.id, name: s.title, pill: s.genre, country: s.country, img: s.img, v: Math.round(metric(s) * pf), mine: s.mine, go: `#/story/${s.id}` }));
  else { const m = {}; pool.forEach(s => s.cast.forEach(c => m[c] = (m[c] || 0) + metric(s))); if (S.user) { const mi = pool.filter(s => s.mine); if (mi.length) m.me = mi.reduce((t, s) => t + metric(s), 0); } rows = Object.entries(m).map(([k, v]) => { if (k === 'me') return { id: 'me', name: S.user.name, pill: 'You', country: S.user.country, img: 'avatar', v: Math.round(v * pf), mine: true, go: '#/profile' }; const a = person(k); return a ? { id: k, name: a.name, pill: '@' + a.handle, country: a.country, img: a.img, v: Math.round(v * pf), go: `#/actor/${k}` } : null; }).filter(Boolean); }
  rows = rows.filter(r => r.v > 0).sort((a, b) => b.v - a.v).slice(0, 10);
  const me = rows.findIndex(r => r.mine); const prized = L.rank === 'Most Watched', PR = PRIZES[L.period], rg = periodRange(L.period);
  const short = { 'Most Watched': 'Watched', 'Most Popular': 'Popular', 'Most Commented': 'Commented' };
  const chips = `<div class="fline">${filterChip('lb-rank', { label: 'Rank by', options: ['Most Watched', 'Most Popular', 'Most Commented'], value: L.rank, show: short[L.rank], onChange: v => { S.lb.rank = v; save(); router(); } })}${filterChip('lb-period', { label: 'Period', options: PERIODS, value: L.period, show: L.period.replace('This ', ''), onChange: v => { S.lb.period = v; save(); router(); } })}${filterChip('lb-genre', { label: 'Genre', options: ['All', ...GENRES.map(g => g[0])], value: L.genre, show: L.genre === 'All' ? 'All genres' : L.genre, onChange: v => { S.lb.genre = v; save(); router(); } })}${countryDD('lb-geo', L.geo === 'Global' ? 'All' : L.geo, v => { S.lb.geo = v === 'All' ? 'Global' : v; save(); router(); }, 'Global')}</div>`;
  const crown = ic('crown').replace('class="i', 'style="width:14px;color:#ffc83d" class="i');
  const pod = (r, i) => `<div class="pod p${i + 1}" data-go="${r.go}" role="link" tabindex="0" aria-label="${ordTxt[i]} place: ${esc(r.name)}"><img src="${IMG(r.img)}" alt="" style="${L.entity === 'Actors' ? 'object-position:center 20%' : ''}"><div class="shade"></div><div class="rn">${crown}<b>${i + 1}</b></div><span class="fg">${flag(r.country)}</span><div class="info"><b class="pt">${esc(r.name)}</b><div class="pv">${ic('eye')}${fmt(r.v)}</div>${prized ? `<span class="prz">${peso(PR[i])}</span>` : ''}</div></div>`;
  const podium = rows.length >= 3 ? `<div class="podium">${[1, 0, 2].map(i => pod(rows[i], i)).join('')}</div>` : '';
  const rest = rows.length >= 3 ? rows.slice(3) : rows; const off = rows.length >= 3 ? 3 : 0;
  const strip = prized ? `<div class="pstrip"><span>${ic('trophy').replace('class="i', 'style="width:15px;color:#ffc83d" class="i')}</span>${PR.map((p, i) => `<b class="p${i + 1}">${['🥇', '🥈', '🥉'][i]} ${peso(p)}</b>`).join('')}<span class="xs" style="margin-left:auto;color:#ffd98a">${rg.left}</span><button class="link" style="color:#a98bff;font-size:11.5px" data-act="prizes" aria-label="Prizes and rules">${ic('chevR').replace('class="i', 'style="width:14px" class="i')}</button></div>` : `<div class="pstrip"><span class="xs mute">Prizes go to the most-viewed.</span><button class="btn sm pri" style="margin-left:auto;height:24px;font-size:11.5px" data-act="lb" data-k="rank" data-v="Most Watched">Show Most watched</button></div>`;
  shell(`<div class="hdr"><b class="htitle left" style="font-size:20px">Leaderboard</b><div class="row" style="gap:0"><button class="hbtn" data-act="formula" aria-label="How ranks work">${ic('shield')}</button><button class="hbtn" data-go="#/notifications" aria-label="Notifications" style="position:relative">${ic('bell')}${unread() ? `<span class="dot">${Math.min(unread(), 9)}</span>` : ''}</button></div></div>
  ${tabsRow([['Stories', 'Stories'], ['Actors', 'Actors']], L.entity, 'lbTab')}${chips}${strip}${podium}
  ${rows.length ? `<div class="lbl">${rest.map((r, i) => `<div class="lbr ${r.mine ? 'me' : ''}" data-go="${r.go}" role="link" tabindex="0"><span class="rk">${i + off + 1}</span><img src="${IMG(r.img)}" style="${L.entity === 'Actors' ? 'border-radius:50%' : ''}" alt=""><div class="grow" style="min-width:0"><b class="tt">${esc(r.name)}${r.mine ? ' <span class="pill pk" style="padding:0 6px;font-size:9.5px">You</span>' : ''}</b><div class="xs mute ell">${esc(r.pill)}</div></div><span class="fgs">${flag(r.country)}</span><b class="vw">${ic('eye')}${fmt(r.v)}</b></div>`).join('')}</div>` : `<div class="empty">No eligible entries for this filter.<br><button class="link" style="color:#a98bff;display:inline;margin-top:8px" data-act="resetLb">Reset filters</button></div>`}
  <div class="xs mute" style="margin-top:8px;line-height:1.5">${isAuthed() ? (me >= 0 ? `Your best rank here: <b style="color:#fff">#${me + 1}</b>. ` : 'Publish an episode to enter the ranking. ') : 'Log in to see your rank. '}${rg.label} · Asia/Manila. Subscription tier never affects ranking.</div>`, { nav: 'leaderboard' });
}
Object.assign(H, { lbTab(el) { S.lb.entity = el.v; save(); router(); } });

function profile() { return route.args && route.args[0] === 'edit' ? editProfile() : profileMain(); }
function editProfile() {
  const u = S.user; if (!u) return go('#/profile');
  const acc = S.accounts[u.email]; const [by, bm, bdd] = ((acc && acc.dob) || '').split('-'); const bd = { yr: by || '', mo: bm || '', dy: bdd || '' }; const yrs = []; const Y = new Date().getFullYear(); for (let y = Y - 18; y >= Y - 100; y--) yrs.push(y);
  shell(`${topBack('Edit profile')}
  <div class="center" style="margin:10px 0 16px"><div style="position:relative;display:inline-block;cursor:pointer" data-act="photo" role="button" tabindex="0" aria-label="Change profile photo"><span class="ring" style="width:84px;height:84px"><img src="${IMG('avatar')}" alt=""></span><span class="camb">${ic('camera').replace('class="i', 'style="width:12px" class="i')}</span></div><div><button class="tlink" data-act="photo" style="margin-top:8px">Change photo</button></div></div>
  <div class="lrow"><label for="epName">Name</label></div><label class="field sm2"><input id="epName" maxlength="40" value="${esc(u.name || '')}" placeholder="Your name" autocomplete="name" aria-label="Name"></label>
  <div class="lrow" style="margin-top:12px"><label>Username</label></div><div class="xs mute" style="margin:0 2px 8px">@${esc(u.handle || u.username || '')} · usernames can’t be changed in this prototype</div>
  ${dd('ep-country', { label: 'Country', title: 'Country', options: CNAMES, value: u.country || 'Philippines', compact: true, onChange: v => { const e = $('#epFl'); if (e) e.innerHTML = flag(v) + ' ' + esc(v); } })}
  <div class="xs mute" style="margin:8px 2px 0;display:flex;align-items:center;gap:6px">Shown on your profile as <span id="epFl">${flag(u.country || 'Philippines')} ${esc(u.country || 'Philippines')}</span></div>
  <div class="lrow" style="margin-top:16px"><label>Date of birth</label><span class="xs mute">Private. 18+ only</span></div>
  <div class="row" style="gap:10px;align-items:stretch">${[['mo', 'Month', ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => [i + 1, m])], ['dy', 'Day', Array.from({ length: 31 }, (_, i) => i + 1)], ['yr', 'Year', yrs]].map(([k, l, o]) => `<div style="flex:1;min-width:0">${dd('ep-' + k, { label: l, title: 'Select ' + l.toLowerCase(), options: o, value: bd[k], ph: l, compact: true, onChange: () => {} })}</div>`).join('')}</div>
  <div class="lrow" style="margin-top:16px"><label>Gender</label><span class="xs mute">Private</span></div>
  ${dd('ep-gender', { label: 'Gender', title: 'Gender', options: GENDERS, value: u.gender || (acc && acc.gender) || '', ph: 'Select', compact: true, onChange: v => { const w = $('#epgo'); if (w) w.style.display = v === 'Prefer to self-describe' ? 'block' : 'none'; } })}
  <div id="epgo" style="display:${(u.gender || (acc && acc.gender)) === 'Prefer to self-describe' ? 'block' : 'none'}"><label class="field sm2">${ic('edit')}<input id="epGoT" maxlength="40" placeholder="How do you describe your gender?" value="${esc((acc && acc.gender_other) || '')}"></label></div>
  <button class="btn pri" style="margin-top:18px" data-act="saveProfile">Save changes</button>`, { nav: 'profile' });
}
Object.assign(H, {
  editProfile() { go('#/profile/edit'); },
  saveProfile() {
    const u = S.user, nm = ($('#epName').value || '').trim(); if (nm.length < 2) return toast('Enter a name (at least 2 characters).');
    const c = (DD['ep-country'] && DD['ep-country'].value) || u.country; const g = (DD['ep-gender'] && DD['ep-gender'].value) || '';
    const mo = DD['ep-mo'].value, dy = DD['ep-dy'].value, yr = DD['ep-yr'].value; let dob = '';
    if (mo || dy || yr) { if (!mo || !dy || !yr) return toast('Select your full date of birth, or clear it.', 2600); const b = new Date(yr, mo - 1, dy); if (b.getMonth() !== mo - 1) return toast('That date doesn’t exist.'); const t = new Date(); let age = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) age--; if (age < 18) return toast('ICON is currently 18+ only during the supervised beta.', 3200); dob = `${yr}-${mo}-${dy}`; }
    const go2 = g === 'Prefer to self-describe' ? ($('#epGoT').value || '').trim() : ''; if (g === 'Prefer to self-describe' && !go2) return toast('Tell us how you describe your gender.', 2600);
    u.name = nm; u.country = c; u.gender = g;
    const a = S.accounts[u.email]; if (a) { a.name = nm; a.country = c; a.dob = dob; a.gender = g; a.gender_other = go2; }
    save(); toast('Profile updated.'); go('#/profile');
  },
});

Object.assign(H, {
  socialAuth(el) {
    const k = el.v, nm = SOCN[k], em = socEmail(k), has = !!S.accounts[em];
    sheet(`<h2 class="ddh">${nm}</h2><div class="xs mute" style="margin:2px 0 12px">Prototype demo: this simulates the ${nm} account chooser. In the live app it opens ${nm}’s secure sign-in, and no password is typed here.</div>
    <div class="socme">${SOCI[k]}<div class="grow"><b>Alex Rivera</b><div class="xs mute">${em}</div></div></div>
    <button class="btn pri" style="margin-top:14px" data-act="socGo" data-v="${k}">${has ? 'Log in' : 'Continue'} as Alex</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`);
  },
  socGo(el) {
    const k = el.v, em = socEmail(k); closeSheet();
    if (S.accounts[em]) { S.remember = true; S.lastId = S.accounts[em].username; try { sessionStorage.setItem('icon.alive', '1'); } catch { } return startSession(em); }
    let u = 'alex.rivera', n = 1; while (Object.values(S.accounts).some(a => (a.username || '').toLowerCase() === u)) u = 'alex.rivera' + (++n);
    S.pendSoc = { provider: k, name: 'Alex Rivera', email: em, username: u }; save(); go('#/signup/social');
  },
  socCancel() { S.pendSoc = null; save(); go('#/signup'); },
});
