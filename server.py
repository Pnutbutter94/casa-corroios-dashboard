from flask import Flask, jsonify, make_response, send_from_directory, request
import urllib.request
import urllib.parse
import http.cookiejar
import json
import os
import time
import datetime
import uuid
import re
import math

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
RATINGS_FILE = os.path.join(DATA_DIR, 'ratings.json')
CACHE_TTL  = 15 * 60  # 15 minutes

ALLOWED_INV_FIELDS     = {'name', 'quantity', 'unit', 'location', 'quantityKnown', 'productId'}
ALLOWED_SHOP_FIELDS    = {'checked', 'name', 'quantity', 'unit', 'category', 'productId', 'source'}
ALLOWED_PRODUCT_FIELDS = {'name', 'category', 'unit', 'defaultQty'}

HA_URL   = 'http://192.168.1.100:8123'
HA_TOKEN = os.environ['HA_TOKEN']

IOT_ENTITIES = frozenset([
    'light.escritorio_ines', 'light.luz_de_entrada', 'light.wiz_rgbw_tunable_877be6',
    'switch.plug_sala',
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
BB_BAZ_URL  = 'http://localhost:6767'
BB_BAZ_KEY  = 'c484cd24fd09181cf105a1b51506bae6'
BB_QB_URL   = 'http://localhost:8081'
BB_QB_USER  = 'admin'
BB_QB_PASS  = 'SportingCP1906!'
BB_QUOTA_GB = 150

_qb_opener    = None
_qb_last_auth = 0.0
_QB_TTL       = 3600


def _bb_qb_get(path):
    global _qb_opener, _qb_last_auth
    now = time.time()
    if _qb_opener is None or now - _qb_last_auth > _QB_TTL:
        jar    = http.cookiejar.CookieJar()
        opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
        creds  = urllib.parse.urlencode({'username': BB_QB_USER, 'password': BB_QB_PASS}).encode()
        opener.open(urllib.request.Request(f'{BB_QB_URL}/api/v2/auth/login', data=creds), timeout=5)
        _qb_opener    = opener
        _qb_last_auth = now
    with _qb_opener.open(f'{BB_QB_URL}{path}', timeout=5) as r:
        raw = r.read()
        return json.loads(raw) if raw else []

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
        "img-src 'self' data: https://*.tile.openstreetmap.org;"
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


ENERGY_ENTITIES = {
    'termoacumulador': {
        'power':  'sensor.termoacumulador_current_power',
        'today':  'sensor.termoacumulador_today_energy',
        'month':  'sensor.termoacumulador_month_energy',
        'label':  'Casaserver',
    },
    'plug_sala': {
        'power':  'sensor.plug_sala_current_power',
        'today':  'sensor.plug_sala_today_energy',
        'month':  'sensor.plug_sala_month_energy',
        'label':  'Plug Sala',
    },
}
TARIFF_EUR_KWH   = 0.2228  # ERSE 2026 simple tariff incl. taxes
ENERGIA_API_URL  = 'http://192.168.1.100:8090'
FATURAS_FILE     = os.path.join(DATA_DIR, 'faturas.json')


def _parse_eredes_xlsx(fileobj):
    try:
        import openpyxl
    except ImportError:
        raise RuntimeError('openpyxl not installed — run: pip install openpyxl')
    import io
    raw = fileobj.read() if hasattr(fileobj, 'read') else fileobj
    wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=True, read_only=True)
    ws = wb.active
    meta, daily, header_done, last_row = {}, {}, False, None
    for row in ws.iter_rows(values_only=True):
        if not header_done:
            if row and row[0] == 'CPE':
                meta['cpe'] = row[1] or ''
            elif row and row[0] == 'Contador':
                header_done = True
            continue
        if not row or row[1] is None or row[3] is None:
            continue
        meter, date_str, time_str, power_kw = row[0], row[1], row[2], row[3]
        if not meta.get('meter'):
            meta['meter'] = str(meter or '')
        date_key = str(date_str).replace('/', '-')
        daily[date_key] = daily.get(date_key, 0.0) + float(power_kw) * 0.25
        last_row = (date_str, time_str, power_kw)
    monthly = {}
    for date_key, kwh in daily.items():
        mk = date_key[:7]
        monthly[mk] = monthly.get(mk, 0.0) + kwh
    return {
        'cpe':     meta.get('cpe', ''),
        'meter':   meta.get('meter', ''),
        'updated': str(last_row[0]).replace('/', '-') if last_row else '',
        'last_ts': f"{str(last_row[0]).replace('/', '-')} {last_row[1]}" if last_row else '',
        'last_w':  round(float(last_row[2]) * 1000, 1) if last_row else 0.0,
        'daily':   {k: round(v, 3) for k, v in daily.items()},
        'monthly': {k: round(v, 2) for k, v in monthly.items()},
    }


@app.route('/api/energy/analysis')
def energy_analysis():
    try:
        with urllib.request.urlopen(f'{ENERGIA_API_URL}/analysis', timeout=8) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/energy/daily')
def energy_daily():
    days = request.args.get('days', '30')
    try:
        with urllib.request.urlopen(f'{ENERGIA_API_URL}/daily?days={days}', timeout=8) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/energy/profile')
def energy_profile():
    try:
        with urllib.request.urlopen(f'{ENERGIA_API_URL}/profile', timeout=8) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/energy/hourly')
def energy_hourly():
    date_str = request.args.get('date', '')
    try:
        with urllib.request.urlopen(f'{ENERGIA_API_URL}/hourly?date={date_str}', timeout=8) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/energy/eredes-upload', methods=['POST'])
def eredes_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'no file'}), 400
    f = request.files['file']
    if not f.filename.lower().endswith('.xlsx'):
        return jsonify({'error': 'xlsx only'}), 400
    try:
        import urllib.error
        data = f.read()
        boundary = b'----boundary'
        body = (b'--' + boundary + b'\r\nContent-Disposition: form-data; name="file"; filename="eredes.xlsx"\r\n'
                b'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n'
                + data + b'\r\n--' + boundary + b'--\r\n')
        req = urllib.request.Request(
            f'{ENERGIA_API_URL}/upload/eredes',
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary=----boundary'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/energy/fatura-parse', methods=['POST'])
def fatura_parse():
    if 'file' not in request.files:
        return jsonify({'error': 'no file'}), 400
    data = request.files['file'].read()
    boundary = b'----boundary'
    body = (b'--' + boundary + b'\r\nContent-Disposition: form-data; name="file"; filename="fatura.pdf"\r\n'
            b'Content-Type: application/pdf\r\n\r\n'
            + data + b'\r\n--' + boundary + b'--\r\n')
    try:
        req = urllib.request.Request(
            f'{ENERGIA_API_URL}/fatura/parse',
            data=body,
            headers={'Content-Type': 'multipart/form-data; boundary=----boundary'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/energy/fatura-store', methods=['POST'])
def fatura_store():
    data_str = request.form.get('data')
    if not data_str:
        return jsonify({'error': 'no data'}), 400
    pdf_data = request.files['file'].read() if 'file' in request.files else b''
    boundary = b'----faturaboundary'
    body = (b'--' + boundary + b'\r\nContent-Disposition: form-data; name="data"\r\n\r\n'
            + data_str.encode() + b'\r\n')
    if pdf_data:
        body += (b'--' + boundary + b'\r\nContent-Disposition: form-data; name="file"; filename="fatura.pdf"\r\n'
                 b'Content-Type: application/pdf\r\n\r\n' + pdf_data + b'\r\n')
    body += b'--' + boundary + b'--\r\n'
    try:
        req = urllib.request.Request(
            f'{ENERGIA_API_URL}/fatura/store',
            data=body,
            headers={'Content-Type': 'multipart/form-data; boundary=----faturaboundary'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            return jsonify(json.loads(r.read()))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/energy/costs')
def energy_costs():
    try:
        all_states = _ha_request('/api/states')
        state_map = {s['entity_id']: s for s in all_states}

        def _val(entity_id):
            s = state_map.get(entity_id, {})
            try:
                return float(s.get('state', 0))
            except (ValueError, TypeError):
                return 0.0

        now = datetime.datetime.now()
        hours_today = now.hour + now.minute / 60
        days_elapsed = now.day - 1 + hours_today / 24

        # Resolve contract rate before devices loop so both use the same rate
        rate = TARIFF_EUR_KWH
        contract = None
        fatura_count = 0
        try:
            with open(FATURAS_FILE) as ff:
                faturas = json.load(ff)
            fatura_count = len(faturas)
            if faturas:
                latest = max(faturas, key=lambda x: x.get('periodo_fim', ''))
                fim_str = latest.get('periodo_fim', '')
                try:
                    fim_date = datetime.date.fromisoformat(fim_str[:10])
                    stale = (datetime.date.today() - fim_date).days > 365
                except (ValueError, TypeError):
                    stale = True
                contract = {
                    'fornecedor':         latest.get('fornecedor', ''),
                    'potencia_kva':       latest.get('potencia_contratada_kva'),
                    'preco_dia_potencia': latest.get('preco_dia_potencia_eur'),
                    'preco_kwh':          latest.get('preco_kwh') or TARIFF_EUR_KWH,
                    'periodo_fim':        fim_str,
                    'stale':              stale,
                }
                rate = contract['preco_kwh'] or TARIFF_EUR_KWH
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            pass

        devices = []
        total_today = 0.0
        total_month = 0.0

        for key, cfg in ENERGY_ENTITIES.items():
            today_kwh = _val(cfg['today'])
            month_kwh = _val(cfg['month'])
            current_w = _val(cfg['power'])
            devices.append({
                'label':      cfg['label'],
                'current_w':  round(current_w, 1),
                'today_kwh':  round(today_kwh, 3),
                'month_kwh':  round(month_kwh, 3),
                'today_cost': round(today_kwh * rate, 2),
                'month_cost': round(month_kwh * rate, 2),
                'estimated':  False,
            })
            total_today += today_kwh
            total_month += month_kwh


        eredes_out = None
        try:
            today_str = now.date().isoformat()
            yest_str  = (now.date() - datetime.timedelta(days=1)).isoformat()
            month_str = today_str[:7]
            with urllib.request.urlopen(f'{ENERGIA_API_URL}/daily?days=35', timeout=3) as r:
                daily_rows = json.loads(r.read())
            daily_map = {row['date']: (row['kwh'] or 0.0) for row in daily_rows}
            today_kwh = round(daily_map.get(today_str, 0.0), 3)
            yest_kwh  = round(daily_map.get(yest_str, 0.0), 3)
            month_kwh = round(sum(v for d, v in daily_map.items() if d.startswith(month_str)), 2)
            if any(v > 0 for v in daily_map.values()):
                eredes_out = {
                    'today_kwh':      today_kwh,
                    'today_cost':     round(today_kwh * TARIFF_EUR_KWH, 2),
                    'yesterday_kwh':  yest_kwh,
                    'yesterday_cost': round(yest_kwh * TARIFF_EUR_KWH, 2),
                    'month_kwh':      month_kwh,
                    'month_cost':     round(month_kwh * TARIFF_EUR_KWH, 2),
                    'last_w':         0.0,
                    'last_ts':        '',
                }
        except Exception:
            pass

        return jsonify({
            'rate_per_kwh':  rate,
            'contract':      contract,
            'fatura_count':  fatura_count,
            'eredes':        eredes_out,
            'devices':       devices,
            'totals': {
                'today_kwh':  round(total_today, 3),
                'month_kwh':  round(total_month, 3),
                'today_cost': round(total_today * rate, 2),
                'month_cost': round(total_month * rate, 2),
            },
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 502


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
    # Viomi vacuum doesn't support return_to_base natively; use the xiaomi_home button entity
    if entity_id == 'vacuum.viomi_de_428952342_v19' and service == 'return_to_base':
        try:
            return jsonify(_ha_request('/api/services/button/press',
                                       {'entity_id': 'button.viomi_de_428952342_v19_start_charge_a_2_4'}))
        except Exception as e:
            return jsonify({'error': str(e)}), 502

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

def _load_ratings():
    try:
        with open(RATINGS_FILE) as f:
            return json.load(f).get('ratings', [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def _save_ratings(ratings):
    with open(RATINGS_FILE, 'w') as f:
        json.dump({'ratings': ratings}, f, ensure_ascii=False, indent=2)


def _bb_req(url, method='GET', data=None, headers=None):
    body = json.dumps(data).encode() if data is not None else None
    h = {} if body is None else {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=10) as r:
        raw = r.read()
        return json.loads(raw) if raw else {}


def _bb_jf_library_refresh():
    try:
        _bb_req(f'{BB_JF_URL}/Library/Refresh', method='POST',
                headers={'X-Emby-Token': BB_JF_TOKEN})
    except Exception:
        pass


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
                'genreIds':  r.get('genreIds', []),
                'overview':  (r.get('overview') or '')[:300],
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
        if not tvdb_id:
            return jsonify({'error': 'no tvdb id'}), 404

        all_series = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}')
        series     = next((s for s in all_series if s.get('tvdbId') == tvdb_id), None)

        if not series:
            # Add the series to Sonarr with all episodes unmonitored, no auto-search
            lookup = _bb_req(f'{BB_SON_URL}/api/v3/series/lookup?term=tvdb:{tvdb_id}&apikey={BB_SON_KEY}')
            if not lookup:
                return jsonify({'error': 'not found'}), 404
            ref = all_series[0] if all_series else {}
            new_s = lookup[0]
            for season in new_s.get('seasons', []):
                season['monitored'] = False
            new_s.update({
                'monitored':         False,
                'qualityProfileId':  ref.get('qualityProfileId', 1),
                'rootFolderPath':    ref.get('rootFolderPath', '/media/tv'),
                'languageProfileId': ref.get('languageProfileId', 1),
                'addOptions': {
                    'ignoreEpisodesWithFiles':      False,
                    'searchForMissingEpisodes':     False,
                    'searchForCutoffUnmetEpisodes': False,
                },
            })
            series = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}',
                             method='POST', data=new_s)

        sid     = series['id']
        all_eps = _bb_req(f'{BB_SON_URL}/api/v3/episode?seriesId={sid}&seasonNumber={s_num}&apikey={BB_SON_KEY}')
        ep_ids  = [ep['id'] for ep in all_eps if ep.get('episodeNumber') in ep_nums]
        if not ep_ids:
            return jsonify({'error': 'episodes not found in Sonarr'}), 404
        _bb_req(f'{BB_SON_URL}/api/v3/episode/monitor?apikey={BB_SON_KEY}',
                method='PUT', data={'episodeIds': ep_ids, 'monitored': True})
        _bb_req(f'{BB_SON_URL}/api/v3/command?apikey={BB_SON_KEY}',
                method='POST', data={'name': 'EpisodeSearch', 'episodeIds': ep_ids})
        return jsonify({'ok': True})
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
                'dlHash':       (r.get('downloadId') or '').lower(),
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
                'dlHash':       (dl_id or '').lower(),
            }
            if dl_id:
                seen_dl[dl_id] = len(items)
            items.append(entry)
    except Exception:
        pass

    hashes = [it['dlHash'] for it in items if it.get('dlHash')]
    if hashes:
        try:
            qb_list = _bb_qb_get('/api/v2/torrents/info?hashes=' + '|'.join(hashes))
            qb_map  = {t['hash'].lower(): t for t in qb_list}
            for it in items:
                qb = qb_map.get(it.get('dlHash', ''))
                if qb:
                    it['dlspeed'] = qb.get('dlspeed', 0)
                    it['seeds']   = qb.get('num_complete', 0)
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
        _bb_jf_library_refresh()
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
        _bb_jf_library_refresh()
        return jsonify({'deleted': len(ids)})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/library')
def bb_library():
    jf_h = {'X-Emby-Token': BB_JF_TOKEN}
    try:
        # Build sets of IDs that actually have files — ghosts are excluded
        son_series  = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}')
        tvdb_w_files = {str(s['tvdbId']) for s in son_series
                        if s.get('statistics', {}).get('episodeFileCount', 0) > 0}
        rad_movies  = _bb_req(f'{BB_RAD_URL}/api/v3/movie?apikey={BB_RAD_KEY}')
        tmdb_w_files = {str(m['tmdbId']) for m in rad_movies if m.get('hasFile')}

        def _fetch_jf(item_type):
            data = _bb_req(
                f'{BB_JF_URL}/Users/{BB_JF_USER}/Items'
                f'?IncludeItemTypes={item_type}&Recursive=true'
                f'&SortBy=SortName&SortOrder=Ascending&Limit=50'
                f'&Fields=OriginalTitle,ProviderIds',
                headers=jf_h)
            return data.get('Items', [])

        def _jf_item(i):
            return {'id': i['Id'],
                    'title': i.get('Name', ''),
                    'originalTitle': i.get('OriginalTitle') or i.get('Name', ''),
                    'year': i.get('ProductionYear', '')}

        movies = [_jf_item(i) for i in _fetch_jf('Movie')
                  if str((i.get('ProviderIds') or {}).get('Tmdb', '')) in tmdb_w_files]
        series = [_jf_item(i) for i in _fetch_jf('Series')
                  if str((i.get('ProviderIds') or {}).get('Tvdb', '')) in tvdb_w_files]

        return jsonify({'movies': movies, 'series': series})
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


@app.route('/api/blockbuster/detail')
def bb_detail():
    item_id   = request.args.get('id', '').strip()
    item_type = request.args.get('type', '')
    if not re.match(r'^[a-f0-9]{32}$', item_id) or item_type not in ('movie', 'series'):
        return jsonify({'error': 'invalid'}), 400
    jf_h = {'X-Emby-Token': BB_JF_TOKEN}
    try:
        jf_item   = _bb_req(
            f'{BB_JF_URL}/Users/{BB_JF_USER}/Items/{item_id}?Fields=ProviderIds,Overview',
            headers=jf_h)
        providers = jf_item.get('ProviderIds') or {}
        overview  = (jf_item.get('Overview') or '')[:400]
        tmdb_id   = str(providers.get('Tmdb', ''))
        tvdb_id   = str(providers.get('Tvdb', ''))
        if item_type == 'movie':
            rad_mv = _bb_req(f'{BB_RAD_URL}/api/v3/movie?apikey={BB_RAD_KEY}')
            movie  = next((m for m in rad_mv if str(m.get('tmdbId', '')) == tmdb_id), None)
            if not movie:
                return jsonify({'error': 'not found'}), 404
            return jsonify({
                'type':     'movie',
                'radarrId': movie['id'],
                'overview': overview,
                'hasFile':  movie.get('hasFile', False),
                'sizeMb':   round(movie.get('sizeOnDisk', 0) / (1024 ** 2)),
            })
        son_ser  = _bb_req(f'{BB_SON_URL}/api/v3/series?apikey={BB_SON_KEY}')
        series   = next((s for s in son_ser if str(s.get('tvdbId', '')) == tvdb_id), None)
        if not series:
            return jsonify({'error': 'not found'}), 404
        son_id   = series['id']
        episodes = _bb_req(f'{BB_SON_URL}/api/v3/episode?seriesId={son_id}&apikey={BB_SON_KEY}')
        seasons_map = {}
        for ep in episodes:
            sn = ep.get('seasonNumber', 0)
            if sn == 0:
                continue
            seasons_map.setdefault(sn, []).append({
                'number':        ep.get('episodeNumber', 0),
                'title':         ep.get('title', ''),
                'airDate':       ep.get('airDateUtc', ''),
                'hasFile':       ep.get('hasFile', False),
                'monitored':     ep.get('monitored', False),
                'episodeFileId': ep.get('episodeFileId') or None,
            })
        seasons_out = [
            {'number': sn, 'episodes': sorted(seasons_map[sn], key=lambda e: e['number'])}
            for sn in sorted(seasons_map)
        ]
        return jsonify({
            'type':     'series',
            'sonarrId': son_id,
            'tmdbId':   int(tmdb_id) if tmdb_id.isdigit() else None,
            'overview': overview,
            'seasons':  seasons_out,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/ratings')
def bb_ratings_get():
    return jsonify(_load_ratings())


ALLOWED_RATING_FIELDS = {'jfId', 'title', 'year', 'type', 'ratingAntonio', 'commentAntonio', 'ratingInes', 'commentInes'}

@app.route('/api/blockbuster/rate', methods=['POST'])
def bb_rate():
    raw = request.get_json(force=True, silent=True) or {}
    if not raw.get('jfId') or not raw.get('title') or raw.get('type') not in ('movie', 'series'):
        return jsonify({'error': 'invalid'}), 400
    ratings  = _load_ratings()
    existing = next((r for r in ratings if r.get('jfId') == raw['jfId']), None)
    now      = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S')
    entry    = {k: raw[k] for k in ALLOWED_RATING_FIELDS if k in raw}
    if existing:
        existing.update(entry)
        existing['watchedAt'] = now
        result = existing
    else:
        entry['id']        = str(uuid.uuid4())
        entry['watchedAt'] = now
        ratings.append(entry)
        result = entry
    _save_ratings(ratings)
    return jsonify(result)


@app.route('/api/blockbuster/delete/episode', methods=['POST'])
def bb_delete_episode():
    raw     = request.get_json(force=True, silent=True) or {}
    file_id = raw.get('episodeFileId')
    if not isinstance(file_id, int) or file_id <= 0:
        return jsonify({'error': 'invalid'}), 400
    try:
        _bb_req(
            f'{BB_SON_URL}/api/v3/episodefile/{file_id}?apikey={BB_SON_KEY}',
            method='DELETE')
        _bb_jf_library_refresh()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/library/refresh', methods=['POST'])
def bb_library_refresh():
    _bb_jf_library_refresh()
    return '', 204


@app.route('/api/blockbuster/subtitles/search', methods=['POST'])
def bb_subtitles_search():
    raw       = request.get_json(force=True, silent=True) or {}
    item_type = raw.get('type')
    if item_type not in ('movie', 'series'):
        return jsonify({'error': 'invalid type'}), 400
    try:
        if item_type == 'movie':
            radarr_id = raw.get('radarrId')
            if not isinstance(radarr_id, int):
                return jsonify({'error': 'invalid radarrId'}), 400
            movies = _bb_req(f'{BB_BAZ_URL}/api/movies?apikey={BB_BAZ_KEY}')
            movie  = next((m for m in movies.get('data', []) if m.get('radarrId') == radarr_id), None)
            if not movie:
                return jsonify({'ok': True, 'searched': 0, 'message': 'not in Bazarr yet'})
            missing = movie.get('missing_subtitles') or []
            count   = 0
            for sub in missing:
                lang = sub.get('code2') or sub.get('code3', 'en')
                _bb_req(f'{BB_BAZ_URL}/api/movies/subtitles?apikey={BB_BAZ_KEY}',
                        method='PATCH',
                        data={'radarrid': radarr_id, 'language': lang,
                              'hi': False, 'forced': False})
                count += 1
            return jsonify({'ok': True, 'searched': count,
                            'message': 'already complete' if not missing else f'{count} search(es) started'})

        else:  # series
            sonarr_id = raw.get('sonarrId')
            if not isinstance(sonarr_id, int):
                return jsonify({'error': 'invalid sonarrId'}), 400
            wanted  = _bb_req(f'{BB_BAZ_URL}/api/episodes/wanted?apikey={BB_BAZ_KEY}&seriesid={sonarr_id}')
            episodes = wanted.get('data', [])[:50]  # cap at 50 episodes per trigger
            count   = 0
            for ep in episodes:
                ep_id = ep.get('sonarrEpisodeId')
                for sub in (ep.get('missing_subtitles') or []):
                    lang = sub.get('code2') or sub.get('code3', 'en')
                    _bb_req(f'{BB_BAZ_URL}/api/episodes/subtitles?apikey={BB_BAZ_KEY}',
                            method='PATCH',
                            data={'seriesid': sonarr_id, 'episodeid': ep_id,
                                  'language': lang, 'hi': False, 'forced': False})
                    count += 1
            return jsonify({'ok': True, 'searched': count, 'episodes': len(episodes),
                            'message': 'all subtitles present' if not episodes else f'{count} search(es) started across {len(episodes)} ep(s)'})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


def _bb_lang_to_profile(lang_name):
    ln = (lang_name or '').lower()
    if ln == 'portuguese':
        return None  # native speakers — no subs needed
    if ln == 'spanish':
        return 2     # PT-PT (+ EN fallback)
    return 1         # EN subs for English and all other languages


def _bb_set_subtitle_profile(item_type, item_id, lang_name):
    """Set Bazarr language profile for a series or movie and trigger subtitle search."""
    profile_id = _bb_lang_to_profile(lang_name)
    profile_str = str(profile_id) if profile_id is not None else 'null'
    if item_type == 'series':
        body = urllib.parse.urlencode({'seriesid': item_id, 'profileid': profile_str}).encode()
        urllib.request.urlopen(
            urllib.request.Request(f'{BB_BAZ_URL}/api/series?apikey={BB_BAZ_KEY}',
                                   data=body,
                                   headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                   method='POST'), timeout=10)
        if profile_id is not None:
            body2 = urllib.parse.urlencode({'seriesid': item_id, 'action': 'search-missing'}).encode()
            urllib.request.urlopen(
                urllib.request.Request(f'{BB_BAZ_URL}/api/series?apikey={BB_BAZ_KEY}',
                                       data=body2,
                                       headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                       method='PATCH'), timeout=30)
    else:
        body = urllib.parse.urlencode({'radarrid': item_id, 'profileid': profile_str}).encode()
        urllib.request.urlopen(
            urllib.request.Request(f'{BB_BAZ_URL}/api/movies?apikey={BB_BAZ_KEY}',
                                   data=body,
                                   headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                   method='POST'), timeout=10)
        if profile_id is not None:
            body2 = urllib.parse.urlencode({'radarrid': item_id, 'action': 'search-missing'}).encode()
            urllib.request.urlopen(
                urllib.request.Request(f'{BB_BAZ_URL}/api/movies?apikey={BB_BAZ_KEY}',
                                       data=body2,
                                       headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                       method='PATCH'), timeout=30)


@app.route('/api/blockbuster/webhook/sonarr', methods=['POST'])
def bb_webhook_sonarr():
    raw = request.get_json(force=True, silent=True) or {}
    event_type = raw.get('eventType', '')
    if event_type == 'Test':
        return jsonify({'ok': True})
    if event_type not in ('Download', 'EpisodeFileImported'):
        return jsonify({'ok': True, 'skipped': event_type})
    series_id = (raw.get('series') or {}).get('id')
    if not series_id:
        return jsonify({'ok': True, 'skipped': 'no series id'})
    try:
        series = _bb_req(f'{BB_SON_URL}/api/v3/series/{series_id}?apikey={BB_SON_KEY}')
        lang = (series.get('originalLanguage') or {}).get('name', 'English')
        _bb_set_subtitle_profile('series', series_id, lang)
        return jsonify({'ok': True, 'series': series.get('title'), 'lang': lang})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/blockbuster/webhook/radarr', methods=['POST'])
def bb_webhook_radarr():
    raw = request.get_json(force=True, silent=True) or {}
    event_type = raw.get('eventType', '')
    if event_type == 'Test':
        return jsonify({'ok': True})
    if event_type not in ('Download', 'MovieFileImported'):
        return jsonify({'ok': True, 'skipped': event_type})
    movie = raw.get('movie') or {}
    radarr_id = movie.get('id')
    if not radarr_id:
        return jsonify({'ok': True, 'skipped': 'no movie id'})
    lang = (movie.get('originalLanguage') or {}).get('name')
    if not lang:
        try:
            m = _bb_req(f'{BB_RAD_URL}/api/v3/movie/{radarr_id}?apikey={BB_RAD_KEY}')
            lang = (m.get('originalLanguage') or {}).get('name', 'English')
        except Exception:
            lang = 'English'
    try:
        _bb_set_subtitle_profile('movie', radarr_id, lang)
        return jsonify({'ok': True, 'movie': movie.get('title'), 'lang': lang})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


# ── GEO ───────────────────────────────────────────────────────────────────────

@app.route('/api/geo/geocode')
def geocode():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'found': False})
    try:
        url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
            {'q': q, 'format': 'json', 'limit': '1'})
        req = urllib.request.Request(url, headers={
            'User-Agent': 'casaserver-dashboard/1.0 apcestrela@gmail.com'})
        with urllib.request.urlopen(req, timeout=6) as r:
            data = json.load(r)
        if not data:
            return jsonify({'found': False})
        return jsonify({'found': True, 'lat': float(data[0]['lat']),
                        'lon': float(data[0]['lon']),
                        'display_name': data[0]['display_name'][:120]})
    except Exception:
        return jsonify({'found': False})


@app.route('/api/geo/nearby')
def nearby():
    try:
        lat  = float(request.args.get('lat', 0))
        lon  = float(request.args.get('lon', 0))
        radius = min(int(request.args.get('radius', 1000)), 2000)
        overpass_q = f'''[out:json][timeout:15];
(
  node(around:{radius},{lat},{lon})[tourism~"^(museum|attraction|gallery)$"][name];
  way(around:{radius},{lat},{lon})[tourism~"^(museum|attraction)$"][name];
  node(around:{radius},{lat},{lon})[leisure="park"][name];
  way(around:{radius},{lat},{lon})[leisure="park"][name];
  node(around:{radius},{lat},{lon})[amenity="restaurant"][name][cuisine];
  node(around:{radius},{lat},{lon})[amenity="cafe"][name];
)->.a;
.a out body center;'''
        req = urllib.request.Request(
            'https://overpass-api.de/api/interpreter',
            data=urllib.parse.urlencode({'data': overpass_q}).encode(),
            headers={'User-Agent': 'casaserver-dashboard/1.0'})
        with urllib.request.urlopen(req, timeout=18) as r:
            data = json.load(r)
        SKIP = ('estatua', 'monumento', 'escultura', 'busto', 'placa', 'statue')
        seen, results = set(), []
        for el in data.get('elements', []):
            tags = el.get('tags', {})
            name = tags.get('name', '').strip()
            if not name or name in seen or len(name) < 3:
                continue
            if name.lower().startswith(SKIP):
                continue
            seen.add(name)
            lat_el = el.get('lat') or el.get('center', {}).get('lat')
            lon_el = el.get('lon') or el.get('center', {}).get('lon')
            poi_type = tags.get('tourism') or tags.get('leisure') or tags.get('amenity', 'attraction')
            results.append({'name': name, 'type': poi_type,
                            'lat': lat_el, 'lon': lon_el,
                            'opening_hours': tags.get('opening_hours', ''),
                            'website': tags.get('website', '')})
        return jsonify(results[:12])
    except Exception:
        return jsonify([])


ORS_KEY = os.environ.get('ORS_KEY', '')


@app.route('/api/geo/traveltime')
def geo_traveltime():
    if not ORS_KEY:
        return jsonify({'error': 'no ors key'}), 503
    from_lat = request.args.get('from_lat', '')
    from_lon = request.args.get('from_lon', '')
    to_lat   = request.args.get('to_lat', '')
    to_lon   = request.args.get('to_lon', '')
    mode     = request.args.get('mode', 'foot-walking')
    if not all([from_lat, from_lon, to_lat, to_lon]):
        return jsonify({'error': 'missing params'}), 400
    if mode not in ('foot-walking', 'driving-car', 'cycling-regular'):
        mode = 'foot-walking'
    url = (f'https://api.openrouteservice.org/v2/directions/{mode}?'
           + urllib.parse.urlencode({'api_key': ORS_KEY,
                                     'start': f'{from_lon},{from_lat}',
                                     'end': f'{to_lon},{to_lat}'}))
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'casaserver-dashboard/1.0 apcestrela@gmail.com'})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.load(r)
        seg = data['features'][0]['properties']['segments'][0]
        return jsonify({'minutes': round(seg['duration'] / 60),
                        'distance_m': round(seg['distance'])})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


