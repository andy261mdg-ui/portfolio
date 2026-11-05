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
js/main.js            Menu mobile, scrollspy, FAQ, formulaire mailto, copie de l'email, année
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

Formulaire : ouvre le logiciel de messagerie du visiteur avec un message pré-rempli vers
**andy261mdg@gmail.com** (aucun serveur, aucun service externe).

## Déploiement

Le site est 100 % statique : aucun build. Guide détaillé pour **GitHub Pages** dans
[DEPLOY.md](DEPLOY.md).

En résumé :

1. Créer un dépôt GitHub public.
2. `git remote add origin https://github.com/<pseudo>/portfolio.git` puis `git push -u origin main`.
3. Settings → Pages → Source « Deploy from a branch » → `main` / `/ (root)`.

Le fichier `.nojekyll` est inclus pour que GitHub serve le site tel quel.
