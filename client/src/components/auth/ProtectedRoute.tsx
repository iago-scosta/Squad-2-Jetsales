import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isLoading, isError } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando sessão" />
      </div>
    );
  }

  if (isError || !session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
