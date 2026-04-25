import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Plus, RefreshCw, Trash2, AlertCircle, Smartphone, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NewConnectionDialog } from "@/components/connection/NewConnectionDialog";
import { connectionsApi } from "@/lib/api/connections";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { WhatsAppConnection } from "@/types/domain";

export default function ConnectionsPage() {
  const [openNew, setOpenNew] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionsApi.list(),
    staleTime: 30_000,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Conexões WhatsApp"
        subtitle="Gerencie suas conexões do WhatsApp Business"
        actions={
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" />
            Nova Conexão
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="mt-4 h-8 w-full" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card className="p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">Não foi possível carregar as conexões</h3>
          <p className="mt-1 text-sm text-muted-foreground">Verifique a conexão com o backend e tente novamente.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </Card>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
            <Smartphone className="h-7 w-7 text-success" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhuma conexão configurada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione um número WhatsApp para começar a receber atendimentos.
          </p>
          <Button className="mt-5" onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" />
            Nova Conexão
          </Button>
        </Card>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((conn) => (
            <ConnectionCard key={conn.id} connection={conn} />
          ))}
        </div>
      )}

      <NewConnectionDialog open={openNew} onOpenChange={setOpenNew} />
    </PageContainer>
  );
}

function ConnectionCard({ connection }: { connection: WhatsAppConnection }) {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isConnected = connection.status === "connected";
  const isPending = connection.status === "pending_qr";

  const refreshQr = useMutation({
    mutationFn: () => connectionsApi.refreshQr(connection.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Novo QR Code gerado");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Falha ao gerar QR"),
  });

  const remove = useMutation({
    mutationFn: () => connectionsApi.remove(connection.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Conexão removida");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Falha ao remover"),
  });

  const lastActivity = connection.lastActivityAt
    ? formatDistanceToNow(new Date(connection.lastActivityAt), { locale: ptBR, addSuffix: true })
    : "—";

  return (
    <>
      <Card className="relative p-5">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Remover conexão"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-success-soft">
            <Phone className="h-6 w-6 text-success" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{connection.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{connection.phoneNumber}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  isConnected ? "bg-success" : isPending ? "bg-warning" : "bg-danger",
                )}
              />
              <span className="text-xs font-medium text-foreground">
                {isConnected ? "Conectado" : isPending ? "Aguardando QR" : "Desconectado"}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">{lastActivity}</span>
            </div>
          </div>
        </div>

        {connection.metricsToday && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            {connection.metricsToday.conversations} atendimentos hoje
          </div>
        )}

        {!isConnected && (
          <QrBlock connection={connection} onRefresh={() => refreshQr.mutate()} pending={refreshQr.isPending} />
        )}
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover conexão?</AlertDialogTitle>
            <AlertDialogDescription>
              A conexão <strong>{connection.name}</strong> será desconectada. Você pode adicionar novamente depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove.mutate()}
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function QrBlock({
  connection,
  onRefresh,
  pending,
}: {
  connection: WhatsAppConnection;
  onRefresh: () => void;
  pending: boolean;
}) {
  const expires = connection.qrExpiresAt ? new Date(connection.qrExpiresAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = expires ? Math.max(0, Math.floor((expires - now) / 1000)) : 0;
  const total = 60;
  const pct = expires ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mt-4 rounded-md border border-border bg-secondary p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">QR Code</span>
        {expires && <span className="text-xs font-mono text-warning">{`${mm}:${ss}`}</span>}
      </div>
      {expires && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-warning transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="mt-3 flex items-center justify-center rounded-md bg-card p-3">
        {connection.qrCode ? (
          <img
            src={connection.qrCode}
            alt="QR Code de pareamento"
            width={140}
            height={140}
            className="h-[140px] w-[140px]"
          />
        ) : (
          <div className="flex h-[140px] w-[140px] items-center justify-center rounded border border-dashed border-border text-[10px] text-muted-foreground">
            Aguardando QR...
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Abra o WhatsApp no celular e escaneie para reconectar
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full text-primary"
        onClick={onRefresh}
        disabled={pending}
      >
        <RefreshCw className={cn("h-3.5 w-3.5", pending && "animate-spin")} />
        Novo QR Code
      </Button>
    </div>
  );
}
