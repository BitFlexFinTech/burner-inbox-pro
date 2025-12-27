import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'demo' | 'live';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isDemo: boolean;
  isLive: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = 'burnermail_app_mode';

interface AppModeProviderProps {
  children: ReactNode;
}

export function AppModeProvider({ children }: AppModeProviderProps) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === 'live' || stored === 'demo') ? stored : 'demo';
  });

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
  };

  const value: AppModeContextType = {
    mode,
    setMode,
    isDemo: mode === 'demo',
    isLive: mode === 'live',
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
