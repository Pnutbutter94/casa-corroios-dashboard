import { esc } from '../utils/esc.js';

let _trendFilter = '2A';

export async function fetchEnergy() {
  const r = await fetch('/api/energy/costs');
  if (!r.ok) throw new Error('Erro ao carregar dados de energia');
  return r.json();
}

export async function fetchAnalysis() {
  const r = await fetch('/api/energy/analysis');
  if (!r.ok) return null;
  return r.json();
}

const MONTH_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function _monthLabel(m) {
  const [y, mo] = m.split('-');
  return `${MONTH_PT[parseInt(mo) - 1]} ${y.slice(2)}`;
}

function _eredesCard(er) {
  const hasToday = er.today_kwh > 0;
  const kwh   = hasToday ? er.today_kwh  : er.yesterday_kwh;
  const cost  = hasToday ? er.today_cost : er.yesterday_cost;
  const label = hasToday ? 'hoje'        : 'ontem';
  const lastW = er.last_w > 0 ? `${er.last_w.toFixed(0)} W` : '—';
  const lastTs = er.last_ts
    ? `<span class="eredes-updated">última leitura: ${esc(er.last_ts)}</span>`
    : '';

  return `
    <div class="eredes-card">
      <div class="eredes-card-header">
        <span class="eredes-card-title">Casa — Contador E-REDES</span>
        ${lastTs}
        <label class="eredes-upload-btn" title="Importar Excel E-REDES">
          Actualizar E-REDES
          <input type="file" accept=".xlsx" class="eredes-file-input" style="display:none">
        </label>
      </div>
      <div class="eredes-card-body">
        <div class="energia-stat">
          <span class="energia-val">${lastW}</span>
          <span class="energia-sub">últ. medição</span>
        </div>
        <div class="energia-stat">
          <span class="energia-val">${kwh.toFixed(2)} kWh</span>
          <span class="energia-sub">${label}</span>
        </div>
        <div class="energia-stat">
          <span class="energia-val energia-cost">${cost.toFixed(2)} €</span>
          <span class="energia-sub">custo ${label}</span>
        </div>
        <div class="energia-stat">
          <span class="energia-val">${er.month_kwh.toFixed(1)} kWh</span>
          <span class="energia-sub">este mês</span>
        </div>
        <div class="energia-stat">
          <span class="energia-val energia-cost">${er.month_cost.toFixed(2)} €</span>
          <span class="energia-sub">custo mês</span>
        </div>
      </div>
    </div>`;
}

function _noEredesCard() {
  return `
    <div class="eredes-card eredes-card-empty">
      <div class="eredes-card-header">
        <span class="eredes-card-title">Contador E-REDES</span>
        <label class="eredes-upload-btn" title="Importar Excel E-REDES">
          Importar E-REDES
          <input type="file" accept=".xlsx" class="eredes-file-input" style="display:none">
        </label>
      </div>
      <p class="eredes-empty-msg">Sem dados de consumo diário. Exporta o Excel em balcaodigital.e-redes.pt e importa aqui.</p>
    </div>`;
}

function _faturasCard(contract, fatura_count) {
  if (!contract) {
    return `
      <div class="eredes-card eredes-card-empty faturas-card">
        <div class="eredes-card-header">
          <span class="eredes-card-title">Faturas de Luz</span>
          <label class="eredes-fatura-btn" title="Importar fatura PDF">
            Importar Fatura
            <input type="file" accept=".pdf" class="fatura-file-input" style="display:none">
          </label>
        </div>
        <p class="eredes-empty-msg">Nenhuma fatura importada ainda. Importa o PDF que recebes por email.</p>
      </div>`;
  }
  const period = contract.periodo_fim
    ? `até ${esc(contract.periodo_fim.slice(0, 7))}`
    : '';
  return `
    <div class="eredes-card faturas-card">
      <div class="eredes-card-header">
        <span class="eredes-card-title">Faturas de Luz</span>
        <span class="eredes-updated">${fatura_count} fatura${fatura_count !== 1 ? 's' : ''} importada${fatura_count !== 1 ? 's' : ''} ${period}</span>
        <label class="eredes-fatura-btn" title="Importar fatura PDF">
          Importar Fatura
          <input type="file" accept=".pdf" class="fatura-file-input" style="display:none">
        </label>
      </div>
    </div>`;
}

