import { esc } from '../utils/esc.js';

export async function fetchEnergy() {
  const r = await fetch('/api/energy/costs');
  if (!r.ok) throw new Error('Erro ao carregar dados de energia');
  return r.json();
}

export function renderEnergia(data, el) {
  if (!data || data.error) {
    el.innerHTML = `<p class="energia-error">Sem dados de energia disponíveis.</p>`;
    return;
  }

  const { devices, totals, rate_per_kwh } = data;

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
    <div class="energia-list">${rows}</div>
    <div class="energia-totals">
      <div class="energia-total-item">
        <span class="energia-total-label">Total hoje</span>
        <span class="energia-total-val">${totals.today_kwh.toFixed(2)} kWh</span>
        <span class="energia-total-cost">${totals.today_cost.toFixed(2)} €</span>
      </div>
      <div class="energia-total-item">
        <span class="energia-total-label">Total este mês</span>
        <span class="energia-total-val">${totals.month_kwh.toFixed(1)} kWh</span>
        <span class="energia-total-cost">${totals.month_cost.toFixed(2)} €</span>
      </div>
    </div>
  `;
}
