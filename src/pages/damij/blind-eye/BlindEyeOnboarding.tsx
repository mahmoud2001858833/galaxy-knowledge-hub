import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Footprints, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';
import { getLocalPrefs, saveRemotePrefs, type WalkingSpeed, type PreferredEar, type DetailLevel } from './userPrefs';
import { toast } from 'sonner';

const speak = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  window.speechSynthesis.speak(u);
};

type Step = 'disclaimer' | 'speed' | 'ear' | 'detail' | 'done';

const BlindEyeOnboarding: React.FC = () => {
  const initial = getLocalPrefs();
  const [step, setStep] = useState<Step>(initial.disclaimer_accepted ? 'speed' : 'disclaimer');
  const [speed, setSpeed] = useState<WalkingSpeed>(initial.walking_speed);
  const [ear, setEar] = useState<PreferredEar>(initial.preferred_ear);
  const [detail, setDetail] = useState<DetailLevel>(initial.detail_level);
  const nav = useNavigate();

  const accept = async () => {
    await saveRemotePrefs({ disclaimer_accepted: true });
    setStep('speed');
    speak('تم القبول. الآن نختار سرعة المشي المعتادة.');
  };

  const finish = async () => {
    try {
      await saveRemotePrefs({
        walking_speed: speed, preferred_ear: ear, detail_level: detail,
        onboarding_completed: true,
      });
      toast.success('تم حفظ التفضيلات');
      speak('تم الإعداد. جاهز للاستخدام.');
      nav('/damij/blind-eye');
    } catch (e: any) {
      toast.error('تعذر الحفظ، تم الاحتفاظ محلياً.');
      nav('/damij/blind-eye');
    }
  };

  const Btn = ({ active, label, onClick }: any) => (
    <button onClick={onClick}
      className={`px-6 py-5 rounded-2xl text-2xl font-bold transition-all border-2 ${
        active ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
      }`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white px-6 py-10" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black mb-2">إعداد عين الأعمى</h1>
        <p className="text-white/60 mb-8">نخصّص التجربة لك لتعمل بأمان وكفاءة.</p>

        {step === 'disclaimer' && (
          <section className="rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 p-6">
            <ShieldAlert className="w-14 h-14 text-amber-300 mb-3" />
            <h2 className="text-2xl font-bold mb-3">تنبيه مهم</h2>
            <p className="text-lg text-white/90 leading-relaxed mb-4">
              هذا التطبيق <strong>مساعد ذكي</strong> ولا يغني عن استخدام <strong>العصا البيضاء</strong> أو
              <strong> الكلب المرشد</strong>. الذكاء الاصطناعي قد يخطئ في بعض الأحيان — استخدم بحذر
              ولا تعتمد عليه وحده عند عبور الشوارع أو الأماكن الخطرة.
            </p>
            <button onClick={accept}
              className="w-full px-6 py-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-2xl font-black flex items-center justify-center gap-3">
              <CheckCircle2 className="w-7 h-7" /> فهمت وأقبل
            </button>
            <Link to="/damij/blind-eye" className="block text-center mt-3 text-white/60 hover:text-white">عودة</Link>
          </section>
        )}

        {step === 'speed' && (
          <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <Footprints className="w-12 h-12 text-cyan-300 mb-3" />
            <h2 className="text-2xl font-bold mb-4">ما سرعتك المعتادة في المشي؟</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Btn active={speed==='slow'} label="بطيء" onClick={() => setSpeed('slow')} />
              <Btn active={speed==='normal'} label="عادي" onClick={() => setSpeed('normal')} />
              <Btn active={speed==='fast'} label="سريع" onClick={() => setSpeed('fast')} />
            </div>
            <button onClick={() => setStep('ear')} className="w-full px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xl font-bold">التالي</button>
          </section>
        )}

        {step === 'ear' && (
          <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <Headphones className="w-12 h-12 text-cyan-300 mb-3" />
            <h2 className="text-2xl font-bold mb-4">أي أذن تفضّل للسماعة؟</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Btn active={ear==='left'} label="اليسرى" onClick={() => setEar('left')} />
              <Btn active={ear==='both'} label="كلاهما" onClick={() => setEar('both')} />
              <Btn active={ear==='right'} label="اليمنى" onClick={() => setEar('right')} />
            </div>
            <button onClick={() => setStep('detail')} className="w-full px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xl font-bold">التالي</button>
          </section>
        )}

        {step === 'detail' && (
          <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <Sparkles className="w-12 h-12 text-cyan-300 mb-3" />
            <h2 className="text-2xl font-bold mb-4">كم تفصيلاً تريد في الإرشاد؟</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Btn active={detail==='minimal'} label="الحد الأدنى" onClick={() => setDetail('minimal')} />
              <Btn active={detail==='balanced'} label="متوازن" onClick={() => setDetail('balanced')} />
              <Btn active={detail==='detailed'} label="مفصّل" onClick={() => setDetail('detailed')} />
            </div>
            <button onClick={finish} className="w-full px-6 py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-2xl font-bold">إنهاء وحفظ</button>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlindEyeOnboarding;
