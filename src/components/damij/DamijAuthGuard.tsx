import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Protects the Damij subtree. Requires:
 *  - Authenticated Supabase session
 *  - A row in `damij_users` for the current user (Damij is independent from main platform)
 *
 * Public exceptions: any path matching PUBLIC_PATTERNS.
 */
const PUBLIC_PATTERNS: RegExp[] = [
  /^\/damij\/auth(\/|$)/,
  /^\/damij\/clinical\/public\//,
];

const DamijAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'ok' | 'redirect'>('checking');

  useEffect(() => {
    if (PUBLIC_PATTERNS.some((re) => re.test(location.pathname))) {
      setStatus('ok');
      return;
    }
    let active = true;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) {
          setStatus('redirect');
          navigate(`/damij/auth?returnUrl=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
        }
        return;
      }
      const { data: prof } = await supabase
        .from('damij_users')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!active) return;
      if (!prof) {
        setStatus('redirect');
        navigate(`/damij/auth?returnUrl=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      } else {
        setStatus('ok');
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setStatus('redirect');
        navigate(`/damij/auth?returnUrl=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      }
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, [navigate, location.pathname, location.search]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, hsl(220 40% 10%) 0%, hsl(220 50% 14%) 100%)' }}>
        <div className="flex flex-col items-center gap-3 text-white/80">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
          <p className="text-sm font-semibold">جاري التحقق من حسابك في دامج…</p>
        </div>
      </div>
    );
  }

  if (status === 'redirect') return null;
  return <>{children}</>;
};

export default DamijAuthGuard;
