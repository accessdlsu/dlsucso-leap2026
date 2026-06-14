// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    server: {
      allowedHosts: ['leap.wincs.dev'],
      // In astro dev, proxy /api/* to the backend so countdown can fetch /api/config.
      // LEAPIFY_API_URL comes from .env (gitignored) — never exposed to the browser.
      proxy: process.env.LEAPIFY_API_URL ? {
        '/api': {
          target: process.env.LEAPIFY_API_URL,
          changeOrigin: true,
          rewrite: (path) => path,
        },
      } : {},
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
    },
    ssr: {
      noExternal: ['react', 'react-dom'],
    },
  },
});