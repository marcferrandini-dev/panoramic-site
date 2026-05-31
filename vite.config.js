import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        documentation: resolve(__dirname, 'documentation.html'),
        manuelAZ: resolve(__dirname, 'manuel-a-z.html'),
        manuelTheme: resolve(__dirname, 'manuel-theme.html'),
        manuelPartie1: resolve(__dirname, 'manuel-partie-1.html'),
        manuelPartie2: resolve(__dirname, 'manuel-partie-2.html'),
        manuelPartie3: resolve(__dirname, 'manuel-partie-3.html'),
        manuelPartie4: resolve(__dirname, 'manuel-partie-4.html'),
        manuelPartie5: resolve(__dirname, 'manuel-partie-5.html'),
        manuelPartie6: resolve(__dirname, 'manuel-partie-6.html'),
        manuelPartie7: resolve(__dirname, 'manuel-partie-7.html'),
        manuelPartie8: resolve(__dirname, 'manuel-partie-8.html'),
        manuelPartie9: resolve(__dirname, 'manuel-partie-9.html'),
        tutoriels: resolve(__dirname, 'tutoriels.html'),
        faq: resolve(__dirname, 'faq.html'),
        programmes: resolve(__dirname, 'programmes.html'),
        telechargements: resolve(__dirname, 'telechargements.html'),
        mentionsLegales: resolve(__dirname, 'mentions-legales.html')
      }
    }
  }
});
