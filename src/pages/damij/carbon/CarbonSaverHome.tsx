import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Bus, Zap, Trash2, Recycle, Sparkles, Loader2, TreePine, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

// Emission factors (kg CO2e per unit) — rough averages, school-friendly
const F = {
  carKm: 0.18,         // per km of car travel
  busKm: 0.08,         // per km of bus travel
  electricityKwh: 0.45,
  digitalSavedPages: -0.005, // negative = saved
  recycledKg: -1.2,    // saved per kg recycled
  treesPlanted: -21,   // ~21 kg CO2 per young tree per year
  meatMealsWeek: 5.0,  // per meal/week (annualized later)
};

interface Tip {
  title: string;
  impact: 'low' | 'medium' | 'high';
  detail: string;
}
interface Advice {
  summary: string;
  score: number;
  tips: Tip[];
}

const CarbonSaverHome: React.FC = () => {
  const { lang, t } = useDamijLang();
  const [carKm, setCarKm] = useState(40);
  const [busKm, setBusKm] = useState(20);
  const [kwh, setKwh] = useState(120);
  const [digitalPages, setDigitalPages] = useState(120);
  const [recycledKg, setRecycledKg] = useState(4);
  const [trees, setTrees] = useState(0);
  const [meat, setMeat] = useState(7);

  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<Advice | null>(null);

  const breakdown = useMemo(() => {
    return {
      transport: carKm * F.carKm * 4 + busKm * F.busKm * 4, // monthly
      energy: kwh * F.electricityKwh,
      diet: meat * F.meatMealsWeek * 4,
      digital: digitalPages * F.digitalSavedPages,
      recycle: recycledKg * F.recycledKg,
      trees: trees * (F.treesPlanted / 12),
    };
  }, [carKm, busKm, kwh, digitalPages, recycledKg, trees, meat]);

  const positive = breakdown.transport + breakdown.energy + breakdown.diet;
  const saved = -(breakdown.digital + breakdown.recycle + breakdown.trees);
  const net = positive - saved;
  const score = Math.max(0, Math.min(100, Math.round(100 - (net / 350) * 100)));

  const barData = [
    { name: 'Transport', value: Math.round(breakdown.transport) },
    { name: 'Energy', value: Math.round(breakdown.energy) },
    { name: 'Diet', value: Math.round(breakdown.diet) },
    { name: 'Saved', value: Math.round(saved) },
  ];
  const pieData = [
    { name: 'Transport', value: Math.round(breakdown.transport) },
    { name: 'Energy', value: Math.round(breakdown.energy) },
    { name: 'Diet', value: Math.round(breakdown.diet) },
  ];
  const COLORS = ['hsl(var(--damij-primary))', 'hsl(var(--damij-primary-2))', 'hsl(var(--damij-warm))'];

  const ask = async () => {
    setLoading(true);
    setAdvice(null);
    try {
      const { data, error } = await supabase.functions.invoke('damij-carbon-advisor', {
        body: {
          lang,
          profile: { carKm, busKm, kwh, digitalPages, recycledKg, trees, meat, monthlyKg: Math.round(net), score },
        },
      });
      if (error) throw error;
      setAdvice(data as Advice);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ImpactPill: React.FC<{ impact: Tip['impact'] }> = ({ impact }) => (
    <span
      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
        impact === 'high'
          ? 'bg-[hsl(var(--damij-success))]/15 text-[hsl(var(--damij-success))]'
          : impact === 'medium'
          ? 'bg-[hsl(var(--damij-accent))]/15 text-[hsl(var(--damij-warm))]'
          : 'bg-[hsl(var(--damij-border))] text-[hsl(var(--damij-muted))]'
      }`}
    >
      {impact}
    </span>
  );

  return (
    <div className="px-6 pt-12 pb-20 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[hsl(var(--damij-border))] bg-white p-8 mb-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-success))]/12 text-[hsl(var(--damij-success))] flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))]">حافظ الكربون</h1>
            <p className="text-sm text-[hsl(var(--damij-muted))]">قِس بصمتك. خفّض أثرك. ألهم مدرستك.</p>
          </div>
        </div>
        <p className="text-[hsl(var(--damij-text))]/80 leading-relaxed max-w-3xl">
          منصة دامج تؤمن بأنّ التعليم الدامج مسؤولية كوكبية أيضاً. احسب بصمتك الكربونية الشهرية،
          وتعرّف على خطوات عملية لجعل تعلّمك أكثر استدامة — على نهج جائزة زايد للاستدامة.
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-white border border-[hsl(var(--damij-border))]">
          <div className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--damij-muted))] mb-1">صافي البصمة الشهرية</div>
          <div className="text-3xl font-extrabold text-[hsl(var(--damij-primary))]">{Math.round(net)} <span className="text-base font-bold">kg CO₂e</span></div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[hsl(var(--damij-border))]">
          <div className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--damij-muted))] mb-1">مدّخراتك الخضراء</div>
          <div className="text-3xl font-extrabold text-[hsl(var(--damij-success))]">{Math.round(saved)} <span className="text-base font-bold">kg</span></div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[hsl(var(--damij-border))]">
          <div className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--damij-muted))] mb-1">مؤشر الاستدامة</div>
          <div className="text-3xl font-extrabold text-[hsl(var(--damij-primary-2))]">{score}/100</div>
        </div>
      </div>

      {/* Inputs + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white border border-[hsl(var(--damij-border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--damij-primary))] mb-4">حاسبة البصمة الكربونية</h2>
          <Field icon={<Bus className="w-4 h-4" />} label="كم المسافة بالسيارة (كم/أسبوع)" value={carKm} onChange={setCarKm} max={500} />
          <Field icon={<Bus className="w-4 h-4" />} label="كم المسافة بالباص (كم/أسبوع)" value={busKm} onChange={setBusKm} max={500} />
          <Field icon={<Zap className="w-4 h-4" />} label="استهلاك الكهرباء (كيلوواط/شهر)" value={kwh} onChange={setKwh} max={1000} />
          <Field icon={<Sparkles className="w-4 h-4" />} label="صفحات وفّرتها بالتعلّم الرقمي (شهرياً)" value={digitalPages} onChange={setDigitalPages} max={1000} />
          <Field icon={<Recycle className="w-4 h-4" />} label="مواد قمت بإعادة تدويرها (كغ/شهر)" value={recycledKg} onChange={setRecycledKg} max={100} />
          <Field icon={<TreePine className="w-4 h-4" />} label="أشجار زرعتها هذه السنة" value={trees} onChange={setTrees} max={100} />
          <Field icon={<Trash2 className="w-4 h-4" />} label="وجبات لحم في الأسبوع" value={meat} onChange={setMeat} max={21} />
        </div>

        <div className="grid grid-rows-2 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-[hsl(var(--damij-border))]">
            <h3 className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-3">توزيع الانبعاثات الشهرية</h3>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--damij-primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[hsl(var(--damij-border))]">
            <h3 className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-3">تركيبة المصادر</h3>
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={70}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Advisor */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--damij-success))]/8 to-[hsl(var(--damij-primary))]/5 border border-[hsl(var(--damij-border))]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[hsl(var(--damij-success))]" />
            <h2 className="text-lg font-bold text-[hsl(var(--damij-primary))]">المرشد الذكي للاستدامة</h2>
          </div>
          <button
            onClick={ask}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[hsl(var(--damij-success))] text-white font-bold text-sm shadow hover:opacity-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            احصل على نصائح مخصّصة
          </button>
        </div>

        {advice && (
          <div>
            <p className="text-[hsl(var(--damij-text))]/80 mb-4 leading-relaxed">{advice.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {advice.tips?.map((tip, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-[hsl(var(--damij-border))]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[hsl(var(--damij-primary))]">{tip.title}</span>
                    <ImpactPill impact={tip.impact} />
                  </div>
                  <p className="text-sm text-[hsl(var(--damij-muted))] leading-relaxed">{tip.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{
  icon: React.ReactNode; label: string; value: number; onChange: (n: number) => void; max: number;
}> = ({ icon, label, value, onChange, max }) => (
  <div className="mb-3">
    <label className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--damij-muted))] mb-1">
      <span className="text-[hsl(var(--damij-primary-2))]">{icon}</span>
      {label}
    </label>
    <div className="flex items-center gap-3">
      <input
        type="range" min={0} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="flex-1 accent-[hsl(var(--damij-primary))]"
      />
      <input
        type="number" min={0} max={max} value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value || '0', 10))))}
        className="w-20 px-2 py-1 text-sm rounded border border-[hsl(var(--damij-border))]"
      />
    </div>
  </div>
);

export default CarbonSaverHome;
