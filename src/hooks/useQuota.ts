import { useMemo, useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlanConfig {
  maxEmailsPerDay: number;
  lifespanMinutes: number;
  inboxHistory: boolean;
  adsEnabled: boolean;
  forwarding: boolean;
  apiAccess: boolean;
  smsEnabled: boolean;
}

const planConfigs: Record<string, PlanConfig> = {
  free: {
    maxEmailsPerDay: 1,
    lifespanMinutes: 5,
    inboxHistory: false,
    adsEnabled: true,
    forwarding: false,
    apiAccess: false,
    smsEnabled: false,
  },
  premium: {
    maxEmailsPerDay: 999999,
    lifespanMinutes: 1440,
    inboxHistory: true,
    adsEnabled: false,
    forwarding: true,
    apiAccess: true,
    smsEnabled: true,
  },
  enterprise: {
    maxEmailsPerDay: 999999,
    lifespanMinutes: 43200,
    inboxHistory: true,
    adsEnabled: false,
    forwarding: true,
    apiAccess: true,
    smsEnabled: true,
  },
};

interface QuotaInfo {
  canCreateInbox: boolean;
  remainingInboxes: number;
  emailsCreatedToday: number;
  maxEmailsPerDay: number;
  planConfig: PlanConfig | undefined;
  incrementQuota: () => Promise<void>;
  resetQuota: () => Promise<void>;
  isUnlimited: boolean;
}

export function useQuota(): QuotaInfo {
  const { user } = useAuth();
  const [emailsCreatedToday, setEmailsCreatedToday] = useState(0);

  const planConfig = useMemo(() => {
    return planConfigs[user?.plan || 'free'];
  }, [user?.plan]);

  const maxEmailsPerDay = planConfig?.maxEmailsPerDay || 1;
  const isUnlimited = maxEmailsPerDay >= 999999;

  useEffect(() => {
    if (user?.id) {
      fetchQuota();
    }
  }, [user?.id]);

  const fetchQuota = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('user_quotas')
      .select('emails_created_today, last_reset_at')
      .eq('user_id', user.id)
      .single();

    if (data) {
      // Check if we need to reset (new day)
      const lastReset = new Date(data.last_reset_at);
      const now = new Date();
      if (lastReset.toDateString() !== now.toDateString()) {
        // Reset quota for new day
        await supabase
          .from('user_quotas')
          .update({ emails_created_today: 0, last_reset_at: now.toISOString() })
          .eq('user_id', user.id);
        setEmailsCreatedToday(0);
      } else {
        setEmailsCreatedToday(data.emails_created_today);
      }
    }
  };

  const canCreateInbox = useMemo(() => {
    if (isUnlimited) return true;
    return emailsCreatedToday < maxEmailsPerDay;
  }, [emailsCreatedToday, maxEmailsPerDay, isUnlimited]);

  const remainingInboxes = useMemo(() => {
    if (isUnlimited) return Infinity;
    return Math.max(0, maxEmailsPerDay - emailsCreatedToday);
  }, [maxEmailsPerDay, emailsCreatedToday, isUnlimited]);

  const incrementQuota = useCallback(async () => {
    if (!user?.id) return;

    const newCount = emailsCreatedToday + 1;
    await supabase
      .from('user_quotas')
      .update({ emails_created_today: newCount })
      .eq('user_id', user.id);
    
    setEmailsCreatedToday(newCount);
  }, [user?.id, emailsCreatedToday]);

  const resetQuota = useCallback(async () => {
    if (!user?.id) return;

    await supabase
      .from('user_quotas')
      .update({ emails_created_today: 0, last_reset_at: new Date().toISOString() })
      .eq('user_id', user.id);
    
    setEmailsCreatedToday(0);
  }, [user?.id]);

  return {
    canCreateInbox,
    remainingInboxes,
    emailsCreatedToday,
    maxEmailsPerDay,
    planConfig,
    incrementQuota,
    resetQuota,
    isUnlimited,
  };
}
