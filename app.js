const $ = (s, p = document) => p.querySelector(s);
const store = { get: (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } }, set: (k, v) => localStorage.setItem(k, JSON.stringify(v)) };
let favorites = new Set(store.get('ll-favorites', []));
let entries = store.get('ll-entries', []);
let favoritesOnly = false;
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0));
const domain = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

function fallbackLogo(partner) { return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" rx="16" fill="#30213f"/><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="700" fill="#ffffff">${partner.name[0]}</text></svg>`)}`; }
function logoUrl(partner) { return partner.url ? `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(partner.url)}&sz=128` : fallbackLogo(partner); }
function renderPartners() {
  const query = $('#search').value.trim().toLowerCase();
  const filtered = PARTNERS.filter(p => (!query || `${p.name} ${p.note || ''}`.toLowerCase().includes(query)) && (!favoritesOnly || favorites.has(p.name)));
  const grid = $('#partner-grid'); grid.innerHTML = '';
  filtered.forEach(p => {
    const node = $('#card-template').content.cloneNode(true);
    const card = $('.partner-card', node), img = $('.logo', node), fav = $('.favorite', node);
    card.id = `partner-${p.name.replace(/[^a-z0-9]/gi, '-')}`;
    img.alt = `${p.name} logo`; img.src = logoUrl(p);
    img.onerror = () => { img.onerror = null; img.src = fallbackLogo(p); }; // Fallback brand mark if a site does not publish a favicon.
    $('h3', node).textContent = p.name;
    const meta = $('.card-meta', node);
    if (p.note) { const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = p.note; meta.append(tag); }
    const actions = $('.card-actions', node);
    if (p.url) { const link = document.createElement('a'); link.className = 'visit'; link.href = p.url; link.target = '_blank'; link.rel = 'nofollow sponsored noopener'; link.textContent = 'Visit partner ↗'; actions.append(link); }
    else { const noLink = document.createElement('span'); noLink.className = 'no-link'; noLink.textContent = 'Code supplied — link pending'; actions.append(noLink); }
    if (p.code) { const code = document.createElement('button'); code.type = 'button'; code.className = 'code code-copy'; code.textContent = `COPY CODE: ${p.code}`; code.title = 'Copy referral code'; code.addEventListener('click', async () => { try { await navigator.clipboard.writeText(p.code); code.textContent = 'COPIED ✓'; setTimeout(() => { code.textContent = `COPY CODE: ${p.code}`; }, 1400); } catch { code.textContent = `CODE: ${p.code}`; } }); actions.append(code); }
    const setFav = () => { const active = favorites.has(p.name); fav.classList.toggle('active', active); fav.textContent = active ? '♥' : '♡'; fav.setAttribute('aria-label', active ? 'Remove from favorites' : 'Add to favorites'); fav.setAttribute('aria-pressed', active); };
    fav.addEventListener('click', () => { favorites.has(p.name) ? favorites.delete(p.name) : favorites.add(p.name); store.set('ll-favorites', [...favorites]); setFav(); updateFavoriteCount(); }); setFav(); grid.append(node);
  });
  $('#partner-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'partner' : 'partners'}${query || favoritesOnly ? ' shown' : ''}`;
  $('#empty-state').hidden = filtered.length !== 0; $('#clear-search').hidden = !query;
}
function renderAlphabet() { const letters = [...new Set(PARTNERS.map(p => p.name[0].toUpperCase()))]; $('#alphabet').innerHTML = letters.map(l => `<button type="button" data-letter="${l}">${l}</button>`).join(''); $('#alphabet').addEventListener('click', e => { const letter = e.target.dataset.letter; if (!letter) return; $('#search').value = letter; renderPartners(); $('#directory').scrollIntoView({ behavior: 'smooth' }); }); }
function updateFavoriteCount() { const target = $('#favorite-count'); if (target) target.textContent = favorites.size; }
function saveEntries() { store.set('ll-entries', entries); renderLedger(); }
function currentMonthEntries() { const now = new Date(); return entries.filter(e => { const d = new Date(e.date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }); }
function renderLedger() { const month = currentMonthEntries(), spent = month.filter(e => e.type === 'loss').reduce((n, e) => n + e.amount, 0), won = month.filter(e => e.type === 'win').reduce((n, e) => n + e.amount, 0), rewards = month.filter(e => e.type === 'reward').length, budget = Number(store.get('ll-budget', 0));
  $('#net-total').textContent = money(won - spent); $('#net-total').style.color = won - spent < 0 ? 'var(--red)' : 'var(--green)'; $('#reward-total').textContent = rewards;
  $('#budget').value = budget || ''; const percent = budget ? Math.min(100, spent / budget * 100) : 0; $('#budget-progress').style.width = `${percent}%`; $('#budget-progress').style.background = percent >= 100 ? '#f27f65' : '#efb979'; $('#budget-summary').textContent = budget ? `${money(spent)} logged of your ${money(budget)} limit this month.${spent >= budget ? ' You have reached your limit — consider taking a break.' : ''}` : 'Set a limit before you play. A limit is not a target.';
  const list = $('#entry-list'); list.innerHTML = entries.length ? '' : '<p class="muted">No entries yet.</p>';
  entries.slice().reverse().forEach(e => { const el = document.createElement('div'); el.className = 'entry'; el.innerHTML = `<div><strong>${escapeHtml(e.partner)}</strong><small>${escapeHtml(e.note || e.type)} · ${new Date(e.date).toLocaleDateString()}</small></div><span class="entry-amount ${e.type}">${e.type === 'loss' ? '−' : e.type === 'win' ? '+' : ''}${e.type === 'reward' && !e.amount ? 'Claimed' : money(e.amount)}</span><button class="delete-entry" aria-label="Delete entry" data-id="${e.id}">×</button>`; list.append(el); });
}
function escapeHtml(s) { const el = document.createElement('span'); el.textContent = s; return el.innerHTML; }
$('#search').addEventListener('input', renderPartners); $('#clear-search').addEventListener('click', () => { $('#search').value = ''; renderPartners(); $('#search').focus(); });
$('#favorites-toggle').addEventListener('click', e => { favoritesOnly = !favoritesOnly; e.currentTarget.setAttribute('aria-pressed', favoritesOnly); e.currentTarget.textContent = favoritesOnly ? '♥ Favorites only' : '♡ Favorites only'; renderPartners(); });
$('#budget-form').addEventListener('submit', e => { e.preventDefault(); store.set('ll-budget', Math.max(0, Number($('#budget').value || 0))); renderLedger(); });
$('#entry-form').addEventListener('submit', e => { e.preventDefault(); const type = $('#entry-type').value, amount = Number($('#entry-amount').value || 0); if ((type === 'loss' || type === 'win') && amount <= 0) { $('#entry-amount').focus(); return; } entries.push({ id: crypto.randomUUID(), partner: $('#entry-partner').value.trim(), type, amount, note: $('#entry-note').value.trim(), date: new Date().toISOString() }); e.target.reset(); saveEntries(); });
$('#entry-list').addEventListener('click', e => { const id = e.target.dataset.id; if (id) { entries = entries.filter(x => x.id !== id); saveEntries(); } });
$('#clear-ledger').addEventListener('click', () => { if (entries.length && confirm('Delete all tracker entries from this browser?')) { entries = []; saveEntries(); } });
$('#export-ledger').addEventListener('click', () => { const rows = [['date','partner','type','amount','note'], ...entries.map(e => [e.date,e.partner,e.type,e.amount,e.note])]; const blob = new Blob([rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')], {type:'text/csv'}); const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob),download:'bonus-hunter-ledger.csv'}); a.click(); URL.revokeObjectURL(a.href); });
function initStudio() {
  document.querySelectorAll('.play-check').forEach(box => { box.checked = Boolean(store.get(`ll-check-${box.dataset.check}`, false)); box.addEventListener('change', () => store.set(`ll-check-${box.dataset.check}`, box.checked)); });
  let seconds = 15 * 60, timerId = null;
  const display = $('#timer-display'), status = $('#timer-status'), start = $('#timer-start');
  const paint = () => { const min = Math.floor(seconds / 60), sec = seconds % 60; display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; };
  document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => { clearInterval(timerId); timerId = null; seconds = Number(button.dataset.minutes) * 60; document.querySelectorAll('[data-minutes]').forEach(b => b.classList.toggle('active', b === button)); start.textContent = 'Start timer'; status.textContent = 'Pick a short session, then take a break.'; paint(); }));
  start.addEventListener('click', () => { if (seconds === 0) { seconds = 15 * 60; paint(); } if (timerId) { clearInterval(timerId); timerId = null; start.textContent = 'Resume timer'; status.textContent = 'Paused. Take a breath before you continue.'; return; } start.textContent = 'Pause timer'; status.textContent = 'Timer is running. Enjoy your time—then step away.'; timerId = setInterval(() => { seconds--; if (seconds <= 0) { clearInterval(timerId); timerId = null; seconds = 0; start.textContent = 'Start a new timer'; status.textContent = 'Time’s up. This is your cue to pause and check in.'; } paint(); }, 1000); });
  $('#timer-reset').addEventListener('click', () => { clearInterval(timerId); timerId = null; seconds = 15 * 60; start.textContent = 'Start timer'; status.textContent = 'Pick a short session, then take a break.'; document.querySelector('[data-minutes="15"]').classList.add('active'); paint(); });
  document.querySelector('[data-minutes="15"]').classList.add('active'); paint();
}
$('#partner-options').innerHTML = PARTNERS.map(p => `<option value="${p.name}">`).join(''); $('#year').textContent = new Date().getFullYear(); renderAlphabet(); renderPartners(); renderLedger(); updateFavoriteCount(); initStudio();
