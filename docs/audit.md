# Registre d'audit — accessibilité et qualité

| | |
|---|---|
| **Périmètre** | `index.html`, `confidentialite.html`, `404.html` (3 pages) |
| **Référentiel** | RGAA 4.1 / WCAG 2.1 niveau AA |
| **Date** | 6 novembre 2026 |
| **Méthode** | tests automatisés (axe-core, Playwright), vérifications ciblées, mesures de contraste calculées, parcours clavier |

## 1. Ce qui est vérifié automatiquement

La suite tourne à chaque `push` (voir `.github/workflows/qa.yml`) et en local (`npm test`) :
58 tests sur deux profils (1366×900 et 390×844).

| Fichier | Couverture |
|---|---|
| `tests/a11y.spec.js` | axe-core, règles WCAG 2.0/2.1 A et AA, sur les trois pages — seuil : **0 violation sérieuse ou critique** |
| `tests/contact.spec.js` | contrôle de saisie : messages, `aria-describedby`, `aria-invalid`, focus, `role="status"` |
| `tests/links.spec.js` | intitulés de liens, `rel="noopener"`, ancres, alternatives des images, identifiants uniques |
| `tests/regression.spec.js` | navigation clavier (menu : `Échap`, clic extérieur, sortie de focus), FAQ, scrollspy + `aria-current`, taille de texte 200 %, mise en page |

## 2. Registre des points de contrôle

