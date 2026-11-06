# Portfolio — Andy Rakotondrabe

Site portfolio statique (une seule page) pour promouvoir l'activité de rédaction web
d'Andy Rakotondrabe — **SEO Content Writer - Guest Blogger**.

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
404.html              Page d'erreur servie automatiquement par GitHub Pages
css/style.css         Design (fond neutre + accent bleu) + @font-face auto-hébergé
js/main.js            Menu mobile, scrollspy, FAQ, formulaire de contact, copie de l'email, année
robots.txt            Autorise l'indexation et déclare le sitemap
sitemap.xml           Plan du site (une URL)
package.json          Dépendances de TEST uniquement (le site reste sans build)
playwright.config.js  Deux profils de test : 1366×900 et 390×844
tests/                52 tests : formulaire, accessibilité (axe), liens, non-régression
docs/                 audit.md (registre RGAA) + performance.json (Web Vitals mesurés)
.github/workflows/qa.yml  CI : tests à chaque push + contrôle hebdomadaire du site
tools/serve.mjs       Serveur statique pour les tests (aucune dépendance)
tools/check-asset-versions.mjs  Garde-fou : ?v= incrémenté si un asset change
tools/check-live.mjs  Contrôle du site réellement publié
tools/lighthouse-report.mjs  Scores Lighthouse via l'API PageSpeed (clé PSI_KEY)
tools/generate-images.py  Régénère les dérivés d'image (portraits WebP/JPEG, carte OG)
tools/generate-logo.mjs   Régénère les icônes du monogramme (favicons + icône Apple, via Chrome)
assets/fonts/         Inter auto-hébergée (woff2 variable, sous-ensemble latin) + licence OFL
assets/favicon-16.png / favicon-32.png  Monogramme « AR » — onglet (PNG rendu par Chrome)
assets/apple-touch-icon.png  Icône Apple (180×180, carré plein : iOS masque les coins)
assets/cv/            CV d'Andy (CV-Andy-Rakotondrabe.pdf)
assets/img/           Portrait optimisé (WebP + JPEG, 300 et 600 px) + carte de partage OG
sources/              Originaux haute définition — ignorés par Git, jamais déployés
```

## Tests et intégration continue

Le site livré n'a **aucune dépendance** : `package.json` ne contient que des outils de test
(`devDependencies`), jamais chargés par les visiteurs.

```bash
npm install     # une seule fois (outils de test uniquement)
npm test        # 58 tests sur deux profils : 1366×900 et 390×844
npm run guard   # échoue si css/js a changé sans incrémenter ?v=
npm run live    # contrôle le site réellement publié
npm run vitals  # Web Vitals du site publié → docs/performance.json
npm run audit   # scores Lighthouse (nécessite une clé : PSI_KEY=... npm run audit)
```

| Fichier | Ce qui est vérifié |
|---|---|
| `tests/contact.spec.js` | soumission vide → 3 erreurs visibles, `aria-invalid`, focus sur le premier champ, résumé `role="status"` ; email invalide ; nettoyage à la saisie ; envoi intercepté ; menu à 7 options ; copie annoncée |
| `tests/regression.spec.js` | grilles 6/6/6, aucun débordement (texte à 100 % **et** 200 %), année, hiérarchie du hero, scrollspy (5 sections + `aria-current`), FAQ exclusive, menu mobile (Échap, clic extérieur, sortie de focus) |
| `tests/a11y.spec.js` | axe-core (WCAG 2.1 AA) sur les trois pages : **aucune violation sérieuse ou critique** ; `lang` et `<title>` |
| `tests/links.spec.js` | liens externes (`rel="noopener"` + « nouvel onglet »), ancres internes, `alt` + dimensions des images, identifiants uniques, ressources en 200, `sitemap.xml` |

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
  en `aria-live`, monogramme décoratif exclu du nom accessible (WCAG 2.5.3), page sans
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

Le script produit le portrait 300/600 px (WebP + JPEG de repli) et la carte Open Graph
1200×630. Les icônes du monogramme (favicons 16/32 px + icône Apple 180×180) se
régénèrent séparément, à partir du badge `.brand-mark` de l'en-tête :

```bash
npm run logo
```

## Maintenance courante

Trois gestes à faire à chaque modification publiée :

1. **Versionner les assets** : incrémenter `?v=` sur `css/style.css` (et `js/main.js`
   si le script change) dans **les trois pages** — `index.html`, `404.html`,
   `confidentialite.html`. GitHub Pages sert ces fichiers avec
   `Cache-Control: max-age=600` : sans incrément, un visiteur peut conserver
   l'ancienne version jusqu'à 10 minutes. **`npm run guard` vérifie ce point** (et échoue
   en CI si l'incrément a été oublié).
2. **Datation** : reporter la date du jour dans `sitemap.xml` (`<lastmod>` de l'URL
   modifiée). Une date figée fait douter les moteurs de la fraîcheur du contenu.
3. **Cohérence des données structurées** : si les questions de la FAQ ou les
   prestations changent, mettre à jour le bloc JSON-LD correspondant (`FAQPage`,
   `hasOfferCatalog`). Un commentaire de rappel suit le bloc dans `index.html`.
4. **Lancer les tests** : `npm test` (58 tests, ~1 min). Tout défaut corrigé doit être
   verrouillé par une assertion dans `tests/` — sinon il revient.

Conventions à respecter :

- **Lien sortant** (`target="_blank"`) : toujours avec `rel="noopener"` **et**
  `<span class="sr-only"> (nouvel onglet)</span>` (RGAA 10.7).
- **Carte cliquable** : classe `.card-link` — seules ces cartes se soulèvent au survol.
- **Largeur de lecture** : `--measure` (640 px) pour tout bloc de texte long.
- **Grilles de cartes** : 6 éléments = aucune ligne incomplète, quel que soit le
  nombre de colonnes (`auto-fit`, minimum 250 px) ; d'où les cartes d'appel à l'action
  qui referment les grilles « Services » et « Réalisations ».
- **Densité des grilles** : « Réalisations » reste en 3 colonnes (textes d'une ligne) ;
  « Prestations » passe à 2 colonnes (`min(400px, 100%)`) pour que la justification
  dispose d'une mesure suffisante (≈ 29 em). Voir le commentaire du bloc « Texte
  justifié » dans `css/style.css`.
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

## Points à compléter plus tard

- **CV** : le PDF est intégré (`assets/cv/CV-Andy-Rakotondrabe.pdf`) et lié depuis le
  Hero et la section Contact. Remplacer le fichier (même nom) pour mettre le CV à jour.
  `CV-Andy-Rakotondrabe-linkedin.pdf` est une variante non liée, prévue pour LinkedIn.
- **Témoignages** : la section `#temoignages` est **commentée** dans `index.html` tant
  qu'aucun avis client réel n'est disponible (un bloc « à venir » sur un site en ligne
  nuit à la crédibilité). Pour la réactiver : décommenter le bloc, remplacer
  « Citation du client » par un vrai témoignage, puis rajouter
  `<li><a href="#temoignages">Témoignages</a></li>` dans `.nav-list`. Pensez aussi à
  ajouter les avis dans le JSON-LD si vous souhaitez des étoiles dans les résultats.
- **Site personnel** : l'ancien lien `bit.ly/375BslN` a été retiré (il pointait vers une
  recherche Google, pas vers un site). Pour le remettre, ajouter une entrée dans
  `.contact-list` de la section `#contact` avec l'URL réelle.
- **Photo / logo** : l'en-tête conserve le monogramme « AR » (badge CSS `.brand-mark`) ;
  les favicons et l'icône Apple sont rendus **à partir de ce même badge** par
  `npm run logo` (Chrome + Inter, `tools/generate-logo.mjs`) : identique au pixel près
  à l'en-tête, sans dépendre des polices locales. L'icône Apple reste un carré plein —
  iOS applique lui-même son masque d'arrondi. Aucun fichier logo externe n'existe :
  si un logo est un jour fourni, remplacer le badge à ses deux sources (`.brand-mark`
  dans `css/style.css` et `tools/generate-logo.mjs`) plutôt que d'en ajouter un troisième.

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
