import React from "react";
import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

export interface BenchmarkRow {
  label: string;
  value: number;
}

interface Props {
  userValue: number;
  unit?: string;
  benchmarks?: BenchmarkRow[];
  title?: string;
  description?: string;
}

const DEFAULT_BENCHMARKS: BenchmarkRow[] = [
  { label: "هدف باريس 2030", value: 2.0 },
  { label: "متوسط الأردن", value: 3.1 },
  { label: "المتوسط العالمي", value: 4.7 },
  { label: "متوسط الاتحاد الأوروبي", value: 6.2 },
  { label: "متوسط الولايات المتحدة", value: 14.4 },
];

export const GlobalComparisonChart: React.FC<Props> = ({
  userValue,
  unit = "طن CO₂/سنة",
  benchmarks = DEFAULT_BENCHMARKS,
  title = "المقارنة مع المعدلات العالمية",
  description = "بصمتك مقابل المتوسطات الدولية للفرد سنوياً",
}) => {
  const data = [
    { label: "أنت", value: Number(userValue.toFixed(2)), isUser: true },
    ...benchmarks.map(b => ({ label: b.label, value: b.value, isUser: false })),
  ];

  const worldAvg = benchmarks.find(b => b.label.includes("العالمي"))?.value ?? 4.7;
  const diff = userValue - worldAvg;
  const diffPct = worldAvg > 0 ? (diff / worldAvg) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/20 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-300">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
        <div
          className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
            diff <= 0
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-rose-500/20 text-rose-300"
          }`}
        >
          {diff <= 0 ? "▼" : "▲"} {Math.abs(diffPct).toFixed(0)}% vs العالم
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              angle={-25}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis stroke="#94a3b8" fontSize={11} unit="" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(59,130,246,0.4)",
                borderRadius: 12,
                color: "#fff",
              }}
              formatter={(v: number) => [`${v} ${unit}`, "القيمة"]}
            />
            <ReferenceLine
              y={2.0}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: "هدف 2030", fill: "#10b981", fontSize: 10, position: "right" }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.isUser ? "#f59e0b" : "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="text-amber-300 font-bold">بصمتك</div>
          <div className="text-white text-lg font-bold">
            {userValue.toFixed(2)} <span className="text-xs text-gray-400">{unit}</span>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          <div className="text-emerald-300 font-bold">الفجوة عن هدف 2030</div>
          <div className="text-white text-lg font-bold">
            {Math.max(0, userValue - 2.0).toFixed(2)} <span className="text-xs text-gray-400">{unit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalComparisonChart;
