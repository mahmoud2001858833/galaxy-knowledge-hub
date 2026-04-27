import React, { useState, useRef, useEffect, useMemo } from "react";
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

type Tab = "ai-code" | "fix-code" | "build-platform" | "platform-eval";

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
  "code-fixer": "fix-code",
  "build-platform": "build-platform",
  "platform-eval": "platform-eval",
};

// Detect GJU mode (route-based or session)
const isGJUContext = () => {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname || "";
  return p.startsWith("/gju") || sessionStorage.getItem("gju_mode") === "true";
};

const TechCodingPlatform = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isGJU = isGJUContext();
  const allowedTabs: Tab[] = isGJU ? ["fix-code", "platform-eval"] : ["ai-code", "fix-code", "build-platform"];
  const requestedTab = searchParams.get("tab");
  const initial: Tab =
    requestedTab && TAB_ALIASES[requestedTab] && allowedTabs.includes(TAB_ALIASES[requestedTab])
      ? TAB_ALIASES[requestedTab]
      : (isGJU ? "fix-code" : "ai-code");
  const [tab, setTab] = useState<Tab>(initial);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && TAB_ALIASES[t] && allowedTabs.includes(TAB_ALIASES[t]) && TAB_ALIASES[t] !== tab) {
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
            {(
              [
                { id: "ai-code" as Tab, icon: Sparkles, label: "كتابة الكود بالذكاء الاصطناعي", gradient: "from-violet-500 to-purple-600" },
                { id: "fix-code" as Tab, icon: Wrench, label: "تصليح الكود", gradient: "from-amber-500 to-orange-600" },
                { id: "build-platform" as Tab, icon: Bot, label: "بناء منصة كاملة بالـAI", gradient: "from-cyan-500 to-blue-600" },
                { id: "platform-eval" as Tab, icon: Sparkles, label: "تقييم المنصات", gradient: "from-fuchsia-500 to-pink-600" },
              ] as const
            ).filter((t) => allowedTabs.includes(t.id)).map((t) => {
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
            {tab === "platform-eval" && <PlatformEvaluator key="platform-eval" />}
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

  const isPreviewable = ["html", "css", "javascript", "typescript", "python"].includes(language);

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
  const [runKey, setRunKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildSrc = (lang: string, src: string) => {
    const base = `<!doctype html><html><head><meta charset="utf-8"><style>
      body{background:#0a0b18;color:#e6e7ee;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:16px;margin:0;line-height:1.6}
      #__console{white-space:pre-wrap;font-size:13px}
      #__console .err{color:#ff6b6b}
      #__console .warn{color:#ffd166}
      #__console .info{color:#7dd3fc}
      #__app{margin-top:12px}
      .py-loading{color:#a78bfa;display:flex;align-items:center;gap:8px}
      .py-loading::before{content:"";width:14px;height:14px;border:2px solid #a78bfa;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.8s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
    </style></head><body>`;
    const consoleSetup = `
      const __out=document.createElement('div');__out.id='__console';document.body.appendChild(__out);
      const __print=(cls,args)=>{const line=document.createElement('div');if(cls)line.className=cls;line.textContent=args.map(a=>{try{return typeof a==='object'?JSON.stringify(a,null,2):String(a)}catch(e){return String(a)}}).join(' ');__out.appendChild(line)};
      const __origConsole=window.console;
      window.console={log:(...a)=>__print('',a),error:(...a)=>__print('err',a),warn:(...a)=>__print('warn',a),info:(...a)=>__print('info',a)};
      window.addEventListener('error',e=>__print('err',['Error:',e.message]));
      window.addEventListener('unhandledrejection',e=>__print('err',['Promise:',e.reason]));
    `;

    if (lang === "html") {
      return src;
    }
    if (lang === "css") {
      return `${base}<style>${src}</style>
        <div style="background:#fff;color:#111;padding:20px;border-radius:8px;margin-bottom:12px">
          <h1>عنوان رئيسي</h1>
          <p>فقرة نموذجية لاختبار التصميم.</p>
          <button>زر</button> <a href="#">رابط</a>
          <ul><li>عنصر ١</li><li>عنصر ٢</li></ul>
        </div></body></html>`;
    }
    if (lang === "javascript") {
      return `${base}<div id="app"></div><script>${consoleSetup}try{${src}}catch(e){console.error(e.message)}<\/script></body></html>`;
    }
    if (lang === "typescript") {
      // strip TS types crudely via Babel
      return `${base}<div id="app"></div>
        <script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"><\/script>
        <script>${consoleSetup}try{const __js=Babel.transform(${JSON.stringify(src)},{presets:['typescript'],filename:'f.ts'}).code;(0,eval)(__js)}catch(e){console.error(e.message)}<\/script></body></html>`;
    }
    if (lang === "python") {
      return `${base}<div class="py-loading">جارٍ تحميل بيئة Python...</div>
        <script src="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"><\/script>
        <script>${consoleSetup}
          (async()=>{
            try{
              const py=await loadPyodide();
              document.querySelector('.py-loading')?.remove();
              py.setStdout({batched:s=>console.log(s)});
              py.setStderr({batched:s=>console.error(s)});
              await py.runPythonAsync(${JSON.stringify(src)});
            }catch(e){console.error(e.message||e)}
          })();
        <\/script></body></html>`;
    }
    return base + "</body></html>";
  };

  useEffect(() => {
    setSrc(buildSrc(language, code));
  }, [code, language, runKey]);

  return (
    <div className="flex flex-col h-[600px] bg-[#0a0b18]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40">
        <span className="text-xs text-white/60 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> معاينة حية {language === "python" && "(Pyodide)"}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setRunKey((k) => k + 1)}
          className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10"
        >
          <RefreshCcw className="w-3 h-3 ml-1" /> تشغيل
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={src}
        title="preview"
        sandbox="allow-scripts"
        className="flex-1 w-full bg-white"
      />
    </div>
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
// Wraps any AI-generated HTML with a safe shell so the preview never goes black,
// always has a viewport, base font, and a visible background even before the AI styles load.
function wrapWithSafeShell(raw: string): string {
  if (!raw) return "";
  let html = raw.trim();
  // Strip accidental markdown fences
  html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();

  const baseStyle = `<style id="__safe_shell__">html,body{background:#ffffff;color:#0f172a;margin:0;min-height:100vh;font-family:'Cairo','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased}body:empty::before{content:'جارٍ تشغيل المنصة...';display:flex;align-items:center;justify-content:center;min-height:100vh;color:#7c3aed;font-size:1.1rem;font-weight:700}img{max-width:100%}</style>`;
  const viewport = `<meta name="viewport" content="width=device-width,initial-scale=1">`;
  const cairo = `<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">`;

  // If it has <head>, inject base style FIRST so AI styles still win on cascade
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${viewport}${cairo}${baseStyle}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html([^>]*)>/i, `<html$1><head>${viewport}${cairo}${baseStyle}</head>`);
  } else {
    // No skeleton at all → wrap everything
    html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">${viewport}${cairo}${baseStyle}</head><body>${html}</body></html>`;
  }
  return html;
}

const PlatformBuilder = () => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const safeHtml = useMemo(() => wrapWithSafeShell(html), [html]);

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
      className="space-y-4"
    >
      {/* Capabilities banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-white/90">قدرات المنصة المُولّدة:</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">🗄️ قاعدة بيانات</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">🔐 تسجيل دخول</span>
          <span className="px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">🤖 مساعد AI</span>
          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">🐍 Python</span>
          <span className="px-3 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">⚙️ C++</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">📱 Responsive</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Chat panel */}
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.04] to-blue-500/[0.02] backdrop-blur-xl flex flex-col h-[760px]">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">باني المنصات الذكي</h2>
              <p className="text-xs text-white/60">صف منصتك وسأبنيها كاملة</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 text-white/50 text-sm space-y-3">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-white/70">اكتب وصفاً لمنصتك</p>
                <div className="text-xs space-y-2 text-right bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-cyan-300 font-bold">أمثلة:</p>
                  <p>• منصة لإدارة المهام مع AI لاقتراح الأولويات</p>
                  <p>• متجر إلكتروني بسلة مشتريات وقاعدة منتجات</p>
                  <p>• منصة تعليم برمجة بمحرر Python و C++</p>
                  <p>• شبكة اجتماعية مصغرة بمنشورات ومحادثات</p>
                </div>
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
                  جارٍ بناء المنصة الكاملة...
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
                placeholder="اوصف منصتك بالتفصيل..."
                className="bg-black/40 border-white/10 text-white min-h-[70px] resize-none"
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
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col h-[760px]">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">معاينة حية تفاعلية</span>
              {html && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ● جاهزة
                </span>
              )}
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
                <Button size="sm" variant="ghost" onClick={downloadHtml} className="text-white/70" title="تحميل HTML">
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const blob = new Blob([safeHtml], { type: "text/html;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const w = window.open(url, "_blank");
                    if (!w) {
                      // popup blocked → fallback document.write
                      const w2 = window.open("", "_blank");
                      if (w2) { w2.document.open(); w2.document.write(safeHtml); w2.document.close(); }
                    }
                    setTimeout(() => URL.revokeObjectURL(url), 60_000);
                  }}
                  className="text-white/70"
                  title="فتح في نافذة جديدة"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
          {html ? (
            <div className="flex-1 bg-gradient-to-br from-[#0b0b1a] via-[#101028] to-[#0b0b1a] p-4 overflow-auto">
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(34,211,238,0.45)] ring-1 ring-white/10 h-full flex flex-col">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300/60 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-white/80 border border-slate-300/50 text-[10px] text-slate-500 font-mono truncate" dir="ltr">
                    preview · ai-platform.local
                  </div>
                </div>
                <iframe
                  key={safeHtml.length}
                  srcDoc={safeHtml}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                  title="platform-preview"
                  className="flex-1 w-full bg-white border-0"
                  onLoad={() => setPreviewError(false)}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-8">
              <Code2 className="w-20 h-20 mb-4 opacity-50" />
              <p className="text-sm font-semibold mb-2">المعاينة الحية ستظهر هنا</p>
              <p className="text-xs text-center max-w-md leading-relaxed">
                ستحصل على منصة كاملة بقاعدة بيانات محلية، تسجيل دخول، مساعد AI مدمج،
                ومحرر يُنفّذ Python و C++ مباشرة في المتصفح.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ============================== PLATFORM EVALUATOR ============================== */
const PlatformEvaluator = () => {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    summary: string;
  } | null>(null);

  const evaluate = async () => {
    if (!description.trim() || description.trim().length < 20) {
      toast.error("اكتب وصفاً للمنصة (20 حرف على الأقل)");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `قيّم منصة الويب التالية بشكل احترافي وحيادي.\n\nالرابط: ${url || "غير محدد"}\nالوصف: ${description}\n\nأعد JSON صارم بهذا الشكل بدون أي شرح:\n{\n  "score": رقم من 0 إلى 100,\n  "strengths": ["نقطة قوة 1", ...],\n  "weaknesses": ["نقطة ضعف 1", ...],\n  "suggestions": ["اقتراح تحسين 1", ...],\n  "summary": "ملخص نهائي بالعربية في 2-3 جمل"\n}\n\nركّز على: تجربة المستخدم، التصميم، الأداء، إمكانية الوصول، القيمة الفعلية، الاحترافية.`;

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } },
      });
      if (error) throw error;
      const raw = (data as any)?.message || (data as any)?.content || (data as any)?.text || "";
      const cleaned = String(raw).replace(/```json|```/g, "").trim();
      setResult(JSON.parse(cleaned));
      toast.success("تم تقييم المنصة بنجاح");
    } catch (e: any) {
      console.error(e);
      toast.error("تعذّر التقييم: " + (e?.message || "خطأ غير معروف"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">تقييم المنصات بالذكاء الاصطناعي</h2>
        </div>
        <p className="text-white/60 text-sm mb-6">
          أدخل رابط منصتك ووصفها لتحصل على تقييم احترافي شامل مع نقاط القوة والضعف واقتراحات التحسين.
        </p>

        <label className="text-xs text-white/60 mb-1 block">رابط المنصة (اختياري)</label>
        <Input
          dir="ltr"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-black/40 border-white/10 text-white mb-4"
        />

        <label className="text-xs text-white/60 mb-1 block">وصف المنصة وأهدافها</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="مثال: منصة تعليمية للأطفال تركز على تعلّم الرياضيات بأسلوب تفاعلي..."
          className="bg-black/40 border-white/10 text-white min-h-[140px] resize-none mb-4"
        />

        <Button
          onClick={evaluate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 shadow-lg shadow-pink-500/30"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="mr-2">{loading ? "جارٍ التقييم..." : "قيّم منصتي الآن"}</span>
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 p-8 text-center">
            <div className="text-7xl font-black bg-gradient-to-r from-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              {result.score}/100
            </div>
            <p className="text-white/80 mt-3 leading-relaxed">{result.summary}</p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h3 className="text-base font-bold text-emerald-300 mb-3">✓ نقاط القوة</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              {result.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>

          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-6">
            <h3 className="text-base font-bold text-orange-300 mb-3">⚠ نقاط تحتاج تحسين</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              {result.weaknesses?.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
            <h3 className="text-base font-bold text-cyan-300 mb-3">💡 اقتراحات التحسين</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              {result.suggestions?.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TechCodingPlatform;

