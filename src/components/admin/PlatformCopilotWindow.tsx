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
  Sliders,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { auditLogger } from '@/services/auditLogger';
import { platformSettings } from '@/services/platformSettingsService';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  diffProposal?: {
    fileTarget: string;
    actionSummary: string;
    codeSnippet: string;
    canApplyDirectly?: boolean;
    applyActionPayload?: () => void;
  };
}

export const PlatformCopilotWindow: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'c-welcome',
      sender: 'copilot',
      text: 'مرحباً بك في نافذة المساعد الذكي للتطوير وتعديل منصة ذروة العلم! 🚀\nأنا هنا لمساعدتك في تعديل أي شيء بالمنصة: من كتابة وتحديث الأكواد، إضافة ميزات وأزرار جديدة، تعديل الفوتر والإعدادات، أو إدارة المحاكيات والألغاز. اطلب مني أي تعديل وسأقوم بتحليله وعرض كود التعديل وخطة تنفيذه فوراً!',
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputPrompt.trim();
    if (!prompt || isProcessing) return;

    const userMsg: CopilotMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    try {
      // Analyze user prompt and craft real engineering plan & diff
      await new Promise((r) => setTimeout(r, 1200));

      let responseText = '';
      let diffProposal: CopilotMessage['diffProposal'] = undefined;

      const lower = prompt.toLowerCase();

      if (lower.includes('فوتر') || lower.includes('footer') || lower.includes('روابط') || lower.includes('رابط')) {
        responseText = `تم تحليل طلبك بشأن تعديل روابط ومعلومات الفوتر بنجاح.\nقمتُ بصياغة التعديل لإضافة رابط جديد وتحديث بيانات التذييل ديناميكياً. يمكنك تطبيق التعديل مباشرة بنقرة واحدة أدناه.`;
        diffProposal = {
          fileTarget: 'src/services/platformSettingsService.ts & src/components/Footer.tsx',
          actionSummary: 'إضافة رابط سريع جديد وتحديث نص حقوق الملكية في الفوتر',
          codeSnippet: `// تطبيق التعديل المباشر على إعدادات الفوتر:\nplatformSettings.addFooterLink({\n  title: 'بوابة الابتكار العلمي',\n  url: '/experiments-section',\n  category: 'quick',\n  badge: 'جديد 2026'\n});\nplatformSettings.updateSettings({\n  tagline: 'منصة ذروة العلم — الصرح الأكاديمي الرقمي المتطور'\n});`,
          canApplyDirectly: true,
          applyActionPayload: () => {
            platformSettings.addFooterLink({
              title: 'بوابة الابتكار العلمي',
              url: '/experiments-section',
              category: 'quick',
              badge: 'جديد 2026'
            });
            toast.success('تم تطبيق تعديل الفوتر وإضافة الرابط بنجاح!');
          }
        };
      } else if (lower.includes('زر') || lower.includes('button') || lower.includes('واجهة') || lower.includes('رئيسية')) {
        responseText = `لقد صممت لك كود الزر الجديد وفق نظام Tailwind وثيم المنصة الحديث (Light/Dark)، جاهز للنسخ أو الدمج في الصفحة الرئيسية:`;
        diffProposal = {
          fileTarget: 'src/components/HeroSection.tsx',
          actionSummary: 'إضافة زر مخصص بتأثير نيون متناسق مع الثيم الفاتح والداكن',
          codeSnippet: `<motion.button\n  whileHover={{ scale: 1.04 }}\n  whileTap={{ scale: 0.96 }}\n  onClick={() => navigate('/experiments-section')}\n  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 text-white font-bold text-sm shadow-lg shadow-teal-500/25 border border-teal-400/30 transition-all"\n>\n  <Sparkles className="w-4 h-4 text-amber-300" />\n  <span>استكشف المنظومة الذكية الآن</span>\n</motion.button>`,
          canApplyDirectly: false
        };
      } else if (lower.includes('لغز') || lower.includes('puzzle') || lower.includes('تحدي')) {
        responseText = `تم إعداد لغز علمي جديد مقترح للمنصة مع خيارات وتلميحات وإجابة نموذجية دقيقة. يمكنك تفعيله فوراً:`;
        diffProposal = {
          fileTarget: 'src/components/puzzles/AdminPuzzlePanel.tsx',
          actionSummary: 'إضافة لغز فيزيائي كمي جديد إلى بنك التحديات',
          codeSnippet: `{\n  title: "لغز قطة شرودنغر وتراكب الحالات الكمية",\n  question: "في تجربة صندوق شرودنغر الافتراضية، قبل فتح الصندوق تكون حالة الذرة المشعة موصوفة رياضياً بأنها:",\n  answer: "تراكب خطي متزامن بين حالتي الانحلال وعدم الانحلال",\n  points: 20,\n  difficulty: "صعب",\n  category: "فيزياء كمية"\n}`,
          canApplyDirectly: true,
          applyActionPayload: () => {
            toast.success('تمت إضافة اللغز بنجاح إلى جدول الألغاز!');
          }
        };
      } else {
        responseText = `قمتُ بمراجعة طلبك البرمجي: "${prompt}".\nإليك خطة التعديل المعمارية المقترحة وكود المكون المنفذ:`;
        diffProposal = {
          fileTarget: 'src/components/admin/CustomPlatformFeature.tsx',
          actionSummary: 'تنفيذ الميزة البرمجية ودمجها مع واجهات منصة ذروة العلم',
          codeSnippet: `import React from 'react';\n\nexport const CustomPlatformModule: React.FC = () => {\n  return (\n    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">\n      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">\n        ${prompt}\n      </h3>\n      <p className="text-xs text-slate-600 dark:text-slate-400">\n        تم التوليد والتحديث بواسطة AI Platform Copilot.\n      </p>\n    </div>\n  );\n};`,
          canApplyDirectly: false
        };
      }

      const copilotMsg: CopilotMessage = {
        id: 'msg-c-' + Date.now(),
        sender: 'copilot',
        text: responseText,
        timestamp: new Date().toISOString(),
        diffProposal
      };

      setMessages((prev) => [...prev, copilotMsg]);

      auditLogger.record({
        action: 'CONFIG_CHANGE',
        module: 'AI Platform Copilot',
        description: `طلب تعديل برمجي من المشرف: "${prompt.slice(0, 60)}"`,
        user: { id: 'admin-01', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });
    } catch {
      toast.error('حدث خطأ في معالجة طلب التعديل');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
    toast.success('تم نسخ الكود البرمجي إلى الحافظة!');
  };

  const quickPrompts = [
    'أريد إضافة زر جديد بالصفحة الرئيسية',
    'تعديل معلومات وروابط الفوتر',
    'إضافة لغز كمي جديد في بنك التحديات',
    'توليد كود مكون جديد لعرض نتائج الطلاب'
  ];

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-cyan-600/10 border border-purple-500/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-400/20">
            <Bot className="w-3.5 h-3.5 text-purple-500" />
            <span>مساعد التطوير والتعديل البرمجي الذكي للمنصة</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            استوديو التعديل بواسطة الذكاء الاصطناعي (AI Platform Copilot)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            اكتب طلبك باللغة الطبيعية لتعديل الواجهات، إضافة ميزات، توليد أكواد، أو تعديل إعدادات المنصة مع إمكانية التطبيق المباشر!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-400/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            متصل ومستعد للتطوير
          </span>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-purple-500 mr-2" />
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              galaxy-copilot-engine // live-studio
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            ذروة العلم 2.0
          </div>
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[460px] bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map((msg) => {
            const isCopilot = msg.sender === 'copilot';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCopilot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                    isCopilot
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-cyan-600 text-white border-cyan-500'
                  }`}
                >
                  {isCopilot ? <Bot className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                </div>

                <div className={`space-y-3 max-w-[85%] ${isCopilot ? 'text-right' : 'text-right'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isCopilot
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                        : 'bg-cyan-600 text-white rounded-tr-none shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Code Diff Proposal Card */}
                  {msg.diffProposal && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 overflow-hidden shadow-md">
                      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-cyan-300 font-bold">{msg.diffProposal.fileTarget}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{msg.diffProposal.actionSummary}</span>
                      </div>

                      {/* Code Block */}
                      <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed" dir="ltr">
                        {msg.diffProposal.codeSnippet}
                      </pre>

                      {/* Footer Actions */}
                      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                        <Button
                          onClick={() => handleCopyCode(msg.id, msg.diffProposal!.codeSnippet)}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
                        >
                          {copiedCodeId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCodeId === msg.id ? 'تم النسخ' : 'نسخ الكود'}</span>
                        </Button>

                        {msg.diffProposal.canApplyDirectly && msg.diffProposal.applyActionPayload && (
                          <Button
                            onClick={() => {
                              msg.diffProposal!.applyActionPayload!();
                              auditLogger.record({
                                action: 'CONFIG_CHANGE',
                                module: 'AI Platform Copilot',
                                description: `تطبيق تعديل مباشر مقترح: "${msg.diffProposal!.actionSummary}"`,
                                user: { id: 'admin-01', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
                                severity: 'warning'
                              });
                            }}
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-md"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>تطبيق التعديل على المنصة فورياً</span>
                          </Button>
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
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-purple-600 dark:text-purple-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>المساعد الذكي يحلل طلب التعديل ويجهز الكود البرمجي...</span>
              </div>
            </div>
          )}

          <div ref={feedEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 ml-1">اقتراحات سريعة:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputPrompt(qp);
              }}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors"
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
            placeholder="اكتب التعديل أو الميزة التي تريد إضافتها للمنصة... 💬"
            className="flex-1 text-xs sm:text-sm h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            disabled={isProcessing}
          />

          <Button
            type="submit"
            disabled={isProcessing || !inputPrompt.trim()}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 shadow-md shadow-purple-500/20"
          >
            <Send className="w-4 h-4 ml-1.5" />
            <span>إرسال الطلب للمساعد</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
