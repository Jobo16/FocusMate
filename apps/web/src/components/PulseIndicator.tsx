type PulseIndicatorProps = {
  status: "active" | "warning" | "error" | "idle";
  size?: "sm" | "md";
  label?: string;
};

const STATUS_COLORS = {
  active: "bg-emerald-500 ring-emerald-500/15",
  warning: "bg-amber ring-amber/15",
  error: "bg-red-500 ring-red-500/15",
  idle: "bg-gray-400 ring-gray-400/15",
};

const PULSE_CLASSES = {
  active: "animate-pulse-slow",
  warning: "",
  error: "",
  idle: "",
};

export const PulseIndicator = ({ status, size = "md", label }: PulseIndicatorProps) => {
  const sizeClass = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const ringClass = size === "sm" ? "ring-3" : "ring-4";

  return (
    <span
      className={`${sizeClass} rounded-full shadow-sm ${ringClass} ${STATUS_COLORS[status]} ${PULSE_CLASSES[status]}`}
      role="status"
      aria-label={label}
      title={label}
    />
  );
};
