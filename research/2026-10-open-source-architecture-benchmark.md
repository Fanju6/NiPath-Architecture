# NiPath 1.0 开源项目源码对标与实施细化报告

> 调研日期：2026-10-10  
> 状态：研究报告 / 候选实施规范；**不是自动生效的架构 ADR**  
> 对标基线：[ARCHITECTURE.md](../ARCHITECTURE.md) v1.3  
> 原则：简单、可靠、原生配置单一事实源、跨平台、没有 NetProxy 历史兼容负担。

## 0. 调研结论

**最值得参照的三个项目**：
1. **sing-box 官方 API + Dashboard**：核心运行时控制协议与 WebUI 实时数据形态。
2. **sing-box for Android（SFA）**：Android `VpnService` 与 libbox 的真实对接方式。
3. **FlClash**：Android 进程内 Go + 桌面独立 Go 的实际工程、服务状态机、响应式 UI、测试与开发安全模式。

**补充参考**：
4. **Clash Verge Rev**：Tauri 2、系统服务集成、前端调用边界的静态架构检查。
5. **Hiddify**：导入多种订阅、自动更新、跨平台用户体验和国际化作为功能检查表，而不是复制其内部技术栈。

这些项目仅用于提炼可验证的工程经验，**不意味着复制源代码、照搬许可证或直接更换 NiPath 选定的 React/Tauri 技术栈**。

## 1. 源码依据：具体看到了什么

### 1.1 sing-box 官方新 API（最优先）

- 官方文档：<https://sing-box.sagernet.org/configuration/service/api/>
- 版本变化：<https://sing-box.sagernet.org/changelog/>
- 官方 Dashboard 源码：<https://github.com/SagerNet/sing-box-dashboard>
- Protobuf 定义：<https://github.com/SagerNet/sing-box-dashboard/blob/main/proto/daemon/started_service.proto>
- gRPC-Web 客户端：<https://github.com/SagerNet/sing-box-dashboard/blob/main/src/api/daemon.ts>
- 响应流状态管理：<https://github.com/SagerNet/sing-box-dashboard/blob/main/src/api/stream.ts>
- 策略组页面：<https://github.com/SagerNet/sing-box-dashboard/blob/main/src/views/GroupsView.tsx>

确认的事实：
- sing-box 自 1.14.0 起提供独立的 API service：gRPC + gRPC-Web，并非仅旧版 Clash REST API。
- `StartedService` 的可观察接口包含 `SubscribeServiceStatus`、`SubscribeStatus`、`SubscribeGroups`、`SubscribeLog`、`SubscribeConnections`、`SubscribeOutbounds`；命令包括 `SelectOutbound`、`URLTest`、`CloseConnection` 等。
- 服务返回 `Version.apiVersion`，可在连接时检查 API 能力。
- `Group` 消息返回 tag / type / selectable / selected / isExpand / items，`GroupItem` 返回 tag / type / urlTestTime / urlTestDelay。
- Dashboard 使用生成的 Protobuf 类型与 `@connectrpc/connect-web`，由 `StreamStore` 管理订阅、断线、错误、重新连接；策略组 `GroupsView` 直接使用运行时 group 订阅。
- `GroupsView` 在执行手动选择时显示临时 pending 结果，失败时回滚，不把未经确认的结果宣称为成功。

**NiPath 的工程决策建议**：
- `sing-box API` 是引擎**运行时**的首选读取/操作渠道。不要再解析核心日志获取策略组状态，也不要为这些能力实现第二套伪造协议。
- **Go Core API 和 sing-box API 是两层不同接口，不构成重复业务源。** Go Core 处理用户配置、Catalog、权限、服务生命周期、事务；Go Core 内部的 Engine API Adapter 访问 sing-box gRPC，向 React 返回业务聚合视图。
- 不建议浏览器默认直接访问 sing-box API 并持有 sing-box secret；由 NiPath 的受限 Gateway 负责调用与事件聚合。
- 对新 API 采用**生成的 Protobuf 客户端**，不要像早期项目一样长期维护手工字节编码；锁定版本并增加协议兼容/能力探测测试。
- 不要把 `SubscribeGroups` 当作持久策略组事实源：核心停止时必须从同一份用户原生 JSON 解析静态组定义，运行时只补充状态。
- 保留 `last-known`、`loading`、`stale`、`disconnected` 的明确状态；断流应重订阅，并按服务启动身份清理旧状态。
- 官方 API 的空 `secret` 表示无鉴权，官方文档记录了宽松的 CORS 默认值；NiPath 必须显式设置自己的 localhost 访问、认证和 Origin/Host 限制，不得套用裸默认配置。

