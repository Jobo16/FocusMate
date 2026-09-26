import { ArrowUpRight, Bot, FileSearch, LockKeyhole, Send } from "lucide-react";

export const ChatPage = () => (
  <>
    <section className="mb-6">
      <p className="eyebrow text-forest">DAYMARK / AGENT</p>
      <h1 className="mt-4 text-[clamp(34px,4vw,49px)] font-semibold tracking-[-0.055em] text-ink">问一问你的上下文。</h1>
      <p className="mt-4 max-w-[680px] text-sm leading-7 text-ink/55">这里将通过检索工具查找历史资料，回答时带上原始来源与时间。历史检索服务尚未接入，当前不能发送问题。</p>
    </section>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,.7fr)]">
      <section className="chat-panel surface-block flex flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-forest text-paper"><Bot size={22} strokeWidth={1.7} aria-hidden="true" /></span><div><p className="text-[14px] font-semibold text-ink">Daymark Agent</p><p className="text-[11px] text-ink/45">带证据的个人上下文问答</p></div></div><span className="rounded-full bg-mist px-3 py-1.5 text-[11px] font-semibold text-forest">待接入</span></div>
        <div className="flex flex-1 flex-col items-start justify-center py-8"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-mist text-forest"><FileSearch size={29} strokeWidth={1.5} aria-hidden="true" /></span><h2 className="mt-7 text-[25px] font-semibold tracking-[-0.035em] text-ink">让答案回到出处。</h2><p className="mt-3 max-w-[480px] text-[13px] leading-7 text-ink/55">未来你可以问“上周讨论的方案最后怎么定的？”。Agent 会先查找有权限的资料，再展示引用与检索范围。</p></div>
        <div className="chat-composer" aria-disabled="true"><input aria-label="聊天输入暂不可用" value="" readOnly disabled placeholder="历史检索接通后，在这里提问" /><button type="button" disabled aria-label="发送暂不可用"><Send size={18} aria-hidden="true" /></button></div>
        <p className="mt-3 flex items-center gap-2 text-[11px] text-ink/45"><LockKeyhole size={13} aria-hidden="true" />历史检索和 Agent 工具尚未上线，输入已停用。</p>
      </section>
      <aside className="rounded-[25px] bg-forest p-6 text-paper sm:p-7"><p className="eyebrow text-mint">HOW ANSWERS WORK</p><h2 className="mt-7 text-xl font-semibold leading-8">先找到，再回答。</h2><div className="mt-8 space-y-7"><div><span className="font-display text-xl text-mint">01</span><p className="mt-2 text-[13px] font-semibold">检索可访问的历史</p></div><div><span className="font-display text-xl text-mint">02</span><p className="mt-2 text-[13px] font-semibold">核对原文与时间</p></div><div><span className="font-display text-xl text-mint">03</span><p className="mt-2 text-[13px] font-semibold">附上证据和覆盖范围</p></div></div><p className="mt-10 text-[12px] leading-6 text-paper/65">当前没有可供 Agent 查询的持久资料。录音页的临时转写不会成为聊天历史。</p><span className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold text-mint">检索接口开发中 <ArrowUpRight size={15} aria-hidden="true" /></span></aside>
    </div>
  </>
);
