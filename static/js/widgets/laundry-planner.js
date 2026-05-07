import { CLOTHES, CYCLES, MACHINE } from '../data/machine.js';

const HARD_WATER_FACTOR = 1.2; // Corroios ~150 mg/L CaCO3

function detergentML(kg) {
  return Math.min(70, Math.max(20, Math.round(35 * (kg / 4.5) * HARD_WATER_FACTOR)));
}

function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}min`;
}

// ── LOAD PACKING ───────────────────────────────────────────────────────────

function packLoads(items, counts, cycle) {
  const units = items.flatMap(c => Array.from({ length: counts[c.id] }, () => c));
  const loads  = [];
  let current  = null;

  for (const unit of units) {
    const unitEff = unit.kg * unit.bulk;
    if (!current || current.effectiveKg + unitEff > MACHINE.capacity) {
      if (current) loads.push(finalise(current));
      current = { cycle, tally: {}, realKg: 0, effectiveKg: 0, hasDuvet: false };
    }
    if (!current.tally[unit.id]) current.tally[unit.id] = { label: unit.label, qty: 0 };
    current.tally[unit.id].qty++;
    current.realKg     += unit.kg;
    current.effectiveKg += unitEff;
    if (unit.id === 'duvet') current.hasDuvet = true;
  }
  if (current) loads.push(finalise(current));
  return loads;
}

function finalise(load) {
  return {
    cycle:       load.cycle,
    items:       Object.values(load.tally),
    realKg:      Math.round(load.realKg * 100) / 100,
    effectiveKg: Math.round(load.effectiveKg * 100) / 100,
    drumPct:     Math.min(100, (load.effectiveKg / MACHINE.capacity) * 100),
    hasDuvet:    load.hasDuvet,
  };
}

export function computeAllLoads(counts, whiteFlags) {
  const active  = CLOTHES.filter(c => (counts[c.id] || 0) > 0);
  const white   = active.filter(c => whiteFlags[c.id]);
  const colored = active.filter(c => !whiteFlags[c.id]);
  const casaCol = colored.filter(c => c.category === 'casa');
  const ruaCol  = colored.filter(c => c.category === 'rua');

  const groups = [];

  if (white.length > 0) {
    groups.push({
      key:   'white',
      label: 'Brancos',
      icon:  '⚪',
      loads: packLoads(white, counts, CYCLES.cottons60),
    });
  }

  if (casaCol.length > 0 && ruaCol.length === 0) {
    groups.push({ key: 'casa', label: 'Casa + Desporto', icon: '🏠',
      loads: packLoads(casaCol, counts, CYCLES.cottons40) });
  } else if (ruaCol.length > 0 && casaCol.length === 0) {
    groups.push({ key: 'rua', label: 'Roupa de Rua', icon: '👕',
      loads: packLoads(ruaCol, counts, CYCLES.eco30) });
  } else if (casaCol.length > 0 && ruaCol.length > 0) {
    // mixed casa + rua → compromise at 40°, note included in render
    groups.push({ key: 'mixed', label: 'Casa + Rua (misto)', icon: '🔀',
      loads: packLoads([...casaCol, ...ruaCol], counts, CYCLES.cottons40) });
  }

  return { groups, hasWhite: white.length > 0, hasColored: colored.length > 0 };
}

// ── RENDER ─────────────────────────────────────────────────────────────────

function loadCard(load, idx, groupKey) {
  const det      = detergentML(load.realKg);
  const itemList = load.items.map(it => `${it.qty}× ${it.label}`).join(', ');
  const pct      = load.drumPct.toFixed(0);
  const barCls   = load.drumPct > 85 ? 'danger' : load.drumPct > 65 ? 'warn' : 'ok';

  const duvetWarn = load.hasDuvet && load.items.length > 1
    ? `<div class="load-warn">🌨️ Edredão precisa de espaço — considera uma lavagem separada</div>` : '';
  const mixNote = groupKey === 'mixed'
    ? `<div class="load-warn">🔀 Roupa de casa e de rua juntas — ciclo a 40° como compromisso</div>` : '';
  const liqNote = groupKey === 'rua'
    ? `<span class="det-note">Usa detergente líquido — dissolve melhor a 30°</span>` : '';

  return `
    <div class="load-card">
      <div class="load-header">
        <span class="load-num">Lavagem ${idx + 1}</span>
        <span class="load-cycle">${load.cycle.label}</span>
      </div>
      <div class="drum-bar-wrap">
        <div class="drum-bar-track">
          <div class="drum-bar-fill ${barCls}" style="width:${pct}%"></div>
        </div>
        <span class="drum-bar-text">${pct}% tambor · ${load.realKg.toFixed(2)} kg</span>
      </div>
      <div class="load-meta">
        <span class="load-chip">⏱ ${fmtDuration(load.cycle.duration)}</span>
        <span class="load-chip">💨 ${load.cycle.rpm} rpm</span>
      </div>
      <div class="load-items">${itemList}</div>
      ${duvetWarn}${mixNote}
      <div class="load-detergent">
        <span class="det-label">🧴 Detergente líquido</span>
        <span class="det-value">${det} mL</span>
        <span class="det-label">💧 Amaciador</span>
        <span class="det-value">25 mL</span>
        <span class="det-label">⚗️ Anti-calcário</span>
        <span class="det-value">1 past. Calgon</span>
      </div>
      ${liqNote}
    </div>`;
}

export function renderPlanOutput(counts, whiteFlags) {
  const hasAny = CLOTHES.some(c => (counts[c.id] || 0) > 0);
  if (!hasAny) return `<div class="plan-empty">Seleciona a roupa acima · toca em ○ para marcar peças brancas</div>`;

  const { groups, hasWhite, hasColored } = computeAllLoads(counts, whiteFlags);

  const mixAlert = hasWhite && hasColored
    ? `<div class="mix-alert">⚪ Brancos separados dos coloridos automaticamente. Se quiseres juntar, usa uma folha <strong>Colour Catcher</strong> (ex. Dr. Beckmann) e lava a 40°.</div>`
    : '';

  let loadIdx = 0;
  const cards = groups.map(g => {
    const header = `<div class="group-header">${g.icon} ${g.label}</div>`;
    const inner  = g.loads.map(l => loadCard(l, loadIdx++, g.key)).join('');
    return header + inner;
  }).join('');

  return mixAlert + cards;
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

export function renderPlannerHTML(counts, whiteFlags, maintenance) {
  const m = maintenance || {};
  return `
    <div class="card-label">Planear Lavagem</div>
    <div class="maint-row">
      ${maintChip('🥁', 'Tambor limpo', m.drum_clean, 30, 'drum_clean')}
      ${maintChip('🪨', 'Anti-calcário', m.descale, 90, 'descale')}
    </div>
    <div class="clothes-grid">
      ${CLOTHES.map(cat => {
        const qty     = counts[cat.id] || 0;
        const isWhite = !!whiteFlags[cat.id];
        return `
          <div class="clothes-row">
            <button class="white-btn${isWhite ? ' active' : ''}" data-id="${cat.id}" title="Marcar como branco"></button>
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
      ${renderPlanOutput(counts, whiteFlags)}
    </div>
    <button class="reset-btn" id="reset-btn">🔄 Nova lavagem</button>`;
}

export function bindPlannerEvents(counts, whiteFlags, onMaintUpdate, onReset) {
  document.querySelectorAll('.white-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      whiteFlags[id] = !whiteFlags[id];
      btn.classList.toggle('active', !!whiteFlags[id]);
      const out = document.getElementById('plan-output');
      if (out) out.innerHTML = renderPlanOutput(counts, whiteFlags);
    });
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
      if (out) out.innerHTML = renderPlanOutput(counts, whiteFlags);
    });
  });

  document.querySelectorAll('.maint-chip').forEach(chip => {
    chip.addEventListener('click', () => onMaintUpdate(chip.dataset.maint));
  });

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', onReset);
}

export async function fetchMaintenance() {
  try {
    const r = await fetch('/api/maintenance');
    if (r.ok) return await r.json();
    return {};
  } catch { return {}; }
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
  } catch { return null; }
}
