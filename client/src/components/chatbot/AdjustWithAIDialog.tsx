import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles, Wand2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatbotsApi } from "@/lib/api/chatbots";
import { ApiError } from "@/lib/api/client";
import type { FlowEdge, FlowNode, FlowNodeType } from "@/types/domain";

const schema = z.object({
  instruction: z.string().min(10, "Descreva o ajuste em pelo menos 10 caracteres").max(2000),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbotId: string;
  currentNodes: { domainType: FlowNodeType }[];
  onApply: (result: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}

const NODE_LABELS: Record<FlowNodeType, { label: string; cls: string }> = {
  message: { label: "Enviar Mensagem", cls: "bg-node-message/10 text-node-message" },
  menu: { label: "Menu de Opções", cls: "bg-node-menu/10 text-node-menu" },
  condition: { label: "Condição", cls: "bg-node-condition/10 text-node-condition" },
  wait: { label: "Aguardar", cls: "bg-node-wait/10 text-node-wait" },
  trigger: { label: "Início", cls: "bg-node-trigger/10 text-node-trigger" },
  end: { label: "Fim", cls: "bg-muted text-muted-foreground" },
  capture: { label: "Capturar", cls: "bg-secondary text-foreground" },
  integration: { label: "Integração", cls: "bg-secondary text-foreground" },
};

const EXAMPLES = [
  "Adicione uma etapa de captura de email após o menu principal",
  "Inclua uma opção de 'Falar com atendente' em todos os menus",
  "Adicione uma mensagem de despedida ao final do fluxo",
];

export function AdjustWithAIDialog({ open, onOpenChange, chatbotId, currentNodes, onApply }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { instruction: "" },
  });

  const counts = useMemo(() => {
    const acc = new Map<FlowNodeType, number>();
    for (const n of currentNodes) {
      acc.set(n.domainType, (acc.get(n.domainType) ?? 0) + 1);
    }
    return Array.from(acc.entries()).filter(([t]) => t !== "trigger");
  }, [currentNodes]);

  const adjust = useMutation({
    mutationFn: (input: FormValues) => chatbotsApi.aiAdjust(chatbotId, input.instruction),
    onSuccess: (res) => {
      onApply({ nodes: res.nodes, edges: res.edges });
      toast.success("Ajustes aplicados ao fluxo");
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Falha ao ajustar com IA"),
  });

  const submit = form.handleSubmit((v) => adjust.mutate(v));
  const value = form.watch("instruction");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ai-soft">
              <Wand2 className="h-4 w-4 text-ai" />
            </div>
            <div>
              <DialogTitle>Ajustar Chatbot com IA</DialogTitle>
              <DialogDescription>Descreva o que deseja mudar no fluxo atual</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Current flow summary */}
          <div className="rounded-md border border-border bg-secondary p-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Fluxo Atual</p>
            <div className="flex flex-wrap gap-1.5">
              {counts.length === 0 && (
                <span className="text-xs text-muted-foreground">Apenas o nó de Início</span>
              )}
              {counts.map(([type, count]) => {
                const meta = NODE_LABELS[type];
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}
                  >
                    {count} {meta.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="adj-instr">O que você quer ajustar?</Label>
              <span className="text-[11px] text-muted-foreground">{value.length}/2000</span>
            </div>
            <Textarea
              id="adj-instr"
              rows={5}
              placeholder="Ex: Adicione uma opção 'Falar com atendente' no menu principal e capture o email do cliente antes de finalizar."
              {...form.register("instruction")}
            />
            {form.formState.errors.instruction && (
              <p className="text-xs text-danger">{form.formState.errors.instruction.message}</p>
            )}
          </div>

          {/* Examples */}
          <div className="rounded-md border border-border bg-card p-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Exemplos de Ajustes</p>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => form.setValue("instruction", ex, { shouldValidate: true })}
                  className="block w-full rounded-md border border-border bg-secondary px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:bg-ai-soft hover:text-ai transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-md border border-ai/20 bg-ai-soft/40 p-3">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-ai" />
              <p className="text-xs font-semibold text-ai">Dicas para melhores resultados</p>
            </div>
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground list-disc list-inside">
              <li>Seja específico sobre onde aplicar o ajuste</li>
              <li>Mencione o tipo de bloco quando possível</li>
              <li>Descreva uma mudança por vez para resultados precisos</li>
              <li>Você pode desfazer o ajuste com Ctrl+Z após aplicar</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={adjust.isPending}
              className="bg-ai text-ai-foreground hover:bg-ai/90"
            >
              {adjust.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Aplicar Ajustes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
