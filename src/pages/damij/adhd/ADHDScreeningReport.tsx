import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Sparkles, Loader2, FileText, Share2, Activity, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { INSTRUMENTS, SEVERITY_LABEL, SUBTYPE_LABEL } from '@/features/adhd/screening/instruments';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

const ADHDScreeningReport: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { (async () => {
    if (!assessmentId) return;
    const { data, error } = await supabase.from('adhd_assessments').select('*').eq('id', assessmentId).maybeSingle();
    if (error) toast.error(error.message);
    setAssessment(data);
    if (data) {
      try {
        localStorage.setItem('adhd_diagnosis_done', '1');
        localStorage.setItem('adhd_last_assessment_id', String(data.id));
      } catch {}
    }
    setLoading(false);
  })(); }, [assessmentId]);

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
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!assessment) return <div className="p-12 text-center" dir="rtl">لم يُعثر على التقييم</div>;

  const inst = INSTRUMENTS[assessment.instrument];
  const scores = assessment.scores || {};
  const inattScore = scores.inattentionPositive ?? 0;
  const hyperScore = scores.hyperactivityPositive ?? 0;
  const totalScore = Math.min(100, Math.round(((inattScore + hyperScore) / 18) * 100));
  const zone = totalScore < 35 ? { label: 'ضمن المعدل', color: '#10b981' } : totalScore < 60 ? { label: 'حدّي', color: '#f59e0b' } : { label: 'احتمال مرتفع', color: '#ef4444' };

  const radarData = [
    { axis: 'تشتت الانتباه', value: Math.round((inattScore / 9) * 100) },
    { axis: 'فرط الحركة', value: Math.round((scores.hyperactivityMean ? (scores.hyperactivityMean / 3) * 100 : (hyperScore / 9) * 100)) },
    { axis: 'الاندفاعية', value: Math.round(((hyperScore * 0.6) / 9) * 100) },
  ];
  const ringData = [{ name: 'score', value: totalScore, fill: zone.color }];

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    await navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-4xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/screening')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <motion.header initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-warm))] text-white rounded-3xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-1">تقرير الفحص</h1>
        <p className="text-sm opacity-90">{inst?.title}</p>
        <p className="text-xs opacity-75 mt-2">العمر: {assessment.subject_age ?? '—'} · {new Date(assessment.created_at).toLocaleDateString('ar')}</p>
      </motion.header>

      {/* Score gauge + radar */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-white rounded-3xl p-6 shadow-md">
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2"><Activity className="w-5 h-5" /> الدرجة الإجمالية</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={ringData} startAngle={90} endAngle={90 - (totalScore/100)*360}>
                <PolarAngleAxis type="number" domain={[0,100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-extrabold" style={{color: zone.color}}>{totalScore}</span>
              <span className="text-xs font-semibold mt-1" style={{color: zone.color}}>{zone.label}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.1}} className="bg-white rounded-3xl p-6 shadow-md">
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2"><Target className="w-5 h-5" /> الأبعاد الثلاثة</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0,100]} tick={false} />
                <Radar dataKey="value" stroke="hsl(var(--damij-warm))" fill="hsl(var(--damij-warm))" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Numbers row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-600 mb-1">تشتّت الانتباه</p>
          <p className="text-2xl font-bold text-blue-900">{inattScore} / 9</p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
          <p className="text-xs text-orange-600 mb-1">فرط الحركة</p>
          <p className="text-2xl font-bold text-orange-900">{hyperScore} / 9</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 col-span-2 sm:col-span-1">
          <p className="text-xs text-purple-600 mb-1">النمط</p>
          <p className="text-base font-bold text-purple-900">{SUBTYPE_LABEL[assessment.subtype as keyof typeof SUBTYPE_LABEL] ?? '—'}</p>
          <p className="text-xs text-purple-700 mt-1">شدّة: {SEVERITY_LABEL[assessment.severity as keyof typeof SEVERITY_LABEL] ?? '—'}</p>
        </div>
      </div>

      {!assessment.ai_report && (
        <button onClick={generateReport} disabled={generating} className="w-full py-4 mb-6 rounded-2xl bg-gradient-to-r from-[hsl(var(--damij-warm))] to-orange-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          إنشاء تقرير AI تفريقي
        </button>
      )}

      {assessment.ai_report && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-6 rounded-3xl bg-white shadow-md mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[hsl(var(--damij-primary))]">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold">التقرير التفريقي</h3>
            </div>
            <button onClick={share} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))]">
              <Share2 className="w-3.5 h-3.5" /> مشاركة
            </button>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-loose text-[hsl(var(--damij-text))]">
            {assessment.ai_report}
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <button onClick={() => navigate('/damij/adhd/games')} className="p-4 rounded-2xl bg-violet-600 text-white text-right font-bold flex items-center gap-3 hover:bg-violet-700">
          <Zap className="w-5 h-5" />
          <div className="flex-1">
            <div>تأكيد بالألعاب</div>
            <div className="text-xs opacity-80 font-normal">قياس فعلي عبر بطارية ألعاب</div>
          </div>
        </button>
        <button onClick={() => navigate('/damij/adhd/program/setup')} className="p-4 rounded-2xl bg-emerald-600 text-white text-right font-bold flex items-center gap-3 hover:bg-emerald-700">
          <Sparkles className="w-5 h-5" />
          <div className="flex-1">
            <div>إنشاء برنامج علاجي</div>
            <div className="text-xs opacity-80 font-normal">خطة يومية مولّدة بالذكاء الاصطناعي</div>
          </div>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <p className="leading-relaxed">هذا التقرير أداة دعم قرار. التشخيص الرسمي يتطلّب تقييماً سريرياً شاملاً.</p>
      </div>
    </div>
  );
};

export default ADHDScreeningReport;
