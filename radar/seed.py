"""Seed Radar DB with initial data: LG WashTower WT1210BBF."""
import json
from db import get_conn, init_db
from priceghost import get_latest_price

ITEM_NAME = "LG WashTower WT1210BBF"
ITEM_CATEGORY = "electrodomésticos"

# PriceGhost product IDs (set during PriceGhost deployment 2026-06-23)
STORES = [
    {
        "priceghost_product_id": 2,
        "store_name": "Radio Popular",
        "url": "https://www.radiopular.pt/produto/maquina-lavar-secar-lg-washtower-wt1210bbf/",
        "shipping_eur": 0.0,
    },
    {
        "priceghost_product_id": 3,
        "store_name": "Worten",
        "url": "https://www.worten.pt/produtos/maquina-de-lavar-e-secar-roupa-lg-washtower-wt1210bbf-12-10-kg-1400-rpm-preto-8806091789891",
        "shipping_eur": 0.0,
    },
]


def seed():
    init_db()
    conn = get_conn()

    existing = conn.execute("SELECT id FROM items WHERE name = ?", (ITEM_NAME,)).fetchone()
    if existing:
        print(f"Item '{ITEM_NAME}' already exists (id={existing['id']}), skipping seed.")
        conn.close()
        return

    cur = conn.execute(
        "INSERT INTO items (name, category) VALUES (?, ?) RETURNING id",
        (ITEM_NAME, ITEM_CATEGORY),
    )
    item_id = cur.fetchone()["id"]
    print(f"Created item '{ITEM_NAME}' id={item_id}")

    for store in STORES:
        latest = get_latest_price(store["priceghost_product_id"])
        conn.execute(
            """INSERT INTO item_stores
               (item_id, priceghost_product_id, store_name, url, shipping_eur, last_price_eur)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                item_id,
                store["priceghost_product_id"],
                store["store_name"],
                store["url"],
                store["shipping_eur"],
                latest,
            ),
        )
        print(f"  Added store '{store['store_name']}' pg_id={store['priceghost_product_id']} latest={latest}")

    conn.commit()
    conn.close()
    print("Seed complete.")


if __name__ == "__main__":
    seed()
