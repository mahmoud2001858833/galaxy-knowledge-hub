import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Sun, Moon, Eye, Type as TypeIcon, Gauge, Palette, Zap, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PROFILE_KEY, type SensoryProfile } from './SensoryProfileSetup';
import {
  loadAdaptive, saveAdaptive, deriveFromProfile, applyAdaptive,
  readAmbientLux, type AdaptiveSettings,
} from './adaptiveUI';

const CB_OPTS: { v: AdaptiveSettings['colorBlindFilter']; t: string; d: string }[] = [
  { v: 'none', t: 'بدون فلتر', d: 'ألوان طبيعية' },
  { v: 'protanopia', t: 'بروتانوبيا', d: 'ضعف الإحساس بالأحمر' },
  { v: 'deuteranopia', t: 'ديوترانوبيا', d: 'ضعف الإحساس بالأخضر (الأشيع)' },
  { v: 'tritanopia', t: 'تريتانوبيا', d: 'ضعف الإحساس بالأزرق' },
  { v: 'achromatopsia', t: 'أحادية اللون', d: 'تدرّجات رمادية فقط' },
];

const CONTRAST_OPTS: { v: AdaptiveSettings['contrast']; t: string }[] = [
  { v: 'normal', t: 'عادي' }, { v: 'high', t: 'عالٍ' }, { v: 'ultra', t: 'فائق' },
];

const DENSITY_OPTS: { v: AdaptiveSettings['density']; t: string; d: string }[] = [
  { v: 'comfortable', t: 'مريح', d: 'حركات ومحفّزات بصرية كاملة' },
  { v: 'compact', t: 'متّزن', d: 'حركات أقل، مسافات أصغر' },
  { v: 'minimal', t: 'هادئ', d: 'بدون حركات — تركيز كامل على المحتوى' },
];

