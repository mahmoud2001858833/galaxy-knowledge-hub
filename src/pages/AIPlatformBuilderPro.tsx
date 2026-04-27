import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Database, Bot, Code2, Lock, Send, Loader2, Download, ExternalLink, Save, RotateCcw, FolderTree, Eye } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StagePipeline, { type Stage } from "@/components/platform-builder/StagePipeline";
import BuilderDashboard from "@/components/platform-builder/BuilderDashboard";
import MyPlatforms, { type SavedPlatform } from "@/components/platform-builder/MyPlatforms";
import BuilderSettings, { type BuilderConfig } from "@/components/platform-builder/BuilderSettings";
import FilesExplorer, { type ProjectFile } from "@/components/platform-builder/FilesExplorer";
import LivePreview from "@/components/platform-builder/LivePreview";
import DesignPreferencesPanel, { DEFAULT_PREFERENCES, type DesignPreferences } from "@/components/platform-builder/DesignPreferences";

const STORAGE_KEY = "ai_platform_builder_v2";
const CONFIG_KEY = "ai_platform_builder_config_v2";
const PREFS_KEY = "ai_platform_builder_design_prefs_v1";

const DEFAULT_CONFIG: BuilderConfig = {
  uiModel: "google/gemini-2.5-flash",
  logicModel: "google/gemini-2.5-flash",
  defaultLanguage: "ar",
  includeAuth: true,
  includeAI: true,
  includeCodeRunner: false,
};

const initialStages = (): Stage[] => [
  { id: "analyze", title: "تحليل المتطلبات", emoji: "🧠", description: "فهم نوع المنصة والميزات المطلوبة", status: "pending" },
  { id: "schema", title: "تصميم قاعدة البيانات الاحترافية", emoji: "🗂️", description: "جداول، علاقات، indexes، validation", status: "pending" },
  { id: "files", title: "توليد ملفات المشروع (20+ ملف)", emoji: "📦", description: "HTML، CSS، JS modules، DB engine، Auth، Pages", status: "pending" },
  { id: "preview", title: "بناء المعاينة الحية", emoji: "✅", description: "ربط الملفات وعرض النتيجة", status: "pending" },
];

const PROFESSIONAL_PROMPT = `أنشئ منصة ويب احترافية متكاملة بالمواصفات التالية:

🎯 الهوية والتصميم:
- اسم المنصة: [اختر اسماً جذاباً مناسباً]
- تصميم عصري داكن مع لمسات Glassmorphism وتدرجات نيون (بنفسجي/سماوي)
- خط Cairo، واجهة RTL عربية كاملة، Responsive لكل الأحجام
- أنيميشن سلس على البطاقات والأزرار والانتقالات

👤 نظام المستخدمين:
- تسجيل/دخول بالبريد وكلمة المرور (تشفير SHA-256)
- ملف شخصي قابل للتعديل: اسم، صورة، نبذة، إحصائيات
- أدوار: admin / user مع صلاحيات مختلفة
- Session management مع تذكر الدخول

📊 قاعدة بيانات احترافية (10+ جداول):
- users (المستخدمون)
- profiles (الملفات الشخصية)
- categories (التصنيفات)
- posts/items (المحتوى الرئيسي مع صور ووصف)
- comments (التعليقات)
- likes (الإعجابات)
- notifications (الإشعارات)
- messages (الرسائل الخاصة)
- activities (سجل النشاط)
- settings (الإعدادات لكل مستخدم)
- علاقات وindexes واضحة، soft-delete، timestamps تلقائية

🚀 الميزات الأساسية:
- لوحة تحكم رئيسية بإحصائيات مرئية وكروت متحركة
- صفحة لكل جدول بـ CRUD كامل (إضافة/تعديل/حذف/بحث/فلترة)
- نظام بحث عام يبحث في كل المحتوى
- نظام إشعارات Real-time
- نظام تعليقات وإعجابات على المحتوى
- رفع وعرض الصور
- تصدير/استيراد البيانات (JSON)
- Dark/Light mode toggle
- لغتان: عربي/إنجليزي

🤖 المساعد الذكي (AI):
- زر دردشة عائم في كل صفحات المنصة
- يفهم سياق المنصة وبياناتها ويرد بالعربية
- يساعد في: شرح الميزات، اقتراحات، تحليل البيانات، الإجابة عن أي سؤال
- ذاكرة محادثة (يتذكر آخر 10 رسائل)

⚙️ صفحة الإعدادات:
- تغيير اللغة، الثيم، الإشعارات
- تعديل البروفايل وكلمة المرور
- إدارة الخصوصية
- تصدير/مسح كل البيانات

🎨 صفحات إضافية:
- صفحة "حول المنصة" + "تواصل معنا" + "الأسئلة الشائعة"
- صفحة 404 مخصصة
- Footer احترافي بروابط ومعلومات

اجعل كل شيء جاهز للاستخدام الفوري مع بيانات تجريبية أولية.`;

