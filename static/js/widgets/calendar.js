import { esc } from '../utils/esc.js';

export async function initCalendar() {
    const el = document.getElementById('cal-card');
    if (!el) return;
    try {
        const data = await fetch('/api/calendar').then(r => r.ok ? r.json() : null);
        if (!data) { el.style.display = 'none'; return; }
        el.style.display = '';
        el.innerHTML = _render(data);
        if (data.week) {
            el.querySelectorAll('.cal-week-day').forEach((btn, i) => {
                btn.addEventListener('click', () => _selectDay(el, data.week, i));
            });
        }
    } catch (_) {
        el.style.display = 'none';
    }
}

function _calClass(calendar) {
    if (calendar === 'Momôs - Datas Especiais') return 'cal-dot--special';
    return 'cal-dot--event';
}

function _eventsHTML(events) {
    if (!events || !events.length) return '<div class="cal-empty">Dia livre</div>';
    return events.map(ev => `
        <div class="cal-event${ev.allDay ? ' cal-event--allday' : ''}">
            <span class="cal-time${ev.allDay ? ' cal-allday' : ''}">${ev.allDay ? 'Dia inteiro' : esc(ev.time)}</span>
            <span class="cal-dot ${_calClass(ev.calendar)}"></span>
            <span class="cal-title">${esc(ev.title)}</span>
        </div>`).join('');
}

function _selectDay(el, week, idx) {
    const day = week[idx];
    el.querySelector('.cal-events').innerHTML = _eventsHTML(day.events || []);
    el.querySelectorAll('.cal-week-day').forEach((btn, i) => {
        btn.classList.toggle('cal-week-day--selected', i === idx);
    });
    const label = el.querySelector('.cal-day-label');
    if (label) {
        const num = parseInt(day.date.split('-')[2], 10);
        label.textContent = day.isToday ? 'Hoje' : `${day.day} ${num}`;
    }
}

function _weekDay({ date, day, count, isToday }, selectedInitially) {
    const cls = (isToday ? ' cal-week-day--today' : '') + (selectedInitially ? ' cal-week-day--selected' : '');
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
    const todayEvents = (week && week[0] && week[0].events) ? week[0].events : today;

    const tomorrow = !week && tomorrow_count
        ? `<div class="cal-tomorrow">${tomorrow_count} evento${tomorrow_count > 1 ? 's' : ''} amanhã →</div>`
        : '';

    const weekStrip = week && week.length
        ? `<div class="cal-week">${week.map((d, i) => _weekDay(d, i === 0)).join('')}</div>`
        : '';

    return `
        <div class="cal-header">
            <span class="card-label">Agenda</span>
            <span class="cal-day-label">Hoje</span>
        </div>
        <div class="cal-events">${_eventsHTML(todayEvents)}</div>
        ${tomorrow}
        ${weekStrip}`;
}
