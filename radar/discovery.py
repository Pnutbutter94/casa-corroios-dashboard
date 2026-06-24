"""Store discovery engine for Radar.

Two-pass discovery:
  1. Registry pass — site:{domain} search for each store in STORES not already tracked.
  2. Broad pass   — free web search (no site: restriction) to find any retailer.

Candidates are written to discovery_candidates with source='registry' or 'broad'.
Already-tracked URLs found in the broad pass are re-inserted as status='confirmed'
(validates the existing track rather than being silently dropped).

Search backend: Firecrawl /v1/search.
"""
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

sys.path.insert(0, "/opt/casaserver/dashboard/radar")
from stores_registry import STORES, STORE_BY_DOMAIN, CROSS_BORDER_DOMAINS

_MODEL_RE = re.compile(r"[A-Z]{2,}[0-9]{3,}[A-Z0-9\-]*")
_FIRECRAWL_URL = "https://api.firecrawl.dev/v1/search"


def _domain_from_url(url: str) -> str:
    host = urlparse(url).hostname or ""
    return host.removeprefix("www.")


def build_query(item_name: str, search_hint: str | None = None) -> str:
    """Return the best search query for this item.

    Priority: search_hint (set explicitly) > extracted model code > quoted name.
    """
    if search_hint:
        return search_hint
    m = _MODEL_RE.search(item_name)
    return m.group(0) if m else f'"{item_name}"'


def _extract_price(text: str) -> float | None:
    """Parse first price-like number from text. Handles PT/EN number formats."""
    m = re.search(r"€\s*([\d.,\s]+)", text)
    if not m:
        return None
    raw = m.group(1).strip().rstrip(".,").replace(" ", "")
    raw = re.split(r"[^0-9.,]", raw)[0]

    commas = raw.count(",")
    dots = raw.count(".")

    if commas == 1 and dots == 0:
        raw = raw.replace(",", ".")
    elif dots == 1 and commas == 0:
        pass
    elif commas == 1 and dots == 1:
        if raw.index(".") < raw.index(","):
            raw = raw.replace(".", "").replace(",", ".")
        else:
            raw = raw.replace(",", "")
    elif dots > 1:
        raw = raw.replace(".", "")
    elif commas > 1:
        raw = raw.replace(",", "")

    try:
        v = float(raw)
        return v if 0.5 <= v <= 100_000 else None
    except ValueError:
        return None


def _firecrawl_search(query: str, limit: int = 5) -> list[dict]:
    """Raw Firecrawl search. Returns list of {url, title, description}."""
    payload = json.dumps({"query": query, "limit": limit}).encode()
    req = urllib.request.Request(
        _FIRECRAWL_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read())
        return data.get("data", [])
    except Exception:
        return []


def search_firecrawl(item_name: str, store_domain: str, search_hint: str | None = None) -> dict | None:
    """Site-restricted search for item on store_domain.

    Returns {"url", "price_eur", "product_title"} for the best match, or None.
    """
    query = f"site:{store_domain} {build_query(item_name, search_hint)}"
    results = _firecrawl_search(query, limit=3)

    for r in results:
        url = r.get("url", "")
        host = urlparse(url).hostname or ""
        if store_domain not in host:
            continue
        title = r.get("title", "")
        desc = r.get("description", "")
        price = _extract_price(desc) or _extract_price(title)
        return {"url": url, "product_title": title, "price_eur": price}

    return None


def broad_search(item_name: str, search_hint: str | None = None, limit: int = 10) -> list[dict]:
    """Unrestricted web search. Returns all results as {url, product_title, price_eur}.

    Uses search_hint if set, otherwise falls back to item_name + 'comprar Portugal'.
    """
    base = search_hint if search_hint else f'"{item_name}"'
    query = f"{base} comprar Portugal"
    results = _firecrawl_search(query, limit=limit)

    candidates = []
    for r in results:
        url = r.get("url", "")
        if not url.startswith("http"):
            continue
        title = r.get("title", "")
        desc = r.get("description", "")
        price = _extract_price(desc) or _extract_price(title)
        candidates.append({"url": url, "product_title": title, "price_eur": price})
    return candidates


def run_discovery(item_id: int) -> int:
    """Two-pass discovery: registry + broad. Returns total new candidate count."""
    from db import get_conn

    conn = get_conn()
    row = conn.execute("SELECT name, search_hint FROM items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        conn.close()
        return 0
    item_name = row["name"]
    search_hint = row["search_hint"]

    existing = conn.execute(
        "SELECT url FROM item_stores WHERE item_id = ?", (item_id,)
    ).fetchall()
    existing_urls = {r["url"] for r in existing}
    existing_domains = {_domain_from_url(u) for u in existing_urls}
    conn.close()

    # ── Pass 1: registry (site-restricted) ──────────────────────────────────
    stores_to_search = [s for s in STORES if s["domain"] not in existing_domains]
    registry_hits: list[tuple[str, dict]] = []  # (store_name, result)

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(search_firecrawl, item_name, s["domain"], search_hint): s
            for s in stores_to_search
        }
        for future in as_completed(futures):
            store = futures[future]
            try:
                result = future.result()
            except Exception:
                continue
            if result:
                registry_hits.append((store["name"], result))

    # ── Pass 2: broad (free search) ─────────────────────────────────────────
    broad_hits = broad_search(item_name, search_hint, limit=10)

    # ── Persist candidates ───────────────────────────────────────────────────
    conn = get_conn()
    count = 0

    for store_name, cand in registry_hits:
        conn.execute(
            """INSERT OR IGNORE INTO discovery_candidates
               (item_id, store_name, url, price_eur, product_title, source)
               VALUES (?, ?, ?, ?, ?, 'registry')""",
            (item_id, store_name, cand["url"], cand["price_eur"], cand["product_title"]),
        )
        count += conn.execute("SELECT changes()").fetchone()[0]

    for cand in broad_hits:
        url = cand["url"]
        domain = _domain_from_url(url)
        store_name = STORE_BY_DOMAIN.get(domain, {}).get("name") or domain

        if url in existing_urls:
            # Already tracked — insert as confirmed to surface it in the candidates UI
            conn.execute(
                """INSERT OR IGNORE INTO discovery_candidates
                   (item_id, store_name, url, price_eur, product_title, source, status)
                   VALUES (?, ?, ?, ?, ?, 'broad', 'confirmed')""",
                (item_id, store_name, url, cand["price_eur"], cand["product_title"]),
            )
        else:
            conn.execute(
                """INSERT OR IGNORE INTO discovery_candidates
                   (item_id, store_name, url, price_eur, product_title, source)
                   VALUES (?, ?, ?, ?, ?, 'broad')""",
                (item_id, store_name, url, cand["price_eur"], cand["product_title"]),
            )
        count += conn.execute("SELECT changes()").fetchone()[0]

    conn.commit()
    conn.close()
    return count


# ── PriceGhost / radar.db helpers ───────────────────────────────────────────

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
    is_cross_border: bool = False,
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
           (item_id, priceghost_product_id, store_name, url, shipping_eur, last_price_eur, is_cross_border)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (item_id, priceghost_product_id, store_name, url, shipping_eur, last_price_eur,
         1 if is_cross_border else 0),
    )
    item_store_id = cur.lastrowid
    conn.commit()
    conn.close()
    return item_store_id
