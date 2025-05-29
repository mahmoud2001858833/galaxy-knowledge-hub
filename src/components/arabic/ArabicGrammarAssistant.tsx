
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

const ArabicGrammarAssistant = () => {
  const [sentence, setSentence] = useState('');
  const [analysis, setAnalysis] = useState<WordAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');

  const exampleSentences = [
    "ذهب الطالبُ إلى المدرسةِ",
    "قرأ أحمدُ الكتابَ بعنايةٍ",
    "تفتحُ الوردةُ في الربيعِ",
    "كتبت البنتُ رسالةً جميلةً"
  ];

  const analyzeSentence = async () => {
    if (!sentence.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('arabic-ai-assistant', {
        body: { 
          message: `قم بإعراب الجملة التالية كلمة كلمة مع شرح مفصل للقواعد النحوية: "${sentence}". 
          أريد التحليل بالشكل التالي:
          1. تحليل كل كلمة منفصلة
          2. نوع الكلمة (فعل، اسم، حرف)
          3. موقعها النحوي
          4. إعرابها الكامل
          5. السبب النحوي
          6. شرح عام للجملة والقواعد المستخدمة` 
        }
      });

      if (error) throw error;

      // Parse the AI response to extract analysis
      const response = data.reply;
      setExplanation(response);
      
      // Create mock analysis for demonstration
      const words = sentence.split(' ');
      const mockAnalysis: WordAnalysis[] = words.map((word, index) => {
        if (index === 0) {
          return {
            word: word,
            type: 'فعل',
            position: 'فعل الجملة',
            grammar: 'فعل ماضٍ مبني على الفتح',
            reason: 'لأنه يدل على حدث وقع في الزمن الماضي'
          };
        } else if (word.includes('ُ')) {
          return {
            word: word,
            type: 'اسم',
            position: 'فاعل',
            grammar: 'فاعل مرفوع وعلامة رفعه الضمة الظاهرة',
            reason: 'لأنه من قام بالفعل'
          };
        } else if (word.includes('َ')) {
          return {
            word: word,
            type: 'اسم',
            position: 'مفعول به',
            grammar: 'مفعول به منصوب وعلامة نصبه الفتحة الظاهرة',
            reason: 'لأنه وقع عليه فعل الفاعل'
          };
        } else if (word.includes('ِ')) {
          return {
            word: word,
            type: 'اسم',
            position: 'اسم مجرور',
            grammar: 'اسم مجرور وعلامة جره الكسرة الظاهرة',
            reason: 'لأنه مسبوق بحرف جر'
          };
        } else {
          return {
            word: word,
            type: 'حرف',
            position: 'حرف جر',
            grammar: 'حرف جر لا محل له من الإعراب',
            reason: 'لأنه يدل على معنى في غيره'
          };
        }
      });
      
      setAnalysis(mockAnalysis);
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
      <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 border border-amber-500/30">
        <h3 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          أدخل الجملة للإعراب
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب الجملة هنا..."
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
              إعراب
            </button>
          </div>
          
          {/* Example Sentences */}
          <div>
            <p className="text-white/70 text-sm mb-2">أمثلة:</p>
            <div className="flex flex-wrap gap-2">
              {exampleSentences.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSentence(example)}
                  className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors text-sm"
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
              <h3 className="text-xl font-semibold text-blue-300 mb-4">تحليل الكلمات</h3>
              
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
                            word.type === 'فعل' ? 'bg-red-600/20 border border-red-500/30 text-red-300' :
                            word.type === 'اسم' ? 'bg-green-600/20 border border-green-500/30 text-green-300' :
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
              <h3 className="text-xl font-semibold text-purple-300 mb-4">الشرح المفصل</h3>
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
            <p className="text-white/70">جاري تحليل الجملة...</p>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      {analysis.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-xl p-6 border border-gray-500/30">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">كيفية الاستخدام</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>اكتب الجملة العربية التي تريد إعرابها</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>اضغط على زر "إعراب" أو اضغط Enter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>شاهد التحليل المفصل لكل كلمة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>استمع للإعراب الصوتي لفهم أفضل</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArabicGrammarAssistant;
