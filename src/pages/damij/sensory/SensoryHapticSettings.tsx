import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Vibrate, Save, Play, Smartphone, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  HapticSettings, HapticIntensity, DEFAULT_HAPTIC_SETTINGS,
  loadHapticSettings, saveHapticSettings, patternFor,
} from './hapticSettings';

const hasVibration = () => typeof navigator !== 'undefined' && 'vibrate' in navigator;
const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const LEVELS: { key: HapticIntensity; label: string; color: string }[] = [
  { key: 'light',  label: 'خفيف',  color: 'bg-emerald-500' },
  { key: 'medium', label: 'متوسط', color: 'bg-amber-500' },
  { key: 'strong', label: 'قوي',   color: 'bg-rose-500' },
];

const KINDS: { key: keyof Omit<HapticSettings, 'intensity'>; title: string; desc: string }[] = [
  { key: 'edgeClick',      title: 'نبضة الحواف', desc: 'الإحساس عند عبور حدود الشكل (تضاريس).' },
  { key: 'textureHum',     title: 'همهمة الملمس', desc: 'الاهتزاز المستمر داخل المنطقة (الملمس).' },
  { key: 'successPattern', title: 'نمط النجاح', desc: 'يُشغَّل عند الوصول للهدف الصحيح.' },
  { key: 'errorPattern',   title: 'نمط الخطأ', desc: 'يُشغَّل عند الذهاب لمكان خاطئ.' },
  { key: 'focusPulse',     title: 'نبضة نقطة التركيز', desc: 'النبض الذي يجذب الانتباه لنقطة مهمة.' },
];

const SensoryHapticSettings: React.FC = () => {
  const [draft, setDraft] = useState<HapticSettings>(DEFAULT_HAPTIC_SETTINGS);
  const vibrate = hasVibration();
  const mobile = isMobile();

  useEffect(() => { setDraft(loadHapticSettings()); }, []);

  const setLevel = (kind: keyof HapticSettings, level: HapticIntensity) =>
    setDraft(d => ({ ...d, [kind]: level }));

  const test = (kind: keyof Omit<HapticSettings, 'intensity'>, level: HapticIntensity) => {
    if (!vibrate) { toast.error('الاهتزاز غير مدعوم على هذا الجهاز'); return; }
    navigator.vibrate(patternFor(kind, level));
  };

  const save = () => { saveHapticSettings(draft); toast.success('تم حفظ إعدادات الاهتزاز'); };
  const reset = () => { setDraft({ ...DEFAULT_HAPTIC_SETTINGS }); toast.info('تمت إعادة الضبط الافتراضي'); };

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-4xl mx-auto" dir="rtl">
      <Link to="/damij/sensory" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 hover:underline">
        <ArrowRight className="w-4 h-4" /> رجوع
      </Link>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 mb-3">
          <Vibrate className="w-4 h-4" /><span className="text-sm font-bold">إعدادات الاهتزاز</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">شدة الاهتزاز وأنماطه</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto text-sm">
          اختر شدّة كل نمط (خفيف / متوسط / قوي) واختبره قبل الحفظ. تُطبَّق هذه الإعدادات على جميع تجارب الجسر الحسّي.
        </p>
        {!mobile && (
          <p className="text-xs text-amber-700 bg-amber-50 inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full">
            <Smartphone className="w-3 h-3" /> الاهتزاز يعمل فقط على الهواتف الداعمة.
          </p>
        )}
      </div>

      {/* Global intensity */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <p className="font-bold mb-1">الشدّة العامة</p>
        <p className="text-xs text-gray-500 mb-3">تذكير مرجعي للمستخدم — كل نمط أدناه يمكن ضبطه بشكل مستقل.</p>
        <div className="flex gap-2">
          {LEVELS.map(L => (
            <button key={L.key} onClick={() => setLevel('intensity', L.key)}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white transition ${L.color} ${draft.intensity === L.key ? 'ring-4 ring-offset-1 ring-black/20' : 'opacity-60'}`}>
              {L.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per-pattern */}
      <div className="space-y-3">
        {KINDS.map(K => (
          <div key={K.key} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-bold">{K.title}</p>
                <p className="text-xs text-gray-500">{K.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(L => {
                const active = draft[K.key] === L.key;
                return (
                  <div key={L.key} className={`rounded-xl border p-2 ${active ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                    <button onClick={() => setLevel(K.key, L.key)}
                      className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold text-white mb-2 ${L.color}`}>
                      {L.label} {active && '✓'}
                    </button>
                    <button onClick={() => test(K.key, L.key)} disabled={!vibrate}
                      className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 text-xs disabled:opacity-50">
                      <Play className="w-3 h-3" /> اختبار
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-3 mt-6 flex gap-2">
        <button onClick={save} className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold inline-flex items-center justify-center gap-2 shadow-lg">
          <Save className="w-4 h-4" /> حفظ الإعدادات
        </button>
        <button onClick={reset} className="px-4 py-3 rounded-2xl bg-white border border-gray-300 inline-flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> افتراضي
        </button>
      </div>
    </div>
  );
};

export default SensoryHapticSettings;
