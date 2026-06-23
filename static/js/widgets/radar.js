import { esc } from '../utils/esc.js';

// ── STATE ──────────────────────────────────────────────────────────────────
let _items           = [];
let _stores          = {};   // item_id → stores array (cached)
let _open            = new Set();
let _refreshInterval = null;
let _historyOpen     = false;
let _historyItems    = null; // null = not yet loaded

// ── API ────────────────────────────────────────────────────────────────────
async function _api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${r.status}`);
  }
  return r.json();
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function _scoreClass(score) {
  if (score === null || score === undefined) return 'grey';
  if (score >= 65) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

function _fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(decimals);
}

function _rel(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 60)   return `${diff}m atrás`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
  return `${Math.floor(diff / 1440)}d atrás`;
}

function _scrollEl() {
  return document.querySelector('.tab-content') || document.getElementById('app');
}

function _rerender(container) {
  if (!container) return;
  const el  = _scrollEl();
  const top = el ? el.scrollTop : 0;
  renderRadar(container);
  bindRadar(container);
  if (el) el.scrollTop = top;
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function _renderScoreBadge(score) {
  const cls   = _scoreClass(score);
  const label = score !== null && score !== undefined ? score : '?';
  return `<div class="rd-score-badge ${cls}">
    <span>${label}</span>
    <span class="rd-score-label">score</span>
  </div>`;
}

function _renderScoreDelta(delta) {
  if (delta === null || delta === undefined || delta === 0) return '';
  const up = delta > 0;
  return `<span class="rd-score-delta ${up ? 'rd-delta-up' : 'rd-delta-dn'}">${up ? '▲' : '▼'}${Math.abs(delta)}</span>`;
}

function _renderSparkline(itemId, series) {
  if (!series || series.length < 2) return '';
  const W = 80, H = 30, PAD = 2;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const rng = max - min || 1;
  const xs = series.map((_, i) => PAD + (i / (series.length - 1)) * (W - PAD * 2));
  const ys = series.map(v => H - PAD - ((v - min) / rng) * (H - PAD * 2));
  const pts = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const fill = `${xs[0].toFixed(1)},${H - PAD} ${pts} ${xs[xs.length - 1].toFixed(1)},${H - PAD}`;
  const gid = `spk${itemId}`;
  return `<svg class="rd-sparkline" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4fc3f7" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#4fc3f7" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${fill}" fill="url(#${gid})"/>
    <polyline points="${pts}" fill="none" stroke="#4fc3f7" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function _renderBreakdown(bd) {
  if (!bd) return '';

  const comps = [
    {
      label: 'Posição no historial',
      pts: bd.position_pts ?? null,
      max: 50,
      hint: 'Quão baixo está o preço atual vs. o máximo dos últimos 90 dias. 50 pts = no mínimo histórico.',
    },
    {
      label: 'Vs. preço-alvo (P25)',
      pts: bd.vs_p25_pts ?? null,
      max: 30,
      hint: 'O P25 é o preço abaixo do qual o produto esteve em 25% dos dias. 30 pts = preço atual ≤ P25.',
    },
    {
      label: 'Promoção relâmpago',
      pts: bd.flash_sale_pts ?? null,
      max: 20,
      hint: 'Queda brusca de preço num único dia. 20 pts = queda ≥30%. 10 pts = queda ≥10%.',
    },
  ];

  const compHtml = comps.map(c => {
    const pct      = c.pts !== null ? Math.min(100, Math.round((c.pts / c.max) * 100)) : 0;
    const barColor = pct >= 60 ? 'var(--rd-green)' : pct >= 30 ? 'var(--rd-yellow)' : 'var(--rd-red)';
    return `<div class="rd-comp-row" title="${c.hint}">
      <span class="rd-comp-label">${c.label}</span>
      <div class="rd-comp-bar-wrap"><div class="rd-comp-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
      <span class="rd-comp-pts">${c.pts !== null ? Math.round(c.pts) : '—'}<span class="rd-comp-max"> / ${c.max}</span></span>
    </div>`;
  }).join('');

  const stats = [];
  if (bd.current_landed_eur != null) stats.push(`Atual <b>€${_fmt(bd.current_landed_eur)}</b>`);
  if (bd.min90d_eur         != null) stats.push(`Mín 90d <b>€${_fmt(bd.min90d_eur)}</b>`);
  if (bd.p25_eur            != null) stats.push(`Alvo P25 <b>€${_fmt(bd.p25_eur)}</b>`);
  if (bd.data_points        != null) stats.push(`Histórico <b>${bd.data_points}d</b>`);

  const warn = (bd.data_points != null && bd.data_points < 3)
    ? `<div class="rd-warning">⚠️ Score provisório — menos de 3 dias de histórico</div>` : '';
  const flash = (bd.flash_sale_drop_pct != null && bd.flash_sale_drop_pct > 0)
    ? `<span class="rd-flash-note"> ⚡ Queda de ${bd.flash_sale_drop_pct}% detectada</span>` : '';

  return `<div class="rd-breakdown-v2">
    <div class="rd-comp-section">${compHtml}</div>
    <div class="rd-stats-row">${stats.map(s => `<span>${s}</span>`).join('')}${flash}</div>
    ${warn}
    <details class="rd-methodology">
      <summary>ℹ Como é calculado o score?</summary>
      <div class="rd-methodology-body">
        <p><b>Posição no historial (0–50 pts):</b> Compara o preço atual com o intervalo dos últimos 90 dias. 50 pts quando está no mínimo histórico; 0 pts quando está no máximo. Reflete se o preço é bom em termos relativos.</p>
        <p><b>Vs. preço-alvo P25 (0–30 pts):</b> O P25 é o preço abaixo do qual o produto esteve em 25% dos dias — ou seja, historicamente um bom preço. 30 pts = preço atual ≤ P25. Score diminui à medida que o preço sobe acima desse limiar.</p>
        <p><b>Promoção relâmpago (0–20 pts):</b> Deteta quedas bruscas de preço num único dia em relação ao dia anterior. 20 pts = queda ≥30%. 10 pts = queda ≥10%. Útil para apanhar promoções de fim-de-semana ou flash sales.</p>
        <p><b>Score ≥65 → alerta Telegram</b> enviado automaticamente quando o score cruza este limiar (não dispara novamente enquanto o score se mantiver acima).</p>
      </div>
    </details>
  </div>`;
}

function _renderStoresTable(itemId, stores) {
  if (!stores || !stores.length) {
    return `<div class="rd-empty" style="padding:20px 0;text-align:left;">
      <p style="margin:0;color:#9898b8;font-size:13px;">Sem lojas adicionadas.</p>
    </div>`;
  }
  const validLanded = stores.filter(s => s.landed_eur != null);
  const best = validLanded.length ? Math.min(...validLanded.map(s => s.landed_eur)) : null;
  const rows = stores.map(s => {
    const isBest   = best != null && s.landed_eur != null && Math.abs(s.landed_eur - best) < 0.01;
    const stockCls = s.stock_status === 'in_stock' ? 'rd-stock-in'
      : s.stock_status === 'out_of_stock' ? 'rd-stock-out' : 'rd-stock-unk';
    const stockTxt = s.stock_status === 'in_stock' ? 'Em stock'
      : s.stock_status === 'out_of_stock' ? 'Sem stock' : '?';
    const ship = s.shipping_eur === null ? '?' : s.shipping_eur === 0 ? 'Grátis' : `€${_fmt(s.shipping_eur)}`;
    return `<tr class="${isBest ? 'rd-best-row' : ''}">
      <td><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.store_name)}</a>${isBest ? ' ⭐' : ''}</td>
      <td>${s.last_price_eur != null ? `€${_fmt(s.last_price_eur)}` : '—'}</td>
      <td>${ship}</td>
      <td><b>${s.landed_eur != null ? `€${_fmt(s.landed_eur)}` : '—'}</b></td>
      <td><span class="${stockCls}">${stockTxt}</span></td>
      <td style="font-size:11px;color:#9898b8;">${_rel(s.last_checked_at)}</td>
      <td class="rd-store-ops">
        <button class="rd-btn rd-btn-ghost rd-btn-xs" data-edit-store="${s.id}" data-item-id="${itemId}" title="Editar">✎</button>
        <button class="rd-btn rd-btn-ghost rd-btn-xs rd-btn-danger" data-del-store="${s.id}" data-item-id="${itemId}" data-store-name="${esc(s.store_name)}" title="Remover">×</button>
      </td>
    </tr>`;
  }).join('');
  return `<table class="rd-stores-table">
    <thead><tr>
      <th>Loja</th><th>Preço</th><th>Envio</th><th>Total</th><th>Stock</th><th>Atualizado</th><th></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function _renderItem(item) {
  const isOpen     = _open.has(item.id);
  const scoreHtml  = _renderScoreBadge(item.score);
  const deltaHtml  = _renderScoreDelta(item.score_delta);
  const spkInner   = _renderSparkline(item.id, item.sparkline);
  const spkHtml    = spkInner
    ? `<button class="rd-sparkline-btn" data-history-item="${item.id}" data-item-name="${esc(item.name)}" title="Ver historial de preços (90 dias)">${spkInner}</button>`
    : '';
  const storesHtml = isOpen && _stores[item.id]
    ? _renderStoresTable(item.id, _stores[item.id])
    : '<p style="color:#9898b8;font-size:13px;margin:12px 0 4px;">A carregar lojas...</p>';
  const bdHtml     = isOpen ? _renderBreakdown(item.breakdown) : '';
  const signalAge  = item.signal_computed_at
    ? `<span>Score ${_rel(item.signal_computed_at)}</span>` : '';
  const targetHtml = item.breakdown?.p25_eur != null
    ? `<div class="rd-target-price">Alvo €${_fmt(item.breakdown.p25_eur)}</div>` : '';
  return `<div class="rd-item${isOpen ? ' open' : ''}" data-id="${item.id}">
    <div class="rd-item-row" data-toggle="${item.id}">
      <div class="rd-score-wrap">
        ${scoreHtml}
        ${deltaHtml}
      </div>
      <div class="rd-item-info">
        <div class="rd-item-name">${esc(item.name)}</div>
        <div class="rd-item-meta">
          ${item.category ? `<span>${esc(item.category)}</span>` : ''}
          <span>${item.store_count} loja${item.store_count !== 1 ? 's' : ''}</span>
          ${signalAge}
        </div>
      </div>
      ${spkHtml}
      <div class="rd-price-area">
        <div class="rd-best-price">${item.best_price_eur != null ? `€${_fmt(item.best_price_eur)}` : '—'}</div>
        ${targetHtml}
      </div>
      <button class="rd-btn rd-btn-ghost rd-btn-xs rd-edit-item-btn" data-edit-item="${item.id}" title="Editar produto">✎</button>
      <button class="rd-btn rd-btn-ghost rd-btn-xs rd-archive-btn" data-archive="${item.id}" data-item-name="${esc(item.name)}" title="Arquivar">⊘</button>
      <div class="rd-chevron">›</div>
    </div>
    <div class="rd-stores">
      ${bdHtml}
      ${storesHtml}
      <div class="rd-store-actions" data-actions="${item.id}">
        <button class="rd-btn rd-btn-ghost rd-btn-sm" data-add-store="${item.id}">+ Loja</button>
        <button class="rd-btn rd-btn-ghost rd-btn-sm" data-run="${item.id}">↻ Atualizar</button>
        <button class="rd-btn rd-btn-purchased rd-btn-sm" data-purchase="${item.id}" data-item-name="${esc(item.name)}">✓ Comprado</button>
      </div>
    </div>
  </div>`;
}

function _renderHistoryItem(item) {
  const isPurchased = item.status === 'purchased';
  const badge = isPurchased
    ? `<div class="rd-history-badge rd-history-badge-purchased">✓</div>`
    : `<div class="rd-history-badge rd-history-badge-archived">⊘</div>`;
  const statusTag = isPurchased
    ? `<span class="rd-history-tag rd-history-tag-purchased">Comprado</span>`
    : `<span class="rd-history-tag rd-history-tag-archived">Arquivado</span>`;
  const priceHtml = isPurchased && item.purchased_price_eur != null
    ? `<div class="rd-history-price">€${_fmt(item.purchased_price_eur)}</div>
       ${item.purchased_store ? `<div class="rd-history-sub">${esc(item.purchased_store)}</div>` : ''}
       ${item.savings_eur != null ? `<div class="rd-history-savings">Poupei €${_fmt(item.savings_eur)}</div>` : ''}`
    : item.best_price_eur != null
      ? `<div class="rd-history-price rd-history-price-muted">€${_fmt(item.best_price_eur)}</div>`
      : `<div class="rd-history-price rd-history-price-muted">—</div>`;
  const scoreHtml = item.last_score != null
    ? `<span class="rd-history-score">score ${item.last_score}</span>` : '';
  return `<div class="rd-history-item" data-id="${item.id}">
    ${badge}
    <div class="rd-history-info">
      <div class="rd-history-name">${esc(item.name)}</div>
      <div class="rd-history-meta">${statusTag}${scoreHtml}</div>
    </div>
    <div class="rd-history-right">${priceHtml}</div>
    <button class="rd-btn rd-btn-ghost rd-btn-xs rd-btn-danger rd-history-del"
            data-delete-history="${item.id}" data-item-name="${esc(item.name)}"
            title="Apagar">×</button>
  </div>`;
}

function _renderHistorySection() {
  const count = _historyItems ? _historyItems.length : '';
  const label = _historyOpen ? '↑ Ocultar arquivados' : `↓ Arquivados${count !== '' ? ` (${count})` : ''}`;
  const listHtml = _historyOpen
    ? (_historyItems === null
        ? '<p class="rd-history-loading">A carregar...</p>'
        : _historyItems.length === 0
          ? '<p class="rd-history-empty">Sem itens arquivados ou comprados.</p>'
          : _historyItems.map(_renderHistoryItem).join(''))
    : '';
  return `<div class="rd-history-section">
    <button class="rd-btn rd-btn-ghost rd-btn-sm rd-history-toggle" id="rd-history-toggle">${label}</button>
    <div class="rd-history-list" id="rd-history-list" ${_historyOpen ? '' : 'style="display:none"'}>
      ${listHtml}
    </div>
  </div>`;
}

async function _loadHistory(container) {
  try {
    _historyItems = await _api('/api/radar/items/history');
  } catch (err) {
    _historyItems = [];
    console.error('radar history load failed:', err);
  }
  _rerender(container);
}

async function _deleteHistoryItem(itemId, itemName) {
  if (!confirm(`Apagar "${itemName}" permanentemente?`)) return;
  try {
    await _api(`/api/radar/items/${itemId}`, 'DELETE');
    _historyItems = (_historyItems || []).filter(i => i.id !== itemId);
    _rerender(document.getElementById('radar-card'));
  } catch (err) {
    _showToast(`Erro ao apagar: ${err.message}`);
  }
}

export function renderRadar(container) {
  if (!container) return;
  const items      = _items;
  const headerHtml = `<div class="rd-header">
    <div>
      <div class="rd-header-title">Radar de Preços</div>
      <div class="rd-header-sub">${items.length} produto${items.length !== 1 ? 's' : ''} em acompanhamento</div>
    </div>
    <button class="rd-btn rd-btn-primary rd-btn-sm" id="rd-add-item-btn">+ Produto</button>
  </div>`;
  const body = items.length
    ? items.map(_renderItem).join('')
    : `<div class="rd-empty">
        <div class="rd-empty-icon">🎯</div>
        <p>Nenhum produto em acompanhamento.</p>
        <button class="rd-btn rd-btn-primary" id="rd-add-item-btn-empty">+ Adicionar produto</button>
      </div>`;
  container.innerHTML = `<div class="card-label">Radar</div>${headerHtml}${body}${_renderHistorySection()}`;
}

// ── TOAST ──────────────────────────────────────────────────────────────────
function _showToast(msg) {
  const t = document.createElement('div');
  t.className = 'rd-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('rd-toast-show'));
  setTimeout(() => { t.classList.remove('rd-toast-show'); setTimeout(() => t.remove(), 300); }, 4000);
}

// ── MODALS ─────────────────────────────────────────────────────────────────
function _openAddItemModal() {
  const el = document.createElement('div');
  el.className = 'rd-modal-overlay';
  el.innerHTML = `<div class="rd-modal">
    <h3>Adicionar produto</h3>
    <div class="rd-field">
      <label>Nome do produto</label>
      <input id="rd-mi-name" type="text" placeholder="Ex: LG WashTower WT1210BBF" />
    </div>
    <div class="rd-field">
      <label>Categoria (opcional)</label>
      <input id="rd-mi-cat" type="text" placeholder="Ex: Electrodomésticos" />
    </div>
    <div id="rd-mi-err" class="rd-modal-error" style="display:none"></div>
    <div class="rd-modal-actions">
      <button class="rd-btn rd-btn-ghost" id="rd-mi-cancel">Cancelar</button>
      <button class="rd-btn rd-btn-primary" id="rd-mi-save">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#rd-mi-name').focus();
  el.querySelector('#rd-mi-cancel').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  const saveBtn = el.querySelector('#rd-mi-save');
  saveBtn.onclick = async () => {
    const name  = el.querySelector('#rd-mi-name').value.trim();
    const cat   = el.querySelector('#rd-mi-cat').value.trim();
    const errEl = el.querySelector('#rd-mi-err');
    if (!name) { errEl.textContent = 'Nome obrigatório.'; errEl.style.display = 'block'; return; }
    saveBtn.disabled = true; saveBtn.textContent = 'A guardar...';
    try {
      const item = await _api('/api/radar/items', 'POST', { name, category: cat || null });
      _items.push({ ...item, best_price_eur: null, score: null, breakdown: null, signal_computed_at: null, store_count: 0 });
      el.remove();
      const c = document.getElementById('radar-card');
      _rerender(c);
      _openAddStoreModal(item.id);
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
      saveBtn.disabled = false; saveBtn.textContent = 'Guardar';
    }
  };
}

function _openAddStoreModal(itemId) {
  const item = _items.find(i => i.id === itemId);
  const el   = document.createElement('div');
  el.className = 'rd-modal-overlay';
  el.innerHTML = `<div class="rd-modal">
    <h3>Adicionar loja — ${esc(item?.name || '')}</h3>
    <div class="rd-field">
      <label>URL do produto</label>
      <input id="rd-ms-url" type="url" placeholder="https://www.worten.pt/..." />
    </div>
    <div class="rd-field">
      <label>Nome da loja</label>
      <input id="rd-ms-store" type="text" placeholder="Ex: Worten" />
    </div>
    <div class="rd-field">
      <label>Preço atual (€)</label>
      <input id="rd-ms-price" type="number" step="0.01" placeholder="Ex: 1687.00" />
      <div class="rd-hint">Preço de lançamento para o PriceGhost</div>
    </div>
    <div class="rd-field">
      <label>Envio (€) — 0 = grátis, deixar vazio = desconhecido</label>
      <input id="rd-ms-ship" type="number" step="0.01" placeholder="0.00" />
    </div>
    <div id="rd-ms-err" class="rd-modal-error" style="display:none"></div>
    <div class="rd-modal-actions">
      <button class="rd-btn rd-btn-ghost" id="rd-ms-cancel">Cancelar</button>
      <button class="rd-btn rd-btn-primary" id="rd-ms-save">Adicionar</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#rd-ms-url').focus();

  el.querySelector('#rd-ms-url').addEventListener('blur', e => {
    const url = e.target.value.trim();
    if (!url) return;
    const storeInput = el.querySelector('#rd-ms-store');
    if (storeInput.value) return;
    try {
      const host  = new URL(url).hostname.replace(/^www\./, '');
      const known = {
        'worten.pt': 'Worten', 'fnac.pt': 'Fnac', 'mediamarkt.pt': 'Media Markt',
        'electrocortes.pt': 'Electrocortes', 'elcorteingles.pt': 'El Corte Inglés',
        'euronics.pt': 'Euronics', 'radiopular.pt': 'Rádio Popular',
        'amazon.es': 'Amazon.es', 'amazon.pt': 'Amazon.pt', 'darty.pt': 'Darty',
      };
      storeInput.value = known[host] || host;
    } catch { /* ignore */ }
  });

  el.querySelector('#rd-ms-cancel').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  const saveBtn = el.querySelector('#rd-ms-save');
  saveBtn.onclick = async () => {
    const url      = el.querySelector('#rd-ms-url').value.trim();
    const store    = el.querySelector('#rd-ms-store').value.trim();
    const priceRaw = el.querySelector('#rd-ms-price').value.trim();
    const shipRaw  = el.querySelector('#rd-ms-ship').value.trim();
    const errEl    = el.querySelector('#rd-ms-err');
    if (!url || !store) {
      errEl.textContent = 'URL e nome da loja são obrigatórios.';
      errEl.style.display = 'block';
      return;
    }
    saveBtn.disabled = true; saveBtn.textContent = 'A adicionar...';
    const payload = { url, store_name: store };
    if (priceRaw) payload.price_eur = parseFloat(priceRaw);
    if (shipRaw !== '') payload.shipping_eur = parseFloat(shipRaw);
    try {
      await _api(`/api/radar/items/${itemId}/stores`, 'POST', payload);
      delete _stores[itemId];
      el.remove();
      _showToast('Loja adicionada. Preço atualizado em breve (≤1h).');
      await _refreshItem(itemId);
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
      saveBtn.disabled = false; saveBtn.textContent = 'Adicionar';
    }
  };
}

function _openEditStoreModal(itemId, store) {
  const el = document.createElement('div');
  el.className = 'rd-modal-overlay';
  el.innerHTML = `<div class="rd-modal">
    <h3>Editar loja — ${esc(store.store_name)}</h3>
    <div class="rd-field">
      <label>URL do produto</label>
      <input id="rd-es-url" type="url" value="${esc(store.url)}" />
    </div>
    <div class="rd-field">
      <label>Envio (€) — 0 = grátis, vazio = desconhecido</label>
      <input id="rd-es-ship" type="number" step="0.01" value="${store.shipping_eur ?? ''}" />
    </div>
    <div class="rd-field rd-field-check">
      <label><input type="checkbox" id="rd-es-active" ${store.active ? 'checked' : ''} /> Ativo</label>
    </div>
    <div id="rd-es-err" class="rd-modal-error" style="display:none"></div>
    <div class="rd-modal-actions">
      <button class="rd-btn rd-btn-ghost" id="rd-es-cancel">Cancelar</button>
      <button class="rd-btn rd-btn-primary" id="rd-es-save">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#rd-es-cancel').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  const saveBtn = el.querySelector('#rd-es-save');
  saveBtn.onclick = async () => {
    saveBtn.disabled = true; saveBtn.textContent = 'A guardar...';
    const url     = el.querySelector('#rd-es-url').value.trim();
    const shipRaw = el.querySelector('#rd-es-ship').value.trim();
    const active  = el.querySelector('#rd-es-active').checked;
    const errEl   = el.querySelector('#rd-es-err');
    const payload = { active };
    if (url) payload.url = url;
    if (shipRaw !== '') payload.shipping_eur = parseFloat(shipRaw);
    try {
      await _api(`/api/radar/items/${itemId}/stores/${store.id}`, 'PATCH', payload);
      delete _stores[itemId];
      el.remove();
      await _refreshItem(itemId);
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
      saveBtn.disabled = false; saveBtn.textContent = 'Guardar';
    }
  };
}

// ── REFRESH ─────────────────────────────────────────────────────────────────
async function _refreshItem(itemId) {
  const [items, stores] = await Promise.all([
    _api('/api/radar/items'),
    _api(`/api/radar/items/${itemId}/stores`),
  ]);
  _items = items;
  _stores[itemId] = stores;
  _rerender(document.getElementById('radar-card'));
}

async function _loadStores(itemId) {
  if (_stores[itemId]) return _stores[itemId];
  const stores = await _api(`/api/radar/items/${itemId}/stores`);
  _stores[itemId] = stores;
  return stores;
}

async function _autoRefresh() {
  const c = document.getElementById('radar-card');
  if (!c) { clearInterval(_refreshInterval); _refreshInterval = null; return; }
  try {
    _items = await _api('/api/radar/items');
    for (const id of _open) { delete _stores[id]; }
    await Promise.all([..._open].map(id => _loadStores(id)));
    _rerender(c);
  } catch { /* silent */ }
}

// ── ACTIONS ─────────────────────────────────────────────────────────────────
async function _deleteStore(itemId, storeId, storeName) {
  if (!confirm(`Remover loja "${storeName}"?`)) return;
  try {
    await _api(`/api/radar/items/${itemId}/stores/${storeId}`, 'DELETE');
    delete _stores[itemId];
    await _refreshItem(itemId);
  } catch (err) {
    _showToast(`Erro ao remover: ${err.message}`);
  }
}

async function _archiveItem(itemId, itemName) {
  if (!confirm(`Arquivar "${itemName}"?`)) return;
  try {
    await _api(`/api/radar/items/${itemId}`, 'PATCH', { status: 'archived' });
    _items = _items.filter(i => i.id !== itemId);
    _open.delete(itemId);
    delete _stores[itemId];
    _historyItems = null; // invalidate cache so history reloads on next open
    _rerender(document.getElementById('radar-card'));
  } catch (err) {
    _showToast(`Erro ao arquivar: ${err.message}`);
  }
}

function _openMarkPurchasedModal(itemId) {
  const item = _items.find(i => i.id === itemId);
  const el = document.createElement('div');
  el.className = 'rd-modal-overlay';
  const defPrice = item?.best_price_eur ?? '';
  el.innerHTML = `<div class="rd-modal">
    <h3>Marcar como comprado — ${esc(item?.name || '')}</h3>
    <div class="rd-field">
      <label>Preço pago (€)</label>
      <input id="rd-pur-price" type="number" step="0.01" value="${defPrice}" placeholder="Ex: 1299.00" />
    </div>
    <div class="rd-field">
      <label>Loja</label>
      <input id="rd-pur-store" type="text" placeholder="Ex: Worten" />
    </div>
    <div id="rd-pur-err" class="rd-modal-error" style="display:none"></div>
    <div class="rd-modal-actions">
      <button class="rd-btn rd-btn-ghost" id="rd-pur-cancel">Cancelar</button>
      <button class="rd-btn rd-btn-purchased" id="rd-pur-save">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#rd-pur-cancel').onclick = () => el.remove();
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  const saveBtn = el.querySelector('#rd-pur-save');
  const errEl   = el.querySelector('#rd-pur-err');
  saveBtn.onclick = async () => {
    const priceRaw = el.querySelector('#rd-pur-price').value;
    const store    = el.querySelector('#rd-pur-store').value.trim();
    const price    = priceRaw !== '' ? parseFloat(priceRaw) : null;
    saveBtn.disabled = true; saveBtn.textContent = 'A guardar...';
    const payload = { status: 'purchased' };
    if (price != null && !isNaN(price)) {
      payload.purchased_price_eur = price;
      const target = item?.breakdown?.p25_eur;
      if (target != null) payload.savings_eur = parseFloat(Math.max(0, target - price).toFixed(2));
    }
    if (store) payload.purchased_store = store;
    try {
      await _api(`/api/radar/items/${itemId}`, 'PATCH', payload);
      _items = _items.filter(i => i.id !== itemId);
      _open.delete(itemId);
      delete _stores[itemId];
      _historyItems = null; // invalidate cache so history reloads on next open
      el.remove();
      _showToast('Marcado como comprado!');
      _rerender(document.getElementById('radar-card'));
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
      saveBtn.disabled = false; saveBtn.textContent = 'Guardar';
    }
  };
}

function _openEditItemModal(itemId) {
  const item = _items.find(i => i.id === itemId);
  if (!item) return;
  const el = document.createElement('div');
  el.className = 'rd-modal-overlay';
  el.innerHTML = `<div class="rd-modal">
    <h3>Editar produto</h3>
    <div class="rd-field">
      <label>Nome</label>
      <input id="rd-ei-name" type="text" value="${esc(item.name)}" />
    </div>
    <div class="rd-field">
      <label>Categoria (opcional)</label>
      <input id="rd-ei-cat" type="text" value="${esc(item.category || '')}" placeholder="Ex: Electrodomésticos" />
    </div>
    <div id="rd-ei-err" class="rd-modal-error" style="display:none"></div>
    <div class="rd-modal-actions">
      <button class="rd-btn rd-btn-ghost" id="rd-ei-cancel">Cancelar</button>
      <button class="rd-btn rd-btn-primary" id="rd-ei-save">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#rd-ei-name').focus();
  el.querySelector('#rd-ei-cancel').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  const saveBtn = el.querySelector('#rd-ei-save');
  const errEl   = el.querySelector('#rd-ei-err');
  saveBtn.onclick = async () => {
    const name = el.querySelector('#rd-ei-name').value.trim();
    const cat  = el.querySelector('#rd-ei-cat').value.trim();
    if (!name) { errEl.textContent = 'Nome obrigatório.'; errEl.style.display = 'block'; return; }
    saveBtn.disabled = true; saveBtn.textContent = 'A guardar...';
    try {
      await _api(`/api/radar/items/${itemId}`, 'PATCH', { name, category: cat || null });
      const idx = _items.findIndex(i => i.id === itemId);
      if (idx >= 0) { _items[idx].name = name; _items[idx].category = cat || null; }
      el.remove();
      _rerender(document.getElementById('radar-card'));
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
      saveBtn.disabled = false; saveBtn.textContent = 'Guardar';
    }
  };
}

function _renderHistoryChart(series, p25) {
  const W = 540, H = 180, ML = 52, MR = 20, MT = 14, MB = 34;
  const CW = W - ML - MR, CH = H - MT - MB;

  const prices = series.map(s => s.price_eur);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const pad  = (maxP - minP) * 0.1 || 10;
  const yMin = minP - pad, yMax = maxP + pad, yRange = yMax - yMin;

  const toX = i  => ML + (i / (series.length - 1)) * CW;
  const toY = p  => MT + CH - ((p - yMin) / yRange) * CH;

  const pts     = series.map((s, i) => `${toX(i).toFixed(1)},${toY(s.price_eur).toFixed(1)}`).join(' ');
  const fillPts = `${ML},${(MT + CH).toFixed(1)} ${pts} ${(ML + CW).toFixed(1)},${(MT + CH).toFixed(1)}`;

  const nTicks = 4;
  const step   = (maxP - minP) / (nTicks - 1) || 1;
  const yTickHtml = Array.from({ length: nTicks }, (_, i) => {
    const v = minP + i * step, y = toY(v);
    return `<line x1="${ML}" y1="${y.toFixed(1)}" x2="${(ML+CW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#1e1e40" stroke-width="1"/>
            <text x="${(ML-5).toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="10" fill="#686888">€${Math.round(v)}</text>`;
  }).join('');

  const xLabelHtml = [0, Math.floor(series.length / 2), series.length - 1].map(i => {
    return `<text x="${toX(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#686888">${series[i].date.slice(5)}</text>`;
  }).join('');

  const p25Svg = (p25 != null && p25 >= yMin && p25 <= yMax) ? (() => {
    const yp = toY(p25);
    return `<line x1="${ML}" y1="${yp.toFixed(1)}" x2="${(ML+CW).toFixed(1)}" y2="${yp.toFixed(1)}" stroke="#4fc3f7" stroke-width="1.2" stroke-dasharray="5,3" opacity="0.8"/>
            <text x="${(ML+CW+4).toFixed(1)}" y="${(yp+4).toFixed(1)}" font-size="9" fill="#4fc3f7">P25</text>`;
  })() : '';

  const last = series.length - 1;
  const dot  = `<circle cx="${toX(last).toFixed(1)}" cy="${toY(series[last].price_eur).toFixed(1)}" r="4" fill="#4fc3f7" stroke="#0b0b1a" stroke-width="1.5"/>`;

  const legend = [`<span style="display:inline-flex;align-items:center;gap:4px;margin-right:14px;">
    <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#4fc3f7" stroke-width="2"/></svg> Preço diário
  </span>`];
  if (p25 != null) legend.push(`<span style="display:inline-flex;align-items:center;gap:4px;">
    <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#4fc3f7" stroke-width="1.5" stroke-dasharray="5,3"/></svg> Alvo P25 €${_fmt(p25)}
  </span>`);

  return `<div class="rd-chart-wrap">
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="hm-grd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4fc3f7" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#4fc3f7" stop-opacity="0"/>
      </linearGradient></defs>
      ${yTickHtml}
      <polygon points="${fillPts}" fill="url(#hm-grd)"/>
      <polyline points="${pts}" fill="none" stroke="#4fc3f7" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      ${p25Svg}
      ${dot}
      ${xLabelHtml}
    </svg>
    <div class="rd-chart-legend">${legend.join('')}</div>
  </div>`;
}

async function _openHistoryModal(itemId, itemName) {
  const el = document.createElement('div');
  el.className = 'rd-modal-overlay';
  el.innerHTML = `<div class="rd-modal rd-modal-wide">
    <h3>${esc(itemName)} — Historial de preços (90 dias)</h3>
    <div id="rd-hm-body" style="text-align:center;padding:32px;color:var(--rd-ink-mid);">A carregar...</div>
    <div class="rd-modal-actions"><button class="rd-btn rd-btn-ghost" id="rd-hm-close">Fechar</button></div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#rd-hm-close').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  try {
    const series = await _api(`/api/radar/items/${itemId}/history`);
    const body   = el.querySelector('#rd-hm-body');
    if (!series || series.length < 2) {
      body.innerHTML = '<p>Dados insuficientes — são precisos pelo menos 2 dias de histórico.</p>';
      return;
    }
    const item = _items.find(i => i.id === itemId);
    body.innerHTML = _renderHistoryChart(series, item?.breakdown?.p25_eur ?? null);
  } catch (e) {
    el.querySelector('#rd-hm-body').innerHTML = `<p style="color:var(--rd-red);">Erro: ${esc(e.message)}</p>`;
  }
}

// ── EVENTS ─────────────────────────────────────────────────────────────────
export function bindRadar(container) {
  if (!container) return;

  container.querySelector('#rd-add-item-btn')?.addEventListener('click', _openAddItemModal);
  container.querySelector('#rd-add-item-btn-empty')?.addEventListener('click', _openAddItemModal);

  container.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = parseInt(el.dataset.toggle, 10);
      if (_open.has(id)) {
        _open.delete(id);
        _rerender(document.getElementById('radar-card'));
      } else {
        _open.add(id);
        _rerender(document.getElementById('radar-card'));
        if (!_stores[id]) {
          await _loadStores(id);
          if (!_open.has(id)) return; // collapsed while loading
          _rerender(document.getElementById('radar-card'));
        }
      }
    });
  });

  container.querySelectorAll('[data-add-store]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _openAddStoreModal(parseInt(btn.dataset.addStore, 10));
    });
  });

  container.querySelectorAll('[data-edit-store]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const storeId = parseInt(btn.dataset.editStore, 10);
      const itemId  = parseInt(btn.dataset.itemId, 10);
      const store   = (_stores[itemId] || []).find(s => s.id === storeId);
      if (store) _openEditStoreModal(itemId, store);
    });
  });

  container.querySelectorAll('[data-del-store]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _deleteStore(
        parseInt(btn.dataset.itemId, 10),
        parseInt(btn.dataset.delStore, 10),
        btn.dataset.storeName,
      );
    });
  });

  container.querySelectorAll('[data-archive]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _archiveItem(parseInt(btn.dataset.archive, 10), btn.dataset.itemName);
    });
  });

  container.querySelectorAll('[data-purchase]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _openMarkPurchasedModal(parseInt(btn.dataset.purchase, 10));
    });
  });

  container.querySelectorAll('[data-run]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.run, 10);
      btn.disabled = true;
      btn.textContent = '↻ A correr...';
      try {
        await _api(`/api/radar/run/${id}`, 'POST');
        delete _stores[id];
        await _refreshItem(id);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = '↻ Atualizar';
        const actions = container.querySelector(`[data-actions="${id}"]`);
        if (actions) {
          let errEl = actions.querySelector('.rd-run-err');
          if (!errEl) {
            errEl = document.createElement('div');
            errEl.className = 'rd-run-err';
            actions.appendChild(errEl);
          }
          errEl.textContent = `Erro: ${err.message}`;
          setTimeout(() => errEl?.remove(), 5000);
        }
      }
    });
  });

  container.querySelectorAll('[data-history-item]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _openHistoryModal(parseInt(btn.dataset.historyItem, 10), btn.dataset.itemName);
    });
  });

  container.querySelectorAll('[data-edit-item]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _openEditItemModal(parseInt(btn.dataset.editItem, 10));
    });
  });

  const historyToggle = container.querySelector('#rd-history-toggle');
  if (historyToggle) {
    historyToggle.addEventListener('click', () => {
      _historyOpen = !_historyOpen;
      if (_historyOpen && _historyItems === null) {
        _rerender(container);
        _loadHistory(container);
      } else {
        _rerender(container);
      }
    });
  }

  container.querySelectorAll('[data-delete-history]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _deleteHistoryItem(parseInt(btn.dataset.deleteHistory, 10), btn.dataset.itemName);
    });
  });
}

// ── PUBLIC INIT ─────────────────────────────────────────────────────────────
export async function initRadar(container) {
  _open.clear();
  _stores = {};
  if (_refreshInterval) { clearInterval(_refreshInterval); _refreshInterval = null; }
  container.innerHTML = '<p style="color:#9898b8;text-align:center;padding:40px;">A carregar...</p>';
  try {
    _items = await _api('/api/radar/items');
    renderRadar(container);
    bindRadar(container);
    _refreshInterval = setInterval(_autoRefresh, 10 * 60 * 1000);
  } catch (err) {
    container.innerHTML = `<p style="color:#ef5350;text-align:center;padding:40px;">Erro: ${esc(err.message)}</p>`;
  }
}
