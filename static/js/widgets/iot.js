import { esc } from '../utils/esc.js';

export const iot = { states: {}, outdoorTemp: null };

const LIGHTS = [
    { id: 'light.escritorio_ines',         label: 'Escritório Inês' },
    { id: 'light.luz_de_entrada',          label: 'Luz de Entrada' },
    { id: 'light.wiz_rgbw_tunable_877be6', label: 'Luz Quarto' },
];
const SWITCHES = [
    { id: 'switch.plug_sala',       label: 'Plug Sala',       power: 'sensor.plug_sala_current_power' },
    { id: 'switch.termoacumulador', label: 'Termoacumulador', power: 'sensor.termoacumulador_current_power' },
];
const SENSORS = [
    { temp: 'sensor.03_escritorio_temperature', hum: 'sensor.03_escritorio_humidity', room: 'Escritório', f: true },
    { temp: 'sensor.02_quarto_temperature',     hum: 'sensor.02_quarto_humidity',     room: 'Quarto',     f: true },
    { temp: 'sensor.01_sala_cozinha_temperature', hum: 'sensor.01_sala_cozinha_humidity', room: 'Cozinha', f: true },
];
const VACUUM_ID = 'vacuum.viomi_de_428952342_v19';
const VACUUM_STATES = {
    docked:    { label: 'Na base',     icon: '🏠', cls: 'good' },
    cleaning:  { label: 'A limpar',    icon: '🌀', cls: 'accent' },
    returning: { label: 'A regressar', icon: '↩️',  cls: 'warn' },
    paused:    { label: 'Em pausa',    icon: '⏸️',  cls: 'warn' },
    idle:      { label: 'Parado',      icon: '😴', cls: '' },
    error:     { label: 'Erro',        icon: '⚠️',  cls: 'bad' },
};

function _s(id) { return iot.states[id] || { state: 'unavailable', attributes: {} }; }

function _autoBrightness() {
    const h = new Date().getHours();
    if (h < 18) return 100;
    if (h < 20) return 80;
    if (h < 22) return 50;
    return 25;
}

function _timeAgo(isoStr) {
    if (!isoStr) return '';
    const diff = Date.now() - new Date(isoStr).getTime();
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor(diff / 3_600_000);
    if (d > 0) return `há ${d}d`;
    if (h > 0) return `há ${h}h`;
    return 'há momentos';
}

function _humThresholds() {
    const t = iot.outdoorTemp;
    if (t == null) return { lo: 40, hi: 60 };
    if (t < 0)  return { lo: 25, hi: 45 };
    if (t < 10) return { lo: 30, hi: 50 };
    if (t < 20) return { lo: 35, hi: 55 };
    return { lo: 40, hi: 60 };
}

function _humClass(val) {
    const h = parseFloat(val);
    if (isNaN(h)) return '';
    const { lo, hi } = _humThresholds();
    if (h < lo - 10 || h > hi + 10) return 'bad';
    if (h < lo || h > hi) return 'warn';
    return 'good';
}

export async function initIot() { await fetchIotStates(); }

export async function fetchIotStates() {
    try {
        const data = await fetch('/api/iot/states').then(r => r.ok ? r.json() : []);
        if (Array.isArray(data)) data.forEach(e => { iot.states[e.entity_id] = e; });
    } catch (_) {}
}

