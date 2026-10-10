# NiPath 1.0 · Android 原生体验设计规范（Material 3）

> 修订日期：2026-10-10  
> 范围：Android 紧凑尺寸 UI、Android 原生客户端演进方向  
> 状态：**移动端交互设计已落地到 WebUI 演示；Jetpack Compose 原生工程仍属待决策事项**  
> 不改变已有 NiPath 1.0 原生 sing-box JSON 唯一事实源原则。

## 1. 问题与设计选择

把 shadcn/ui 桌面 Dashboard 的 Sidebar、双栏页面、密集表格直接响应式缩小到手机，并不能产生 Android 原生体验：失去底部主导航、常用动作必须先打开侧栏、输入控件难以单手触达、页面/子页面缺少明确的返回语义。

因此区分两个展示层：

| 展示环境 | 当前实现 / 目标 | 导航与交互 |
|---|---|---|
| 桌面 WebUI / Tauri Desktop | React + shadcn/ui 官方 New York v4 | Sidebar、Table、Tabs、Dialog；保留原版 |
| GitHub Pages 手机预览 / Android WebView 原型 | React + Android 专用页面 + Material 3 交互模式 | 底部 NavigationBar（5 个入口）、顶部 AppBar、二级详情页、FAB、ModalBottomSheet |
| **正式 Android 原生管理器（建议单独 ADR）** | **Kotlin + Jetpack Compose Material 3**，共享 Go Core 的业务 API、鉴权和平台 Service | 真正使用 Compose Scaffold、NavigationBar、TopAppBar、ModalBottomSheet、WindowInsets、预测性返回等系统集成 |

本轮**没有**创建 Compose 工程或修改既定 Tauri 平台方案；第三行是基于“Android 应像真正原生应用”的设计诉求提出的演进建议，须由项目维护者确认架构成本。WebUI 原型不会被误称为 Android 原生应用。

## 2. GitHub Pages 已落地的移动端结构

源码：
- [web/src/mobile/AndroidApp.tsx](../web/src/mobile/AndroidApp.tsx)
- [web/src/mobile/android.css](../web/src/mobile/android.css)
- [web/src/App.tsx](../web/src/App.tsx)

页面视口 **小于 840 CSS px** 时显示 Android 专用结构；较大窗口继续使用 shadcn Dashboard。Android 横屏/平板的 NavigationRail 自适应应在后续工程版本实现。

```text
Android compact Scaffold
  ├─ Top App Bar（64 dp；考虑 status bar inset）
  │   ├─ 主页面：标题 / 帮助
  │   └─ 二级页面：Back / 标题
  ├─ 滚动内容（唯一滚动容器）
  │   ├─ Overview
  │   ├─ Proxies / ProxyDetail
  │   ├─ Resources
  │   ├─ Rules
  │   └─ Settings / JSONDetail / About
  ├─ Floating Action Button（代理组、资源、规则）
  ├─ Navigation Bar（顶层五个目的地；80dp + bottom inset）
  └─ Modal Bottom Sheet（新建策略组/订阅/规则）
```

**主页面：** 底部导航永久可见，一次点击切换概览、代理、资源、规则、设置。当前项目共 **5 个等层级目的地**，适用于 Android 官方 Material 3 NavigationBar 的 3–5 目的地建议。

**二级页面：** 点击某个策略组或进入原生 JSON 配置时，展示明确的返回按钮，暂时隐藏底部导航；浏览器历史栈用于演示 WebView 的系统返回语义。

**适配：** UI 内容避开顶部状态栏与底部手势导航区域；实际 Android 宿主仍须确保系统 WindowInsets 正确传入 WebView。颜色使用 Material 3 baseline tonal palette 和深色表面，触摸目标约 48dp 或更大，避免密集桌面表格。

## 3. 五个主页面（Android-specific UX）

