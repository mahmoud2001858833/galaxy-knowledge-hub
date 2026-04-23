import { Settings, Zap, Sparkles } from "lucide-react";

export interface BuilderConfig {
  uiModel: "google/gemini-2.5-pro" | "google/gemini-2.5-flash";
  logicModel: "google/gemini-2.5-pro" | "google/gemini-2.5-flash";
  defaultLanguage: "ar" | "en";
  includeAuth: boolean;
  includeAI: boolean;
  includeCodeRunner: boolean;
}

interface Props {
  config: BuilderConfig;
  onChange: (c: BuilderConfig) => void;
}

export default function BuilderSettings({ config, onChange }: Props) {
  const update = (patch: Partial<BuilderConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h3 className="font-bold text-white">نموذج توليد الواجهة</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "google/gemini-2.5-pro", l: "Pro (جودة أعلى)", i: Sparkles },
            { v: "google/gemini-2.5-flash", l: "Flash (أسرع)", i: Zap },
          ].map((o) => {
            const Icon = o.i;
            const active = config.uiModel === o.v;
            return (
              <button
                key={o.v}
                onClick={() => update({ uiModel: o.v as any })}
                className={`p-3 rounded-xl border text-sm transition flex items-center gap-2 ${
                  active ? "border-violet-500 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" /> {o.l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white">نموذج توليد المنطق (JS)</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "google/gemini-2.5-pro", l: "Pro" },
            { v: "google/gemini-2.5-flash", l: "Flash" },
          ].map((o) => {
            const active = config.logicModel === o.v;
            return (
              <button
                key={o.v}
                onClick={() => update({ logicModel: o.v as any })}
                className={`p-3 rounded-xl border text-sm transition ${
                  active ? "border-cyan-500 bg-cyan-500/20 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {o.l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
        <h3 className="font-bold text-white mb-4">ميزات تُضاف افتراضياً</h3>
        <div className="space-y-2">
          {[
            { k: "includeAuth" as const, l: "🔐 تسجيل دخول وملف شخصي" },
            { k: "includeAI" as const, l: "🤖 مساعد ذكاء اصطناعي" },
            { k: "includeCodeRunner" as const, l: "💻 محرر ومنفذ كود (Python/C++)" },
          ].map((f) => (
            <label key={f.k} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
              <span className="text-white/80 text-sm">{f.l}</span>
              <input
                type="checkbox"
                checked={config[f.k]}
                onChange={(e) => update({ [f.k]: e.target.checked } as any)}
                className="w-5 h-5 accent-violet-500"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
