# NiPath UI 合规审查 v5：官方 shadcn/ui + Android 原生交互

> 审查时间：2026-10-11 · 来源：实际 GitHub 源码（不是设计效果图）
> 范围：Fanju6/NiPath-Architecture 的 React WebUI + Android 紧凑/平板界面
> **组件检查：18/18 已与官方 shadcn/ui New York v4 Registry 对照一致（仅调整 import 路径）**

## 1. UI 组件规范

- 正式组件目录：`web/src/components/ui/`。
- 源码对照：`shadcn-ui/ui` [commit c2a67849](https://github.com/shadcn-ui/ui/tree/c2a67849be260701852b0977ba15eb5f3a0ce2a4/apps/v4/registry/new-york-v4/ui) 的 `new-york-v4/ui`。
- 检验组件：Alert、Badge、Button、Card、Dialog、Input、Label、NativeSelect、Progress、Separator、Sheet、Sidebar、Skeleton、Switch、Table、Tabs、Textarea、Tooltip。
- 对比策略：只转换 Registry 内部导入路径为本项目 `@/components/ui`、`@/hooks`、`@/lib/utils`；比较后的组件源码完全相同。此结论是**指定上游快照**的一致性，不保证上游之后永远不更新。
- 配置：`components.json` 是 `style: new-york`、`baseColor: neutral`、`cssVariables: true`，尾端使用 Tailwind CSS 4 的官方语义 Token。
- 不再维护 Material 3 紫色配色、单独的 Android 私有组件主题；移动和桌面使用同样的 shadcn/ui 组件及 Neutral 颜色语义。
- CI 守卫：`npm run check:ui`，根据 `web/shadcn-registry-snapshot.json` 计算 Git Blob SHA-1，检查组件变更是否偏离已审查版本；确需更新时，必须重新审查上游并更新快照。

## 2. Android 交互审查与修复

| 检查项 | 本轮状态 | 说明 |
|---|---|---|
| 紧凑屏幕五个主入口 | 已实现 | 概览／代理／资源／规则／设置，官方 shadcn/ui Button 及语义选中状态 |
| 页面顶部标题 | 已实现 | 56px 固定紧凑标题栏，无品牌 Logo、重复 H1、大标题或滚动缩放 |
| Android 平板适配 | 已实现于 WebUI | `min-width:600px` 使用 Navigation Rail；Android UA 在宽屏时仍进入移动体验，而非桌面 Dashboard |
| 二级页返回 | 已实现于 WebUI | 策略组、原生 JSON、关于页独立返回，根导航隐藏 |
| 标签状态保持 | 已修复 | 一级标签保持挂载；资源/规则子 Tab、筛选、滚动位置不会因切换主入口丢失 |
| 浏览器／WebView 返回栈 | 已修复 | `history.pushState` / `popstate` 对齐主标签、详情页和主要新增 Sheet 状态 |
| 系统栏安全区域 | 部分实现 | UI 通过 `viewport-fit=cover` 和 `env(safe-area-inset-*)` 避让；真实状态栏/手势栏由 Android 宿主处理 |
| 触控目标 | 已改进 | AppBar 图标按钮 48px、列表操作 ≥48px、底部主导航 60px |
| 屏幕阅读器 | 基础实现 | 页面 `aria-label`、`aria-current`、Radix Dialog/Sheet 焦点管理；TalkBack 实机尚未覆盖 |
| 横屏和 IME 键盘 | 仍需实机验收 | 窄高度 WebView、输入法覆盖 Sheet、系统窗口 resize 需 Android 宿主/设备测试 |
| 系统预测性返回 | **未实现（宿主工作）** | React WebUI 不能自行注册 Android `OnBackInvokedCallback` / `PredictiveBackHandler`，须在 Android Activity/宿主接入 |
| 原生网络权限与服务 | **非 UI 范围** | Root/TUN/VpnService 由 NiPath Android Host + Go Core 提供；前端不能假装已实现 |

## 3. 设计和交互依据

- [shadcn/ui components.json](https://ui.shadcn.com/docs/components-json)、[Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)、[Theming](https://ui.shadcn.com/docs/theming)。
- [Android 布局和导航模式](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns)：紧凑布局可用三至五项底部 NavigationBar；较宽窗口推荐 Navigation Rail。
- [Android 多返回栈](https://developer.android.com/guide/navigation/backstack/multi-back-stacks)：主导航在用户切换标签后保留目的地和状态。
- [Android 系统栏](https://developer.android.com/design/ui/mobile/guides/foundations/system-bars) 和 [Predictive Back](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)。
- 原项目实际参考：[NetProxy MainBottomBar.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/navigation/MainBottomBar.kt)；[AdaptiveTopAppBar.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/core/ui/component/AdaptiveTopAppBar.kt)；[MainActivity.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/MainActivity.kt)。

**核心设计边界：shadcn/ui 负责组件视觉与可访问性原语，Android 规范决定导航、标题、返回、触摸、窗口与生命周期。两者没有冲突；不能用 Material 3 配色或桌面 Web Dashboard 替代 Android 交互。**

## 4. CI 验收

在 `web/` 执行：

```bash
npm ci
npm run check:ui
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright 覆盖 393×852 Android 手机、1024×768 Android 平板、1440×900 桌面，包括底部/侧栏导航、详情返回、原生式 Sheet 返回、会话状态保留、深色切换及页面层级。CI 截图作为 Actions Artifact。

**重要限制：此报告不宣称 GitHub Pages 是真正的 Android 原生 APK，也不宣称通过实机辅助功能、输入法和预测性返回认证。** 正式上架或集成 Android 宿主时必须追加设备端系统行为测试。
