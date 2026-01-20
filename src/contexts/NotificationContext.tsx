import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { SiteNotification, TargetAudience, SiteNotificationRow } from '@/types/database';
import { transformSiteNotification } from '@/types/database';

interface NotificationContextType {
  notifications: SiteNotification[];
  dismissNotification: (id: string) => void;
  dismissedIds: string[];
  refreshNotifications: () => void;
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const DISMISSED_KEY = 'burnermail_dismissed_notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform to camelCase
      const transformed = (data || []).map((row) =>
        transformSiteNotification(row as SiteNotificationRow)
      );

      // Filter by user's plan and dismissed status
      const filtered = transformed.filter(
        (n) => matchesAudience(n.targetAudience, userPlan) && !dismissedIds.includes(n.id)
      );

      setNotifications(filtered);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userPlan, dismissedIds, matchesAudience]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    refreshNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('site_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_notifications',
        },
        () => {
          refreshNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
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
      loading,
      error,
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
