/* ICON messaging: inbox, direct messages, group chats, emoji, attachments, reply, forward, people, block.
   Chats live in S.chats (localStorage). Videos and large files stay in memory for the session (like drafts). */
Object.assign(P, {
  send: '<path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M10 13L21 3"/>',
  clip: '<path d="M20 11.5l-8 8a5 5 0 01-7-7l9-9a3.3 3.3 0 014.7 4.7l-9 9a1.7 1.7 0 01-2.4-2.4l8-8"/>',
  reply: '<path d="M9 8V4l-7 7 7 7v-4c6 0 10 2 13 7-1-8-5-13-13-13z"/>',
  fwd: '<path d="M15 8V4l7 7-7 7v-4c-6 0-10 2-13 7 1-8 5-13 13-13z"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
  compose: '<path d="M12 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-6"/><path d="M17.5 3.5a2 2 0 012.9 2.9L12 15l-4 1 1-4z"/>',
  msg: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1121 12z"/>',
  vid2: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
});

const MS = { q: '', reply: null, emo: false, tab: 'smileys', g: null, sel: new Set(), fwd: [], timers: {} };
const EMOJI = {
  smileys: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😎 🤩 🥳 😏 😢 😭 😤 😡 🤯 😱 🤔 🤫 🙄 😴 🥺 😬',
  gestures: '👍 👎 👏 🙌 🙏 💪 👌 ✌️ 🤞 🤟 👋 🤝 🫶 👀 🧠 🫡 🤌 ☝️ 👊 ✋',
  hearts: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 💕 💖 💗 💘 💝 ✨ 🔥 💯 💫 ⭐ 🌟',
  fun: '🎉 🎊 🎬 🎥 🎭 🎤 🎧 🎵 🏆 🥇 🍿 📸 🎮 🚀 🌈 🌙 ☀️ 🎁 🎈 📱',
  food: '🍕 🍔 🍟 🌮 🍣 🍜 🍰 🍩 ☕ 🧋 🍺 🍷 🍎 🍓 🥑 🍫 🍪 🍦 🥐 🍉',
};
const EMO_TABS = [['smileys', '😀'], ['gestures', '👍'], ['hearts', '❤️'], ['fun', '🎉'], ['food', '🍕']];
const QUICK_RX = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
const REPLIES = ['Haha love it 😂', 'Omg yes! 🙌', 'That sounds great!', 'Ooh, tell me more 👀', 'Can’t wait for the next episode 🔥', 'Let’s cast together this weekend?', 'Thanks for sharing! ❤️', 'Send me the link!', 'On it 👍'];
const REPLIES_ATT = ['Got it, thanks! 🙌', 'Nice one! 👏', 'Love this ❤️', 'Just saw it, so good 🔥'];

/* ---------- state helpers ---------- */
const MEM = new Map(); // message id -> object URL (video / large file), session only
function mInit() {
  if (!S.user) return;
  if (!S.blocked) S.blocked = [];
  if (S.chats) return;
  const now = Date.now(), M = 60e3, H2 = 3600e3, D = 86400e3;
  const mk = (id, from, text, at, extra = {}) => ({ id, from, text, at, kind: 'text', ...extra });
  S.chats = [
    { id: 'c1', type: 'dm', members: ['a1'], msgs: [mk('s1', 'me', 'Hi Maria! Your Night Shift episode was so good', now - 3 * H2), mk('s2', 'a1', 'Thank you!! That means a lot 🥹', now - 3 * H2 + 4 * M), mk('s3', 'a1', 'Want to cast together for the next series?', now - 20 * M)], read: now - 3 * H2 + 5 * M },
    { id: 'c2', type: 'group', name: 'Night Shift crew', members: ['a2', 'x1', 'x2'], owner: 'me', msgs: [mk('s4', 'x1', 'Rehearsal on Saturday?', now - 1 * D - 2 * H2), mk('s5', 'a2', 'I’m in 🙌', now - 1 * D - H2), mk('s6', 'x2', 'Same! I’ll bring the props 🎬', now - 5 * H2)], read: now - 5 * H2 },
    { id: 'c3', type: 'dm', members: ['x3'], msgs: [mk('s7', 'x3', 'Hey, saw your clip. How did you shoot the rooftop scene?', now - 2 * D)], read: now - 2 * D + 1 },
  ];
  save();
}
const mChats = () => { mInit(); return S.chats || []; };
const mChat = id => mChats().find(c => c.id === id);
const isBlocked = id => (S.blocked || []).includes(id);
const pName = id => id === 'me' ? 'You' : (person(id)?.name || 'Someone');
const first = id => pName(id).split(' ')[0];
const chatTitle = c => c.type === 'group' ? c.name : pName(c.members[0]);
const chatSub = c => c.type === 'group' ? `${c.members.length + 1} members` : '@' + (person(c.members[0])?.handle || '');
const lastMsg = c => c.msgs[c.msgs.length - 1];
const unreadOf = c => c.muted ? 0 : c.msgs.filter(m => m.from !== 'me' && m.at > (c.read || 0) && !isBlocked(m.from)).length;
window.msgUnread = () => S.user && S.chats ? S.chats.reduce((t, c) => t + unreadOf(c), 0) : 0;
const mAvatar = (c, size = 48) => c.type === 'group'
  ? `<span class="gav" style="width:${size}px;height:${size}px">${c.members.slice(0, 3).map((id, i) => `<img src="${IMG(person(id)?.img || 'avatar')}" alt="" style="width:${size * .58}px;height:${size * .58}px;${['left:0;top:0', 'right:0;top:' + size * .1 + 'px', 'left:' + size * .2 + 'px;bottom:0'][i]}">`).join('')}</span>`
  : ring(person(c.members[0])?.img || 'avatar', size);
