"""Send Telegram alert when a tracking item's score crosses into green (>=65)."""
import sys
import urllib.request
import urllib.parse
sys.path.insert(0, '/opt/casaserver/radar')

from db import get_conn

ALERT_THRESHOLD = 65
ENV_FILE = '/opt/casaserver/system-notify.env'


def _load_env():
    result = {}
    try:
        for line in open(ENV_FILE).read().splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, _, v = line.partition('=')
            result[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return result


def _send(token, chat_id, text):
    body = urllib.parse.urlencode({'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'}).encode()
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=body,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    urllib.request.urlopen(req, timeout=10)


def run():
    env = _load_env()
    token = env.get('CASA_BOT_TOKEN')
    chat_id = env.get('CASA_CHAT_ID')
    if not token or not chat_id:
        print('[notify] missing CASA_BOT_TOKEN or CASA_CHAT_ID', flush=True)
        return

    conn = get_conn()
    items = conn.execute(
        "SELECT id, name, last_alert_score, COALESCE(alert_threshold, 65) AS alert_threshold"
        " FROM items WHERE status = 'tracking'"
    ).fetchall()

    for item in items:
        iid = item['id']
        prev = item['last_alert_score']
        threshold = item['alert_threshold']

        sig = conn.execute(
            "SELECT score FROM buy_signals WHERE item_id=? ORDER BY computed_at DESC LIMIT 1",
            (iid,),
        ).fetchone()
        score = sig['score'] if sig else None

        if score is None:
            continue

        if score >= threshold and (prev is None or prev < threshold):
            best = conn.execute(
                """SELECT MIN(last_price_eur + COALESCE(shipping_eur, 0))
                   FROM item_stores WHERE item_id=? AND active=1 AND last_price_eur IS NOT NULL""",
                (iid,),
            ).fetchone()[0]

            price_str = f'€{best:.2f}' if best is not None else 'preço desconhecido'
            msg = f'🟢 *{item["name"]}* — score {score} — melhor preço {price_str}'
            try:
                _send(token, chat_id, msg)
                conn.execute("UPDATE items SET last_alert_score=? WHERE id=?", (score, iid))
                conn.commit()
                print(f'[notify] alerted item {iid} ({item["name"]}) score={score}', flush=True)
            except Exception as exc:
                print(f'[notify] failed to send for item {iid}: {exc}', flush=True)

        elif score < threshold and prev is not None:
            # Reset so it fires again next time score crosses 65
            conn.execute("UPDATE items SET last_alert_score=NULL WHERE id=?", (iid,))
            conn.commit()
            print(f'[notify] reset item {iid} ({item["name"]}) score={score}', flush=True)

    conn.close()


if __name__ == '__main__':
    run()
