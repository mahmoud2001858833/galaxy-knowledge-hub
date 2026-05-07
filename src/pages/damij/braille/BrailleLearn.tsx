import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, ArrowLeftRight, Globe, Mic, Volume2, Copy, Star,
  Loader2, Sparkles, Search, Trash2, History, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SPOKEN_LANGUAGES } from "@/features/sign-language/languages";
import { BrailleCellDisplay } from "@/features/braille/learn/BrailleCellDisplay";
import type { Dots } from "@/features/braille/learn/brailleAlphabet";
import BackToBrailleButton from "@/components/damij/BackToBrailleButton";

type Direction = "to-braille" | "from-braille";

interface HistoryItem {
  ts: number;
  direction: Direction;
  langCode: string;
  grade: 1 | 2;
  input: string;
  output: string;
}

const HISTORY_KEY = "braille-dict-history";
const FAV_KEY = "braille-dict-favorites";

function loadStore<T>(k: string): T[] {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
}
function saveStore<T>(k: string, v: T[]) {
  try { localStorage.setItem(k, JSON.stringify(v.slice(0, 50))); } catch { /* ignore */ }
}

// Convert a unicode braille char (U+2800..U+28FF) to dot list 1..6 (or 1..8)
function brailleCharToDots(ch: string): Dots {
  const cp = ch.codePointAt(0) || 0;
  if (cp < 0x2800 || cp > 0x28FF) return [];
  const bits = cp - 0x2800;
  const out: number[] = [];
  // Unicode braille bit order: 1=0x01,2=0x02,3=0x04,4=0x08,5=0x10,6=0x20,7=0x40,8=0x80
  [1, 2, 3, 4, 5, 6, 7, 8].forEach((d, i) => {
    if (bits & (1 << i)) out.push(d);
  });
  return out as Dots;
}

