# NiPath WebUI 代理页设计 · FlClash 双布局参考

## 参考的实际源代码

- FlClash 主代理页面 [lib/views/proxies/proxies.dart](https://github.com/chen08209/FlClash/blob/main/lib/views/proxies/proxies.dart)：使用 `ProxiesType.list` / `ProxiesType.tab` 切换两种布局。
- FlClash 列表页 [lib/views/proxies/list.dart](https://github.com/chen08209/FlClash/blob/main/lib/views/proxies/list.dart)：`currentUnfoldSet` 控制多个策略组在当前页展开，候选节点直接跟在组下方。
- FlClash 标签页 [lib/views/proxies/tab.dart](https://github.com/chen08209/FlClash/blob/main/lib/views/proxies/tab.dart)：通过 TabController 切换策略组，候选节点不经独立详情导航。
- FlClash 设置页 [lib/views/proxies/setting.dart](https://github.com/chen08209/FlClash/blob/main/lib/views/proxies/setting.dart)：列表/标签布局、排序、疏密程度等相互独立。
- FlClash 节点卡片 [lib/views/proxies/card.dart](https://github.com/chen08209/FlClash/blob/main/lib/views/proxies/card.dart)：区分可手动选择与自动选择的组类型。

## NiPath 当前实现

组件：[web/src/components/proxy-groups-view.tsx](../web/src/components/proxy-groups-view.tsx)，**Android 和桌面共用**，组件仍使用官方 shadcn/ui New York 和 Neutral 语义变量。

**列表布局（默认）**

1. 主页面显示搜索框、模式切换、策略组标题列表。
2. 点击组标题折叠/展开，展开后候选节点立即在同一页出现；无需页面导航。
3. 允许同时展开多个组。全部展开/全部收起属于列表模式。
4. 点击 Selector 下的候选节点直接调用统一选取动作，显示已选状态。
5. 测速与编辑单独操作；点击组标题不是进入详情。

**标签布局**

1. 顶部展示横向可滚动的策略组标签。
2. 切换标签后，下方直接显示该组的候选节点卡片。
3. 节点选择操作与列表模式一致，切换布局不丢失已选节点。
4. 布局偏好由 Zustand 持久化（本地工作区）；不修改 sing-box 原生配置。

**仍须遵守的协议语义**

- Selector 可指定候选出站。
- URLTest 由引擎自动测速选取；不能伪造人工固定的全局出口。
- LoadBalance 按连接调度，不存在全局唯一的已选节点。
- 嵌套选择链按照实际 tag 显示，不应强行当成独立 Proxy 节点。
- Provider 的刷新和应用按真实引擎回执确认，不能混淆已下载与已生效。

## 同一轮其他验收

- Android 新建/编辑表单通过 [KeyboardAwareSheet](../web/src/mobile/KeyboardAwareSheet.tsx) 使用 `visualViewport` 监听软键盘，移动 bottom/maxHeight，并滚动聚焦控件到可见区域。
- 桌面和 Android 共享同一状态与代理布局组件；桌面资源管理、规则编辑等其他功能使用同一 store。
- 官方 GitHub Pages 与本地预览使用 `mock-data.ts` 提供可操作的示例节点、策略组和订阅；连接真实 Core 后切换为真实状态；其它页面不重复展示“演示模式”，概览底部保留说明。
- Playwright 同时检查 Android 列表展开、标签切换、节点选择、桌面两种布局、软键盘兼容测试。

## 后续需继续改进

- 节点数量很大时的列表虚拟化和成千上万节点性能测试；
- 可选卡片尺寸、紧凑程度、延迟排序与过滤；
- 页面切换时各策略组的展开集合跨刷新保存、Tab 横向位置保存；
- 引擎实时 URLTest 结果和 Provider 增量更新接入。
