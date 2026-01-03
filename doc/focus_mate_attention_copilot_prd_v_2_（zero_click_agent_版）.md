# FocusMate / Attention Copilot

**PRD v2 —— Zero‑Click Interface & Agentic Attention System**

---

## 一、产品愿景（Vision）

> **在信息持续输入的世界中，为人类提供一个稳定、克制、可信赖的“外置注意力系统”。**

FocusMate 不是一个聊天工具，也不是一个会频繁提醒的 AI 助手，而是一个：

> **始终在听、持续理解、提前准备、但从不主动打断你的 Agent。**



---

## 二、核心问题重新定义（Problem Statement 2.0）

### 1. 真实问题

在课堂、会议、讲座等场景中，问题并非“信息不够获取”，而是：

- 人类注意力天然是**间歇性的**
- 重要信息的出现往往**不可预测**
- 一次走神，可能导致后续理解全面崩塌

> **人类无法持续在线，但系统可以。**

---

## 三、产品定位（Positioning）

### 一句话定位

> **Attention Infrastructure（注意力基础设施）**

### FocusMate 是什么

- 一个长期运行的 Attention Agent
- 一个在后台持续工作的理解系统
- 一个“你掉线时帮你托底”的智能体

### FocusMate 不是什么

- ❌ AI 聊天机器人
- ❌ 主动教学或替人思考的系统
- ❌ 频繁弹窗与提示的效率工具

---

## 四、设计哲学（Design Principles）

1. **No Chatbot Interface**
   - 不需要对话才能获得价值

2. **Low Interruption, High Preparedness**
   - AI 永远准备好
   - 用户需要时再出现

3. **Probabilistic, Not Pretend‑Certain**
   - 明确表达 AI 理解的强弱

4. **User as Manager, Agent as Executor**
   - 用户不是操作者，而是策略制定者

5. **Zero‑Click by Default, One‑Gesture to Dismiss**
   - 自动 ≠ 强制

---

## 五、整体系统架构（Conceptual Architecture）

```
[Audio Stream]
      ↓
[Text0 · Raw Transcript]
      ↓
[Text1 · Real‑time Structured Understanding]
      ↓
[Agent Reasoning Layer]
      ↓
[Text2 · Prepared Assistance]
      ↓
[Zero‑Click / Low‑Friction Presentation]
```

---

## 六、核心功能模块（Core Modules）

### 1️⃣ Text0：持续监听与转写（Always‑On Listening）

- 用户进入场景后开启
- 系统进入长期监听状态
- 不区分主题、不假设边界

**设计目标：**
> 最大化信息完整性，最小化用户心智负担

---

### 2️⃣ Text1：实时结构化理解（Probabilistic Summarization）

#### 核心原则

- 不做强主题切割
- 接受实时理解的不确定性

#### 输出形态：信息泡泡（Bubble System）

- 按时间序列自动生成
- 永不遮挡主要注意力
- 不要求用户即时查看

#### 置信度表达（Probabilistic UI）

- **高确信内容**：实体泡泡 / 清晰边界
- **推断内容**：半透明泡泡
- **歧义内容**：模糊 / 虚线边界

> UI 直接表达「我知道」与「我在猜」，而不是用文字解释

---

### 3️⃣ Time Backtracking：注意力补救机制（Recovery Primitive）

#### 功能描述

- 快速回溯：30s / 1min / 5min
- 系统抽取该时段内所有 Text0 + Text1
- 重新生成一份“你本该理解的版本”

#### Zero‑Click 升级（谨慎启用）

当系统检测到：
- 用户注意力可能中断
- 同时出现高信息密度或任务信号

→ 轻量提示：
> 「你可能错过了一个关键点 · 可回溯 1 分钟」

- 不点击即消失
- 不构成强打断

---

### 4️⃣ Text2：Agent 级准备（Prepared, Not Pushed）

#### 功能定位

Text2 不是回答，而是：
> **“已经为你准备好，但不会主动递上来”的内容层**

#### 可生成内容

- 问题的候选回答
- 背景补充解释
- 潜在行动项
- 可直接执行的结构化资源（To‑do / Outline / Checklist）

#### 展示原则（强约束）

- ❌ 不自动展开
- ❌ 不打断主流程
- ✅ 仅以建议泡泡形式存在

---

## 七、Agent 策略层（Attention Policy Layer）

### 用户角色升级：从使用者 → 管理者

用户不再操作每个功能，而是**调教自己的注意力 Agent**。

#### 示例策略（自然语言）

- 「当出现明确任务或 deadline 时，提高优先级」
- 「概念铺垫阶段不要频繁生成建议」
- 「如果我 3 分钟未互动，提高整理密度」
- 「课堂中，问题 > 解释 > 延伸」

> 用户管理的是“什么时候出现”，而不是“出现什么”

---

## 八、Zero‑Click Interface 设计约束

### 1. Effortless Dismissal（极低成本拒绝）

- Esc / 双击空白
- 手势滑动 / 轻微晃动

> 拒绝必须比接受更容易

### 2. Integrated Why Layer（即时可解释性）

- 每个提示都可以查看：
  - 为什么现在出现
  - 依据了哪些信号

---

## 九、MVP 与阶段路线

### Phase 1（MVP）

- 持续录音 + 转写
- Text1 实时整理 + 信息泡泡
- Time Backtracking

### Phase 2（Agent 化）

- Text2 辅助准备
- 简版 Attention Policy
- Effortless Dismissal

### Phase 3（Zero‑Click）

- 情境触发提示
- Probabilistic UI 完整实现

---

## 十、最终产品宣言

> **人类不是不认真，只是无法一直在线。**

> **当你掉线时，你的 Agent 会帮你保持理解的连续性。**

FocusMate 不是一个替你思考的系统，
而是一个：

> **在你失焦的瞬间，仍然保持清醒的存在。**

