"""Registry of PT-shipping stores for Radar discovery."""

STORES = [
    # Electronics / General
    {"name": "Worten", "domain": "worten.pt", "shipping_eur": 0.0},
    {"name": "Fnac", "domain": "fnac.pt", "shipping_eur": None},
    {"name": "Rádio Popular", "domain": "radiopopular.pt", "shipping_eur": 0.0},
    {"name": "Media Markt", "domain": "mediamarkt.pt", "shipping_eur": 0.0},
    {"name": "El Corte Inglés", "domain": "elcorteingles.pt", "shipping_eur": 0.0},
    {"name": "Euronics", "domain": "euronics.pt", "shipping_eur": 0.0},
    {"name": "Electrocortes", "domain": "electrocortes.pt", "shipping_eur": 0.0},
    {"name": "Castro Electrónica", "domain": "castroelectronica.pt", "shipping_eur": None},
    {"name": "PCComponentes", "domain": "pccomponentes.pt", "shipping_eur": None},
    # Renovation
    {"name": "Leroy Merlin", "domain": "leroymerlin.pt", "shipping_eur": None},
    {"name": "MaxMat", "domain": "maxmat.pt", "shipping_eur": None},
    {"name": "Brico Dépôt", "domain": "bricodepot.pt", "shipping_eur": None},
    {"name": "AKI", "domain": "aki.pt", "shipping_eur": None},
    {"name": "Beiraportal", "domain": "beiraportal.pt", "shipping_eur": None},
    {"name": "Sodimac", "domain": "sodimac.pt", "shipping_eur": None},
    # Furniture / Home
    {"name": "IKEA", "domain": "ikea.com", "shipping_eur": None},
    {"name": "La Redoute", "domain": "laredoute.pt", "shipping_eur": None},
    {"name": "Zara Home", "domain": "zarahome.com", "shipping_eur": None},
    {"name": "Maisons du Monde", "domain": "maisonsdumonde.com", "shipping_eur": None},
    {"name": "Mobly", "domain": "mobly.pt", "shipping_eur": None},
    {"name": "Conforama", "domain": "conforama.pt", "shipping_eur": None},
    # Amazon multi-region
    {"name": "Amazon PT", "domain": "amazon.pt", "shipping_eur": None},
    {"name": "Amazon ES", "domain": "amazon.es", "shipping_eur": None},
    {"name": "Amazon DE", "domain": "amazon.de", "shipping_eur": None},
    {"name": "Amazon FR", "domain": "amazon.fr", "shipping_eur": None},
]

STORE_BY_DOMAIN = {s["domain"]: s for s in STORES}
