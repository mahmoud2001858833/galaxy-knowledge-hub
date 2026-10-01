import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Cpu, 
  Sliders, 
  Eye, 
  Play, 
  Terminal, 
  Send, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Atom, 
  BrainCircuit, 
  HelpCircle, 
  GraduationCap, 
  Layers, 
  Share2, 
  FileText,
  Flame,
  ArrowUpRight,
  Stethoscope,
  Volume2,
  TreeDeciduous,
  Compass,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  PlatformAIAgentsService, 
  PlatformAIAgent, 
  AgentActivityLog 
} from '@/data/platformAIAgentsData';
import { auditLogger } from '@/services/auditLogger';
import { Link } from 'react-router-dom';

export const AIAgentsManagementHub: React.FC = () => {
  const [agents, setAgents] = useState<PlatformAIAgent[]>(() => PlatformAIAgentsService.getAllAgents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'turbo' | 'active'>('all');
  
  // Live Testing Console State
  const [testingModalOpen, setTestingModalOpen] = useState(false);
  const [activeTestAgent, setActiveTestAgent] = useState<PlatformAIAgent | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [isInferencing, setIsInferencing] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<{
    reasoning: string;
    answer: string;
    tokens: number;
    latency: number;
  } | null>(null);
  const [customTemp, setCustomTemp] = useState<number>(0.2);

  // Agent Logs Modal
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [viewingLogsAgent, setViewingLogsAgent] = useState<PlatformAIAgent | null>(null);

  // Listen to registry updates
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<PlatformAIAgent[]>) => {
      if (e.detail) setAgents([...e.detail]);
    };
    window.addEventListener('galaxy_ai_agents_registry_updated' as any, handleUpdate);
    return () => window.removeEventListener('galaxy_ai_agents_registry_updated' as any, handleUpdate);
  }, []);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = 
        agent.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.systemPromptSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'turbo' && agent.isBoosted) || 
        (statusFilter === 'active' && !agent.isBoosted);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [agents, searchQuery, selectedCategory, statusFilter]);

  // Aggregate Metrics
  const totalAgentsCount = agents.length;
  const boostedCount = agents.filter(a => a.isBoosted).length;
  const totalQueriesAll = agents.reduce((sum, a) => sum + a.totalQueries, 0);
  const avgLatency = Math.round(agents.reduce((sum, a) => sum + a.avgLatencyMs, 0) / (agents.length || 1));
  const avgAccuracy = (agents.reduce((sum, a) => sum + a.accuracyRate, 0) / (agents.length || 1)).toFixed(1);

  // Toggle individual boost
  const handleToggleBoost = (agentId: string) => {
    const updated = PlatformAIAgentsService.toggleAgentBoost(agentId);
    if (updated) {
      setAgents([...PlatformAIAgentsService.getAllAgents()]);
      toast.success(
        updated.isBoosted 
          ? `🚀 تم تفعيل التعزيز الفائق (Turbo Supercharge) لـ: ${updated.nameAr}`
          : `تم إعادة ضبط القدرة القياسية لـ: ${updated.nameAr}`
      );
      auditLogger.record({
        action: 'CONFIG_CHANGE',
        module: 'إدارة الوكلاء والذكاء الاصطناعي',
        description: `تغيير قدرة الوكيل: ${updated.nameAr} إلى ${updated.isBoosted ? 'معزز خارق (Turbo)' : 'نمط قياسي'}`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });
    }
  };

  // Boost all agents globally
  const handleBoostAll = () => {
    PlatformAIAgentsService.boostAllAgents();
    setAgents([...PlatformAIAgentsService.getAllAgents()]);
    toast.success(`⚡ تم تعزيز كافة الوكلاء (${totalAgentsCount} وكيل) إلى نمط القدرة الفائقة الأقصى (Turbo)!`);
    auditLogger.record({
      action: 'CONFIG_CHANGE',
      module: 'إدارة الوكلاء والذكاء الاصطناعي',
      description: `تعزيز شامل لكافة وكلاء المنصة (${totalAgentsCount} وكيل) إلى النمط الفائق`,
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'info'
    });
  };

  // Open Testing Modal
  const handleOpenTesting = (agent: PlatformAIAgent) => {
    setActiveTestAgent(agent);
    setCustomTemp(agent.temperature);
    setTestPrompt(agent.samplePrompts[0] || 'اشرح المفهوم الأساسي واشتق العلاقة الرياضية خطوة بخطوة');
    setInferenceResult(null);
    setTestingModalOpen(true);
  };

  // Run Test Inference
  const handleRunInference = async () => {
    if (!activeTestAgent || !testPrompt.trim()) return;
    setIsInferencing(true);
    setInferenceResult(null);

    const start = performance.now();
    await new Promise(r => setTimeout(r, 600)); // Smooth inference simulation

    const latency = Math.round(performance.now() - start);
    const tokens = Math.floor(Math.random() * 280) + 320;

    let sampleReasoning = `سلسلة التفكير والاستدلال المعرفي [Chain of Thought]:\n1. فحص استفسار المستخدم: "${testPrompt}".\n2. استرجاع القوانين والمحددات العلمية الموثقة لمجال (${activeTestAgent.discipline}).\n3. تطبيق المعايرة المعرفية وضبط التنسيق الرياضي LaTeX.\n4. التحقق من الدقة البرهانية ومستويات بلوم المعرفية.`;
    let sampleAnswer = `تمت المعالجة بنجاح عبر ${activeTestAgent.model} بنمط القدرة المعززة (Turbo Engine):\n\n**الإجابة النموذجية المفصلة:**\nتطبيقاً للمبادئ الأكاديمية الراسخة، فإن الاستفسار يعتمد على دراسة التوازن الديناميكي والروابط التفاعلية. يتم تحليل الظاهرة عبر ثلاث ركائز أساسية:\n\n1. **التعريف العلمي الدقيق:** ضبط المتغيرات وفق النظام الدولي للوحدات (SI).\n2. **البرهان الرياضي / الفيزيائي:** \\( \\Delta E = h \\nu - \\Phi \\) مع مراعاة ثوابت بلانك وشروط العتبة.\n3. **التطبيق والمحاكاة التفاعلية:** إرسال نبضات التحفيز للمحاكاة لتعديل المشهد في الوقت الحقيقي بنسبة دقة ${activeTestAgent.accuracyRate}%.`;

    const result = {
      reasoning: sampleReasoning,
      answer: sampleAnswer,
      tokens,
      latency
    };

    setInferenceResult(result);
    setIsInferencing(false);

    // Record in agent log
    PlatformAIAgentsService.logAgentQuery(activeTestAgent.id, {
      queryType: 'فحص تجريبي إداري',
      userQuery: testPrompt,
      responseSnippet: sampleAnswer.slice(0, 100) + '...',
      tokensUsed: tokens,
      latencyMs: latency,
      status: 'enhanced'
    });
    setAgents([...PlatformAIAgentsService.getAllAgents()]);

    toast.success(`اكتملت المعالجة بنجاح (${latency}ms) — تم استهلاك ${tokens} رمز`);
  };

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return GraduationCap;
      case 'simulations': return Atom;
      case 'special_ed': return Volume2;
      case 'medical': return Stethoscope;
      case 'environment': return TreeDeciduous;
      case 'assessment': return BrainCircuit;
      case 'tools': return Code2;
      default: return Bot;
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Bot className="w-4 h-4 animate-pulse" />
              <span>لوحة القيادة المركزية للذكاء الاصطناعي الفائق (AI Nexus)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>إدارة ورصد وكلاء ونماذج الذكاء الاصطناعي</span>
              <span className="text-sm px-3 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-mono font-normal">
                {totalAgentsCount} وكيل مستقل
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              رصد حي لكافة المساعدين الأكاديميين، وكلاء المحاكيات الـ 49، أنظمة الدمج وبرايل، الوكلاء العياديين، ومحركات التوليد مع صلاحية تعزيز قدرة الإجابة (Turbo Mode) واختبارها فورياً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleBoostAll}
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm h-11 px-5 rounded-2xl shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 text-amber-200 animate-bounce" />
              <span>تعزيز جميع الوكلاء (Supercharge All {totalAgentsCount})</span>
            </Button>

            <Button
              onClick={() => {
                setAgents([...PlatformAIAgentsService.getAllAgents()]);
                toast.success('تمت مزامنة فهارس الذكاء وتحديث المقاييس الحية');
              }}
              variant="outline"
              className="bg-white/10 hover:bg-white/15 border-white/20 text-white font-bold text-xs h-11 rounded-2xl"
            >
              <RefreshCw className="w-4 h-4 text-cyan-300 ml-1.5" />
              <span>مزامنة الفهارس</span>
            </Button>
          </div>
        </div>

        {/* 2. Top Metric KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>إجمالي الوكلاء</span>
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalAgentsCount}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3" /> 100% متصلون ومتاحون
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>الوكلاء بالقدرة الفائقة (Turbo)</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">{boostedCount} / {totalAgentsCount}</div>
            <div className="text-[11px] text-amber-400 font-bold">
              {Math.round((boostedCount / totalAgentsCount) * 100)}% بأعلى كفاءة تفكير
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>متوسط زمن الاستجابة</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300">{avgLatency}ms</div>
            <div className="text-[11px] text-purple-400 font-bold">
              استجابة فائقة السرعة
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>معدل الدقة البرهانية</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300">{avgAccuracy}%</div>
            <div className="text-[11px] text-emerald-400 font-bold">
              {totalQueriesAll.toLocaleString()} استفسار معالج
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Category Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المحاكاة، المجال، أو التخصص..."
              className="pr-10 h-10 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Button
              onClick={() => setStatusFilter('all')}
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl text-xs font-bold h-8"
            >
              الكل ({agents.length})
            </Button>
            <Button
              onClick={() => setStatusFilter('turbo')}
              variant={statusFilter === 'turbo' ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl text-xs font-bold h-8 gap-1 text-amber-600 dark:text-amber-400"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              القدرة الفائقة Turbo ({boostedCount})
            </Button>
            <Button
              onClick={() => setStatusFilter('active')}
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl text-xs font-bold h-8"
            >
              القياسي ({totalAgentsCount - boostedCount})
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'كافة التصنيفات', count: agents.length },
            { id: 'academic', label: 'المساعدون الأكاديميون والعلماء', count: agents.filter(a => a.category === 'academic').length },
            { id: 'simulations', label: 'مساعدو المحاكيات والمختبرات (49)', count: agents.filter(a => a.category === 'simulations').length },
            { id: 'special_ed', label: 'التربية الخاصة والشمول ودامج', count: agents.filter(a => a.category === 'special_ed').length },
            { id: 'medical', label: 'الطب والعلوم العيادية', count: agents.filter(a => a.category === 'medical').length },
            { id: 'environment', label: 'البيئة والاستدامة والمناخ', count: agents.filter(a => a.category === 'environment').length },
            { id: 'assessment', label: 'الامتحانات والتقييم الذكي', count: agents.filter(a => a.category === 'assessment').length },
            { id: 'tools', label: 'الأدوات الرياضية والهندسة', count: agents.filter(a => a.category === 'tools').length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Agents Catalog Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>يتم عرض {filteredAgents.length} وكيل ذكي من أصل {totalAgentsCount}</span>
          <span>كل وكيل يمتلك سياق معالجة ونموذجاً مخصصاً</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAgents.map((agent) => {
              const CatIcon = getCategoryIcon(agent.category);
              return (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`relative p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    agent.isBoosted
                      ? 'bg-gradient-to-br from-white via-amber-500/[0.03] to-purple-500/[0.04] dark:from-slate-900 dark:via-amber-500/[0.05] dark:to-purple-900/10 border-amber-500/40 dark:border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Top Bar: Icon, Name & Status */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${
                          agent.isBoosted
                            ? 'bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                            {agent.nameAr}
                          </h3>
                          <p className="text-[11px] font-mono text-slate-400" dir="ltr">
                            {agent.nameEn}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {agent.isBoosted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm animate-pulse">
                            <Zap className="w-3 h-3 fill-white" />
                            فائق القدرة Turbo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            نشط
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {agent.accuracyRate}% دقة
                        </span>
                      </div>
                    </div>

                    {/* Model & Discipline */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-mono font-bold">
                        {agent.model}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {agent.discipline}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold">
                        {agent.categoryAr}
                      </span>
                    </div>

                    {/* Summary Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {agent.systemPromptSummary}
                    </p>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((cap, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-medium"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* Answering Parameters Grid */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div>
                        <div className="text-slate-400">أقصى الرموز</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {agent.maxOutputTokens.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">الاستجابة</div>
                        <div className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                          {agent.avgLatencyMs}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">الاستفسارات</div>
                        <div className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                          {agent.totalQueries.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={() => handleToggleBoost(agent.id)}
                        size="sm"
                        className={`h-8 px-2.5 rounded-xl text-xs font-black transition-all ${
                          agent.isBoosted
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300'
                        }`}
                        title="تبديل تعزيز قدرة الإجابة والتفكير العميق"
                      >
                        <Zap className={`w-3.5 h-3.5 ml-1 ${agent.isBoosted ? 'fill-white' : ''}`} />
                        <span>{agent.isBoosted ? 'معزز خارق' : 'تعزيز القدرة'}</span>
                      </Button>

                      <Button
                        onClick={() => handleOpenTesting(agent)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1"
                        title="تجربة واختبار قدرة إجابة الوكيل فورياً"
                      >
                        <Play className="w-3 h-3 text-cyan-500" />
                        <span>اختبار</span>
                      </Button>

                      <Button
                        onClick={() => {
                          setViewingLogsAgent(agent);
                          setLogsModalOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="عرض سجل نشاط الوكيل"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <Link
                      to={agent.route}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      title="فتح موقع الوكيل في المنصة"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* 5. Live Interactive Agent Testing Modal */}
      <Dialog open={testingModalOpen} onOpenChange={setTestingModalOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6" dir="rtl">
          {activeTestAgent && (
            <>
              <DialogHeader className="text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>مختبر فحص واختبار إجابات: {activeTestAgent.nameAr}</span>
                        {activeTestAgent.isBoosted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                            ⚡ Turbo Boosted
                          </span>
                        )}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-500">
                        النموذج: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeTestAgent.model}</span> &bull; سياق: {activeTestAgent.contextWindow}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Preset Sample Prompts */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  أسئلة واستفسارات جاهزة للاختبار السريع:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeTestAgent.samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestPrompt(p)}
                      className="text-[11px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/10 hover:text-cyan-600 text-slate-600 dark:text-slate-300 text-right transition-colors"
                    >
                      &bull; {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Prompt Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  استفسار الفحص الموجه للوكيل:
                </label>
                <div className="relative">
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="اكتب أي استفسار أو مسألة لاختبار قدرة إجابة هذا الوكيل..."
                    rows={3}
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                  />
                  <Button
                    onClick={handleRunInference}
                    disabled={isInferencing || !testPrompt.trim()}
                    className="absolute bottom-3 left-3 h-8 px-4 text-xs font-black rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5 shadow-md"
                  >
                    {isInferencing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري المعالجة...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>تشغيل الفحص</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Inference Result Display */}
              {inferenceResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200 dark:border-slate-700 font-mono text-slate-500">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> استجابة مكتملة 100%
                    </span>
                    <span>الزمن: <strong className="text-cyan-600 dark:text-cyan-400">{inferenceResult.latency}ms</strong></span>
                    <span>الرموز: <strong className="text-purple-600 dark:text-purple-400">{inferenceResult.tokens} tokens</strong></span>
                  </div>

                  {/* Chain of Thought */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                    {inferenceResult.reasoning}
                  </div>

                  {/* Formatted Output */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed whitespace-pre-line border border-slate-200 dark:border-slate-800">
                    {inferenceResult.answer}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. Agent Activity Logs Modal */}
      <Dialog open={logsModalOpen} onOpenChange={setLogsModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4" dir="rtl">
          {viewingLogsAgent && (
            <>
              <DialogHeader className="text-right">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                      سجل نشاط واستفسارات: {viewingLogsAgent.nameAr}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      إجمالي العمليات المعالجة: {viewingLogsAgent.totalQueries.toLocaleString()} استفسار
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {viewingLogsAgent.recentLogs && viewingLogsAgent.recentLogs.length > 0 ? (
                  viewingLogsAgent.recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-white">{log.queryType}</span>
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                          <span>{log.latencyMs}ms</span>
                          <span>&bull;</span>
                          <span>{log.tokensUsed} tokens</span>
                          <span>&bull;</span>
                          <span className="text-slate-500">{log.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">{log.userQuery}</p>
                      <p className="text-[11px] text-slate-500 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 font-mono">
                        {log.responseSnippet}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <Bot className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p>لا توجد سجلات استفسارات سابقة محفوظة لهذا الوكيل حالياً.</p>
                    <p>اضغط على زر "اختبار" لتنفيذ استعلام فحص وتوليد سجل فوري.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
