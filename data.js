/* ICON data, icons and the mock "server" (story bible, quota ledger, unlock rules). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Icons ---------- */
const P = {
  clips:'<rect x="5.5" y="2.5" width="13" height="19" rx="3.5"/><path d="M10.2 8.6v6.6l5-3.3z"/>',
  clipsF:'<path fill-rule="evenodd" d="M9 2h6a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4zm1.2 6.6v6.6l5-3.3-5-3.3z"/>',
  plusq:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
  plusqF:'<path fill-rule="evenodd" d="M8 2.5h8A5.5 5.5 0 0 1 21.5 8v8a5.5 5.5 0 0 1-5.5 5.5H8A5.5 5.5 0 0 1 2.5 16V8A5.5 5.5 0 0 1 8 2.5zM11.2 7.4v3.8H7.4v1.6h3.8v3.8h1.6v-3.8h3.8v-1.6h-3.8V7.4z"/>',
  music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  scissors:'<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.4 8.6L20 19M8.4 15.4L20 5"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9M15 4v6M9 14v6"/>',
  tag:'<path d="M3 3h8l10 10-8 8L3 11V3z"/><path d="M7.5 7.5h.01"/>',
  dotsh:'<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>',
  textaa:'<path d="M2.5 18l5-12 5 12M4.5 14h6M14.5 18v-5a2.8 2.8 0 0 1 5.6 0v5M14.5 15.5h5.6"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.500l6.100-.9L12 3z"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M3 17l5-4 4 3 3-2 6 4"/>',
  userplus:'<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6"/>',
  heart:'<path d="M12 21s-8-5.3-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.8C20 15.7 12 21 12 21z"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/>',
  masks:'<path d="M3 5h10v6a5 5 0 0 1-10 0V5zM6 8.5h.01M10 8.5h.01M6 12.5s1 1 2 1 2-1 2-1"/><path d="M13 9h8v5a4.5 4.5 0 0 1-8 2.5"/>',
  ghost:'<path d="M5 20V11a7 7 0 0 1 14 0v9l-2.5-2-2 2-2.5-2-2.5 2-2-2L5 20zM9.5 11h.01M14.5 11h.01"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  hat:'<path d="M5 15c0-3 1-4 1-7a6 6 0 0 1 12 0c0 3 1 4 1 7M3 17c0 2 4 3 9 3s9-1 9-3c0-1-4-2-9-2s-9 1-9 2z"/>',
  grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5S15.5 16.5 15.5 20M16 14.5c3 0 5.5 1.5 5.5 4.5"/>',
  bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4l2-2zM10 21h4"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z"/>',
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z"/>',
  compass:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4M12 14v4M8 21h8M10 18h4"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.4 7.6A16 16 0 0 0 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.9"/>',
  comment:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>',
  play:'<path d="M7 4.5v15l13-7.5z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.7"/>',
  flip:'<path d="M4 8V5h3M20 16v3h-3M5 8a8 8 0 0 1 13-2M19 16a8 8 0 0 1-13 2"/>',
  wand:'<path d="M5 19L17 7l-1.5-1.5L3.5 17.5 5 19zM15 4.5L17 7M19 3v3M17.5 4.5h3M20 11v2M19 12h2M8 3v2M7 4h2"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevR:'<path d="M9 5l7 7-7 7"/>',chevL:'<path d="M15 5l-7 7 7 7"/>',chevD:'<path d="M5 9l7 7 7-7"/>',
  pin:'<path d="M15 3l6 6-3 1-3 3 .5 5L13 21l-3-5-6 5 5-6-5-3 3-2 5 .5 3-3 1-3z"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  loc:'<path d="M12 21s7-6 7-11.5A7 7 0 0 0 5 9.5C5 15 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/>',
  doc:'<path d="M6 3h9l4 4v14H6V3zM9 12h7M9 16h7M9 8h3"/>',
  bookmark:'<path d="M6 3h12v18l-6-4.5L6 21V3z"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  dots:'<path d="M12 5h.01M12 12h.01M12 19h.01"/>',
  sort:'<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  clap:'<path d="M3 9h18v11H3V9zM3 9l2-5 15 3-1 2M8 4l2 4M13 5l2 4"/>',
  film:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/><path d="M8 10.5v3l3-1.5z"/>',
  sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
  flag:'<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  volume:'<path d="M4 9h4l5-4v14l-5-4H4V9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  mute:'<path d="M4 9h4l5-4v14l-5-4H4V9zM17 9l5 6M22 9l-5 6"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  beauty:'<path d="M5 19l9-9M14 10l2-2M9 3l1 2.5L12.5 6.5 10 7.5 9 10 8 7.5 5.5 6.5 8 5.5 9 3zM17 12l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8L17 12z"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  logout:'<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  cardi:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  g:'<path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.3 4.3 0 0 1-1.9 2.8v2.3h3A9 9 0 0 0 21 12.2z" fill="#4285f4" stroke="none"/><path d="M12 21c2.4 0 4.5-.8 6-2.2l-3-2.3c-.8.5-1.8.9-3 .9-2.3 0-4.3-1.600-5-3.700H3.900v2.300A9 9 0 0 0 12 21z" fill="#34a853" stroke="none"/><path d="M7 13.700a5.400 5.400 0 0 1 0-3.400V8H3.900a9 9 0 0 0 0 8.100L7 13.700z" fill="#fbbc05" stroke="none"/><path d="M12 6.600c1.300 0 2.500.5 3.400 1.300l2.600-2.600A9 9 0 0 0 3.900 8L7 10.300c.7-2.100 2.700-3.700 5-3.700z" fill="#ea4335" stroke="none"/>',
  apple:'<path d="M16.4 12.600c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9-.7 0-1.800-.8-3-.8-1.600 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7c1.300 0 2.100-1.100 2.800-2.200.9-1.300 1.300-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.900zM14.200 5.800c.6-.8 1.100-1.900.9-3-.9 0-2.100.6-2.700 1.400-.6.700-1.100 1.800-1 2.900 1.100.1 2.200-.5 2.800-1.300z" class="f" stroke="none" fill="currentColor"/>',
  fb:'<circle cx="12" cy="12" r="10" fill="#fff" stroke="none"/><path d="M13.500 21v-7h2.300l.4-3h-2.700V9.300c0-.8.300-1.300 1.400-1.300h1.400V5.400C16 5.300 15.200 5.200 14.300 5.200c-2 0-3.300 1.200-3.300 3.400V11H8.700v3H11v7h2.500z" fill="#1877f2" stroke="none"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
const icf = n => ic(n, 'f');
const logo = (size = 52, tag = true) => `<div class="logo"><div class="w" style="font-size:${size}px">I C<svg width="${size * .92}" height="${size * .92}" viewBox="0 0 48 48"><defs><linearGradient id="lg${size}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6b3dff"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient></defs><circle cx="24" cy="24" r="21" fill="none" stroke="url(#lg${size})" stroke-width="6"/><path d="M19 15v18l15-9z" fill="url(#lg${size})"/></svg>N</div>${tag ? '<small>Act. Be Famous. Win</small>' : ''}</div>`;

/* ---------- Catalog ---------- */
const GENRES = [
  ['Romance', 'heart'], ['Comedy', 'smile'], ['Drama', 'masks'], ['Horror', 'ghost'], ['Thriller', 'search'], ['Mystery', 'hat']
];
const CITIES = ['Manila', 'Cebu', 'Davao', 'Iloilo', 'Quezon City'];
const IMG = n => { n = String(n); try { if (n === 'avatar' && S && S.user && S.user.photo) return S.user.photo; } catch { } return n.startsWith('data:') ? n : `img/${n}.jpg`; };
const PHC = ['Angeles', 'Antipolo', 'Bacolod', 'Baguio', 'Batangas City', 'Biñan', 'Butuan', 'Cabanatuan', 'Cagayan de Oro', 'Calamba', 'Caloocan', 'Cavite City', 'Cebu City', 'Dagupan', 'Dasmariñas', 'Davao City', 'General Santos', 'Iligan', 'Iloilo City', 'Lapu-Lapu', 'Las Piñas', 'Legazpi', 'Lipa', 'Makati', 'Malabon', 'Mandaluyong', 'Mandaue', 'Manila', 'Marikina', 'Muntinlupa', 'Naga', 'Navotas', 'Olongapo', 'Parañaque', 'Pasay', 'Pasig', 'Puerto Princesa', 'Quezon City', 'San Fernando', 'San Jose del Monte', 'San Juan', 'Santa Rosa', 'Tacloban', 'Taguig', 'Tarlac City', 'Valenzuela', 'Zamboanga City', 'Other (Philippines)'];
const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'];
const PERIODS = ['This Week', 'This Month', 'This Quarter'];
/* Prize amounts are placeholders. In production the admin portal sets them per period. */
const PRIZES = { 'This Week': [5000, 2500, 1000], 'This Month': [25000, 10000, 5000], 'This Quarter': [100000, 50000, 25000] };
const peso = n => '₱' + Number(n).toLocaleString('en-PH');
function periodRange(p) {
  const now = Date.now() + 8 * 3600e3, d = new Date(now), y = d.getUTCFullYear(), m = d.getUTCMonth(); let a, b;
  if (p === 'This Week') { const k = (d.getUTCDay() + 6) % 7; a = Date.UTC(y, m, d.getUTCDate() - k); b = a + 7 * 864e5 - 1; }
  else if (p === 'This Month') { a = Date.UTC(y, m, 1); b = Date.UTC(y, m + 1, 1) - 1; }
  else { const q = Math.floor(m / 3) * 3; a = Date.UTC(y, q, 1); b = Date.UTC(y, q + 3, 1) - 1; }
  const f = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const left = Math.max(0, b - now), dd = Math.floor(left / 864e5), hh = Math.floor(left % 864e5 / 36e5);
  return { label: `${f(a)} – ${f(b)}, ${new Date(b).getUTCFullYear()}`, left: dd ? `${dd}d ${hh}h left` : `${hh}h left` };
}
const STORIES = [
  { id: 's1', title: 'The Second Chance', genre: 'Romance', tags: ['Romance', 'Drama'], city: 'Manila', img: 'couple', eps: 3, views: 125000, likes: 12400, comments: 842, tagline: 'Sometimes, the right person comes at the wrong time.', syn: 'Two strangers meet again after years, but this time, nothing is the same.', cast: ['a1', 'a2'], date: 'Oct 2024' },
  { id: 's2', title: 'Roommates in Chaos', genre: 'Comedy', tags: ['Comedy', 'Friendship'], city: 'Cebu', img: 'roommates', eps: 3, views: 98000, likes: 9200, comments: 421, tagline: 'Same roof. Different dreams. Total chaos.', syn: 'Three roommates, one tiny apartment, and a landlord who never stops knocking.', cast: ['a3', 'a1'] },
  { id: 's3', title: 'The Last Message', genre: 'Drama', tags: ['Drama', 'Romance'], city: 'Manila', img: 'lastmsg', eps: 3, views: 76000, likes: 8100, comments: 310, tagline: 'Some words arrive too late.', syn: 'A voicemail, a promise, and the one conversation that never happened.', cast: ['a2'] },
  { id: 's4', title: 'Beyond Tomorrow', genre: 'Drama', tags: ['Sci-Fi', 'Drama'], city: 'Global', img: 'beyond', eps: 3, views: 62000, likes: 6800, comments: 320, tagline: "What if your tomorrow isn't the one you expected?", syn: 'A woman wakes up one day ahead of everyone else.', cast: ['a5'] },
  { id: 's5', title: 'The Encounter', genre: 'Thriller', tags: ['Thriller', 'Mystery'], city: 'Quezon City', img: 'encounter', eps: 3, views: 54000, likes: 5100, comments: 260, tagline: 'Someone has been following you home.', syn: 'A late shift, an empty street and a stranger who knows her name.', cast: ['a4', 'a3'] },
  { id: 's6', title: 'Coffee and Confessions', genre: 'Romance', tags: ['Romance'], city: 'Manila', img: 'couple2', eps: 2, views: 48000, likes: 4300, comments: 190, tagline: 'One cup. One confession.', syn: 'Every Friday, the same café, the same table, and a secret about to spill.', cast: ['a1', 'a2'] },
  { id: 's7', title: 'City Lights', genre: 'Romance', tags: ['Romance'], city: 'Cebu', img: 'man', eps: 3, views: 42000, likes: 3900, comments: 150, tagline: 'The city never sleeps, neither does he.', syn: 'A night-shift dreamer finds a reason to stay.', cast: ['a2'] },
  { id: 's8', title: 'Barkada Forever', genre: 'Comedy', tags: ['Comedy', 'Friendship'], city: 'Davao', img: 'trio', eps: 3, views: 38000, likes: 3100, comments: 130, tagline: 'Three friends. One reunion. Zero plans.', syn: 'The barkada reunites for a weekend that goes completely off script.', cast: ['a3', 'a5', 'a1'] },
  { id: 's9', title: 'A New Beginning', genre: 'Drama', tags: ['Drama'], city: 'Iloilo', img: 'smile', eps: 4, views: 36000, likes: 2800, comments: 110, tagline: 'Start over, one scene at a time.', syn: 'After the move, nothing feels familiar until a neighbour knocks.', cast: ['a5'] },
  { id: 's10', title: 'Just Friends?', genre: 'Romance', tags: ['Romance', 'Comedy'], city: 'Quezon City', img: 'roommates', eps: 3, views: 33000, likes: 2600, comments: 90, tagline: 'The line between friend and more.', syn: 'Best friends, one awkward almost-kiss.', cast: ['a4', 'a1'] },
];
const ACTORS = [
  { id: 'a1', name: 'Maria Santos', handle: 'mariasantos', img: 'a1', followers: 1200000, city: 'Manila', country: 'Philippines' },
  { id: 'a2', name: 'Aaron Cruz', handle: 'aaroncruz', img: 'a2', followers: 980000, city: 'Cebu', country: 'Philippines' },
  { id: 'a3', name: 'Bea Reyes', handle: 'beareyes', img: 'a3', followers: 820000, city: 'Davao', country: 'Singapore' },
  { id: 'a4', name: 'Jon Lim', handle: 'jonlim', img: 'a4', followers: 640000, city: 'Manila', country: 'United States' },
  { id: 'a5', name: 'Cathy Garcia', handle: 'cathygarcia', img: 'a5', followers: 510000, city: 'Iloilo', country: 'Philippines' },
];
const PLAYLISTS = [
  ['Feel Good Stories', 'smile', 'smile'], ['Kilig Moments', 'couple', 'heart'], ['Plot Twists', 'encounter', 'search'],
  ['Rising Actors', 'a4', 'user'], ['Pinoy Pride', 'church2', 'globe'], ['Global Hits', 'beyond', 'globe']
];

/* ---------- v2: countries, flags, extra sample videos, clips ---------- */
const COUNTRIES = [['Philippines','PH'],['United States','US'],['Japan','JP'],['South Korea','KR'],['Singapore','SG'],['United Kingdom','GB'],['Australia','AU'],['Canada','CA'],['India','IN'],['Indonesia','ID'],['Thailand','TH'],['Vietnam','VN'],['Malaysia','MY'],['United Arab Emirates','AE'],['Saudi Arabia','SA'],['Hong Kong','HK'],['Taiwan','TW'],['China','CN'],['New Zealand','NZ'],['Germany','DE'],['France','FR'],['Spain','ES'],['Italy','IT'],['Brazil','BR'],['Mexico','MX'],['Nigeria','NG'],['South Africa','ZA']];
const cc = n => (COUNTRIES.find(c => c[0] === n) || [n, 'XX'])[1];
const flag = n => n === 'Global' || !n ? '<span class="fl fg" aria-hidden="true"></span>' : `<img class="fl" src="flags/${cc(n).toLowerCase()}.svg" alt="" loading="lazy">`;
const CNAMES = COUNTRIES.map(c => c[0]);
const CMAP = { s1: 'Philippines', s2: 'Philippines', s3: 'Philippines', s4: 'United States', s5: 'Philippines', s6: 'Philippines', s7: 'Japan', s8: 'Philippines', s9: 'Australia', s10: 'Singapore' };
STORIES.forEach(s => { s.country = CMAP[s.id] || 'Philippines'; s.clip = `v/${s.id}.mp4`; });
STORIES.push(
  { id: 's11', title: 'Simbang Gabi', genre: 'Drama', tags: ['Drama', 'Faith'], city: 'Manila', country: 'Philippines', img: 'church1', clip: 'v/s11.mp4', eps: 3, views: 31000, likes: 2400, comments: 98, tagline: 'Nine dawns. One quiet wish.', syn: 'A nine-day dawn mass tradition, and the wish a young woman is almost afraid to say out loud.', cast: ['a1'] },
  { id: 's12', title: 'Vows', genre: 'Romance', tags: ['Romance', 'Drama'], city: 'Cebu', country: 'Philippines', img: 'church2', clip: 'v/s12.mp4', eps: 2, views: 29000, likes: 2900, comments: 120, tagline: 'Say it like you mean it.', syn: 'Hours before the wedding, two people test the words they wrote for each other.', cast: ['a2', 'a1'] },
  { id: 's13', title: 'Spotlight', genre: 'Drama', tags: ['Drama'], city: 'Global', country: 'Canada', img: 'a1', clip: 'v/s13.mp4', eps: 3, views: 27000, likes: 2100, comments: 80, tagline: 'The audition that changes everything.', syn: 'One take, one chance, and a casting room that does not smile back.', cast: ['a1'] },
  { id: 's14', title: 'Audition Day', genre: 'Comedy', tags: ['Comedy'], city: 'Global', country: 'Singapore', img: 'a3', clip: 'v/s14.mp4', eps: 3, views: 25000, likes: 2600, comments: 105, tagline: 'Nerves, nachos and one very loud sneeze.', syn: 'Everything that can go wrong in a waiting room, does.', cast: ['a3'] },
  { id: 's15', title: 'Night Shift', genre: 'Thriller', tags: ['Thriller', 'Mystery'], city: 'Global', country: 'South Korea', img: 'a2', clip: 'v/s15.mp4', eps: 3, views: 23000, likes: 1900, comments: 76, tagline: 'Every call has a voice you know.', syn: 'A radio dispatcher realises tonight’s caller has been dead for a year.', cast: ['a2'] },
  { id: 's16', title: 'Island Radio', genre: 'Mystery', tags: ['Mystery'], city: 'Global', country: 'Indonesia', img: 'a5', clip: 'v/s16.mp4', eps: 3, views: 21000, likes: 1700, comments: 64, tagline: 'A station that only plays tomorrow’s songs.', syn: 'On a quiet island, one frequency knows what happens next.', cast: ['a5'] }
);
/* Short vertical clips (all 9:16, max 60 s) for the Clips feed. src can be shared with a story trailer. */
const CLIPS = [
  { id: 'k1', actor: 'a4', series: 's5', src: 'v/k1.mp4', img: 'encounter', cap: 'One take. No second chances. 🎬', genre: 'Thriller', likes: 8200, comments: 214, views: 96000, country: 'United States' },
  { id: 'k2', actor: 'a1', series: 's1', src: 'v/k2.mp4', img: 'couple', cap: 'The look that broke the internet. Episode 2 drops tonight.', genre: 'Romance', likes: 15400, comments: 612, views: 188000, country: 'Philippines' },
  { id: 'k3', actor: 'a3', series: 's14', src: 'v/k3.mp4', img: 'roommates', cap: 'Waiting room chaos, part 1 😂', genre: 'Comedy', likes: 6100, comments: 158, views: 74000, country: 'Singapore' },
  { id: 'k4', actor: 'a2', series: 's12', src: 'v/k4.mp4', img: 'church2', cap: 'Practising my vows (please don’t laugh).', genre: 'Romance', likes: 9800, comments: 301, views: 121000, country: 'Philippines' },
  { id: 'k5', actor: 'a5', series: 's16', src: 'v/k5.mp4', img: 'beyond', cap: 'This radio only plays tomorrow’s songs…', genre: 'Mystery', likes: 4200, comments: 97, views: 51000, country: 'Indonesia' },
  { id: 'k6', actor: 'a1', series: 's13', src: 'v/k6.mp4', img: 'couple', cap: 'Behind the scenes of Spotlight.', genre: 'Drama', likes: 7300, comments: 189, views: 88000, country: 'Canada' },
  { id: 'k7', actor: 'a4', series: 's3', src: 'v/k7.mp4', img: 'lastmsg', cap: 'Some words arrive too late.', genre: 'Drama', likes: 11200, comments: 420, views: 140000, country: 'Philippines' },
  { id: 'k8', actor: 'a3', series: 's2', src: 'v/k8.mp4', img: 'roommates', cap: 'Same roof. Different dreams. 🏠', genre: 'Comedy', likes: 5400, comments: 133, views: 67000, country: 'Philippines' },
  { id: 'k9', actor: 'a2', series: 's15', src: 'v/k9.mp4', img: 'encounter', cap: 'Do NOT pick up the phone.', genre: 'Thriller', likes: 6900, comments: 175, views: 83000, country: 'South Korea' },
  { id: 'k10', actor: 'a5', series: 's11', src: 'v/k10.mp4', img: 'church2', cap: 'Nine dawns. One wish.', genre: 'Drama', likes: 3900, comments: 88, views: 42000, country: 'Philippines' },
  { id: 'k11', actor: 'a1', series: 's9', src: 'v/k11.mp4', img: 'smile', cap: 'Start over, one scene at a time.', genre: 'Drama', likes: 5100, comments: 121, views: 59000, country: 'Australia' },
  { id: 'k12', actor: 'a4', series: 's8', src: 'v/k12.mp4', img: 'trio', cap: 'Barkada reunion (zero plans).', genre: 'Comedy', likes: 8800, comments: 266, views: 104000, country: 'Philippines' }
].map(c => { const a = ACTORS.find(x => x.id === c.actor); const st = STORIES.find(x => x.id === c.series); return { ...c, isClip: true, title: st ? st.title : 'Clip', tags: [c.genre], city: 'Global', eps: 1, tagline: c.cap, syn: c.cap, cast: [c.actor], clip: c.src }; });

const TIERS = {
  free: { name: 'Free', price: 0, stories: 5, eps: 5, actors: 3, blurb: 'Try the full loop' },
  plus: { name: 'Plus', price: 99, stories: 50, eps: 15, actors: 3, blurb: 'More stories, longer arcs' },
  pro: { name: 'Pro', price: 199, stories: Infinity, eps: 30, actors: 5, blurb: 'Fair-use unlimited stories' },
};
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K' : '' + n;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Script bank: [title, location, setup, [dialogue A|B], [solo], cue] ---------- */
const BANK = {
  Romance: [
    ['Unexpected Hello', 'Café in {city}', 'You see your ex for the first time in two years. Both surprised, try to stay calm.', 'A:Wow… I didn\'t expect to see you here.|B:Yeah… it\'s been a long time.|A:How have you been?', 'A:(spotting someone across the café) Wow… I didn\'t expect to see you here.|A:(to yourself, smiling) Stay calm. Say hello. Just hello.', 'Hold eye contact one beat too long.'],
    ['Catching Up', 'Park bench', 'Small talk turns honest. Neither wants to leave first.', 'B:I kept your jacket. Never knew how to return it.|A:Keep it. It looks better on you anyway.|B:You always say that.', 'A:(on a bench, holding a jacket) I kept this. Never knew how to give it back.|A:(laughing softly) Maybe I never wanted to.', 'Let the laugh fade into silence.'],
    ['The Letter', 'Rooftop at sunset', 'A letter written years ago is finally read aloud.', 'A:I wrote this the night you left.|B:Read it. Please.|A:"I\'m not angry. I\'m just still here."', 'A:(unfolding a letter) I wrote this the night you left.|A:"I\'m not angry. I\'m just still here."', 'Voice steady, then crack on "still".'],
    ['Almost', 'Rainy street', 'Caught under one umbrella. An almost-moment.', 'B:We should go.|A:We should.|B:…Then why aren\'t we moving?', 'A:(under an umbrella, alone) We should go. We should.|A:…Then why aren\'t I moving?', 'Look up at the rain, then at the camera.'],
    ['Old Songs', 'Car at night', 'A song comes on that belonged to both of you.', 'A:Turn it up.|B:You hate this song.|A:I hate that I know every word.', 'A:(singing along, then catching yourself) I hate that I know every word.|A:Of course it had to play now.', 'Sing a line, stop mid-word.'],
    ['The Truth', 'Quiet rooftop', 'The reason behind the breakup comes out.', 'A:I was scared. Not of you. Of how much I wanted you.|B:You could have said that.|A:I\'m saying it now.', 'A:I was scared. Not of you. Of how much I wanted you.|A:I\'m saying it now, even if no one hears.', 'Slow, honest, no performance.'],
    ['Walk Me Home', 'Neighbourhood sidewalk', 'A silent walk says more than words.', 'B:This is my stop.|A:Funny. Mine too.|B:It isn\'t.|A:It is tonight.', 'A:(walking, to the camera) This is my stop. It isn\'t, really.|A:It is tonight.', 'Walk toward camera while talking.'],
    ['Second Thoughts', 'Apartment door', 'One of you hesitates at the door.', 'B:If I come in, things change.|A:Things already changed.|B:Say it again.', 'A:(hand on a doorknob) If I open this, things change.|A:They already changed. Open it.', 'Pause on the doorknob.'],
    ['Plot Twist', 'Airport gate', 'A surprise flight, a surprise choice.', 'A:I have a ticket. Two, actually.|B:You planned this?|A:I hoped. Hoped is different.', 'A:(holding a ticket) I have a ticket. I hoped you\'d say yes.|A:Hoped is different from planned.', 'Hold up the ticket to camera.'],
    ['The Second Chance', 'City rooftop', 'The finale. Choose each other, finally.', 'B:Are we really doing this again?|A:No. Not again. Differently.|B:Then yes.', 'A:(to the skyline) Are we really doing this again? No.|A:Not again. Differently.', 'End on a real smile.'],
  ],
  Comedy: [
    ['Move-In Day', 'Tiny apartment', 'Moving in. The couch will not fit through the door.', 'A:It fits. Trust me.|B:That is a door. That is a couch. This is physics.|A:Physics is a suggestion.', 'A:(wedged behind a couch) It fits. Trust me.|A:Physics is a suggestion!', 'Overly confident, then deflate.'],
    ['Who Ate My Leftovers', 'Kitchen', 'A fridge crime. Everyone is a suspect.', 'B:Somebody ate my adobo.|A:Wasn\'t me.|B:There\'s rice on your shirt.', 'A:(holding a fridge door) Somebody ate my adobo.|A:(glancing down) …Okay, this is not rice.', 'Slow detective squint.'],
    ['Landlord Knocks', 'Front door', 'The landlord is at the door. Hide the evidence.', 'A:Nobody\'s home!|B:You just answered.|A:That was the dog.', 'A:(whispering) Nobody\'s home!|A:(to the door) …That was the dog.', 'Barking at the end.'],
    ['Group Project', 'Living room', 'Four hours before a deadline with no project.', 'B:We have a presentation. We have no slides.|A:We have confidence.|B:Confidence isn\'t a slide.', 'A:We have a presentation in four hours. We have no slides.|A:We have confidence.', 'Fake-calm smile.'],
    ['Cooking Disaster', 'Kitchen smoke', 'Something is on fire. Not important.', 'A:It\'s fine, it\'s a feature.|B:The alarm disagrees.|A:The alarm is dramatic.', 'A:(waving smoke) It\'s fine, it\'s a feature.|A:The alarm is dramatic.', 'Wave a hand at the "smoke".'],
    ['Wrong Number', 'Hallway', 'A text is sent to the wrong person.', 'B:Did you just text "I love you"?|A:To mom. I meant mom.|B:It says Kuya Ben.', 'A:(staring at phone) I texted "I love you" to Kuya Ben.|A:Mom. I meant Mom.', 'Slow-motion panic.'],
    ['Karaoke Night', 'Videoke room', 'Confident singing. Zero skill.', 'A:This is my song.|B:You don\'t know the words.|A:I know the feeling.', 'A:(holding a mic) This is my song.|A:I don\'t know the words, but I know the feeling.', 'Big dramatic pose.'],
    ['Blackout', 'Dark apartment', 'The power goes out. Chaos in the dark.', 'B:Where are you?|A:In the dark, obviously.|B:Whose hand is that?', 'A:(holding a phone flashlight) Where is everyone? Hello?|A:Whose hand is that?!', 'Light the face from below.'],
    ['Surprise Party', 'Living room', 'A surprise party, for the wrong day.', 'A:SURPRISE!|B:It\'s next week.|A:We\'re early. That\'s a gift.', 'A:SURPRISE! …It\'s next week, isn\'t it?|A:We\'re early. That\'s a gift.', 'Hold the awkward pause.'],
    ['Eviction Notice', 'Rooftop', 'The finale: a heartfelt speech that goes wrong.', 'B:We\'ve been through everything.|A:Including the fire.|B:Especially the fire.', 'A:We\'ve been through everything together. Including the fire.|A:Especially the fire.', 'End with a group laugh.'],
  ],
  Drama: [
    ['The Move', 'Empty room', 'First night in a new place. Boxes everywhere.', 'A:It feels too quiet.|B:Give it time.|A:Time is what I\'m afraid of.', 'A:(sitting on a box) It feels too quiet.|A:Time is what I\'m afraid of.', 'Quiet, grounded, no hurry.'],
    ['The Neighbour', 'Hallway', 'A knock at the door changes the evening.', 'B:I made too much food.|A:That\'s a bad excuse.|B:It\'s the only one I have.', 'A:(at the door) You made too much food? That\'s a bad excuse.|A:…Come in.', 'Small, real smile.'],
    ['Old Photographs', 'Living room', 'A box of photos opens old wounds.', 'A:Why did you keep these?|B:Because you were in them.|A:That\'s not a reason.', 'A:(holding a photo) Why did I keep these?|A:Because I was in them.', 'Look at the photo, then away.'],
    ['The Phone Call', 'Balcony', 'Bad news arrives by phone.', 'B:Are you sitting down?|A:I\'m standing. Say it.|B:It\'s Lola.', 'A:(phone to ear) I\'m standing. Say it.|A:…Okay. I\'m coming home.', 'Let the breath shake.'],
    ['Back Home', 'Family house', 'A return after years away.', 'A:The gate still squeaks.|B:Nobody fixed it.|A:Nobody wanted to.', 'A:(touching a gate) The gate still squeaks.|A:Nobody wanted to fix it.', 'Run a hand along the gate.'],
    ['Family Dinner', 'Dining table', 'Everyone is polite. Nobody is fine.', 'B:Pass the rice.|A:Pass the truth first.|B:Not at dinner.', 'A:(at the table) Pass the rice.|A:And maybe the truth, while we\'re at it.', 'Tense, then soften.'],
    ['Argument', 'Kitchen', 'Words said that cannot be taken back.', 'A:You never listened.|B:You never spoke.|A:…We\'re the same.', 'A:You never listened. And I never spoke.|A:We\'re the same.', 'Let silence do the work.'],
    ['Apology', 'Porch', 'An apology that is two years late.', 'B:I was wrong.|A:Say it again.|B:I was wrong, and I\'m sorry.', 'A:I was wrong. I\'m sorry.|A:Two years late, but I\'m sorry.', 'Eye contact. No rush.'],
    ['Letting Go', 'Seaside', 'A goodbye to something old.', 'A:I think I\'m ready.|B:For what?|A:To stop waiting.', 'A:(by the sea) I think I\'m ready.|A:To stop waiting.', 'Breathe out slowly.'],
    ['A New Beginning', 'Sunrise street', 'The finale. A quiet, hopeful start.', 'B:What now?|A:Now we begin.|B:Where?|A:Anywhere.', 'A:(walking into sunrise) What now?|A:Now I begin. Anywhere.', 'End walking forward.'],
  ],
  Horror: [
    ['Strange Noise', 'Dark hallway', 'A sound from upstairs, again.', 'B:Did you hear that?|A:It\'s the pipes.|B:Pipes don\'t whisper.', 'A:(flashlight in hand) Did you hear that?|A:It\'s the pipes. …Pipes don\'t whisper.', 'Whisper everything.'],
    ['The Door', 'Basement stairs', 'A door that was locked is now open.', 'A:I locked this.|B:Maybe you forgot.|A:I never forget.', 'A:(staring at a door) I locked this.|A:I never forget.', 'Slow push on the door.'],
    ['Wrong Reflection', 'Bathroom mirror', 'The mirror is a half second late.', 'B:Why are you smiling?|A:I\'m not.|B:Your reflection is.', 'A:(at a mirror) I\'m not smiling.|A:…Why is it?', 'Freeze while the "reflection" moves.'],
    ['Missed Call', 'Bedroom', 'A call from a number that doesn\'t exist.', 'A:It\'s calling me.|B:Don\'t answer.|A:It\'s my own number.', 'A:(phone glowing) It\'s calling me.|A:…It\'s my own number.', 'Hold the phone away from you.'],
    ['Footsteps', 'Corridor', 'Footsteps stop when you stop.', 'B:Walk faster.|A:It walks faster too.|B:Don\'t look back.', 'A:(walking) It walks faster when I do.|A:Don\'t look back. Don\'t look back.', 'Do not look back until the end.'],
    ['The Photograph', 'Study', 'A new face appears in an old picture.', 'A:Who is that?|B:Nobody was there.|A:Then who\'s standing behind us?', 'A:(holding a photo) Who is that?|A:Who is standing behind us?', 'Squint, then recoil.'],
    ['Lights Out', 'Living room', 'Lights flicker. Something moves.', 'B:Stay close.|A:I am close.|B:Then who\'s holding my hand?', 'A:(whispering) Stay close.|A:Who\'s holding my hand?', 'Slow, frightened stillness.'],
    ['Whisper', 'Closet', 'It knows your name.', 'A:It said my name.|B:It said mine too.|A:Different voices.', 'A:It said my name.|A:In my mother\'s voice.', 'Barely audible.'],
    ['The Truth Below', 'Basement', 'What was sealed behind the wall.', 'B:Open it.|A:We shouldn\'t.|B:It\'s already open.', 'A:(at a wall) We shouldn\'t open this.|A:…It\'s already open.', 'Step back slowly.'],
    ['Dawn', 'Front yard', 'The finale. Morning, but not safe.', 'A:It\'s morning.|B:It\'s still watching.|A:Then we leave. Now.', 'A:(in the doorway) It\'s morning.|A:It\'s still watching. We leave now.', 'End on one last glance back.'],
  ],
  Thriller: [
    ['Late Shift', 'Office after hours', 'You are alone in the building. Or not.', 'A:Is anyone here?|B:Only me.|A:That\'s what worries me.', 'A:(looking around) Is anyone here?|A:Only me. That\'s what worries me.', 'Eyes scanning, tense.'],
    ['The Envelope', 'Doorstep', 'An envelope with no name and a photo of you.', 'B:Who sent this?|A:Open it.|B:It\'s you. Today.', 'A:(holding an envelope) It\'s me. Today.|A:Someone was watching.', 'Turn the photo toward camera.'],
    ['Shadow', 'Street at night', 'You are being followed.', 'A:Don\'t turn around.|B:He\'s been there since the bridge.|A:Cross the street.', 'A:(walking fast) Don\'t turn around.|A:He\'s been there since the bridge.', 'Steady pace, watch reflections.'],
    ['Safe House', 'Hotel room', 'A temporary safe place.', 'B:Lock the door.|A:Locked.|B:Check again.', 'A:(checking a lock) Locked. Check again.|A:Locked.', 'Nervous double check.'],
    ['The Informant', 'Café corner', 'A meeting with someone who knows too much.', 'A:Why help me?|B:Because I owe someone.|A:Who?', 'A:(across the table) Why help me?|A:Who do you owe?', 'Lean in slowly.'],
    ['Unknown Number', 'Rooftop', 'A call with a voice you recognise.', 'B:Don\'t hang up.|A:I know that voice.|B:Then you know I\'m not lying.', 'A:(phone in hand) I know that voice.|A:Then you know I\'m not lying.', 'Slow realisation.'],
    ['The Chase', 'Stairwell', 'Run. Don\'t explain.', 'A:Go go go.|B:Which floor?|A:Down. Always down.', 'A:(breathless) Go go go.|A:Down. Always down.', 'Breathe hard, move.'],
    ['Cornered', 'Parking lot', 'No exit.', 'B:There\'s nowhere to go.|A:There\'s always somewhere.|B:Not tonight.', 'A:(backing away) There\'s always somewhere.|A:Not tonight? Watch me.', 'Plant your feet.'],
    ['The Reveal', 'Warehouse', 'The face behind it all.', 'A:It was you.|B:It was always me.|A:Then why save me?', 'A:(to the camera) It was you.|A:Then why save me?', 'Shock, then control.'],
    ['Escape', 'Rooftop dawn', 'The finale. The fight ends.', 'B:Is it over?|A:For now.|B:For now is enough.', 'A:(at the edge, calm) Is it over?|A:For now is enough.', 'Exhale.'],
  ],
  Mystery: [
    ['The Case', 'Study', 'A missing item. A strange note.', 'A:Something\'s missing.|B:What?|A:The thing we weren\'t supposed to find.', 'A:(holding a note) Something\'s missing.|A:The thing we weren\'t supposed to find.', 'Raise an eyebrow.'],
    ['First Clue', 'Library', 'A page torn from a book.', 'B:This page is missing.|A:Not missing. Taken.|B:By whom?', 'A:(running a finger along a shelf) This page is missing.|A:Not missing. Taken.', 'Slow investigator walk.'],
    ['Suspects', 'Living room', 'Everyone had a reason.', 'A:Where were you at nine?|B:Home.|A:Alone?', 'A:(pacing) Where were you at nine?|A:Alone? Convenient.', 'Point, then retract.'],
    ['Alibi', 'Café', 'A story that doesn\'t add up.', 'B:I was here all night.|A:The café closes at ten.|B:…Did I say night?', 'A:(looking at a receipt) The café closes at ten.|A:…He said all night.', 'Tilt head, notice.'],
    ['The Key', 'Garden shed', 'A key that fits nothing yet.', 'A:What does this open?|B:Not the shed.|A:Then what?', 'A:(turning a key) Not the shed.|A:Then what does it open?', 'Hold the key to light.'],
    ['The Message', 'Rooftop', 'A coded message on a postcard.', 'B:Read it backwards.|A:"Behind the clock."|B:Which clock?', 'A:(reading a postcard) Read it backwards.|A:"Behind the clock." Which clock?', 'Turn the card around.'],
    ['Behind the Clock', 'Old hallway', 'A hidden compartment.', 'A:It\'s hollow.|B:Open it.|A:There\'s a photograph.', 'A:(tapping a wall) It\'s hollow.|A:There\'s a photograph.', 'Quiet gasp.'],
    ['The Witness', 'Park', 'Someone saw everything.', 'B:I saw them leave.|A:Who?|B:Someone you trust.', 'A:(sitting on a bench) Someone I trust.|A:That narrows it down. Painfully.', 'Look at each imagined suspect.'],
    ['The Confession', 'Study', 'A confession that explains too little.', 'A:Why did you take it?|B:To protect you.|A:From what?', 'A:Why did you take it?|A:To protect me from what?', 'Hold the question.'],
    ['Case Closed', 'Rooftop dawn', 'The finale. The last piece falls.', 'B:So that\'s all of it.|A:Almost.|B:Almost?', 'A:(to the camera) So that\'s all of it.|A:Almost. There\'s always one more.', 'End with a knowing look.'],
  ],
};
const EXTRA_C = { Romance: 'C:(smiling from the doorway) I\'ll give you two a minute.', Comedy: 'C:Is this a bad time, or is it a great one?', Drama: 'C:(quietly) I\'m here. Whatever you need.', Horror: 'C:(whispering) Don\'t turn around. Please.', Thriller: 'C:We have thirty seconds. Move.', Mystery: 'C:I think I know who did it.' };
const CHAR_NAMES = ['Mia', 'Alex', 'Jun', 'Bea', 'Leo'];

/* ---------- Mock "server" -------------------------------------------------
   In production these rules live on the server (PostgreSQL + job queue). Here
   they are kept behind this module so the UI only ever receives what the server
   would return: the current unlocked script, never the private story bible. */
const Server = (() => {
  const K = 'icon.server.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(K)) || { bibles: {}, ledger: [], takes: {} }; } catch { return { bibles: {}, ledger: [], takes: {} }; } };
  let db = load();
  const save = () => { try { localStorage.setItem(K, JSON.stringify(db)); } catch { } };
  const monthKey = () => { const d = new Date(Date.now() + 8 * 3600e3); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'); }; // Asia/Manila
  const resetDate = () => { const d = new Date(Date.now() + 8 * 3600e3); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'UTC' }); };
  const used = uid => db.ledger.filter(l => l.uid === uid && l.month === monthKey() && l.state !== 'released').length;
  const remaining = (uid, tier) => TIERS[tier].stories === Infinity ? Infinity : Math.max(0, TIERS[tier].stories - used(uid));
  const rnd = (seed) => { let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) / 4294967296; };

  function validate(req, tier) {
    const T = TIERS[tier]; const errs = [];
    if (!GENRES.some(g => g[0] === req.genre)) errs.push('Choose a genre.');
    if (req.episodes < 1 || req.episodes > T.eps) errs.push(`${T.name} allows up to ${T.eps} episode${T.eps > 1 ? 's' : ''} per story.`);
    if (req.cast.length < 1 || req.cast.length > T.actors) errs.push(`${T.name} allows up to ${T.actors} actors.`);
    return errs;
  }
  /* Reserve atomically, generate, commit only on success. Idempotent per opKey. */
  async function generate(user, req, opKey) {
    const ex = db.ledger.find(l => l.op === opKey);
    if (ex && ex.state !== 'released') return { ok: true, prodId: ex.prodId, dup: true };
    const errs = validate(req, user.tier);
    if (errs.length) return { ok: false, error: errs[0] };
    if (remaining(user.id, user.tier) < 1) return { ok: false, error: `You've used all ${TIERS[user.tier].stories} stories this month. Resets ${resetDate()} (Asia/Manila).`, quota: true };
    const prodId = 'p' + Date.now().toString(36);
    const entry = { op: opKey, uid: user.id, month: monthKey(), state: 'reserved', prodId, at: Date.now() };
    db.ledger.push(entry); save();
    await new Promise(r => setTimeout(r, 1900)); // stand-in for the structured-output generation job
    try {
      const bible = buildBible(req, user, prodId);
      db.bibles[prodId] = bible; entry.state = 'committed'; save();
      return { ok: true, prodId };
    } catch (e) { entry.state = 'released'; save(); return { ok: false, error: 'We could not write a valid story. Your allowance was not used. Try again.' }; }
  }
  /* Vlogs and podcasts: one open-ended episode, no AI script and no story allowance. */
  function createFree(user, { kind, title, notes }) {
    const prodId = 'p' + Date.now().toString(36);
    db.bibles[prodId] = { id: prodId, owner: user.id, kind, title: (title || '').trim() || (kind === 'podcast' ? 'Untitled podcast' : 'Untitled vlog'), genre: kind === 'podcast' ? 'Podcast' : 'Vlog', premise: notes || '', roles: [{ role: 0, character: user.name, actor: user.name.split(' ')[0] }], episodes: [{ n: 1, title: 'Episode 1', loc: 'Anywhere', setup: notes || '', lines: [], cue: '', free: true }], created: Date.now() };
    save(); return prodId;
  }
  /* Manual story (no AI): the user picks genre, actors and planned runtime, then records or uploads each <=60 s episode. */
  function createStory(user, { title, genre, cast, runtimeMin, episodes, city }, opKey) {
    const ex = db.ledger.find(l => l.op === opKey); if (ex && ex.state !== 'released') return { ok: true, prodId: ex.prodId, dup: true };
    const T = TIERS[user.tier];
    if (!(title || '').trim()) return { ok: false, error: 'Give your story a title.' };
    if (!GENRES.some(g => g[0] === genre)) return { ok: false, error: 'Choose a genre.' };
    if (runtimeMin < 1 || runtimeMin > T.eps) return { ok: false, error: `${T.name} allows a planned runtime of up to ${T.eps} min.` };
    if (cast.length < 1 || cast.length > T.actors) return { ok: false, error: `${T.name} allows up to ${T.actors} actors.` };
    if (remaining(user.id, user.tier) < 1) return { ok: false, error: `You've used all ${T.stories} stories this month. Resets ${resetDate()} (Asia/Manila).`, quota: true };
    const prodId = 'p' + Date.now().toString(36);
    db.ledger.push({ op: opKey, uid: user.id, month: monthKey(), state: 'committed', prodId, at: Date.now() });
    db.bibles[prodId] = { id: prodId, owner: user.id, kind: 'story', title: title.trim(), genre, city, premise: '', roles: cast.map((c, i) => ({ role: i, character: CHAR_NAMES[i], actor: c })), episodes: Array.from({ length: episodes || runtimeMin }, (_, i) => ({ n: i + 1, title: 'Episode ' + (i + 1), loc: city, setup: '', lines: [], cue: '', manual: true })), runtimeMin, created: Date.now() };
    save(); return { ok: true, prodId };
  }
  /* Upload/record length cap in seconds. Hard cap 60 s; the admin portal can lower it per account. */
  const ADM = 'icon.admin.v1';
  function uploadLimit(user) { let c = {}; try { c = JSON.parse(localStorage.getItem(ADM)) || {}; } catch { } const hard = Math.min(60, c.hardCap || 60); const v = (c.perUser && c.perUser[user?.id]) ?? c.defaultMax ?? 60; return Math.max(5, Math.min(hard, v)); }
  function buildBible(req, user, prodId) {
    const r = rnd(prodId + req.genre); const bank = BANK[req.genre];
    const names = CHAR_NAMES.slice(0, req.cast.length);
    const TT = { Romance: ['The Second Chance', 'Almost Forever', 'Kilig Season'], Comedy: ['Roommates in Chaos', 'Plan B Barkada', 'Wrong Number, Right Mess'], Drama: ['A New Beginning', 'The Quiet Return', 'Before the Rain'], Horror: ['Don\'t Look Back', 'The Third Whisper', 'After Midnight'], Thriller: ['The Encounter', 'Thirty Seconds', 'Safe House'], Mystery: ['Behind the Clock', 'The Missing Page', 'Case Not Closed'] }[req.genre];
    const title = TT[Math.floor(r() * TT.length)];
    const start = req.episodes >= bank.length ? 0 : Math.floor(r() * 0); // always arc from episode 1
    const arc = req.episodes === bank.length ? bank : [...bank.slice(0, req.episodes - 1), bank[bank.length - 1]];
    const episodes = arc.map((b, i) => {
      const solo = req.cast.length === 1; const city = req.city || 'Manila';
      const raw = (solo ? b[4] : b[3] + (req.cast.length >= 3 && i % 2 === 0 ? '|' + EXTRA_C[req.genre] : '')).split('|');
      const lines = raw.map(l => { const m = l.match(/^([ABC]):(.*)$/); const k = m ? 'ABC'.indexOf(m[1]) : 0; return { role: Math.min(k, req.cast.length - 1), text: (m ? m[2] : l).replace(/\{city\}/g, city) }; });
      return { n: i + 1, title: i === arc.length - 1 && req.episodes > 1 ? b[0] : b[0], loc: b[1].replace('{city}', city), setup: b[2], lines, cue: b[5], dur: [45, 60, 75, 50, 90, 40, 55, 65, 80, 70][i % 10] };
    });
    return {
      id: prodId, owner: user.id, title, genre: req.genre, lang: req.lang, setting: req.setting, city: req.city, theme: req.theme,
      premise: ({ Romance: 'Two people with unfinished business get one more shot at getting it right.', Comedy: 'Ordinary life goes sideways in the funniest possible way.', Drama: 'A quiet story about the people we come home to.', Horror: 'Something in the house knows you\'re there.', Thriller: 'One night, one decision, and someone who is always one step behind.', Mystery: 'Every clue points somewhere you didn\'t want to look.' })[req.genre],
      roles: req.cast.map((c, i) => ({ role: i, character: names[i], actor: c })), episodes, created: Date.now(), model: 'icon-demo-templates', promptV: 1, schemaV: 1,
    };
  }
  /* Viewer-safe projection: titles of future episodes are not even returned. */
  function overview(prodId) {
    const b = db.bibles[prodId]; if (!b) return null; const t = db.takes[prodId] || {};
    const accepted = Object.keys(t).filter(k => t[k].state === 'ready').length;
    return { id: b.id, kind: b.kind || 'story', title: b.title, genre: b.genre, premise: b.premise, roles: b.roles, total: b.episodes.length, runtimeMin: b.runtimeMin || 0, accepted, unlocked: Math.min(b.episodes.length, accepted + 1), takes: t, meta: { city: b.city, lang: b.lang } };
  }
  function getScript(prodId, n) {
    const b = db.bibles[prodId]; if (!b) return { ok: false, error: 'Story not found.' };
    const o = overview(prodId);
    if (n > o.unlocked) return { ok: false, locked: true, error: `Episode ${n} unlocks after Episode ${n - 1} is recorded, accepted and processed.` };
    const e = b.episodes[n - 1];
    return { ok: true, script: { ...e, roles: b.roles, title: e.title, series: b.title } };
  }
  async function acceptTake(prodId, n, info, onProgress) {
    const t = db.takes[prodId] = db.takes[prodId] || {};
    t[n] = { state: 'uploading', dur: info.dur, kind: info.kind, audio: !!info.audio, edits: info.edits || null, at: Date.now() };
    for (let p = 0; p <= 100; p += 10) { onProgress && onProgress('uploading', p); await new Promise(r => setTimeout(r, 120)); }
    t[n].state = 'processing'; onProgress && onProgress('processing', 100); save();
    await new Promise(r => setTimeout(r, 1300));
    t[n].state = 'ready'; save(); onProgress && onProgress('ready', 100);
    return overview(prodId);
  }
  function removeAll(uid) { Object.keys(db.bibles).forEach(k => db.bibles[k].owner === uid && (delete db.bibles[k], delete db.takes[k])); db.ledger = db.ledger.filter(l => l.uid !== uid); save(); }
  const mine = uid => Object.values(db.bibles).filter(b => b.owner === uid).map(b => overview(b.id)).reverse();
  return { createFree, createStory, uploadLimit, generate, getScript, overview, acceptTake, remaining, used, resetDate, validate, mine, removeAll };
})();

