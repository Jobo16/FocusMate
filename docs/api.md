# 上下文服务 API 与 Agent 工具规范

> **状态：目标协议，尚未在基线运行时实现。** 当前可调用接口见 [legacy-api.md](legacy-api.md)。新接口统一使用 `/api/v1` 与 snake_case；以下路径、默认值和限制是实现基线，不是现有服务能力。

## 1. 通用约定

- 认证绑定调用者、数据所有者、节点及允许的数据源／时间范围；请求体不能通过 `owner_id` 改变所有权。
- 本地服务默认仅监听 loopback，并验证本地客户端凭证与来源；仅监听 localhost 不能替代鉴权。远程服务使用加密传输与逐请求授权。
- 所有 ID 为不透明稳定 ID，按 ID 读取时仍校验权限和删除状态。
- 时间采用带毫秒的 UTC ISO 8601；时间范围为 `[start, end)`，且 `start < end`。设备时钟与校时语义见 [数据模型](data-model.md)。
- 新字段使用 `source_kind`，值为 `microphone | system_audio | screen | share | import`。查询过滤使用 `source_kinds`。
- `epistemic_type` 为 `observed | extracted | inferred`，分别表示观察、提取和推断；分数不是已校准的事实概率。
- 响应包含 `request_id`、生成时间或快照信息。日志记录标识、阶段和错误类型，默认不记录完整个人素材与查询结果。
- `/api/v1` 兼容演进优先增加可选字段；不兼容字段变更使用新版本。分页绑定身份、过滤条件、索引快照和过期时间，不能只用不稳定 offset。

搜索的机器可校验契约见 [context-search.schema.json](contracts/context-search.schema.json)。该 Schema 校验数据形状；时间先后、权限和证据一致性必须由业务层验证。目标实现 PR 将实际启用部分落实到 `packages/shared`，旧运行时代码继续以原有 Zod 为准。

## 2. 采集写入协议

采集身份与 Agent 查询身份可授予不同权限。Agent 的四个查询工具均为只读，不具有启动录音、写入或删除权限。

| 接口 | 输入／输出与语义 |
| --- | --- |
| `POST /api/v1/capture/sessions` | 提交 `session_id`、设备标识、请求来源及能力／策略快照；返回各来源许可结果。创建元数据不代替系统授权，也不自动开启硬件 |
| `POST /api/v1/capture/assets` | 注册已封装素材的 `asset_id`、媒体类型、预期大小、哈希和分片清单；返回上传句柄及大小限制 |
| `PUT /api/v1/capture/assets/{asset_id}/chunks/{chunk_index}` | 上传指定分片并校验分片哈希；相同分片重传幂等，内容不同返回冲突 |
| `POST /api/v1/capture/assets/{asset_id}/complete` | 校验完整素材、大小与清单，持久保存素材及元数据；不完整上传不能进入稳定索引 |
| `POST /api/v1/capture/records` | 提交稳定 `record_id`、session_id、origin_node_id、source_kind、采集区间、device_seq、来源元数据和已完成的 `asset_ids`；原子提交记录和 outbox |
| `POST /api/v1/capture/sessions/{session_id}/stop` | 记录结束和各来源状态；不删除已保存资料，不假装能远程停止离线设备的硬件 |

`POST /records` 只有在原始素材已通过完整性验证并满足节点持久性约定，且记录与待处理作业已提交后，才返回 `201` 和 `durable: true`。重复提交同一逻辑记录返回 `200`、`duplicate: true`；相同 ID 携带冲突内容返回 `409`。`202` 仅表示接收中或排队，不能作为“已可靠保存”的确认。

采集器在持久确认前保留可重传缓冲。断连后依据分片序号补传；WebSocket 只作为实时预览或传输渠道，不成为记录生命周期。音频分片需保留原始时间映射；临时 partial ASR 不默认进入长期索引。

