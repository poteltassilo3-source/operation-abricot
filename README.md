# Opération Abricot · Le duel des tours

Jeu multijoueur pour l’atelier **« Veille stratégique à l’usage des décideurs »** (Business Team Academy, HES-SO).
Quatre personnages (Cléo, Ana, Rémi, Dax) s’affrontent, chacun sur son ordinateur. Chaque bonne réponse fait monter sa tour : la plus grande tour gagne.

**Jouer :** https://claude.ai/artifact/Uk8bbCzjKh6s32uQNDyi4C (ou scanner `assets/QR_Operation_Abricot.png`)

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

- Le multijoueur utilise la connexion en direct des pages publiées sur Claude (capacité `room`). Chaque joueur doit être **connecté à son compte Claude** et la page doit lui être **partagée**. Ouvert en local ou sur un autre hébergement, `index.html` affiche « Connexion impossible ».
- Sur téléphone, jouer de préférence à l’horizontale.

## Structure

| Dossier | Contenu |
|---|---|
| `index.html` | le jeu complet, en un seul fichier (c’est ce qui est publié) |
| `src/` | les sources : `data.js` (questions, cartes action, situations), `game.js` (règles et points), `view.js` (dessin), `net.js` (connexion, accueil, présentateur), `template.html` (page et styles) |
| `src/build.py` | reconstruit `index.html` à partir des sources : `python3 src/build.py` |
| `outils/qr.py` | générateur de QR code sans dépendance |
| `tests/` | parties automatiques avec plusieurs navigateurs simulés (Playwright + Chrome), lancées depuis la racine du dépôt |

## Modifier les questions

Les questions sont dans `src/data.js` (`QUESTIONS`, `ACTIONS`, `SITUATIONS`). Chaque question : le texte, 3 réponses, l’index de la bonne réponse, et l’explication affichée après. Puis `python3 src/build.py`.
