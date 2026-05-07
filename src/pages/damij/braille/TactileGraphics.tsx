import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Shapes, Wand2, FileUp, Eye, Loader2, Download, Volume2, ArrowLeft, Lightbulb, Hand, Languages } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { buildTactileSvg, downloadSvg } from "@/features/braille/tactile/tactileSvg";
import { tactileToPdf, legendToBrf } from "@/features/braille/tactile/tactilePdf";
import { downloadText } from "@/features/braille/brailleExport";
import type { TactileFigure, DescribeResult, PaperSize } from "@/features/braille/tactile/tactileTypes";
import { PAPER_DIMS } from "@/features/braille/tactile/tactileTypes";
import { HandSignCard } from "@/features/sign-language/HandSignCard";

type Tab = "generate" | "convert" | "describe";

const CATEGORIES = [
  { id: "geometry", label: "شكل هندسي" },
  { id: "graph", label: "رسم بياني" },
  { id: "map", label: "خريطة جغرافية" },
  { id: "molecule", label: "جزيء كيميائي" },
  { id: "biology", label: "رسم بيولوجي" },
  { id: "other", label: "أخرى" },
];

const SUGGESTIONS: Record<string, string[]> = {
  geometry: [
    "مثلث متساوي الأضلاع طول ضلعه 6 سم مع تسمية الزوايا والأضلاع",
    "مكعب ثلاثي الأبعاد بطول ضلع 5 سم مع تسمية الرؤوس",
    "دائرة قطرها 8 سم مع نصف قطر ووتر وزاوية مركزية",
    "شبه منحرف بقاعدتين 6 و10 سم وارتفاع 4 سم",
    "مضلع سداسي منتظم مع تسمية الرؤوس والأقطار",
  ],
  graph: [
    "منحنى دالة جيب الزاوية sin(x) من 0 إلى 2π",
    "خط مستقيم بميل موجب يمر بنقطتين (1,2) و(4,8)",
    "أعمدة بيانية لدرجات خمسة طلاب",
    "منحنى دالة تربيعية y = x²",
    "دائرة نسب مئوية مقسمة إلى أربعة قطاعات",
  ],
  map: [
    "خريطة الأردن مع المحافظات الرئيسية",
    "خريطة الوطن العربي مع تسمية الدول الكبرى",
    "خريطة قارة أفريقيا بحدود الدول مبسطة",
    "خريطة العالم المبسطة بالقارات السبع",
    "خريطة مدينة عمان وأهم أحيائها",
  ],
  molecule: [
    "جزيء الماء H₂O مع زوايا الروابط",
    "جزيء ثاني أكسيد الكربون CO₂",
    "جزيء الميثان CH₄ بالشكل الرباعي السطوح",
    "جزيء النشادر NH₃",
    "حلقة البنزين C₆H₆ مع الروابط المزدوجة",
  ],
  biology: [
    "الخلية النباتية مع تسمية العضيات الرئيسية",
    "القلب البشري مع الأذينين والبطينين",
    "الجهاز الهضمي البشري بمراحله",
    "ورقة نبات تظهر العروق الرئيسية والجانبية",
    "الجهاز التنفسي مع القصبة الهوائية والرئتين",
  ],
  other: [
    "شعار مدرسي بسيط دائري",
    "سهم اتجاهي يشير إلى الشمال",
    "سلّم درجي من خمس درجات",
    "ساعة تناظرية تشير إلى الثالثة والربع",
    "علم الأردن بأقسامه الأربعة",
  ],
};

