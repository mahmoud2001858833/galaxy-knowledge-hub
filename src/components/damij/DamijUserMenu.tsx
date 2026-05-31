import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn, LogOut, User as UserIcon, LayoutDashboard, Settings, Shield, Loader2,
  Sparkles, ChevronLeft, HelpCircle, Languages, BookOpen, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
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

const ROLE_COLOR: Record<string, string> = {
  caregiver: 'from-sky-400 to-cyan-500',
  therapist: 'from-fuchsia-500 to-pink-500',
  teacher: 'from-amber-400 to-orange-500',
  self: 'from-emerald-400 to-teal-500',
  other: 'from-violet-500 to-indigo-500',
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
    return (
      <div className="w-10 h-10 rounded-full bg-white/60 border border-[hsl(var(--damij-border))] flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--damij-primary))]" />
      </div>
    );
  }

  if (!profile) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Link
        to={`/damij/auth?returnUrl=${returnUrl}`}
        className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white shadow-md hover:shadow-xl transition-all hover:scale-105"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>تسجيل الدخول</span>
      </Link>
    );
  }

  const initial = (profile.display_name || profile.email || '?').trim().charAt(0).toUpperCase();
  const roleLabel = ROLE_LABEL[profile.role] || profile.role;
  const roleColor = ROLE_COLOR[profile.role] || ROLE_COLOR.other;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="حسابي"
          className="relative w-11 h-11 rounded-full text-white font-extrabold text-sm shadow-lg ring-2 ring-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)',
            boxShadow: '0 8px 20px -6px hsl(var(--damij-primary) / 0.55)',
          }}
        >
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            : <span className="text-base">{initial}</span>}
          {/* Status dot */}
          <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-80 p-0 overflow-hidden border-[hsl(var(--damij-border))] shadow-2xl rounded-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div
          className="relative px-5 pt-5 pb-12 text-white overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)' }}
        >
          <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -start-8 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase opacity-90">
            <Sparkles className="w-3 h-3" /> منصة دامج
          </div>
          <div className="relative mt-2 font-extrabold text-lg leading-tight truncate">{profile.display_name}</div>
          <div className="relative text-[11px] opacity-90 truncate">{profile.email}</div>
        </div>

        {/* Avatar overlap */}
        <div className="px-5 -mt-9 relative z-10">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleColor} ring-4 ring-white flex items-center justify-center font-extrabold text-white text-2xl shadow-lg`}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              : <span>{initial}</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white font-bold bg-gradient-to-l ${roleColor}`}>
              <Shield className="w-3 h-3" /> {roleLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> متصل
            </span>
          </div>
        </div>

        <div className="px-5 pt-3 pb-2 text-[11px] text-[hsl(var(--damij-muted))]">
          مرحباً بك في دامج — وصول كامل ومتساوٍ لجميع الأدوات.
        </div>

        {/* Quick grid */}
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-2">
          <QuickAction icon={LayoutDashboard} label="لوحتي" onClick={() => { setOpen(false); navigate('/damij/dashboard'); }} />
          <QuickAction icon={BookOpen} label="التوثيق" onClick={() => { setOpen(false); navigate('/damij/docs'); }} />
          <QuickAction icon={FileText} label="المصادر" onClick={() => { setOpen(false); navigate('/damij/sources'); }} />
        </div>

        <div className="py-1 border-t border-[hsl(var(--damij-border))]">
          <MenuItem icon={UserIcon} label="حسابي الشخصي" onClick={() => { setOpen(false); navigate('/damij/dashboard'); }} />
          <MenuItem icon={Settings} label="إعدادات الحساب" onClick={() => { setOpen(false); navigate('/damij/dashboard'); }} />
          <MenuItem icon={Languages} label="تغيير اللغة" onClick={() => { setOpen(false); document.querySelector<HTMLButtonElement>('[data-damij-lang-trigger]')?.click(); }} />
          <MenuItem icon={HelpCircle} label="المساعدة والدعم" onClick={() => { setOpen(false); navigate('/damij/docs'); }} />
          <div className="my-1 border-t border-[hsl(var(--damij-border))]" />
          <MenuItem icon={LogOut} label="تسجيل الخروج" onClick={signOut} danger />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const QuickAction: React.FC<{ icon: any; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[hsl(var(--damij-bg-2))] hover:bg-[hsl(var(--damij-primary))]/10 hover:text-[hsl(var(--damij-primary))] transition-colors text-[hsl(var(--damij-text))]"
  >
    <Icon className="w-4 h-4" />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const MenuItem: React.FC<{ icon: any; label: string; onClick: () => void; danger?: boolean }> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition-colors group ${
      danger
        ? 'text-rose-600 hover:bg-rose-50'
        : 'text-[hsl(var(--damij-text))] hover:bg-[hsl(var(--damij-bg-2))]'
    }`}
  >
    <span className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </span>
    <ChevronLeft className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${danger ? 'text-rose-400' : 'text-[hsl(var(--damij-muted))]'}`} />
  </button>
);

export default DamijUserMenu;