实现应限制素材大小、并发、队列和磁盘配额。空间不足返回明确错误并暂停相应采集，不能默默丢弃后仍显示全部保存。服务端内部对象存储凭证与本地路径不暴露为公开 API。

## 3. 四个只读工具

| MCP 工具名 | HTTP 接口 | 职责 |
| --- | --- | --- |
| `context.search` | `POST /api/v1/context/search` | 找到候选事件和证据片段 |
| `context.get_event` | `GET /api/v1/context/events/{event_id}` | 展开事件、前后文及支持证据 |
| `context.get_source` | `GET /api/v1/context/sources/{evidence_id}` | 根据证据定位原文、截图或音频范围 |
| `context.get_coverage` | `GET /api/v1/context/coverage` | 查询授权节点的可用性、采集与索引覆盖 |

HTTP 和 MCP 调用同一套应用服务、授权与结果组装，不各自维护检索逻辑。MCP 支持结构化结果和资源引用，可用于承载这些能力。[MCP 工具规范](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)

### 3.1 context.search

输入字段：

| 字段 | 规则 |
| --- | --- |
| `query` | 非空查询文本，最大 1000 字符 |
| `time_range` | 可选的明确 UTC 区间。相对时间由消费端按用户时区解析；服务端不把含“昨天”的文本擅自视为完整过滤条件 |
| `node_ids` | 可选授权节点 ID；省略时搜索授权配置中的节点 |
| `source_kinds` | 可选来源过滤 |
| `include_derived` | 默认 false；为 true 才纳入事件摘要等推断内容 |
| `limit` | 默认 10，范围 1—50 |
| `max_tokens` | 默认 4000，范围 256—16000；结果文本预算，不代替素材大小上限 |
| `cursor` | 可选的不透明分页句柄；改变过滤条件须重新搜索 |

服务执行权限过滤、时间／来源筛选、关键词与可用的语义索引召回、结果融合、去重及上下文补全。关键词通路必须可独立使用；语义索引不可用时如实报告降级与积压，不能伪造完整覆盖。

结果 `items` 中每项包含：

- `hit_id`、可空的 `event_id`、`record_ids`、`evidence_ids`。
- 提供本次结果的 `node_id` 与记录来源 `origin_node_id`。
- `source_kind`、`recorded_at`、`recorded_end_at`。
- `snippet`、`epistemic_type`、排序用 `score`。
- `raw_status`，说明原始素材是否仍可核对。

事件聚合还未完成时，`event_id` 可以为空；有稳定证据的已完成转写／OCR 仍可检索。派生内容必须有非空支持证据集合；不能向外部 Agent 只返回孤立总结。结果按逻辑 ID 去除同步副本重复，保留相同内容在不同时间再次出现的事实。

默认选择最新有效证据版本；查看历史引用时可读取被替代版本并注明替代关系。完整删除优先于任何索引快照，分页或缓存不得重新暴露被删除内容。

`max_tokens` 约束文本内容与已展开上下文；结构化元数据受单独条数与大小上限约束。响应标记 `truncated` 与 `next_cursor`。token 计算器版本须固定并记录，调用方仍按实际模型窗口预留空间。

示例见 [搜索请求](examples/search-request.json) 与 [搜索响应](examples/search-response.json)。它们是合成数据，不是采集到的用户记录。

### 3.2 context.get_event

输入：路径中的 `event_id`；可选 `before_ms`、`after_ms`（默认 60000，范围 0—300000），`max_tokens`（默认 8000，上限 16000）。

输出：事件修订、时间区间、成员记录、证据引用、摘要及其 `epistemic_type`、可用原文、前后文、`coverage`、`index_watermark` 与截断标记。补全文本仍需符合调用者来源／时间权限，不能因“前后文”读取被禁止范围。

合并或拆分过的事件返回明确的重定向或后继事件 ID，不能让同一个旧 ID 悄悄表示另一件事。原始证据缺失时保留可验证的文字记录并注明原因，禁止捏造音频出处。

