
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Volume2, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WordAnalysis {
  word: string;
  type: string;
  position: string;
  grammar: string;
  reason: string;
}

const EnhancedGrammarAssistant = () => {
  const [sentence, setSentence] = useState('');
  const [analysis, setAnalysis] = useState<WordAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');

  const exampleSentences = [
    "ذهب الطالبُ إلى المدرسةِ",
    "قرأ أحمدُ الكتابَ بعنايةٍ",
    "تفتحُ الوردةُ في الربيعِ",
    "كتبت البنتُ رسالةً جميلةً",
    "يدرسُ الطلابُ الدروسَ بجدٍ",
    "جاء المعلمُ مبكراً",
    "أكل الولدُ التفاحةَ",
    "نام الطفلُ في سريرِه"
  ];

  const parseAIResponse = (response: string) => {
    const lines = response.split('\n');
    const wordsData: WordAnalysis[] = [];
    let explanationText = '';
    let isInWordsSection = false;
    let isInExplanationSection = false;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('=== تحليل الكلمات ===')) {
        isInWordsSection = true;
        isInExplanationSection = false;
        return;
      }
      
      if (trimmedLine.includes('=== الشرح المفصل ===')) {
        isInWordsSection = false;
        isInExplanationSection = true;
        return;
      }
      
      if (isInWordsSection && trimmedLine.includes('|')) {
        const parts = trimmedLine.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          const wordPart = parts[0].split(':');
          const word = wordPart[0].trim();
          const type = wordPart[1]?.trim() || parts[1];
          
          wordsData.push({
            word: word,
            type: type,
            position: parts[1],
            grammar: parts[2],
            reason: parts[3]
          });
        }
      }
      
      if (isInExplanationSection && trimmedLine) {
        explanationText += trimmedLine + '\n';
      }
    });

    return { wordsData, explanationText };
  };

  const analyzeSentence = async () => {
    if (!sentence.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('arabic-ai-assistant', {
        body: { 
          message: sentence,
          requestType: 'grammar_analysis'
        }
      });

      if (error) throw error;

      const { wordsData, explanationText } = parseAIResponse(data.reply);
      
      if (wordsData.length > 0) {
        setAnalysis(wordsData);
        setExplanation(explanationText);
      } else {
        // Fallback: إنشاء تحليل أساسي
        const words = sentence.split(' ');
        const fallbackAnalysis = words.map(word => ({
          word: word,
          type: 'غير محدد',
          position: 'قيد التحليل',
          grammar: 'يتطلب تحليل متقدم',
          reason: 'الرجاء المحاولة مرة أخرى'
        }));
        setAnalysis(fallbackAnalysis);
        setExplanation(data.reply);
      }
    } catch (error) {
      console.error('Error analyzing sentence:', error);
      setExplanation('عذراً، حدث خطأ في تحليل الجملة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const speakAnalysis = () => {
    if ('speechSynthesis' in window && analysis.length > 0) {
      const text = analysis.map(word => 
        `${word.word}: ${word.grammar}`
      ).join('. ');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeSentence();
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-gradient-to-br from-amber-900/30 via-yellow-800/20 to-amber-700/30 rounded-xl p-6 border border-amber-500/40 backdrop-blur-sm shadow-xl">
        <h3 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          المساعد الذكي للإعراب - تحليل دقيق 100%
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب الجملة العربية هنا للحصول على إعراب دقيق..."
              className="flex-1 px-4 py-3 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 text-lg"
              disabled={loading}
            />
            <button
              onClick={analyzeSentence}
              disabled={!sentence.trim() || loading}
              className="px-6 py-3 bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              إعراب دقيق
            </button>
          </div>
          
          {/* Example Sentences */}
          <div>
            <p className="text-white/70 text-sm mb-2">أمثلة للتجريب:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleSentences.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSentence(example)}
                  className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors text-sm text-right"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Audio Control */}
          <div className="flex justify-center">
            <button
              onClick={speakAnalysis}
              className="px-6 py-3 bg-green-600/30 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/50 transition-colors flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              استمع للإعراب
            </button>
          </div>

          {/* Word Analysis Table */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">التحليل النحوي الدقيق</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-500/30">
                      <th className="text-right py-3 px-4 text-blue-300 font-semibold">الكلمة</th>
                      <th className="text-right py-3 px-4 text-blue-300 font-semibold">النوع</th>
                      <th className="text-right py-3 px-4 text-blue-300 font-semibold">الموقع النحوي</th>
                      <th className="text-right py-3 px-4 text-blue-300 font-semibold">الإعراب</th>
                      <th className="text-right py-3 px-4 text-blue-300 font-semibold">السبب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.map((word, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-blue-500/20 hover:bg-blue-600/10 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-semibold text-lg">
                          {word.word}
                        </td>
                        <td className="py-3 px-4 text-white/80">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            word.type.includes('فعل') ? 'bg-red-600/20 border border-red-500/30 text-red-300' :
                            word.type.includes('اسم') ? 'bg-green-600/20 border border-green-500/30 text-green-300' :
                            'bg-yellow-600/20 border border-yellow-500/30 text-yellow-300'
                          }`}>
                            {word.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/80">{word.position}</td>
                        <td className="py-3 px-4 text-white/80">{word.grammar}</td>
                        <td className="py-3 px-4 text-white/70 text-sm">{word.reason}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detailed Explanation */}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-semibold text-purple-300 mb-4">الشرح النحوي المفصل</h3>
              <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {explanation}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-white/70">جاري التحليل النحوي الدقيق...</p>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      {analysis.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-xl p-6 border border-gray-500/30">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">ميزات المساعد الذكي المحسن</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>تحليل نحوي دقيق 100% مدعوم بالذكاء الاصطناعي المتقدم</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>إعراب كل كلمة مع تحديد نوعها وموقعها النحوي</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>شرح مفصل للقواعد النحوية المستخدمة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>دعم النطق الصوتي للإعراب</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedGrammarAssistant;
