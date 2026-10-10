# NiPath WebUI · official shadcn/ui New York v4

This is NiPath's **React 19 + TypeScript + Vite + Tailwind CSS 4** frontend, rebuilt around the actual official shadcn/ui New York v4 Radix primitives and `dashboard-01` composition.

## UI sources and appearance

- Components in `src/components/ui/` originate from [shadcn-ui/ui official new-york-v4 registry](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui). Only import paths were adapted from the upstream registry layout to this Vite project.
- `src/hooks/use-mobile.ts` originates from the official registry.
- Shell uses `SidebarProvider`, `SidebarInset`, `SidebarMenu`, the standard collapsible sidebar and header, following [the official dashboard-01 example](https://ui.shadcn.com/blocks).
- `src/styles.css` contains **only the documented default shadcn/ui Neutral light/dark theme and Tailwind imports/base layer**. No legacy `np-*` selectors, custom card/button CSS, gradient palette or hand-painted page layouts.
- Page-specific layout is composed with Tailwind utilities and the official `Card`, `Table`, `Tabs`, `Dialog`, `Switch`, `NativeSelect`, `Alert` and `Progress` components.

## Android compact layout · shadcn/ui with Android-native interaction

The compact Android/mobile UI uses **the same official shadcn/ui New York components and default Neutral theme** as desktop. Only its navigation hierarchy and interaction layout follow Android app patterns:

- Source: [mobile/AndroidApp.tsx](src/mobile/AndroidApp.tsx), no separate Material 3 CSS/theme.
- One Miuix-inspired collapsible title within the app bar (never a second page H1), fixed five-item bottom navigation, separate detail pages and Back, grouped shadcn Card rows, Sheet forms and safe-area insets.
- Desktop retains the official shadcn Dashboard sidebar.
- See the current [Android shadcn Native Interaction Spec v2](../design/NiPath-NiPath-Android-TopBar-Native-UX-v3.md).
- This remains a WebUI demo; native system API integration is a separate implementation phase.

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
