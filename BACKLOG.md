# Backlog

Small tweaks and non-urgent items to revisit.

---

## Roundtable sweep — 2026-06-01 (medium priority)

### Casa
- [ ] **M1** Calendar week strip: selected-but-not-today day has barely visible highlight (just a slight bg change). Needs a clear indicator — subtle border or brighter box — to distinguish from unselected days.

### Roupa
- [ ] **M2** Nighttime drying slots (21h–23h) show double 🏠 — `hour-rain` div renders 🏠 instead of empty string for night hours. Fix: server should return `""` for `rain` field when `is_night=True`. (`static/js/widgets/laundry-planner.js` renders `hour-rain` unconditionally.)

### Refeições
- [ ] **M3** Recipe match % shows "0%" on all recipes with no explanation. New users don't know it means "0% ingredients in house". Add a small label or tooltip: e.g. "(sem ingredientes em casa)" next to the 0% badge, or a one-line hint above the list.
- [ ] **M4** Meal slot modal: "Em branco" is pre-selected on open. Accidental Guardar saves a blank meal. Default to no selection, or disable Guardar until a type is chosen.

### Lista
- [ ] **M5** CATEGORIA select in "Adicionar à lista" modal has no dropdown chevron — looks like a flat label, not a picker. Add `▼` or use consistent select styling to signal it's tappable.

### Blockbuster
- [ ] **M6** Movie/series title in detail modal renders as "Gladiator 2000" (title+year run together). Should be "Gladiator · 2000" or "Gladiator (2000)".

### Energia
- [ ] **M7** Cost inconsistency: Servidor row shows 0.07 € today but "Dispositivos medidos hoje" total shows 0.05 € for the same 0.32 kWh. One calculation includes extra charges; they should use the same formula or both should be explained.
- [ ] **M8** Daily consumption chart (E-REDES) uses blue/purple bars with no legend. Colors encode weekday/weekend (based on the weekly chart below) but there's nothing telling the user that.

---

## Roundtable sweep — 2026-06-01 (low priority)

### Casa
- [ ] **L1** "Dia inteiro" events in calendar show the all-day label in plain white — same weight as timed events. Could be visually lighter/muted to de-emphasise all-day entries vs timed ones.

### Roupa
- [ ] **L2** Anti-calcário "há 25 dias" shown in plain white with no colour coding. Should turn amber at ~21 days, red at ~30 days to signal maintenance needed.
- [ ] **L3** "Seleciona a roupa acima · usa o modo ⚪ para peças brancas" hint text references the white-circle emoji but the button above says "Brancos" — minor inconsistency.

### IoT
- [ ] **L4** "Plug Sala" shows a solid black circle icon — likely a fallback when the icon entity type is unknown. Should have a plug or socket emoji.
- [ ] **L5** "sem sinal" sensors (Escritório, Cozinha) have no "last seen" timestamp. After a prolonged outage it's hard to know if this is expected or broken.

### Refeições
- [ ] **L6** Recipe detail modal: ingredient checkboxes have no label. Users don't know what checking them does (marks ingredient as in-stock). Add a small header: "Tenho em casa" above the checkbox column.
- [ ] **L7** Recipe detail modal: no scroll indicator for long recipes. On small screens, steps may overflow with no affordance to scroll.
- [ ] **L8** Receitas list: tapping a recipe is not obviously interactive — no hover/press state on desktop before click. Minor on a touch device.

### Lista
- [ ] **L9** Lista card doesn't fill available height when empty — large blank area below the empty-state message.
- [ ] **L10** Unit selector in "Adicionar" modal ("un") has no affordance showing it cycles through units (g, ml, un, kg). No chevron or hint.

### Blockbuster
- [ ] **L11** Disk bar label "54 GB" floats in the middle of the free-space section — could be read as "series use 54 GB". Clarify with a "livre" suffix: "54 GB livre".
- [ ] **L12** "A DESCARREGAR" refresh button (↻) has no label — icon-only. On the tablet it's a small tap target with no tooltip.

### Energia
- [ ] **L13** "1 jun" entry in daily chart shows 0.0 kWh for a day that isn't over. Either show today's partial data with a "(parcial)" badge, or exclude the current day from the chart.
- [ ] **L14** "Ver dia específico" date picker is visually buried below the weekday chart. Could use a more prominent placement or a small CTA label.

### Viagens
- [ ] **L15** "Expected" badge on return flight is English — should be "Previsto" (pt-PT).
- [ ] **L16** "7 POIs" stat in summary row uses an abbreviation unfamiliar to casual users. Consider "Lugares" or "Pontos de interesse".
- [ ] **L17** Claude tab: no suggested questions shown when conversation is empty — large blank space. Add 2–3 quick-start chips (e.g. "O que fazer sábado à tarde?", "Onde jantar perto do Prado?") to encourage first interaction.
- [ ] **L18** "Fechar viagem ↗" label is ambiguous — could mean close/archive or navigate away. Consider "Arquivar viagem" or add a tooltip.

---

## Pre-existing

### UI
- [ ] Night dimmer opacity feels too dark — tune `#dimmer.active { opacity }` in index.html

### Infrastructure
- [ ] Auto-start on tablet reboot without manual Termux tap — Termux:Boot unreliable on Alcatel Android 10, needs alternative approach (Tasker, ADB, or manufacturer-specific autostart setting)
