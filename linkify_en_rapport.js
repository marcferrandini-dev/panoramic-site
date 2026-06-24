import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keywordsDir = path.join(__dirname, 'Keywords');

// Build a Set of all existing keyword filenames (uppercase, no extension)
const allFiles = fs.readdirSync(keywordsDir).filter(f => f.endsWith('.html'));
const existingKeywords = new Set(allFiles.map(f => f.replace(/\.html$/i, '').toUpperCase()));

console.log(`Found ${allFiles.length} keyword pages.`);

let updatedCount = 0;
let linkCount = 0;

for (const file of allFiles) {
  const filePath = path.join(keywordsDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Find the EN RAPPORT section: <font size="4">EN RAPPORT</font> followed by a <blockquote>
  // We'll use a regex that matches the blockquote immediately after the EN RAPPORT heading
  const enRapportRegex = /(EN RAPPORT[\s\S]*?<\/b><\/p>\s*<blockquote>)([\s\S]*?)(<\/blockquote>)/i;

  const match = html.match(enRapportRegex);
  if (!match) continue;

  const before = match[1];
  const inside = match[2];
  const after  = match[3];

  // Replace each <p>KEYWORD</p> inside the blockquote
  // La classe [A-Z0-9_()] reconnait aussi les mots-clés fonctionnels avec
  // parenthèses (ex: DLL_CALL5(), LEN(), STR$()...).
  const newInside = inside.replace(/<p>\s*([A-Z0-9_()]+)\s*<\/p>/gi, (full, kw) => {
    const kwUpper = kw.trim().toUpperCase();
    if (existingKeywords.has(kwUpper)) {
      linkCount++;
      return `<p><a href="./${kwUpper}.html" class="related-link">${kw.trim()}</a></p>`;
    }
    return full; // keep as-is if no page
  });

  if (newInside !== inside) {
    html = html.replace(enRapportRegex, before + newInside + after);
    fs.writeFileSync(filePath, html, 'utf8');
    updatedCount++;
  }
}

console.log(`Done! ${updatedCount} files updated, ${linkCount} links created.`);
