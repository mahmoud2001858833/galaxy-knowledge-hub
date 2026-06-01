import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Loader2, ArrowRight, Sparkles, Shield,
  Eye, EyeOff, CheckCircle2, MailCheck, Hand, Brain, Activity, Layers, FlaskConical,
} from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ROLES = [
  { value: 'caregiver', label: 'ولي أمر / مرافق' },
  { value: 'therapist', label: 'مختص علاج وتأهيل' },
  { value: 'teacher', label: 'معلّم/ة تربية خاصة' },
  { value: 'self', label: 'مستخدم ذاتي (طالب/شخص)' },
  { value: 'other', label: 'غير ذلك' },
];

const loginSchema = z.object({
  email: z.string().trim().email('بريد غير صحيح').max(255),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل').max(128),
});
const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'الاسم قصير جداً').max(80),
  role: z.string(),
});

type Mode = 'login' | 'signup';
type Phase = 'form' | 'confirm-email' | 'success';

const passwordStrength = (p: string) => {
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 4);
};

const ensureDamijProfile = async (userId: string, meta: { name?: string; role?: string }) => {
  const { data: existing } = await supabase
    .from('damij_users').select('id').eq('user_id', userId).maybeSingle();
  if (existing) return true;
  const { error } = await supabase.from('damij_users').insert({
    user_id: userId,
    display_name: meta.name || 'مستخدم دامج',
    role: meta.role || 'other',
    preferred_lang: 'ar',
  });
  return !error;
};

