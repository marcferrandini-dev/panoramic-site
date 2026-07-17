// Post-build script to copy download and Keywords folders into dist
const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target, exclude) {
  if (!fs.existsSync(source)) return;
  exclude = exclude || [];

  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(function (file) {
      if (exclude.indexOf(file) !== -1) return;
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder, exclude);
      } else {
        fs.copyFileSync(curSource, path.join(targetFolder, file));
      }
    });
  }
}

console.log('Post-build: Copying static folders...');

// Ensure dist exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Régénérer l'index des mots-clés (assets/data/keywords-data.js) utilisé par
// l'Assistant. À faire AVANT la copie des assets vers dist/.
console.log('Post-build: Building keywords data index...');
require('child_process').execSync('node scratch/build_keywords_index.cjs', { stdio: 'inherit' });

// Copy folders
copyFolderRecursiveSync('download', 'dist');
copyFolderRecursiveSync('Keywords', 'dist');
copyFolderRecursiveSync('Tuto', 'dist');

// Copy assets subfolders for unbundled static files
if (!fs.existsSync('dist/assets')) {
  fs.mkdirSync('dist/assets', { recursive: true });
}
copyFolderRecursiveSync('assets/css', 'dist/assets');
copyFolderRecursiveSync('assets/js', 'dist/assets');
// assets/data/ contient keywords-data.js (liste des 746 mots-clés pour l'Assistant).
// Fichier JS classique (window.X), pas un module ES -> chargeable en file://.
copyFolderRecursiveSync('assets/data', 'dist/assets');
// 'realisations' est exclu : ces images sont déjà optimisées/copiées par le build
// (versions hashées dans dist/assets/). Les recopier en clair ferait un doublon de ~27 Mo.
copyFolderRecursiveSync('assets/images', 'dist/assets', ['realisations']);

// ---------------------------------------------------------------------------
// PORTABILITE file:// — rendre le site ouvrable hors serveur (clé USB, double-clic)
// ---------------------------------------------------------------------------
// Les modules ES (<script type="module" src=...>) ne se chargent PAS en file://
// (le navigateur bloque la requête pour cause de CORS). Deux familles de pages :
//
//  1. Pages Vite (index, manuel-*, faq, programmes...) : leur JS/CSS est inliné
//     dans le HTML (script module inline + <style>), donc plus aucune requête
//     externe -> fonctionne en file://. (cf. vite-plugin-singlefile, fait main ici)
//
//  2. Pages Keywords/* et Tuto/* : elles chargent assets/js/main.js, qui est un
//     VRAI module ES (import ... highlighter -> keywords). On le compile d'abord
//     en un bundle IIFE autonome (esbuild, sans aucun import), puis on retire
//     l'attribut type="module" -> script classique externe qui marche en file://.

// (2) Compiler assets/js/main.js (+ ses imports) en un seul bundle IIFE classique.
console.log('Post-build: Bundling assets/js/main.js -> IIFE (esbuild)...');
const esbuild = require('esbuild');
esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'assets/js/main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  outfile: path.join(__dirname, 'dist/assets/js/main.js'),
});

// Compiler assets/js/assistant.js en bundle IIFE pour la page Assistant.
// C'est un module ES qui écoute DOMContentLoaded -> doit devenir un script
// classique pour fonctionner en file:// (même raison que main.js).
console.log('Post-build: Bundling assets/js/assistant.js -> IIFE (esbuild)...');
esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'assets/js/assistant.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  outfile: path.join(__dirname, 'dist/assets/js/assistant.js'),
});
// Les sources des modules importés sont maintenant fusionnées dans main.js :
// on supprime leurs copies brutes (inutiles et non chargeables en file://).
['panoramic-highlighter.js', 'panoramic-keywords.js'].forEach(function (f) {
  var p = path.join(__dirname, 'dist/assets/js', f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

// theme-init.js est minuscule et doit s'exécuter avant le rendu (anti-flash) :
// on l'inline tel quel (script classique) sur toutes les pages.
const themeInit = fs.readFileSync(path.join(__dirname, 'assets/js/theme-init.js'), 'utf8');

console.log('Post-build: Inlining Vite assets + neutralizing module scripts...');
(function processHtml(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processHtml(full);
      return;
    }
    if (!entry.name.endsWith('.html')) return;

    var html = fs.readFileSync(full, 'utf8');
    var fileDir = path.dirname(full);
    var original = html;

    // (1a) Inliner le JS Vite (signature : attribut crossorigin) en module inline.
    //      Un module INLINE s'exécute bien en file:// (aucune requête réseau).
    html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, function (m, src) {
      var jsPath = path.join(fileDir, src);
      if (!fs.existsSync(jsPath)) return m;
      return '<script type="module">\n' + fs.readFileSync(jsPath, 'utf8') + '\n</script>';
    });

    // (1b) Inliner le CSS Vite (crossorigin) en <style>.
    html = html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, function (m, href) {
      var cssPath = path.join(fileDir, href);
      if (!fs.existsSync(cssPath)) return m;
      return '<style>\n' + fs.readFileSync(cssPath, 'utf8') + '\n</style>';
    });

    // (1c) Supprimer les preloads de modules (inutiles une fois tout inliné).
    html = html.replace(/[ \t]*<link rel="modulepreload"[^>]*>\n?/g, '');

    // (1d) Inliner theme-init.js (toutes pages, chemins ./ ou ../).
    html = html.replace(/<script src="[^"]*assets\/js\/theme-init\.js"><\/script>/g,
      '<script>\n' + themeInit + '\n</script>');

    // (2) Pages Keywords/Tuto : retirer type="module" du script main.js (désormais
    //     un bundle IIFE classique) pour qu'il se charge en file://.
    html = html.replace(/<script type="module" src="([^"]+)"><\/script>/g, '<script src="$1"></script>');

    if (html !== original) fs.writeFileSync(full, html, 'utf8');
  });
})('dist');

// Regenerate the sitemap (lists every page) and copy SEO files into dist
const { generateSitemap } = require('./generate_sitemap.cjs');
const sitemap = generateSitemap(__dirname);
console.log('Sitemap generated: ' + sitemap.count + ' pages.');

['sitemap.xml', 'robots.txt', '.htaccess'].forEach(function (f) {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join('dist', f));
  }
});

console.log('Post-build completed.');

