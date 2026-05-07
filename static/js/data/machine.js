// IKEA TVÄTTAD — 8 kg integrated washing machine
export const MACHINE = {
  capacity:      8,    // kg (drum capacity rating for cotton)
  waterHardness: 150,  // mg/L CaCO3 — Corroios, moderately hard
};

export const CYCLES = {
  cottons60: { label: 'Algodão 60°', temp: 60, duration: 120, maxKg: 8, rpm: 1400 },
  cottons40: { label: 'Algodão 40°', temp: 40, duration: 120, maxKg: 8, rpm: 1400 },
  eco30:     { label: 'Eco 30°',     temp: 30, duration: 180, maxKg: 8, rpm: 1200 },
};

// category drives cycle selection when items are not marked white:
//   'casa' → Algodão 40°   |   'rua' → Eco 30°
//
// bulk: how much drum space the item occupies relative to its weight.
// Fluffy/absorbent items (towels, bedding) fill the drum faster than
// their weight suggests — the 8 kg rating is for flat cotton clothes.
export const CLOTHES = [
  // ── Casa + Desporto ──────────────────────────────────────
  { id: 'towel',      label: 'Toalha de banho',    icon: '🛁',  kg: 0.65, bulk: 2.5, category: 'casa' },
  { id: 'facetowel',  label: 'Toalha de rosto',    icon: '🧖',  kg: 0.22, bulk: 2.0, category: 'casa' },
  { id: 'hairtowel',  label: 'Toalha de cabelo',   icon: '💆',  kg: 0.25, bulk: 2.0, category: 'casa' },
  { id: 'sheet',      label: 'Lençol casal',        icon: '🛏️', kg: 0.55, bulk: 1.8, category: 'casa' },
  { id: 'duvetcover', label: 'Capa de edredão',    icon: '🛌',  kg: 0.75, bulk: 1.8, category: 'casa' },
  { id: 'duvet',      label: 'Edredão',            icon: '🌨️', kg: 1.50, bulk: 3.0, category: 'casa' },
  { id: 'pillow',     label: 'Fronha de almofada', icon: '💤',  kg: 0.12, bulk: 1.3, category: 'casa' },
  { id: 'dishcloth',  label: 'Pano de loiça',      icon: '🧹',  kg: 0.10, bulk: 1.0, category: 'casa' },
  { id: 'sporttop',   label: 'Top desporto',       icon: '🏃',  kg: 0.15, bulk: 1.0, category: 'casa' },
  { id: 'sportshort', label: 'Calções desporto',   icon: '🩳',  kg: 0.15, bulk: 1.0, category: 'casa' },
  { id: 'leggings',   label: 'Leggings',           icon: '🦵',  kg: 0.22, bulk: 1.0, category: 'casa' },

  // ── Roupa de Rua ─────────────────────────────────────────
  { id: 'tshirt',     label: 'T-shirt',            icon: '👕',  kg: 0.18, bulk: 1.0, category: 'rua'  },
  { id: 'shirt',      label: 'Camisa',             icon: '👔',  kg: 0.25, bulk: 1.0, category: 'rua'  },
  { id: 'trousers',   label: 'Calças',             icon: '👖',  kg: 0.45, bulk: 1.0, category: 'rua'  },
  { id: 'jeans',      label: 'Jeans/Ganga',        icon: '🔵',  kg: 0.80, bulk: 1.1, category: 'rua'  },
  { id: 'hoodie',     label: 'Camisola/Hoodie',    icon: '🧥',  kg: 0.60, bulk: 1.2, category: 'rua'  },
  { id: 'boxers',     label: 'Cuecas homem',       icon: '🩲',  kg: 0.10, bulk: 1.0, category: 'rua'  },
  { id: 'panties',    label: 'Cuecas mulher',      icon: '🩱',  kg: 0.04, bulk: 1.0, category: 'rua'  },
  { id: 'socks',      label: 'Meias (par)',         icon: '🧦',  kg: 0.06, bulk: 1.0, category: 'rua'  },
  { id: 'pyjamas',    label: 'Pijamas',             icon: '😴',  kg: 0.45, bulk: 1.0, category: 'rua'  },
];
