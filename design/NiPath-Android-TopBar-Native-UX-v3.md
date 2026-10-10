# NiPath 1.0 Android 界面规范 v3：单一标题与原生页面层级

> 状态：**现行实现规范** · 日期：2026-10-10  
> 视觉与组件：**shadcn/ui New York v4 + Neutral 主题**（保持不变）  
> Android 交互参考：**Miuix Compose + 原 NetProxy Android 管理器源码**，不是照搬它们的视觉样式。

## 1. 研究结果：真实 Android App 如何处理标题

### Miuix Compose

- [TopAppBar 文档](https://compose-miuix-ui.github.io/miuix/components/topappbar)：普通 `TopAppBar` 支持大标题 `largeTitle` 和 `scrollBehavior`；内容滚动时标题折叠为紧凑应用栏。另有 `SmallTopAppBar` 用于紧凑场景。
- [Scaffold 文档](https://compose-miuix-ui.github.io/miuix/components/scaffold)：`topBar`、`bottomBar`、`content` 属于同一 Scaffold，滚动列表使用相应 padding/insets，标题不应被当成内容页面独立重复渲染。

这里引用的是开源 **Miuix Compose 库**的设计和代码结构，不代表它就是所有 Xiaomi/HyperOS 系统版本的官方规范。

### NetProxy 实际源码（最有价值的项目内证据）

- [AdaptiveTopAppBar.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/core/ui/component/AdaptiveTopAppBar.kt)：`<600dp` 手机使用 `TopAppBar` 大标题版本，宽屏用 `SmallTopAppBar`；同一个 `title` 参数而不是页面自己补第二个标题。
- [CatalogDashboardScreen.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/feature/dashboard/presentation/CatalogDashboardScreen.kt)：`Scaffold(topBar = TopAppBar(title = ... , scrollBehavior = ...))` + 关联 `MiuixScrollBehavior.nestedScrollConnection` 的 `LazyColumn`；真实内容从状态/流量卡片开始，没有在内容区再次写「概览」页面标题。
- [SubscriptionsScreen.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/feature/catalog/presentation/subscriptions/SubscriptionsScreen.kt)：顶部 AppBar 持有订阅标题、刷新/添加动作；内容以资源列表起始。
- [MainBottomBar.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/navigation/MainBottomBar.kt)：真正固定在主 Scaffold 的导航，不与内容同滚动。
- [MainActivity.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/MainActivity.kt)：主页面用 `HorizontalPager` 和单一底部导航，子页面有独立导航栈。
- [Navigation.kt](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/android/app/src/main/java/com/fanjv/netproxy/navigation/Navigation.kt)：类型化路由和后退栈；详情应当是下一层而不是又一个内容页标题。

## 2. NiPath 已确认的设计规则

**一个页面只能有一个由应用导航系统持有的页面标题。**

| 屏幕状态 | 顶部应用栏 | 内容开始位置 |
|---|---|---|
| 主页面，停在顶部 | **只有当前页面的大标题和必要的上下文操作**，不显示 NiPath Logo、品牌名或网页式 DEMO 顶栏；标题与操作属于同一个 AppBar | **真实业务内容**：概览直接是代理状态卡片；代理直接是搜索；资源和规则直接是分段 Tabs；设置直接是选项分组 |
| 主页面，向下滚动 | 同一 AppBar 收成小标题 `概览 / 代理 / 资源 / 规则 / 设置` | 内容正常向上滚动，已不存在另一个 H1 |
| 二级页面 | 紧凑标题 + 返回键（如 `默认代理`、`原生配置`、`关于 NiPath`） | 组类型、当前选中、候选列表等；**不再重复 H1** |
| 关于页面 | 紧凑标题 `关于 NiPath` | 品牌标识/Logo 和产品名是内容（品牌介绍），不是第二个页面导航标题 |

**标题不是 Dashboard 的网页 Header + 页面 H1 叠加。** 展开和折叠属于同一个 TopAppBar 的两种状态。

**主页面应用栏不能显示产品品牌 Logo / NiPath 字样 / 装饰性 DEMO 徽标。** 产品品牌属于启动页、关于页等品牌语境；主页面顶栏只显示当前目的地名称和必要的上下文操作。主页面顶部不应保留一行空的品牌导航栏。

### 滚动与状态约束

- Mobile TopAppBar 使用移动内容的真实滚动位置（阈值触发）；可折叠，不必依赖 CSS 自造第二个标题。
- 顶部状态栏 inset 与底部手势栏 inset 按 Android 宿主和浏览器环境适配；不能用固定像素把导航埋到手势区域。
- 底部五目的地始终固定，不参与主内容滚动；详情页隐藏底部主导航，提供返回。
- 参照 NetProxy 订阅和节点页面，添加策略组／订阅／规则的动作放在**当前页面顶部应用栏**；不同时在内容右下角再放一份 FAB，更不放一个实际无效的“帮助”按钮。
- 正式 Android 宿主系统 Back 与导航栈深度需要集成验证；GitHub Pages 的浏览器 History 仅模拟此行为。
- 后续可按 NetProxy `HorizontalPager` 补充横向滑动主页面、按标签保留滚动位置、视图缓存。但除非做过横向/纵向手势冲突测试，不得草率移植。

## 3. 实际源码修改

- [web/src/mobile/AndroidApp.tsx](../web/src/mobile/AndroidApp.tsx)
  - 主屏统一由移动壳绘制展开/收起标题；内容页面不再分别写 `概览` / `代理` / `资源` / `规则` / `设置` 标题块。
  - 每个屏幕标题始终来自一份 `destinations` 配置；没有重复字符串。
  - 二级组详情移除与 AppBar 同名的 `h1`；JSON 详情仅保留版本信息。
- [web/e2e/android-navigation.spec.ts](../web/e2e/android-navigation.spec.ts)
  - 自动检查主屏只有**一个**页面标题。
  - 滚动后展开标题隐藏、小标题显示；回滚时恢复大标题。
  - 组详情只有导航栏里的组名，不会出现重复的大标题；底部导航仍保持正确层级。

## 4. 视觉风格边界

以下是最终项目约束：

- **shadcn/ui** 的 `Card`、`Button`、`Tabs`、`Sheet`、`Input`、`Alert`、`Switch` 和 Neutral CSS Tokens 是 UI 视觉来源。
- Miuix/NetProxy **只作为 Android 操作逻辑、滚动联动、页面导航层级与系统适配的参考**。
- 禁止重新引入紫色 Material 3 页面套件，禁止恢复 `android.css`，禁止使用 `.np-*`、`.a-*` 重新造视觉组件。
- 上述交互在 React WebUI 演示中实现，不构成系统级 Android 原生绘制/权限接入完成的承诺。
