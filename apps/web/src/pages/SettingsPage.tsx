import { AudioLines, Bot, Database, ShieldCheck } from "lucide-react";

const capabilities = [
  { icon: AudioLines, title: "麦克风", state: "主动开启", description: "仅在录音页点击开始后使用；停止或离开页面会释放麦克风。" },
  { icon: Database, title: "资料保存", state: "待接入", description: "当前服务没有原始录音持久化或历史资料库。转写只在本次页面中预览。" },
  { icon: Bot, title: "Agent 检索", state: "待接入", description: "尚未建立历史检索工具与 Agent 对话接口，因此聊天输入暂不可用。" },
];

export const SettingsPage = () => (
  <>
    <section className="mb-10">
      <p className="eyebrow text-forest">CONTROL / WEB</p>
      <h1 className="mt-4 text-[clamp(34px,4vw,56px)] font-semibold tracking-[-0.055em] text-ink">设置</h1>
      <p className="mt-4 max-w-[660px] text-sm leading-7 text-ink/55">查看当前网页预览实际可用的能力。尚未生效的存储与授权选项不会显示成可操作开关。</p>
    </section>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(270px,.75fr)]">
      <section className="surface-block p-6 sm:p-8"><p className="eyebrow text-forest">CURRENT CAPABILITIES</p><h2 className="mt-2 text-xl font-semibold text-ink">能力状态</h2><div className="mt-8 grid gap-6">{capabilities.map(({ icon: Icon, title, state, description }) => <div key={title} className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mist text-forest"><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="text-[14px] font-semibold text-ink">{title}</h3><span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-semibold text-forest">{state}</span></div><p className="mt-2 max-w-[530px] text-[13px] leading-7 text-ink/55">{description}</p></div></div>)}</div></section>
      <aside className="rounded-[25px] bg-forest p-6 text-paper sm:p-7"><ShieldCheck size={24} strokeWidth={1.7} aria-hidden="true" /><p className="eyebrow mt-7 text-mint">YOUR CONTROL</p><h2 className="mt-2 text-xl font-semibold leading-8">范围需要明确。</h2><p className="mt-4 text-[13px] leading-7 text-paper/70">以后接入持久资料时，保存位置、处理位置和 Agent 可查范围会分别配置。当前版本没有这些设置，也不会把录音悄悄加入可检索历史。</p></aside>
    </div>
  </>
);