export function renderIot() {
    const climaHTML = SENSORS.map(s => {
        const temp = _s(s.temp).state;
        const hum  = _s(s.hum).state;
        const ok   = temp !== 'unavailable';
        const tVal = ok ? parseFloat(temp) : 0;
        const tC   = ok ? (s.f ? ((tVal - 32) * 5 / 9) : tVal).toFixed(1) : '';
        return `
        <div class="iot-sensor-card${ok ? '' : ' unavail'}">
            <div class="iot-sensor-room">${esc(s.room)}</div>
            ${ok ? `
            <div class="iot-sensor-row">
                <span class="iot-sensor-val">${tC}°</span>
                <span class="iot-sensor-sep"></span>
                <span class="iot-sensor-val iot-hum-${_humClass(hum)}">${parseFloat(hum).toFixed(0)}%</span>
            </div>
            ` : '<div class="iot-sensor-unavail"><span class="iot-offline-dot"></span>sem sinal</div>'}
        </div>`;
    }).join('');

    const lightTilesHTML = LIGHTS.map(d => {
        const s  = _s(d.id);
        const on = s.state === 'on';
        const bri = on && s.attributes.brightness
            ? Math.round(s.attributes.brightness / 2.55) + '%'
            : '';
        return `
        <button class="iot-tile${on ? ' on' : ''}" data-light-toggle="${d.id}">
            <span class="iot-tile-icon">${on ? '💡' : '🌑'}</span>
            <span class="iot-tile-label">${esc(d.label)}</span>
            <span class="iot-tile-state">${on ? 'ligado' : 'desligado'}</span>
            ${bri ? `<span class="iot-tile-power">${bri}</span>` : ''}
        </button>`;
    }).join('');

    const tilesHTML = (items, iconOn, iconOff) => items.map(d => {
        const on    = _s(d.id).state === 'on';
        const pw    = d.power ? parseFloat(_s(d.power).state) : NaN;
        const pwStr = !isNaN(pw) && pw > 0.5 ? `${pw % 1 === 0 ? pw : pw.toFixed(1)} W` : (on ? '< 1 W' : '');
        return `
        <button class="iot-tile${on ? ' on' : ''}" data-toggle="${d.id}">
            <span class="iot-tile-icon">${on ? iconOn : iconOff}</span>
            <span class="iot-tile-label">${esc(d.label)}</span>
            <span class="iot-tile-state">${on ? 'ligado' : 'desligado'}</span>
            ${pwStr ? `<span class="iot-tile-power">${pwStr}</span>` : ''}
        </button>`;
    }).join('');

    const vs  = _s(VACUUM_ID);
    const vi  = VACUUM_STATES[vs.state] || { label: esc(vs.state), icon: '❓', cls: '' };
    const canStart  = vs.state === 'docked' || vs.state === 'idle';
    const canStop   = vs.state === 'cleaning' || vs.state === 'paused';
    const canReturn = vs.state === 'cleaning' || vs.state === 'paused' || vs.state === 'idle';
    const vacBtn = `
        ${canStart  ? `<button class="iot-vacuum-btn accent" data-vacuum-action="start">▶ Limpar</button>` : ''}
        ${canStop   ? `<button class="iot-vacuum-btn" data-vacuum-action="stop">⏹ Parar</button>` : ''}
        ${canReturn ? `<button class="iot-vacuum-btn" data-vacuum-action="return_to_base">🏠 Regressar</button>` : ''}
    `.trim();
    const vacTime = _timeAgo(vs.last_changed);

    return `
    <div class="card-label">Clima</div>
    <div class="iot-clima-grid">${climaHTML}</div>

    <div class="card-label iot-gap">Luzes</div>
    <div class="iot-device-grid">${lightTilesHTML}</div>

    <div class="card-label iot-gap">Tomadas</div>
    <div class="iot-device-grid">${tilesHTML(SWITCHES, '🔌', '⚫')}</div>

    <div class="card-label iot-gap">Aspirador</div>
    <div class="iot-vacuum">
        <div class="iot-vacuum-status">
            <span class="iot-vacuum-icon">${vi.icon}</span>
            <div>
                <div class="iot-vacuum-name">Alfredo</div>
                <div class="iot-vacuum-state ${vi.cls}">${vi.label}</div>
                ${vacTime ? `<div class="iot-vacuum-time">${vacTime}</div>` : ''}
            </div>
        </div>
        <div class="iot-vacuum-actions">${vacBtn}</div>
    </div>`;
}

export function bindIot(container, onRefresh) {
    container.querySelectorAll('[data-light-toggle]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.lightToggle;
            if (!iot.states[id]) return;
            const on = iot.states[id].state === 'on';
            iot.states[id].state = on ? 'off' : 'on';
            onRefresh();
            const service = on ? 'turn_off' : 'turn_on';
            const body = { entity_id: id, service };
            if (!on) body.brightness_pct = _autoBrightness();
            await fetch('/api/iot/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        });
    });

    container.querySelectorAll('[data-toggle]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.toggle;
            if (!iot.states[id]) return;
            iot.states[id].state = iot.states[id].state === 'on' ? 'off' : 'on';
            onRefresh();
            await fetch('/api/iot/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity_id: id, service: 'toggle' }),
            });
        });
    });

    container.querySelectorAll('[data-vacuum-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            await fetch('/api/iot/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity_id: VACUUM_ID, service: btn.dataset.vacuumAction }),
            });
            await fetchIotStates();
            onRefresh();
        });
    });
}
