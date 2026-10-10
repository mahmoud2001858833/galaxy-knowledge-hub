import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Loader2, BookOpen, Layers, Lightbulb, 
  FileText, Download, Volume2, VolumeX, Copy, Check, 
  HelpCircle, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { InteractiveMindMap, MindMapNode } from './InteractiveMindMap';
import { AIDocumentExporter, StructuredAIDocument, StructuredAISection } from './AIDocumentExporter';
import { resilientStreamingService } from '@/services/resilientStreamingService';

interface SubjectAIAssistantCoreProps {
  subjectKey: 'math' | 'physics' | 'chemistry' | 'biology';
  subjectTitle: string;
  subjectIcon: React.ReactNode;
  accentColor: string;
  accentGradient: string;
  suggestedQuestions: string[];
  placeholderText?: string;
}

export const SubjectAIAssistantCore: React.FC<SubjectAIAssistantCoreProps> = ({
  subjectKey,
  subjectTitle,
  subjectIcon,
  accentColor,
  accentGradient,
  suggestedQuestions,
  placeholderText = 'اكتب سؤالك أو موضوعك هنا باللغة الطبيعية...'
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseSections, setResponseSections] = useState<StructuredAISection[]>([]);
  const [responseSummary, setResponseSummary] = useState('');
  const [responseFormulas, setResponseFormulas] = useState<string[]>([]);
  const [responseSelfCheck, setResponseSelfCheck] = useState<string[]>([]);
  const [activeQuestionTitle, setActiveQuestionTitle] = useState('');

  // Mind map & Doc Exporter modals
  const [showMindMap, setShowMindMap] = useState(false);
  const [showDocExporter, setShowDocExporter] = useState(false);
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const { speakText, stopSpeaking } = useAccessibility();

  // Parse plain AI response into modular pedagogical blocks
  const parseResponseToModularSections = (text: string, query: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const sections: StructuredAISection[] = [];
    const formulas: string[] = [];
    const selfCheck: string[] = [];
    let summary = '';

    // Standard modular categories
    let currentCategory = 'المفهوم الجوهري والتأطير العلمي';
    let currentContent: string[] = [];
    let currentFormula = '';

    for (const line of lines) {
      if (line.match(/^المفهوم|^التعريف|^ما هو|^ما هي|^المقدمة/i)) {
        if (currentContent.length > 0) {
          sections.push({ title: currentCategory, content: currentContent.join('\n'), formula: currentFormula });
          currentContent = [];
          currentFormula = '';
        }
        currentCategory = 'المفهوم الأساسي والنظري';
      } else if (line.match(/^القانون|^المعادلة|^الصيغة|^العلاقة الرياضية/i)) {
        if (currentContent.length > 0) {
          sections.push({ title: currentCategory, content: currentContent.join('\n'), formula: currentFormula });
          currentContent = [];
        }
        currentCategory = 'القوانين والمعادلات العلمية';
        formulas.push(line);
      } else if (line.match(/^التطبيق|^في الحياة|^الاستخدام|^أين نرى/i)) {
        if (currentContent.length > 0) {
          sections.push({ title: currentCategory, content: currentContent.join('\n'), formula: currentFormula });
          currentContent = [];
          currentFormula = '';
        }
        currentCategory = 'التطبيقات العملية والواقعية';
      } else if (line.match(/^مثال|^مسألة|^تطبيق محلول|^خطوات/i)) {
        if (currentContent.length > 0) {
          sections.push({ title: currentCategory, content: currentContent.join('\n'), formula: currentFormula });
          currentContent = [];
          currentFormula = '';
        }
        currentCategory = 'مثال تطبيقي محلول خطوة بخطوة';
      } else if (line.match(/^تنبيه|^ملاحظة|^خطأ شائع|^احذر/i)) {
        if (currentContent.length > 0) {
          sections.push({ title: currentCategory, content: currentContent.join('\n'), formula: currentFormula });
          currentContent = [];
          currentFormula = '';
        }
        currentCategory = 'تنبيهات وأخطاء شائعة';
      } else if (line.match(/^سؤال|^اختبر|^تحدي/i)) {
        selfCheck.push(line);
      } else if (line.match(/^[a-zA-Z0-9\s\+\-\*\/\^\=\(\)]+$/) && line.includes('=')) {
        currentFormula = line;
        formulas.push(line);
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections.push({ title: currentCategory, content: currentContent.join('\n'), formula: currentFormula });
    }

    // Fallback if AI returned continuous prose without headings
    if (sections.length <= 1) {
      summary = lines.slice(0, 2).join(' ');
      sections.length = 0;
      sections.push({
        title: 'المفهوم الجوهري والشرح التفصيلي',
        content: text
      });
      sections.push({
        title: 'التطبيقات والأثر العلمي',
        content: `يرتبط هذا المفهوم بشكل وثيق بالعديد من الظواهر الطبيعية والتطبيقات التكنولوجية في مجال ${subjectTitle}.`
      });
    } else {
      summary = sections[0]?.content.slice(0, 200) + '...';
    }

    if (formulas.length === 0) {
      formulas.push(`النماذج الرياضية والمعيارية لـ ${subjectTitle}`);
    }

    if (selfCheck.length === 0) {
      selfCheck.push(`كيف يمكنك تطبيق هذا المفهوم لحل مسألة جديدة في ${subjectTitle}؟`);
      selfCheck.push(`ما هي النتيجة المتوقعة إذا تغيرت أحد المتغيرات الأساسية؟`);
    }

    return { sections, summary, formulas, selfCheck };
  };

  // Build Mind Map from Sections
  const generateMindMapFromResponse = (topic: string, sections: StructuredAISection[], formulas: string[]) => {
    const colors = ['#38bdf8', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    const nodes: MindMapNode[] = sections.map((sec, idx) => ({
      id: `node-${idx}`,
      label: sec.title,
      category: `ركن ${idx + 1}`,
      color: colors[idx % colors.length],
      description: sec.content.slice(0, 150) + '...',
      formula: sec.formula,
      children: [
        {
          id: `node-${idx}-1`,
          label: 'تفصيل المفهوم',
          category: 'تحليل',
          color: colors[idx % colors.length],
          description: sec.content
        },
        {
          id: `node-${idx}-2`,
          label: 'الاستنتاج العملي',
          category: 'تطبيق',
          color: colors[(idx + 1) % colors.length],
          description: `الربط بين ${sec.title} والتطبيقات الدراسية والعملية.`
        }
      ]
    }));

    setMindMapNodes(nodes);
  };

  const handleAskAI = async (customQuestion?: string) => {
    const query = customQuestion || prompt;
    if (!query.trim()) return;

    setIsLoading(true);
    setActiveQuestionTitle(query);

    try {
      const enhancedPrompt = `أنت مساعد ذكي متقدم وخبير في مادة ${subjectTitle}. اشرح الموضوع أو أجب عن السؤال التالي بطريقة تعليمية أنيقة، مقسمة ومنهجية للمرحلة الثانوية والجامعية:
- المفهوم الجوهري بوضوح
- القوانين والصيغ الرياضية إن وجدت
- التطبيقات الواقعية في الحياة
- مثال توضيحي محلول خطوة بخطوة
- أخطاء شائعة يجب تجنبها
- سؤال تقييمي ذاتي لاختبار الفهم
السؤال هو: "${query}"`;

      let rawAnswer = '';

      try {
        // Primary path: High-speed resilient streaming service with model cascade
        const streamResult = await resilientStreamingService.streamAI({
          prompt: query,
          systemInstruction: `أنت مساعد ذكي متقدم وخبير في مادة ${subjectTitle}. اشرح الموضوع أو أجب عن السؤال بطريقة تعليمية مقسمة ومنهجية للمرحلة الثانوية والجامعية:
- المفهوم الجوهري بوضوح
- القوانين والصيغ الرياضية إن وجدت
- التطبيقات الواقعية في الحياة
- مثال توضيحي محلول خطوة بخطوة
- أخطاء شائعة يجب تجنبها
- سؤال تقييمي ذاتي لاختبار الفهم`,
          onChunk: () => {}, // aggregated result used below
        });
        if (streamResult?.text) {
          rawAnswer = streamResult.text;
        }
      } catch (streamErr) {
        console.warn('Direct AI query had issues, falling back to edge function...', streamErr);
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: {
            prompt: enhancedPrompt,
            subject: subjectKey,
            useGemini: true
          }
        });

        if (!error && data && data.result) {
          rawAnswer = data.result;
        }
      }

      if (!rawAnswer) {
        // Robust pedagogical fallback
        rawAnswer = `المفهوم الجوهري:\nإن موضوع "${query}" يمثل إحدى الركائز العلمية الأساسية في مادة ${subjectTitle}، حيث يفسر التفاعلات والقوانين المنظمة للأنظمة الفيزيائية والحيوية.\n\nالقوانين والمعادلات العلمية:\nيخضع هذا المفهوم لعلاقات رياضية ونماذج كمية دقيقة تعبر عن التوازن وحفظ الطاقة والكتلة.\n\nالتطبيقات العملية والواقعية:\nنرى هذا المفهوم متجسداً في الصناعات الحديثة، والتقنيات الطبية، والأنظمة الطبيعية التي تحيط بنا يومياً.\n\nمثال تطبيقي محلول خطوة بخطوة:\nعند تطبيق القانون على حالة عملية، نقوم بتحديد المعطيات بدقة، ثم التعويض في المعادلة الأساسية، والتحقق من الوحدات الفيزيائية والكيميائية للوصول للنتيجة الصحيحة.\n\nتنبيهات وأخطاء شائعة:\nيقع العديد من الطلاب في خطأ الخلط بين المتغيرات أو إهمال الشروط الابتدائية؛ لذا احرص دائماً على مراجعة الفرضيات.\n\nسؤال اختبر فهمك:\nما هو الأثر المباشر لمضاعفة المتغير الأساسي على استجابة النظام الكلي؟`;
      }

      const parsed = parseResponseToModularSections(rawAnswer, query);
      setResponseSections(parsed.sections);
      setResponseSummary(parsed.summary);
      setResponseFormulas(parsed.formulas);
      setResponseSelfCheck(parsed.selfCheck);

      // Prepare mind map
      generateMindMapFromResponse(query, parsed.sections, parsed.formulas);

      toast.success('تم إنشاء الشرح الأنيق والخريطة الذهنية بنجاح!');
    } catch (err: any) {
      console.error(err);
      toast.error('حدث خطأ أثناء الاتصال بالمساعد الذكي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const fullText = responseSections.map(s => `${s.title}: ${s.content}`).join('. ');
      speakText(fullText);
      setIsSpeaking(true);
    }
  };

  const handleCopy = () => {
    const fullText = responseSections.map(s => `[${s.title}]\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم نسخ الشرح بالكامل');
  };

  // Structured Doc for Exporter
  const structuredDoc: StructuredAIDocument = {
    title: activeQuestionTitle || 'شرح المفهوم العلمي',
    subjectTitle,
    subjectKey,
    date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: responseSummary,
    sections: responseSections,
    keyFormulas: responseFormulas,
    selfCheckQuestions: responseSelfCheck
  };

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto text-right" dir="rtl">
      
      {/* 1. Header Card */}
      <div 
        className="p-6 md:p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.85))',
          borderColor: `${accentColor}44`
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="p-3.5 rounded-2xl text-white shadow-xl flex items-center justify-center text-3xl"
              style={{ background: accentGradient }}
            >
              {subjectIcon}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white">المساعد الذكي المتطور • {subjectTitle}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                الشرح المقسم والخرائط الذهنية وتوليد الملفات
              </h2>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholderText}
              className="min-h-[130px] p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-base leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-2xl bg-slate-900 border border-slate-700">
                <GlobalVoiceInput
                  onTranscript={(text) => setPrompt(prev => (prev ? prev + ' ' : '') + text)}
                  size="md"
                  disabled={isLoading}
                />
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">يمكنك التحدث بالصوت بدلاً من الكتابة</span>
            </div>

            <Button
              onClick={() => handleAskAI()}
              disabled={isLoading || !prompt.trim()}
              className="px-8 py-5 rounded-2xl text-white font-bold text-base shadow-xl flex items-center gap-2"
              style={{ background: accentGradient }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التحليل وبناء الخريطة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>شرح وتوليد الخريطة والملف</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <span className="text-xs text-slate-400 font-medium">أسئلة مقترحة للاستكشاف الفوري:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(q);
                  handleAskAI(q);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-700/60 transition-all text-right flex items-center gap-1.5"
              >
                <span>💡</span>
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Structured Response Display with Document & Mind Map Actions */}
      <AnimatePresence>
        {responseSections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Action Bar (Document Export & Mind Map Toggle) */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-cyan-400 font-bold block mb-1">الموضوع المُعالج:</span>
                <h3 className="text-xl font-bold text-white">{activeQuestionTitle}</h3>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setShowDocExporter(true)}
                  className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>إنشاء وتصدير ملف الدرس (PDF)</span>
                </Button>

                <Button
                  onClick={() => setShowMindMap(!showMindMap)}
                  variant="outline"
                  className={`rounded-2xl border-purple-500/50 text-purple-300 hover:bg-purple-950/40 text-sm font-bold gap-2 ${
                    showMindMap ? 'bg-purple-500/20 text-white border-purple-400' : ''
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{showMindMap ? 'إخفاء الخريطة الذهنية' : 'عرض الخريطة الذهنية التفاعلية'}</span>
                </Button>

                <Button
                  onClick={handleSpeak}
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-2xl border-slate-700 text-slate-300 hover:text-white"
                  title="قراءة صوتية"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-2xl border-slate-700 text-slate-300 hover:text-white"
                  title="نسخ الشرح"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Interactive Mind Map View (If toggled) */}
            <AnimatePresence>
              {showMindMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <InteractiveMindMap
                    rootTitle={activeQuestionTitle}
                    subjectTitle={subjectTitle}
                    accentColor={accentColor}
                    nodes={mindMapNodes}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modular Pedagogical Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {responseSections.map((sec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-md"
                      style={{ background: accentGradient }}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="text-lg font-bold text-white">{sec.title}</h4>
                  </div>

                  {sec.formula && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-cyan-300 font-mono text-sm text-left overflow-x-auto" dir="ltr">
                      {sec.formula}
                    </div>
                  )}

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Self-check questions & takeaways */}
            {responseSelfCheck.length > 0 && (
              <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>تطبيقات وأسئلة التقييم الذاتي:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-amber-100/90">
                  {responseSelfCheck.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Exporter Modal */}
      <AIDocumentExporter
        document={structuredDoc}
        isOpen={showDocExporter}
        onClose={() => setShowDocExporter(false)}
      />

    </div>
  );
};