# ── FLIGHT TRACKER ────────────────────────────────────────────────────────────

AERODATABOX_KEY   = os.environ.get('AERODATABOX_KEY', '')
AVIATIONSTACK_KEY = os.environ.get('AVIATIONSTACK_KEY', '')

# ── AIRPORT METADATA & BUFFER CALCULATION ─────────────────────────────────────
# (lat, lon, country_code, continent)
AIRPORT_META = {
    # Portugal
    'LIS': (38.7742, -9.1342, 'PT', 'EU'), 'OPO': (41.2481, -8.6814, 'PT', 'EU'),
    'FAO': (37.0144, -7.9659, 'PT', 'EU'),
    # Spain
    'MAD': (40.4936, -3.5668, 'ES', 'EU'), 'BCN': (41.2971, 2.0785, 'ES', 'EU'),
    'AGP': (36.6749, -4.4991, 'ES', 'EU'), 'SVQ': (37.4180, -5.8931, 'ES', 'EU'),
    # France
    'CDG': (49.0097, 2.5479, 'FR', 'EU'), 'ORY': (48.7233, 2.3794, 'FR', 'EU'),
    'NCE': (43.6584, 7.2159, 'FR', 'EU'),
    # UK (not Schengen)
    'LHR': (51.4775, -0.4614, 'GB', 'EU'), 'LGW': (51.1537, -0.1821, 'GB', 'EU'),
    'STN': (51.8850, 0.2350, 'GB', 'EU'), 'MAN': (53.3537, -2.2750, 'GB', 'EU'),
    # Germany
    'FRA': (50.0379, 8.5622, 'DE', 'EU'), 'MUC': (48.3538, 11.7861, 'DE', 'EU'),
    'BER': (52.3667, 13.5033, 'DE', 'EU'),
    # Netherlands
    'AMS': (52.3086, 4.7639, 'NL', 'EU'),
    # Italy
    'FCO': (41.8003, 12.2389, 'IT', 'EU'), 'MXP': (45.6306, 8.7281, 'IT', 'EU'),
    'NAP': (40.8860, 14.2908, 'IT', 'EU'), 'VCE': (45.5053, 12.3519, 'IT', 'EU'),
    # Switzerland
    'ZRH': (47.4647, 8.5492, 'CH', 'EU'), 'GVA': (46.2380, 6.1090, 'CH', 'EU'),
    # Others EU/Schengen
    'BRU': (50.9010, 4.4844, 'BE', 'EU'), 'VIE': (48.1103, 16.5697, 'AT', 'EU'),
    'CPH': (55.6180, 12.6560, 'DK', 'EU'), 'ARN': (59.6519, 17.9186, 'SE', 'EU'),
    'HEL': (60.3172, 24.9633, 'FI', 'EU'), 'OSL': (60.1939, 11.1004, 'NO', 'EU'),
    'WAW': (52.1657, 20.9671, 'PL', 'EU'), 'PRG': (50.1008, 14.2600, 'CZ', 'EU'),
    'BUD': (47.4298, 19.2611, 'HU', 'EU'), 'ATH': (37.9364, 23.9445, 'GR', 'EU'),
    'DUB': (53.4213, -6.2700, 'IE', 'EU'),  # Ireland: not Schengen
    # Turkey (not EU)
    'IST': (41.2753, 28.7519, 'TR', 'AS'), 'SAW': (40.8986, 29.3092, 'TR', 'AS'),
    # Americas
    'JFK': (40.6413, -73.7781, 'US', 'NA'), 'EWR': (40.6895, -74.1745, 'US', 'NA'),
    'LAX': (33.9425, -118.408, 'US', 'NA'), 'ORD': (41.9742, -87.9073, 'US', 'NA'),
    'MIA': (25.7959, -80.2870, 'US', 'NA'), 'BOS': (42.3656, -71.0096, 'US', 'NA'),
    'SFO': (37.6213, -122.379, 'US', 'NA'), 'YYZ': (43.6777, -79.6248, 'CA', 'NA'),
    'MEX': (19.4363, -99.0721, 'MX', 'NA'), 'CUN': (21.0365, -86.8771, 'MX', 'NA'),
    'GRU': (-23.435, -46.473,  'BR', 'SA'), 'GIG': (-22.810, -43.251,  'BR', 'SA'),
    'EZE': (-34.822, -58.536,  'AR', 'SA'), 'BOG': (4.7016, -74.1469,  'CO', 'SA'),
    # Asia
    'NRT': (35.7647, 140.386,  'JP', 'AS'), 'HND': (35.5533, 139.781,  'JP', 'AS'),
    'KIX': (34.4347, 135.244,  'JP', 'AS'), 'ICN': (37.4602, 126.441,  'KR', 'AS'),
    'PEK': (40.0799, 116.603,  'CN', 'AS'), 'PVG': (31.1443, 121.808,  'CN', 'AS'),
    'HKG': (22.3080, 113.919,  'HK', 'AS'), 'SIN': (1.3644, 103.992,   'SG', 'AS'),
    'BKK': (13.6811, 100.748,  'TH', 'AS'), 'KUL': (2.7456, 101.710,   'MY', 'AS'),
    'DXB': (25.2532, 55.3657,  'AE', 'AS'), 'DOH': (25.2609, 51.6138,  'QA', 'AS'),
    'AUH': (24.4330, 54.6511,  'AE', 'AS'), 'DEL': (28.5562, 77.1000,  'IN', 'AS'),
    'BOM': (19.0896, 72.8656,  'IN', 'AS'),
    # Oceania
    'SYD': (-33.940, 151.175,  'AU', 'OC'), 'MEL': (-37.669, 144.841,  'AU', 'OC'),
    # Africa
    'JNB': (-26.139, 28.246,   'ZA', 'AF'), 'CAI': (30.122, 31.406,    'EG', 'AF'),
    'CMN': (33.368, -7.590,    'MA', 'AF'),
}

