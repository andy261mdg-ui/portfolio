# Déploiement sur GitHub Pages

Ce site est **100 % statique** : aucun build, aucune dépendance, aucune base de données.
Il suffit d'envoyer les fichiers tels quels.

## 1. Créer le dépôt GitHub

1. Ouvrir <https://github.com> et se connecter (créer un compte si besoin).
2. Cliquer sur **New repository**.
3. **Repository name** : `portfolio` (ou `<votre-pseudo>.github.io` pour une adresse à la racine).
4. Visibilité : **Public** (obligatoire pour Pages en compte gratuit).
5. Ne pas cocher « Add a README file » ni « Add .gitignore » : le dépôt local les contient déjà.
6. Cliquer sur **Create repository**.

## 2. Envoyer le site depuis votre PC

Ouvrir un terminal dans `D:\portfolio` puis :

```bash
git remote add origin https://github.com/<VOTRE_PSEUDO>/portfolio.git
git push -u origin main
```

Remplacez `<VOTRE_PSEUDO>` par votre nom d'utilisateur GitHub.

> Si Git demande un mot de passe, saisissez un **Personal Access Token**
> (GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
> tokens) ou laissez **Git Credential Manager** gérer la connexion.

## 3. Activer GitHub Pages

1. Dans le dépôt : **Settings** → **Pages**.
2. Sous « Build and deployment » → **Source** : **Deploy from a branch**.
3. **Branch** : `main` · **Folder** : `/ (root)`.
4. Cliquer sur **Save**.

## 4. Résultat

Après 1 à 2 minutes, le site est en ligne :

- Dépôt `portfolio` → `https://<votre-pseudo>.github.io/portfolio/`
- Dépôt `<votre-pseudo>.github.io` → `https://<votre-pseudo>.github.io/`

## Mise à jour du site

```bash
git add .
git commit -m "Mise à jour du site"
git push
```

GitHub Pages republie automatiquement à chaque `push`.

## Domaine personnalisé (facultatif)

1. **Settings** → **Pages** → **Custom domain** : saisir votre domaine (ex. `andyrakotondrabe.com`).
2. Chez votre registrar, créer un enregistrement **CNAME** vers `<votre-pseudo>.github.io`
   (ou des enregistrements **A** vers les IP de GitHub Pages).
3. Cocher **Enforce HTTPS** une fois le domaine vérifié.

## Remarques

- Le fichier **`.nojekyll`** est inclus : GitHub sert les fichiers tels quels (sans Jekyll).
- Tous les liens sont **relatifs** : le site fonctionne aussi dans un sous-dossier (`/portfolio/`).
- Le formulaire de contact envoie les messages **directement vers andy261mdg@gmail.com**
  via **Formspree** (service externe, 50 envois/mois au niveau gratuit) — endpoint déjà
  configuré dans `index.html` (attribut `action` du formulaire), voir la section
  « Contact » du [README](README.md). En cas d'échec d'envoi (quota, réseau), le site
  bascule automatiquement sur un lien `mailto` pré-rempli : aucun message n'est perdu.
- Tout fichier versionné (pages, `assets/`, `css/`, `js/`, `tools/`) part avec
  `git push` — rien à envoyer à la main. Seul `sources/` (originaux haute
  définition) est ignoré par Git : il n'est jamais publié.

## Référencement après mise en ligne

1. Vérifier que `https://<votre-pseudo>.github.io/portfolio/robots.txt` et
   `.../sitemap.xml` sont accessibles.
2. Si vous utilisez un **domaine personnalisé**, remplacer les URL absolues dans
   `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD),
   `robots.txt` et `sitemap.xml`.
3. **Google Search Console** (propriété par URL : `https://andy261mdg-ui.github.io/portfolio/`) :
   Paramètres → Propriété → Vérification de la propriété → méthode **« Balise HTML »** ;
   copier le jeton fourni par Google et l'insérer dans le `<head>` d'`index.html` :
   `<meta name="google-site-verification" content="VOTRE_JETON">` (une seule ligne,
   aucune ressource tierce chargée). Après déploiement, cliquer sur « Vérifier » dans
   l'outil, puis soumettre `sitemap.xml`.
4. **Bing Webmaster Tools** : importer la vérification depuis la Search Console
   (pas de balise `msvalidate.01` supplémentaire), puis soumettre le sitemap.
5. Tester la carte de partage (LinkedIn Post Inspector, opengraph.xyz) après le premier
   déploiement.