// 100 languages (ISO code + Arabic name)
const LANGUAGES: { code: string; name: string }[] = [
  { code: "ar", name: "العربية" }, { code: "en", name: "الإنجليزية" }, { code: "fr", name: "الفرنسية" },
  { code: "es", name: "الإسبانية" }, { code: "de", name: "الألمانية" }, { code: "it", name: "الإيطالية" },
  { code: "pt", name: "البرتغالية" }, { code: "ru", name: "الروسية" }, { code: "tr", name: "التركية" },
  { code: "fa", name: "الفارسية" }, { code: "ur", name: "الأردية" }, { code: "hi", name: "الهندية" },
  { code: "bn", name: "البنغالية" }, { code: "id", name: "الإندونيسية" }, { code: "ms", name: "الماليزية" },
  { code: "th", name: "التايلاندية" }, { code: "vi", name: "الفيتنامية" }, { code: "ja", name: "اليابانية" },
  { code: "ko", name: "الكورية" }, { code: "zh", name: "الصينية" }, { code: "zh-TW", name: "الصينية التقليدية" },
  { code: "nl", name: "الهولندية" }, { code: "sv", name: "السويدية" }, { code: "no", name: "النرويجية" },
  { code: "da", name: "الدنماركية" }, { code: "fi", name: "الفنلندية" }, { code: "pl", name: "البولندية" },
  { code: "cs", name: "التشيكية" }, { code: "sk", name: "السلوفاكية" }, { code: "hu", name: "الهنغارية" },
  { code: "ro", name: "الرومانية" }, { code: "bg", name: "البلغارية" }, { code: "el", name: "اليونانية" },
  { code: "uk", name: "الأوكرانية" }, { code: "be", name: "البيلاروسية" }, { code: "sr", name: "الصربية" },
  { code: "hr", name: "الكرواتية" }, { code: "sl", name: "السلوفينية" }, { code: "mk", name: "المقدونية" },
  { code: "sq", name: "الألبانية" }, { code: "lt", name: "الليتوانية" }, { code: "lv", name: "اللاتفية" },
  { code: "et", name: "الإستونية" }, { code: "is", name: "الآيسلندية" }, { code: "ga", name: "الإيرلندية" },
  { code: "cy", name: "الويلزية" }, { code: "mt", name: "المالطية" }, { code: "ca", name: "الكتالانية" },
  { code: "eu", name: "الباسكية" }, { code: "gl", name: "الجاليكية" }, { code: "he", name: "العبرية" },
  { code: "yi", name: "اليديشية" }, { code: "am", name: "الأمهرية" }, { code: "sw", name: "السواحيلية" },
  { code: "ha", name: "الهوسا" }, { code: "yo", name: "اليوروبا" }, { code: "ig", name: "الإيغبو" },
  { code: "zu", name: "الزولو" }, { code: "xh", name: "الخوسا" }, { code: "af", name: "الأفريكانية" },
  { code: "so", name: "الصومالية" }, { code: "rw", name: "الكينيارواندا" }, { code: "mg", name: "المالاغاشية" },
  { code: "ne", name: "النيبالية" }, { code: "si", name: "السنهالية" }, { code: "ta", name: "التاميلية" },
  { code: "te", name: "التيلوغو" }, { code: "kn", name: "الكانادا" }, { code: "ml", name: "المالايالامية" },
  { code: "mr", name: "الماراثية" }, { code: "gu", name: "الغوجاراتية" }, { code: "pa", name: "البنجابية" },
  { code: "or", name: "الأودية" }, { code: "as", name: "الأسامية" }, { code: "my", name: "البورمية" },
  { code: "km", name: "الخميرية" }, { code: "lo", name: "اللاوية" }, { code: "mn", name: "المنغولية" },
  { code: "ka", name: "الجورجية" }, { code: "hy", name: "الأرمنية" }, { code: "az", name: "الأذربيجانية" },
  { code: "kk", name: "الكازاخية" }, { code: "uz", name: "الأوزبكية" }, { code: "ky", name: "القيرغيزية" },
  { code: "tg", name: "الطاجيكية" }, { code: "tk", name: "التركمانية" }, { code: "ps", name: "الباشتو" },
  { code: "ku", name: "الكردية" }, { code: "sd", name: "السندية" }, { code: "tl", name: "الفلبينية" },
  { code: "ceb", name: "السيبوانو" }, { code: "haw", name: "الهاوايية" }, { code: "mi", name: "الماورية" },
  { code: "sm", name: "الساموانية" }, { code: "to", name: "التونغية" }, { code: "fj", name: "الفيجية" },
  { code: "la", name: "اللاتينية" }, { code: "eo", name: "الإسبرانتو" }, { code: "jw", name: "الجاوية" },
  { code: "su", name: "السوندانية" }, { code: "ny", name: "التشيتشوا" }, { code: "st", name: "السيسوتو" },
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
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [grade, setGrade] = useState<1 | 2>(1);
  const [paper, setPaper] = useState<PaperSize>("A4");
  const [busy, setBusy] = useState(false);
  const [figure, setFigure] = useState<TactileFigure | null>(null);
  const [describe, setDescribe] = useState<DescribeResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Translation state for describe view
  const [targetLang, setTargetLang] = useState<string>("ar");
  const [translation, setTranslation] = useState<{ description: string; narration: string } | null>(null);
  const [translating, setTranslating] = useState(false);

  const suggestions = useMemo(() => SUGGESTIONS[category] || [], [category]);

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
    if (!prompt.trim()) return toast.error("اكتب وصف الرسم أو اختر اقتراحاً");
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
    setBusy(true); setDescribe(null); setTranslation(null); setTargetLang("ar");
    try {
      const url = await fileToDataUrl(file);
      const data = await callFn({ mode: "describe", image_data_url: url });
      if (!data.result) throw new Error("استجابة غير صالحة");
      setDescribe(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const runTranslate = async (code: string) => {
    setTargetLang(code);
    if (!describe) return;
    if (code === "ar") { setTranslation(null); return; }
    setTranslating(true);
    try {
      const data = await callFn({
        mode: "translate",
        text: describe.description,
        narration: describe.narration || "",
        target_lang: code,
      });
      if (data?.translation) setTranslation(data.translation);
    } catch (e: any) { toast.error(e.message); }
    finally { setTranslating(false); }
  };

  const speak = (t: string, langCode?: string) => {
    if (!t) return;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = langCode || (language === "ar" ? "ar-SA" : "en-US");
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
              onClick={() => { setTab(t.id as Tab); setFigure(null); setDescribe(null); setTranslation(null); }}
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
              placeholder="اكتب وصف الرسم الذي تريد توليده هنا، أو اختر من الاقتراحات أدناه..." />

            {/* Suggestions box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                <Lightbulb className="w-4 h-4" /> اقتراحات لـ "{CATEGORIES.find(c => c.id === category)?.label}"
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-xs text-gray-700 text-right"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
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
        <div className="mt-8 bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))]">{describe.figure_type}</h2>
            <button onClick={() => speak(translation?.narration || translation?.description || describe.narration || describe.description, targetLang)}
              className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm flex items-center gap-1">
              <Volume2 className="w-4 h-4" /> استمع
            </button>
          </div>

          {/* Arabic description (always) */}
          <div>
            <h3 className="font-bold mb-1 text-sm text-gray-500">الوصف بالعربية</h3>
            <p className="text-gray-700 leading-relaxed">{describe.description}</p>
          </div>

          {/* Sign-language rendering of keywords */}
          {describe.sign_keywords && describe.sign_keywords.length > 0 && (
            <div className="rounded-xl border border-[hsl(var(--damij-primary))]/15 p-4 bg-[hsl(var(--damij-primary))]/5">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-[hsl(var(--damij-primary))]">
                <Hand className="w-4 h-4" /> الوصف بلغة الإشارة (عربية موحّدة)
              </h3>
              <div className="flex flex-wrap gap-3">
                {describe.sign_keywords.map((kw, i) => (
                  <HandSignCard key={i} word={kw} caption={kw} active size={70} />
                ))}
              </div>
            </div>
          )}

          {/* 100-language translation */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-700">
              <Languages className="w-4 h-4" /> ترجمة الوصف إلى 100 لغة
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <select
                value={targetLang}
                onChange={(e) => runTranslate(e.target.value)}
                disabled={translating}
                className="p-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
              {translating && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
            {translation && targetLang !== "ar" && (
              <div className="space-y-2 text-gray-700">
                <p className="leading-relaxed">{translation.description}</p>
                {translation.narration && (
                  <p className="text-sm text-gray-600 border-r-2 border-blue-300 pr-3">{translation.narration}</p>
                )}
              </div>
            )}
          </div>

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
