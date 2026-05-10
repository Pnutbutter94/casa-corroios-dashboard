# Casa Corroios Dashboard

## What this is
Wall-mounted smart home dashboard (Corroios, Almada, Portugal). Runs 24/7 on an Android 10 tablet via Termux + Gunicorn. Reliability and low resource use beat every other concern.

## Stack
- Backend: Python 3 + Flask + Gunicorn (2 workers, port 8080) — `server.py`
- Frontend: Vanilla JS (ES modules, no bundler), plain CSS — `static/`
- Storage: JSON flat files in `data/`
- No npm, no React/Vue/Angular, no build step. Never add them.
- Location hardcoded: LAT=38.6333, LON=-9.0333 (Corroios, Almada)

## Tablet
- SSH: `ssh -p 8022 192.168.1.73` (password auth)
- Restart server: `cd ~/dashboard && bash start.sh`
- Deploy workflow: commit + push on Mac → SSH to tablet → `git pull && bash start.sh`
- Run `/deploy` to do this in one step.

## Architecture rules
- Reliability > features. Performance > convenience.
- Local-first — minimize cloud dependencies.
- Propose architecture before coding anything large. Never rush to implement.
- Hard no-list: heavy JS frameworks, constant cloud polling, heavy animations, WebGL, video backgrounds, voice assistant, push notification cloud services.
- New Python packages: ask first — Termux/ARM doesn't build everything.

## Security (non-negotiable)
- All user-controlled strings inserted via innerHTML must use `esc()` from `static/js/utils/esc.js`.
- Server PATCH handlers must whitelist fields via `ALLOWED_*` sets in `server.py`. Never apply raw request JSON to stored data.
- Do not weaken CSP headers in `security_headers()`.

## Code conventions
- Comments: one short line max, only when WHY is non-obvious. No docstrings, no multi-line comment blocks.
- CSS: keep in the widget's matching .css file (refeicoes.css, lista.css, etc.)
- UI text: Portuguese (pt-PT). Code and comments: English.
- Don't add error handling for scenarios that can't happen. Trust internal guarantees.

## File map
```
server.py                     — Flask app, all API routes, security headers
static/index.html             — shell, tab buttons, CSS/JS imports
static/js/app.js              — tab router, lazy init, refresh logic
static/js/widgets/            — one file per tab (refeicoes.js, lista.js, clima.js, …)
static/js/utils/esc.js        — XSS escape helper (always use for innerHTML)
static/css/                   — one CSS file per widget
data/                         — JSON flat-file storage
start.sh                      — Gunicorn start/restart script (run on tablet)
```