| Réf. | Exigence | Statut | Preuve |
|---|---|---|---|
| 1.1 / 1.3 | Images porteuses d'information : alternative pertinente ; décoratives : `alt=""` | Conforme | `tests/links.spec.js` (alt + dimensions), portrait `alt="Portrait d'Andy Rakotondrabe"` |
| 3.1 / 3.2 | Contrastes texte / fond ≥ 4,5:1 (ou 3:1 en grand corps) | Conforme | mesures §3 |
| 3.3 | L'information n'est pas donnée par la couleur seule | Conforme | erreurs de formulaire : texte + bordure + `aria-invalid` ; focus : anneau distinct de la bordure d'erreur ; section courante de la nav : couleur **et** soulignement 2 px |
| 6.1 / 6.2 | Intitulés de liens explicites, contextuels | Conforme | `tests/links.spec.js` |
| 7.1 / 7.3 | Scripts compatibles avec les technologies d'assistance ; pas d'alternative obligatoire | Conforme | `form.noValidate` posé par JS uniquement → validation native sans JS |
| 8.3 / 8.4 | `lang` déclaré, titre de page pertinent | Conforme | `tests/a11y.spec.js` |
| 9.x | Structure : titres hiérarchisés, régions (`header`/`main`/`footer`), lien d'évitement | Conforme | audit axe (règles `region`, `heading-order`) |
| 10.7 | Ouverture d'un nouvel onglet annoncée | Conforme | 14/14 liens externes : `rel="noopener"` + `<span class="sr-only"> (nouvel onglet)</span>` |
| 11.1 / 11.2 | Champs étiquetés, aide à la saisie | Conforme | `label for` sur les 4 champs + `aria-describedby` vers aide et message |
| 11.10 | Contrôle de saisie : messages explicites, focus, annonce | Conforme | `tests/contact.spec.js` (4 tests dédiés) |
| 11.11 | Aide à la correction des erreurs | Conforme | messages rédigés (« Indiquez votre adresse email valide, par exemple nom@domaine.fr ») |
| 12.x | Navigation cohérente, menu accessible au clavier | Conforme | `tests/regression.spec.js` (menu mobile : `Échap` → focus rendu au bouton, clic extérieur, tabulation hors navigation) |
| 13.x | Ordre de lecture et de tabulation cohérent | Conforme | ordre DOM = ordre visuel ; photo du hero en `order: -1` seulement en mobile |
| WCAG 1.4.1 | Section courante signalée hors couleur (lecteur d'écran) | Conforme | scrollspy pose `aria-current="location"` sur un seul lien ; assertion dans `tests/regression.spec.js` |
| WCAG 1.4.4 | Texte agrandi jusqu'à 200 % sans perte ni débordement horizontal | Conforme | `tests/regression.spec.js` (dédié) ; en-tête en `min-height`, navigation sur deux lignes, mots non coupables (`overflow-wrap: anywhere`) ; vérifié de 320 à 1366 px |
| WCAG 2.5.3 | Libellé visible contenu dans le nom accessible | **Corrigé** | monogramme « AR » rendu décoratif (CSS `::before`), nom accessible = « Andy Rakotondrabe — accueil » |
| WCAG 2.2.2 | Mouvement : respect de `prefers-reduced-motion` | Conforme | `scroll-behavior: auto` + transitions FAQ neutralisées |

## 3. Contrastes mesurés

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| `#0f172a` (texte courant) | `#ffffff` | 17,9:1 | AAA |
| `#5f6e84` (texte secondaire) | `#ffffff` | 5,19:1 | AA |
| `#5f6e84` (texte secondaire) | `#f6f8fb` (sections teintées) | 4,87:1 | AA |
| `#2563eb` (accent, eyebrows) | `#ffffff` | 5,17:1 | AA |
| `#ffffff` sur bouton | `#2563eb` | 5,17:1 | AA |
| `#b91c1c` (messages d'erreur) | `#ffffff` | 6,51:1 | AA |

## 4. Performance mesurée

Voir `docs/performance.json` (mesure Chrome, viewport 1366×900, cache vidé).

| Indicateur | Avant (Google Fonts) | Après (police auto-hébergée) |
|---|---|---|
| FCP | 3 356 ms | **1 440 ms** |
| LCP | 3 356 ms | **1 440 ms** |
| CLS | 0,015 | 0,015 |
| TTFB | 629 ms | 536 ms |
| Transféré | 8 Ko HTML + 21 Ko de ressources | 8 Ko + 68 Ko (police incluse) |
| Requêtes tierces | 2 (`fonts.googleapis.com`, `fonts.gstatic.com`) | **0** |

Le LCP passe de « à améliorer » (> 2 500 ms) à « bon » (< 2 500 ms). L'ajout de 47 Ko de police
locale est largement compensé par la suppression de 950 ms d'attente bloquante.

Cause identifiée : la feuille de style Google Fonts était **bloquante sur le chemin critique**
(949 ms mesurés, seule ressource externe du site). La police Inter est désormais auto-hébergée
(woff2 variable, 47 Ko, `preload`), ce qui supprime la requête tierce et la transmission
d'adresse IP à Google (politique de confidentialité mise à jour en conséquence).

Reproduire la mesure : `npm run vitals` (met à jour `docs/performance.json`).

## 5. Limites connues (à lever manuellement)

1. **Lecteur d'écran non testé par un humain.** Les vérifications portent sur le DOM et sur
   axe-core, pas sur l'expérience NVDA / JAWS / VoiceOver. Un passage manuel reste nécessaire
   pour valider l'annonce du formulaire et du bouton « Copier l'adresse ».
2. **Envoi réel du formulaire non exécuté** (quota Formspree + boîte du propriétaire) : le
   chemin de succès est testé avec l'endpoint intercepté. Un seul envoi réel suffira à le confirmer.
3. **axe-core ne couvre qu'une partie des critères** (de l'ordre de 30 à 40 % des critères
   automatisables) : l'absence de violation ne vaut pas conformité totale.
4. **Pas de mesure d'audience** : aucune donnée de conversion ni de comportement visiteur.
5. **Lighthouse via API PageSpeed** : quota `429` sans clé ; utiliser `PSI_KEY=... npm run audit`.

## 6. Règle de maintenance

Tout défaut corrigé doit être **verrouillé par un test** dans `tests/` avant le commit — sinon
il revient. Les versions d'assets (`?v=`) sont contrôlées par `npm run guard`, exécuté aussi en CI.
