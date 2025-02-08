import { configureStore } from '@reduxjs/toolkit';
import flowReducer from './slices/flowSlice';
import settingsReducer from './slices/settingsSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    flow: flowReducer,
    settings: settingsReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 