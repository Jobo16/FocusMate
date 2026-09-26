import { useEffect } from "react";
import { useRouterStore } from "../stores/routerStore";
import { isWorkspaceSurface } from "../site/siteSurface";
import { Layout } from "./Layout";
import { RecordPage } from "../pages/RecordPage";
import { ChatPage } from "../pages/ChatPage";
import { MarketingPage } from "../pages/MarketingPage";
import { SettingsPage } from "../pages/SettingsPage";

export const App = () => {
  const page = useRouterStore((s) => s.page);
  const workspace = isWorkspaceSurface();

  useEffect(() => {
    document.title = workspace ? "Daymark Space · 工作台" : "Daymark · 找回重要的上下文";
  }, [workspace]);

  if (!workspace) return <MarketingPage />;

  return (
    <Layout>
      {page === "record" && <RecordPage />}
      {page === "chat" && <ChatPage />}
      {page === "settings" && <SettingsPage />}
    </Layout>
  );
};
