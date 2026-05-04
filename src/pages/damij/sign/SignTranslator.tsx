import React, { useState } from 'react';
import { Camera, Type, Volume2, Hand } from 'lucide-react';
import PlaceholderPanel from '@/components/damij/PlaceholderPanel';

const langs = ['العربية', 'English', 'Français', 'Español', 'Deutsch', 'اردو', '中文', 'हिन्दी', 'Русский', 'Türkçe'];
const signSystems = ['ArSL — العربية الموحّدة', 'ASL — الأمريكية', 'BSL — البريطانية', 'LSF — الفرنسية', 'DGS — الألمانية', 'PSL — الباكستانية'];

const SignTranslator: React.FC = () => {
  const [mode, setMode] = useState<'sign2text' | 'text2sign'>('sign2text');
  const [text, setText] = useState('');
  return (
    <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-6">المترجم الفوري للغة الإشارة</h1>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('sign2text')} className={`px-5 py-3 rounded-xl font-bold transition-all ${mode === 'sign2text' ? 'bg-[hsl(var(--damij-primary))] text-white shadow-lg' : 'bg-[hsl(var(--damij-surface))] text-[hsl(var(--damij-primary))]'}`}>
          <Hand className="inline w-5 h-5 ml-2" /> إشارة ⟶ نص/صوت
        </button>
        <button onClick={() => setMode('text2sign')} className={`px-5 py-3 rounded-xl font-bold transition-all ${mode === 'text2sign' ? 'bg-[hsl(var(--damij-primary))] text-white shadow-lg' : 'bg-[hsl(var(--damij-surface))] text-[hsl(var(--damij-primary))]'}`}>
          <Type className="inline w-5 h-5 ml-2" /> نص/صوت ⟶ إشارة
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select className="p-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/20 bg-white">
          <option>اختر نظام الإشارة</option>
          {signSystems.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="p-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/20 bg-white">
          <option>اختر اللغة المنطوقة</option>
          {langs.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {mode === 'sign2text' ? (
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-[hsl(var(--damij-primary))]/10 to-[hsl(var(--damij-accent-2))]/10 border-2 border-dashed border-[hsl(var(--damij-primary))]/30 flex flex-col items-center justify-center mb-6">
          <Camera className="w-16 h-16 text-[hsl(var(--damij-primary))] mb-3" />
          <button className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold">تشغيل الكاميرا</button>
          <p className="text-sm text-[hsl(var(--damij-text))]/60 mt-3">سيظهر النص المُترجم هنا فوراً</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="اكتب جملة لتحويلها إلى لغة الإشارة..." className="w-full p-4 rounded-2xl border-2 border-[hsl(var(--damij-primary))]/20 bg-white text-lg" />
          <div className="flex gap-3">
            <button className="px-5 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold"><Hand className="inline w-5 h-5 ml-2" />عرض الأفاتار</button>
            <button className="px-5 py-3 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white font-bold"><Volume2 className="inline w-5 h-5 ml-2" />نطق الجملة</button>
          </div>
        </div>
      )}

      <PlaceholderPanel description="محرّك التعرّف العصبي MediaPipe Holistic + مصنّف الإيماءات سيتم ربطه بمرحلة لاحقة. الواجهة جاهزة." />
    </div>
  );
};
export default SignTranslator;
