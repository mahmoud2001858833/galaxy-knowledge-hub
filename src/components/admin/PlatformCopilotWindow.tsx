import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Code2, 
  Terminal, 
  Check, 
  Copy, 
  Play, 
  Zap, 
  FileCode, 
  Layers, 
  Wrench, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  ExternalLink, 
  ArrowRight,
  Clock,
  ChevronDown,
  ShieldCheck,
  FolderGit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { agentBridgeService, type AntigravityTask } from '@/services/agentBridgeService';

export interface BridgeMessage {
  id: string;
  sender: 'user' | 'antigravity';
  text: string;
  timestamp: string;
  taskTicket?: AntigravityTask;
}

export const PlatformCopilotWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'queue'>('chat');
  const [tasks, setTasks] = useState<AntigravityTask[]>(() => agentBridgeService.getTasks());

  const [messages, setMessages] = useState<BridgeMessage[]>([
    {
      id: 'agy-welcome',
      sender: 'antigravity',
      text: 'مرحباً بك! مهمة هذه النافذة هي استلام طلباتك وتوصيلها مباشرة إلى وكيل Antigravity في جلسة العمل. 🛰️\nعندما تطلب هنا مثلاً: "ابني لي قسم جديد بالمنصة باسم..."، يتم تحويل الطلب فوراً إلى Antigravity، ليتولى هو في جلسة العمل كتابة الأكواد، إنشاء الملفات، وربط المسارات وبناء القسم بالكامل خطوة بخطوة!',
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = (e: CustomEvent<AntigravityTask[]>) => {
      setTasks([...agentBridgeService.getTasks()]);
    };
    window.addEventListener('galaxy_agent_bridge_updated' as any, handleUpdate);
    return () => {
      window.removeEventListener('galaxy_agent_bridge_updated' as any, handleUpdate);
    };
  }, []);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputPrompt.trim();
    if (!prompt || isProcessing) return;

    const userMsg: BridgeMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    try {
      // Dispatch task via Antigravity Bridge Service
      await new Promise((r) => setTimeout(r, 1000));
      const dispatchedTask = agentBridgeService.dispatchCommandToAntigravity(prompt);

      const agyMsg: BridgeMessage = {
        id: 'msg-agy-' + Date.now(),
        sender: 'antigravity',
        text: `تم استلام طلبك وتحويله مباشرة إلى وكيل Antigravity المتصل ببيئة العمل! 🚀\nرقم التذكرة: [${dispatchedTask.id}]\nتم تحليل المتطلبات المعمارية وتجهيز مخطط الملفات والأكواد المستهدفة للبناء والدمج فوراً.`,
        timestamp: new Date().toISOString(),
        taskTicket: dispatchedTask
      };

      setMessages((prev) => [...prev, agyMsg]);
      setTasks(agentBridgeService.getTasks());
      toast.success(`تم تحويل المهمة (${dispatchedTask.id}) إلى Antigravity بنجاح!`);
    } catch {
      toast.error('تعذر تحويل المهمة إلى Antigravity');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteTask = (taskId: string) => {
    const completed = agentBridgeService.completeTask(taskId);
    if (completed) {
      setTasks(agentBridgeService.getTasks());
      toast.success(`تم بناء وتنفيذ المهمة (${taskId}) في المنصة بنجاح بواسطة Antigravity! 🎉`);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
    toast.success('تم نسخ الكود البرمجي!');
  };

  const quickPrompts = [
    'ابني لي قسم جديد بالمنصة للروبوتات والذكاء الاصطناعي',
    'ابني لي قسم جديد لعلوم الفضاء والمستقبل الفلكي',
    'أضف زراً سريعاً في الرئيسية ينقل مباشرة للمختبرات',
    'تعديل نصوص وروابط الفوتر وإضافة مسار جديد'
  ];

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Antigravity Live Bridge Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-blue-600/10 border border-purple-500/25 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-right">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>وكيل Antigravity متصل ببيئة العمل المحلية</span>
            </span>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono">
              DeepMind Agentic Core
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            جسر التطوير المباشر مع Antigravity (Agent Bridge)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            اطلب بناء أي قسم أو ميزة جديدة بالمنصة؛ يتم تحويل الطلب إليّ كوكيل برمجي، حيث يتم تحليل الهيكل المعماري، إنشاء الملفات، ودمج المسارات باحترافية كاملة.
          </p>
        </div>

        {/* Tab Toggle: Direct Command vs Task Queue */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            المحادثة والأوامر المباشرة
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>مهام التطوير</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {tasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio View */}
      {activeTab === 'chat' ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <Terminal className="w-4 h-4 text-purple-500 mr-2" />
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                antigravity://galaxy-hub/agent-bridge
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <FolderGit2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>Git: main & lovable-sync</span>
            </div>
          </div>

          {/* Conversation & Tasks Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[480px] bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'antigravity';
              const ticket = msg.taskTicket;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isAgent ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                      isAgent
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border-purple-400/40'
                        : 'bg-cyan-600 text-white border-cyan-400/40'
                    }`}
                  >
                    {isAgent ? <Cpu className="w-5 h-5 animate-pulse" /> : <Code2 className="w-5 h-5" />}
                  </div>

                  <div className={`space-y-3 max-w-[88%] ${isAgent ? 'text-right' : 'text-right'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        isAgent
                          ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                          : 'bg-cyan-600 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Rich Task Ticket Card Dispatched to Antigravity */}
                    {ticket && (
                      <div className="rounded-3xl border border-purple-500/30 bg-slate-950 text-slate-100 overflow-hidden shadow-xl">
                        {/* Ticket Header */}
                        <div className="p-4 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-purple-500/20 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-400/30">
                              {ticket.id}
                            </span>
                            <span className="text-xs font-bold text-white">{ticket.title}</span>
                          </div>

                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            ticket.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          }`}>
                            {ticket.status === 'COMPLETED' ? 'مكتمل ومُنفذ بالمنصة ✓' : 'مُحول إلى Antigravity وجاهز للبناء'}
                          </span>
                        </div>

                        {/* Ticket Body: Route, Files, and Blueprint */}
                        <div className="p-5 space-y-4 text-xs">
                          {ticket.targetRoute && (
                            <div className="flex items-center gap-2 text-cyan-400 font-mono">
                              <span className="text-slate-400 font-sans font-bold">المسار المعماري المستهدف:</span>
                              <span className="px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800">{ticket.targetRoute}</span>
                            </div>
                          )}

                          {/* Architecture Plan */}
                          <div className="space-y-1.5">
                            <span className="text-slate-300 font-bold flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-purple-400" />
                              <span>خطة البناء المعمارية المقترحة:</span>
                            </span>
                            <div className="space-y-1 pr-2">
                              {ticket.architecturalPlan.map((step, sIdx) => (
                                <div key={sIdx} className="text-slate-400 leading-relaxed">
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Generated Code Preview */}
                          {ticket.generatedCodePreview && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                              <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <div className="flex items-center gap-1.5 text-purple-300">
                                  <FileCode className="w-3.5 h-3.5" />
                                  <span>{ticket.generatedCodePreview.filename}</span>
                                </div>
                                <span>معاينة المكون الأساسي</span>
                              </div>
                              <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[160px]" dir="ltr">
                                {ticket.generatedCodePreview.code}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Ticket Footer Actions */}
                        <div className="p-3 bg-slate-900 border-t border-purple-500/20 flex items-center justify-between gap-2 flex-wrap">
                          {ticket.generatedCodePreview && (
                            <Button
                              onClick={() => handleCopyCode(ticket.id, ticket.generatedCodePreview!.code)}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-slate-300 hover:text-white gap-1.5"
                            >
                              {copiedCodeId === ticket.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCodeId === ticket.id ? 'تم النسخ' : 'نسخ شفرة المكون'}</span>
                            </Button>
                          )}

                          {ticket.status !== 'COMPLETED' ? (
                            <Button
                              onClick={() => handleExecuteTask(ticket.id)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>تأكيد وبدء البناء الفوري بواسطة Antigravity</span>
                            </Button>
                          ) : (
                            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>تم دمج المكون وبنائه بنجاح</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block px-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-purple-600 dark:text-purple-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>وكيل Antigravity يحلل الطلب ويصيغ الهيكل المعماري للقسم...</span>
                </div>
              </div>
            )}

            <div ref={feedEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 ml-1">طلبات جاهزة:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputPrompt(qp)}
                className="text-[11px] px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendPrompt} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Input
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="اطلب من Antigravity بناء قسم جديد أو ميزة للمنصة... 💬"
              className="flex-1 text-xs sm:text-sm h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              disabled={isProcessing}
            />

            <Button
              type="submit"
              disabled={isProcessing || !inputPrompt.trim()}
              className="h-11 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 shadow-md shadow-purple-500/20"
            >
              <Send className="w-4 h-4 ml-1.5" />
              <span>تحويل الأمر لـ Antigravity</span>
            </Button>
          </form>
        </div>
      ) : (
        /* Task Queue List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>سجل المهام وتذاكر التطوير المحولة لوكيل Antigravity ({tasks.length})</span>
            <span>يتم التحديث تلقائياً</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-400/20">
                        {task.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">الأمر الأصلي: "{task.command}"</p>
                  </div>

                  <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-400/20'
                  }`}>
                    {task.status === 'COMPLETED' ? 'مكتمل بنجاح ✓' : 'قيد المعالجة'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300">الملفات المستهدفة:</div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                    {task.targetFiles.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>تاريخ التحويل: {new Date(task.createdAt).toLocaleString('ar-EG')}</span>
                  {task.status !== 'COMPLETED' && (
                    <Button
                      onClick={() => handleExecuteTask(task.id)}
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                    >
                      بناء وتطبيق فوري
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
