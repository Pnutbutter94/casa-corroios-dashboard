import { esc } from '../utils/esc.js';

// ── STATE ──────────────────────────────────────────────────────────────────
let _trips  = [];
let _tripId = null;
let _trip   = null;
let _view   = 'resumo';       // resumo | despesas | itinerario | links
let _nearby = [];             // nearby suggestions for last added POI
let _selectorOpen = false;
let _pollInterval = null;
let _pollTripId   = null;
let _travelTimes  = {};  // cache: "lat,lon-lat,lon" → minutes

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const DAYS_PT   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CATEGORY_LABELS = {
  voos:'Voos', alojamento:'Alojamento', alimentacao:'Alimentação',
  actividades:'Actividades', transporte:'Transporte',
  compras:'Compras', outros:'Outros',
};
const SPLIT_LABELS    = { comum:'Comum', pedro:'Pedro', ines:'Inês' };
const PRIORITY_LABELS = { must:'Imprescindível', want:'Quero ir', backlog:'Backlog' };
const PRIORITY_NEXT   = { must:'want', want:'backlog', backlog:'must' };
const TYPE_ICONS      = {
  museu:'🏛️', restaurante:'🍽️', monumento:'🗿', parque:'🌿',
  bar:'🍻', miradouro:'🔭', mercado:'🛒', park:'🌿',
  museum:'🏛️', attraction:'⭐', gallery:'🖼️', restaurant:'🍽️',
  cafe:'☕', outro:'📍',
};

// Free entry knowledge base — verified via official museum sites (Jun 2026)
const FREE_ENTRY_KB = {
  prado: {
    official_name: 'Museo del Prado',
    opening: 'Seg-Sáb 10:00-20:00 · Dom 10:00-19:00',
    free: 'Seg-Sáb 18:00-20:00 · Dom 17:00-19:00',
    type: 'museu', duration_h: 3,
    // day 0=Sun, 1=Mon…6=Sat; from/to in decimal hours
    free_windows: [{ days:[1,2,3,4,5,6], from:18, to:20 }, { days:[0], from:17, to:19 }],
    keywords: ['prado'],
  },
  reina_sofia: {
    official_name: 'Museo Reina Sofía',
    opening: 'Seg, Qua-Sáb 10:00-21:00 · Dom 10:00-14:30 (fechado Ter)',
    free: 'Seg, Qua-Sáb 19:00-21:00 · Dom 12:30-14:30',
    type: 'museu', duration_h: 2.5,
    free_windows: [{ days:[1,3,4,5,6], from:19, to:21 }, { days:[0], from:12.5, to:14.5 }],
    keywords: ['reina sofia', 'reina sofía'],
  },
  thyssen: {
    official_name: 'Museo Thyssen-Bornemisza',
    opening: 'Ter-Dom 10:00-19:00 (Sáb até 21:00) · fechado Seg',
    free: 'Segundas-feiras (coleção permanente)',
    type: 'museu', duration_h: 2,
    free_windows: [{ days:[1], from:10, to:19 }],
    keywords: ['thyssen'],
  },
};

// Slot definitions: label, hour range, default capacity
const SLOTS = [
  { id:'manha',  label:'Manhã',  from:9,  to:13, cap:4 },
  { id:'tarde',  label:'Tarde',  from:13, to:19, cap:6 },
  { id:'noite',  label:'Noite',  from:19, to:22, cap:3 },
];

// ── API ────────────────────────────────────────────────────────────────────
async function _api(path, method='GET', body=null) {
  const opts = { method, headers:{'Content-Type':'application/json'} };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  return r.json();
}

// ── PUBLIC ─────────────────────────────────────────────────────────────────
export async function initViagens() {
  _trips = await _api('/api/trips');
  if (_trips.length > 0) {
    _tripId = _trips[0].id;
    _trip   = await _api(`/api/trips/${_tripId}`);
  }
}

export function renderViagens() {
  if (!_trip) return '<div class="card fade-in"><p style="color:var(--text-dim)">Sem viagens planeadas.</p></div>';

  const countdown = _countdown(_trip.countdown_to);
  return `
    <div class="card fade-in" id="viagens-card">

      <!-- TRIP SELECTOR BAR -->
      <div class="trip-sel-bar">
        <button class="trip-sel-btn" id="trip-sel-btn">
          ${esc(_trip.flag)} <span class="trip-sel-name">${esc(_trip.name)}</span>
          <span class="trip-sel-chevron">▾</span>
        </button>
        <div class="viagens-countdown ${countdown.past?'past':''}">${esc(countdown.text)}</div>
      </div>

      ${_selectorOpen ? _renderSelector() : ''}

      <!-- SUB-NAV -->
      <div class="viagens-subnav">
        ${['resumo','despesas','itinerario','links'].map(v => `
          <button class="viagens-subnav-btn ${_view===v?'active':''}" data-view="${v}">
            ${v==='resumo'?'Resumo':v==='despesas'?'Despesas':v==='itinerario'?'Itinerário':'Links'}
          </button>`).join('')}
      </div>

      <div id="viagens-view-container">
        ${_view==='resumo'     ? _renderResumo()     : ''}
        ${_view==='despesas'   ? _renderDespesas()   : ''}
        ${_view==='itinerario' ? _renderItinerario() : ''}
        ${_view==='links'      ? _renderLinks()      : ''}
      </div>
    </div>`;
}

