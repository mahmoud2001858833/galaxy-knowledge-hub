import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, BarChart3, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RESULTS_PASSWORD = '200400200';

type Survey = {
  id: string;
  doctor_name: string;
  specialty: string | null;
  workplace: string | null;
  email: string | null;
  answers: Record<string, string | string[]>;
  created_at: string;
};

const QUESTION_LABELS: Record<string, string> = {
  q1: 'تقييم منصة دامج كحل موحّد لذوي الإعاقة',
  q2: 'أهمية أدوات الفحص المبكر داخل دامج',
  q3: 'دمج الذكاء الاصطناعي في تشخيص دامج',
  q4: 'الميزات الأهم في منصة دامج',
  q5: 'الفئة العمرية الأكثر استفادة من دامج',
  q6: 'مشاركة تقارير دامج بين الأهل والطبيب والمدرسة',
  q7: 'الثقة بمحتوى دامج الطبي العربي',
  q8: 'تطوير قسم لغة الإشارة والبريل في دامج',
  q9: 'فائدة "الجسر الحسّي العكسي" في دامج',
  q10: 'أولوية تطوير دامج للسنة القادمة',
};

const DamijResults: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('damij_doctor_surveys')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setSurveys((data as Survey[]) || []);
    setLoading(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd !== RESULTS_PASSWORD) {
      toast.error('كلمة مرور غير صحيحة');
      return;
    }
    setUnlocked(true);
    await loadSurveys();
  };

  if (!unlocked) {
    return (
      <div
        className="damij-root min-h-screen flex items-center justify-center px-6"
        dir="rtl"
        style={{ background: 'linear-gradient(135deg, hsl(var(--damij-bg)), hsl(var(--damij-bg-2)))' }}
      >
        <motion.form
          onSubmit={handleUnlock}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl shadow-2xl p-8"
          style={{ background: 'hsl(var(--damij-surface))' }}
        >
          <Link
            to="/damij"
            className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-70"
            style={{ color: 'hsl(var(--damij-primary))' }}
          >
            <ArrowRight className="w-4 h-4" /> العودة
          </Link>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'hsl(var(--damij-primary) / 0.1)' }}
          >
            <Lock className="w-8 h-8" style={{ color: 'hsl(var(--damij-primary))' }} />
          </div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'hsl(var(--damij-primary))' }}>
            نتائج استبيان الأطباء
          </h1>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--damij-muted))' }}>
            هذه الصفحة محمية. أدخل كلمة المرور للوصول إلى النتائج.
          </p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-xl border-2 outline-none focus:border-[hsl(var(--damij-primary))] mb-4"
            style={{
              background: 'hsl(var(--damij-bg))',
              borderColor: 'hsl(var(--damij-border))',
              color: 'hsl(var(--damij-text))',
            }}
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition"
            style={{ background: 'hsl(var(--damij-primary))' }}
          >
            دخول
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div
      className="damij-root min-h-screen"
      dir="rtl"
      style={{ background: 'linear-gradient(135deg, hsl(var(--damij-bg)), hsl(var(--damij-bg-2)))' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <Link
          to="/damij"
          className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-70"
          style={{ color: 'hsl(var(--damij-primary))' }}
        >
          <ArrowRight className="w-4 h-4" /> العودة للمنصة
        </Link>

        <div
          className="rounded-3xl shadow-xl p-6 sm:p-8 mb-6 flex items-center gap-4"
          style={{ background: 'hsl(var(--damij-surface))' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'hsl(var(--damij-primary))' }}
          >
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'hsl(var(--damij-primary))' }}>
              نتائج استبيان الأطباء
            </h1>
            <p className="text-sm" style={{ color: 'hsl(var(--damij-muted))' }}>
              عدد الإجابات: <strong>{surveys.length}</strong>
            </p>
          </div>
          <Users className="w-10 h-10 opacity-30" style={{ color: 'hsl(var(--damij-primary))' }} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'hsl(var(--damij-primary))' }} />
          </div>
        ) : surveys.length === 0 ? (
          <div
            className="rounded-3xl p-10 text-center shadow"
            style={{ background: 'hsl(var(--damij-surface))', color: 'hsl(var(--damij-muted))' }}
          >
            لا توجد إجابات بعد.
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map((s) => {
              const isOpen = expanded === s.id;
              return (
                <div
                  key={s.id}
                  className="rounded-2xl shadow-md overflow-hidden"
                  style={{ background: 'hsl(var(--damij-surface))' }}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="w-full p-5 flex items-center gap-4 text-right hover:bg-[hsl(var(--damij-bg))] transition"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                      style={{ background: 'hsl(var(--damij-primary))' }}
                    >
                      {(s.doctor_name || '?').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: 'hsl(var(--damij-text))' }}>
                        {s.doctor_name}
                      </div>
                      <div className="text-xs" style={{ color: 'hsl(var(--damij-muted))' }}>
                        {[s.specialty, s.workplace, new Date(s.created_at).toLocaleDateString('ar-EG')]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-2 border-t" style={{ borderColor: 'hsl(var(--damij-border))' }}>
                      {s.email && (
                        <div className="text-xs pt-3" style={{ color: 'hsl(var(--damij-muted))' }}>
                          البريد: {s.email}
                        </div>
                      )}
                      {Object.entries(s.answers || {}).map(([qid, val]) => (
                        <div
                          key={qid}
                          className="p-3 rounded-xl text-sm"
                          style={{ background: 'hsl(var(--damij-bg))' }}
                        >
                          <div className="font-bold mb-1" style={{ color: 'hsl(var(--damij-primary))' }}>
                            {QUESTION_LABELS[qid] || qid}
                          </div>
                          <div style={{ color: 'hsl(var(--damij-text))' }}>
                            {Array.isArray(val) ? val.join('، ') : String(val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DamijResults;
