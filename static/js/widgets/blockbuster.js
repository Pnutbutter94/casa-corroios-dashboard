import { esc } from '../utils/esc.js';

export const bb = { queue: [], disk: null, watched: null, library: null, ratings: [] };

let _searchTimer    = null;
let _onRefresh      = null;
let _prevQueueCount = -1;
let _queuePollTimer = null;

export async function initBlockbuster() {
    await Promise.all([_fetchQueue(), _fetchDisk(), _fetchWatched(), _fetchLibrary(), _fetchRatings()]);
    _prevQueueCount = bb.queue.length;
    _startQueuePoll();
}

async function _fetchQueue()   { try { bb.queue   = await fetch('/api/blockbuster/queue').then(r => r.ok ? r.json() : []); } catch (_) {} }
async function _fetchDisk()    { try { bb.disk    = await fetch('/api/blockbuster/disk').then(r => r.ok ? r.json() : null); } catch (_) {} }
async function _fetchWatched() { try { bb.watched = await fetch('/api/blockbuster/watched').then(r => r.ok ? r.json() : null); } catch (_) {} }
async function _fetchLibrary() { try { bb.library = await fetch('/api/blockbuster/library').then(r => r.ok ? r.json() : null); } catch (_) {} }
async function _fetchRatings() { try { bb.ratings = await fetch('/api/blockbuster/ratings').then(r => r.ok ? r.json() : []); } catch (_) {} }

