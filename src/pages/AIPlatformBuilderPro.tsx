import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Database, Bot, Code2, Lock, Send, Loader2, Download, ExternalLink, Save, RotateCcw } from "lucide-react";
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

const STORAGE_KEY = "ai_platform_builder_v1";
const CONFIG_KEY = "ai_platform_builder_config_v1";

const DEFAULT_CONFIG: BuilderConfig = {
  uiModel: "google/gemini-2.5-pro",
  logicModel: "google/gemini-2.5-pro",
  defaultLanguage: "ar",
  includeAuth: true,
  includeAI: true,
  includeCodeRunner: false,
};

const initialStages = (): Stage[] => [
  { id: "analyze", title: "تحليل المتطلبات", emoji: "🧠", description: "فهم نوع المنصة والميزات المطلوبة", status: "pending" },
  { id: "schema", title: "تصميم قاعدة البيانات", emoji: "🗂️", description: "تحديد الجداول والحقول والعلاقات", status: "pending" },
  { id: "ui", title: "تصميم الواجهة", emoji: "🎨", description: "إنتاج HTML + Tailwind احترافي", status: "pending" },
  { id: "logic", title: "بناء المنطق والوظائف", emoji: "⚙️", description: "CRUD + Auth + AI + تفاعلية كاملة", status: "pending" },
  { id: "assemble", title: "التجميع النهائي", emoji: "✅", description: "دمج كل شيء في ملف HTML واحد", status: "pending" },
];

