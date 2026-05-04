import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Shapes, Wand2, FileUp, Eye, Loader2, Download, Volume2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { buildTactileSvg, downloadSvg } from "@/features/braille/tactile/tactileSvg";
import { tactileToPdf, legendToBrf } from "@/features/braille/tactile/tactilePdf";
import { downloadText } from "@/features/braille/brailleExport";
import type { TactileFigure, DescribeResult, PaperSize } from "@/features/braille/tactile/tactileTypes";
import { PAPER_DIMS } from "@/features/braille/tactile/tactileTypes";

type Tab = "generate" | "convert" | "describe";

const CATEGORIES = [
  { id: "geometry", label: "شكل هندسي" },
  { id: "graph", label: "رسم بياني" },
  { id: "map", label: "خريطة جغرافية" },
  { id: "molecule", label: "جزيء كيميائي" },
  { id: "biology", label: "رسم بيولوجي" },
  { id: "other", label: "أخرى" },
];

const fileToDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(f);
  });

const TactileGraphics: React.FC = () => {
  const [tab, setTab] = useState<Tab>("generate");
  const [category, setCategory] = useState("geometry");
  const [prompt, setPrompt] = useState("مثلث متساوي الأضلاع طول ضلعه 6 سم مع تسمية الزوايا والأضلاع");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [grade, setGrade] = useState<1 | 2>(1);
  const [paper, setPaper] = useState<PaperSize>("A4");
  const [busy, setBusy] = useState(false);
  const [figure, setFigure] = useState<TactileFigure | null>(null);
  const [describe, setDescribe] = useState<DescribeResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ensurePaper = (f: TactileFigure): TactileFigure => {
    const dims = PAPER_DIMS[f.paper] || PAPER_DIMS.A4;
    return { ...f, width_mm: f.width_mm || dims.w, height_mm: f.height_mm || dims.h };
  };

  const callFn = async (body: any) => {
    const { data, error } = await supabase.functions.invoke("braille-tactile-generate", { body });
    if (error) {
      const msg = (error as any)?.message || "حدث خطأ";
      if (msg.includes("429") || msg.includes("rate")) throw new Error("تم تجاوز حد الاستخدام، حاول لاحقاً");
      if (msg.includes("402")) throw new Error("تم استنفاد الرصيد، يرجى إضافة رصيد");
      throw new Error(msg);
    }
    if ((data as any)?.error) throw new Error((data as any).error);
    return data;
  };

  const runGenerate = async () => {
    if (!prompt.trim()) return toast.error("اكتب وصف الرسم");
    setBusy(true); setFigure(null);
    try {
      const data = await callFn({ mode: "generate", prompt, category, language, grade, paper });
      if (!data.figure) throw new Error("استجابة غير صالحة");
      setFigure(ensurePaper(data.figure));
      toast.success("تم توليد الرسم");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const runConvert = async () => {
    if (!file) return toast.error("اختر ملف صورة");
    setBusy(true); setFigure(null);
    try {
      const url = await fileToDataUrl(file);
      const data = await callFn({ mode: "convert_image", image_data_url: url, category, language, grade, paper });
      if (!data.figure) throw new Error("استجابة غير صالحة");
      setFigure(ensurePaper(data.figure));
      toast.success("تم تحويل الملف");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const runDescribe = async () => {
    if (!file) return toast.error("اختر صورة الرسم التكتيلي");
    setBusy(true); setDescribe(null);
    try {
      const url = await fileToDataUrl(file);
      const data = await callFn({ mode: "describe", image_data_url: url });
      if (!data.result) throw new Error("استجابة غير صالحة");
      setDescribe(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const speak = (t: string) => {
    if (!t) return;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = language === "ar" ? "ar-SA" : "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  return (
    <div className="px-6 pt-10 pb-16 max-w-6xl mx-auto" dir="rtl">
      <Link to="/damij/braille" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> العودة إلى نظام بريل
      </Link>

      <header className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] flex items-center justify-center mx-auto mb-4">
          <Shapes className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">رسومات تكتيلية للطباعة</h1>
        <p className="text-[hsl(var(--damij-text))]/70 mt-2 max-w-2xl mx-auto">
          ولّد أو حوّل أو افهم الرسوم التكتيلية: أشكال هندسية، خرائط، جزيئات كيميائية، ورسوم بيانية — جاهزة للطباعة على الورق المنتفخ أو طابعة بريل.
        </p>
      </header>

      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {[
          { id: "generate", label: "توليد رسم", icon: Wand2 },
          { id: "convert", label: "تحويل ملف", icon: FileUp },
          { id: "describe", label: "وصف رسم تكتيلي", icon: Eye },
        ].map((t) => {
          const Ico = t.icon as any;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as Tab); setFigure(null); setDescribe(null); }}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                active
                  ? "bg-[hsl(var(--damij-primary))] text-white"
                  : "bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))]"
              }`}
            >
              <Ico className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-6 shadow-sm">
        {tab === "generate" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    category === c.id ? "bg-[hsl(var(--damij-primary))] text-white" : "bg-gray-100 text-gray-700"
                  }`}>{c.label}</button>
              ))}
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              rows={3} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[hsl(var(--damij-primary))] outline-none"
              placeholder="مثال: خريطة الأردن مع المحافظات / جزيء الماء H2O / دالة جيب الزاوية" />
          </div>
        )}

        {(tab === "convert" || tab === "describe") && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[hsl(var(--damij-primary))]/30 rounded-xl p-8 text-center cursor-pointer hover:bg-[hsl(var(--damij-primary))]/5"
            >
              <FileUp className="w-10 h-10 mx-auto text-[hsl(var(--damij-primary))]/60" />
              <p className="mt-2 text-sm">{file ? file.name : "اسحب أو اختر صورة (PNG/JPG)"}</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            {tab === "convert" && (
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      category === c.id ? "bg-[hsl(var(--damij-primary))] text-white" : "bg-gray-100 text-gray-700"
                    }`}>{c.label}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab !== "describe" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <label className="text-sm">
              لغة التسميات
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full mt-1 p-2 rounded-lg border border-gray-200">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="text-sm">
              مستوى بريل
              <select value={grade} onChange={(e) => setGrade(Number(e.target.value) as 1 | 2)}
                className="w-full mt-1 p-2 rounded-lg border border-gray-200">
                <option value={1}>المستوى الأول</option>
                <option value={2}>المستوى الثاني (اختزالي)</option>
              </select>
            </label>
            <label className="text-sm">
              حجم الورق
              <select value={paper} onChange={(e) => setPaper(e.target.value as PaperSize)}
                className="w-full mt-1 p-2 rounded-lg border border-gray-200">
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </select>
            </label>
            <button
              onClick={tab === "generate" ? runGenerate : runConvert}
              disabled={busy}
              className="self-end px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {tab === "generate" ? "ولّد الرسم" : "حوّل الملف"}
            </button>
          </div>
        )}

        {tab === "describe" && (
          <button
            onClick={runDescribe} disabled={busy}
            className="mt-4 px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white flex items-center gap-2 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} وصف الرسم
          </button>
        )}
      </div>

      {/* Figure result */}
      {figure && (
        <div className="mt-8 bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))]">{figure.title}</h2>
            <div className="flex gap-2">
              <button onClick={() => downloadSvg(buildTactileSvg(figure), `${figure.title || "tactile"}.svg`)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-1">
                <Download className="w-4 h-4" /> SVG
              </button>
              <button onClick={() => tactileToPdf(figure, `${figure.title || "tactile"}.pdf`)}
                className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm flex items-center gap-1">
                <Download className="w-4 h-4" /> PDF للطباعة
              </button>
              <button onClick={() => downloadText(legendToBrf(figure), `${figure.title || "tactile"}-legend.brf`)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-1">
                <Download className="w-4 h-4" /> BRF للمفتاح
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">{figure.description}</p>
          <div className="flex justify-center bg-gray-50 rounded-xl p-4 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: buildTactileSvg(figure) }} className="max-w-full" />
          </div>
          {figure.legend?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">المفتاح (Legend)</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr><th className="p-2 text-right">الرمز</th><th className="p-2 text-right">المعنى</th><th className="p-2 text-right">بريل</th></tr>
                </thead>
                <tbody>
                  {figure.legend.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="p-2 font-mono">{l.id}</td>
                      <td className="p-2">{l.text}</td>
                      <td className="p-2 font-mono text-lg">{l.braille}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Describe result */}
      {describe && (
        <div className="mt-8 bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))]">{describe.figure_type}</h2>
            <button onClick={() => speak(describe.narration || describe.description)}
              className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm flex items-center gap-1">
              <Volume2 className="w-4 h-4" /> استمع
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">{describe.description}</p>
          {describe.decoded_labels?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">التسميات المفكوكة</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-50"><tr><th className="p-2">بريل</th><th className="p-2">النص</th></tr></thead>
                <tbody>
                  {describe.decoded_labels.map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono text-lg">{d.braille}</td>
                      <td className="p-2">{d.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {describe.narration && (
            <div className="bg-[hsl(var(--damij-primary))]/5 p-4 rounded-xl">
              <h3 className="font-bold mb-1">السرد المقترح للقراءة</h3>
              <p className="text-gray-700">{describe.narration}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TactileGraphics;
