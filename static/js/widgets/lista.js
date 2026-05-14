// Lista de compras — household shopping list (top-level tab)

import { refeic, _nameWords, _invHasIngredient } from './refeicoes.js';
import { esc } from '../utils/esc.js';

export const lista = {
  data: { shopping: [] },
};

const CAT_LABELS_PT = {
  carne: 'Carnes', peixe: 'Peixe', laticinios: 'Laticínios',
  secos: 'Secos e Grãos', legumes: 'Legumes e Frutas',
  conservas: 'Conservas', congelados: 'Congelados',
  temperos: 'Temperos', padaria: 'Padaria',
  bebidas: 'Bebidas', limpeza: 'Limpeza', higiene: 'Higiene',
  casa: 'Casa', outro: 'Outros',
};
const CAT_ICONS = {
  carne: '🥩', peixe: '🐟', laticinios: '🥛', secos: '🌾',
  legumes: '🥦', conservas: '🥫', congelados: '❄️',
  temperos: '🧂', padaria: '🍞',
  bebidas: '🍺', limpeza: '🧹', higiene: '🧴',
  casa: '🏠', outro: '📦',
};
const CAT_ORDER = [
  'carne','peixe','laticinios','secos','legumes',
  'conservas','congelados','temperos','padaria',
  'bebidas','limpeza','higiene','casa','outro',
];
const UNITS = ['un', 'dose', 'g', 'kg', 'ml', 'L', 'lata', 'pacote', 'caixa'];

let _addEl        = null;
let _refeicLoaded = false;

// ── DATA ─────────────────────────────────────────────────────────────────────

export async function initLista() {
  const productsPromise = refeic.data.products.length > 0
    ? Promise.resolve(refeic.data.products)
    : fetch('/api/products').then(r => r.ok ? r.json() : []);
  const [shopping, products] = await Promise.all([
    fetch('/api/shopping').then(r => r.ok ? r.json() : []),
    productsPromise,
  ]);
  lista.data.shopping = shopping;
  if (!refeic.data.products.length) refeic.data.products = products;
}

// ── GENERATE FROM MEAL PLAN ──────────────────────────────────────────────────

async function _ensureRefeicData() {
  if (_refeicLoaded || refeic.data.recipes.length > 0) return;
  const [recipes, inventory, planner] = await Promise.all([
    fetch('/api/recipes').then(r => r.ok ? r.json() : []),
    fetch('/api/inventory').then(r => r.ok ? r.json() : []),
    fetch('/api/planner').then(r => r.ok ? r.json() : {}),
  ]);
  if (!refeic.data.recipes.length)   refeic.data.recipes   = recipes;
  if (!refeic.data.inventory.length) refeic.data.inventory = inventory;
  refeic.data.planner = planner;
  _refeicLoaded = true;
}

function _generateFromPlan() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = d => d.toISOString().split('T')[0];
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

// ── RENDER ───────────────────────────────────────────────────────────────────

export function renderLista() {
  const shop      = lista.data.shopping;
  const unchecked = shop.filter(i => !i.checked);
  const checked   = shop.filter(i => i.checked);

  const grouped = {};
  unchecked.forEach(item => {
    const cat = item.category || 'outro';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let listHTML = '';
  CAT_ORDER.forEach(cat => {
    if (!grouped[cat]) return;
    listHTML += `<div class="lista-category">${CAT_ICONS[cat] || '📦'} ${esc(CAT_LABELS_PT[cat] || cat)}</div>`;
    listHTML += grouped[cat].map(item => `
      <div class="lista-item">
        <button class="lista-check" data-check-id="${item.id}">⬜</button>
        <span class="lista-item-name">${esc(item.name)}</span>
        ${item.quantity ? `<span class="lista-item-qty">${item.quantity} ${esc(item.unit || '')}</span>` : ''}
        <button class="lista-del" data-del-shop="${item.id}">×</button>
      </div>`).join('');
  });

  const checkedHTML = checked.length === 0 ? '' : `
    <div class="lista-done-section">
      <div class="lista-category lista-category-done">✅ No carrinho (${checked.length})</div>
      ${checked.map(item => `
        <div class="lista-item lista-item-done">
          <button class="lista-check" data-check-id="${item.id}">✅</button>
          <span class="lista-item-name">${esc(item.name)}</span>
          ${item.quantity ? `<span class="lista-item-qty">${item.quantity} ${esc(item.unit || '')}</span>` : ''}
          <button class="lista-del" data-del-shop="${item.id}">×</button>
        </div>`).join('')}
      <button class="lista-danger-btn" id="lista-clear-done">
        🗑️ Limpar concluídos (${checked.length})
      </button>
    </div>`;

  const emptyMsg = shop.length === 0
    ? `<div class="lista-empty">Lista vazia · adiciona manualmente ou gera a partir do plano de refeições</div>` : '';

  return `
    <div class="card-label">🛒 Lista de Compras</div>
    <div class="lista-toolbar">
      <button class="lista-gen-btn" id="lista-generate">🔄 Gerar da semana</button>
      <button class="lista-add-btn" id="lista-add">+ Adicionar</button>
    </div>
    ${emptyMsg}
    <div class="lista-items">${listHTML}</div>
    ${checkedHTML}`;
}

// ── EVENTS ───────────────────────────────────────────────────────────────────

export function bindLista(container, onRefresh) {
  const genBtn = container.querySelector('#lista-generate');
  if (genBtn) genBtn.addEventListener('click', async () => {
    genBtn.disabled = true;
    genBtn.textContent = '⏳ A gerar…';
    await _ensureRefeicData();
    const generated = _generateFromPlan();
    genBtn.disabled = false;
    if (generated.length === 0) {
      genBtn.textContent = '✅ Tudo em casa!';
      setTimeout(() => { genBtn.textContent = '🔄 Gerar da semana'; }, 2000);
      return;
    }
    const existing = lista.data.shopping.filter(i => !i.checked);
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
    if (r.ok) lista.data.shopping = await r.json();
    onRefresh();
  });

  const addBtn = container.querySelector('#lista-add');
  if (addBtn) addBtn.addEventListener('click', () => _openShopAddModal(onRefresh));

  container.querySelectorAll('[data-check-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id   = btn.dataset.checkId;
      const item = lista.data.shopping.find(i => i.id === id);
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

  container.querySelectorAll('[data-del-shop]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delShop;
      await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
      lista.data.shopping = lista.data.shopping.filter(i => i.id !== id);
      onRefresh();
    });
  });

  const clearDoneBtn = container.querySelector('#lista-clear-done');
  if (clearDoneBtn) clearDoneBtn.addEventListener('click', async () => {
    const r = await fetch('/api/shopping/done', { method: 'DELETE' });
    if (r.ok) lista.data.shopping = await r.json();
    onRefresh();
  });
}

