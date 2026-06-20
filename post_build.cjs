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
// 'realisations' est exclu : ces images sont déjà optimisées/copiées par le build
// (versions hashées dans dist/assets/). Les recopier en clair ferait un doublon de ~27 Mo.
copyFolderRecursiveSync('assets/images', 'dist/assets', ['realisations']);

// Remove type="module" from script tags so the site works when opened from disk (file://)
console.log('Post-build: Stripping type="module" from script tags...');
(function stripModuleScripts(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      stripModuleScripts(full);
    } else if (entry.name.endsWith('.html')) {
      var html = fs.readFileSync(full, 'utf8');
      var modified = html.replace(/<script\s+type="module"\s+(?:crossorigin\s+)?src=/g, '<script src=');
      if (modified !== html) {
        fs.writeFileSync(full, modified, 'utf8');
      }
    }
  });
})('dist');

// Regenerate the sitemap (lists every page) and copy SEO files into dist
const { generateSitemap } = require('./generate_sitemap.cjs');
const sitemap = generateSitemap(__dirname);
console.log('Sitemap generated: ' + sitemap.count + ' pages.');

['sitemap.xml', 'robots.txt'].forEach(function (f) {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join('dist', f));
  }
});

console.log('Post-build completed.');