function _fmtMb(mb) {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

function _fmtSpeed(bps) {
    if (bps >= 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
    if (bps >= 1024)        return `${Math.round(bps / 1024)} KB/s`;
    return `${bps} B/s`;
}

const QUEUE_LABELS = {
    downloading:   'A descarregar',
    queued:        'Em fila',
    warning:       'Aviso',
    failed:        'Falhou',
    paused:        'Em pausa',
    completed:     'Concluído',
    delay:         'Atraso',
    importpending: 'A importar',
    importblocked: 'Bloqueado',
};
const QUEUE_STATUS_CLS = { warning: 'warn', failed: 'bad', paused: 'muted', completed: 'good' };

function _catalogueHTML() {
    if (!bb.library) return '<div class="bb-empty">A carregar catálogo...</div>';
    const { movies, series } = bb.library;

    const _row = (items, label, type) => {
        if (!items.length) return '';
        const posters = items.map(item => {
            const displayTitle = item.originalTitle || item.title;
            return `
            <div class="bb-poster-wrap"
                 data-jfid="${esc(item.id)}"
                 data-type="${type}"
                 data-title="${esc(displayTitle)}"
                 data-year="${item.year || ''}">
                <img class="bb-poster-img" src="/api/blockbuster/jf-poster/${esc(item.id)}" loading="lazy" alt=""
                     onerror="this.closest('.bb-poster-wrap').classList.add('bb-poster-err')">
                <div class="bb-poster-overlay">
                    <div class="bb-poster-title">${esc(displayTitle)}</div>
                    ${item.year ? `<div class="bb-poster-year">${item.year}</div>` : ''}
                </div>
            </div>`;
        }).join('');
        return `
        <div class="bb-row-label">${label} <span class="bb-row-count">${items.length}</span></div>
        <div class="bb-poster-row">${posters}</div>`;
    };

    return _row(movies, 'Filmes', 'movie') + _row(series, 'Séries', 'series');
}

function _diskHTML() {
    if (!bb.disk) return '<div class="bb-empty">Sem dados</div>';
    const { usedGb, quotaGb, moviesGb, tvGb } = bb.disk;
    const pct = Math.min(100, Math.round(usedGb / quotaGb * 100));
    const warnCls = pct > 90 ? 'bad' : pct > 75 ? 'warn' : '';
    const moviesPct = +(moviesGb / quotaGb * 100).toFixed(1);
    const tvPct     = +(tvGb     / quotaGb * 100).toFixed(1);
    return `
    <div class="bb-disk-bar-wrap ${warnCls}">
        <div class="bb-disk-seg bb-ds-movies" style="width:${moviesPct}%">${moviesPct > 9 ? moviesGb + ' GB' : ''}</div>
        <div class="bb-disk-seg bb-ds-tv"     style="width:${tvPct}%">${tvPct > 9 ? tvGb + ' GB' : ''}</div>
    </div>
    <div class="bb-disk-stats">
        <span class="bb-disk-used">${usedGb} GB / ${quotaGb} GB</span>
        <span class="bb-disk-legend"><i class="bb-dot bb-ds-movies"></i>Filmes&ensp;<i class="bb-dot bb-ds-tv"></i>Séries</span>
    </div>`;
}

function _queueHTML() {
    if (!bb.queue.length) return '<div class="bb-empty">Nenhum download em curso</div>';
    return bb.queue.map(item => {
        const icon          = item.type === 'movie' ? '🎬' : '📺';
        const statusKey     = (item.status || '').toLowerCase();
        const trackedKey    = (item.trackedState || '').toLowerCase();
        const isDownloading = trackedKey === 'downloading';
        const isActionable  = statusKey === 'warning' || statusKey === 'failed';
        const displayLabel  = isActionable
            ? (QUEUE_LABELS[statusKey] || esc(item.status))
            : isDownloading
                ? 'A descarregar'
                : (QUEUE_LABELS[statusKey] || esc(item.status));
        const statusCls  = isActionable ? (QUEUE_STATUS_CLS[statusKey] || '') : '';
        const barCls     = statusCls === 'warn' ? 'warn' : statusCls === 'bad' ? 'bad' : '';
        const hasQbData  = isDownloading && item.seeds != null;
        const speedStr   = hasQbData && item.dlspeed > 0 ? ' · ' + _fmtSpeed(item.dlspeed) : '';
        const seedStr    = hasQbData ? ` · ${item.seeds} seed${item.seeds !== 1 ? 's' : ''}` : '';
        const stalled    = hasQbData && item.dlspeed === 0 && item.seeds === 0;
        const metaCls    = statusCls ? ' bb-s-' + statusCls : stalled ? ' bb-s-warn' : '';
        return `
        <div class="bb-queue-item${isActionable ? ' bb-queue-problem' : ''}">
            <span class="bb-queue-icon">${icon}</span>
            <div class="bb-queue-info">
                <div class="bb-queue-title">${esc(item.title)}${item.epCount > 1 ? ` <span class="bb-queue-epcnt">${item.epCount} ep</span>` : ''}</div>
                <div class="bb-queue-meta${metaCls}">${displayLabel}${item.sizeMb > 0 ? ' · ' + _fmtMb(item.sizeMb) : ''}${speedStr}${seedStr}</div>
                ${item.message ? `<div class="bb-queue-msg">${esc(item.message)}</div>` : ''}
            </div>
            ${isActionable
                ? `<button class="bb-retry-btn"
                       data-queue-id="${esc(String(item.queueId))}"
                       data-queue-source="${esc(item.source)}">Tentar outro</button>`
                : `<div class="bb-queue-pct-wrap">
                       <div class="bb-queue-pct-bar${barCls ? ' ' + barCls : ''}" style="width:${item.pct}%"></div>
                       <span class="bb-queue-pct-label">${item.pct === 0 ? 'A iniciar' : item.pct + '%'}</span>
                   </div>`}
        </div>`;
    }).join('');
}

function _watchedHTML() {
    if (!bb.watched) return '<div class="bb-empty">A carregar...</div>';
    const { movies, seasons } = bb.watched;
    if (!movies.length && !seasons.length) return '<div class="bb-empty">Nada para limpar</div>';
    const mvHTML = movies.map(m => `
        <div class="bb-clean-item">
            <div class="bb-clean-info">
                <span class="bb-clean-icon">🎬</span>
                <div>
                    <div class="bb-clean-title">${esc(m.title)}${m.year ? ` <span class="bb-clean-year">${m.year}</span>` : ''}</div>
                    <div class="bb-clean-size">${_fmtMb(m.sizeMb)}</div>
                </div>
            </div>
            <button class="bb-delete-btn" data-delete-movie="${esc(String(m.radarrId))}">Apagar</button>
        </div>`).join('');
    const tvHTML = seasons.map(s => `
        <div class="bb-clean-item">
            <div class="bb-clean-info">
                <span class="bb-clean-icon">📺</span>
                <div>
                    <div class="bb-clean-title">${esc(s.title)} <span class="bb-clean-year">T${s.seasonNum}</span></div>
                    <div class="bb-clean-size">${_fmtMb(s.sizeMb)}</div>
                </div>
            </div>
            <button class="bb-delete-btn" data-delete-season="${esc(String(s.sonarrId))}" data-season-num="${s.seasonNum}">Apagar</button>
        </div>`).join('');
    return mvHTML + tvHTML;
}

function _starsHTML(val, person) {
    let h = '';
    for (let i = 1; i <= 5; i++) {
        h += `<button class="bb-star${i <= (val || 0) ? ' bb-star-on' : ''}" data-person="${person}" data-val="${i}">★</button>`;
    }
    return h;
}

function _leaderboardHTML(showAll) {
    if (!bb.ratings || !bb.ratings.length) return '<div class="bb-empty">Sem avaliações ainda</div>';
    const sorted = [...bb.ratings].sort((a, b) => {
        const avgA = ((a.ratingAntonio || 0) + (a.ratingInes || 0)) / 2;
        const avgB = ((b.ratingAntonio || 0) + (b.ratingInes || 0)) / 2;
        return avgB - avgA;
    });
    const visible = showAll ? sorted : sorted.slice(0, 5);
    const stars   = n => '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));
    const rows = visible.map(r => `
        <div class="bb-lb-item">
            <img class="bb-lb-poster" src="/api/blockbuster/jf-poster/${esc(r.jfId)}" loading="lazy" alt=""
                 onerror="this.style.display='none'">
            <div class="bb-lb-info">
                <div class="bb-lb-title">${esc(r.title)}${r.year ? ` <span class="bb-lb-year">${r.year}</span>` : ''}</div>
                <div class="bb-lb-ratings">
                    <span class="bb-lb-person">António <span class="bb-lb-stars">${stars(r.ratingAntonio)}</span></span>
                    <span class="bb-lb-person">Inês <span class="bb-lb-stars">${stars(r.ratingInes)}</span></span>
                </div>
                ${r.commentAntonio ? `<div class="bb-lb-comment">António: "${esc(r.commentAntonio)}"</div>` : ''}
                ${r.commentInes  ? `<div class="bb-lb-comment">Inês: "${esc(r.commentInes)}"</div>` : ''}
            </div>
        </div>`).join('');
    const more = sorted.length > 5 && !showAll
        ? `<button class="bb-lb-more" id="bb-lb-more">Ver todos (${sorted.length}) ▾</button>`
        : '';
    return rows + more;
}

export function renderBlockbuster() {
    return `
    <div class="bb-banner">
        <span class="bb-banner-icon">🎬</span>
        <span class="bb-banner-text">BLOCKBUSTER</span>
    </div>

    <div class="card-label">Pesquisar</div>
    <div class="bb-search-wrap">
        <div class="bb-search-row">
            <input class="bb-search-input" type="text" placeholder="Filme ou série..." id="bb-search-input" autocomplete="off">
            <button class="bb-search-clear" id="bb-search-clear" style="display:none">×</button>
        </div>
    </div>
    <div class="bb-results" id="bb-results"></div>

    <div class="bb-section-hdr bb-gap">
        <span class="card-label">A descarregar</span>
        <button class="bb-refresh-btn" id="bb-queue-refresh">↻</button>
    </div>
    <div class="bb-queue" id="bb-queue-list">${_queueHTML()}</div>

    <div class="card-label bb-gap">Disco</div>
    <div class="bb-disk">${_diskHTML()}</div>

    <div class="card-label bb-gap">Em Exibição</div>
    ${_catalogueHTML()}

    <div class="card-label bb-gap">Para limpar</div>
    <div class="bb-clean">${_watchedHTML()}</div>

    <div class="card-label bb-gap">Favoritos</div>
    <div class="bb-leaderboard" id="bb-leaderboard">${_leaderboardHTML(false)}</div>
    `;
}

// ── Queue helpers ────────────────────────────────────────────────────────────

function _bindQueueBtns(el, onRefresh) {
    if (!el) return;
    el.querySelectorAll('[data-queue-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = '...';
            const res = await fetch(
                `/api/blockbuster/queue/${btn.dataset.queueId}?source=${btn.dataset.queueSource}`,
                { method: 'DELETE' }
            );
            if (res.ok) {
                await _fetchQueue();
                el.innerHTML = _queueHTML();
                _bindQueueBtns(el, onRefresh);
            } else {
                btn.textContent = 'Erro';
                btn.disabled = false;
            }
        });
    });
}

// ── Main bind ────────────────────────────────────────────────────────────────

