# MEMORY.md — Mémoire du projet

Ce fichier est rempli et mis à jour par les agents au fil du temps. Il conserve la trace des décisions importantes, des préférences de l'utilisateur, et du contexte accumulé au fil des sessions.

---

## Décisions et orientations

<!-- Les agents ajoutent ici les choix importants faits avec l'utilisateur, en datant chaque entrée -->

- **2026-06-19** — Adresse du site en ligne : `panoramic-basic.fr` (utilisée dans le sitemap, à confirmer définitivement avec l'utilisateur).
- **2026-06-19** — Casse officielle du nom du langage : **BASIC** (en majuscules) partout, y compris les pieds de page. Ne pas réintroduire « Basic ».
- **2026-06-19** — Audit complet appliqué (sauf le « plus de 740 » de l'accueil, laissé tel quel sur demande) : balises SEO canonical/Open Graph/Twitter + JSON-LD sur les pages racine, bouton « retour en haut » (injecté par `main.js`), contour clavier `:focus-visible`, navigation précédent/suivant entre les 9 parties du manuel, `<h1>` masqué (`.sr-only`) sur les pages Keywords, titres distincts + favicon sur les 14 tutoriels, mentions légales complétées (confidentialité/contact).
- **2026-06-19** — Typographie française : le deux-points est précédé d'une **espace insécable** (`&nbsp;:`). Correction appliquée sur tout le site (~2829 cas : fiches mots-clés `Type:`/`Paramètre:`/`Groupe:`, tutoriels, manuel). Sont volontairement **épargnés** car ce n'est pas du texte : exemples de code PANORAMIC (`instruction:#include`), chemins Windows (`c:\`), heures (`HH:MM`), labels cités (`« L: »`, `"L:"`). Script de détection/correction réutilisable : `scratch/check_colons.cjs` et `scratch/fix_colons.cjs`.
- **2026-06-20** — **Portabilité file:// (clé USB / double-clic, sans serveur)** gérée dans `post_build.cjs`. Principe : on ne RETIRE PAS l'attribut `type="module"` d'un module ES brut (ça ne supprime pas les `import` à l'intérieur → `SyntaxError`). À la place : (1) pages Vite → leur JS/CSS est **inliné** dans le HTML (script module *inline* + `<style>`, le module inline s'exécute en file://) ; (2) pages `Keywords/` et `Tuto/` → `assets/js/main.js` (vrai module ES qui importe highlighter→keywords) est **compilé en bundle IIFE autonome via esbuild**, puis référencé en `<script src>` classique. `theme-init.js` est inliné partout (anti-flash). ⚠️ Piège réparé : l'ancienne approche (strip global du `type=module`) cassait les ~750 pages Keywords/Tuto **même servies par un serveur**.
- **2026-06-19** — Le `sitemap.xml` est désormais généré automatiquement au build (`generate_sitemap.cjs`, appelé par `post_build.cjs`) : il liste les ~778 pages (accueil, pages principales, manuel, Tuto/, Keywords/) et est copié dans `dist/` avec `robots.txt`. Ne pas l'éditer à la main, il est régénéré à chaque build.

## Préférences utilisateur

<!-- Ce que l'utilisateur aime / n'aime pas, découvert au fil des interactions -->

- Préfère les réponses concises (pas de longs pavés)
- N'aime pas le jargon technique
- Veut des résumés de résultat, pas la liste des étapes techniques

## Travail en cours

<!-- Noter ici ce qui est en chantier, pour qu'un autre agent puisse reprendre -->

[Aucun travail en cours]

## Points de vigilance

<!-- Choses à vérifier, pièges déjà rencontrés, etc. -->

- `manuel-theme.html` est le fichier le plus sujet aux conflits : toujours vérifier l'intégrité des `<div>` après modification
- Le format `<font face="Calibri">` est obligatoire dans les pages `Keywords/` — c'est le format source attendu par les scripts de traitement
- `check_keywords.py` doit toujours passer avant de considérer un build comme valide
- Le `post_build.cjs` copie `download/` dans `dist/` — ne pas supprimer ce dossier même s'il est gitignoré
- **NE JAMAIS relancer `node style_keywords.js`** (racine). Ce script est OBSOLÈTE et DANGEREUX : il (1) double-encode l'UTF-8 des 746 pages Keywords (mojibake `Réalisations`→`RÃ©alisations`), (2) régresse le cache-busting CSS de `v=11` à `v=3`, (3) réinjecte un commentaire HTML supprimé. Les pages ont déjà leur lien `keyword-style.css?v=11` correct. Pour corriger une page Keyword existante, éditer directement le HTML — les scripts de style sont inutiles. Le workflow complet (style → linkify → copy_button) ne sert qu'à l'ajout de NOUVEAUX mots-clés, et même là `style_keywords.js` doit être évité. Découvert 2026-07-15.
- **Publication = manuelle, pas automatique.** « Pousser » (git push) sauvegarde sur GitHub mais NE publie PAS le site public. Pour mettre en ligne sur `panoramic-basic.fr`, l'utilisateur copie lui-même tout le contenu de `dist/` dans le dossier `public_html` de son hébergeur **Hostinger**. Après une modif : faire `npm run build`, puis lui rappeler de recopier `dist/` → `public_html` (et Ctrl+F5 si le changement ne s'affiche pas, cache navigateur).
- **⚠️ DEUX fichiers `keyword-style.css` — un seul est actif.** Le fichier **`Keywords/keyword-style.css`** est le VRAI source utilisé en production (référencé par `./keyword-style.css?v=N` dans les 746 pages, copié tel quel dans `dist/Keywords/`). Le fichier `assets/css/keyword-style.css` est une version **OBSOLÈTE** qui n'est PAS servie aux pages Keywords (Vite l'embarque pour les pages HTML racine, mais les pages Keywords utilisent celui de `Keywords/`). **Pour styliser le contenu des fiches mots-clés, toujours éditer `Keywords/keyword-style.css`.** Découvert 2026-07-17 après qu'une première modif de `assets/css/keyword-style.css` n'a eu aucun effet visible.
- **Piège HTML5 dans les fiches mots-clés : `<p><b><ul>`.** Le HTML source `<p><b><ul><li>...</ul></b></p>` est invalide (un `<ul>` ne peut pas être dans un `<p>`). Le navigateur ré-imbrique en `<p></p><b></b><ul><b><li>...` : le `<ul>` devient enfant direct de `<font>` (repoussé hors du `<p>`), mais un nouveau `<b>` est **créé à l'intérieur du `<ul>`** et contient les `<li>`. Conséquence : un `gap` déclaré sur le `<ul>` n'a **aucun effet** car le `<ul>` n'a qu'un seul enfant flex (le `<b>` intercalaire). Pour appliquer un écart réel entre les badges Type/Paramètre/Groupe, il faut cibler `.keyword-page > font > ul:first-of-type > b` (le `<b>` intérieur) et le rendre `flex`. Découvert 2026-07-17.
- **Cache-busting `keyword-style.css?v=N`** : obligatoire à chaque modif du CSS des fiches mots-clés. Bump incrémental (v=11→12→13...) sur les 746 pages `Keywords/*.html` via script Node, sinon le navigateur garde l'ancien CSS en cache. En juillet 2026 on est à v=13.
