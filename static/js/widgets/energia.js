import { esc } from '../utils/esc.js';

export async function fetchEnergy() {
  const r = await fetch('/api/energy/costs');
  if (!r.ok) throw new Error('Erro ao carregar dados de energia');
  return r.json();
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
      onSuccess(`${j.days} dias importados`);
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
  `;

  _wireUpload(el, (msg) => {
    if (onEredesUpload) onEredesUpload(msg);
  });
}