export function bindBlockbuster(container, onRefresh) {
    _onRefresh = onRefresh;

    // Poster click → detail modal
    container.querySelectorAll('.bb-poster-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
            _openDetailModal(wrap.dataset.jfid, wrap.dataset.type, wrap.dataset.title, wrap.dataset.year || '');
        });
    });

    // Leaderboard expand
    const lb = container.querySelector('#bb-leaderboard');
    if (lb) {
        lb.addEventListener('click', e => {
            if (e.target.id === 'bb-lb-more') lb.innerHTML = _leaderboardHTML(true);
        });
    }

    const queueList = container.querySelector('#bb-queue-list');
    _bindQueueBtns(queueList, onRefresh);

    const refreshBtn = container.querySelector('#bb-queue-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            await _fetchQueue();
            if (queueList) { queueList.innerHTML = _queueHTML(); _bindQueueBtns(queueList, onRefresh); }
            refreshBtn.disabled = false;
        });
    }

    const input    = container.querySelector('#bb-search-input');
    const clearBtn = container.querySelector('#bb-search-clear');

    function _clearSearch() {
        clearTimeout(_searchTimer);
        if (input) input.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        const res = document.getElementById('bb-results');
        if (res) res.innerHTML = '';
    }

    if (input) {
        input.addEventListener('input', () => {
            clearTimeout(_searchTimer);
            const q = input.value.trim();
            if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
            const res = document.getElementById('bb-results');
            if (!q) { if (res) res.innerHTML = ''; return; }
            _searchTimer = setTimeout(() => _doSearch(q), 400);
        });
        input.addEventListener('blur', () => setTimeout(() => { if (document.hasFocus()) _clearSearch(); }, 300));
    }
    const resultsDiv = container.querySelector('#bb-results');
    if (resultsDiv) {
        resultsDiv.addEventListener('mousedown', e => e.preventDefault());
    }
    if (clearBtn) {
        clearBtn.addEventListener('mousedown', e => e.preventDefault());
        clearBtn.addEventListener('click', () => { _clearSearch(); input?.focus(); });
    }

    container.querySelectorAll('[data-delete-movie]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!btn.dataset.confirmPending) {
                btn.dataset.confirmPending = '1';
                btn.textContent = 'Confirmar?';
                setTimeout(() => { if (btn.dataset.confirmPending) { delete btn.dataset.confirmPending; btn.textContent = 'Apagar'; } }, 3000);
                return;
            }
            btn.disabled = true;
            await fetch(`/api/blockbuster/delete/movie/${btn.dataset.deleteMovie}`, { method: 'DELETE' });
            await new Promise(r => setTimeout(r, 4000));
            await Promise.all([_fetchWatched(), _fetchDisk(), _fetchLibrary()]);
            onRefresh();
            // Secondary disk refresh — Radarr sizeOnDisk stats can lag
            setTimeout(async () => {
                await _fetchDisk();
                const diskEl = document.querySelector('.bb-disk');
                if (diskEl) diskEl.innerHTML = _diskHTML();
            }, 10000);
        });
    });

    container.querySelectorAll('[data-delete-season]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!btn.dataset.confirmPending) {
                btn.dataset.confirmPending = '1';
                btn.textContent = 'Confirmar?';
                setTimeout(() => { if (btn.dataset.confirmPending) { delete btn.dataset.confirmPending; btn.textContent = 'Apagar'; } }, 3000);
                return;
            }
            btn.disabled = true;
            await fetch('/api/blockbuster/delete/season', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sonarrId:  parseInt(btn.dataset.deleteSeason),
                    seasonNum: parseInt(btn.dataset.seasonNum),
                }),
            });
            await new Promise(r => setTimeout(r, 4000));
            await Promise.all([_fetchWatched(), _fetchDisk(), _fetchLibrary()]);
            onRefresh();
            // Secondary disk refresh — Sonarr sizeOnDisk stats can lag after season delete
            setTimeout(async () => {
                await _fetchDisk();
                const diskEl = document.querySelector('.bb-disk');
                if (diskEl) diskEl.innerHTML = _diskHTML();
            }, 10000);
        });
    });
}

// ── Queue auto-poll ───────────────────────────────────────────────────────────

function _startQueuePoll() {
    if (_queuePollTimer) return;
    _queuePollTimer = setInterval(_pollQueue, 30_000);
}

async function _pollQueue() {
    const prev = _prevQueueCount;
    await _fetchQueue();
    const curr = bb.queue.length;
    _prevQueueCount = curr;

    if (prev > 0 && curr < prev) {
        // Items left the queue (download completed) — refresh library
        await fetch('/api/blockbuster/library/refresh', { method: 'POST' }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));
        await _fetchLibrary();
        if (_onRefresh) _onRefresh();
        return;
    }

    // Update queue display without full re-render
    const ql = document.getElementById('bb-queue-list');
    if (ql) { ql.innerHTML = _queueHTML(); _bindQueueBtns(ql, _onRefresh); }
}

// ── Detail modal ─────────────────────────────────────────────────────────────

function _openDetailModal(jfId, type, title, year) {
    _closeDetailModal();

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay';
    overlay.id = 'bb-modal-overlay';
    overlay.innerHTML = `
        <div class="bb-modal-panel" id="bb-modal-panel">
            <div class="bb-modal-header">
                <div class="bb-modal-htitle">${esc(title)}${year ? `<span class="bb-modal-year"> · ${esc(String(year))}</span>` : ''}</div>
                <button class="bb-modal-close" id="bb-modal-close">×</button>
            </div>
            <div class="bb-modal-body" id="bb-modal-body">
                <div class="bb-empty">A carregar...</div>
            </div>
            <div class="bb-modal-action-bar" id="bb-modal-action-bar" style="display:none"></div>
        </div>`;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.querySelector('#bb-modal-panel').classList.add('bb-modal-open'));

    overlay.addEventListener('click', e => { if (e.target === overlay) _closeDetailModal(); });
    overlay.querySelector('#bb-modal-close').addEventListener('click', _closeDetailModal);

    fetch(`/api/blockbuster/detail?id=${encodeURIComponent(jfId)}&type=${encodeURIComponent(type)}`)
        .then(r => r.json())
        .then(detail => {
            const body = document.getElementById('bb-modal-body');
            if (!body) return;
            if (detail.error) {
                body.innerHTML = `<div class="bb-empty">Erro: ${esc(detail.error)}</div>`;
                return;
            }
            if (type === 'movie') _renderMovieDetail(detail, jfId, title, year);
            else                  _renderSeriesDetail(detail, jfId, title, year);
        })
        .catch(() => {
            const body = document.getElementById('bb-modal-body');
            if (body) body.innerHTML = '<div class="bb-empty">Erro ao carregar detalhes</div>';
        });
}

