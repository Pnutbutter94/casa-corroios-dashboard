#!/data/data/com.termux/files/usr/bin/bash
# Casa Corroios dashboard — start / restart script
# Usage: bash ~/dashboard/start.sh
set -e
cd "$(dirname "$0")"

echo "🔒  Wake lock..."
termux-wake-lock 2>/dev/null \
  && echo "    active" \
  || echo "    skipped — install Termux:API from F-Droid to enable"

echo "🛑  Stopping old server..."
pkill -f gunicorn 2>/dev/null || true
pkill -f 'python.*server\.py' 2>/dev/null || true
sleep 1

echo "🚀  Starting gunicorn (2 workers)..."
nohup gunicorn \
  --workers 2 \
  --bind 0.0.0.0:8080 \
  --timeout 30 \
  server:app \
  >> server.log 2>&1 &

echo "✅  Dashboard running — http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):8080"
echo "    Logs: tail -f ~/dashboard/server.log"
