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
    <div dir="rtl" className="damij-auth-page min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 700px at 10% -10%, hsl(var(--damij-primary) / 0.18), transparent 60%),' +
          'radial-gradient(900px 600px at 110% 110%, hsl(var(--damij-accent-2) / 0.16), transparent 60%),' +
          'linear-gradient(180deg, hsl(var(--damij-bg)) 0%, hsl(var(--damij-bg-2)) 100%)',
        fontFamily: '"Tajawal","Cairo","Inter","Segoe UI",sans-serif',
      }}
    >
      {/* Animated orbs */}
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--damij-primary) / 0.25), transparent 70%)', top: '-10%', insetInlineStart: '-10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--damij-accent-2) / 0.22), transparent 70%)', bottom: '-15%', insetInlineEnd: '-10%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, delay: 1.5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] gap-6 items-stretch"
      >
        {/* ─── Welcome side panel ─── */}
        <aside className="hidden lg:flex relative rounded-3xl overflow-hidden p-8 flex-col justify-between text-white shadow-2xl"
          style={{
            background:
              'radial-gradient(600px 400px at 100% 0%, hsl(var(--damij-accent-2) / 0.45), transparent 60%),' +
              'linear-gradient(140deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)',
          }}
        >
          <div>
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 160, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm mb-5"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-3xl font-extrabold leading-tight">منصّة دامج</h2>
            <p className="text-white/85 mt-2 text-sm leading-relaxed">
              وصول كامل ومتساوٍ لجميع الأدوات والبرامج التعليمية والعلاجية في مكان واحد.
            </p>
          </div>

          <ul className="space-y-3 my-8">
            {[
              'برامج علاجية ذكية للتوحّد وفرط الحركة',
              'أدوات بصرية وسمعية لذوي الاحتياجات',
              'مختبر سريري تفاعلي وتقارير قابلة للمشاركة',
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-white/20 ring-1 ring-white/30 items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="text-white/90">{line}</span>
              </li>
            ))}
          </ul>

          <div className="text-xs text-white/80 border-t border-white/20 pt-4">
            «الدمج ليس مكاناً نضع فيه الطلبة، بل ثقافةً نبنيها معاً.»
          </div>
        </aside>

        {/* ─── Login card ─── */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-primary))]/30 via-transparent to-[hsl(var(--damij-accent-2))]/30 blur-xl opacity-70" />
          <div className="relative rounded-3xl border border-[hsl(var(--damij-border))] bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="px-7 pt-7 pb-2 text-center">
              <h1 className="text-2xl font-extrabold text-[hsl(var(--damij-primary))]">
                {mode === 'login' ? 'مرحباً بعودتك' : 'أنشئ حسابك في دامج'}
              </h1>
              <p className="text-sm text-[hsl(var(--damij-muted))] mt-1">
                {mode === 'login' ? 'سجّل الدخول للوصول إلى أدواتك وبرامجك' : 'خطوة واحدة تفصلك عن المنصة الكاملة'}
              </p>
            </div>

            {/* Tabs */}
            <div className="mx-7 mt-4 grid grid-cols-2 rounded-2xl bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] p-1 text-sm font-bold">
              {(['login', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`relative py-2.5 rounded-xl transition-colors ${mode === m ? 'text-white' : 'text-[hsl(var(--damij-muted))] hover:text-[hsl(var(--damij-primary))]'}`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="damij-auth-tab"
                      className="absolute inset-0 rounded-xl shadow-md"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--damij-primary)), hsl(var(--damij-accent-2)))' }}
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
                        className="w-full bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] rounded-xl py-3 px-4 text-[hsl(var(--damij-text))] text-sm font-semibold focus:outline-none focus:border-[hsl(var(--damij-primary))] focus:bg-white transition-colors"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
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
                className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-white shadow-lg transition-all disabled:opacity-60 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)', boxShadow: '0 12px 30px -10px hsl(var(--damij-primary) / 0.55)' }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>{mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs">
                {mode === 'login' ? (
                  <Link to="/damij/auth/reset" className="text-[hsl(var(--damij-primary))] hover:underline font-semibold">
                    نسيت كلمة المرور؟
                  </Link>
                ) : <span />}
                <Link to="/damij" className="text-[hsl(var(--damij-muted))] hover:text-[hsl(var(--damij-primary))] font-semibold">
                  العودة لصفحة دامج
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[hsl(var(--damij-muted))] pt-2 border-t border-[hsl(var(--damij-border))]">
                <Shield className="w-3.5 h-3.5" />
                <span>حساب دامج مستقل تمامًا عن منصة ذروة العلم</span>
              </div>
            </form>
          </div>
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
    <span className="absolute inset-y-0 start-3 flex items-center text-[hsl(var(--damij-primary))] pointer-events-none">{icon}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] rounded-xl py-3 ps-10 pe-4 text-[hsl(var(--damij-text))] placeholder:text-[hsl(var(--damij-muted))] text-sm font-semibold focus:outline-none focus:border-[hsl(var(--damij-primary))] focus:bg-white focus:ring-2 focus:ring-[hsl(var(--damij-primary))]/15 transition-colors"
    />
  </div>
);

export default DamijAuth;
