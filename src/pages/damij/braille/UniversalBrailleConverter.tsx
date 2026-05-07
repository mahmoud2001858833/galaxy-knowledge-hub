import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Loader2, Download, Copy, Volume2,
  Eye, Sparkles, Languages, FileText, AlertCircle, Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SPOKEN_LANGUAGES } from "@/features/sign-language/languages";
import { brailleToBrf, brailleToPdf, downloadText } from "@/features/braille/brailleExport";

const UniversalBrailleConverter: React.FC = () => {
  const navigate = useNavigate();
  const [brailleInput, setBrailleInput] = useState("");
  const [decoded, setDecoded] = useState("");
  const [decodedBraille, setDecodedBraille] = useState("");
  const [reBusy, setReBusy] = useState(false);
  const [grade, setGrade] = useState<1 | 2>(1);
  const [langCode, setLangCode] = useState("ar-SA");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const lang = SPOKEN_LANGUAGES.find((l) => l.code === langCode) || SPOKEN_LANGUAGES[0];

  const reset = () => { setDecoded(""); setDecodedBraille(""); setError(null); };

  const run = async () => {
    setError(null); setBusy(true); setDecoded(""); setDecodedBraille("");
    try {
      const b = brailleInput.trim();
      if (!b) throw new Error("الرجاء إدخال نص بريل");
      setStep("فك ترميز بريل…");
      const { data, error } = await supabase.functions.invoke("braille-convert", {
        body: { mode: "reverse", braille: b, langCode: langCode.split("-")[0], langName: lang.name },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setDecoded((data as any).text || "");
      toast.success("تم فك الترميز بنجاح");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "فشل فك الترميز");
      toast.error(e?.message || "فشل فك الترميز");
    } finally {
      setBusy(false); setStep("");
    }
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("تم النسخ"); };
  const speak = (t: string) => {
    if (!t.trim()) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = langCode;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const reConvertToBraille = async () => {
    if (!decoded.trim()) return;
    setReBusy(true); setDecodedBraille("");
    try {
      const { data, error } = await supabase.functions.invoke("braille-convert", {
        body: { mode: "convert", text: decoded, grade, langCode: langCode.split("-")[0], langName: lang.name },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setDecodedBraille((data as any).braille || "");
      toast.success("تم إعادة التحويل إلى بريل");
    } catch (e: any) {
      toast.error(e?.message || "فشل إعادة التحويل");
    } finally { setReBusy(false); }
  };

  const fmt = (l: typeof lang) => `${l.flag} ${l.nativeName} — ${l.name}`;

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))]/10 mb-4">
          <Eye className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">
          محوّل بريل العالمي
        </h1>
        <p className="text-[hsl(var(--damij-text))]/70 max-w-2xl mx-auto">
          فك ترميز نصوص بريل إلى نص عادي بأكثر من <b>{SPOKEN_LANGUAGES.length}</b> لغة،
          مع دعم <b>المستوى الأول والثاني</b> (الاختزالي).
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 text-xs text-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> مدعوم بالذكاء الاصطناعي
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[hsl(var(--damij-primary))] hover:opacity-90 px-4 py-2 rounded-full shadow-md transition-all"
            title="الرجوع إلى الصفحة الرئيسية"
          >
            <Home className="w-4 h-4" /> الرجوع إلى بريل
          </button>
        </div>
      </header>

      {/* Options */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" /> اللغة
          </label>
          <select
            value={langCode}
            onChange={(e) => setLangCode(e.target.value)}
            className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white"
          >
            {SPOKEN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{fmt(l)}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4" /> المستوى
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: 1, label: "المستوى الأول", desc: "حرفي" },
              { v: 2, label: "المستوى الثاني", desc: "اختزالي" },
            ].map((g) => (
              <button
                key={g.v}
                onClick={() => setGrade(g.v as 1 | 2)}
                className={`p-3 rounded-xl border text-sm font-bold flex flex-col ${
                  grade === g.v
                    ? "bg-[hsl(var(--damij-primary))] text-white border-transparent"
                    : "bg-white text-[hsl(var(--damij-primary))] border-[hsl(var(--damij-primary))]/20"
                }`}
              >
                <span>{g.label}</span>
                <span className="text-[11px] opacity-80 font-normal">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4 flex flex-col">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-2">إجراء</label>
          <button
            onClick={run}
            disabled={busy}
            className="flex-1 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {busy ? step || "جارٍ المعالجة…" : "فك ترميز إلى نص"}
          </button>
        </div>
      </div>

      {/* Braille input */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-5 mb-6">
        <textarea
          value={brailleInput}
          onChange={(e) => setBrailleInput(e.target.value)}
          rows={6}
          placeholder="ألصق نص بريل (⠁⠃⠉ ...) — يدعم المستوى الأول والثاني"
          className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-2xl leading-loose font-mono"
          dir="ltr"
          style={{ fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' }}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Reverse result */}
      {decoded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
              <FileText className="w-4 h-4" /> النص بعد فك ترميز بريل ({lang.nativeName})
            </h3>
            <div className="flex gap-1 flex-wrap">
              <button onClick={reConvertToBraille} disabled={reBusy} className="px-3 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-60" title="إعادة التحويل إلى بريل">
                {reBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                {reBusy ? "جارٍ…" : "إعادة إلى بريل"}
              </button>
              <button onClick={() => speak(decoded)} className="p-2 rounded-lg hover:bg-slate-100" title="نطق"><Volume2 className="w-4 h-4" /></button>
              <button onClick={() => copy(decoded)} className="p-2 rounded-lg hover:bg-slate-100" title="نسخ"><Copy className="w-4 h-4" /></button>
              <button onClick={() => downloadText(decoded, `braille-decoded-${Date.now()}.txt`)} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1" title="تنزيل">
                <Download className="w-3 h-3" /> TXT
              </button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-auto p-3 rounded-xl bg-slate-50 text-base leading-relaxed whitespace-pre-wrap" dir="auto">
            {decoded}
          </div>
          <p className="text-xs text-slate-500 mt-2">عدد المحارف: {decoded.length.toLocaleString()}</p>

          {decodedBraille && (
            <div className="mt-4 pt-4 border-t border-[hsl(var(--damij-primary))]/15">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Eye className="w-4 h-4" /> ناتج بريل بعد إعادة التحويل (المستوى {grade === 2 ? "الثاني" : "الأول"})
                </h4>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => copy(decodedBraille)} className="p-2 rounded-lg hover:bg-slate-100" title="نسخ"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => downloadText(brailleToBrf(decodedBraille), `braille-${Date.now()}.brf`)}
                    className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1" title="تنزيل BRF">
                    <Download className="w-3 h-3" /> BRF
                  </button>
                  <button onClick={() => brailleToPdf(decodedBraille, `braille-${lang.name}`)}
                    className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1" title="تنزيل PDF">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
              <div
                className="max-h-[360px] overflow-auto p-4 rounded-xl bg-white border text-3xl leading-loose whitespace-pre-wrap font-mono"
                dir="ltr"
                style={{ fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' }}
              >
                {decodedBraille}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UniversalBrailleConverter;
