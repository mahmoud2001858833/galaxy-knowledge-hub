import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Target, DollarSign, Clock, Award, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActionItem {
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  cost: "free" | "low" | "medium" | "high";
  co2_savings_kg_year: number;
  money_savings_usd_year?: number;
  time_to_implement?: string;
  priority: number;
}

interface AIPlan {
  executive_summary: string;
  impact_score: number;
  priority_areas: Array<{ area: string; current_impact_pct: number; improvement_potential_pct: number }>;
  action_plan: ActionItem[];
  what_if_scenarios?: Array<{ scenario: string; co2_change_pct: number; cost_change_usd?: number; feasibility: string }>;
  sdg_alignment?: string[];
  motivational_message: string;
}

interface Props {
  context: "carbon_calculator" | "eco_predict" | "sustainability_index";
  userData: Record<string, any>;
  currentEmissions?: number;
  targetReduction?: number;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  hard: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};
const costColors: Record<string, string> = {
  free: "bg-emerald-500/20 text-emerald-300",
  low: "bg-cyan-500/20 text-cyan-300",
  medium: "bg-amber-500/20 text-amber-300",
  high: "bg-rose-500/20 text-rose-300",
};

export const AIRecommendationsPanel: React.FC<Props> = ({
  context, userData, currentEmissions, targetReduction = 30,
}) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIPlan | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("eco-ai-recommendations", {
        body: { context, userData, currentEmissions, targetReduction, language: "ar" },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      setPlan(data as AIPlan);
      toast.success("تم توليد خطة شخصية ذكية!");
    } catch (e: any) {
      toast.error(e.message || "فشل توليد التوصيات");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-900/40 to-cyan-900/40 backdrop-blur-xl rounded-3xl p-6 border border-violet-500/30 shadow-2xl text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4 shadow-xl shadow-violet-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">خطة شخصية ذكية بالـ AI</h3>
        <p className="text-sm text-gray-300 mb-5 max-w-md mx-auto">
          احصل على خطة عمل مخصّصة لبياناتك مع تقدير لتوفير CO₂، التكلفة، والصعوبة لكل خطوة.
        </p>
        <Button
          onClick={generate}
          disabled={loading}
          className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              يحلّل ويولّد...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 ml-2" />
              ولّد خطتي الذكية
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header / Summary */}
      <div className="bg-gradient-to-br from-violet-900/40 to-cyan-900/40 backdrop-blur-xl rounded-3xl p-6 border border-violet-500/30 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">خطتك الذكية الشخصية</h3>
              <p className="text-xs text-gray-400">مولّدة بالذكاء الاصطناعي</p>
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase">تأثيرك</div>
            <div className="text-2xl font-bold text-violet-300">{plan.impact_score}/100</div>
          </div>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">{plan.executive_summary}</p>

        {plan.sdg_alignment && plan.sdg_alignment.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plan.sdg_alignment.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[11px] text-cyan-300">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority Areas */}
      {plan.priority_areas && plan.priority_areas.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-300" />
            <h4 className="text-sm font-bold text-cyan-300">مجالات الأولوية</h4>
          </div>
          <div className="space-y-2">
            {plan.priority_areas.map((p, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white">{p.area}</span>
                  <span className="text-xs text-emerald-300">قابل للتحسين {p.improvement_potential_pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${p.current_impact_pct}%` }} />
                </div>
                <div className="text-[10px] text-gray-500 mt-1">يمثل {p.current_impact_pct.toFixed(0)}% من بصمتك</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-emerald-300" />
          <h4 className="text-sm font-bold text-emerald-300">خطة العمل ({plan.action_plan.length} خطوة)</h4>
        </div>
        <div className="space-y-3">
          {plan.action_plan
            .sort((a, b) => a.priority - b.priority)
            .map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-white/[0.04] to-transparent rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {a.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-white">{a.title}</h5>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{a.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${difficultyColors[a.difficulty]}`}>
                    {a.difficulty === "easy" ? "سهل" : a.difficulty === "medium" ? "متوسط" : "صعب"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${costColors[a.cost]}`}>
                    {a.cost === "free" ? "مجاني" : a.cost === "low" ? "تكلفة قليلة" : a.cost === "medium" ? "تكلفة متوسطة" : "تكلفة عالية"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <TrendingDown className="w-2.5 h-2.5" /> {a.co2_savings_kg_year.toFixed(0)} كج CO₂/سنة
                  </span>
                  {a.money_savings_usd_year && a.money_savings_usd_year > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" /> توفّر ${a.money_savings_usd_year.toFixed(0)}/سنة
                    </span>
                  )}
                  {a.time_to_implement && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/60 border border-white/10 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {a.time_to_implement}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Motivational */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-4">
        <p className="text-sm text-emerald-100 italic text-center">💚 {plan.motivational_message}</p>
      </div>

      <Button
        onClick={() => { setPlan(null); generate(); }}
        variant="outline"
        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
      >
        <Sparkles className="w-4 h-4 ml-2" />
        ولّد خطة جديدة
      </Button>
    </motion.div>
  );
};

export default AIRecommendationsPanel;
