import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DamijResetPassword: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stage, setStage] = useState<'request' | 'update'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) setStage('update');
  }, []);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/damij/auth/reset`,
    });
    setLoading(false);
    if (error) toast({ title: 'تعذّر الإرسال', description: error.message, variant: 'destructive' });
    else toast({ title: 'تم إرسال الرابط', description: 'تفقّد بريدك الإلكتروني.' });
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'كلمة المرور قصيرة', description: '6 أحرف على الأقل', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'تم تحديث كلمة المرور' });
      navigate('/damij/auth', { replace: true });
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(180deg, hsl(220 40% 8%) 0%, hsl(220 50% 12%) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.07] backdrop-blur-2xl p-7 shadow-2xl"
      >
        <h1 className="text-xl font-extrabold text-white mb-1">استعادة كلمة المرور</h1>
        <p className="text-sm text-white/60 mb-6">
          {stage === 'request' ? 'أدخل بريدك لإرسال رابط الاستعادة.' : 'أدخل كلمة مرور جديدة لحسابك.'}
        </p>
        <form onSubmit={stage === 'request' ? requestReset : updatePassword} className="space-y-4">
          {stage === 'request' ? (
            <div className="relative">
              <Mail className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-cyan-200/80" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required
                className="w-full bg-white/10 border border-white/15 rounded-xl py-3 ps-10 pe-4 text-white placeholder:text-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-300/60"
              />
            </div>
          ) : (
            <div className="relative">
              <Lock className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-cyan-200/80" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة" required
                className="w-full bg-white/10 border border-white/15 rounded-xl py-3 ps-10 pe-4 text-white placeholder:text-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-300/60"
              />
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-slate-900 bg-gradient-to-br from-cyan-300 to-violet-300 shadow-lg disabled:opacity-60">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (stage === 'request' ? 'إرسال الرابط' : 'تحديث')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DamijResetPassword;
