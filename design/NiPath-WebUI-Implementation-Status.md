# NiPath WebUI 实现与 Core 集成状态（2026-10-11）

> 状态：前端正式结构正在落地；本仓库仍**没有可运行的 NiPath Go Core**。本文件准确区分已实现和依赖后端的功能。不可用时须显示“Core 未连接”，不允许用假数据伪造成功。

## 已实现并可在 GitHub Pages 使用（当前会话工作区）

- Android / Desktop shadcn/ui New York v4 + Neutral，手机固定紧凑顶部栏、五目的地底部导航和详情返回栈。
- 只有**概览页底部**出现一次“演示模式”说明；其它页面不出现演示提示。
- GitHub Pages 与本地开发提供隔离的 **Mock 预览数据**（示例订阅、节点、策略组、规则、流量和连接数）；交互修改保留在当前会话，界面文案按正式产品呈现。真正同源 Core 建立连接后退出 Mock 模式，不能将 Mock 当成设备数据。
- 代理组：创建、编辑、删除（包含显式组成员与路由引用的防误删检查）。
- 资源：创建、编辑、删除订阅来源；本地节点资料新增、修改、删除；浏览筛选与来源信息。
- 路由：新建、修改、删除、顺序调整、启停；工作区配置修订计数。
- JSON：导入、导出、格式化（桌面）、基本 Schema 草稿校验与保存；DNS 字段经 JSON 草稿管理。
- 主题切换、React sessionStorage 会话草稿保存（**仅会话存储，不存入长期 localStorage**）。
- E2E 覆盖 Android 主导航、详情返回、资源 CRUD、路由 CRUD、独立桌面 Sidebar、仅首页提示和 Core 离线状态；额外覆盖模拟键盘可视区域缩小、桌面编辑节点、桌面设置页与移动端功能对齐、代理列表/标签模式切换。

> 重要限制：目前节点表单维护的是 Catalog 节点**资料**（tag、名称、协议、地址），不是 sing-box 完整可用的带认证参数出站对象。原生 JSON 草稿当前仅支持有限的编辑器 Schema，不能冒充完整 sing-box Schema。

## 已编写 HTTP 调用，但依赖尚未提交的 Go Core

| 功能 | 前端行为 | 缺失项 |
|---|---|---|
| 服务启停 | POST `/api/runtime/start|stop`，随后 GET status 确认；失败不显示成功 | 设备 Core、真正 sing-box 启停与 Root/VpnService |
| 运行状态及流量 | 轮询 `/api/runtime/status`，无服务就显示“Core 未连接”及 `—` | 真实 Core 状态、连接/流量采集 |
| 策略组即时选中 | POST `/api/proxies/groups/{tag}/select`，必须得到成功响应 | Engine Runtime API、generation/ACK |
| 测速 | POST `/api/proxies/groups/{tag}/test`，不产生随机延迟 | Core 测速任务和回推真实结果 |
| 订阅刷新 | POST `/api/resources/subscriptions/{id}/refresh`，不虚报 applied | Core 下载、解码、Provider、原子性与部分失败处理 |
| 设备配置读取 | GET `/api/config/source`，记录配置 revision / ETag | Core 版本管理、完整 sing-box JSON 投影 |
| 校验及应用 | POST `/api/config/validate` + PUT `/api/config/source` / If-Match | sing-box 版本 Schema、无损原生 JSON 编辑/原子保存/运行时 ACK |
| 权限与安全 | 同源 Cookie fetch，非同源目标不可配置 | Core Auth、会话、CSRF、Tauri/Android 宿主权限 |

HTTP endpoints 与 [ARCHITECTURE.md](../ARCHITECTURE.md) §7.9 设计相对应，但尚未形成能在设备上运行的生产后端，**不能称整个 NiPath 已完工**。

## WebUI 体验打磨（2026-10-11）

1. 手机创建／编辑策略组、订阅、节点、规则统一通过 [KeyboardAwareSheet](../web/src/mobile/KeyboardAwareSheet.tsx) 承载，监听 `visualViewport` 高度、偏移和 `resize`／`scroll`，根据可见区域将底部 Sheet 抬高并限制最大高度，聚焦输入时滚动至可视区域。CI 可模拟视口缩小；**Android 实机 IME 与系统栏适配仍需真实设备验收**。
2. 桌面资源支持节点编辑、订阅 CRUD；设置补齐 DNS、安全、关于等入口，与手机共享 Zustand 数据状态。代理支持原位展开的列表模式与策略组标签模式，且两端使用同一选中结果。
3. Mock 数据集中于 [`mock-data.ts`](../web/src/lib/mock-data.ts)，不注入已连接 Core 的真实会话；工作区编辑保留在 `sessionStorage`，非生产设备持久存储。
4. 文案遵循产品表达：**仅概览页底部**保留「演示模式」提示，其他页面不反复显示演示横幅。

## 安全与产品约束

1. Core 不在线时绝不把前端的“开/关”切换当作代理真实状态，不显示伪造的吞吐或 RTT。
2. 订阅 URL 可能包含密钥，工作区只存当前浏览器会话；正式版由 Core 安全持久化。GitHub Pages 不作为高权限 API 代理端点。
3. Android 和桌面 UI 同属 React/shadcn，平台差异只限导航、交互、窗口安全区；不引入 Material 3 视觉分支。
4. API 写操作必须以 Core 成功响应和版本校验为准；Core 构建完成之前不要宣称资源刷新、Provider 更新或 JSON “应用成功”。
5. 优先下一步补齐 **Core 首次连接→全部 Catalog/配置/Provider 快照同步、完整原生 JSON Schema、Core 资源 CRUD、引擎热更新和错误恢复**；均需实机验证。

## 手工/CI 验收

```bash
cd web
npm ci
npm run build
npm run test:e2e
```

CI 对 Android 393×852 以及桌面 1440×900 运行 Playwright；输出截图供审核。测试成功仅证明前端行为和构建通过，不代表 Root、透明代理、Provider 或 Core 已经集成。
