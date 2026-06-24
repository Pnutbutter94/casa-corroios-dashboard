"""SQLite connection helper for Radar."""
import sqlite3
from pathlib import Path

DB_PATH = Path("/opt/casaserver/data/radar/radar.db")
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    schema = SCHEMA_PATH.read_text()
    conn = get_conn()
    conn.executescript(schema)
    conn.commit()
    conn.close()
    migrate()
    print(f"DB initialized at {DB_PATH}")


def migrate() -> None:
    """Idempotent ALTER TABLE migrations for columns added after initial schema."""
    conn = get_conn()
    existing_items = {r[1] for r in conn.execute("PRAGMA table_info(items)").fetchall()}
    existing_stores = {r[1] for r in conn.execute("PRAGMA table_info(item_stores)").fetchall()}
    existing_cands = {r[1] for r in conn.execute("PRAGMA table_info(discovery_candidates)").fetchall()}

    if "search_hint" not in existing_items:
        conn.execute("ALTER TABLE items ADD COLUMN search_hint TEXT")
    if "manual_target_eur" not in existing_items:
        conn.execute("ALTER TABLE items ADD COLUMN manual_target_eur REAL")
    if "alert_threshold" not in existing_items:
        conn.execute("ALTER TABLE items ADD COLUMN alert_threshold INTEGER DEFAULT 65")
    if "last_alert_score" not in existing_items:
        conn.execute("ALTER TABLE items ADD COLUMN last_alert_score INTEGER")
    if "is_cross_border" not in existing_stores:
        conn.execute("ALTER TABLE item_stores ADD COLUMN is_cross_border INTEGER NOT NULL DEFAULT 0")
    if "source" not in existing_cands:
        conn.execute("ALTER TABLE discovery_candidates ADD COLUMN source TEXT NOT NULL DEFAULT 'registry'")

    conn.commit()
    conn.close()
