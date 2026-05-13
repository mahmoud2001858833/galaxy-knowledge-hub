import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Camera, MapPin, ArrowLeft } from 'lucide-react';

const speak = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = 1;
  window.speechSynthesis.speak(u);
};

const BlindEyeHome: React.FC = () => {
  useEffect(() => {
    const t = setTimeout(() => {
      speak('مرحباً بك في عين الأعمى. اضغط في أي مكان لفتح الكاميرا، أو اضغط على زر الذهاب إلى مكان لاختيار وجهة.');
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white px-6 py-10" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <Link to="/damij/braille" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" /> رجوع
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur mb-6">
            <Eye className="w-14 h-14" />
          </div>
          <h1 className="text-5xl font-extrabold mb-3">عين الأعمى</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            مساعدك البصري الذكي — افتح الكاميرا وسأرشدك صوتياً في طريقك.
          </p>
        </div>

        <div className="grid gap-5">
          <Link
            to="/damij/blind-eye/navigate"
            onClick={() => speak('فتح الكاميرا الآن')}
            aria-label="افتح عيني — تشغيل كاميرا الإرشاد"
            className="group block p-10 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-2xl active:scale-95 transition-all"
          >
            <Camera className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-extrabold text-center">افتح عيني</div>
            <div className="text-center text-white/90 mt-2 text-lg">سأصف لك ما أمامك وأرشدك صوتياً</div>
          </Link>

          <Link
            to="/damij/blind-eye/navigate?mode=destination"
            onClick={() => speak('وضع الذهاب إلى مكان')}
            aria-label="اذهب إلى مكان — ملاحة بالموقع"
            className="group block p-8 rounded-3xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 active:scale-95 transition-all"
          >
            <MapPin className="w-14 h-14 mx-auto mb-3" />
            <div className="text-2xl font-bold text-center">اذهب إلى مكان</div>
            <div className="text-center text-white/80 mt-1">أدخل وجهتك وسأرشدك إليها</div>
          </Link>
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-sm leading-relaxed">
          <strong className="block text-white mb-2">نصائح للاستخدام:</strong>
          • أمسك الهاتف عمودياً والكاميرا الخلفية للأمام في مستوى الصدر.<br/>
          • سأعطيك تعليمات قصيرة كل ٢-٣ ثوانٍ.<br/>
          • قل "توقف" لإيقاف الإرشاد، أو "أكمل" لاستئنافه.
        </div>
      </div>
    </div>
  );
};

export default BlindEyeHome;
