import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GJUFooter from "@/components/gju/GJUFooter";
import {
  Bot,
  Sparkles,
  ArrowLeft,
  Loader2,
  Cpu,
  Cog,
  Zap,
  Code2,
  ShoppingCart,
  ListChecks,
  ShieldAlert,
  Rocket,
  Download,
  Copy,
  ExternalLink,
  Wrench,
} from "lucide-react";

type Component = {
  name: string;
  quantity: string;
  price: string;
  purpose: string;
  shopUrl?: string;
};

type RobotSpec = {
  robotName: string;
  summary: string;
  category: string;
  difficulty: string;
  estimatedCost: string;
  buildTime: string;
  components: Component[];
  mechanicalDesign: {
    frame: string;
    actuators: string;
    sensors: string;
    powerSystem: string;
  };
  electricalSchema: string;
  code: { language: string; filename: string; content: string };
  assemblySteps: string[];
  safetyTips: string[];
  futureUpgrades: string[];
};

const examples = [
  "روبوت يسقي النباتات تلقائياً عند جفاف التربة",
  "روبوت تنظيف منزلي يتجنب العقبات",
  "روبوت يتعرف على الوجوه ويرحّب بالضيوف",
  "روبوت طائر صغير لمراقبة المزروعات",
];

const RoboticsGenerator: React.FC = () => {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<RobotSpec | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (idea.trim().length < 5) {
      toast({
        title: "أدخل وصفاً أطول",
        description: "صف فكرة الروبوت بـ 5 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setSpec(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "robotics-generator",
        { body: { idea } }
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSpec(data as RobotSpec);
      toast({ title: "تم توليد الروبوت بنجاح ✨" });
    } catch (e: any) {
      toast({
        title: "تعذّر التوليد",
        description: e?.message || "حاول لاحقاً",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!spec) return;
    navigator.clipboard.writeText(spec.code.content);
    toast({ title: "تم نسخ الكود" });
  };

  const downloadCode = () => {
    if (!spec) return;
    const blob = new Blob([spec.code.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = spec.code.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFullSpec = () => {
    if (!spec) return;
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.robotName.replace(/\s+/g, "_")}_specs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#04020e] text-white relative overflow-hidden" dir="rtl">
      <Helmet>
        <title>مولّد الروبوتات بالذكاء الاصطناعي | مستقبل التكنولوجيا</title>
        <meta name="description" content="صف فكرة الروبوت بالعربية واحصل على مخططات كاملة، كود Arduino، وقائمة مكونات بأسعار حقيقية." />
      </Helmet>

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/gju-competition">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              <ArrowLeft className="ml-2 h-4 w-4" />
              مستقبل التكنولوجيا
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-bold">Robotics AI</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6"
          >
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm text-violet-300">مدعوم بـ Gemini 2.5 Pro</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-violet-300 via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent leading-tight"
          >
            مولّد الروبوتات بالذكاء الاصطناعي
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
          >
            صف فكرة روبوتك بالعربية واحصل على مخططات هندسية كاملة، كود Arduino قابل للتنفيذ،
            وقائمة مكونات بأسعار حقيقية وروابط شراء.
          </motion.p>
        </div>
      </section>

      {/* Input */}
      <section className="relative z-10 px-4 pb-12">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
            <label className="block text-sm font-medium mb-3 text-white/80">
              صف فكرة الروبوت بالتفصيل
            </label>
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="مثال: روبوت ذكي يتجول في المنزل ويتعرف على الوجوه، وعند رؤية شخص غريب يرسل تنبيهاً للهاتف..."
              className="min-h-[140px] bg-black/30 border-white/10 text-white placeholder:text-white/40 text-base resize-none"
              disabled={loading}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition"
                >
                  {ex}
                </button>
              ))}
            </div>

            <Button
              onClick={generate}
              disabled={loading}
              size="lg"
              className="w-full mt-6 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-base h-14"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  يبني الذكاء الاصطناعي روبوتك...
                </>
              ) : (
                <>
                  <Sparkles className="ml-2 h-5 w-5" />
                  ولّد المواصفات الكاملة
                </>
              )}
            </Button>
          </Card>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {spec && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 px-4 pb-20"
          >
            <div className="container mx-auto max-w-6xl space-y-6">
              {/* Title card */}
              <Card className="bg-gradient-to-br from-violet-900/40 to-cyan-900/40 border-violet-500/30 p-8 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[260px]">
                    <h2 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                      {spec.robotName}
                    </h2>
                    <p className="text-white/80 text-lg mb-4">{spec.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-violet-500/20 text-violet-200 border-violet-500/30">
                        {spec.category}
                      </Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">
                        {spec.difficulty}
                      </Badge>
                      <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                        💰 {spec.estimatedCost}
                      </Badge>
                      <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                        ⏱ {spec.buildTime}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={downloadFullSpec}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تنزيل المواصفات
                  </Button>
                </div>
              </Card>

              {/* Mechanical Design */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Cog className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-xl font-bold">التصميم الميكانيكي</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "الهيكل", val: spec.mechanicalDesign.frame, icon: Wrench },
                    { label: "المحركات", val: spec.mechanicalDesign.actuators, icon: Cog },
                    { label: "الحساسات", val: spec.mechanicalDesign.sensors, icon: Cpu },
                    { label: "نظام الطاقة", val: spec.mechanicalDesign.powerSystem, icon: Zap },
                  ].map((item) => (
                    <div key={item.label} className="bg-black/20 border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-cyan-300">
                        <item.icon className="h-4 w-4" />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{item.val}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Electrical schema */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-amber-400" />
                  <h3 className="text-xl font-bold">المخطط الكهربائي</h3>
                </div>
                <div className="bg-black/30 border border-amber-500/20 rounded-xl p-5 text-white/85 text-sm leading-loose whitespace-pre-line">
                  {spec.electricalSchema}
                </div>
              </Card>

              {/* Components */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-xl font-bold">قائمة المكونات ({spec.components.length})</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {spec.components.map((c, i) => (
                    <div
                      key={i}
                      className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white">{c.name}</h4>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                          ×{c.quantity}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{c.purpose}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-emerald-300 font-semibold text-sm">{c.price}</span>
                        {c.shopUrl && (
                          <a
                            href={c.shopUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                          >
                            شراء <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Code */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-6 w-6 text-fuchsia-400" />
                    <div>
                      <h3 className="text-xl font-bold">{spec.code.filename}</h3>
                      <p className="text-xs text-white/50">{spec.code.language}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyCode} className="border-white/20 text-white hover:bg-white/10">
                      <Copy className="ml-1 h-3 w-3" /> نسخ
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadCode} className="border-white/20 text-white hover:bg-white/10">
                      <Download className="ml-1 h-3 w-3" /> تنزيل
                    </Button>
                  </div>
                </div>
                <pre dir="ltr" className="bg-black/50 border border-fuchsia-500/20 rounded-xl p-5 overflow-x-auto text-sm text-green-300 font-mono leading-relaxed max-h-[500px] overflow-y-auto">
                  <code>{spec.code.content}</code>
                </pre>
              </Card>

              {/* Assembly */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ListChecks className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-bold">خطوات التجميع</h3>
                </div>
                <ol className="space-y-3">
                  {spec.assemblySteps.map((s, i) => (
                    <li key={i} className="flex gap-3 bg-black/20 border border-white/5 rounded-xl p-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-white/85 text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              {/* Safety + Future */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-rose-950/20 border-rose-500/20 backdrop-blur-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert className="h-6 w-6 text-rose-400" />
                    <h3 className="text-xl font-bold">نصائح الأمان</h3>
                  </div>
                  <ul className="space-y-2">
                    {spec.safetyTips.map((t, i) => (
                      <li key={i} className="text-white/80 text-sm flex gap-2">
                        <span className="text-rose-400">⚠</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="bg-emerald-950/20 border-emerald-500/20 backdrop-blur-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Rocket className="h-6 w-6 text-emerald-400" />
                    <h3 className="text-xl font-bold">ترقيات مستقبلية</h3>
                  </div>
                  <ul className="space-y-2">
                    {spec.futureUpgrades.map((u, i) => (
                      <li key={i} className="text-white/80 text-sm flex gap-2">
                        <span className="text-emerald-400">🚀</span>
                        {u}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <GJUFooter />
    </div>
  );
};

export default RoboticsGenerator;
