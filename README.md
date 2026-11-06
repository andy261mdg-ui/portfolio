# Portfolio — Andy Rakotondrabe

Site portfolio statique (une seule page) pour promouvoir l'activité de rédaction web
d'Andy Rakotondrabe, **SEO Content Writer & Guest Blogger**.

En ligne : <https://andy261mdg-ui.github.io/portfolio/>

## Ouvrir le site

Aucune installation n'est nécessaire.

1. Ouvrir le dossier `D:\portfolio`.
2. Double-cliquer sur **`index.html`** (ou clic droit → Ouvrir avec → votre navigateur).

Le site fonctionne **hors ligne** : la police Inter est **auto-hébergée** (`assets/fonts/`),
donc aucune connexion n'est nécessaire — et aucune adresse IP n'est transmise à un service tiers.

## Structure

```
index.html            Page unique (toutes les sections) + métadonnées SEO et JSON-LD
cv.html               CV consultable en ligne (accessible) ET source du PDF
404.html              Page d'erreur servie automatiquement par GitHub Pages
css/style.css         Design (fond neutre + accent bleu) + @font-face auto-hébergé
js/main.js            Menu mobile, scrollspy, FAQ, formulaire de contact, copie de l'email, année
robots.txt            Autorise l'indexation et déclare le sitemap
sitemap.xml           Plan du site (accueil, CV, confidentialité)
package.json          Dépendances de TEST uniquement (le site reste sans build)
playwright.config.js  Deux profils de test : 1366×900 et 390×844
tests/                70 tests : formulaire, accessibilité (axe), liens, CV, non-régression
docs/                 audit.md (registre RGAA) + performance.json (Web Vitals mesurés)
.github/workflows/qa.yml  CI : tests à chaque push + contrôle hebdomadaire du site
tools/serve.mjs       Serveur statique pour les tests (aucune dépendance)
tools/check-asset-versions.mjs  Garde-fou : ?v= incrémenté si un asset change
tools/check-live.mjs  Contrôle du site réellement publié
tools/check-pdf-a11y.py  Contrôle du balisage du CV PDF (arbre de structure, langue, titre)
tools/lighthouse-report.mjs  Scores Lighthouse via l'API PageSpeed (clé PSI_KEY)
tools/generate-images.py  Régénère les dérivés d'image (portraits WebP/JPEG, carte OG, logo)
assets/fonts/         Inter auto-hébergée (woff2 variable, sous-ensemble latin) + licence OFL
assets/favicon-16.png / favicon-32.png  Logo (pictogramme) — onglet, tuile blanche
assets/apple-touch-icon.png  Icône Apple (180×180, logo complet, carré plein : iOS masque les coins)
assets/cv/            CV d'Andy (CV-Andy-Rakotondrabe.pdf)
assets/img/           Portrait optimisé (WebP + JPEG, 300 et 600 px) + carte OG + logo-icon.png
sources/              Originaux haute définition — ignorés par Git, jamais déployés
                      (le CV n'y est plus : sa source est cv.html, versionnée)
```

## Tests et intégration continue

Le site livré n'a **aucune dépendance** : `package.json` ne contient que des outils de test
(`devDependencies`), jamais chargés par les visiteurs.

```bash
npm install     # une seule fois (outils de test uniquement)
npm test        # 70 tests sur deux profils : 1366×900 et 390×844
npm run guard   # échoue si css/js a changé sans incrémenter ?v=
npm run live    # contrôle le site réellement publié
npm run vitals  # Web Vitals du site publié → docs/performance.json
npm run audit   # scores Lighthouse (nécessite une clé : PSI_KEY=... npm run audit)
npm run cv      # régénère le CV PDF balisé depuis cv.html
```

