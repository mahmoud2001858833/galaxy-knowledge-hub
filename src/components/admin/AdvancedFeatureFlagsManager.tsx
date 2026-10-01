import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Wifi, 
  Volume2, 
  MessageSquare, 
  Calculator, 
  Gamepad2, 
  ShieldAlert, 
  Save, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  GraduationCap,
  HardDrive,
  Users2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { auditLogger } from '@/services/auditLogger';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'performance' | 'community' | 'security' | 'pedagogy';
  enabled: boolean;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresRestart?: boolean;
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    id: 'ai_streaming',
    name: 'البث التدريجي الفوري للذكاء الاصطناعي (AI Streaming)',
    description: 'إخراج إجابات الذكاء الاصطناعي كلمة بكلمة في الوقت الفعلي بدلاً من الانتظار.',
    category: 'ai',
    enabled: true,
    impactLevel: 'medium'
  },
  {
    id: 'webgl_high_res',
    name: 'محرك الرسوميات فائق الدقة (60 FPS WebGL / Three.js Shaders)',
    description: 'تفعيل الإضاءة الحجمية وتظليل الجسيمات المتقدم في محاكيات الفيزياء والكيمياء والفلك.',
    category: 'performance',
    enabled: true,
    impactLevel: 'high'
  },
  {
    id: 'voice_narration',
    name: 'محرك القراءة الصوتية الاصطناعي (Neural Audio & TTS)',
    description: 'توليد النطق الصوتي للدروس والمصطلحات ودعم ذوي الإعاقة البصرية وصعوبات القراءة.',
    category: 'ai',
    enabled: true,
    impactLevel: 'medium'
  },
  {
    id: 'student_p2p_chat',
    name: 'مجتمع وتفاعل الطلاب المباشر (Student Peer Forum & Chat)',
    description: 'السماح للطلبة بإنشاء نقاشات جماعية ومشاركة الاستنتاجات العلمية وحلول المسائل.',
    category: 'community',
    enabled: true,
    impactLevel: 'medium'
  },
  {
    id: 'quantum_calculator_ai',
    name: 'الآلة الحاسبة الرياضية الكمية المعززة بالذكاء الاصطناعي',
    description: 'دمج التحليل الرياضي الذكي والتفاضل التلقائي ورسم المنحنيات ثلاثية الأبعاد.',
    category: 'pedagogy',
    enabled: true,
    impactLevel: 'low'
  },
  {
    id: 'gamification_multiplier',
    name: 'مضاعف نقاط التلعيب والأوسمة (2X XP & Rewards Multiplier)',
    description: 'مضاعفة نقاط الخبرة والتنافس عند حل الألغاز وتجارب المختبر لتحفيز المشاركة.',
    category: 'pedagogy',
    enabled: false,
    impactLevel: 'low'
  },
  {
    id: 'strict_safesearch',
    name: 'الفلتر الرقابي والأخلاقي الحازم (Strict Safety Guardrails)',
    description: 'حظر فوري لأي محتوى مسيء أو محاولات حقن أوامات وهمية (Prompt Injection).',
    category: 'security',
    enabled: true,
    impactLevel: 'critical'
  },
  {
    id: 'low_bandwidth_eco',
    name: 'نمط التوفير للاتصالات الضعيفة (Low-Bandwidth Eco Mode)',
    description: 'ضغط الصور والأصول ثلاثية الأبعاد لضمان عمل المنصة بسلاسة في المناطق النائية.',
    category: 'performance',
    enabled: false,
    impactLevel: 'high'
  },
  {
    id: 'btec_vocational_paths',
    name: 'مسارات التعليم المهني والتطبيقي BTEC المتقدمة',
    description: 'عرض وحدات ومشاريع المسارات التقنية المتوافقة مع معايير بيرسون المعتمدة.',
    category: 'pedagogy',
    enabled: true,
    impactLevel: 'medium'
  },
  {
    id: 'offline_pwa_sync',
    name: 'التخزين والمزامنة بدون اتصال بالإنترنت (Offline PWA Sync)',
    description: 'تمكين تنزيل الدروس والمحاكيات مسبقاً لمراجعتها في غياب شبكة الإنترنت.',
    category: 'performance',
    enabled: true,
    impactLevel: 'high'
  },
  {
    id: 'faculty_collaboration',
    name: 'استوديو التحرير التشاركي للكوادر التعليمية (Live Co-Authoring)',
    description: 'تمكين المعلمين والمشرفين من تعديل أوراق العمل والاختبارات في جلسة متزامنة.',
    category: 'community',
    enabled: true,
    impactLevel: 'medium'
  },
  {
    id: 'emergency_maintenance',
    name: 'وضع الصيانة المؤقت والإغلاق الاحترازي (Platform Lockdown)',
    description: 'تحويل المنصة لوضع القراءة فقط مع شريط إشعاري تنبيهي أثناء التحديثات الجوهرية.',
    category: 'security',
    enabled: false,
    impactLevel: 'critical',
    requiresRestart: true
  }
];

