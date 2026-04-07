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
  /**
   * Asks the server to atomically consume one freeze. Returns the new count, or -1
   * if not allowed. Optimistically updates local state and rolls back on failure.
   */
  consumeFreeze: () => number;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [freezesLeft, setFreezesLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const freezesLeftRef = useRef(0);
  freezesLeftRef.current = freezesLeft;
  const isPremiumRef = useRef(false);
  isPremiumRef.current = isPremium;

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
      // Server-side RPC: reads tier and auto-refills the weekly freeze pool.
      // The client cannot directly update is_premium / freeze_count anymore —
      // a Postgres trigger blocks any client UPDATE to those columns.
      const { data, error } = await supabase.rpc('get_freeze_status');
      if (cancelled) return;

      if (error || !data || !Array.isArray(data) || data.length === 0) {
        setIsPremium(false);
        setFreezesLeft(0);
        setLoading(false);
        return;
      }

      const row = data[0] as { is_premium: boolean; freeze_count: number };
      setIsPremium(Boolean(row.is_premium));
      setFreezesLeft(row.is_premium ? Number(row.freeze_count ?? 0) : 0);
      setLoading(false);
    }

    loadTier();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const consumeFreeze = useCallback((): number => {
    if (!isPremiumRef.current) return -1;
    const current = freezesLeftRef.current;
    if (current <= 0) return -1;
    // Optimistic update — server is the source of truth and will reconcile.
    const optimisticNext = current - 1;
    freezesLeftRef.current = optimisticNext;
    setFreezesLeft(optimisticNext);
    if (supabase && user) {
      supabase.rpc('consume_freeze').then(({ data, error }) => {
        if (error || typeof data !== 'number' || data < 0) {
          // Rollback on failure.
          freezesLeftRef.current = current;
          setFreezesLeft(current);
          return;
        }
        // Reconcile with the authoritative server value.
        freezesLeftRef.current = data;
        setFreezesLeft(data);
      });
    }
    return optimisticNext;
  }, [user]);

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
