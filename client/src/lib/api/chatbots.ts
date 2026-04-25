import { api } from "./client";
import type { Chatbot, ChatbotType, Flow, FlowEdge, FlowNode } from "@/types/domain";

export interface ChatbotsFilter {
  status?: "active" | "inactive";
  type?: ChatbotType;
}

export interface CreateChatbotInput {
  name: string;
  description?: string;
  type: ChatbotType;
}

export interface AIGenerateInput {
  name: string;
  description?: string;
  prompt: string;
}

export interface AIGenerateResult {
  chatbot: Chatbot;
  flow: Flow;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface AIAdjustResult {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const qs = new URLSearchParams(entries as [string, string][]).toString();
  return `?${qs}`;
}

export const chatbotsApi = {
  list: (filter: ChatbotsFilter = {}) =>
    api.get<Chatbot[]>(`/chatbots${buildQuery({ status: filter.status, type: filter.type })}`),
  get: (id: string) => api.get<Chatbot>(`/chatbots/${id}`),
  create: (input: CreateChatbotInput) => api.post<Chatbot>("/chatbots", input),
  update: (id: string, input: Partial<Chatbot>) => api.patch<Chatbot>(`/chatbots/${id}`, input),
  remove: (id: string) => api.delete<void>(`/chatbots/${id}`),
  duplicate: (id: string) => api.post<Chatbot>(`/chatbots/${id}/duplicate`),
  activate: (id: string) => api.post<Chatbot>(`/chatbots/${id}/activate`),
  deactivate: (id: string) => api.post<Chatbot>(`/chatbots/${id}/deactivate`),
  aiGenerate: (input: AIGenerateInput) => api.post<AIGenerateResult>("/chatbots/ai-generate", input),
  aiAdjust: (id: string, instruction: string) =>
    api.post<AIAdjustResult>(`/chatbots/${id}/ai-adjust`, { instruction }),
};