// ── ADD ITEM MODAL (body-level) ──────────────────────────────────────────────

function _openShopAddModal(onRefresh) {
  if (_addEl) { _addEl.remove(); _addEl = null; }
  const products = refeic.data.products;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="ref-modal-backdrop">
      <div class="ref-modal">
        <div class="ref-modal-title">Adicionar à lista</div>
        <div class="ref-section-label">Categoria</div>
        <select class="add-unit-select lista-cat-select" id="shop-cat-select">
          ${CAT_ORDER.map(c => `<option value="${c}">${CAT_ICONS[c]} ${CAT_LABELS_PT[c]}</option>`).join('')}
        </select>
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
  _addEl = wrap.firstElementChild;
  document.body.appendChild(_addEl);

  const input   = _addEl.querySelector('#shop-add-input');
  const sug     = _addEl.querySelector('#shop-add-suggestions');
  const qtyInp  = _addEl.querySelector('#shop-add-qty');
  const unitSel = _addEl.querySelector('#shop-add-unit');
  const catSel  = _addEl.querySelector('#shop-cat-select');
  let selectedProduct = null;

  const showSug = () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { sug.style.display = 'none'; return; }
    const matches = products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) { sug.style.display = 'none'; return; }
    sug.innerHTML = matches.map(p =>
      `<div class="inv-suggestion" data-pid="${esc(p.id)}" data-pname="${esc(p.name)}"
            data-pcat="${esc(p.category || 'outro')}" data-punit="${esc(p.unit || 'un')}"
            data-pqty="${esc(String(p.defaultQty ?? ''))}">${esc(p.name)}</div>`
    ).join('');
    sug.style.display = 'block';
    sug.querySelectorAll('.inv-suggestion').forEach(row => {
      row.addEventListener('mousedown', () => {
        selectedProduct = {
          id: row.dataset.pid, name: row.dataset.pname,
          category: row.dataset.pcat, unit: row.dataset.punit,
          defaultQty: row.dataset.pqty,
        };
        input.value   = selectedProduct.name;
        catSel.value  = selectedProduct.category || 'outro';
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

  _addEl.querySelector('#shop-add-cancel').addEventListener('click', () => {
    _addEl.remove(); _addEl = null;
  });
  _addEl.addEventListener('click', e => {
    if (e.target === _addEl) { _addEl.remove(); _addEl = null; }
  });

  _addEl.querySelector('#shop-add-save').addEventListener('click', async () => {
    const name = input.value.trim();
    if (!name) return;
    const qty = parseFloat(qtyInp.value);
    const p   = selectedProduct || products.find(x => x.name.toLowerCase() === name.toLowerCase());
    const item = {
      productId: p ? p.id   : null,
      name,
      quantity:  isNaN(qty) ? null : qty,
      unit:      unitSel.value,
      category:  catSel.value,
      source:    'manual',
      checked:   false,
    };
    const r = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (r.ok) lista.data.shopping = await r.json();
    _addEl.remove(); _addEl = null;
    onRefresh();
  });
}
