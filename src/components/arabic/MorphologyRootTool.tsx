import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MorphologyRootTool = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeWord = async () => {
    if (!word.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('morphology-root-tool', {
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
      <div className="bg-gradient-to-br from-cyan-900/30 via-blue-800/20 to-cyan-700/30 rounded-xl p-6 border border-cyan-500/40 backdrop-blur-sm shadow-xl">
        <h3 className="text-2xl font-bold text-teal-300 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          أداة الجذور والأوزان
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="أدخل الكلمة لإظهار جذرها ووزنها..."
              className="flex-1 px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-500/50 text-lg"
              disabled={loading}
            />
            <button
              onClick={analyzeWord}
              disabled={!word.trim() || loading}
              className="px-6 py-3 bg-teal-600/30 border border-teal-500/30 rounded-lg text-teal-300 hover:bg-teal-600/50 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              تحليل
            </button>
          </div>

          <div className="text-white/70 text-sm space-y-2">
            <p>💡 سيتم عرض:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>الجذر الثلاثي أو الرباعي</li>
              <li>الوزن الصرفي</li>
              <li>الزيادات ودلالتها</li>
              <li>أمثلة مشابهة</li>
            </ul>
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
            <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
            <p className="text-white/70">جاري التحليل الصرفي...</p>
          </div>
        </motion.div>
      )}

      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl p-6 border border-emerald-500/30"
        >
          <h4 className="text-xl font-semibold text-emerald-300 mb-4">نتائج التحليل</h4>
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

export default MorphologyRootTool;