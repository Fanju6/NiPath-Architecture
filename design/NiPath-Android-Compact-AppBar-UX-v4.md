# NiPath 1.0 Android 交互规范 v4：固定小标题栏

> 状态：现行版本 · 2026-10-10  
> 视觉和组件：**shadcn/ui New York v4 + Neutral**  
> 操作模型：Android 原生应用式导航（参考 Miuix / 原 NetProxy 管理器），不复制它们的主题或组件样式。

## 顶部应用栏（唯一标题）

Android 手机端始终使用一个固定的紧凑 AppBar，内容行高 **56 CSS px**，加上实际系统安全区域的顶部 inset。

- 主页面仅显示当前页面的小标题：概览、代理、资源、规则或设置。
- **不显示**页面大标题、标题下的小描述、NiPath 产品 Logo/品牌名、无功能装饰图标或 DEMO 徽标。
- 主内容滚动时 AppBar 尺寸和标题大小**始终不变**；没有展开、收缩、渐变、滚动阈值或动画状态。
- 与当前页面相关的必要操作放在标题右侧：代理为添加策略组、资源为添加订阅、规则为新增规则。概览、设置不放无用途按钮。
- 在策略组详情、原生 JSON、关于页面，使用**同样紧凑尺寸**的返回键与页面标题；一级底部导航隐藏。
- 页面内容从真正的业务区域开始，不再自带第二个 H1。

## 主导航与组件

- Android 主层固定底部五入口：概览、代理、资源、规则、设置；内容滚动不会移动底部导航。
- 页面级动作和表单使用官方 shadcn/ui Button、Card、Input、Tabs、Sheet、Switch 等，统一 Neutral 主题。
- 保持 48px 级触控目标、触屏安全区域、独立的详情页面与回退行为。Android 宿主必须继续验证系统返回键和 inset。
- 正式 Core 尚未接入，当前网站是演示界面；不能把演示操作显示为真实内核生效。

## 代码与回归验收

- 实现：[AndroidApp.tsx](../web/src/mobile/AndroidApp.tsx)
- 自动化测试：[android-navigation.spec.ts](../web/e2e/android-navigation.spec.ts)
- 主页面断言：只出现一个小标题；没有大标题、描述、logo 或品牌名。
- 滚动断言：改变内容区 scrollTop 后，小标题文字与尺寸保持一致。
- 兼容断言：顶部页级操作、二级页面返回和五个底部目的地正常；桌面仍然使用 shadcn/ui Sidebar。

上一版 [v3 设计规范](NiPath-Android-TopBar-Native-UX-v3.md) 为历史记录，不再作为当前实现依据。
