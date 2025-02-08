import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Settings } from '../types';

const initialState: Settings = {
  theme: 'dark',
  language: 'tr',
  autoSave: true,
  saveInterval: 5000, // 5 saniye
  defaultModels: {
    openai: 'gpt-4',
    gemini: 'gemini-pro',
    anthropic: 'claude-3-opus',
    llama2: 'llama-2-70b-chat',
  },
  maxTokenLimits: {
    openai: 4096,
    gemini: 32768,
    anthropic: 100000,
    llama2: 4096,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Tema değiştirme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    // Dil değiştirme
    setLanguage: (state, action: PayloadAction<'tr' | 'en'>) => {
      state.language = action.payload;
    },

    // Otomatik kaydetme ayarları
    setAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSave = action.payload;
    },
    setSaveInterval: (state, action: PayloadAction<number>) => {
      state.saveInterval = action.payload;
    },

    // Varsayılan model ayarları
    setDefaultModel: (state, action: PayloadAction<{ agentType: keyof typeof state.defaultModels; model: string }>) => {
      state.defaultModels[action.payload.agentType] = action.payload.model;
    },

    // Token limitleri
    setMaxTokenLimit: (state, action: PayloadAction<{ agentType: keyof typeof state.maxTokenLimits; limit: number }>) => {
      state.maxTokenLimits[action.payload.agentType] = action.payload.limit;
    },

    // Tüm ayarları sıfırlama
    resetSettings: (state) => {
      Object.assign(state, initialState);
    },

    // Ayarları içe aktarma
    importSettings: (state, action: PayloadAction<Settings>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setAutoSave,
  setSaveInterval,
  setDefaultModel,
  setMaxTokenLimit,
  resetSettings,
  importSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 