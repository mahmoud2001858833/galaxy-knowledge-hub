// User preferences for Blind Eye: persisted to Supabase + cached in localStorage
// so onboarding and disclaimer work even before the first network round-trip.

import { supabase } from '@/integrations/supabase/client';

export type WalkingSpeed = 'slow' | 'normal' | 'fast';
export type PreferredEar = 'left' | 'right' | 'both';
export type DetailLevel = 'minimal' | 'balanced' | 'detailed';

export type UserPrefs = {
  walking_speed: WalkingSpeed;
  preferred_ear: PreferredEar;
  detail_level: DetailLevel;
  haptics_enabled: boolean;
  disclaimer_accepted: boolean;
  onboarding_completed: boolean;
};

const DEFAULT: UserPrefs = {
  walking_speed: 'normal',
  preferred_ear: 'both',
  detail_level: 'balanced',
  haptics_enabled: true,
  disclaimer_accepted: false,
  onboarding_completed: false,
};

const LS_KEY = 'damij.blindEye.userPrefs.v1';

export function getLocalPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { return DEFAULT; }
}

export function setLocalPrefs(patch: Partial<UserPrefs>) {
  const next = { ...getLocalPrefs(), ...patch };
  try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export async function loadRemotePrefs(): Promise<UserPrefs | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth.user?.id;
  if (!user_id) return null;
  const { data, error } = await supabase
    .from('blind_eye_user_prefs')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();
  if (error || !data) return null;
  const remote: UserPrefs = {
    walking_speed: (data.walking_speed as WalkingSpeed) || 'normal',
    preferred_ear: (data.preferred_ear as PreferredEar) || 'both',
    detail_level: (data.detail_level as DetailLevel) || 'balanced',
    haptics_enabled: !!data.haptics_enabled,
    disclaimer_accepted: !!data.disclaimer_accepted,
    onboarding_completed: !!data.onboarding_completed,
  };
  setLocalPrefs(remote);
  return remote;
}

export async function saveRemotePrefs(patch: Partial<UserPrefs>) {
  const next = setLocalPrefs(patch);
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth.user?.id;
  if (!user_id) return next;
  await supabase.from('blind_eye_user_prefs').upsert(
    { user_id, ...next },
    { onConflict: 'user_id' },
  );
  return next;
}
