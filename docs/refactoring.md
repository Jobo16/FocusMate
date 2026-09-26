# 增量重构规范

> 状态：目标规范，尚未实现。源码基线为 `Jobo16/FocusMate@a263a6b165816bccdb3385c31ccf4e98a92d1d20`。下文的修复、模块、接口和验证均为后续任务。

## 1. 重构目标与边界

将围绕最近几分钟转写的应用，演进为独立的个人上下文采集、整理、存储和检索服务。网页面向主动录音与云端节点，桌面与手机面向平台允许的本地采集；AI-ME、Weora 和其他 Agent 通过相同接口消费资料。

沿用 TypeScript、React、Fastify、Zod 的现有基础，先抽离边界，再替换实现。Python 可作为独立 ASR/OCR 处理器适配器引入，不要求整体改写后端。不在本轮更改品牌、包名或发布版本，不把 Agent Runtime、付费系统或全平台客户端作为核心数据链路的前置依赖。

产品范围见 [product-direction.md](product-direction.md)，模块边界见 [architecture.md](architecture.md)，字段与状态分别以 [data-model.md](data-model.md)、[api.md](api.md) 为准。

## 2. 现有文件的迁移安排

下表中的新模块均为待实现目标；最终目录与架构文档保持一致。

| 现有路径 | 保留／抽离方式 | 目标行为 |
|---|---|---|
| `packages/shared/src/index.ts` | 保留旧 Zod Schema，新增版本化上下文契约 | 旧卡片字段与新采集、事件、证据模型并存；禁止直接破坏旧接口 |
| `apps/web/src/audio/audioClient.ts`、`apps/web/public/pcm-worklet.js` | 保留浏览器音频接入，抽离采集记录封装 | 音频带稳定标识、实际采集时间、音源和序号；先进入可恢复缓冲再上传 |
| `apps/web/src/features/connection/useConnection.ts`、`apps/web/src/ws/transcriptSocket.ts` | 改造连接状态机和发送确认 | 等待连接、配置及启动确认；超时明确报错，重连按确认序号续传 |
| `apps/server/src/ws/transcriptSocket.ts` | 保留 `/ws` 兼容入口，接入统一写入服务 | 连接只管理传输；断线释放实时资源，不删除已持久化采集记录 |
| `apps/server/src/buffer/sessionStore.ts`、`transcriptBuffer.ts` | 内存 Map 和五分钟缓存仅作实时加速 | 新增持久化仓库与任务队列；事件、素材生命周期独立于 WebSocket |
| `apps/server/src/asr/dashscope.ts`、`resampler.ts` | 抽离为 ASR 提供器适配器 | 支持重试、处理版本、时间偏移；替换提供器不改变领域接口 |
| `apps/server/src/asr/mockTranscript.ts` | 只留在显式演示入口和测试夹具 | 单独数据目录／命名空间；默认真实检索排除模拟资料 |
| `apps/server/src/recovery/modelClient.ts`、`fallback.ts`、`qaClient.ts`、`prompt.ts` | 迁到上层恢复卡片消费者边界 | 通过检索服务取证据，不直接依赖 ASR、采集设备或内存会话结构 |
| `apps/server/src/routes/recover.ts`、`ask.ts` | 保留旧请求、响应与错误契约 | 内部逐步改为检索适配；新接口不继承 30/60/180 秒业务限制 |
| `packages/prompts/*`、`apps/web/src/features/recovery/*` | 保留为示例应用 | 卡片呈现模型／规则来源及真实证据，不能把推断写成已确认事实 |
| `apps/web/src/stores/recoveryStore.ts`、`apps/web/src/pages/HistoryPage.tsx` | 增加旧历史导出／导入适配器 | 保留旧数据，逐步接入新时间线与证据查看；见下一节 |
| `apps/web/src/stores/usageStore.ts`、`apps/web/src/features/connection/RecordingTimeline.tsx` | 替换演示额度与随机波形 | 真实音频能量、真实处理状态；本地时长只作显示，不能作为云端计费凭据 |
| `apps/server/src/index.ts`、`config/env.ts` | 抽出节点组合入口与配置 | 分别装配本地／云端存储和处理器；分别配置处理位置、存储位置与外发范围 |

新增目录按职责划分：`packages/context-core` 管领域行为，`packages/storage` 管持久化仓库与文件存储，`packages/processing` 管任务队列、OCR、去重和事件整理，`packages/retrieval` 管检索与覆盖，`packages/adapters` 管提供器及 HTTP／MCP 适配。`apps/server` 保留 Fastify 入口，可选择独立 `apps/worker` 处理进程；`apps/desktop`、`apps/mobile` 属于后续客户端，不要求先拆成微服务。目录空壳或接口声明不能算作模块完成。

## 3. 兼容与数据迁移

### 3.1 旧接口保留

