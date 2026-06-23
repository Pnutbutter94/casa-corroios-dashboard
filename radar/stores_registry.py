"""Registry of PT-shipping electronics stores for Radar discovery."""

STORES = [
    {
        "name": "Electrocortes",
        "domain": "electrocortes.pt",
        "shipping_eur": 0.0,
        "search_hint": "site:electrocortes.pt",
    },
    {
        "name": "El Corte Inglés",
        "domain": "elcorteingles.pt",
        "shipping_eur": 0.0,
        "search_hint": "site:elcorteingles.pt",
    },
    {
        "name": "Fnac",
        "domain": "fnac.pt",
        "shipping_eur": None,  # varies; often €25 for large appliances
        "search_hint": "site:fnac.pt",
    },
    {
        "name": "Amazon.es",
        "domain": "amazon.es",
        "shipping_eur": None,  # PT shipping TBD per product
        "search_hint": "site:amazon.es",
    },
    {
        "name": "Euronics",
        "domain": "euronics.pt",
        "shipping_eur": 0.0,
        "search_hint": "site:euronics.pt",
    },
    {
        "name": "Media Markt",
        "domain": "mediamarkt.pt",
        "shipping_eur": 0.0,
        "search_hint": "site:mediamarkt.pt",
    },
    {
        "name": "Rádio Popular",
        "domain": "radiopular.pt",
        "shipping_eur": 0.0,
        "search_hint": "site:radiopular.pt",
    },
    {
        "name": "Worten",
        "domain": "worten.pt",
        "shipping_eur": 0.0,
        "search_hint": "site:worten.pt",
    },
]

STORE_BY_DOMAIN = {s["domain"]: s for s in STORES}