export function bindViagens(card, refresh) {
  // trip selector toggle
  card.querySelector('#trip-sel-btn')?.addEventListener('click', () => {
    _selectorOpen = !_selectorOpen; refresh();
  });

  // new trip
  card.querySelector('#btn-new-trip')?.addEventListener('click', () => _openNewTripModal(refresh));

  // fechar viagem
  card.querySelector('#btn-fechar-viagem')?.addEventListener('click', () => _openFecharModal());
  card.querySelectorAll('[data-select-trip]').forEach(btn => {
    btn.addEventListener('click', async () => {
      _tripId = btn.dataset.selectTrip;
      _trip   = await _api(`/api/trips/${_tripId}`);
      _selectorOpen = false;
      _nearby = [];
      refresh();
    });
  });

  // sub-nav
  card.querySelectorAll('.viagens-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => { _view = btn.dataset.view; refresh(); });
  });

  // despesas
  card.querySelector('#btn-add-expense')?.addEventListener('click', () => _openExpenseModal(refresh));
  card.querySelectorAll('[data-del-exp]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await _api(`/api/trips/${_trip.id}/expenses/${btn.dataset.delExp}`, 'DELETE');
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // itinerario: add poi
  card.querySelector('#btn-add-poi')?.addEventListener('click', () => _openPoiModal(refresh));

  // cycle priority
  card.querySelectorAll('[data-cycle]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const { cityId, poiId, priority } = JSON.parse(btn.dataset.cycle);
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'PATCH',
        { priority: PRIORITY_NEXT[priority] });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // delete POI
  card.querySelectorAll('[data-del-poi]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { cityId, poiId } = JSON.parse(btn.dataset.delPoi);
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'DELETE');
      _trip = await _api(`/api/trips/${_trip.id}`);
      _nearby = [];
      refresh();
    });
  });

  // check-in
  card.querySelectorAll('[data-checkin]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { cityId, poiId, current } = JSON.parse(btn.dataset.checkin);
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'PATCH',
        { checkin_time: current ? null : new Date().toISOString(), done: !current });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // confirm slot (save auto-assigned)
  card.querySelectorAll('[data-confirm-slot]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { cityId, poiId, day, slot } = JSON.parse(btn.dataset.confirmSlot);
      await _api(`/api/trips/${_trip.id}/cities/${cityId}/pois/${poiId}`, 'PATCH',
        { assigned_day: day, assigned_slot: slot });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // add nearby as POI
  card.querySelectorAll('[data-add-nearby]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const p = JSON.parse(btn.dataset.addNearby);
      const city = _trip.cities[0];
      await _api(`/api/trips/${_trip.id}/pois`, 'POST', {
        city_id: city.id, name: p.name, type: p.type,
        duration_h: 1.5, opening_hours: p.opening_hours || '', notes: '',
        coords: p.lat ? { lat: p.lat, lon: p.lon } : null,
      });
      _trip = await _api(`/api/trips/${_trip.id}`);
      _nearby = _nearby.filter(n => n.name !== p.name);
      refresh();
    });
  });

  // dismiss nearby
  card.querySelector('#dismiss-nearby')?.addEventListener('click', () => {
    _nearby = []; refresh();
  });

  // links
  card.querySelector('#btn-add-link')?.addEventListener('click', () => _openLinkModal(refresh));
  card.querySelectorAll('[data-discard-link]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await _api(`/api/trips/${_trip.id}/links/${btn.dataset.discardLink}`, 'PATCH',
        { status:'discarded' });
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // flight tracker — detect
  card.querySelectorAll('[data-detect-leg]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { tripId, legId } = JSON.parse(btn.dataset.detectLeg);
      btn.textContent = '🔍 A detectar...';
      btn.disabled = true;
      const r = await _api(`/api/trips/${tripId}/legs/${legId}/detect`, 'POST');
      if (r.flight) {
        _trip = await _api(`/api/trips/${_trip.id}`);
        refresh();
      } else {
        btn.textContent = '❌ ' + (r.error || 'Não encontrado');
        btn.disabled = false;
      }
    });
  });

  // flight tracker — manual refresh status
  card.querySelectorAll('[data-status-leg]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { tripId, legId } = JSON.parse(btn.dataset.statusLeg);
      btn.textContent = '⏳';
      btn.disabled = true;
      await _api(`/api/trips/${tripId}/legs/${legId}/status`);
      _trip = await _api(`/api/trips/${_trip.id}`);
      refresh();
    });
  });

  // auto-poll on travel day
  _startFlightPolling(refresh);

  // ORS travel times — lazy fetch for all placeholder pills
  card.querySelectorAll('[data-traveltime]').forEach(async el => {
    const key = el.dataset.traveltime;
    if (_travelTimes[key] !== undefined) {
      if (_travelTimes[key]) el.textContent = `~${_travelTimes[key]}min 🚶`;
      return;
    }
    const [fla, flo, tla, tlo] = key.split(',');
    try {
      const r = await fetch(
        `/api/geo/traveltime?from_lat=${fla}&from_lon=${flo}&to_lat=${tla}&to_lon=${tlo}`
      ).then(r => r.json());
      _travelTimes[key] = r.minutes || 0;
      if (r.minutes) el.textContent = `~${r.minutes}min 🚶`;
    } catch (_) { _travelTimes[key] = 0; }
  });
}