function tShort(ts) {
  const d = new Date(ts), n = new Date(), day = x => new Date(x).setHours(0, 0, 0, 0), diff = (day(n) - day(ts)) / 864e5;
  if (diff < 1) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
const dayLabel = ts => { const diff = (new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 864e5; return diff < 1 ? 'Today' : diff < 2 ? 'Yesterday' : new Date(ts).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }); };
const clock = ts => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const sizeTxt = b => b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const preview = (m, c) => {
  if (!m) return 'No messages yet';
  const who = m.from === 'me' ? 'You: ' : c.type === 'group' ? first(m.from) + ': ' : '';
  const body = m.kind === 'image' ? '📷 Photo' : m.kind === 'video' ? '🎥 Video' : m.kind === 'file' ? '📎 ' + (m.att?.name || 'File') : (m.fwd ? '↪ ' : '') + (m.text || '');
  return who + body;
};
const emojiOnly = t => !!t && t.length <= 24 && /^(?:\p{Extended_Pictographic}|‍|️|\s)+$/u.test(t) && (t.match(/\p{Extended_Pictographic}/gu) || []).length <= 3;
const msgId = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function dmWith(pid) {
  let c = mChats().find(x => x.type === 'dm' && x.members[0] === pid);
  if (!c) { c = { id: 'c' + msgId(), type: 'dm', members: [pid], msgs: [], read: Date.now() }; S.chats.unshift(c); save(); }
  return c;
}
const sorted = () => [...mChats()].sort((a, b) => (lastMsg(b)?.at || b.created || 0) - (lastMsg(a)?.at || a.created || 0));
const available = () => PEOPLE.filter(p => !isBlocked(p.id));

/* ---------- route ---------- */
window.messagesRoute = function (args) {
  mInit();
  const [a, b] = args;
  if (a === 'new') return newMessage();
  if (a === 'group') return newGroup();
  if (a === 'c') return thread(b);
  if (a === 'info') return groupInfo(b);
  if (a === 'blocked') return blockedList();
  if (a === 'u') { const c = dmWith(b); return location.replace('#/messages/c/' + c.id); }
  return inbox();
};

/* ---------- inbox ---------- */
function crow(c) {
  const m = lastMsg(c), n = unreadOf(c), blocked = c.type === 'dm' && isBlocked(c.members[0]);
  return `<div class="crow ${n ? 'unr' : ''}" data-go="#/messages/c/${c.id}" role="link" tabindex="0">${mAvatar(c, 50)}<div class="grow" style="min-width:0"><div class="row sp"><b class="ell">${esc(chatTitle(c))}${c.muted ? ` <span class="mutei" aria-label="Muted">${ic('mute')}</span>` : ''}</b><span class="xs mute" style="flex:none">${m ? tShort(m.at) : ''}</span></div><div class="row sp"><span class="sm ${n ? '' : 'mute'} ell" style="${n ? 'font-weight:600' : ''}">${blocked ? 'Blocked' : esc(preview(m, c))}</span>${n ? `<span class="cbd">${n > 9 ? '9+' : n}</span>` : ''}</div></div></div>`;
}
function inboxList() {
  const q = MS.q.trim().toLowerCase();
  const list = sorted().filter(c => !q || chatTitle(c).toLowerCase().includes(q) || c.members.some(id => (person(id)?.handle || '').includes(q)));
  return list.length ? list.map(crow).join('') : `<div class="empty">${q ? `No chats match “${esc(MS.q)}”.` : 'No messages yet. Start a conversation with someone you follow.'}${q ? '' : '<div style="margin-top:14px"><button class="btn pri sm" data-go="#/messages/new" style="margin:0 auto">New message</button></div>'}</div>`;
}
function inbox() {
  const total = msgUnread();
  const strip = available().slice(0, 7);
  shell(`${topBack('Messages' + (total ? ` <span class="cbd" style="vertical-align:2px">${total > 9 ? '9+' : total}</span>` : ''), `<button class="hbtn" data-go="#/messages/new" aria-label="New message">${ic('compose')}</button>`)}
  <label class="field sm2"><span style="display:flex">${ic('search')}</span><input id="mq" placeholder="Search messages" value="${esc(MS.q)}" aria-label="Search messages" autocomplete="off"></label>
  <div class="mstrip" aria-label="People">${strip.map(p => `<button type="button" data-act="msgStart" data-v="${p.id}" aria-label="Message ${esc(p.name)}">${ring(p.img, 52)}<span class="xs ell">${esc(p.name.split(' ')[0])}</span></button>`).join('')}</div>
  <div id="cl">${inboxList()}</div>`, { noNav: true });
  $('#mq').addEventListener('input', e => { MS.q = e.target.value; $('#cl').innerHTML = inboxList(); });
}

/* ---------- new message / people ---------- */
const prow = (p, right) => `<div class="urow" style="padding:8px 0"><div class="row grow" style="min-width:0;cursor:pointer" data-act="msgStart" data-v="${p.id}" role="button" tabindex="0">${ring(p.img, 44)}<div style="min-width:0"><b class="un">${esc(p.name)}</b><div class="xs mute ell">@${esc(p.handle)} · ${flag(p.country)} ${esc(p.country)}</div></div></div>${right}</div>`;
function newMessage() {
  MS.nf = MS.nf || { q: '', f: 'All' };
  const paint = () => {
    const q = MS.nf.q.trim().toLowerCase(), f = MS.nf.f;
    const l = available().filter(p => (!q || p.name.toLowerCase().includes(q) || p.handle.includes(q)) && (f === 'All' || (f === 'Following' ? S.aFollows.includes(p.id) : (S.followers || []).includes(p.id))));
    $('#pl').innerHTML = l.length ? l.map(p => prow(p, `<button class="btn sm" style="height:32px" data-go="#/actor/${p.id}" aria-label="View ${esc(p.name)}’s profile">${ic('user')} Profile</button>`)).join('') : '<div class="empty">No one found.</div>';
  };
  shell(`${topBack('New message')}
  <button class="srow" data-go="#/messages/group" style="margin-top:4px"><span class="plic">${ic('users')}</span><span class="grow" style="text-align:left"><b>New group chat</b><div class="xs mute">Chat with up to 10 people</div></span>${ic('chevR')}</button>
  <label class="field sm2"><span style="display:flex">${ic('search')}</span><input id="nq" placeholder="Search people" value="${esc(MS.nf.q)}" aria-label="Search people" autocomplete="off"></label>
  <div class="chips sub" id="nfc">${['All', 'Following', 'Followers'].map(f => `<button class="chip ${MS.nf.f === f ? 'on' : ''}" data-act="nfFilter" data-v="${f}">${f}</button>`).join('')}</div>
  <div id="pl" style="margin-top:6px"></div>`, { noNav: true });
  paint();
  $('#nq').addEventListener('input', e => { MS.nf.q = e.target.value; paint(); });
  MS.nfPaint = paint;
}

