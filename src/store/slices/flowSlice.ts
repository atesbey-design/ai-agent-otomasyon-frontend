import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlowState, AgentNode, FlowConnection } from '../types';

const initialState: FlowState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isRunning: false,
  executionResults: {},
};

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    // Node işlemleri
    addNode: (state, action: PayloadAction<AgentNode>) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action: PayloadAction<{ id: string; updates: Partial<AgentNode> }>) => {
      const node = state.nodes.find(n => n.id === action.payload.id);
      if (node) {
        Object.assign(node, action.payload.updates);
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter(node => node.id !== action.payload);
      state.edges = state.edges.filter(
        edge => edge.source !== action.payload && edge.target !== action.payload
      );
    },
    updateNodePosition: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const node = state.nodes.find(n => n.id === action.payload.id);
      if (node) {
        node.position = action.payload.position;
      }
    },

    // Bağlantı işlemleri
    addEdge: (state, action: PayloadAction<FlowConnection>) => {
      state.edges.push(action.payload);
    },
    updateEdge: (state, action: PayloadAction<{ id: string; updates: Partial<FlowConnection> }>) => {
      const edge = state.edges.find(e => e.id === action.payload.id);
      if (edge) {
        Object.assign(edge, action.payload.updates);
      }
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter(edge => edge.id !== action.payload);
    },

    // Node seçimi
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    // Çalışma durumu
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },

    // Çalışma sonuçları
    updateExecutionResult: (state, action: PayloadAction<{
      nodeId: string;
      status: 'idle' | 'running' | 'completed' | 'error';
      output?: any;
      error?: string;
      executionTime?: number;
      tokenUsage?: {
        prompt: number;
        completion: number;
        total: number;
      };
    }>) => {
      state.executionResults[action.payload.nodeId] = {
        status: action.payload.status,
        output: action.payload.output,
        error: action.payload.error,
        executionTime: action.payload.executionTime,
        tokenUsage: action.payload.tokenUsage,
      };
    },

    // Tüm durumu sıfırlama
    resetFlow: (state) => {
      Object.assign(state, initialState);
    },

    // Akışı içe aktarma
    importFlow: (state, action: PayloadAction<FlowState>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  addNode,
  updateNode,
  removeNode,
  updateNodePosition,
  addEdge,
  updateEdge,
  removeEdge,
  selectNode,
  setIsRunning,
  updateExecutionResult,
  resetFlow,
  importFlow,
} = flowSlice.actions;

export default flowSlice.reducer; 