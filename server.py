from flask import Flask, jsonify, make_response, send_from_directory, request
import urllib.request
import urllib.parse
import json
import os
import time
import datetime
import uuid
import re

app = Flask(__name__)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
DATA_DIR   = os.path.join(BASE_DIR, 'data')
CACHE_FILE = os.path.join(BASE_DIR, 'cache', 'weather.json')
CUSTOM_PRODUCTS_FILE = os.path.join(BASE_DIR, 'cache', 'custom_products.json')
MAINT_FILE = os.path.join(BASE_DIR, 'cache', 'maintenance.json')
INV_FILE   = os.path.join(BASE_DIR, 'cache', 'inventory.json')
PLAN_FILE  = os.path.join(BASE_DIR, 'cache', 'planner.json')
SHOP_FILE  = os.path.join(BASE_DIR, 'cache', 'shopping.json')
CACHE_TTL  = 15 * 60  # 15 minutes

ALLOWED_INV_FIELDS     = {'name', 'quantity', 'unit', 'location', 'quantityKnown', 'productId'}
ALLOWED_SHOP_FIELDS    = {'checked', 'name', 'quantity', 'unit', 'category', 'productId', 'source'}
ALLOWED_PRODUCT_FIELDS = {'name', 'category', 'unit', 'defaultQty'}

HA_URL   = 'http://192.168.1.100:8123'
HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwNDYzNzQ4OGY4YTM0ODQ2OWYwMTc4NzlkYmQxODNiOSIsImlhdCI6MTc3ODUxMjE4NCwiZXhwIjoyMDkzODcyMTg0fQ.ahU41zLcGCezf5IEzqQJvQoa1q644YnXuBvAZiHLsZs'

IOT_ENTITIES = frozenset([
    'light.escritorio_ines', 'light.luz_de_entrada', 'light.wiz_rgbw_tunable_877be6',
    'switch.plug_sala', 'switch.termoacumulador',
    'sensor.plug_sala_current_power', 'sensor.termoacumulador_current_power',
    'sensor.01_sala_cozinha_temperature', 'sensor.01_sala_cozinha_humidity',
    'sensor.02_quarto_temperature', 'sensor.02_quarto_humidity',
    'sensor.03_escritorio_temperature', 'sensor.03_escritorio_humidity',
    'vacuum.viomi_de_428952342_v19',
])

ALLOWED_IOT_SERVICES = {
    'light':  {'turn_on', 'turn_off'},
    'switch': {'toggle', 'turn_on', 'turn_off'},
    'vacuum': {'start', 'stop', 'return_to_base'},
}
MAX_CUSTOM_PRODUCTS = 500
DATE_RE             = re.compile(r'^\d{4}-\d{2}-\d{2}$')

BB_JF_URL   = 'http://localhost:8096'
BB_JF_TOKEN = '9a03d5f6159947e8866440bbb14bdf05'
BB_JF_USER  = 'c44c715263ba424fabccb6b96ba34985'
BB_JS_URL   = 'http://localhost:5055'
BB_JS_KEY   = 'MTc3ODQ5Mzg1OTAwNDBlMGFkNTVmLWFkOWYtNGNjZi05ODYwLWY1Njk5MjQxNGJmOQ=='
BB_RAD_URL  = 'http://localhost:7878'
BB_RAD_KEY  = 'bef659950c1d4ccaa4d40f2301079e0b'
BB_SON_URL  = 'http://localhost:8989'
BB_SON_KEY  = 'd47e138c18b542be9dec3e9fec9b0408'
BB_QUOTA_GB = 150

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude=38.6333&longitude=-9.0333"
    "&hourly=temperature_2m,precipitation_probability,windspeed_10m,uv_index"
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    ",windspeed_10m_max,weathercode"
    "&current_weather=true&timezone=Europe/Lisbon&forecast_days=3"
)

os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)


@app.after_request
def security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options']         = 'DENY'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "font-src 'self'; "
        "connect-src 'self' https://api.open-meteo.com; "
        "img-src 'self' data:;"
    )
    return response


