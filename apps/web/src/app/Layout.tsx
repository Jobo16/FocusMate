import { Clock, History, Home, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useRouterStore, type Page } from "../stores/routerStore";

type LayoutProps = {
  children: ReactNode;
};

const NAV_ITEMS: Array<{ page: Page; label: string; icon: typeof Home }> = [
  { page: "home", label: "听讲", icon: Home },
  { page: "history", label: "历史", icon: History },
  { page: "settings", label: "设置", icon: Settings },
];

export const Layout = ({ children }: LayoutProps) => {
  const { page, navigate } = useRouterStore();

  return (
    <div className="mx-auto flex h-dvh w-full max-w-xl flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-moss/60">
          FocusMate
        </div>
        {page === "home" && <StatusDot />}
      </header>

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 flex-col px-5">{children}</div>

      {/* Bottom navigation */}
      <nav className="flex items-center justify-around border-t border-black/5 bg-paper/90 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
        {NAV_ITEMS.map((item) => {
          const active = page === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => navigate(item.page)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-5 py-1.5 transition active:scale-95 ${
                active ? "text-moss" : "text-ink/30"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span
                className={`text-[10px] font-semibold ${active ? "text-moss" : "text-ink/30"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Minimal status dot shown in header when on home page
const StatusDot = () => {
  // We'll import connection state here lazily
  // For now this is a simple placeholder
  return null;
};
