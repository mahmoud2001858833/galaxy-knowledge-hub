import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Admin-only gate for internal tools (العقل المركزي, العقل الموسوعي, ...): checks is_platform_admin
 * on the current session and re-checks on every auth change. `loading` stays true until the first
 * check resolves, so callers can tell "still checking" from "confirmed not admin". */
export function useIsPlatformAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const check = async (uid?: string) => {
      if (!uid) { if (alive) { setIsAdmin(false); setLoading(false); } return; }
      const { data, error } = await supabase.rpc('is_platform_admin', { _user_id: uid });
      if (alive) { setIsAdmin(!error && data === true); setLoading(false); }
    };
    supabase.auth.getSession().then(({ data }) => check(data.session?.user?.id));
    // Deferred + not returned: an awaited Supabase call inside this callback deadlocks the auth client
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const uid = s?.user?.id;
      setTimeout(() => { void check(uid); }, 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return { isAdmin, loading };
}
