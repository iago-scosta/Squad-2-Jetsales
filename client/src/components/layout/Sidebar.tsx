import { NavLink } from "react-router-dom";
import { Bot, LayoutDashboard, LogOut, Menu, Smartphone, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JetSalesLogo } from "./JetSalesLogo";
import { cn } from "@/lib/utils";
import { isPreviewMode, useLogout, useSession } from "@/lib/hooks/useSession";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/conexoes", label: "Conexões", icon: Smartphone },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/chatbots", label: "Chatbots", icon: Bot },
] as const;

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Even on failure, force navigation — cache cleared in mutation.
    }
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      {/* Top: logo + toggle */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-sidebar-border">
        <JetSalesLogo collapsed={collapsed} className={collapsed ? "mx-auto" : "ml-1"} />
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Recolher menu" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2">
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Expandir menu" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
              title={collapsed ? item.label : undefined}
              end={item.to === "/dashboard"}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-2">
        {!collapsed && isPreviewMode && (
          <div className="mx-1 mb-2 rounded-md border border-warning/40 bg-warning-soft px-2.5 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-warning">Modo Preview</p>
            <p className="mt-0.5 text-[10px] leading-tight text-foreground/70">
              Backend não configurado. Telas exibem estado de erro/vazio.
            </p>
          </div>
        )}
        {!collapsed && session && (
          <div className="px-3 py-2 mb-1">
            <div className="text-xs font-medium text-foreground truncate">{session.user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
