import { CLOTHES, CYCLES, PROFILES, MACHINE } from '../data/machine.js';

const HARD_WATER_FACTOR = 1.2; // Corroios ~150 mg/L CaCO3

function detergentML(kg) {
  return Math.min(70, Math.max(20, Math.round(35 * (kg / 4.5) * HARD_WATER_FACTOR)));
}

function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}min`;
}

function visibleClothes(profile) {
  return CLOTHES.filter(c => c.profile === profile || profile === 'brancos');
}

function totalKgOf(counts, profile) {
  return visibleClothes(profile).reduce((sum, c) => sum + (counts[c.id] || 0) * c.kg, 0);
}

export function computeLoads(counts, profile) {
  const cycle = CYCLES[PROFILES[profile].cycle];
  const items = visibleClothes(profile).filter(c => (counts[c.id] || 0) > 0);

  // flatten to individual units, greedy-pack into loads
  const units = items.flatMap(c => Array.from({ length: counts[c.id] }, () => c));

  const loads = [];
  let current = null;

  for (const unit of units) {
    if (!current || current.totalKg + unit.kg > cycle.maxKg) {
      if (current) loads.push(finalise(current));
      current = { cycle, tally: {}, totalKg: 0, hasDuvet: false };
    }
    if (!current.tally[unit.id]) current.tally[unit.id] = { label: unit.label, qty: 0 };
    current.tally[unit.id].qty++;
    current.totalKg += unit.kg;
    if (unit.id === 'duvet') current.hasDuvet = true;
  }
  if (current) loads.push(finalise(current));

  return loads;
}

function finalise(load) {
  return {
    cycle:     load.cycle,
    items:     Object.values(load.tally),
    totalKg:   Math.round(load.totalKg * 100) / 100,
    overloaded: load.totalKg > MACHINE.capacity * 0.9,
    hasDuvet:  load.hasDuvet,
  };
}

export function renderPlanOutput(counts, profile) {
  const cycle    = CYCLES[PROFILES[profile].cycle];
  const totalKg  = totalKgOf(counts, profile);
  const roundKg  = Math.round(totalKg * 100) / 100;
  const pct      = Math.min(100, (totalKg / cycle.maxKg) * 100);
  const barCls   = pct > 90 ? 'danger' : pct > 70 ? 'warn' : 'ok';
  const hasItems = visibleClothes(profile).some(c => (counts[c.id] || 0) > 0);

  const weightBar = `
    <div class="weight-bar-wrap">
      <div class="weight-bar-track">
        <div class="weight-bar-fill ${barCls}" style="width:${pct.toFixed(1)}%"></div>
      </div>
      <span class="weight-bar-text">⚖️ ${roundKg.toFixed(2)} / ${cycle.maxKg} kg</span>
    </div>`;

  if (!hasItems) {
    return weightBar + `<div class="plan-empty">Seleciona a roupa acima para planear as lavagens</div>`;
  }

  const loads  = computeLoads(counts, profile);
  const liquid = profile === 'rua'
    ? '<span class="det-note">Usa detergente líquido — dissolve melhor a 30°</span>'
    : '';

  const cards = loads.map((load, i) => {
    const det      = detergentML(load.totalKg);
    const itemList = load.items.map(it => `${it.qty}× ${it.label}`).join(', ');
    const duvetWarn = load.hasDuvet && load.items.length > 1
      ? `<div class="load-warn">🌨️ O edredão precisa de espaço — considera uma lavagem separada</div>`
      : '';
    const overWarn = load.overloaded
      ? `<div class="load-warn">⚠️ Máquina quase cheia — não compactes demasiado</div>`
      : '';

    return `
      <div class="load-card">
        <div class="load-header">
          <span class="load-num">Lavagem ${i + 1}</span>
          <span class="load-cycle">${load.cycle.label}</span>
        </div>
        <div class="load-meta">
          <span class="load-chip">⚖️ ${load.totalKg.toFixed(2)} kg</span>
          <span class="load-chip">⏱ ${fmtDuration(load.cycle.duration)}</span>
          <span class="load-chip">💨 ${load.cycle.rpm} rpm</span>
        </div>
        <div class="load-items">${itemList}</div>
        ${duvetWarn}${overWarn}
        <div class="load-detergent">
          <span class="det-label">🧴 Detergente líquido</span>
          <span class="det-value">${det} mL</span>
          <span class="det-label">💧 Amaciador</span>
          <span class="det-value">25 mL</span>
          <span class="det-label">⚗️ Anti-calcário</span>
          <span class="det-value">1 past. Calgon</span>
        </div>
        ${liquid}
      </div>`;
  }).join('');

  return weightBar + cards;
}

function maintDaysAgo(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function maintChip(icon, label, dateStr, limitDays, id) {
  const days     = maintDaysAgo(dateStr);
  const overdue  = days === null || days >= limitDays;
  const cls      = overdue ? 'overdue' : 'ok';
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

export function renderPlannerHTML(counts, profile, maintenance) {
  const m = maintenance || {};
  return `
    <div class="card-label">Planear Lavagem</div>
    <div class="maint-row">
      ${maintChip('🥁', 'Tambor limpo', m.drum_clean, 30, 'drum_clean')}
      ${maintChip('🪨', 'Anti-calcário', m.descale, 90, 'descale')}
    </div>
    <div class="profile-bar">
      ${Object.entries(PROFILES).map(([key, p]) => `
        <button class="profile-btn${profile === key ? ' active' : ''}" data-profile="${key}">
          ${p.icon} ${p.label}
        </button>`).join('')}
    </div>
    <div class="clothes-grid">
      ${visibleClothes(profile).map(cat => {
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
    <div id="plan-output">
      ${renderPlanOutput(counts, profile)}
    </div>`;
}

export function bindPlannerEvents(counts, profile, onProfileChange, onMaintUpdate) {
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', () => onProfileChange(btn.dataset.profile));
  });

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
      if (out) out.innerHTML = renderPlanOutput(counts, profile);
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
