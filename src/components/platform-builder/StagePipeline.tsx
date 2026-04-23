import { CheckCircle2, Loader2, Circle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export type StageStatus = "pending" | "running" | "done" | "error";

export interface Stage {
  id: string;
  title: string;
  emoji: string;
  description: string;
  status: StageStatus;
  summary?: string;
  error?: string;
}

interface Props {
  stages: Stage[];
}

export default function StagePipeline({ stages }: Props) {
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`relative rounded-2xl border p-4 backdrop-blur-md transition-all ${
            stage.status === "done"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : stage.status === "running"
              ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_30px_-10px_rgba(34,211,238,0.6)]"
              : stage.status === "error"
              ? "border-rose-500/50 bg-rose-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{stage.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white/50">
                  المرحلة {i + 1}
                </span>
                <h3 className="font-bold text-white truncate">{stage.title}</h3>
              </div>
              <p className="text-sm text-white/70">{stage.description}</p>
              {stage.summary && stage.status === "done" && (
                <div className="mt-2 text-xs text-emerald-300/90 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                  ✓ {stage.summary}
                </div>
              )}
              {stage.error && stage.status === "error" && (
                <div className="mt-2 text-xs text-rose-300 bg-rose-500/10 rounded-lg px-3 py-2 border border-rose-500/20">
                  ⚠ {stage.error}
                </div>
              )}
              {stage.status === "running" && (
                <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ width: "50%" }}
                  />
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              {stage.status === "done" && (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              )}
              {stage.status === "running" && (
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              )}
              {stage.status === "error" && (
                <AlertCircle className="w-6 h-6 text-rose-400" />
              )}
              {stage.status === "pending" && (
                <Circle className="w-6 h-6 text-white/30" />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
