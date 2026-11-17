# Opération Abricot · Le duel des tours

Jeu multijoueur pour l’atelier **« Veille stratégique à l’usage des décideurs »** (Business Team Academy, HES-SO).
Quatre personnages (Cléo, Ana, Rémi, Dax) s’affrontent, chacun sur son ordinateur. Chaque bonne réponse fait monter sa tour : la plus grande tour gagne.

**Jouer (sans compte) :** https://operation-abricot.poteltassilo3.workers.dev (ou scanner `assets/QR_Cloudflare.svg`)

Version Claude (compte Claude requis) : https://claude.ai/artifact/Uk8bbCzjKh6s32uQNDyi4C (`assets/QR_Operation_Abricot.png`)

Présentateur : ouvrir https://operation-abricot.poteltassilo3.workers.dev/#presentateur sur l’ordinateur projeté.
Plusieurs groupes en même temps : ajouter `?salle=nom` à l’adresse (ex. `…workers.dev/?salle=groupe2`), chaque salle est une partie séparée.

## Déroulé (≈ 20 minutes)

1. **Accueil** : chaque joueur choisit un personnage et tape son prénom. L’ordinateur projeté clique sur **« Je suis le présentateur »** (ou ouvre le lien avec `#presentateur`).
2. **Règles** : elles s’affichent avant chaque manche ; chaque joueur clique sur « J’ai compris ».
3. **Manche 1 · Le duel des cartes** : 24 cartes face cachée (18 questions sur le cours, 6 cartes action). À tour de rôle, un joueur retourne une carte ; tout le monde répond en même temps. Bonne réponse : 100 points + bonus de rapidité (+100, +50, +25).
4. **Manche 2 · Le grand tri** (mise en pratique) : 12 infos sur notre projet d’événement. Pour chacune : 🚨 **Alerter** (menace), 💰 **Saisir** (opportunité) ou 🗑️ **Poubelle** (bruit ou rumeur sans source fiable).
5. **Podium** : la plus grande tour gagne.

## Écran présentateur

- QR code géant et liste des joueurs connectés.
- Boutons : afficher les règles, **⏭ Passer** (étape suivante), **↻ Nouvelle partie**, son, plein écran.
- C’est l’ordinateur du présentateur qui fait tourner la partie : gardez l’onglet ouvert.
- Sans présentateur, le jeu marche aussi : n’importe quel joueur peut lancer, et si l’ordinateur qui fait tourner la partie se ferme, un autre prend le relais.

## Important

- **Version Cloudflare** : aucun compte nécessaire. Un Worker sert la page et un Durable Object (`cloudflare/worker.js`) relaie la connexion en direct entre les joueurs (WebSocket). `cloudflare/reseau_cloudflare.js` imite dans la page la connexion `room` de Claude : la logique du jeu est identique.
- **Version Claude** (`index.html`) : utilise la connexion en direct des pages publiées sur Claude (capacité `room`). Chaque joueur doit être connecté à son compte Claude. Ouvert ailleurs, ce fichier affiche « Connexion impossible ».
- Sur téléphone, jouer de préférence à l’horizontale.

## Structure

| Dossier | Contenu |
|---|---|
| `index.html` | le jeu complet, en un seul fichier (c’est ce qui est publié) |
| `src/` | les sources : `data.js` (questions, cartes action, situations), `game.js` (règles et points), `view.js` (dessin), `net.js` (connexion, accueil, présentateur), `template.html` (page et styles) |
| `src/build.py` | reconstruit `index.html` à partir des sources : `python3 src/build.py` |
| `cloudflare/` | serveur Cloudflare (`worker.js`, `wrangler.jsonc`), couche réseau, et `public/` (page générée, ne pas modifier à la main) |
| `src/build_cloudflare.py` | fabrique `cloudflare/public/index.html` depuis `index.html` (adresse et QR code Cloudflare) |
| `outils/qr.py` | générateur de QR code sans dépendance |
| `tests/` | parties automatiques avec plusieurs navigateurs simulés (Playwright + Chrome), lancées depuis la racine du dépôt |

## Modifier les questions

Les questions sont dans `src/data.js` (`QUESTIONS`, `ACTIONS`, `SITUATIONS`). Chaque question : le texte, 3 réponses, l’index de la bonne réponse, et l’explication affichée après. Puis :

```
python src/build.py
python src/build_cloudflare.py
cd cloudflare
npx wrangler deploy
```