// ── NOVA VIAGEM ────────────────────────────────────────────────────────────
function _openNewTripModal(refresh) {
  const overlay = _overlay(`
    <div class="modal-title">Nova viagem <button class="modal-close" id="mc">✕</button></div>
    <div class="modal-field">
      <label class="modal-label">Nome</label>
      <input class="modal-input" id="nt-name" placeholder="Ex: Madrid 2026" />
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <label class="modal-label">Emoji</label>
        <input class="modal-input" id="nt-flag" placeholder="✈️" style="width:4rem;text-align:center" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Destino</label>
        <input class="modal-input" id="nt-city" placeholder="Madrid" />
      </div>
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <label class="modal-label">Chegada</label>
        <input class="modal-input" type="date" id="nt-arr" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Partida</label>
        <input class="modal-input" type="date" id="nt-dep" />
      </div>
    </div>
    <div class="modal-field">
      <label class="modal-label">Viajantes</label>
      <input class="modal-input" id="nt-trav" value="Pedro, Inês" />
    </div>
    <div class="modal-field">
      <label class="modal-label">Orçamento por pessoa (€)</label>
      <input class="modal-input" type="number" id="nt-budget" value="500" min="0" />
    </div>
    <div id="nt-err" style="color:var(--danger,#e05);font-size:.85rem;min-height:1.2rem"></div>
    <div class="modal-actions">
      <button class="btn-modal-cancel" id="mcancel">Cancelar</button>
      <button class="btn-modal-save"   id="msave">Criar viagem</button>
    </div>`);

  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#mc').addEventListener('click', close);
  overlay.querySelector('#mcancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#msave').addEventListener('click', async () => {
    const name   = overlay.querySelector('#nt-name').value.trim();
    const flag   = overlay.querySelector('#nt-flag').value.trim() || '✈️';
    const city   = overlay.querySelector('#nt-city').value.trim();
    const arr    = overlay.querySelector('#nt-arr').value;
    const dep    = overlay.querySelector('#nt-dep').value;
    const trav   = overlay.querySelector('#nt-trav').value.trim();
    const budget = parseFloat(overlay.querySelector('#nt-budget').value) || 500;
    const errEl  = overlay.querySelector('#nt-err');

    if (!name)              { errEl.textContent = 'O nome é obrigatório.'; return; }
    if (arr && dep && arr >= dep) { errEl.textContent = 'A partida tem de ser depois da chegada.'; return; }

    const r = await _api('/api/trips', 'POST', {
      name, flag, city, arrival: arr, departure: dep,
      travellers: trav, budget_per_person: budget,
    });
    if (r.error) {
      errEl.textContent = r.error === 'trip already exists'
        ? 'Já existe uma viagem com este nome.' : r.error;
      return;
    }
    _trips  = await _api('/api/trips');
    _tripId = r.id;
    _trip   = await _api(`/api/trips/${r.id}`);
    _selectorOpen = false;
    _nearby = [];
    close();
    refresh();
  });
}

// ── FECHAR VIAGEM ──────────────────────────────────────────────────────────
function _openFecharModal() {
  const t = _trip;
  const { pedro, ines } = _budgetCalc(t);
  const nights = (t.cities||[]).reduce(
    (s,c) => s + Math.round((new Date(c.departure) - new Date(c.arrival)) / 86400000), 0);

  const legLines = (t.legs||[]).map(l =>
    `- ✈️ ${l.from} → ${l.to} · ${_fmtDate(l.date)} · ${l.airline}${l.flight ? ' ' + l.flight : ''}`
  ).join('\n') || '— (sem voos registados)';

  const cityLines = (t.cities||[]).map(c =>
    `- **${c.name}** · ${_fmtDate(c.arrival)} → ${_fmtDate(c.departure)} · ${c.hotel.name || 'alojamento a definir'}`
  ).join('\n') || '— (sem alojamento)';

  const allPois = (t.cities||[]).flatMap(c => (c.pois||[]).map(p => ({...p, cityName:c.name})));
  const poiLines = [
    ...allPois.filter(p=>p.done).map(p =>
      `- ✓ **${p.name}** (${p.type})${p.checkin_time ? ' · ' + _fmtTime(p.checkin_time) : ''}`),
    ...allPois.filter(p=>!p.done && p.priority!=='backlog').map(p =>
      `- ○ ${p.name} (${p.type}) — não visitado`),
  ].join('\n') || '— (sem POIs)';

  const exps = (t.expenses||[]);
  let expBlock = '— (sem despesas)';
  if (exps.length) {
    const rows = exps.map(e =>
      `| ${esc(e.description||'—')} | ${esc(CATEGORY_LABELS[e.category]||e.category)} | €${Number(e.amount).toFixed(2)} | ${esc(SPLIT_LABELS[e.split]||e.split)} |`
    ).join('\n');
    expBlock = `| Descrição | Categoria | Valor | Split |\n|---|---|---|---|\n${rows}\n\n**Total:** €${(pedro+ines).toFixed(2)} · Pedro €${pedro.toFixed(2)} · Inês €${ines.toFixed(2)}`;
  }

  const today = new Date().toLocaleDateString('pt-PT');
  const slug  = t.name.replace(/\s+/g, '-');
  const md = `# ${t.name}
${_fmtDate(t.countdown_to)} · ${nights} noite${nights!==1?'s':''} · ${(t.cities||[]).map(c=>c.name).join(', ')}

## Voos
${legLines}

## Alojamento
${cityLines}

## POIs
${poiLines}

## Despesas
${expBlock}

---
*Exportado em ${today}*`;

  const overlay = _overlay(`
    <div class="modal-title">Fechar viagem <button class="modal-close" id="mc">✕</button></div>
    <p class="modal-hint">Copia para o Obsidian em <code>Viagens/${esc(slug)}.md</code></p>
    <textarea class="modal-textarea" id="md-out" readonly>${esc(md)}</textarea>
    <div class="modal-actions">
      <button class="btn-modal-cancel" id="mcancel">Fechar</button>
      <button class="btn-modal-save"   id="msave">📋 Copiar</button>
    </div>`);

  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#mc').addEventListener('click', close);
  overlay.querySelector('#mcancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#msave').addEventListener('click', async () => {
    const saveBtn = overlay.querySelector('#msave');
    try {
      await navigator.clipboard.writeText(md);
      saveBtn.textContent = '✓ Copiado!';
      setTimeout(() => { saveBtn.textContent = '📋 Copiar'; }, 2000);
    } catch (_) {
      overlay.querySelector('#md-out').select();
    }
  });
}

// ── SELECTOR ───────────────────────────────────────────────────────────────
function _renderSelector() {
  return `
    <div class="trip-selector-panel fade-in">
      ${_trips.map(t => {
        const cd = _countdown(t.countdown_to);
        return `
          <button class="trip-sel-item ${t.id===_tripId?'active':''}" data-select-trip="${esc(t.id)}">
            <span class="trip-sel-item-flag">${esc(t.flag||'✈️')}</span>
            <span class="trip-sel-item-name">${esc(t.name)}</span>
            <span class="trip-sel-item-cd ${cd.past?'past':''}">${esc(cd.text)}</span>
          </button>`;
      }).join('')}
      <button class="trip-sel-item new" id="btn-new-trip">＋ Nova viagem</button>
    </div>`;
}

