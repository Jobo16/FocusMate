import { AudioLines, Mic, Square } from "lucide-react";
import { ListeningStatus } from "../features/connection/ListeningStatus";
import { useConnection } from "../features/connection/useConnection";
import { useTranscriptStore } from "../stores/transcriptStore";

export const RecordPage = () => {
  const { connectionState, statusMessage, segmentCount, startedAt, startListening, stopListening } = useConnection();
  const transcript = useTranscriptStore((state) => state.transcript);
  const active = connectionState === "listening";
  const connecting = connectionState === "connecting";

  return (
    <>
      <section className="mb-10">
        <p className="eyebrow text-forest">CAPTURE / WEB</p>
        <h1 className="mt-4 text-[clamp(36px,4.5vw,61px)] font-semibold leading-[1.18] tracking-[-0.055em] text-ink">
          录下此刻，<span className="text-forest">找回上下文。</span>
        </h1>
        <p className="mt-5 max-w-[690px] text-[14px] leading-8 text-ink/55">
          只有点击开始后才会使用麦克风。当前提供实时连接与转写预览，尚不保存原始音频或建立历史资料。
        </p>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.8fr)]">
        <section className="surface-block flex min-h-[400px] flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="eyebrow text-forest">LIVE SESSION</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">网页麦克风</h2></div>
            <span className="rounded-full bg-mist px-3 py-1.5 text-[11px] font-semibold text-forest">实时预览</span>
          </div>
          <div className="mt-8"><ListeningStatus connectionState={connectionState} statusMessage={statusMessage} startedAt={startedAt} /></div>
          <div className="flex flex-1 flex-col justify-center py-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mist text-forest"><Mic size={25} strokeWidth={1.7} aria-hidden="true" /></span>
            <h3 className="mt-5 text-xl font-semibold text-ink">
              {active ? "本次录音进行中" : connecting ? "正在准备录音" : "等待你开始"}
            </h3>
            <p className="mt-2 max-w-[500px] text-[13px] leading-7 text-ink/50">
              {connectionState === "error" ? statusMessage : active ? `当前连接收到 ${segmentCount} 个转写片段。停止后临时会话会结束。` : "请确认这段内容允许录制。麦克风只在本页录音期间启用。"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {active ? (
              <button type="button" onClick={() => void stopListening()} className="button-primary"><Square size={16} aria-hidden="true" />停止录音</button>
            ) : (
              <button type="button" onClick={() => void startListening()} disabled={connecting} className="button-primary"><Mic size={17} aria-hidden="true" />{connecting ? "正在连接" : "开始录音"}</button>
            )}
            <span className="text-[12px] text-ink/45">停止后释放麦克风与连接</span>
          </div>
        </section>

        <aside className="rounded-[25px] bg-forest p-6 text-paper sm:p-7">
          <AudioLines size={24} strokeWidth={1.7} aria-hidden="true" />
          <p className="eyebrow mt-8 text-mint">CURRENT SCOPE</p>
          <h3 className="mt-2 text-xl font-semibold leading-8">预览不等于保存。</h3>
          <p className="mt-4 text-[13px] leading-7 text-paper/70">当前服务端只维护短期内存会话。原始音频、上传确认和历史检索尚未接入。</p>
        </aside>
      </div>

      {transcript.length > 0 && (
        <section className="surface-block mt-5 p-6 sm:p-8">
          <p className="eyebrow text-forest">CURRENT TRANSCRIPT / TEMPORARY</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">本次转写预览</h2>
          <div className="mt-6 space-y-4">
            {transcript.filter((part) => part.isFinal).map((part) => (
              <p key={part.id} className="text-[13px] leading-7 text-ink/70">
                {part.text}<span className="ml-3 text-[11px] text-ink/35">{part.source === "mock" ? "预置文本" : "实时转写"}</span>
              </p>
            ))}
          </div>
          <p className="mt-7 text-[12px] text-ink/45">这段预览不会进入 Daymark 历史库；刷新页面后消失。</p>
        </section>
      )}
    </>
  );
};
