"""Run Radar engine for all tracking items, then send Telegram alerts."""
import sys
sys.path.insert(0, '/opt/casaserver/dashboard/radar')

from db import get_conn
import engine
import notify


def main():
    conn = get_conn()
    items = conn.execute(
        "SELECT id, name FROM items WHERE status = 'tracking'"
    ).fetchall()
    conn.close()

    print(f"[run_all] {len(items)} tracking items")
    for item in items:
        print(f"[run_all] item {item['id']}: {item['name']}")
        try:
            result = engine.run(item['id'])
            print(f"  score={result.get('score')}")
        except Exception as exc:
            print(f"  error: {exc}")

    try:
        notify.run()
    except Exception as exc:
        print(f'[run_all] notify error: {exc}')


if __name__ == '__main__':
    main()