// ── RESUMO ─────────────────────────────────────────────────────────────────
function _renderResumo() {
  const t = _trip;
  const nights   = t.cities.reduce((s,c) => s + Math.round((new Date(c.departure) - new Date(c.arrival)) / 86400000), 0);
  const totalPoi = t.cities.reduce((s,c) => s + (c.pois?.length||0), 0);
  const { pedro, ines } = _budgetCalc(t);

  return `
    <div class="viagens-legs">
      ${t.legs.map(l => _renderLegCard(l)).join('')}
    </div>

    ${t.cities.map(c => `
      <div class="viagens-hotel">
        <div class="hotel-icon">🏨</div>
        <div>
          <div class="hotel-name">${esc(c.hotel.name)}</div>
          <div class="hotel-meta">${esc(c.name)} · ${_fmtDate(c.arrival)} → ${_fmtDate(c.departure)} · ${c.hotel.nights} noite${c.hotel.nights!==1?'s':''}</div>
        </div>
        ${c.hotel.confirmed?'<span class="leg-confirmed">✓</span>':''}
      </div>`).join('')}

    <div class="viagens-stats">
      ${[
        [t.cities.length, `Cidade${t.cities.length!==1?'s':''}`],
        [nights,          `Noite${nights!==1?'s':''}`],
        [totalPoi,        `POI${totalPoi!==1?'s':''}`],
        [`€${(pedro+ines).toFixed(0)}`, 'Gasto total'],
      ].map(([v,l]) => `
        <div class="viagens-stat">
          <div class="viagens-stat-value">${esc(String(v))}</div>
          <div class="viagens-stat-label">${esc(l)}</div>
        </div>`).join('')}
    </div>

    <div class="budget-section">
      <div class="budget-title">Orçamento · €${t.budget_per_person}/pessoa</div>
      <div class="budget-persons">
        ${_personBar('Pedro', pedro, t.budget_per_person)}
        ${_personBar('Inês',  ines,  t.budget_per_person)}
      </div>
    </div>
    <button class="btn-fechar-viagem" id="btn-fechar-viagem">Fechar viagem ↗</button>`;
}

function _renderLegCard(l) {
  const today    = new Date().toISOString().slice(0, 10);
  const isToday  = l.date === today;
  const hasFlight = !!l.flight;
  const hasStatus = !!l.status_updated;
  const detectData = JSON.stringify({ tripId: _trip.id, legId: l.id });

  const depInfo = (l.terminal_dep || l.gate_dep)
    ? `<div class="flight-terminal">T${esc(String(l.terminal_dep||'?'))}${l.gate_dep ? ' · Porta ' + esc(String(l.gate_dep)) : ''}</div>`
    : '';
  const arrInfo = (l.terminal_arr || l.gate_arr)
    ? `<div class="flight-terminal">T${esc(String(l.terminal_arr||'?'))}${l.gate_arr ? ' · Porta ' + esc(String(l.gate_arr)) : ''}</div>`
    : '';
  const baggage = l.baggage_belt
    ? `<div class="flight-baggage">🧳 Tapete ${esc(String(l.baggage_belt))}</div>`
    : '';
  const delayBadge = l.delay_minutes > 0
    ? `<div class="flight-time-delay">+${l.delay_minutes}min</div>`
    : '';

  return `
    <div class="viagens-leg flight-card ${isToday ? 'today' : ''}">
      <div class="flight-card-top">
        <div class="leg-route">${esc(l.from)} → ${esc(l.to)}</div>
        <div class="leg-meta">${_fmtDate(l.date)} · ${esc(l.airline)}</div>
        <div class="flight-right">
          ${hasFlight ? `<span class="flight-num">${esc(l.flight)}</span>` : ''}
          ${_statusBadge(l.status, l.delay_minutes)}
          ${l.confirmed ? '<span class="leg-confirmed">✓</span>' : ''}
        </div>
      </div>

      ${isToday && hasFlight ? `<div class="flight-today-banner">Hoje em monitorização · atualiza de 5 em 5 min</div>` : ''}

      <div class="flight-times">
        <div class="flight-time-col dep">
          <div class="flight-airport">${esc(l.from)}</div>
          <div class="flight-time-sched">${esc(l.departs_local || '--')}</div>
          ${delayBadge}
          ${depInfo}
        </div>
        <div class="flight-arrow">✈️</div>
        <div class="flight-time-col arr">
          <div class="flight-airport">${esc(l.to)}</div>
          <div class="flight-time-sched">${esc(l.arrives_local || '--')}</div>
          ${arrInfo}
          ${baggage}
        </div>
      </div>

      <div class="flight-actions">
        ${!hasFlight
          ? `<button class="btn-detect-flight" data-detect-leg='${detectData}'>🔍 Detectar voo</button>`
          : `<button class="btn-refresh-status" data-status-leg='${detectData}'>🔄</button>
             <a class="btn-fr24" href="https://www.flightradar24.com/data/flights/${esc(l.flight.toLowerCase())}" target="_blank" rel="noopener">FR24 ↗</a>`
        }
        ${hasFlight && !hasStatus ? '<span class="flight-no-data">Tracking disponível próximo ao voo</span>' : ''}
      </div>
    </div>`;
}

function _statusBadge(status, delay) {
  if (!status) return '';
  const CLS = {
    'On Time':'on-time', 'Scheduled':'scheduled', 'Delayed':'delayed',
    'Cancelled':'cancelled', 'Landed':'landed', 'Active':'active',
  };
  const PT = {
    'On Time':'No horário', 'Scheduled':'Programado', 'Delayed':'Atrasado',
    'Cancelled':'Cancelado', 'Landed':'Aterrou', 'Active':'Em voo',
  };
  const cls   = CLS[status] || 'scheduled';
  const label = status === 'Delayed' && delay > 0
    ? `Atrasado ${delay}min`
    : (PT[status] || status);
  return `<span class="flight-status-badge ${cls}">${esc(label)}</span>`;
}

