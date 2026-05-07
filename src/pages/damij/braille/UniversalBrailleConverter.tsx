import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Loader2, Download, Copy, Volume2,
  Eye, Sparkles, Languages, FileText, AlertCircle, Home,
  Upload, Link as LinkIcon, FileUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SPOKEN_LANGUAGES } from "@/features/sign-language/languages";
import { brailleToBrf, brailleToPdf, downloadText } from "@/features/braille/brailleExport";
import { extractFromFile } from "@/features/braille/extractText";

type TabKey = "reverse" | "forward";

const MAX_FILE_MB = 25;
const CHUNK = 6000;

const UniversalBrailleConverter: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<TabKey>("forward");
  const [grade, setGrade] = useState<1 | 2>(1);
  const [langCode, setLangCode] = useState("ar-SA");
  const lang = SPOKEN_LANGUAGES.find((l) => l.code === langCode) || SPOKEN_LANGUAGES[0];

  // Reverse mode
  const [brailleInput, setBrailleInput] = useState("");
  const [decoded, setDecoded] = useState("");
  const [decodedBraille, setDecodedBraille] = useState("");
  const [reBusy, setReBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Forward mode (file/url -> braille)
  const [url, setUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [forwardBraille, setForwardBraille] = useState("");
  const [fwBusy, setFwBusy] = useState(false);
  const [fwStep, setFwStep] = useState("");
  const [fwError, setFwError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

  const fmt = (l: typeof lang) => `${l.flag} ${l.nativeName} — ${l.name}`;

  // ============ Reverse: braille -> text ============
  const runReverse = async () => {
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
      setError(e?.message || "فشل فك الترميز");
      toast.error(e?.message || "فشل فك الترميز");
    } finally { setBusy(false); setStep(""); }
  };

  const reConvertToBraille = async () => {
    if (!decoded.trim()) return;
    setReBusy(true); setDecodedBraille("");
    try {
      const out = await convertTextToBraille(decoded);
      setDecodedBraille(out);
      toast.success("تم إعادة التحويل إلى بريل");
    } catch (e: any) {
      toast.error(e?.message || "فشل إعادة التحويل");
    } finally { setReBusy(false); }
  };

  // ============ Forward: text -> braille (with chunking) ============
  const convertTextToBraille = async (text: string): Promise<string> => {
    const parts: string[] = [];
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK) chunks.push(text.slice(i, i + CHUNK));
    for (let i = 0; i < chunks.length; i++) {
      setFwStep(`تحويل إلى بريل… (${i + 1}/${chunks.length})`);
      const { data, error } = await supabase.functions.invoke("braille-convert", {
        body: { mode: "convert", text: chunks[i], grade, langCode: langCode.split("-")[0], langName: lang.name },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      parts.push((data as any).braille || "");
    }
    return parts.join("\n");
  };

  const handleFile = async (file: File) => {
    setFwError(null); setForwardBraille(""); setSourceText(""); setSourceTitle(file.name);
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFwError(`حجم الملف يتجاوز ${MAX_FILE_MB}MB`); return;
    }
    setFwBusy(true);
    try {
      const text = await extractFromFile(file, langCode.split("-")[0], (m) => setFwStep(m));
      if (!text.trim()) throw new Error("لم يتم استخراج أي نص من الملف");
      setSourceText(text);
      const out = await convertTextToBraille(text);
      setForwardBraille(out);
      toast.success("تم التحويل إلى بريل بنجاح");
    } catch (e: any) {
      setFwError(e?.message || "فشل المعالجة");
      toast.error(e?.message || "فشل المعالجة");
    } finally { setFwBusy(false); setFwStep(""); }
  };

  const handleUrl = async () => {
    const u = url.trim();
    if (!u) { toast.error("أدخل رابطًا"); return; }
    setFwError(null); setForwardBraille(""); setSourceText(""); setFwBusy(true);
    try {
      setFwStep("جلب صفحة الويب…");
      const { data, error } = await supabase.functions.invoke("fetch-web-text", { body: { url: u } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const text = (data as any).text || "";
      const title = (data as any).title || u;
      if (!text.trim()) throw new Error("لم يتم استخراج نص من الصفحة");
      setSourceText(text); setSourceTitle(title);
      const out = await convertTextToBraille(text);
      setForwardBraille(out);
      toast.success("تم التحويل إلى بريل بنجاح");
    } catch (e: any) {
      setFwError(e?.message || "فشل جلب الصفحة");
      toast.error(e?.message || "فشل جلب الصفحة");
    } finally { setFwBusy(false); setFwStep(""); }
  };

  const reConvertSource = async () => {
    if (!sourceText.trim()) return;
    setFwBusy(true); setFwError(null);
    try {
      const out = await convertTextToBraille(sourceText);
      setForwardBraille(out);
      toast.success("تم إعادة التحويل");
    } catch (e: any) {
      setFwError(e?.message || "فشل إعادة التحويل");
    } finally { setFwBusy(false); setFwStep(""); }
  };

  const wordCount = (s: string) => s.trim() ? s.trim().split(/\s+/).length : 0;

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
          حوّل أي ملف أو صفحة ويب إلى بريل بالمستوى <b>القياسي 1 (حرفي)</b> أو <b>القياسي 2 (الاختصارات)</b>،
          وفُكّ ترميز نصوص بريل إلى نص عادي بأكثر من <b>{SPOKEN_LANGUAGES.length}</b> لغة.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 text-xs text-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> مدعوم بالذكاء الاصطناعي
          </div>
          <button
            onClick={() => navigate("/damij/braille")}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[hsl(var(--damij-primary))] hover:opacity-90 px-4 py-2 rounded-full shadow-md transition-all"
          >
            <Home className="w-4 h-4" /> الرجوع إلى بريل
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {[
          { k: "forward" as TabKey, label: "ملف / رابط ← بريل", icon: FileUp },
          { k: "reverse" as TabKey, label: "بريل ← نص", icon: FileText },
        ].map(({ k, label, icon: Ic }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border transition ${
              tab === k
                ? "bg-[hsl(var(--damij-primary))] text-white border-transparent"
                : "bg-white text-[hsl(var(--damij-primary))] border-[hsl(var(--damij-primary))]/30"
            }`}
          >
            <Ic className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Shared options: language + grade */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
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
              { v: 1, label: "القياسي 1", desc: "حرفي" },
              { v: 2, label: "القياسي 2", desc: "اختصارات" },
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
      </div>

      {/* ============ FORWARD TAB ============ */}
      {tab === "forward" && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* File upload */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
              }}
              className={`bg-white rounded-2xl border-2 border-dashed p-6 text-center transition ${
                dragOver ? "border-[hsl(var(--damij-primary))] bg-[hsl(var(--damij-primary))]/5"
                         : "border-[hsl(var(--damij-primary))]/30"
              }`}
            >
              <Upload className="w-10 h-10 text-[hsl(var(--damij-primary))] mx-auto mb-2" />
              <p className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-1">اسحب ملفًا هنا أو</p>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept=".pdf,.docx,.pptx,.xlsx,.xls,.txt,.md,.csv,.rtf,.html,.htm,.json,.xml,image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = ""; }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={fwBusy}
                className="mt-2 px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold disabled:opacity-60"
              >
                اختر ملفًا
              </button>
              <p className="text-[11px] text-slate-500 mt-3">
                PDF · Word · PowerPoint · Excel · صور (OCR) · TXT · HTML · JSON — حتى {MAX_FILE_MB}MB
              </p>
            </div>

            {/* URL input */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-6">
              <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-3">
                <LinkIcon className="w-4 h-4" /> رابط صفحة ويب
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                dir="ltr"
                className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-sm mb-3"
              />
              <button
                onClick={handleUrl}
                disabled={fwBusy}
                className="w-full py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {fwBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {fwBusy ? fwStep || "جارٍ المعالجة…" : "جلب وتحويل إلى بريل"}
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                ملاحظة: بعض الصفحات التي تعتمد على JavaScript قد لا يُستخرج محتواها بالكامل.
              </p>
            </div>
          </div>

          {fwBusy && fwStep && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> {fwStep}
            </div>
          )}
          {fwError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {fwError}
            </div>
          )}

          {sourceText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20 mb-6"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> النص المستخرج — {sourceTitle}
                </h3>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={reConvertSource} disabled={fwBusy} className="px-3 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-60">
                    <Eye className="w-3 h-3" /> إعادة التحويل
                  </button>
                  <button onClick={() => speak(sourceText)} className="p-2 rounded-lg hover:bg-slate-100"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => copy(sourceText)} className="p-2 rounded-lg hover:bg-slate-100"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => downloadText(sourceText, `source-${Date.now()}.txt`)} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1">
                    <Download className="w-3 h-3" /> TXT
                  </button>
                </div>
              </div>
              <div className="max-h-[300px] overflow-auto p-3 rounded-xl bg-slate-50 text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                {sourceText}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {wordCount(sourceText).toLocaleString()} كلمة · {sourceText.length.toLocaleString()} محرف
              </p>
            </motion.div>
          )}

          {forwardBraille && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-[hsl(var(--damij-primary))]/20"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Eye className="w-4 h-4" /> ناتج بريل ({grade === 2 ? "القياسي 2 — اختصارات" : "القياسي 1 — حرفي"})
                </h4>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => copy(forwardBraille)} className="p-2 rounded-lg hover:bg-slate-100"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => downloadText(brailleToBrf(forwardBraille), `braille-${Date.now()}.brf`)}
                    className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1">
                    <Download className="w-3 h-3" /> BRF
                  </button>
                  <button onClick={() => brailleToPdf(forwardBraille, `braille-${lang.name}-g${grade}`)}
                    className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
              <div
                className="max-h-[420px] overflow-auto p-4 rounded-xl bg-white border text-3xl leading-loose whitespace-pre-wrap font-mono"
                dir="ltr"
                style={{ fontFamily: '"Apple Braille", "Segoe UI Symbol", "Noto Sans Symbols 2", monospace' }}
              >
                {forwardBraille}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ============ REVERSE TAB ============ */}
      {tab === "reverse" && (
        <>
          <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4 mb-6">
            <button
              onClick={runReverse}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {busy ? step || "جارٍ المعالجة…" : "فك ترميز إلى نص"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-5 mb-6">
            <textarea
              value={brailleInput}
              onChange={(e) => setBrailleInput(e.target.value)}
              rows={6}
              placeholder="ألصق نص بريل (⠁⠃⠉ ...) — يدعم القياسي 1 و2"
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
                  <button onClick={reConvertToBraille} disabled={reBusy} className="px-3 py-2 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-60">
                    {reBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                    {reBusy ? "جارٍ…" : "إعادة إلى بريل"}
                  </button>
                  <button onClick={() => speak(decoded)} className="p-2 rounded-lg hover:bg-slate-100"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => copy(decoded)} className="p-2 rounded-lg hover:bg-slate-100"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => downloadText(decoded, `braille-decoded-${Date.now()}.txt`)} className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1">
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
                      <Eye className="w-4 h-4" /> ناتج بريل بعد إعادة التحويل (القياسي {grade})
                    </h4>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => copy(decodedBraille)} className="p-2 rounded-lg hover:bg-slate-100"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => downloadText(brailleToBrf(decodedBraille), `braille-${Date.now()}.brf`)}
                        className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1">
                        <Download className="w-3 h-3" /> BRF
                      </button>
                      <button onClick={() => brailleToPdf(decodedBraille, `braille-${lang.name}`)}
                        className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1">
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
        </>
      )}
    </div>
  );
};

export default UniversalBrailleConverter;
