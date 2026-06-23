"""Store discovery engine for Radar.

Searches for a product across the PT-shipping store registry and returns
candidate (store_name, url, price_eur) tuples. Actual URL validation and
PriceGhost insertion are handled separately.

Search backends: Firecrawl (preferred), Tavily (fallback).
"""
import subprocess
import sys
from stores_registry import STORES, STORE_BY_DOMAIN


def _domain_from_url(url: str) -> str:
    from urllib.parse import urlparse
    host = urlparse(url).hostname or ""
    return host.lstrip("www.")


def search_tavily(product_query: str, store: dict) -> list[dict]:
    """Use tavily CLI if available; returns list of {url, price_eur, store_name}."""
    # Intended for use from CLI or integration; returns empty if no tool available
    return []


def add_to_priceghost(url: str, name: str, price_eur: float | None, user_id: int = 1) -> int:
    """Insert a product directly into PriceGhost's PostgreSQL and return product_id.

    Sets anchor_price so PriceGhost can match the correct variant on next refresh.
    Sets stock_status='in_stock' and refresh_interval=3600.
    """
    import psycopg2

    dsn = dict(
        host="172.22.0.2", port=5432,
        dbname="priceghost", user="priceghost", password="priceghost",
    )
    with psycopg2.connect(**dsn) as conn:
        with conn.cursor() as cur:
            # Upsert: if URL already tracked for this user, return existing id
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
