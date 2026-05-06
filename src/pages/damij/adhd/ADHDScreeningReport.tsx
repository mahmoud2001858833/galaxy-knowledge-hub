import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Sparkles, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { INSTRUMENTS, SEVERITY_LABEL, SUBTYPE_LABEL } from '@/features/adhd/screening/instruments';
import { toast } from 'sonner';

const ADHDScreeningReport: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    if (!assessmentId) return;
    const { data, error } = await supabase
      .from('adhd_assessments')
      .select('*')
      .eq('id', assessmentId)
      .maybeSingle();
    if (error) toast.error(error.message);
    setAssessment(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [assessmentId]);

  const generateReport = async () => {
    if (!assessment) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('adhd-screening-report', {
        body: { assessmentId: assessment.id },
      });
      if (error) throw error;
      if (data?.report) {
        setAssessment({ ...assessment, ai_report: data.report });
        toast.success('تم إنشاء التقرير');
      }
    } catch (e: any) {
      toast.error(e.message || 'تعذّر إنشاء التقرير');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return <div className="p-12 text-center">لم يُعثر على التقييم</div>;
  }

  const inst = INSTRUMENTS[assessment.instrument];
  const scores = assessment.scores || {};

  return (
    <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto" dir="rtl">
      <button
        onClick={() => navigate('/damij/adhd/screening')}
        className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 hover:opacity-80"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">تقرير الفحص</h1>
        <p className="text-sm text-[hsl(var(--damij-text))]/65">{inst?.title}</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-600 mb-1">أعراض تشتّت الانتباه</p>
          <p className="text-2xl font-bold text-blue-900">{scores.inattentionPositive ?? 0} / 9</p>
          <p className="text-xs text-blue-700 mt-1">
            متوسط: {(scores.inattentionMean ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
          <p className="text-xs text-orange-600 mb-1">أعراض فرط الحركة/الاندفاع</p>
          <p className="text-2xl font-bold text-orange-900">{scores.hyperactivityPositive ?? 0} / 9</p>
          <p className="text-xs text-orange-700 mt-1">
            متوسط: {(scores.hyperactivityMean ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="sm:col-span-2 p-4 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
          <p className="text-xs text-[hsl(var(--damij-text))]/60 mb-1">الخلاصة المبدئية</p>
          <p className="text-lg font-bold text-[hsl(var(--damij-primary))]">
            {SUBTYPE_LABEL[assessment.subtype as keyof typeof SUBTYPE_LABEL] ?? '—'}
          </p>
          <p className="text-sm mt-1">
            الشدّة: <strong>{SEVERITY_LABEL[assessment.severity as keyof typeof SEVERITY_LABEL] ?? '—'}</strong>
          </p>
        </div>
      </div>

      {!assessment.ai_report && (
        <button
          onClick={generateReport}
          disabled={generating}
          className="w-full py-4 mb-6 rounded-2xl bg-gradient-to-r from-[hsl(var(--damij-warm))] to-orange-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          إنشاء تقرير ذكي تفريقي
        </button>
      )}

      {assessment.ai_report && (
        <div className="p-6 rounded-2xl bg-white border-2 border-[hsl(var(--damij-warm))]/30 mb-6">
          <div className="flex items-center gap-2 mb-3 text-[hsl(var(--damij-primary))]">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold">التقرير التفريقي</h3>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-loose text-[hsl(var(--damij-text))]">
            {assessment.ai_report}
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <p className="leading-relaxed">
          هذا التقرير أداة دعم قرار. التشخيص الرسمي لاضطراب ADHD يتطلّب مقابلة سريرية شاملة
          ومصادر معلومات متعدّدة (والد + معلم) واستبعاد الحالات الأخرى من قِبل أخصائي.
        </p>
      </div>
    </div>
  );
};

export default ADHDScreeningReport;
