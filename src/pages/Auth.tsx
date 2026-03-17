import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import StarField from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { FcGoogle } from 'react-icons/fc'; // We'll add this dependency later

const Auth = () => {
  const isGJUMode = sessionStorage.getItem('gju_mode') === 'true';
  const redirectPath = isGJUMode ? '/gju-competition' : '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        // إذا كان الخطأ "Invalid login credentials"، نحاول إنشاء حساب جديد تلقائياً
        if (error.message.includes('Invalid login credentials')) {
          // محاولة إنشاء حساب جديد للإيميلات المضافة من admin
          const {
            data: createData,
            error: createError
          } = await supabase.functions.invoke('auto-create-user', {
            body: {
              email,
              password
            }
          });
          if (createError || createData?.error) {
            if (createData?.error === 'user_exists') {
              throw new Error('خطأ في بيانات تسجيل الدخول. يرجى التحقق من كلمة المرور.');
            } else if (createData?.error === 'Email not authorized') {
              throw new Error('هذا الإيميل غير مصرح له بالدخول.');
            }
            throw createError || new Error(createData?.error);
          }

          // إذا تم إنشاء الحساب بنجاح، نسجل الدخول
          const {
            error: loginError
          } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (loginError) throw loginError;
          toast({
            title: "تم إنشاء حسابك بنجاح",
            description: "مرحباً بك في المنصة"
          });
        } else {
          throw error;
        }
      }
      navigate('/');
    } catch (error: any) {
      setAuthError(error.message || 'خطأ في تسجيل الدخول');
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || 'يرجى التحقق من بيانات الدخول والمحاولة مرة أخرى',
        variant: "destructive"
      });
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
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "يرجى التأكد من تطابق كلمات المرور",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى تسجيل الدخول للمتابعة"
      });
      setIsSignUp(false);
    } catch (error: any) {
      setAuthError(error.error_description || error.message || 'خطأ في إنشاء الحساب');
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.error_description || error.message || 'يرجى المحاولة مرة أخرى',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.error_description || error.message || 'خطأ في تسجيل الدخول بواسطة غوغل');
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.error_description || error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.error_description || error.message || 'خطأ في تسجيل الدخول بواسطة فيسبوك');
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.error_description || error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col relative overflow-hidden" dir="rtl">
      <StarField />
      
      {/* Animated cosmic elements */}
      <motion.div className="absolute top-[10%] left-[10%] w-32 h-32 bg-space-deep-purple/30 rounded-full blur-3xl" animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3]
    }} transition={{
      repeat: Infinity,
      duration: 8
    }} />
      
      <motion.div className="absolute top-[40%] right-[15%] w-40 h-40 bg-space-neon-blue/20 rounded-full blur-3xl" animate={{
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.5, 0.2]
    }} transition={{
      repeat: Infinity,
      duration: 10,
      delay: 2
    }} />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div className="w-full max-w-md" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
            <div className="flex justify-center mb-6">
              <motion.h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue to-space-vivid-purple flex items-center" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.2
            }}>🌌 ذروة العلم
              </motion.h1>
            </div>
            
            <h2 className="text-xl font-semibold text-white text-center mb-6">
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            
            {authError && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4 text-right">
                {authError}
              </div>}
            
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-white/90 text-right mb-1">
                    البريد الإلكتروني
                  </label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right" />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-white/90 text-right mb-1">
                    كلمة المرور
                  </label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right" />
                </div>
                
                {isSignUp && <div>
                    <label htmlFor="confirm-password" className="block text-white/90 text-right mb-1">
                      تأكيد كلمة المرور
                    </label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="أعد كتابة كلمة المرور" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-right" />
                  </div>}
                
                <Button type="submit" disabled={loading} className="w-full bg-space-deep-purple hover:bg-space-deep-purple/80 text-white">
                  {loading ? <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التحميل...
                    </span> : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                </Button>
              </div>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-white/70">أو</span>
              </div>
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
    </div>;
};
export default Auth;