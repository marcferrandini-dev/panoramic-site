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

Un raccourci est disponible sur le bureau Windows (`PANORAMIC - Site.bat`) : double-clic pour lancer le serveur et ouvrir le site automatiquement.

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
├── Keywords/                # 746 pages HTML, une par mot-clé (ex: BUTTON.html, SCENE3D.html)
├── Tuto/                    # 14 tutoriels HTML + images (TUTOPICT/) + sources (Sources/)
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
├── vite.config.js           # Config Vite multi-pages (18 entrées HTML, base: './')
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
2. Lancer `node scratch/inject_keywords_shell.cjs` puis `node style_keywords.js` puis `node linkify_en_rapport.js` puis `node inject_copy_button.js`
3. Mettre à jour `liste_mots_cles.txt`
4. Lancer les scripts `extract_*.py` puis `merge_*.py` pour injecter dans `manuel-theme.html`
5. Relancer `node scratch/generate_panoramic_keywords.cjs` pour le surligneur
6. Vérifier avec `python check_keywords.py`
7. `npm run build` pour valider le build

## Build obligatoire après modification

**Après toute modification du site, tu lances `npm run build`** pour vérifier que le build passe sans erreur. Si le build échoue, corrige le problème avant de commiter.

Cela garantit que la version de production dans `dist/` reste toujours fonctionnelle.

## À propos de l'utilisateur principal

L'utilisateur principal est le **créateur du langage PANORAMIC**. C'est un expert métier qui connaît parfaitement son langage et sa documentation, mais **ce n'est pas un développeur web**. Il ne connaît pas :
- Git, Node.js, npm, Vite, CSS, JavaScript
- Les workflows techniques (build, commit, push, extraction)
- Le jargon du développement web

En revanche, il comprend très bien le contenu : les mots-clés, la syntaxe du langage, les rubriques thématiques, la logique des tutoriels.

## Communication avec l'utilisateur

- **Pas de jargon technique** : expliquer avec des mots simples, comme on parlerait à quelqu'un qui ne fait pas d'informatique.
- **Être concis** : aller droit au but, ne pas noyer l'information.
- **Rassurer** : confirmer que tout va bien, ou expliquer calmement ce qui ne va pas et comment on le résout.
- **Ne pas poser de questions techniques** : ne pas demander "tu veux que je commit ?" ou "je fais npm run build ?" — tu le fais, point.
- **Traduire les demandes en actions** : si l'utilisateur dit un truc vague comme "faudrait mettre ça sur le site", tu analyses, tu proposes une solution concrète en une phrase, et tu agis.
- **Résumer le résultat, pas les étapes** : dire "c'est fait, le mot-clé est en ligne" plutôt que lister les 7 scripts qui ont tourné.

## Comportement proactif face à l'utilisateur

- **Prendre des initiatives** : ne pas attendre qu'il donne des instructions techniques. S'il dit "je veux ajouter le mot-clé TOTO dans la rubrique Maths", tu fais tout le pipeline sans rien demander.
- **Détecter le besoin réel** : s'il dit "le site est cassé", tu inspectes, tu trouves le problème, tu répares. Pas de questionnaire.
- **Toujours finir par `npm run build`** : pour que le site soit prêt à être consulté.
- **Ne pas demander de validation sur le code** (ex: "est-ce que ça te convient ?") — il ne sait pas juger le code. Si ça marche et que le build passe, c'est bon. En revanche, pour un choix éditorial, une question simple et fermée est OK.
- **Si tu n'es pas sûr d'un choix éditorial** (ex: dans quelle rubrique classer un mot-clé), tu poses une question simple et fermée : "Je le mets dans la rubrique Graphisme 2D ou Objets Système ?"

## Scénarios fréquents

