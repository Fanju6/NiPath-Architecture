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
- A fixed **56px compact AppBar** with a single page title and no subtitle, product logo, or scroll-collapse behavior; fixed five-item bottom navigation, detail Back, grouped shadcn Card rows, Sheet forms and safe-area insets.
- Desktop retains the official shadcn Dashboard sidebar.
- Current UX contract: [Android fixed compact AppBar v4](../design/NiPath-Android-Compact-AppBar-UX-v4.md).
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

## Preview data, UI and Core boundaries

GitHub Pages and local Vite development use **isolated Mock data** from `src/lib/mock-data.ts` to provide a realistic interface with preloaded subscriptions, nodes, routing rules and strategy groups. Preview actions operate the shared Zustand state; settings and local workspace edits are retained in **sessionStorage**. The only visible “演示模式” notice is at the **bottom of Overview**. All other pages keep product-style content and controls.

Desktop and Android share the **same state and capabilities**: sources and node editing, proxy-group management, rule ordering/editing, JSON import/export, DNS, security information and appearance. Mobile forms use a keyboard-aware shadcn `Sheet` that tracks `window.visualViewport` and scrolls focused inputs into view.

Mock runtime actions and sample measurements are **not** real Android/VPN/sing-box activity. When an authenticated Core responds on the same origin, the client switches away from Mock runtime behavior, and requests device operations through the Core HTTP API instead of pretending success. There is still no functioning Go Core service in this repository; real Provider parsing, Android root/VPN service, and runtime subscriptions require its implementation.

See [implementation status](../design/NiPath-WebUI-Implementation-Status.md). The official registry components and Neutral theme stay unchanged.

## Official component provenance and Android UX QA

Run `npm run check:ui` to verify the **18 vendored shadcn/ui New York v4 primitives** against the audited official registry snapshot pinned in `shadcn-registry-snapshot.json`, plus Neutral theme tokens and `components.json`. This check is part of CI; intentional upstream upgrades require a new source audit and manifest update. See [UI audit](../design/NiPath-shadcn-Android-UX-Audit-v5.md).

Android compact view uses five bottom destinations; wider Android tablet view uses a rail. Each tab retains its component state and scroll position while navigating; browser/WebView history handles tab, detail and main action-sheet Back. The Android host must independently integrate OS predictive Back, system bars, permissions, and IME insets; a browser screenshot cannot certify OS-native behavior.
