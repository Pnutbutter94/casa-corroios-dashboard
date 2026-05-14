import { esc } from '../utils/esc.js';

export const bb = { queue: [], disk: null, watched: null, library: null };

let _searchTimer = null;

export async function initBlockbuster() {
    await Promise.all([_fetchQueue(), _fetchDisk(), _fetchWatched(), _fetchLibrary()]);
}

async function _fetchQueue() {
    try { bb.queue = await fetch('/api/blockbuster/queue').then(r => r.ok ? r.json() : []); } catch (_) {}
}
async function _fetchDisk() {
    try { bb.disk = await fetch('/api/blockbuster/disk').then(r => r.ok ? r.json() : null); } catch (_) {}
}
async function _fetchWatched() {
    try { bb.watched = await fetch('/api/blockbuster/watched').then(r => r.ok ? r.json() : null); } catch (_) {}
}
async function _fetchLibrary() {
    try { bb.library = await fetch('/api/blockbuster/library').then(r => r.ok ? r.json() : null); } catch (_) {}
}

function _fmtMb(mb) {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
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

    const _row = (items, label) => {
        if (!items.length) return '';
        const posters = items.map(item => `
            <div class="bb-poster-wrap">
                <img class="bb-poster-img" src="/api/blockbuster/jf-poster/${esc(item.id)}" loading="lazy" alt=""
                     onerror="this.closest('.bb-poster-wrap').classList.add('bb-poster-err')">
                <div class="bb-poster-overlay">
                    <div class="bb-poster-title">${esc(item.title)}</div>
                    ${item.year ? `<div class="bb-poster-year">${item.year}</div>` : ''}
                </div>
            </div>`).join('');
        return `
        <div class="bb-row-label">${label} <span class="bb-row-count">${items.length}</span></div>
        <div class="bb-poster-row">${posters}</div>`;
    };

    return _row(movies, 'Filmes') + _row(series, 'Séries');
}

function _diskHTML() {
    if (!bb.disk) return '<div class="bb-empty">Sem dados</div>';
    const { usedGb, quotaGb, moviesGb, tvGb } = bb.disk;
    const pct = Math.min(100, Math.round(usedGb / quotaGb * 100));
    const cls = pct > 90 ? 'bad' : pct > 75 ? 'warn' : 'good';
    return `
    <div class="bb-disk-bar-wrap"><div class="bb-disk-bar ${cls}" style="width:${pct}%"></div></div>
    <div class="bb-disk-stats">
        <span class="bb-disk-used">${usedGb} GB / ${quotaGb} GB</span>
        <span class="bb-disk-detail">Filmes ${moviesGb} GB · Séries ${tvGb} GB</span>
    </div>`;
}

