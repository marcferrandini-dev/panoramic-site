/**
 * GLOBAL JAVASCRIPT - PANORAMIC static migration
 * Handles mobile navigation drawer, interactive accordions, code copy-to-clipboard,
 * scroll indicators, documentation live search and FAQ category tabs.
 */

import { highlightCodeBlocks } from './panoramic-highlighter.js';

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 0. PANORAMIC code syntax highlighting
  // ==========================================
  highlightCodeBlocks();

  // ==========================================
  // 1. Sticky Header & Scroll Effects
  // ==========================================
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ==========================================
  // 1.5. Theme Toggle Logic
  // ==========================================
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const iconSun = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
  const iconMoon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

  const updateToggleIcons = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    themeToggleBtns.forEach(btn => {
      btn.innerHTML = isLight ? iconMoon : iconSun;
      btn.setAttribute('aria-label', isLight ? 'Passer au mode sombre' : 'Passer au mode clair');
    });
  };

  updateToggleIcons();

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('panoramic-theme', newTheme);
      updateToggleIcons();
    });
  });

  // ==========================================
  // 2. Mobile Navigation Drawer
  // ==========================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  if (mobileToggle && mobileDrawer && drawerOverlay) {
    const toggleDrawer = () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      drawerOverlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.addEventListener('click', toggleDrawer);
    drawerOverlay.addEventListener('click', toggleDrawer);

    mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ==========================================
  // 3. Interactive Accordion (FAQ Page)
  // ==========================================
  const setAccordionState = (header, expanded) => {
    header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach((header, index) => {
    const item = header.parentElement;
    const content = header.nextElementSibling;
    if (!content || !content.classList.contains('accordion-content')) return;

    const contentId = content.id || `accordion-content-${index}`;
    content.id = contentId;
    header.setAttribute('aria-controls', contentId);
    header.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');

    const toggleAccordion = () => {
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherContent) otherContent.style.maxHeight = null;
          const otherHeader = otherItem.querySelector('.accordion-header');
          if (otherHeader) setAccordionState(otherHeader, false);
        }
      });

      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
        setAccordionState(header, false);
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        setAccordionState(header, true);
      }
    };

    header.addEventListener('click', toggleAccordion);
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleAccordion();
      }
    });
  });

  // ==========================================
  // 4. Code Block Copy-to-Clipboard
  // ==========================================
  document.querySelectorAll('.editor-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-editor')?.querySelector('code');
      if (!codeBlock) return;

      try {
        await navigator.clipboard.writeText(codeBlock.textContent);

        const copyTextEl = btn.querySelector('span');
        if (!copyTextEl) return;
        const originalText = copyTextEl.textContent;
        copyTextEl.textContent = 'Copié !';
        btn.style.color = 'var(--secondary)';

        setTimeout(() => {
          copyTextEl.textContent = originalText;
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Erreur de copie dans le presse-papiers:', err);
      }
    });
  });

  // ==========================================
  // 5. Documentation Interactive Filter Search
  // ==========================================
  const searchInput = document.getElementById('doc-search');
  const sections = document.querySelectorAll('.doc-keywords-section');
  const alphaButtons = document.querySelectorAll('.alpha-btn');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();

      if (query.length > 0) {
        alphaButtons.forEach(btn => btn.classList.remove('active'));
      }

      sections.forEach(section => {
        let visibleInThisSection = 0;
        section.querySelectorAll('.keyword-card').forEach(card => {
          if (card.textContent.toLowerCase().includes(query)) {
            card.style.display = '';
            visibleInThisSection++;
          } else {
            card.style.display = 'none';
          }
        });

        section.style.display = visibleInThisSection > 0 ? '' : 'none';
      });
    });
  }

  if (alphaButtons.length > 0 && sections.length > 0) {
    alphaButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const letter = btn.getAttribute('data-letter');

        alphaButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (searchInput) searchInput.value = '';

        sections.forEach(section => {
          const sectionLetter = section.getAttribute('data-letter');

          if (letter === 'all') {
            section.style.display = '';
            section.querySelectorAll('.keyword-card').forEach(c => c.style.display = '');
          } else if (sectionLetter === letter) {
            section.style.display = '';
            section.querySelectorAll('.keyword-card').forEach(c => c.style.display = '');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            section.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================
  // 6. FAQ Category Tabs
  // ==========================================
  const faqTabs = document.querySelectorAll('.faq-tab-btn');
  const faqSections = document.querySelectorAll('.faq-category-section');

  if (faqTabs.length > 0 && faqSections.length > 0) {
    faqTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        faqTabs.forEach(t => t.classList.remove('active'));
        faqSections.forEach(s => s.style.display = 'none');

        tab.classList.add('active');
        const targetSection = document.getElementById(tab.getAttribute('data-target'));
        if (targetSection) {
          targetSection.style.display = 'block';
        }

        // Retour en haut de page après le changement de catégorie
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // ==========================================
  // 7. Back-to-Top Button
  // ==========================================
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Retour en haut de la page');
  backToTop.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>';
  document.body.appendChild(backToTop);

  const toggleBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  };
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop);
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