function _supplierPills(suppliers) {
  if (!suppliers || Object.keys(suppliers).length <= 1) return '';
  return Object.entries(suppliers)
    .map(([name, eur]) => `<span class="trend-supplier-pill">${esc(name)} ${eur.toFixed(2)}€</span>`)
    .join('');
}

function _filteredMonths(analysis) {
  if (!analysis || !analysis.monthly) return [];
  const all = analysis.monthly.filter(m => m.bill_eur || m.kwh);
  if (_trendFilter === 'Tudo') return all;
  const months = _trendFilter === '6M' ? 6 : _trendFilter === '1A' ? 12 : 24;
  const cutoff = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 7);
  })();
  return all.filter(r => r.month >= cutoff);
}

function _trendChart(analysis) {
  if (!analysis || !analysis.monthly) return '';

  const rows = _filteredMonths(analysis);
  if (!rows.length) return '';

  const maxKwh  = Math.max(...rows.map(r => r.kwh  || 0), 1);
  const maxCost = Math.max(...rows.map(r => r.bill_eur || 0), 1);

  const rowsHtml = rows.map(r => {
    const kwhPct  = r.kwh      ? Math.round(r.kwh      / maxKwh  * 100) : 0;
    const costPct = r.bill_eur ? Math.round(r.bill_eur / maxCost * 100) : 0;
    const rate    = (r.kwh && r.bill_eur) ? r.bill_eur / r.kwh : null;
    // flag months where rate is anomalously low (< 0.15 €/kWh) — indicates partial billing period
    const partial = rate !== null && rate < 0.15;
    const effRate = rate !== null
      ? `<span class="trend-eff${partial ? ' trend-eff-partial' : ''}">${rate.toFixed(3)} €/kWh</span>`
      : '';
    const partialBadge = partial
      ? `<span class="trend-partial-badge">período parcial</span>`
      : '';
    const kwhBar  = r.kwh
      ? `<div class="trend-bar trend-bar-kwh${partial ? ' trend-bar-partial' : ''}" style="width:${kwhPct}%"></div>`
      : `<div class="trend-bar-none">sem leitura</div>`;
    const costVal = r.bill_eur
      ? `<span class="trend-cost">${r.bill_eur.toFixed(2)} €</span>`
      : `<span class="trend-cost trend-cost-none">—</span>`;
    const kwhVal  = r.kwh
      ? `<span class="trend-kwh">${r.kwh.toFixed(0)} kWh</span>`
      : '';
    const potencia = r.potencia_kva
      ? `<span class="trend-potencia">${r.potencia_kva} kVA</span>`
      : '';
    const supplierPills = _supplierPills(r.suppliers);
    const confirmedBadge = r.confirmed
      ? `<span class="trend-confirmed-badge" title="Dados confirmados da fatura">✓</span>`
      : '';
    return `
      <div class="trend-row${partial ? ' trend-row-partial' : ''}">
        <span class="trend-month">${_monthLabel(r.month)}${confirmedBadge}</span>
        <div class="trend-bars">
          ${kwhBar}
          <div class="trend-bar trend-bar-cost" style="width:${costPct}%"></div>
        </div>
        <div class="trend-vals">${kwhVal}${costVal}${effRate}${potencia}${partialBadge}${supplierPills}</div>
      </div>`;
  }).join('');

  const filters = ['6M', '1A', '2A', 'Tudo'];
  const filterHtml = filters.map(f =>
    `<button class="trend-filter-chip${f === _trendFilter ? ' active' : ''}" data-filter="${esc(f)}">${esc(f)}</button>`
  ).join('');

  return `
    <div class="trend-card">
      <div class="trend-header">
        <span class="trend-title">Histórico — Faturas de Luz</span>
        <div class="trend-header-right">
          <div class="trend-filters">${filterHtml}</div>
          <div class="trend-legend">
            <span class="trend-legend-kwh">■ kWh</span>
            <span class="trend-legend-cost">■ €</span>
          </div>
        </div>
      </div>
      <div class="trend-list">${rowsHtml}</div>
    </div>`;
}

