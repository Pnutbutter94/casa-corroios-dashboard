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

function _calClass(calendar) {
    if (calendar === 'Momôs - Datas Especiais') return 'cal-dot--special';
    return 'cal-dot--event';
}

function _weekDay({ date, day, count, isToday }) {
    const cls = isToday ? ' cal-week-day--today' : '';
    const dot = count > 0
        ? `<span class="cal-week-dot"></span>`
        : `<span class="cal-week-dot cal-week-dot--hidden"></span>`;
    const num = parseInt(date.split('-')[2], 10);
    return `<div class="cal-week-day${cls}">
        <span class="cal-week-name">${esc(day)}</span>
        <span class="cal-week-num">${num}</span>
        ${dot}
    </div>`;
}

function _render({ today, tomorrow_count, week }) {
    const rows = today.map(ev => `
        <div class="cal-event">
            <span class="cal-time${ev.allDay ? ' cal-allday' : ''}">${ev.allDay ? 'Dia inteiro' : esc(ev.time)}</span>
            <span class="cal-dot ${_calClass(ev.calendar)}"></span>
            <span class="cal-title">${esc(ev.title)}</span>
        </div>`).join('');

    const empty = !today.length
        ? '<div class="cal-empty">Dia livre</div>'
        : '';

    // hide tomorrow pill when week strip is present (redundant info)
    const tomorrow = !week && tomorrow_count
        ? `<div class="cal-tomorrow">${tomorrow_count} evento${tomorrow_count > 1 ? 's' : ''} amanhã →</div>`
        : '';

    const weekStrip = week && week.length
        ? `<div class="cal-week">${week.map(d => _weekDay(d)).join('')}</div>`
        : '';

    return `<div class="card-label">Agenda</div>${rows}${empty}${tomorrow}${weekStrip}`;
}
