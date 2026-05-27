import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ROLES = [
  { value: 'caregiver', label: 'ولي أمر' },
  { value: 'therapist', label: 'مختص علاج' },
  { value: 'teacher', label: 'معلّم/ة' },
  { value: 'self', label: 'مستخدم ذاتي' },
  { value: 'other', label: 'غير ذلك' },
];

const loginSchema = z.object({
  email: z.string().trim().email('بريد غير صحيح').max(255),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل').max(128),
});
const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'الاسم قصير').max(80),
  role: z.string(),
});

type Mode = 'login' | 'signup';

const DamijAuth: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/damij';
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('caregiver');
  const [loading, setLoading] = useState(false);

  // Already logged-in and has damij profile? redirect.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: prof } = await supabase
        .from('damij_users')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (prof && mounted) navigate(returnUrl, { replace: true });
    })();
    return () => { mounted = false; };
  }, [navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ title: 'تحقّق من الحقول', description: Object.values(parsed.error.flatten().fieldErrors).flat().join(' • '), variant: 'destructive' });
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
        if (error) throw error;
        // Ensure damij profile exists
        const { data: prof } = await supabase.from('damij_users').select('id').eq('user_id', data.user!.id).maybeSingle();
        if (!prof) {
          toast({ title: 'لا يوجد حساب دامج', description: 'يبدو أن لديك حساب ذروة العلم فقط. أنشئ حساب دامج جديد.', variant: 'destructive' });
          setMode('signup');
          return;
        }
        toast({ title: 'أهلاً بك في دامج', description: 'تم تسجيل الدخول بنجاح.' });
        navigate(returnUrl, { replace: true });
      } else {
        const parsed = signupSchema.safeParse({ email, password, name, role });
        if (!parsed.success) {
          toast({ title: 'تحقّق من الحقول', description: Object.values(parsed.error.flatten().fieldErrors).flat().join(' • '), variant: 'destructive' });
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/damij` },
        });
        if (error) throw error;
        const userId = data.user?.id;
        if (userId) {
          const { error: profErr } = await supabase.from('damij_users').insert({
            user_id: userId,
            display_name: parsed.data.name,
            role: parsed.data.role,
            preferred_lang: 'ar',
          });
          if (profErr && profErr.code !== '23505') throw profErr;
        }
        toast({ title: 'تم إنشاء حساب دامج', description: 'مرحباً بك! تفضّل للوصول إلى المنصة.' });
        if (data.session) navigate(returnUrl, { replace: true });
        else setMode('login');
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err?.message || 'حدث خطأ غير متوقع', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="damij-auth-page min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background: 'radial-gradient(1200px 700px at 10% -10%, hsl(190 80% 25% / 0.35), transparent 60%), radial-gradient(900px 600px at 110% 110%, hsl(280 70% 35% / 0.30), transparent 60%), linear-gradient(180deg, hsl(220 40% 8%) 0%, hsl(220 50% 12%) 100%)',
        fontFamily: '"Tajawal","Cairo","Inter","Segoe UI",sans-serif',
      }}
    >
      {/* Animated orbs */}
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(190 80% 50% / 0.35), transparent 70%)', top: '-10%', insetInlineStart: '-10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(280 80% 60% / 0.30), transparent 70%)', bottom: '-15%', insetInlineEnd: '-10%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, delay: 1.5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-cyan-400/40 via-teal-300/30 to-violet-400/40 blur-xl opacity-70" />
        <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="px-7 pt-7 pb-2 text-center">
            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 160, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/40 mb-3"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-white">منصّة دامج</h1>
            <p className="text-sm text-white/70 mt-1">حسابك المستقل للوصول الكامل والمتساوي</p>
          </div>

          {/* Tabs */}
          <div className="mx-7 mt-4 grid grid-cols-2 rounded-2xl bg-white/[0.06] border border-white/10 p-1 text-sm font-bold">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative py-2.5 rounded-xl transition-colors ${mode === m ? 'text-slate-900' : 'text-white/80 hover:text-white'}`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="damij-auth-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-300 to-violet-300 shadow-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{m === 'login' ? 'تسجيل دخول' : 'إنشاء حساب'}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-7 pt-5 space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-extra"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Field icon={<User className="w-4 h-4" />} placeholder="الاسم الكامل" value={name} onChange={setName} />
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl py-3 px-4 text-white text-sm font-semibold focus:outline-none focus:border-cyan-300/60 focus:bg-white/15"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value} className="bg-slate-900 text-white">{r.label}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Field icon={<Mail className="w-4 h-4" />} placeholder="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />
            <Field icon={<Lock className="w-4 h-4" />} placeholder="كلمة المرور" type="password" value={password} onChange={setPassword} />

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-slate-900 bg-gradient-to-br from-cyan-300 via-teal-200 to-violet-300 hover:from-cyan-200 hover:to-violet-200 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>{mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {mode === 'login' && (
              <div className="text-center text-xs">
                <Link to="/damij/auth/reset" className="text-cyan-200/90 hover:text-white font-semibold">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-white/60 pt-2">
              <Shield className="w-3.5 h-3.5" />
              <span>حساب دامج مستقل تمامًا عن منصة ذروة العلم</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Field: React.FC<{
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}> = ({ icon, placeholder, value, onChange, type = 'text' }) => (
  <div className="relative">
    <span className="absolute inset-y-0 start-3 flex items-center text-cyan-200/80 pointer-events-none">{icon}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/10 border border-white/15 rounded-xl py-3 ps-10 pe-4 text-white placeholder:text-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-300/60 focus:bg-white/15 transition-colors"
    />
  </div>
);

export default DamijAuth;
