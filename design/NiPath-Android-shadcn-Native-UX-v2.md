# NiPath 1.0 · Android shadcn/ui 与原生应用交互规范 v2

> **现行规范** · 2026-10-10 · 与桌面端共用 shadcn/ui 官方 New York v4 和 Neutral 主题

## 一句话决策

**UI 组件和视觉始终使用 shadcn/ui；Android 专门设计原生 App 的信息架构与行为，不套用网页的侧边栏、双栏表格或面包屑导航。**

Material 3 **视觉主题、紫色系调色板、tonal chip、专属卡片/开关样式均已移除**。Android 模块使用 shadcn/ui 官方 `Button`、`Card`、`Badge`、`Alert`、`Tabs`、`Switch`、`Input`、`Textarea`、`Sheet` 和语义主题变量 `background`/`foreground`/`muted`/`secondary`；不要再次建立独立的 `--a-*` 配色体系，也不要自写相似组件。

## 桌面与 Android 的职责

| 项目 | 桌面 WebUI / Tauri | Android 紧凑视口 / WebView 预览 |
|---|---|---|
| UI 技术 | React + shadcn/ui 官方 New York v4 | **同一套 React + shadcn/ui 官方 New York v4** |
| 主题 | 官方 Neutral Light / Dark | **与桌面共享** Neutral Light / Dark |
| 一级导航 | Sidebar（可折叠） | 固定底部五目的地导航（概览、代理、资源、规则、设置） |
| 二级导航 | 面板或桌面详情 | 独立单页、顶部返回键、系统 Back 返回上一层 |
| 输入与新建 | Dialog / desktop Form | shadcn/ui `Sheet side="bottom"` + 单列表单 |
| 长列表 | Table / multi-column | Card 分组列表和可点击整行，48px 以上触控目标 |
| 主要动作 | 页面 Header 按钮 | 页内动作和右下角 FAB 位置的 shadcn/ui Button |
| 内容区 | 宽屏 Dashboard | 独立滚动主区域，底部导航固定、不遮盖内容 |
| 权属 | 同一 Core API、原生 sing-box JSON | **没有第二套**状态/节点/配置后端 |

## 操作逻辑

1. 底部五个目的地始终直接可见；活动项通过 shadcn/ui `Button variant="secondary"` 与非活动项 `ghost` 区分，不使用 Material tonal pill。
2. 打开策略组或原生配置为二级页面，隐藏底部导航，显示顶部 Back。复用浏览器历史返回以模拟 Android 系统返回行为；正式 Android 宿主必须接入系统导航。
3. Android 操作按单手移动端设计：搜索紧靠内容、行触控区域放大、详情内直接选择、底部 Sheet 创建订阅/规则/策略组。
4. 主屏滚动区域与固定导航独立，并按 `env(safe-area-inset-top/bottom)` 处理系统栏。键盘弹出与不同高度屏幕必须用真实 Android WebView 验证。
5. 所有展示和操作经现有同一 Zustand 演示状态；后续再接 Go Core，不能复制数据源或声称 demo 操作已作用到系统。
6. Selector 可以切换，URLTest 不伪造固定出站，LoadBalance 不伪造全局节点；订阅更新阶段需等引擎真正确认才显示 applied。

## 代码约束

- [mobile/AndroidApp.tsx](../web/src/mobile/AndroidApp.tsx)：**手机专属页面、导航和交互**，使用官方 shadcn/ui 组件。
- [App.tsx](../web/src/App.tsx)：紧凑视口下挂载移动入口；大屏维持官方 shadcn Sidebar。
- [styles.css](../web/src/styles.css)：统一的官方 Neutral 主题，移动端不得覆盖配色。
- **不再维护** `web/src/mobile/android.css` 及 `.a-*` 私有组件样式。
- E2E：[android-navigation.spec.ts](../web/e2e/android-navigation.spec.ts) 验证底部五项、二级返回、Sheet、深色切换和桌面隔离。

## “像原生应用”的精确定义

这里“原生”指**用户操作行为与安卓应用相符**，不是强制改成 Jetpack Compose，也不是改成 Material 3 配色/组件体系。正式版本仍依照项目既定的跨平台 React/Tauri 方案；系统权限、VPN、Root、进程生命周期由受信任的 Android Host 和 Go Core 管理。

当前 GitHub Pages 是 Android 风格的 **shadcn/ui WebUI 原型**，不代表已经完成真正系统级预测性返回、状态栏着色或设备权限接管。这些需要 Android 宿主集成测试后才能承诺。
