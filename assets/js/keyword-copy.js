/**
 * Copy-to-clipboard for PANORAMIC code blocks on Keywords detail pages.
 */
document.addEventListener('DOMContentLoaded', function () {
  const codeTables = document.querySelectorAll('.keyword-page blockquote table');

  codeTables.forEach(function (table) {
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
      const codeFont = table.querySelector('font[face="Consolas"], font');
      const raw = codeFont ? codeFont.innerText : table.innerText;
      const lines = raw.split('\n').map(l => l.trimEnd());
      while (lines.length && !lines[0].trim()) lines.shift();
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
      const code = lines.join('\n');

      const showCopied = function () {
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copié !';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copier';
          btn.classList.remove('copied');
        }, 2000);
      };

      navigator.clipboard.writeText(code).then(showCopied).catch(function () {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
      });
    });
  });
});
