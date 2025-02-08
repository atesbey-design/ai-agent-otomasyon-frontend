import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryEntry, FlowState } from '../types';

const initialState: HistoryEntry[] = [];

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Yeni geçmiş kaydı ekleme
    addHistoryEntry: (state, action: PayloadAction<{
      flowState: FlowState;
      name: string;
      description?: string;
    }>) => {
      state.push({
        id: `history_${Date.now()}`,
        timestamp: Date.now(),
        flowState: action.payload.flowState,
        name: action.payload.name,
        description: action.payload.description,
      });
    },

    // Geçmiş kaydını güncelleme
    updateHistoryEntry: (state, action: PayloadAction<{
      id: string;
      updates: Partial<Omit<HistoryEntry, 'id' | 'timestamp'>>;
    }>) => {
      const entry = state.find(e => e.id === action.payload.id);
      if (entry) {
        Object.assign(entry, action.payload.updates);
      }
    },

    // Geçmiş kaydını silme
    removeHistoryEntry: (state, action: PayloadAction<string>) => {
      return state.filter(entry => entry.id !== action.payload);
    },

    // Belirli bir tarihten önceki kayıtları silme
    clearHistoryBefore: (state, action: PayloadAction<number>) => {
      return state.filter(entry => entry.timestamp >= action.payload);
    },

    // Tüm geçmişi temizleme
    clearHistory: () => {
      return initialState;
    },

    // Geçmişi içe aktarma
    importHistory: (state, action: PayloadAction<HistoryEntry[]>) => {
      return action.payload;
    },
  },
});

export const {
  addHistoryEntry,
  updateHistoryEntry,
  removeHistoryEntry,
  clearHistoryBefore,
  clearHistory,
  importHistory,
} = historySlice.actions;

export default historySlice.reducer; 