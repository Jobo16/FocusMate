type PulseIndicatorProps = {
  status: "active" | "warning" | "error" | "idle";
  size?: "sm" | "md";
  label?: string;
};

const STATUS_COLORS = {
  active: "bg-forest",
  warning: "bg-mint",
  error: "bg-ink",
  idle: "bg-ink/25",
};

export const PulseIndicator = ({ status, size = "md", label }: PulseIndicatorProps) => (
  <span
    className={[
      size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
      "rounded-full shadow-sm",
      STATUS_COLORS[status],
      status === "active" ? "motion-safe:animate-pulse-slow" : "",
    ].join(" ")}
    role="status"
    aria-label={label}
    title={label}
  />
);
