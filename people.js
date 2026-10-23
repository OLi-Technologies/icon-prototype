/* People: find actors, add friends, follow. Friends are the pool you pick co-actors from when creating a story. */
const PEOPLE = [...ACTORS.map(a => ({ ...a, actor: true })),
  { id: 'x1', name: 'Ria Mendoza', handle: 'riamendoza', img: 'smile', followers: 12400, city: 'Makati' },
  { id: 'x2', name: 'Paolo Dizon', handle: 'paolodizon', img: 'man', followers: 8300, city: 'Pasig' },
  { id: 'x3', name: 'Lia Cortez', handle: 'liacortez', img: 'encounter', followers: 5100, city: 'Cebu City' }];
const PT = { tab: 'friends', q: '' };
const person = id => PEOPLE.find(p => p.id === id);
function fstate(id) { return S.friends.includes(id) ? 'friend' : S.reqOut.includes(id) ? 'out' : (S.reqIn || []).includes(id) ? 'in' : 'none'; }
function pRow(p, actions) {
  return `<div class="prow2"><div class="row grow" style="gap:12px;min-width:0;${p.actor ? 'cursor:pointer' : ''}" ${p.actor ? `data-go="#/actor/${p.id}"` : ''}><img class="avatar" style="width:48px;height:48px;border-width:1px;object-fit:cover" src="${IMG(p.img)}" alt=""><div style="min-width:0"><b>${esc(p.name)}</b><div class="xs mute" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">@${esc(p.handle)} · ${esc(p.city)}</div></div></div><div class="row" style="gap:6px;flex:none">${actions}</div></div>`;
}
function pList() {
  const T = PT.tab; const q = PT.q.trim().toLowerCase();
  if (T === 'friends') {
    const invite = `<div class="card row sp" style="margin-bottom:12px;gap:12px"><div><b>Invite a friend</b><div class="xs mute">Share your link to bring someone onto ICON.</div></div><button class="btn sm pri" style="height:38px;flex:none" data-act="pInvite">${ic('share')} Invite</button></div>`;
    return invite + (S.friends.length ? S.friends.map(id => person(id)).filter(Boolean).map(p => pRow(p, `<button class="btn sm" style="height:36px" data-act="pFollow" data-v="${p.id}">${S.aFollows.includes(p.id) ? 'Following' : 'Follow'}</button><button class="iconbtn" style="width:36px;height:36px" data-act="pUnfriend" data-v="${p.id}" aria-label="Unfriend ${esc(p.name)}">${ic('x')}</button>`)).join('') : '<div class="empty">No friends yet.<br><button class="link" style="color:#a98bff;display:inline;margin-top:8px" data-act="pTab" data-v="find">Find people</button></div>');
  }
  if (T === 'requests') {
    const inc = S.reqIn.map(person).filter(Boolean), out = S.reqOut.map(person).filter(Boolean);
    return `<div class="sec"><h2>Received</h2></div>${inc.length ? inc.map(p => pRow(p, `<button class="btn sm pri" style="height:36px" data-act="pAccept" data-v="${p.id}">Accept</button><button class="btn sm" style="height:36px" data-act="pDecline" data-v="${p.id}">Decline</button>`)).join('') : '<div class="empty" style="padding:14px">No new requests.</div>'}<div class="sec"><h2>Sent</h2></div>${out.length ? out.map(p => pRow(p, `<span class="pill warn">Pending</span><button class="btn sm" style="height:36px" data-act="pCancel" data-v="${p.id}">Cancel</button>`)).join('') + '<div class="xs mute" style="margin-top:8px">Demo build: <button class="link" style="color:#a98bff;display:inline" data-act="pDemo">simulate everyone accepting</button></div>' : '<div class="empty" style="padding:14px">No pending requests.</div>'}`;
  }
  const res = PEOPLE.filter(p => !q || (p.name + ' ' + p.handle + ' ' + p.city).toLowerCase().includes(q));
  return res.length ? res.map(p => { const st = fstate(p.id); return pRow(p, `<button class="btn sm ${S.aFollows.includes(p.id) ? '' : ''}" style="height:36px" data-act="pFollow" data-v="${p.id}">${S.aFollows.includes(p.id) ? 'Following' : 'Follow'}</button>${st === 'friend' ? '<span class="pill ok">Friends</span>' : st === 'out' ? '<span class="pill warn">Requested</span>' : st === 'in' ? `<button class="btn sm pri" style="height:36px" data-act="pAccept" data-v="${p.id}">Accept</button>` : `<button class="btn sm pri" style="height:36px" data-act="pAdd" data-v="${p.id}">${ic('userplus').replace('class="i', 'style="width:16px" class="i')} Add</button>`}`); }).join('') : '<div class="empty">No one matches that search.</div>';
}
window.peopleView = function () {
  if (S.reqIn === null) { S.reqIn = ['a2', 'a4']; save(); }
  const nIn = S.reqIn.length;
  shell(`<div class="row sp" style="margin-bottom:10px"><button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><h2>People</h2><div style="width:40px"></div></div>
  <div class="chips">${[['friends', `Friends (${S.friends.length})`], ['requests', `Requests${nIn ? ' (' + nIn + ')' : ''}`], ['find', 'Find people']].map(t => `<button class="chip ${PT.tab === t[0] ? 'on' : ''}" data-act="pTab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
  ${PT.tab === 'find' ? `<label class="field" style="margin:12px 0 6px">${ic('search')}<input id="pq" placeholder="Search by name, username or city" value="${esc(PT.q)}" aria-label="Search people"></label>` : '<div style="height:12px"></div>'}
  <div id="plist">${pList()}</div>
  <div class="xs mute" style="margin-top:14px">Friends can be picked as co-actors in your stories. Following only adds an actor to your feed.</div>`, { nav: 'profile' });
  $('#pq')?.addEventListener('input', e => { PT.q = e.target.value; $('#plist').innerHTML = pList(); });
};
const pre = () => { if (S.reqIn === null) S.reqIn = ['a2', 'a4']; };
Object.assign(window.HC, {
  pTab(el) { PT.tab = el.v; peopleView(); },
  pAdd(el) { if (!need('add friends')) return; pre(); if (!S.reqOut.includes(el.v)) S.reqOut.push(el.v); save(); toast(`Friend request sent to <b>${esc(person(el.v).name)}</b>.`); refresh(); },
  pCancel(el) { S.reqOut = S.reqOut.filter(x => x !== el.v); save(); refresh(); },
  pAccept(el) { pre(); S.reqIn = S.reqIn.filter(x => x !== el.v); S.reqOut = S.reqOut.filter(x => x !== el.v); if (!S.friends.includes(el.v)) S.friends.push(el.v); notify(`You and ${person(el.v).name} are now friends.`); save(); toast(`You and <b>${esc(person(el.v).name)}</b> are now friends.`); refresh(); },
  pDecline(el) { S.reqIn = S.reqIn.filter(x => x !== el.v); save(); refresh(); },
  pDemo() { S.reqOut.forEach(id => { if (!S.friends.includes(id)) S.friends.push(id); notify(`${person(id).name} accepted your friend request.`); }); S.reqOut = []; save(); toast('Everyone accepted (demo).'); refresh(); },
  pFollow(el) { if (!need('follow people')) return; const i = S.aFollows.indexOf(el.v); i < 0 ? S.aFollows.push(el.v) : S.aFollows.splice(i, 1); save(); refresh(); },
  pUnfriend(el) { const p = person(el.v); sheet(`<h2>Remove ${esc(p.name)}?</h2><p class="mute sm">They will no longer appear when you choose co-actors. Stories you already made together are not affected.</p><button class="btn danger" data-act="pUnfriendYes" data-v="${el.v}">Remove friend</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`); },
  pUnfriendYes(el) { S.friends = S.friends.filter(x => x !== el.v); save(); closeSheet(); toast('Friend removed.'); refresh(); },
  pInvite() { const url = location.href.split('#')[0] + '#/signup?invite=' + (S.user?.handle || ''); (navigator.clipboard?.writeText(url).then(() => toast('Invite link copied.')).catch(() => toast('Copy the link from your address bar.'))) || toast('Copy the link from your address bar.'); },
  friendBtn(el) { if (!need('add friends')) return; const st = fstate(el.v); if (st === 'friend') return HC.pUnfriend(el); if (st === 'out') return toast('Request pending. They haven’t accepted yet.'); if (st === 'in') return HC.pAccept(el); HC.pAdd(el); },
});
function refresh() { if (route.name === 'people') peopleView(); else router(); }