/* ---------- group create ---------- */
function groupList(sel, q, exclude = []) {
  const l = available().filter(p => !exclude.includes(p.id) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.handle.includes(q.toLowerCase())));
  return l.length ? l.map(p => `<div class="urow gsel ${sel.has(p.id) ? 'on' : ''}" data-act="gTog" data-v="${p.id}" role="checkbox" aria-checked="${sel.has(p.id)}" tabindex="0" style="padding:8px 0;cursor:pointer">${ring(p.img, 42)}<div class="grow" style="min-width:0"><b class="un">${esc(p.name)}</b><div class="xs mute ell">@${esc(p.handle)}</div></div><span class="bx">${sel.has(p.id) ? ic('check') : ''}</span></div>`).join('') : '<div class="empty">No one found.</div>';
}
function newGroup() {
  MS.g = { sel: new Set(), q: '', name: '' };
  shell(`${topBack('New group')}
  <label class="field sm2"><input id="gn" maxlength="40" placeholder="Group name (optional)" aria-label="Group name" autocomplete="off"></label>
  <div id="gchips" class="gchips"></div>
  <label class="field sm2"><span style="display:flex">${ic('search')}</span><input id="gq" placeholder="Add people" aria-label="Search people" autocomplete="off"></label>
  <div id="gl"></div>
  <div class="gbar"><button class="btn pri" id="gc" data-act="gCreate" disabled>Create group</button><div class="xs mute center" id="gh" style="margin-top:6px">Pick at least 2 people</div></div>`, { noNav: true });
  MS.gPaint = () => {
    const s = MS.g.sel; $('#gl').innerHTML = groupList(s, MS.g.q);
    $('#gchips').innerHTML = [...s].map(id => `<button class="gchip" data-act="gTog" data-v="${id}" aria-label="Remove ${esc(pName(id))}">${ring(person(id).img, 22)}${esc(first(id))} ${ic('x')}</button>`).join('');
    $('#gc').disabled = s.size < 2; $('#gh').textContent = s.size < 2 ? `Pick at least 2 people (${s.size} selected)` : `${s.size} people selected · you + ${s.size}`;
  };
  MS.gPaint();
  $('#gq').addEventListener('input', e => { MS.g.q = e.target.value; MS.gPaint(); });
  $('#gn').addEventListener('input', e => { MS.g.name = e.target.value; });
}

