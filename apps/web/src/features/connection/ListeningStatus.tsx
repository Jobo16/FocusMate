import { memo } from "react";
import type { ConnectionState } from "../../stores/connectionStore";
import { PulseIndicator } from "../../components/PulseIndicator";
import { ElapsedTimer } from "./ElapsedTimer";

type ListeningStatusProps = {
  connectionState: ConnectionState;
  statusMessage: string;
  startedAt: number | null;
};

const indicator: Record<ConnectionState, "active" | "warning" | "error" | "idle"> = {
  idle: "idle",
  connecting: "warning",
  listening: "active",
  stopped: "idle",
  error: "error",
};

export const ListeningStatus = memo(({ connectionState, statusMessage, startedAt }: ListeningStatusProps) => (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mist px-5 py-4">
    <div className="flex items-center gap-2.5"><PulseIndicator status={indicator[connectionState]} size="sm" label={statusMessage} /><span className="text-[13px] font-semibold text-forest">{statusMessage}</span></div>
    <ElapsedTimer startedAt={startedAt} />
  </div>
));