function _closeDetailModal() {
    const overlay = document.getElementById('bb-modal-overlay');
    if (!overlay) return;
    overlay.querySelector('#bb-modal-panel')?.classList.remove('bb-modal-open');
    setTimeout(() => overlay.remove(), 250);
}

// ── Movie detail ─────────────────────────────────────────────────────────────

function _renderMovieDetail(detail, jfId, title, year) {
    const body = document.getElementById('bb-modal-body');
    if (!body) return;
    body.innerHTML = `
        <div class="bb-det-poster-wrap">
            <img class="bb-det-poster" src="/api/blockbuster/jf-poster/${esc(jfId)}" loading="lazy" alt=""
                 onerror="this.style.display='none'">
            <div class="bb-det-info">
                <div class="bb-det-badge bb-badge-avail">Disponível para ver</div>
                ${detail.sizeMb ? `<div class="bb-det-size">${_fmtMb(detail.sizeMb)}</div>` : ''}
            </div>
        </div>
        ${detail.overview ? `<div class="bb-det-overview">${esc(detail.overview)}</div>` : ''}
        <div class="bb-det-actions">
            <button class="bb-det-watched-btn" id="bb-det-watched">Já vi</button>
            <button class="bb-det-subs-btn" id="bb-det-subs">Obter legendas</button>
            <button class="bb-det-delete-btn" id="bb-det-delete">Apagar ficheiro</button>
        </div>`;

    document.getElementById('bb-det-watched').addEventListener('click', () => {
        _openRatingSheet(jfId, title, year, 'movie', () => {
            const b = document.getElementById('bb-modal-body');
            if (!b) return;
            b.innerHTML = `
                <div class="bb-det-after-rate">
                    <div class="bb-det-after-msg">Avaliação guardada!</div>
                    <div class="bb-det-after-sub">Apagar o ficheiro? (${_fmtMb(detail.sizeMb)})</div>
                    <div class="bb-det-after-btns">
                        <button class="bb-det-delete-confirm" id="bb-after-del">Apagar</button>
                        <button class="bb-det-delete-skip" id="bb-after-keep">Manter</button>
                    </div>
                </div>`;
            document.getElementById('bb-after-del').addEventListener('click', async () => {
                await fetch(`/api/blockbuster/delete/movie/${detail.radarrId}`, { method: 'DELETE' });
                await Promise.all([_fetchWatched(), _fetchDisk()]);
                _closeDetailModal();
            });
            document.getElementById('bb-after-keep').addEventListener('click', _closeDetailModal);
        });
    });

    const subsMovieBtn = document.getElementById('bb-det-subs');
    subsMovieBtn.addEventListener('click', async () => {
        subsMovieBtn.disabled = true;
        subsMovieBtn.textContent = 'A procurar...';
        try {
            const r = await fetch('/api/blockbuster/subtitles/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'movie', radarrId: detail.radarrId }),
            });
            const d = await r.json();
            subsMovieBtn.textContent = d.message || 'Concluído';
        } catch {
            subsMovieBtn.textContent = 'Erro';
        }
        setTimeout(() => { subsMovieBtn.disabled = false; subsMovieBtn.textContent = 'Obter legendas'; }, 4000);
    });

    const delBtn = document.getElementById('bb-det-delete');
    delBtn.addEventListener('click', async () => {
        if (!delBtn.dataset.confirmPending) {
            delBtn.dataset.confirmPending = '1';
            delBtn.textContent = 'Confirmar? (toca de novo)';
            setTimeout(() => { if (delBtn.dataset.confirmPending) { delete delBtn.dataset.confirmPending; delBtn.textContent = 'Apagar ficheiro'; } }, 5000);
            return;
        }
        delBtn.disabled = true;
        await fetch(`/api/blockbuster/delete/movie/${detail.radarrId}`, { method: 'DELETE' });
        await Promise.all([_fetchWatched(), _fetchDisk()]);
        _closeDetailModal();
    });
}

// ── Series detail ────────────────────────────────────────────────────────────

function _episodeStatus(ep) {
    if (ep.hasFile) return 'downloaded';
    const now = new Date().toISOString();
    if (!ep.airDate || ep.airDate > now) return 'future';
    if (!ep.monitored) return 'unmonitored';
    return 'missing';
}