SCHENGEN = {
    'AT','BE','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IT','LV','LI',
    'LT','LU','MT','NL','NO','PL','PT','SK','SI','ES','SE','CH',
}


def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def _calc_leg_buffers(from_iata, to_iata, hotel_coords=None, direction='auto'):
    """Return time buffers for a leg.
    direction: 'auto' picks the airport closer to the hotel (correct for both
    outbound and return legs without needing to know which is which).
    """
    from_m = AIRPORT_META.get((from_iata or '').upper())
    to_m   = AIRPORT_META.get((to_iata   or '').upper())
    # Auto-select the airport nearest the hotel — the relevant one for ground transfer
    if direction == 'auto' and hotel_coords and isinstance(hotel_coords, dict):
        try:
            d_from = _haversine_km(from_m[0], from_m[1], hotel_coords['lat'], hotel_coords['lon']) if from_m else 9999
            d_to   = _haversine_km(to_m[0],   to_m[1],   hotel_coords['lat'], hotel_coords['lon']) if to_m   else 9999
            apt_m  = from_m if d_from <= d_to else to_m
        except Exception:
            apt_m  = to_m
    else:
        apt_m = to_m if direction != 'departure' else from_m

    # Airport processing (customs/immigration/baggage)
    if from_m and to_m:
        fc, tc = from_m[2], to_m[2]
        fco, tco = from_m[3], to_m[3]
        if fc in SCHENGEN and tc in SCHENGEN:
            processing_min, checkin_buffer_min = 15, 90    # EU internal
        elif fco == tco:
            processing_min, checkin_buffer_min = 45, 120   # same continent, non-Schengen
        else:
            processing_min, checkin_buffer_min = 75, 180   # intercontinental
    else:
        processing_min, checkin_buffer_min = 60, 120

    # Ground transfer: haversine + speed model (public transit estimate)
    transfer_min = 45  # safe fallback
    if apt_m and hotel_coords and isinstance(hotel_coords, dict):
        try:
            dist = _haversine_km(apt_m[0], apt_m[1], hotel_coords['lat'], hotel_coords['lon'])
            speed = 30 if dist < 20 else (45 if dist < 50 else 60)  # km/h
            transfer_min = max(15, int(dist / speed * 60) + 10)
        except Exception:
            pass

    return {
        'processing_min':      processing_min,
        'transfer_min':        transfer_min,
        'hotel_checkin_min':   20,
        'checkin_buffer_min':  checkin_buffer_min,
        'estimated':           True,
        'from_iata':           (from_iata or '').upper(),
        'to_iata':             (to_iata   or '').upper(),
    }