// ── DESPESAS ───────────────────────────────────────────────────────────────
function _renderDespesas() {
  const t = _trip;
  const { pedro, ines } = _budgetCalc(t);
  const exps = t.expenses || [];

  return `
    <div class="budget-section">
      <div class="budget-title">Orçamento · €${t.budget_per_person}/pessoa</div>
      <div class="budget-persons">
        ${_personBar('Pedro', pedro, t.budget_per_person)}
        ${_personBar('Inês',  ines,  t.budget_per_person)}
      </div>
    </div>

    <table class="expense-table">
      <thead>
        <tr>
          <th>Descrição</th><th>Categoria</th><th>Divisão</th>
          <th style="text-align:right">Valor</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${exps.length===0
          ? '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:1rem">Sem despesas</td></tr>'
          : exps.map(e => `
              <tr>
                <td>${esc(e.description)}</td>
                <td style="color:var(--text-dim);font-size:.8rem">${esc(CATEGORY_LABELS[e.category]||e.category)}</td>
                <td><span class="exp-split-badge exp-split-${esc(e.split)}">${esc(SPLIT_LABELS[e.split]||e.split)}</span></td>
                <td style="text-align:right;font-weight:600">€${Number(e.amount).toFixed(2)}</td>
                <td>${e.confirmed?'':`<button class="exp-del-btn" data-del-exp="${esc(e.id)}">✕</button>`}</td>
              </tr>`).join('')}
      </tbody>
    </table>
    <button class="btn-add-expense" id="btn-add-expense">＋ Adicionar despesa</button>`;
}

// ── ITINERÁRIO ─────────────────────────────────────────────────────────────
function _renderItinerario() {
  const t = _trip;
  const allPois   = t.cities.flatMap(c => (c.pois||[]).map(p => ({...p, cityId:c.id, cityName:c.name})));
  const schedule  = _computeAutoRoute(t);
  const days      = _getTripDays(t);
  const poolPois  = allPois.filter(p => !p.assigned_day && p.priority !== 'backlog');
  const backlog   = allPois.filter(p => p.priority === 'backlog');

  return `
    <!-- POI POOL -->
    <div class="poi-pool-header">
      <span class="poi-city-label">📍 ${esc(t.cities[0]?.name||'')}</span>
      <button class="btn-add-poi" id="btn-add-poi">＋ Adicionar POI</button>
    </div>

    ${allPois.length===0
      ? `<div class="poi-empty">Adiciona locais que queres visitar. O itinerário é gerado automaticamente.</div>`
      : `<div class="poi-list">
          ${[...allPois.filter(p=>p.priority==='must'), ...allPois.filter(p=>p.priority==='want')]
            .map(p => _renderPoiCard(p)).join('')}
        </div>`}

    ${_nearby.length>0 ? _renderNearby() : ''}

    ${backlog.length>0 ? `
      <div class="budget-title" style="margin-top:1rem">Backlog</div>
      <div class="poi-list">${backlog.map(p => _renderPoiCard(p)).join('')}</div>
    ` : ''}

    <!-- AUTO ITINERARY -->
    ${days.length>0 ? `
      <div class="itinerary-header">
        <span class="budget-title">Itinerário sugerido</span>
        <span class="itinerary-hint">Toca em ✓ para confirmar um slot</span>
      </div>
      <div class="itinerary-days">
        ${days.map(day => _renderDay(day, schedule[day]||{blocks:[],manha:[],tarde:[],noite:[]}, allPois)).join('')}
      </div>
    ` : ''}`;
}

function _renderPoiCard(p) {
  const kb = _matchKB(p.name);
  const cycleData   = JSON.stringify({cityId:p.cityId, poiId:p.id, priority:p.priority});
  const delData     = JSON.stringify({cityId:p.cityId, poiId:p.id});
  const checkinData = JSON.stringify({cityId:p.cityId, poiId:p.id, current:p.checkin_time});
  return `
    <div class="poi-card ${p.done?'poi-done':''}">
      <div class="poi-priority-dot ${p.priority}"></div>
      <span class="poi-type-icon">${TYPE_ICONS[p.type]||'📍'}</span>
      <div class="poi-name">${esc(p.name)}</div>
      ${kb ? `<span class="poi-free-badge" title="${esc(kb.free)}">🎟 grátis</span>` : ''}
      <div class="poi-meta">${p.duration_h}h</div>
      <button class="poi-priority-label ${p.priority}" data-cycle='${cycleData}'>${esc(PRIORITY_LABELS[p.priority])}</button>
      <button class="poi-checkin-btn ${p.checkin_time?'checked':''}" data-checkin='${checkinData}'>${p.checkin_time?'✓':''}</button>
      <button class="poi-delete-btn" data-del-poi='${delData}'>✕</button>
    </div>`;
}

