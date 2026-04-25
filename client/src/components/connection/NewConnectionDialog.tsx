import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectionsApi } from "@/lib/api/connections";
import { ApiError } from "@/lib/api/client";
import type { WhatsAppConnection } from "@/types/domain";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(60),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConnectionDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [created, setCreated] = useState<WhatsAppConnection | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const create = useMutation({
    mutationFn: (input: FormValues) => connectionsApi.create({ name: input.name }),
    onSuccess: (conn) => {
      setCreated(conn);
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Falha ao criar conexão"),
  });

  // Poll until connected
  const poll = useQuery({
    queryKey: ["connection-poll", created?.id],
    queryFn: () => connectionsApi.get(created!.id),
    enabled: !!created && open,
    refetchInterval: (q) => {
      const data = q.state.data as WhatsAppConnection | undefined;
      return data?.status === "connected" ? false : 3000;
    },
  });

  useEffect(() => {
    if (poll.data?.status === "connected") {
      toast.success("WhatsApp conectado!");
      qc.invalidateQueries({ queryKey: ["connections"] });
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.data?.status]);

  const handleClose = () => {
    setCreated(null);
    form.reset();
    onOpenChange(false);
  };

  const submit = form.handleSubmit((v) => create.mutate(v));
  const conn = poll.data ?? created;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : onOpenChange(o))}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
          <DialogDescription>
            Dê um nome para a conexão e escaneie o QR Code com seu WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conn-name">Nome da Conexão</Label>
            <Input
              id="conn-name"
              placeholder="Ex: Atendimento Principal"
              disabled={!!created}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
            )}
          </div>

          {conn && (
            <div className="rounded-md border border-border bg-secondary p-4">
              <h3 className="text-sm font-semibold text-foreground">Escaneie o QR Code</h3>
              <div className="mt-3 flex items-center justify-center rounded-md bg-card p-4">
                {conn.qrCode ? (
                  <img src={conn.qrCode} alt="QR Code" width={200} height={200} className="h-[200px] w-[200px]" />
                ) : (
                  <div className="flex h-[200px] w-[200px] items-center justify-center text-xs text-muted-foreground">
                    Gerando QR...
                  </div>
                )}
              </div>
              <ol className="mt-4 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em Mais opções (⋮) ou Configurações</li>
                <li>Toque em Aparelhos conectados</li>
                <li>Toque em Conectar um aparelho</li>
                <li>Aponte para esta tela para escanear</li>
              </ol>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              {conn ? "Fechar" : "Cancelar"}
            </Button>
            {!created && (
              <Button type="submit" disabled={create.isPending}>
                {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Adicionar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
