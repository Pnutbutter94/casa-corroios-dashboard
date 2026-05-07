import { CLOTHES, CYCLES, GROUP_CYCLE, MACHINE } from '../data/machine.js';

// Corroios ~150 mg/L CaCO3 → moderately hard → bump dose by 20%
const HARD_WATER_FACTOR = 1.2;

function detergentML(kg) {
  return Math.min(70, Math.max(20, Math.round(35 * (kg / 4.5) * HARD_WATER_FACTOR)));
}

function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}min`;
}

export function computeLoads(counts) {
  const groups = {};
  for (const cat of CLOTHES) {
    const qty = counts[cat.id] || 0;
    if (qty === 0) continue;
    if (!groups[cat.group]) groups[cat.group] = [];
    groups[cat.group].push({ ...cat, qty });
  }

  const loads = [];
  for (const [group, items] of Object.entries(groups)) {
    const cycleKey = GROUP_CYCLE[group];
    const cycle    = CYCLES[cycleKey];

    // flatten to individual units, then pack greedily into loads
    const units = [];
    for (const item of items) {
      for (let i = 0; i < item.qty; i++) units.push(item);
    }

    let load = null;
    for (const unit of units) {
      if (!load || load.totalKg + unit.kg > cycle.maxKg) {
        if (load) loads.push(finalise(load));
        load = { cycleKey, cycle, tally: {}, totalKg: 0 };
      }
      if (!load.tally[unit.id]) {
        load.tally[unit.id] = { label: unit.label, icon: unit.icon, qty: 0 };
      }
      load.tally[unit.id].qty++;
      load.totalKg += unit.kg;
    }
    if (load) loads.push(finalise(load));
  }

  return loads;
}

function finalise(load) {
  return {
    ...load,
    items:    Object.values(load.tally),
    totalKg:  Math.round(load.totalKg * 100) / 100,
    overloaded: load.totalKg > MACHINE.capacity * 0.85,
  };
}

export function renderPlanOutput(counts) {
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return `<div class="plan-empty">Seleciona a roupa acima para planear as lavagens</div>`;
  }

  const loads = computeLoads(counts);
  return loads.map((load, i) => {
    const det      = detergentML(load.totalKg);
    const itemList = load.items.map(it => `${it.qty}× ${it.label}`).join(', ');
    const warn     = load.overloaded
      ? `<div class="load-warn">⚠️ Máquina quase cheia — não compactes demasiado</div>`
      : '';

    return `
      <div class="load-card">
        <div class="load-header">
          <span class="load-num">Lavagem ${i + 1}</span>
          <span class="load-cycle">${load.cycle.label}</span>
        </div>
        <div class="load-meta">
          <span class="load-chip">⚖️ ${load.totalKg.toFixed(1)} kg</span>
          <span class="load-chip">⏱ ${fmtDuration(load.cycle.duration)}</span>
          <span class="load-chip">💨 ${load.cycle.rpm} rpm</span>
        </div>
        <div class="load-items">${itemList}</div>
        ${warn}
        <div class="load-detergent">
          <span class="det-label">🧴 Detergente líquido</span>
          <span class="det-value">${det} mL</span>
          <span class="det-label">💧 Amaciador</span>
          <span class="det-value">25 mL</span>
          <span class="det-label">⚗️ Anti-calcário</span>
          <span class="det-value">1 past. Calgon</span>
        </div>
      </div>`;
  }).join('');
}

function maintDaysAgo(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function maintChip(icon, label, dateStr, limitDays, id) {
  const days    = maintDaysAgo(dateStr);
  const overdue = days === null || days >= limitDays;
  const cls     = overdue ? 'overdue' : 'ok';
  const dateText = days === null ? 'Nunca feito'
    : days === 0 ? 'Hoje'
    : `há ${days} dia${days !== 1 ? 's' : ''}`;

  return `
    <button class="maint-chip ${cls}" data-maint="${id}">
      <div class="maint-chip-icon">${icon}</div>
      <div class="maint-chip-label">${label}</div>
      <div class="maint-chip-date">${dateText}</div>
    </button>`;
}

export function renderPlannerHTML(counts, maintenance) {
  const m = maintenance || {};
  return `
    <div class="card-label">Planear Lavagem</div>
    <div class="maint-row">
      ${maintChip('🥁', 'Tambor limpo', m.drum_clean, 30, 'drum_clean')}
      ${maintChip('🪨', 'Anti-calcário', m.descale, 90, 'descale')}
    </div>
    <div class="clothes-grid">
      ${CLOTHES.map(cat => {
        const qty = counts[cat.id] || 0;
        return `
          <div class="clothes-row">
            <span class="clothes-icon">${cat.icon}</span>
            <span class="clothes-label">${cat.label}</span>
            <div class="clothes-counter">
              <button class="counter-btn" data-id="${cat.id}" data-delta="-1">−</button>
              <span class="clothes-count${qty > 0 ? ' nonzero' : ''}" id="count-${cat.id}">${qty}</span>
              <button class="counter-btn" data-id="${cat.id}" data-delta="1">+</button>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="plan-output" id="plan-output">
      ${renderPlanOutput(counts)}
    </div>`;
}

export function bindPlannerEvents(counts, onMaintUpdate) {
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.id;
      const delta = parseInt(btn.dataset.delta, 10);
      counts[id]  = Math.max(0, (counts[id] || 0) + delta);

      const span = document.getElementById('count-' + id);
      if (span) {
        span.textContent = counts[id];
        span.classList.toggle('nonzero', counts[id] > 0);
      }

      const out = document.getElementById('plan-output');
      if (out) out.innerHTML = renderPlanOutput(counts);
    });
  });

  document.querySelectorAll('.maint-chip').forEach(chip => {
    chip.addEventListener('click', () => onMaintUpdate(chip.dataset.maint));
  });
}

export async function fetchMaintenance() {
  try {
    const r = await fetch('/api/maintenance');
    if (r.ok) return await r.json();
    return {};
  } catch {
    return {};
  }
}

export async function postMaintenance(type) {
  try {
    const r = await fetch('/api/maintenance', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type }),
    });
    if (r.ok) {
      const data = await r.json();
      return data[type] || new Date().toISOString().split('T')[0];
    }
    return null;
  } catch {
    return null;
  }
}
