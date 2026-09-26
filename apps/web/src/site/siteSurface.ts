const isLocalPreview = () => {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

export const isWorkspaceSurface = () =>
  window.location.hostname.startsWith("space.") ||
  (isLocalPreview() && (window.location.pathname === "/space" || window.location.pathname.startsWith("/space/")));

export const getWorkspaceHref = () => {
  const configured = import.meta.env.VITE_WORKSPACE_URL;
  if (configured) return configured;
  if (isLocalPreview()) return "/space";

  const domain = window.location.hostname.replace(/^www\./, "");
  const port = window.location.port ? ":" + window.location.port : "";
  return window.location.protocol + "//space." + domain + port;
};

export const getMarketingHref = () => {
  const configured = import.meta.env.VITE_MARKETING_URL;
  if (configured) return configured;
  if (isLocalPreview()) return "/";

  const host = window.location.hostname;
  if (!host.startsWith("space.")) return "/";
  const port = window.location.port ? ":" + window.location.port : "";
  return window.location.protocol + "//" + host.slice(6) + port;
};
