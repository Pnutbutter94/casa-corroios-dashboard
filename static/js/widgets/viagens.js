import { esc } from '../utils/esc.js';

let _trip  = null;
let _view  = 'resumo'; // resumo | despesas | itinerario | links

const DAYS_PT  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CATEGORY_LABELS = {
  voos: 'Voos', alojamento: 'Alojamento', alimentacao: 'Alimentação',
  actividades: 'Actividades', transporte: 'Transporte',
  compras: 'Compras', outros: 'Outros',
};

const SPLIT_LABELS = { comum: 'Comum', pedro: 'Pedro', ines: 'Inês' };

const PRIORITY_LABELS = { must: 'Imprescindível', want: 'Quero ir', backlog: 'Backlog' };
const PRIORITY_NEXT   = { must: 'want', want: 'backlog', backlog: 'must' };

// ── API helpers ────────────────────────────────────────────────────────────

async function _api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  return r.json();
}

// ── Init ───────────────────────────────────────────────────────────────────

export async function initViagens() {
  _trip = await _api('/api/trips/madrid-2026');
}

// ── Render root ────────────────────────────────────────────────────────────

export function renderViagens() {
  if (!_trip) return '<div class="card fade-in"><p style="color:var(--text-dim)">A carregar viagem…</p></div>';

  const countdown = _countdown(_trip.countdown_to);

  return `
    <div class="card fade-in" id="viagens-card">
      <div class="viagens-header">
        <div class="viagens-trip-name">${esc(_trip.flag)} ${esc(_trip.name)}</div>
        <div class="viagens-countdown ${countdown.past ? 'past' : ''}">${esc(countdown.text)}</div>
      </div>

      <div class="viagens-subnav">
        <button class="viagens-subnav-btn ${_view==='resumo'?'active':''}"     data-view="resumo">Resumo</button>
        <button class="viagens-subnav-btn ${_view==='despesas'?'active':''}"   data-view="despesas">Despesas</button>
        <button class="viagens-subnav-btn ${_view==='itinerario'?'active':''}" data-view="itinerario">Itinerário</button>
        <button class="viagens-subnav-btn ${_view==='links'?'active':''}"      data-view="links">Links</button>
      </div>

      <div class="viagens-view ${_view==='resumo'?'active':''}"     id="view-resumo">     ${_renderResumo()}</div>
      <div class="viagens-view ${_view==='despesas'?'active':''}"   id="view-despesas">   ${_renderDespesas()}</div>
      <div class="viagens-view ${_view==='itinerario'?'active':''}" id="view-itinerario"> ${_renderItinerario()}</div>
      <div class="viagens-view ${_view==='links'?'active':''}"      id="view-links">      ${_renderLinks()}</div>
    </div>`;
}

export function bindViagens(card, refresh) {
  // sub-nav
  card.querySelectorAll('.viagens-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => { _view = btn.dataset.view; refresh(); });
  });

  // resumo: no interactive elements beyond sub-nav
  // despesas
  card.querySelector('#btn-add-expense')?.addEventListener('click', () => _openExpenseModal(refresh));
  card.querySelectorAll('[data-del-exp]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await _api(`/api/trips/${_trip.id}/expenses/${btn.dataset.delExp}`, 'DELETE');
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // itinerario: add poi + cycle priority + delete + checkin
  card.querySelector('#btn-add-poi')?.addEventListener('click', () => _openPoiModal(refresh));
  card.querySelectorAll('[data-cycle-priority]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const { cityId, poiId, priority } = btn.dataset.cyclePriority ? JSON.parse(btn.dataset.cyclePriority) : {};
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'PATCH',
        { priority: PRIORITY_NEXT[priority] });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });
  card.querySelectorAll('[data-del-poi]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { cityId, poiId } = JSON.parse(btn.dataset.delPoi);
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'DELETE');
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });
  card.querySelectorAll('[data-checkin]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { cityId, poiId, current } = JSON.parse(btn.dataset.checkin);
      const checkin_time = current ? null : new Date().toISOString();
      const done = !current;
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'PATCH', { checkin_time, done });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // links: add link
  card.querySelector('#btn-add-link')?.addEventListener('click', () => _openLinkModal(refresh));
  card.querySelectorAll('[data-discard-link]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await _api(`/api/trips/${_trip.id}/links/${btn.dataset.discardLink}`, 'PATCH', { status: 'discarded' });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });
}

