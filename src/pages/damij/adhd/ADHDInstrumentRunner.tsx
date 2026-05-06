import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  FREQUENCY_OPTIONS,
  INSTRUMENTS,
  ResponseValue,
  scoreInstrument,
  SEVERITY_LABEL,
  SUBTYPE_LABEL,
} from '@/features/adhd/screening/instruments';

const ADHDInstrumentRunner: React.FC = () => {
  const { instrumentKey = 'snap_iv' } = useParams();
  const navigate = useNavigate();
  const instrument = INSTRUMENTS[instrumentKey];
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [age, setAge] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  if (!instrument) {
    return <div className="p-12 text-center">المقياس غير موجود</div>;
  }

  const answered = Object.keys(responses).length;
  const total = instrument.items.length;
  const progress = Math.round((answered / total) * 100);

  const result = useMemo(
    () => (answered === total ? scoreInstrument(instrument, responses) : null),
    [answered, total, instrument, responses]
  );

  const handleSubmit = async () => {
    if (!result) {
      toast.error('يرجى الإجابة عن جميع البنود قبل المتابعة');
      return;
    }
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        toast.error('يجب تسجيل الدخول لحفظ النتائج');
        setSubmitting(false);
        return;
      }
      const { data: inserted, error } = await supabase
        .from('adhd_assessments')
        .insert({
          user_id: userRes.user.id,
          instrument: instrument.key,
          completed_by: instrument.completedBy,
          subject_age: age === '' ? null : age,
          raw_responses: responses,
          scores: result as any,
          subtype: result.subtype,
          severity: result.severity,
        })
        .select('id')
        .single();
      if (error) throw error;
      navigate(`/damij/adhd/screening/report/${inserted.id}`);
    } catch (e: any) {
      toast.error(e.message || 'تعذّر حفظ النتيجة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto" dir="rtl">
      <button
        onClick={() => navigate('/damij/adhd/screening')}
        className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 hover:opacity-80"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--damij-warm))]/20 text-[hsl(var(--damij-warm))] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{instrument.title}</h1>
            <p className="text-xs text-[hsl(var(--damij-text))]/60">
              {instrument.source} · الفئة العمرية {instrument.ageRange}
            </p>
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--damij-text))]/75 leading-relaxed">{instrument.description}</p>
        <a
          href={instrument.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[hsl(var(--damij-warm))] underline mt-1 inline-block"
        >
          عرض المصدر الرسمي
        </a>
      </header>

      <div className="mb-6 p-4 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
        <label className="block text-sm font-medium mb-1">عمر الشخص المُقيَّم (اختياري)</label>
        <input
          type="number"
          min={3}
          max={99}
          value={age}
          onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-32 px-3 py-2 rounded-lg border border-[hsl(var(--damij-primary))]/20 bg-white"
        />
      </div>

      <div className="sticky top-0 z-10 bg-[hsl(var(--damij-bg))]/90 backdrop-blur py-2 mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span>التقدّم</span>
          <span className="font-semibold">{answered}/{total}</span>
        </div>
        <div className="h-2 bg-[hsl(var(--damij-primary))]/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[hsl(var(--damij-warm))]"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {instrument.items.map((item, i) => {
          const value = responses[item.id];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.01 }}
              className="p-4 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10"
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-bold text-[hsl(var(--damij-warm))] mt-1">{i + 1}.</span>
                <p className="font-medium text-sm leading-relaxed flex-1">{item.text}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    item.domain === 'inattention'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {item.domain === 'inattention' ? 'انتباه' : 'فرط حركة'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {FREQUENCY_OPTIONS.map((opt) => {
                  const active = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setResponses((r) => ({ ...r, [item.id]: opt.value }))}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition ${
                        active
                          ? 'bg-[hsl(var(--damij-warm))] text-white shadow'
                          : 'bg-[hsl(var(--damij-surface))] hover:bg-[hsl(var(--damij-warm))]/15'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {result && (
        <div className="mb-6 p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border-2 border-[hsl(var(--damij-warm))]/40">
          <div className="flex items-center gap-2 mb-3 text-[hsl(var(--damij-primary))]">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold">نتيجة فورية مبدئية</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[hsl(var(--damij-text))]/60">أعراض تشتت الانتباه الإيجابية</p>
              <p className="font-bold text-lg">{result.inattentionPositive} / 9</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--damij-text))]/60">أعراض فرط الحركة الإيجابية</p>
              <p className="font-bold text-lg">{result.hyperactivityPositive} / 9</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[hsl(var(--damij-text))]/60">النمط</p>
              <p className="font-bold">{SUBTYPE_LABEL[result.subtype]}</p>
              <p className="text-xs mt-1">الشدّة: {SEVERITY_LABEL[result.severity]}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!result || submitting}
        className="w-full py-4 rounded-2xl bg-[hsl(var(--damij-warm))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        احفظ واطلب تقريراً ذكياً
      </button>

      <p className="mt-4 text-[11px] text-[hsl(var(--damij-text))]/50 text-center leading-relaxed">
        تنبيه: هذه الأداة للفحص والتوعية فقط ولا تُغني عن التقييم السريري المتخصّص.
      </p>
    </div>
  );
};

export default ADHDInstrumentRunner;