def _hotel_coords_for_leg(trip, leg):
    """Return hotel coords for the city active on the leg's date."""
    day = leg.get('date', '')
    city = next((c for c in trip.get('cities', []) if c.get('arrival', '') <= day <= c.get('departure', '')), None)
    if not city:
        city = (trip.get('cities') or [{}])[0]
    return (city or {}).get('hotel', {}).get('coords')


def _ensure_leg_buffers(trip):
    """Compute/refresh buffers on every leg. Always recalculates estimated ones."""
    changed = False
    for leg in trip.get('legs', []):
        b = leg.get('buffers', {})
        if not b or b.get('estimated', True):  # recalculate if missing or still estimated
            hc = _hotel_coords_for_leg(trip, leg)
            leg['buffers'] = _calc_leg_buffers(leg.get('from'), leg.get('to'), hc)
            changed = True
    return changed


AIRLINE_IATA = {
    'easyjet': 'U2', 'ryanair': 'FR', 'tap': 'TP', 'tap portugal': 'TP',
    'iberia': 'IB', 'vueling': 'VY', 'lufthansa': 'LH', 'british airways': 'BA',
    'wizz air': 'W6', 'transavia': 'HV', 'klm': 'KL', 'air france': 'AF',
    'swiss': 'LX', 'turkish airlines': 'TK', 'united': 'UA', 'delta': 'DL',
    'american airlines': 'AA', 'ryan air': 'FR',
}

ALLOWED_LEG_FIELDS = {
    'flight', 'status', 'delay_minutes',
    'terminal_dep', 'gate_dep', 'actual_departs',
    'terminal_arr', 'gate_arr', 'baggage_belt', 'actual_arrives',
    'status_updated', 'arrives_local', 'departs_local', 'confirmed',
}


def _adb_get(path, params=None):
    url = 'https://aerodatabox.p.rapidapi.com' + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
        'x-rapidapi-key': AERODATABOX_KEY,
        'User-Agent': 'Mozilla/5.0',
    })
    with urllib.request.urlopen(req, timeout=12) as r:
        return json.loads(r.read())


def _avstack_to_updates(f):
    dep = f.get('departure', {})
    arr = f.get('arrival', {})
    STATUS_MAP = {
        'scheduled': 'Scheduled', 'active': 'Active', 'landed': 'Landed',
        'cancelled': 'Cancelled', 'incident': 'Delayed', 'diverted': 'Delayed',
    }
    return {
        'status':         STATUS_MAP.get(f.get('flight_status', 'scheduled'), 'Scheduled'),
        'delay_minutes':  int(dep.get('delay') or 0),
        'terminal_dep':   dep.get('terminal'),
        'gate_dep':       dep.get('gate'),
        'actual_departs': dep.get('actual') or dep.get('estimated') or dep.get('scheduled'),
        'terminal_arr':   arr.get('terminal'),
        'gate_arr':       arr.get('gate'),
        'baggage_belt':   arr.get('baggage'),
        'actual_arrives': arr.get('actual') or arr.get('estimated') or arr.get('scheduled'),
        'status_updated': datetime.datetime.utcnow().isoformat(),
    }


