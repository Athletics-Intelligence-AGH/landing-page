# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:4321
npm run build      # production build
npm run preview    # preview production build

npm run prettier:fix    # format src/**/*.{ts,tsx,js,scss,md,astro}
npm run prettier:check  # check formatting
```

**Docker:**
```bash
docker build --no-cache -t skn-athletics-intelligence-landing-page .
docker run --rm -p 4321:4321 skn-athletics-intelligence-landing-page
```

## Architecture

**Stack:** Astro v6 (SSR, Node.js standalone adapter) + React + Tailwind CSS + MDX

**Routing & i18n:** All pages live under `src/pages/[lang]/` (en/pl). The root `/` redirects to `/en/`. Both locales are prefixed (`prefixDefaultLocale: true`). Language strings live in a single dict in `src/i18n/index.ts` — use the `t(lang, key)` helper in components. There is no separate translation file per language; add new keys to both `en` and `pl` in the dict.

**Content Collections** (`src/content/config.ts`):
- `management` — team management members (`src/content/team/management/*.md`)
- `supervisors` — supervisors (`src/content/team/supervisors/*.md`)
- `news` — news articles (`src/content/news/*.md` or `.mdx`)

Content is filtered for display using `canBeDisplayed(draft, publishDate)` from `src/utils.ts` — items with `draft: true` or a future `publishDate` are hidden.

Team member frontmatter uses `title` as an **i18n key** (e.g. `vicePresidentTitle`), not a literal string. It is resolved via `t(lang, member.title)` at render time.

**Path aliases** (defined in `tsconfig.json`, base `src/`):
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@assets/*` → `src/assets/*`
- `@pages/*` → `src/pages/*`
- `@lib/*`, `@utils/*` also available

**Layout:** `src/layouts/Layout.astro` wraps every page with `<Navbar>` and `<Footer>`, both receiving the current `lang` prop. The `lang` prop must be threaded from page → layout → components.

**React components** are used selectively (e.g. `mobile-menu.tsx`). Prefer `.astro` components; use React only when interactivity is needed.

**Icons:** `astro-icon` with Iconify icon sets `bx`, `simple-icons`, and `uil`.

**CSP:** Astro experimental CSP is enabled (`astro.config.mjs`). Be cautious with inline scripts/styles.
