import { api } from "./client";
import type { WhatsAppConnection } from "@/types/domain";

export interface CreateConnectionInput {
  name: string;
  chatbotId?: string;
}

export const connectionsApi = {
  list: () => api.get<WhatsAppConnection[]>("/whatsapp-connections"),
  get: (id: string) => api.get<WhatsAppConnection>(`/whatsapp-connections/${id}`),
  create: (input: CreateConnectionInput) =>
    api.post<WhatsAppConnection>("/whatsapp-connections", input),
  refreshQr: (id: string) =>
    api.post<WhatsAppConnection>(`/whatsapp-connections/${id}/refresh-qr`),
  remove: (id: string) => api.delete<void>(`/whatsapp-connections/${id}`),
};
