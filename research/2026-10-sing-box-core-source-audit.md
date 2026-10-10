# NiPath 1.0：sing-box 上游与 reF1nd 分支源码深度审查

> 调研日期：2026-10-10  
> 评估对象：NiPath 1.0 架构规范 v1.4  
> 上游参考：`SagerNet/sing-box`，`testing` 分支（变化中的基线）  
> **当前 NetProxy 精确依赖基线**：`github.com/reF1nd/sing-box v1.15.0-alpha.11-reF1nd`（Git tag: `v1.15.0-alpha.11-reF1nd`；commit `78ea0ce9257bd3bedd4d1185d6cc4723f04096b4`）  
> reF1nd 开发对照：`reF1nd-testing-next`（检查时 commit `6badd8c9baf9fc781426b6b7049229028d954443`）  
> 研究类型：关键模块静态源码审查，未完成编译、真机或网络性能测试。**本报告为实施建议和可复现风险清单，并非确认所有 P0 功能已可用。**

## 0. 重大结论

1. **不要将 SagerNet 上游与 reF1nd fork 的能力混为一谈。** 所检查的上游 `option/outbound.go`、`protocol/group/selector.go` 不含 reF1nd 的 `providers/use_all_providers` 动态成员机制；reF1nd 锁定标签则含原生 Provider、Local/Remote/Inline 及 `load-balance`。NiPath 锁定单个引擎构建及其 API/schema fingerprint，不做虚假的“兼容任意 sing-box”承诺。
2. **避免双份订阅下载、转换和运行节点列表。** reF1nd fork 已提供 `provider/parser`、原生 Provider Manager、动态节点替换、分组回调及缓存。NiPath 自己再实现完全独立的 Provider 生命周期，很可能造成两份事实源、内存和刷新时序问题。
3. **首选验证 Core 获取订阅 → 已验证资源文件 → sing-box Local Provider 文件监听热更新**；保留“资源 / Catalog”页面和 Core 对数据来源的管理。直接使用原生 Remote Provider 也是备选路线，但必须先解决向 Core 暴露订阅状态和资源清单的问题，不能让 UI 凭猜测展示。
4. **更新 Provider 并非整批原子替换。** `adapter/provider/update.go` 按依赖拓扑依次 Replace；个别节点失败时保留旧对象、仍可能清理其他旧节点并返回合并错误。NiPath 必须区分 `downloaded`、`validated`、`applied`、`partially_applied`、`failed`；不能仅凭文件写入成功或更新时间刷新宣称全部生效。
5. **负载均衡不是 Selector。** fork 的 `load-balance` 支持 `round-robin`、`consistent-hashing`、`sticky-sessions`；选择在单条连接的上下文执行，`Selected()` 显式返回 nil。UI 应展示候选、策略、健康信息、连接级出口，而不是虚构一个全局当前节点。
6. **URLTest 可能 TCP/UDP 选不同节点。** `selectedOutboundTCP` 与 `selectedOutboundUDP` 分开维护；而 `StartedService.readGroups()` 的 `Group.selected` 用 TCP 获取。UI 展示“当前节点”必须标注所依据的协议，必要时显示 TCP/UDP 差异，不等同每条连接都走该节点。
7. **官方引擎 API 不能代替资源管理 API。** 锁定 fork `daemon/started_service.go` 定义 `APIVersion=6`，上游 testing 检查时为 `4`。Service API 提供 Group、URLTest、Select、Connections、Outbounds，却没有通用资源编辑/订阅刷新 CRUD RPC；Core 仍需承担资源事务、读取与本地索引。

## 1. 源码与精确证据

