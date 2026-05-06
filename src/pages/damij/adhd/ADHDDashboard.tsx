import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Activity, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ADHDDashboard: React.FC = () => {
  const nav = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [neuro, setNeuro] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const [a, n, t] = await Promise.all([
        supabase.from('adhd_assessments').select('*').eq('user_id', u.user.id).order('created_at'),
        supabase.from('adhd_neuro_tests').select('*').eq('user_id', u.user.id).order('created_at'),
        supabase.from('adhd_training_sessions').select('*').eq('user_id', u.user.id).order('created_at'),
      ]);
      setAssessments(a.data || []);
      setNeuro(n.data || []);
      setTraining(t.data || []);
    })();
  }, []);

  const symptomData = assessments.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString('ar'),
    inattention: a.scores?.inattentionPositive ?? 0,
    hyperactivity: a.scores?.hyperactivityPositive ?? 0,
  }));

  const cptData = neuro.filter((n) => n.test_type === 'cpt').map((n) => ({
    date: new Date(n.created_at).toLocaleDateString('ar'),
    omission: n.metrics?.omissionRate ?? 0,
    commission: n.metrics?.commissionRate ?? 0,
    rt: n.metrics?.meanRT ?? 0,
  }));

  const nbackData = neuro.filter((n) => n.test_type === 'nback').map((n) => ({
    date: new Date(n.created_at).toLocaleDateString('ar'),
    accuracy: n.metrics?.accuracy ?? 0,
    dPrime: n.metrics?.dPrime ?? 0,
  }));

  const stroopData = neuro.filter((n) => n.test_type === 'stroop').map((n) => ({
    date: new Date(n.created_at).toLocaleDateString('ar'),
    effect: n.metrics?.stroopEffect ?? 0,
  }));

  const gngData = neuro.filter((n) => n.test_type === 'gonogo').map((n) => ({
    date: new Date(n.created_at).toLocaleDateString('ar'),
    commissions: n.metrics?.commissionErrors ?? 0,
    noGoAcc: n.metrics?.noGoAccuracy ?? 0,
  }));

  const trainData = training.map((t) => ({
    date: new Date(t.created_at).toLocaleDateString('ar'),
    score: Number(t.score) || 0,
  }));

  return (
    <div className="px-6 pt-12 pb-12 max-w-5xl mx-auto" dir="rtl">
      <button onClick={() => nav('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">لوحة المتابعة الطولية</h1>
        <p className="text-[hsl(var(--damij-text))]/70">تطوّر الأعراض والأداء عبر الزمن.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="شدّة الأعراض عبر الفحوصات" icon={Activity} empty={!symptomData.length}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={symptomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis domain={[0, 9]} fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="inattention" stroke="#3b82f6" strokeWidth={2} name="تشتت" />
              <Line type="monotone" dataKey="hyperactivity" stroke="#f97316" strokeWidth={2} name="فرط حركة" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="أداء اختبار CPT" icon={Brain} empty={!cptData.length}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="omission" stroke="#ef4444" strokeWidth={2} name="إغفال %" />
              <Line type="monotone" dataKey="commission" stroke="#a855f7" strokeWidth={2} name="اندفاع %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="نتائج جلسات التدريب" icon={BarChart3} empty={!trainData.length}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trainData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} name="النتيجة" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10">
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">إحصائيات سريعة</h3>
          <ul className="space-y-2 text-sm">
            <li>عدد الفحوصات: <strong>{assessments.length}</strong></li>
            <li>اختبارات CPT المنجزة: <strong>{cptData.length}</strong></li>
            <li>جلسات التدريب: <strong>{training.length}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; icon: React.ComponentType<any>; empty: boolean; children: React.ReactNode }> = ({ title, icon: Icon, empty, children }) => (
  <div className="p-5 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-[hsl(var(--damij-warm))]" />
      <h3 className="font-bold text-[hsl(var(--damij-primary))]">{title}</h3>
    </div>
    {empty ? (
      <p className="text-sm text-[hsl(var(--damij-text))]/50 py-12 text-center">لا توجد بيانات بعد</p>
    ) : children}
  </div>
);

export default ADHDDashboard;