const DamijAuth: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/damij';
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>('login');
  const [phase, setPhase] = useState<Phase>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('caregiver');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const pwScore = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      // Auto-heal: if user has session but no damij profile, create from metadata
      const meta = (session.user.user_metadata ?? {}) as any;
      if (meta?.damij_signup) {
        await ensureDamijProfile(session.user.id, {
          name: meta.damij_name, role: meta.damij_role,
        });
      }
      const { data: prof } = await supabase
        .from('damij_users').select('id').eq('user_id', session.user.id).maybeSingle();
      if (prof && mounted) navigate(returnUrl, { replace: true });
    })();
    return () => { mounted = false; };
  }, [navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ title: 'تحقّق من الحقول', description: Object.values(parsed.error.flatten().fieldErrors).flat().join(' • '), variant: 'destructive' });
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email, password: parsed.data.password,
        });
        if (error) throw error;

        const meta = (data.user?.user_metadata ?? {}) as any;
        await ensureDamijProfile(data.user!.id, {
          name: meta?.damij_name, role: meta?.damij_role,
        });

        const { data: prof } = await supabase
          .from('damij_users').select('id').eq('user_id', data.user!.id).maybeSingle();

        if (!prof) {
          toast({
            title: 'يلزم استكمال البيانات',
            description: 'أنشئ ملفك في دامج لاستكمال الدخول.',
            variant: 'destructive',
          });
          setMode('signup');
          return;
        }
        setPhase('success');
        setTimeout(() => navigate(returnUrl, { replace: true }), 700);
      } else {
        const parsed = signupSchema.safeParse({ email, password, name, role });
        if (!parsed.success) {
          toast({ title: 'تحقّق من الحقول', description: Object.values(parsed.error.flatten().fieldErrors).flat().join(' • '), variant: 'destructive' });
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/damij`,
            data: {
              damij_signup: true,
              damij_name: parsed.data.name,
              damij_role: parsed.data.role,
            },
          },
        });
        if (error) throw error;

        // If session already issued (email confirmation disabled) → create profile
        if (data.session && data.user) {
          const ok = await ensureDamijProfile(data.user.id, {
            name: parsed.data.name, role: parsed.data.role,
          });
          if (!ok) {
            toast({
              title: 'تعذّر إنشاء ملف دامج',
              description: 'حسابك في النظام موجود، لكن لم نتمكن من حفظ ملف دامج. حاول تسجيل الدخول.',
              variant: 'destructive',
            });
            setMode('login');
            return;
          }
          setPhase('success');
          setTimeout(() => navigate(returnUrl, { replace: true }), 900);
        } else {
          // Email confirmation required → DO NOT claim Damij account was created
          setPhase('confirm-email');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'حدث خطأ غير متوقع';
      const friendly =
        /invalid login/i.test(msg) ? 'البريد أو كلمة المرور غير صحيحة.' :
        /already registered|already exists/i.test(msg) ? 'هذا البريد مسجّل مسبقاً، حاول تسجيل الدخول.' :
        msg;
      toast({ title: 'خطأ', description: friendly, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="damij-auth-page min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(1400px 800px at 8% -10%, hsl(var(--damij-primary) / 0.22), transparent 60%),' +
          'radial-gradient(1100px 700px at 110% 110%, hsl(var(--damij-accent-2) / 0.20), transparent 60%),' +
          'linear-gradient(180deg, hsl(var(--damij-bg)) 0%, hsl(var(--damij-bg-2)) 100%)',
        fontFamily: '"Tajawal","Cairo","Inter","Segoe UI",sans-serif',
      }}
    >
      {/* Animated orbs */}
      <motion.div
        className="absolute w-[480px] h-[480px] rounded-full pointer-events-none blur-2xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--damij-primary) / 0.32), transparent 70%)', top: '-12%', insetInlineStart: '-10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[560px] h-[560px] rounded-full pointer-events-none blur-2xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--damij-accent-2) / 0.28), transparent 70%)', bottom: '-18%', insetInlineEnd: '-12%' }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1.5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-6 items-stretch"
      >
        {/* ─── Welcome side panel ─── */}
        <aside
          className="hidden lg:flex relative rounded-[28px] overflow-hidden p-9 flex-col justify-between text-white shadow-2xl"
          style={{
            background:
              'radial-gradient(700px 480px at 100% 0%, hsl(var(--damij-accent-2) / 0.55), transparent 60%),' +
              'linear-gradient(140deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)',
          }}
        >
          {/* Glow pattern */}
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,.25), transparent 40%)' }} />

          <div className="relative">
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 160, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm mb-6 shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-4xl font-extrabold leading-tight">منصّة دامج</h2>
            <p className="text-white/90 mt-3 text-sm leading-relaxed max-w-md">
              وصول كامل ومتساوٍ لجميع الأدوات والبرامج التعليمية والعلاجية — في مكان واحد، بدعم 100+ لغة وأكثر من 8 أنظمة دعم.
            </p>
          </div>

          <ul className="relative grid grid-cols-2 gap-3 my-8">
            {[
              { icon: Hand,        label: 'مترجم لغة الإشارة' },
              { icon: Layers,      label: 'الجسر الحسّي العكسي' },
              { icon: Brain,       label: 'تشخيص التوحّد بالألعاب' },
              { icon: Activity,    label: 'ADHD — تركيز وانضباط' },
              { icon: FlaskConical,label: 'مختبر سريري تفاعلي' },
              { icon: Shield,      label: 'حساب مستقل وآمن' },
            ].map(({ icon: Icon, label }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="flex items-center gap-2.5 text-xs font-semibold bg-white/10 ring-1 ring-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm"
              >
                <span className="inline-flex w-7 h-7 rounded-lg bg-white/20 items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-white/95 truncate">{label}</span>
              </motion.li>
            ))}
          </ul>

          <blockquote className="relative text-sm text-white/90 border-s-2 border-white/40 ps-3 italic">
            «الدمج ليس مكاناً نضع فيه الطلبة، بل ثقافةً نبنيها معاً.»
            <footer className="mt-1 text-[11px] text-white/70 not-italic">— فلسفة منصة دامج</footer>
          </blockquote>
        </aside>

        {/* ─── Right card ─── */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-[hsl(var(--damij-primary))]/40 via-fuchsia-400/20 to-[hsl(var(--damij-accent-2))]/40 blur-2xl opacity-80" />
          <div className="relative rounded-[28px] border-2 border-white/80 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] overflow-hidden">

            <AnimatePresence mode="wait">
              {phase === 'success' ? (
                <motion.div
                  key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="px-8 py-14 text-center flex flex-col items-center gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-[hsl(var(--damij-primary))]">جاهز للانطلاق</h2>
                  <p className="text-sm text-[hsl(var(--damij-muted))]">سيتم تحويلك إلى منصة دامج…</p>
                  <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--damij-primary))]" />
                </motion.div>
              ) : phase === 'confirm-email' ? (
                <motion.div
                  key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-8 py-12 text-center flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                    <MailCheck className="w-11 h-11 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[hsl(var(--damij-primary))]">تحقّق من بريدك</h2>
                  <p className="text-sm text-[hsl(var(--damij-muted))] leading-relaxed max-w-sm">
                    أرسلنا رابط تأكيد إلى <strong className="text-[hsl(var(--damij-text))]">{email}</strong>.
                    بعد التأكيد، عُد إلى هذه الصفحة وسجّل دخولك ليكتمل إنشاء ملفك في دامج تلقائياً.
                  </p>
                  <button
                    onClick={() => { setPhase('form'); setMode('login'); }}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold shadow-md hover:shadow-lg transition"
                  >
                    الانتقال لتسجيل الدخول
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="px-7 pt-7 pb-2 text-center">
                    <h1 className="text-2xl font-extrabold text-[hsl(var(--damij-primary))]">
                      {mode === 'login' ? 'مرحباً بعودتك 👋' : 'أنشئ حسابك في دامج'}
                    </h1>
                    <p className="text-sm text-[hsl(var(--damij-muted))] mt-1.5">
                      {mode === 'login' ? 'سجّل الدخول للوصول إلى أدواتك وبرامجك' : 'خطوة واحدة تفصلك عن منصة الدمج الكاملة'}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="mx-7 mt-4 grid grid-cols-2 rounded-2xl bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] p-1 text-sm font-bold">
                    {(['login', 'signup'] as Mode[]).map((m) => (
                      <button
                        key={m} type="button" onClick={() => setMode(m)}
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
                            <span className="absolute inset-y-0 start-3 flex items-center text-[hsl(var(--damij-primary))] pointer-events-none">
                              <Shield className="w-4 h-4" />
                            </span>
                            <select
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              className="w-full bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] rounded-xl py-3 ps-10 pe-4 text-[hsl(var(--damij-text))] text-sm font-semibold focus:outline-none focus:border-[hsl(var(--damij-primary))] focus:bg-white transition-colors"
                            >
                              {ROLES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Field
                      icon={<Mail className="w-4 h-4" />}
                      placeholder="البريد الإلكتروني" type="email"
                      value={email} onChange={setEmail} autoComplete="email"
                    />

                    <div className="relative">
                      <span className="absolute inset-y-0 start-3 flex items-center text-[hsl(var(--damij-primary))] pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="كلمة المرور"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        className="w-full bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] rounded-xl py-3 ps-10 pe-11 text-[hsl(var(--damij-text))] placeholder:text-[hsl(var(--damij-muted))] text-sm font-semibold focus:outline-none focus:border-[hsl(var(--damij-primary))] focus:bg-white focus:ring-2 focus:ring-[hsl(var(--damij-primary))]/15 transition-colors"
                      />
                      <button
                        type="button" onClick={() => setShowPw((v) => !v)}
                        className="absolute inset-y-0 end-2 flex items-center px-2 text-[hsl(var(--damij-muted))] hover:text-[hsl(var(--damij-primary))]"
                        aria-label={showPw ? 'إخفاء' : 'إظهار'}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {mode === 'signup' && password.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              pwScore > i
                                ? pwScore <= 1 ? 'bg-rose-400'
                                : pwScore === 2 ? 'bg-amber-400'
                                : pwScore === 3 ? 'bg-lime-500'
                                : 'bg-emerald-500'
                                : 'bg-[hsl(var(--damij-border))]'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {mode === 'login' && (
                      <div className="flex items-center justify-between text-xs">
                        <label className="inline-flex items-center gap-2 text-[hsl(var(--damij-muted))] cursor-pointer">
                          <input
                            type="checkbox" checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="accent-[hsl(var(--damij-primary))]"
                          />
                          تذكّرني
                        </label>
                        <Link to="/damij/auth/reset" className="text-[hsl(var(--damij-primary))] hover:underline font-semibold">
                          نسيت كلمة المرور؟
                        </Link>
                      </div>
                    )}

                    <button
                      type="submit" disabled={loading}
                      className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-white shadow-lg transition-all disabled:opacity-60 hover:shadow-xl active:scale-[0.99]"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)',
                        boxShadow: '0 14px 32px -10px hsl(var(--damij-primary) / 0.6)',
                      }}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <span>{mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="text-center text-xs text-[hsl(var(--damij-muted))]">
                      {mode === 'login' ? 'ليس لديك حساب دامج؟' : 'لديك حساب بالفعل؟'}{' '}
                      <button
                        type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-[hsl(var(--damij-primary))] font-bold hover:underline"
                      >
                        {mode === 'login' ? 'أنشئ واحداً جديداً' : 'سجّل دخول'}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-[hsl(var(--damij-muted))] pt-3 border-t border-[hsl(var(--damij-border))]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>حساب دامج مستقل تمامًا عن منصة ذروة العلم</span>
                    </div>

                    <Link to="/damij" className="block text-center text-[11px] text-[hsl(var(--damij-muted))] hover:text-[hsl(var(--damij-primary))]">
                      ← العودة لصفحة دامج
                    </Link>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
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
  autoComplete?: string;
}> = ({ icon, placeholder, value, onChange, type = 'text', autoComplete }) => (
  <div className="relative">
    <span className="absolute inset-y-0 start-3 flex items-center text-[hsl(var(--damij-primary))] pointer-events-none">{icon}</span>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} autoComplete={autoComplete}
      className="w-full bg-[hsl(var(--damij-bg-2))] border border-[hsl(var(--damij-border))] rounded-xl py-3 ps-10 pe-4 text-[hsl(var(--damij-text))] placeholder:text-[hsl(var(--damij-muted))] text-sm font-semibold focus:outline-none focus:border-[hsl(var(--damij-primary))] focus:bg-white focus:ring-2 focus:ring-[hsl(var(--damij-primary))]/15 transition-colors"
    />
  </div>
);

export default DamijAuth;
