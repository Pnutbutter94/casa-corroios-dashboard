import { esc } from '../utils/esc.js';

// ── STATE ──────────────────────────────────────────────────────────────────
let _items           = [];
let _stores          = {};   // item_id → stores array (cached)
let _open            = new Set();
let _refreshInterval = null;

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

function _renderBreakdown(bd) {
  if (!bd) return '';
  const parts = [];
  if (bd.current_landed_eur != null) parts.push(`<span>Atual <b>€${_fmt(bd.current_landed_eur)}</b></span>`);
  if (bd.p25_eur != null)            parts.push(`<span>P25 <b>€${_fmt(bd.p25_eur)}</b></span>`);
  if (bd.min90d_eur != null)         parts.push(`<span>Mín 90d <b>€${_fmt(bd.min90d_eur)}</b></span>`);
  if (bd.data_points != null)        parts.push(`<span>Dados <b>${bd.data_points}d</b></span>`);
  const warm = (bd.data_points != null && bd.data_points < 3)
    ? `<div class="rd-warning">⚠️ Score provisório — menos de 3 dias de histórico</div>` : '';
  return parts.length ? `<div class="rd-breakdown">${parts.join('')}</div>${warm}` : warm;
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
  const isOpen    = _open.has(item.id);
  const scoreHtml = _renderScoreBadge(item.score);
  const storesHtml = isOpen && _stores[item.id]
    ? _renderStoresTable(item.id, _stores[item.id])
    : '<p style="color:#9898b8;font-size:13px;margin:12px 0 4px;">A carregar lojas...</p>';
  const bdHtml   = isOpen ? _renderBreakdown(item.breakdown) : '';
  const signalAge = item.signal_computed_at
    ? `<span>Score ${_rel(item.signal_computed_at)}</span>` : '';
  return `<div class="rd-item${isOpen ? ' open' : ''}" data-id="${item.id}">
    <div class="rd-item-row" data-toggle="${item.id}">
      ${scoreHtml}
      <div class="rd-item-info">
        <div class="rd-item-name">${esc(item.name)}</div>
        <div class="rd-item-meta">
          ${item.category ? `<span>${esc(item.category)}</span>` : ''}
          <span>${item.store_count} loja${item.store_count !== 1 ? 's' : ''}</span>
          ${signalAge}
        </div>
      </div>
      <div class="rd-best-price">${item.best_price_eur != null ? `€${_fmt(item.best_price_eur)}` : '—'}</div>
      <button class="rd-btn rd-btn-ghost rd-btn-xs rd-archive-btn" data-archive="${item.id}" data-item-name="${esc(item.name)}" title="Arquivar">⊘</button>
      <div class="rd-chevron">›</div>
    </div>
    <div class="rd-stores">
      ${bdHtml}
      ${storesHtml}
      <div class="rd-store-actions" data-actions="${item.id}">
        <button class="rd-btn rd-btn-ghost rd-btn-sm" data-add-store="${item.id}">+ Loja</button>
        <button class="rd-btn rd-btn-ghost rd-btn-sm" data-run="${item.id}">↻ Atualizar</button>
      </div>
    </div>
  </div>`;
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
  container.innerHTML = `<div class="card-label">Radar</div>${headerHtml}${body}`;
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
    _rerender(document.getElementById('radar-card'));
  } catch (err) {
    _showToast(`Erro ao arquivar: ${err.message}`);
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
