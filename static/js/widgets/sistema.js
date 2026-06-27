import { esc } from '../utils/esc.js';

let _items = [];

async function _api(path, method = 'GET') {
  const r = await fetch(path, { method, headers: { 'Content-Type': 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function _load() {
  _items = await _api('/api/system/pending-approvals');
}

function _renderItem(item) {
  const dateMatch = item.filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : '';
  return `
    <div class="sistema-item">
      <div class="sistema-item-header">
        <div class="sistema-item-title">${esc(item.title)}</div>
        <div class="sistema-item-meta">
          ${item.scope ? `<span class="sistema-scope">${esc(item.scope)}</span>` : ''}
          ${date ? `<span class="sistema-date">${date}</span>` : ''}
        </div>
      </div>
      ${item.reason ? `<div class="sistema-reason">${esc(item.reason)}</div>` : ''}
      ${item.source ? `<div class="sistema-source">${esc(item.source)}</div>` : ''}
      <div class="sistema-actions">
        <button class="sistema-btn sistema-btn-approve" data-approve="${esc(item.filename)}">✅ Aprovar</button>
        <button class="sistema-btn sistema-btn-reject"  data-reject="${esc(item.filename)}">❌ Rejeitar</button>
      </div>
    </div>`;
}

function _render(container) {
  if (!_items.length) {
    container.innerHTML = `
      <div class="card fade-in">
        <div class="sistema-empty">
          <div class="sistema-empty-icon">✅</div>
          <div class="sistema-empty-text">Sem aprovações pendentes</div>
        </div>
      </div>`;
    return;
  }
  container.innerHTML = `
    <div class="card fade-in">
      <div class="card-label">Aprovações Pendentes (${_items.length})</div>
      <div class="sistema-list">
        ${_items.map(_renderItem).join('')}
      </div>
    </div>`;

  _items.forEach(item => {
    container.querySelector(`[data-approve="${item.filename}"]`)?.addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = '...';
      try {
        await _api(`/api/system/approve/${item.filename}`, 'POST');
        await _load();
        _render(container);
        _updateBadge();
      } catch { btn.disabled = false; btn.textContent = '✅ Aprovar'; }
    });
    container.querySelector(`[data-reject="${item.filename}"]`)?.addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = '...';
      try {
        await _api(`/api/system/reject/${item.filename}`, 'POST');
        await _load();
        _render(container);
        _updateBadge();
      } catch { btn.disabled = false; btn.textContent = '❌ Rejeitar'; }
    });
  });
}

function _updateBadge() {
  const btn = document.querySelector('[data-tab="sistema"]');
  if (!btn) return;
  btn.querySelector('.sistema-badge')?.remove();
  if (_items.length > 0) {
    const badge = document.createElement('span');
    badge.className = 'sistema-badge';
    badge.textContent = _items.length;
    btn.appendChild(badge);
  }
}

export async function initSistema(container) {
  container.innerHTML = `<div class="card fade-in"><div class="loading"><div class="spinner"></div> A carregar...</div></div>`;
  try {
    await _load();
    _render(container);
    _updateBadge();
  } catch {
    container.innerHTML = `<div class="card fade-in"><div class="sistema-empty">❌ Erro ao carregar aprovações</div></div>`;
  }
}

export async function updateSistemaBadge() {
  try {
    await _load();
    _updateBadge();
  } catch { /* silent */ }
}