function _wireUpload(el, onSuccess) {
  const input = el.querySelector('.eredes-file-input');
  if (!input) return;
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const btn = input.closest('label');
    btn.textContent = 'A processar…';
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/energy/eredes-upload', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro');
      onSuccess(`${j.days ?? '?'} dias importados`);
    } catch (e) {
      alert('Erro ao importar: ' + e.message);
      btn.textContent = 'Actualizar';
    }
  });
}

function _field(label, name, value, type = 'text') {
  const val = value != null ? esc(String(value)) : '';
  const filled = value != null ? ' class="fatura-field-filled"' : '';
  return `
    <div class="fatura-field">
      <label class="fatura-label">${esc(label)}</label>
      <input${filled} type="${type}" name="${name}" value="${val}" class="fatura-input" placeholder="—">
    </div>`;
}

function _showFaturaModal(parsed, pdfFile, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'fatura-overlay';
  overlay.innerHTML = `
    <div class="fatura-modal">
      <div class="fatura-modal-header">
        <span class="fatura-modal-title">Fatura importada — confirmar dados</span>
        <button class="fatura-modal-close" type="button">✕</button>
      </div>
      <div class="fatura-modal-body">
        <div class="fatura-grid">
          ${_field('Fornecedor', 'fornecedor', parsed.fornecedor)}
          ${_field('Número fatura', 'numero_fatura', parsed.numero_fatura)}
          ${_field('Período início', 'periodo_inicio', parsed.periodo_inicio, 'date')}
          ${_field('Período fim', 'periodo_fim', parsed.periodo_fim, 'date')}
          ${_field('Potência contratada (kVA)', 'potencia_contratada_kva', parsed.potencia_contratada_kva, 'number')}
          ${_field('Preço potência (€/dia)', 'preco_dia_potencia_eur', parsed.preco_dia_potencia_eur, 'number')}
          ${_field('Preço eletricidade (€/kWh)', 'preco_kwh', parsed.preco_kwh, 'number')}
          ${_field('Quantidade consumida (kWh)', 'kwh_consumidos', parsed.kwh_consumidos, 'number')}
          ${_field('Valor total fatura (€)', 'valor_total_eur', parsed.valor_total_eur, 'number')}
          ${_field('Data vencimento', 'data_vencimento', parsed.data_vencimento, 'date')}
          ${_field('IVA (%)', 'iva_pct', parsed.iva_pct, 'number')}
          ${_field('IVA (€)', 'iva_eur', parsed.iva_eur, 'number')}
        </div>
        <p class="fatura-hint">Campos preenchidos automaticamente. Verifica e corrige antes de confirmar.</p>
      </div>
      <div class="fatura-modal-footer">
        <button class="fatura-cancel-btn" type="button">Cancelar</button>
        <button class="fatura-confirm-btn" type="button">Confirmar e guardar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('.fatura-modal-close').onclick =
  overlay.querySelector('.fatura-cancel-btn').onclick = () => overlay.remove();

  overlay.querySelector('.fatura-confirm-btn').onclick = async () => {
    const btn = overlay.querySelector('.fatura-confirm-btn');
    btn.textContent = 'A guardar…';
    btn.disabled = true;

    const inputs = overlay.querySelectorAll('.fatura-input');
    const data = {};
    inputs.forEach(inp => {
      const v = inp.value.trim();
      if (!v) return;
      const num = ['potencia_contratada_kva', 'preco_dia_potencia_eur', 'preco_kwh',
                   'kwh_consumidos', 'valor_total_eur', 'iva_pct', 'iva_eur'];
      data[inp.name] = num.includes(inp.name) ? parseFloat(v) : v;
    });

    const fd = new FormData();
    fd.append('data', JSON.stringify(data));
    if (pdfFile) fd.append('file', pdfFile);

    try {
      const r = await fetch('/api/energy/fatura-store', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro');
      overlay.remove();
      onConfirm();
    } catch (e) {
      btn.textContent = 'Confirmar e guardar';
      btn.disabled = false;
      alert('Erro ao guardar: ' + e.message);
    }
  };
}

function _wireFaturaUpload(el, onSuccess) {
  const input = el.querySelector('.fatura-file-input');
  if (!input) return;
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const btn = input.closest('label');
    const origText = btn.childNodes[0].textContent.trim();
    btn.childNodes[0].textContent = 'A processar… ';
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/energy/fatura-parse', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro');
      btn.childNodes[0].textContent = origText + ' ';
      input.value = '';
      _showFaturaModal(j, file, onSuccess);
    } catch (e) {
      alert('Erro ao ler PDF: ' + e.message);
      btn.childNodes[0].textContent = origText + ' ';
      input.value = '';
    }
  });
}

function _wireAnalysis(el) {
  const btn = el.querySelector('#energia-analysis-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.textContent = 'A carregar…';
    btn.disabled = true;
    const [daily, profile] = await Promise.all([
      fetchDailyHistory(30).catch(() => null),
      fetchProfile().catch(() => null),
    ]);
    renderDailyCharts(daily, profile, el);
    btn.remove();
  });
}

function _contractBar(contract) {
  if (!contract) return '';
  const parts = [];
  if (contract.fornecedor) parts.push(`<span class="contract-supplier">${esc(contract.fornecedor)}</span>`);
  if (contract.potencia_kva) parts.push(`<span>${esc(String(contract.potencia_kva))} kVA</span>`);
  if (contract.preco_dia_potencia) parts.push(`<span>${esc(contract.preco_dia_potencia.toFixed(4))} €/dia pot.</span>`);
  if (contract.preco_kwh) parts.push(`<span>${esc(contract.preco_kwh.toFixed(4))} €/kWh</span>`);
  return parts.length ? `<div class="contract-bar">${parts.join('<span class="contract-sep">·</span>')}</div>` : '';
}

export function renderEnergia(data, el, onEredesUpload) {
  if (!data || data.error) {
    el.innerHTML = `<p class="energia-error">Sem dados de energia disponíveis.</p>`;
    return;
  }

  const { devices, totals, rate_per_kwh, eredes, contract, fatura_count } = data;
  const eredesHtml = eredes ? _eredesCard(eredes) : _noEredesCard();
  const faturasHtml = _faturasCard(contract || null, fatura_count || 0);

  const rows = devices.map(d => `
    <div class="energia-row${d.estimated ? ' energia-estimated' : ''}">
      <div class="energia-label">
        ${esc(d.label)}${d.estimated ? ' <span class="energia-badge">est.</span>' : ''}
      </div>
      <div class="energia-stat">
        <span class="energia-val">${d.current_w.toFixed(0)} W</span>
        <span class="energia-sub">agora</span>
      </div>
      <div class="energia-stat">
        <span class="energia-val">${d.today_kwh.toFixed(2)} kWh</span>
        <span class="energia-sub">hoje</span>
      </div>
      <div class="energia-stat">
        <span class="energia-val energia-cost">${d.today_cost.toFixed(2)} €</span>
        <span class="energia-sub">custo hoje</span>
      </div>
      <div class="energia-stat">
        <span class="energia-val">${d.month_kwh.toFixed(1)} kWh</span>
        <span class="energia-sub">este mês</span>
      </div>
      <div class="energia-stat">
        <span class="energia-val energia-cost">${d.month_cost.toFixed(2)} €</span>
        <span class="energia-sub">custo mês</span>
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="energia-header">
      <h2 class="energia-title">Consumo &amp; Custos</h2>
    </div>
    ${_contractBar(contract || null)}
    ${eredesHtml}
    ${faturasHtml}
    <div class="energia-list">${rows}</div>
    <div class="energia-totals">
      <div class="energia-total-item">
        <span class="energia-total-label">Dispositivos medidos hoje</span>
        <span class="energia-total-val">${totals.today_kwh.toFixed(2)} kWh</span>
        <span class="energia-total-cost">${totals.today_cost.toFixed(2)} €</span>
      </div>
      <div class="energia-total-item">
        <span class="energia-total-label">Dispositivos medidos este mês</span>
        <span class="energia-total-val">${totals.month_kwh.toFixed(1)} kWh</span>
        <span class="energia-total-cost">${totals.month_cost.toFixed(2)} €</span>
      </div>
    </div>
    <div id="energia-trend-placeholder"></div>
    <div id="energia-daily-placeholder"></div>
    <button id="energia-analysis-btn" class="energia-analysis-btn">Ver análise detalhada ▾</button>
  `;

  _wireUpload(el, (msg) => { if (onEredesUpload) onEredesUpload(msg); });
  _wireFaturaUpload(el, () => onEredesUpload && onEredesUpload('fatura guardada'));
  _wireAnalysis(el);
}

export function renderTrend(analysis, el) {
  const placeholder = el.querySelector('#energia-trend-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = _trendChart(analysis);
  placeholder.querySelectorAll('.trend-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      _trendFilter = btn.dataset.filter;
      placeholder.innerHTML = _trendChart(analysis);
      placeholder.querySelectorAll('.trend-filter-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === _trendFilter);
      });
    });
  });
}

export async function fetchDailyHistory(days = 30) {
  const r = await fetch(`/api/energy/daily?days=${days}`);
  if (!r.ok) return null;
  return r.json();
}

export async function fetchProfile() {
  const r = await fetch('/api/energy/profile');
  if (!r.ok) return null;
  return r.json();
}

export async function fetchHourlyDate(date) {
  const r = await fetch(`/api/energy/hourly?date=${date}`);
  if (!r.ok) return null;
  return r.json();
}

export function renderDailyCharts(daily, profile, el) {
  const ph = el.querySelector('#energia-daily-placeholder');
  if (!ph) return;
  ph.innerHTML = _dailyChart(daily) + _profileChart(profile);
  _wireHourlyPicker(ph);
}

function _wireHourlyPicker(container) {
  const input = container.querySelector('#eredes-date-input');
  const resultEl = container.querySelector('#eredes-hourly-result');
  if (!input || !resultEl) return;

  async function loadDate(date) {
    resultEl.textContent = 'A carregar…';
    const data = await fetchHourlyDate(date).catch(() => null);
    if (!data || !data.hourly) {
      resultEl.innerHTML = '<span class="energia-error" style="padding:0.5rem">Sem dados para essa data.</span>';
      return;
    }
    resultEl.innerHTML = _hourlyChart(data.date, data.hourly);
  }

  input.addEventListener('change', () => { if (input.value) loadDate(input.value); });
}

const DOW_PT  = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const DOW_END = ['dom','seg','ter','qua','qui','sex','sáb']; // JS getDay: 0=Sun

function _dailyChart(rows) {
  if (!rows || !rows.length) return '';
  const maxKwh = Math.max(...rows.map(r => r.kwh || 0), 1);
  const barsHtml = rows.map(r => {
    const d     = new Date(r.date + 'T12:00:00');
    const label = `${d.getDate()} ${MONTH_PT[d.getMonth()]}`;
    const isWkd = r.dow >= 5;
    if (r.kwh === null) {
      return `<div class="dchart-row">
        <span class="dchart-label">${label}</span>
        <div class="dchart-bar-wrap"><div class="dchart-bar dchart-bar-none" style="width:2%"></div></div>
        <span class="dchart-val dchart-val-none">—</span>
      </div>`;
    }
    const pct = Math.max(2, Math.round(r.kwh / maxKwh * 100));
    return `<div class="dchart-row">
      <span class="dchart-label">${label}</span>
      <div class="dchart-bar-wrap"><div class="dchart-bar${isWkd ? ' dchart-bar-wkd' : ''}" style="width:${pct}%"></div></div>
      <span class="dchart-val">${r.kwh.toFixed(1)} kWh</span>
    </div>`;
  }).join('');

  const avg = rows.filter(r => r.kwh).reduce((s, r) => s + r.kwh, 0) / (rows.filter(r => r.kwh).length || 1);
  return `
    <div class="trend-card">
      <div class="trend-header">
        <span class="trend-title">Consumo Diário — E-REDES</span>
        <span class="dchart-avg">média ${avg.toFixed(1)} kWh/dia</span>
      </div>
      <div class="dchart-list">${barsHtml}</div>
    </div>`;
}

function _hourlyChart(date, hourly) {
  const maxH = Math.max(...hourly, 0.01);
  const total = hourly.reduce((s, v) => s + v, 0);
  const barsHtml = hourly.map((v, h) => {
    const pct = Math.max(2, Math.round(v / maxH * 100));
    const isPeak = h >= 8 && h < 22;
    return `<div class="hchart-col">
      <div class="hchart-bar-wrap">
        <div class="hchart-bar${isPeak ? ' hchart-bar-peak' : ''}" style="height:${pct}%" title="${v.toFixed(3)} kWh"></div>
      </div>
      ${h % 6 === 0 ? `<span class="hchart-label">${String(h).padStart(2,'0')}h</span>` : '<span class="hchart-label"></span>'}
    </div>`;
  }).join('');
  return `
    <div class="profile-section">
      <span class="profile-sub">Consumo hora a hora — ${esc(date)} (total ${total.toFixed(2)} kWh)</span>
      <div class="hchart">${barsHtml}</div>
    </div>`;
}

function _profileChart(profile) {
  if (!profile) return '';
  const { hourly, dow } = profile;

  const maxH = Math.max(...hourly, 1);
  const hoursHtml = hourly.map((v, h) => {
    const pct = Math.max(2, Math.round(v / maxH * 100));
    const isPeak = h >= 8 && h < 22;
    return `<div class="hchart-col">
      <div class="hchart-bar-wrap">
        <div class="hchart-bar${isPeak ? ' hchart-bar-peak' : ''}" style="height:${pct}%"></div>
      </div>
      ${h % 6 === 0 ? `<span class="hchart-label">${String(h).padStart(2,'0')}h</span>` : '<span class="hchart-label"></span>'}
    </div>`;
  }).join('');

  const maxD = Math.max(...dow, 1);
  const dowHtml = dow.map((v, i) => {
    const pct = Math.max(2, Math.round(v / maxD * 100));
    const isWkd = i >= 5;
    return `<div class="dowchart-col">
      <div class="dowchart-bar-wrap">
        <div class="dowchart-bar${isWkd ? ' dowchart-bar-wkd' : ''}" style="height:${pct}%"></div>
      </div>
      <span class="dowchart-label">${DOW_PT[i]}</span>
      <span class="dowchart-val">${v.toFixed(1)}</span>
    </div>`;
  }).join('');

  return `
    <div class="trend-card">
      <div class="trend-header"><span class="trend-title">Perfil de Consumo</span></div>
      <div class="profile-section">
        <span class="profile-sub">Hora a hora (média)</span>
        <div class="hchart">${hoursHtml}</div>
      </div>
      <div class="profile-section">
        <span class="profile-sub">Dia da semana (média kWh/dia)</span>
        <div class="dowchart">${dowHtml}</div>
      </div>
      <div class="profile-section eredes-date-picker">
        <span class="profile-sub">Ver dia específico</span>
        <input type="date" id="eredes-date-input" class="eredes-date-input">
        <div id="eredes-hourly-result"></div>
      </div>
    </div>`;
}