const BrailleLearn: React.FC = () => {
  const [direction, setDirection] = useState<Direction>("to-braille");
  const [langCode, setLangCode] = useState("ar-SA");
  const [grade, setGrade] = useState<1 | 2>(1);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => loadStore<HistoryItem>(HISTORY_KEY));
  const [favorites, setFavorites] = useState<HistoryItem[]>(() => loadStore<HistoryItem>(FAV_KEY));

  const lang = useMemo(
    () => SPOKEN_LANGUAGES.find((l) => l.code === langCode) || SPOKEN_LANGUAGES[0],
    [langCode],
  );

  useEffect(() => { saveStore(HISTORY_KEY, history); }, [history]);
  useEffect(() => { saveStore(FAV_KEY, favorites); }, [favorites]);

  const swapDirection = () => {
    setDirection((d) => (d === "to-braille" ? "from-braille" : "to-braille"));
    setInput(output); setOutput(""); setError(null);
  };

  const translate = async () => {
    const text = input.trim();
    if (!text) { toast.error("أدخل نصاً أولاً"); return; }
    setBusy(true); setError(null); setOutput("");
    try {
      const isReverse = direction === "from-braille";
      const body = isReverse
        ? { mode: "reverse", braille: text, langCode: langCode.split("-")[0], langName: lang.name }
        : { mode: "convert", text, grade, langCode: langCode.split("-")[0], langName: lang.name };
      const { data, error } = await supabase.functions.invoke("braille-convert", { body });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const out = isReverse ? (data as any).text : (data as any).braille;
      setOutput(out || "");
      const item: HistoryItem = {
        ts: Date.now(), direction, langCode, grade,
        input: text, output: out || "",
      };
      setHistory((h) => [item, ...h.filter((x) => !(x.input === item.input && x.direction === item.direction))].slice(0, 20));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "فشلت الترجمة");
      toast.error(e?.message || "فشلت الترجمة");
    } finally {
      setBusy(false);
    }
  };

  const speak = (txt: string, isBraille = false) => {
    const t = (isBraille ? input : txt).trim();
    if (!t) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(isBraille ? input : txt);
      u.lang = langCode;
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch { toast.error("النطق الصوتي غير مدعوم"); }
  };

  const startMic = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { toast.error("التعرف الصوتي غير مدعوم في هذا المتصفح"); return; }
    const rec = new SR();
    rec.lang = langCode; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onerror = () => { setListening(false); toast.error("تعذّر التقاط الصوت"); };
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const txt = e.results?.[0]?.[0]?.transcript || "";
      if (txt) setInput(txt);
    };
    try { rec.start(); } catch { setListening(false); }
  };

  const copy = (t: string) => { if (!t) return; navigator.clipboard.writeText(t); toast.success("تم النسخ"); };

  const toggleFav = () => {
    if (!output) return;
    const item: HistoryItem = { ts: Date.now(), direction, langCode, grade, input, output };
    const exists = favorites.find((f) => f.input === item.input && f.direction === item.direction);
    if (exists) {
      setFavorites((f) => f.filter((x) => x !== exists));
      toast.success("أُزيل من المفضلة");
    } else {
      setFavorites((f) => [item, ...f].slice(0, 50));
      toast.success("أُضيف إلى المفضلة ⭐");
    }
  };

  const reuse = (h: HistoryItem) => {
    setDirection(h.direction); setLangCode(h.langCode); setGrade(h.grade);
    setInput(h.input); setOutput(h.output); setError(null);
  };

  // Render braille cells (max 60 to keep it light)
  const cells = useMemo(() => {
    const src = direction === "to-braille" ? output : input;
    const chars = [...src].filter((c) => {
      const cp = c.codePointAt(0) || 0;
      return cp >= 0x2800 && cp <= 0x28FF;
    }).slice(0, 60);
    return chars.map((c, i) => ({ ch: c, dots: brailleCharToDots(c), i }));
  }, [output, input, direction]);

  const fmt = (l: typeof lang) => `${l.flag} ${l.nativeName} — ${l.name}`;
  const isFav = output && favorites.some((f) => f.input === input && f.direction === direction);

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))]/10 mb-4">
          <BookOpen className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">
          قاموس بريل العالمي
        </h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          ترجمة احترافية بين <b>{SPOKEN_LANGUAGES.length}+ لغة</b> وبريل،
          مع <b>نطق صوتي</b>، <b>إدخال بالميكروفون</b>، و<b>الرجوع من بريل إلى نص</b>.
        </p>
        <div className="inline-flex items-center gap-1 mt-3 text-xs text-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> مدعوم بالذكاء الاصطناعي
        </div>
      </header>

      {/* Direction switch */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => { setDirection("to-braille"); setOutput(""); }}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
            direction === "to-braille"
              ? "bg-[hsl(var(--damij-primary))] text-white shadow-lg"
              : "bg-white text-[hsl(var(--damij-primary))] border border-[hsl(var(--damij-primary))]/20"
          }`}
        >
          نص → بريل
        </button>
        <button
          onClick={swapDirection}
          className="p-2.5 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/20 text-[hsl(var(--damij-primary))] hover:bg-[hsl(var(--damij-primary))]/5"
          title="تبديل الاتجاه"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setDirection("from-braille"); setOutput(""); }}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
            direction === "from-braille"
              ? "bg-[hsl(var(--damij-primary))] text-white shadow-lg"
              : "bg-white text-[hsl(var(--damij-primary))] border border-[hsl(var(--damij-primary))]/20"
          }`}
        >
          بريل → نص
        </button>
      </div>

      {/* Options */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-3">
          <label className="text-xs font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4" /> اللغة
          </label>
          <select
            value={langCode}
            onChange={(e) => setLangCode(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[hsl(var(--damij-primary))]/20 bg-white text-sm"
          >
            {SPOKEN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{fmt(l)}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-3">
          <label className="text-xs font-bold text-[hsl(var(--damij-primary))] mb-1 block">
            مستوى بريل
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: 1, label: "المستوى الأول", desc: "حرفي" },
              { v: 2, label: "المستوى الثاني", desc: "اختزالي" },
            ].map((g) => (
              <button
                key={g.v}
                onClick={() => setGrade(g.v as 1 | 2)}
                disabled={direction === "from-braille"}
                className={`p-2 rounded-lg border text-xs font-bold flex flex-col disabled:opacity-50 ${
                  grade === g.v
                    ? "bg-[hsl(var(--damij-primary))] text-white border-transparent"
                    : "bg-white text-[hsl(var(--damij-primary))] border-[hsl(var(--damij-primary))]/20"
                }`}
              >
                <span>{g.label}</span>
                <span className="text-[10px] opacity-80 font-normal">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))]">
            {direction === "to-braille" ? `الكلمة بـ ${lang.nativeName}` : "خلايا بريل"}
          </label>
          <div className="flex gap-1">
            {direction === "to-braille" && (
              <button
                onClick={startMic}
                className={`p-2 rounded-lg ${listening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200"}`}
                title="إدخال صوتي"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => speak(input)}
              disabled={!input || direction === "from-braille"}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
              title="نطق المدخل"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setInput(""); setOutput(""); setError(null); }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
              title="مسح"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); translate(); } }}
          rows={direction === "from-braille" ? 4 : 2}
          placeholder={
            direction === "to-braille"
              ? `اكتب كلمة أو جملة بـ ${lang.nativeName}…`
              : "ألصق نص بريل (⠁⠃⠉…)"
          }
          dir={direction === "from-braille" ? "ltr" : "auto"}
          className={`w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white ${
            direction === "from-braille" ? "text-2xl font-mono leading-loose" : "text-base"
          }`}
          style={direction === "from-braille" ? { fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' } : undefined}
        />
        <button
          onClick={translate}
          disabled={busy}
          className="mt-3 w-full py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {busy ? "جارٍ الترجمة…" : direction === "to-braille" ? "ترجم إلى بريل" : "فك ترميز إلى نص"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20 mb-6"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold text-[hsl(var(--damij-primary))]">
              {direction === "to-braille" ? `الناتج بريل (المستوى ${grade === 2 ? "الثاني" : "الأول"})` : `النص بـ ${lang.nativeName}`}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => speak(direction === "to-braille" ? input : output)} className="p-2 rounded-lg bg-white hover:bg-slate-100" title="نطق">
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={() => copy(output)} className="p-2 rounded-lg bg-white hover:bg-slate-100" title="نسخ">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={toggleFav} className="p-2 rounded-lg bg-white hover:bg-slate-100" title="مفضلة">
                <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-500" : ""}`} />
              </button>
            </div>
          </div>

          {direction === "to-braille" ? (
            <>
              <div
                className="p-4 rounded-xl bg-white text-4xl leading-loose whitespace-pre-wrap font-mono mb-4"
                dir="ltr"
                style={{ fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' }}
              >
                {output}
              </div>
              {cells.length > 0 && (
                <div>
                  <p className="text-xs text-[hsl(var(--damij-text))]/60 mb-2">
                    التمثيل البصري بالنقاط {cells.length < [...output].filter(c => { const cp = c.codePointAt(0) || 0; return cp >= 0x2800 && cp <= 0x28FF; }).length ? "(أول 60 خلية)" : ""}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cells.map((c) => (
                      <BrailleCellDisplay key={c.i} dots={c.dots} size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 rounded-xl bg-white text-lg leading-relaxed whitespace-pre-wrap" dir="auto">
              {output}
            </div>
          )}
        </motion.div>
      )}

      {/* History & Favorites */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
              <History className="w-4 h-4" /> آخر عمليات البحث
            </h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:underline">مسح</button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-[hsl(var(--damij-text))]/50">لا يوجد بحث سابق بعد.</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-auto">
              {history.map((h) => (
                <li key={h.ts}>
                  <button
                    onClick={() => reuse(h)}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-50 border border-slate-100"
                  >
                    <div className="text-sm font-bold text-[hsl(var(--damij-primary))] truncate">{h.input}</div>
                    <div className="text-xs text-[hsl(var(--damij-text))]/60 truncate font-mono" dir="ltr">
                      {h.direction === "to-braille" ? "→ " : "← "}{h.output}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" /> المفضلة
            </h3>
            {favorites.length > 0 && (
              <button onClick={() => setFavorites([])} className="text-xs text-red-500 hover:underline">مسح</button>
            )}
          </div>
          {favorites.length === 0 ? (
            <p className="text-sm text-[hsl(var(--damij-text))]/50">احفظ ترجمات بالنجمة ⭐ لتجدها هنا.</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-auto">
              {favorites.map((h) => (
                <li key={h.ts}>
                  <button
                    onClick={() => reuse(h)}
                    className="w-full text-right p-2 rounded-lg hover:bg-yellow-50 border border-yellow-100"
                  >
                    <div className="text-sm font-bold text-[hsl(var(--damij-primary))] truncate">{h.input}</div>
                    <div className="text-xs text-[hsl(var(--damij-text))]/60 truncate font-mono" dir="ltr">
                      {h.direction === "to-braille" ? "→ " : "← "}{h.output}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrailleLearn;