// ── Resumo view ────────────────────────────────────────────────────────────

function _renderResumo() {
  const t = _trip;
  const nights = t.cities.reduce((s, c) => {
    const a = new Date(c.arrival), d = new Date(c.departure);
    return s + Math.round((d - a) / 86400000);
  }, 0);
  const totalPois = t.cities.reduce((s, c) => s + (c.pois?.length || 0), 0);

  const { pedro, ines } = _budgetCalc(t);
  const budgetPct = pct => Math.min(100, Math.round(pct));
  const barClass = pct => pct >= 100 ? 'over' : pct >= 85 ? 'warn' : '';
  const pPct = pedro / t.budget_per_person * 100;
  const iPct = ines  / t.budget_per_person * 100;

  return `
    <div class="viagens-legs">
      ${t.legs.map(l => `
        <div class="viagens-leg">
          <div class="leg-route">${esc(l.from)} → ${esc(l.to)}</div>
          <div class="leg-meta">${_fmtDate(l.date)} · ${esc(l.airline)}</div>
          <div class="leg-time">${esc(l.departs_local)}${l.arrives_local ? ' → ' + esc(l.arrives_local) : ''}</div>
          ${l.confirmed ? '<span class="leg-confirmed">✓ Confirmado</span>' : ''}
        </div>`).join('')}
    </div>

    ${t.cities.map(c => `
      <div class="viagens-hotel">
        <div class="hotel-icon">🏨</div>
        <div>
          <div class="hotel-name">${esc(c.hotel.name)}</div>
          <div class="hotel-meta">${esc(c.name)} · ${_fmtDate(c.arrival)} → ${_fmtDate(c.departure)} · ${c.hotel.nights} noite${c.hotel.nights !== 1 ? 's' : ''}</div>
        </div>
        ${c.hotel.confirmed ? '<span class="leg-confirmed">✓</span>' : ''}
      </div>`).join('')}

    <div class="viagens-stats">
      <div class="viagens-stat">
        <div class="viagens-stat-value">${t.cities.length}</div>
        <div class="viagens-stat-label">Cidade${t.cities.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="viagens-stat">
        <div class="viagens-stat-value">${nights}</div>
        <div class="viagens-stat-label">Noite${nights !== 1 ? 's' : ''}</div>
      </div>
      <div class="viagens-stat">
        <div class="viagens-stat-value">${totalPois}</div>
        <div class="viagens-stat-label">POI${totalPois !== 1 ? 's' : ''}</div>
      </div>
      <div class="viagens-stat">
        <div class="viagens-stat-value">€${(pedro + ines).toFixed(0)}</div>
        <div class="viagens-stat-label">Gasto total</div>
      </div>
    </div>

    <div class="budget-section">
      <div class="budget-title">Orçamento por pessoa · €${t.budget_per_person}</div>
      <div class="budget-persons">
        <div class="budget-person">
          <div class="budget-person-name">Pedro</div>
          <div class="budget-bar-wrap"><div class="budget-bar-fill ${barClass(pPct)}" style="width:${budgetPct(pPct)}%"></div></div>
          <div class="budget-numbers">
            <span class="budget-spent">€${pedro.toFixed(2)}</span>
            <span>€${(t.budget_per_person - pedro).toFixed(2)} restam</span>
          </div>
        </div>
        <div class="budget-person">
          <div class="budget-person-name">Inês</div>
          <div class="budget-bar-wrap"><div class="budget-bar-fill ${barClass(iPct)}" style="width:${budgetPct(iPct)}%"></div></div>
          <div class="budget-numbers">
            <span class="budget-spent">€${ines.toFixed(2)}</span>
            <span>€${(t.budget_per_person - ines).toFixed(2)} restam</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Despesas view ──────────────────────────────────────────────────────────

function _renderDespesas() {
  const t = _trip;
  const { pedro, ines } = _budgetCalc(t);
  const exps = t.expenses || [];

  return `
    <div class="budget-section">
      <div class="budget-title">Orçamento por pessoa · €${t.budget_per_person}</div>
      <div class="budget-persons">
        ${_personBar('Pedro', pedro, t.budget_per_person)}
        ${_personBar('Inês',  ines,  t.budget_per_person)}
      </div>
    </div>

    <table class="expense-table">
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Categoria</th>
          <th>Divisão</th>
          <th style="text-align:right">Valor</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${exps.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:1rem">Sem despesas</td></tr>' :
          exps.map(e => `
            <tr>
              <td>${esc(e.description)}</td>
              <td style="color:var(--text-dim);font-size:.8rem">${esc(CATEGORY_LABELS[e.category] || e.category)}</td>
              <td><span class="exp-split-badge exp-split-${esc(e.split)}">${esc(SPLIT_LABELS[e.split] || e.split)}</span></td>
              <td style="text-align:right;font-weight:600">€${Number(e.amount).toFixed(2)}</td>
              <td>${e.confirmed ? '' : `<button class="exp-del-btn" data-del-exp="${esc(e.id)}" title="Remover">✕</button>`}</td>
            </tr>`).join('')}
      </tbody>
    </table>

    <button class="btn-add-expense" id="btn-add-expense">+ Adicionar despesa</button>`;
}

// ── Itinerário view ────────────────────────────────────────────────────────

function _renderItinerario() {
  const t = _trip;
  const allPois = t.cities.flatMap(c => (c.pois || []).map(p => ({ ...p, cityId: c.id, cityName: c.name })));

  const poolPois   = allPois.filter(p => !p.assigned_day);
  const sched = _buildSchedule(t);

  return `
    <div class="poi-pool-header">
      <span class="poi-city-label">Pool de POIs</span>
      <button class="btn-add-poi" id="btn-add-poi">+ Adicionar</button>
    </div>

    ${poolPois.length === 0 ? `<div class="poi-empty">Sem POIs no pool. Adiciona locais que queres visitar.</div>` :
      `<div class="poi-list">${poolPois.map(p => _poiCard(p)).join('')}</div>`}

    ${sched.length > 0 ? `
      <div class="budget-title" style="margin-top:1rem">Itinerário</div>
      <div class="itinerary-days">${sched.map(day => _renderDay(day, allPois)).join('')}</div>
    ` : ''}`;
}

function _poiCard(p) {
  const cycleData = JSON.stringify({ cityId: p.cityId, poiId: p.id, priority: p.priority });
  const delData   = JSON.stringify({ cityId: p.cityId, poiId: p.id });
  const checkinData = JSON.stringify({ cityId: p.cityId, poiId: p.id, current: p.checkin_time });
  return `
    <div class="poi-card ${p.done ? 'poi-done' : ''}">
      <div class="poi-priority-dot ${p.priority}"></div>
      <div class="poi-name">${esc(p.name)}</div>
      <div class="poi-meta">${p.duration_h}h</div>
      <button class="poi-priority-label ${p.priority}" data-cycle-priority='${cycleData}'>${esc(PRIORITY_LABELS[p.priority])}</button>
      <button class="poi-checkin-btn ${p.checkin_time ? 'checked' : ''}" data-checkin='${checkinData}'>${p.checkin_time ? '✓' : 'Check-in'}</button>
      <button class="poi-delete-btn" data-del-poi='${delData}'>✕</button>
    </div>`;
}

function _buildSchedule(t) {
  const assigned = t.cities.flatMap(c => (c.pois || []).filter(p => p.assigned_day));
  if (assigned.length === 0) return [];
  const days = {};
  assigned.forEach(p => { (days[p.assigned_day] = days[p.assigned_day] || []).push(p); });
  return Object.keys(days).sort().map(date => ({ date, pois: days[date] }));
}

function _renderDay(day, allPois) {
  const slots = ['manha', 'tarde', 'noite'];
  const slotLabels = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
  const d = new Date(day.date + 'T12:00:00');
  return `
    <div class="itinerary-day">
      <div class="itinerary-day-header">
        <span>${DAYS_PT[d.getDay()]}, ${d.getDate()} ${MONTHS_PT[d.getMonth()]}</span>
      </div>
      <div class="itinerary-slots">
        ${slots.map(slot => {
          const slotPois = day.pois.filter(p => p.assigned_slot === slot);
          return `
            <div class="itinerary-slot">
              <span class="slot-time-label">${slotLabels[slot]}</span>
              ${slotPois.length === 0
                ? '<span class="slot-empty">—</span>'
                : slotPois.map(p => `
                    <span class="slot-poi-name">${esc(p.name)}</span>
                    ${p.checkin_time ? `<span class="slot-checkin">✓ ${_fmtTime(p.checkin_time)}</span>` : ''}
                  `).join('')}
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ── Links view ─────────────────────────────────────────────────────────────

function _renderLinks() {
  const links = (_trip.links || []).filter(l => l.status !== 'discarded');
  return `
    ${links.length === 0
      ? `<div class="poi-empty">Sem links. Cola um link de qualquer plataforma para extrair dicas.</div>`
      : `<div class="links-list">${links.map(l => `
          <div class="link-card">
            <span class="link-platform">${esc(l.platform)}</span>
            <div class="link-content">
              <div class="link-url">${esc(l.url)}</div>
              ${l.summary ? `<div class="link-summary">${esc(l.summary)}</div>` : ''}
            </div>
            <span class="link-status ${l.status}">${esc(l.status)}</span>
            <button class="exp-del-btn" data-discard-link="${esc(l.id)}" title="Descartar">✕</button>
          </div>`).join('')}
        </div>`}
    <button class="btn-add-expense" id="btn-add-link">+ Adicionar link</button>`;
}

// ── Modals ─────────────────────────────────────────────────────────────────

function _openExpenseModal(refresh) {
  const overlay = document.createElement('div');
  overlay.className = 'viagens-modal-overlay';
  overlay.innerHTML = `
    <div class="viagens-modal">
      <div class="modal-title">
        Nova despesa
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-field">
        <label class="modal-label">Descrição</label>
        <input class="modal-input" id="exp-desc" placeholder="ex: Jantar no mercado" />
      </div>
      <div class="modal-row">
        <div class="modal-field">
          <label class="modal-label">Categoria</label>
          <select class="modal-select" id="exp-cat">
            ${Object.entries(CATEGORY_LABELS).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label">Divisão</label>
          <select class="modal-select" id="exp-split">
            <option value="comum">Comum (÷2)</option>
            <option value="pedro">Só Pedro</option>
            <option value="ines">Só Inês</option>
          </select>
        </div>
      </div>
      <div class="modal-row">
        <div class="modal-field">
          <label class="modal-label">Valor (€)</label>
          <input class="modal-input" id="exp-amount" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
        <div class="modal-field">
          <label class="modal-label">Data</label>
          <input class="modal-input" id="exp-date" type="date" value="${new Date().toISOString().slice(0,10)}" />
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
        <button class="btn-modal-save"   id="modal-save">Guardar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#modal-close').addEventListener('click', close);
  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const desc   = overlay.querySelector('#exp-desc').value.trim();
    const amount = parseFloat(overlay.querySelector('#exp-amount').value);
    if (!desc || isNaN(amount) || amount <= 0) return;
    await _api(`/api/trips/${_trip.id}/expenses`, 'POST', {
      description: desc,
      category:    overlay.querySelector('#exp-cat').value,
      split:       overlay.querySelector('#exp-split').value,
      amount,
      date:        overlay.querySelector('#exp-date').value,
    });
    _trip = await _api(`/api/trips/${_trip.id}`);
    close();
    _view = 'despesas';
    refresh();
  });
}

function _openPoiModal(refresh) {
  const city = _trip.cities[0]; // defaults to first city; multi-city selector future
  const overlay = document.createElement('div');
  overlay.className = 'viagens-modal-overlay';
  overlay.innerHTML = `
    <div class="viagens-modal">
      <div class="modal-title">
        Novo POI
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-field">
        <label class="modal-label">Nome</label>
        <input class="modal-input" id="poi-name" placeholder="ex: Museu do Prado" />
      </div>
      <div class="modal-row">
        <div class="modal-field">
          <label class="modal-label">Tipo</label>
          <select class="modal-select" id="poi-type">
            <option value="museu">Museu</option>
            <option value="restaurante">Restaurante</option>
            <option value="monumento">Monumento</option>
            <option value="parque">Parque</option>
            <option value="bar">Bar</option>
            <option value="miradouro">Miradouro</option>
            <option value="mercado">Mercado</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label">Prioridade</label>
          <select class="modal-select" id="poi-priority">
            <option value="must">Imprescindível</option>
            <option value="want" selected>Quero ir</option>
            <option value="backlog">Backlog</option>
          </select>
        </div>
      </div>
      <div class="modal-row">
        <div class="modal-field">
          <label class="modal-label">Duração (horas)</label>
          <input class="modal-input" id="poi-duration" type="number" min="0.5" step="0.5" value="2" />
        </div>
        <div class="modal-field">
          <label class="modal-label">Entrada gratuita</label>
          <input class="modal-input" id="poi-free" placeholder="ex: Dom após 18h" />
        </div>
      </div>
      <div class="modal-field">
        <label class="modal-label">Horário</label>
        <input class="modal-input" id="poi-hours" placeholder="ex: Seg-Sáb 10h-20h, Dom 10h-19h" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Notas</label>
        <input class="modal-input" id="poi-notes" placeholder="Notas ou dicas…" />
      </div>
      <div class="modal-actions">
        <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
        <button class="btn-modal-save"   id="modal-save">Guardar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#modal-close').addEventListener('click', close);
  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const name = overlay.querySelector('#poi-name').value.trim();
    if (!name) return;
    await _api(`/api/trips/${_trip.id}/pois`, 'POST', {
      city_id:       city.id,
      name,
      type:          overlay.querySelector('#poi-type').value,
      priority:      overlay.querySelector('#poi-priority').value,
      duration_h:    parseFloat(overlay.querySelector('#poi-duration').value) || 1,
      free_entry:    overlay.querySelector('#poi-free').value.trim(),
      opening_hours: overlay.querySelector('#poi-hours').value.trim(),
      notes:         overlay.querySelector('#poi-notes').value.trim(),
    });
    _trip = await _api(`/api/trips/${_trip.id}`);
    close();
    refresh();
  });
}

function _openLinkModal(refresh) {
  const overlay = document.createElement('div');
  overlay.className = 'viagens-modal-overlay';
  overlay.innerHTML = `
    <div class="viagens-modal">
      <div class="modal-title">
        Adicionar link
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-field">
        <label class="modal-label">URL</label>
        <input class="modal-input" id="lnk-url" placeholder="https://…" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Plataforma</label>
        <select class="modal-select" id="lnk-platform">
          <option value="web">Web / Artigo</option>
          <option value="youtube">YouTube</option>
          <option value="reddit">Reddit</option>
          <option value="instagram">Instagram</option>
          <option value="x">X / Twitter</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>
      <div class="modal-field">
        <label class="modal-label">Resumo (obrigatório para plataformas bloqueadas)</label>
        <input class="modal-input" id="lnk-summary" placeholder="O que viste neste post / vídeo…" />
      </div>
      <div class="modal-actions">
        <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
        <button class="btn-modal-save"   id="modal-save">Guardar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#modal-close').addEventListener('click', close);
  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const url = overlay.querySelector('#lnk-url').value.trim();
    if (!url) return;
    await _api(`/api/trips/${_trip.id}/links`, 'POST', {
      url,
      platform: overlay.querySelector('#lnk-platform').value,
      summary:  overlay.querySelector('#lnk-summary').value.trim(),
    });
    _trip = await _api(`/api/trips/${_trip.id}`);
    close();
    _view = 'links';
    refresh();
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function _budgetCalc(t) {
  const exps = t.expenses || [];
  const pedro = exps.reduce((s, e) => {
    if (e.split === 'pedro') return s + e.amount;
    if (e.split === 'comum') return s + e.amount / 2;
    return s;
  }, 0);
  const ines = exps.reduce((s, e) => {
    if (e.split === 'ines')  return s + e.amount;
    if (e.split === 'comum') return s + e.amount / 2;
    return s;
  }, 0);
  return { pedro, ines };
}

function _personBar(name, spent, budget) {
  const pct = Math.min(100, Math.round(spent / budget * 100));
  const cls = pct >= 100 ? 'over' : pct >= 85 ? 'warn' : '';
  return `
    <div class="budget-person">
      <div class="budget-person-name">${esc(name)}</div>
      <div class="budget-bar-wrap"><div class="budget-bar-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="budget-numbers">
        <span class="budget-spent">€${spent.toFixed(2)}</span>
        <span>€${(budget - spent).toFixed(2)} restam</span>
      </div>
    </div>`;
}

function _countdown(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((target - today) / 86400000);
  if (diff < 0)  return { text: `Viagem concluída`, past: true };
  if (diff === 0) return { text: `Hoje!`, past: false };
  if (diff === 1) return { text: `Amanhã!`, past: false };
  return { text: `Faltam ${diff} dias`, past: false };
}

function _fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`;
}

function _fmtTime(isoStr) {
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
