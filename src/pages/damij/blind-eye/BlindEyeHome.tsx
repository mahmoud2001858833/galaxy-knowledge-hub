import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Camera, ArrowLeft, Mic, Radio, AlertTriangle, ShieldAlert } from 'lucide-react';
import DamijSEO from '@/components/damij/DamijSEO';
import { getLocalPrefs, loadRemotePrefs } from './userPrefs';
import { isOnline, onConnectivityChange } from './offlineMode';

const speak = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = 1;
  window.speechSynthesis.speak(u);
};

const BlindEyeHome: React.FC = () => {
  const navigate = useNavigate();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [online, setOnline] = useState<boolean>(isOnline());

  useEffect(() => {
    // Decide onboarding gate (cached first, then remote refresh)
    const local = getLocalPrefs();
    if (!local.disclaimer_accepted || !local.onboarding_completed) setNeedsOnboarding(true);
    loadRemotePrefs().then((p) => {
      if (p && (!p.disclaimer_accepted || !p.onboarding_completed)) setNeedsOnboarding(true);
      if (p && p.disclaimer_accepted && p.onboarding_completed) setNeedsOnboarding(false);
    }).catch(() => {});

    const off = onConnectivityChange(setOnline);
    const t = setTimeout(() => {
      speak('مرحباً بك في عين الأعمى. اضغط على الزر الكبير لفتح الكاميرا. سأرشدك أولاً لأفضل وضعية للهاتف، ثم أساعدك على المشي بأمان وأتحدث معك في أي وقت.');
    }, 600);
    return () => { clearTimeout(t); off(); };
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    if (needsOnboarding) {
      e.preventDefault();
      navigate('/damij/blind-eye/onboarding');
      return;
    }
    speak('فتح الكاميرا الآن');
    if ('vibrate' in navigator) navigator.vibrate(80);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white px-6 py-8 flex flex-col" dir="rtl">
      <DamijSEO
        title="عين الأعمى — مرشد بصري صوتي | منصة دامج"
        description="عين الأعمى من منصة دامج: مرشد بصري صوتي بالذكاء الاصطناعي للمكفوفين، يصف ما حولك ويرشدك أثناء المشي بأمان عبر كاميرا الهاتف."
        path="/damij/blind-eye"
        keywords="عين الأعمى, مساعد المكفوفين, ملاحة المكفوفين, AI للمكفوفين, منصة دامج عين الأعمى"
      />
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link to="/damij/braille" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-lg">
            <ArrowLeft className="w-6 h-6" /> رجوع
          </Link>
          <Link to="/damij/blind-eye/settings" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm px-3 py-2 rounded-full bg-white/10">
            ⚙ الإعدادات
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 backdrop-blur mb-4">
            <span className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />
            <Eye className="w-20 h-20 relative" />
          </div>
          <h1 className="text-6xl font-black mb-3 tracking-tight">عين الأعمى</h1>
          <p className="text-2xl text-white/85 leading-relaxed">
            مساعدك البصري الذكي للمشي بأمان
          </p>
        </div>

        {/* Single huge action button */}
        <Link
          to="/damij/blind-eye/navigate"
          onClick={handleOpen}
          aria-label="افتح عيني — تشغيل كاميرا الإرشاد والمحادثة الصوتية الدائمة"
          className="relative group block flex-1 min-h-[280px] rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-500 shadow-[0_25px_80px_-20px_rgba(16,185,129,0.6)] active:scale-[0.98] transition-all overflow-hidden"
        >
          <span className="absolute inset-0 rounded-[2.5rem] ring-4 ring-emerald-300/40 animate-pulse pointer-events-none" />
          <div className="relative h-full flex flex-col items-center justify-center p-10">
            <Camera className="w-28 h-28 mb-5 drop-shadow-2xl group-hover:scale-110 transition-transform" />
            <div className="text-5xl font-black tracking-tight mb-3">افتح عيني</div>
            <div className="text-xl text-white/95 text-center max-w-md">
              اضغط لبدء الإرشاد البصري والمحادثة الصوتية
            </div>
          </div>
        </Link>

        {/* Status row: onboarding gate + offline indicator */}
        <div className="flex flex-wrap gap-2 mt-4">
          {needsOnboarding && (
            <Link to="/damij/blind-eye/onboarding" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-100 text-sm">
              <ShieldAlert className="w-4 h-4" /> أكمل الإعداد الأولي قبل البدء
            </Link>
          )}
          {!online && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-100 text-sm">
              ⚠ وضع عدم الاتصال — يعمل التوجيه الأساسي محلياً
            </span>
          )}
        </div>


        {/* Feature badges */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Mic className="w-8 h-8 mx-auto mb-2 text-cyan-300" />
            <div className="text-sm font-bold">محادثة دائمة</div>
            <div className="text-xs text-white/60 mt-1">بدون كبس</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Radio className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
            <div className="text-sm font-bold">معايرة ذكية</div>
            <div className="text-xs text-white/60 mt-1">للوضعية المثلى</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-300" />
            <div className="text-sm font-bold">تحذير تدريجي</div>
            <div className="text-xs text-white/60 mt-1">حسب القرب</div>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/75 text-sm leading-relaxed">
          <strong className="block text-white mb-1">كيف يعمل:</strong>
          عند فتح الكاميرا، سأساعدك أولاً على إيجاد أفضل وضعية للهاتف، ثم أبدأ بمسح ما حولك ومساعدتك على المشي. تستطيع التحدث معي في أي وقت بدون أي زر.
        </div>
      </div>
    </div>
  );
};

export default BlindEyeHome;