export default function AIPlatformBuilderPro() {
  const { toast } = useToast();
  const [tab, setTab] = useState("build");
  const [description, setDescription] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [stages, setStages] = useState<Stage[]>(initialStages());
  const [building, setBuilding] = useState(false);
  const [finalHtml, setFinalHtml] = useState("");
  const [platforms, setPlatforms] = useState<SavedPlatform[]>([]);
  const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG);
  const [totalBuilds, setTotalBuilds] = useState(0);
  const [lastBuildAt, setLastBuildAt] = useState<string | null>(null);

  // load saved
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
    } catch {}
  }, []);

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
      // try parsing context
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
    setStages(initialStages());

    try {
      // Stage 1
      updateStage("analyze", { status: "running" });
      const a = await callStage("platform-stage-analyze", { description });
      const analysis = a.analysis || {};
      updateStage("analyze", {
        status: "done",
        summary: `${analysis.platformName || "منصة"} — ${(analysis.coreFeatures || []).length} ميزة، ${(analysis.suggestedTables || []).length} جدول`,
      });
      if (!platformName) setPlatformName(analysis.platformName || "منصتي الجديدة");

      // Stage 2
      updateStage("schema", { status: "running" });
      const s = await callStage("platform-stage-schema", { analysis });
      const schema = s.schema || { tables: [] };
      updateStage("schema", {
        status: "done",
        summary: `تم تصميم ${(schema.tables || []).length} جدول: ${(schema.tables || []).map((t: any) => t.name).join(", ")}`,
      });

      // Stage 3
      updateStage("ui", { status: "running" });
      const u = await callStage("platform-stage-ui", {
        description, analysis, schema, model: config.uiModel,
      });
      const html = u.html || "";
      updateStage("ui", { status: "done", summary: `تم توليد الواجهة (${Math.round(html.length / 1024)} KB)` });

      // Stage 4
      updateStage("logic", { status: "running" });
      const l = await callStage("platform-stage-logic", {
        analysis, schema, html, model: config.logicModel,
      });
      const js = l.js || "";
      updateStage("logic", { status: "done", summary: `تم بناء المنطق (${Math.round(js.length / 1024)} KB من JS)` });

      // Stage 5
      updateStage("assemble", { status: "running" });
      const f = await callStage("platform-stage-assemble", { html, js, analysis });
      const fullHtml = f.html || "";
      updateStage("assemble", { status: "done", summary: `جاهز للاستخدام (${Math.round(fullHtml.length / 1024)} KB)` });

      setFinalHtml(fullHtml);
      const now = new Date().toISOString();
      const newTotal = totalBuilds + 1;
      setTotalBuilds(newTotal);
      setLastBuildAt(now);
      persist({ totalBuilds: newTotal, lastBuildAt: now });

      toast({ title: "✅ اكتمل البناء!", description: "منصتك جاهزة للمعاينة والحفظ" });
    } catch (e: any) {
      const failed = stages.find((x) => x.status === "running");
      if (failed) updateStage(failed.id, { status: "error", error: e?.message || "خطأ" });
      toast({ title: "فشل البناء", description: e?.message || "خطأ غير معروف", variant: "destructive" });
    } finally {
      setBuilding(false);
    }
  };

  const savePlatform = () => {
    if (!finalHtml) return;
    const p: SavedPlatform = {
      id: crypto.randomUUID(),
      name: platformName || "منصتي",
      description,
      html: finalHtml,
      createdAt: new Date().toISOString(),
    };
    const next = [p, ...platforms];
    setPlatforms(next);
    persist({ platforms: next });
    toast({ title: "💾 تم الحفظ", description: "أصبحت متاحة في تبويب «منصاتي»" });
  };

  const downloadHtml = () => {
    const blob = new Blob([finalHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${platformName || "platform"}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const openNewTab = () => {
    const blob = new Blob([finalHtml], { type: "text/html;charset=utf-8" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const reset = () => {
    setStages(initialStages());
    setFinalHtml("");
    setDescription("");
    setPlatformName("");
  };

  const avgStages = useMemo(() => {
    if (totalBuilds === 0) return 0;
    return 5;
  }, [totalBuilds]);

  return (
    <div className="min-h-screen bg-[#070716] text-white relative overflow-hidden" dir="rtl">
      <Helmet>
        <title>باني المنصات الذكي بالـ AI | ذروة العلم</title>
        <meta name="description" content="أنشئ منصات ويب كاملة بقاعدة بيانات وتسجيل دخول ومساعد ذكي بمراحل واضحة باستخدام الذكاء الاصطناعي." />
      </Helmet>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[480px] h-[480px] rounded-full bg-cyan-500/20 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 left-1/2 w-[360px] h-[360px] rounded-full bg-emerald-500/15 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
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
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent mb-2">
            🚀 باني المنصات بالـ AI
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
            صف فكرتك، وسيقوم الذكاء الاصطناعي ببناء منصة ويب كاملة بقاعدة بيانات، تسجيل دخول، ومساعد ذكي — على 5 مراحل واضحة.
          </p>
          {/* Capabilities */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              { icon: Database, l: "قاعدة بيانات" },
              { icon: Lock, l: "تسجيل دخول" },
              { icon: Bot, l: "مساعد AI" },
              { icon: Code2, l: "Python / C++" },
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

          {/* Build */}
          <TabsContent value="build" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
                  <label className="block text-sm font-semibold text-white/80 mb-2">اسم المنصة (اختياري)</label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="مثلاً: مدير المهام الذكي"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-4"
                    disabled={building}
                  />
                  <label className="block text-sm font-semibold text-white/80 mb-2">صف منصتك بالتفصيل</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: منصة لإدارة المهام مع تسجيل دخول، يستطيع المستخدم إضافة مهام وتصنيفها وتعليم المنجز منها، مع مساعد ذكاء اصطناعي يقترح خطة عمل يومية..."
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

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> مراحل البناء
                  </h3>
                  <StagePipeline stages={stages} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
                  <div className="flex items-center justify-between px-2 py-2">
                    <h3 className="font-bold text-white text-sm">المعاينة الحية</h3>
                    {finalHtml && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-8 border-emerald-500/40 text-emerald-300" onClick={savePlatform}>
                          <Save className="w-3.5 h-3.5 ml-1" /> حفظ
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-cyan-500/40 text-cyan-300" onClick={downloadHtml}>
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-violet-500/40 text-violet-300" onClick={openNewTab}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl overflow-hidden bg-black border border-white/10" style={{ height: 720 }}>
                    {finalHtml ? (
                      <iframe
                        title="preview"
                        srcDoc={finalHtml}
                        className="w-full h-full bg-white"
                        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-sm text-center px-6">
                        {building ? "جاري إنشاء المنصة... ستظهر هنا عند الانتهاء" : "ستظهر معاينة منصتك هنا بعد اكتمال البناء"}
                      </div>
                    )}
                  </div>
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
              onView={(p) => { setFinalHtml(p.html); setPlatformName(p.name); setDescription(p.description); setTab("build"); }}
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