### 3.3 context.get_source

输入：路径中的 `evidence_id`；可选范围。音频使用相对原始素材的 `start_ms/end_ms`，图片区域使用相对原图的 0—1 `bbox`，文本字符区间采用 Unicode code point、左闭右开；实现不得混用 UTF-16 代码单元。未提供范围时使用该证据的原始定位范围。

输出：`evidence_id`、支持记录／素材 ID、提取文本、提取版本、`epistemic_type`、定位信息、`raw_status`、已替代证据 ID，以及可选的受控 `source_handle`。

`source_handle` 由服务解析为经授权的图片／音频响应或短期资源链接；不得用任意本地路径、任意 URL 或未检查的文件名充当读取参数。每次解析重新检查权限。节点上的内部资产路径不返回给云端消费者。

原始素材过期时可以返回仍合法保留的提取文本，并说明 `raw_status=expired`；不把重建摘要当原文。完整删除或未经授权的 ID 读取采用统一的不可读结果，避免泄露其他用户资料是否存在。

### 3.4 context.get_coverage

输入：可选 `node_ids`、`source_kinds`、`time_range`，语义与 search 一致。

输出包括：

- `coverage.complete`：本次请求范围内，配置且获授权的数据节点是否全部可搜索；不表示记录了用户生活中的所有事情。
- `coverage.nodes[]`：节点状态 `searched | partial | offline | unsynced`、原因、已搜索范围和 `capture_gaps`。
- `index_watermark[]`：每个节点／索引版本的 `known_indexed_through` 与 `pending_ranges`。没有连续处理依据时前者为空，不能用最大记录时间代替。
- 采集来源的状态、最后接收与处理时间、积压或时钟不确定性可作为扩展详情。

只报告调用者有权知道的节点。节点离线不等于“没有资料”，没有命中不等于“这件事从未发生”。设备未采集的时间、素材尚未同步和已采集但未索引是不同缺口。

## 4. 错误与兼容

| 情况 | HTTP／处理方式 |
| --- | --- |
| 字段／范围错误 | `400 invalid_request`；给可修复字段，不输出内部异常 |
| 无凭证／无操作权限 | `401`／`403`；具体资料 ID 可使用统一 `404 not_found` 隐藏存在性 |
| 重复 ID 内容冲突 | `409 idempotency_conflict` |
| 素材／请求过大 | `413 payload_too_large` |
| 调用或资源额度受限 | `429 rate_limited`，可附重试时间 |
| 本地存储不足 | `507 insufficient_storage`，采集端进入明确错误／暂停流程 |
| 单个节点离线／部分索引未完成 | 可返回 `200` 的部分结果，同时 `coverage.complete=false` |
| 请求范围内没有任何可执行的查询节点 | `503 sources_unavailable`；附安全的可见覆盖信息 |
| 原始素材按策略过期 | 证据元数据可返回 `200` 和 expired；请求已不可用的原始 bytes 返回 `410` |

MCP 适配器保留相同结构化错误码，按协议表达工具执行失败。超时必须取消尚未完成的下游任务或释放资源，不能让过期请求无限占用 worker。

旧接口由兼容适配器调用新服务，但在迁移完成前保留原路由和字段。旧 `sessionId` 不自动等同于新持久 `session_id`；映射需显式维护。旧历史导入的范围、缺失原始证据和可回滚要求见 [重构规范](refactoring.md)。

## 5. 必须由实现验证的边界

同一记录重复上传不产生重复证据；跨用户 ID 不能读取；关键词精确词可命中；前后文遵守权限；无结果与节点不可用可区分；删除后缓存／向量不再暴露；模型失败不阻止已落盘素材后续重试；多节点结果不假装覆盖未同步手机；所有证据可定位到真实素材或明确标注的导入文字。

本次示例通过形状校验不代表上述运行时行为已经实现。
