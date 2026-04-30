import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    sourcemap: true,
    // Optimize for high traffic scenarios
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        // Aggressive code splitting for faster initial load
        manualChunks: (id) => {
          // React vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          // Contentful
          if (id.includes('node_modules/contentful')) {
            return 'contentful';
          }
        },
      },
    },
    // Chunk size warnings
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600, // Warn if chunks exceed 600KB
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
    },
  },
})