| Fichier | Ce qui est vérifié |
|---|---|
| `tests/contact.spec.js` | soumission vide → 3 erreurs visibles, `aria-invalid`, focus sur le premier champ, résumé `role="status"` ; email invalide ; nettoyage à la saisie ; envoi intercepté ; menu à 7 options ; copie annoncée |
| `tests/regression.spec.js` | grilles 6/6/6, aucun débordement (texte à 100 % **et** 200 %), année, hiérarchie du hero, scrollspy (5 sections + `aria-current`), FAQ exclusive, menu mobile (Échap, clic extérieur, sortie de focus) |
| `tests/a11y.spec.js` | axe-core (WCAG 2.1 AA) sur les quatre pages : **aucune violation sérieuse ou critique** ; `lang` et `<title>` |
| `tests/links.spec.js` | liens externes (`rel="noopener"` + « nouvel onglet »), ancres internes, `alt` + dimensions des images, identifiants uniques, ressources en 200, `sitemap.xml`, meta description ≤ 160 caractères, FAQPage JSON-LD synchronisé avec la FAQ visible |
| `tests/cv.spec.js` | CV : page en ligne (un seul `h1`, sections ordonnées, lien PDF) et **PDF balisé** — arbre de structure, `/Lang`, titre affiché, une page (`tools/check-pdf-a11y.py`) |

La CI (`.github/workflows/qa.yml`) lance la suite à chaque `push` et `pull request`, puis
contrôle **une fois par semaine** le site publié (liens, ressources, contenu clé). Le rapport
HTML est archivé automatiquement en cas d'échec.

> En local, les tests utilisent votre Chrome installé (aucun navigateur à télécharger) ;
> en CI, Playwright installe son propre Chromium.

## Performances & référencement

- **Portrait** : le hero charge `andy-rakotondrabe-portrait-300.webp` (7,8 Ko) ou
  `-600.webp` (25 Ko) selon la densité d'écran, avec un JPEG de repli. L'ancien PNG de
  2 Mo n'est plus utilisé ni déployé (conservé dans `sources/`).
- **Partage social** : Open Graph + Twitter Card, image `andy-rakotondrabe-og-cover.jpg`
  (1200×630, 85 Ko).
- **Données structurées** : `Person`, `ProfessionalService`, `WebSite` et `FAQPage`
  (schema.org) dans un bloc `application/ld+json`.
- **Meta description** : ≤ 160 caractères et ciblée « rédacteur web freelance » —
  verrouillée par `tests/links.spec.js` et par le contrôle du site publié
  (`npm run live`).
- **URL canonique** : `https://andy261mdg-ui.github.io/portfolio/`.
- **`robots.txt`** + **`sitemap.xml`** à la racine.
- **Police auto-hébergée** : Inter (variable, sous-ensemble latin, 47 Ko en woff2) servie
  depuis `assets/fonts/` avec `preload`. Supprime la requête tierce bloquante
  (≈ 950 ms mesurés sur le chemin critique) et n'expose plus l'adresse IP des visiteurs.
  Licence OFL incluse : `assets/fonts/LICENSE-Inter.txt`.
- **Mesures** : `docs/performance.json` consigne les Web Vitals relevés au chargement
  (LCP, CLS, FCP, TTFB, poids transféré) et le détail des requêtes les plus longues.
- **Accessibilité** : `prefers-reduced-motion`, focus visibles, lien d'évitement,
  fermeture du menu (`Échap`, clic extérieur, tabulation hors navigation), section
  courante annoncée (`aria-current`) **et** soulignée (WCAG 1.4.1), statut de formulaire
  en `aria-live`, pictogramme décoratif exclu du nom accessible (WCAG 2.5.3), page sans
  débordement horizontal jusqu'à 200 % de taille de texte (WCAG 1.4.4) — le tout verrouillé
  par les tests `tests/a11y.spec.js` et `tests/regression.spec.js` (axe-core, aucune
  violation sérieuse ou critique).