/* ---------- Filters and edit decisions (applied at playback; the server renders the final file) ---------- */
const FILTERS = [['none', 'Original', ''], ['beauty', 'Beauty', 'brightness(1.06) contrast(.94) saturate(1.08) blur(.35px)'], ['warm', 'Warm', 'sepia(.25) saturate(1.3) hue-rotate(-10deg) brightness(1.05)'], ['cool', 'Cool', 'saturate(1.1) hue-rotate(15deg) brightness(1.02) contrast(1.05)'], ['vivid', 'Vivid', 'saturate(1.6) contrast(1.1)'], ['vintage', 'Vintage', 'sepia(.55) contrast(.95) brightness(1.05)'], ['fade', 'Fade', 'contrast(.85) brightness(1.1) saturate(.8)'], ['mono', 'Mono', 'grayscale(1)'], ['noir', 'Noir', 'grayscale(1) contrast(1.35) brightness(.9)'], ['dream', 'Dream', 'brightness(1.1) saturate(1.2) blur(.5px) contrast(.95)']];
const newEdits = (dur = 0, filter = 'none') => ({ filter, b: 100, c: 100, s: 100, speed: 1, vol: 100, start: 0, end: dur, caption: '', pos: 'bottom' });
const fxCss = E => [FILTERS.find(f => f[0] === E.filter)?.[2] || '', E.b !== 100 ? `brightness(${E.b / 100})` : '', E.c !== 100 ? `contrast(${E.c / 100})` : '', E.s !== 100 ? `saturate(${E.s / 100})` : ''].filter(Boolean).join(' ') || 'none';
const fmtT = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const editSummary = (E, dur) => { const o = []; if (E.filter !== 'none') o.push(FILTERS.find(f => f[0] === E.filter)[1]); if (E.start > 0 || (E.end && dur && E.end < dur - .2)) o.push(`Trim ${fmtT(E.start)}–${fmtT(E.end || dur)}`); if (E.speed !== 1) o.push(E.speed + '×'); if (E.b !== 100 || E.c !== 100 || E.s !== 100) o.push('Adjusted'); if (E.vol !== 100) o.push(E.vol ? 'Volume ' + E.vol + '%' : 'Muted'); if (E.caption) o.push('Caption'); return o; };