### 1.2 SFA：Android 非 Root VPN 的最佳源码参考

- 代码仓库：<https://github.com/SagerNet/sing-box-for-android>
- VPNService：<https://github.com/SagerNet/sing-box-for-android/blob/dev/app/src/main/java/io/nekohasekai/sfa/bg/VPNService.kt>
- PlatformInterfaceWrapper：<https://github.com/SagerNet/sing-box-for-android/blob/dev/app/src/main/java/io/nekohasekai/sfa/bg/PlatformInterfaceWrapper.kt>
- 组状态 ViewModel：<https://github.com/SagerNet/sing-box-for-android/blob/dev/app/src/main/java/io/nekohasekai/sfa/compose/screen/dashboard/groups/GroupsViewModel.kt>

确认的实现：
- Android `VPNService` 实现 libbox 的 `PlatformInterfaceWrapper`；`openTun(TunOptions)` 根据地址、DNS 和路由创建 TUN 并返回文件描述符。
- `autoDetectInterfaceControl(fd)` 调用 Android `protect(fd)`，防止代理出站流量再次进入 VPN。
- 系统 VPN 撤销经 `onRevoke()` 转为服务收尾流程。
- 分应用包含/排除通过 `VpnService.Builder.addAllowedApplication/addDisallowedApplication`，并处理包未安装等异常。
- 组列表的 ViewModel 消费 command/service 状态，不在 UI 层直接管理内核生命周期。

**NiPath 的工程决策建议**：
- Android VPN 采用 Kotlin `VpnService` + Go/native libbox 运行宿主；测试真实 FD 生命周期、保护回调、Android 版本差异、网络切换、撤销与重启。
- VPN 应用后台生命周期不由 Tauri WebView 负责；窗口关闭后服务应能继续运行。
- Android Root Host 和 Android VPN Host 可以共享 Go 业务代码，但必须拥有不同的网络控制与权限边界。
- 强制在 P0 测试 TCP、UDP、DNS、IPv6、VPN 自身连接防回环、切换 Wi-Fi/蜂窝、撤销恢复和 Always-on VPN。

### 1.3 FlClash：跨平台运行时和 UI 体验的参考实现

- 仓库：<https://github.com/chen08209/FlClash>
- 详尽架构说明：<https://github.com/chen08209/FlClash/blob/main/.agents/architecture.md>
- Android VPN 实现：<https://github.com/chen08209/FlClash/blob/main/android/service/src/main/java/com/follow/clash/service/VpnService.kt>
- 策略组卡片：<https://github.com/chen08209/FlClash/blob/main/lib/views/dashboard/widgets/proxy_groups.dart>
- 主面板布局：<https://github.com/chen08209/FlClash/blob/main/lib/views/dashboard/dashboard.dart>

确认的实现：
- Android 的 Go Core 通过 `go build -buildmode=c-shared` 编译为进程内库，Android 服务插件持有 JNI 边界；桌面版是单独 Go 进程。
- 桌面 IPC 使用 Linux/Unix socket 与 Windows named pipe；进程启动通过 session ID、PID、所有权租约/连接代数对齐。
- `DesktopCoreLifecycle` 使用最新意图修正器（desired-intent reconciler），合并重复 start/restart，区分 applied/coalesced/superseded，避免多个并发启停命令互相覆盖。
- Android VPN 创建 TUN 后立即交给 Core；若 Core 拒绝接管 FD，就撤销 TUN，防止系统路由被留在没人消费的虚拟接口。
- 策略组 Widget 有列表→成员详情、选中项自动定位、虚拟化长列表、选中高亮、延迟显示。
- 仪表盘采用可定制的部件注册与布局。布局/性能/状态管理、Android 服务和桌面 IPC 都有专门测试。
- 开发用 Safe Mode 禁用改变系统 DNS、代理和 TUN 等动作，避免调试版破坏正在工作的正式版。
- 路由探测结果会随着配置、节点选择和网络变化变为过期，避免页面显示一个已经失效的“出口 IP”。

