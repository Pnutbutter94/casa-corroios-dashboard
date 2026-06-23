"""Seed discovered stores for LG WashTower WT1210BBF into PriceGhost + radar.db."""
import sys
sys.path.insert(0, "/opt/casaserver/radar")

from discovery import add_to_priceghost, add_store_to_radar

ITEM_ID = 1  # LG WashTower WT1210BBF in radar.db

DISCOVERED_STORES = [
    {
        "store_name": "Electrocortes",
        "url": "https://www.electrocortes.pt/eletrodomesticos/roupa/maquinas-de-lavar-e-secar-roupa/maq-lavar-secar-lg-wt1210bbf-washtower-lava-12-kg-seca-10kg-1400-rpm-preto-dupla-bomba-calor",
        "price_eur": 1819.00,
        "shipping_eur": 0.0,
    },
    {
        "store_name": "El Corte Inglés",
        "url": "https://www.elcorteingles.pt/electrodomesticos/A49362905-maquina-de-lavar-e-maquina-de-secar-roupa-lg-wt1210bbf-washtower-carga-frontal-de-1210-kg-e-de-1400-rpm-preto/",
        "price_eur": 1899.99,
        "shipping_eur": None,
    },
    {
        "store_name": "Fnac",
        "url": "https://www.fnac.pt/Maquina-de-Lavar-e-Secar-Roupa-LG-WT1210BBF-APBQKIS-12-22-Kg-1400-RPM-A-Preto-Lavar-e-Secar-Roupa-Maquina-de-lavar-e-secar-roupa/a11862918",
        "price_eur": 1858.48,
        "shipping_eur": None,  # often ~€25 for large appliances
    },
    {
        "store_name": "Amazon.es",
        "url": "https://www.amazon.es/Lavasciuga-libera-installazione-Lg-WT1210BBF/dp/B0C9JWJLCZ",
        "price_eur": 1619.00,  # approximate incl. PT shipping from idealo
        "shipping_eur": None,  # PT shipping TBD
    },
    {
        "store_name": "Euronics",
        "url": "https://www.euronics.pt/pt/classe-energ.-a-escala-de-g-a-a/grandes-domesticos/maquina-de-lavar-e-secar-lg-washtower-wt1210bbf/item_66321.html",
        "price_eur": None,  # ~€2700 known outlier; let PriceGhost scrape
        "shipping_eur": 0.0,
    },
    {
        "store_name": "Darty",
        "url": "https://darty.pt/products/maquina-lavar-e-secar-roupa-lg-wt1210bbf-preto-cinza-12-10kg-1400rpm-a-a",
        "price_eur": 1687.99,
        "shipping_eur": None,
    },
]


def main():
    for store in DISCOVERED_STORES:
        pg_name = f"LG WashTower WT1210BBF — {store['store_name']}"
        pg_id = add_to_priceghost(
            url=store["url"],
            name=pg_name,
            price_eur=store["price_eur"],
        )
        radar_id = add_store_to_radar(
            item_id=ITEM_ID,
            priceghost_product_id=pg_id,
            store_name=store["store_name"],
            url=store["url"],
            shipping_eur=store["shipping_eur"],
            last_price_eur=store["price_eur"],
        )
        status = "seeded" if store["price_eur"] else "added (price TBD)"
        print(f"  {store['store_name']}: pg_id={pg_id} radar_id={radar_id} price={store['price_eur']} [{status}]")


if __name__ == "__main__":
    main()
