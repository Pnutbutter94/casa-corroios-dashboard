import { LOCATION, DAYS_PT }                                            from './config.js';
import { scheduleWatchdogReload, startBurnInProtection }                   from './tablet.js';
import { getWeatherIcon }                                                  from './utils/icons.js';
import { updateClock, startClock }                                         from './widgets/clock.js';
import { fetchWeather }                                                    from './widgets/weather.js';
import { getWashPlan, getWashVerdict, getHourlySlots }                     from './widgets/laundry.js';
import { getQuote }                                                        from './widgets/quote.js';
import {
  renderPlannerHTML, bindPlannerEvents,
  fetchMaintenance, postMaintenance,
} from './widgets/laundry-planner.js';
import {
  refeic, initRefeicoes, renderRefeicoes, bindRefeicoes,
} from './widgets/refeicoes.js';
import {
  initLista, renderLista, bindLista,
} from './widgets/lista.js';
import {
  iot, initIot, fetchIotStates, renderIot, bindIot,
} from './widgets/iot.js';
import {
  bb, initBlockbuster, renderBlockbuster, bindBlockbuster,
} from './widgets/blockbuster.js';
import { fetchEnergy, renderEnergia, fetchAnalysis, renderTrend } from './widgets/energia.js';
import { initViagens, renderViagens, bindViagens } from './widgets/viagens.js';

let weatherData       = null;
let activeTab         = 'casa';
let _activeHourlyDay  = null;
let coloredCounts     = {};
let whiteCounts       = {};
const plannerMode     = { white: false }; // object so ref survives re-binds
let maintenanceData   = {};
let refeicInitialised   = false;
let listaInitialised    = false;
let iotInitialised      = false;
let bbInitialised       = false;
let energiaInitialised  = false;
let refreshEnergia      = null;
let viagensInitialised  = false;

// ── PLANNER CALLBACKS ──────────────────────────────────────────────────────
function refreshPlannerCard() {
  const card = document.getElementById('planner-card');
  if (!card) return;
  card.innerHTML = renderPlannerHTML(coloredCounts, whiteCounts, plannerMode, maintenanceData);
  bindPlannerEvents(coloredCounts, whiteCounts, plannerMode, onMaintUpdate, onReset);
}

function onReset() {
  Object.keys(coloredCounts).forEach(k => delete coloredCounts[k]);
  Object.keys(whiteCounts).forEach(k => delete whiteCounts[k]);
  refreshPlannerCard();
}

async function onMaintUpdate(type) {
  const date = await postMaintenance(type);
  if (!date) return;
  maintenanceData[type] = date;
  refreshPlannerCard();
}

// ── REFEIÇÕES ──────────────────────────────────────────────────────────────
function refreshRefeicoes() {
  const card = document.getElementById('refeicoes-card');
  if (!card) return;
  card.innerHTML = renderRefeicoes();
  bindRefeicoes(card, refreshRefeicoes);
}

// ── LISTA ──────────────────────────────────────────────────────────────────
function refreshLista() {
  const card = document.getElementById('lista-card');
  if (!card) return;
  card.innerHTML = renderLista();
  bindLista(card, refreshLista);
}

// ── BLOCKBUSTER ────────────────────────────────────────────────────────────
function refreshBlockbuster() {
  const card = document.getElementById('blockbuster-card');
  if (!card) return;
  card.innerHTML = renderBlockbuster();
  bindBlockbuster(card, refreshBlockbuster);
}

// ── VIAGENS ────────────────────────────────────────────────────────────────
function refreshViagens() {
  const card = document.getElementById('viagens-card');
  const tab  = document.getElementById('tab-viagens');
  if (!tab) return;
  tab.innerHTML = renderViagens();
  const c = document.getElementById('viagens-card');
  if (c) bindViagens(c, refreshViagens);
}

// ── IOT ────────────────────────────────────────────────────────────────────
function refreshIot() {
  iot.outdoorTemp = weatherData?.current_weather?.temperature ?? null;
  const card = document.getElementById('iot-card');
  if (!card) return;
  card.innerHTML = renderIot();
  bindIot(card, refreshIot);
}