function _renderDay(day, dayData, allPois) {
  const d = new Date(day + 'T12:00:00');
  const blocks  = dayData.blocks || [];
  const isFirst = day === _trip.legs[0]?.date;
  const isLast  = day === _trip.legs[_trip.legs.length-1]?.date;

  return `
    <div class="itinerary-day">
      <div class="itinerary-day-header">
        <span>${DAYS_PT[d.getDay()]}, ${d.getDate()} ${MONTHS_PT[d.getMonth()]}</span>
        ${isFirst?'<span class="day-badge arrival">Chegada</span>':isLast?'<span class="day-badge departure">Partida</span>':''}
      </div>
      <div class="itinerary-slots">
        ${blocks.map(b => `
          <div class="itinerary-block">
            <span class="block-icon">${b.type==='flight'?'✈️':'🏨'}</span>
            <span class="block-label">${esc(b.label)}</span>
          </div>`).join('')}
        ${SLOTS.map(slot => {
          const pois  = (dayData[slot.id] || []);
          const avail = dayData[slot.id+'_cap'] ?? slot.cap;
          return `
            <div class="itinerary-slot">
              <span class="slot-time-label">${slot.label}</span>
              <div class="slot-pois">
                ${avail===0 ? `<span class="slot-blocked">Bloqueado</span>` :
                  pois.length===0 ? `<span class="slot-empty">Livre</span>` :
                  pois.map((item, idx) => {
                    const poi      = allPois.find(p => p.id === item.poiId) || item;
                    const nextItem = pois[idx + 1];
                    const nextPoi  = nextItem ? allPois.find(p => p.id === nextItem.poiId) : null;
                    const kb  = _matchKB(poi.name||'');
                    const confirmed = !!poi.assigned_day;
                    const confirmData = JSON.stringify({cityId:poi.cityId, poiId:poi.id, day, slot:slot.id});
                    const ttKey = (poi.coords && nextPoi?.coords)
                      ? `${poi.coords.lat},${poi.coords.lon},${nextPoi.coords.lat},${nextPoi.coords.lon}`
                      : null;
                    const cached = ttKey && _travelTimes[ttKey];
                    return `
                      <div class="slot-poi-row ${confirmed?'confirmed':'suggested'}">
                        <span class="slot-poi-icon">${TYPE_ICONS[poi.type]||'📍'}</span>
                        <span class="slot-poi-name">${esc(poi.name||'')}</span>
                        ${kb?`<span class="poi-free-badge small" title="${esc(kb.free)}">🎟</span>`:''}
                        ${poi.checkin_time?`<span class="slot-checkin">✓ ${_fmtTime(poi.checkin_time)}</span>`:''}
                        ${!confirmed?`<button class="btn-confirm-slot" data-confirm-slot='${confirmData}'>✓</button>`:''}
                      </div>
                      ${ttKey ? `<div class="travel-time-pill" data-traveltime="${esc(ttKey)}">${cached ? `~${cached}min 🚶` : ''}</div>` : ''}`;
                  }).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function _renderNearby() {
  return `
    <div class="nearby-panel fade-in">
      <div class="nearby-header">
        <span class="budget-title">Também perto</span>
        <button class="nearby-dismiss" id="dismiss-nearby">✕</button>
      </div>
      <div class="nearby-list">
        ${_nearby.map(p => `
          <div class="nearby-card">
            <span class="poi-type-icon">${TYPE_ICONS[p.type]||'📍'}</span>
            <div class="nearby-info">
              <div class="nearby-name">${esc(p.name)}</div>
              ${p.opening_hours?`<div class="nearby-hours">${esc(p.opening_hours.slice(0,60))}</div>`:''}
            </div>
            <button class="btn-add-nearby" data-add-nearby='${JSON.stringify(p).replace(/'/g,"&apos;")}'>＋</button>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── LINKS ──────────────────────────────────────────────────────────────────
function _renderLinks() {
  const links = (_trip.links||[]).filter(l => l.status !== 'discarded');
  return `
    ${links.length===0
      ? `<div class="poi-empty">Cola um link de qualquer plataforma (YouTube, Reddit, artigos). Para Instagram/X descreve o que viste.</div>`
      : `<div class="links-list">${links.map(l => `
          <div class="link-card">
            <span class="link-platform">${esc(l.platform)}</span>
            <div class="link-content">
              <div class="link-url">${esc(l.url)}</div>
              ${l.summary?`<div class="link-summary">${esc(l.summary)}</div>`:''}
            </div>
            <span class="link-status ${l.status}">${esc(l.status)}</span>
            <button class="exp-del-btn" data-discard-link="${esc(l.id)}">✕</button>
          </div>`).join('')}
        </div>`}
    <button class="btn-add-expense" id="btn-add-link">＋ Adicionar link</button>`;
}

// ── AUTO-ROUTE ENGINE ──────────────────────────────────────────────────────

function _getTripDays(trip) {
  const start = new Date(trip.countdown_to + 'T12:00:00');
  const end   = trip.cities.reduce((max, c) => {
    const d = new Date(c.departure + 'T12:00:00');
    return d > max ? d : max;
  }, start);
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1))
    days.push(d.toISOString().slice(0,10));
  return days;
}

function _getTimeBlocks(trip) {
  const blocks = [];
  const legs   = trip.legs || [];
  const out    = legs[0];
  const ret    = legs[legs.length-1];

  if (out) {
    blocks.push({ date:out.date, slot:'manha',  type:'flight',
      label:`✈️ Voo ${out.from}→${out.to} · parte ${out.departs_local}` });
    blocks.push({ date:out.date, slot:'tarde_partial', type:'checkin',
      label:`🏨 Transfer aeroporto → hotel · check-in · livre após as 17:30` });
  }
  if (ret && ret.date !== out?.date) {
    blocks.push({ date:ret.date, slot:'noite', type:'flight',
      label:`✈️ Voo ${ret.from}→${ret.to} · ${ret.departs_local} · sair para aeroporto às 20:00` });
  }
  return blocks;
}

