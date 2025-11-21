import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MorphologyDerivatives = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState([
    'كتب', 'درس', 'علم', 'فهم', 'قرأ', 'سمع', 'قال', 'عمل'
  ]);

  const analyzeWord = async () => {
    if (!word.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('morphology-derivatives', {
        body: { word }
      });

      if (error) throw error;
      setResult(data.reply);
    } catch (error) {
      console.error('Error:', error);
      setResult('عذراً، حدث خطأ في تحليل الكلمة.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      analyzeWord();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-pink-900/30 via-rose-800/20 to-pink-700/30 rounded-xl p-6 border border-pink-500/40 backdrop-blur-sm shadow-xl">
        <h3 className="text-2xl font-bold text-pink-200 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          أداة المشتقات الصرفية
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="أدخل الكلمة لإظهار مشتقاتها..."
              className="flex-1 px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 text-lg"
              disabled={loading}
            />
            <button
              onClick={analyzeWord}
              disabled={!word.trim() || loading}
              className="px-6 py-3 bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/50 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              تحليل
            </button>
          </div>

          <div>
            <p className="text-white/70 text-sm mb-2">اقتراحات:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setWord(suggestion)}
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white/70">جاري تحليل المشتقات...</p>
          </div>
        </motion.div>
      )}

      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30"
        >
          <h4 className="text-xl font-semibold text-blue-300 mb-4">نتائج التحليل</h4>
          <div className="prose prose-invert max-w-none">
            <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MorphologyDerivatives;