# NiPath 1.0 WebUI — 页面视觉、信息架构与交互规格（Design v1.0）

> 设计日期：2026-10-10  
> 状态：**设计提案 / 可交互视觉原型，不是已实现的生产系统**  
> 目标产品：NiPath 1.0.0；当前正式架构基线：`ARCHITECTURE.md v1.5`  
> 关联原型：[交互式 HTML](prototypes/nipath-webui-v1.0.html)（无需安装依赖即可查看）  
> 设计原则：**让复杂的网络控制在底层发生，让用户只看见简单而准确的操作**。

## 0. 依据、技术栈和设计范围

### 0.1 已经确定的 WebUI 工程栈

| 分层 | 已规划的选型 | 页面落地方式 |
|---|---|---|
| 框架 | React + TypeScript | 组件化、类型安全；业务页面只保留一套 |
| 构建 | Vite | 静态 dist 由 Go `embed` 内置，浏览器和 Tauri 共享 |
| UI 基座 | **shadcn/ui + Tailwind CSS** | 可直接拥有组件源码，按 NiPath Tokens 做主题定制 |
| 组件底层 | shadcn/ui 支持的无障碍原语 | Dialog / Sheet / Popover / Dropdown、键盘操作及焦点管理 |
| 图标 | **Lucide React**（建议确定） | 全页面统一 1.75px 笔画、18–20px 常规尺寸 |
| 异步服务端状态 | TanStack Query | Core 快照查询、乐观状态及变更后失效；SSE 有界推送 |
| 界面临时状态 | Zustand | 导航、偏好、面板展开，不复制 Core 配置及运行时事实 |
| 表单 | React Hook Form + Zod | 分步骤录入、错误定位、字段约束及跨页面一致性 |
| JSON 编辑器 | Monaco / CodeMirror 6 待 P0 性能测试 | **优先验证 CodeMirror 6**：移动端与低内存端负担更小；必须保留未知字段和注释 |
| 实时图表 | ECharts / uPlot 待 P0 比较 | **优先验证 uPlot** 处理频繁流量序列；复杂分析图再比较 ECharts |
| 路由 | 类型化路由库（待工程确定） | URL 深链接 `/proxies/:tag` / `/resources/:id`；不能只依靠未持久化内存 |
| 桌面/移动外壳 | Tauri 2 | 只负责系统窗口和受限原生能力，**不开发另一套 UI** |

**本仓库 HTML 原型是零依赖视觉与流程演示，不是已安装 shadcn/ui 的 React 产品源码**。它主要确定页面结构、视效、状态与入口；正式开发时将以 React + shadcn/ui 重新组件化，不应把原型代码复制成生产服务层。

