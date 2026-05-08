from flask import Flask, jsonify, send_from_directory, request
import urllib.request
import json
import os
import time
import datetime
import uuid

app = Flask(__name__)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
DATA_DIR   = os.path.join(BASE_DIR, 'data')
CACHE_FILE = os.path.join(BASE_DIR, 'cache', 'weather.json')
MAINT_FILE = os.path.join(BASE_DIR, 'cache', 'maintenance.json')
INV_FILE   = os.path.join(BASE_DIR, 'cache', 'inventory.json')
PLAN_FILE  = os.path.join(BASE_DIR, 'cache', 'planner.json')
CACHE_TTL  = 15 * 60  # 15 minutes

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude=38.6333&longitude=-9.0333"
    "&hourly=temperature_2m,precipitation_probability,windspeed_10m,uv_index"
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    ",windspeed_10m_max,weathercode"
    "&current_weather=true&timezone=Europe/Lisbon&forecast_days=3"
)

os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)


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
            return jsonify(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify([])


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
    item = request.get_json()
    if not item or not item.get('productId'):
        return jsonify({'error': 'productId required'}), 400
    inv = _load_inv()
    item['id'] = str(uuid.uuid4())[:8]
    inv.append(item)
    _save_inv(inv)
    return jsonify(item), 201


@app.route('/api/inventory/<item_id>', methods=['PATCH'])
def patch_inventory(item_id):
    patch = request.get_json() or {}
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
    data = request.get_json()
    if not data:
        return jsonify({'error': 'body required'}), 400
    plan = _load_plan()
    plan[date_str] = data
    _save_plan(plan)
    return jsonify(data)


# ── STATIC ────────────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


if __name__ == '__main__':
    print("✅ Dashboard at http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=False)
