import { supabase } from './supabase';
import type { Habit, UserProfile, Reflection, Milestone } from '../types/habit';

export interface SyncData {
  habits: Habit[];
  profile: UserProfile;
  reflections: Reflection[];
  milestones: Milestone[];
}

export async function uploadData(userId: string, data: SyncData): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: userId,
      habits: data.habits,
      profile: data.profile,
      reflections: data.reflections,
      milestones: data.milestones,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Sync upload failed:', error.message);
    return false;
  }
  return true;
}

export async function downloadData(userId: string): Promise<SyncData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_data')
    .select('habits, profile, reflections, milestones')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return {
    habits: data.habits ?? [],
    profile: data.profile ?? {},
    reflections: data.reflections ?? [],
    milestones: data.milestones ?? [],
  } as SyncData;
}
