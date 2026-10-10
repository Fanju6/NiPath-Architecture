# NiPath WebUI · official shadcn/ui New York v4

This is NiPath's **React 19 + TypeScript + Vite + Tailwind CSS 4** frontend, rebuilt around the actual official shadcn/ui New York v4 Radix primitives and `dashboard-01` composition.

## UI sources and appearance

- Components in `src/components/ui/` originate from [shadcn-ui/ui official new-york-v4 registry](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui). Only import paths were adapted from the upstream registry layout to this Vite project.
- `src/hooks/use-mobile.ts` originates from the official registry.
- Shell uses `SidebarProvider`, `SidebarInset`, `SidebarMenu`, the standard collapsible sidebar and header, following [the official dashboard-01 example](https://ui.shadcn.com/blocks).
- `src/styles.css` contains **only the documented default shadcn/ui Neutral light/dark theme and Tailwind imports/base layer**. No legacy `np-*` selectors, custom card/button CSS, gradient palette or hand-painted page layouts.
- Page-specific layout is composed with Tailwind utilities and the official `Card`, `Table`, `Tabs`, `Dialog`, `Switch`, `NativeSelect`, `Alert` and `Progress` components.

## Android compact layout (Material 3-inspired)

The Android/mobile layout is a **separate presentation**, not a scaled-down shadcn Dashboard:

- [Mobile React entry](src/mobile/AndroidApp.tsx) + [Material 3 compact styling](src/mobile/android.css).
- A 5-destination bottom navigation bar (Overview, Proxies, Resources, Rules, Settings), 64dp-style top app bar, selected-state indicator, tonal sections, FAB and bottom sheets.
- Group and JSON sub-pages have a Back action and hide the primary bottom navigation.
- The presentation respects `env(safe-area-inset-top/bottom)` and uses mobile-sized touch targets.
- GitHub Pages uses this compact shell below 840 CSS px; desktop retains the official shadcn Sidebar.
- **This is still React inside a browser/WebView**, not true native Android UI. For the actual Android manager, Kotlin + Jetpack Compose Material 3 is recommended as a separate ADR decision; see [Android UX design spec](../design/NiPath-Android-Material3-Native-UX-v1.md).

## Browser UI regression tests

CI runs `npm run test:e2e` with Playwright Chromium on a **393×852 Android phone viewport** and a 1440×900 desktop viewport. It validates all five bottom destinations, proxy detail Back, bottom-sheet operations, dark theme and desktop Sidebar, and uploads real screenshots as a workflow artifact.


The official registry is open-source; see [shadcn/ui](https://github.com/shadcn-ui/ui) for licenses and updates. Components are **vendored project source**, as designed by shadcn/ui; they are not runtime imports from a monolithic UI package.

## Local development

```bash
cd web
npm ci
npm run dev
npm run build
```

## GitHub Pages

The workflow `../.github/workflows/webui-build.yml` builds the Vite app to `../docs` and GitHub Pages publishes from `main /docs`.

Open <https://fanju6.github.io/NiPath-Architecture/>. For large styling changes, perform a hard refresh or open a private/incognito tab to avoid the browser cache.

## Demo limitations

The current site is a **live interactive frontend demo**, not a functioning proxy. It uses local sample data via `src/store/use-ui.ts`, does not access subscription URLs, does not operate Android Root/VPN, and does not control a sing-box daemon. The Go Core API, SSE and configuration transaction layer are independent upcoming work.

This frontend uses one JSON configuration authoring interface; it does not introduce Managed/Expert modes. No sample traffic, subscription update state or selected proxy is asserted as a real engine measurement.
