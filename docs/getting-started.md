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

- 页面：`http://localhost:5173`
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
| 没有 LLM Key | 恢复卡使用规则兜底，追问提示不可用 |
| 有 LLM Key | 尝试模型生成；模型接口需满足当前调用格式 |
| 恢复模型失败 | 返回兜底卡片，响应带 `usedFallback` |

API Key 的缺失和麦克风权限失败是不同条件。后者不保证会正确切换为 mock；源代码的状态一致性问题见 [实现现状](current-state.md)。

## 手机访问当前 Web 原型

浏览器麦克风要求安全上下文。电脑上的 localhost 与手机访问局域网 HTTP 地址不是同一情况，真实手机录音应使用符合浏览器要求的 HTTPS 环境。

页面切后台、锁屏、音频中断和系统回收需要实机验证；当前原型没有全天后台录音保证。平台依据见 [平台能力](platforms.md)。

## 当前数据与部署边界

历史、偏好和额度保存在浏览器 localStorage。服务端转写保存在内存；重启或连接生命周期变化会丢失相应会话。原型没有完整录音归档、跨设备同步或账户资料隔离。

现有 Dockerfile 只构建和运行服务端及其依赖，不会提供已经打包好的完整网页站点。当前 GitHub Actions 调用原作者服务器上的外部部署脚本；不要将该工作流原样当作新环境的通用部署方案。

## 开始重构

按 [产品方向](product-direction.md)、[架构](architecture.md)、[重构规范](refactoring.md) 和 [AGENTS.md](../AGENTS.md)执行。旧接口说明保留于 [legacy-api.md](legacy-api.md)。

先在开发环境构建契约、持久化和可靠采集链，再接外部 Agent 验证资料检索。新增能力通过实际实现和验证后，更新 [能力状态表](current-state.md)。
