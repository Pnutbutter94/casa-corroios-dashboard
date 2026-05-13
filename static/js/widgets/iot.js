import { esc } from '../utils/esc.js';

export const iot = { states: {} };

const LIGHTS = [
    { id: 'light.escritorio_ines',         label: 'Escritório Inês' },
    { id: 'light.luz_de_entrada',          label: 'Luz de Entrada' },
    { id: 'light.wiz_rgbw_tunable_877be6', label: 'Luz Quarto' },
];
const SWITCHES = [
    { id: 'switch.plug_sala',       label: 'Plug Sala' },
    { id: 'switch.termoacumulador', label: 'Termoacumulador' },
];
const SENSORS = [
    { temp: 'sensor.h5100_703b_temperature', hum: 'sensor.h5100_703b_humidity', bat: 'sensor.h5100_703b_battery', room: 'Escritório' },
    { temp: 'sensor.h5100_5618_temperature', hum: 'sensor.h5100_5618_humidity', bat: 'sensor.h5100_5618_battery', room: 'Quarto' },
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
        const bat  = _s(s.bat).state;
        const ok   = temp !== 'unavailable';
        return `
        <div class="iot-sensor-card${ok ? '' : ' unavail'}">
            <div class="iot-sensor-room">${esc(s.room)}</div>
            ${ok ? `
            <div class="iot-sensor-row">
                <span class="iot-sensor-val">${parseFloat(temp).toFixed(1)}°</span>
                <span class="iot-sensor-sep"></span>
                <span class="iot-sensor-val">${parseFloat(hum).toFixed(0)}%</span>
            </div>
            <div class="iot-sensor-bat">🔋 ${bat}%</div>
            ` : '<div class="iot-sensor-unavail">sem sinal</div>'}
        </div>`;
    }).join('');

    const tilesHTML = (items, iconOn, iconOff) => items.map(d => {
        const on = _s(d.id).state === 'on';
        return `
        <button class="iot-tile${on ? ' on' : ''}" data-toggle="${d.id}">
            <span class="iot-tile-icon">${on ? iconOn : iconOff}</span>
            <span class="iot-tile-label">${esc(d.label)}</span>
            <span class="iot-tile-state">${on ? 'ligado' : 'desligado'}</span>
        </button>`;
    }).join('');

    const vs  = _s(VACUUM_ID);
    const vi  = VACUUM_STATES[vs.state] || { label: vs.state, icon: '❓', cls: '' };
    const canStart = vs.state === 'docked' || vs.state === 'idle';
    const canStop  = vs.state === 'cleaning' || vs.state === 'paused';
    const vacBtn = canStart
        ? `<button class="iot-vacuum-btn accent" data-vacuum-action="start">▶ Limpar</button>`
        : canStop
        ? `<button class="iot-vacuum-btn" data-vacuum-action="return_to_base">⏹ Parar</button>`
        : '';

    return `
    <div class="card-label">Clima</div>
    <div class="iot-clima-grid">${climaHTML}</div>

    <div class="card-label iot-gap">Luzes</div>
    <div class="iot-device-grid">${tilesHTML(LIGHTS, '💡', '🌑')}</div>

    <div class="card-label iot-gap">Tomadas</div>
    <div class="iot-device-grid">${tilesHTML(SWITCHES, '🔌', '⚫')}</div>

    <div class="card-label iot-gap">Aspirador</div>
    <div class="iot-vacuum">
        <div class="iot-vacuum-status">
            <span class="iot-vacuum-icon">${vi.icon}</span>
            <div>
                <div class="iot-vacuum-name">Alfredo</div>
                <div class="iot-vacuum-state ${vi.cls}">${vi.label}</div>
            </div>
        </div>
        ${vacBtn}
    </div>`;
}

export function bindIot(container, onRefresh) {
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
