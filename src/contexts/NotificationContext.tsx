import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db } from '@/lib/mockDatabase';
import { useAuth } from './AuthContext';
import type { SiteNotification, TargetAudience } from '@/types/database';

interface NotificationContextType {
  notifications: SiteNotification[];
  dismissNotification: (id: string) => void;
  dismissedIds: string[];
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const DISMISSED_KEY = 'burnermail_dismissed_notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const userPlan = user?.plan || 'free';

  const matchesAudience = useCallback((target: TargetAudience, plan: string): boolean => {
    if (target === 'all') return true;
    if (target === 'free' && plan === 'free') return true;
    if (target === 'premium' && (plan === 'premium' || plan === 'enterprise')) return true;
    if (target === 'enterprise' && plan === 'enterprise') return true;
    return false;
  }, []);

  const refreshNotifications = useCallback(() => {
    const activeNotifications = db.getSiteNotifications(true);
    const filtered = activeNotifications.filter(n => 
      matchesAudience(n.targetAudience, userPlan) && 
      !dismissedIds.includes(n.id)
    );
    setNotifications(filtered);
  }, [userPlan, dismissedIds, matchesAudience]);

  // Poll for new notifications every 3 seconds
  useEffect(() => {
    refreshNotifications();
    
    const interval = setInterval(refreshNotifications, 3000);
    
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      return next;
    });
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      dismissNotification,
      dismissedIds,
      refreshNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
