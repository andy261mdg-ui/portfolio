# Portfolio — Andy Rakotondrabe

Site portfolio statique (une seule page) pour promouvoir l'activité de rédaction web
d'Andy Rakotondrabe — **SEO Content Writer - Guest Blogger**.

## Ouvrir le site

Aucune installation n'est nécessaire.

1. Ouvrir le dossier `D:\portfolio`.
2. Double-cliquer sur **`index.html`** (ou clic droit → Ouvrir avec → votre navigateur).

Le site fonctionne **hors ligne** (la police « Inter » est un simple confort : en ligne elle
s'affiche, hors ligne la police système prend le relais).

## Structure

```
index.html            Page unique (toutes les sections)
css/style.css         Design (fond neutre + accent bleu)
js/main.js            Menu mobile, scrollspy, FAQ, formulaire mailto, année
assets/favicon.svg    Monogramme « AR »
assets/cv/            CV d'Andy (CV-Andy-Rakotondrabe.pdf)
assets/img/           Portrait pro (andy-rakotondrabe-pro.jpg) + original
```

## Points à compléter plus tard

- **CV** : le PDF est intégré (`assets/cv/CV-Andy-Rakotondrabe.pdf`) et lié depuis le
  Hero et la section Contact. Remplacer le fichier pour mettre le CV à jour.
- **Photo / logo** : le Hero utilise le portrait professionnel
  (`assets/img/andy-rakotondrabe-pro.jpg`) ; l'original reste conservé
  (`assets/img/andy-rakotondrabe.jpg`). L'en-tête conserve le monogramme « AR » ; le favicon
  est à mettre à jour (`assets/favicon.svg`) si vous souhaitez une icône différente.
- **Témoignages** : remplacer le bloc `<!-- PLACEHOLDER -->` de la section
  `#temoignages` par de vrais avis clients dès réception.
- **FAQ n°5** (« Comment se déroule une collaboration ? ») : texte générique à valider
  et adapter au processus réel.

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
