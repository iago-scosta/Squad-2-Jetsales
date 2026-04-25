import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Plus, Sparkles, AlertCircle } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatbotCard } from "@/components/chatbot/ChatbotCard";
import { CreateAIChatbotDialog } from "@/components/chatbot/CreateAIChatbotDialog";
import { CreateManualChatbotDialog } from "@/components/chatbot/CreateManualChatbotDialog";
import { chatbotsApi } from "@/lib/api/chatbots";

export default function ChatbotsPage() {
  const [aiOpen, setAiOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["chatbots"],
    queryFn: () => chatbotsApi.list(),
    staleTime: 30_000,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Chatbots"
        subtitle="Crie, edite e publique seus chatbots WhatsApp"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setAiOpen(true)}
              className="border-ai/40 text-ai hover:bg-ai-soft hover:text-ai"
            >
              <Sparkles className="h-4 w-4" />
              Criar com IA
            </Button>
            <Button onClick={() => setManualOpen(true)}>
              <Plus className="h-4 w-4" />
              Criar Manualmente
            </Button>
          </>
        }
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <div className="mt-4 grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card className="p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">Não foi possível carregar os chatbots</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifique sua conexão com o backend e tente novamente.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </Card>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum chatbot ainda</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie seu primeiro chatbot manualmente ou peça para a IA construir.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAiOpen(true)}
              className="border-ai/40 text-ai hover:bg-ai-soft hover:text-ai"
            >
              <Sparkles className="h-4 w-4" />
              Criar com IA
            </Button>
            <Button onClick={() => setManualOpen(true)}>
              <Plus className="h-4 w-4" />
              Criar Manualmente
            </Button>
          </div>
        </Card>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((bot) => (
            <ChatbotCard key={bot.id} chatbot={bot} />
          ))}
        </div>
      )}

      <CreateAIChatbotDialog open={aiOpen} onOpenChange={setAiOpen} />
      <CreateManualChatbotDialog open={manualOpen} onOpenChange={setManualOpen} />
    </PageContainer>
  );
}