### Ajout d'un nouveau mot-clé
1. Créer `Keywords/MOTCLE.html` avec le format legacy `<font face="Calibri">`
2. Lancer toute la chaîne de traitement (shell → style → linkify → copy button)
3. Mettre à jour `liste_mots_cles.txt`
4. Lancer les extractions Python et le merge dans `manuel-theme.html`
5. Régénérer le surligneur (`generate_panoramic_keywords.cjs`)
6. Vérifier la cohérence (`check_keywords.py`)
7. `npm run build` puis commit + push
8. Résumer en une phrase simple : "Le mot-clé XXXXX est en ligne."

### Correction d'un mot-clé existant
1. Modifier le fichier `Keywords/MOTCLE.html`
2. Relancer extraction + merge si la signature ou description a changé
3. `npm run build` puis commit + push
4. Annoncer "Correction faite."

### Modification d'une page du site (accueil, téléchargements, etc.)
1. Modifier le `.html` concerné
2. `npm run build` puis commit + push
3. Annoncer le résultat simplement

### Ajout d'un tutoriel
1. Créer le fichier dans `Tuto/` en utilisant la structure d'un tutoriel existant comme modèle
2. Ajouter les images dans `Tuto/TUTOPICT/` si nécessaire
3. Mettre à jour `tutoriels.html` pour référencer le nouveau tutoriel
4. `npm run build` puis commit + push

## Pièges à éviter

- **Ne pas demander** "tu veux que je fasse un commit ?" — tu le fais automatiquement.
- **Ne pas expliquer** ce qu'est Vite, le DOM, ou le CSS — ça n'intéresse pas l'utilisateur.
- **Ne pas montrer** les diffs git ou les logs de build — il ne les comprend pas.
- **Ne pas proposer** de branches, de PR, ou de workflows Git complexes — on reste sur main.
- **Ne pas modifier** le design ou la mise en page sans qu'on te le demande explicitement.
- **Ne pas supprimer** de fichiers sans certitude qu'ils sont inutiles — toujours vérifier d'abord.
- **Ne pas réinventer** la structure des pages — toujours prendre une page existante comme modèle.

## Versionnage Git (OBLIGATOIRE — NE PAS DEMANDER)

**Tu gères le versionnage de façon autonome et proactive.**

- **Commiter chaque modification significative** avec un message clair en français décrivant le changement.
- **Pas de commit après chaque micro-édition** : grouper les changements cohérents en un seul commit.
- **Push automatique** après chaque commit ou série de commits validés.
- **Rester sur `main`** — pas de branches sauf demande explicite.
- **Avant de commiter**, vérifier avec `git status` qu'on ne commit que les fichiers pertinents (pas de fichiers temporaires, pas de `dist/`, pas de `node_modules/`).
- **Format des messages de commit** : une ligne en français, descriptif, commençant par le domaine (ex: "Rubrique Mathématiques : ajout 3 mots-clés ADR1/ADR2/ADR3").

Le `.gitignore` est déjà configuré pour exclure `node_modules/`, `dist/`, `download/`, `scratch/`, `Keywords_old/`, `Divers/`, `*.py` d'extraction, `*_formatted.txt` et autres fichiers temporaires.

## MEMORY.md — Mémoire partagée

Un fichier `MEMORY.md` existe à la racine. **Tu le lis au début de chaque session** pour connaître le contexte accumulé. **Tu le mets à jour** quand :
- L'utilisateur exprime une préférence ou une habitude
- Une décision importante est prise (ex: "on met ce mot-clé dans la rubrique Graphisme 2D plutôt que Maths")
- Un point de vigilance est découvert (ex: "attention, tel fichier est fragile")
- Un travail est en cours et n'est pas terminé

Ce fichier garantit la continuité entre sessions et entre agents.

**Règle absolue** : si `MEMORY.md` dépasse 200 lignes, tu **dois** le compacter immédiatement. Fusionne les entrées redondantes, supprime les informations obsolètes, résume sans perdre l'essentiel. Le contexte doit rester dense et utile, pas devenir un journal interminable.
