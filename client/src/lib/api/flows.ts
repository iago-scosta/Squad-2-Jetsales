import { api } from "./client";
import type { Flow, FlowEdge, FlowNode, FlowNodeType, FlowWithGraph } from "@/types/domain";

export interface CreateFlowNodeInput {
  flowId: string;
  type: FlowNodeType;
  data: FlowNode["data"];
  positionX: number;
  positionY: number;
}

export interface CreateFlowEdgeInput {
  flowId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string | null;
  conditionType?: string;
  conditionValue?: string;
}

export const flowsApi = {
  get: (id: string) => api.get<FlowWithGraph>(`/flows/${id}`),
  update: (id: string, input: Partial<Pick<Flow, "name" | "status">>) => api.patch<Flow>(`/flows/${id}`, input),
  publish: (id: string) => api.post<Flow>(`/flows/${id}/publish`),
  bulkUpdate: (id: string, payload: { nodes: FlowNode[]; edges: FlowEdge[] }) =>
    api.post<{ ok: true }>(`/flows/${id}/bulk-update`, payload),
  createNode: (input: CreateFlowNodeInput) => api.post<FlowNode>("/flow-nodes", input),
  updateNode: (id: string, input: Partial<FlowNode>) => api.patch<FlowNode>(`/flow-nodes/${id}`, input),
  deleteNode: (id: string) => api.delete<void>(`/flow-nodes/${id}`),
  createEdge: (input: CreateFlowEdgeInput) => api.post<FlowEdge>("/flow-edges", input),
  deleteEdge: (id: string) => api.delete<void>(`/flow-edges/${id}`),
};
