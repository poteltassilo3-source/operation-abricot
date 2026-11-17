"""Fabrique la version Cloudflare du jeu : cloudflare/public/index.html.
On rejoint une partie avec un code à 4 caractères (pas de QR code).

A lancer depuis la racine du dépôt, après src/build.py :
    python src/build_cloudflare.py https://operation-abricot.<compte>.workers.dev
(sans argument, l'adresse est lue dans cloudflare/url.txt)
"""
import os, re, sys
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.join(ICI, '..')
CF = os.path.join(RACINE, 'cloudflare')

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
                'Ouvre ce lien sur ton téléphone ou ton ordinateur, entre le code, puis choisis ton personnage.', page)
page = remplace('Connexion impossible ici : ouvrez le lien partagé en étant connecté à votre compte Claude.',
                'Connexion au serveur impossible : vérifiez internet puis rechargez la page.', page)

# --- on rejoint avec un code de partie, pas avec un QR code ---
CODEBOX = '<div class="codebox"><small>CODE</small><b class="jcode">····</b></div>'
page, n = re.subn(r'<div class="qrbox"><svg xmlns="http://www\.w3\.org/2000/svg"[^>]*aria-label="QR code du jeu">.*?</svg></div>', lambda m: CODEBOX, page, flags=re.S)
if n != 4:
    raise SystemExit('QR codes attendus : 4, trouvés : %d' % n)
page = remplace('<p><b>Scanne pour rejoindre</b><br>avec ton téléphone ou ouvre le lien sur ton ordinateur</p>',
                '<p><b>Code de la partie</b><br>Pas la bonne partie ? <a href="/" style="color:var(--apl)">Changer de code</a></p>', page)
page = remplace('<p><b>Il manque quelqu’un ?</b><br>Scanne ce code pour rejoindre</p>',
                '<p><b>Il manque quelqu’un ?</b><br>Ouvrir <span class="host"></span> et entrer ce code</p>', page)
page = remplace('<b>Scannez le QR code</b> ou ouvrez le lien, choisissez votre personnage et votre prénom.',
                '<b>Ouvrez le lien ci-contre et entrez le code</b>, puis choisissez votre personnage et votre prénom.', page)
page = remplace('<h2>Scanne pour rejoindre la partie</h2>', '<h2>Pour rejoindre la partie</h2>', page)
page = remplace('aria-label="Afficher le QR code en grand">📱 QR code</button>', 'aria-label="Afficher le code en grand">🔑 Code</button>', page)
page = remplace('title="Afficher le QR code" aria-label="Afficher le QR code">📱</button>', 'title="Afficher le code" aria-label="Afficher le code">🔑</button>', page)

CSS = '''
.codebox{display:inline-block;background:#FDF3E3;color:#14213D;border-radius:14px;padding:10px 16px 14px;text-align:center;box-shadow:0 5px 0 #9a4f12}
.codebox small{display:block;font:800 12px "Nunito",sans-serif;letter-spacing:3px;color:#9a4f12}
.codebox b{display:block;font:400 26px "Press Start 2P","Courier New",monospace;letter-spacing:4px;margin-top:6px}
.pqr .codebox{padding:18px 26px 24px}.pqr .codebox small{font-size:16px}.pqr .codebox b{font-size:clamp(34px,6vw,64px);letter-spacing:8px;margin-top:12px}
#qrmodal .codebox b{font-size:clamp(36px,9vw,80px);letter-spacing:10px}
.qrside .codebox{width:100%}
#codeScreen{z-index:15;background:#080e20}#codeScreen input{font:400 22px "Press Start 2P",monospace;text-transform:uppercase;letter-spacing:6px;width:200px;text-align:center}
'''
page = remplace('</style>', CSS + '</style>', page)

ACCUEIL = '''<div id="codeScreen" class="ov open">
  <h1>Opération Abricot</h1>
  <p class="sub">Le duel des tours. Entre le code affiché sur l’écran projeté pour rejoindre la partie.</p>
  <div class="lbl">CODE DE LA PARTIE</div>
  <form id="codeForm" class="row" style="margin-top:0"><input id="codeIn" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="····" aria-label="Code de la partie"><button class="btn" id="codeGo" type="submit">Rejoindre</button></form>
  <div id="codeMsg" class="status bad" style="margin-top:10px;min-height:20px;font-weight:800"></div>
  <div class="lbl" style="margin-top:30px">PRÉSENTATEUR</div>
  <button class="ghost presbtn" id="newGameBtn" type="button">🎤 Créer une nouvelle partie <small>un code s’affiche sur l’écran projeté, les joueurs le tapent</small></button>
 </div>
 <div id="title" class="ov open">'''
page = remplace('<div id="title" class="ov open">', ACCUEIL, page)

os.makedirs(os.path.join(CF, 'public'), exist_ok=True)
open(os.path.join(CF, 'public', 'index.html'), 'w', encoding='utf-8').write(page)
ancien_qr = os.path.join(CF, 'public', 'qr.svg')
if os.path.exists(ancien_qr):
    os.remove(ancien_qr)
print('cloudflare/public/index.html reconstruit pour', url, '(%d QR codes remplacés par le code de partie)' % n)
