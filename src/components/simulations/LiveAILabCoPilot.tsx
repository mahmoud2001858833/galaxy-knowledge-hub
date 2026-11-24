import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Bot, Lightbulb, Volume2, ChevronDown, ChevronUp, 
  Loader2, CheckCircle, Send, MessageSquarePlus, RefreshCw, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { geminiRequest } from '@/services/geminiTransport';

interface LiveAILabCoPilotProps {
  simName?: string;
  experimentName?: string;
  currentParameters?: Record<string, string | number | boolean>;
  currentMetrics?: Record<string, string | number | boolean>;
  experimentContext?: { title?: string; currentStep?: string; userAction?: string; activeMetrics?: Record<string, string | number> };
  suggestions?: string[];
  hint?: string;
  liveHint?: string;
  defaultAnalysis?: string;
  subject?: 'physics' | 'chemistry' | 'biology' | 'general';
}

export const LiveAILabCoPilot: React.FC<LiveAILabCoPilotProps> = ({
  simName,
  experimentName,
  currentParameters,
  currentMetrics,
  experimentContext,
  suggestions,
  hint,
  liveHint,
  defaultAnalysis,
  subject = 'physics'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(defaultAnalysis || null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const resolvedSimName = simName || experimentName || experimentContext?.title || 'المختبر العلمي التفاعلي';
  const resolvedHint = liveHint || hint;

  const getMergedParameters = (): Record<string, string | number | boolean> => {
    const merged: Record<string, string | number | boolean> = {};
    if (experimentContext?.currentStep) merged['الخطوة الحالية'] = experimentContext.currentStep;
    if (experimentContext?.userAction) merged['إجراء المستخدم'] = experimentContext.userAction;
    if (experimentContext?.activeMetrics) Object.assign(merged, experimentContext.activeMetrics);
    if (currentParameters) Object.assign(merged, currentParameters);
    if (currentMetrics) Object.assign(merged, currentMetrics);
    return merged;
  };

  // Generate deep physical contextual analysis locally if offline
  const getContextualOfflineAnalysis = (paramsList: string) => {
    return `🔬 تحليل المرشد المعملي الفوري لتجربة (${resolvedSimName}):\n\n` +
      `1. قراءة المشهد الراهن:\nبناءً على القيم الفعلية الحالية (${paramsList || 'الوضع الابتدائي للمحاكاة'})، يمكن ملاحظة تغير سلوك النظام مباشرةً عند تعديل معاملات الطاقة أو السرعة أو وضعية العرض.\n\n` +
      `2. القانون العلمي الحاكم:\nتخضع المنظومة لقوانين الحفظ الفيزيائية الأساسية (حفظ الطاقة والزخم النسبوي والعلاقة E = γmc² في التصادمات عالية الطاقة).\n\n` +
      `3. تجربة مقترحة الآن:\nجرّب تغيير الطاقة القصوى أو تفعيل التصادم وتبديل زاوية العرض لترصد الفرق اللحظي في المسارات والقراءات!`;
  };

  // Request live deep analysis from Gemini AI (gemini-proxy first, then ai-assistant, then contextual fallback)
  const handleRequestAnalysis = async (userQuestion?: string) => {
    setIsAnalyzing(true);
    setIsExpanded(true);
    const merged = getMergedParameters();
    const paramsList = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'نعم' : 'لا') : v}`)
      .join(' | ');

    try {
      const prompt = userQuestion
        ? `أنا طالب في مختبر محاكاة علمية تفاعلية لتجربة "${resolvedSimName}".
المعطيات والحالة الحالية في المشهد هي: [${paramsList || 'الوضع الافتراضي'}].
سؤالي المحدد هو: "${userQuestion}".
أجبني باللغة العربية بأسلوب علمي تربوي مشوق وموجز في 3 نقاط محددة مدعومة بالقوانين العلمية.`
        : `أنا طالب في مختبر محاكاة علمية تفاعلية لتجربة "${resolvedSimName}".
المعطيات والحالة الحالية التي أراها الآن على الشاشة هي: [${paramsList || 'الوضع الافتراضي'}].
حلّل المشهد العلمي الحالي للطالب باللغة العربية في 3 نقاط مركزة وواضحة:
1. ماذا يحدث علمياً وفيزيائياً عند هذه القيم بالضبط؟
2. ما الظاهرة أو القانون العلمي المتحكم فيما أراه الآن؟
3. خطوة عملية أو تحدٍ ممتع لتغيير أحد المعاملات وملاحظة أثره فوراً.`;

      // 1) Primary: direct server-side Gemini proxy (reliable across all environments)
      try {
        const { url, headers } = await geminiRequest('gemini-3.1-flash-lite', { stream: false });
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const text = json?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? '')
            .join('')
            .trim();
          if (text) {
            setAiAnalysis(text);
            return;
          }
        }
      } catch {
        // fall through to ai-assistant edge function
      }

      // 2) Secondary: Supabase ai-assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt, subject, useGemini: true }
      });

      if (!error && data?.response) {
        setAiAnalysis(data.response);
      } else {
        setAiAnalysis(getContextualOfflineAnalysis(paramsList));
      }
    } catch {
      setAiAnalysis(getContextualOfflineAnalysis(paramsList));
    } finally {
      setIsAnalyzing(false);
      setCustomQuestion('');
    }
  };

  // Text to speech using native browser synthesis
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*_#•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="rounded-2xl bg-white/95 dark:bg-slate-950/85 border border-purple-200 dark:border-purple-500/40 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white dark:from-purple-950/60 dark:via-slate-900 dark:to-indigo-950/60 flex items-center justify-between cursor-pointer border-b border-purple-100 dark:border-white/[0.08]"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30 border border-purple-300/40">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">المساعد المعملي الذكي 2.0</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-400/30 font-semibold">
                AI Co-Pilot
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">مراقبة، تحليل فيزيائي ونطق صوتي فوري</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 space-y-3"
          >
            {/* Live Observation Banner */}
            {resolvedHint && (
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-900 dark:text-cyan-200 leading-relaxed shadow-sm">
                <Lightbulb className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-cyan-700 dark:text-cyan-300 ml-1">ملاحظة فورية:</span>
                  <span>{resolvedHint}</span>
                </div>
              </div>
            )}

            {/* AI Analysis Content */}
            {aiAnalysis ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-purple-200 dark:border-purple-500/20 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-purple-100 dark:border-white/[0.08]">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>التقرير العلمي التفاعلي</span>
                  </span>
                  
                  {/* Audio Speech Synthesis Button with Equalizer animation */}
                  <button 
                    onClick={() => handleSpeak(aiAnalysis)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                      isSpeaking 
                        ? 'text-cyan-600 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-500/20 font-bold border border-cyan-300 dark:border-cyan-500/30' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                    }`}
                    title="قراءة صوتية بالذكاء الاصطناعي"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'جاري القراءة' : 'استمع'}</span>
                    {isSpeaking && (
                      <span className="flex gap-0.5 items-center mr-0.5">
                        <span className="w-0.5 h-2 bg-cyan-500 dark:bg-cyan-400 animate-pulse rounded-full" />
                        <span className="w-0.5 h-3 bg-cyan-500 dark:bg-cyan-400 animate-pulse rounded-full" />
                        <span className="w-0.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 animate-pulse rounded-full" />
                      </span>
                    )}
                  </button>
                </div>

                <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-normal leading-relaxed">
                  {aiAnalysis}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center py-1">
                انقر أدناه ليقوم الذكاء الاصطناعي بقراءة معطياتك وشرح ما يحدث في المشهد الآن
              </p>
            )}

            {/* Optional Quick Suggestions */}
            {suggestions && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => handleRequestAnalysis(s)}
                    className="rounded-full border border-indigo-200 dark:border-indigo-700/60 bg-indigo-50/70 dark:bg-indigo-950/30 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition text-right disabled:opacity-50"
                  >
                    ✦ {s}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Question Input Toggle */}
            {isCustomMode ? (
              <div className="flex items-center gap-1.5 pt-1">
                <Input
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customQuestion.trim()) {
                      handleRequestAnalysis(customQuestion);
                    }
                  }}
                  placeholder="اسأل المرشد عن المعطيات الحالية..."
                  className="h-8 text-xs bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:border-purple-500/30 focus:border-purple-400 rounded-lg dark:text-white"
                  disabled={isAnalyzing}
                />
                <Button
                  size="sm"
                  onClick={() => handleRequestAnalysis(customQuestion)}
                  disabled={!customQuestion.trim() || isAnalyzing}
                  className="h-8 px-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs"
                >
                  <Send className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCustomMode(false)}
                  className="h-8 px-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => handleRequestAnalysis()}
                  disabled={isAnalyzing}
                  className="flex-1 font-bold text-xs rounded-xl shadow-md border border-blue-400/40 flex items-center justify-center gap-2 h-9 cursor-pointer"
                  style={{ backgroundImage: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#ffffff' }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-100" />
                      <span>جاري التحليل المعملي الذكي...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-100" />
                      <span>حلل ما أراه الآن بالذكاء الاصطناعي</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCustomMode(true)}
                  className="h-8 px-2.5 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-950/20 dark:hover:bg-purple-900/40 dark:text-purple-300 dark:hover:text-white rounded-xl text-xs flex items-center gap-1 shrink-0"
                  title="اطرح سؤالاً محدداً"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">سؤال مخصص</span>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveAILabCoPilot;
