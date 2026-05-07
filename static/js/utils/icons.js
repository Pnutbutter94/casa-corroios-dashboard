export function getWeatherIcon(rain, wind, uv) {
  if (rain > 60) return '🌧️';
  if (rain > 30) return '🌦️';
  if (wind > 30) return '💨';
  if (uv > 6)   return '☀️';
  if (uv > 3)   return '⛅';
  return '🌤️';
}
