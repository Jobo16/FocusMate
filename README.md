# Daymark：个人上下文采集与检索服务

Daymark 的目标是通过网页、桌面和手机收集用户授权记录的音频、画面与分享内容，将素材整理成带时间、来源和证据的个人上下文库，供独立 Agent 通过工具检索。

> **状态：网页前端预览，2026-09-26。** 宣传首页和三页工作台已搭建；录音页复用旧 `/ws` 实时连接，仅预览转写，不持久保存音频。AI 历史聊天、可靠采集、桌面与手机原生采集、跨设备检索和 MCP 仍待实现。当前边界见 [实现现状](docs/current-state.md)。

## 产品边界

采集器负责获取与可靠保存素材；整理管线负责转写、OCR、去重、事件组织与索引；检索服务提供资料和出处；外部 Agent 负责用户任务、推理与执行。产品不依赖特定 Agent Runtime。

- 网页：用户主动开始录音，素材分片上传云端节点。
- 桌面：用户授权后低打扰采集，本地优先处理、保存与检索。
- 手机：本地录音、分享与截图导入；屏幕采集按 Android／iOS 的实际能力实现。
- 本地存储、处理位置、同步范围和 Agent 访问范围分别配置。
- 所有检索结果保留来源与证据；未覆盖节点、处理积压及原始素材到期都必须明确报告。

“我刚刚错过了什么？”继续作为参考消费场景。它的 30／60／180 秒窗口不再限制底层数据保留期限。

## 阅读顺序

| 文档 | 解决的问题 |
| --- | --- |
| [产品方向](docs/product-direction.md) | 产品定位、用户场景、三端体验与验收目标 |
| [架构设计](docs/architecture.md) | 模块边界、部署方式与依赖方向 |
| [数据模型](docs/data-model.md) | 记录、素材、事件、证据、版本与删除 |
| [数据流](docs/data-flow.md) | 采集持久化、异步处理、检索与恢复 |
| [接口规范](docs/api.md) | 目标采集接口与四个 Agent 工具 |
| [平台能力](docs/platforms.md) | Web、macOS、Windows、Android、iOS 的采集边界 |
| [重构规范](docs/refactoring.md) | 文件迁移、兼容策略、持久化与验证要求 |
| [实施路线](docs/roadmap.md) | 分阶段交付、PR 边界与退出条件 |
| [开发指南](docs/development.md) | 日常开发约定和变更流程 |
| [当前实现](docs/current-state.md) | 已有代码能力与已观察到的限制 |
| [网页体验](docs/web-experience.md) | 宣传首页、三页工作台、状态与设计令牌 |
| [现有原型启动](docs/getting-started.md) | 当前可运行命令与演示边界 |
| [方向变更记录](docs/decisions/2026-09-26-personal-context.md) | 本次取舍与历史规范的替代关系 |

进入代码开发前先读 [AGENTS.md](AGENTS.md)。2026 年 4 月的 [office-hours 文档](docs/office-hours/)作为历史决策保留，其中与本次方向冲突的限制已被替代。

## 当前原型仍可运行

```bash
pnpm install
cp .env.example .env
pnpm dev
```

本地宣传首页为 `http://localhost:5173/`，三页工作台为 `http://localhost:5173/space`，健康检查为 `http://localhost:8787/health`。未来主域名承载首页，`space.` 子域名承载工作台；DNS、反向代理与正式部署尚未配置。未配置 DashScope 时录音页会明确标记预置转写。详情见 [启动指南](docs/getting-started.md)。

现有技术栈为 React／Vite／TypeScript、Fastify／WebSocket、Zod 与 pnpm workspace。重构优先保留当前 TypeScript 入口，以独立模块和协议逐步替换；Python 处理 worker 是可选后续方案，不是本次已经完成的迁移。

## 交付状态与许可

本设计基于 [Jobo16/FocusMate 提交 a263a6b](https://github.com/Jobo16/FocusMate/tree/a263a6b165816bccdb3385c31ccf4e98a92d1d20)。本地前端已改为 Daymark 宣传首页和录音／AI 聊天／设置工作台。服务端旧接口仍在，尚未交付持久录音、历史检索或 Agent 工具调用；也未验证手机后台采集和模型效果。

该基线未发现明确许可证。本设计文档不赋予上游源码额外许可；复用第三方实现时分别核对对应版本的许可条件。