@app.route('/api/trips/<trip_id>/legs/<leg_id>/detect', methods=['POST'])
def detect_flight(trip_id, leg_id):
    t = _load_trip(trip_id)
    if not t: return jsonify({'error': 'not found'}), 404
    leg = next((l for l in t.get('legs', []) if l['id'] == leg_id), None)
    if not leg: return jsonify({'error': 'leg not found'}), 404

    if leg.get('flight') and leg.get('arrives_local'):
        return jsonify({'flight': leg['flight'], 'cached': True})
    # Flight known but arrives_local missing — try to fetch it via status endpoint
    if leg.get('flight') and not leg.get('arrives_local') and AERODATABOX_KEY:
        try:
            date_str = leg.get('date', datetime.date.today().isoformat())
            data = _adb_get(f'/flights/number/{urllib.parse.quote(leg["flight"])}/{date_str}')
            if isinstance(data, list): data = data[0] if data else {}
            if data and 'error' not in data:
                arr = data.get('arrival', {})
                def _lt2(obj, key):
                    v = obj.get(key, {})
                    return (v.get('local') or v.get('utc')) if isinstance(v, dict) else (v or None)
                sched = _lt2(arr, 'scheduledTime') or ''
                if sched and len(sched) >= 16:
                    leg['arrives_local'] = sched[11:16]
                    hc = _hotel_coords_for_leg(t, leg)
                    leg['buffers'] = _calc_leg_buffers(leg.get('from'), leg.get('to'), hc)
                    _save_trip(trip_id, t)
                    return jsonify({'flight': leg['flight'], 'arrives_local': leg['arrives_local'], 'source': 'aerodatabox-status'})
        except Exception:
            pass

    airline_name = (leg.get('airline') or '').lower()
    airline_iata = AIRLINE_IATA.get(airline_name, '')
    dep_iata     = leg.get('from', '')
    dep_time     = (leg.get('departs_local') or '')[:5]
    date         = leg.get('date', '')
    today        = datetime.date.today().isoformat()

    # ── AeroDataBox: /flights/airports/iata/{iata}/{from}/{to} ───────────────
    if AERODATABOX_KEY and dep_time:
        try:
            dep_h, dep_m = int(dep_time[:2]), int(dep_time[3:5])
            from_local = f'{date}T{dep_h:02d}:{max(0,dep_m-60):02d}'
            to_local   = f'{date}T{dep_h:02d}:{min(59,dep_m+60):02d}'
            # handle hour overflow/underflow
            from_dt = datetime.datetime.fromisoformat(f'{date}T{dep_time}') - datetime.timedelta(hours=1)
            to_dt   = datetime.datetime.fromisoformat(f'{date}T{dep_time}') + datetime.timedelta(hours=1)
            from_local = from_dt.strftime('%Y-%m-%dT%H:%M')
            to_local   = to_dt.strftime('%Y-%m-%dT%H:%M')
            dest_iata  = leg.get('to', '').upper()
            data       = _adb_get(f'/flights/airports/iata/{dep_iata}/{from_local}/{to_local}')
            departures = data.get('departures', [])
            best = None
            for f in departures:
                a    = f.get('airline', {})
                mov  = f.get('movement', {})
                sched = (mov.get('scheduledTime') or {}).get('local', '')
                arr_iata = mov.get('airport', {}).get('iata', '').upper()
                a_ok = (airline_iata and a.get('iata', '').upper() == airline_iata.upper()) or \
                       (airline_name and airline_name in (a.get('name') or '').lower())
                dest_ok = not dest_iata or arr_iata == dest_iata
                if a_ok and dest_ok and dep_time in sched:
                    best = f; break
            if not best and airline_iata:
                best = next((f for f in departures
                             if f.get('airline', {}).get('iata', '').upper() == airline_iata.upper()
                             and (not dest_iata or f.get('movement', {}).get('airport', {}).get('iata', '').upper() == dest_iata)), None)
            if best:
                raw_num = best.get('number', '')
                iata_fn = raw_num.replace(' ', '').upper()
                if iata_fn:
                    leg['flight'] = iata_fn
                    # Save scheduled arrival time (HH:MM) while we have it
                    mov = best.get('movement', {})
                    sched_arr = (mov.get('scheduledTime') or {}).get('local', '')
                    if sched_arr and not leg.get('arrives_local'):
                        t_part = sched_arr[11:16] if len(sched_arr) >= 16 else ''
                        if t_part:
                            leg['arrives_local'] = t_part
                    # Refresh buffers now that we may have arrives_local
                    hc = _hotel_coords_for_leg(t, leg)
                    leg['buffers'] = _calc_leg_buffers(leg.get('from'), leg.get('to'), hc)
                    _save_trip(trip_id, t)
                    return jsonify({'flight': leg['flight'], 'arrives_local': leg.get('arrives_local'), 'source': 'aerodatabox'})
        except Exception:
            pass

    # ── AviationStack: real-time only (today) ─────────────────────────────────
    if AVIATIONSTACK_KEY and date == today:
        try:
            params = {'access_key': AVIATIONSTACK_KEY, 'dep_iata': dep_iata,
                      'arr_iata': leg.get('to', ''), 'limit': 20}
            if airline_iata:
                params['airline_iata'] = airline_iata
            url = 'https://api.aviationstack.com/v1/flights?' + urllib.parse.urlencode(params)
            with urllib.request.urlopen(url, timeout=10) as r:
                data = json.loads(r.read())
            flights = data.get('data', [])
            best = None
            for f in flights:
                if dep_time and dep_time in (f.get('departure', {}).get('scheduled') or ''):
                    best = f; break
            if not best and flights:
                best = flights[0]
            if best:
                iata_fn = (best.get('flight', {}).get('iata') or '').upper()
                if iata_fn:
                    leg['flight'] = iata_fn
                    leg.update(_avstack_to_updates(best))
                    _save_trip(trip_id, t)
                    return jsonify({'flight': leg['flight'], 'source': 'aviationstack'})
        except Exception as e:
            return jsonify({'error': f'aviationstack: {e}'}), 500

    if date != today:
        return jsonify({'error': f'Subscribe to AeroDataBox on RapidAPI for advance detection. On the travel day ({date}), AviationStack handles it automatically.'}), 503
    return jsonify({'error': 'flight not found'}), 404


@app.route('/api/trips/<trip_id>/legs/<leg_id>/status')
def leg_status(trip_id, leg_id):
    t = _load_trip(trip_id)
    if not t: return jsonify({'error': 'not found'}), 404
    leg = next((l for l in t.get('legs', []) if l['id'] == leg_id), None)
    if not leg: return jsonify({'error': 'leg not found'}), 404

    if not leg.get('flight'):
        return jsonify({'error': 'no flight number — detect first'}), 400

    updated = leg.get('status_updated')
    if updated:
        try:
            age = (datetime.datetime.utcnow() - datetime.datetime.fromisoformat(updated)).total_seconds()
            if age < 300:
                return jsonify({k: leg.get(k) for k in ALLOWED_LEG_FIELDS})
        except Exception:
            pass

    # ── AeroDataBox (any date) ────────────────────────────────────────────────
    if AERODATABOX_KEY:
        try:
            date = leg.get('date', datetime.date.today().isoformat())
            data = _adb_get(f'/flights/number/{urllib.parse.quote(leg["flight"])}/{date}')
            if isinstance(data, list): data = data[0] if data else {}
            if data and 'error' not in data:
                dep = data.get('departure', {})
                arr = data.get('arrival', {})
                def _lt(obj, key):
                    v = obj.get(key, {})
                    return (v.get('local') or v.get('utc')) if isinstance(v, dict) else (v or None)
                def _belt(a):
                    bc = a.get('baggageClaim', {})
                    return bc.get('belt') if isinstance(bc, dict) else (bc or None)
                sched_arr_iso = _lt(arr, 'scheduledTime') or ''
                updates = {
                    'status':         data.get('status', 'Unknown'),
                    'delay_minutes':  int(dep.get('delay') or 0),
                    'terminal_dep':   dep.get('terminal'),
                    'gate_dep':       dep.get('gate'),
                    'actual_departs': _lt(dep, 'revisedTime') or _lt(dep, 'scheduledTime'),
                    'terminal_arr':   arr.get('terminal'),
                    'gate_arr':       arr.get('gate'),
                    'baggage_belt':   _belt(arr),
                    'actual_arrives': _lt(arr, 'revisedTime') or _lt(arr, 'scheduledTime'),
                    'status_updated': datetime.datetime.utcnow().isoformat(),
                }
                # Auto-populate arrives_local from scheduled time (HH:MM) if not set
                if sched_arr_iso and not leg.get('arrives_local'):
                    t_part = sched_arr_iso[11:16] if len(sched_arr_iso) >= 16 else ''
                    if t_part:
                        leg['arrives_local'] = t_part
                        updates['arrives_local'] = t_part
                # Refresh buffers with actual hotel coords
                hc = _hotel_coords_for_leg(t, leg)
                leg['buffers'] = _calc_leg_buffers(leg.get('from'), leg.get('to'), hc)
                updates['buffers'] = leg['buffers']
                leg.update(updates)
                _save_trip(trip_id, t)
                return jsonify(updates)
        except Exception:
            pass

    # ── AviationStack fallback (real-time, today only) ────────────────────────
    if AVIATIONSTACK_KEY:
        try:
            url = ('https://api.aviationstack.com/v1/flights?' +
                   urllib.parse.urlencode({'access_key': AVIATIONSTACK_KEY,
                                          'flight_iata': leg['flight'], 'limit': 1}))
            with urllib.request.urlopen(url, timeout=10) as r:
                data = json.loads(r.read())
            flights = data.get('data', [])
            if flights:
                updates = _avstack_to_updates(flights[0])
                leg.update(updates)
                _save_trip(trip_id, t)
                return jsonify(updates)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'no API keys configured'}), 503


@app.route('/api/trips/<trip_id>/legs/<leg_id>', methods=['PATCH'])
def patch_leg(trip_id, leg_id):
    t = _load_trip(trip_id)
    if not t: return jsonify({'error': 'not found'}), 404
    leg = next((l for l in t.get('legs', []) if l['id'] == leg_id), None)
    if not leg: return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    for k, v in body.items():
        if k in ALLOWED_LEG_FIELDS:
            leg[k] = v
    _save_trip(trip_id, t)
    return jsonify(leg)


# ── TRIPS ─────────────────────────────────────────────────────────────────────

TRIPS_DIR = os.path.join(DATA_DIR, 'trips')

ALLOWED_TRIP_FIELDS    = {'name', 'status', 'countdown_to', 'budget_per_person', 'flag'}
ALLOWED_EXPENSE_FIELDS = {'description', 'category', 'amount', 'date', 'split'}
ALLOWED_POI_FIELDS     = {'done', 'priority', 'notes', 'duration_h', 'assigned_day',
                           'assigned_slot', 'assigned_order', 'checkin_time', 'checkout_time',
                           'planned_time', 'locked', 'url', 'name', 'type', 'note_post_visit',
                           'opening_hours'}
ALLOWED_LINK_FIELDS    = {'status', 'summary', 'classified_as'}

VALID_SPLITS    = {'comum', 'pedro', 'ines'}
VALID_PRIORITY  = {'must', 'want', 'backlog'}
VALID_SLOTS     = {'manha', 'tarde', 'noite'}
VALID_LINK_STATUS = {'pending', 'processed', 'discarded'}


