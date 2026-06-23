"""Radar Phase 3: Price intelligence engine.

Syncs prices from PriceGhost, computes P25 targets and buy signals (0-100).
"""
import json
import datetime
import statistics
from typing import Optional

import priceghost
from db import get_conn

PRICE_MIN = 200.0   # sanity floor — catches garbage scrapes
PRICE_MAX = 8000.0  # sanity ceiling
HISTORY_DAYS = 90


def _landed(price_eur: float, shipping_eur: Optional[float]) -> float:
    return price_eur + (shipping_eur or 0.0)


def sync_prices(item_id: int) -> dict:
    """Pull latest PriceGhost prices into item_stores.last_price_eur.

    - Skips if out_of_stock (keeps last known good price, updates last_checked_at)
    - Skips if price outside PRICE_MIN..PRICE_MAX (garbage scrape)
    """
    conn = get_conn()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    rows = conn.execute(
        "SELECT id, priceghost_product_id FROM item_stores WHERE item_id=? AND active=1",
        (item_id,),
    ).fetchall()

    updated = skipped_oos = skipped_range = 0
    for row in rows:
        is_id, pg_id = row["id"], row["priceghost_product_id"]
        try:
            product = priceghost.get_product(pg_id)
            if not product:
                continue

            conn.execute(
                "UPDATE item_stores SET last_checked_at=? WHERE id=?", (now, is_id)
            )

            latest = priceghost.get_latest_price(pg_id)
            if latest is None:
                continue

            if not (PRICE_MIN <= latest <= PRICE_MAX):
                skipped_range += 1
                continue

            if product.get("stock_status") == "out_of_stock":
                skipped_oos += 1
                continue

            conn.execute(
                "UPDATE item_stores SET last_price_eur=?, last_checked_at=? WHERE id=?",
                (latest, now, is_id),
            )
            updated += 1
        except Exception as exc:
            print(f"  store {is_id} (pg={pg_id}): {exc}")

    conn.commit()
    conn.close()
    return {"updated": updated, "skipped_oos": skipped_oos, "skipped_range": skipped_range}


def get_daily_best_series(item_id: int, days: int = HISTORY_DAYS) -> list[dict]:
    """Minimum landed price per calendar day across all active stores.

    Uses last_price_eur as a reference anchor: PG history entries below
    last_price_eur * 0.5 are treated as garbage scrapes and excluded.
    Stores with no last_price_eur (OOS / never synced) are skipped entirely.
    """
    conn = get_conn()
    stores = conn.execute(
        "SELECT id, priceghost_product_id, shipping_eur, last_price_eur"
        " FROM item_stores WHERE item_id=? AND active=1",
        (item_id,),
    ).fetchall()
    conn.close()

    daily: dict[str, list[float]] = {}
    for store in stores:
        reference = store["last_price_eur"]
        if reference is None:
            continue  # OOS / no known good price — skip history entirely
        floor = reference * 0.5  # prices below 50% of reference = garbage scrape

        for record in priceghost.get_price_history(store["priceghost_product_id"], days=days):
            price = record["price_eur"]
            if not (PRICE_MIN <= price <= PRICE_MAX):
                continue
            if price < floor:
                continue  # garbage scrape (e.g. sponsored product on page)
            date_key = record["recorded_at"][:10]
            daily.setdefault(date_key, []).append(_landed(price, store["shipping_eur"]))

    return [
        {"date": d, "price_eur": min(prices)}
        for d, prices in sorted(daily.items())
    ]


def compute_p25(series: list[dict]) -> Optional[float]:
    prices = [s["price_eur"] for s in series]
    if len(prices) < 3:
        return None
    return statistics.quantiles(prices, n=4)[0]