**NiPath 的工程决策建议**：
- 引入**单所有者生命周期状态机**：请求 `start/stop/restart` 是意图，完成时必须有真实运行时就绪证据；禁止只要子进程 PID 存在就宣布“运行中”。
- 最新意图优先、同类操作合并；每次核心实例包含 generation/session ID，旧实例事件不得覆盖新状态。
- P0/开发构建提供可选择的 **No-Network-Mutation / Safe Mode**，可打开 UI、编辑与验证配置，但不可改宿主代理/路由/DNS/TUN。此模式是内部开发安全选项，**不是面向用户的第二套配置方式**。
- UI 采用一致的响应式卡片与高信息密度：代理页使用策略组卡片，组详情展示成员、来源、延迟、当前选择；仪表盘可后续增加可配置组件，但不应在首发浪费精力制作复杂拖拽编辑器。
- 高频流量、日志和连接事件需要限流/合并/可见时订阅；隐藏或无人订阅时不应无界缓存事件。
- 不能把某个跨平台框架的生命周期实现逐行翻译到 Tauri；借鉴设计原则，再由 Go Core + Kotlin/Rust 平台宿主落实。

### 1.4 Clash Verge Rev：Tauri 桌面、架构门禁与服务集成

- 仓库：<https://github.com/clash-verge-rev/clash-verge-rev>
- 架构校验脚本：<https://github.com/clash-verge-rev/clash-verge-rev/blob/dev/scripts/check-architecture.mjs>
- 主文档：<https://github.com/clash-verge-rev/clash-verge-rev/blob/dev/README.md>

确认的实现：
- 基于 Tauri 2 与 Rust 提供桌面集成、内核/系统服务管理。
- 提供有代表性的前端架构门禁：`invoke` 只允许在 `src/services` 内出现，Tauri `listen/emit` 只允许在统一事件总线目录出现。源码中的 `check-architecture.mjs` 会扫描并在违反时使 CI 失败。
- 文档明确区分开发服务/正式服务/sidecar 的启动行为，避免开发构建破坏已安装服务。

**NiPath 的工程决策建议**：
- React 应将网络请求和原生桥接集中在 `src/services`，用 ESLint / dependency-cruiser 或定制静态检查阻止页面直接调用 Tauri invoke、任意 HTTP、sing-box secret。
- 宿主原生能力必须由明确、窄接口发放，不能把任意 Shell/Root 暴露给页面。
- Tauri 从 Go Core 的 localhost HTTP 服务加载 WebUI，**属于远程来源权限模型**。应优先研究受信任的本地 bootstrap / 独立权限桥，只有最小的 Native Commands 给业务 WebUI。
- Tauri 官方安全说明：<https://v2.tauri.app/security/capabilities/> 特别警告 Linux/Android 下 iframe 与页面权限隔离的限制；该问题是 P0 阻塞项，不能默认认为 localhost 就可信。

### 1.5 Hiddify：功能覆盖与用户体验参考

- 仓库：<https://github.com/hiddify/hiddify-app>

README 已确认它提供跨平台、订阅/链接导入、自动更新、测速、流量及到期信息展示、国际化、多种外部格式适配。对 NiPath 的价值主要是：
- 把“资源”作为统一的管理入口，导入后不强迫用户理解内部 Catalog/Provider。
- 让订阅状态（刷新时间、用量、到期、更新错误）、代理状态（策略组/延迟）、诊断状态（连接/日志）各有清晰位置。
- 导入/解析错误明确分为网络失败、格式不支持、无节点、无效配置、凭据问题，不用笼统的“导入失败”。
- 保持单一 JSON 配置方式，不照搬其他客户端的配置模式/高级模式分裂。

## 2. 推荐 NiPath 1.0 的运行架构细化

