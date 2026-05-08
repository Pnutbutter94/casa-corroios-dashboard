// Refeições widget — planner, inventory, recipes

const DAYS_PT  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MEAL_TYPES = [
  { id: 'recipe',    label: '🍳 Receita' },
  { id: 'readyMeal', label: '📦 Pré-feito' },
  { id: 'external',  label: '🍽️ Fora' },
  { id: 'empty',     label: '⬜ Em branco' },
];
const LOCATIONS = ['frigorifico', 'congelador', 'despensa'];
const LOC_LABELS = { frigorifico: '🧊 Frigorífico', congelador: '❄️ Congelador', despensa: '🗄️ Despensa' };

export const refeic = {
  data: { products: [], recipes: [], inventory: [], planner: {} },
  state: {
    activeTab: 'plano',
    invLocation: 'frigorifico',
    invSearch: '',
    modalOpen: false,
    editDay: null,   // 'YYYY-MM-DD'
    editMeal: null,  // 'lunch' | 'dinner'
    editType: null,
    editRecipe: null,
    editNote: '',
    recipeDetail: null,
  },
};

// ── DATA LOADING ──────────────────────────────────────────────────────────────

export async function initRefeicoes() {
  const [products, recipes, inventory, planner] = await Promise.all([
    fetch('/api/products').then(r => r.ok ? r.json() : []),
    fetch('/api/recipes').then(r => r.ok ? r.json() : []),
    fetch('/api/inventory').then(r => r.ok ? r.json() : []),
    fetch('/api/planner').then(r => r.ok ? r.json() : {}),
  ]);
  refeic.data.products  = products;
  refeic.data.recipes   = recipes;
  refeic.data.inventory = inventory;
  refeic.data.planner   = planner;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

function weekDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

function matchScore(recipe) {
  const inv = refeic.data.inventory;
  const required = recipe.ingredients.filter(i => !i.optional);
  if (required.length === 0) return 100;
  const have = required.filter(ing =>
    inv.some(it => it.productId === ing.productId)
  ).length;
  return Math.round((have / required.length) * 100);
}

function matchClass(score) {
  return score >= 80 ? 'good' : score >= 50 ? 'warn' : 'low';
}

function productName(pid) {
  const p = refeic.data.products.find(x => x.id === pid);
  return p ? p.name : pid;
}

function hasInInventory(pid) {
  return refeic.data.inventory.some(it => it.productId === pid);
}

// ── RENDER: PLANO ─────────────────────────────────────────────────────────────

function mealLabel(day, slot) {
  const entry = refeic.data.planner[dateStr(day)];
  const meal  = entry && entry[slot];
  if (!meal || meal.type === 'empty') return `<span class="meal-slot-content empty">—</span>`;
  if (meal.type === 'external')  return `<span class="meal-slot-content">🍽️ Fora</span>`;
  if (meal.type === 'readyMeal') return `<span class="meal-slot-content">📦 ${meal.note || 'Pré-feito'}</span>`;
  if (meal.type === 'recipe' && meal.recipeId) {
    const r = refeic.data.recipes.find(x => x.id === meal.recipeId);
    return `<span class="meal-slot-content">${r ? r.name : meal.recipeId}</span>`;
  }
  if (meal.note) return `<span class="meal-slot-content">${meal.note}</span>`;
  return `<span class="meal-slot-content empty">—</span>`;
}

function renderPlano() {
  const days = weekDays();
  const todayStr = dateStr(days[0]);

  const rows = days.map(d => {
    const ds = dateStr(d);
    const isToday = ds === todayStr;
    const entry = refeic.data.planner[ds] || {};
    const away  = entry.atHome === false;
    return `
      <div class="day-row${isToday ? ' today' : ''}">
        <div class="day-header">
          <span class="day-name${isToday ? ' today-label' : ''}">${DAYS_FULL[d.getDay()]}</span>
          <span class="day-date">${d.getDate()}/${d.getMonth()+1}</span>
          ${away ? '<span class="day-away-badge">Fora de casa</span>' : ''}
        </div>
        <div class="meals-row">
          <div class="meal-slot" data-day="${ds}" data-meal="lunch">
            <div class="meal-slot-type">Almoço</div>
            ${mealLabel(d, 'lunch')}
          </div>
          <div class="meal-slot" data-day="${ds}" data-meal="dinner">
            <div class="meal-slot-type">Jantar</div>
            ${mealLabel(d, 'dinner')}
          </div>
        </div>
      </div>`;
  }).join('');

  return `<div class="week-grid">${rows}</div>`;
}

// ── RENDER: INVENTÁRIO ────────────────────────────────────────────────────────

function renderInventario() {
  const { invLocation, invSearch } = refeic.state;
  const inv = refeic.data.inventory.filter(it => it.location === invLocation);

  const locBtns = LOCATIONS.map(loc => `
    <button class="inv-loc-btn${invLocation === loc ? ' active' : ''}" data-loc="${loc}">
      ${LOC_LABELS[loc]}
    </button>`).join('');

  let items = inv;
  if (invSearch) {
    const q = invSearch.toLowerCase();
    items = inv.filter(it => it.name.toLowerCase().includes(q));
  }

  const list = items.length === 0
    ? `<div class="inv-empty">Nada aqui ainda</div>`
    : items.map(it => `
      <div class="inv-item" data-inv-id="${it.id}">
        <span class="inv-item-name">${it.name}</span>
        ${it.quantityKnown ? `<span class="inv-item-qty">${it.quantity} ${it.unit || ''}</span>` : ''}
        <button class="inv-item-del" data-del-inv="${it.id}">×</button>
      </div>`).join('');

  return `
    <div class="inv-add-bar">
      <div class="inv-search-wrap">
        <input class="inv-search" id="inv-search-input" type="text" placeholder="Procurar produto…" value="${invSearch}" autocomplete="off">
        <div class="inv-suggestions" id="inv-suggestions" style="display:none"></div>
      </div>
      <button class="inv-add-btn" id="inv-add-btn">+ Adicionar</button>
    </div>
    <div class="inv-location-tabs">${locBtns}</div>
    <div class="inv-list">${list}</div>`;
}

// ── RENDER: RECEITAS ──────────────────────────────────────────────────────────

function renderReceitas() {
  const sorted = [...refeic.data.recipes].sort((a, b) => matchScore(b) - matchScore(a));
  const cards = sorted.map(r => {
    const score = matchScore(r);
    const cls   = matchClass(score);
    return `
      <div class="recipe-card" data-recipe="${r.id}">
        <div class="recipe-card-header">
          <span class="recipe-card-name">${r.name}</span>
          <span class="recipe-card-match ${cls}">${score}%</span>
        </div>
        <div class="recipe-card-meta">
          <span class="recipe-card-chip">⏱ ${r.prepTime + r.cookTime} min</span>
          <span class="recipe-card-chip">👥 ${r.servings}</span>
          ${r.tags.slice(0,2).map(t => `<span class="recipe-card-chip">${t}</span>`).join('')}
        </div>
      </div>`;
  }).join('');
  return `<div class="recipes-grid">${cards}</div>`;
}

// ── RECIPE DETAIL MODAL ───────────────────────────────────────────────────────

function renderRecipeDetail(r) {
  const ings = r.ingredients.map(ing => {
    const have = hasInInventory(ing.productId);
    return `
      <div class="recipe-ing-row">
        <span class="recipe-ing-qty">${ing.qty} ${ing.unit}</span>
        <span>${productName(ing.productId)}${ing.optional ? ' <span style="opacity:.5">(opcional)</span>' : ''}</span>
        <span class="recipe-ing-check">${have ? '✅' : '⬜'}</span>
      </div>`;
  }).join('');

  const steps = r.steps.map((s, i) => `
    <div class="recipe-step">
      <span class="recipe-step-num">${i+1}.</span>
      <span>${s}</span>
    </div>`).join('');

  return `
    <div class="ref-modal-backdrop" id="recipe-detail-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">${r.name}</div>
        <div class="ref-section-label">Ingredientes</div>
        <div class="recipe-detail-ing">${ings}</div>
        <div class="ref-section-label">Preparação</div>
        <div class="recipe-steps">${steps}</div>
        <div class="ref-modal-actions">
          <button class="ref-btn ref-btn-secondary" id="recipe-detail-close">Fechar</button>
        </div>
      </div>
    </div>`;
}

// ── MEAL PICKER MODAL ─────────────────────────────────────────────────────────

function renderMealModal() {
  const { editDay, editMeal, editType, editRecipe, editNote } = refeic.state;
  const mealLabel = editMeal === 'lunch' ? 'Almoço' : 'Jantar';
  const d = new Date(editDay + 'T12:00:00');
  const title = `${mealLabel} · ${DAYS_FULL[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`;

  const typeBtns = MEAL_TYPES.map(t => `
    <button class="meal-type-btn${editType === t.id ? ' selected' : ''}" data-meal-type="${t.id}">
      ${t.label}
    </button>`).join('');

  const sorted = [...refeic.data.recipes].sort((a, b) => matchScore(b) - matchScore(a));
  const recipeRows = editType === 'recipe' ? `
    <div class="ref-section-label">Receita</div>
    <div class="recipe-list">
      ${sorted.map(r => {
        const score = matchScore(r);
        const cls   = matchClass(score);
        return `
          <div class="recipe-pick-row${editRecipe === r.id ? ' selected' : ''}" data-pick-recipe="${r.id}">
            <span class="recipe-pick-name">${r.name}</span>
            <span class="recipe-pick-meta">${r.prepTime + r.cookTime}min</span>
            <span class="recipe-pick-match ${cls}">${score}%</span>
          </div>`;
      }).join('')}
    </div>` : '';

  const noteField = editType && editType !== 'empty' ? `
    <div class="ref-section-label">Nota (opcional)</div>
    <textarea class="ref-modal-note" id="meal-note" rows="2" placeholder="ex. com arroz branco…">${editNote}</textarea>` : '';

  const existing = refeic.data.planner[editDay]?.[editMeal];
  const clearBtn = existing && existing.type !== 'empty' ? `
    <button class="ref-btn ref-btn-danger" id="meal-clear-btn">Limpar</button>` : '';

  return `
    <div class="ref-modal-backdrop" id="meal-modal-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">${title}</div>
        <div class="meal-type-grid">${typeBtns}</div>
        ${recipeRows}
        ${noteField}
        <div class="ref-modal-actions">
          <button class="ref-btn ref-btn-secondary" id="meal-cancel-btn">Cancelar</button>
          ${clearBtn}
          <button class="ref-btn ref-btn-primary" id="meal-save-btn">Guardar</button>
        </div>
      </div>
    </div>`;
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────

export function renderRefeicoes() {
  const { activeTab } = refeic.state;

  const tabBtns = [
    { id: 'plano',       label: '📅 Plano' },
    { id: 'inventario',  label: '🛒 Inventário' },
    { id: 'receitas',    label: '🍳 Receitas' },
  ].map(t => `
    <button class="ref-tab-btn${activeTab === t.id ? ' active' : ''}" data-ref-tab="${t.id}">
      ${t.label}
    </button>`).join('');

  let pageContent = '';
  if (activeTab === 'plano')      pageContent = renderPlano();
  if (activeTab === 'inventario') pageContent = renderInventario();
  if (activeTab === 'receitas')   pageContent = renderReceitas();

  let modal = '';
  if (refeic.state.modalOpen === 'meal')   modal = renderMealModal();
  if (refeic.state.recipeDetail)           modal = renderRecipeDetail(refeic.state.recipeDetail);

  return `
    <div class="card-label">Refeições</div>
    <div class="ref-tab-bar">${tabBtns}</div>
    <div class="ref-tab-page active">${pageContent}</div>
    ${modal}`;
}

// ── EVENTS ────────────────────────────────────────────────────────────────────

export function bindRefeicoes(container, onRefresh) {

  // sub-tab switch
  container.querySelectorAll('.ref-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      refeic.state.activeTab = btn.dataset.refTab;
      onRefresh();
    });
  });

  // planner: open meal modal
  container.querySelectorAll('.meal-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const { day, meal } = slot.dataset;
      const existing = refeic.data.planner[day]?.[meal];
      refeic.state.editDay    = day;
      refeic.state.editMeal   = meal;
      refeic.state.editType   = existing?.type || null;
      refeic.state.editRecipe = existing?.recipeId || null;
      refeic.state.editNote   = existing?.note || '';
      refeic.state.modalOpen  = 'meal';
      onRefresh();
    });
  });

  // meal type buttons
  container.querySelectorAll('.meal-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      refeic.state.editType = btn.dataset.mealType;
      if (refeic.state.editType !== 'recipe') refeic.state.editRecipe = null;
      onRefresh();
    });
  });

  // recipe pick
  container.querySelectorAll('.recipe-pick-row').forEach(row => {
    row.addEventListener('click', () => {
      refeic.state.editRecipe = row.dataset.pickRecipe;
      onRefresh();
    });
  });

  // meal note
  const noteEl = container.querySelector('#meal-note');
  if (noteEl) noteEl.addEventListener('input', e => { refeic.state.editNote = e.target.value; });

  // save meal
  const saveBtn = container.querySelector('#meal-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const { editDay, editMeal, editType, editRecipe, editNote } = refeic.state;
    if (!editType || editType === 'empty') {
      await _saveMeal(editDay, editMeal, { type: 'empty' });
    } else {
      await _saveMeal(editDay, editMeal, { type: editType, recipeId: editRecipe || undefined, note: editNote || undefined });
    }
    refeic.state.modalOpen = false;
    onRefresh();
  });

  // clear meal
  const clearBtn = container.querySelector('#meal-clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', async () => {
    await _saveMeal(refeic.state.editDay, refeic.state.editMeal, { type: 'empty' });
    refeic.state.modalOpen = false;
    onRefresh();
  });

  // cancel modal
  const cancelBtn = container.querySelector('#meal-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => {
    refeic.state.modalOpen = false;
    onRefresh();
  });

  // backdrop close
  const backdrop = container.querySelector('#meal-modal-backdrop');
  if (backdrop) backdrop.addEventListener('click', e => {
    if (e.target === backdrop) { refeic.state.modalOpen = false; onRefresh(); }
  });

  // inventory: location tabs
  container.querySelectorAll('.inv-loc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      refeic.state.invLocation = btn.dataset.loc;
      onRefresh();
    });
  });

  // inventory: search input
  const searchInput = container.querySelector('#inv-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      refeic.state.invSearch = e.target.value;
      _updateSuggestions(container);
    });
    searchInput.addEventListener('focus', () => _updateSuggestions(container));
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        const sug = container.querySelector('#inv-suggestions');
        if (sug) sug.style.display = 'none';
      }, 200);
    });
  }

  // inventory: delete
  container.querySelectorAll('[data-del-inv]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delInv;
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      refeic.data.inventory = refeic.data.inventory.filter(it => it.id !== id);
      onRefresh();
    });
  });

  // inventory: add button
  const addBtn = container.querySelector('#inv-add-btn');
  if (addBtn) addBtn.addEventListener('click', () => _addFromSearch(container, onRefresh));

  // recipes: open detail
  container.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const r = refeic.data.recipes.find(x => x.id === card.dataset.recipe);
      if (r) { refeic.state.recipeDetail = r; onRefresh(); }
    });
  });

  // recipe detail close
  const recipeClose = container.querySelector('#recipe-detail-close');
  if (recipeClose) recipeClose.addEventListener('click', () => {
    refeic.state.recipeDetail = null;
    onRefresh();
  });

  const recipeBackdrop = container.querySelector('#recipe-detail-backdrop');
  if (recipeBackdrop) recipeBackdrop.addEventListener('click', e => {
    if (e.target === recipeBackdrop) { refeic.state.recipeDetail = null; onRefresh(); }
  });
}

