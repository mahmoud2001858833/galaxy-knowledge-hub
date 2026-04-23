import { Database, Sparkles, Clock, Layers } from "lucide-react";

interface Props {
  totalPlatforms: number;
  totalBuilds: number;
  lastBuildAt?: string | null;
  avgStages: number;
}

export default function BuilderDashboard({ totalPlatforms, totalBuilds, lastBuildAt, avgStages }: Props) {
  const cards = [
    { label: "منصات محفوظة", value: totalPlatforms, icon: Database, color: "from-violet-500 to-purple-600" },
    { label: "إجمالي عمليات البناء", value: totalBuilds, icon: Sparkles, color: "from-cyan-500 to-blue-600" },
    { label: "متوسط المراحل المنجزة", value: `${avgStages}/5`, icon: Layers, color: "from-emerald-500 to-teal-600" },
    { label: "آخر بناء", value: lastBuildAt ? new Date(lastBuildAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) : "—", icon: Clock, color: "from-pink-500 to-rose-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 transition">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-sm text-white/60 mt-1">{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}
