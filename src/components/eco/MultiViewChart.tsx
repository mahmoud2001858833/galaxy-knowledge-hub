import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Radar as RadarIcon } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export interface ChartDatum {
  name: string;
  value: number;
}

interface Props {
  data: ChartDatum[];
  title?: string;
  description?: string;
  unit?: string;
  defaultView?: "bar" | "line" | "pie" | "radar";
  colorScheme?: "emerald" | "violet" | "blue" | "rose";
}

const COLOR_SETS: Record<string, string[]> = {
  emerald: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#22d3ee", "#0891b2"],
  violet: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#ec4899", "#f472b6"],
  blue: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#06b6d4", "#0ea5e9"],
  rose: ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#ffe4e6", "#f97316", "#fb923c"],
};

export const MultiViewChart: React.FC<Props> = ({
  data, title, description, unit = "", defaultView = "bar", colorScheme = "emerald",
}) => {
  const [view, setView] = useState<"bar" | "line" | "pie" | "radar">(defaultView);
  const colors = COLOR_SETS[colorScheme];

  const tooltipStyle = {
    backgroundColor: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    color: "#fff",
  };

  const views = [
    { id: "bar" as const, label: "أعمدة", icon: BarChart3 },
    { id: "line" as const, label: "خط", icon: LineIcon },
    { id: "pie" as const, label: "دائرة", icon: PieIcon },
    { id: "radar" as const, label: "رادار", icon: RadarIcon },
  ];

  const renderChart = () => {
    switch (view) {
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" height={60} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} ${unit}`, "القيمة"]} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Bar>
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" height={60} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} ${unit}`, "القيمة"]} />
            <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} dot={{ fill: colors[1], r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              dataKey="value"
            >
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} ${unit}`, "القيمة"]} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
          </PieChart>
        );
      case "radar":
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: "#fff", fontSize: 11 }} />
            <PolarRadiusAxis angle={90} tick={{ fill: "#94a3b8", fontSize: 9 }} />
            <Radar name="القيمة" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.4} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} ${unit}`, "القيمة"]} />
          </RadarChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {views.map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                title={v.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === v.id
                    ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MultiViewChart;