function _queueHTML() {
    if (!bb.queue.length) return '<div class="bb-empty">Nenhum download em curso</div>';
    return bb.queue.map(item => {
        const icon         = item.type === 'movie' ? '🎬' : '📺';
        const statusKey    = (item.status || '').toLowerCase();
        const statusLabel  = QUEUE_LABELS[statusKey] || esc(item.status);
        const statusCls    = QUEUE_STATUS_CLS[statusKey] || '';
        const barCls       = statusCls === 'warn' ? 'warn' : statusCls === 'bad' ? 'bad' : '';
        const isActionable = statusKey === 'warning' || statusKey === 'failed';
        return `
        <div class="bb-queue-item${isActionable ? ' bb-queue-problem' : ''}">
            <span class="bb-queue-icon">${icon}</span>
            <div class="bb-queue-info">
                <div class="bb-queue-title">${esc(item.title)}</div>
                <div class="bb-queue-meta${statusCls ? ' bb-s-' + statusCls : ''}">${statusLabel} · ${_fmtMb(item.sizeMb)}</div>
                ${item.message ? `<div class="bb-queue-msg">${esc(item.message)}</div>` : ''}
            </div>
            ${isActionable
                ? `<button class="bb-retry-btn"
                       data-queue-id="${esc(String(item.queueId))}"
                       data-queue-source="${esc(item.source)}">Tentar outro</button>`
                : `<div class="bb-queue-pct-wrap">
                       <div class="bb-queue-pct-bar${barCls ? ' ' + barCls : ''}" style="width:${item.pct}%"></div>
                       <span class="bb-queue-pct-label">${item.pct}%</span>
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

export function renderBlockbuster() {
    return `
    <div class="bb-banner">
        <span class="bb-banner-icon">🎬</span>
        <span class="bb-banner-text">BLOCKBUSTER</span>
    </div>

    <div class="card-label">Em Exibição</div>
    ${_catalogueHTML()}

    <div class="card-label bb-gap">Pesquisar</div>
    <div class="bb-search-wrap">
        <input class="bb-search-input" type="text" placeholder="Filme ou série..." id="bb-search-input" autocomplete="off">
    </div>
    <div class="bb-results" id="bb-results"></div>

    <div class="bb-section-hdr bb-gap">
        <span class="card-label">A descarregar</span>
        <button class="bb-refresh-btn" id="bb-queue-refresh">↻</button>
    </div>
    <div class="bb-queue" id="bb-queue-list">${_queueHTML()}</div>

    <div class="card-label bb-gap">Disco</div>
    <div class="bb-disk">${_diskHTML()}</div>

    <div class="card-label bb-gap">Para limpar</div>
    <div class="bb-clean">${_watchedHTML()}</div>
    `;
}

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

export function bindBlockbuster(container, onRefresh) {
    container.querySelectorAll('.bb-poster-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const wasRevealed = wrap.classList.contains('revealed');
            container.querySelectorAll('.bb-poster-wrap.revealed').forEach(w => w.classList.remove('revealed'));
            if (!wasRevealed) wrap.classList.add('revealed');
        });
    });

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

    const input = container.querySelector('#bb-search-input');
    if (input) {
        input.addEventListener('input', () => {
            clearTimeout(_searchTimer);
            const q = input.value.trim();
            const res = document.getElementById('bb-results');
            if (!q) { if (res) res.innerHTML = ''; return; }
            _searchTimer = setTimeout(() => _doSearch(q), 400);
        });
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
            await Promise.all([_fetchWatched(), _fetchDisk()]);
            onRefresh();
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
            await Promise.all([_fetchWatched(), _fetchDisk()]);
            onRefresh();
        });
    });
}

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
        res.innerHTML = data.map(r => {
            const posterSrc   = r.poster ? `/api/blockbuster/poster?path=${encodeURIComponent(r.poster)}` : '';
            const typeLabel   = r.mediaType === 'movie' ? 'Filme' : 'Série';
            const statusLabel = STATUS[r.status] || '';
            return `
            <div class="bb-result-item">
                ${posterSrc
                    ? `<img class="bb-result-poster" src="${posterSrc}" loading="lazy" alt="">`
                    : `<div class="bb-result-poster bb-no-poster"></div>`}
                <div class="bb-result-info">
                    <div class="bb-result-title">${esc(r.title)}${r.year ? ` <span class="bb-result-year">${r.year}</span>` : ''}</div>
                    <div class="bb-result-meta">${typeLabel}${statusLabel ? ` · <span class="bb-result-status">${statusLabel}</span>` : ''}</div>
                </div>
                ${!r.status
                    ? `<button class="bb-req-btn" data-req-id="${esc(String(r.id))}" data-req-type="${esc(r.mediaType)}">Pedir</button>`
                    : ''}
            </div>`;
        }).join('');

        res.querySelectorAll('[data-req-id]').forEach(btn => {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.textContent = '...';
                const body = { mediaId: parseInt(btn.dataset.reqId), mediaType: btn.dataset.reqType };
                const resp = await fetch('/api/blockbuster/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                }).catch(() => null);
                if (resp && resp.ok) {
                    btn.textContent = 'Pedido!';
                    btn.classList.add('bb-req-done');
                    // refresh queue after a short delay — Sonarr/Radarr may take a moment
                    setTimeout(async () => {
                        await _fetchQueue();
                        const ql = document.getElementById('bb-queue-list');
                        if (ql) ql.innerHTML = _queueHTML();
                        _bindQueueBtns(ql, onRefresh);
                    }, 4000);
                } else {
                    btn.textContent = 'Erro';
                    btn.disabled = false;
                }
            });
        });
    } catch (_) {
        res.innerHTML = '<div class="bb-empty">Erro na pesquisa</div>';
    }
}
