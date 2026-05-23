# AGENTS.md

## Project

DLSU CSO LEAP 2026 — event website for De La Salle University CSO. React SPA + Cloudflare Worker edge proxy + Firebase Auth.

## Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4, Framer Motion
- **Edge:** Cloudflare Workers/Pages Functions (`worker/index.ts`) — proxies Contentful, injects security headers, health check
- **Auth:** Firebase Auth (Google, restricted to `dlsu.edu.ph`)
- **Bot protection:** Cloudflare Turnstile
- **CMS:** Contentful (access token kept server-side in worker)

## Commands

```bash
npm run dev          # Vite dev server (no worker — use pages:dev for full stack)
npm run build        # tsc -b && vite build (typecheck + bundle)
npm run lint         # eslint .
npm run type:worker  # wrangler types (generates worker Env types)
```

No test framework is configured. No CI workflows exist.

## Build order

`npm run lint` → `npm run build` (which runs `tsc -b` first)

Worker typegen (`npm run type:worker`) only needed when changing `worker/index.ts` Env interface.

## Architecture

```
src/
  main.tsx          → entry, renders <App />
  App.tsx           → routing, layout, error boundary (single-file, ~1200 lines)
  pages/            → lazy-loaded: Home, About, MainEvents, FAQs, Classes, SavedClasses
  components/       → ClassCard, Navbar, Footer, PageCommon, NayonScene, SubthemeLandscape
  components/shared/ → Fireflies, ScrollProgress, TheAwakening, LazyImage, VirtualList
  services/
    firebase.ts     → Firebase app init, lazy auth module
    firebase-lazy.ts → Firestore/Storage lazy loaders (only after auth)
    leapify.ts      → Turnstile verification + API client
  hooks/            → useAuth, useData, useWindow, usePerformance
  types/            → shared type definitions
  utils/            → constants, helpers, performance utilities
  index.ts          → central re-exports for hooks/types/utils/components

worker/index.ts     → Cloudflare Worker: security headers, /api/health, Contentful proxy
public/_worker.ts   → Pages Functions entry (re-exports worker/index)
public/_routes.json → routes /api/* through worker, rest is static
```

## Key gotchas

- **App.tsx is huge** (~1200 lines). Page components are lazy-loaded via `React.lazy()` but App.tsx itself contains ErrorBoundary, GlowRing, NayonBanner, and other inline components.
- **Firebase Auth is lazy** — `getAuthModule()` dynamically imports `firebase/auth`. Don't import `firebase/auth` at top level.
- **Worker runs at edge, not in browser** — uses `@cloudflare/workers-types`, not DOM types. Separate `tsconfig.worker.json`.
- **Contentful proxy** — worker proxies Contentful CDN requests so the access token never reaches the client. Secrets set via `wrangler secret put`.
- **Tailwind v4** — uses `@tailwindcss/vite` plugin (not PostCSS). Custom theme in `tailwind.config.js` defines `leap-*` color palette.
- **CSS Modules** — components use `.module.css` files (e.g., `App.module.css`). Global styles in `index.css` and `pages/index_patches.css`.
- **Auth domain restriction** — Google sign-in restricted to `dlsu.edu.ph` via `googleProvider.setCustomParameters({ hd: 'dlsu.edu.ph' })`.

## Deployment

- **Cloudflare Pages (preferred):** `npm run build` → `wrangler pages deploy dist`
- **Firebase Hosting:** `firebase deploy` (serves `dist/` with security headers from `firebase.json`)
- Worker env vars: `wrangler secret put <NAME>` for secrets, `.dev.vars` for local dev

## Conventions

- Conventional commits required (see `.agents/rules/conventional-commits-agent-rule.md`)
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
- ESLint with react-hooks and react-refresh plugins
- Icons from `lucide-react`
