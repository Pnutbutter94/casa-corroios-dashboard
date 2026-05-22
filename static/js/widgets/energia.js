import { esc } from '../utils/esc.js';

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
          Actualizar
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
        <span class="eredes-card-title">Casa — Contador E-REDES</span>
        <label class="eredes-upload-btn" title="Importar Excel E-REDES">
          Importar dados
          <input type="file" accept=".xlsx" class="eredes-file-input" style="display:none">
        </label>
      </div>
      <p class="eredes-empty-msg">Sem dados. Exporta o Excel em balcaodigital.e-redes.pt e importa aqui.</p>
    </div>`;
}

function _trendChart(analysis) {
  if (!analysis || !analysis.monthly) return '';

  const rows = analysis.monthly.filter(m => m.bill_eur || m.kwh);
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
    return `
      <div class="trend-row${partial ? ' trend-row-partial' : ''}">
        <span class="trend-month">${_monthLabel(r.month)}</span>
        <div class="trend-bars">
          ${kwhBar}
          <div class="trend-bar trend-bar-cost" style="width:${costPct}%"></div>
        </div>
        <div class="trend-vals">${kwhVal}${costVal}${effRate}${partialBadge}</div>
      </div>`;
  }).join('');

  return `
    <div class="trend-card">
      <div class="trend-header">
        <span class="trend-title">Histórico — Faturas de Luz</span>
        <div class="trend-legend">
          <span class="trend-legend-kwh">■ kWh</span>
          <span class="trend-legend-cost">■ €</span>
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

export function renderEnergia(data, el, onEredesUpload) {
  if (!data || data.error) {
    el.innerHTML = `<p class="energia-error">Sem dados de energia disponíveis.</p>`;
    return;
  }

  const { devices, totals, rate_per_kwh, eredes } = data;
  const eredesHtml = eredes ? _eredesCard(eredes) : _noEredesCard();

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
      <span class="energia-rate">Tarifa: ${rate_per_kwh.toFixed(4)} €/kWh</span>
    </div>
    ${eredesHtml}
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
  `;

  _wireUpload(el, (msg) => { if (onEredesUpload) onEredesUpload(msg); });
}

export function renderTrend(analysis, el) {
  const placeholder = el.querySelector('#energia-trend-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = _trendChart(analysis);
}
