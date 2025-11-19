import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EnhancedGrammarAssistant from '@/components/arabic/EnhancedGrammarAssistant';

const GrammarBasicsSection = () => {
  const navigate = useNavigate();
  const floatingChars = ['ا', 'ل', 'ن', 'ح', 'و'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 text-right relative overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
        }}></div>
      </div>

      {/* الحروف العائمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingChars.map((char, idx) => (
          <motion.div
            key={idx}
            className="absolute text-6xl font-bold text-blue-500/10"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              rotate: Math.random() * 360
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-300 to-blue-500"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              أساسيات النحو
            </motion.h1>
            <motion.div 
              className="w-24 h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-6 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.p 
              className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              تحليل الجمل وإعرابها بمساعدة الذكاء الاصطناعي
            </motion.p>
          </motion.div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/arabic-platform/grammar')}
            className="mb-8 px-8 py-4 elegant-card rounded-xl text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-3 group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-semibold">رجوع</span>
          </motion.button>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <EnhancedGrammarAssistant />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default GrammarBasicsSection;
