import { getSunStartHour, getSunEndHour } from '../utils/sun.js';
import { getWeatherIcon } from '../utils/icons.js';

const WASH_DURATION = 2;
const MIN_DRY_HOURS = 2.5;

export function getWashScore(rainProb, windSpeed, temp, uvIndex) {
  let score = 100;
  score -= rainProb * 1.2;
  if (windSpeed > 40)      score -= 20;
  else if (windSpeed > 25) score -= 5;
  else if (windSpeed > 10) score += 5;
  if (temp < 10)           score -= 25;
  else if (temp < 15)      score -= 10;
  if (uvIndex < 1)         score -= 20;
  else if (uvIndex < 3)    score -= 8;
  return Math.max(0, Math.min(100, score));
}

export function getWashPlan(hourly) {
  const now         = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const sunStart    = getSunStartHour();
  const sunEnd      = getSunEndHour();
  const dryingHoursAvailable = sunEnd - sunStart;

  const idealWashStart  = sunStart - WASH_DURATION;
  const latestWashStart = sunEnd - MIN_DRY_HOURS - WASH_DURATION;

  let dyingWindowScore = 0, dyingHours = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (Math.floor(i / 24) > 0) break;
    const h = new Date(hourly.time[i]).getHours();
    if (h >= Math.floor(sunStart) && h <= Math.ceil(sunEnd)) {
      dyingWindowScore += getWashScore(
        hourly.precipitation_probability[i],
        hourly.windspeed_10m[i],
        hourly.temperature_2m[i],
        hourly.uv_index[i]
      );
      dyingHours++;
    }
  }
  const avgDryScore = dyingHours > 0 ? dyingWindowScore / dyingHours : 0;

  const fmt = h => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  };

  let washStart = Math.min(Math.max(currentHour + 0.25, idealWashStart), latestWashStart);
  const hangTime      = washStart + WASH_DURATION;
  const expectedDryBy = Math.min(hangTime + Math.max(2, 5 - (avgDryScore / 25)), sunEnd);

  return {
    canDry:       avgDryScore >= 40 && dryingHoursAvailable >= MIN_DRY_HOURS,
    tooLate:      currentHour > latestWashStart,
    avgDryScore,
    washStart:    fmt(washStart),
    hangTime:     fmt(hangTime),
    dryBy:        fmt(expectedDryBy),
    sunStart:     fmt(sunStart),
    sunEnd:       fmt(sunEnd),
    dryingHours:  dryingHoursAvailable.toFixed(1)
  };
}

export function getWashVerdict(plan) {
  if (plan.tooLate)          return { cls: 'bad',  icon: '🌙', title: 'Tarde demais para hoje',  sub: `Sol nas cordas só até às ${plan.sunEnd}. Tenta amanhã.` };
  if (!plan.canDry)          return { cls: 'bad',  icon: '❌', title: 'Não é boa ideia',         sub: 'Chuva ou pouco sol durante a janela de secagem.' };
  if (plan.avgDryScore >= 70) return { cls: 'good', icon: '✅', title: 'Ótimo dia para lavar!',  sub: `Sol nas cordas das ${plan.sunStart} às ${plan.sunEnd} (${plan.dryingHours}h)` };
  return                             { cls: 'warn', icon: '⚠️', title: 'Pode arriscar',          sub: `Sol parcial das ${plan.sunStart} às ${plan.sunEnd}. Fique atento.` };
}

export function getHourlySlots(hourly) {
  const currentHour = new Date().getHours();
  const sunStart    = getSunStartHour();
  const sunEnd      = getSunEndHour();
  const slots       = [];

  for (let i = 0; i < hourly.time.length; i++) {
    if (Math.floor(i / 24) > 0) break;
    const h = new Date(hourly.time[i]).getHours();
    if (h < currentHour || slots.length >= 8) continue;

    const rain   = hourly.precipitation_probability[i];
    const hasSun = h >= Math.floor(sunStart) && h <= Math.ceil(sunEnd);
    const score  = hasSun ? getWashScore(rain, hourly.windspeed_10m[i], hourly.temperature_2m[i], hourly.uv_index[i]) : 0;
    slots.push({
      hour: h, rain, score, hasSun,
      icon: hasSun ? getWeatherIcon(rain, hourly.windspeed_10m[i], hourly.uv_index[i]) : '🏠'
    });
  }
  return slots;
}
