"""Registry of PT-shipping stores for Radar discovery."""

STORES = [
    # Electronics / General
    {"name": "Worten",            "domain": "worten.pt",           "shipping_eur": 0.0,  "cross_border": False},
    {"name": "Fnac",              "domain": "fnac.pt",             "shipping_eur": None, "cross_border": False},
    {"name": "Rádio Popular",     "domain": "radiopopular.pt",     "shipping_eur": 0.0,  "cross_border": False},
    {"name": "Media Markt",       "domain": "mediamarkt.pt",       "shipping_eur": 0.0,  "cross_border": False},
    {"name": "El Corte Inglés",   "domain": "elcorteingles.pt",    "shipping_eur": 0.0,  "cross_border": False},
    {"name": "Euronics",          "domain": "euronics.pt",         "shipping_eur": 0.0,  "cross_border": False},
    {"name": "Electrocortes",     "domain": "electrocortes.pt",    "shipping_eur": 0.0,  "cross_border": False},
    {"name": "Castro Electrónica","domain": "castroelectronica.pt","shipping_eur": None, "cross_border": False},
    {"name": "PCComponentes",     "domain": "pccomponentes.pt",    "shipping_eur": None, "cross_border": False},
    # Renovation
    {"name": "Leroy Merlin",      "domain": "leroymerlin.pt",      "shipping_eur": None, "cross_border": False},
    {"name": "MaxMat",            "domain": "maxmat.pt",           "shipping_eur": None, "cross_border": False},
    {"name": "Brico Dépôt",       "domain": "bricodepot.pt",       "shipping_eur": None, "cross_border": False},
    {"name": "AKI",               "domain": "aki.pt",              "shipping_eur": None, "cross_border": False},
    {"name": "Beiraportal",       "domain": "beiraportal.pt",      "shipping_eur": None, "cross_border": False},
    {"name": "Sodimac",           "domain": "sodimac.pt",          "shipping_eur": None, "cross_border": False},
    # Furniture / Home
    {"name": "IKEA",              "domain": "ikea.com",            "shipping_eur": None, "cross_border": False},
    {"name": "La Redoute",        "domain": "laredoute.pt",        "shipping_eur": None, "cross_border": False},
    {"name": "Zara Home",         "domain": "zarahome.com",        "shipping_eur": None, "cross_border": False},
    {"name": "Maisons du Monde",  "domain": "maisonsdumonde.com",  "shipping_eur": None, "cross_border": False},
    {"name": "Mobly",             "domain": "mobly.pt",            "shipping_eur": None, "cross_border": False},
    {"name": "Conforama",         "domain": "conforama.pt",        "shipping_eur": None, "cross_border": False},
    # Amazon — PT ships locally; ES/DE/FR are cross-border (shipping to PT unknown)
    {"name": "Amazon PT",         "domain": "amazon.pt",           "shipping_eur": None, "cross_border": False},
    {"name": "Amazon ES",         "domain": "amazon.es",           "shipping_eur": None, "cross_border": True},
    {"name": "Amazon DE",         "domain": "amazon.de",           "shipping_eur": None, "cross_border": True},
    {"name": "Amazon FR",         "domain": "amazon.fr",           "shipping_eur": None, "cross_border": True},
]

STORE_BY_DOMAIN = {s["domain"]: s for s in STORES}

CROSS_BORDER_DOMAINS = {s["domain"] for s in STORES if s["cross_border"]}
