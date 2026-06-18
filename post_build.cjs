// Post-build script to copy download and Keywords folders into dist
const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;

  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        fs.copyFileSync(curSource, path.join(targetFolder, file));
      }
    });
  }
}

console.log('Post-build copy: Copying download/, Keywords/, and Tuto/ folders to dist/...');

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
copyFolderRecursiveSync('assets/images', 'dist/assets');

// Regenerate the sitemap (lists every page) and copy SEO files into dist
const { generateSitemap } = require('./generate_sitemap.cjs');
const sitemap = generateSitemap(__dirname);
console.log('Sitemap generated: ' + sitemap.count + ' pages.');

['sitemap.xml', 'robots.txt'].forEach(function (f) {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join('dist', f));
  }
});

console.log('Post-build copy completed successfully.');

