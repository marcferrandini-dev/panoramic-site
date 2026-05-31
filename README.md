# Site PANORAMIC

Site statique de documentation et de présentation du langage de programmation [PANORAMIC](https://panoramic.1fr1.net/).

## Développement

```bash
npm install
npm run dev
```

Le site est servi sur http://localhost:5173/

## Build

```bash
npm run build
npm run preview
```

Le build Vite produit le dossier `dist/`, enrichi par `post_build.cjs` (copie de `Keywords/`, `Tuto/` et `download/`).

## Structure

- Pages principales : `index.html`, `documentation.html`, manuels, FAQ, tutoriels…
- `Keywords/` : documentation A-Z des mots-clés du langage
- `Tuto/` : tutoriels
- `assets/` : CSS, JS, images