JARVIS_VAULT = '/app/jarvis-vault'
CLAUDE_RELAY  = 'http://127.0.0.1:8765/query'

_MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
_DAYS_PT   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']  # weekday() 0=Mon


def _fmt_date_pt(s):
    try:
        import datetime as _d
        d = _d.date.fromisoformat(s)
        return f"{d.day} {_MONTHS_PT[d.month - 1]}"
    except Exception:
        return s or '?'


def _trip_to_markdown(t):
    import datetime as _dt
    cities  = t.get('cities', [])
    nights  = 0
    for c in cities:
        try:
            nights += (_dt.date.fromisoformat(c['departure']) - _dt.date.fromisoformat(c['arrival'])).days
        except Exception:
            pass

    CAT_PT  = {'voos':'Voos','alojamento':'Alojamento','alimentacao':'Alimentação',
               'actividades':'Actividades','transporte':'Transporte',
               'compras':'Compras','outros':'Outros'}
    SPLIT_PT = {'comum':'Comum','pedro':'Pedro','ines':'Inês'}

    legs = t.get('legs', [])
    leg_lines = '\n'.join(
        f"- ✈️ {l['from']} → {l['to']} · {_fmt_date_pt(l.get('date',''))} · {l.get('airline','')}"
        f"{' ' + l['flight'] if l.get('flight') else ''}"
        for l in legs
    ) or '— (sem voos registados)'

    city_lines = '\n'.join(
        f"- **{c['name']}** · {_fmt_date_pt(c.get('arrival',''))} → {_fmt_date_pt(c.get('departure',''))}"
        f" · {c.get('hotel',{}).get('name','') or 'alojamento a definir'}"
        for c in cities
    ) or '— (sem alojamento)'

    all_pois = [{**p, 'cityName': c['name']} for c in cities for p in c.get('pois', [])]
    poi_done = [
        f"- ✓ **{p['name']}** ({p.get('type','')})"
        for p in all_pois if p.get('done')
    ]
    poi_skip = [
        f"- ○ {p['name']} ({p.get('type','')}) — não visitado"
        for p in all_pois if not p.get('done') and p.get('priority') != 'backlog'
    ]
    poi_lines = '\n'.join(poi_done + poi_skip) or '— (sem POIs)'

    exps  = t.get('expenses', [])
    pedro = sum(e['amount'] if e.get('split') == 'pedro' else e['amount'] / 2 if e.get('split') == 'comum' else 0 for e in exps)
    ines  = sum(e['amount'] if e.get('split') == 'ines'  else e['amount'] / 2 if e.get('split') == 'comum' else 0 for e in exps)
    if exps:
        rows = '\n'.join(
            f"| {e.get('description','—')} | {CAT_PT.get(e.get('category',''),'—')} | €{e['amount']:.2f} | {SPLIT_PT.get(e.get('split',''),'—')} |"
            for e in exps
        )
        exp_block = f"| Descrição | Categoria | Valor | Split |\n|---|---|---|---|\n{rows}\n\n**Total:** €{pedro+ines:.2f} · Pedro €{pedro:.2f} · Inês €{ines:.2f}"
    else:
        exp_block = '— (sem despesas)'

    import datetime as _dt2
    today = _dt2.date.today().strftime('%d/%m/%Y')
    city_names = ', '.join(c['name'] for c in cities)
    nights_label = f"{nights} noite{'s' if nights != 1 else ''}"

    return (
        f"# {t['name']}\n"
        f"{_fmt_date_pt(t.get('countdown_to',''))} · {nights_label} · {city_names}\n\n"
        f"## Voos\n{leg_lines}\n\n"
        f"## Alojamento\n{city_lines}\n\n"
        f"## POIs\n{poi_lines}\n\n"
        f"## Despesas\n{exp_block}\n\n"
        f"---\n*Exportado em {today}*"
    )


def _parse_poi_suggestions(text):
    import re as _re
    m = _re.search(r'\[SUGESTOES_POI\](.*?)\[/SUGESTOES_POI\]', text, _re.S)
    if not m:
        return []
    suggestions = []
    for line in m.group(1).strip().splitlines():
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 2:
            continue
        name = parts[0]
        category = parts[1] if len(parts) > 1 else ''
        description = parts[2] if len(parts) > 2 else ''
        coords = parts[3] if len(parts) > 3 else '0,0'
        try:
            lat, lon = [float(x.strip()) for x in coords.split(',')]
        except (ValueError, AttributeError):
            lat, lon = 0.0, 0.0
        if name:
            suggestions.append({'name': name, 'category': category,
                                 'description': description, 'lat': lat, 'lon': lon})
    return suggestions


def _strip_poi_block(text):
    import re as _re
    return _re.sub(r'\s*\[SUGESTOES_POI\].*?\[/SUGESTOES_POI\]', '', text, flags=_re.S).strip()


def _parse_trip_actions(text):
    import re as _re, json as _json
    m = _re.search(r'\[ACTIONS\](.*?)\[/ACTIONS\]', text, _re.S)
    if not m:
        return []
    try:
        return _json.loads(m.group(1).strip())
    except Exception:
        return []


def _strip_actions_block(text):
    import re as _re
    return _re.sub(r'\s*\[ACTIONS\].*?\[/ACTIONS\]', '', text, flags=_re.S).strip()


_VALID_EXPENSE_CATS = {'voos','alojamento','alimentacao','actividades','transporte','compras','outros'}
_VALID_SPLITS       = {'comum','pedro','ines'}


def _execute_trip_actions(trip_id, t, actions):
    """Execute Claude-generated trip mutations. Returns list of human-readable confirmations."""
    import datetime as _dt
    cities = t.get('cities', [])
    done   = []

    def _find_poi(poi_id):
        for c in cities:
            for p in c.get('pois', []):
                if p['id'] == poi_id:
                    return c, p
        return None, None

    for a in actions:
        act = a.get('action', '')

        if act == 'checkin':
            city, poi = _find_poi(a.get('poi_id', ''))
            if poi and not poi.get('checkin_time'):
                now = _dt.datetime.now().isoformat(timespec='seconds')
                poi['checkin_time'] = now
                done.append({'action': 'checkin', 'label': f"✓ Check-in: {poi['name']} às {now[11:16]}"})

        elif act == 'checkout':
            city, poi = _find_poi(a.get('poi_id', ''))
            if poi and poi.get('checkin_time') and not poi.get('checkout_time'):
                now = _dt.datetime.now().isoformat(timespec='seconds')
                poi['checkout_time'] = now
                poi['done'] = True
                done.append({'action': 'checkout', 'label': f"✓ Saída: {poi['name']} às {now[11:16]}"})

        elif act == 'add_expense':
            desc     = str(a.get('description', ''))[:200].strip()
            amount   = a.get('amount', 0)
            category = a.get('category', 'alimentacao')
            split    = a.get('split', 'comum')
            if category not in _VALID_EXPENSE_CATS:
                category = 'alimentacao'
            if split not in _VALID_SPLITS:
                split = 'comum'
            try:
                amount = round(float(amount), 2)
            except (TypeError, ValueError):
                amount = 0
            if desc and amount > 0:
                exp = {
                    'id':          f'exp-{uuid.uuid4().hex[:8]}',
                    'description': desc,
                    'category':    category,
                    'amount':      amount,
                    'date':        _dt.date.today().isoformat(),
                    'split':       split,
                    'confirmed':   False,
                }
                t.setdefault('expenses', []).append(exp)
                done.append({'action': 'add_expense', 'label': f"✓ Despesa: {desc} €{amount:.2f}"})

        elif act == 'note_post_visit':
            city, poi = _find_poi(a.get('poi_id', ''))
            note = str(a.get('note', ''))[:500].strip()
            if poi and note:
                poi['note_post_visit'] = note
                done.append({'action': 'note', 'label': f"✓ Nota: {poi['name']}"})

    if done:
        _save_trip(trip_id, t)
    return done


def _trip_context_for_claude(t):
    import datetime as _dt
    cities   = t.get('cities', [])
    all_pois = [{**p} for c in cities for p in c.get('pois', [])]
    start    = t.get('countdown_to', '')
    end      = max((c.get('departure', '') for c in cities), default='')
    now      = _dt.datetime.now()
    now_str  = f"{_DAYS_PT[now.weekday()]} {now.day} {_MONTHS_PT[now.month-1]}, {now.strftime('%H:%M')}"

    day_lines = []
    if start and end:
        cur   = _dt.date.fromisoformat(start)
        end_d = _dt.date.fromisoformat(end)
        while cur <= end_d:
            ds  = cur.isoformat()
            lbl = f"{_DAYS_PT[cur.weekday()]} {cur.day} {_MONTHS_PT[cur.month-1]}"
            slots = {}
            for slot in ('manha', 'tarde', 'noite'):
                names = [p['name'] for p in all_pois if p.get('assigned_day') == ds and p.get('assigned_slot') == slot]
                slots[slot] = ', '.join(names) or '—'
            day_lines.append(f"  {lbl}: {slots['manha']} | {slots['tarde']} | {slots['noite']}")
            cur += _dt.timedelta(days=1)

    backlog = [p['name'] for p in all_pois if not p.get('assigned_day') and p.get('priority') != 'backlog']
    exps   = t.get('expenses', [])
    pedro  = sum(e['amount'] if e.get('split') == 'pedro' else e['amount'] / 2 if e.get('split') == 'comum' else 0 for e in exps)
    ines   = sum(e['amount'] if e.get('split') == 'ines'  else e['amount'] / 2 if e.get('split') == 'comum' else 0 for e in exps)
    hotels = '; '.join(f"{c['name']}: {c.get('hotel',{}).get('name','?')}" for c in cities)

    parts = [
        f"Agora: {now_str}",
        f"Viagem: {t['name']}",
        f"Período: {_fmt_date_pt(start)} → {_fmt_date_pt(end)}",
        f"Hotéis: {hotels}",
        "Itinerário (Manhã | Tarde | Noite):",
        *day_lines,
    ]
    if backlog:
        parts.append(f"Backlog a agendar: {', '.join(backlog[:12])}")
    parts.append(f"Orçamento: €{t.get('budget_per_person',0)}/pessoa · gasto Pedro €{pedro:.0f} · Inês €{ines:.0f}")

    # POI registry with IDs (for update actions)
    poi_registry = []
    for c in cities:
        for p in c.get('pois', []):
            status = 'visitado' if p.get('done') else ('em curso' if p.get('checkin_time') else 'por visitar')
            poi_registry.append(
                f"  {p['name']} | id:{p['id']} | city:{c['id']} | {status}"
            )
    if poi_registry:
        parts.append("POIs (nome | id | cidade | estado):\n" + '\n'.join(poi_registry))

    parts.append("Responde em português (pt-PT). Sê conciso e prático.")
    parts.append(
        "Quando sugeres locais específicos para visitar, comer ou explorar, inclui no FINAL da resposta:\n"
        "[SUGESTOES_POI]\n"
        "Nome do local | categoria (ex: restaurante, museu, miradouro, bar) | descrição curta | latitude,longitude\n"
        "[/SUGESTOES_POI]\n"
        "Inclui o bloco apenas quando tens sugestões concretas de lugares. "
        "Se não souberes as coordenadas exatas, usa 0,0."
    )
    parts.append(
        "Se o utilizador reportar atividade atual (chegou a um sítio, está a comer/beber, saiu de um sítio, pagou algo), "
        "executa as ações correspondentes incluindo no FINAL da resposta:\n"
        "[ACTIONS]\n"
        "[{\"action\":\"checkin\",\"poi_id\":\"<id>\"}, ...]\n"
        "[/ACTIONS]\n"
        "Ações disponíveis:\n"
        "- checkin: chegou a um POI {action, poi_id}\n"
        "- checkout: saiu de um POI e marcá-lo como visitado {action, poi_id}\n"
        "- add_expense: despesa {action, description, amount (número), category (alimentacao/transporte/actividades/compras/outros), split (comum/pedro/ines)}\n"
        "- note_post_visit: nota sobre visita {action, poi_id, note}\n"
        "Usa apenas os poi_id exatos da lista acima. Inclui [ACTIONS] apenas quando execuatas ações concretas."
    )

    return '\n'.join(parts)