const SensoryAdaptiveUI: React.FC = () => {
  const [profile, setProfile] = useState<SensoryProfile | null>(null);
  const [settings, setSettings] = useState<AdaptiveSettings>(() => loadAdaptive());
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  const update = (patch: Partial<AdaptiveSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (previewing) applyAdaptive(next);
  };

  const autoFromProfile = async () => {
    if (!profile) {
      toast.error('لا يوجد ملف حسّي محفوظ — أنشئه أولاً');
      return;
    }
    const lux = await readAmbientLux();
    const next = deriveFromProfile(profile, lux);
    setSettings(next);
    applyAdaptive(next);
    setPreviewing(true);
    toast.success(lux != null
      ? `تم التكييف تلقائياً (إضاءة محيطية: ${Math.round(lux)} لكس)`
      : 'تم التكييف تلقائياً بناءً على ملفك الحسّي');
  };

  const togglePreview = () => {
    if (previewing) {
      // revert: re-apply saved
      applyAdaptive(loadAdaptive());
      setPreviewing(false);
    } else {
      applyAdaptive(settings);
      setPreviewing(true);
    }
  };

  const persist = () => {
    saveAdaptive(settings);
    applyAdaptive(settings);
    setPreviewing(false);
    toast.success('تم حفظ إعدادات الواجهة التكيّفية');
  };

  const isNight = useMemo(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6;
  }, []);

  const Card: React.FC<React.PropsWithChildren<{ icon: any; title: string; subtitle?: string }>> = ({ icon: Icon, title, subtitle, children }) => (
    <section className="bg-white rounded-3xl p-5 shadow-lg border border-[hsl(var(--damij-primary))]/10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
            <Icon className="w-5 h-5" /> {title}
          </h2>
          {subtitle && <p className="text-xs text-[hsl(var(--damij-text))]/60 mt-1">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );

  return (
    <div className="px-6 pt-12 pb-20 max-w-4xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-3">
          <Sparkles className="w-4 h-4" /><span className="text-sm font-bold">تكيّف لحظي مع المستخدم والبيئة</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">الواجهة التكيّفية الذكية</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          تُغيّر الألوان، الأحجام، سرعة العرض، وكثافة المحفّزات تلقائياً بحسب ملفك الحسّي وحالتك اللحظية (وقت اليوم، الإضاءة المحيطة).
        </p>
      </div>

      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-[hsl(var(--damij-primary))]/15 flex flex-wrap items-center gap-3 justify-between">
        <div className="text-sm">
          <span className="font-bold text-[hsl(var(--damij-primary))]">الحالة الحالية:</span>{' '}
          <span className="inline-flex items-center gap-1 mx-1">
            {isNight ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}
            {isNight ? 'وقت ليلي' : 'وقت نهاري'}
          </span>
          {settings.ambientLux != null && <span> · إضاءة ≈ {Math.round(settings.ambientLux)} لكس</span>}
          {profile ? <span> · ملف حسّي محمّل ✓</span> : <span className="text-red-600"> · لا يوجد ملف حسّي</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={autoFromProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold shadow hover:shadow-lg">
            <RefreshCw className="w-4 h-4"/> تكييف تلقائي الآن
          </button>
          <button onClick={togglePreview}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${previewing
              ? 'bg-amber-100 border-amber-400 text-amber-900'
              : 'bg-white border-[hsl(var(--damij-primary))]/20 text-[hsl(var(--damij-primary))]'}`}>
            <Eye className="w-4 h-4"/> {previewing ? 'إيقاف المعاينة' : 'معاينة فورية'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <Card icon={Palette} title="١. تغيير الألوان (عمى الألوان + الإضاءة المحيطة)">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {CB_OPTS.map(o => {
              const sel = settings.colorBlindFilter === o.v;
              return (
                <button key={o.v} onClick={() => update({ colorBlindFilter: o.v })}
                  className={`text-right p-3 rounded-xl border-2 transition-all ${sel
                    ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]'
                    : 'bg-[hsl(var(--damij-surface))] border-transparent hover:border-[hsl(var(--damij-primary))]/30'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{o.t}</span>
                    {sel && <CheckCircle2 className="w-4 h-4"/>}
                  </div>
                  <p className={`text-xs mt-1 ${sel ? 'text-white/85' : 'text-[hsl(var(--damij-text))]/65'}`}>{o.d}</p>
                </button>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--damij-surface))] cursor-pointer">
              <input type="checkbox" checked={settings.autoNightByTime} onChange={e => update({ autoNightByTime: e.target.checked })}
                className="w-5 h-5 accent-[hsl(var(--damij-primary))]"/>
              <span className="text-sm font-semibold">وضع ليلي تلقائي حسب الوقت (19:00 → 06:00)</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--damij-surface))] cursor-pointer">
              <input type="checkbox" checked={settings.autoNightByLight} onChange={e => update({ autoNightByLight: e.target.checked })}
                className="w-5 h-5 accent-[hsl(var(--damij-primary))]"/>
              <span className="text-sm font-semibold">وضع ليلي تلقائي حسب الإضاءة المحيطة</span>
            </label>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[hsl(var(--damij-text))]/70 mb-1">شدّة التباين</p>
            <div className="flex gap-2">
              {CONTRAST_OPTS.map(o => (
                <button key={o.v} onClick={() => update({ contrast: o.v })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${settings.contrast === o.v
                    ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]'
                    : 'bg-white border-[hsl(var(--damij-primary))]/20'}`}>{o.t}</button>
              ))}
            </div>
          </div>
        </Card>

        <Card icon={TypeIcon} title="٢. تغيير الأحجام (تكبير تلقائي لضعف البصر)">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--damij-surface))] cursor-pointer mb-3">
            <input type="checkbox" checked={settings.autoBoostSize} onChange={e => update({ autoBoostSize: e.target.checked })}
              className="w-5 h-5 accent-[hsl(var(--damij-primary))]"/>
            <span className="text-sm font-semibold">تكبير الخطوط تلقائياً عند ضعف البصر دون طلب من المستخدم</span>
          </label>
          <div>
            <p className="text-xs font-bold text-[hsl(var(--damij-text))]/70 mb-2">معامل التكبير: × {settings.scale.toFixed(2)}</p>
            <input type="range" min={1} max={1.6} step={0.05} value={settings.scale}
              onChange={e => update({ scale: parseFloat(e.target.value) })}
              className="w-full accent-[hsl(var(--damij-primary))]"/>
            <div className="flex justify-between text-xs text-[hsl(var(--damij-text))]/60 mt-1">
              <span>عادي</span><span>متوسط</span><span>كبير</span><span>كبير جداً</span>
            </div>
          </div>
        </Card>

        <Card icon={Zap} title="٣. سرعة العرض وكثافة المحفّزات (تشتت الانتباه)">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--damij-surface))] cursor-pointer mb-3">
            <input type="checkbox" checked={settings.reduceMotion} onChange={e => update({ reduceMotion: e.target.checked })}
              className="w-5 h-5 accent-[hsl(var(--damij-primary))]"/>
            <span className="text-sm font-semibold">تقليل الحركات والـAnimations عند تشتت الانتباه</span>
          </label>
          <div className="grid sm:grid-cols-3 gap-2">
            {DENSITY_OPTS.map(o => {
              const sel = settings.density === o.v;
              return (
                <button key={o.v} onClick={() => update({ density: o.v })}
                  className={`text-right p-3 rounded-xl border-2 ${sel
                    ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]'
                    : 'bg-white border-[hsl(var(--damij-primary))]/20'}`}>
                  <div className="font-bold text-sm">{o.t}</div>
                  <div className={`text-xs mt-1 ${sel ? 'text-white/85' : 'text-[hsl(var(--damij-text))]/65'}`}>{o.d}</div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card icon={Gauge} title="٤. التشغيل العام">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--damij-surface))] cursor-pointer">
            <input type="checkbox" checked={settings.enabled} onChange={e => update({ enabled: e.target.checked })}
              className="w-5 h-5 accent-[hsl(var(--damij-primary))]"/>
            <span className="text-sm font-semibold">تفعيل الواجهة التكيّفية على كامل المنصّة</span>
          </label>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <button onClick={persist}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold text-lg shadow-xl hover:shadow-2xl">
          <Save className="w-5 h-5"/> حفظ وتطبيق على المنصّة
        </button>
        <p className="text-xs text-[hsl(var(--damij-text))]/50 mt-3">
          تُحفظ الإعدادات محلياً ويُعاد تطبيقها تلقائياً عند فتح المنصّة، مع تحديث دوري كل 10 دقائق وفق الإضاءة ووقت اليوم.
        </p>
      </div>
    </div>
  );
};

export default SensoryAdaptiveUI;
