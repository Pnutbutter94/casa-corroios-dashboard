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
    print(f"DB initialized at {DB_PATH}")