/**
 * Build a single runnable HTML preview from multi-file project (inlined).
 */
function buildPreviewHtml(files: ProjectFile[]): string {
  const byPath = new Map(files.map((f) => [f.path, f]));
  const indexFile = byPath.get("index.html") || files.find((f) => f.path.endsWith("index.html"));
  if (!indexFile) {
    return `<!doctype html><html dir="rtl"><body style="font-family:sans-serif;padding:24px;background:#0b0b1a;color:#fff"><h2>لا يوجد index.html</h2></body></html>`;
  }

  let html = indexFile.content;

  // Inline all CSS files referenced via <link rel="stylesheet" href="...">
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi, (_, href) => {
    const clean = href.replace(/^\.?\//, "");
    const f = byPath.get(clean);
    return f ? `<style>\n${f.content}\n</style>` : "";
  });

  // Inline all <script src="..."> (module or normal)
  html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    if (/^https?:/.test(src)) return match;
    const clean = src.replace(/^\.?\//, "");
    const f = byPath.get(clean);
    if (!f) return "";
    const isModule = /type=["']module["']/.test(match);
    return `<script${isModule ? ' type="module"' : ""}>\n${f.content}\n</script>`;
  });

  // Inject all page HTML fragments + module sources as window globals so router.js can find them
  const pageFiles = files.filter((f) => f.path.startsWith("pages/") && f.path.endsWith(".html"));
  const moduleFiles = files.filter((f) => f.path.startsWith("assets/js/modules/") && f.path.endsWith(".js"));
  const remainingJs = files.filter((f) =>
    f.language === "javascript" &&
    !f.path.startsWith("assets/js/modules/") &&
    !html.includes(f.content.slice(0, 80))
  );

  const pagesObj = pageFiles.map((f) => {
    const name = f.path.replace(/^pages\//, "").replace(/\.html$/, "");
    return `${JSON.stringify(name)}: ${JSON.stringify(f.content)}`;
  }).join(",\n");

  const inject = `
<script>
window.__PROJECT_PAGES__ = {${pagesObj}};
window.__PROJECT_FILES__ = ${JSON.stringify(files.map(f => ({ path: f.path, language: f.language })))};
</script>
${moduleFiles.map(f => `<script>\n${f.content}\n</script>`).join("\n")}
${remainingJs.map(f => `<script>\n${f.content}\n</script>`).join("\n")}
`;

  if (html.includes("</body>")) {
    html = html.replace("</body>", `${inject}\n</body>`);
  } else {
    html += inject;
  }

  return html;
}

export default function AIPlatformBuilderPro() {
  const { toast } = useToast();
  const [tab, setTab] = useState("build");
  const [innerTab, setInnerTab] = useState("preview");
  const [description, setDescription] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [stages, setStages] = useState<Stage[]>(initialStages());
  const [building, setBuilding] = useState(false);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [finalHtml, setFinalHtml] = useState("");
  const [platforms, setPlatforms] = useState<SavedPlatform[]>([]);
  const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG);
  const [totalBuilds, setTotalBuilds] = useState(0);
  const [lastBuildAt, setLastBuildAt] = useState<string | null>(null);
  const [designPrefs, setDesignPrefs] = useState<DesignPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPlatforms(parsed.platforms || []);
        setTotalBuilds(parsed.totalBuilds || 0);
        setLastBuildAt(parsed.lastBuildAt || null);
      }
      const cfg = localStorage.getItem(CONFIG_KEY);
      if (cfg) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(cfg) });
      const prefs = localStorage.getItem(PREFS_KEY);
      if (prefs) setDesignPrefs({ ...DEFAULT_PREFERENCES, ...JSON.parse(prefs) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(designPrefs));
  }, [designPrefs]);

  const persist = (next: { platforms?: SavedPlatform[]; totalBuilds?: number; lastBuildAt?: string | null }) => {
    const merged = {
      platforms: next.platforms ?? platforms,
      totalBuilds: next.totalBuilds ?? totalBuilds,
      lastBuildAt: next.lastBuildAt ?? lastBuildAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  const updateStage = (id: string, patch: Partial<Stage>) =>
    setStages((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const callStage = async (fn: string, body: any) => {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) {
      let serverMsg = "";
      try {
        const ctx: any = (error as any).context;
        if (ctx?.body) {
          const txt = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body).text();
          try { serverMsg = JSON.parse(txt).error || txt; } catch { serverMsg = txt; }
        }
      } catch {}
      throw new Error(serverMsg || error.message || "خطأ غير معروف");
    }
    if ((data as any)?.error) throw new Error((data as any).error);
    return data;
  };

  const runBuild = async () => {
    if (!description.trim() || description.trim().length < 10) {
      toast({ title: "وصف قصير", description: "اكتب وصفاً للمنصة (10 أحرف على الأقل)", variant: "destructive" });
      return;
    }
    setBuilding(true);
    setFinalHtml("");
    setFiles([]);
    setStages(initialStages());

    try {
      // Stage 1: analyze
      updateStage("analyze", { status: "running" });
      const a = await callStage("platform-stage-analyze", { description });
      const analysis = a.analysis || {};
      updateStage("analyze", {
        status: "done",
        summary: `${analysis.platformName || "منصة"} — ${(analysis.coreFeatures || []).length} ميزة، ${(analysis.suggestedTables || []).length} جدول`,
      });
      if (!platformName) setPlatformName(analysis.platformName || "منصتي الجديدة");

      // Stage 2: schema (professional)
      updateStage("schema", { status: "running" });
      const s = await callStage("platform-stage-schema", { analysis });
      const schema = s.schema || { tables: [] };
      const tableNames = (schema.tables || []).map((t: any) => t.name);
      updateStage("schema", {
        status: "done",
        summary: `${tableNames.length} جدول احترافي: ${tableNames.join(", ")} — مع indexes وعلاقات`,
      });

      // Stage 3: generate all files (single optimized call → 20+ files)
      updateStage("files", { status: "running" });
      const f = await callStage("platform-stage-files", {
        description, analysis, schema, model: config.uiModel, designPreferences: designPrefs,
      });
      const projFiles: ProjectFile[] = f.files || [];
      if (projFiles.length < 5) {
        throw new Error(`تم توليد ${projFiles.length} ملف فقط (المتوقع 20+)`);
      }
      setFiles(projFiles);
      updateStage("files", {
        status: "done",
        summary: `تم توليد ${projFiles.length} ملف منظم في بنية احترافية`,
      });

      // Stage 4: assemble preview (client-side)
      updateStage("preview", { status: "running" });
      const html = buildPreviewHtml(projFiles);
      setFinalHtml(html);
      updateStage("preview", {
        status: "done",
        summary: `جاهز للمعاينة (${Math.round(html.length / 1024)} KB)`,
      });

      const now = new Date().toISOString();
      const newTotal = totalBuilds + 1;
      setTotalBuilds(newTotal);
      setLastBuildAt(now);
      persist({ totalBuilds: newTotal, lastBuildAt: now });

      toast({ title: "✅ اكتمل البناء!", description: `${projFiles.length} ملف جاهز` });
    } catch (e: any) {
      setStages((prev) => prev.map((x) => x.status === "running" ? { ...x, status: "error", error: e?.message || "خطأ" } : x));
      toast({ title: "فشل البناء", description: e?.message || "خطأ غير معروف", variant: "destructive" });
    } finally {
      setBuilding(false);
    }
  };

  const savePlatform = () => {
    if (!finalHtml || !files.length) return;
    const p: SavedPlatform = {
      id: crypto.randomUUID(),
      name: platformName || "منصتي",
      description,
      html: finalHtml,
      createdAt: new Date().toISOString(),
      files,
    };
    const next = [p, ...platforms];
    setPlatforms(next);
    persist({ platforms: next });
    toast({ title: "💾 تم الحفظ", description: "أصبحت متاحة في تبويب «منصاتي»" });
  };

  const downloadZip = async () => {
    if (!files.length) return;
    const zip = new JSZip();
    files.forEach((f) => zip.file(f.path, f.content));
    zip.file("preview.html", finalHtml);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${platformName || "platform"}.zip`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "📦 تم التحميل", description: `${files.length} ملف داخل ZIP` });
  };

  const openNewTab = () => {
    if (!finalHtml) return;
    const w = window.open("", "_blank");
    if (!w) {
      const blob = new Blob([finalHtml], { type: "text/html;charset=utf-8" });
      window.open(URL.createObjectURL(blob), "_blank");
      return;
    }
    w.document.open();
    w.document.write(finalHtml);
    w.document.close();
  };

  const reset = () => {
    setStages(initialStages());
    setFinalHtml("");
    setFiles([]);
    setDescription("");
    setPlatformName("");
  };

  const avgStages = useMemo(() => (totalBuilds === 0 ? 0 : 4), [totalBuilds]);

  return (
    <div className="min-h-screen bg-[#070716] text-white relative overflow-hidden" dir="rtl">
      <Helmet>
        <title>باني المنصات الذكي بالـ AI | ذروة العلم</title>
        <meta name="description" content="أنشئ منصات ويب كاملة بقاعدة بيانات احترافية وتسجيل دخول ومساعد ذكي بمراحل واضحة." />
      </Helmet>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[480px] h-[480px] rounded-full bg-cyan-500/20 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 left-1/2 w-[360px] h-[360px] rounded-full bg-emerald-500/15 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/gju-competition" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm">
            <ArrowRight className="w-4 h-4" /> عودة إلى مستقبل التكنولوجيا
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold leading-tight">باني المنصات الذكي</div>
              <div className="text-xs text-white/50">AI Platform Builder Pro</div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent mb-2">
            🚀 باني المنصات بالـ AI
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
            صف فكرتك، وسيقوم الذكاء الاصطناعي ببناء مشروع ويب كامل بـ <strong className="text-cyan-300">20+ ملف منظم</strong>،
            قاعدة بيانات احترافية، تسجيل دخول، ومساعد ذكي.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              { icon: FolderTree, l: "20+ ملف منظم" },
              { icon: Database, l: "DB احترافية" },
              { icon: Lock, l: "تسجيل دخول" },
              { icon: Bot, l: "مساعد AI" },
              { icon: Code2, l: "معاينة كود" },
              { icon: Sparkles, l: "تصميم احترافي" },
            ].map((c) => {
              const I = c.icon;
              return (
                <div key={c.l} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/80">
                  <I className="w-3.5 h-3.5" /> {c.l}
                </div>
              );
            })}
          </div>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-white/5 border border-white/10">
            <TabsTrigger value="build">🛠️ البناء</TabsTrigger>
            <TabsTrigger value="dashboard">📊 لوحة التحكم</TabsTrigger>
            <TabsTrigger value="my">📚 منصاتي</TabsTrigger>
            <TabsTrigger value="settings">⚙️ الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: input + stages */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
                  <label className="block text-sm font-semibold text-white/80 mb-2">اسم المنصة (اختياري)</label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="مثلاً: مدير المهام الذكي"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-4"
                    disabled={building}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-white/80">صف منصتك بالتفصيل</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
                      disabled={building}
                      onClick={() => setDescription(PROFESSIONAL_PROMPT)}
                    >
                      <Sparkles className="w-3.5 h-3.5 ml-1" /> برومبت احترافي
                    </Button>
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: منصة تعليمية مع تسجيل دخول، دروس فيديو، اختبارات، نقاط، ومساعد ذكاء اصطناعي للأسئلة..."
                    rows={6}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                    disabled={building}
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={runBuild}
                      disabled={building}
                      className="flex-1 bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 hover:opacity-90 text-white font-bold shadow-lg"
                    >
                      {building ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري البناء...</> : <><Send className="w-4 h-4 ml-2" /> ابدأ البناء</>}
                    </Button>
                    {(finalHtml || !building) && (
                      <Button onClick={reset} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={building}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <DesignPreferencesPanel value={designPrefs} onChange={setDesignPrefs} disabled={building} />

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> مراحل البناء
                  </h3>
                  <StagePipeline stages={stages} />
                </div>
              </div>

              {/* Right: preview + files */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
                  <Tabs value={innerTab} onValueChange={setInnerTab}>
                    <div className="flex items-center justify-between gap-2 px-2 py-1 mb-2">
                      <TabsList className="bg-white/5 border border-white/10 h-9">
                        <TabsTrigger value="preview" className="text-xs"><Eye className="w-3.5 h-3.5 ml-1" /> معاينة حية</TabsTrigger>
                        <TabsTrigger value="code" className="text-xs"><Code2 className="w-3.5 h-3.5 ml-1" /> الكود ({files.length})</TabsTrigger>
                      </TabsList>
                      {finalHtml && (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-8 border-emerald-500/40 text-emerald-300" onClick={savePlatform}>
                            <Save className="w-3.5 h-3.5 ml-1" /> حفظ
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-cyan-500/40 text-cyan-300" onClick={downloadZip}>
                            <Download className="w-3.5 h-3.5 ml-1" /> ZIP
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-violet-500/40 text-violet-300" onClick={openNewTab}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <TabsContent value="preview" className="mt-0">
                      <LivePreview html={finalHtml} />
                    </TabsContent>

                    <TabsContent value="code" className="mt-0">
                      {files.length ? (
                        <FilesExplorer files={files} />
                      ) : (
                        <div className="rounded-xl bg-black border border-white/10 h-[640px] flex items-center justify-center text-white/40 text-sm">
                          {building ? "جاري توليد الملفات..." : "لا توجد ملفات بعد. ابدأ البناء أولاً."}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <BuilderDashboard
              totalPlatforms={platforms.length}
              totalBuilds={totalBuilds}
              lastBuildAt={lastBuildAt}
              avgStages={avgStages}
            />
          </TabsContent>

          <TabsContent value="my" className="mt-6">
            <MyPlatforms
              platforms={platforms}
              onView={(p) => {
                setFinalHtml(p.html);
                setPlatformName(p.name);
                setDescription(p.description);
                setFiles((p as any).files || []);
                setTab("build");
                setInnerTab("preview");
              }}
              onDelete={(id) => {
                const next = platforms.filter((x) => x.id !== id);
                setPlatforms(next); persist({ platforms: next });
                toast({ title: "تم الحذف" });
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <BuilderSettings config={config} onChange={setConfig} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