在新版消费者通过兼容验证前，保留 `/api/recover`、`/api/ask`、`/ws` 及原请求／响应结构，旧 `camelCase` 字段原样兼容；新契约使用 `snake_case`，具体定义以 API 文档为准。新协议通过版本化入口增加持久写入确认等能力；不能假设旧客户端已经支持它。内部适配到新存储时仍需保持旧时间窗口、模式和错误语义，并记录兼容验证结果后再安排弃用。

### 3.2 历史记录导入

旧 `focusmate-history` 最多保存 50 张卡片，卡片可能包含拼接转写，但没有原始音频、截图和可靠的逐句音频定位。不能从它重建完整会议或生成虚假的原始证据。

迁移流程：用户主动导出旧历史并选择导入 → 校验结构 → 逐条写入历史卡片记录 → 返回成功、重复、失败数量与原因。使用原条目 ID、导出内容指纹和导入批次实现幂等；保留原 `timestamp`，另记 `imported_at`，标记 `legacy_import` 和原始证据缺失。旧时间只表示卡片生成记录，不能冒充准确采集时段。旧记录中的模拟／规则来源若不可判定，标记未知，不猜测。

导入成功前不清理 localStorage；成功后也保留原导出文件。失败允许重试。无法恢复已经被 50 条上限裁掉的历史。设置与时长可迁移为用户偏好或展示数据，客户端解锁标记不得变为云端付费权益。

### 3.3 存储升级与回退

先扩展 Schema，再兼容读取和切换写入，最后才规划旧结构退役。迁移前创建可验证备份并记录 Schema 版本。原始素材 ID 与采集时间保持稳定，索引由事实记录重建。

回退优先关闭新写入或切回兼容读取；旧程序无法识别新 Schema 时进入维护／只读状态。不得为运行旧版而删库、降级覆盖新数据或丢弃已确认素材；仅测试库可重置。旧 WebSocket 生命周期不能作为新版删除策略。

## 4. 必须维持的系统不变量

1. **确认即可靠接收。** 服务端仅在原始分片和关联元数据达到约定持久化边界后确认；客户端确认前保留缓冲。重复、乱序和重连不能产生重复事实记录。旧协议没有此保证时不得在 UI 中声称“已保存”。
2. **采集与处理解耦。** ASR、OCR 或模型不可用时仍保留已接收素材和失败任务；重试从明确阶段继续。队列满、磁盘不足和采集暂停须体现为状态／覆盖缺口，禁止静默丢失或伪造连续记录。
3. **时间与来源可追溯。** 区分采集、接收、处理时间，记录设备时钟偏差。ASR 临时结果与最终结果按稳定 ID 修订；处理重跑产生版本，保留对原素材的引用。
4. **检索返回可核对资料。** 关键词、时间／来源过滤与可选语义索引共同使用；返回事件、证据、来源与覆盖情况。空结果、处理未完成、节点离线、访问被拒绝必须可区分。
5. **节点可独立运行。** 本地资料不依赖云端可用性；本地进程退出后不能宣称还能查询未同步资料。外部 Agent 不直接读取数据库，所有接口执行同样的身份和范围限制。
6. **删除与授权跨层生效。** 撤销权限后立即阻止新的查询；删除追踪原件、提取文本、事件引用、摘要、缓存、索引及同步副本。离线副本未确认前显示待处理，不宣称全部删除完成。
7. **记录与推断分开。** 摘要、任务推断须带生成来源和证据；屏幕／录音里的指令属于被检索资料，不获得控制 Agent 的权限。

## 5. 已识别风险与修复验收

以下来自静态源码阅读，尚未运行复现。

| 风险与源码 | 对应修复验收 |
|---|---|
| 前端发送函数在 WebSocket 未打开时跳过消息；启动流程没有等待确认。[源码](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/ws/transcriptSocket.ts) | 延迟建立连接，确认启动配置不丢；启动失败不能显示正在录音；失败和断线后释放麦克风资源 |
| `close` 删除内存会话。[源码](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/server/src/ws/transcriptSocket.ts) | 持久化后强制断开、重启，已确认素材仍可检索；实时连接资源正常释放 |
| 麦克风失败会进入“模拟”状态。[源码](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/web/src/features/connection/useConnection.ts) | 权限拒绝只显示真实失败；演示需要显式开启，不能向真实库注入模拟内容 |
| 卡片接口已有 `usedFallback`，界面需完整体现。[源码](https://github.com/Jobo16/FocusMate/blob/a263a6b165816bccdb3385c31ccf4e98a92d1d20/apps/server/src/recovery/modelClient.ts) | 无 Key、空转写和模型失败显示真实状态及规则来源；不能将演示或规则兜底报告为模型成功 |

测试只围绕本次修改的风险与相应里程碑。文档更新核对链接、路径和现状标签；运行时变更验证影响到的契约、持久化或检索行为。不得把空测试命令通过当作行为验证。
