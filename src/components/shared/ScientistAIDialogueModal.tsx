import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, Sparkles, Send, Loader2, BookOpen, 
  Award, Quote, History, Lightbulb, Volume2, Check, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';

export interface BaseScientist {
  id: string;
  name: string;
  nameArabic: string;
  period: string;
  country: string;
  fieldArabic: string;
  achievements: string[];
  description: string;
  famousFor: string;
  avatarEmoji: string;
  keyFormula?: string;
  keyReactionOrFormula?: string;
  keyConcept?: string;
  historicalQuote?: string;
  subjectTitle?: string;
}

interface ScientistAIDialogueModalProps {
  scientist: BaseScientist | null;
  isOpen: boolean;
  onClose: () => void;
  subject: 'math' | 'physics' | 'chemistry' | 'biology';
}

interface ChatMessage {
  sender: 'user' | 'scientist';
  text: string;
  timestamp: string;
}

export const ScientistAIDialogueModal: React.FC<ScientistAIDialogueModalProps> = ({
  scientist,
  isOpen,
  onClose,
  subject
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'theorems'>('chat');

  if (!isOpen || !scientist) return null;

  // Suggested questions
  const defaultPrompts = [
    `أخبرني عن قصة أعظم اكتشافاتك وكيف توصلت إليه؟`,
    `اشرح لي نظريتك ومعادلتك الأساسية بأسلوب مبسط وشيق`,
    `ما هي الصعوبات والتحديات التي واجهتها في عصرك؟`,
    `ما هي نصيحتك الثمينة لطلاب العلم في القرن الحادي والعشرين؟`
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputText;
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const promptToAI = `تقمّص شخصية العالم (${scientist.nameArabic} - ${scientist.name}) في مجال (${scientist.fieldArabic})، وأجب كأنك هو باللغة العربية الفصحى الراقية والملهمة، مستحضراً إنجازاتك (${scientist.achievements.join('، ')}) وتاريخك في (${scientist.period}) في (${scientist.country}). السؤال الموجه إليك هو: "${question}"`;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: promptToAI,
          subject: subject,
          useGemini: true
        }
      });

      let reply = '';
      if (!error && data && data.result) {
        reply = data.result;
      } else {
        // Fallback realistic response
        reply = `أهلاً بك يا طالب العلم النبيل. أنا ${scientist.nameArabic}، يسعدني حرصك على المعرفة. ${
          question.includes('اكتشاف') || question.includes('نظري')
            ? `لقد أمضيت سنوات عمري في البحث والتجريب في ${scientist.fieldArabic} حتى هداني الله لاكتشاف ${scientist.famousFor}. كان هدفي دائماً أن أضع لبنة في صرح المعرفة لخدمة البشرية.`
            : question.includes('نصيح')
            ? `نصيحتي لك أن لا تركن إلى اليقين السهل، بل اسأل وابحث وتأمل القوانين الخفية التي أودعها الخالق في الكون. العلم يحتاج إلى الصبر والشغف والتواضع أمام الحقيقة.`
            : `في عصري (${scientist.period}) واجهنا العديد من التحديات وقلة الموارد، لكن قوة العزم والبرهان كانت بوصلتنا للوصول إلى الحقيقة وتدوين إنجازاتنا التي تقرؤها اليوم.`
        }`;
      }

      const scientistMsg: ChatMessage = {
        sender: 'scientist',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, scientistMsg]);
    } catch (err) {
      console.error(err);
      toast.error('تعذر إجراء الحوار في الوقت الحالي');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBiography = () => {
    const text = `العالم: ${scientist.nameArabic} (${scientist.name})\nالفترة: ${scientist.period} - ${scientist.country}\nالمجال: ${scientist.fieldArabic}\nأبرز الإنجازات:\n${scientist.achievements.map((a, i) => `${i + 1}. ${a}`).join('\n')}\nالوصف: ${scientist.description}`;
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ السيرة الذاتية للعالم بنجاح');
  };

  const formulaToDisplay = scientist.keyFormula || scientist.keyReactionOrFormula || scientist.keyConcept;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-purple-950/90 via-slate-900 to-cyan-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-purple-500/40 flex items-center justify-center text-3xl shadow-inner">
              {scientist.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  {scientist.fieldArabic}
                </span>
                <span className="text-xs text-slate-400 font-mono" dir="ltr">
                  {scientist.period}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <span>حوار افتراضي مع:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
                  {scientist.nameArabic}
                </span>
              </h3>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="w-9 h-9 p-0 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'chat'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>حوار الذكاء الاصطناعي التفاعلي</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>السيرة والإنجازات التاريخية</span>
          </button>

          {formulaToDisplay && (
            <button
              onClick={() => setActiveTab('theorems')}
              className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'theorems'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>القوانين والنظريات</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs md:text-sm text-purple-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">
                    أنت الآن في محادثة مباشرة مع العقل التاريخي لـ {scientist.nameArabic}.
                  </p>
                  <p className="text-slate-300 text-xs">
                    تستطيع سؤاله عن كواليس نظرياته، التحديات التي تخطاها، وكيف غيّر علمه مجرى التاريخ البشري.
                  </p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 min-h-[280px] max-h-[380px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="text-4xl animate-bounce">{scientist.avatarEmoji}</div>
                    <p className="text-slate-400 text-sm max-w-md">
                      مرحباً بك! اختر سؤالاً من الأسئلة المقترحة بالأسفل أو اكتب ما يجول بخاطرك لتبدأ حوارك مع {scientist.nameArabic}.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                      {defaultPrompts.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-purple-200 border border-slate-700/80 hover:border-purple-400 transition-all text-right"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      {msg.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-cyan-600/40 border border-cyan-500/50 flex items-center justify-center text-xs text-cyan-200 shrink-0">
                          أنت
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cyan-950/40 border border-cyan-700/40 text-cyan-100 rounded-tr-none'
                            : 'bg-slate-800/90 border border-purple-500/30 text-slate-100 rounded-tl-none shadow-lg'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className="block text-[10px] text-slate-400 mt-1.5 font-mono text-left" dir="ltr">
                          {msg.timestamp}
                        </span>
                      </div>

                      {msg.sender === 'scientist' && (
                        <div className="w-8 h-8 rounded-full bg-purple-600/40 border border-purple-500/50 flex items-center justify-center text-base shrink-0">
                          {scientist.avatarEmoji}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 text-purple-300 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>{scientist.nameArabic} يصوغ إجابته الملهمة...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2 pt-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`اسأل ${scientist.nameArabic} أي سؤال...`}
                  className="flex-1 bg-slate-950/90 border-slate-700 text-white rounded-2xl text-sm px-4 py-3"
                />

                <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950 border border-slate-700">
                  <GlobalVoiceInput
                    onTranscript={(text) => setInputText(prev => (prev ? prev + ' ' : '') + text)}
                    size="md"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 rounded-2xl font-bold"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{scientist.nameArabic}</h4>
                    <p className="text-sm text-cyan-400 font-mono" dir="ltr">{scientist.name}</p>
                    <p className="text-xs text-slate-400 mt-1">البلد والموطن: {scientist.country} | الفترة: {scientist.period}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyBiography}
                    className="border-slate-700 text-slate-300 hover:text-white text-xs gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ السيرة</span>
                  </Button>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {scientist.description}
                </p>

                {scientist.historicalQuote && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border-r-4 border-purple-500 text-purple-200 text-xs md:text-sm italic">
                    <Quote className="w-4 h-4 inline-block ml-2 text-purple-400" />
                    "{scientist.historicalQuote}"
                  </div>
                )}
              </div>

              {/* Achievements Grid */}
              <div className="space-y-3">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>أبرز الإنجازات والفتوحات العلمية:</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scientist.achievements.map((ach, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs md:text-sm text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theorems' && formulaToDisplay && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-purple-500/30 space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  <span>المعادلة أو القانون الرياضي/الفيزيائي البارز:</span>
                </h4>

                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-900/50 text-cyan-300 font-mono text-xl text-left overflow-x-auto" dir="ltr">
                  {formulaToDisplay}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  يعد هذا القانون/المفهوم إحدى الركائز الأساسية التي تركت أثراً عميقاً في مسار {scientist.fieldArabic}.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
