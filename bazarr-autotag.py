#!/usr/bin/env python3
"""
Daily sweep: assign correct Bazarr subtitle profile to all series and movies
based on their original language, and trigger subtitle search for any that
have the wrong or missing profile.

Profile mapping:
  Portuguese → None  (native speakers, no subs needed)
  Spanish    → 2     (PT-PT, with EN fallback)
  Everything else    → 1     (EN subs, including English originals)
"""
import json
import urllib.request
import urllib.parse

SONARR_URL = "http://localhost:8989"
SONARR_KEY = "d47e138c18b542be9dec3e9fec9b0408"
RADARR_URL = "http://localhost:7878"
RADARR_KEY = "bef659950c1d4ccaa4d40f2301079e0b"
BAZ_URL    = "http://localhost:6767"
BAZ_KEY    = "c484cd24fd09181cf105a1b51506bae6"


def _req(url, method="GET", data=None, form=False):
    if data is not None and form:
        body = urllib.parse.urlencode(data).encode()
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
    elif data is not None:
        body = json.dumps(data).encode()
        headers = {"Content-Type": "application/json"}
    else:
        body, headers = None, {}
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as r:
        raw = r.read()
        return json.loads(raw) if raw else {}


def lang_to_profile(lang_name):
    ln = (lang_name or "").lower()
    if ln == "portuguese":
        return None
    if ln == "spanish":
        return 2
    return 1


def set_series_profile(sonarr_id, profile_id, search=False):
    profile_str = str(profile_id) if profile_id is not None else "null"
    _req(f"{BAZ_URL}/api/series?apikey={BAZ_KEY}", method="POST",
         data={"seriesid": sonarr_id, "profileid": profile_str}, form=True)
    if search and profile_id is not None:
        _req(f"{BAZ_URL}/api/series?apikey={BAZ_KEY}", method="PATCH",
             data={"seriesid": sonarr_id, "action": "search-missing"}, form=True)


def set_movie_profile(radarr_id, profile_id, search=False):
    profile_str = str(profile_id) if profile_id is not None else "null"
    _req(f"{BAZ_URL}/api/movies?apikey={BAZ_KEY}", method="POST",
         data={"radarrid": radarr_id, "profileid": profile_str}, form=True)
    if search and profile_id is not None:
        _req(f"{BAZ_URL}/api/movies?apikey={BAZ_KEY}", method="PATCH",
             data={"radarrid": radarr_id, "action": "search-missing"}, form=True)


def sweep_series():
    sonarr_series = _req(f"{SONARR_URL}/api/v3/series?apikey={SONARR_KEY}")
    baz_series    = _req(f"{BAZ_URL}/api/series?apikey={BAZ_KEY}&start=0&length=-1").get("data", [])
    baz_by_id     = {s["sonarrSeriesId"]: s for s in baz_series}

    updated = unchanged = 0
    for show in sonarr_series:
        sid  = show["id"]
        lang = (show.get("originalLanguage") or {}).get("name", "English")
        want = lang_to_profile(lang)
        have = baz_by_id.get(sid, {}).get("profileId")
        if want != have:
            set_series_profile(sid, want, search=True)
            print(f"  SERIES  {show['title']} ({lang}) → profile {want}")
            updated += 1
        else:
            unchanged += 1
    print(f"Series:  {updated} updated, {unchanged} unchanged")


def sweep_movies():
    radarr_movies = _req(f"{RADARR_URL}/api/v3/movie?apikey={RADARR_KEY}")
    baz_movies    = _req(f"{BAZ_URL}/api/movies?apikey={BAZ_KEY}&start=0&length=-1").get("data", [])
    baz_by_id     = {m["radarrId"]: m for m in baz_movies}

    updated = unchanged = 0
    for movie in radarr_movies:
        rid  = movie["id"]
        lang = (movie.get("originalLanguage") or {}).get("name", "English")
        want = lang_to_profile(lang)
        have = baz_by_id.get(rid, {}).get("profileId")
        if want != have:
            set_movie_profile(rid, want, search=True)
            print(f"  MOVIE   {movie['title']} ({lang}) → profile {want}")
            updated += 1
        else:
            unchanged += 1
    print(f"Movies:  {updated} updated, {unchanged} unchanged")


if __name__ == "__main__":
    print("=== bazarr-autotag sweep ===")
    sweep_series()
    sweep_movies()
    print("Done.")