| 主题 | 锁定 fork 相关文件 | 核心事实 |
|---|---|---|
| 当前实际依赖 | [NetProxy go.mod](https://github.com/Fanju6/NetProxy-Magisk/blob/main/src/native/netproxy/go.mod) | `replace github.com/sagernet/sing-box => github.com/reF1nd/sing-box v1.15.0-alpha.11-reF1nd` |
| Provider 类型 | [option/provider.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/option/provider.go) | `ProviderLocalOptions` / `ProviderRemoteOptions` / `ProviderInlineOptions`，原生健康检查、下载参数、TLS/dialer override |
| 配置结构 | [option/options.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/option/options.go) | 顶层已有 `providers`；配置 decoder 使用 `DisallowUnknownFields`，存 RawMessage / CommentsSet |
| 节点导入解析 | [provider/parser/parser.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/provider/parser/parser.go) | 按次序尝试 sing-box、Clash、SIP008、Raw 订阅，返回 outbounds/endpoints |
| 常见分享链接 | [provider/parser/link.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/provider/parser/link.go) | SS、VMess、VLESS、Trojan、Hysteria、TUIC、AnyTLS 等链接处理，支持情况以解析测试证实 |
| Local 文件监听 | [provider/local/lcoal.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/provider/local/lcoal.go) | `fswatch.NewWatcher` → `reloadFile` → `ParseSubscription` → `UpdateNodes` → `UpdateGroups` |
| Remote 下载 | [provider/remote/remote.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/provider/remote/remote.go) | ETag/304、Subscription-Userinfo、缓存与定时更新；更新间隔不得小于 1h |
| 动态成员 | [option/group.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/option/group.go) | `outbounds`、`providers`、`use_all_providers`、`include/exclude`；URLTest `fallback` |
| Provider 并发/热更新 | [adapter/provider/update.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/adapter/provider/update.go) | 依赖拓扑排序、保留未变化实例、部分 Replace 失败后聚合错误 |
| 热更新回归测试 | [adapter/provider/hot_update_test.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/adapter/provider/hot_update_test.go) | 未改变的节点和原连接保持；变更节点替换；失败节点可重试 |
| 组更新通知 | [protocol/group/provider_members.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/protocol/group/provider_members.go) | Provider 成员缓存、include/exclude 动态筛选、串行 coalesced 回调 |
| Select | [protocol/group/selector.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/protocol/group/selector.go) | 读写 cache_file 选择、provider 动态成员、变更时重选；存在 `Compatible` fallback 路径需安全验证 |
| URLTest | [protocol/group/urltest.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/protocol/group/urltest.go) | TCP/UDP 分开选择、idle 延迟测速机制、`fallback.enabled/max_delay` |
| LoadBalance | [protocol/group/loadbalance.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/protocol/group/loadbalance.go) | 三策略 + 连接级选择；无全局 `Selected` |
| 服务 API | [daemon/started_service.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/daemon/started_service.go) / [proto](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/daemon/started_service.proto) | `APIVersion=6`；`SubscribeGroups` 的 `Group.Selected` 从 TCP 取得；空组可被隐藏 |
| libbox | [experimental/libbox/platform.go](https://github.com/reF1nd/sing-box/blob/v1.15.0-alpha.11-reF1nd/experimental/libbox/platform.go) | 平台 `OpenTun`、`AutoDetectInterfaceControl`、接口与连接归属能力已有抽象 |

## 2. 资源层：不应该在两个地方同时跑订阅引擎

### A 方案（推荐先验证）：Core 管资源，Engine Local Provider 管运行节点

```text
订阅来源 / 手动节点（NiPath Resource）
   → Core 按既定时机获取 / 校验 / 整理数据
   → 使用 fork 原生 parser（能复用则不自写转换器）
   → staging 文件 + checksum + atomic rename
   → [已验签 / 已确认文件 revision 的 Provider 快照]
   → sing-box Local Provider（fswatch）
   → 动态 Outbound Manager / Groups
   → Service API 实时组状态
   → NiPath「代理」页面
```

- Catalog 仍提供资源检索与稳定 source/node 身份，**不应再承担第二套代理实例与成员选择器**。
- 不要依赖 fswatch 事件就是提交已生效的 ACK；如需要“全局原子更新”，应设计内核版本级 staging/commit 或保留上一版本运行实例，而不是只对文件 atomic rename 就宣布成功。
- 资源文件由 Core 生成、由引擎消费（只读）；不要让用户同时编辑生成文件和 Catalog。
- 订阅更新时运行核心无需全重启，是**可验证目标**，而不是已交付能力。验证不变节点连接持续、变更节点重建、失败节点可见且可重试。

### B 方案（备选）：sing-box Remote Provider 直接管理订阅

- 避免 Core 再次下载相同 URL；`providers` 存在于唯一用户 sing-box JSON，UI「资源」是该 JSON 的投影，Catalog 只做可查询缓存。
- 但当前 gRPC 服务没有完整的订阅来源 CRUD/刷新状态/配额查询契约，必须补有界安全的 Adapter API 或读取引擎受控快照。
- Remote Provider 固有定时下限为 1 小时；如果 NiPath 承诺分钟级更新，需要确认是否通过别的机制满足。
- **不要同时启用 Core 下载任务和 Remote Provider 对同一 URL 下载。**

### 实施建议

P0 用同一订阅负载实现 A/B 小原型，并用观测数据比较：
- CPU/内存和 Go 实例数量、更新请求数、冷启动时间；
- 配额/过期等资源元信息能否可靠显示；
- 用户 JSON 可编辑性、Core / Engine 双进程兼容度；
- 失败订阅恢复、节点更新错误、断网重启场景。
最终通过 ADR 确定单一下载 owner。确定前**现有 v1.4 的 Catalog 事实源不直接推翻**，但不能将重复解析实现作为必需工作。

## 3. 代理页面需要适配真正的组语义

| 组类型 | UI 应展示 | UI 不应展示/误导 |
|---|---|---|
| Selector | 成员、手动选择、缓存选择与默认值、来源、延迟 | 未运行时显示实时选中 |
| URLTest | 健康探测、TCP 选择、可得的 UDP 选择、idle 测试状态 | 假定 TCP 和 UDP 永远走同一个出口 |
| URLTest + fallback | `fallback.enabled`、`max_delay`、成员优先次序、健康情况 | 把它当上游 sing-box 的独立 `fallback` outbound 类型 |
| LoadBalance | round-robin / consistent-hashing / sticky-sessions、TTL、成员健康、连接级出口 | 全局选中某一个节点或合并单连接带宽 |

警惕两个隐式行为：
- 在 `Selector.Start` 中，当有 providers、但显式 outbounds 为空时，会检查名为 `Compatible` 的出口；这个 fallback 的实际类型和是否存在必须在具体配置上验证。NiPath 不得把无成员视为“安全直连”。
- 分组 `include/exclude` 的正则匹配的是 **完整生成 tag**（例如 `source_tag/node_tag`），并非只匹配展示名；如果 source 名称含 HK，可能误让其下非香港节点命中 HK 正则。NiPath 的筛选 UI 必须解释作用范围、使用预览和测试验证。

## 4. API 与引擎版本：禁止盲目对齐

- 精确依赖的 reF1nd 标签中 `daemon.APIVersion=6`；检查的 SagerNet `testing` 中该常量为 `4`。这些代码来自不同版本/分支，**不能简单解释为 API 6 是 API 4 的完全兼容超集**。
- NiPath 应以自己锁定的 `go.mod` + git tag / commit + proto hash + schema hash 生成 `EngineManifest`；Go Engine Adapter 根据能力协商，而不是只用单个数字决定能否调用全部 RPC。
- 静态选项 schema 与 API proto 都应从 **同一构建** 生成并集成测试。
- 官方新 API 的组订阅主要面向运行时：`readGroups()` 会跳过没有实际成员的组，而 `Group.Selected` 是 TCP 选择。NiPath 在停机、空组、运行失败时依旧从原生 JSON 解析所有静态组；**不可只依赖 gRPC 组列表来构建页面**。
- `URLTest` RPC 在当前源码中会启动异步测速后立即返回；响应成功不意味着测速完成。NiPath 必须继续等待带时间戳的 history/组推送才能显示“测速完成”。
- 订阅更新和健康检查操作不必天然使用相同 RPC；缺少官方接口时由 Core 提供受控的 Resource API，**不能通过发送命令让前端自己读写引擎磁盘**。

## 5. 更新一致性与防故障原则

| 状态 | 表示什么 | 能否宣称所有节点生效 |
|---|---|---|
| `fetched` | 订阅 HTTP 获取成功 | 否 |
| `parsed` | 节点格式被解析 | 否 |
| `validated` | 资源和依赖约束通过 | 否 |
| `staged` | 新文件已落到临时区 | 否 |
| `applying` | 已提交到内核/文件监控处理 | 否 |
| `applied` | 已有明确引擎应用完成证据 | 是 |
| `partially_applied` | 部分实例变更/部分被保留 | 否 |
| `failed` | 新版本未成功生效 | 否 |

**特别约束**：如果现有 fork 的 Local Provider watcher 不提供事务确认/具体失败诊断，NiPath 要明确显示“文件已提交，内核运行状态待确认”，并用版本差异/事件桥补齐。不能制造一个不存在的原子提交能力。长期可评估向 fork 提供 `ProviderRevisionApplied` 的只读事件或返回值接口，而不是自创一整套代理引擎。

其他注意事项：
- Core 的生成文件/SQLite 元信息/运行时应用状态分别携带 revision 或哈希；仅匹配 revision 才认定一致。
- 当源内节点重名时，fork 会在 tag 加 ` (2)` 等后缀，**顺序变化可能造成身份漂移**；稳定 ID 应由 Core 独立计算，并尽可能使用不依赖展示名或数组下标的内核 tag。
- 阻止 source/provider/tag 之间的命名冲突，使用保留前缀及跨来源唯一 ID，别让用户随意改名导致历史选择失效。
- 过滤结果为空、provider 临时没有节点、部分协议 TCP/UDP 不支持时，**不能自动切直连**。

## 6. 需要补充到 P0 的原型任务

- **E11：单一订阅 owner**。同一 URL 的 Core Local Provider 与原生 Remote Provider 对比；确定一条被用户理解的资源更新路径。
- **E12：Local Provider 热更新**。不变节点、变化节点、删除节点、连接中断行为、watch 丢事件、原子文件改名、内核重启、损坏文件/解析错误。
- **E13：部分失败一致性**。一个节点构建失败时观察组成员、连接、返回错误、运行态与 Catalog 不一致如何恢复。
- **E14：三类策略组运行语义**。Selector 持久缓存、URLTest TCP/UDP 分化、fallback 行为、LoadBalance 三策略及连接级可视化。
- **E15：API 版本与静态组投影**。锁定 fork 的 proto/schema，停机/空组、测速异步完成、切换失败后的 UI 处理。
- **E16：配置编辑无损**。JSON 注释/Schema/未知字段/显式 provider 标签、原生配置生成与原子写；解析-重编码不应任意删除用户注释和格式。
- **E17：性能/电量**。高频订阅刷新 + 1000 节点 + 后台停用测速、不同内存/网络条件的实际基准。

完成条件：脚本或 Go 测试、带 commit 的可复现版本、错误注入/真机日志、明确 yes/no 的架构取舍。测试前不把 P0 路线写成产品已实现功能。

## 7. 对 NiPath 1.0 正式架构的推荐调整

**应该直接纳入：**
- 具体引擎 fork 与 git commit / API proto / schema 的版本锁定、差异检查。
- 复用 reF1nd 原生 Provider/解析器/连接级 LB 能力的优先原则。
- 代理页根据不同组类型正确展示，空组不应被 API 隐藏。
- 更新阶段及部分失败的诚实状态。
- 支持 Local Provider 文件监听热更新的 P0 原型，避免为了更新订阅重启整个引擎。
- API 操作异步 vs 完成的明确区分。

**必须先 P0 实验、再正式 ADR 决定：**
- Catalog 数据库存储 Source 的唯一权属 vs 原生 `providers` JSON 作为资源配置事实源：两者只能有一个写入权威。
- Core 负责下载 vs Engine Remote Provider 负责下载。
- 是否向引擎 fork 添加最小的 Provider 版本/应用反馈接口，替代整个引擎热重载。
- 更新失败时精确回滚语义：现有 Replace 实现并非天然原子。
- 冷启动空 Provider 的 `Compatible` 默认回退语义与内核默认直连的安全边界。

## 8. 参考与局限

本次直接读取了指定 fork tag 和 upstream testing 的真实 Go 源码、关键测试文件以及 NetProxy 当前依赖声明。开发分支功能不等于正式发布承诺；reF1nd 标签功能也不代表所有 SagerNet 发布都可用。尚未对未审查模块进行全量安全审计，也没有得到同设备性能基准结果。

调研后的配置原则仍然不变：**一份用户原生 sing-box JSON，一套 React UI，没有 Managed / Expert 模式。**