参照：官方 [shadcn Vite 安装](https://ui.shadcn.com/docs/installation/vite)、[Sidebar](https://ui.shadcn.com/docs/components/base/sidebar)、[TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react)。

### 0.2 产品信息架构（5 个主导航）

```text
NiPath
├── 概览 Overview
│   ├── 服务状态 / 启停 / 接管模式
│   ├── 实时流量 / 连接统计 / 运行时间
│   ├── 当前出口摘要 / 最近连接 / 资源健康
│   └── 日志与诊断 → 详情抽屉
├── 代理 Proxies
│   ├── 策略组列表（来自唯一 sing-box JSON）
│   ├── 组详情：成员、协议、来源、延迟、嵌套关系
│   ├── Selector 运行时切换 / URLTest 测速 / LB 策略展示
│   └── 创建 / 编辑 / 删除策略组 → 同一 JSON 事务
├── 资源 Resources
│   ├── 订阅：来源、刷新、流量用量、到期、应用结果
│   ├── 本地节点：添加、编辑、移除和链接导入
│   └── 全部节点：搜索、来源筛选、节点被哪些组引用
├── 规则 Rules
│   ├── 路由规则：顺序、条件、目标、启用
│   ├── DNS 规则：域名分类与解析目标
│   └── 匹配测试：静态预览与有能力时的引擎诊断
└── 设置 Settings
    ├── 通用 / 内核与接管 / DNS 与网络
    ├── 原生 JSON 编辑 / 配置校验 / 差异与恢复
    ├── 安全与访问 / 外观 / 关于与诊断
    └── Host 能力决定设置项是否存在
```

**不要创建“普通 / 高级 / 托管 / 专家”配置模式。** 仅提供一个配置文件和两个自然的编辑入口：页面可视化表单 + 原生 JSON 编辑器。应用配置与运行时选择是不同的事务。

## 1. 视觉设计系统（NiPath UI Tokens v1.0）

**品牌性格**：轻盈、干净、技术专业但不冰冷。采用亮色为主、深色可切换；默认高信息密度、卡片圆角适中。允许 NP 吉祥物在首页空态/欢迎页出现，不让吉祥物占据核心可视空间。

| Token | 浅色预案 | 深色预案 | 用途 |
|---|---|---|---|
| Brand / Primary | `#3678EF` | `#6499FF`（建议） | 主要动作、选中态、链接 |
| Background | `#F5F7FB` | `#111726` | 应用全局背景 |
| Surface | `#FFFFFF` | `#1A2335` | 页面卡片、侧栏与 Dialog |
| Border | `#E6EAF2` | `#2B3851` | 分隔与结构 |
| Foreground | `#18223A` | `#E6EDFB` | 正文文字 |
| Muted | `#8190A5` | `#9CAFC8`（建议） | 次级文字 |
| Success | `#16B68A` | 同一状态语义 | 实际 ready / 可信成功 |
| Warning | `#EC9A25` | 同一状态语义 | stale / 部分应用 / 待检查 |
| Danger | `#E65C67` | 同一状态语义 | 停止动作、错误、失败 |
| Surface Radius | `16px` | 相同 | 外层卡片 |
| Control Radius | `9–11px` | 相同 | Button、Input、Tabs |
| Spacing | 4px 基础网格，8/12/16/24/32 | 相同 | 响应式容器 |
| Sidebar | 242px（窄屏可收起） | 相同 | 桌面主导航 |
| Max Content | 1470px | 相同 | 防止宽屏内容散开 |

文字：中文优先系统字体 PingFang SC / Microsoft YaHei，英语数字采用 Inter 系字体回退；正文 12–14px，页面标题 24–28px，细节 10–12px（实施时注意可访问性，不能把所有功能正文缩到 10px）。

**性能与可访问性**：WCAG AA 对比度目标、44×44px 触摸目标、完整键盘操作及屏幕阅读器提示，支持 `prefers-reduced-motion`。不可只通过颜色表达故障或选择；所有延迟、流量应有单位/时间戳；深色模式、系统缩放 125%/150%、200% 文本应验证布局。

## 2. 桌面与手机布局

### 桌面布局 ≥ 1024px

```text
┌─────────242px 侧栏─────────┬──────────────────────── 业务工作区 ──────────────────────────────────────────────┐
│ NiPath 1.0                 │ Breadcrumb / 设备/Core 身份状态 / 搜索 / 主题 / 通知                       │
│                           ├───────────────────────────────────────────────────────────────────────┤
│ ● 概览                    │ [页面标题] [一句话描述]                         [主要操作按钮]         │
│ ○ 代理                    │                                                                       │
│ ○ 资源                    │   当前功能主要内容（Card / Split Panel / DataTable / Dialog / Sheet）    │
│ ○ 规则                    │                                                                       │
│ ○ 设置                    │                                                                       │
│                           │                                                                       │
│ Core 状态 / 修订版本      │                                                                       │
└───────────────────────────┴───────────────────────────────────────────────────────────────────────┘
```

- 页面标题左侧，主要动作右侧；不要让顶栏被每个页面重复的高权限入口挤满。
- Proxies：左组列表 + 右组详情；Resources：Tab + 列表/卡片；Rules：规则顺序与规则详情；Settings：二级设置侧栏。
- 1440×900 为桌面主要视觉验收画布。固定高宽和极宽窗口都要能正常使用。

### 手机布局 < 780px

```text
┌─────────────────────────────────────────┐
│ 工作空间 › 当前页面           搜索  设置 │
├─────────────────────────────────────────┤
│ 页面标题 + 核心按钮                       │
│                                         │
│ 可滚动页面内容                           │
│ 关键状态优先；多列卡片转单列               │
│                                         │
│ 策略组点开后 → 单独详情 + 返回             │
│                                         │
├─────────────────────────────────────────┤
│ 概览   代理   资源   规则   设置           │
└─────────────────────────────────────────┘
```

- 390×844 和 360×800 为最小主要验收画布，底栏固定，并考虑安全区。
- 策略组：**列表 → 详情单页**，不让用户滚过全部卡片才到成员详情；二次筛选使用 Sheet。
- 高频数据在背景页面停止/节流；首屏必须优先状态与主要动作；不复制第二套移动端状态管理。

## 3. 五大页面详细设计与操作逻辑

### 3.1 概览 / Overview

**主任务**：3 秒内理解“服务是否真的在工作、正在由什么接管网络、流量如何、我需要操作什么”。

| 区域 | 展示 | 主操作 | 数据源与状态要求 |
|---|---|---|---|
| 服务主卡 | stopped / preparing / starting / ready / stopping / failed；Host、Capture、引擎版本 | 启动/停止（失败可重试） | Core Runtime Supervisor，不根据按钮提交成功即变绿 |
| 实时统计 | 下行/上行速率、累计流量、活动连接数 | 时间窗口调整 | sing-box API → Core 事件聚合；展示采样时间 |
| 流量趋势 | 2 分钟/15 分钟/1 小时曲线 | 改时间尺度 | 有界时间序列；失联进入 stale |
| 当前出口摘要 | 命中的主策略组、候选出口、协议与来源 | 打开代理页面定位组 | 不将主组所选等同所有连接出口；URLTest 可 TCP/UDP 不同 |
| 最近连接 | 目的域名、协议、出站、连接时长/速率 | 查看全部、关闭指定连接 | 精确能力受 engine API 限制；无数据空态 |
| 资源健康 | 订阅数、节点数、最近更新、部分失败数量 | 跳转资源页 | Catalog 统计 + Provider 应用状态；失败可诊断 |

**关键流程**：
1. 首次访问读取 Core manifest / runtime status / capabilities；未能连接 Core 显示“无法连接管理服务”，不伪造“代理未运行”。
2. 点击启动：二次确认仅在需要授予 VPN / 网络控制等高风险权限时触发；按钮为 `preparing → starting → ready`，ready 要有 capture 接管和引擎就绪依据。
3. 点击停止：表现为 `stopping`，防重复请求，确认已清理 Host 接管后变为 stopped。危险的系统级网络收尾失败必须可见。
4. 统计加载中显示 Skeleton；断开显示“数据更新中断，上次观测：时间”；不使用 0 替代未知。

### 3.2 代理 / Proxies

**主任务**：“有哪些策略组、各自会用哪些节点、当前到底怎么分流、怎么切换”。

**页面区域**：标题/新建组/全部测速 → 策略组卡片列表 → 组详情 → 成员搜索、来源、延迟、当前结果、健康与嵌套关系 → 编辑 Drawer。

| 对象 | 内容 | 操作行为 |
|---|---|---|
| 组卡片 | 名称、类型、候选数、简要策略、来源类型、健康提示 | 点击桌面右侧展开、手机进入详情 |
| Selector | 当前选中的 child tag，默认值、缓存选择和成员清单 | 点成员 → Core Select RPC → pending → 引擎确认 → 显示生效；失败回滚 |
| URLTest | 自动选优、筛选条件、延迟新鲜度、TCP 与可能不同的 UDP 路径 | 点击测速 → RPC 接收并不等于完成 → 等结果推送；没有“强行手选” |
| URLTest fallback | `fallback.enabled`、最大延迟与候选优先级 | 仅在 fork 支持时显示设置；说明不是单独一个 outbound 类型 |
| LoadBalance | round-robin / consistent-hashing / sticky-sessions；TTL 与候选 | **不显示全局当前节点**；展示连接级行为与诊断 |
| 自定义编辑 | 名称/tag、类型、成员包含/排除、Provider 来源、URLTest 参数 | 修改唯一 JSON；保留无法编辑的未知字段；必须经过验证与 revision 校验 |
| 嵌套组 | 组引用图谱与成员去向 | 检查环依赖/失效引用；不能暗中直连 |

**核心数据关系**：列表来自唯一原生 JSON `outbounds`；成员配置来自 JSON + Provider/Catalog；运行时从 Engine `SubscribeGroups` 补充。注意部分空组会被引擎实时 API 省略，因此不能只靠 API 画组。

**选择流程**：`未选 → 点击 → pending(锁定交互/显示目标) → RPC 已接收 → 订阅确认/快照确认 → committed`，任何超时/无响应恢复旧状态并提示可重试。

**筛选流程**：用户选“香港”、某订阅、某协议 → 展示实时匹配预览和目标 tag → 提交 JSON 事务后校验实际匹配；fork 中 `include/exclude` 匹配的是 Provider 完整 tag，不是仅节点显示名。不能误导用户。

### 3.3 资源 / Resources

**主任务**：导入订阅、管理本地节点、理解资源是否真正更新生效。

分为三个 Tab：**订阅 / 本地节点 / 全部节点**。

| Tab | 可见字段 | 主动作 | 限制 |
|---|---|---|---|
| 订阅 | 名称、URL 脱敏、节点数、最后下载、用量、到期、Provider 应用状态 | URL 导入、刷新单个/全部、暂停自动更新、编辑、删除 | 刷新下载成功不等于应用成功；删除前提示引用影响 |
| 本地节点 | 名称、协议、服务器脱敏、验证情况、相关策略组 | 新建、链接导入、编辑、复制、安全删除 | JSON 的敏感密钥不应默认直接完整展示 |
| 全部节点 | 名称、来源、协议、延迟时间戳、健康、被引用的组 | 搜索、协议筛选、来源筛选、查看引用 | “节点在线”必须有真实观测依据，展示离线/未知 |

**导入订阅 Wizard**：
1. 粘贴 URL，选择可选名称 → Core 验证 URL 与读取权限（禁止 SSRF 指向本地管理地址），标记权限边界。
2. `fetching` → `parsing` → `validated`；展示发现节点数/不支持项，而不是导入前就显示成功。
3. 生成候选 Provider；实验阶段 Core→Local Provider 优先，但单下载 Owner 尚需 ADR 确认。
4. `staged/applying` → **真实 ACK** 才能显示 `applied`；部分节点成功时 `partially_applied` + 查看详情与修复入口。
5. 删除订阅前检查策略组直接成员与动态引用；不自动改写用户的策略组语义。

**“源与节点事实源”的约束**：NiPath v1.5 尚未最终决定 Native Remote Provider 与 Core Local Provider 的下载归属。**页面流程不可依赖一个尚未批准的特定实施**：只展示统一资源模型与真实应用状态。

### 3.4 规则 / Rules

**主任务**：用户不写 JSON 也能修改路由与 DNS，但高级用户始终能直接编辑同一个 JSON。

| 视图 | 元素 | 交互 |
|---|---|---|
| 路由规则 | 顺序编号、名称、原生匹配简述、出站 tag、启用状态 | 新建、排序、编辑、停用、删除；保存前校验对象引用 |
| DNS 规则 | 域名/规则集、目标 DNS 服务器 | 新建/编辑、优先级、与路由联动提示 |
| 匹配测试 | 测试域名/IP/协议/应用信息（能力存在时） | 静态规则预览；真正流量命中只能使用经验证的引擎诊断，不伪造“实际命中” |
| 原生编辑入口 | 配置源修订号 + “查看 JSON” | 跳设置 → 原生编辑器对应配置位置 |

**规则保存**：表单数据 → 根据单一 JSON AST/结构做无损字段编辑 → preview diff → `If-Match` revision → 校验 schema 与 outbound tag → staging → 应用 → 验证；冲突时提示“配置已被其他入口更改，重新对比”，不覆盖新版本。

排序时保留原规则字面语义、未知字段和原生顺序。对于无法安全可视化的规则直接显示“在 JSON 中编辑”，**不自动删除/忽略**。

### 3.5 设置 / Settings

**主任务**：将低频系统配置与日常代理操作分开，避免首页堆参数。

| 组 | 关键功能 | 行为说明 |
|---|---|---|
| 通用 | 开机状态恢复、订阅更新计划、通知/日志级别 | 保存用户偏好，实际运行策略由 Core 实施 |
| 内核与接管 | Host、Capture eBPF/Root TUN/VPN TUN/System Proxy、引擎版本、能力检查 | 仅展示当前平台真实可用的 Capture；切换网络接管必须走生命周期状态机 |
| DNS 与网络 | DNS 规则入口、IPv6 能力、系统代理控制、路由覆盖信息 | **不创建第二份 DNS 事实源**，无法支持的设置不可点击或不显示 |
| 原生配置 | sing-box JSON、Schema 提示、校验、diff、保存/回滚 | Monaco/CodeMirror 待性能验证；保存与代理/规则共用 revision |
| 安全与访问 | 本地 WebUI 会话、配对、远程访问（默认关闭）、会话失效 | 禁止网页获得 sing-box secret 或任意 Root Shell；CSRF/Origin/Host 严格校验 |
| 外观 | 系统/亮色/深色、界面密度、语言 | Zustand 仅保存 UI 偏好；Root/Browser/Tauri 同页 |
| 关于/诊断 | 版本与 build fingerprint、API 能力、日志导出、许可证与开源贡献入口 | 导出隐私脱敏；不在默认日志泄漏订阅凭据 |

**原生编辑器操作**：载入快照 → 修改 → 本地语法检查 → 服务器 fork Schema 检查 → 与服务器 revision 对比 → 预览有效配置差异 → 事务保存并应用 / 失败恢复。不要保存表单表达不了的字段时默默丢弃扩展信息。

## 4. 首次使用、全局交互和故障状态

### 首次使用（只进行必要引导，不新增配置模式）

```text
欢迎 NiPath → Core 能力检查 → 选择/确认设备网络接管方式（仅可用项）
              → 导入订阅或添加本地节点 → 生成最小默认 sing-box JSON
              → 用户确认启动 → ready → 概览
```

- Android VPN 必须出现系统 VpnService 授权页；Android Root 根据实际授权结果显示能力；Windows/Linux 的 TUN/驱动/管理员要求按平台分支。
- 用户跳过资源导入时仍能查看页面和 JSON；不能假装订阅存在。
- 默认策略组仅能在首次创建原生配置时形成，不是 UI 写死的页面常量。

### 全局状态矩阵

| 场景 | 页面显示 | 可操作 | 禁止事项 |
|---|---|---|---|
| Core 不可达 | 无法连接 Core、重试与本机服务指引 | 重试 / 查看离线文档 | 把 Core 不可达当作代理停止 |
| Engine stopped | 静态组与可编辑 JSON；运行态显示未运行 | 编辑资源/配置、启动 | 显示“实时出口”或“在线延迟” |
| Runtime starting | 准备/加载/网络接管分段状态 | 取消支持时可取消 | 用户可反复启动导致重复 Host |
| API streaming stale | 上次时间与灰色/橙色提醒 | 刷新快照/重试 | 旧状态一直显示绿灯 |
| Subscription failed | 下载/解析/应用具体失败环节 | 重试、看错误、恢复有效版本 | 隐式全量成功或无理由切 direct |
| Partially applied | 明确部分节点生效、剩余保留旧节点 | 对比版本 / 修复 / 回退（能力验证后） | “已更新”单独绿标 |
| Invalid config | 高亮字段路径、原生 Schema 错误 | 回到编辑器或恢复上次有效配置 | 先销毁旧服务再提示错误 |
| 端口 / Capture 冲突 | 哪个宿主正在占用、需用户确认如何处理 | 检查、停止旧宿主（授权） | 自动夺取其他进程资源 |
| Offline/no history | “— / 暂无观测”，非 0 | 编辑/刷新 | 伪造测速值和流量统计 |

### Toast / Dialog / Drawer 的使用

- Toast：轻量成功、非阻塞错误；不用于高权限不可逆操作的唯一反馈。
- Dialog：删除订阅、停止可能中断系统连接、覆盖冲突等危险确认。
- Sheet（手机）/ Dialog（桌面）：创建组、导入订阅、规则编辑；编辑大 JSON 用完整页面而非小弹窗。
- Command（Ctrl/Cmd+K）：搜索组/资源/页面与已授权动作；不提供 Shell 执行入口。
- Skeleton：首次获取快照；Error 与 Empty 独立组件，不采用“全部空白”掩盖故障。

## 5. 组件落实（shadcn/ui 映射）

| NiPath 组件 | 建议基座 | 共享职责 |
|---|---|---|
| `AppShell` / `AppSidebar` | `Sidebar`、`Breadcrumb`、`Button` | 导航、Core 身份、桌面/手机布局 |
| `StatusBanner` / `RuntimeControl` | `Card`、`Badge`、`Alert`、`Button` | start/stop/readiness、告警 |
| `TrafficChart` | Card + uPlot/ECharts 待测 | 有界采样/状态区分 |
| `ProxyGroupCard` / `GroupDetail` | `Card`、`Tabs`、`ScrollArea`、`Badge` | 组状态与成员列表 |
| `NodeRow` / `NodeVirtualList` | `ScrollArea` + TanStack Virtual（建议） | ≥1000 节点列表稳定滚动 |
| `SubscriptionCard` / `ImportDialog` | `Card`、`Progress`、`Dialog`、`Input` | 更新阶段与表单校验 |
| `RuleEditor` / `RuleList` | `Card`、`Switch`、`Select`、可访问的 sortable | 规则优先级及单 JSON 事务 |
| `ConfigEditor` | 代码编辑器 + `AlertDialog`、`Diff` | JSON & Schema、修订冲突、变更预览 |
| `DiagnosticDrawer` | `Sheet`、`Tabs`、`Table` | 日志/连接/诊断，不阻塞主操作 |
| `Notifications` | Sonner、`Alert`、`Popover` | 失败恢复、异步任务与更新提示 |
| `EmptyState` / `LoadingState` | `Card`、`Skeleton`、`Alert` | 空、加载、错误、失联是四种不同状态 |

**组件边界**：UI 组件不直接 `fetch` Engine API、不调用 Tauri invoke；所有请求通过 `src/services/nipath-api` 与 Native Broker 的受控入口，后端配置与运行快照交由 TanStack Query 维护，Zustand 不做重复副本。

## 6. 生产前端目录建议

```text
apps/web/
  src/
    app/{routes,providers,AppShell.tsx}
    pages/{overview,proxies,resources,rules,settings}/
    features/
      runtime/{RuntimeControl,TrafficChart,ConnectionList}/
      proxy-groups/{ProxyGroupCard,GroupDetail,GroupEditor}/
      resources/{SubscriptionCard,ImportSubscriptionDialog,NodeVirtualList}/
      routing/{RuleList,RuleEditor,RuleTest}/
      config/{JsonEditor,DiffPreview,RevisionConflictDialog}/
    components/{ui,shared,layout,feedback}/
    services/{nipath-api,events,native-broker}/
    queries/{query-keys,query-client,cache-updaters}/
    stores/{ui-preferences,layout-state}/
    styles/{globals.css,tokens.css}
    lib/{format,validation,capabilities}
  package.json
```

关键设计原则：**单页不拥有核心生命周期**；页面发起请求，由 Go Core 协调；服务端持久状态不会被 UI 偏好状态覆盖。使用 SSE 的场景必须基于 `generation + config_revision + catalog_revision` 判断是否需要重取完整快照。

## 7. 页面数据与 API 草案（与 v1.5 对齐，最终以 OpenAPI 为准）

| 页面 | 初始数据 | 交互请求 | 实时事件 |
|---|---|---|---|
| 概览 | `/api/system/manifest`, `/api/runtime/status` | `/api/runtime/start`, `stop`, `reload` | `/api/events`：状态、流量、连接数 |
| 代理 | `/api/proxies/groups`, `/api/proxies/groups/{tag}/members` | `/api/proxies/groups/{tag}/select`，配置事务 | 组选择、测速、Provider 更新 |
| 资源 | `/api/resources/sources`, `/api/catalog/nodes` | `/api/subscriptions/refresh`，资源 CRUD 待细化 | 资源下载/解析/应用阶段 |
| 规则 | `/api/routing/rules`, `/api/config/source` | `/api/config/validate`, `/api/config/source` | config revision 变化 |
| 设置 | `/api/platform/capabilities`, `/api/config/effective`, manifest | 同一 Config API、服务权限 API 待设计 | 能力/服务状态变更 |

API 必须绑定用户身份、权限和请求修订号；不要把原生 Engine bearer secret 下发页面。Native Broker 只提供明确的 OS 原生能力。

## 8. 可交互原型已实现的行为（均为本地模拟）

可直接打开 [HTML 原型](prototypes/nipath-webui-v1.0.html)；电脑适合宽屏体验，手机浏览器也能打开。全部演示数据都是虚构示例，不会下载订阅、申请 Root、启动 VPN 或修改电脑系统代理。

**已经可点击**：5 页导航、模拟启动/停止、策略组卡片与成员选择、负载均衡提示、创建/编辑策略组、切换资源 Tab、模拟刷新订阅、添加订阅、本地节点入口、新建/启用规则、静态规则测试、设置 Tab、明暗主题、JSON 语法检查与本地修订计数、弹窗与 Toast，以及按 1～5 导航快捷键。

**尚未连接**：Go Core HTTP/SSE、真实 sing-box API、任何身份认证、真实网络资源、Schema 验证、订阅下载、VPN 授权、系统设置、持久化数据库、原生组件库及 CI。不要把原型按钮的模拟成功提示当作产品已经实现。

### 原型截图验收

- 桌面：`1440×1000`，5 页面均能渲染，无 JS runtime errors。
- 手机：`390×844`，5 页面均能渲染且无横向溢出；策略组使用列表到详情的单页面切换。
- 常见交互：切换组、选节点、新建策略组、导航与 JSON 校验有可观察反馈。

## 9. P1 前端实现优先级与验收条件

| 阶段 | 工作内容 | 验收标准 |
|---|---|---|
| UI-01 Design foundation | tokens、shadcn/ui、导航、主题、路由、能力声明 | 1440/390 双端截图与键盘/触控验收 |
| UI-02 Runtime & Overview | Core manifest、runtime 生命周期、流量/日志有界流 | 启停 pending/failed/stale 真实可靠，离线可区分 |
| UI-03 Proxies | JSON 静态组解析、Catalog/Provider 候选、Engine Group 合成 | 空组可见、手选等待确认、URLTest 与 LoadBalance 不混淆 |
| UI-04 Resources | 单订阅 owner 后统一资源查询、导入、下载/应用双阶段 | partial/failed/未知与真正 applied 严格区分 |
| UI-05 Rules & JSON | 原生配置读写、表单/JSON 共享 revision、diff/schema | 修改不丢未知字段、冲突不会覆盖数据 |
| UI-06 Native & hardening | Tauri Broker、mobile、无障碍、i18n、性能与测试 | 1000 节点不卡死、无未授权桥调用、故障可诊断 |

**优先做 UI-01 + UI-02 的真实 Go API 薄闭环，再完成 UI-03 + UI-04。** 不先开发复杂动画、可拖拽仪表盘或全屏背景美术。

---

## 最终页面设计约束

**NiPath 的简洁，是把复杂留给实现，而不是忽视复杂。** 用户只看到五个入口：概览、代理、资源、规则、设置；策略组从原生 sing-box JSON 显示，节点来源通过 Catalog / Provider 关联，运行态由 API 如实提供。全部编辑入口作用同一份原生 JSON，所有平台共用一个 React 前端；不能出现隐蔽双写、假在线、假应用成功和虚假的负载均衡“当前节点”。