def _load_cache():
    try:
        with open(CACHE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def _save_cache(data):
    with open(CACHE_FILE, 'w') as f:
        json.dump({'ts': time.time(), 'data': data}, f)


def _fetch_live():
    with urllib.request.urlopen(WEATHER_URL, timeout=10) as r:
        return json.loads(r.read())


@app.route('/api/weather')
def weather():
    cached = _load_cache()
    age = time.time() - cached['ts'] if cached else float('inf')

    if cached and age < CACHE_TTL:
        return jsonify(cached['data'])

    try:
        data = _fetch_live()
        _save_cache(data)
        return jsonify(data)
    except Exception:
        if cached:
            return jsonify(cached['data'])  # stale beats nothing
        return jsonify({'error': 'Sem dados meteorológicos'}), 503


@app.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    try:
        with open(MAINT_FILE) as f:
            return jsonify(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({})


@app.route('/api/maintenance', methods=['POST'])
def post_maintenance():
    data  = request.get_json()
    mtype = data.get('type') if data else None
    if mtype not in ('drum_clean', 'descale'):
        return jsonify({'error': 'invalid type'}), 400

    try:
        with open(MAINT_FILE) as f:
            maint = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        maint = {}

    maint[mtype] = datetime.date.today().isoformat()
    with open(MAINT_FILE, 'w') as f:
        json.dump(maint, f)
    return jsonify(maint)


# ── REFEIÇÕES: Products ───────────────────────────────────────────────────────

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        with open(os.path.join(DATA_DIR, 'products.json')) as f:
            catalogue = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        catalogue = []
    try:
        with open(CUSTOM_PRODUCTS_FILE) as f:
            custom = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        custom = []
    return jsonify(catalogue + custom)


@app.route('/api/products', methods=['POST'])
def add_custom_product():
    raw = request.get_json()
    if not raw or not raw.get('name'):
        return jsonify({'error': 'name required'}), 400
    try:
        with open(CUSTOM_PRODUCTS_FILE) as f:
            custom = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        custom = []
    if len(custom) >= MAX_CUSTOM_PRODUCTS:
        return jsonify({'error': 'custom product limit reached'}), 400
    item = {k: v for k, v in raw.items() if k in ALLOWED_PRODUCT_FIELDS}
    item['id'] = 'custom_' + str(uuid.uuid4())[:8]
    item.setdefault('category', 'outro')
    custom.append(item)
    with open(CUSTOM_PRODUCTS_FILE, 'w') as f:
        json.dump(custom, f)
    return jsonify(item), 201


# ── REFEIÇÕES: Recipes ────────────────────────────────────────────────────────

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        with open(os.path.join(DATA_DIR, 'recipes.json')) as f:
            return jsonify(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify([])


# ── REFEIÇÕES: Inventory ──────────────────────────────────────────────────────

def _load_inv():
    try:
        with open(INV_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def _save_inv(data):
    with open(INV_FILE, 'w') as f:
        json.dump(data, f)


@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    return jsonify(_load_inv())


@app.route('/api/inventory', methods=['POST'])
def add_inventory():
    raw = request.get_json()
    if not raw or not raw.get('name'):
        return jsonify({'error': 'name required'}), 400
    inv = _load_inv()
    item = {k: v for k, v in raw.items() if k in ALLOWED_INV_FIELDS}
    item['id'] = str(uuid.uuid4())[:8]
    inv.append(item)
    _save_inv(inv)
    return jsonify(item), 201


@app.route('/api/inventory/<item_id>', methods=['PATCH'])
def patch_inventory(item_id):
    raw   = request.get_json() or {}
    patch = {k: v for k, v in raw.items() if k in ALLOWED_INV_FIELDS}
    inv = _load_inv()
    for it in inv:
        if it.get('id') == item_id:
            it.update(patch)
            _save_inv(inv)
            return jsonify(it)
    return jsonify({'error': 'not found'}), 404


@app.route('/api/inventory/<item_id>', methods=['DELETE'])
def delete_inventory(item_id):
    inv = _load_inv()
    inv = [it for it in inv if it.get('id') != item_id]
    _save_inv(inv)
    return '', 204


# ── REFEIÇÕES: Planner ────────────────────────────────────────────────────────

def _load_plan():
    try:
        with open(PLAN_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def _save_plan(data):
    with open(PLAN_FILE, 'w') as f:
        json.dump(data, f)


@app.route('/api/planner', methods=['GET'])
def get_planner():
    return jsonify(_load_plan())


@app.route('/api/planner/<date_str>', methods=['POST'])
def set_planner_day(date_str):
    if not DATE_RE.match(date_str):
        return jsonify({'error': 'invalid date'}), 400
    data = request.get_json()
    if not data:
        return jsonify({'error': 'body required'}), 400
    plan = _load_plan()
    plan[date_str] = data
    _save_plan(plan)
    return jsonify(data)


# ── REFEIÇÕES: Shopping list ──────────────────────────────────────────────────

def _load_shop():
    try:
        with open(SHOP_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def _save_shop(data):
    with open(SHOP_FILE, 'w') as f:
        json.dump(data, f)


@app.route('/api/shopping', methods=['GET'])
def get_shopping():
    return jsonify(_load_shop())


@app.route('/api/shopping', methods=['POST'])
def add_shopping():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'body required'}), 400
    shop = _load_shop()
    if isinstance(data, list):
        for raw_item in data:
            item = {k: v for k, v in raw_item.items() if k in ALLOWED_SHOP_FIELDS}
            item['id'] = str(uuid.uuid4())[:8]
            item.setdefault('checked', False)
            shop.append(item)
    else:
        item = {k: v for k, v in data.items() if k in ALLOWED_SHOP_FIELDS}
        item['id'] = str(uuid.uuid4())[:8]
        item.setdefault('checked', False)
        shop.append(item)
    _save_shop(shop)
    return jsonify(shop), 201


@app.route('/api/shopping/done', methods=['DELETE'])
def clear_done_shopping():
    shop = [it for it in _load_shop() if not it.get('checked')]
    _save_shop(shop)
    return jsonify(shop)


@app.route('/api/shopping/<item_id>', methods=['PATCH'])
def patch_shopping(item_id):
    raw   = request.get_json() or {}
    patch = {k: v for k, v in raw.items() if k in ALLOWED_SHOP_FIELDS}
    shop  = _load_shop()
    for it in shop:
        if it.get('id') == item_id:
            it.update(patch)
            _save_shop(shop)
            return jsonify(it)
    return jsonify({'error': 'not found'}), 404


@app.route('/api/shopping/<item_id>', methods=['DELETE'])
def delete_shopping(item_id):
    shop = [it for it in _load_shop() if it.get('id') != item_id]
    _save_shop(shop)
    return '', 204


# ── IOT PROXY ─────────────────────────────────────────────────────────────────

def _ha_request(path, data=None):
    req = urllib.request.Request(
        f'{HA_URL}{path}',
        data=json.dumps(data).encode() if data is not None else None,
        headers={'Authorization': f'Bearer {HA_TOKEN}', 'Content-Type': 'application/json'},
        method='POST' if data is not None else 'GET',
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read())


@app.route('/api/iot/states')
def iot_states():
    try:
        all_states = _ha_request('/api/states')
        return jsonify([s for s in all_states if s['entity_id'] in IOT_ENTITIES])
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/iot/call', methods=['POST'])
def iot_call():
    raw            = request.get_json(force=True, silent=True) or {}
    entity_id      = str(raw.get('entity_id', ''))
    service        = str(raw.get('service', ''))
    brightness_pct = raw.get('brightness_pct')
    domain         = entity_id.split('.')[0] if '.' in entity_id else ''
    if entity_id not in IOT_ENTITIES:
        return jsonify({'error': 'unknown entity'}), 403
    if domain not in ALLOWED_IOT_SERVICES or service not in ALLOWED_IOT_SERVICES[domain]:
        return jsonify({'error': 'not allowed'}), 403
    service_data = {'entity_id': entity_id}
    if service == 'turn_on' and domain == 'light' and brightness_pct is not None:
        try:
            pct = int(brightness_pct)
            if 1 <= pct <= 100:
                service_data['brightness_pct'] = pct
        except (TypeError, ValueError):
            pass
    try:
        return jsonify(_ha_request(f'/api/services/{domain}/{service}', service_data))
    except Exception as e:
        return jsonify({'error': str(e)}), 502


# ── BLOCKBUSTER ───────────────────────────────────────────────────────────────

def _bb_req(url, method='GET', data=None, headers=None):
    body = json.dumps(data).encode() if data is not None else None
    h = {} if body is None else {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=10) as r:
        raw = r.read()
        return json.loads(raw) if raw else {}


@app.route('/api/blockbuster/search')
def bb_search():
    q = request.args.get('q', '').strip()
    if len(q) < 2:
        return jsonify([])
    try:
        data = _bb_req(
            f'{BB_JS_URL}/api/v1/search?query={urllib.parse.quote(q)}&language=pt-PT',
            headers={'X-Api-Key': BB_JS_KEY},
        )
        out = []
        for r in data.get('results', [])[:12]:
            out.append({
                'id':        r.get('id'),
                'mediaType': r.get('mediaType'),
                'title':     r.get('title') or r.get('name', ''),
                'year':      (r.get('releaseDate') or r.get('firstAirDate', ''))[:4],
                'poster':    r.get('posterPath', ''),
                'status':    (r.get('mediaInfo') or {}).get('status', 0),
            })
        return jsonify(out)
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/tv/<int:tmdb_id>')
def bb_tv_info(tmdb_id):
    try:
        show = _bb_req(f'{BB_JS_URL}/api/v1/tv/{tmdb_id}', headers={'X-Api-Key': BB_JS_KEY})
        seasons = [
            {'number': s['seasonNumber'], 'episodeCount': s.get('episodeCount', 0)}
            for s in show.get('seasons', []) if s.get('seasonNumber', 0) > 0
        ]
        return jsonify({'seasons': seasons})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/tv/<int:tmdb_id>/season/<int:season_num>')
def bb_tv_season(tmdb_id, season_num):
    try:
        data = _bb_req(f'{BB_JS_URL}/api/v1/tv/{tmdb_id}/season/{season_num}',
                       headers={'X-Api-Key': BB_JS_KEY})
        episodes = [
            {'number': ep['episodeNumber'], 'title': ep.get('name', '')}
            for ep in data.get('episodes', [])
        ]
        return jsonify({'episodes': episodes})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/request', methods=['POST'])
def bb_request():
    raw        = request.get_json(force=True, silent=True) or {}
    media_type = str(raw.get('mediaType', ''))
    if media_type not in ('movie', 'tv'):
        return jsonify({'error': 'invalid type'}), 400
    try:
        media_id = int(raw['mediaId'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'invalid id'}), 400
    body = {'mediaType': media_type, 'mediaId': media_id}
    if media_type == 'tv':
        explicit = raw.get('seasons')
        if isinstance(explicit, list) and all(isinstance(s, int) for s in explicit):
            body['seasons'] = explicit
        else:
            try:
                show    = _bb_req(f'{BB_JS_URL}/api/v1/tv/{media_id}',
                                  headers={'X-Api-Key': BB_JS_KEY})
                seasons = [s['seasonNumber'] for s in show.get('seasons', [])
                           if isinstance(s.get('seasonNumber'), int) and s['seasonNumber'] > 0]
            except Exception:
                seasons = []
            body['seasons'] = seasons or [1]
    try:
        _bb_req(f'{BB_JS_URL}/api/v1/request', method='POST', data=body,
                headers={'X-Api-Key': BB_JS_KEY})
        return jsonify({'ok': True, 'seasons': body.get('seasons')})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/request-episodes', methods=['POST'])
def bb_request_episodes():
    raw     = request.get_json(force=True, silent=True) or {}
    tmdb_id = raw.get('mediaId')
    s_num   = raw.get('seasonNumber')
    ep_nums = raw.get('episodeNumbers', [])
    if not isinstance(tmdb_id, int) or not isinstance(s_num, int) or not ep_nums:
        return jsonify({'error': 'invalid'}), 400
    try:
        show    = _bb_req(f'{BB_JS_URL}/api/v1/tv/{tmdb_id}', headers={'X-Api-Key': BB_JS_KEY})
        tvdb_id = (show.get('externalIds') or {}).get('tvdbId')
        if tvdb_id:
            all_series = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}')
            series     = next((s for s in all_series if s.get('tvdbId') == tvdb_id), None)
            if series:
                sid     = series['id']
                all_eps = _bb_req(f'{BB_SON_URL}/api/v3/episode?seriesId={sid}&seasonNumber={s_num}&apikey={BB_SON_KEY}')
                ep_ids  = [ep['id'] for ep in all_eps if ep.get('episodeNumber') in ep_nums]
                if ep_ids:
                    _bb_req(f'{BB_SON_URL}/api/v3/episode/monitor?apikey={BB_SON_KEY}',
                            method='PUT', data={'episodeIds': ep_ids, 'monitored': True})
                    _bb_req(f'{BB_SON_URL}/api/v3/command?apikey={BB_SON_KEY}',
                            method='POST', data={'name': 'EpisodeSearch', 'episodeIds': ep_ids})
                    return jsonify({'ok': True})
        # Series not in Sonarr — episode-level requests require the season to be added first
        return jsonify({'error': 'not_in_sonarr'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/disk')
def bb_disk():
    try:
        movies   = _bb_req(f'{BB_RAD_URL}/api/v3/movie?apikey={BB_RAD_KEY}')
        mv_bytes = sum(m.get('sizeOnDisk', 0) for m in movies if m.get('hasFile'))
        series   = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}')
        tv_bytes = sum(s.get('statistics', {}).get('sizeOnDisk', 0) for s in series)
        total_gb = (mv_bytes + tv_bytes) / (1024 ** 3)
        return jsonify({
            'usedGb':   round(total_gb, 1),
            'quotaGb':  BB_QUOTA_GB,
            'moviesGb': round(mv_bytes / (1024 ** 3), 1),
            'tvGb':     round(tv_bytes / (1024 ** 3), 1),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/queue')
def bb_queue():
    items = []
    def _first_msg(r):
        msgs = r.get('statusMessages') or []
        txt  = msgs[0].get('messages', [''])[0][:120] if msgs else ''
        return txt or r.get('errorMessage', '')[:120]

    def _pct(size, sizeleft):
        if not size:
            return 0
        return max(0, min(100, round((1 - sizeleft / size) * 100)))

    try:
        for r in _bb_req(f'{BB_RAD_URL}/api/v3/queue?includeMovie=true&apikey={BB_RAD_KEY}').get('records', []):
            size  = r.get('size', 0)
            movie = r.get('movie') or {}
            title = movie.get('title') or r.get('title', '')
            items.append({
                'queueId':      r.get('id'),
                'source':       'radarr',
                'title':        title,
                'type':         'movie',
                'status':       r.get('status', ''),
                'trackedState': r.get('trackedDownloadState', ''),
                'pct':          _pct(size, r.get('sizeleft', 0)),
                'sizeMb':       round(size / (1024 ** 2)) if size else 0,
                'message':      _first_msg(r),
            })
    except Exception:
        pass
    try:
        seen_dl = {}  # downloadId → index in items, to deduplicate season packs
        for r in _bb_req(f'{BB_SON_URL}/api/v3/queue?includeSeries=true&includeEpisode=true&apikey={BB_SON_KEY}').get('records', []):
            size    = r.get('size', 0)
            series  = r.get('series') or {}
            ep      = r.get('episode') or {}
            s_num   = r.get('seasonNumber') or ep.get('seasonNumber', 0)
            e_num   = ep.get('episodeNumber', 0)
            s_title = series.get('title', '') or r.get('title', '')
            dl_id   = r.get('downloadId', '')
            if dl_id and dl_id in seen_dl:
                # another episode from same season pack — just increment count
                existing = items[seen_dl[dl_id]]
                existing['epCount'] = existing.get('epCount', 1) + 1
                continue
            title = r.get('title', '')
            if s_title and s_num:
                title = f"{s_title} S{s_num:02d}"
            elif s_title:
                title = s_title
            entry = {
                'queueId':      r.get('id'),
                'source':       'sonarr',
                'title':        title,
                'type':         'tv',
                'status':       r.get('status', ''),
                'trackedState': r.get('trackedDownloadState', ''),
                'pct':          _pct(size, r.get('sizeleft', 0)),
                'sizeMb':       round(size / (1024 ** 2)) if size else 0,
                'message':      _first_msg(r),
                'epCount':      1,
            }
            if dl_id:
                seen_dl[dl_id] = len(items)
            items.append(entry)
    except Exception:
        pass
    return jsonify(items)


@app.route('/api/blockbuster/queue/<int:queue_id>', methods=['DELETE'])
def bb_queue_item_delete(queue_id):
    source = request.args.get('source', '')
    if source not in ('radarr', 'sonarr'):
        return jsonify({'error': 'invalid source'}), 400
    base = BB_RAD_URL if source == 'radarr' else BB_SON_URL
    key  = BB_RAD_KEY if source == 'radarr' else BB_SON_KEY
    try:
        _bb_req(
            f'{base}/api/v3/queue/{queue_id}?removeFromClient=true&blocklist=true&apikey={key}',
            method='DELETE')
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/watched')
def bb_watched():
    jf_h        = {'X-Emby-Token': BB_JF_TOKEN}
    movies_out  = []
    seasons_out = []
    try:
        jf_mv  = _bb_req(
            f'{BB_JF_URL}/Users/{BB_JF_USER}/Items'
            f'?IncludeItemTypes=Movie&IsPlayed=true&Recursive=true&Fields=ProviderIds',
            headers=jf_h)
        rad_mv      = _bb_req(f'{BB_RAD_URL}/api/v3/movie?apikey={BB_RAD_KEY}')
        rad_by_tmdb = {str(m['tmdbId']): m for m in rad_mv if m.get('hasFile')}
        for jm in jf_mv.get('Items', []):
            tmdb = str((jm.get('ProviderIds') or {}).get('Tmdb', ''))
            if tmdb and tmdb in rad_by_tmdb:
                rm = rad_by_tmdb[tmdb]
                movies_out.append({
                    'radarrId': rm['id'],
                    'title':    rm['title'],
                    'year':     rm.get('year', ''),
                    'sizeMb':   round(rm.get('sizeOnDisk', 0) / (1024 ** 2)),
                })
    except Exception:
        pass
    try:
        jf_ser_raw  = _bb_req(
            f'{BB_JF_URL}/Users/{BB_JF_USER}/Items'
            f'?IncludeItemTypes=Series&Recursive=true&Fields=ProviderIds',
            headers=jf_h)
        tvdb_by_jf  = {
            s['Id']: str((s.get('ProviderIds') or {}).get('Tvdb', ''))
            for s in jf_ser_raw.get('Items', [])
        }
        jf_sea      = _bb_req(
            f'{BB_JF_URL}/Users/{BB_JF_USER}/Items'
            f'?IncludeItemTypes=Season&Recursive=true&IsPlayed=true'
            f'&Fields=UserData,SeriesName,SeriesId,IndexNumber',
            headers=jf_h)
        son_ser     = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}')
        son_by_tvdb = {str(s['tvdbId']): s for s in son_ser}
        seen = set()
        for js in jf_sea.get('Items', []):
            num  = js.get('IndexNumber', 0)
            if num == 0:
                continue
            tvdb = tvdb_by_jf.get(js.get('SeriesId', ''), '')
            key  = f'{tvdb}_{num}'
            if not tvdb or key in seen or tvdb not in son_by_tvdb:
                continue
            ss       = son_by_tvdb[tvdb]
            s_season = next((x for x in ss.get('seasons', []) if x.get('seasonNumber') == num), None)
            if not s_season:
                continue
            size_mb = round(s_season.get('statistics', {}).get('sizeOnDisk', 0) / (1024 ** 2))
            if size_mb == 0:
                continue
            seen.add(key)
            seasons_out.append({
                'sonarrId':  ss['id'],
                'seasonNum': num,
                'title':     js.get('SeriesName', ss['title']),
                'sizeMb':    size_mb,
            })
    except Exception:
        pass
    return jsonify({'movies': movies_out, 'seasons': seasons_out})


@app.route('/api/blockbuster/delete/movie/<int:radarr_id>', methods=['DELETE'])
def bb_delete_movie(radarr_id):
    try:
        _bb_req(
            f'{BB_RAD_URL}/api/v3/movie/{radarr_id}?deleteFiles=true&apikey={BB_RAD_KEY}',
            method='DELETE')
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/delete/season', methods=['POST'])
def bb_delete_season():
    raw        = request.get_json(force=True, silent=True) or {}
    sonarr_id  = raw.get('sonarrId')
    season_num = raw.get('seasonNum')
    if not isinstance(sonarr_id, int) or not isinstance(season_num, int):
        return jsonify({'error': 'invalid'}), 400
    try:
        files = _bb_req(f'{BB_SON_URL}/api/v3/episodefile?seriesId={sonarr_id}&apikey={BB_SON_KEY}')
        ids   = [f['id'] for f in files if isinstance(f, dict) and f.get('seasonNumber') == season_num]
        if ids:
            _bb_req(
                f'{BB_SON_URL}/api/v3/episodefile/bulk?apikey={BB_SON_KEY}',
                method='DELETE', data={'episodeFileIds': ids})
        return jsonify({'deleted': len(ids)})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/library')
def bb_library():
    jf_h = {'X-Emby-Token': BB_JF_TOKEN}
    def _fetch(item_type):
        data = _bb_req(
            f'{BB_JF_URL}/Users/{BB_JF_USER}/Items'
            f'?IncludeItemTypes={item_type}&Recursive=true'
            f'&SortBy=SortName&SortOrder=Ascending&Limit=50',
            headers=jf_h)
        return [{'id': i['Id'], 'title': i.get('Name', ''), 'year': i.get('ProductionYear', '')}
                for i in data.get('Items', [])]
    try:
        return jsonify({'movies': _fetch('Movie'), 'series': _fetch('Series')})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/jf-poster/<item_id>')
def bb_jf_poster(item_id):
    if not re.match(r'^[a-f0-9]{32}$', item_id):
        return '', 400
    try:
        req = urllib.request.Request(
            f'{BB_JF_URL}/Items/{item_id}/Images/Primary?width=185&quality=85',
            headers={'X-Emby-Token': BB_JF_TOKEN})
        with urllib.request.urlopen(req, timeout=8) as r:
            img = r.read()
            ct  = r.headers.get('Content-Type', 'image/jpeg')
        resp = make_response(img)
        resp.headers['Content-Type']  = ct
        resp.headers['Cache-Control'] = 'public, max-age=86400'
        return resp
    except Exception:
        return '', 404


@app.route('/api/blockbuster/poster')
def bb_poster():
    path = request.args.get('path', '')
    if not re.match(r'^/[\w\-]+\.jpg$', path):
        return '', 400
    try:
        with urllib.request.urlopen(f'https://image.tmdb.org/t/p/w185{path}', timeout=5) as r:
            img = r.read()
        resp = make_response(img)
        resp.headers['Content-Type']  = 'image/jpeg'
        resp.headers['Cache-Control'] = 'public, max-age=86400'
        return resp
    except Exception:
        return '', 404


# ── STATIC ────────────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


if __name__ == '__main__':
    print("✅ Dashboard at http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=False)
