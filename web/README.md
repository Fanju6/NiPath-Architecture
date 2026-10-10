# NiPath 1.0 — React WebUI

This is the real Vite/React/TypeScript app, replacing the static visual-only HTML proof of concept. It uses Tailwind CSS 4, Radix-powered local shadcn-style components, TanStack Query, Zustand and React Hook Form + Zod.

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
- Tailwind CSS 4 + local shadcn-style Radix components
- TanStack Query 5 (snapshot architecture ready)
- Zustand 5 (presentation and demo state only)
- React Hook Form + Zod (form validation)
- Lucide React
- Original design: [WebUI Design v1.0](../design/NiPath-WebUI-Design-v1.0.md)

All status and performance figures shown by the demo are **fabricated sample values** clearly labeled as such. This repository contains no live network access credentials.
