import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Zabawy ze zgłoskami',
        short_name: 'Zgłoski',
        description: 'Ćwicz rozpoznawanie zgłosek zmiękczających w przyjazny sposób.',
        theme_color: '#1f3c88',
        background_color: '#f2f6ff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    host: true
  }
});
