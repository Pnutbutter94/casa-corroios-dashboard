import { LAT, LON } from '../config.js';

export function getSunTimes(date) {
  const lat = LAT * Math.PI / 180;
  const lon = LON;
  const JD  = Math.floor(date / 86400000) + 2440587.5;
  const n   = JD - 2451545.0;
  const L   = (280.46 + 0.9856474 * n) % 360;
  const g   = (357.528 + 0.9856003 * n) % 360;
  const gR  = g * Math.PI / 180;
  const lambda  = (L + 1.915 * Math.sin(gR) + 0.02 * Math.sin(2 * gR)) * Math.PI / 180;
  const epsilon = 23.439 * Math.PI / 180;
  const sinDec  = Math.sin(epsilon) * Math.sin(lambda);
  const dec     = Math.asin(sinDec);
  const cosLat  = Math.cos(lat);
  const sinLat  = Math.sin(lat);
  const cosHourAngle = (Math.cos(Math.PI * (90.833 / 180)) - sinLat * sinDec) / (cosLat * Math.cos(dec));
  if (cosHourAngle > 1 || cosHourAngle < -1) return { sunrise: 6, sunset: 20 };
  const H        = Math.acos(cosHourAngle) * 180 / Math.PI;
  const eqTime   = (-7.655 * Math.sin(gR) + 9.873 * Math.sin(2 * lambda - 3.588));
  const solarNoon = 720 - 4 * lon - eqTime;
  return {
    sunrise:    (solarNoon - 4 * H) / 60,
    sunset:     (solarNoon + 4 * H) / 60,
    solarNoon:  solarNoon / 60
  };
}

// António's cordas: 3rd floor, building opposite same height, faces South.
// Sun clears the shadow earlier in summer (high angle) than winter (low angle).
export function getSunStartHour() {
  const now       = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const declination  = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * Math.PI / 180);
  const noonSunAngle = 90 - (LAT - declination);
  const t = (noonSunAngle - 28) / (75 - 28);
  return 13.5 - Math.max(0, Math.min(1, t)) * 1.5;
}

export function getSunEndHour() {
  return getSunTimes(new Date()).sunset - 0.5;
}
