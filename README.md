# Portfolio — Andy Rakotondrabe

Site portfolio statique (une seule page) pour promouvoir l'activité de rédaction web
d'Andy Rakotondrabe — **SEO Content Writer - Guest Blogger**.

En ligne : <https://andy261mdg-ui.github.io/portfolio/>

## Ouvrir le site

Aucune installation n'est nécessaire.

1. Ouvrir le dossier `D:\portfolio`.
2. Double-cliquer sur **`index.html`** (ou clic droit → Ouvrir avec → votre navigateur).

Le site fonctionne **hors ligne** (la police « Inter » est un simple confort : en ligne elle
s'affiche, hors ligne la police système prend le relais).

## Structure

```
index.html            Page unique (toutes les sections) + métadonnées SEO et JSON-LD
404.html              Page d'erreur servie automatiquement par GitHub Pages
css/style.css         Design (fond neutre + accent bleu)
js/main.js            Menu mobile, scrollspy, FAQ, formulaire de contact, copie de l'email, année
robots.txt            Autorise l'indexation et déclare le sitemap
sitemap.xml           Plan du site (une URL)
tools/generate-images.py  Régénère les dérivés d'image (WebP, OG, icône Apple)
assets/favicon.svg    Monogramme « AR »
assets/apple-touch-icon.png  Icône Apple (180×180)
assets/cv/            CV d'Andy (CV-Andy-Rakotondrabe.pdf)
assets/img/           Portrait optimisé (WebP + JPEG, 300 et 600 px) + carte de partage OG
sources/              Originaux haute définition — ignorés par Git, jamais déployés
```

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
- **Accessibilité** : `prefers-reduced-motion`, focus visibles, lien d'évitement,
  fermeture du menu avec `Échap`, statut de formulaire en `aria-live`.

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
1200×630 et l'icône Apple 180×180.

## Maintenance courante

Trois gestes à faire à chaque modification publiée :

1. **Versionner les assets** : incrémenter `?v=` sur `css/style.css` (et `js/main.js`
   si le script change) dans **les trois pages** — `index.html`, `404.html`,
   `confidentialite.html`. GitHub Pages sert ces fichiers avec
   `Cache-Control: max-age=600` : sans incrément, un visiteur peut conserver
   l'ancienne version jusqu'à 10 minutes.
2. **Datation** : reporter la date du jour dans `sitemap.xml` (`<lastmod>` de l'URL
   modifiée). Une date figée fait douter les moteurs de la fraîcheur du contenu.
3. **Cohérence des données structurées** : si les questions de la FAQ ou les
   prestations changent, mettre à jour le bloc JSON-LD correspondant (`FAQPage`,
   `hasOfferCatalog`). Un commentaire de rappel suit le bloc dans `index.html`.

Conventions à respecter :

- **Lien sortant** (`target="_blank"`) : toujours avec `rel="noopener"` **et**
  `<span class="sr-only"> (nouvel onglet)</span>` (RGAA 10.7).
- **Carte cliquable** : classe `.card-link` — seules ces cartes se soulèvent au survol.
- **Largeur de lecture** : `--measure` (640 px) pour tout bloc de texte long.
- **Grilles de cartes** : 6 éléments = aucune ligne incomplète, quel que soit le
  nombre de colonnes (`auto-fit`, minimum 250 px) ; d'où les cartes d'appel à l'action
  qui referment les grilles « Services » et « Réalisations ».
- **Hero** : hiérarchie de lecture figée — `.hero-subtitle` = signature de marque
  (discrète), `.hero-promise` = bénéfice client (message principal, barre d'accent),
  `.hero-tagline` = livrables, puis un seul CTA primaire (`Parlons de votre projet`)
  suivi de `.hero-reassurance` (« Réponse sous 48 h ouvrées. »). Modifier le délai de
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
- **Photo / logo** : l'en-tête conserve le monogramme « AR » ; le favicon est
  `assets/favicon.svg`.

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
- **Un seul délai annoncé** : « 48 h ouvrées » (chapeau, aide du formulaire, message de succès).
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