> ⚠️ Si le site change d'adresse (domaine personnalisé), mettre à jour les URL absolues
> dans `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD),
> `robots.txt` et `sitemap.xml`.

## Régénérer les images (facultatif)

Nécessite Python 3 et Pillow (`pip install pillow`). Placer l'original dans
`sources/andy-rakotondrabe-portrait-cadre.png`, puis :

```bash
python tools/generate-images.py
```

Le script produit le portrait 300/600 px (WebP + JPEG de repli), la carte Open Graph
1200×630 **et les dérivés du logo** à partir de `sources/logo-andy-rakotondrabe.png` :
pictogramme de l'en-tête (`assets/img/logo-icon.png`, fond transparent), favicons
16/32 px (tuile blanche, lisible aussi en thème sombre) et icône Apple 180×180
(logo complet). La découpe du pictogramme est automatique (premier bloc non blanc,
arrêté à la bande blanche qui le sépare du wordmark). Raccourci :

```bash
npm run logo
```

## Régénérer le CV (facultatif)

Le CV existe en **deux formats pour une seule source**, `cv.html` : une page du site
accessible (un `h1`, des sections, des listes, des liens) et le PDF généré depuis
elle. Pour changer le contenu, modifier `cv.html`, puis :

```bash
npm run cv     # cv.html → assets/cv/CV-Andy-Rakotondrabe.pdf (une page A4, balisé)
```

La mise en page d'impression vit dans `cv.html` (`@media print` + `@page A4`) : le
PDF tient sur **une page**, avec la police Inter du site, sans navigation ni pied de
page. Le script fait trois choses :

1. rend la page en média `print` et exporte le PDF avec `tagged: true` : Chromium
   écrit alors un **arbre de structure** (`H1`, `H2`, `P`, `L`/`LI`/`Lbl`, `Link`),
   c'est-à-dire un ordre de lecture exploitable par un lecteur d'écran ;
2. complète les **métadonnées** (titre, auteur, sujet, mots-clés), déclare la langue
   du document (`/Lang fr-FR`) et `/ViewerPreferences /DisplayDocTitle` (le titre
   s'affiche dans la barre du lecteur au lieu du nom de fichier) ;
3. lance `tools/check-pdf-a11y.py`, qui **échoue** si le balisage, la langue, le
   titre ou la tenue sur une page sont perdus.

Dépendances : Playwright (déjà installé pour les tests) et `pypdf`
(`pip install pypdf`). La CI rejoue le même contrôle à chaque `push`.
Limite assumée : le PDF est **balisé**, pas certifié PDF/UA-1 (Chromium n'émet pas
les métadonnées XMP d'identification) — détail et solutions dans `docs/audit.md` §5.

## Maintenance courante

Trois gestes à faire à chaque modification publiée :

1. **Versionner les assets** : incrémenter `?v=` sur `css/style.css` (et `js/main.js`
   si le script change) dans **les quatre pages** — `index.html`, `cv.html`,
   `404.html`, `confidentialite.html`. GitHub Pages sert ces fichiers avec
   `Cache-Control: max-age=600` : sans incrément, un visiteur peut conserver
   l'ancienne version jusqu'à 10 minutes. **`npm run guard` vérifie ce point** (et échoue
   en CI si l'incrément a été oublié).
2. **Datation** : reporter la date du jour dans `sitemap.xml` (`<lastmod>` de l'URL
   modifiée). Une date figée fait douter les moteurs de la fraîcheur du contenu.
3. **Cohérence des données structurées** : si les questions de la FAQ ou les
   prestations changent, mettre à jour le bloc JSON-LD correspondant (`FAQPage`,
   `hasOfferCatalog`). Un commentaire de rappel suit le bloc dans `index.html`.
4. **Lancer les tests** : `npm test` (62 tests, ~2 min). Tout défaut corrigé doit être
   verrouillé par une assertion dans `tests/` — sinon il revient.

Conventions à respecter :

- **Lien sortant** (`target="_blank"`) : toujours avec `rel="noopener"` **et**
  `<span class="sr-only"> (nouvel onglet)</span>` (RGAA 10.7).
- **Carte cliquable** : classe `.card-link` — seules ces cartes se soulèvent au survol.
- **Largeur de lecture** : `--measure` (640 px) pour tout bloc de texte long.
- **Grilles de cartes** : 6 éléments = aucune ligne incomplète, quel que soit le
  nombre de colonnes (`auto-fit`, minimum 250 px) ; d'où les cartes d'appel à l'action
  qui referment les grilles « Services » et « Réalisations ».
- **Densité des grilles** : « Prestations » **et** « Réalisations » passent à 2 colonnes
  (`min(400px, 100%)`) : leurs cartes portent un paragraphe de mission, et la
  justification a besoin d'une mesure suffisante (≈ 29 em). Voir le commentaire du bloc
  « Texte justifié » dans `css/style.css`.
- **Justification** : bords gauche et droit alignés dès qu'un bloc atteint ~22 em de
  mesure ; en dessous (colonnes de cartes étroites, écrans < 640 px) le texte repasse
  en fer à gauche — justifier des lignes courtes crée des blancs entre les mots.
- **Taille de texte** : zéro débordement horizontal jusqu'à 200 % (test automatique) —
  d'où `min-height` (et non `height`) sur l'en-tête, `flex-wrap` sur la navigation, et
  `overflow-wrap: anywhere` sur les mots non coupables (« Rakotondrabe »,
  « Réalisations », emails) : le mot ne se coupe que s'il ne tient pas.
- **Hero** : hiérarchie de lecture figée — `.hero-subtitle` = signature de marque
  (discrète), `.hero-promise` = bénéfice client (message principal, barre d'accent),
  `.hero-tagline` = livrables, puis un seul CTA primaire (`Parlons de votre projet`)
  suivi de `.hero-reassurance` (« Réponse sous 48 heures ouvrées. »). Modifier le délai de
  réponse impose de mettre à jour les trois emplacements (hero, formulaire, message
  de succès) — la promesse doit rester identique partout.

## Faits éditoriaux (source de vérité)

Les statuts et les missions doivent rester **identiques** dans `index.html` (À propos,
cartes Réalisations, FAQ), dans le CV et dans les données structurées. Une reprise de
ces faits est un contenu, pas une formule : on ne résume pas, on ne fusionne pas deux
médias dans une seule phrase.

| Média | Statut | Période | Missions |
|---|---|---|---|
| IGN France | guest blogger | déc. 2024 – présent | veille et choix des brèves du jour ; articles piliers et satellites validés par le client ; communiqués de presse ; traduction anglais → français lors des grands événements |
| Android MT (Ouest-France) | guest blogger | avr. 2024 – présent | sujets evergreen choisis en autonomie ; publication directe sous WordPress |
| NuMedia | pigiste | fév. 2023 – présent | choix des sujets et des formats, planification et publication WordPress |
| Le Mag Jeux High-Tech | guest blogger | juin 2021 – 2025 | brèves fournies par le client, certains sujets choisis en autonomie |
| Le Mag Auto Prestige | rédacteur | 2024 | proposition de sujets de dossiers |
| PhonAndroid | rédacteur web | sept. 2020 – juil. 2022 | articles longs uniquement : guides d'achat, comparatifs, dossiers |

Règles de rédaction de ces blocs :

- **Première personne.** Les missions se décrivent avec « je » (« je choisis les brèves du
  jour »), jamais à la troisième personne (« il », « lui-même »).
- **Un média, un bloc.** Pas de liste commune qui laisse croire que tous les médias
  demandent la même chose.
- **Un fait daté reste daté.** Une collaboration terminée garde ses bornes (« juin 2021 –
  2025 ») ; seules les collaborations en cours portent « depuis … ».
- **Pas de tiret cadratin.** Le site utilise « : », « , » ou « · » ; le tiret cadratin
  (—) est réservé aux commentaires de code.

## Points à compléter plus tard

- **CV** : source unique `cv.html` (versionnée, publiée, accessible), PDF généré par
  `npm run cv` et lié depuis le hero, la section Contact et la page CV elle-même.
  Le PDF est **balisé** (arbre de structure, langue, titre affiché) et contrôlé à
  chaque génération et en CI ; il n'est pas certifié PDF/UA-1, voir `docs/audit.md` §5.
  `CV-Andy-Rakotondrabe-linkedin.pdf` est une variante non liée, prévue pour LinkedIn
  (mise à jour manuelle).
- **Témoignages** : la section `#temoignages` est **commentée** dans `index.html` tant
  qu'aucun avis client réel n'est disponible (un bloc « à venir » sur un site en ligne
  nuit à la crédibilité). Pour la réactiver : décommenter le bloc, remplacer
  « Citation du client » par un vrai témoignage, puis rajouter
  `<li><a href="#temoignages">Témoignages</a></li>` dans `.nav-list`. Pensez aussi à
  ajouter les avis dans le JSON-LD si vous souhaitez des étoiles dans les résultats.
