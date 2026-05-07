import { DAYS_PT, MONTHS_PT } from '../config.js';

export function updateClock() {
  const el  = document.getElementById('clock-time');
  const el2 = document.getElementById('clock-date');
  if (!el) return;
  const now = new Date();
  el.textContent  = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  el2.textContent = `${DAYS_PT[now.getDay()]}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]}`;
}

export function startClock() {
  updateClock();
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => { updateClock(); setInterval(updateClock, 60 * 1000); }, msToNextMinute);
}
