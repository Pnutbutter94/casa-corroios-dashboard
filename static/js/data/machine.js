// IKEA TVÄTTAD — 8 kg integrated washing machine
export const MACHINE = {
  capacity:      8,    // kg
  waterHardness: 150,  // mg/L CaCO3 — Corroios, moderately hard
};

export const CYCLES = {
  cottons:    { label: 'Algodão 60°',    temp: 60, duration: 120, maxKg: 8, rpm: 1400 },
  eco:        { label: 'Eco 40°',        temp: 40, duration: 180, maxKg: 8, rpm: 1200 },
  synthetics: { label: 'Sintéticos 40°', temp: 40, duration:  70, maxKg: 4, rpm: 1200 },
  wool:       { label: 'Lã 30°',         temp: 30, duration:  45, maxKg: 2, rpm:  800 },
  sport:      { label: 'Desporto 30°',   temp: 30, duration:  60, maxKg: 4, rpm:  800 },
  denim:      { label: 'Ganga 40°',      temp: 40, duration:  70, maxKg: 4, rpm:  800 },
};

// cycle to use for each item group
export const GROUP_CYCLE = {
  hot:    'cottons',
  colors: 'eco',
  denim:  'denim',
  wool:   'wool',
  sport:  'sport',
};

export const CLOTHES = [
  { id: 'sheets',    label: 'Lençóis',        icon: '🛏️', kg: 1.5, group: 'hot'    },
  { id: 'towels',    label: 'Toalhas',         icon: '🛁',  kg: 0.6, group: 'hot'    },
  { id: 'tshirts',   label: 'T-shirts',        icon: '👕',  kg: 0.2, group: 'colors' },
  { id: 'socks',     label: 'Meias',           icon: '🧦',  kg: 0.05,group: 'colors' },
  { id: 'underwear', label: 'Roupa interior',  icon: '🩲',  kg: 0.1, group: 'colors' },
  { id: 'pyjamas',   label: 'Pijamas',         icon: '😴',  kg: 0.4, group: 'colors' },
  { id: 'shirts',    label: 'Camisas',         icon: '👔',  kg: 0.3, group: 'colors' },
  { id: 'trousers',  label: 'Calças',          icon: '👖',  kg: 0.5, group: 'colors' },
  { id: 'hoodies',   label: 'Camisolas',       icon: '🧥',  kg: 0.5, group: 'colors' },
  { id: 'denim',     label: 'Ganga/Jeans',     icon: '🔵',  kg: 0.6, group: 'denim'  },
  { id: 'wool',      label: 'Lã',              icon: '🧶',  kg: 0.3, group: 'wool'   },
  { id: 'sport',     label: 'Desporto',        icon: '🏃',  kg: 0.3, group: 'sport'  },
];
