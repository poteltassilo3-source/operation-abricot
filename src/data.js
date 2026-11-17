/* ---------- les cartes : questions tirées du cours + actions ---------- */
const QUESTIONS=[
 ['D’où vient la veille stratégique ?',['Du renseignement militaire','Du marketing digital','De la comptabilité'],0,'Elle est née du renseignement militaire (slide 2).'],
 ['Qui a adapté la veille à l’entreprise en 1967 ?',['Auguste Comte','Aguilar','Lesca'],1,'Aguilar, en 1967 : surveiller l’environnement de l’entreprise (slide 2).'],
 ['Pour Lesca et Caron-Fasan, la veille est un processus…',['ponctuel et individuel','rapide et secret','global, réflexif et itératif'],2,'Un processus global, réflexif et itératif (slide 2).'],
 ['Selon l’autrice, la veille, c’est l’aptitude à…',['capter et traiter les informations d’anticipation','copier les concurrents','vendre plus vite que les autres'],0,'Capter les informations d’anticipation et les traiter (slide 3).'],
 ['Qu’est-ce qu’un signal faible ?',['Une info que tout le monde connaît déjà','Une info présente avant la crise, mais cachée par les signaux forts','Une info forcément fausse'],1,'Déjà présent avant la crise, mais caché par les signaux forts (slide 3).'],
 ['La veille permet la détection précoce…',['des fautes d’orthographe','des erreurs de caisse','d’opportunités ou de menaces'],2,'Détecter tôt les opportunités et les menaces (slide 3).'],
 ['Le benchmarking, c’est plutôt…',['une photo à un instant donné','un film en continu','une rumeur'],0,'On compare ce qui existe déjà : une photo (slide 4).'],
 ['La veille, c’est plutôt…',['une photo unique','un film en continu','un sondage d’un jour'],1,'On suit régulièrement les nouvelles annonces : un film (slide 4).'],
 ['Lesquels sont des types de veille ?',['Sportive, musicale, culinaire','Seulement financière','Technologique, commerciale, légale, sociale'],2,'Technologique, commerciale, légale, sociale… (slide 5).'],
 ['Comment sont reliées les différentes veilles ?',['Elles sont liées, comme un diamant','Elles sont totalement séparées','Une seule suffit toujours'],0,'Elles sont liées : le diamant (slide 5).'],
 ['Faut-il activer toutes les veilles possibles ?',['Oui, toujours toutes','Non, seulement celles qui nous sont utiles','Aucune, c’est inutile'],1,'On n’active que celles qui nous sont utiles (slide 5).'],
 ['Quand faut-il lancer la veille ?',['Quand une crise arrive','À la fin du projet','Dès le début du projet'],2,'Dès le début : elle grandit avec l’entreprise (slide 6).'],
 ['Lancer la veille seulement dans l’urgence, c’est…',['de la gestion de crise','de l’anticipation','du benchmarking'],0,'Dans l’urgence, ce n’est plus de la veille mais de la gestion de crise (slide 6).'],
 ['Pourquoi tant de jeunes entreprises échouent-elles ?',['Elles font trop de veille','Souvent une mauvaise anticipation du marché','Elles ont trop de clients'],1,'Forte mortalité, souvent liée à une mauvaise anticipation du marché (slide 6).'],
 ['À quoi sert la veille pour décider ?',['Copier, cacher, attendre','Vendre, licencier, investir','Alerter, saisir les opportunités, ne pas être surpris'],2,'Alerter à temps, saisir, ne pas se laisser surprendre (slide 7).'],
 ['Dans notre projet, la veille sert d’abord à…',['suivre les événements de la région pour choisir une date et des partenaires','choisir la couleur du logo','calculer le prix des tartes'],0,'Suivre les événements annoncés dans la région (slide 7).'],
 ['À chaque filtre, que peut-on faire d’une info ?',['La garder pour soi','L’invalider, agir, ou la valider et la transmettre','La publier tout de suite'],1,'Invalider, agir directement, ou valider et transmettre (slide 8).'],
 ['Que reçoit le décideur au bout des filtres ?',['Toutes les infos brutes','Aucune info','Moins d’infos, mais triées, validées et décodées'],2,'Moins d’informations, mais triées, validées et décodées (slide 8).'],
 ['Quelles parties prenantes faut-il identifier ?',['Clients, fournisseurs, concurrents, institutions','Seulement les clients','Les amis et la famille'],0,'Clients, fournisseurs, concurrents, institutions (slide 9).'],
 ['On surveille les parties prenantes…',['seulement en mal','en bien ou en mal','seulement les concurrents'],1,'Surveiller en bien ou en mal (slide 9).'],
 ['Dans le groupe, la veille suit l’ordre…',['Remonter → Capter → Analyser','Décider → Capter → Oublier','Capter → Analyser → Remonter'],2,'Capter → Analyser → Remonter (slide 9).'],
 ['Que précise la matrice de veille ?',['Que surveiller, qui, à quelle fréquence, comment partager','Le budget publicitaire','Les horaires du marché'],0,'Que surveiller, qui, quelle fréquence, comment partager (slide 10).'],
 ['Quels outils pour partager et décider ?',['Affiches, flyers, publicités','Rapport d’étonnement, signaux faibles, point d’équipe','Rien : chacun garde ses infos'],1,'Rapport d’étonnement, signaux faibles, point d’équipe (slide 11).'],
 ['« Savoir pour prévoir, afin de pouvoir » est une phrase de…',['Aguilar','Napoléon','Auguste Comte'],2,'Auguste Comte (slide 1).']];
