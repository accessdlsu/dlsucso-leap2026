## Goal
Build a responsive glassmorphic navbar with desktop (centered pill with icon+text links) and mobile (bottom nav with icon-above-text) layouts, plus interactive search/profile pills with a popup menu. Login page with legacy-inspired background.

## Constraints & Preferences
- Astro with Cloudflare adapter; `client:only="react"` for Navbar (avoids SSR hook error).
- Pure CSS transitions for active/hover indicator; no framer-motion.
- Mobile breakpoint at 768px (nav moves to bottom, links become column layout).
- Desktop nav items scale responsively (padding, font, icon size) between 769–1400px.
- Profile pill opens a glassmorphic popup with "Saved Classes" (link) and "Signout" (button).
- Accepting conventional commits.
- Node 26 requires patching Astro's `node_modules/astro/dist/core/fs/index.js` to replace `rmdirSync` with `rmSync`.

## Progress
### Done
- Rebuilt navbar with glassmorphic pills: logo left, centered nav, search+profile right.
- Added 5 nav links with Lucide icons (Home, Overview, Featured, Classes, FAQs).
- Active and hover indicators use CSS `cubic-bezier(0.22, 1, 0.36, 1)` transitions.
- Right pills: `58×58` circles with Search (24px) and CircleUser (40px) icons.
- Profile pill: clickable button toggles a popup (Bookmark + "Saved Classes", LogOut + "Signout"), closes on click-outside.
- Nav pill height fixed to 58px (`alignItems: center`) matching logo/right pills.
- All pills consistently set to `z-index: 1001` (logo, right pills) — nav at 1000.
- Removed `border: 1px` from nav pill (was adding 2px height, causing mismatch).
- Added `windowWidth` state + resize listener; indicator recalibrates on resize (both desktop & mobile).
- Desktop responsive scaling: link horizontal padding (10–20px), font size (0.8–1rem), icon size (14–16px) linear between 769–1400px.
- Mobile layout (≤768px): nav at bottom, icon-above-text (`flexDirection: column`), 22px icons, 0.65rem text, centered in a pill with `maxWidth: 380`.
- Mobile indicator: extends 6px beyond link sides, `borderRadius: 9999` (fully rounded like desktop).
- Icons always shown on desktop at all widths (removed 840px hide behavior).
- Desktop link horizontal padding reduced to remove excess gap between items.
- Navbar single file (merged MobileNavbar.tsx back in).
- Added `fontFamily: "'DM Sans', sans-serif"` to popup menu items.
- Removed entrance animation (fixes hydration mismatch from SSR `sessionStorage` gap).
- Created blank pages: index, about, events, classes, faq.
- Login page at `/login` with `showNavbar={false}` in Layout.
- Layout accepts `showNavbar` prop (defaults to `true`).
- Login background: legacy blue-to-green 12-stop gradient (`#1a2940` → `#5a4838`).
- Simplified landscape SVG at bottom (volcano, hills, ground) extracted from NayonScene.
- 16 fireflies with CSS opacity blink, `will-change`, `prefers-reduced-motion` support.
- Favicon preloaded in `<head>`.
- `WebkitTapHighlightColor: "transparent"` on all tappable mobile elements.
- Favicon uses Astro `<Image>` component from `src/assets/favicon.png` with responsive `srcset`.

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- **Pure CSS transitions** over framer-motion: smaller bundle; active/hover indicators use CSS `transition` with custom cubic bezier.
- **`client:only="react"`**: avoids recurring Vite SSR hook error (`Cannot read properties of null - 'useState'`) in `astro dev` with @astrojs/cloudflare.
- **Fixed 58px height for all pills**: logo image ~40px + 9px padding → 58px; nav pill `height: 58`; right pills `58×58` — ensures consistent vertical alignment.
- **Zero inset desktop indicator**: fills full link width; mobile also zero inset with `borderRadius: 9999`.
- **Separate `windowWidth` state** drives responsive scaling and `isMobile` flag; added as `useEffect` dep for indicator repositioning on resize.
- **Profile popup is absolute-positioned** within the profile pill (relative parent), closes on `mousedown` outside.
- **Merged mobile navbar into single file** — avoids import and shared state duplication for `linkRefs`, `hoveredIndex`, `indicatorStyle`.
- **Login background** uses legacy's 12-stop blue-to-green gradient matching the Nayon scene sky.
- **Simplified landscape** — volcano + hills + ground only, no interactive huts/decorations.
- **Fireflies** are server-rendered static HTML (no client script), CSS-only animation, 16 count (vs legacy's 24).
- **Astro Image component** for login logo — generates WebP + responsive srcset, lazy loading, proper dimensions for CLS prevention.

## Next Steps
- Build out page content (Home hero, About, Classes catalog, Events grid, FAQ accordion).
- Port services (`leapify.ts` WebSocket client, `auth.ts` Better Auth).
- Port interactive components (ClassCard with bookmark, AuthErrorToast, SortSelect).
- Configure Cloudflare Worker (`worker/index.ts`) for API proxy.

## Critical Context
- **Recurring SSR hook error in `astro dev`**: `TypeError: Cannot read properties of null (reading 'useState')` at Navbar. Workaround: `client:only="react"` (no SSR for Navbar). Build succeeds; error is dev-only.
- **Node 26 compatibility**: Astro's `fs/index.js` must be patched after `npm install` — replace `rmdirSync(p, options)` with `rmSync(p, options)` on line 79. Patch is ephemeral (lost on reinstall).
- Vite config includes `optimizeDeps.include` and `ssr.noExternal` for react, react-dom, lucide-react.
- Navbar positions: logo `top: 12, left: 12` on mobile, `top: 24, left: 24` on desktop; right pills same offsets.
- Desktop nav link vertical padding fixed at `17px` (content ~19px → ~53px link, centered in 58px pill).
- Mobile nav link padding: `6px 4px`, icon `22px`, text `0.65rem`, gap `2px`.
- Profile popup sits at `top: calc(100% + 8px), right: 0` with `minWidth: 200`, glassmorphic background.
- Logo image: `/favicon.png` (714×401), `width: 72` desktop, `width: 48` mobile.
- `docs/BETTER_AUTH_IMPLEMENTATION.md` and `docs/WEBSOCKET_IMPLEMENTATION.md` in root `docs/`.
- `legacy/` contains old React SPA codebase for reference.
- Indicator transitions reduced to `0.15s` (was `0.3s`) for snappier page swaps.

## Relevant Files
- `src/components/navigation/Navbar.tsx` – single file: desktop nav (responsive scaling, icons+text, active/hover indicator), mobile nav (bottom bar, icon-above-text), logo pill, search/profile pills + profile popup; pure CSS transitions
- `src/layouts/Layout.astro` – base layout, imports Navbar with `client:only="react"`, `showNavbar` prop, ClientRouter, Google Fonts (DM Sans, Playfair Display, Poppins), favicon preload
- `src/pages/login.astro` – login page, no navbar, legacy gradient background, simplified SVG landscape, fireflies, Astro Image component for logo
- `src/assets/favicon.png` – logo image source for Astro Image component
- `astro.config.mjs` – Cloudflare adapter, React integration, Vite SSR/noExternal config, `server.allowedHosts` for leap.wincs.dev
- `src/pages/index.astro`, `about.astro`, `events.astro`, `classes.astro`, `faq.astro` – blank pages
- `package.json` – deps: react, react-dom, lucide-react, @astrojs/react, @astrojs/cloudflare (framer-motion removed)
- `docs/BETTER_AUTH_IMPLEMENTATION.md` – auth architecture reference
- `docs/WEBSOCKET_IMPLEMENTATION.md` – WebSocket API proxy reference
