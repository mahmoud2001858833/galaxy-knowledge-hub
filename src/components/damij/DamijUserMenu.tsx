import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, LogOut, User as UserIcon, LayoutDashboard, Settings, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DamijProfile {
  display_name: string;
  role: string;
  avatar_url?: string | null;
  email?: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  caregiver: 'ولي أمر',
  therapist: 'مختص علاج',
  teacher: 'معلّم/ة',
  self: 'مستخدم ذاتي',
  other: 'مستخدم',
};

const DamijUserMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DamijProfile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) { setProfile(null); setLoading(false); } return; }
      const { data: prof } = await supabase
        .from('damij_users')
        .select('display_name, role, avatar_url')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!active) return;
      setProfile(prof ? { ...(prof as any), email: session.user.email } : null);
      setLoading(false);
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setOpen(false);
    navigate('/damij', { replace: true });
  };

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-white/60 border border-[hsl(var(--damij-border))] flex items-center justify-center">
      <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--damij-primary))]" />
    </div>;
  }

  if (!profile) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Link
        to={`/damij/auth?returnUrl=${returnUrl}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white shadow-sm hover:shadow-md transition-shadow"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>تسجيل الدخول</span>
      </Link>
    );
  }

  const initial = (profile.display_name || profile.email || '?').trim().charAt(0).toUpperCase();
  const roleLabel = ROLE_LABEL[profile.role] || profile.role;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="حسابي"
          className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white font-extrabold text-sm shadow-md ring-2 ring-white hover:scale-105 transition-transform"
        >
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            : <span>{initial}</span>}
          <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-72 p-0 overflow-hidden border-[hsl(var(--damij-border))]" dir="rtl">
        <div className="px-4 py-3 bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-extrabold text-base">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                : <span>{initial}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold truncate">{profile.display_name}</div>
              <div className="text-[11px] opacity-90 truncate">{profile.email}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20"><Shield className="w-3 h-3" /> {roleLabel}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> متصل الآن
            </span>
          </div>
        </div>

        <div className="px-4 py-3 text-[11px] text-[hsl(var(--damij-muted))] border-b border-[hsl(var(--damij-border))] bg-[hsl(var(--damij-bg-2))]">
          أهلاً بك في منصة دامج — وصول كامل ومتساوٍ لجميع الأدوات والبرامج.
        </div>

        <div className="py-1">
          <MenuItem icon={LayoutDashboard} label="لوحتي" onClick={() => { setOpen(false); navigate('/damij/dashboard'); }} />
          <MenuItem icon={UserIcon} label="حسابي" onClick={() => { setOpen(false); navigate('/damij/dashboard'); }} />
          <MenuItem icon={Settings} label="الإعدادات" onClick={() => { setOpen(false); navigate('/damij/dashboard'); }} />
          <div className="my-1 border-t border-[hsl(var(--damij-border))]" />
          <MenuItem icon={LogOut} label="تسجيل الخروج" onClick={signOut} danger />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-white px-3 py-2 text-center">
    <div className="text-base font-extrabold text-[hsl(var(--damij-primary))]">{value}</div>
    <div className="text-[10px] text-[hsl(var(--damij-muted))]">{label}</div>
  </div>
);

const MenuItem: React.FC<{ icon: any; label: string; onClick: () => void; danger?: boolean }> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
      danger
        ? 'text-rose-600 hover:bg-rose-50'
        : 'text-[hsl(var(--damij-text))] hover:bg-[hsl(var(--damij-bg-2))]'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export default DamijUserMenu;