def compute_buy_signal(item_id: int) -> dict:
    """0-100 score. Components: position (0-50) + vs_p25 (0-30) + flash_sale (0-20)."""
    conn = get_conn()
    stores = conn.execute(
        "SELECT last_price_eur, shipping_eur FROM item_stores"
        " WHERE item_id=? AND active=1 AND last_price_eur IS NOT NULL",
        (item_id,),
    ).fetchall()
    item_row = conn.execute(
        "SELECT manual_target_eur FROM items WHERE id=?", (item_id,)
    ).fetchone()
    conn.close()

    manual_target = item_row["manual_target_eur"] if item_row else None

    if not stores:
        return {"score": 0, "reason": "no_prices", "breakdown": {}}

    current_landed = min(_landed(s["last_price_eur"], s["shipping_eur"]) for s in stores)
    series = get_daily_best_series(item_id)
    prices_90d = [s["price_eur"] for s in series]

    if not prices_90d:
        if manual_target is None:
            return {"score": 0, "reason": "no_history", "breakdown": {"current_landed_eur": current_landed}}
        # No history but manual target set — score Component 2 only
        position_pts = 25.0
        vs_p25_pts = 30.0 if current_landed <= manual_target else 0.0
        score = round(position_pts + vs_p25_pts)
        return {
            "score": score,
            "breakdown": {
                "current_landed_eur": round(current_landed, 2),
                "min90d_eur": None,
                "max90d_eur": None,
                "range90d_eur": None,
                "p25_eur": round(manual_target, 2),
                "p25_source": "manual",
                "data_points": 0,
                "position_pts": round(position_pts, 1),
                "vs_p25_pts": round(vs_p25_pts, 1),
                "flash_sale_pts": 0,
                "flash_sale_drop_pct": None,
                "series": [],
            },
        }

    min90d = min(prices_90d)
    max90d = max(prices_90d)
    range90d = max90d - min90d
    p25 = compute_p25(series)
    p25_source = "computed" if p25 is not None else None
    if p25 is None and manual_target is not None:
        p25 = manual_target
        p25_source = "manual"

    # Component 1: position in 90d range (0-50 pts)
    if range90d == 0:
        position_pts = 25.0
    else:
        position_pts = min(50.0, max(0.0, (max90d - current_landed) / range90d * 50))

    # Component 2: vs P25 (0-30 pts)
    if p25 is None:
        vs_p25_pts = 15.0
    elif current_landed <= p25:
        vs_p25_pts = 30.0
    else:
        spread = max90d - p25
        vs_p25_pts = 0.0 if spread == 0 else max(0.0, (1 - (current_landed - p25) / spread) * 30)

    # Component 3: flash sale (0-20 pts)
    flash_sale_pts = 0
    flash_sale_pct = None
    if len(series) >= 2:
        prev = series[-2]["price_eur"]
        curr = series[-1]["price_eur"]
        if prev > 0:
            drop = (prev - curr) / prev
            flash_sale_pct = round(drop * 100, 1)
            if drop >= 0.30:
                flash_sale_pts = 20
            elif drop >= 0.10:
                flash_sale_pts = 10

    score = round(position_pts + vs_p25_pts + flash_sale_pts)

    breakdown = {
        "current_landed_eur": round(current_landed, 2),
        "min90d_eur": round(min90d, 2),
        "max90d_eur": round(max90d, 2),
        "range90d_eur": round(range90d, 2),
        "p25_eur": round(p25, 2) if p25 is not None else None,
        "p25_source": p25_source,
        "data_points": len(series),
        "position_pts": round(position_pts, 1),
        "vs_p25_pts": round(vs_p25_pts, 1),
        "flash_sale_pts": flash_sale_pts,
        "flash_sale_drop_pct": flash_sale_pct,
        "series": [round(s["price_eur"], 2) for s in series[-30:]],
    }
    return {"score": score, "breakdown": breakdown}


def run(item_id: int) -> dict:
    """Sync → compute → persist. Returns signal dict."""
    print(f"[radar] item {item_id}: syncing prices...")
    sync_result = sync_prices(item_id)
    print(f"  {sync_result}")

    print(f"[radar] item {item_id}: computing buy signal...")
    signal = compute_buy_signal(item_id)
    score = signal["score"]
    bd = signal.get("breakdown", {})

    if signal.get("reason"):
        print(f"  score=0 ({signal['reason']})")
    else:
        print(f"  score={score}, current={bd.get('current_landed_eur')}, "
              f"p25={bd.get('p25_eur')}, data_points={bd.get('data_points')}")

    conn = get_conn()
    # Prune rows older than 90 days
    conn.execute(
        "DELETE FROM buy_signals WHERE item_id=? AND computed_at < datetime('now', '-90 days')",
        (item_id,),
    )
    conn.execute(
        "DELETE FROM price_targets WHERE item_id=? AND computed_at < datetime('now', '-90 days')",
        (item_id,),
    )
    # Always persist score (even 0)
    conn.execute(
        "INSERT INTO buy_signals (item_id, score, breakdown_json) VALUES (?,?,?)",
        (item_id, score, json.dumps(bd)),
    )
    if bd.get("p25_eur"):
        conn.execute(
            "INSERT INTO price_targets (item_id, target_price_eur, p25_estimate_eur) VALUES (?,?,?)",
            (item_id, bd["p25_eur"], bd["p25_eur"]),
        )
    conn.commit()
    conn.close()

    return signal


if __name__ == "__main__":
    import sys
    iid = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    result = run(iid)
    print(json.dumps(result, indent=2))
