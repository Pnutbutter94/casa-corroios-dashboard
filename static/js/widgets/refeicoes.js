// Refeições widget — planner, inventory, recipes

const DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MEAL_TYPES = [
  { id: 'recipe',    label: '🍳 Receita' },
  { id: 'readyMeal', label: '📦 Pré-feito' },
  { id: 'external',  label: '🍽️ Fora' },
  { id: 'empty',     label: '⬜ Em branco' },
];
const LOCATIONS   = ['all', 'frigorifico', 'congelador', 'despensa'];
const LOC_LABELS  = { all: '🔍 Tudo', frigorifico: '🧊 Frigorífico', congelador: '❄️ Congelador', despensa: '🗄️ Despensa' };

export const refeic = {
  data:  { products: [], recipes: [], inventory: [], planner: {}, shopping: [] },
  state: { activeTab: 'plano', invLocation: 'all', invSearch: '' },
};

const CAT_LABELS_PT = {
  carne: 'Carnes', peixe: 'Peixe', laticinios: 'Laticínios',
  secos: 'Secos e Grãos', legumes: 'Legumes e Frutas',
  conservas: 'Conservas', congelados: 'Congelados',
  temperos: 'Temperos', padaria: 'Padaria', outro: 'Outros',
};
const CAT_ICONS = {
  carne: '🥩', peixe: '🐟', laticinios: '🥛', secos: '🌾',
  legumes: '🥦', conservas: '🥫', congelados: '❄️',
  temperos: '🧂', padaria: '🍞', outro: '🛒',
};

// modal state lives here — not in refeic.state
let _mealEl    = null;
let _mealState = { day: null, meal: null, type: null, recipe: null, note: '' };
let _addEl       = null;
let _addState    = { name: '', productId: null, quantity: '', unit: 'un', location: 'frigorifico' };
let _editInvEl             = null;
let _editInvState          = { id: null, name: '', quantity: 0, unit: 'un', location: 'frigorifico', productId: null };
let _currentEditInvRefresh = null;

const UNITS = ['un', 'g', 'kg', 'ml', 'L', 'lata', 'pacote', 'caixa'];

function _qtyStep(unit) {
  if (unit === 'g' || unit === 'ml') return 50;
  if (unit === 'kg' || unit === 'L') return 0.1;
  return 1;
}

// ── DATA LOADING ──────────────────────────────────────────────────────────────