- **Site personnel** : l'ancien lien `bit.ly/375BslN` a été retiré (il pointait vers une
  recherche Google, pas vers un site). Pour le remettre, ajouter une entrée dans
  `.contact-list` de la section `#contact` avec l'URL réelle.
- **Photo / logo** : le logo fourni (livre + curseur + pixels, wordmark « Andy
  Rakotondrabe / SEO Content Writer ») est la source unique : original dans
  `sources/logo-andy-rakotondrabe.png` (ignoré par Git), dérivés régénérés par
  `python tools/generate-images.py` (ou `npm run logo`). L'en-tête affiche le
  pictogramme seul (`assets/img/logo-icon.png`, `<img alt="">` dans `.brand-mark`
  `aria-hidden`) à côté du nom en texte : le nom accessible reste « Andy
  Rakotondrabe, accueil » (WCAG 2.5.3). Les favicons sont une tuile blanche :
  pictogramme lisible aussi sur onglet en thème sombre ; l'icône Apple reste un
  carré plein à logo complet, iOS applique lui-même son masque d'arrondi. Pour un
  nouveau logo : remplacer l'original dans `sources/` et relancer le script.

## Contact

Le formulaire (`#contact-form` dans `index.html`) envoie les messages **directement vers
andy261mdg@gmail.com** via [Formspree](https://formspree.io) : aucun serveur à héberger.

### Activer l'envoi direct (une seule ligne à changer)

1. Créer un compte gratuit sur [formspree.io](https://formspree.io) avec
   **andy261mdg@gmail.com**, puis confirmer l'adresse email.
2. Créer un formulaire (nom : « Portfolio ») et autoriser le domaine
   `andy261mdg-ui.github.io` (« Restrict to domain »).
3. Copier l'endpoint fourni (`https://formspree.io/f/xxxxxxxx`) et le coller dans
   `index.html`, sur la balise du formulaire :

   ```html
   <form class="contact-form" id="contact-form" action="https://formspree.io/f/xxxxxxxx" method="post">
   ```

4. `git commit` + `git push` : l'envoi direct est actif.

Tant que `action` reste un `mailto:`, le formulaire ouvre le logiciel de messagerie du
visiteur : le site fonctionne donc avant même la configuration.

### Comportements garantis

- **Quota** : 50 envois/mois au niveau gratuit. Au-delà, Formspree renvoie une erreur et le
  site affiche un lien `mailto` pré-rempli (aucun message n'est perdu dans le vide).
- **Anti-spam** : filtrage Formspree + champ leurre `_gotcha` (invisible, jamais focusable).
- **Validation accessible** : message d'erreur visible sous chaque champ, relié par
  `aria-describedby` et doublé de `aria-invalid`, focus placé sur le premier champ fautif,
  résumé annoncé par la région `role="status"` (RGAA 11.10). Sans JavaScript, la validation
  native du navigateur reprend la main (`required`, `type="email"`).
- **Qualification sans friction** : le menu « Type de prestation » (facultatif) reprend les
  cinq offres et alimente l'objet du message (`_subject`), sans ajouter de champ obligatoire.
- **Un seul délai annoncé** : « 48 heures ouvrées » (chapeau, aide du formulaire, message de succès).
- **Réseau coupé / service indisponible** : après 10 s d'attente, un lien `mailto`
  pré-rempli remplace le message d'erreur.
- **Données personnelles** : nom, email et message transitent par Formspree (conformité RGPD
  annoncée par le service) et ne servent qu'à répondre au message.
- Le bouton **« Copier l'adresse »** et le lien `mailto` de la section contact restent
  disponibles en secours ; la copie est confirmée visuellement **et** annoncée via une
  région `role="status"` (lecteurs d'écran).

## Déploiement

Le site est 100 % statique : aucun build. Guide détaillé pour **GitHub Pages** dans
[DEPLOY.md](DEPLOY.md).

En résumé :

1. Créer un dépôt GitHub public.
2. `git remote add origin https://github.com/<pseudo>/portfolio.git` puis `git push -u origin main`.
3. Settings → Pages → Source « Deploy from a branch » → `main` / `/ (root)`.

Le fichier `.nojekyll` est inclus pour que GitHub serve le site tel quel.
