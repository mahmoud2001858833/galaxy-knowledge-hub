import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  FREQUENCY_OPTIONS,
  INSTRUMENTS,
  ResponseValue,
  scoreInstrument,
} from '@/features/adhd/screening/instruments';

const FREQ_COLORS = ['bg-emerald-500', 'bg-amber-400', 'bg-orange-500', 'bg-rose-500'];
const FREQ_EMOJI = ['😌', '🙂', '😟', '😣'];

const ADHDInstrumentRunner: React.FC = () => {
  const { instrumentKey = 'snap_iv' } = useParams();
  const navigate = useNavigate();
  const instrument = INSTRUMENTS[instrumentKey];

  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [age, setAge] = useState<number | ''>('');
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showAge, setShowAge] = useState(true);

  // Restore from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(`adhd_quiz_${instrumentKey}`);
    if (raw) {
      try {
        const j = JSON.parse(raw);
        if (j.responses) setResponses(j.responses);
        if (j.age) setAge(j.age);
        if (typeof j.idx === 'number') setIdx(j.idx);
        setShowAge(false);
      } catch {}
    }
  }, [instrumentKey]);

  useEffect(() => {
    localStorage.setItem(`adhd_quiz_${instrumentKey}`, JSON.stringify({ responses, age, idx }));
  }, [responses, age, idx, instrumentKey]);

  if (!instrument) return <div className="p-12 text-center" dir="rtl">المقياس غير موجود</div>;

  const total = instrument.items.length;
  const current = instrument.items[idx];
  const answered = Object.keys(responses).length;
  const progress = (answered / total) * 100;

  const result = useMemo(
    () => (answered === total ? scoreInstrument(instrument, responses) : null),
    [answered, total, instrument, responses]
  );

  const pickAnswer = (v: ResponseValue) => {
    setResponses((r) => ({ ...r, [current.id]: v }));
    setTimeout(() => {
      if (idx < total - 1) setIdx(idx + 1);
    }, 240);
  };

  const handleSubmit = async () => {
    if (!result) { toast.error('أكمل جميع الأسئلة أولاً'); return; }
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { toast.error('سجّل الدخول لحفظ النتيجة'); setSubmitting(false); return; }
      const { data, error } = await supabase.from('adhd_assessments').insert({
        user_id: userRes.user.id,
        instrument: instrument.key,
        completed_by: instrument.completedBy,
        subject_age: age === '' ? null : age,
        raw_responses: responses,
        scores: result as any,
        subtype: result.subtype,
        severity: result.severity,
      }).select('id').single();
      if (error) throw error;
      localStorage.removeItem(`adhd_quiz_${instrumentKey}`);
      navigate(`/damij/adhd/screening/report/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || 'تعذّر الحفظ');
    } finally { setSubmitting(false); }
  };

  if (showAge) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" dir="rtl">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--damij-warm))]/15 text-[hsl(var(--damij-warm))] flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">{instrument.title}</h2>
          <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-6">{instrument.description}</p>
          <label className="block text-sm font-semibold mb-2">عمر الشخص المُقيَّم</label>
          <input
            type="number" min={3} max={99}
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border-2 border-[hsl(var(--damij-primary))]/15 bg-white text-lg font-bold text-center"
            placeholder="مثال: 8"
          />
          <button
            onClick={() => setShowAge(false)}
            className="mt-6 w-full py-3 rounded-xl bg-[hsl(var(--damij-warm))] text-white font-bold flex items-center justify-center gap-2"
          >
            ابدأ الاستبيان <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-12 max-w-2xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/screening')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm hover:opacity-80">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-[hsl(var(--damij-primary))]">{instrument.shortTitle}</span>
          <span className="font-bold">{idx + 1} / {total}</span>
        </div>
        <div className="h-2 bg-[hsl(var(--damij-primary))]/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-l from-[hsl(var(--damij-warm))] to-orange-500" animate={{ width: `${progress}%` }} transition={{ type:'spring', stiffness: 100 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8"
        >
          <span className={`inline-block text-[11px] px-3 py-1 rounded-full mb-4 ${current.domain === 'inattention' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {current.domain === 'inattention' ? 'انتباه' : current.domain === 'hyperactivity_impulsivity' ? 'فرط حركة / اندفاعية' : current.domain}
          </span>
          <p className="text-xl sm:text-2xl font-bold text-[hsl(var(--damij-primary))] leading-relaxed mb-8 min-h-[80px]">
            {current.text}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FREQUENCY_OPTIONS.map((opt, i) => {
              const active = responses[current.id] === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => pickAnswer(opt.value)}
                  className={`p-4 rounded-2xl text-white font-bold flex flex-col items-center gap-1 transition-all ${FREQ_COLORS[i]} ${active ? 'ring-4 ring-offset-2 ring-[hsl(var(--damij-warm))] scale-105' : 'opacity-80 hover:opacity-100'}`}
                >
                  <span className="text-3xl">{FREQ_EMOJI[i]}</span>
                  <span className="text-sm">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          disabled={idx === 0}
          onClick={() => setIdx(Math.max(0, idx - 1))}
          className="px-5 py-2.5 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/20 text-[hsl(var(--damij-primary))] font-semibold flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" /> السابق
        </button>
        {idx < total - 1 ? (
          <button
            disabled={!responses[current.id]}
            onClick={() => setIdx(idx + 1)}
            className="px-5 py-2.5 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-semibold flex items-center gap-2 disabled:opacity-30"
          >
            التالي <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
        ) : (
          <button
            disabled={!result || submitting}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-[hsl(var(--damij-warm))] text-white font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            عرض النتيجة
          </button>
        )}
      </div>

      <p className="text-[11px] text-[hsl(var(--damij-text))]/50 text-center mt-6">
        التقدّم محفوظ تلقائياً — يمكنك العودة في أي وقت.
      </p>
    </div>
  );
};

export default ADHDInstrumentRunner;
