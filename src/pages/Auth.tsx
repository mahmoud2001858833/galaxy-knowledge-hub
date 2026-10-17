import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock, Sparkles, Rocket, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#060818] text-slate-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-300" dir="rtl">
      <Navbar />

      {/* Subtle Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 dark:shadow-black/50 border border-slate-200/90 dark:border-slate-800">
            {/* Institutional Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-600/25 mb-3">
                {isGJUMode ? <Rocket className="w-7 h-7 text-white" /> : <GraduationCap className="w-7 h-7 text-white" />}
              </div>

              <Badge variant="outline" className="mb-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                {isGJUMode ? 'GJU 3030 • مسابقة الابتكار التقني' : 'وزارة التربية والتعليم • مدرسة عنبه الثانوية للبنين'}
              </Badge>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isGJUMode ? 'مستقبل التكنولوجيا' : 'منصة ذروة العلم 2.0'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isSignUp
                  ? 'أنشئ حسابك الأكاديمي للوصول لكافة المختبرات والأدوات الذكية'
                  : 'سجّل الدخول إلى حسابك الأكاديمي لمتابعة رحلتك العلمية'}
              </p>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 p-3.5 rounded-2xl mb-5 text-right text-xs font-semibold"
              >
                {authError}
              </motion.div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-slate-700 dark:text-slate-200 text-right mb-1.5 text-xs font-bold">
                  البريد الإلكتروني الأكاديمي أو الشخصي
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-right pr-10 h-11 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-slate-700 dark:text-slate-200 text-right mb-1.5 text-xs font-bold">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-right pr-10 h-11 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirm-password" className="block text-slate-700 dark:text-slate-200 text-right mb-1.5 text-xs font-bold">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-right pr-10 h-11 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all text-xs sm:text-sm"
              >
                {loading ? (
                  <span>جاري التحقق والدخول...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول للمنصة'}</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-semibold">أو المتابعة السريعة عبر</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center gap-2.5 text-xs sm:text-sm transition-all"
            >
              <FcGoogle className="text-xl" />
              <span>تسجيل الدخول باستخدام Google</span>
            </Button>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب بعد؟ '}
                <span className="text-blue-600 dark:text-blue-400 font-bold underline underline-offset-4">
                  {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>اتصال مشفر ومحمي وفق معايير الأمان السيبراني للمنصات التعليمية</span>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