export async function initRefeicoes() {
  const [products, recipes, inventory, planner, shopping] = await Promise.all([
    fetch('/api/products').then(r => r.ok ? r.json() : []),
    fetch('/api/recipes').then(r => r.ok ? r.json() : []),
    fetch('/api/inventory').then(r => r.ok ? r.json() : []),
    fetch('/api/planner').then(r => r.ok ? r.json() : {}),
    fetch('/api/shopping').then(r => r.ok ? r.json() : []),
  ]);
  refeic.data.products  = products;
  refeic.data.recipes   = recipes;
  refeic.data.inventory = inventory;
  refeic.data.planner   = planner;
  refeic.data.shopping  = shopping;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function dateStr(d) { return d.toISOString().split('T')[0]; }

function weekDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

// words longer than 4 chars extracted from a name, normalised
function _nameWords(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
    .split(/\s+/).filter(w => w.length > 3);
}

function _invHasIngredient(ing) {
  const inv = refeic.data.inventory;
  // 1. exact productId match
  if (inv.some(it => it.productId === ing.productId)) return true;
  // 2. name-based fallback: significant word overlap with catalogue name
  const catProduct = refeic.data.products.find(p => p.id === ing.productId);
  if (!catProduct) return false;
  const catWords = _nameWords(catProduct.name);
  return inv.some(it => {
    const itemWords = _nameWords(it.name);
    return catWords.some(w => itemWords.includes(w));
  });
}

function matchScore(recipe) {
  const required = recipe.ingredients.filter(i => !i.optional);
  if (required.length === 0) return 100;
  const have = required.filter(ing => _invHasIngredient(ing)).length;
  return Math.round((have / required.length) * 100);
}

function matchClass(score) { return score >= 80 ? 'good' : score >= 50 ? 'warn' : 'low'; }
function productName(pid) { return (refeic.data.products.find(x => x.id === pid) || {}).name || pid; }
function hasInInventory(pid) { return refeic.data.inventory.some(it => it.productId === pid); }

// ── RENDER: PLANO ─────────────────────────────────────────────────────────────

function mealLabel(ds, slot) {
  const meal = refeic.data.planner[ds]?.[slot];
  if (!meal || meal.type === 'empty') return `<span class="meal-slot-content empty">—</span>`;
  if (meal.type === 'external')  return `<span class="meal-slot-content">🍽️ Fora</span>`;
  if (meal.type === 'readyMeal') return `<span class="meal-slot-content">📦 ${meal.note || 'Pré-feito'}</span>`;
  if (meal.type === 'recipe' && meal.recipeId) {
    const r = refeic.data.recipes.find(x => x.id === meal.recipeId);
    return `<span class="meal-slot-content">${r ? r.name : meal.recipeId}</span>`;
  }
  return meal.note ? `<span class="meal-slot-content">${meal.note}</span>` : `<span class="meal-slot-content empty">—</span>`;
}

function renderPlano() {
  const todayStr = dateStr(new Date());
  const rows = weekDays().map(d => {
    const ds      = dateStr(d);
    const isToday = ds === todayStr;
    const away    = refeic.data.planner[ds]?.atHome === false;
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
            ${mealLabel(ds, 'lunch')}
          </div>
          <div class="meal-slot" data-day="${ds}" data-meal="dinner">
            <div class="meal-slot-type">Jantar</div>
            ${mealLabel(ds, 'dinner')}
          </div>
        </div>
      </div>`;
  }).join('');
  return `<div class="week-grid">${rows}</div>`;
}

// ── RENDER: INVENTÁRIO ────────────────────────────────────────────────────────

function renderInventario() {
  const { invLocation } = refeic.state;
  const allItems = refeic.data.inventory;
  const shown    = invLocation === 'all' ? allItems : allItems.filter(it => it.location === invLocation);

  const locBtns = LOCATIONS.map(loc => `
    <button class="inv-loc-btn${invLocation === loc ? ' active' : ''}" data-loc="${loc}">
      ${LOC_LABELS[loc]}
    </button>`).join('');

  const list = shown.length === 0
    ? `<div class="inv-empty">Nada aqui ainda</div>`
    : shown.map(it => `
      <div class="inv-item">
        <div class="inv-item-body" data-edit-inv="${it.id}">
          <span class="inv-item-name">${it.name}</span>
          ${invLocation === 'all' ? `<span class="inv-item-loc">${LOC_LABELS[it.location] || it.location}</span>` : ''}
          <span class="inv-item-qty">${it.quantityKnown ? `${it.quantity} ${it.unit || ''}` : '— sem qtd'}</span>
        </div>
        <button class="inv-item-del" data-del-inv="${it.id}">×</button>
      </div>`).join('');

  return `
    <div class="inv-add-bar">
      <div class="inv-search-wrap">
        <input class="inv-search" id="inv-search-input" type="text"
               placeholder="Escreve e clica Adicionar…" autocomplete="off">
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
    return `
      <div class="recipe-card" data-recipe="${r.id}">
        <div class="recipe-card-header">
          <span class="recipe-card-name">${r.name}</span>
          <span class="recipe-card-match ${matchClass(score)}">${score}%</span>
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

// ── RENDER: LISTA DE COMPRAS ──────────────────────────────────────────────────

function _generateFromPlan() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const seen = new Map();
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return dateStr(d);
  }).forEach(ds => {
    const entry = refeic.data.planner[ds];
    if (!entry) return;
    ['lunch', 'dinner'].forEach(slot => {
      const meal = entry[slot];
      if (!meal || meal.type !== 'recipe' || !meal.recipeId) return;
      const recipe = refeic.data.recipes.find(r => r.id === meal.recipeId);
      if (!recipe) return;
      recipe.ingredients.forEach(ing => {
        if (ing.optional || seen.has(ing.productId)) return;
        if (_invHasIngredient(ing)) return;
        const p = refeic.data.products.find(x => x.id === ing.productId);
        seen.set(ing.productId, {
          productId: ing.productId,
          name:      p ? p.name : ing.productId,
          quantity:  ing.qty,
          unit:      ing.unit,
          category:  p ? p.category : 'outro',
          source:    'recipe',
          checked:   false,
        });
      });
    });
  });
  return Array.from(seen.values());
}

function renderLista() {
  const shop      = refeic.data.shopping;
  const unchecked = shop.filter(i => !i.checked);
  const checked   = shop.filter(i => i.checked);

  const grouped = {};
  unchecked.forEach(item => {
    const cat = item.category || 'outro';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const catOrder = ['carne','peixe','laticinios','secos','legumes',
                    'conservas','congelados','temperos','padaria','outro'];

  let listHTML = '';
  catOrder.forEach(cat => {
    if (!grouped[cat]) return;
    listHTML += `<div class="lista-category">${CAT_ICONS[cat] || '🛒'} ${CAT_LABELS_PT[cat] || cat}</div>`;
    listHTML += grouped[cat].map(item => `
      <div class="lista-item">
        <button class="lista-check" data-check-id="${item.id}">⬜</button>
        <span class="lista-item-name">${item.name}</span>
        ${item.quantity ? `<span class="lista-item-qty">${item.quantity} ${item.unit || ''}</span>` : ''}
        <button class="lista-del" data-del-shop="${item.id}">×</button>
      </div>`).join('');
  });

  const checkedHTML = checked.length === 0 ? '' : `
    <div class="lista-done-section">
      <div class="lista-category lista-category-done">✅ No carrinho (${checked.length})</div>
      ${checked.map(item => `
        <div class="lista-item lista-item-done">
          <button class="lista-check" data-check-id="${item.id}">✅</button>
          <span class="lista-item-name">${item.name}</span>
          ${item.quantity ? `<span class="lista-item-qty">${item.quantity} ${item.unit || ''}</span>` : ''}
          <button class="lista-del" data-del-shop="${item.id}">×</button>
        </div>`).join('')}
      <button class="ref-btn ref-btn-danger lista-clear-btn" id="lista-clear-done">
        🗑️ Limpar concluídos (${checked.length})
      </button>
    </div>`;

  const emptyMsg = shop.length === 0
    ? `<div class="inv-empty">Lista vazia · gera a partir do plano da semana ou adiciona manualmente</div>` : '';

  return `
    <div class="lista-toolbar">
      <button class="lista-gen-btn" id="lista-generate">🔄 Gerar da semana</button>
      <button class="lista-add-btn" id="lista-add">+ Adicionar</button>
    </div>
    ${emptyMsg}
    <div class="lista-items">${listHTML}</div>
    ${checkedHTML}`;
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────

export function renderRefeicoes() {
  const { activeTab } = refeic.state;
  const tabBtns = [
    { id: 'plano',      label: '📅 Plano' },
    { id: 'inventario', label: '📦 Inventário' },
    { id: 'receitas',   label: '🍳 Receitas' },
    { id: 'lista',      label: '🛒 Lista' },
  ].map(t => `
    <button class="ref-tab-btn${activeTab === t.id ? ' active' : ''}" data-ref-tab="${t.id}">
      ${t.label}
    </button>`).join('');

  let pageContent = '';
  if (activeTab === 'plano')      pageContent = renderPlano();
  if (activeTab === 'inventario') pageContent = renderInventario();
  if (activeTab === 'receitas')   pageContent = renderReceitas();
  if (activeTab === 'lista')      pageContent = renderLista();

  return `
    <div class="card-label">Refeições</div>
    <div class="ref-tab-bar">${tabBtns}</div>
    <div class="ref-tab-page active">${pageContent}</div>`;
}

// ── RECIPE DETAIL MODAL (body-level) ──────────────────────────────────────────

function openRecipeDetail(r) {
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

  const html = `
    <div class="ref-modal-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">${r.name}</div>
        <div class="ref-section-label">Ingredientes</div>
        <div class="recipe-detail-ing">${ings}</div>
        <div class="ref-section-label">Preparação</div>
        <div class="recipe-steps">${steps}</div>
        <div class="ref-modal-actions">
          <button class="ref-btn ref-btn-secondary">Fechar</button>
        </div>
      </div>
    </div>`;

  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const el = wrap.firstElementChild;
  document.body.appendChild(el);

  const close = () => el.remove();
  el.querySelector('.ref-btn-secondary').addEventListener('click', close);
  el.addEventListener('click', e => { if (e.target === el) close(); });
}

// ── MEAL PICKER MODAL (body-level) ────────────────────────────────────────────

function _renderMealModalHTML() {
  const { day, meal, type, recipe, note } = _mealState;
  const mLabel = meal === 'lunch' ? 'Almoço' : 'Jantar';
  const d = new Date(day + 'T12:00:00');
  const title = `${mLabel} · ${DAYS_FULL[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`;

  const typeBtns = MEAL_TYPES.map(t => `
    <button class="meal-type-btn${type === t.id ? ' selected' : ''}" data-meal-type="${t.id}">
      ${t.label}
    </button>`).join('');

  const sorted = [...refeic.data.recipes].sort((a, b) => matchScore(b) - matchScore(a));
  const recipeRows = type === 'recipe' ? `
    <div class="ref-section-label">Receita</div>
    <div class="recipe-list">
      ${sorted.map(r => {
        const score = matchScore(r);
        return `
          <div class="recipe-pick-row${recipe === r.id ? ' selected' : ''}" data-pick-recipe="${r.id}">
            <span class="recipe-pick-name">${r.name}</span>
            <span class="recipe-pick-meta">${r.prepTime + r.cookTime}min</span>
            <span class="recipe-pick-match ${matchClass(score)}">${score}%</span>
          </div>`;
      }).join('')}
    </div>` : '';

  const noteField = type && type !== 'empty' ? `
    <div class="ref-section-label">Nota (opcional)</div>
    <textarea class="ref-modal-note" id="meal-note" rows="2" placeholder="ex. com arroz branco…">${note}</textarea>` : '';

  const existing = refeic.data.planner[day]?.[meal];
  const clearBtn = existing && existing.type !== 'empty'
    ? `<button class="ref-btn ref-btn-danger" id="meal-clear-btn">Limpar</button>` : '';

  return `
    <div class="ref-modal-backdrop">
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

function _bindMealModal(onRefreshCard) {
  if (!_mealEl) return;

  _mealEl.querySelectorAll('.meal-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _mealState.type   = btn.dataset.mealType;
      if (_mealState.type !== 'recipe') _mealState.recipe = null;
      _refreshMealModal(onRefreshCard);
    });
  });

  _mealEl.querySelectorAll('.recipe-pick-row').forEach(row => {
    row.addEventListener('click', () => {
      _mealState.recipe = row.dataset.pickRecipe;
      _refreshMealModal(onRefreshCard);
    });
  });

  const noteEl = _mealEl.querySelector('#meal-note');
  if (noteEl) noteEl.addEventListener('input', e => { _mealState.note = e.target.value; });

  const saveBtn = _mealEl.querySelector('#meal-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const { day, meal, type, recipe, note } = _mealState;
    const entry = (!type || type === 'empty')
      ? { type: 'empty' }
      : { type, recipeId: recipe || undefined, note: note || undefined };
    await _saveMeal(day, meal, entry);
    _closeMealModal();
    onRefreshCard();
  });

  const clearBtn = _mealEl.querySelector('#meal-clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', async () => {
    await _saveMeal(_mealState.day, _mealState.meal, { type: 'empty' });
    _closeMealModal();
    onRefreshCard();
  });

  const cancelBtn = _mealEl.querySelector('#meal-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => _closeMealModal());

  _mealEl.addEventListener('click', e => { if (e.target === _mealEl) _closeMealModal(); });
}

function _refreshMealModal(onRefreshCard) {
  if (!_mealEl) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = _renderMealModalHTML();
  _mealEl.innerHTML = wrap.firstElementChild.innerHTML;
  _bindMealModal(onRefreshCard);
}

function _closeMealModal() {
  if (_mealEl) { _mealEl.remove(); _mealEl = null; }
}

function openMealModal(day, meal, onRefreshCard) {
  _closeMealModal();
  const existing       = refeic.data.planner[day]?.[meal];
  _mealState           = { day, meal, type: existing?.type || null, recipe: existing?.recipeId || null, note: existing?.note || '' };

  const wrap = document.createElement('div');
  wrap.innerHTML = _renderMealModalHTML();
  _mealEl = wrap.firstElementChild;
  document.body.appendChild(_mealEl);
  _bindMealModal(onRefreshCard);
}

// ── EVENTS (card-level) ───────────────────────────────────────────────────────

export function bindRefeicoes(container, onRefresh) {

  // sub-tab switch
  container.querySelectorAll('.ref-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      refeic.state.activeTab = btn.dataset.refTab;
      onRefresh();
    });
  });

  // planner: open meal modal (body-level)
  container.querySelectorAll('.meal-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      openMealModal(slot.dataset.day, slot.dataset.meal, onRefresh);
    });
  });

  // inventory: location tabs
  container.querySelectorAll('.inv-loc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      refeic.state.invLocation = btn.dataset.loc;
      onRefresh();
    });
  });

  // inventory: search + add
  const searchInput = container.querySelector('#inv-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => _updateSuggestions(container));
    searchInput.addEventListener('focus', () => _updateSuggestions(container));
    searchInput.addEventListener('blur',  () => {
      setTimeout(() => {
        const sug = container.querySelector('#inv-suggestions');
        if (sug) sug.style.display = 'none';
      }, 200);
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') _doAdd(container, onRefresh);
    });
  }

  // inventory: tap item body to edit
  container.querySelectorAll('[data-edit-inv]').forEach(el => {
    el.addEventListener('click', () => {
      const item = refeic.data.inventory.find(it => it.id === el.dataset.editInv);
      if (item) openEditInvModal(item, onRefresh);
    });
  });

  // inventory: delete
  container.querySelectorAll('[data-del-inv]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delInv;
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      refeic.data.inventory = refeic.data.inventory.filter(it => it.id !== id);
      onRefresh();
    });
  });

  const addBtn = container.querySelector('#inv-add-btn');
  if (addBtn) addBtn.addEventListener('click', () => _doAdd(container, onRefresh));

  // recipes: open detail (body-level)
  container.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const r = refeic.data.recipes.find(x => x.id === card.dataset.recipe);
      if (r) openRecipeDetail(r);
    });
  });

  // lista: generate from plan
  const genBtn = container.querySelector('#lista-generate');
  if (genBtn) genBtn.addEventListener('click', async () => {
    const generated = _generateFromPlan();
    if (generated.length === 0) {
      genBtn.textContent = '✅ Tudo em casa!';
      setTimeout(() => { genBtn.textContent = '🔄 Gerar da semana'; }, 2000);
      return;
    }
    // skip items already in the unchecked list (by productId or name)
    const existing = refeic.data.shopping.filter(i => !i.checked);
    const toAdd = generated.filter(g =>
      !existing.some(e => (g.productId && e.productId === g.productId) || e.name === g.name)
    );
    if (toAdd.length === 0) {
      genBtn.textContent = '✅ Lista já atualizada';
      setTimeout(() => { genBtn.textContent = '🔄 Gerar da semana'; }, 2000);
      return;
    }
    const r = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toAdd),
    });
    if (r.ok) refeic.data.shopping = await r.json();
    onRefresh();
  });

  // lista: manual add
  const listaAddBtn = container.querySelector('#lista-add');
  if (listaAddBtn) listaAddBtn.addEventListener('click', () => _openShopAddModal(onRefresh));

  // lista: check/uncheck
  container.querySelectorAll('[data-check-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id   = btn.dataset.checkId;
      const item = refeic.data.shopping.find(i => i.id === id);
      if (!item) return;
      const r = await fetch(`/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !item.checked }),
      });
      if (r.ok) item.checked = !item.checked;
      onRefresh();
    });
  });

  // lista: delete single item
  container.querySelectorAll('[data-del-shop]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delShop;
      await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
      refeic.data.shopping = refeic.data.shopping.filter(i => i.id !== id);
      onRefresh();
    });
  });

  // lista: clear done
  const clearDoneBtn = container.querySelector('#lista-clear-done');
  if (clearDoneBtn) clearDoneBtn.addEventListener('click', async () => {
    const r = await fetch('/api/shopping/done', { method: 'DELETE' });
    if (r.ok) refeic.data.shopping = await r.json();
    onRefresh();
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
  const matches = refeic.data.products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  if (matches.length === 0) { sug.style.display = 'none'; return; }
  sug.innerHTML = matches.map(p =>
    `<div class="inv-suggestion" data-pid="${p.id}" data-pname="${p.name}">${p.name}</div>`
  ).join('');
  sug.style.display = 'block';
  sug.querySelectorAll('.inv-suggestion').forEach(row => {
    row.addEventListener('mousedown', () => {
      input.value = row.dataset.pname;
      sug.style.display = 'none';
    });
  });
}

function _doAdd(container, onRefresh) {
  const input = container.querySelector('#inv-search-input');
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) { input.focus(); return; }

  const q       = raw.toLowerCase();
  const product = refeic.data.products.find(p => p.name.toLowerCase() === q)
               || refeic.data.products.find(p => p.name.toLowerCase().includes(q));

  const defaultLoc = refeic.state.invLocation !== 'all' ? refeic.state.invLocation : 'frigorifico';

  _addState = {
    name:      raw,
    productId: product && product.name.toLowerCase() === q ? product.id : null,
    unit:      product ? product.unit      : 'un',
    quantity:  product ? String(product.defaultQty) : '',
    location:  defaultLoc,
  };

  input.value = '';
  _openAddModal(onRefresh);
}

function _renderAddModal() {
  const { name, unit, quantity, location } = _addState;
  const unitOpts = UNITS.map(u =>
    `<option value="${u}"${u === unit ? ' selected' : ''}>${u}</option>`
  ).join('');
  const locBtns = ['frigorifico', 'congelador', 'despensa'].map(loc => `
    <button class="add-loc-btn${location === loc ? ' selected' : ''}" data-add-loc="${loc}">
      ${LOC_LABELS[loc]}
    </button>`).join('');

  return `
    <div class="ref-modal-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">Adicionar ao inventário</div>

        <div class="ref-section-label">Nome</div>
        <input class="ref-modal-note" id="add-name" type="text" value="${name.replace(/"/g, '&quot;')}" placeholder="Nome do produto">

        <div class="ref-section-label">Quantidade</div>
        <div class="add-qty-row">
          <input class="add-qty-input" id="add-qty" type="number" min="0" step="any"
                 value="${quantity}" placeholder="ex. 500" inputmode="decimal">
          <select class="add-unit-select" id="add-unit">${unitOpts}</select>
        </div>

        <div class="ref-section-label">Local</div>
        <div class="add-loc-row">${locBtns}</div>

        <div class="ref-modal-actions">
          <button class="ref-btn ref-btn-secondary" id="add-cancel">Cancelar</button>
          <button class="ref-btn ref-btn-primary"   id="add-save">Guardar</button>
        </div>
      </div>
    </div>`;
}

function _bindAddModal(onRefresh) {
  if (!_addEl) return;

  const nameInput = _addEl.querySelector('#add-name');
  const qtyInput  = _addEl.querySelector('#add-qty');
  const unitSel   = _addEl.querySelector('#add-unit');

  if (nameInput) nameInput.addEventListener('input', e => { _addState.name = e.target.value; });
  if (qtyInput)  qtyInput.addEventListener('input',  e => { _addState.quantity = e.target.value; });
  if (unitSel)   unitSel.addEventListener('change',  e => { _addState.unit = e.target.value; });

  _addEl.querySelectorAll('[data-add-loc]').forEach(btn => {
    btn.addEventListener('click', () => {
      _addState.location = btn.dataset.addLoc;
      _addEl.querySelectorAll('[data-add-loc]').forEach(b =>
        b.classList.toggle('selected', b.dataset.addLoc === _addState.location)
      );
    });
  });

  _addEl.querySelector('#add-cancel').addEventListener('click', () => {
    _addEl.remove(); _addEl = null;
  });

  _addEl.querySelector('#add-save').addEventListener('click', async () => {
    const nameVal = (_addEl.querySelector('#add-name').value || _addState.name).trim();
    const unitVal = _addEl.querySelector('#add-unit').value;
    const qty     = parseFloat(_addState.quantity);
    if (!nameVal) return;

    // save as custom product if not in catalogue — makes it appear in suggestions next time
    let productId = _addState.productId;
    if (!productId) {
      const pr = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameVal, unit: unitVal, defaultQty: isNaN(qty) ? 1 : qty, category: 'outro' }),
      });
      if (pr.ok) {
        const saved = await pr.json();
        refeic.data.products.push(saved);
        productId = saved.id;
      }
    }

    const item = {
      productId,
      name:          nameVal,
      location:      _addState.location,
      quantity:      isNaN(qty) ? null : qty,
      unit:          unitVal,
      quantityKnown: !isNaN(qty) && qty > 0,
    };
    const r = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (r.ok) refeic.data.inventory.push(await r.json());
    _addEl.remove(); _addEl = null;
    onRefresh();
  });

  _addEl.addEventListener('click', e => {
    if (e.target === _addEl) { _addEl.remove(); _addEl = null; }
  });

  // focus qty field so keyboard opens
  if (qtyInput) setTimeout(() => qtyInput.focus(), 100);
}

function _openAddModal(onRefresh) {
  if (_addEl) { _addEl.remove(); _addEl = null; }
  const wrap = document.createElement('div');
  wrap.innerHTML = _renderAddModal();
  _addEl = wrap.firstElementChild;
  document.body.appendChild(_addEl);
  _bindAddModal(onRefresh);
}

// ── SHOP ADD MODAL (body-level) ───────────────────────────────────────────────

function _openShopAddModal(onRefresh) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="ref-modal-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">Adicionar à lista</div>
        <div class="ref-section-label">Produto</div>
        <div class="inv-search-wrap" style="margin-bottom:12px">
          <input class="inv-search" id="shop-add-input" type="text"
                 placeholder="Escreve o produto…" autocomplete="off">
          <div class="inv-suggestions" id="shop-add-suggestions" style="display:none"></div>
        </div>
        <div class="ref-section-label">Quantidade (opcional)</div>
        <div class="add-qty-row">
          <input class="add-qty-input" id="shop-add-qty" type="number" min="0" step="any"
                 placeholder="ex. 500" inputmode="decimal">
          <select class="add-unit-select" id="shop-add-unit">
            ${UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
          </select>
        </div>
        <div class="ref-modal-actions">
          <button class="ref-btn ref-btn-secondary" id="shop-add-cancel">Cancelar</button>
          <button class="ref-btn ref-btn-primary"   id="shop-add-save">Adicionar</button>
        </div>
      </div>
    </div>`;
  const el = wrap.firstElementChild;
  document.body.appendChild(el);

  const input   = el.querySelector('#shop-add-input');
  const sug     = el.querySelector('#shop-add-suggestions');
  const qtyInp  = el.querySelector('#shop-add-qty');
  const unitSel = el.querySelector('#shop-add-unit');
  let selectedProduct = null;

  const showSug = () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { sug.style.display = 'none'; return; }
    const matches = refeic.data.products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) { sug.style.display = 'none'; return; }
    sug.innerHTML = matches.map(p =>
      `<div class="inv-suggestion" data-pid="${p.id}" data-pname="${p.name}"
            data-punit="${p.unit}" data-pqty="${p.defaultQty || ''}">${p.name}</div>`
    ).join('');
    sug.style.display = 'block';
    sug.querySelectorAll('.inv-suggestion').forEach(row => {
      row.addEventListener('mousedown', () => {
        selectedProduct = { id: row.dataset.pid, name: row.dataset.pname,
                            unit: row.dataset.punit, defaultQty: row.dataset.pqty };
        input.value = selectedProduct.name;
        unitSel.value = selectedProduct.unit || 'un';
        if (selectedProduct.defaultQty) qtyInp.value = selectedProduct.defaultQty;
        sug.style.display = 'none';
      });
    });
  };
  input.addEventListener('input',  () => { selectedProduct = null; showSug(); });
  input.addEventListener('focus',  showSug);
  input.addEventListener('blur',   () => setTimeout(() => { sug.style.display = 'none'; }, 200));
  setTimeout(() => input.focus(), 80);

  el.querySelector('#shop-add-cancel').addEventListener('click', () => el.remove());
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });

  el.querySelector('#shop-add-save').addEventListener('click', async () => {
    const name = input.value.trim();
    if (!name) return;
    const qty = parseFloat(qtyInp.value);
    const p   = selectedProduct || refeic.data.products.find(x => x.name.toLowerCase() === name.toLowerCase());
    const item = {
      productId: p ? p.id : null,
      name,
      quantity:  isNaN(qty) ? null : qty,
      unit:      unitSel.value,
      category:  p ? (refeic.data.products.find(x => x.id === p.id) || {}).category || 'outro' : 'outro',
      source:    'manual',
      checked:   false,
    };
    const r = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (r.ok) refeic.data.shopping = await r.json();
    el.remove();
    onRefresh();
  });
}