function _computeAutoRoute(trip) {
  const days   = _getTripDays(trip);
  const blocks = _getTimeBlocks(trip);
  const allPois = trip.cities.flatMap(c => (c.pois||[]).map(p => ({...p, cityId:c.id})));

  // Separate already-confirmed from to-assign
  const confirmed = allPois.filter(p => p.assigned_day);
  const toAssign  = allPois.filter(p => !p.assigned_day && p.priority !== 'backlog');

  // Build capacity map
  const cap = {};
  days.forEach(day => {
    cap[day] = { manha: SLOTS[0].cap, tarde: SLOTS[1].cap, noite: SLOTS[2].cap };
  });

  // Apply flight/travel blocks
  const firstDay = trip.legs[0]?.date;
  const lastDay  = trip.legs[trip.legs.length-1]?.date;
  if (firstDay && cap[firstDay]) {
    cap[firstDay].manha = 0;
    cap[firstDay].tarde = 1.5; // free from ~17:30
  }
  if (lastDay && cap[lastDay]) {
    cap[lastDay].noite = 0;    // blocked: airport from 20:00
  }

  // Deduct capacity for confirmed POIs
  confirmed.forEach(p => {
    if (cap[p.assigned_day]?.[p.assigned_slot] !== undefined)
      cap[p.assigned_day][p.assigned_slot] = Math.max(0, cap[p.assigned_day][p.assigned_slot] - p.duration_h);
  });

  // Sort: must first, then want
  const sorted = [
    ...toAssign.filter(p => p.priority==='must'),
    ...toAssign.filter(p => p.priority==='want'),
  ];

  // Assign each POI
  const assignments = {};
  sorted.forEach(p => {
    const dur = p.duration_h || 1;
    let best = null, bestScore = -Infinity;

    days.forEach(day => {
      const d   = new Date(day + 'T12:00:00');
      const dow = d.getDay(); // 0=Sun
      SLOTS.forEach(slot => {
        const available = cap[day]?.[slot.id] ?? 0;
        if (available < dur) return;

        let score = available;

        // Prefer free entry window alignment
        const kb = _matchKB(p.name);
        if (kb) {
          const win = kb.free_windows.find(w => w.days.includes(dow));
          if (win) {
            // Check if this slot overlaps the free window
            if (slot.from < win.to && slot.to > win.from) score += 15;
          }
        }

        // Penalise last day noite (blocked)
        if (day === lastDay && slot.id === 'noite') return;

        if (score > bestScore) { bestScore = score; best = {day, slot:slot.id}; }
      });
    });

    if (best) {
      assignments[p.id] = best;
      cap[best.day][best.slot] = Math.max(0, cap[best.day][best.slot] - dur);
    }
  });

  // Build schedule output
  const schedule = {};
  days.forEach(day => {
    schedule[day] = {
      blocks:  blocks.filter(b => b.date === day),
      manha:   [], tarde:   [], noite:   [],
      manha_cap: cap[day]?.manha ?? SLOTS[0].cap,
      tarde_cap: cap[day]?.tarde ?? SLOTS[1].cap,
      noite_cap: cap[day]?.noite ?? SLOTS[2].cap,
    };
  });

  confirmed.forEach(p => {
    if (schedule[p.assigned_day]?.[p.assigned_slot])
      schedule[p.assigned_day][p.assigned_slot].push({ poiId:p.id, ...p });
  });

  toAssign.forEach(p => {
    const a = assignments[p.id];
    if (a && schedule[a.day]?.[a.slot])
      schedule[a.day][a.slot].push({ poiId:p.id, ...p });
  });

  return schedule;
}

// ── MODALS ─────────────────────────────────────────────────────────────────