/* ---------- thread ---------- */
function thread(id) {
  const c = mChat(id); if (!c) return go('#/messages');
  MS.chat = id; MS.reply = null; MS.emo = false;
  const dm = c.type === 'dm', pid = dm ? c.members[0] : null, blocked = dm && isBlocked(pid);
  c.read = Date.now(); save();
  const comp = blocked
    ? `<div class="cblk">You blocked ${esc(pName(pid))}. You can’t send or receive messages.<button class="btn sm" data-act="unblock" data-v="${pid}" style="margin:8px auto 0">Unblock</button></div>`
    : `<div id="rbar" class="rbar" hidden></div><div id="emo" class="emo" hidden></div>
    <div class="comp"><button class="cib" data-act="attachMenu" aria-label="Attach">${ic('plusq')}</button><div class="cin"><textarea id="mi" rows="1" maxlength="1000" placeholder="Message" aria-label="Message" autocomplete="off"></textarea><button class="cemo" data-act="emoToggle" aria-label="Emoji">${ic('smile')}</button></div><button class="csend" id="ms" data-act="msgSend" aria-label="Send" disabled>${ic('send')}</button></div>`;
  shell(`<div class="chat"><div class="chead"><button class="hbtn" data-act="back" aria-label="Back">${ic('chevL')}</button>
    <div class="row grow" style="min-width:0;cursor:pointer;gap:10px" data-go="${dm ? '#/actor/' + pid : '#/messages/info/' + c.id}" role="link" tabindex="0">${mAvatar(c, 38)}<div style="min-width:0"><b class="ell" style="display:block;font-size:14.5px">${esc(chatTitle(c))}</b><span class="xs mute ell" id="csub" style="display:block">${esc(chatSub(c))}</span></div></div>
    <button class="hbtn" data-act="chatMenu" aria-label="More">${ic('dots')}</button></div>
    <div class="msgs" id="msgs" role="log" aria-live="polite"></div>${comp}</div>`, { flush: true, noNav: true });
  paintMsgs(true);
  const mb = $('#msgs'); let lp = null;
  const openMenu = t => { const b = t.closest('.mb'); if (b && b.dataset.v) H.msgMenu({ v: b.dataset.v }); };
  mb.addEventListener('contextmenu', e => { if (e.target.closest('.mb')) { e.preventDefault(); openMenu(e.target); } });
  mb.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' || !e.target.closest('.mb')) return; const t = e.target; lp = setTimeout(() => { lp = null; mb.dataset.lp = '1'; openMenu(t); }, 480); });
  ['pointerup', 'pointermove', 'pointercancel', 'scroll'].forEach(ev => mb.addEventListener(ev, () => { clearTimeout(lp); }, { passive: true }));
  mb.addEventListener('click', e => { if (mb.dataset.lp) { delete mb.dataset.lp; e.stopPropagation(); e.preventDefault(); } }, true);
  const mi = $('#mi'); if (mi) {
    const sync = () => { mi.style.height = 'auto'; mi.style.height = Math.min(110, mi.scrollHeight) + 'px'; $('#ms').disabled = !mi.value.trim(); };
    mi.addEventListener('input', sync);
    mi.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); H.msgSend(); } });
    MS.sync = sync;
  }
}
function paintHead() { const c = mChat(MS.chat), s = $('#csub'); if (c && s) s.textContent = c.typing ? (c.type === 'group' ? first(c.typing) + ' is typing…' : 'typing…') : chatSub(c); if (s) s.classList.toggle('typ', !!c?.typing); }
function bubble(c, m, i, arr) {
  if (m.sys) return `<div class="mday"><span>${esc(m.text)}</span></div>`;
  const mine = m.from === 'me', grp = c.type === 'group';
  const blocked = !mine && isBlocked(m.from);
  const prev = arr[i - 1], nextM = arr[i + 1];
  const startOf = !prev || prev.from !== m.from || m.at - prev.at > 5 * 60e3 || dayLabel(prev.at) !== dayLabel(m.at);
  const endOf = !nextM || nextM.from !== m.from || nextM.at - m.at > 5 * 60e3 || dayLabel(nextM.at) !== dayLabel(m.at);
  if (blocked) return `<div class="mrow th" data-mid="${m.id}"><div class="mcol"><div class="mblk">Message from a blocked user <button data-act="msgShow" data-v="${m.id}">${MS.shown?.has(m.id) ? 'Hide' : 'Show'}</button></div>${MS.shown?.has(m.id) ? `<div class="mb th"><span class="mtx">${esc(preview(m, c).replace(/^[^:]*: /, ''))}</span></div>` : ''}</div></div>`;
  const eo = m.kind === 'text' && emojiOnly(m.text) && !m.reply && !m.fwd;
  let att = '';
  if (m.kind === 'image') att = `<img class="matt" src="${m.att.src}" alt="Photo" data-act="msgView" data-v="${m.id}" loading="lazy">`;
  else if (m.kind === 'video') att = MEM.has(m.id) ? `<video class="matt" src="${MEM.get(m.id)}" poster="${m.att.thumb || ''}" controls playsinline preload="metadata" data-act="noop"></video>` : `<div class="matt vph"><img src="${m.att.thumb || ''}" alt=""><span>${ic('vid2')} Video preview only</span></div>`;
  else if (m.kind === 'file') att = `<div class="mfile" data-act="msgFile" data-v="${m.id}"><span class="mfi">${ic('doc')}</span><div style="min-width:0"><b class="ell">${esc(m.att.name)}</b><small>${sizeTxt(m.att.size)}${m.att.ext ? ' · ' + esc(m.att.ext) : ''}</small></div></div>`;
  const rx = m.rx ? Object.entries(m.rx).filter(([, u]) => u.length) : [];
  const rep = m.reply ? `<div class="mq" data-act="msgJump" data-v="${m.reply.id}"><b>${esc(m.reply.from === 'me' ? 'You' : pName(m.reply.from))}</b><span>${esc(m.reply.text)}</span></div>` : '';
  return `<div class="mrow ${mine ? 'me' : 'th'} ${startOf ? 'st' : ''}" data-mid="${m.id}">
    ${!mine && grp ? (endOf ? `<span class="mav" data-go="#/actor/${m.from}" role="link">${ring(person(m.from)?.img || 'avatar', 26)}</span>` : '<span class="mav"></span>') : ''}
    <div class="mcol">${!mine && grp && startOf ? `<div class="mnm">${esc(pName(m.from))}</div>` : ''}
      <div class="mb ${mine ? 'me' : 'th'} ${eo ? 'eo' : ''} ${m.kind !== 'text' ? 'hasatt' : ''}" data-act="msgMenu" data-v="${m.id}" tabindex="0">
        ${m.fwd ? `<div class="mfw">${ic('fwd')} Forwarded</div>` : ''}${rep}${att}${m.text ? `<span class="mtx">${esc(m.text)}</span>` : ''}<span class="mtm">${clock(m.at)}</span></div>
      ${rx.length ? `<div class="mrx ${mine ? 'me' : ''}">${rx.map(([e, u]) => `<button type="button" data-act="msgReact" data-v="${m.id}" data-e="${e}" class="${u.includes('me') ? 'on' : ''}" aria-label="${e} ${u.length}">${e}${u.length > 1 ? ' ' + u.length : ''}</button>`).join('')}</div>` : ''}
    </div></div>`;
}
function paintMsgs(bottom) {
  const c = mChat(MS.chat), box = $('#msgs'); if (!c || !box) return;
  const keep = box.scrollHeight - box.scrollTop;
  let html = '', lastDay = '';
  c.msgs.forEach((m, i, arr) => { const d = dayLabel(m.at); if (d !== lastDay) { html += `<div class="mday"><span>${d}</span></div>`; lastDay = d; } html += bubble(c, m, i, arr); });
  if (c.typing) html += `<div class="mrow th"><div class="mcol"><div class="mb th typing"><i></i><i></i><i></i></div></div></div>`;
  if (!c.msgs.length) html = `<div class="empty" style="margin-top:30px">${mAvatar(c, 64)}<div style="margin-top:10px"><b>${esc(chatTitle(c))}</b></div><div class="xs">Say hi 👋</div></div>`;
  box.innerHTML = html;
  box.scrollTop = bottom ? box.scrollHeight : box.scrollHeight - keep;
  paintHead();
}
function paintReply() {
  const r = $('#rbar'); if (!r) return;
  if (!MS.reply) { r.hidden = true; r.innerHTML = ''; return; }
  r.hidden = false; r.innerHTML = `<span class="rbi">${ic('reply')}</span><div class="grow" style="min-width:0"><b>Replying to ${esc(MS.reply.from === 'me' ? 'yourself' : pName(MS.reply.from))}</b><div class="xs mute ell">${esc(MS.reply.text)}</div></div><button class="hbtn" data-act="replyCancel" aria-label="Cancel reply">${ic('x')}</button>`;
}
function paintEmo() {
  const e = $('#emo'); if (!e) return;
  e.hidden = !MS.emo; if (!MS.emo) return;
  const rec = S.recentEmoji || [];
  e.innerHTML = `<div class="etabs">${EMO_TABS.map(t => `<button class="${MS.tab === t[0] ? 'on' : ''}" data-act="emoTab" data-v="${t[0]}" aria-label="${t[0]}">${t[1]}</button>`).join('')}</div>${rec.length ? `<div class="erec">${rec.map(x => `<button data-act="emoPick" data-v="${x}">${x}</button>`).join('')}</div>` : ''}<div class="egrid2">${EMOJI[MS.tab].split(' ').map(x => `<button data-act="emoPick" data-v="${x}">${x}</button>`).join('')}</div>`;
}
const snip = m => m.kind === 'image' ? '📷 Photo' : m.kind === 'video' ? '🎥 Video' : m.kind === 'file' ? '📎 ' + m.att.name : m.text;
function pushMsg(c, m) {
  Object.assign(m, { id: msgId(), at: Date.now() }); c.msgs.push(m); c.read = m.at; save(); paintMsgs(true); simReply(c, m.kind !== 'text');
}
function simReply(c, att) {
  clearTimeout(MS.timers[c.id]);
  const cand = c.members.filter(id => !isBlocked(id)); if (!cand.length) return;
  const who = cand[Math.floor(Math.random() * cand.length)];
  MS.timers[c.id] = setTimeout(() => {
    c.typing = who; if (MS.chat === c.id && location.hash.includes(c.id)) paintHead(), paintMsgs();
    MS.timers[c.id] = setTimeout(() => {
      c.typing = null; const pool = att ? REPLIES_ATT : REPLIES;
      const m = { id: msgId(), from: who, kind: 'text', text: pool[Math.floor(Math.random() * pool.length)], at: Date.now() }; c.msgs.push(m);
      const viewing = MS.chat === c.id && location.hash.includes(c.id);
      if (viewing) { c.read = m.at; paintMsgs(true); } else if (!c.muted) toast(`<b>${esc(pName(who))}</b>: ${esc(m.text)}`);
      save();
    }, 1500 + Math.random() * 1200);
  }, 700);
}
async function fileToImg(f) {
  const u = URL.createObjectURL(f); const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
  const k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); return c.toDataURL('image/jpeg', .74);
}
function videoThumb(url) {
  return new Promise(res => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.src = url; const done = d => res(d || ''); v.onerror = () => done(''); v.onloadeddata = () => { try { v.currentTime = Math.min(.2, (v.duration || 1) / 2); } catch { done(''); } }; v.onseeked = () => { try { const c = document.createElement('canvas'), k = Math.min(1, 320 / Math.max(v.videoWidth, v.videoHeight)); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k); c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); done(c.toDataURL('image/jpeg', .6)); } catch { done(''); } }; setTimeout(() => done(''), 2500); });
}
async function sendFiles(files, kind) {
  const c = mChat(MS.chat); if (!c) return; if (c.type === 'dm' && isBlocked(c.members[0])) return;
  for (const f of files) {
    if (f.size > 25 * 1048576) { toast(`${esc(f.name)} is over 25 MB.`); continue; }
    const reply = MS.reply ? { id: MS.reply.id, from: MS.reply.from, text: MS.reply.text } : null; MS.reply = null; paintReply();
    try {
      if (kind === 'image' || (kind === 'any' && f.type.startsWith('image/'))) pushMsg(c, { from: 'me', kind: 'image', att: { src: await fileToImg(f), name: f.name }, reply });
      else if (kind === 'video' || (kind === 'any' && f.type.startsWith('video/'))) { const url = URL.createObjectURL(f); const thumb = await videoThumb(url); const m = { from: 'me', kind: 'video', att: { thumb, name: f.name, size: f.size }, reply }; pushMsg(c, m); MEM.set(m.id, url); paintMsgs(); }
      else { const ext = (f.name.split('.').pop() || '').toUpperCase().slice(0, 5); const m = { from: 'me', kind: 'file', att: { name: f.name, size: f.size, ext, mime: f.type }, reply }; pushMsg(c, m); MEM.set(m.id, URL.createObjectURL(f)); }
    } catch { toast('Couldn’t attach that file.'); }
  }
}
function pickFiles(accept, kind, capture) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !capture; if (capture) i.setAttribute('capture', 'environment'); i.style.display = 'none';
  i.onchange = () => { if (i.files.length) sendFiles([...i.files], kind); i.remove(); }; document.body.append(i); i.click();
}