```text
React WebUI（浏览器 / Tauri 中为同一业务 UI）
      |
      | HTTPS/localhost HTTP + auth + SSE，客户端不持有 sing-box secret
      v
NiPath Go Core（唯一管理入口 / 应用业务服务）
      ├── Catalog：订阅与本地节点；source_id/node_id
      ├── Config Document：一份原生 sing-box 用户 JSON
      ├── Config Composer：把 Catalog 派生 Provider 纳入生效配置
      ├── Config Transaction：revision/validate/atomic commit/rollback
      ├── Engine Client：官方 sing-box gRPC Protobuf
      ├── Lifecycle Supervisor：单所有者 + session generation
      ├── Event Hub：有限缓冲/事件合并/断线重同步
      └── Platform Host：Root / Android VPN / Windows / Linux
                         |
                 sing-box / libbox data plane
```

### 2.1 数据权属（不得重复存储）

| 问题 | 唯一主要来源 | 可以派生但不能回写成第二个事实源 |
|---|---|---|
| 存在哪些用户订阅、本地节点 | Catalog | 资源视图与生成 Provider |
| 用户有哪些策略组和路由规则 | 原生 sing-box JSON | 代理/规则页面表单与静态解析快照 |
| 运行时哪个组正在选哪个出口 | sing-box API | React UI 当前选择状态 |
| 某条连接的实际代理路径 | sing-box API（所支持的信息） | UI 诊断/调用链推导；缺失则标为未知 |
| 操作服务是否成功、哪个实例在运行 | Core Supervisor + 核心就绪身份 | 状态、通知、托盘 |
| 谁在执行系统权限动作 | 平台 Host 的权限边界 | Tauri UI 只能发受限请求 |

### 2.2 策略组展示的正确实现

1. **静态快照**：从用户的原生 sing-box JSON 中提取 `selector`/`urltest` 等组定义；允许无核心状态时展示。不要从 Catalog 来源数目自动创造策略组。
2. **资源解析**：Catalog 更新节点后构建生成 Provider；解析组对 `providers/outbounds/use_all_providers/include/exclude` 等版本支持字段的有效引用；非法/空成员显示错误或空态。
3. **生效快照**：Config Composer 合并用户 JSON 与生成资源。生成 tag 要有明确命名空间、去重/冲突检查；不得修改用户本来写下的规则语义或静默覆盖 outbounds。
4. **运行快照**：从官方 `SubscribeGroups` 获得实际组结构和当前选择，并从 API 获取延迟；不再用日志猜状态。
5. **UI 合成**：配置版本 + Catalog 版本 + Core session ID 三元标识合成展示；核心停止时显示“配置候选”，绝不伪造实际出口。
6. **用户点击选中**：调用 Go Core 受控端点 → Core 调官方 `SelectOutbound` → 等待回复/下一流快照 → 成功/失败更新 UI；失败回滚 pending。
7. **用户编辑策略组**：图形化表单/JSON 编辑器均带同一 `revision` 提交 → 校验图与 tag/引用 → sing-box 配置检查 → 原子写入/可恢复应用 → 发布新 revision。
8. **嵌套与路径**：Go 解析引用关系时检测循环、引用不存在和递归深度；运行时实际出口在拿不到可靠引擎事实时不作肯定推断。

### 2.3 Go 管理 API 不等于 sing-box Engine API

- Go `/api/v1/resources`：源、节点、订阅、元数据。
- Go `/api/v1/config`：唯一原生 JSON + revision + check/apply。
- Go `/api/v1/proxies`：从 JSON + Catalog 汇总的组静态列表、候选。
- Go `/api/v1/runtime/groups`：映射 sing-box API 的实时状态（需 session ID）。
- Go `/api/v1/runtime/groups/{tag}/select`：选择代理（仅运行时）。
- Go `/api/v1/events`：浏览器 SSE，服务和组的变化事件，断流后主动重取快照。
- 原生 sing-box gRPC 保持独立，只允许 Core/可信本地进程连接，密钥不能送往浏览器。

以上路径仅用于规划语义，真实契约在 P1 的 OpenAPI/Protobuf 定稿。

### 2.4 重要：sing-box 1.15 生命周期中的变更

官方变更与迁移文档指出，1.15.0 系列 sing-tun 开始使用新的自有 TCP/IP stack，并建议移除旧 `stack` 配置；新版本还增强了 Android Root 下的 auto_redirect。

- <https://sing-box.sagernet.org/changelog/>
- <https://sing-box.sagernet.org/migration/>