// ── INTERNAL HELPERS ──────────────────────────────────────────────────────────

async function _saveMeal(day, slot, meal) {
  const existing = refeic.data.planner[day] || {};
  const updated  = { ...existing, [slot]: meal };
  const r = await fetch(`/api/planner/${day}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
  if (r.ok) refeic.data.planner[day] = updated;
}

function _updateSuggestions(container) {
  const input = container.querySelector('#inv-search-input');
  const sug   = container.querySelector('#inv-suggestions');
  if (!input || !sug) return;
  const q = input.value.toLowerCase().trim();
  if (!q) { sug.style.display = 'none'; return; }
  const matches = refeic.data.products
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 8);
  if (matches.length === 0) { sug.style.display = 'none'; return; }
  sug.innerHTML = matches.map(p =>
    `<div class="inv-suggestion" data-pid="${p.id}" data-pname="${p.name}">${p.name}</div>`
  ).join('');
  sug.style.display = 'block';
  sug.querySelectorAll('.inv-suggestion').forEach(row => {
    row.addEventListener('mousedown', () => {
      input.value = row.dataset.pname;
      refeic.state.invSearch = row.dataset.pname;
      sug.style.display = 'none';
    });
  });
}

async function _addFromSearch(container, onRefresh) {
  const input = container.querySelector('#inv-search-input');
  if (!input || !input.value.trim()) return;
  const q = input.value.trim().toLowerCase();
  const product = refeic.data.products.find(p => p.name.toLowerCase() === q)
               || refeic.data.products.find(p => p.name.toLowerCase().includes(q));

  const item = {
    productId:     product ? product.id : null,
    name:          product ? product.name : input.value.trim(),
    location:      refeic.state.invLocation,
    quantity:      product ? product.defaultQty : null,
    unit:          product ? product.unit : null,
    quantityKnown: false,
  };

  const r = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (r.ok) {
    const saved = await r.json();
    refeic.data.inventory.push(saved);
    refeic.state.invSearch = '';
    input.value = '';
  }
  onRefresh();
}
