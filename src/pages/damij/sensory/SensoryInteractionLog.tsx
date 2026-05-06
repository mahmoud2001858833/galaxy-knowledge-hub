import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Wrench, Keyboard, RefreshCw, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { readLog, resetLog, type InteractionLog, type InteractionToolKey } from './interactionLog';

const TOOL_LABELS: Record<string, string> = {
  tts: 'النطق الصوتي', stt: 'تحويل الصوت لنص', braille: 'بريل',
  sign: 'لغة الإشارة', haptic: 'الاهتزاز التفاعلي', tactile_print: 'الطباعة اللمسية',
  image_analyze: 'تحليل الصور', simplify: 'التبسيط اللغوي',
  zoom: 'التكبير', pause: 'إيقاف مؤقت', replay: 'إعادة',
};

const FATIGUE_LABELS: Record<string, string> = {
  misclicks: 'نقرات خاطئة متتالية', rapid_back: 'تنقّل متكرر للخلف',
  long_idle: 'خمول طويل', manual: 'تسجيل يدوي',
};

const fmtTime = (iso: string) => new Date(iso).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

const SensoryInteractionLog: React.FC = () => {
  const [log, setLog] = useState<InteractionLog>(readLog());
  const refresh = () => setLog(readLog());

  useEffect(() => { const t = setInterval(refresh, 5000); return () => clearInterval(t); }, []);

  const topTools = useMemo(() =>
    Object.values(log.toolUsage).sort((a, b) => b.count - a.count).slice(0, 8), [log]);
  const last24Fatigue = useMemo(() =>
    log.fatigueEvents.filter(e => Date.now() - new Date(e.at).getTime() < 86400000), [log]);
  const topShortcuts = useMemo(() => {
    const counts: Record<string, number> = {};
    log.shortcuts.forEach(s => { counts[s.key] = (counts[s.key] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [log]);

  const recommendation = useMemo(() => {
    if (last24Fatigue.length >= 3)
      return 'لاحظنا علامات إجهاد متعدّدة اليوم — جرّب تفعيل الوضع المبسّط أو خفض سرعة العرض من الملف الحسّي.';
    if (topTools[0]?.count >= 10)
      return `أداة "${TOOL_LABELS[topTools[0].tool] || topTools[0].tool}" هي المفضّلة لديك — تم تثبيتها في الأعلى.`;
    return 'استمرّ في الاستخدام، النظام يتعلّم من تفاعلك ليخصّص التجربة تلقائياً.';
  }, [last24Fatigue, topTools]);

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-5xl mx-auto" dir="rtl">
      <Link to="/damij/sensory" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 hover:underline">
        <ArrowRight className="w-4 h-4" /> رجوع
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-3">
          <Activity className="w-4 h-4" /><span className="text-sm font-bold">القسم الرابع · سجل التفاعل (التعلم المستمر)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">سجل تفاعلك مع المنصّة</h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          النظام يتعلّم من استخدامك تلقائياً ويسجّل الأدوات المفضّلة، علامات الإجهاد، والاختصارات لتقديم تجربة مخصّصة بشكل متطوّر.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border-r-4 border-blue-500">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Clock className="w-4 h-4"/> الجلسات</div>
          <div className="text-3xl font-extrabold text-blue-600">{log.totalSessions}</div>
          <div className="text-xs text-gray-400 mt-1">آخر جلسة: {fmtTime(log.lastSessionAt)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-r-4 border-emerald-500">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><TrendingUp className="w-4 h-4"/> أدوات مستخدمة</div>
          <div className="text-3xl font-extrabold text-emerald-600">{Object.keys(log.toolUsage).length}</div>
          <div className="text-xs text-gray-400 mt-1">من أصل {Object.keys(TOOL_LABELS).length} أداة</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-r-4 border-orange-500">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><AlertTriangle className="w-4 h-4"/> علامات إجهاد (24س)</div>
          <div className="text-3xl font-extrabold text-orange-600">{last24Fatigue.length}</div>
          <div className="text-xs text-gray-400 mt-1">{last24Fatigue.length >= 3 ? 'يُنصح بأخذ استراحة' : 'الوضع طبيعي'}</div>
        </div>
      </div>

      <div className="bg-gradient-to-l from-purple-50 to-blue-50 rounded-2xl p-5 mb-6 border border-purple-200">
        <p className="font-bold text-purple-700 mb-1">💡 توصية النظام الذكي</p>
        <p className="text-sm text-gray-700">{recommendation}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top tools */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Wrench className="w-5 h-5 text-blue-600"/> الأدوات الأكثر استخداماً</h2>
          {topTools.length === 0 ? (
            <p className="text-sm text-gray-500">لم يتم تسجيل أي استخدام بعد. جرّب أدوات الجسر الحسّي.</p>
          ) : (
            <ul className="space-y-2">
              {topTools.map((t, i) => {
                const max = topTools[0].count;
                return (
                  <li key={t.tool} className="flex items-center gap-3">
                    <span className="text-xs w-5 text-gray-400">{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{TOOL_LABELS[t.tool] || t.tool}</span><span className="text-blue-600">{t.count}×</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(t.count/max)*100}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Fatigue events */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-600"/> سجل علامات الإجهاد</h2>
          {log.fatigueEvents.length === 0 ? (
            <p className="text-sm text-gray-500">ممتاز — لم تُسجّل أي علامات إجهاد.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {log.fatigueEvents.slice(0, 10).map((e, i) => (
                <li key={i} className="text-sm p-2 rounded-lg bg-orange-50 border border-orange-100">
                  <div className="font-semibold text-orange-700">{FATIGUE_LABELS[e.signal]}</div>
                  {e.details && <div className="text-xs text-gray-600 mt-0.5">{e.details}</div>}
                  <div className="text-xs text-gray-400">{fmtTime(e.at)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Shortcuts */}
        <section className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Keyboard className="w-5 h-5 text-purple-600"/> الاختصارات المفضّلة</h2>
          {topShortcuts.length === 0 ? (
            <p className="text-sm text-gray-500">لم يتم استخدام اختصارات لوحة المفاتيح بعد.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topShortcuts.map(([k, c]) => (
                <span key={k} className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-sm font-mono">
                  <b>{k}</b> <span className="text-gray-500">×{c}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button onClick={refresh} className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-bold inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4"/> تحديث
        </button>
        <button onClick={() => { if (confirm('مسح كامل سجل التفاعل؟')) { resetLog(); refresh(); } }}
          className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold">
          مسح السجل
        </button>
      </div>
    </div>
  );
};

export default SensoryInteractionLog;