NiPath **不要在新架构固定旧版 TUN stack 默认值**。在 P0 对 reF1nd fork 的实际版本做差异确认、性能/耗电基准及 API 兼容测试。不要把 Root Android auto_redirect 能力与无 Root VpnService 混为一谈。

## 3. UI/UX 设计细化

### 顶部信息与导航
- 统一导航：概览 / 代理 / 资源 / 规则 / 设置；移动底部导航，桌面侧边栏。
- “概览”首先是**真实服务状态与启停**，其次才是流量、当前出口、连接和设备运行态。
- 使用轻量卡片，避免一屏堆满测速、日志与十几个高级开关。高级项靠分区设置/详情进入，不制造第二种配置模式。

### 代理
- 完全从 sing-box JSON 绘制组；每个组卡片显示名称、类型、候选数量、选中子组、可得时的实际出口。
- 展开成员展示名称、协议/来源（映射 Catalog）、延迟、选中态和测试进度。
- URLTest 标识“自动选优”，Selector 标识“手动选择”，二者操作不同。
- 长节点列表采用虚拟滚动；支持筛选/搜索/排序/选中节点滚入视野。
- 运行状态流断开时显示 stale，不能用前一次选中成功填充为当前已生效。

### 资源
- 订阅 / 本地节点 / 全部节点；展示来源数量、健康、流量/到期等可获得信息。
- 订阅更新保留上一份**已验证的有效快照**直至新数据解析、校验、应用完成。这是同一版本内的数据完整性，不是旧版本兼容迁移。
- 页面既能浏览节点来源，也能反查节点被哪些策略组动态引用。

### 规则
- 原生 JSON 的 `route.rules` 与 `dns.rules` 作为唯一事实源；表单与代码编辑器同事务。
- 命中链路诊断需要由引擎实际提供能力支撑；无法证明的字段不要在 UI 假装精确。

### 前端结构
```text
src/
  pages/{overview,proxies,resources,rules,settings}/
  services/{nipath-api,native-bridge,event-stream}/
  features/{proxy-groups,subscriptions,connections,config-editor}/
  components/{ui,layout,charts}/
  stores/{ui-only}/
```
TanStack Query 管理服务端状态，Zustand 仅放本地 UI 偏好与交互态；禁止把同一后端状态既复制进 Zustand 又复制进 Query。

## 4. P0–P2 落地实验与强制验收

| 编号 | 实验 | 必须证明 |
|---|---|---|
| E01 | sing-box 新 API gRPC 客户端 | GetVersion/API version、SubscribeGroups、SelectOutbound、URLTest、断线重连、令牌验证正常 |
| E02 | 单一 JSON 与 Provider 合并 | 有组/无组、跨源筛选、重复 tag/循环引用/无效成员、直接编辑与表单并发冲突能正确处理 |
| E03 | 进程所有权与状态机 | 并发 start/restart/stop/崩溃，不产生两个相互抢流量的有效 Host；session 代数与 readiness 正确 |
| E04 | Android 无 Root TUN | VpnService FD → libbox，protect、权限撤销、Wi-Fi/蜂窝、后台、Always-on、DNS/IPv6 |
| E05 | Android Root TUN/eBPF | Go Root Host 能独立管理网络接管，客户端关闭不影响服务；Root/VPN 模式互斥 |
| E06 | Tauri 本地服务 WebUI 安全 | 浏览器可用，不授予 Root/native 命令；防 CSRF/Origin/DNS rebinding，原生桥明确授权 |
| E07 | Windows/Linux 管理服务 | 窗口关闭/异常关闭不停止 Core；服务启动、恢复、system proxy/TUN 按权限范围工作 |
| E08 | 开发 Safe Mode | 启动开发 UI 和检查配置不改变正式安装版代理、DNS、网络路由、VPN |
| E09 | UI 性能与事件流 | 1000 节点长列表不卡顿；批量测速期间无无限消息队列；断流后实际选中状态恢复 |
| E10 | 供应链与升级 | 锁定 Go/sing-box fork/Tauri 依赖，自动检测 proto/schema/接口变化；构建可复现，来源许可可审计 |

验收定义：**原型截图和“能连接网络”都不是通过标准**，必须留下可复现构建、自动测试、真机日志/结果和风险残留说明。

### 推荐实施顺序

