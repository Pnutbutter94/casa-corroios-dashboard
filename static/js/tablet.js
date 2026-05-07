const NIGHT_DIM_START = 23;
const NIGHT_DIM_END   = 7.5;
const WATCHDOG_HOUR   = 4;
const PIXEL_SHIFTS    = [[0,0],[2,0],[2,2],[0,2]];
let shiftIdx = 0;

export function scheduleWatchdogReload() {
  const now    = new Date();
  const target = new Date();
  target.setHours(WATCHDOG_HOUR, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  setTimeout(() => location.reload(), target - now);
}

export function startBurnInProtection() {
  function updateDimmer() {
    const h = new Date().getHours();
    document.getElementById('dimmer').classList.toggle('active', h >= NIGHT_DIM_START || h < NIGHT_DIM_END);
  }
  updateDimmer();
  setInterval(updateDimmer, 60 * 1000);

  setInterval(() => {
    shiftIdx = (shiftIdx + 1) % PIXEL_SHIFTS.length;
    const [x, y] = PIXEL_SHIFTS[shiftIdx];
    document.getElementById('app').style.transform = `translate(${x}px, ${y}px)`;
  }, 30 * 60 * 1000);
}
