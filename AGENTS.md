# AGENTS.md — Site PANORAMIC

Site statique de documentation du langage de programmation PANORAMIC.

## Stack

- **Vite 6** (build/bundler, config ESM `vite.config.js`)
- **HTML/CSS/JS vanilla** — aucun framework
- **Node.js** (scripts de maintenance en `.cjs` et `.js`)
- **Python 3** (scripts d'extraction de mots-clés)

## Commandes

```bash
npm install          # installer les dépendances
npm run dev          # serveur de dev → http://localhost:5173
npm run build        # build production → dist/
npm run preview      # prévisualiser le build → http://localhost:4173
```

Le build exécute `vite build` puis `post_build.cjs` qui copie `Keywords/`, `Tuto/`, `download/`, et `assets/` statiques dans `dist/`.

## Structure

```
site_2/
├── index.html              # Accueil
├── documentation.html       # Hub documentation
├── manuel-a-z.html          # Index alphabétique des 746 instructions
├── manuel-theme.html        # Manuel par catégories thématiques
├── manuel-partie-1..9.html  # Manuel de référence découpé en 9 chapitres
├── tutoriels.html           # Hub des tutoriels
├── faq.html                 # FAQ avec accordéon et onglets
├── programmes.html          # Galerie de réalisations (330+ programmes)
├── telechargements.html     # Téléchargements des exécutables
├── mentions-legales.html    # Mentions légales
├── Keywords/                # 748 pages HTML, une par mot-clé (ex: BUTTON.html, SCENE3D.html)
├── Tuto/                    # 15 tutoriels HTML + images (TUTOPICT/) + sources (Sources/)
├── assets/
│   ├── css/                 # style.css (global), keyword-style.css (pages mots-clés)
│   ├── js/                  # main.js, theme-init.js, panoramic-highlighter.js, panoramic-keywords.js
│   ├── images/              # Logo, captures, realisations/
│   └── partials/            # header-keywords.html, footer-keywords.html (shell injection)
├── download/                # Exécutables (gitignoré, copié dans dist/ au build)
├── scratch/                 # Scripts utilitaires de migration/maintenance (gitignoré)
├── Divers/                  # Anciennes versions/pages (gitignoré)
├── liste_mots_cles.txt      # Liste maîtresse des 746 mots-clés
├── check_keywords.py        # Vérifie la cohérence liste ↔ manuels HTML
├── extract_*.py             # Extraction de signatures/déscriptions depuis Keywords/
├── *.js (racine)            # Scripts Node.js de maintenance des pages Keywords/
├── vite.config.js           # Config Vite multi-pages (17 entrées HTML, base: './')
└── post_build.cjs           # Post-build : copie des dossiers statiques dans dist/
```

## Conventions

- **Langue** : tout le contenu est en français.
- **CSS** : variables `:root` / `[data-theme="light"]` (dark/light), classes en kebab-case (`.glass-card`).
- **JS** : camelCase, modules ES (`type="module"`).
- **Pages racine** : chaque page a un `<header>` (logo + nav 7 liens + toggle thème), `<main>`, `<footer>` (3 colonnes).
- **Pages Keywords/** : shell injecté via `assets/partials/`, contenu legacy en `<font face="Calibri">` retravaillé par `keyword-style.css`.
- **Liens relatifs** : `./` depuis la racine, `../` depuis `Keywords/` et `Tuto/`. Vite configuré avec `base: './'` pour usage hors-ligne.
- **Pas de commentaires** dans le code HTML/CSS/JS sauf nécessité absolue.

## Workflow d'ajout de mots-clés

1. Ajouter le fichier `Keywords/MOTCLE.html` (format legacy avec `<font face="Calibri">`)
2. Lanceer `node inject_keywords_shell.js` puis `node style_keywords.js` puis `node linkify_en_rapport.js` puis `node inject_copy_button.js`
3. Mettre à jour `liste_mots_cles.txt`
4. Lancer les scripts `extract_*.py` puis `merge_*.py` pour injecter dans `manuel-theme.html`
5. Relancer `node scratch/generate_panoramic_keywords.cjs` pour le surligneur
6. Vérifier avec `python check_keywords.py`
7. `npm run build` pour valider le build

## Versionnage Git (OBLIGATOIRE — NE PAS DEMANDER)

**Tu gères le versionnage de façon autonome et proactive.**

- **Commiter chaque modification significative** avec un message clair en français décrivant le changement.
- **Pas de commit après chaque micro-édition** : grouper les changements cohérents en un seul commit.
- **Push automatique** après chaque commit ou série de commits validés.
- **Rester sur `main`** — pas de branches sauf demande explicite.
- **Avant de commiter**, vérifier avec `git status` qu'on ne commit que les fichiers pertinents (pas de fichiers temporaires, pas de `dist/`, pas de `node_modules/`).
- **Format des messages de commit** : une ligne en français, descriptif, commençant par le domaine (ex: "Rubrique Mathématiques : ajout 3 mots-clés ADR1/ADR2/ADR3").

Le `.gitignore` est déjà configuré pour exclure `node_modules/`, `dist/`, `download/`, `scratch/`, `Keywords_old/`, `Divers/`, `*.py` d'extraction, `*_formatted.txt` et autres fichiers temporaires.
