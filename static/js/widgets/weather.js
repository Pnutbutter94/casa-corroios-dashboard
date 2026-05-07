export async function fetchWeather() {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
