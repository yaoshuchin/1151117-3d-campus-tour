import urllib.request
import re
import os

base = 'https://tigua111.github.io/shu-campus-tour-demo/'

def get_url(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        return resp.read()

html = get_url(base).decode('utf-8', errors='ignore')
print("HTML length:", len(html))

# Find scripts, links, styles, images in html
html_assets = set()
for m in re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html):
    if not m.startswith('data:'):
        html_assets.add(m)

print("HTML assets:", html_assets)

js_url = base + 'assets/index-XCeRedrs.js'
js_bytes = get_url(js_url)
print("JS bytes:", len(js_bytes))
js_text = js_bytes.decode('utf-8', errors='ignore')

# Search for any asset paths in JS
asset_exts = r'\.(?:glb|gltf|bin|png|jpg|jpeg|webp|svg|woff2|woff|ttf|mp3|wav|ogg|json|hdr)'
matches = set(re.findall(r'[\'"`]([a-zA-Z0-9_\-\.\/]+' + asset_exts + r')[\'"`]', js_text))

print(f"Found {len(matches)} asset patterns in JS:")
for m in sorted(matches):
    print("  JS ref:", m)
