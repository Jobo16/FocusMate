# 当前原型启动与重构入口

**本页描述当前已经存在的 Web 原型。** 新上下文服务的接口、数据库和三端客户端仍按 [路线图](roadmap.md) 分阶段实现，不能用本文启动命令推断目标功能已经可用。

## 环境与启动

项目使用 pnpm 10；可采用 Dockerfile 同系列的 Node.js 22，并以锁文件和依赖实际要求为准。

在仓库根目录运行：

```bash
pnpm install
cp .env.example .env
pnpm dev
```

若已经有自己的 `.env`，保留已有配置，不重复覆盖。

- 宣传首页：`http://localhost:5173/`
- 三页工作台：`http://localhost:5173/space`
- 健康检查：`http://localhost:8787/health`

`pnpm dev` 会先构建共享包，再启动 Fastify 服务端和 Vite 前端。

## 当前环境变量

```dotenv
PORT=8787
HOST=0.0.0.0
DASHSCOPE_API_KEY=
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

这些变量来自当前 `.env.example`；本次没有新增可运行的本地知识库或云端同步配置。

| 配置 | 当前行为 |
| --- | --- |
| 没有 DashScope Key | 使用预置课堂文字作为 mock 转写 |
| 有 DashScope Key | 尝试连接真实 ASR |
| 没有 LLM Key | 旧 `/api/recover` 返回规则兜底；新 AI 聊天页仍不可用 |
| 有 LLM Key | 仅旧恢复接口尝试模型生成；不是历史检索 Agent |
| 旧恢复模型失败 | 返回兜底卡片，响应带 `usedFallback` |

API Key 的缺失和麦克风权限失败是不同条件。网页录音页在权限或连接失败时显示错误，不会把失败当成已录音。未配置 DashScope 时，服务端仍返回预置课堂文本，页面明确标记为演示。

## 手机访问当前 Web 原型

浏览器麦克风要求安全上下文。电脑上的 localhost 与手机访问局域网 HTTP 地址不是同一情况，真实手机录音应使用符合浏览器要求的 HTTPS 环境。

页面切后台、锁屏、音频中断和系统回收需要实机验证；当前原型没有全天后台录音保证。平台依据见 [平台能力](platforms.md)。

## 当前数据与部署边界

当前三页工作台不提供历史卡片、额度或旧偏好入口。旧浏览器 localStorage 数据不会被自动删除或冒充新历史。服务端转写只保存在短期内存会话；重启或断开连接会丢失会话，刷新页面也会清除当前转写预览。原型没有完整录音归档、历史检索、跨设备同步或账户资料隔离。

正式部署主域名首页与 `space.` 子域名工作台时，可分别指向同一前端构建，并使工作台同源提供 `/ws`。如需显式指定跨站跳转地址，可设置构建变量 `VITE_WORKSPACE_URL` 和 `VITE_MARKETING_URL`；这两个变量只控制导航，不配置后端或 DNS。

现有 Dockerfile 只构建和运行服务端及其依赖，不会提供已经打包好的完整网页站点。当前 GitHub Actions 调用原作者服务器上的外部部署脚本；不要将该工作流原样当作新环境的通用部署方案。

## 开始重构

按 [产品方向](product-direction.md)、[架构](architecture.md)、[重构规范](refactoring.md) 和 [AGENTS.md](../AGENTS.md)执行。旧接口说明保留于 [legacy-api.md](legacy-api.md)。

先在开发环境构建契约、持久化和可靠采集链，再接外部 Agent 验证资料检索。新增能力通过实际实现和验证后，更新 [能力状态表](current-state.md)。
