import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keywordsDir = path.join(__dirname, 'Keywords');

if (!fs.existsSync(keywordsDir)) {
  console.error('Error: Keywords/ directory not found in ' + __dirname);
  process.exit(1);
}

const files = fs.readdirSync(keywordsDir).filter(file => file.endsWith('.html'));
console.log(`Found ${files.length} HTML files to update stylesheet link with cache-busting...`);

const decoder = new TextDecoder('windows-1252');
let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(keywordsDir, file);
  
  // Try reading as UTF-8 first (already converted), fallback to windows-1252
  let html;
  try {
    const buf = fs.readFileSync(filePath);
    // Check if it looks like UTF-8 (has our charset=UTF-8 tag)
    const probe = buf.toString('utf8', 0, 500);
    if (probe.includes('charset=UTF-8')) {
      html = probe + buf.toString('utf8', 500);
    } else {
      // Still ANSI, decode properly
      html = decoder.decode(buf);
      html = html.replace(/charset=Windows-1252/gi, 'charset=UTF-8');
      html = html.replace(/charset=windows-1252/gi, 'charset=UTF-8');
    }
  } catch(e) {
    const buf = fs.readFileSync(filePath);
    html = decoder.decode(buf);
    html = html.replace(/charset=Windows-1252/gi, 'charset=UTF-8');
  }

  // Remove any existing keyword-style link (any version)
  html = html.replace(/\n\s*<!-- Custom Modern Premium Dark Theme Stylesheet -->\n\s*<link rel="stylesheet" href="\.\/keyword-style\.css[^"]*">\n\s*/g, '\n');
  html = html.replace(/<link rel="stylesheet" href="\.\/keyword-style\.css[^"]*">/g, '');

  // Inject fresh link with cache-busting before </head>
  const linkTag = `\n    <!-- Custom Modern Premium Dark Theme Stylesheet -->\n    <link rel="stylesheet" href="./keyword-style.css?v=3">\n  `;
  if (html.includes('</head>')) {
    html = html.replace('</head>', linkTag + '</head>');
  } else {
    html = html.replace('<html>', '<html>\n<head>' + linkTag + '</head>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  updatedCount++;
});

console.log(`\nDone! ${updatedCount} files updated with fresh cache-busting stylesheet link.`);
