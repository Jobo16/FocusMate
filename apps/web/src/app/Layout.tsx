import { ArrowUpRight, AudioLines, MessageCircle, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "../components/Brand";
import { getMarketingHref } from "../site/siteSurface";
import { useRouterStore, type Page } from "../stores/routerStore";

type LayoutProps = {
  children: ReactNode;
};

const NAV_ITEMS: Array<{ page: Page; label: string; icon: typeof AudioLines }> = [
  { page: "record", label: "录音", icon: AudioLines },
  { page: "chat", label: "AI 聊天", icon: MessageCircle },
  { page: "settings", label: "设置", icon: Settings2 },
];

export const Layout = ({ children }: LayoutProps) => {
  const { page, navigate } = useRouterStore();
  const marketingHref = getMarketingHref();
  const pageTitle = NAV_ITEMS.find((item) => item.page === page)?.label ?? "录音";

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Brand href={marketingHref} />
        <p className="workspace-sidebar-label">YOUR SPACE / WEB</p>
        <nav className="workspace-sidebar-nav" aria-label="工作台导航">
          {NAV_ITEMS.map(({ page: itemPage, label, icon: Icon }) => (
            <button
              key={itemPage}
              type="button"
              className={"workspace-nav-item " + (page === itemPage ? "workspace-nav-active" : "")}
              aria-current={page === itemPage ? "page" : undefined}
              onClick={() => navigate(itemPage)}
            >
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="workspace-sidebar-note">
          <span className="eyebrow">WEB PREVIEW</span>
          <p>录音提供临时转写预览。历史检索与 Agent 聊天仍在开发中。</p>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-mobile-brand"><Brand href={marketingHref} /></div>
          <div className="workspace-breadcrumb"><span>SPACE</span><span>/</span><strong>{pageTitle}</strong></div>
          <a className="workspace-back-link" href={marketingHref}>
            产品首页 <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </header>
        <main className="workspace-content">{children}</main>
      </div>

      <nav className="workspace-mobile-nav" aria-label="移动工作台导航">
        {NAV_ITEMS.map(({ page: itemPage, label, icon: Icon }) => (
          <button
            key={itemPage}
            type="button"
            className={page === itemPage ? "workspace-mobile-active" : ""}
            aria-current={page === itemPage ? "page" : undefined}
            onClick={() => navigate(itemPage)}
          >
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