// ── TAB SWITCHING ──────────────────────────────────────────────────────────
function initTabs() {
  document.getElementById('header-location').textContent = `📍 ${LOCATION}`;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-page').forEach(p => p.classList.toggle('active', p.id === `tab-${activeTab}`));

      if (activeTab === 'refeicoes' && !refeicInitialised) {
        refeicInitialised = true;
        await initRefeicoes();
        refreshRefeicoes();
      } else if (activeTab === 'lista' && !listaInitialised) {
        listaInitialised = true;
        await initLista();
        refreshLista();
      } else if (activeTab === 'iot' && !iotInitialised) {
        iotInitialised = true;
        await initIot();
        refreshIot();
        setInterval(async () => {
          if (activeTab !== 'iot') return;
          await fetchIotStates();
          refreshIot();
        }, 30_000);
      } else if (activeTab === 'blockbuster' && !bbInitialised) {
        bbInitialised = true;
        await initBlockbuster();
        refreshBlockbuster();
      } else if (activeTab === 'energia' && !energiaInitialised) {
        energiaInitialised = true;
        const el = document.getElementById('energia-card');
        refreshEnergia = () =>
          fetchEnergy()
            .then(d => renderEnergia(d, el, refreshEnergia))
            .then(() => fetchAnalysis().then(a => renderTrend(a, el)).catch(() => {}))
            .catch(() => renderEnergia(null, el));
        refreshEnergia();
        setInterval(() => { if (activeTab === 'energia') refreshEnergia(); }, 60_000);
      } else if (activeTab === 'viagens' && !viagensInitialised) {
        viagensInitialised = true;
        await initViagens();
        refreshViagens();
      }
    });
  });

  const tabBar  = document.querySelector('.tab-bar');
  const tabWrap = document.querySelector('.tab-bar-wrap');
  function _updateTabOverflow() {
    if (!tabBar || !tabWrap) return;
    tabWrap.classList.toggle('can-scroll-right',
      tabBar.scrollWidth - tabBar.clientWidth - tabBar.scrollLeft > 2);
  }
  tabBar?.addEventListener('scroll', _updateTabOverflow, { passive: true });
  _updateTabOverflow();
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function render(data) {
  const now         = new Date();
  const currentHour = now.getHours();
  const hourIdx     = data.hourly.time.findIndex((t, i) => new Date(t).getHours() === currentHour && Math.floor(i / 24) === 0);
  const idx         = hourIdx >= 0 ? hourIdx : 0;

  const currentTemp = data.current_weather.temperature;
  const currentWind = data.current_weather.windspeed;
  const currentRain = data.hourly.precipitation_probability[idx] || 0;
  const currentUV   = data.hourly.uv_index[idx] || 0;
  const currentIcon = getWeatherIcon(currentRain, currentWind, currentUV);

  const plan        = getWashPlan(data.hourly);
  const verdict     = getWashVerdict(plan);
  const hourlySlots = getHourlySlots(data.hourly);

  const forecastDays = data.daily.time.slice(0, 3).map((t, i) => {
    const rain = data.daily.precipitation_probability_max[i];
    const wind = data.daily.windspeed_10m_max[i];
    return {
      name: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : DAYS_PT[new Date(t).getDay()],
      max:  Math.round(data.daily.temperature_2m_max[i]),
      min:  Math.round(data.daily.temperature_2m_min[i]),
      rain, icon: getWeatherIcon(rain, wind, 5)
    };
  });

  document.getElementById('app').innerHTML = `

    <!-- CASA TAB -->
    <div class="tab-page ${activeTab === 'casa' ? 'active' : ''}" id="tab-casa">
      <div class="card fade-in">
        <div class="card-label">Tempo agora</div>
        <div class="weather-now">
          <div class="weather-temp-big">${Math.round(currentTemp)}°</div>
          <div class="weather-now-details">
            <div class="weather-condition">${currentIcon} ${currentRain > 50 ? 'Com chuva' : currentRain > 20 ? 'Possível chuva' : currentWind > 30 ? 'Ventoso' : currentUV > 6 ? 'Muito sol' : 'Tempo agradável'}</div>
            <div class="weather-meta">
              <span class="weather-meta-item">💧 ${currentRain}% chuva</span>
              <span class="weather-meta-item">💨 ${Math.round(currentWind)} km/h</span>
              <span class="weather-meta-item">☀️ UV ${Math.round(currentUV)}</span>
            </div>
          </div>
        </div>
        <div class="forecast-strip">
          ${forecastDays.map((d, i) => `
            <div class="forecast-day" data-day-idx="${i}">
              <div class="forecast-day-name">${d.name}</div>
              <div class="forecast-icon">${d.icon}</div>
              <div class="forecast-temps"><span class="forecast-max">${d.max}°</span><span class="forecast-min"> / ${d.min}°</span></div>
              <div class="forecast-rain">💧 ${d.rain}%</div>
            </div>`).join('')}
        </div>
        <div class="weather-hourly-panel" id="weather-hourly-panel"></div>
      </div>

      <div class="quote-card fade-in">
        <div class="quote-mark">"</div>
        <div class="quote-text">${getQuote()}</div>
      </div>

      <div class="status-bar fade-in">
        <span><span class="refresh-dot"></span>Atualiza a cada 10 min</span>
        <span>Última atualização: ${now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>

    <!-- ROUPA TAB -->
    <div class="tab-page ${activeTab === 'roupa' ? 'active' : ''}" id="tab-roupa">
      <div class="wash-card fade-in">
        <div class="wash-verdict">
          <div class="wash-icon">${verdict.icon}</div>
          <div>
            <div class="wash-title ${verdict.cls}">${verdict.title}</div>
            <div class="wash-subtitle">${verdict.sub}</div>
          </div>
        </div>
        ${plan.canDry && !plan.tooLate ? `
        <div class="wash-plan">
          <div class="wash-plan-row"><span class="wash-plan-icon">🫧</span><span class="wash-plan-label">Lavar às</span><span class="wash-plan-time">${plan.washStart}</span></div>
          <div class="wash-plan-arrow">↓</div>
          <div class="wash-plan-row"><span class="wash-plan-icon">👕</span><span class="wash-plan-label">Estender às</span><span class="wash-plan-time">${plan.hangTime}</span></div>
          <div class="wash-plan-arrow">↓</div>
          <div class="wash-plan-row"><span class="wash-plan-icon">✨</span><span class="wash-plan-label">Seco por volta das</span><span class="wash-plan-time accent">${plan.dryBy}</span></div>
        </div>` : ''}
      </div>

      <div class="card fade-in">
        <div class="card-label">Janelas de secagem hoje</div>
        <div class="hourly-grid">
          ${hourlySlots.map(s => `
            <div class="hour-slot ${!s.hasSun ? 'bad' : s.score >= 70 ? 'best' : s.score >= 45 ? 'ok' : 'bad'}">
              <div class="hour-label">${String(s.hour).padStart(2,'0')}h</div>
              <div class="hour-icon">${s.icon}</div>
              <div class="hour-rain">${s.hasSun ? s.rain + '%' : '🏠'}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card fade-in" id="planner-card">
        ${renderPlannerHTML(coloredCounts, whiteCounts, plannerMode, maintenanceData)}
      </div>
    </div>

    <!-- REFEIÇÕES TAB -->
    <div class="tab-page ${activeTab === 'refeicoes' ? 'active' : ''}" id="tab-refeicoes">
      <div class="card fade-in" id="refeicoes-card">
        <div class="plan-empty">A carregar refeições…</div>
      </div>
    </div>

    <!-- LISTA TAB -->
    <div class="tab-page ${activeTab === 'lista' ? 'active' : ''}" id="tab-lista">
      <div class="card fade-in" id="lista-card">
        <div class="lista-empty">A carregar lista…</div>
      </div>
    </div>

    <!-- IOT TAB -->
    <div class="tab-page ${activeTab === 'iot' ? 'active' : ''}" id="tab-iot">
      <div class="card fade-in" id="iot-card">
        <div class="loading"><div class="spinner"></div> A carregar...</div>
      </div>
    </div>

    <!-- BLOCKBUSTER TAB -->
    <div class="tab-page ${activeTab === 'blockbuster' ? 'active' : ''}" id="tab-blockbuster">
      <div class="card fade-in" id="blockbuster-card">
        <div class="loading"><div class="spinner"></div> A carregar...</div>
      </div>
    </div>

    <!-- ENERGIA TAB -->
    <div class="tab-page ${activeTab === 'energia' ? 'active' : ''}" id="tab-energia">
      <div class="card fade-in" id="energia-card">
        <div class="loading"><div class="spinner"></div> A carregar...</div>
      </div>
    </div>

    <!-- VIAGENS TAB -->
    <div class="tab-page ${activeTab === 'viagens' ? 'active' : ''}" id="tab-viagens">
      <div class="loading"><div class="spinner"></div> A carregar...</div>
    </div>

  `;

  updateClock();
  bindPlannerEvents(coloredCounts, whiteCounts, plannerMode, onMaintUpdate, onReset);

  if (activeTab === 'refeicoes' && refeicInitialised) {
    refreshRefeicoes();
  }
  if (activeTab === 'lista' && listaInitialised) {
    refreshLista();
  }
  if (activeTab === 'iot' && iotInitialised) {
    refreshIot();
  }
  if (activeTab === 'blockbuster' && bbInitialised) {
    refreshBlockbuster();
  }
  if (activeTab === 'energia' && energiaInitialised && refreshEnergia) {
    refreshEnergia();
  }
  if (activeTab === 'viagens' && viagensInitialised) {
    refreshViagens();
  }

  bindWeatherHourly(data);
}

// ── WEATHER HOURLY DETAIL ──────────────────────────────────────────────────
function _rainSummary(probs, hours) {
  const fmt = h => `${String(h).padStart(2, '0')}h`;
  const windows = [];
  let start = null;
  probs.forEach((p, i) => {
    if (p >= 30 && start === null) start = hours[i];
    else if (p < 30 && start !== null) { windows.push(`${fmt(start)}–${fmt(hours[i])}`); start = null; }
  });
  if (start !== null) windows.push(`${fmt(start)}–${fmt(hours[hours.length - 1] + 1)}`);
  return windows.length ? '💧 ' + windows.join(' · ') : 'Sem chuva prevista';
}

function _renderHourlyPanel(panel, data, idx) {
  const s     = idx * 24;
  const times = data.hourly.time.slice(s, s + 24);
  const probs = data.hourly.precipitation_probability.slice(s, s + 24);
  const temps = data.hourly.temperature_2m.slice(s, s + 24);
  const hours = times.map(t => new Date(t).getHours());
  const label = idx === 0 ? 'Hoje' : idx === 1 ? 'Amanhã' : DAYS_PT[new Date(data.daily.time[idx]).getDay()];
  const barsHTML = times.map((_, i) => {
    const prob = probs[i];
    const op   = prob < 10 ? 0.15 : prob < 30 ? 0.45 : 1;
    return `
    <div class="hourly-col${prob >= 30 ? ' rain' : ''}">
      <div class="hourly-col-bar-wrap">
        <div class="hourly-col-bar" style="height:${Math.max(2, prob)}%;opacity:${op}"></div>
      </div>
      <div class="hourly-col-time">${String(hours[i]).padStart(2, '0')}h</div>
      <div class="hourly-col-temp">${Math.round(temps[i])}°</div>
    </div>`;
  }).join('');
  panel.innerHTML = `
    <div class="weather-hourly-header">
      <span class="weather-hourly-day">${label} — hora a hora</span>
      <span class="weather-hourly-info">${_rainSummary(probs, hours)}</span>
    </div>
    <div class="weather-hourly-bars">${barsHTML}</div>`;
}

function bindWeatherHourly(data) {
  const panel = document.getElementById('weather-hourly-panel');
  if (!panel) return;

  if (_activeHourlyDay !== null) {
    _renderHourlyPanel(panel, data, _activeHourlyDay);
    document.querySelectorAll('.forecast-day').forEach(d =>
      d.classList.toggle('active', parseInt(d.dataset.dayIdx) === _activeHourlyDay)
    );
  }

  document.querySelectorAll('.forecast-day').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.dayIdx);
      if (_activeHourlyDay === idx) {
        panel.innerHTML = '';
        _activeHourlyDay = null;
        document.querySelectorAll('.forecast-day').forEach(d => d.classList.remove('active'));
        return;
      }
      _activeHourlyDay = idx;
      document.querySelectorAll('.forecast-day').forEach(d => d.classList.toggle('active', d === el));
      _renderHourlyPanel(panel, data, idx);
    });
  });
}

// ── INIT ───────────────────────────────────────────────────────────────────
async function init() {
  try {
    weatherData     = await fetchWeather();
    maintenanceData = await fetchMaintenance();
    render(weatherData);
  } catch (e) {
    document.getElementById('app').innerHTML = `<div class="loading">❌ Sem dados. A tentar novamente em 5 min...</div>`;
    setTimeout(init, 5 * 60 * 1000);
  }
}

// ── BOOT ───────────────────────────────────────────────────────────────────
scheduleWatchdogReload();
startBurnInProtection();
initTabs();
startClock();
init();
setInterval(init, 10 * 60 * 1000);
