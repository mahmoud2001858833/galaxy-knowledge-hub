import { useState } from "react";
import { Palette, Layout, Type, Sparkles, ChevronDown, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DesignPreferences {
  style: string;          // movement / aesthetic
  palette: string;        // color palette key
  theme: "dark" | "light" | "auto";
  layout: string;         // hero archetype
  typography: string;     // font pairing
  vibe: string;           // mood
  useImages: boolean;     // include hero/gallery images
  customNotes: string;
}

export const DEFAULT_PREFERENCES: DesignPreferences = {
  style: "auto",
  palette: "auto",
  theme: "dark",
  layout: "auto",
  typography: "auto",
  vibe: "auto",
  useImages: true,
  customNotes: "",
};

const STYLES = [
  { id: "auto", label: "تلقائي (يختار AI)", emoji: "✨", desc: "اترك للذكاء الاصطناعي" },
  { id: "Glassmorphism", label: "زجاجي شفاف", emoji: "🪟", desc: "ضباب وشفافية وتدرجات", preview: "linear-gradient(135deg,rgba(168,85,247,.4),rgba(6,182,212,.4))" },
  { id: "Neumorphism", label: "ناعم بارز", emoji: "🫧", desc: "ظلال ناعمة وأسطح بارزة", preview: "linear-gradient(135deg,#e0e5ec,#c8cdd4)" },
  { id: "Brutalism", label: "وحشي جريء", emoji: "🧱", desc: "حواف حادة وألوان صريحة", preview: "linear-gradient(135deg,#000,#facc15)" },
  { id: "Minimalism", label: "بساطة فاخرة", emoji: "⚪", desc: "هواء أبيض ودقة", preview: "linear-gradient(135deg,#fafafa,#e5e5e5)" },
  { id: "Cyberpunk", label: "سايبربانك", emoji: "🌃", desc: "نيون وردي وأزرق على أسود", preview: "linear-gradient(135deg,#0f172a,#ec4899,#06b6d4)" },
  { id: "Editorial Magazine", label: "مجلة فنية", emoji: "📰", desc: "تايبوغرافي كبير وصور بارزة", preview: "linear-gradient(135deg,#fff,#1a1a1a)" },
  { id: "Y2K", label: "ألفية Y2K", emoji: "💿", desc: "كروم ومعدني وألوان فلوريسنت", preview: "linear-gradient(135deg,#a855f7,#22d3ee,#f472b6)" },
  { id: "Japandi", label: "ياباندي هادئ", emoji: "🎋", desc: "خشب وبيج وطبيعة", preview: "linear-gradient(135deg,#d6c7a8,#5a4a3a)" },
  { id: "Aurora", label: "شفق قطبي", emoji: "🌌", desc: "تدرجات حالمة متموجة", preview: "linear-gradient(135deg,#7c3aed,#06b6d4,#10b981)" },
  { id: "Luxury", label: "فخامة ذهبية", emoji: "👑", desc: "أسود وذهب وخطوط راقية", preview: "linear-gradient(135deg,#000,#d4af37)" },
  { id: "Memphis", label: "مومفيس مرح", emoji: "🎨", desc: "أشكال هندسية وألوان زاهية", preview: "linear-gradient(135deg,#ec4899,#f59e0b,#06b6d4)" },
  { id: "Dark Academia", label: "أكاديميا داكنة", emoji: "📚", desc: "بني وكريم وكلاسيكية", preview: "linear-gradient(135deg,#3e2723,#8d6e63)" },
];

const PALETTES = [
  { id: "auto", label: "تلقائي", colors: ["#a855f7", "#06b6d4", "#10b981"] },
  { id: "violet-cyan", label: "بنفسجي وسماوي", colors: ["#7c3aed", "#06b6d4", "#0ea5e9"] },
  { id: "sunset", label: "غروب الشمس", colors: ["#f97316", "#ec4899", "#8b5cf6"] },
  { id: "ocean", label: "محيط هادئ", colors: ["#0ea5e9", "#06b6d4", "#3b82f6"] },
  { id: "forest", label: "غابة خضراء", colors: ["#16a34a", "#65a30d", "#10b981"] },
  { id: "rose-gold", label: "ذهبي وردي", colors: ["#f43f5e", "#fbbf24", "#fb7185"] },
  { id: "monochrome", label: "أحادي رمادي", colors: ["#0a0a0a", "#525252", "#a3a3a3"] },
  { id: "neon", label: "نيون كهربائي", colors: ["#22d3ee", "#a855f7", "#f0abfc"] },
  { id: "earth", label: "ترابي دافئ", colors: ["#a16207", "#78350f", "#d97706"] },
  { id: "candy", label: "حلوى باستيل", colors: ["#fbcfe8", "#bae6fd", "#bbf7d0"] },
  { id: "fire", label: "نار حمراء", colors: ["#dc2626", "#f97316", "#facc15"] },
  { id: "midnight", label: "منتصف الليل", colors: ["#1e1b4b", "#312e81", "#6366f1"] },
];

const LAYOUTS = [
  { id: "auto", label: "تلقائي", emoji: "✨" },
  { id: "split-image", label: "نص + صورة", emoji: "🖼️", desc: "عمودان: نص يسار وصورة يمين" },
  { id: "centered-spotlight", label: "بطل وسط", emoji: "🎯", desc: "كل شيء في المنتصف بقوة" },
  { id: "asymmetric-grid", label: "شبكة غير متماثلة", emoji: "⬛", desc: "تصميم Bento متنوع" },
  { id: "full-bleed-hero", label: "صورة كاملة العرض", emoji: "🌅", desc: "خلفية صورة ضخمة" },
  { id: "editorial-magazine", label: "مجلة احترافية", emoji: "📖", desc: "أعمدة وعناوين كبيرة" },
  { id: "floating-cards", label: "كروت طافية", emoji: "🎴", desc: "كروت بظلال عائمة" },
  { id: "gallery-mosaic", label: "موزاييك معرض", emoji: "🧩", desc: "صور بأحجام مختلفة" },
];

const TYPOGRAPHY = [
  { id: "auto", label: "تلقائي", emoji: "✨" },
  { id: "Cairo + Tajawal", label: "Cairo + Tajawal", emoji: "🅰️", desc: "كلاسيكي عصري" },
  { id: "Almarai + Cairo", label: "Almarai + Cairo", emoji: "🅱️", desc: "أنيق وواضح" },
  { id: "Reem Kufi + Tajawal", label: "Reem Kufi + Tajawal", emoji: "🔤", desc: "كوفي حديث" },
  { id: "Markazi Text + Almarai", label: "Markazi + Almarai", emoji: "📝", desc: "أدبي راقٍ" },
  { id: "Amiri + Cairo", label: "Amiri + Cairo", emoji: "✒️", desc: "تراثي كلاسيكي" },
  { id: "Aref Ruqaa + Tajawal", label: "Aref Ruqaa + Tajawal", emoji: "🖋️", desc: "خط رقعة فني" },
];

const VIBES = [
  { id: "auto", label: "تلقائي", emoji: "✨" },
  { id: "professional", label: "احترافي وجاد", emoji: "💼" },
  { id: "playful", label: "مرح ومفعم بالحيوية", emoji: "🎉" },
  { id: "luxurious", label: "فاخر وراقٍ", emoji: "💎" },
  { id: "minimal", label: "بسيط وهادئ", emoji: "🌿" },
  { id: "futuristic", label: "مستقبلي وتقني", emoji: "🚀" },
  { id: "warm", label: "دافئ وودود", emoji: "☀️" },
  { id: "elegant", label: "أنيق وفني", emoji: "🎭" },
  { id: "bold", label: "جريء وقوي", emoji: "⚡" },
];

interface Props {
  value: DesignPreferences;
  onChange: (v: DesignPreferences) => void;
  disabled?: boolean;
}

export default function DesignPreferencesPanel({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(true);

  const set = <K extends keyof DesignPreferences>(k: K, v: DesignPreferences[K]) =>
    onChange({ ...value, [k]: v });

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-white/80">
        <Icon className="w-3.5 h-3.5 text-cyan-300" />
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div className="text-right">
            <div className="font-bold text-white text-sm">تفضيلات التصميم</div>
            <div className="text-[11px] text-white/50">اختر الستايل والألوان والشكل قبل البناء</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/60 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-5 border-t border-white/10">
          {/* Style */}
          <Section icon={Sparkles} title="🎨 الستايل / الحركة التصميمية">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map((s) => {
                const active = value.style === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("style", s.id)}
                    className={`relative text-right p-2.5 rounded-xl border transition ${
                      active ? "border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div
                      className="w-full h-10 rounded-lg mb-1.5 border border-white/10"
                      style={{ background: s.preview || "linear-gradient(135deg,#1f2937,#374151)" }}
                    />
                    <div className="flex items-center gap-1 text-[12px] font-semibold text-white">
                      <span>{s.emoji}</span>
                      <span className="truncate">{s.label}</span>
                    </div>
                    <div className="text-[10px] text-white/50 truncate">{s.desc}</div>
                    {active && (
                      <Check className="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-cyan-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Palette */}
          <Section icon={Palette} title="🌈 لوحة الألوان">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PALETTES.map((p) => {
                const active = value.palette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("palette", p.id)}
                    className={`relative p-2.5 rounded-xl border transition text-right ${
                      active ? "border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex gap-1 mb-1.5">
                      {p.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-8 rounded-md border border-white/10" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="text-[12px] font-semibold text-white truncate">{p.label}</div>
                    {active && <Check className="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-cyan-300" />}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Theme */}
          <Section icon={Sparkles} title="🌗 الوضع">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "dark", label: "داكن", emoji: "🌙", bg: "bg-gradient-to-br from-slate-900 to-slate-800" },
                { id: "light", label: "فاتح", emoji: "☀️", bg: "bg-gradient-to-br from-white to-slate-100" },
                { id: "auto", label: "تلقائي", emoji: "✨", bg: "bg-gradient-to-br from-violet-500 to-cyan-500" },
              ].map((t) => {
                const active = value.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("theme", t.id as any)}
                    className={`p-2.5 rounded-xl border transition ${
                      active ? "border-cyan-400 ring-2 ring-cyan-400/30" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`h-10 rounded-md ${t.bg} mb-1.5 border border-white/10 flex items-center justify-center text-lg`}>
                      {t.emoji}
                    </div>
                    <div className="text-[12px] font-semibold text-white">{t.label}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Layout */}
          <Section icon={Layout} title="📐 شكل الصفحة الرئيسية">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LAYOUTS.map((l) => {
                const active = value.layout === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("layout", l.id)}
                    title={l.desc}
                    className={`p-2.5 rounded-xl border transition ${
                      active ? "border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl mb-1">{l.emoji}</div>
                    <div className="text-[11px] font-semibold text-white truncate">{l.label}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Typography */}
          <Section icon={Type} title="🔤 الخطوط">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPOGRAPHY.map((t) => {
                const active = value.typography === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("typography", t.id)}
                    className={`p-2.5 rounded-xl border transition text-right ${
                      active ? "border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="text-lg mb-1">{t.emoji}</div>
                    <div className="text-[11px] font-semibold text-white truncate">{t.label}</div>
                    {t.desc && <div className="text-[10px] text-white/50 truncate">{t.desc}</div>}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Vibe */}
          <Section icon={Sparkles} title="✨ الإحساس / المزاج">
            <div className="flex flex-wrap gap-1.5">
              {VIBES.map((v) => {
                const active = value.vibe === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => set("vibe", v.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition ${
                      active ? "border-cyan-400 bg-cyan-500/15 text-cyan-200" : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                    }`}
                  >
                    <span>{v.emoji}</span> {v.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Images toggle + custom notes */}
          <Section icon={ImageIcon} title="🖼️ الصور والإضافات">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/20">
              <input
                type="checkbox"
                checked={value.useImages}
                onChange={(e) => set("useImages", e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 accent-cyan-500"
              />
              <div className="flex-1 text-right">
                <div className="text-xs font-semibold text-white">تضمين صور احترافية من Unsplash</div>
                <div className="text-[10px] text-white/50">صور hero ومعرض وصور ميزات مختارة بناءً على نوع المنصة</div>
              </div>
            </label>

            <textarea
              value={value.customNotes}
              onChange={(e) => set("customNotes", e.target.value)}
              disabled={disabled}
              rows={2}
              placeholder="ملاحظات تصميمية إضافية (اختياري) — مثلاً: استخدم اللون الأخضر بكثرة، اجعل الفوتر بسيطاً، أضف موجات في الخلفية..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-white/30 resize-none mt-2 focus:outline-none focus:border-cyan-400"
            />
          </Section>

          {/* Reset */}
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => onChange(DEFAULT_PREFERENCES)}
              className="h-7 text-[11px] text-white/50 hover:text-white"
            >
              إعادة التعيين
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
