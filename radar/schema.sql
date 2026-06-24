PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'tracking',  -- tracking|purchased|archived
    purchased_at TEXT,
    purchased_price_eur REAL,
    purchased_store TEXT,
    savings_eur REAL,
    created_at TEXT DEFAULT (datetime('now')),
    last_alert_score INTEGER
);

CREATE TABLE IF NOT EXISTS item_stores (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    priceghost_product_id INTEGER NOT NULL,
    store_name TEXT NOT NULL,
    url TEXT NOT NULL,
    shipping_eur REAL,                    -- NULL = unknown ("ver loja")
    shipping_last_updated_at TEXT,
    last_price_eur REAL,
    last_checked_at TEXT,
    active INTEGER NOT NULL DEFAULT 1     -- 1=active, 0=paused
);

CREATE TABLE IF NOT EXISTS price_targets (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    item_store_id INTEGER REFERENCES item_stores(id),  -- NULL = item-level
    target_price_eur REAL NOT NULL,
    p25_estimate_eur REAL,
    computed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS buy_signals (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    breakdown_json TEXT NOT NULL,
    computed_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_item_stores_item ON item_stores(item_id);
CREATE INDEX IF NOT EXISTS idx_item_stores_pg_id ON item_stores(priceghost_product_id);
CREATE INDEX IF NOT EXISTS idx_price_targets_item ON price_targets(item_id);
CREATE INDEX IF NOT EXISTS idx_buy_signals_item_time ON buy_signals(item_id, computed_at DESC);

CREATE TABLE IF NOT EXISTS discovery_candidates (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    url TEXT NOT NULL,
    price_eur REAL,
    product_title TEXT,
    discovered_at TEXT DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | skipped
    UNIQUE(item_id, url)
);

CREATE INDEX IF NOT EXISTS idx_candidates_item_status ON discovery_candidates(item_id, status);