function _openExpenseModal(refresh) {
  const overlay = _overlay(`
    <div class="modal-title">Nova despesa <button class="modal-close" id="mc">✕</button></div>
    <div class="modal-field">
      <label class="modal-label">Descrição</label>
      <input class="modal-input" id="ed" placeholder="ex: Jantar no mercado" />
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <label class="modal-label">Categoria</label>
        <select class="modal-select" id="ec">
          ${Object.entries(CATEGORY_LABELS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
        </select>
      </div>
      <div class="modal-field">
        <label class="modal-label">Divisão</label>
        <select class="modal-select" id="es">
          <option value="comum">Comum (÷2)</option>
          <option value="pedro">Só Pedro</option>
          <option value="ines">Só Inês</option>
        </select>
      </div>
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <label class="modal-label">Valor (€)</label>
        <input class="modal-input" id="ea" type="number" min="0" step="0.01" placeholder="0.00" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Data</label>
        <input class="modal-input" id="edt" type="date" value="${new Date().toISOString().slice(0,10)}" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-modal-cancel" id="mcancel">Cancelar</button>
      <button class="btn-modal-save"   id="msave">Guardar</button>
    </div>`);

  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#mc').addEventListener('click', close);
  overlay.querySelector('#mcancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
  overlay.querySelector('#msave').addEventListener('click', async () => {
    const desc   = overlay.querySelector('#ed').value.trim();
    const amount = parseFloat(overlay.querySelector('#ea').value);
    if (!desc || isNaN(amount) || amount <= 0) return;
    await _api(`/api/trips/${_trip.id}/expenses`, 'POST', {
      description: desc, category: overlay.querySelector('#ec').value,
      split: overlay.querySelector('#es').value, amount,
      date: overlay.querySelector('#edt').value,
    });
    _trip = await _api(`/api/trips/${_trip.id}`);
    close(); _view = 'despesas'; refresh();
  });
}

function _openPoiModal(refresh) {
  const city = _trip.cities[0];
  const overlay = _overlay(`
    <div class="modal-title">Novo POI <button class="modal-close" id="mc">✕</button></div>
    <div class="modal-field">
      <label class="modal-label">Nome</label>
      <input class="modal-input" id="pn" placeholder="ex: Museu do Prado" />
      <div class="poi-kb-hint" id="kb-hint"></div>
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <label class="modal-label">Tipo</label>
        <select class="modal-select" id="pt">
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
        <select class="modal-select" id="pp">
          <option value="must">Imprescindível</option>
          <option value="want" selected>Quero ir</option>
          <option value="backlog">Backlog</option>
        </select>
      </div>
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <label class="modal-label">Duração (horas)</label>
        <input class="modal-input" id="pd" type="number" min="0.5" step="0.5" value="2" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Horário</label>
        <input class="modal-input" id="ph" placeholder="ex: Seg-Sáb 10h-20h" />
      </div>
    </div>
    <div class="modal-field">
      <label class="modal-label">Notas</label>
      <input class="modal-input" id="pnotes" placeholder="Dicas, links, observações…" />
    </div>
    <div class="modal-actions">
      <button class="btn-modal-cancel" id="mcancel">Cancelar</button>
      <button class="btn-modal-save"   id="msave">Guardar</button>
    </div>`);

  // KB hint on name input
  overlay.querySelector('#pn').addEventListener('input', e => {
    const kb  = _matchKB(e.target.value);
    const hint = overlay.querySelector('#kb-hint');
    if (kb) {
      hint.innerHTML = `<span class="kb-hint-tag">🎟 Entrada gratuita</span> ${esc(kb.free)}<br><small style="color:var(--text-dim)">${esc(kb.opening)}</small>`;
      overlay.querySelector('#pd').value = kb.duration_h;
      overlay.querySelector('#pt').value = 'museu';
      if (kb.free_windows?.length) {
        overlay.querySelector('#ph').value = kb.opening;
      }
    } else {
      hint.innerHTML = '';
    }
  });

  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#mc').addEventListener('click', close);
  overlay.querySelector('#mcancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target===overlay) close(); });

  overlay.querySelector('#msave').addEventListener('click', async () => {
    const name = overlay.querySelector('#pn').value.trim();
    if (!name) return;
    const kb = _matchKB(name);

    // Geocode in background
    let coords = null;
    try {
      const city_name = _trip.cities[0]?.name || 'Madrid';
      const geo = await fetch(`/api/geo/geocode?q=${encodeURIComponent(name+' '+city_name)}`).then(r=>r.json());
      if (geo.found) coords = { lat: geo.lat, lon: geo.lon };
    } catch(_) {}

    await _api(`/api/trips/${_trip.id}/pois`, 'POST', {
      city_id:       city.id,
      name,
      type:          overlay.querySelector('#pt').value,
      priority:      overlay.querySelector('#pp').value,
      duration_h:    parseFloat(overlay.querySelector('#pd').value) || 1,
      opening_hours: kb ? kb.opening : overlay.querySelector('#ph').value.trim(),
      notes:         overlay.querySelector('#pnotes').value.trim(),
      coords,
    });

    _trip = await _api(`/api/trips/${_trip.id}`);

    // Fetch nearby if we have coords
    if (coords) {
      try {
        const results = await fetch(`/api/geo/nearby?lat=${coords.lat}&lon=${coords.lon}`).then(r=>r.json());
        const existing = new Set(_trip.cities.flatMap(c=>(c.pois||[]).map(p=>p.name.toLowerCase())));
        _nearby = (results||[]).filter(r => !existing.has(r.name.toLowerCase())).slice(0,6);
      } catch(_) { _nearby = []; }
    }

    close(); _view = 'itinerario'; refresh();
  });
}

function _openLinkModal(refresh) {
  const overlay = _overlay(`
    <div class="modal-title">Adicionar link <button class="modal-close" id="mc">✕</button></div>
    <div class="modal-field">
      <label class="modal-label">URL</label>
      <input class="modal-input" id="lu" placeholder="https://…" />
    </div>
    <div class="modal-field">
      <label class="modal-label">Plataforma</label>
      <select class="modal-select" id="lp">
        <option value="web">Web / Artigo</option>
        <option value="youtube">YouTube</option>
        <option value="reddit">Reddit</option>
        <option value="instagram">Instagram</option>
        <option value="x">X / Twitter</option>
        <option value="tiktok">TikTok</option>
      </select>
    </div>
    <div class="modal-field">
      <label class="modal-label">Resumo (obrigatório para plataformas fechadas)</label>
      <input class="modal-input" id="ls" placeholder="O que viste neste post / vídeo…" />
    </div>
    <div class="modal-actions">
      <button class="btn-modal-cancel" id="mcancel">Cancelar</button>
      <button class="btn-modal-save"   id="msave">Guardar</button>
    </div>`);

  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('#mc').addEventListener('click', close);
  overlay.querySelector('#mcancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
  overlay.querySelector('#msave').addEventListener('click', async () => {
    const url = overlay.querySelector('#lu').value.trim();
    if (!url) return;
    await _api(`/api/trips/${_trip.id}/links`, 'POST', {
      url, platform: overlay.querySelector('#lp').value,
      summary: overlay.querySelector('#ls').value.trim(),
    });
    _trip = await _api(`/api/trips/${_trip.id}`);
    close(); _view = 'links'; refresh();
  });
}

// ── FLIGHT POLLING ─────────────────────────────────────────────────────────

function _startFlightPolling(refresh) {
  if (!_trip) return;
  if (_pollInterval && _pollTripId === _trip.id) return; // already running

  if (_pollInterval) { clearInterval(_pollInterval); _pollInterval = null; }

  const today     = new Date().toISOString().slice(0, 10);
  const todayLegs = (_trip.legs || []).filter(l => l.date === today && l.flight);
  if (!todayLegs.length) return;

  _pollTripId   = _trip.id;
  _pollInterval = setInterval(async () => {
    for (const leg of todayLegs) {
      try { await _api(`/api/trips/${_trip.id}/legs/${leg.id}/status`); } catch(_) {}
    }
    _trip = await _api(`/api/trips/${_trip.id}`);
    refresh();
  }, 5 * 60 * 1000);
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function _matchKB(name) {
  const lower = name.toLowerCase();
  return Object.values(FREE_ENTRY_KB).find(kb => kb.keywords.some(k => lower.includes(k))) || null;
}

function _overlay(html) {
  const overlay = document.createElement('div');
  overlay.className = 'viagens-modal-overlay';
  overlay.innerHTML = `<div class="viagens-modal">${html}</div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function _budgetCalc(t) {
  const exps = t.expenses || [];
  const pedro = exps.reduce((s,e) => s + (e.split==='pedro' ? e.amount : e.split==='comum' ? e.amount/2 : 0), 0);
  const ines  = exps.reduce((s,e) => s + (e.split==='ines'  ? e.amount : e.split==='comum' ? e.amount/2 : 0), 0);
  return { pedro, ines };
}

function _personBar(name, spent, budget) {
  const pct = Math.min(100, Math.round(spent/budget*100));
  const cls = pct>=100?'over':pct>=85?'warn':'';
  return `
    <div class="budget-person">
      <div class="budget-person-name">${esc(name)}</div>
      <div class="budget-bar-wrap"><div class="budget-bar-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="budget-numbers">
        <span class="budget-spent">€${spent.toFixed(2)}</span>
        <span>€${(budget-spent).toFixed(2)} restam</span>
      </div>
    </div>`;
}

function _countdown(dateStr) {
  if (!dateStr) return { text:'', past:false };
  const today  = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff   = Math.round((target-today)/86400000);
  if (diff < 0)  return { text:'Viagem concluída', past:true };
  if (diff === 0) return { text:'Hoje!', past:false };
  if (diff === 1) return { text:'Amanhã!', past:false };
  return { text:`Faltam ${diff} dias`, past:false };
}

function _fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`;
}

function _fmtTime(isoStr) {
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