function _renderSeriesDetail(detail, jfId, title, year) {
    const body      = document.getElementById('bb-modal-body');
    const actionBar = document.getElementById('bb-modal-action-bar');
    if (!body) return;

    const now = new Date().toISOString();
    const seasonStatus = s => {
        const released = s.episodes.filter(e => e.airDate && e.airDate <= now);
        if (!released.length) return 'future';
        if (released.every(e => e.hasFile)) return 'downloaded';
        if (released.some(e => !e.hasFile && e.monitored)) return 'missing';
        return 'unmonitored';
    };

    const seasonsHTML = detail.seasons.map(s => {
        const st       = seasonStatus(s);
        const stClass  = st === 'downloaded' ? 'bb-sst-good' : st === 'missing' ? 'bb-sst-warn' : 'bb-sst-muted';
        const dlCount  = s.episodes.filter(e => e.hasFile).length;
        const hasFiles = dlCount > 0;

        const chipsHTML = s.episodes.map(ep => {
            const status = _episodeStatus(ep);
            const cls    = status === 'downloaded' ? 'bb-ec-good'
                         : status === 'missing'    ? 'bb-ec-warn'
                         : status === 'future'     ? 'bb-ec-future'
                         : 'bb-ec-unmon';
            return `<button class="bb-ep-chip ${cls}"
                        data-ep-num="${ep.number}"
                        data-ep-status="${status}"
                        data-ep-title="${esc(ep.title)}"
                        data-ep-air="${esc(ep.airDate || '')}"
                        data-ep-file-id="${ep.episodeFileId || ''}">E${ep.number}</button>`;
        }).join('');

        const delSeasonBtn = hasFiles
            ? `<button class="bb-season-del-btn"
                   data-sonarr-id="${detail.sonarrId}"
                   data-season-num="${s.number}">Apagar</button>`
            : '';

        return `
        <div class="bb-det-season">
            <div class="bb-det-season-hdr">
                <span class="bb-det-season-label ${stClass}">T${s.number}</span>
                <span class="bb-det-season-count">${dlCount}/${s.episodes.length} ep</span>
                ${delSeasonBtn}
            </div>
            <div class="bb-det-ep-row" data-season="${s.number}">${chipsHTML}</div>
        </div>`;
    }).join('');

    body.innerHTML = `
        <div class="bb-det-poster-wrap">
            <img class="bb-det-poster" src="/api/blockbuster/jf-poster/${esc(jfId)}" loading="lazy" alt=""
                 onerror="this.style.display='none'">
            <div class="bb-det-info"></div>
        </div>
        ${detail.overview ? `<div class="bb-det-overview">${esc(detail.overview)}</div>` : ''}
        <div class="bb-det-actions">
            <button class="bb-det-watched-btn" id="bb-det-watched">Já vi</button>
            <button class="bb-det-subs-btn" id="bb-det-subs">Obter legendas</button>
        </div>
        <div class="bb-det-seasons">${seasonsHTML}</div>`;

    // "Já vi" → rating sheet
    document.getElementById('bb-det-watched').addEventListener('click', () => {
        if (actionBar) actionBar.style.display = 'none';
        _openRatingSheet(jfId, title, year, 'series', () => {
            _openDetailModal(jfId, 'series', title, year);
        });
    });

    const subsSeriesBtn = document.getElementById('bb-det-subs');
    subsSeriesBtn.addEventListener('click', async () => {
        subsSeriesBtn.disabled = true;
        subsSeriesBtn.textContent = 'A procurar...';
        try {
            const r = await fetch('/api/blockbuster/subtitles/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'series', sonarrId: detail.sonarrId }),
            });
            const d = await r.json();
            subsSeriesBtn.textContent = d.message || 'Concluído';
        } catch {
            subsSeriesBtn.textContent = 'Erro';
        }
        setTimeout(() => { subsSeriesBtn.disabled = false; subsSeriesBtn.textContent = 'Obter legendas'; }, 4000);
    });

    // Season delete buttons (two-tap)
    body.querySelectorAll('[data-sonarr-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!btn.dataset.confirmPending) {
                btn.dataset.confirmPending = '1';
                btn.textContent = 'Confirmar?';
                setTimeout(() => { if (btn.dataset.confirmPending) { delete btn.dataset.confirmPending; btn.textContent = 'Apagar'; } }, 3000);
                return;
            }
            btn.disabled = true;
            await fetch('/api/blockbuster/delete/season', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sonarrId:  parseInt(btn.dataset.sonarrId),
                    seasonNum: parseInt(btn.dataset.seasonNum),
                }),
            });
            await Promise.all([_fetchWatched(), _fetchDisk()]);
            _openDetailModal(jfId, 'series', title, year);
        });
    });

    // Episode chip clicks → action bar
    body.querySelectorAll('.bb-ep-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (!actionBar) return;
            if (chip.classList.contains('bb-ec-selected')) {
                chip.classList.remove('bb-ec-selected');
                actionBar.style.display = 'none';
                return;
            }
            body.querySelectorAll('.bb-ep-chip.bb-ec-selected').forEach(c => c.classList.remove('bb-ec-selected'));
            chip.classList.add('bb-ec-selected');

            const status   = chip.dataset.epStatus;
            const epNum    = chip.dataset.epNum;
            const epTitle  = chip.dataset.epTitle;
            const fileId   = chip.dataset.epFileId;
            const airDate  = chip.dataset.epAir;
            const seasonEl = chip.closest('[data-season]');
            const seasonNum = seasonEl ? parseInt(seasonEl.dataset.season) : 0;

            let actionHTML = `<div class="bb-ep-act-info">E${esc(epNum)}${epTitle ? ` — ${esc(epTitle)}` : ''}</div>`;

            if (status === 'downloaded') {
                actionHTML += `<button class="bb-ep-act-btn bb-ep-act-delete"
                    data-file-id="${esc(fileId)}">Apagar E${esc(epNum)}</button>`;
            } else if (status === 'missing' && detail.tmdbId) {
                actionHTML += `<button class="bb-ep-act-btn bb-ep-act-request"
                    data-season="${seasonNum}" data-ep="${esc(epNum)}">Pedir E${esc(epNum)}</button>`;
            } else if (status === 'future') {
                const dateStr = airDate ? new Date(airDate).toLocaleDateString('pt-PT') : 'Sem data';
                actionHTML += `<span class="bb-ep-act-info bb-ep-act-future">Estreia: ${esc(dateStr)}</span>`;
            } else {
                actionHTML += `<span class="bb-ep-act-info bb-ep-act-future">Não monitorizado</span>`;
            }

            actionBar.innerHTML = actionHTML;
            actionBar.style.display = 'flex';

            const delEpBtn = actionBar.querySelector('.bb-ep-act-delete');
            if (delEpBtn) {
                delEpBtn.addEventListener('click', async () => {
                    if (!delEpBtn.dataset.confirmPending) {
                        delEpBtn.dataset.confirmPending = '1';
                        delEpBtn.textContent = 'Confirmar?';
                        setTimeout(() => {
                            if (delEpBtn.dataset.confirmPending) {
                                delete delEpBtn.dataset.confirmPending;
                                delEpBtn.textContent = `Apagar E${epNum}`;
                            }
                        }, 3000);
                        return;
                    }
                    delEpBtn.disabled = true;
                    await fetch('/api/blockbuster/delete/episode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ episodeFileId: parseInt(fileId) }),
                    });
                    chip.classList.remove('bb-ec-good', 'bb-ec-selected');
                    chip.classList.add('bb-ec-unmon');
                    chip.dataset.epStatus  = 'unmonitored';
                    chip.dataset.epFileId  = '';
                    actionBar.style.display = 'none';
                    await Promise.all([_fetchDisk(), _fetchWatched()]);
                });
            }

            const reqEpBtn = actionBar.querySelector('.bb-ep-act-request');
            if (reqEpBtn) {
                reqEpBtn.addEventListener('click', () => {
                    _withConfirm(reqEpBtn, `Pedir E${epNum}`, async () => {
                        reqEpBtn.disabled = true;
                        reqEpBtn.textContent = '...';
                        const resp = await fetch('/api/blockbuster/request-episodes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                mediaId:        detail.tmdbId,
                                seasonNumber:   seasonNum,
                                episodeNumbers: [parseInt(epNum)],
                            }),
                        }).catch(() => null);
                        if (resp && resp.ok) {
                            reqEpBtn.textContent = 'Pedido!';
                            reqEpBtn.classList.add('bb-req-done');
                            chip.classList.remove('bb-ec-warn');
                            chip.classList.add('bb-ec-future');
                            chip.dataset.epStatus = 'future';
                        } else {
                            reqEpBtn.textContent = 'Erro';
                            reqEpBtn.disabled = false;
                        }
                    });
                });
            }
        });
    });
}

// ── Rating sheet ─────────────────────────────────────────────────────────────

