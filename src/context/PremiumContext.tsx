import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export const FREE_HABIT_LIMIT = 3;
export const WEEKLY_FREEZE_ALLOWANCE = 2;

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  habitLimit: number | null; // null = unlimited
  freezesLeft: number;
  /** Decrements freezes locally and in Supabase. Returns the new count, or -1 if not allowed. */
  consumeFreeze: () => number;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [freezesLeft, setFreezesLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const freezesLeftRef = useRef(0);
  freezesLeftRef.current = freezesLeft;

  useEffect(() => {
    let cancelled = false;

    async function loadTier() {
      if (!supabase || !user) {
        setIsPremium(false);
        setFreezesLeft(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('user_data')
        .select('is_premium, freeze_count, last_freeze_reset')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;

      const premium = Boolean(data?.is_premium);
      let count = typeof data?.freeze_count === 'number' ? data.freeze_count : WEEKLY_FREEZE_ALLOWANCE;
      const lastReset = data?.last_freeze_reset ? new Date(data.last_freeze_reset + 'T00:00:00') : null;
      const now = new Date();

      // Auto-reset: if last_freeze_reset was null or > 7 days ago, refill to 2.
      const needsReset = !lastReset || daysBetween(lastReset, now) >= 7;
      if (needsReset && premium) {
        count = WEEKLY_FREEZE_ALLOWANCE;
        await supabase
          .from('user_data')
          .update({ freeze_count: WEEKLY_FREEZE_ALLOWANCE, last_freeze_reset: todayISO() })
          .eq('user_id', user.id);
      }

      if (cancelled) return;
      setIsPremium(premium);
      setFreezesLeft(premium ? count : 0);
      setLoading(false);
    }

    loadTier();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const consumeFreeze = useCallback((): number => {
    if (!isPremium) return -1;
    const current = freezesLeftRef.current;
    if (current <= 0) return -1;
    const next = current - 1;
    freezesLeftRef.current = next;
    setFreezesLeft(next);
    if (supabase && user) {
      supabase
        .from('user_data')
        .update({ freeze_count: next })
        .eq('user_id', user.id)
        .then(() => {});
    }
    return next;
  }, [isPremium, user]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        loading,
        habitLimit: isPremium ? null : FREE_HABIT_LIMIT,
        freezesLeft,
        consumeFreeze,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within a PremiumProvider');
  return ctx;
}
