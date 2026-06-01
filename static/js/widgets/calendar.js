import { esc } from '../utils/esc.js';

export async function initCalendar() {
    const el = document.getElementById('cal-card');
    if (!el) return;
    try {
        const data = await fetch('/api/calendar').then(r => r.ok ? r.json() : null);
        if (!data) { el.style.display = 'none'; return; }
        el.style.display = '';
        el.innerHTML = _render(data);
    } catch (_) {
        el.style.display = 'none';
    }
}

function _render({ today, tomorrow_count }) {
    const rows = today.map(ev => `
        <div class="cal-event">
            <span class="cal-time">${ev.allDay ? 'Dia inteiro' : esc(ev.time)}</span>
            <span class="cal-title">${esc(ev.title)}</span>
        </div>`).join('');

    const empty = !today.length
        ? '<div class="cal-empty">Dia livre</div>'
        : '';

    const tomorrow = tomorrow_count
        ? `<div class="cal-tomorrow">${tomorrow_count} evento${tomorrow_count > 1 ? 's' : ''} amanhã →</div>`
        : '';

    return `<div class="card-label">Agenda</div>${rows}${empty}${tomorrow}`;
}