export const AdvancedFeatureFlagsManager: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(() => {
    try {
      const saved = localStorage.getItem('galaxy_platform_feature_flags_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FLAGS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Toggle single flag
  const handleToggle = (flagId: string) => {
    setFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        return { ...f, enabled: !f.enabled };
      }
      return f;
    }));
    setHasUnsavedChanges(true);
  };

  // Save changes and broadcast
  const handleSave = () => {
    try {
      localStorage.setItem('galaxy_platform_feature_flags_v1', JSON.stringify(flags));
      window.dispatchEvent(new CustomEvent('galaxy_feature_flags_updated', { detail: flags }));
      setHasUnsavedChanges(false);
      toast.success('تم حفظ وتطبيق رايات الميزات الحية بنجاح على كافة الأنظمة!');

      auditLogger.record({
        action: 'CONFIG_CHANGE',
        module: 'محرك الرايات والميزات البرمجية (Feature Flags)',
        description: 'تحديث مصفوفة إعدادات ومفاتيح تشغيل الميزات البرمجية بالمنصة',
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });
    } catch {
      toast.error('فشل في حفظ إعدادات الميزات');
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setFlags(DEFAULT_FLAGS);
    setHasUnsavedChanges(true);
    toast.info('تمت استعادة الإعدادات المصنعية الافتراضية للرايات، اضغط حفظ للتأكيد');
  };

  // Preset Profiles
  const applyPreset = (presetName: 'exam' | 'performance' | 'eco' | 'balanced') => {
    let updated = [...flags];
    if (presetName === 'exam') {
      updated = updated.map(f => {
        if (f.id === 'student_p2p_chat') return { ...f, enabled: false };
        if (f.id === 'gamification_multiplier') return { ...f, enabled: false };
        if (f.id === 'strict_safesearch') return { ...f, enabled: true };
        if (f.id === 'quantum_calculator_ai') return { ...f, enabled: true };
        return f;
      });
      toast.success('تم تجهيز المنصة بـ "نمط الامتحانات الرسمية الموثوق"');
    } else if (presetName === 'performance') {
      updated = updated.map(f => {
        if (f.id === 'webgl_high_res') return { ...f, enabled: true };
        if (f.id === 'ai_streaming') return { ...f, enabled: true };
        if (f.id === 'voice_narration') return { ...f, enabled: true };
        if (f.id === 'low_bandwidth_eco') return { ...f, enabled: false };
        return f;
      });
      toast.success('تم تفعيل "نمط الأداء والانغماس الأقصى (Max Immersion)"');
    } else if (presetName === 'eco') {
      updated = updated.map(f => {
        if (f.id === 'webgl_high_res') return { ...f, enabled: false };
        if (f.id === 'low_bandwidth_eco') return { ...f, enabled: true };
        if (f.id === 'voice_narration') return { ...f, enabled: false };
        return f;
      });
      toast.success('تم تفعيل "نمط التوفير للمناطق ذات الاتصال المحدود"');
    } else {
      updated = DEFAULT_FLAGS;
      toast.success('تم تجهيز "النمط الافتراضي المتوازن الشامل"');
    }

    setFlags(updated);
    setHasUnsavedChanges(true);
  };

  const filteredFlags = flags.filter(f => activeCategory === 'all' || f.category === activeCategory);
  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>محرك التوجيه والرايات الحية (Live Feature Flags Engine)</span>
          </div>
          <h2 className="text-2xl font-black text-white">إدارة وضبط الميزات البرمجية الحية للمنصة</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            تحكم فوري بميزات المنصة دون الحاجة لإعادة نشر الكود أو مقاطعة تجربة الطلاب.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 animate-pulse">
              يوجد تعديلات غير محفوظة
            </Badge>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasUnsavedChanges}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            حفظ ونشر التعديلات
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline" 
            size="sm" 
            className="border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 rounded-xl text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-3">
          الأنماط التشغيلية الجاهزة (Quick Operational Profiles)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => applyPreset('exam')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-right transition-all group"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>نمط الامتحانات الرسمية</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إغلاق غرف الدردشة، تفعيل الفلتر الصارم، وتثبيت الآلة الحاسبة.
            </p>
          </button>

          <button
            onClick={() => applyPreset('performance')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 text-right transition-all group"
          >
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-1">
              <Zap className="w-4 h-4" />
              <span>نمط الأداء والانغماس الأقصى</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              تفعيل رسوميات 60fps، البث اللحظي للذكاء، والمساعدات الصوتية.
            </p>
          </button>

          <button
            onClick={() => applyPreset('eco')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-right transition-all group"
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
              <Wifi className="w-4 h-4" />
              <span>نمط التوفير والاتصال المحدود</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              تقليل استهلاك البيانات بنسبة 70% وتخفيف ضغط الأجهزة الضعيفة.
            </p>
          </button>

          <button
            onClick={() => applyPreset('balanced')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50 dark:bg-slate-800/40 text-right transition-all group"
          >
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>النمط الافتراضي المتوازن</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إعادة ضبط كافة الميزات لتوازن مثالي بين الأداء والوظائف.
            </p>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'all', label: `الكل (${flags.length})` },
            { id: 'ai', label: 'الذكاء الاصطناعي' },
            { id: 'performance', label: 'الأداء والرسوميات' },
            { id: 'security', label: 'الأمان والرقابة' },
            { id: 'community', label: 'المجتمع والكوادر' },
            { id: 'pedagogy', label: 'التعليم والتلعيب' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          الميزات المفعلة: <span className="font-bold text-emerald-600 font-mono">{enabledCount}</span> من <span className="font-mono">{flags.length}</span>
        </div>
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map((flag) => {
          return (
            <div
              key={flag.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                flag.enabled 
                  ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${flag.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{flag.name}</h4>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-lg ${
                      flag.impactLevel === 'critical' ? 'text-rose-600 border-rose-200 dark:border-rose-800' :
                      flag.impactLevel === 'high' ? 'text-amber-600 border-amber-200 dark:border-amber-800' :
                      'text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    أثر: {flag.impactLevel}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
                  {flag.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">ID: {flag.id}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={flag.enabled}
                  onClick={() => handleToggle(flag.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    flag.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      flag.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedFeatureFlagsManager;
