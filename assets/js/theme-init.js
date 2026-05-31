// assets/js/theme-init.js
(function() {
  const savedTheme = localStorage.getItem('panoramic-theme');
  // Check if saved theme is light, or if no saved theme and system prefers light
  if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
