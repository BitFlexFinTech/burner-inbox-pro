import { useMemo, useCallback } from 'react';
import { db } from '@/lib/mockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import type { PlanConfig } from '@/types/database';

interface QuotaInfo {
  canCreateInbox: boolean;
  remainingInboxes: number;
  emailsCreatedToday: number;
  maxEmailsPerDay: number;
  planConfig: PlanConfig | undefined;
  incrementQuota: () => void;
  resetQuota: () => void;
  isUnlimited: boolean;
}

export function useQuota(): QuotaInfo {
  const { user } = useAuth();

  const planConfig = useMemo(() => {
    return db.getPlanConfig(user?.plan || 'free');
  }, [user?.plan]);

  const quota = useMemo(() => {
    if (!user?.id) return null;
    return db.getUserQuota(user.id);
  }, [user?.id]);

  const emailsCreatedToday = quota?.emailsCreatedToday || 0;
  const maxEmailsPerDay = planConfig?.maxEmailsPerDay || 1;
  const isUnlimited = maxEmailsPerDay >= 999999;

  const canCreateInbox = useMemo(() => {
    if (isUnlimited) return true;
    return emailsCreatedToday < maxEmailsPerDay;
  }, [emailsCreatedToday, maxEmailsPerDay, isUnlimited]);

  const remainingInboxes = useMemo(() => {
    if (isUnlimited) return Infinity;
    return Math.max(0, maxEmailsPerDay - emailsCreatedToday);
  }, [maxEmailsPerDay, emailsCreatedToday, isUnlimited]);

  const incrementQuota = useCallback(() => {
    if (user?.id) {
      db.incrementUserQuota(user.id);
    }
  }, [user?.id]);

  const resetQuota = useCallback(() => {
    db.resetDailyQuotas();
  }, []);

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
