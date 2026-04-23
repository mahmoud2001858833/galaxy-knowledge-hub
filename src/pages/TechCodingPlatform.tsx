import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft, Sparkles, Wrench, Bot, Code2, Play, Save, Download, Upload,
  Loader2, Send, Eye, FileCode, RefreshCcw, Copy, Check, Trash2, Cpu, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Tab = "ai-code" | "fix-code" | "build-platform";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
];

const TAB_ALIASES: Record<string, Tab> = {
  "ai-code": "ai-code",
  "ai-assistant": "ai-code",
  "fix-code": "fix-code",
  "build-platform": "build-platform",
};

const TechCodingPlatform = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(
    requestedTab && TAB_ALIASES[requestedTab] ? TAB_ALIASES[requestedTab] : "ai-code"
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && TAB_ALIASES[t] && TAB_ALIASES[t] !== tab) {
      setTab(TAB_ALIASES[t]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const changeTab = (newTab: Tab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#05060f] text-white relative overflow-hidden">
      <Helmet>
        <title>منصة البرمجة الذكية - مستقبل التكنولوجيا</title>
        <meta name="description" content="بيئة برمجة متكاملة بالذكاء الاصطناعي: توليد الكود، تصحيحه، وبناء منصات كاملة" />
      </Helmet>

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/gju-competition")}
              className="text-white/70 hover:text-white hover:bg-white/5 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              مستقبل التكنولوجيا
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-l from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  منصة البرمجة الذكية
                </h1>
                <p className="text-xs text-white/50">AI-Powered Code Studio</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/70">AI متصل</span>
            </div>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="container mx-auto px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 justify-center mb-8"
          >
            {[
              { id: "ai-code" as Tab, icon: Sparkles, label: "كتابة الكود بالذكاء الاصطناعي", gradient: "from-violet-500 to-purple-600" },
              { id: "fix-code" as Tab, icon: Wrench, label: "تصليح الكود", gradient: "from-amber-500 to-orange-600" },
              { id: "build-platform" as Tab, icon: Bot, label: "بناء منصة كاملة بالـAI", gradient: "from-cyan-500 to-blue-600" },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => changeTab(t.id)}
                  className={`group relative px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    active
                      ? "text-white shadow-2xl scale-105"
                      : "text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-tab"
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${t.gradient} shadow-lg`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {t.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Content */}
        <main className="container mx-auto px-4 pb-12">
          <AnimatePresence mode="wait">
            {tab === "ai-code" && <AICodeStudio key="ai-code" />}
            {tab === "fix-code" && <CodeFixerStudio key="fix-code" />}
            {tab === "build-platform" && <PlatformBuilder key="build-platform" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* ============================== AI CODE STUDIO ============================== */
const AICodeStudio = () => {
  const [language, setLanguage] = useState("javascript");
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("// اكتب وصفاً للكود الذي تريده وسيقوم الذكاء الاصطناعي بتوليده هنا\n");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return toast.error("اكتب وصفاً للكود");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tech-ai-code-gen", {
        body: { prompt, language, existingCode: code.startsWith("//") ? "" : code },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCode(data.code || "");
      setExplanation(data.explanation || "");
      toast.success("تم توليد الكود ✨");
    } catch (e: any) {
      toast.error(e.message || "فشل التوليد");
    } finally {
      setLoading(false);
    }
  };

  const saveAsProject = async () => {
    if (!projectTitle.trim()) return toast.error("أدخل اسم المشروع");
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("سجل الدخول أولاً لحفظ المشروع");
        navigate_to_auth();
        return;
      }
      const { data: project, error } = await supabase
        .from("ai_builder_projects")
        .insert({ title: projectTitle, description: prompt, user_id: user.id, project_type: "code" })
        .select()
        .single();
      if (error) throw error;

      const ext = language === "javascript" ? "js" : language === "typescript" ? "ts" : language;
      await supabase.from("ai_builder_files").insert({
        project_id: project.id,
        user_id: user.id,
        file_name: `main.${ext}`,
        file_path: `/main.${ext}`,
        file_type: language,
        content: code,
      });
      toast.success("تم حفظ المشروع بنجاح 🚀");
      setProjectTitle("");
    } catch (e: any) {
      toast.error(e.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const navigate_to_auth = () => (window.location.href = "/auth");

  const downloadCode = () => {
    const ext = language === "javascript" ? "js" : language === "typescript" ? "ts" : language;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPreviewable = ["html", "css", "javascript"].includes(language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-[420px_1fr] gap-6"
    >
      {/* Left: AI prompt panel */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold">مساعد البرمجة الذكي</h2>
          </div>

          <label className="text-xs text-white/60 mb-1 block">لغة البرمجة</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-black/40 border-white/10 text-white mb-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0b18] border-white/10 text-white">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-xs text-white/60 mb-1 block">وصف ما تريده</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: دالة تحسب أعداد فيبوناتشي بطريقة العودية مع memoization"
            className="bg-black/40 border-white/10 text-white min-h-[120px] resize-none mb-4"
          />

          <Button
            onClick={generate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span className="mr-2">{loading ? "جارٍ التوليد..." : "توليد الكود"}</span>
          </Button>
        </div>

        {explanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5"
          >
            <h3 className="text-sm font-bold text-violet-300 mb-2">شرح الكود</h3>
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{explanation}</p>
          </motion.div>
        )}

        {/* Save as project */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Save className="w-4 h-4 text-cyan-400" /> رفع كمشروع
          </h3>
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="اسم المشروع"
            className="bg-black/40 border-white/10 text-white"
          />
          <Button
            onClick={saveAsProject}
            disabled={saving}
            variant="outline"
            className="w-full bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="mr-2">حفظ كمشروع</span>
          </Button>
        </div>
      </div>

      {/* Right: Editor + Preview */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">main.{language === "javascript" ? "js" : language === "typescript" ? "ts" : language}</span>
          </div>
          <div className="flex items-center gap-2">
            {isPreviewable && (
              <Button size="sm" variant="ghost" onClick={() => setShowPreview((v) => !v)} className="text-white/70 hover:text-white hover:bg-white/10">
                <Eye className="w-4 h-4 ml-1" />
                {showPreview ? "إخفاء المعاينة" : "معاينة حية"}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={downloadCode} className="text-white/70 hover:text-white hover:bg-white/10">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className={`grid ${showPreview && isPreviewable ? "md:grid-cols-2" : "grid-cols-1"} divide-x divide-white/10`}>
          <div className="h-[600px]">
            <Editor
              height="600px"
              language={language}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                fontLigatures: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
          </div>
          {showPreview && isPreviewable && <LivePreview code={code} language={language} />}
        </div>
      </div>
    </motion.div>
  );
};

/* ============================== LIVE PREVIEW ============================== */
const LivePreview = ({ code, language }: { code: string; language: string }) => {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let html = "";
    if (language === "html") html = code;
    else if (language === "css") html = `<style>${code}</style><div style="padding:20px;color:#fff">معاينة CSS</div>`;
    else if (language === "javascript")
      html = `<!doctype html><html><body style="background:#0a0b18;color:#fff;font-family:sans-serif;padding:20px"><pre id="out"></pre><script>const log=(...a)=>{document.getElementById('out').textContent+=a.join(' ')+'\\n'};const console={log,error:log,warn:log};try{${code}}catch(e){log('Error:',e.message)}<\/script></body></html>`;
    setSrc(html);
  }, [code, language]);
  return (
    <iframe
      srcDoc={src}
      title="preview"
      sandbox="allow-scripts"
      className="w-full h-[600px] bg-white"
    />
  );
};

/* ============================== CODE FIXER ============================== */
const CodeFixerStudio = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [fixed, setFixed] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setCode(text);
    toast.success(`تم رفع ${f.name}`);
  };

  const fix = async () => {
    if (!code.trim()) return toast.error("ألصق الكود أو ارفع ملفاً");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tech-ai-code-fix", {
        body: { code, language, errorMessage: errMsg },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setFixed(data.fixedCode || "");
      setAnalysis(data.analysis || "");
      toast.success("تم تحليل وتصحيح الكود ✨");
    } catch (e: any) {
      toast.error(e.message || "فشل التصحيح");
    } finally {
      setLoading(false);
    }
  };

  const copyFixed = async () => {
    await navigator.clipboard.writeText(fixed);
    toast.success("تم النسخ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.02] backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">تصليح الكود الذكي</h2>
            <p className="text-xs text-white/60">ارفع ملفاً أو ألصق الكود وسيقوم الذكاء الاصطناعي بتحليله وتصحيحه</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-black/40 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0b18] border-white/10 text-white">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="cursor-pointer">
            <input type="file" accept=".js,.ts,.py,.html,.css,.java,.cpp,.cs,.php,.go,.rs,.sql,.txt" onChange={onFile} className="hidden" />
            <div className="bg-black/40 border border-white/10 hover:border-amber-500/30 rounded-md px-4 py-2 text-sm flex items-center gap-2 justify-center text-white/70 hover:text-white transition">
              <Upload className="w-4 h-4" /> رفع ملف
            </div>
          </label>

          <Button
            onClick={fix}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            <span className="mr-2">{loading ? "جارٍ التحليل..." : "صحّح الكود"}</span>
          </Button>
        </div>

        <Input
          value={errMsg}
          onChange={(e) => setErrMsg(e.target.value)}
          placeholder="رسالة الخطأ (اختياري)"
          className="bg-black/40 border-white/10 text-white mb-4"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">الكود الأصلي</span>
            {code && (
              <Button size="sm" variant="ghost" onClick={() => setCode("")} className="text-white/50 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <Editor
            height="450px"
            language={language}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 12 } }}
          />
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-black/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-300">الكود المصحّح</span>
            {fixed && (
              <Button size="sm" variant="ghost" onClick={copyFixed} className="text-white/70 hover:text-white">
                <Copy className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <Editor
            height="450px"
            language={language}
            value={fixed}
            theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, readOnly: true, padding: { top: 12 } }}
          />
        </div>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.05] backdrop-blur-xl p-6"
        >
          <h3 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> التحليل والإصلاحات
          </h3>
          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{analysis}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

/* ============================== PLATFORM BUILDER ============================== */
const PlatformBuilder = () => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("tech-ai-platform-builder", {
        body: { description: input, conversation: messages },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setHtml(data.html || "");
      setMessages([
        ...newMessages,
        { role: "assistant", content: "تم بناء المنصة! شاهد المعاينة على اليسار. اطلب أي تعديلات إضافية." },
      ]);
      toast.success("تم البناء 🎉");
    } catch (e: any) {
      toast.error(e.message || "فشل البناء");
      setMessages([...newMessages, { role: "assistant", content: `حدث خطأ: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    if (!html) return toast.error("ابنِ المنصة أولاً");
    if (!projectTitle.trim()) return toast.error("أدخل اسم المشروع");
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("سجل الدخول لحفظ المشروع");
        window.location.href = "/auth";
        return;
      }
      const { data: project, error } = await supabase
        .from("ai_builder_projects")
        .insert({
          title: projectTitle,
          description: messages[0]?.content || "منصة مولّدة بالذكاء الاصطناعي",
          user_id: user.id,
          project_type: "platform",
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("ai_builder_files").insert({
        project_id: project.id,
        user_id: user.id,
        file_name: "index.html",
        file_path: "/index.html",
        file_type: "html",
        content: html,
      });
      toast.success("تم حفظ المنصة بنجاح 🚀");
      setProjectTitle("");
    } catch (e: any) {
      toast.error(e.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platform.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-[400px_1fr] gap-6"
    >
      {/* Chat panel */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.04] to-blue-500/[0.02] backdrop-blur-xl flex flex-col h-[700px]">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">باني المنصات الذكي</h2>
            <p className="text-xs text-white/60">صف منصتك وسأبنيها لك</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 text-white/40 text-sm">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>اكتب وصفاً لمنصتك في الأسفل</p>
              <p className="mt-2 text-xs">مثال: منصة لإدارة المهام مع تسجيل دخول وقائمة مهام</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                    : "bg-white/5 border border-white/10 text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                جارٍ البناء...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="اوصف منصتك..."
              className="bg-black/40 border-white/10 text-white min-h-[60px] resize-none"
            />
            <Button
              onClick={send}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 self-end shadow-lg shadow-cyan-500/30"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col h-[700px]">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">معاينة حية</span>
          </div>
          {html && (
            <div className="flex gap-2 items-center">
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="اسم المشروع"
                className="bg-black/40 border-white/10 text-white h-8 w-44 text-xs"
              />
              <Button size="sm" onClick={saveProject} disabled={saving} variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={downloadHtml} className="text-white/70">
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        {html ? (
          <iframe srcDoc={html} sandbox="allow-scripts" title="platform-preview" className="flex-1 w-full bg-white" />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30">
            <Code2 className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-sm">المعاينة ستظهر هنا بعد البناء</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TechCodingPlatform;