function _openRatingSheet(jfId, title, year, type, onSaved) {
    const body      = document.getElementById('bb-modal-body');
    const actionBar = document.getElementById('bb-modal-action-bar');
    if (!body) return;
    if (actionBar) actionBar.style.display = 'none';

    const existing = (bb.ratings || []).find(r => r.jfId === jfId) || {};

    body.innerHTML = `
        <div class="bb-rating-sheet">
            <div class="bb-rating-title">${esc(title)}${year ? ` (${esc(String(year))})` : ''}</div>
            <div class="bb-rating-person">
                <span class="bb-rating-name">António</span>
                <div class="bb-stars" id="bb-stars-antonio">${_starsHTML(existing.ratingAntonio, 'antonio')}</div>
            </div>
            <input class="bb-rating-comment" id="bb-comment-antonio" type="text"
                   placeholder="Comentário (opcional)" value="${esc(existing.commentAntonio || '')}" maxlength="200">
            <div class="bb-rating-person">
                <span class="bb-rating-name">Inês</span>
                <div class="bb-stars" id="bb-stars-ines">${_starsHTML(existing.ratingInes, 'ines')}</div>
            </div>
            <input class="bb-rating-comment" id="bb-comment-ines" type="text"
                   placeholder="Comentário (opcional)" value="${esc(existing.commentInes || '')}" maxlength="200">
            <div class="bb-rating-actions">
                <button class="bb-rating-save" id="bb-rating-save">Guardar</button>
                <button class="bb-rating-cancel" id="bb-rating-cancel">Cancelar</button>
            </div>
        </div>`;

    let ratingAntonio = existing.ratingAntonio || 0;
    let ratingInes  = existing.ratingInes  || 0;

    const _bindStars = (containerId, setCurrent) => {
        document.getElementById(containerId)?.querySelectorAll('.bb-star').forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.dataset.val);
                setCurrent(val);
                document.getElementById(containerId)?.querySelectorAll('.bb-star').forEach(s => {
                    s.classList.toggle('bb-star-on', parseInt(s.dataset.val) <= val);
                });
            });
        });
    };

    _bindStars('bb-stars-antonio', v => { ratingAntonio = v; });
    _bindStars('bb-stars-ines',  v => { ratingInes  = v; });

    document.getElementById('bb-rating-save').addEventListener('click', async () => {
        const saveBtn = document.getElementById('bb-rating-save');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '...'; }
        const payload = {
            jfId,
            title,
            year,
            type,
            ratingAntonio,
            ratingInes,
            commentAntonio: document.getElementById('bb-comment-antonio')?.value.trim() || '',
            commentInes:  document.getElementById('bb-comment-ines')?.value.trim()  || '',
        };
        const resp = await fetch('/api/blockbuster/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(() => null);
        if (resp && resp.ok) {
            const saved = await resp.json();
            const idx = (bb.ratings || []).findIndex(r => r.jfId === jfId);
            if (idx >= 0) bb.ratings[idx] = saved;
            else bb.ratings.push(saved);
            onSaved();
        } else {
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; }
        }
    });

    document.getElementById('bb-rating-cancel').addEventListener('click', () => {
        _openDetailModal(jfId, type, title, year);
    });
}

// ── PT dub prompt ────────────────────────────────────────────────────────────

function _ptPrompt(btn, callback) {
    if (btn.dataset.ptShowing) return;
    btn.dataset.ptShowing = '1';
    btn.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.className = 'bb-pt-prompt';
    wrap.innerHTML = `<span class="bb-pt-q">Dobragem PT?</span>
        <button class="bb-pt-y">Sim 🇵🇹</button>
        <button class="bb-pt-n">Não</button>`;
    btn.after(wrap);

    const done = pt => {
        wrap.remove();
        delete btn.dataset.ptShowing;
        btn.style.display = '';
        callback(pt);
    };
    wrap.querySelector('.bb-pt-y').addEventListener('click', () => done(true));
    wrap.querySelector('.bb-pt-n').addEventListener('click', () => done(false));
    setTimeout(() => { if (btn.dataset.ptShowing) done(false); }, 6000);
}

// ── Search ───────────────────────────────────────────────────────────────────

async function _doSearch(q) {
    const res = document.getElementById('bb-results');
    if (!res) return;
    res.innerHTML = '<div class="bb-empty">A pesquisar...</div>';
    try {
        const data = await fetch(`/api/blockbuster/search?q=${encodeURIComponent(q)}`).then(r => r.json());
        if (data.error || !Array.isArray(data) || !data.length) {
            res.innerHTML = '<div class="bb-empty">Sem resultados</div>';
            return;
        }
        const STATUS = { 2: 'Pedido', 3: 'A processar', 4: 'Parcialmente disponível', 5: 'Disponível' };
        res.innerHTML = data.map((r, idx) => {
            const posterSrc   = r.poster ? `/api/blockbuster/poster?path=${encodeURIComponent(r.poster)}` : '';
            const typeLabel   = r.mediaType === 'movie' ? 'Filme' : 'Série';
            const statusLabel = STATUS[r.status] || '';
            const isTv        = r.mediaType === 'tv';
            const isAnimated  = Array.isArray(r.genreIds) && r.genreIds.includes(16);
            const canRequest  = isTv || r.status !== 5;
            const btnLabel    = isTv ? 'Pedir ▾' : 'Pedir';
            const animBadge   = isAnimated ? ' <span class="bb-anim-badge">PT?</span>' : '';
            return `
            <div class="bb-result-item">
                <div class="bb-result-tap" data-search-idx="${idx}" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;cursor:pointer">
                    ${posterSrc
                        ? `<img class="bb-result-poster" src="${posterSrc}" loading="lazy" alt="">`
                        : `<div class="bb-result-poster bb-no-poster"></div>`}
                    <div class="bb-result-info">
                        <div class="bb-result-title">${esc(r.title)}${r.year ? ` <span class="bb-result-year">${r.year}</span>` : ''}${animBadge}</div>
                        <div class="bb-result-meta">${typeLabel}${statusLabel ? ` · <span class="bb-result-status">${statusLabel}</span>` : ''}</div>
                    </div>
                </div>
                ${canRequest
                    ? `<button class="bb-req-btn" data-req-id="${esc(String(r.id))}" data-req-type="${esc(r.mediaType)}" data-animated="${isAnimated ? '1' : '0'}">${btnLabel}</button>`
                    : ''}
            </div>
            ${canRequest && isTv ? `<div class="bb-tv-picker" id="bb-tvp-${esc(String(r.id))}" style="display:none"></div>` : ''}`;
        }).join('');

        // Tappable area → search detail modal
        res.querySelectorAll('[data-search-idx]').forEach(tap => {
            tap.addEventListener('click', () => {
                const r = data[parseInt(tap.dataset.searchIdx)];
                if (r) _openSearchDetailModal(r);
            });
        });

        res.querySelectorAll('[data-req-id]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const isAnim = btn.dataset.animated === '1';
                if (btn.dataset.reqType === 'tv') {
                    if (isAnim && !btn.dataset.ptDone) {
                        _ptPrompt(btn, () => {
                            btn.dataset.ptDone = '1';
                            _showTvPicker(btn.dataset.reqId, btn);
                        });
                    } else {
                        await _showTvPicker(btn.dataset.reqId, btn);
                    }
                } else {
                    if (isAnim) {
                        _ptPrompt(btn, pt => _sendRequest(parseInt(btn.dataset.reqId), 'movie', btn, null, pt));
                    } else {
                        _withConfirm(btn, 'Pedir', () => _sendRequest(parseInt(btn.dataset.reqId), 'movie', btn));
                    }
                }
            });
        });
    } catch (_) {
        res.innerHTML = '<div class="bb-empty">Erro na pesquisa</div>';
    }
}

