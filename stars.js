/* ICON Gifts (DEMO): viewers buy sparks and send gifts to creators; creators see earnings and request pay outs.
   Nothing here moves real money. Rules shown to users: stars never affect rankings or prizes. */
Object.assign(P, { gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M12 8S10.5 3.5 8 4.5 7 8 12 8zM12 8s1.5-4.5 4-3.5S17 8 12 8z"/>' });
const STAR = { cut: .30, min: 500, perPayout: 2000, monthly: 5000, holdDays: 7, bundles: [[50, 49], [100, 99], [300, 279], [500, 449], [1000, 849], [2500, 2099]], gifts: [['🎬', 'Clapper', 10], ['⭐', 'Star', 50], ['🔥', 'Fire', 100], ['🏆', 'Trophy', 500], ['👑', 'Crown', 1000], ['💎', 'Diamond', 2500]], pay: ['GCash', 'Maya', 'Card'] };
const HOLD = STAR.holdDays * 864e5;
const ST = { sid: null, gi: 1, amt: 50, msg: '', anon: false, back: false, bun: 100, pay: 'GCash' };
const pesoR = n => '₱' + Math.round(n).toLocaleString('en-US');
const giftCount = () => { if (!S.user) return 0; const st = stars(); return st.earned.length + (S.user.demo ? 2480 : 0); };
const stars = () => {
  if (!S.user) return null;
  if (!S.stars) {
    const now = Date.now(), H3 = 3600e3, D = 24 * H3;
    S.stars = { bal: 0, sent: [], paid: [], cashed: [], payout: null, tab: 'in', earned: S.user.demo ? [
       { id: 'e1', from: 'x1', g: 3, n: 500, msg: 'Keep going, this series is amazing!', at: now - 2 * H3 },
      { id: 'e2', from: 'a2', g: 2, n: 100, msg: 'Loved episode 2', at: now - 9 * H3 },
      { id: 'e3', from: 'x2', g: 1, n: 50, msg: '', at: now - 1 * D },
      { id: 'e4', from: null, g: 0, n: 10, msg: 'Best series on ICON', at: now - 2 * D },
      { id: 'e5', from: 'x3', g: 4, n: 1000, msg: 'Please make season 2!', at: now - 4 * D },
      { id: 'e6', from: 'a1', g: 2, n: 100, msg: 'Proud of you', at: now - 6 * D },
      { id: 'e7', from: 'a2', g: 3, n: 500, msg: 'Season 2 when?', at: now - 9 * D },
      { id: 'e8', from: 'x2', g: 4, n: 1000, msg: 'You deserve this', at: now - 13 * D },
      { id: 'e9', from: 'a3', g: 3, n: 500, msg: '', at: now - 19 * D },
    ] : [] };
    save();
  }
  return S.stars;
};
const earnedTotal = () => stars().earned.reduce((t, e) => t + e.n, 0);
const pendingTotal = () => stars().earned.filter(e => Date.now() - e.at < HOLD).reduce((t, e) => t + e.n, 0);
const paidThisMonth = () => { const d = new Date(), m0 = new Date(d.getFullYear(), d.getMonth(), 1).getTime(); return stars().cashed.filter(c => c.at >= m0).reduce((t, c) => t + c.stars, 0); };
const paidToday = () => stars().cashed.some(c => new Date(c.at).toDateString() === new Date().toDateString());
const cashedTotal = () => stars().cashed.reduce((t, c) => t + c.stars, 0);
const availStars = () => earnedTotal() - cashedTotal() - pendingTotal();
const payable = () => Math.max(0, Math.min(availStars(), STAR.perPayout, STAR.monthly - paidThisMonth()));
const starsToPeso = n => Math.floor(n * (1 - STAR.cut));
const sNum = n => n.toLocaleString('en-US');

function starBurst(em = '🎁') {
  const o = document.createElement('div'); o.className = 'sburst'; o.setAttribute('aria-hidden', 'true');
  o.innerHTML = Array.from({ length: 16 }, (_, i) => `<i style="left:${8 + Math.random() * 84}%;animation-delay:${(Math.random() * .35).toFixed(2)}s;font-size:${18 + Math.round(Math.random() * 22)}px">${em}</i>`).join('');
  app.append(o); setTimeout(() => o.remove(), 1900);
}
function payDemo(label, done) {
  toast('Waiting for payment confirmation…', 1500);
  setTimeout(() => { done(); }, 1500);
}

/* ---------- sheets ---------- */
function giftSheet() {
  const s = getStory(ST.sid); if (!s) return; const o = ownerOf(s), bal = stars().bal;
  const short = ST.amt > bal;
  sheet(`<h2 class="ddh">Send a gift</h2>
  <div class="row gifthd">${ring(o.img, 42)}<div class="grow" style="min-width:0"><b class="ell" style="display:block">${esc(o.name)}</b><div class="xs mute ell">for “${esc(s.isClip ? (s.cap || s.title || 'this clip') : s.title)}”</div></div><button class="balchip" data-act="buyStars" data-v="back" aria-label="Your sparks: ${bal}. Get more">✨ ${sNum(bal)} <b>+</b></button></div>
  <div class="stt g" role="radiogroup" aria-label="Choose a gift">${STAR.gifts.map((g, i) => `<button type="button" role="radio" aria-checked="${ST.gi === i}" class="${ST.gi === i ? 'on' : ''}" data-act="giftAmt" data-v="${i}"><span class="gem">${g[0]}</span><span class="stn">${g[1]}</span><span class="xs mute">✨ ${sNum(g[2])}</span></button>`).join('')}</div>
  <label class="field sm2" style="margin-top:10px"><input id="gmsg" maxlength="80" placeholder="Add a message (optional)" value="${esc(ST.msg)}" aria-label="Message" autocomplete="off"></label>
  <label class="chk ${ST.anon ? 'on' : ''}" style="padding:6px 0;border:0"><span class="bx">${ST.anon ? ic('check') : ''}</span><span class="grow">Send anonymously</span><input type="checkbox" id="gan" ${ST.anon ? 'checked' : ''} hidden></label>
  <button class="btn pri" data-act="giftGo">${short ? 'Get more sparks' : `Send ${STAR.gifts[ST.gi][0]} ${STAR.gifts[ST.gi][1]} · ✨ ${sNum(ST.amt)}`}</button>
  <div class="xs mute" style="margin-top:8px;line-height:1.4">Gifts are a thank-you for the creator and can’t be refunded. Gifts never affect rankings or prizes. <b>Demo: nothing is charged.</b></div>`);
  $('#gmsg').addEventListener('input', e => { ST.msg = e.target.value; });
}
function buySheet() {
  sheet(`<h2 class="ddh">Get sparks</h2>
  <div class="stt b" role="radiogroup" aria-label="Bundle">${STAR.bundles.map(([n, p]) => `<button type="button" role="radio" aria-checked="${ST.bun === n}" class="${ST.bun === n ? 'on' : ''}" data-act="bunPick" data-v="${n}"><span class="stn">✨ ${sNum(n)}</span><span class="xs mute">${pesoR(p)}</span>${n >= 500 ? `<span class="sv">Save ${Math.round((1 - p / n) * 100)}%</span>` : ''}</button>`).join('')}</div>
  <div class="xs mute" style="margin:12px 2px 4px">Pay with</div>
  <div class="paym">${STAR.pay.map(m => `<button type="button" class="${ST.pay === m ? 'on' : ''}" data-act="payPick" data-v="${m}" aria-pressed="${ST.pay === m}">${m}</button>`).join('')}</div>
  <button class="btn pri" data-act="buyGo" style="margin-top:12px">Pay ${pesoR(STAR.bundles.find(b => b[0] === ST.bun)[1])}</button>
  <div class="xs mute" style="margin-top:8px">Sparks are non-refundable, can’t be exchanged and can’t be transferred to other people. <b>Demo: nothing is charged.</b></div>`);
}
function payoutSheet() {
  const p = stars().payout || { method: 'GCash', acct: '' };
  sheet(`<h2 class="ddh">Payout method</h2><p class="mute sm" style="margin:0 0 8px">Pay outs go only to an account in your own name. We verify your identity once before your first pay out.</p>
  <div class="paym">${['GCash', 'Maya'].map(m => `<button type="button" class="${p.method === m ? 'on' : ''}" data-act="poPick" data-v="${m}" aria-pressed="${p.method === m}">${m}</button>`).join('')}</div>
  <label class="field" style="margin-top:10px"><input id="poa" inputmode="numeric" maxlength="16" placeholder="Mobile or account number" value="${esc(p.acct)}" aria-label="Account number"></label>
  <label class="chk" id="pok" style="border:0;padding:4px 0"><span class="bx"></span><span class="grow xs">I’m 18+, this account is in my own name, and I agree to ICON’s creator terms and pay out limits.</span></label>
  <button class="btn pri" data-act="poSave" id="posv" disabled>Verify and save</button><div class="xs mute" style="margin-top:8px">Demo: identity check is simulated.</div>`);
  let ok = false; const upd = () => { $('#posv').disabled = !(ok && $('#poa').value.replace(/\D/g, '').length >= 8); };
  $('#pok').onclick = () => { ok = !ok; $('#pok').classList.toggle('on', ok); $('#pok .bx').innerHTML = ok ? ic('check') : ''; upd(); }; $('#poa').oninput = upd; ST.pm = p.method;
}

/* ---------- Stars page ---------- */
const sAv = e => e.from ? ring(person(e.from)?.img || 'avatar', 40) : `<span class="plic" style="width:40px;height:40px;border-radius:50%">🎁</span>`;
const gname = e => { const g = STAR.gifts[e.g ?? 1]; return `${g[0]} ${g[1]}`; };
window.giftsRoute = function () {
  if (!S.user) return go('#/home'); const st = stars(), avail = availStars(), pend = pendingTotal(), pay = payable(), ok = avail >= STAR.min && pay >= STAR.min && !paidToday(), tab = st.tab;
  let list = '';
  if (tab === 'in') list = st.earned.length ? [...st.earned].sort((a, b) => b.at - a.at).map(e => `<div class="urow">${sAv(e)}<div class="grow" style="min-width:0"><b class="sm ell" style="display:block">${e.from ? esc(person(e.from)?.name || 'Someone') : 'Anonymous'} sent a ${gname(e)}</b><div class="xs mute ell">${e.msg ? '“' + esc(e.msg) + '” · ' : ''}${ago2(e.at)}</div></div><span style="text-align:right"><b class="gold">+✨ ${sNum(e.n)}</b>${Date.now() - e.at < HOLD ? '<div class="xs mute">On hold</div>' : ''}</span></div>`).join('') : '<div class="empty">No gifts yet. When viewers send you gifts, they show up here.</div>';
  else if (tab === 'out') list = st.sent.length ? [...st.sent].sort((a, b) => b.at - a.at).map(e => `<div class="urow">${ring(e.img, 40)}<div class="grow" style="min-width:0"><b class="sm ell" style="display:block">${gname(e)} to ${esc(e.to)}</b><div class="xs mute ell">${e.msg ? '“' + esc(e.msg) + '” · ' : ''}${esc(e.title)} · ${ago2(e.at)}</div></div><b>−✨ ${sNum(e.n)}</b></div>`).join('') : '<div class="empty">You haven’t sent any gifts. Tap 🎁 on a video to support a creator.</div>';
  else list = st.cashed.length ? [...st.cashed].sort((a, b) => b.at - a.at).map(c => `<div class="urow"><span class="plic" style="width:40px;height:40px;border-radius:50%">${ic('upload')}</span><div class="grow"><b class="sm" style="display:block">✨ ${sNum(c.stars)} to ${esc(c.to)}</b><div class="xs mute">${ago2(c.at)} ago</div></div><span class="pill ${c.status === 'Paid' ? 'ok' : 'pk'}" style="${c.status === 'Paid' ? 'background:rgba(61,220,151,.15);color:#3ddc97' : ''}">${c.status}</span></div>`).join('') : '<div class="empty">No pay outs yet.</div>';
  shell(`${topBack('Gifts & earnings')}
  <div class="scard"><div class="row sp"><div><div class="xs mute">My sparks</div><div class="sbig">✨ ${sNum(st.bal)}</div></div><button class="btn sm pri" data-act="buyStars">Get sparks</button></div></div>
  <div class="scard earn"><div class="xs mute">Sparks from gifts</div><div class="row sp" style="align-items:flex-end"><div class="sbig gold">✨ ${sNum(avail)}</div><div style="text-align:right"><div class="xs mute">Available to pay out</div><b style="font-size:16px">✨ ${sNum(pay)}</b></div></div>
    ${pend ? `<div class="xs mute" style="margin-top:6px">${ic('clock').replace('class="i', 'style="width:12px;vertical-align:-2px" class="i')} ✨ ${sNum(pend)} on hold for ${STAR.holdDays} days after each gift</div>` : ''}
    <div class="bar" style="margin:10px 0 4px;height:6px"><i style="width:${Math.min(100, avail / STAR.min * 100)}%"></i></div><div class="xs mute">${avail >= STAR.min ? 'Ready for a pay out.' : `Pay outs start at ✨ ${sNum(STAR.min)} · ✨ ${sNum(Math.max(0, STAR.min - avail))} to go`}</div>
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm pri grow" data-act="cashOut" ${ok ? '' : 'aria-disabled="true" style="opacity:.55"'}>Request pay out</button><button class="btn sm grow" data-act="payoutSetup">${st.payout ? esc(st.payout.method) + ' ' + esc(st.payout.acct.slice(-4).padStart(st.payout.acct.length > 4 ? 8 : 4, '•')) : 'Set up pay out'}</button></div>
    <div class="xs mute" style="margin-top:8px;line-height:1.45">Limits: one request per day, up to ✨ ${sNum(STAR.perPayout)} per request and ✨ ${sNum(STAR.monthly)} per month (✨ ${sNum(Math.max(0, STAR.monthly - paidThisMonth()))} left this month). Identity verification required.</div></div>
  ${tabsRow([['in', 'Received'], ['out', 'Sent'], ['co', 'Pay outs']], tab, 'starTab')}<div style="margin-top:6px">${list}</div>
  <button class="link" data-act="simGift" style="display:block;margin:14px auto 0;color:#a98bff">Simulate an incoming gift (demo)</button>
  <p class="xs mute center" style="margin:10px 0 0">Demo only. Nothing is charged or paid. Gifts never affect rankings or prizes.</p>`, { noNav: true });
};

/* ---------- handlers ---------- */
Object.assign(H, {
  gift(el) {
    if (!need('send gifts')) return; const s = getStory(el.v); if (!s) return; if (s.mine) return toast('You can’t send a gift to yourself.');
    stars(); Object.assign(ST, { sid: el.v, amt: STAR.gifts[ST.gi][2], msg: '', anon: false }); giftSheet();
  },
  giftAmt(el) { ST.gi = +el.v; ST.amt = STAR.gifts[ST.gi][2]; ST.msg = $('#gmsg')?.value || ST.msg; ST.anon = !!$('#gan')?.checked; giftSheet(); },
  giftGo() {
    ST.msg = $('#gmsg')?.value.trim() || ''; ST.anon = !!$('#gan')?.checked; const st = stars();
    if (ST.amt > st.bal) { ST.bun = (STAR.bundles.find(b => b[0] >= ST.amt - st.bal) || STAR.bundles.at(-1))[0]; ST.back = true; return buySheet(); }
    const s = getStory(ST.sid), o = ownerOf(s); st.bal -= ST.amt;
    st.sent.push({ id: Date.now(), to: o.name, img: o.img, sid: s.id, title: s.isClip ? 'Clip' : s.title, n: ST.amt, g: ST.gi, msg: ST.msg, anon: ST.anon, at: Date.now() });
    save(); closeSheet(); starBurst(STAR.gifts[ST.gi][0]); toast(`You sent a ${STAR.gifts[ST.gi][0]} ${STAR.gifts[ST.gi][1]} to <b>${esc(o.name)}</b>. Thank you for supporting creators!`, 3200);
    $$(`[data-act=gift][data-v="${s.id}"]`).forEach(b => b.classList.add('sent'));
  },
  giftChk() { },
  buyStars(el) { ST.back = el.v === 'back'; if (!ST.back) ST.bun = ST.bun || 100; stars(); buySheet(); },
  bunPick(el) { ST.bun = +el.v; buySheet(); },
  payPick(el) { ST.pay = el.v; buySheet(); },
  buyGo() {
    const b = STAR.bundles.find(x => x[0] === ST.bun), st = stars();
    payDemo('Payment', () => {
      st.bal += b[0]; st.paid.push({ id: Date.now(), n: b[0], amt: b[1], method: ST.pay, at: Date.now() }); save(); closeSheet(); toast(`✨ ${sNum(b[0])} added to your balance.`);
      if (ST.back && ST.sid) { setTimeout(giftSheet, 350); } else if (route.name === 'gifts') router();
    });
  },
  starTab(el) { stars().tab = el.v; save(); router(); },
  payoutSetup() { stars(); payoutSheet(); },
  poPick(el) { ST.pm = el.v; $$('.paym button').forEach(b => { b.classList.toggle('on', b.dataset.v === el.v); b.setAttribute('aria-pressed', b.dataset.v === el.v); }); },
  poSave() { const st = stars(); st.payout = { method: ST.pm || 'GCash', acct: $('#poa').value.replace(/\D/g, ''), verified: true }; save(); closeSheet(); toast('Payout method verified and saved.'); router(); },
  cashOut() {
    const st = stars(), avail = availStars(), n = payable();
    if (paidToday()) return toast('You’ve already requested a pay out today. Try again tomorrow.', 2800);
    if (STAR.monthly - paidThisMonth() <= 0) return toast('You’ve reached this month’s pay out limit.', 2800);
    if (avail < STAR.min || n < STAR.min) return toast(`Pay outs start at ✨ ${sNum(STAR.min)}. Gifts are on hold for ${STAR.holdDays} days first.`, 3200);
    if (!st.payout) return payoutSheet();
    sheet(`<h2 class="ddh">Request pay out</h2><div class="card" style="margin:6px 0 10px"><div class="row sp"><span class="mute">Available</span><b>✨ ${sNum(avail)}</b></div><div class="row sp" style="margin-top:6px"><span class="mute">Limit per request</span><b>✨ ${sNum(STAR.perPayout)}</b></div><div class="row sp" style="margin-top:6px;border-top:1px solid var(--line);padding-top:8px"><span>This request</span><b style="font-size:18px">✨ ${sNum(n)}</b></div></div><div class="xs mute" style="margin-bottom:8px;line-height:1.45">To your verified ${esc(st.payout.method)} ${esc('••••' + st.payout.acct.slice(-4))}. Requests are reviewed first and usually complete within 1 to 3 days.</div><button class="btn pri" data-act="cashYes">Confirm request</button><button class="btn" style="margin-top:8px" data-act="closeSheet">Cancel</button>`);
  },
  cashYes() {
    const st = stars(), n = payable(); if (n < STAR.min || paidToday()) return closeSheet(); const c = { id: Date.now(), stars: n, to: st.payout.method, status: 'Under review', at: Date.now() };
    st.cashed.push(c); st.tab = 'co'; save(); closeSheet(); toast('Pay out requested. We’ll review it shortly.'); router();
    setTimeout(() => { c.status = 'Paid'; save(); notify(`Your pay out of ✨ ${sNum(n)} was sent to ${st.payout.method}.`); if (route.name === 'gifts') router(); }, 3500);
  },
  simGift() {
    const st = stars(), ppl = PEOPLE.filter(p => !(S.blocked || []).includes(p.id)), p = ppl[Math.floor(Math.random() * ppl.length)], gi = Math.floor(Math.random() * 4), n = STAR.gifts[gi][2];
    const msgs = ['Loved this!', 'Take this gift!', 'Keep creating!', '']; const anon = Math.random() < .25;
    st.earned.push({ id: 'e' + Date.now(), from: anon ? null : p.id, g: gi, n, msg: msgs[Math.floor(Math.random() * 4)], at: Date.now() }); save(); notify(`${anon ? 'Someone' : p.name} sent you a ${STAR.gifts[gi][1]}`); starBurst(STAR.gifts[gi][0]); toast(`${anon ? 'Someone' : esc(p.name)} sent you a ${STAR.gifts[gi][0]} ${STAR.gifts[gi][1]}`); st.tab = 'in'; router();
  },
});