def _scrape_opening_hours(url):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; Viagens/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
        })
        with urllib.request.urlopen(req, timeout=6) as r:
            html = r.read(300_000).decode('utf-8', errors='replace')
    except Exception:
        return None

    # JSON-LD schema.org openingHours / openingHoursSpecification
    for m in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.S | re.I):
        try:
            data = json.loads(m.group(1))
            if isinstance(data, list):
                data = data[0]
            oh = data.get('openingHours') or data.get('openingHoursSpecification')
            if oh:
                if isinstance(oh, list):
                    oh = ' · '.join(oh) if isinstance(oh[0], str) else None
                if oh:
                    return str(oh)[:200]
        except Exception:
            continue

    # Microdata itemprop="openingHours" with content attribute
    m = re.search(r'itemprop=["\']openingHours["\'][^>]*content=["\']([^"\']+)', html, re.I)
    if m:
        return m.group(1).strip()[:200]

    # Microdata itemprop="openingHours" with inner text
    m = re.search(r'itemprop=["\']openingHours["\'][^>]*>([^<]+)', html, re.I)
    if m:
        text = m.group(1).strip()
        if text:
            return text[:200]

    return None


def _trip_path(trip_id):
    name = re.sub(r'[^a-z0-9\-]', '', trip_id.lower())
    return os.path.join(TRIPS_DIR, f'{name}.json')


def _trip_log_path(trip_id):
    name = re.sub(r'[^a-z0-9\-]', '', trip_id.lower())
    return os.path.join(TRIPS_DIR, f'{name}-chatlog.json')


def _append_trip_log(trip_id, query, response, actions_taken):
    path = _trip_log_path(trip_id)
    try:
        entries = json.load(open(path)) if os.path.exists(path) else []
    except Exception:
        entries = []
    entries.append({
        'ts': datetime.datetime.now().isoformat(timespec='seconds'),
        'q': query,
        'r': response,
        'actions': actions_taken,
    })
    with open(path, 'w') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)


