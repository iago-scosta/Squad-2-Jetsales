import { create } from "zustand";
import type { Edge, Node } from "@xyflow/react";

export interface CanvasSnapshot {
  nodes: Node[];
  edges: Edge[];
}

interface CanvasState {
  past: CanvasSnapshot[];
  present: CanvasSnapshot;
  future: CanvasSnapshot[];
  selectedNodeId: string | null;
  setPresent: (snap: CanvasSnapshot) => void;
  pushHistory: (snap: CanvasSnapshot) => void;
  undo: () => void;
  redo: () => void;
  selectNode: (id: string | null) => void;
  reset: (snap: CanvasSnapshot) => void;
}

const HISTORY_LIMIT = 50;

export const useCanvasStore = create<CanvasState>((set) => ({
  past: [],
  present: { nodes: [], edges: [] },
  future: [],
  selectedNodeId: null,
  setPresent: (snap) => set({ present: snap }),
  pushHistory: (snap) =>
    set((state) => ({
      past: [...state.past.slice(-HISTORY_LIMIT + 1), state.present],
      present: snap,
      future: [],
    })),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1]!;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0]!;
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }),
  selectNode: (id) => set({ selectedNodeId: id }),
  reset: (snap) => set({ past: [], present: snap, future: [], selectedNodeId: null }),
}));
