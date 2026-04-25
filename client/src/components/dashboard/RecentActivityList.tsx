import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Inbox } from "lucide-react";
import type { RecentActivityItem, ConversationStatus } from "@/types/domain";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RecentActivityListProps {
  data: RecentActivityItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  open: "Aberto",
  closed: "Encerrado",
  waiting: "Aguardando",
  resolved: "Resolvido",
};

const STATUS_CLASSES: Record<ConversationStatus, string> = {
  open: "bg-primary-soft text-primary border-transparent",
  closed: "bg-secondary text-muted-foreground border-transparent",
  waiting: "bg-warning-soft text-warning border-transparent",
  resolved: "bg-success-soft text-success border-transparent",
};

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });
  } catch {
    return iso;
  }
}

export function RecentActivityList({ data, isLoading, isError, onRetry }: RecentActivityListProps) {
  return (
    <Card className="p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Atividade Recente</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Últimas conversas processadas</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Não foi possível carregar a atividade.</p>
          <Button variant="outline" size="sm" onClick={onRetry}>Tentar novamente</Button>
        </div>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="divide-y divide-border">
          {data.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{item.contactPhone}</span>
                  <Badge variant="outline" className={cn("text-[11px] font-medium px-2 py-0", STATUS_CLASSES[item.status])}>
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.preview}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 mt-1">{relativeTime(item.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
