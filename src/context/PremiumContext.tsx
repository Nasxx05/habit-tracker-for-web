import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export const FREE_HABIT_LIMIT = 3;

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  habitLimit: number | null; // null = unlimited
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTier() {
      if (!supabase || !user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('user_data')
        .select('is_premium')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setIsPremium(Boolean(data?.is_premium));
      setLoading(false);
    }

    loadTier();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <PremiumContext.Provider
      value={{ isPremium, loading, habitLimit: isPremium ? null : FREE_HABIT_LIMIT }}
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