// ── EDIT INVENTORY MODAL (body-level) ─────────────────────────────────────────

function _renderEditInvModal() {
  const { name, quantity, unit, location, productId } = _editInvState;
  const step     = _qtyStep(unit);
  const unitOpts = UNITS.map(u =>
    `<option value="${u}"${u === unit ? ' selected' : ''}>${u}</option>`
  ).join('');
  const locBtns = ['frigorifico', 'congelador', 'despensa'].map(loc => `
    <button class="add-loc-btn${location === loc ? ' selected' : ''}" data-edit-loc="${loc}">
      ${LOC_LABELS[loc]}
    </button>`).join('');

  const linkedProduct = refeic.data.products.find(p => p.id === productId);
  const isCustom = !productId || productId.startsWith('custom_');
  const linkSection = isCustom ? `
    <div class="ref-section-label">Vincular a produto base
      <span class="link-hint">(para receitas)</span>
    </div>
    <div class="inv-search-wrap" style="margin-bottom:4px">
      <input class="inv-search" id="link-search" type="text"
             placeholder="Procurar produto do catálogo…"
             value="${linkedProduct ? linkedProduct.name : ''}" autocomplete="off">
      <div class="inv-suggestions" id="link-suggestions" style="display:none"></div>
    </div>
    ${linkedProduct ? `<div class="link-current">✅ Ligado a: <strong>${linkedProduct.name}</strong>
      <button class="link-clear" id="link-clear">×</button></div>` : ''}` : `
    <div class="ref-section-label">Produto base</div>
    <div class="link-current">✅ ${linkedProduct ? linkedProduct.name : productId}</div>`;

  return `
    <div class="ref-modal-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">${name}</div>

        <div class="ref-section-label">Quantidade</div>
        <div class="edit-qty-row">
          <button class="edit-qty-btn" id="edit-qty-minus">−</button>
          <input class="edit-qty-num" id="edit-qty" type="number" min="0" step="${step}"
                 value="${quantity ?? ''}" inputmode="decimal">
          <select class="edit-qty-unit" id="edit-unit">${unitOpts}</select>
          <button class="edit-qty-btn" id="edit-qty-plus">+</button>
        </div>

        <div class="ref-section-label">Local</div>
        <div class="add-loc-row">${locBtns}</div>

        ${linkSection}

        <div class="ref-modal-actions">
          <button class="ref-btn ref-btn-danger"   id="edit-inv-delete">Apagar</button>
          <button class="ref-btn ref-btn-primary"  id="edit-inv-save">Guardar</button>
        </div>
      </div>
    </div>`;
}

