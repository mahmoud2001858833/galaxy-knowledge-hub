import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Lever {
  id: string;
  label: string;
  description: string;
  // pct change of corresponding emission category if lever is fully applied
  reductionPct: number;
  // share of total emissions affected by this lever (0-1)
  affectedShare: number;
  defaultValue?: number; // 0-100
}

interface Props {
  baselineEmissions: number; // tons CO2 / year
  unit?: string;
  levers?: Lever[];
}

const DEFAULT_LEVERS: Lever[] = [
  { id: "renewable", label: "التحول للطاقة المتجددة", description: "تركيب ألواح شمسية أو الاشتراك بالكهرباء النظيفة", reductionPct: 80, affectedShare: 0.35 },
  { id: "transport", label: "تقليل قيادة السيارة", description: "استخدام مواصلات عامة، دراجة، أو مشاركة سيارة", reductionPct: 60, affectedShare: 0.25 },
  { id: "diet", label: "تقليل اللحوم الحمراء", description: "استبدال اللحوم بالنبات أو الدجاج", reductionPct: 50, affectedShare: 0.18 },
  { id: "energy_eff", label: "كفاءة الطاقة المنزلية", description: "LED، عزل، أجهزة موفرة، تكييف ذكي", reductionPct: 35, affectedShare: 0.15 },
  { id: "waste", label: "تدوير وتقليل النفايات", description: "فصل، تسميد، تقليل الاستهلاك", reductionPct: 70, affectedShare: 0.07 },
];

export const WhatIfScenarios: React.FC<Props> = ({
  baselineEmissions, unit = "طن CO₂/سنة", levers = DEFAULT_LEVERS,
}) => {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(levers.map(l => [l.id, l.defaultValue ?? 0]))
  );

  const { newEmissions, savedEmissions, savedPct, breakdown } = useMemo(() => {
    let totalSaved = 0;
    const breakdown = levers.map(l => {
      const applied = (values[l.id] ?? 0) / 100;
      const saving = baselineEmissions * l.affectedShare * (l.reductionPct / 100) * applied;
      totalSaved += saving;
      return { ...l, applied, saving };
    });
    const newEm = Math.max(0, baselineEmissions - totalSaved);
    return {
      newEmissions: newEm,
      savedEmissions: totalSaved,
      savedPct: baselineEmissions > 0 ? (totalSaved / baselineEmissions) * 100 : 0,
      breakdown,
    };
  }, [values, baselineEmissions, levers]);

  const setLever = (id: string, v: number) => setValues(prev => ({ ...prev, [id]: v }));
  const resetAll = () => setValues(Object.fromEntries(levers.map(l => [l.id, 0])));
  const maxAll = () => setValues(Object.fromEntries(levers.map(l => [l.id, 100])));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-violet-500/20 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-violet-300">سيناريوهات «ماذا لو؟»</h3>
            <p className="text-xs text-gray-400 mt-0.5">حرّك الأشرطة لترى التأثير الفوري على بصمتك</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 border border-white/10">
            تصفير
          </button>
          <button onClick={maxAll} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs text-emerald-300 border border-emerald-500/30">
            تطبيق الكل
          </button>
        </div>
      </div>

      {/* Result panel */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-white/5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">الحالي</div>
          <div className="text-xl font-bold text-white mt-1">{baselineEmissions.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500">{unit}</div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/30">
          <div className="text-[10px] text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />الجديد
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{newEmissions.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500">{unit}</div>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30">
          <div className="text-[10px] text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3" />موفّر
          </div>
          <div className="text-xl font-bold text-amber-300 mt-1">{savedPct.toFixed(0)}%</div>
          <div className="text-[10px] text-gray-500">{savedEmissions.toFixed(2)} {unit}</div>
        </div>
      </div>

      {/* Levers */}
      <div className="space-y-4">
        {breakdown.map(l => (
          <div key={l.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{l.label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{l.description}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base font-bold text-violet-300">{values[l.id]}%</div>
                {l.saving > 0 && (
                  <div className="text-[10px] text-emerald-300">−{l.saving.toFixed(2)} {unit}</div>
                )}
              </div>
            </div>
            <Slider
              value={[values[l.id] ?? 0]}
              max={100}
              step={5}
              onValueChange={(v) => setLever(l.id, v[0])}
              className="mt-2"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhatIfScenarios;
