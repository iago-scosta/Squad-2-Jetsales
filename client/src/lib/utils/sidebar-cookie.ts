const COOKIE_NAME = "jetgo_sidebar_collapsed";

export function readSidebarCollapsed(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match?.[1] === "1";
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_NAME}=${collapsed ? "1" : "0"}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}
