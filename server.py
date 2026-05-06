import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = os.path.join(os.path.dirname(__file__), "static")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        pass  # silent

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"✅ Dashboard at http://localhost:{PORT}")
    print(f"   On your network: http://YOUR_TABLET_IP:{PORT}")
    httpd.serve_forever()
