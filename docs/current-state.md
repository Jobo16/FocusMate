# 当前实现与目标能力对照

**核对基线：** Jobo16/FocusMate，`a263a6b165816bccdb3385c31ccf4e98a92d1d20`。
**当前产品名称：** Daymark（原 FocusMate）。源码链接继续指向用于核对的原仓库与基线提交。
**日期：** 2026-09-26。
**检查方式：** README、依赖、目录与源码静态检查；未执行浏览器录音、模型调用、端到端性能或真机测试。

## 能力状态

| 能力 | 基线状态 | 重构目标 |
| --- | --- | --- |
| 网页麦克风与 WebSocket | 有实现 | 补握手、断线处理、可靠分片确认 |
| DashScope 实时 ASR | 有接入代码 | 可替换处理器，保存分段时间与处理版本 |
| 恢复卡片与逐字稿问答 | 有实现 | 作为查询服务的独立消费场景 |
| 数据持久化 | 服务端内存；浏览器最多 50 张卡片 | 原始素材、记录、事件与索引独立持久化 |
| 会话生命周期 | 一个 WebSocket 对应一个内存 session | 采集 session 独立于连接，连接关闭不删除记录 |
| 桌面截图／原生移动采集 | 未实现 | 各平台独立采集适配器 |
| 多模态事件关联 | 未实现 | 按证据组织事件，保留关联不确定性 |
| Agent 检索 API／MCP | 未实现 | 四个只读上下文工具 |
| 账户与服务端额度 | 未实现 | 云端身份、访问范围与资源控制 |
| 跨设备同步／联合查询 | 未实现 | 按策略同步，显式报告覆盖范围 |
| 自动化测试 | 基线无测试文件 | 按迁移风险补契约、持久化和检索验证 |

当前 `package.json` 为 `0.1.0`；README 旧标题中的 v2 不代表已有稳定版，也不代表上述目标已完成。

## 已核对的具体限制

1. **演示来源。** 没有 DashScope Key 时采用预置课堂文本；没有 LLM Key 或恢复卡模型请求失败时使用规则兜底。现有 `usedFallback` 是恢复接口的标志，新管线还需独立保留模拟来源标记。
2. **短期缓存。** `TranscriptBuffer` 按最近 5 分钟管理片段，`SessionStore` 是进程内 Map；WebSocket 断开会删除 session。
3. **历史范围。** localStorage 中最多 50 张恢复卡片可能包含对应逐字稿，但不包含可恢复的完整历史录音。不能将这些卡片导入伪装成完整采集历史。
4. **问答上下文。** 前端按当前窗口提交问题；模型调用没有携带前几轮问答。不能描述为完整多轮记忆问答。
5. **界面信号。** 波形使用随机幅值；额度和兑换逻辑存在前端。它们不能分别作为真实收音质量和服务端计费控制。
6. **启动竞态。** 前端 WebSocket 未 OPEN 时发送函数会跳过消息，录音启动流程没有完整等待与确认链。存在启动指令丢失风险，尚未运行复现。
7. **资源生命周期。** socket/audio 引用位于首页 Hook，切换页面的卸载清理未覆盖这些资源。需要通过切页、返回与停止录音场景复现并修正。
8. **模型超时。** 当前模型 fetch 未显式设置应用层超时。旧文档中的 3—8 秒是目标，不是测量结果。
9. **数据保护。** 当前没有账号认证、持久化资料权限或按节点授权的检索接口；原型不可直接描述为新的云端资料服务。

## 源码证据

- [录音连接生命周期](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/features/connection/useConnection.ts)
- [WebSocket 客户端](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/ws/transcriptSocket.ts)
- [服务端会话](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/server/src/ws/transcriptSocket.ts)
- [转写缓存](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/server/src/buffer/transcriptBuffer.ts)
- [恢复卡模型调用](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/server/src/recovery/modelClient.ts)
- [追问调用](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/server/src/recovery/qaClient.ts)
- [浏览器历史](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/stores/recoveryStore.ts)
- [波形](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/features/connection/RecordingTimeline.tsx)
- [额度](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/stores/usageStore.ts)

未来每次能力落地都应在本表写明实现提交、验证方式与尚未覆盖的条件。仅新增文档、空目录或接口声明，不应将状态改为“已实现”。
