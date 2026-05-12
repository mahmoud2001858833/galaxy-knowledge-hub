import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileUp, Globe, Type, Loader2, Download, Copy, Volume2,
  Trash2, Eye, Sparkles, Languages, FileText, Link as LinkIcon, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SPOKEN_LANGUAGES } from "@/features/sign-language/languages";
import { extractFromFile } from "@/features/braille/extractText";
import { brailleToBrf, brailleToPdf, downloadText } from "@/features/braille/brailleExport";

type Source = "file" | "url" | "text" | "braille";

const UniversalBrailleConverter: React.FC = () => {
  const [source, setSource] = useState<Source>("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [brailleInput, setBrailleInput] = useState("");
  const [decoded, setDecoded] = useState("");
  const [decodedBraille, setDecodedBraille] = useState("");
  const [reBusy, setReBusy] = useState(false);
  const [extracted, setExtracted] = useState("");
  const [braille, setBraille] = useState("");
  const [grade, setGrade] = useState<1 | 2>(1);
  const [langCode, setLangCode] = useState("ar-SA");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lang = SPOKEN_LANGUAGES.find((l) => l.code === langCode) || SPOKEN_LANGUAGES[0];

  const reset = () => {
    setExtracted(""); setBraille(""); setDecoded(""); setDecodedBraille(""); setError(null);
  };

  const handleFile = (f: File | null) => {
    setFile(f); reset();
  };

  const run = async () => {
    setError(null); setBusy(true); setBraille(""); setExtracted(""); setDecoded(""); setDecodedBraille("");
    try {
      // Reverse: Braille → text
      if (source === "braille") {
        const b = brailleInput.trim();
        if (!b) throw new Error("الرجاء إدخال نص بريل");
        setStep("فك ترميز بريل…");
        const { data, error } = await supabase.functions.invoke("braille-convert", {
          body: { mode: "reverse", braille: b, grade, langCode: langCode.split("-")[0], langName: lang.name },
        });
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
        setDecoded((data as any).text || "");
        toast.success("تم فك الترميز بنجاح");
        return;
      }

      // 1) Extract source text
      let text = "";
      if (source === "text") {
        text = rawText.trim();
        if (!text) throw new Error("الرجاء إدخال نص");
      } else if (source === "url") {
        let u = url.trim();
        if (!u) throw new Error("الرجاء إدخال رابط");
        if (!/^https?:\/\//i.test(u)) u = "https://" + u;
        try { new URL(u); } catch { throw new Error("الرابط غير صالح"); }
        setStep("جلب صفحة الويب…");
        const { data, error } = await supabase.functions.invoke("braille-convert", {
          body: { mode: "fetch_url", url: u },
        });
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
        text = (data as any).text || "";
        if (!text.trim()) throw new Error("لم يتم استخراج أي نص من الصفحة");
      } else {
        if (!file) throw new Error("الرجاء اختيار ملف");
        text = await extractFromFile(file, langCode, setStep);
      }
      text = text.trim();
      if (!text) throw new Error("لم يتم العثور على نص قابل للتحويل");
      if (text.length > 50_000) text = text.slice(0, 50_000);
      setExtracted(text);

      // 2) Convert to Braille
      setStep(grade === 2 ? "تحويل إلى بريل المستوى الثاني (الاختزالي)…" : "تحويل إلى بريل المستوى الأول…");
      const { data, error } = await supabase.functions.invoke("braille-convert", {
        body: { mode: "convert", text, grade, langCode: langCode.split("-")[0], langName: lang.name },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setBraille((data as any).braille || "");
      if ((data as any)?.fallback) {
        toast.warning("تم استخدام المستوى الأول (الحرفي) مؤقتاً بسبب ضغط على خدمة الذكاء الاصطناعي. أعد المحاولة لاحقاً للحصول على المستوى الثاني الاختزالي.");
      } else {
        toast.success("تم التحويل بنجاح");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "فشل التحويل");
      toast.error(e?.message || "فشل التحويل");
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
          حوّل أي ملف أو صفحة ويب أو نص إلى بريل بأكثر من <b>{SPOKEN_LANGUAGES.length}</b> لغة،
          مع دعم <b>المستوى الأول والثاني</b> (الاختزالي).
        </p>
        <div className="inline-flex items-center gap-1 mt-3 text-xs text-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> مدعوم بالذكاء الاصطناعي
        </div>
      </header>

      {/* Source tabs */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {([
          { k: "file", icon: FileUp, label: "ملف" },
          { k: "url", icon: LinkIcon, label: "رابط ويب" },
          { k: "text", icon: Type, label: "نص مباشر" },
          { k: "braille", icon: Eye, label: "بريل → نص" },
        ] as { k: Source; icon: any; label: string }[]).map(({ k, icon: Ic, label }) => (
          <button
            key={k}
            onClick={() => { setSource(k); reset(); }}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              source === k
                ? "bg-[hsl(var(--damij-primary))] text-white shadow-lg"
                : "bg-white text-[hsl(var(--damij-primary))] border border-[hsl(var(--damij-primary))]/20"
            }`}
          >
            <Ic className="w-5 h-5" /> {label}
          </button>
        ))}
      </div>

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
            {busy ? step || "جارٍ المعالجة…" : source === "braille" ? "فك ترميز إلى نص" : "تحويل إلى بريل"}
          </button>
        </div>
      </div>

      {/* Source input */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-5 mb-6">
        {source === "file" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] || null); }}
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-[hsl(var(--damij-primary))]/30 rounded-2xl p-8 text-center hover:bg-[hsl(var(--damij-primary))]/5 transition-colors"
          >
            <FileUp className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
            <p className="font-bold text-[hsl(var(--damij-primary))]">
              {file ? file.name : "اضغط أو أسقط ملفاً هنا"}
            </p>
            <p className="text-xs text-[hsl(var(--damij-text))]/60 mt-1">
              PDF, Word (docx), PowerPoint (pptx), Excel (xlsx), TXT, MD, HTML, صور (OCR)
            </p>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,.docx,.pptx,.xlsx,.xls,.txt,.md,.csv,.html,.htm,.rtf,.json,.xml,image/*"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </div>
        )}
        {source === "url" && (
          <div className="flex gap-2">
            <LinkIcon className="w-5 h-5 mt-3 text-[hsl(var(--damij-primary))]" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-base"
              dir="ltr"
            />
          </div>
        )}
        {source === "text" && (
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder="ألصق أو اكتب نصاً بأي لغة…"
            className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-base"
            dir="auto"
          />
        )}
        {source === "braille" && (
          <textarea
            value={brailleInput}
            onChange={(e) => setBrailleInput(e.target.value)}
            rows={6}
            placeholder="ألصق نص بريل (⠁⠃⠉ ...) — يدعم المستوى الأول والثاني"
            className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-2xl leading-loose font-mono"
            dir="ltr"
            style={{ fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' }}
          />
        )}
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

      {/* Results */}
      {(extracted || braille) && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/15">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                <FileText className="w-4 h-4" /> النص المستخرج ({lang.nativeName})
              </h3>
              <div className="flex gap-1">
                <button onClick={() => speak(extracted)} className="p-2 rounded-lg hover:bg-slate-100" title="نطق"><Volume2 className="w-4 h-4" /></button>
                <button onClick={() => copy(extracted)} className="p-2 rounded-lg hover:bg-slate-100" title="نسخ"><Copy className="w-4 h-4" /></button>
                <button onClick={reset} className="p-2 rounded-lg hover:bg-slate-100" title="مسح"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
            <div className="max-h-[420px] overflow-auto p-3 rounded-xl bg-slate-50 text-base leading-relaxed whitespace-pre-wrap" dir="auto">
              {extracted || <span className="text-slate-400">سيظهر النص هنا…</span>}
            </div>
            <p className="text-xs text-slate-500 mt-2">عدد المحارف: {extracted.length.toLocaleString()}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20"
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                <Eye className="w-4 h-4" /> ناتج بريل (المستوى {grade === 2 ? "الثاني" : "الأول"})
              </h3>
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => copy(braille)} disabled={!braille} className="p-2 rounded-lg hover:bg-white disabled:opacity-50" title="نسخ"><Copy className="w-4 h-4" /></button>
                <button onClick={() => braille && downloadText(brailleToBrf(braille), `braille-${Date.now()}.brf`)} disabled={!braille}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1 disabled:opacity-50" title="تنزيل BRF">
                  <Download className="w-3 h-3" /> BRF
                </button>
                <button onClick={() => braille && brailleToPdf(braille, `braille-${lang.name}`)} disabled={!braille}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1 disabled:opacity-50" title="تنزيل PDF">
                  <Download className="w-3 h-3" /> PDF
                </button>
                <button onClick={() => window.print()} disabled={!braille} className="p-2 rounded-lg hover:bg-white disabled:opacity-50" title="طباعة">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              className="max-h-[420px] overflow-auto p-4 rounded-xl bg-white text-3xl leading-loose whitespace-pre-wrap font-mono"
              dir="ltr"
              style={{ fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' }}
            >
              {braille || <span className="text-slate-400 text-base">سيظهر بريل هنا…</span>}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              عدد خلايا بريل: {[...braille].filter(c => { const x = c.codePointAt(0)!; return x >= 0x2800 && x <= 0x28FF; }).length.toLocaleString()}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UniversalBrailleConverter;