function _withConfirm(btn, originalText, action) {
    if (btn.dataset.confirmPending) {
        clearTimeout(btn._confirmTimer);
        delete btn.dataset.confirmPending;
        action();
    } else {
        btn.dataset.confirmPending = '1';
        btn.textContent = 'Confirmar?';
        btn._confirmTimer = setTimeout(() => {
            delete btn.dataset.confirmPending;
            btn.textContent = originalText;
        }, 3000);
    }
}

async function _sendRequest(mediaId, mediaType, btn, seasons = null, ptDub = false) {
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    const body = { mediaId, mediaType };
    if (seasons) body.seasons = seasons;
    const resp = await fetch('/api/blockbuster/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).catch(() => null);
    if (resp && resp.ok) {
        if (btn) { btn.textContent = ptDub ? 'Pedido! 🇵🇹' : 'Pedido!'; btn.classList.add('bb-req-done'); }
        // Poll queue at increasing intervals for 2min — torrent search can take time
        const delays = [5, 10, 20, 35, 60, 90, 120];
        delays.forEach(s => setTimeout(async () => {
            await _fetchQueue();
            const ql = document.getElementById('bb-queue-list');
            if (ql) { ql.innerHTML = _queueHTML(); _bindQueueBtns(ql); }
        }, s * 1000));
    } else {
        if (btn) { btn.textContent = 'Erro'; btn.disabled = false; }
    }
}

async function _sendEpisodeRequest(mediaId, seasonNumber, episodeNumbers, picker, doneBtn) {
    if (doneBtn) { doneBtn.disabled = true; doneBtn.textContent = '...'; }
    const resp = await fetch('/api/blockbuster/request-episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, seasonNumber, episodeNumbers }),
    }).catch(() => null);
    if (resp && resp.ok) {
        if (doneBtn) { doneBtn.textContent = 'Pedido!'; doneBtn.classList.add('bb-req-done'); }
        setTimeout(async () => {
            await _fetchQueue();
            const ql = document.getElementById('bb-queue-list');
            if (ql) { ql.innerHTML = _queueHTML(); _bindQueueBtns(ql); }
        }, 4000);
    } else {
        if (doneBtn) { doneBtn.textContent = 'Erro'; doneBtn.disabled = false; }
    }
}

async function _showTvPicker(id, mainBtn) {
    const picker = document.getElementById(`bb-tvp-${id}`);
    if (!picker) return;
    if (picker.style.display !== 'none') { picker.style.display = 'none'; return; }

    mainBtn.disabled = true;
    picker.style.display = 'block';
    picker.innerHTML = '<div class="bb-empty bb-picker-loading">A carregar...</div>';

    try {
        const { seasons = [] } = await fetch(`/api/blockbuster/tv/${id}`).then(r => r.json());
        picker.innerHTML = `
        <div class="bb-season-row">
            <button class="bb-season-btn bb-season-all">Toda a série</button>
            ${seasons.map(s => `
                <button class="bb-season-btn" data-sn="${s.number}">
                    T${s.number}${s.episodeCount ? `<span class="bb-sn-ep">${s.episodeCount}ep</span>` : ''}
                </button>`).join('')}
        </div>
        <div class="bb-episode-row" id="bb-epr-${id}" style="display:none"></div>`;

        picker.querySelector('.bb-season-all').addEventListener('click', e => {
            const b = e.currentTarget;
            _withConfirm(b, 'Toda a série', async () => {
                await _sendRequest(parseInt(id), 'tv', b);
                picker.style.display = 'none';
            });
        });

        picker.querySelectorAll('[data-sn]').forEach(sb => {
            sb.addEventListener('click', () =>
                _showEpisodePicker(parseInt(id), parseInt(sb.dataset.sn), picker));
        });
    } catch (_) {
        picker.innerHTML = '<div class="bb-empty">Erro ao carregar temporadas</div>';
    }
    mainBtn.disabled = false;
}

async function _showEpisodePicker(mediaId, seasonNum, picker) {
    const epRow = picker.querySelector('.bb-episode-row');
    if (!epRow) return;
    if (epRow.style.display !== 'none' && epRow.dataset.sn == seasonNum) {
        epRow.style.display = 'none';
        return;
    }
    epRow.dataset.sn = seasonNum;
    epRow.style.display = 'flex';
    epRow.innerHTML = '<div class="bb-empty bb-picker-loading">A carregar...</div>';

    try {
        const { episodes = [] } = await fetch(`/api/blockbuster/tv/${mediaId}/season/${seasonNum}`).then(r => r.json());
        epRow.innerHTML = `
        <button class="bb-ep-btn bb-ep-season" data-season-req="${seasonNum}">Toda T${seasonNum}</button>
        ${episodes.map(e => `<button class="bb-ep-btn" data-ep="${e.number}" title="${esc(e.title)}">E${e.number}</button>`).join('')}`;

        epRow.querySelector('[data-season-req]').addEventListener('click', e => {
            const b = e.currentTarget;
            _withConfirm(b, `Toda T${seasonNum}`, async () => {
                await _sendRequest(mediaId, 'tv', b, [seasonNum]);
                picker.style.display = 'none';
            });
        });

        epRow.querySelectorAll('[data-ep]').forEach(eb => {
            eb.addEventListener('click', () => {
                const label = `E${eb.dataset.ep}`;
                _withConfirm(eb, label, () =>
                    _sendEpisodeRequest(mediaId, seasonNum, [parseInt(eb.dataset.ep)], picker, eb));
            });
        });
    } catch (_) {
        epRow.innerHTML = '<div class="bb-empty">Erro</div>';
    }
}

