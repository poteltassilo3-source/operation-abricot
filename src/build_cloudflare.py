"""Fabrique la version Cloudflare du jeu : cloudflare/public/index.html (+ qr.svg).

A lancer depuis la racine du dépôt, après src/build.py :
    python src/build_cloudflare.py https://operation-abricot.<compte>.workers.dev
(sans argument, l'adresse est lue dans cloudflare/url.txt)
"""
import os, re, sys
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.join(ICI, '..')
CF = os.path.join(RACINE, 'cloudflare')
sys.path.insert(0, os.path.join(RACINE, 'outils'))
import qr  # noqa: E402

url_file = os.path.join(CF, 'url.txt')
url = sys.argv[1] if len(sys.argv) > 1 else open(url_file, encoding='utf-8').read().strip()
url = url.rstrip('/')
open(url_file, 'w', encoding='utf-8').write(url + '\n')
court = re.sub(r'^https?://', '', url)

page = open(os.path.join(RACINE, 'index.html'), encoding='utf-8').read()
shim = open(os.path.join(CF, 'reseau_cloudflare.js'), encoding='utf-8').read()

def remplace(old, new, texte, attendu=True):
    if attendu and old not in texte:
        raise SystemExit('Texte introuvable dans index.html : ' + old[:60])
    return texte.replace(old, new)

page = remplace('<script>', '<script>\n' + shim + '</script>\n<script>', page)
page = remplace('<meta charset="utf-8">', '<meta charset="utf-8">\n<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E%F0%9F%8D%91%3C/text%3E%3C/svg%3E">', page)
page = re.sub(r'https://claude\.ai/artifact/[A-Za-z0-9]+', url, page)
page = re.sub(r'claude\.ai/artifact/[A-Za-z0-9]+', court, page)
page = remplace('Ouvre le lien en étant connecté à ton compte Claude, puis choisis ton personnage.',
                'Ouvre le lien sur ton téléphone ou ton ordinateur, puis choisis ton personnage.', page)
page = remplace('Connexion impossible ici : ouvrez le lien partagé en étant connecté à votre compte Claude.',
                'Connexion au serveur impossible : vérifiez internet puis rechargez la page.', page)

M, v = qr.make(url, 'M', 0)
svg = qr.svg(M)
page, n = re.subn(r'<svg xmlns="http://www\.w3\.org/2000/svg" viewBox="0 0 \d+ \d+" shape-rendering="crispEdges" role="img" aria-label="QR code du jeu">.*?</svg>', lambda m: svg, page, flags=re.S)
if n == 0:
    raise SystemExit('QR code introuvable dans index.html')

os.makedirs(os.path.join(CF, 'public'), exist_ok=True)
open(os.path.join(CF, 'public', 'index.html'), 'w', encoding='utf-8').write(page)
open(os.path.join(CF, 'public', 'qr.svg'), 'w', encoding='utf-8').write(svg)
print('cloudflare/public/index.html reconstruit pour', url, '(%d QR codes, version %d)' % (n, v))