function _bindEditInvModal(onRefresh) {
  if (!_editInvEl) return;

  const qtyInput = _editInvEl.querySelector('#edit-qty');
  const unitSel  = _editInvEl.querySelector('#edit-unit');

  if (qtyInput) qtyInput.addEventListener('input', e => {
    _editInvState.quantity = parseFloat(e.target.value);
  });
  if (unitSel) unitSel.addEventListener('change', e => {
    _editInvState.unit = e.target.value;
  });

  _editInvEl.querySelector('#edit-qty-minus').addEventListener('click', () => {
    const step   = _qtyStep(_editInvState.unit);
    const newVal = Math.max(0, Math.round(((_editInvState.quantity || 0) - step) * 1000) / 1000);
    _editInvState.quantity = newVal;
    if (qtyInput) qtyInput.value = newVal;
  });

  _editInvEl.querySelector('#edit-qty-plus').addEventListener('click', () => {
    const step   = _qtyStep(_editInvState.unit);
    const newVal = Math.round(((_editInvState.quantity || 0) + step) * 1000) / 1000;
    _editInvState.quantity = newVal;
    if (qtyInput) qtyInput.value = newVal;
  });

  // product link search (only present for custom items)
  const linkInput = _editInvEl.querySelector('#link-search');
  const linkSug   = _editInvEl.querySelector('#link-suggestions');
  if (linkInput && linkSug) {
    const showLinkSuggestions = () => {
      const q = linkInput.value.toLowerCase().trim();
      if (!q) { linkSug.style.display = 'none'; return; }
      // only catalogue products (not custom_) for linking
      const matches = refeic.data.products
        .filter(p => !p.id.startsWith('custom_') && p.name.toLowerCase().includes(q))
        .slice(0, 8);
      if (!matches.length) { linkSug.style.display = 'none'; return; }
      linkSug.innerHTML = matches.map(p =>
        `<div class="inv-suggestion" data-link-pid="${p.id}" data-link-pname="${p.name}">${p.name}</div>`
      ).join('');
      linkSug.style.display = 'block';
      linkSug.querySelectorAll('.inv-suggestion').forEach(row => {
        row.addEventListener('mousedown', () => {
          _editInvState.productId = row.dataset.linkPid;
          linkSug.style.display = 'none';
          // re-render modal so the "linked" badge shows
          const wrap = document.createElement('div');
          wrap.innerHTML = _renderEditInvModal();
          _editInvEl.innerHTML = wrap.firstElementChild.innerHTML;
          _bindEditInvModal(_currentEditInvRefresh);
        });
      });
    };
    linkInput.addEventListener('input', showLinkSuggestions);
    linkInput.addEventListener('focus', showLinkSuggestions);
    linkInput.addEventListener('blur', () =>
      setTimeout(() => { linkSug.style.display = 'none'; }, 200)
    );
  }

  const linkClear = _editInvEl.querySelector('#link-clear');
  if (linkClear) linkClear.addEventListener('click', () => {
    _editInvState.productId = null;
    const wrap = document.createElement('div');
    wrap.innerHTML = _renderEditInvModal();
    _editInvEl.innerHTML = wrap.firstElementChild.innerHTML;
    _bindEditInvModal(_currentEditInvRefresh);
  });

  _editInvEl.querySelectorAll('[data-edit-loc]').forEach(btn => {
    btn.addEventListener('click', () => {
      _editInvState.location = btn.dataset.editLoc;
      _editInvEl.querySelectorAll('[data-edit-loc]').forEach(b =>
        b.classList.toggle('selected', b.dataset.editLoc === _editInvState.location)
      );
    });
  });

  _editInvEl.querySelector('#edit-inv-delete').addEventListener('click', async () => {
    await fetch(`/api/inventory/${_editInvState.id}`, { method: 'DELETE' });
    refeic.data.inventory = refeic.data.inventory.filter(it => it.id !== _editInvState.id);
    _editInvEl.remove(); _editInvEl = null;
    onRefresh();
  });

  _editInvEl.querySelector('#edit-inv-save').addEventListener('click', async () => {
    const qty  = parseFloat(_editInvEl.querySelector('#edit-qty').value);
    const unit = _editInvEl.querySelector('#edit-unit').value;
    const patch = {
      quantity:      isNaN(qty) ? null : qty,
      unit,
      location:      _editInvState.location,
      quantityKnown: !isNaN(qty) && qty > 0,
      productId:     _editInvState.productId,
    };
    const r = await fetch(`/api/inventory/${_editInvState.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      const updated = await r.json();
      const idx = refeic.data.inventory.findIndex(it => it.id === _editInvState.id);
      if (idx >= 0) refeic.data.inventory[idx] = updated;
    }
    _editInvEl.remove(); _editInvEl = null;
    onRefresh();
  });

  _editInvEl.addEventListener('click', e => {
    if (e.target === _editInvEl) { _editInvEl.remove(); _editInvEl = null; }
  });
}

function openEditInvModal(item, onRefresh) {
  if (_editInvEl) { _editInvEl.remove(); _editInvEl = null; }
  _currentEditInvRefresh = onRefresh;
  _editInvState = {
    id:        item.id,
    name:      item.name,
    quantity:  item.quantity ?? 0,
    unit:      item.unit || 'un',
    location:  item.location || 'frigorifico',
    productId: item.productId || null,
  };
  const wrap = document.createElement('div');
  wrap.innerHTML = _renderEditInvModal();
  _editInvEl = wrap.firstElementChild;
  document.body.appendChild(_editInvEl);
  _bindEditInvModal(onRefresh);
}
