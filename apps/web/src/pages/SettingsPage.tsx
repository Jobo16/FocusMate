import { BookOpen, BriefcaseBusiness, Mail } from "lucide-react";
import {
  RECOVERY_WINDOWS,
  type RecoveryMode,
  type RecoveryWindowSeconds,
} from "@focusmate/shared";
import { SegmentedControl } from "../components/SegmentedControl";
import { useSettingsStore } from "../stores/settingsStore";

const MODE_OPTIONS = [
  {
    value: "classroom" as RecoveryMode,
    label: "课堂",
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  {
    value: "meeting" as RecoveryMode,
    label: "会议",
    icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
  },
];

const WINDOW_LABELS: Record<RecoveryWindowSeconds, string> = {
  30: "30 秒",
  60: "60 秒",
  180: "3 分钟",
};

export const SettingsPage = () => {
  const { defaultMode, defaultWindow, setDefaultMode, setDefaultWindow } =
    useSettingsStore();

  return (
    <div className="flex flex-col gap-8 overflow-y-auto pb-4 pt-2">
      {/* Default mode */}
      <section>
        <h3 className="mb-2 text-[13px] font-semibold text-ink/60">默认模式</h3>
        <p className="mb-3 text-xs text-ink/30">打开应用时默认选择的模式</p>
        <SegmentedControl
          value={defaultMode}
          options={MODE_OPTIONS}
          onChange={setDefaultMode}
        />
      </section>

      {/* Default window */}
      <section>
        <h3 className="mb-2 text-[13px] font-semibold text-ink/60">
          默认时间窗口
        </h3>
        <p className="mb-3 text-xs text-ink/30">恢复卡片默认回溯的时间范围</p>
        <div className="inline-flex items-center gap-1.5">
          {RECOVERY_WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setDefaultWindow(window)}
              className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition active:scale-[0.97] ${
                defaultWindow === window
                  ? "bg-ink text-paper shadow-sm"
                  : "bg-black/[0.04] text-ink/35"
              }`}
            >
              {WINDOW_LABELS[window]}
            </button>
          ))}
        </div>
      </section>

      {/* Feedback */}
      <section>
        <h3 className="mb-2 text-[13px] font-semibold text-ink/60">提点意见</h3>
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/[0.04]">
          <p className="text-sm text-ink/50">欢迎反馈使用体验和改进建议</p>
          <a
            href="mailto:jo-bo@qq.com"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-moss"
          >
            <Mail className="h-3.5 w-3.5" />
            jo-bo@qq.com
          </a>
        </div>
      </section>

      {/* About */}
      <section>
        <h3 className="mb-2 text-[13px] font-semibold text-ink/60">关于</h3>
        <div className="rounded-2xl bg-white/60 p-4 text-sm ring-1 ring-black/[0.04]">
          <p className="font-semibold text-ink">FocusMate v2</p>
          <p className="mt-1 text-ink/50">课堂/会议实时上下文恢复工具</p>
          <p className="mt-2 text-xs text-ink/25">错过内容时，一键找回。</p>
        </div>
      </section>
    </div>
  );
};
