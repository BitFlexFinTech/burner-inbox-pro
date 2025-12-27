import { useState, useEffect, useMemo } from 'react';

interface CountdownResult {
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
  isUrgent: boolean;
  isCritical: boolean;
  formatted: string;
}

export function useCountdown(expiresAt: string): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const expiry = new Date(expiresAt).getTime();
    const total = Math.max(0, expiry - now);
    const totalSeconds = Math.floor(total / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const isExpired = total <= 0;
    const isUrgent = minutes < 10 && !isExpired;
    const isCritical = minutes < 5 && !isExpired;

    const formatted = isExpired 
      ? 'Expired' 
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
      minutes,
      seconds,
      total,
      isExpired,
      isUrgent,
      isCritical,
      formatted,
    };
  }, [expiresAt, now]);
}
