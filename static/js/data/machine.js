// IKEA TVÄTTAD — 8 kg integrated washing machine
export const MACHINE = {
  capacity:      8,    // kg
  waterHardness: 150,  // mg/L CaCO3 — Corroios, moderately hard
};

export const CYCLES = {
  cottons60: { label: 'Algodão 60°', temp: 60, duration: 120, maxKg: 8, rpm: 1400 },
  cottons40: { label: 'Algodão 40°', temp: 40, duration: 120, maxKg: 8, rpm: 1400 },
  eco30:     { label: 'Eco 30°',     temp: 30, duration: 180, maxKg: 8, rpm: 1200 },
};

export const PROFILES = {
  brancos: { label: 'Brancos',        icon: '⚪', cycle: 'cottons60' },
  rua:     { label: 'Roupa de Rua',   icon: '👕', cycle: 'eco30'     },
  casa:    { label: 'Casa + Desporto',icon: '🏠', cycle: 'cottons40' },
};

// profile: 'rua'  → visible in Rua + Brancos
//          'casa' → visible in Casa + Desporto + Brancos
export const CLOTHES = [
  // Roupa de Rua
  { id: 'tshirt',     label: 'T-shirt',           icon: '👕', kg: 0.18, profile: 'rua'  },
  { id: 'shirt',      label: 'Camisa',             icon: '👔', kg: 0.25, profile: 'rua'  },
  { id: 'trousers',   label: 'Calças',             icon: '👖', kg: 0.45, profile: 'rua'  },
  { id: 'jeans',      label: 'Jeans/Ganga',        icon: '🔵', kg: 0.80, profile: 'rua'  },
  { id: 'hoodie',     label: 'Camisola/Hoodie',    icon: '🧥', kg: 0.60, profile: 'rua'  },
  { id: 'boxers',     label: 'Cuecas homem',       icon: '🩲', kg: 0.10, profile: 'rua'  },
  { id: 'panties',    label: 'Cuecas mulher',      icon: '🩱', kg: 0.04, profile: 'rua'  },
  { id: 'socks',      label: 'Meias (par)',         icon: '🧦', kg: 0.06, profile: 'rua'  },
  { id: 'pyjamas',    label: 'Pijamas',             icon: '😴', kg: 0.45, profile: 'rua'  },

  // Casa + Desporto
  { id: 'towel',      label: 'Toalha de banho',    icon: '🛁', kg: 0.65, profile: 'casa' },
  { id: 'facetowel',  label: 'Toalha de rosto',    icon: '🧖', kg: 0.22, profile: 'casa' },
  { id: 'hairtowel',  label: 'Toalha de cabelo',   icon: '💆', kg: 0.25, profile: 'casa' },
  { id: 'sheet',      label: 'Lençol casal',        icon: '🛏️', kg: 0.55, profile: 'casa' },
  { id: 'duvetcover', label: 'Capa de edredão',    icon: '🛌', kg: 0.75, profile: 'casa' },
  { id: 'duvet',      label: 'Edredão',            icon: '🌨️', kg: 1.50, profile: 'casa' },
  { id: 'pillow',     label: 'Fronha de almofada', icon: '💤', kg: 0.12, profile: 'casa' },
  { id: 'dishcloth',  label: 'Pano de loiça',      icon: '🧹', kg: 0.10, profile: 'casa' },
  { id: 'sporttop',   label: 'Top desporto',       icon: '🏃', kg: 0.15, profile: 'casa' },
  { id: 'sportshort', label: 'Calções desporto',   icon: '🩳', kg: 0.15, profile: 'casa' },
  { id: 'leggings',   label: 'Leggings',           icon: '🦵', kg: 0.22, profile: 'casa' },
];
