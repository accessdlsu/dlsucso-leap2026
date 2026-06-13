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
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
    },
    ssr: {
      noExternal: ['react', 'react-dom'],
    },
  },
});