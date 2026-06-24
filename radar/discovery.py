"""Store discovery engine for Radar.

Searches for a product across the store registry and writes candidate
(store_name, url, price_eur, product_title) rows to discovery_candidates.
Actual PriceGhost insertion is handled separately (10B confirm flow).

Search backend: Firecrawl /v1/search (no API key required for moderate usage).
"""
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

sys.path.insert(0, "/opt/casaserver/dashboard/radar")
from stores_registry import STORES, STORE_BY_DOMAIN

_MODEL_RE = re.compile(r"[A-Z]{2,}[0-9]{3,}[A-Z0-9\-]*")
_FIRECRAWL_URL = "https://api.firecrawl.dev/v1/search"


def _domain_from_url(url: str) -> str:
    host = urlparse(url).hostname or ""
    return host.removeprefix("www.")


def build_query(item_name: str) -> str:
    """Return model code if detectable, else quoted name."""
    m = _MODEL_RE.search(item_name)
    return m.group(0) if m else f'"{item_name}"'


def _extract_price(text: str) -> float | None:
    """Parse first price-like number from text. Handles PT/EN number formats."""
    m = re.search(r"€\s*([\d.,\s]+)", text)
    if not m:
        return None
    raw = m.group(1).strip().rstrip(".,").replace(" ", "")
    # Trim any trailing non-numeric junk (e.g. "/mês")
    raw = re.split(r"[^0-9.,]", raw)[0]

    commas = raw.count(",")
    dots = raw.count(".")

    if commas == 1 and dots == 0:
        raw = raw.replace(",", ".")         # "899,99" → "899.99"
    elif dots == 1 and commas == 0:
        pass                                 # "899.99" already fine
    elif commas == 1 and dots == 1:
        if raw.index(".") < raw.index(","):
            raw = raw.replace(".", "").replace(",", ".")   # "1.299,00"
        else:
            raw = raw.replace(",", "")                     # "1,299.00"
    elif dots > 1:
        raw = raw.replace(".", "")
    elif commas > 1:
        raw = raw.replace(",", "")

    try:
        v = float(raw)
        return v if 0.5 <= v <= 100_000 else None
    except ValueError:
        return None


def search_firecrawl(item_name: str, store_domain: str) -> dict | None:
    """Search Firecrawl for item on store_domain.

    Returns {"url", "price_eur", "product_title"} for the best match, or None.
    """
    query = f"site:{store_domain} {build_query(item_name)}"
    payload = json.dumps({"query": query, "limit": 3}).encode()
    req = urllib.request.Request(
        _FIRECRAWL_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read())
    except Exception:
        return None

    for r in data.get("data", []):
        url = r.get("url", "")
        host = urlparse(url).hostname or ""
        if store_domain not in host:
            continue
        title = r.get("title", "")
        desc = r.get("description", "")
        price = _extract_price(desc) or _extract_price(title)
        return {"url": url, "product_title": title, "price_eur": price}

    return None


def run_discovery(item_id: int) -> int:
    """Search all stores for item_id, write pending candidates. Returns candidate count."""
    from db import get_conn

    conn = get_conn()
    row = conn.execute("SELECT name FROM items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        conn.close()
        return 0
    item_name = row["name"]

    existing = conn.execute(
        "SELECT url FROM item_stores WHERE item_id = ?", (item_id,)
    ).fetchall()
    existing_domains = {_domain_from_url(r["url"]) for r in existing}
    conn.close()

    stores_to_search = [s for s in STORES if s["domain"] not in existing_domains]

    candidates = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(search_firecrawl, item_name, s["domain"]): s
            for s in stores_to_search
        }
        for future in as_completed(futures):
            store = futures[future]
            try:
                result = future.result()
            except Exception:
                continue
            if result:
                candidates.append((store["name"], result))

    if not candidates:
        return 0

    conn = get_conn()
    count = 0
    for store_name, cand in candidates:
        conn.execute(
            """INSERT OR IGNORE INTO discovery_candidates
               (item_id, store_name, url, price_eur, product_title)
               VALUES (?, ?, ?, ?, ?)""",
            (item_id, store_name, cand["url"], cand["price_eur"], cand["product_title"]),
        )
        count += conn.execute("SELECT changes()").fetchone()[0]
    conn.commit()
    conn.close()
    return count


# ── Keep existing PriceGhost helpers intact ─────────────────────────────────

def add_to_priceghost(url: str, name: str, price_eur: float | None, user_id: int = 1) -> int:
    """Insert a product directly into PriceGhost's PostgreSQL and return product_id."""
    import psycopg2

    dsn = dict(
        host="172.22.0.2", port=5432,
        dbname="priceghost", user="priceghost", password="priceghost",
    )
    with psycopg2.connect(**dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM products WHERE user_id = %s AND url = %s",
                (user_id, url),
            )
            row = cur.fetchone()
            if row:
                return row[0]

            cur.execute(
                """INSERT INTO products
                   (user_id, url, name, stock_status, refresh_interval, anchor_price)
                   VALUES (%s, %s, %s, 'in_stock', 3600, %s)
                   RETURNING id""",
                (user_id, url, name, price_eur),
            )
            product_id = cur.fetchone()[0]

            if price_eur is not None:
                cur.execute(
                    "INSERT INTO price_history (product_id, price, currency) VALUES (%s, %s, 'EUR')",
                    (product_id, price_eur),
                )
        conn.commit()
    return product_id


def add_store_to_radar(
    item_id: int,
    priceghost_product_id: int,
    store_name: str,
    url: str,
    shipping_eur: float | None,
    last_price_eur: float | None,
) -> int:
    """Insert or skip item_store in radar.db, return item_store_id."""
    from db import get_conn

    conn = get_conn()
    existing = conn.execute(
        "SELECT id FROM item_stores WHERE priceghost_product_id = ? AND item_id = ?",
        (priceghost_product_id, item_id),
    ).fetchone()
    if existing:
        conn.close()
        return existing["id"]

    cur = conn.execute(
        """INSERT INTO item_stores
           (item_id, priceghost_product_id, store_name, url, shipping_eur, last_price_eur)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (item_id, priceghost_product_id, store_name, url, shipping_eur, last_price_eur),
    )
    item_store_id = cur.lastrowid
    conn.commit()
    conn.close()
    return item_store_id
