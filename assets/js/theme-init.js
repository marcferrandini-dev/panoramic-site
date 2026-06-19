// assets/js/theme-init.js
(function() {
  const savedTheme = localStorage.getItem('panoramic-theme');
  // Dark par défaut, sauf si le visiteur a explicitement choisi le mode clair
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
