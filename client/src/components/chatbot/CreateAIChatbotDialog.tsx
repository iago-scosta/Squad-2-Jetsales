import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Lightbulb, Wand2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatbotsApi } from "@/lib/api/chatbots";
import { ApiError } from "@/lib/api/client";

interface CreateAIChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXAMPLES = [
  "Atendimento de vendas: receba lead, pergunte interesse, mostre 3 produtos, capture nome e email, transfira para humano se for compra.",
  "Suporte técnico: cumprimente, pergunte qual o problema, mostre menu (login, pagamento, app), envie tutorial e abra ticket se não resolver.",
  "Agendamento: ofereça horários disponíveis, capture nome e telefone, confirme o agendamento e envie lembrete.",
];

const STEPS = [
  "Você descreve o fluxo em linguagem natural",
  "A IA monta os blocos automaticamente no canvas",
  "Você revisa e ajusta visualmente o que quiser",
  "Publica quando estiver satisfeito",
];

export function CreateAIChatbotDialog({ open, onOpenChange }: CreateAIChatbotDialogProps) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const generate = useMutation({
    mutationFn: () => chatbotsApi.aiGenerate({ name, prompt }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["chatbots"] });
      toast.success("Chatbot gerado pela IA");
      onOpenChange(false);
      setName("");
      setPrompt("");
      navigate(`/chatbots/${result.chatbot.id}?generated=1`);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Falha ao gerar chatbot";
      toast.error(msg);
    },
  });

  const charCount = prompt.length;
  const minOk = charCount >= 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ai-soft text-ai">
              <Wand2 className="h-5 w-5" />
            </span>
            Criar Chatbot com IA
          </DialogTitle>
          <DialogDescription>
            Descreva o fluxo do seu chatbot em linguagem natural e a IA constrói para você.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !minOk) return;
            generate.mutate();
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="ai-name">Nome do Chatbot</Label>
            <Input
              id="ai-name"
              placeholder="Ex: Atendimento Vendas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-prompt">Descreva o fluxo do seu chatbot</Label>
              <span className={`text-xs ${minOk ? "text-success" : "text-muted-foreground"}`}>
                {charCount}/20 mín.
              </span>
            </div>
            <Textarea
              id="ai-prompt"
              placeholder="Quando o cliente chega, cumprimente. Pergunte o que ele procura. Mostre opções de produtos. Capture nome e email se quiser comprar..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
          </div>

          <div className="rounded-lg border border-border bg-secondary p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-warning" />
              Exemplos de prompts
            </h4>
            <ul className="space-y-1.5">
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="text-left text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    • {ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-ai/20 bg-ai-soft p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ai">
              <Sparkles className="h-4 w-4" />
              Como funciona?
            </h4>
            <ol className="space-y-1.5 list-decimal list-inside text-xs text-foreground/80">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={generate.isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !minOk || generate.isPending}
              className="bg-ai text-ai-foreground hover:bg-ai/90"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar Chatbot com IA
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
