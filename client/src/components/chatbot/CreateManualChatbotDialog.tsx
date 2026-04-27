import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
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

interface CreateManualChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateManualChatbotDialog({ open, onOpenChange }: CreateManualChatbotDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const createBot = useMutation({
    mutationFn: () => chatbotsApi.create({ name, description: description || undefined, type: "manual" }),
    onSuccess: (bot) => {
      qc.invalidateQueries({ queryKey: ["chatbots"] });
      toast.success("Chatbot criado");
      onOpenChange(false);
      setName("");
      setDescription("");
      navigate(`/chatbots/${bot.id}`);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível criar o chatbot";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Plus className="h-4 w-4" />
            </span>
            Criar Chatbot Manualmente
          </DialogTitle>
          <DialogDescription>
            Comece com um fluxo em branco e construa seu chatbot do zero no editor visual.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            createBot.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="bot-name">Nome do Chatbot</Label>
            <Input
              id="bot-name"
              placeholder="Ex: Atendimento Vendas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bot-desc">Descrição (opcional)</Label>
            <Textarea
              id="bot-desc"
              placeholder="Para que serve este chatbot?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={createBot.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || createBot.isPending}>
              {createBot.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