1. **先做 E01 + E02**：避免在 UI 开发后发现无法准确获知策略组和状态。
2. **并行做 E04 + E06**：这是整个 Android VPN/Tauri 一体化路线最难验证的两处。
3. **E03 + E05 + E07**：确定主进程宿主生命周期，再大规模推进各平台实现。
4. **E08 + E09 + E10**：建立开发、质量和安全基线。
5. **然后才完成完整 UI 与多平台功能**：避免先造视觉效果，再补不可验证的后端约束。

## 5. 建议纳入 CI 的“架构护栏”

- 前端静态检查：禁止 pages/components 直接调用任意 Tauri invoke、核心 sing-box API、外部 URL；统一走 services。
- API/proto 检查：依赖版本升级时自动比较 API Protobuf 与核心配置 Schema 的关键差异。
- 组引用验证：重复 tag、未知引用、循环依赖、静态/运行态来源对应性。
- 生命周期竞态测试：并发启动、停止、重复调用、失去 IPC/控制连接、未知 PID、异常退出。
- 网络隔离测试：开发 Safe Mode 下不得改变系统代理、路由、DNS、VPN。
- 流事件压力测试：日志爆发、连接事件峰值、SSE 客户端缓慢读取消耗。
- 权限测试：浏览器 WebUI 无法直接触发 Root 命令；localhost 不能被任意 Origin/CORS 访问；令牌不可进入日志。
- 仓库维护：本报告为研究证据，正式决策经 Issue/PR 审核后更新主 `ARCHITECTURE.md` 与 ADR。

## 6. 明确不能照搬的设计

- **不照搬 FlClash/Clash Verge 的整个 Flutter/Rust 技术栈**：NiPath 已选择 React + Go + Tauri；借鉴运行时、UI、质量规范。
- **不直接暴露官方 sing-box gRPC-Web 到未受信任浏览器**：API bearer secret 和强权限边界必须由 Core 隔离。
- **不把 SFA 的“配置文件 Profile 切换”当作 NiPath 必须复刻的产品模式**：NiPath 单一原生 JSON + Catalog 来源，避免双模式、多份真相。
- **不在 UI 读取日志推断代理状态**：以 API 和配置为事实。
- **不以“最近测速最佳”宣称节点一定稳定**：延迟和健康只是有时间戳的观测量。
- **不盲目实现 Fallback/LoadBalance**：先明确所选 sing-box fork 的数据面能力与协议语义，不能在纯管理侧伪造“负载均衡”。
- **不假设自动提供 API 的所有新功能**：新功能须按 NiPath 的产品目标和开发成本评估。
- **不直接复制 GPL 等源码到其他许可边界而不审查义务**：参考实现和移植代码分开处理，核查源项目许可、修改披露、分发要求与第三方依赖。

## 7. 待确认的设计决策（独立 Issue/ADR 适用）

- **D01** Android VPN 版 Go Core 与 libbox 的绑定入口、AAR/.so 生成与进程所有权方案，以 E04 结果定。
- **D02** Tauri 访问 Go HTTP WebUI 时，可信 bootstrap / 最小 native bridge 的具体形式，以 E06 结果定。
- **D03** Engine API 基于 upstream sing-box proto 还是 reF1nd fork proto，以及版本升级同步策略，以 E01 定。
- **D04** 用户 JSON 与运行时生成 Provider 的最小冲突/合并规则，以 E02 定。
- **D05** 是否需要远程控制多个 NiPath Core：若不是 1.0 必需，暂不引入多实例/账户系统。
- **D06** 单一 JSON 配置下的默认配置首次生成和错误恢复行为，以 E02 定。
- **D07** Dashboard 可定制程度与首发 UI 的成本约束，以 E09 定。

## 8. 调研适用范围和局限

- 对照了上述项目在 2026-10-10 可访问的 README、架构文件与关键路径源代码；未声称做了完整源代码安全审计或真机跨平台测试。
- 本报告中“推荐”是 NiPath 的**设计建议**，并不表示被对标项目实现了 NiPath 规划的相同需求。
- **性能优劣**必须由相同设备和真实工作负载基准确定，不根据框架或源码语言做未经验证的结论。
- 本文不改变现有 `ARCHITECTURE.md` 的已批准设计，也不提升其修订版本；验证通过后再通过 PR 升级 ADR 和实施规范。