const ACTIONS=[
 {ico:'✦',t:'Signal faible repéré !',d:'+100 points pour toi',k:'self',v:100},
 {ico:'📝',t:'Rapport d’étonnement',d:'+150 points pour toi',k:'self',v:150},
 {ico:'🗯',t:'Rumeur non vérifiée…',d:'−100 points pour toi',k:'self',v:-100},
 {ico:'🎩',t:'Le Baron attaque le premier',d:'−100 points pour celui qui a la plus grande tour',k:'lead',v:-100},
 {ico:'🤝',t:'Point d’équipe',d:'+50 points pour tout le monde',k:'all',v:50},
 {ico:'⚡',t:'Surpris par la crise !',d:'−50 points pour toi',k:'self',v:-50},
 {ico:'🚀',t:'Veille lancée dès le début',d:'Tes points sont doublés à la prochaine question',k:'dbl',v:0},
 {ico:'🌪',t:'Le Baron sème la panique',d:'−50 points pour tout le monde',k:'all',v:-50}];
const NCARDS=24,NQ=18,NA=6,DUR={pick:15,q:20,rev:7,act:6};
const CHARS=[0,1,2,3];
function buildDeck(seed){const R=rng(seed);const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const q=sh(QUESTIONS.map((x,i)=>i)).slice(0,NQ),ac=sh(ACTIONS.map((x,i)=>100+i)).slice(0,NA);
 /* mélange des réponses pour chaque question : ordre propre à la partie */
 return sh(q.concat(ac)).map(id=>{if(id>=100)return [id,0];return [id,Math.floor(R()*3)];});}
/* rotation r : la bonne réponse se déplace de r cases */
function qView(card){const Q=QUESTIONS[card[0]],r=card[1];const ans=[0,1,2].map(i=>Q[1][(i+3-r)%3]);return {q:Q[0],ans,ok:(Q[2]+r)%3,why:Q[3]};}
/* ---------- manche 2 : le grand tri (situations de notre projet d'événement) ---------- */
const BINS=[{ico:'🚨',name:'Alerter',sub:'une menace',col:'#c0453a'},{ico:'💰',name:'Saisir',sub:'une opportunité',col:'#2f9a52'},{ico:'🗑️',name:'Poubelle',sub:'bruit ou rumeur',col:'#5b6a95'}];
const SITUATIONS=[
 ['Un autre festival est annoncé le même week-end que notre événement, à 5 km','site officiel de la commune',0,'Un concurrent le même jour : c’est une menace, on alerte l’équipe tout de suite !'],
 ['La salle que nous voulions annonce des travaux en juin','e-mail du propriétaire',0,'Source fiable, impact direct sur notre date : menace, on alerte.'],
 ['La commune prépare un nouveau règlement pour les événements publics','site de la commune',0,'Veille légale : une nouvelle règle peut nous bloquer. On alerte.'],
 ['Le prix de location du matériel augmente de 20 %','devis du fournisseur',0,'Notre budget est menacé : on alerte le décideur.'],
 ['Notre principal sponsor vient d’être racheté par une autre entreprise','journal économique',0,'Signal faible : le nouveau patron pourrait arrêter le sponsoring. On alerte.'],
 ['La région lance un appel à projets pour les événements étudiants','site de la région',1,'De l’argent possible pour nous : opportunité, on la saisit !'],
 ['Une boulangerie du quartier cherche à se faire connaître','discussion avec la patronne',1,'Un partenaire potentiel : opportunité à saisir.'],
 ['Un influenceur local parle souvent d’événements comme le nôtre','son compte, 20 000 abonnés',1,'Une visibilité gratuite : opportunité, on le contacte.'],
 ['L’école prête gratuitement sa salle le samedi','secrétariat de l’école',1,'Une salle gratuite et une source fiable : on saisit !'],
 ['Beaucoup d’étudiants disent qu’il manque d’activités le week-end','sondage de l’association',1,'Un besoin réel du public : opportunité pour notre événement.'],
 ['« La police va interdire tous les événements, partage vite !!! »','chaîne de messages, sans source',2,'Aucune source fiable : c’est une rumeur. Poubelle !'],
 ['TOUT LE MONDE PARLE DU MATCH D’HIER !!!','la cafétéria',2,'Un signal fort qui n’a rien à voir avec notre projet : du bruit. Poubelle.'],
 ['Une star mondiale adore les tartes aux abricots','magazine people',2,'Hors sujet pour notre événement : poubelle.'],
 ['« Ton événement va être annulé, crois-moi »','un inconnu sur un forum',2,'Inconnu, sans preuve : rumeur à invalider. Poubelle.'],
 ['Il pleut beaucoup à Tokyo cette semaine','application météo',2,'Vrai, mais inutile pour nous : du bruit. Poubelle.']];
const NSIT=12,DUR2={q:12,rev:5};
function sitOrder(seed){const R=rng(seed*7+11);const a=SITUATIONS.map((x,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,NSIT);}
