import { api } from "./client";
import type { DashboardSummary, RecentActivityItem, VolumePoint } from "@/types/domain";

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
  messagesVolume: (days = 7) => api.get<VolumePoint[]>(`/dashboard/messages-volume?days=${days}`),
  ticketsVolume: (days = 7) => api.get<VolumePoint[]>(`/dashboard/tickets-volume?days=${days}`),
  recentActivity: (limit = 10) => api.get<RecentActivityItem[]>(`/dashboard/recent-activity?limit=${limit}`),
};