def _load_trip(trip_id):
    path = _trip_path(trip_id)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def _save_trip(trip_id, data):
    os.makedirs(TRIPS_DIR, exist_ok=True)
    with open(_trip_path(trip_id), 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.route('/api/trips')
def trips_list():
    os.makedirs(TRIPS_DIR, exist_ok=True)
    trips = []
    for fname in sorted(os.listdir(TRIPS_DIR)):
        if not fname.endswith('.json'):
            continue
        with open(os.path.join(TRIPS_DIR, fname)) as f:
            t = json.load(f)
        if not isinstance(t, dict):
            continue
        trips.append({k: t.get(k) for k in ('id', 'name', 'flag', 'status', 'countdown_to', 'travellers', 'budget_per_person')})
    return jsonify(trips)


@app.route('/api/trips', methods=['POST'])
def trip_create():
    body = request.get_json(silent=True) or {}
    name = body.get('name', '').strip()
    if not name:
        return jsonify({'error': 'name required'}), 400
    trip_id = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    if not trip_id:
        return jsonify({'error': 'invalid name'}), 400
    if os.path.exists(_trip_path(trip_id)):
        return jsonify({'error': 'trip already exists', 'id': trip_id}), 409
    arrival   = body.get('arrival', '')
    departure = body.get('departure', '')
    nights = 0
    if arrival and departure:
        try:
            from datetime import datetime as _dt
            nights = (_dt.strptime(departure, '%Y-%m-%d') - _dt.strptime(arrival, '%Y-%m-%d')).days
        except Exception:
            pass
    travellers = [t.strip() for t in body.get('travellers', 'Pedro, Inês').split(',') if t.strip()]
    city_name  = body.get('city', name)
    trip = {
        'id': trip_id,
        'name': name,
        'flag': body.get('flag', '✈️') or '✈️',
        'status': 'planned',
        'countdown_to': arrival or departure,
        'travellers': travellers,
        'budget_per_person': float(body.get('budget_per_person', 500) or 500),
        'tips': [],
        'legs': [],
        'cities': [{
            'id': 'city-1',
            'name': city_name,
            'country': body.get('country', ''),
            'arrival': arrival,
            'departure': departure,
            'hotel': {'name': '', 'confirmed': False, 'nights': nights},
            'pois': [],
        }] if city_name else [],
        'expenses': [],
        'links': [],
    }
    _save_trip(trip_id, trip)
    return jsonify({'ok': True, 'id': trip_id})


@app.route('/api/trips/<trip_id>')
def trip_get(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    if _ensure_leg_buffers(t):
        _save_trip(trip_id, t)
    return jsonify(t)


@app.route('/api/trips/<trip_id>', methods=['PATCH'])
def trip_update(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    for k, v in body.items():
        if k in ALLOWED_TRIP_FIELDS:
            t[k] = v
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/expenses', methods=['POST'])
def expense_add(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    split = body.get('split', 'comum')
    if split not in VALID_SPLITS:
        return jsonify({'error': 'invalid split'}), 400
    exp = {
        'id':          f'exp-{uuid.uuid4().hex[:8]}',
        'description': str(body.get('description', ''))[:200],
        'category':    str(body.get('category', 'outros'))[:50],
        'amount':      float(body.get('amount', 0)),
        'date':        str(body.get('date', datetime.date.today().isoformat()))[:10],
        'split':       split,
        'confirmed':   False,
    }
    t.setdefault('expenses', []).append(exp)
    _save_trip(trip_id, t)
    return jsonify(exp), 201


@app.route('/api/trips/<trip_id>/expenses/<exp_id>', methods=['PATCH'])
def expense_update(trip_id, exp_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    exp = next((e for e in t.get('expenses', []) if e['id'] == exp_id), None)
    if exp is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    for k, v in body.items():
        if k in ALLOWED_EXPENSE_FIELDS:
            if k == 'split' and v not in VALID_SPLITS:
                continue
            exp[k] = v
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/expenses/<exp_id>', methods=['DELETE'])
def expense_delete(trip_id, exp_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    t['expenses'] = [e for e in t.get('expenses', []) if e['id'] != exp_id]
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/pois', methods=['POST'])
def poi_add(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    city_id = body.get('city_id', '')
    city = next((c for c in t.get('cities', []) if c['id'] == city_id), None)
    if city is None:
        return jsonify({'error': 'city not found'}), 404
    priority = body.get('priority', 'want')
    if priority not in VALID_PRIORITY:
        priority = 'want'
    poi = {
        'id':           f'poi-{uuid.uuid4().hex[:8]}',
        'name':         str(body.get('name', ''))[:200],
        'type':         str(body.get('type', 'outro'))[:50],
        'priority':     priority,
        'duration_h':   float(body.get('duration_h', 1)),
        'notes':        str(body.get('notes', ''))[:500],
        'opening_hours': str(body.get('opening_hours', ''))[:200],
        'free_entry':   str(body.get('free_entry', ''))[:200],
        'coords':       body.get('coords'),
        'done':           False,
        'assigned_day':   None,
        'assigned_slot':  None,
        'assigned_order': None,
        'checkin_time':   None,
        'checkout_time':  None,
        'planned_time':   str(body.get('planned_time', ''))[:5],
        'locked':         bool(body.get('locked', False)),
        'url':            str(body.get('url', ''))[:500],
        'note_post_visit': None,
    }
    city.setdefault('pois', []).append(poi)
    _save_trip(trip_id, t)
    return jsonify(poi), 201


@app.route('/api/trips/<trip_id>/cities/<city_id>/pois/<poi_id>', methods=['PATCH'])
def poi_update(trip_id, city_id, poi_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    city = next((c for c in t.get('cities', []) if c['id'] == city_id), None)
    if city is None:
        return jsonify({'error': 'city not found'}), 404
    poi = next((p for p in city.get('pois', []) if p['id'] == poi_id), None)
    if poi is None:
        return jsonify({'error': 'poi not found'}), 404
    body = request.get_json(silent=True) or {}
    for k, v in body.items():
        if k not in ALLOWED_POI_FIELDS:
            continue
        if k == 'priority' and v not in VALID_PRIORITY:
            continue
        if k == 'assigned_slot' and v not in VALID_SLOTS and v is not None:
            continue
        poi[k] = v
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/cities/<city_id>/pois/<poi_id>', methods=['DELETE'])
def poi_delete(trip_id, city_id, poi_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    city = next((c for c in t.get('cities', []) if c['id'] == city_id), None)
    if city is None:
        return jsonify({'error': 'city not found'}), 404
    city['pois'] = [p for p in city.get('pois', []) if p['id'] != poi_id]
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/cities/<city_id>/pois/<poi_id>/enrich', methods=['POST'])
def poi_enrich(trip_id, city_id, poi_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    city = next((c for c in t.get('cities', []) if c['id'] == city_id), None)
    if city is None:
        return jsonify({'error': 'city not found'}), 404
    poi = next((p for p in city.get('pois', []) if p['id'] == poi_id), None)
    if poi is None:
        return jsonify({'error': 'poi not found'}), 404
    url = poi.get('url', '')
    if not url:
        return jsonify({'found': False, 'reason': 'no url'})
    oh = _scrape_opening_hours(url)
    if not oh:
        return jsonify({'found': False})
    poi['opening_hours'] = oh
    _save_trip(trip_id, t)
    return jsonify({'found': True, 'opening_hours': oh})


@app.route('/api/trips/<trip_id>/jarvis-save', methods=['POST'])
def trip_jarvis_save(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    slug = re.sub(r'[^a-z0-9]+', '-', t['name'].lower()).strip('-') or trip_id
    md   = _trip_to_markdown(t)
    folder = os.path.join(JARVIS_VAULT, 'Viagens')
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f'{slug}.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(md)
    return jsonify({'ok': True, 'path': f'Viagens/{slug}.md'})


@app.route('/api/trips/<trip_id>/claude', methods=['POST'])
def trip_claude(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body  = request.get_json(silent=True) or {}
    query = str(body.get('query', '')).strip()[:500]
    if not query:
        return jsonify({'error': 'query required'}), 400
    context = _trip_context_for_claude(t)
    prompt  = f"{context}\n\nMensagem: {query}"
    try:
        req = urllib.request.Request(
            CLAUDE_RELAY,
            data=json.dumps({'prompt': prompt}).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=55) as r:
            result = json.loads(r.read())
        raw         = result.get('response', '')
        actions     = _parse_trip_actions(raw)
        suggestions = _parse_poi_suggestions(raw)
        raw         = _strip_actions_block(raw)
        clean       = _strip_poi_block(raw)
        actions_taken = _execute_trip_actions(trip_id, t, actions) if actions else []
        _append_trip_log(trip_id, query, clean, actions_taken)
        return jsonify({'response': clean, 'suggestions': suggestions, 'actions_taken': actions_taken})
    except Exception as e:
        return jsonify({'error': str(e)}), 502


@app.route('/api/trips/<trip_id>/legs', methods=['POST'])
def leg_add(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    date = str(body.get('date', ''))[:10]
    if date and not DATE_RE.match(date):
        date = ''
    from_iata = str(body.get('from', ''))[:10].upper()
    to_iata   = str(body.get('to', ''))[:10].upper()
    leg = {
        'id':            f'leg-{uuid.uuid4().hex[:8]}',
        'date':          date,
        'from':          from_iata,
        'to':            to_iata,
        'airline':       str(body.get('airline', ''))[:100],
        'departs_local': str(body.get('departs_local', ''))[:5],
        'arrives_local': str(body.get('arrives_local', ''))[:5],
        'confirmed':     bool(body.get('confirmed', False)),
        'flight':        None,
        'status':        None,
        'delay_minutes': 0,
    }
    t.setdefault('legs', []).append(leg)
    hc = _hotel_coords_for_leg(t, leg)
    leg['buffers'] = _calc_leg_buffers(from_iata, to_iata, hc)
    _save_trip(trip_id, t)
    return jsonify(leg), 201


@app.route('/api/trips/<trip_id>/cities', methods=['POST'])
def city_add(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    name = str(body.get('name', '')).strip()[:200]
    if not name:
        return jsonify({'error': 'name required'}), 400
    arrival   = str(body.get('arrival', ''))[:10]
    departure = str(body.get('departure', ''))[:10]
    if arrival and not DATE_RE.match(arrival):
        arrival = ''
    if departure and not DATE_RE.match(departure):
        departure = ''
    nights = 0
    if arrival and departure:
        try:
            import datetime as _dt2
            nights = (_dt2.date.fromisoformat(departure) - _dt2.date.fromisoformat(arrival)).days
        except Exception:
            pass
    idx  = len(t.get('cities', [])) + 1
    city = {
        'id':        f'city-{idx}',
        'name':      name,
        'country':   str(body.get('country', ''))[:100],
        'arrival':   arrival,
        'departure': departure,
        'hotel':     {'name': '', 'confirmed': False, 'nights': nights},
        'pois':      [],
    }
    t.setdefault('cities', []).append(city)
    _save_trip(trip_id, t)
    return jsonify(city), 201


@app.route('/api/trips/<trip_id>/reorder', methods=['POST'])
def trip_reorder(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    for upd in body.get('pois', []):
        poi_id  = upd.get('id')
        city_id = upd.get('city_id')
        city = next((c for c in t.get('cities', []) if c['id'] == city_id), None)
        if not city:
            continue
        poi = next((p for p in city.get('pois', []) if p['id'] == poi_id), None)
        if not poi:
            continue
        if 'assigned_day' in upd:
            poi['assigned_day'] = upd['assigned_day']
        if 'assigned_slot' in upd:
            v = upd['assigned_slot']
            if v in VALID_SLOTS or v is None:
                poi['assigned_slot'] = v
        if 'assigned_order' in upd:
            poi['assigned_order'] = upd['assigned_order']
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/cities/<city_id>', methods=['PATCH'])
def city_update(trip_id, city_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    city = next((c for c in t.get('cities', []) if c['id'] == city_id), None)
    if city is None:
        return jsonify({'error': 'city not found'}), 404
    body = request.get_json(silent=True) or {}
    if 'hotel_name' in body:
        city.setdefault('hotel', {})['name'] = str(body['hotel_name'])[:300]
    if 'hotel_confirmed' in body:
        city.setdefault('hotel', {})['confirmed'] = bool(body['hotel_confirmed'])
    if 'hotel_coords' in body:
        hc = body['hotel_coords']
        if isinstance(hc, dict) and 'lat' in hc and 'lon' in hc:
            try:
                city.setdefault('hotel', {})['coords'] = {
                    'lat': float(hc['lat']), 'lon': float(hc['lon'])
                }
            except (TypeError, ValueError):
                pass
        elif hc is None:
            city.setdefault('hotel', {}).pop('coords', None)
    if 'day_notes' in body and isinstance(body['day_notes'], dict):
        city['day_notes'] = {str(k)[:10]: str(v)[:500] for k, v in body['day_notes'].items()}
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


@app.route('/api/trips/<trip_id>/links', methods=['POST'])
def link_add(trip_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    link = {
        'id':            f'lnk-{uuid.uuid4().hex[:8]}',
        'url':           str(body.get('url', ''))[:2000],
        'platform':      str(body.get('platform', 'web'))[:50],
        'summary':       str(body.get('summary', ''))[:1000],
        'status':        'pending',
        'classified_as': None,
        'added_at':      datetime.datetime.utcnow().isoformat(),
    }
    t.setdefault('links', []).append(link)
    _save_trip(trip_id, t)
    return jsonify(link), 201


@app.route('/api/trips/<trip_id>/links/<link_id>', methods=['PATCH'])
def link_update(trip_id, link_id):
    t = _load_trip(trip_id)
    if t is None:
        return jsonify({'error': 'not found'}), 404
    link = next((l for l in t.get('links', []) if l['id'] == link_id), None)
    if link is None:
        return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    for k, v in body.items():
        if k not in ALLOWED_LINK_FIELDS:
            continue
        if k == 'status' and v not in VALID_LINK_STATUS:
            continue
        link[k] = v
    _save_trip(trip_id, t)
    return jsonify({'ok': True})


# ── CALENDAR ──────────────────────────────────────────────────────────────────

def _unfold_ical(text):
    return re.sub(r'\r?\n[ \t]', '', text)

def _parse_ical_dt(prop, value):
    if 'VALUE=DATE' in prop or ('T' not in value and len(value) >= 8):
        try:
            d = datetime.datetime.strptime(value[:8], '%Y%m%d').date()
            return d.strftime('%Y-%m-%d'), None, True
        except ValueError:
            return None, None, True
    try:
        if value.endswith('Z'):
            dt_utc = datetime.datetime.strptime(value, '%Y%m%dT%H%M%SZ')
            dt_utc = dt_utc.replace(tzinfo=datetime.timezone.utc)
            dt_local = dt_utc.astimezone()
            return dt_local.strftime('%Y-%m-%d'), dt_local.strftime('%H:%M'), False
        dt = datetime.datetime.strptime(value[:15], '%Y%m%dT%H%M%S')
        return dt.strftime('%Y-%m-%d'), dt.strftime('%H:%M'), False
    except ValueError:
        return None, None, False

def _parse_ical(text):
    text = _unfold_ical(text)
    events, in_ev, ev = [], False, {}
    for raw in text.splitlines():
        line = raw.rstrip('\r')
        if line == 'BEGIN:VEVENT':
            in_ev, ev = True, {}
        elif line == 'END:VEVENT':
            in_ev = False
            if ev.get('summary') and ev.get('start_date') and not ev.get('cancelled'):
                events.append(ev)
        elif in_ev and ':' in line:
            prop, _, val = line.partition(':')
            key = prop.upper().split(';')[0]
            if key == 'SUMMARY':
                ev['summary'] = val
            elif key == 'DTSTART':
                ev['start_date'], ev['start_time'], ev['all_day'] = _parse_ical_dt(prop, val)
            elif key == 'STATUS' and val.strip() == 'CANCELLED':
                ev['cancelled'] = True
    return events

@app.route('/api/calendar')
def api_calendar():
    # Apps Script endpoint returns JSON directly (all subscribed calendars)
    script_url = os.environ.get('GCAL_APPS_SCRIPT_URL', '')
    if script_url:
        try:
            req = urllib.request.Request(script_url, headers={'User-Agent': 'casa-dashboard/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                return jsonify(json.loads(resp.read().decode('utf-8')))
        except Exception as exc:
            return jsonify({'today': [], 'tomorrow_count': 0, 'error': str(exc)})
    # Fallback: single iCal feed
    url = os.environ.get('GCAL_ICAL_URL', '')
    if not url:
        return jsonify({'today': [], 'tomorrow_count': 0})
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'casa-dashboard/1.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            text = resp.read().decode('utf-8', errors='replace')
        events = _parse_ical(text)
        today_str    = datetime.date.today().strftime('%Y-%m-%d')
        tomorrow_str = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        today_evs, tomorrow_count = [], 0
        for ev in events:
            d = ev.get('start_date')
            if d == today_str:
                today_evs.append({
                    'title':  ev['summary'],
                    'time':   ev.get('start_time'),
                    'allDay': ev.get('all_day', False),
                })
            elif d == tomorrow_str:
                tomorrow_count += 1
        today_evs.sort(key=lambda e: (0 if e['allDay'] else 1, e['time'] or ''))
        return jsonify({'today': today_evs, 'tomorrow_count': tomorrow_count})
    except Exception as exc:
        return jsonify({'today': [], 'tomorrow_count': 0, 'error': str(exc)})


# ── JARVIS CAPTURE ────────────────────────────────────────────────────────────

SHORTCUTS_DIR = os.path.join(BASE_DIR, 'shortcuts')

@app.route('/shortcuts/<name>')
def serve_shortcut(name):
    filename = f'{name}.signed.shortcut'
    return send_from_directory(
        SHORTCUTS_DIR, filename,
        mimetype='application/x-apple-shortcut',
        as_attachment=True,
        download_name=f'{name}.shortcut',
    )

@app.route('/api/jarvis/capture', methods=['POST'])
def jarvis_capture():
    data = request.get_json(silent=True, force=True) or {}
    line = (data.get('line') or '').strip()
    line = re.sub(r'\s*—\s*$', '', line).strip()
    if not line:
        return jsonify({'error': 'empty'}), 400
    inbox = os.path.join(JARVIS_VAULT, 'Ideas', 'Inbox.md')
    with open(inbox, 'a', encoding='utf-8') as f:
        f.write(line + '\n')
    return jsonify({'ok': True, 'line': line})

# ── STATIC ────────────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


if __name__ == '__main__':
    print("✅ Dashboard at http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=False)
