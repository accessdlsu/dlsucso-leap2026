import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import JSONC from 'jsonc-parser'

/**
 * Load and merge environment variables from wrangler.jsonc
 * This ensures import.meta.env.VITE_* is populated at build time
 * from the single source of truth (wrangler.jsonc), avoiding duplication.
 */
interface WranglerVars {
  [key: string]: string;
}

interface WranglerConfig {
  vars?: WranglerVars;
  env?: Record<string, { vars?: WranglerVars }>;
}

function loadWranglerVars(mode?: string) {
  // Default to production mode if not specified
  const resolvedMode = mode || 'production'

  const wranglerPath = path.resolve(__dirname, 'wrangler.jsonc')
  let wranglerConfig: WranglerConfig = {}

  try {
    const content = fs.readFileSync(wranglerPath, 'utf-8')
    wranglerConfig = JSONC.parse(content)
  } catch {
    console.warn('⚠️  Could not read wrangler.jsonc, falling back to .env')
    return {}
  }

  // Start with base vars
  const baseVars = wranglerConfig.vars || {}

  // Merge environment-specific vars (override base vars)
  let envVars = { ...baseVars }
  if (wranglerConfig.env?.[resolvedMode]?.vars) {
    envVars = { ...envVars, ...wranglerConfig.env[resolvedMode].vars }
  }

  // Filter to only VITE_* vars and convert to import.meta.env format
  const define: Record<string, string> = {}
  for (const [key, value] of Object.entries(envVars)) {
    if (key.startsWith('VITE_')) {
      define[`import.meta.env.${key}`] = JSON.stringify(value)
    }
  }

  console.log(`📦 Loaded environment: ${resolvedMode}`, Object.keys(define))
  return define
}

export default defineConfig(({ mode }) => ({
  plugins: [
    cloudflare(),
    react(),
    tailwindcss(),
  ],
  define: loadWranglerVars(mode),
  server: {
    headers: {
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
}))
