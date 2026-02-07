# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (HMR enabled)
npm run build      # Type-check (tsc -b) then bundle with Vite → dist/
npm run lint       # ESLint across the project
npm run preview    # Preview production build locally
```

**Deploy to Cloudflare Pages:**
```bash
npx wrangler pages deploy dist --project-name 21day-breakthrough --branch main
```

## Architecture

Single-page React 19 + TypeScript landing page for 21day-breakthrough.com. No routing, no state management library, no CSS framework.

- **`src/App.tsx`** — Entire page in one component. Contains two custom hooks (`useReveal` for Intersection Observer scroll animations, `useCountdown` for the live timer) and a `Reveal` wrapper component for staggered fade-in effects.
- **`src/App.css`** — All component styles. Design tokens are CSS custom properties (amber/ivory/charcoal palette, Playfair Display + DM Sans fonts).
- **`src/index.css`** — Global reset and base typography.
- **`public/_headers`** — Cloudflare Pages cache headers (1yr immutable for hashed assets).

## Design Constraints

- **No icons** — per brand guidelines, never use icons in the UI.
- **No colored icons** — never use colored icons in UI.
- Animations are pure CSS transitions triggered by `.reveal`/`.revealed` classes via Intersection Observer — no animation libraries.
- Fonts loaded from Google Fonts in `index.html` with `preconnect`.

## Hosting

Deployed on Cloudflare Pages as `21day-breakthrough`. Custom domain `21day-breakthrough.com` with CNAME to `21day-breakthrough.pages.dev`. Brand email: support@21day-breakthrough.com.
