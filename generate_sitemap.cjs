// Génère sitemap.xml en listant automatiquement toutes les pages du site.
// Lancé automatiquement au build via post_build.cjs.
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://panoramic-basic.fr';

// Pages principales à la racine (l'accueil est couvert par "/").
const ROOT_PAGES = [
  'documentation.html',
  'tutoriels.html',
  'faq.html',
  'programmes.html',
  'telechargements.html',
  'mentions-legales.html',
  'manuel-a-z.html',
  'manuel-theme.html',
  'manuel-partie-1.html',
  'manuel-partie-2.html',
  'manuel-partie-3.html',
  'manuel-partie-4.html',
  'manuel-partie-5.html',
  'manuel-partie-6.html',
  'manuel-partie-7.html',
  'manuel-partie-8.html',
  'manuel-partie-9.html'
];

function lastmod(file) {
  try {
    return fs.statSync(file).mtime.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .filter((f) => !f.includes('%')) // ignore les doublons encodés (ex: %23INCLUDE.html)
    .sort();
}

function urlEntry(loc, mod, priority) {
  return `<url>\n  <loc>${loc}</loc>\n  <lastmod>${mod}</lastmod>\n  <priority>${priority}</priority>\n</url>`;
}

function generateSitemap(root) {
  root = root || __dirname;
  const entries = [];

  // Accueil
  entries.push(urlEntry(`${BASE_URL}/`, lastmod(path.join(root, 'index.html')), '1.0'));

  // Pages principales
  ROOT_PAGES.forEach((p) => {
    const file = path.join(root, p);
    if (fs.existsSync(file)) {
      const prio = p.startsWith('manuel') ? '0.7' : '0.8';
      entries.push(urlEntry(`${BASE_URL}/${p}`, lastmod(file), prio));
    }
  });

  // Tutoriels détaillés
  listHtml(path.join(root, 'Tuto')).forEach((f) => {
    const loc = `${BASE_URL}/Tuto/${encodeURIComponent(f)}`;
    entries.push(urlEntry(loc, lastmod(path.join(root, 'Tuto', f)), '0.6'));
  });

  // Pages de mots-clés
  listHtml(path.join(root, 'Keywords')).forEach((f) => {
    const loc = `${BASE_URL}/Keywords/${encodeURIComponent(f)}`;
    entries.push(urlEntry(loc, lastmod(path.join(root, 'Keywords', f)), '0.5'));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const outPath = path.join(root, 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  return { count: entries.length, outPath };
}

if (require.main === module) {
  const res = generateSitemap();
  console.log(`Sitemap généré : ${res.count} pages -> ${res.outPath}`);
}

module.exports = { generateSitemap };
