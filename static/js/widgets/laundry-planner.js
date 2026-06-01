import { CLOTHES, CYCLES, MACHINE } from '../data/machine.js';

// Dosing: label-based estimates for Corroios water (~150 mg/L, zone B/medium).
// These are starting points — real dose depends on brand and soil level.
function detergentML(kg) {
  // ~35 mL base for any load + 6 mL per kg
  return Math.round(Math.min(100, 35 + 6 * kg));
}

function softenerML(kg) {
  // ~25 mL base + 4 mL per kg
  return Math.round(Math.min(65, 25 + 4 * kg));
}

function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}min`;
}

// ── COUNT DISPLAY ──────────────────────────────────────────────────────────

function countHTML(cQty, wQty) {
  if (cQty === 0 && wQty === 0) return `<span class="cnt-zero">0</span>`;
  const parts = [];
  if (cQty > 0) parts.push(`<span class="cnt-c">${cQty}</span>`);
  if (wQty > 0) parts.push(`<span class="cnt-w">⚪${wQty}</span>`);
  return parts.join('');
}

// ── LOAD PACKING ───────────────────────────────────────────────────────────

function packLoads(items, counts, cycle) {
  const units = items.flatMap(c => Array.from({ length: counts[c.id] || 0 }, () => c));
  const loads = [];
  let current = null;

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

export function computeAllLoads(coloredCounts, whiteCounts) {
  const activeWhite   = CLOTHES.filter(c => (whiteCounts[c.id]   || 0) > 0);
  const activeColored = CLOTHES.filter(c => (coloredCounts[c.id] || 0) > 0);
  const casaCol = activeColored.filter(c => c.category === 'casa');
  const ruaCol  = activeColored.filter(c => c.category === 'rua');

  const groups = [];

  if (activeWhite.length > 0) {
    groups.push({ key: 'white', label: 'Brancos', icon: '⚪',
      loads: packLoads(activeWhite, whiteCounts, CYCLES.cottons60) });
  }

  if (casaCol.length > 0 && ruaCol.length === 0) {
    groups.push({ key: 'casa', label: 'Casa + Desporto', icon: '🏠',
      loads: packLoads(casaCol, coloredCounts, CYCLES.cottons40) });
  } else if (ruaCol.length > 0 && casaCol.length === 0) {
    groups.push({ key: 'rua', label: 'Roupa de Rua', icon: '👕',
      loads: packLoads(ruaCol, coloredCounts, CYCLES.eco30) });
  } else if (casaCol.length > 0 && ruaCol.length > 0) {
    groups.push({ key: 'mixed', label: 'Casa + Rua (misto)', icon: '🔀',
      loads: packLoads([...casaCol, ...ruaCol], coloredCounts, CYCLES.cottons40) });
  }

  return { groups, hasWhite: activeWhite.length > 0, hasColored: activeColored.length > 0 };
}

// ── RENDER ─────────────────────────────────────────────────────────────────

function loadCard(load, idx, groupKey) {
  const det  = detergentML(load.realKg);
  const soft = softenerML(load.realKg);
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
        <span class="det-value">${soft} mL</span>
        <span class="det-label">🌸 Perfumador</span>
        <span class="det-value">20 mL</span>
        <span class="det-label">⚗️ Anti-calcário</span>
        <span class="det-value">1 past. Calgon</span>
      </div>
      <span class="det-note">⚠️ Experimental — ajusta conforme o rótulo da tua marca</span>
      ${liqNote}
    </div>`;
}

export function renderPlanOutput(coloredCounts, whiteCounts) {
  const hasAny = CLOTHES.some(c => (coloredCounts[c.id] || 0) + (whiteCounts[c.id] || 0) > 0);
  if (!hasAny) {
    return `<div class="plan-empty">Seleciona a roupa acima · usa o modo ⚪ para peças brancas</div>`;
  }

  const { groups, hasWhite, hasColored } = computeAllLoads(coloredCounts, whiteCounts);

  const mixAlert = hasWhite && hasColored
    ? `<div class="mix-alert">⚪ Brancos e coloridos separados automaticamente. Se quiseres juntar, usa uma folha <strong>Colour Catcher</strong> (ex. Dr. Beckmann) e lava a 40°.</div>`
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

export function renderPlannerHTML(coloredCounts, whiteCounts, plannerMode, maintenance) {
  const m = maintenance || {};
  return `
    <div class="card-label">Planear Lavagem</div>
    <div class="maint-row">
      ${maintChip('🥁', 'Tambor limpo', m.drum_clean, 30, 'drum_clean')}
      ${maintChip('🪨', 'Anti-calcário', m.descale, 90, 'descale')}
    </div>
    <div class="mode-bar">
      <button class="mode-btn${!plannerMode.white ? ' active' : ''}" data-mode="color">🌈 Cores</button>
      <button class="mode-btn${plannerMode.white ? ' active' : ''}" data-mode="white">⚪ Brancos</button>
    </div>
    <div class="clothes-grid">
      ${CLOTHES.map(cat => {
        const cQty = coloredCounts[cat.id] || 0;
        const wQty = whiteCounts[cat.id]   || 0;
        return `
          <div class="clothes-row">
            <span class="clothes-icon">${cat.icon}</span>
            <span class="clothes-label">${cat.label}</span>
            <div class="clothes-counter">
              <button class="counter-btn" data-id="${cat.id}" data-delta="-1">−</button>
              <div class="count-display" id="count-${cat.id}">${countHTML(cQty, wQty)}</div>
              <button class="counter-btn" data-id="${cat.id}" data-delta="1">+</button>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div id="plan-output">
      ${renderPlanOutput(coloredCounts, whiteCounts)}
    </div>
    <button class="reset-btn" id="reset-btn">🔄 Nova lavagem</button>`;
}

export function bindPlannerEvents(coloredCounts, whiteCounts, plannerMode, onMaintUpdate, onReset) {
  // mode toggle — updates plannerMode.white in-place (object ref persists)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      plannerMode.white = btn.dataset.mode === 'white';
      document.querySelectorAll('.mode-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.mode === (plannerMode.white ? 'white' : 'color'))
      );
    });
  });

  // +/− buttons — write to whiteCount or coloredCount based on current mode
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = btn.dataset.id;
      const delta  = parseInt(btn.dataset.delta, 10);
      const target = plannerMode.white ? whiteCounts : coloredCounts;
      target[id]   = Math.max(0, (target[id] || 0) + delta);

      const display = document.getElementById('count-' + id);
      if (display) display.innerHTML = countHTML(coloredCounts[id] || 0, whiteCounts[id] || 0);

      const out = document.getElementById('plan-output');
      if (out) out.innerHTML = renderPlanOutput(coloredCounts, whiteCounts);
    });
  });

  document.querySelectorAll('.maint-chip').forEach(chip => {
    chip.addEventListener('click', () => onMaintUpdate(chip.dataset.maint));
  });

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (!resetBtn.dataset.confirmPending) {
      resetBtn.dataset.confirmPending = '1';
      resetBtn.textContent = 'Confirmar reset?';
      setTimeout(() => {
        if (resetBtn.dataset.confirmPending) {
          delete resetBtn.dataset.confirmPending;
          resetBtn.textContent = '🔄 Nova lavagem';
        }
      }, 4000);
      return;
    }
    delete resetBtn.dataset.confirmPending;
    resetBtn.textContent = '🔄 Nova lavagem';
    onReset();
  });
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