| 页面 | 首屏优先展示 | 主要操作 | 二级页面 |
|---|---|---|---|
| 概览 | 大状态区域、模拟启停、上/下行、服务状态 | 启停、跳转代理与资源 | 暂无 |
| 代理 | 组列表 + 搜索 + 添加 FAB | 点击进入组；详情里 Selector 才能点选候选；URLTest / LB 只显示自动模式 | 组详情，返回后回到组列表 |
| 资源 | 订阅/节点分段按钮，条目列表与同步状态 | 刷新订阅；新增经底部 Sheet 提交 | 将来补资源编辑详情 |
| 规则 | 路由/DNS 分段，开关直接启停 | 新建规则 FAB + 底部 Sheet | 将来补规则详情 |
| 设置 | Android Preference 风格分组行 | 深色模式、原生配置、安全与关于入口 | JSON 全屏编辑与关于页 |

## 4. 交互合同

### 底部导航

- 每个目的地由图标 + 中文标签构成；选中目的地采用 Material 3 胶囊指示背景，不把导航藏在 Hamburger Drawer。
- 保持五个入口顺序固定：概览、代理、资源、规则、设置；不使用第六个“更多”。
- 点击时切换已存在的统一 Zustand 演示状态（以后通过统一 Go Core API），不重新初始化订阅和配置数据。
- 二级页面隐藏底部导航，但必须提供返回按钮与系统返回处理。真实原生实现应接入 Android BackHandler、predictive back/生命周期。

### 内容与底部操作

- 主内容滚动容器与固定 BottomBar 分离；FAB 固定在 BottomBar 上方。
- 新建操作使用底部操作面板，输入、校验、取消与提交均需要有反馈，键盘弹出时不能遮挡确认按钮。
- 严格区分配置编辑、客户端命令、运行时观测；Demo 不应宣称已接管网络。
- Selector 可以选择当前节点；URLTest TCP/UDP 可能独立选择；LoadBalance 没有全局当前节点。

### 状态展示

- 核心未启动：按钮和历史统计必须标“演示/非实时”。
- 订阅更新：下载、解析、内核接管分别显示；未获引擎确认不展示“已生效”。
- JSON 编辑：明确演示 Schema 校验与正式 sing-box 校验不同。

## 5. 正式原生 Android 的建议架构（需 ADR）

如果目标是*真正 Android 原生 UI* 而非“像原生的 WebUI”，建议：

```text
Jetpack Compose Material 3 UI
  ├─ NavigationBar / NavHost / AppBar / ModalBottomSheet
  ├─ Android ViewModel + StateFlow
  └─ Typed NiPath Core Client (HTTP/gRPC via bounded bridge)
        |
        v
Android Foreground/VpnService OR Root Daemon
        |
        v
NiPath Go Core -> sing-box
```

- 与桌面 React 共享**协议、状态模型和后台逻辑**，不是强行共享 UI 组件。
- Android 系统授权、VpnService、通知、前台服务、权限/Root 操作留在 Kotlin/系统层；WebUI 无任意高权限入口。
- 支持系统动态配色（Dynamic Color）、系统字体缩放与 accessibility、TalkBack、预测性返回、真正 WindowInsets/导航手势。
- 代价：需要维护 Compose 与 React 两套 UI。项目应综合 1.0 工程资源作 ADR 选择；目前只提交了独立的 React Android 界面作为快速可体验原型。

## 6. 验收条件

1. 393×852 Android 手机视口能看到全部五个底部导航项，选中状态正确；操作栏不压住内容。
2. 点击代理组进入详情时底部导航隐藏，点击返回恢复；浏览器 Back 可返回上一层。
3. 订阅添加/规则添加从底部弹出，提交或取消后正常关闭。
4. 深色模式切换后移动端表面、文字和导航区域均跟随变化。
5. 1440px 桌面版仍采用 shadcn Dashboard 的 Sidebar，不出现手机底部栏。
6. 核心没有连接时所有演示数据明确标注；没有真实的系统网络修改。

官方依据：
- Android Developers — [Layouts and navigation patterns](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns)
- Android Developers — [Navigation bar](https://developer.android.com/develop/ui/compose/components/navigation-bar)
- Android Developers — [Window Insets](https://developer.android.com/develop/ui/compose/system/insets)
- Android Developers — [Use Material 3 insets](https://developer.android.com/develop/ui/compose/system/material-insets)
