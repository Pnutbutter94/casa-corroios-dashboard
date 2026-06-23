"""PriceGhost PostgreSQL client.

Connects directly to the priceghost-db container via Docker bridge IP.
All prices are treated as EUR regardless of the currency column (known bug
in PriceGhost where it labels EUR prices as USD — normalize on read here).
"""
import psycopg2
import psycopg2.extras

_DSN = dict(
    host="172.22.0.2",
    port=5432,
    dbname="priceghost",
    user="priceghost",
    password="priceghost",
)


def _conn():
    return psycopg2.connect(**_DSN)


def get_product(product_id: int) -> dict | None:
    with _conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, name, url, stock_status, checking_paused FROM products WHERE id = %s",
                (product_id,),
            )
            row = cur.fetchone()
    return dict(row) if row else None


def get_price_history(product_id: int, days: int = 90) -> list[dict]:
    """Returns prices normalized to EUR, sorted by recorded_at ascending."""
    with _conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT price, recorded_at
                FROM price_history
                WHERE product_id = %s
                  AND recorded_at >= NOW() - INTERVAL '%s days'
                ORDER BY recorded_at ASC
                """,
                (product_id, days),
            )
            rows = cur.fetchall()
    return [
        {"price_eur": float(r["price"]), "recorded_at": r["recorded_at"].isoformat()}
        for r in rows
    ]


def get_latest_price(product_id: int) -> float | None:
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT price FROM price_history
                WHERE product_id = %s
                ORDER BY recorded_at DESC LIMIT 1
                """,
                (product_id,),
            )
            row = cur.fetchone()
    return float(row[0]) if row else None


def get_all_products() -> list[dict]:
    with _conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, name, url, stock_status, checking_paused FROM products ORDER BY id")
            rows = cur.fetchall()
    return [dict(r) for r in rows]


def healthcheck() -> bool:
    try:
        with _conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return True
    except Exception:
        return False
