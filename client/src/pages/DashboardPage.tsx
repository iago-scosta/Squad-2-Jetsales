import { useQuery } from "@tanstack/react-query";
import { Bot, MessageSquare, Smartphone, Ticket } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { dashboardApi } from "@/lib/api/dashboard";

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardApi.summary(),
    staleTime: 30_000,
  });

  const messages = useQuery({
    queryKey: ["dashboard", "messages-volume", 7],
    queryFn: () => dashboardApi.messagesVolume(7),
    staleTime: 30_000,
  });

  const tickets = useQuery({
    queryKey: ["dashboard", "tickets-volume", 7],
    queryFn: () => dashboardApi.ticketsVolume(7),
    staleTime: 30_000,
  });

  const activity = useQuery({
    queryKey: ["dashboard", "recent-activity", 10],
    queryFn: () => dashboardApi.recentActivity(10),
    staleTime: 30_000,
  });

  const s = summary.data;

  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle="Visão geral do sistema de atendimento" />

      <section aria-label="Métricas" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Tickets Abertos"
          value={s?.openTickets ?? "—"}
          delta={s?.deltaTickets}
          icon={Ticket}
          tone="primary"
          loading={summary.isLoading}
        />
        <MetricCard
          label="Conexões Ativas"
          value={s?.activeConnections ?? "—"}
          delta={s?.deltaConnections}
          icon={Smartphone}
          tone="success"
          loading={summary.isLoading}
        />
        <MetricCard
          label="Mensagens Hoje"
          value={s?.messagesToday ?? "—"}
          delta={s?.deltaMessages}
          icon={MessageSquare}
          tone="ai"
          loading={summary.isLoading}
        />
        <MetricCard
          label="Chatbots Ativos"
          value={s ? `${s.activeChatbotsPct}%` : "—"}
          delta={s?.deltaChatbotsPct}
          deltaLabel="%"
          icon={Bot}
          tone="warning"
          loading={summary.isLoading}
        />
      </section>

      <section aria-label="Volumes" className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Volume de Mensagens"
          subtitle="Últimos 7 dias"
          variant="line"
          colorVar="var(--primary)"
          data={messages.data}
          isLoading={messages.isLoading}
          isError={messages.isError}
          onRetry={() => messages.refetch()}
        />
        <ChartCard
          title="Tickets Abertos"
          subtitle="Últimos 7 dias"
          variant="bar"
          colorVar="var(--success)"
          data={tickets.data}
          isLoading={tickets.isLoading}
          isError={tickets.isError}
          onRetry={() => tickets.refetch()}
        />
      </section>

      <section aria-label="Atividade recente" className="mt-6">
        <RecentActivityList
          data={activity.data}
          isLoading={activity.isLoading}
          isError={activity.isError}
          onRetry={() => activity.refetch()}
        />
      </section>
    </PageContainer>
  );
}
