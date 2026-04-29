import { useRouterStore } from "../stores/routerStore";
import { Layout } from "./Layout";
import { HomePage } from "../pages/HomePage";
import { HistoryPage } from "../pages/HistoryPage";
import { SettingsPage } from "../pages/SettingsPage";

export const App = () => {
  const page = useRouterStore((s) => s.page);

  return (
    <Layout>
      {page === "home" && <HomePage />}
      {page === "history" && <HistoryPage />}
      {page === "settings" && <SettingsPage />}
    </Layout>
  );
};
