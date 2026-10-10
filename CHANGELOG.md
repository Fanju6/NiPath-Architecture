# Architecture Changelog

此处记录架构文档修订；不是 NiPath 软件版本发布日志。

## v1.3 — NiPath 1.0 产品确立
- 新品牌正式确定为 **NiPath（奶屁 / NP）**。
- 产品版本以 NiPath 1.0.0 重新起步，旧版本 NetProxy 9.0 仅为历史草案称呼。
- 保留统一 Go Core、React WebUI、Tauri、Android Root/VPN、Windows/Linux 与 Catalog/策略组的设计方向。

## v1.2 — 单一原生配置
- 取消 Managed/Expert 双模式与独立 Policy Store。
- sing-box 原生 JSON 成为策略组与路由的唯一配置事实源，Go Core 提供安全统一的读写和渲染模型。

## v1.1 — 策略组、资源与页面
- 规划“代理 / 资源 / 规则”等产品页面。
- 明确 Catalog 节点来源、策略组成员和 sing-box 运行时状态的关系。

## v1.0 — 架构级重构
- 从最优设计出发重新规划 Core 与平台适配，不要求兼容旧版 NetProxy。

## v0.3 — Android 双模式
- 新增 Android Root 与无 Root VPN 并行技术路线。

## v0.2 — 跨平台框架
- 明确独立 Go Core、内置 WebUI、Tauri 原生外壳。

## v0.1 — 最初规划
- 初步提出跨平台迁移技术设计。