/* ---------- Sample comments for catalog videos (your own videos start with none) ---------- */
const SEED_NAMES = ['Ria Mendoza', 'Paolo Dizon', 'Lia Cortez', 'Migs Ramos', 'Jessa Tan'];
const SEED_TEXT = {
  Romance: ['That look at the end gave me chills.', 'Kilig overload! Waiting for the next episode.', 'The chemistry is unreal.', 'Who else watched this three times?'],
  Comedy: ['The landlord knock part had me crying.', 'Please do a bloopers episode!', 'This is literally my barkada.', 'Best comedy on ICON this week.'],
  Drama: ['This hit way too close to home.', 'Beautifully acted. That pause said everything.', 'Grabbed the tissues for the last scene.', 'More of this please.'],
  Horror: ['I watched this at midnight. Big mistake.', 'The reflection moment! No thanks.', 'Sound design is on point.', 'Not sleeping tonight.'],
  Thriller: ['My heart was racing the whole time.', 'Did not see that ending coming.', 'Tense from the first second.', 'Episode 2 when?'],
  Mystery: ['I think I know who did it.', 'Rewatching for clues.', 'That key detail was so sneaky.', 'Need the next episode now.'],
  Vlog: ['Love this vibe!', 'Great tips, thank you.', 'Subscribed to your stories.', 'Where was this filmed?'],
  Podcast: ['Great conversation.', 'Listened to this on my commute.', 'Please do part two.', 'Learned a lot here.'],
};
const SEED_REPLY = ['Same! I rewatched it twice.', 'Totally agree 🔥', 'Following for the next episode.'];
function seedComments(s) {
  if (!s || s.mine) return [];
  const t = SEED_TEXT[s.genre] || SEED_TEXT.Drama; const H = [2, 5, 26, 70]; const L = [24, 11, 7, 3];
  return t.map((x, i) => ({ id: `seed_${s.id}_${i}`, uid: 'seed', n: SEED_NAMES[(i + s.id.length) % SEED_NAMES.length], t: x, at: Date.now() - H[i] * 3600e3, base: L[i] + (s.id.charCodeAt(s.id.length - 1) % 5) * 2, seed: true, r: i < 2 ? SEED_REPLY.slice(i, i + (i ? 1 : 2)).map((y, j) => ({ id: `seed_${s.id}_${i}_r${j}`, uid: 'seed', n: SEED_NAMES[(i + j + 2 + s.id.length) % SEED_NAMES.length], t: y, at: Date.now() - (H[i] - 1 - j) * 3600e3, base: 1 + j * 2, seed: true })) : [] }));
}
const ago = ts => { const m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; };
