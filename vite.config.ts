import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { webcrypto } from 'node:crypto';

const globalForCrypto = globalThis as typeof globalThis & { crypto?: typeof webcrypto };

if (!globalForCrypto.crypto) {
  globalForCrypto.crypto = webcrypto;
}

const ensureRepoPath = (raw?: string | null) => {
  if (!raw || raw === '/') {
    return '/';
  }

  let normalized = raw.trim();

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`;
  }

  return normalized;
};

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const derivedBase = repoName ? `/${repoName}/` : '/';
const basePath = ensureRepoPath(process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? derivedBase : '/'));
const startUrl = basePath === '/' ? '/' : basePath;

export default defineConfig({
  base: basePath,
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
        scope: startUrl,
        start_url: startUrl,
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