// ── Search detail modal ───────────────────────────────────────────────────────

function _openSearchDetailModal(result) {
    _closeDetailModal();

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay';
    overlay.id = 'bb-modal-overlay';

    const STATUS    = { 2: 'Pedido', 3: 'A processar', 4: 'Parcialmente disponível', 5: 'Disponível' };
    const typeLabel = result.mediaType === 'movie' ? 'Filme' : 'Série';
    const stLabel   = STATUS[result.status] || '';
    const posterSrc = result.poster ? `/api/blockbuster/poster?path=${encodeURIComponent(result.poster)}` : '';
    const isAnimated = Array.isArray(result.genreIds) && result.genreIds.includes(16);
    const isTv = result.mediaType === 'tv';

    overlay.innerHTML = `
        <div class="bb-modal-panel" id="bb-modal-panel">
            <div class="bb-modal-header">
                <div class="bb-modal-htitle">${esc(result.title)}${result.year ? ` <span class="bb-modal-year">${esc(String(result.year))}</span>` : ''}</div>
                <button class="bb-modal-close" id="bb-modal-close">×</button>
            </div>
            <div class="bb-modal-body" id="bb-modal-body">
                <div class="bb-det-poster-wrap">
                    ${posterSrc
                        ? `<img class="bb-det-poster" src="${posterSrc}" loading="lazy" alt="" onerror="this.style.display='none'">`
                        : '<div class="bb-det-poster" style="background:#13133a"></div>'}
                    <div class="bb-det-info">
                        <div class="bb-det-badge" style="background:#1a1a3a;color:#8888cc">${typeLabel}</div>
                        ${stLabel ? `<div class="bb-det-badge bb-badge-avail" style="margin-top:6px">${stLabel}</div>` : ''}
                    </div>
                </div>
                ${result.overview ? `<div class="bb-det-overview">${esc(result.overview)}</div>` : ''}
                <div id="bb-sdet-actions">
                    ${isTv
                        ? '<div class="bb-empty">A carregar temporadas...</div>'
                        : result.status !== 5
                            ? `<div class="bb-det-actions">
                                   <button class="bb-det-watched-btn" id="bb-sdet-req">Pedir</button>
                               </div>`
                            : '<div class="bb-det-badge bb-badge-avail">Já disponível</div>'}
                </div>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.querySelector('#bb-modal-panel').classList.add('bb-modal-open'));
    overlay.addEventListener('click', e => { if (e.target === overlay) _closeDetailModal(); });
    overlay.querySelector('#bb-modal-close').addEventListener('click', _closeDetailModal);

    const movieBtn = overlay.querySelector('#bb-sdet-req');
    if (movieBtn) {
        movieBtn.addEventListener('click', () => {
            if (isAnimated) {
                _ptPrompt(movieBtn, pt => {
                    _withConfirm(movieBtn, 'Pedir', () => _sendRequest(result.id, 'movie', movieBtn, null, pt));
                });
            } else {
                _withConfirm(movieBtn, 'Pedir', () => _sendRequest(result.id, 'movie', movieBtn));
            }
        });
    }

    if (isTv) {
        fetch(`/api/blockbuster/tv/${result.id}`)
            .then(r => r.json())
            .then(({ seasons = [] }) => {
                const actDiv = overlay.querySelector('#bb-sdet-actions');
                if (!actDiv) return;
                actDiv.innerHTML = `
                    <div class="bb-det-actions" style="flex-wrap:wrap;gap:6px;margin-bottom:10px">
                        <button class="bb-det-watched-btn" id="bb-sdet-all" style="flex:none;padding:10px 14px;font-size:13px">Toda a série</button>
                        ${seasons.map(s => `
                            <button class="bb-sdet-szn" data-sn="${s.number}"
                                    style="background:#13133a;color:#e8e8ff;border:1px solid #2a2a6a;border-radius:8px;padding:10px 12px;font-size:13px;font-family:inherit;cursor:pointer">
                                T${s.number}${s.episodeCount ? `<span style="color:#606090;font-size:11px;margin-left:3px">${s.episodeCount}ep</span>` : ''}
                            </button>`).join('')}
                    </div>
                    <div id="bb-sdet-ep-wrap"></div>`;

                overlay.querySelector('#bb-sdet-all')?.addEventListener('click', e => {
                    _withConfirm(e.currentTarget, 'Toda a série', () =>
                        _sendRequest(result.id, 'tv', e.currentTarget));
                });

                overlay.querySelectorAll('.bb-sdet-szn').forEach(sb => {
                    sb.addEventListener('click', () =>
                        _showSearchEpisodePicker(result.id, parseInt(sb.dataset.sn), overlay));
                });
            })
            .catch(() => {
                const actDiv = overlay.querySelector('#bb-sdet-actions');
                if (actDiv) actDiv.innerHTML = '<div class="bb-empty">Erro ao carregar</div>';
            });
    }
}

async function _showSearchEpisodePicker(mediaId, seasonNum, overlay) {
    const epWrap = overlay.querySelector('#bb-sdet-ep-wrap');
    if (!epWrap) return;

    if (epWrap.dataset.sn == seasonNum && epWrap.innerHTML.trim()) {
        epWrap.innerHTML = '';
        delete epWrap.dataset.sn;
        return;
    }

    epWrap.dataset.sn = seasonNum;
    epWrap.innerHTML = '<div class="bb-empty bb-picker-loading">A carregar...</div>';

    try {
        const { episodes = [] } = await fetch(`/api/blockbuster/tv/${mediaId}/season/${seasonNum}`).then(r => r.json());
        epWrap.innerHTML = `
            <div class="bb-season-row">
                <button class="bb-season-btn bb-season-all" data-season-req="${seasonNum}">Toda T${seasonNum}</button>
                ${episodes.map(e => `<button class="bb-season-btn" data-ep="${e.number}" title="${esc(e.title)}">E${e.number}</button>`).join('')}
            </div>`;

        epWrap.querySelector('[data-season-req]')?.addEventListener('click', e => {
            _withConfirm(e.currentTarget, `Toda T${seasonNum}`, () =>
                _sendRequest(mediaId, 'tv', e.currentTarget, [seasonNum]));
        });

        epWrap.querySelectorAll('[data-ep]').forEach(eb => {
            eb.addEventListener('click', () => {
                _withConfirm(eb, `E${eb.dataset.ep}`, () =>
                    _sendEpisodeRequest(mediaId, seasonNum, [parseInt(eb.dataset.ep)], null, eb));
            });
        });
    } catch (_) {
        epWrap.innerHTML = '<div class="bb-empty">Erro</div>';
    }
}
