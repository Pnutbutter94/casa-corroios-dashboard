from flask import Flask, jsonify, send_from_directory, request
import urllib.request
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


# ── STATIC ────────────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


if __name__ == '__main__':
    print("✅ Dashboard at http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=False)
