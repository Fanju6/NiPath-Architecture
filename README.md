# NiPath · Architecture

**NiPath（奶屁，NP）** 是面向 Android、Windows 与 Linux 的新一代跨平台代理和网络流量管理工具。本仓库公开讨论 **NiPath 1.0** 的产品功能、技术架构和开发路线。这里是**架构设计仓库**，不是已实现的软件源码仓库。

> **产品目标版本：** NiPath 1.0.0（尚未发布）  
> **当前架构文档修订版本：** v1.5  
> **协作方式：** GitHub Issues + Pull Requests + Git 历史

## 从这里开始

- 📖 [当前架构设计规范](ARCHITECTURE.md)
- 🔬 [成熟开源项目源码对标与实施细化（2026-10）](research/2026-10-open-source-architecture-benchmark.md)
- 🕰️ [历次架构修订](versions/)
- 📝 [修订记录](CHANGELOG.md)
- 🤝 [参与贡献](CONTRIBUTING.md)
- 💬 [发起架构讨论](https://github.com/Fanju6/NiPath-Architecture/issues/new/choose)

## 产品设计方向

- 统一 Go Core，独立的 HTTP API 和内置 React WebUI。
- Tauri 2 提供 Android、Windows 和 Linux 原生客户端。
- Android 支持 Root eBPF / TUN，以及无 Root VpnService。
- 统一资源 Catalog，管理订阅、本地节点与来源。
- 使用 sing-box 原生 JSON 定义策略组与路由，代理页面自动解析、展示和编辑。
- **简单优先、单一配置方式、架构优先，不为旧版 NetProxy 引入历史兼容包袱。**

## 如何参与

欢迎通过 Issue 提出需求、分析技术取舍与发现设计风险。对于明确的文档修改，请 Fork 仓库并通过 Pull Request 提交；请说明背景、方案、替代方案与验证依据。

建议先在 Issue 中讨论重大架构变更，形成共识后再修改规范。详细约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 版本管理

`ARCHITECTURE.md` 始终指向**当前推荐设计**；`versions/vX.Y.md` 是对应修订快照；`CHANGELOG.md` 记录变化。架构文档版本**不等于** NiPath 软件版本。所有修改都通过 Git commit 留痕。

历史草案 v0.1–v1.2 仍保留旧称 NetProxy 9.0，供了解设计演进，不代表当前产品的命名或兼容承诺。

## 项目状态与许可

本仓库仍处于设计阶段。架构文档中的接口、示意代码和目录规划不等于已经实现。贡献者提交内容前请勿包含订阅地址、令牌、凭据或其他私密信息。

文档许可和对外重用条件将在仓库维护者明确选择 LICENSE 后生效；在此之前，不应推定所有内容已按某种开源文档许可证授权。
