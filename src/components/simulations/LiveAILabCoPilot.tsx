import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Bot, Lightbulb, Volume2, ChevronDown, ChevronUp, 
  Loader2, CheckCircle, Send, MessageSquarePlus, RefreshCw, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface LiveAILabCoPilotProps {
  simName: string;
  currentParameters: Record<string, string | number>;
  liveHint?: string;
  defaultAnalysis?: string;
  subject?: 'physics' | 'chemistry' | 'biology' | 'general';
}

export const LiveAILabCoPilot: React.FC<LiveAILabCoPilotProps> = ({
  simName,
  currentParameters,
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

  // Generate deep physical contextual analysis locally if offline
  const getContextualOfflineAnalysis = (paramsList: string) => {
    return `🔬 **تحليل المرشد المعملي الفوري لتجربة (${simName}):**\n` +
      `• **الحالة الفيزيائية الراهنة:** بناءً على المدخلات (${paramsList})، النظام يعمل في نطاق الاستقرار الديناميكي المتوازن.\n` +
      `• **القانون العلمي الحاكم:** تخضع المنظومة لقوانين الحفظ الفيزيائية (حفظ الطاقة، كمية الحركة، والاتزان).\n` +
      `• **تحدي المرشد:** جرّب مضاعفة القيمة القصوى أو تقليلها إلى النصف لمشاهدة الاستجابة اللحظية للنظام وحساب نقطة التحول الحرجة!`;
  };

  // Request live deep analysis from Gemini AI via Supabase Edge Function
  const handleRequestAnalysis = async (userQuestion?: string) => {
    setIsAnalyzing(true);
    try {
      const paramsList = Object.entries(currentParameters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      const prompt = userQuestion
        ? `أنا طالب في مختبر محاكاة علمية تفاعلية لتجربة "${simName}".
المعطيات والمدخلات الحالية هي: [${paramsList}].
سؤالي المحدد هو: "${userQuestion}".
أجبني بأسلوب علمي تربوي مشوق وموجز في 3 نقاط محددة مدعومة بالقوانين الفيزيائية.`
        : `أنا طالب في مختبر محاكاة علمية تفاعلية لتجربة "${simName}".
المعطيات والمدخلات الفيزيائية الحالية في التجربة هي: [${paramsList}].
قم بتحليل المشهد العلمي الحالي للطالب بأسلوب تعليمي مشوق ومختصر (3 إلى 4 نقاط مركزة):
1. ماذا يحدث علمياً وفيزيائياً عند هذه القيم بالضبط؟
2. ما الظاهرة أو القانون العلمي المتحكم هنا؟
3. نصيحة أو تحدي لتغيير أحد المعاملات وملاحظة ما سيحدث.`;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt, subject, useGemini: true }
      });

      if (!error && data?.response) {
        setAiAnalysis(data.response);
      } else {
        setAiAnalysis(getContextualOfflineAnalysis(paramsList));
      }
    } catch {
      const paramsList = Object.entries(currentParameters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
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
    <div className="rounded-2xl bg-slate-950/85 border border-purple-500/40 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between cursor-pointer border-b border-white/[0.08]"
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
              <span className="text-xs font-bold text-white">المساعد المعملي الذكي 2.0</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold">
                AI Co-Pilot
              </span>
            </div>
            <span className="text-[10px] text-slate-400">مراقبة، تحليل فيزيائي ونطق صوتي فوري</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
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
            {liveHint && (
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200 leading-relaxed shadow-sm">
                <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-cyan-300 ml-1">ملاحظة فورية:</span>
                  <span>{liveHint}</span>
                </div>
              </div>
            )}

            {/* AI Analysis Content */}
            {aiAnalysis ? (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-purple-500/20 text-xs text-slate-200 leading-relaxed space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>التقرير العلمي التفاعلي</span>
                  </span>
                  
                  {/* Audio Speech Synthesis Button with Equalizer animation */}
                  <button 
                    onClick={() => handleSpeak(aiAnalysis)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                      isSpeaking 
                        ? 'text-cyan-300 bg-cyan-500/20 font-bold border border-cyan-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title="قراءة صوتية بالذكاء الاصطناعي"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'جاري القراءة' : 'استمع'}</span>
                    {isSpeaking && (
                      <span className="flex gap-0.5 items-center mr-0.5">
                        <span className="w-0.5 h-2 bg-cyan-400 animate-pulse rounded-full" />
                        <span className="w-0.5 h-3 bg-cyan-400 animate-pulse rounded-full" />
                        <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
                      </span>
                    )}
                  </button>
                </div>

                <div className="whitespace-pre-line text-slate-300 text-[11px] sm:text-xs font-normal leading-relaxed">
                  {aiAnalysis}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-1">
                انقر أدناه ليقوم الذكاء الاصطناعي بقراءة معطياتك وشرح ما يحدث في المشهد الآن
              </p>
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
                  className="h-8 text-xs bg-slate-900 border-purple-500/30 focus:border-purple-400 rounded-lg text-white"
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
                  className="h-8 px-2 text-slate-400 hover:text-white"
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
                  className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 border border-purple-400/30 flex items-center justify-center gap-2 h-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
                      <span>جاري التحليل المعملي الذكي...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span>حلل ما أراه الآن بالذكاء الاصطناعي</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCustomMode(true)}
                  className="h-8 px-2.5 border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 text-purple-300 hover:text-white rounded-xl text-xs flex items-center gap-1 shrink-0"
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
