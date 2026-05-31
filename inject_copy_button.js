import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keywordsDir = path.join(__dirname, 'Keywords');

const files = fs.readdirSync(keywordsDir).filter(f => f.endsWith('.html'));

// The copy button script to inject once before </body>
const copyScript = `
  <script>
    // Copy-to-clipboard for PANORAMIC code blocks
    document.addEventListener('DOMContentLoaded', function () {
      // Target every <table> inside a <blockquote> — those are code examples
      const codeTables = document.querySelectorAll('blockquote table');

      codeTables.forEach(function (table) {
        // Make sure the parent is positioned for the button overlay
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.setAttribute('aria-label', 'Copier le code');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copier';
        wrapper.appendChild(btn);

        btn.addEventListener('click', function () {
          // Extract text from the <font face="Consolas"> element (the actual code)
          const codeFont = table.querySelector('font[face="Consolas"], font');
          const raw = codeFont ? codeFont.innerText : table.innerText;
          // Clean up: trim each line, remove empty trailing lines
          const lines = raw.split('\\n').map(l => l.trimEnd());
          // Remove leading/trailing blank lines
          while (lines.length && !lines[0].trim()) lines.shift();
          while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
          const code = lines.join('\\n');

          navigator.clipboard.writeText(code).then(function () {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copié !';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copier';
              btn.classList.remove('copied');
            }, 2000);
          }).catch(function () {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = code;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.textContent = 'Copié !';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copier';
              btn.classList.remove('copied');
            }, 2000);
          });
        });
      });
    });
  </script>
`;

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(keywordsDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has copy-btn script
  if (html.includes('copy-btn')) continue;

  // Bump CSS version too
  html = html.replace(/keyword-style\.css\?v=\d+/g, 'keyword-style.css?v=9');

  // Inject before </body>
  if (html.includes('</body>')) {
    html = html.replace('</body>', copyScript + '\n</body>');
  } else {
    html += copyScript;
  }

  fs.writeFileSync(filePath, html, 'utf8');
  updatedCount++;
}

console.log(`Done! ${updatedCount} files updated with copy button script.`);
