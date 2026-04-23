import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import StarField from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock, Sparkles, Rocket, ArrowRight } from 'lucide-react';

const Auth = () => {
  const isGJUMode = sessionStorage.getItem('gju_mode') === 'true';
  const redirectPath = isGJUMode ? '/gju-competition' : '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) navigate(redirectPath);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) navigate(redirectPath);
    });
    return () => subscription.unsubscribe();
  }, [navigate, redirectPath]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { data: createData, error: createError } = await supabase.functions.invoke('auto-create-user', {
            body: { email, password }
          });
          if (createError || createData?.error) {
            if (createData?.error === 'user_exists') {
              throw new Error('خطأ في بيانات تسجيل الدخول. يرجى التحقق من كلمة المرور.');
            } else if (createData?.error === 'Email not authorized') {
              throw new Error('هذا الإيميل غير مصرح له بالدخول.');
            }
            throw createError || new Error(createData?.error);
          }
          const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError) throw loginError;
          toast({ title: "تم إنشاء حسابك بنجاح", description: "مرحباً بك في المنصة" });
        } else {
          throw error;
        }
      }
      navigate(redirectPath);
    } catch (error: any) {
      setAuthError(error.message || 'خطأ في تسجيل الدخول');
      toast({ title: "خطأ في تسجيل الدخول", description: error.message || 'يرجى التحقق من بيانات الدخول والمحاولة مرة أخرى', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    if (password !== confirmPassword) {
      setAuthError('كلمات المرور غير متطابقة');
      setLoading(false);
      toast({ title: "كلمات المرور غير متطابقة", description: "يرجى التأكد من تطابق كلمات المرور", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${redirectPath}` }
      });
      if (error) throw error;
      toast({ title: "تم إنشاء الحساب بنجاح", description: "يرجى تسجيل الدخول للمتابعة" });
      setIsSignUp(false);
    } catch (error: any) {
      setAuthError(error.error_description || error.message || 'خطأ في إنشاء الحساب');
      toast({ title: "خطأ في إنشاء الحساب", description: error.error_description || error.message || 'يرجى المحاولة مرة أخرى', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${redirectPath}` }
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.error_description || error.message || 'خطأ في تسجيل الدخول بواسطة جوجل');
      toast({ title: "خطأ في تسجيل الدخول", description: error.error_description || error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  // GJU futuristic theme
  if (isGJUMode) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#05060f]" dir="rtl">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'
        }} />

        {/* Glowing orbs */}
        <motion.div
          className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 9 }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[8%] w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 11, delay: 2 }}
        />
        <motion.div
          className="absolute top-[50%] left-[40%] w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 13, delay: 4 }}
        />

        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Outer glowing border */}
            <div className="relative">
              <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 opacity-70 blur-md animate-pulse" />
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" />

              <div className="relative bg-[#0a0b1a]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                {/* Logo */}
                <motion.div
                  className="flex flex-col items-center mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 blur-xl opacity-60" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-violet-400 via-cyan-300 to-emerald-400 tracking-tight">
                    🌌 مستقبل التكنولوجيا
                  </h1>
                  <p className="text-xs text-white/50 mt-1 tracking-widest uppercase">GJU 3030 • Innovation Hub</p>
                </motion.div>

                <h2 className="text-xl font-semibold text-white text-center mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  {isSignUp ? 'انضم إلى المستقبل' : 'مرحباً بعودتك'}
                </h2>
                <p className="text-center text-white/50 text-sm mb-6">
                  {isSignUp ? 'أنشئ حسابك للوصول إلى منصة الابتكار' : 'سجّل الدخول لمتابعة رحلتك التقنية'}
                </p>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/40 text-red-200 p-3 rounded-xl mb-4 text-right text-sm"
                  >
                    {authError}
                  </motion.div>
                )}

                <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-white/80 text-right mb-1.5 text-sm font-medium">البريد الإلكتروني</label>
                      <div className="relative group">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/70 group-focus-within:text-cyan-300 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="example@domain.com"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-right pr-10 h-11 rounded-xl focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-white/80 text-right mb-1.5 text-sm font-medium">كلمة المرور</label>
                      <div className="relative group">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-300/70 group-focus-within:text-violet-300 transition-colors" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-right pr-10 h-11 rounded-xl focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 transition-all"
                        />
                      </div>
                    </div>

                    {isSignUp && (
                      <div>
                        <label htmlFor="confirm-password" className="block text-white/80 text-right mb-1.5 text-sm font-medium">تأكيد كلمة المرور</label>
                        <div className="relative group">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/70 group-focus-within:text-emerald-300 transition-colors" />
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-right pr-10 h-11 rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-cyan-500/40 transition-all border-0"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          جاري التحميل...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {isSignUp ? 'إنشاء حساب' : 'دخول إلى المنصة'}
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[#0a0b1a] text-white/40 tracking-widest">أو تابع باستخدام</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-11 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-3 transition-all backdrop-blur"
                >
                  <FcGoogle className="text-xl" />
                  المتابعة باستخدام Google
                </Button>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-white/60 hover:text-cyan-300 transition-colors"
                  >
                    {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
                    <span className="text-cyan-300 font-semibold underline-offset-4 hover:underline">
                      {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-white/30 text-xs mt-6 tracking-wider">
              ✦ GJU 3030 — مسابقة الابتكار التقني ✦
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // Default theme (ذروة العلم)
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" dir="rtl">
      <StarField />

      <motion.div className="absolute top-[10%] left-[10%] w-32 h-32 bg-space-deep-purple/30 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 8 }} />
      <motion.div className="absolute top-[40%] right-[15%] w-40 h-40 bg-space-neon-blue/20 rounded-full blur-3xl" animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 10, delay: 2 }} />

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
            <div className="flex justify-center mb-6">
              <motion.h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue to-space-vivid-purple flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                🌌 ذروة العلم
              </motion.h1>
            </div>

            <h2 className="text-xl font-semibold text-white text-center mb-6">
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>

            {authError && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4 text-right">{authError}</div>}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-white/90 text-right mb-1">البريد الإلكتروني</label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-white/90 text-right mb-1">كلمة المرور</label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right" />
                </div>
                {isSignUp && (
                  <div>
                    <label htmlFor="confirm-password" className="block text-white/90 text-right mb-1">تأكيد كلمة المرور</label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="أعد كتابة كلمة المرور" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right" />
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-space-deep-purple hover:bg-space-deep-purple/80 text-white">
                  {loading ? 'جاري التحميل...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                </Button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20"></span></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-900/50 text-white/70">أو</span></div>
            </div>

            <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full border-white/20 bg-white hover:bg-white/90 text-gray-800 font-medium flex items-center justify-center gap-2">
              <FcGoogle className="text-xl" />
              تسجيل الدخول باستخدام جوجل
            </Button>

            <div className="mt-6 text-center">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-space-neon-blue hover:text-space-bright-blue text-sm">
                {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
