import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { JetSalesLogo } from "./JetSalesLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { readSidebarCollapsed, writeSidebarCollapsed } from "@/lib/utils/sidebar-cookie";
import { useForceLogoutBridge } from "@/lib/hooks/useSession";

export function AppShell() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState<boolean>(() => readSidebarCollapsed());
  const [mobileOpen, setMobileOpen] = useState(false);

  useForceLogoutBridge();

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      writeSidebarCollapsed(next);
      return next;
    });
  };

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0">
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <JetSalesLogo />
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