/* ---------- group info / blocked ---------- */
function groupInfo(id) {
  const c = mChat(id); if (!c || c.type !== 'group') return go('#/messages');
  const isOwner = c.owner === 'me';
  shell(`${topBack('Group info')}
  <div class="center" style="margin:6px 0 14px"><div style="display:flex;justify-content:center">${mAvatar(c, 84)}</div><h2 style="margin:10px 0 2px">${esc(c.name)}</h2><div class="xs mute">${c.members.length + 1} members</div>
  <button class="btn sm" data-act="renameGroup" data-v="${c.id}" style="margin:10px auto 0">${ic('edit')} Rename</button></div>
  <div class="row sp" style="margin:6px 0"><b>Members</b>${c.members.length < 9 ? `<button class="link" data-act="addMembers" data-v="${c.id}" style="color:#a98bff">+ Add people</button>` : '<span class="xs mute">Group is full</span>'}</div>
  <div class="urow" style="padding:8px 0">${ring('avatar', 42)}<div class="grow"><b class="un">You</b><div class="xs mute">${isOwner ? 'Group admin' : 'Member'}</div></div></div>
  ${c.members.map(pid => { const p = person(pid); return `<div class="urow" style="padding:8px 0"><div class="row grow" style="min-width:0;cursor:pointer" data-go="#/actor/${pid}" role="link" tabindex="0">${ring(p.img, 42)}<div style="min-width:0"><b class="un">${esc(p.name)}</b><div class="xs mute ell">@${esc(p.handle)}${isBlocked(pid) ? ' · Blocked' : ''}</div></div></div>
    <button class="hbtn" data-act="memberMenu" data-v="${pid}" data-c="${c.id}" aria-label="Options for ${esc(p.name)}">${ic('dots')}</button></div>`; }).join('')}
  <label class="srow" style="margin-top:10px">${ic('mute')}<span class="grow">Mute notifications</span><input type="checkbox" id="gm" ${c.muted ? 'checked' : ''} style="width:20px;height:20px;accent-color:#7c4dff"></label>
  <button class="srow" style="color:#ff8da1" data-act="leaveAsk" data-v="${c.id}">${ic('logout')}<span class="grow" style="text-align:left">Leave group</span></button>`, { noNav: true });
  $('#gm').onchange = e => { c.muted = e.target.checked; save(); toast(c.muted ? 'Group muted.' : 'Group unmuted.'); };
}
function blockedList() {
  const l = (S.blocked || []).map(person).filter(Boolean);
  shell(`${topBack('Blocked users')}<p class="mute sm" style="margin:6px 2px 10px">Blocked people can’t message you and you won’t see their messages in groups. They aren’t told.</p>
  ${l.length ? l.map(p => `<div class="urow" style="padding:8px 0">${ring(p.img, 44)}<div class="grow" style="min-width:0"><b class="un">${esc(p.name)}</b><div class="xs mute ell">@${esc(p.handle)}</div></div><button class="btn sm" data-act="unblock" data-v="${p.id}">Unblock</button></div>`).join('') : '<div class="empty">You haven’t blocked anyone.</div>'}`, { noNav: true });
}
const confirmSheet = (title, text, ok, act, v, danger = true) => sheet(`<h2 class="ddh">${title}</h2><p class="mute sm">${text}</p><button class="btn ${danger ? 'danger' : 'pri'}" data-act="${act}" data-v="${v}" style="margin-top:6px">${ok}</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`);

