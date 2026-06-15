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
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Set X-Forwarded-Host so Better Auth can resolve the dynamic base URL.
              // Without it, Better Auth falls back to BETTER_AUTH_URL and the OAuth
              // state cookie gets scoped to the wrong domain → state_mismatch.
              if (req.headers.host) {
                proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
              }
              const proto = req.headers['x-forwarded-proto'] ||
                (req.socket?.encrypted ? 'https' : 'http');
              proxyReq.setHeader('X-Forwarded-Proto', proto);
            });
          },
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