# NiPath 1.0 — React WebUI

This is a real Vite/React/TypeScript app rather than the old single-file prototype. It uses Tailwind CSS 4, **local Radix primitives adapted toward shadcn/ui's new-york conventions**, TanStack Query, Zustand and React Hook Form + Zod.

**Component adoption is incremental, not complete.** Button, Badge, Card, Dialog and Tabs were aligned with shadcn/ui slot structures and semantic tokens after the source audit. They remain locally adapted components (not a claim that the shadcn CLI generated this project). Existing pages still contain extensive custom NiPath CSS. New primitives should use the official shadcn CLI / registry sources; do not copy handcrafted look-alikes when an official component exists. See [upstream Vite setup](https://ui.shadcn.com/docs/installation/vite) and [theming tokens](https://ui.shadcn.com/docs/theming).

## Start locally

```bash
cd web
npm install
npm run dev
npm run build
```

Open http://localhost:5173. Static output is written to `../docs/`.

## Demo limitations

The GitHub Pages build runs in **demo mode**. Changes are interactive in the browser's local state, not persisted to a running NiPath Core. The app never claims to have started an actual network proxy on GitHub Pages. It does not have a subscription downloader or a live sing-box API yet.

A future adapter can replace `src/lib/demo.ts` with a typed authenticated Core API (and SSE), without changing page structure. In a real Core build, configure Vite `base: '/'` and embed the static output.

## GitHub Pages CI

GitHub Pages remains configured to publish **main /docs**. Workflow `.github/workflows/webui-build.yml` installs dependencies, type-checks, builds and commits the generated `docs/` to the same branch. The workflow runs on source changes and can be manually dispatched.

`docs/` is generated; edit `web/src/` instead.

## Tech & design

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + shadcn/ui Radix-style local components (Button / Badge / Card / Dialog / Tabs aligned; Input, Select, Switch, Sidebar etc. **not yet migrated**)
- TanStack Query 5 (snapshot architecture ready)
- Zustand 5 (presentation and demo state only)
- React Hook Form + Zod (form validation)
- Lucide React
- Original design: [WebUI Design v1.0](../design/NiPath-WebUI-Design-v1.0.md)

All status and performance figures shown by the demo are **fabricated sample values** clearly labeled as such. This repository contains no live network access credentials.

## Component migration still required

- Replace hand-styled form inputs, native selects, toggle switches, and navigation widgets with shadcn/ui primitives while preserving accessibility, responsive layout, and all five page flows.
- Migrate legacy `np-*` and fixed hex colors in `src/styles.css` to semantic `background/card/primary/muted/accent/destructive` tokens; keep custom NiPath brand accents intentionally.
- Use the component registry/CLI for new components, and verify dark mode and mobile touch behavior in browser tests.
- TanStack Query currently supplies a provider, but no live Core API calls; Go Core integration is a separate milestone.