/* ---------- handlers ---------- */
Object.assign(H, {
  noop() { },
  profMenu(el) { const p = person(el.v), b = isBlocked(el.v); sheet(`<h2 class="ddh">@${esc(p.handle)}</h2><button class="srow" data-act="msgStart" data-v="${p.id}" onclick="closeSheet()">${ic('msg')}<span class="grow" style="text-align:left">Send message</span></button><button class="srow" data-act="${b ? 'unblock' : 'blockAsk'}" data-v="${p.id}">${ic('ban')}<span class="grow" style="text-align:left">${b ? 'Unblock' : 'Block'}</span></button><button class="srow" data-act="report" data-v="${p.id}">${ic('flag')}<span class="grow" style="text-align:left">Report</span></button>`); },
  msgStart(el) { if (!need('send messages')) return; go('#/messages/u/' + el.v); },
  nfFilter(el) { MS.nf.f = el.v; $$('#nfc .chip').forEach(b => b.classList.toggle('on', b.dataset.v === el.v)); MS.nfPaint(); },
  gTog(el) { const s = MS.g?.sel || MS.asel; if (!s) return; s.has(el.v) ? s.delete(el.v) : (s.size < (MS.gmax || 10) ? s.add(el.v) : toast('Groups are limited to 10 people.')); (MS.g ? MS.gPaint : MS.aPaint)(); },
  gCreate() {
    const s = [...MS.g.sel]; if (s.length < 2) return; const name = MS.g.name.trim() || (s.slice(0, 2).map(first).join(', ') + (s.length > 2 ? ` & ${s.length - 2} other${s.length > 3 ? 's' : ''}` : ''));
    const c = { id: 'c' + msgId(), type: 'group', name, members: s, owner: 'me', msgs: [], read: Date.now(), created: Date.now() }; S.chats.unshift(c); save(); location.replace('#/messages/c/' + c.id);
  },
  emoToggle() { MS.emo = !MS.emo; paintEmo(); },
  emoTab(el) { MS.tab = el.v; paintEmo(); },
  emoPick(el) { const mi = $('#mi'); if (!mi) return; const s = mi.selectionStart ?? mi.value.length, e = mi.selectionEnd ?? s; mi.value = mi.value.slice(0, s) + el.v + mi.value.slice(e); const p = s + el.v.length; mi.setSelectionRange(p, p); S.recentEmoji = [el.v, ...(S.recentEmoji || []).filter(x => x !== el.v)].slice(0, 8); save(); MS.sync(); },
  attachMenu() { sheet(`<h2 class="ddh">Attach</h2><button class="srow" data-act="attPhoto">${ic('image')}<span class="grow" style="text-align:left">Photo</span></button><button class="srow" data-act="attCam">${ic('camera')}<span class="grow" style="text-align:left">Take a photo</span></button><button class="srow" data-act="attVideo">${ic('vid2')}<span class="grow" style="text-align:left">Video</span></button><button class="srow" data-act="attFile">${ic('doc')}<span class="grow" style="text-align:left">File</span></button><div class="xs mute" style="margin-top:8px">Up to 25 MB each. In this demo, videos and files stay available for this session only.</div>`); },
  attPhoto() { closeSheet(); pickFiles('image/*', 'image'); }, attCam() { closeSheet(); pickFiles('image/*', 'image', true); },
  attVideo() { closeSheet(); pickFiles('video/*', 'video'); }, attFile() { closeSheet(); pickFiles('*/*', 'any'); },
  msgSend() {
    const c = mChat(MS.chat), mi = $('#mi'); if (!c || !mi) return; const text = mi.value.trim(); if (!text) return;
    const reply = MS.reply ? { id: MS.reply.id, from: MS.reply.from, text: MS.reply.text } : null;
    mi.value = ''; MS.sync(); MS.reply = null; paintReply(); MS.emo = false; paintEmo();
    pushMsg(c, { from: 'me', kind: 'text', text, reply });
  },
  msgMenu(el) {
    const c = mChat(MS.chat), m = c?.msgs.find(x => x.id === el.v); if (!m) return; const mine = m.from === 'me';
    sheet(`<div class="qrx">${QUICK_RX.map(e => `<button data-act="msgReact" data-v="${m.id}" data-e="${e}" class="${m.rx?.[e]?.includes('me') ? 'on' : ''}">${e}</button>`).join('')}</div>
    <button class="srow" data-act="msgReply" data-v="${m.id}">${ic('reply')}<span class="grow" style="text-align:left">Reply</span></button>
    <button class="srow" data-act="msgFwd" data-v="${m.id}">${ic('fwd')}<span class="grow" style="text-align:left">Forward</span></button>
    ${m.text ? `<button class="srow" data-act="msgCopy" data-v="${m.id}">${ic('copy')}<span class="grow" style="text-align:left">Copy text</span></button>` : ''}
    <button class="srow" style="color:#ff8da1" data-act="msgDel" data-v="${m.id}">${ic('trash')}<span class="grow" style="text-align:left">${mine ? 'Delete for everyone' : 'Delete for me'}</span></button>`);
  },
  msgReact(el) {
    const c = mChat(MS.chat), m = c?.msgs.find(x => x.id === el.v); if (!m) return; m.rx = m.rx || {}; const u = m.rx[el.e] = m.rx[el.e] || [];
    const i = u.indexOf('me'); i < 0 ? (Object.keys(m.rx).forEach(k => { m.rx[k] = m.rx[k].filter(x => x !== 'me'); }), m.rx[el.e].push('me')) : u.splice(i, 1);
    Object.keys(m.rx).forEach(k => { if (!m.rx[k].length) delete m.rx[k]; }); save(); closeSheet(); paintMsgs();
  },
  msgReply(el) { const c = mChat(MS.chat), m = c?.msgs.find(x => x.id === el.v); if (!m) return; MS.reply = { id: m.id, from: m.from, text: snip(m) }; closeSheet(); paintReply(); $('#mi')?.focus(); },
  replyCancel() { MS.reply = null; paintReply(); },
  msgJump(el) { const n = $(`[data-mid="${el.v}"]`); if (!n) return toast('That message was deleted.'); n.scrollIntoView({ block: 'center', behavior: 'smooth' }); n.classList.add('flash'); setTimeout(() => n.classList.remove('flash'), 1400); },
  msgCopy(el) { const m = mChat(MS.chat)?.msgs.find(x => x.id === el.v); closeSheet(); try { navigator.clipboard.writeText(m.text); toast('Copied.'); } catch { toast('Press and hold the text to copy it.'); } },
  msgDel(el) { const c = mChat(MS.chat); c.msgs = c.msgs.filter(m => m.id !== el.v); MEM.delete(el.v); save(); closeSheet(); paintMsgs(); toast('Message deleted.'); },
  msgShow(el) { MS.shown = MS.shown || new Set(); MS.shown.has(el.v) ? MS.shown.delete(el.v) : MS.shown.add(el.v); paintMsgs(); },
  msgView(el) { const m = mChat(MS.chat)?.msgs.find(x => x.id === el.v); if (!m) return; const o = document.createElement('div'); o.className = 'pview'; o.innerHTML = `<button class="hbtn" aria-label="Close">${ic('x')}</button><img src="${m.att.src}" alt="Photo">`; o.onclick = () => o.remove(); app.append(o); },
  msgFile(el) { const m = mChat(MS.chat)?.msgs.find(x => x.id === el.v); const u = MEM.get(el.v); if (!u) return toast('This file is only available during the session it was sent in (demo).'); const a = document.createElement('a'); a.href = u; a.download = m.att.name; document.body.append(a); a.click(); a.remove(); },
  /* forward */
  msgFwd(el) {
    MS.fwd = [el.v]; MS.sel = new Set(); closeSheet();
    const rows = () => `${sorted().map(c => `<div class="urow gsel" data-act="fwdTog" data-v="c:${c.id}" role="checkbox" aria-checked="false" tabindex="0" style="padding:7px 0;cursor:pointer">${mAvatar(c, 40)}<div class="grow" style="min-width:0"><b class="un">${esc(chatTitle(c))}</b><div class="xs mute">${c.type === 'group' ? 'Group' : 'Chat'}</div></div><span class="bx"></span></div>`).join('')}<div class="xs mute" style="margin:10px 0 4px">People</div>${available().filter(p => !mChats().some(c => c.type === 'dm' && c.members[0] === p.id)).map(p => `<div class="urow gsel" data-act="fwdTog" data-v="p:${p.id}" role="checkbox" aria-checked="false" tabindex="0" style="padding:7px 0;cursor:pointer">${ring(p.img, 40)}<div class="grow" style="min-width:0"><b class="un">${esc(p.name)}</b><div class="xs mute">@${esc(p.handle)}</div></div><span class="bx"></span></div>`).join('')}`;
    sheet(`<h2 class="ddh">Forward to…</h2><div class="ddlist" style="max-height:48dvh">${rows()}</div><button class="btn pri" id="fgo" data-act="fwdGo" disabled style="margin-top:10px">Send</button>`);
  },
  fwdTog(el) { MS.sel.has(el.v) ? MS.sel.delete(el.v) : MS.sel.add(el.v); const n = $(`.overlay [data-v="${el.v}"]`); if (n) { n.classList.toggle('on'); n.setAttribute('aria-checked', MS.sel.has(el.v)); n.querySelector('.bx').innerHTML = MS.sel.has(el.v) ? ic('check') : ''; } const b = $('#fgo'); b.disabled = !MS.sel.size; b.textContent = MS.sel.size ? `Send to ${MS.sel.size}` : 'Send'; },
  fwdGo() {
    const src = mChat(MS.chat)?.msgs.find(x => x.id === MS.fwd[0]); if (!src || !MS.sel.size) return;
    [...MS.sel].forEach(k => {
      const [t, id] = k.split(':'); const c = t === 'c' ? mChat(id) : dmWith(id); if (!c) return;
      const m = { id: msgId(), from: 'me', kind: src.kind, text: src.text, att: src.att ? { ...src.att } : undefined, fwd: true, at: Date.now() }; c.msgs.push(m); c.read = m.at; if (MEM.has(src.id)) MEM.set(m.id, MEM.get(src.id));
    });
    const n = MS.sel.size; save(); closeSheet(); paintMsgs(true); toast(`Forwarded to ${n} chat${n > 1 ? 's' : ''}.`);
  },
  /* chat menu / block */
  chatMenu() {
    const c = mChat(MS.chat); if (!c) return; const dm = c.type === 'dm', pid = dm ? c.members[0] : null;
    sheet(`<h2 class="ddh">${esc(chatTitle(c))}</h2>
    ${dm ? `<button class="srow" data-go="#/actor/${pid}" onclick="closeSheet()">${ic('user')}<span class="grow" style="text-align:left">View profile</span></button>` : `<button class="srow" data-go="#/messages/info/${c.id}" onclick="closeSheet()">${ic('users')}<span class="grow" style="text-align:left">Group info</span></button>`}
    <button class="srow" data-act="chatMute">${ic('mute')}<span class="grow" style="text-align:left">${c.muted ? 'Unmute notifications' : 'Mute notifications'}</span></button>
    ${dm ? `<button class="srow" data-act="${isBlocked(pid) ? 'unblock' : 'blockAsk'}" data-v="${pid}">${ic('ban')}<span class="grow" style="text-align:left">${isBlocked(pid) ? 'Unblock' : 'Block'}</span></button><button class="srow" data-act="report" data-v="${pid}">${ic('flag')}<span class="grow" style="text-align:left">Report</span></button>` : `<button class="srow" style="color:#ff8da1" data-act="leaveAsk" data-v="${c.id}">${ic('logout')}<span class="grow" style="text-align:left">Leave group</span></button>`}
    ${dm ? `<button class="srow" style="color:#ff8da1" data-act="delAsk" data-v="${c.id}">${ic('trash')}<span class="grow" style="text-align:left">Delete conversation</span></button>` : ''}`);
  },
  chatMute() { const c = mChat(MS.chat); c.muted = !c.muted; save(); closeSheet(); toast(c.muted ? 'Muted.' : 'Unmuted.'); },
  delAsk(el) { closeSheet(); confirmSheet('Delete this conversation?', 'It disappears from your inbox. The other person keeps their copy.', 'Delete', 'delYes', el.v); },
  delYes(el) { S.chats = S.chats.filter(c => c.id !== el.v); save(); closeSheet(); go('#/messages'); toast('Conversation deleted.'); },
  leaveAsk(el) { closeSheet(); confirmSheet('Leave this group?', 'You won’t get new messages from it. Others can add you back.', 'Leave group', 'leaveYes', el.v); },
  leaveYes(el) { S.chats = S.chats.filter(c => c.id !== el.v); save(); closeSheet(); go('#/messages'); toast('You left the group.'); },
  blockAsk(el) { const p = person(el.v); if (!p) return; closeSheet(); confirmSheet(`Block @${esc(p.handle)}?`, `They won’t be able to message you, and you won’t see their messages in groups. You’ll stop following each other. They aren’t told. You can unblock anytime in Settings.`, 'Block', 'blockYes', el.v); },
  blockYes(el) {
    S.blocked = S.blocked || []; if (!S.blocked.includes(el.v)) S.blocked.push(el.v);
    S.aFollows = S.aFollows.filter(x => x !== el.v); S.followers = (S.followers || []).filter(x => x !== el.v); S.reqIn = (S.reqIn || []).filter(x => x !== el.v);
    const c = mChats().find(x => x.type === 'dm' && x.members[0] === el.v); if (c) { clearTimeout(MS.timers[c.id]); c.typing = null; }
    save(); closeSheet(); toast(`Blocked ${esc(pName(el.v))}.`); router();
  },
  unblock(el) { S.blocked = (S.blocked || []).filter(x => x !== el.v); save(); closeSheet(); toast(`Unblocked ${esc(pName(el.v))}.`); router(); },
  memberMenu(el) {
    const p = person(el.v), c = mChat(el.c); const owner = c.owner === 'me';
    sheet(`<h2 class="ddh">${esc(p.name)}</h2><button class="srow" data-go="#/actor/${p.id}" onclick="closeSheet()">${ic('user')}<span class="grow" style="text-align:left">View profile</span></button><button class="srow" data-act="msgStart" data-v="${p.id}" onclick="closeSheet()">${ic('msg')}<span class="grow" style="text-align:left">Message</span></button>
    <button class="srow" data-act="${isBlocked(p.id) ? 'unblock' : 'blockAsk'}" data-v="${p.id}">${ic('ban')}<span class="grow" style="text-align:left">${isBlocked(p.id) ? 'Unblock' : 'Block'}</span></button>
    ${owner ? `<button class="srow" style="color:#ff8da1" data-act="memberRemove" data-v="${p.id}" data-c="${c.id}">${ic('x')}<span class="grow" style="text-align:left">Remove from group</span></button>` : ''}`);
  },
  memberRemove(el) { const c = mChat(el.c); c.members = c.members.filter(x => x !== el.v); c.msgs.push({ id: msgId(), from: 'me', kind: 'text', text: `You removed ${pName(el.v)}`, at: Date.now(), sys: true }); save(); closeSheet(); router(); },
  renameGroup(el) { const c = mChat(el.v); const o = sheet(`<h2 class="ddh">Rename group</h2><label class="field"><input id="rn" maxlength="40" value="${esc(c.name)}" aria-label="Group name"></label><button class="btn pri" id="rng">Save</button>`); $('#rng', o).onclick = () => { const v = $('#rn', o).value.trim(); if (!v) return; c.name = v; save(); closeSheet(); router(); }; },
  addMembers(el) {
    const c = mChat(el.v); MS.asel = new Set(); MS.gmax = 9 - c.members.length; MS.g = null;
    const o = sheet(`<h2 class="ddh">Add people</h2><label class="field sm2"><span style="display:flex">${ic('search')}</span><input id="aq" placeholder="Search people" aria-label="Search people"></label><div class="ddlist" id="al" style="max-height:44dvh"></div><button class="btn pri" id="ago" disabled style="margin-top:10px">Add</button>`);
    let q = ''; MS.aPaint = () => { $('#al', o).innerHTML = groupList(MS.asel, q, c.members); $('#ago', o).disabled = !MS.asel.size; $('#ago', o).textContent = MS.asel.size ? `Add ${MS.asel.size}` : 'Add'; }; MS.aPaint();
    $('#aq', o).oninput = e => { q = e.target.value; MS.aPaint(); };
    $('#ago', o).onclick = () => { MS.asel.forEach(id => c.members.push(id)); c.msgs.push({ id: msgId(), from: 'me', kind: 'text', text: `You added ${[...MS.asel].map(pName).join(', ')}`, at: Date.now(), sys: true }); save(); closeSheet(); router(); };
  },
});
