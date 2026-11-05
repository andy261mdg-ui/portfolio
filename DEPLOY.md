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
- Le formulaire de contact est un **`mailto`** : il ouvre le logiciel de messagerie du
  visiteur, sans serveur ni service externe.
- Pensez à envoyer aussi `assets/` (CV PDF et photos) : ils font partie du site.
