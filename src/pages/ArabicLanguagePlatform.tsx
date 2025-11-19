import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Music, MessageSquare, Feather, ArrowRight, Book, Scroll, Pen } from 'lucide-react';
import ArabicAIAssistant from '@/components/arabic/ArabicAIAssistant';
import EnhancedGrammarAssistant from '@/components/arabic/EnhancedGrammarAssistant';
import GrammarFoundation from '@/components/arabic/GrammarFoundation';
import MorphologyDerivatives from '@/components/arabic/MorphologyDerivatives';
import MorphologyAIAssistant from '@/components/arabic/MorphologyAIAssistant';
import MorphologyRootTool from '@/components/arabic/MorphologyRootTool';
import ArabicProsody from '@/components/arabic/ArabicProsody';
import LiteraryReview from '@/components/arabic/LiteraryReview';

type Section = 'grammar' | 'morphology' | 'prosody' | 'criticism' | 'rhetoric' | null;
type GrammarTool = 'ai-assistant' | 'smart-syntax' | 'foundation' | null;
type MorphologyTool = 'derivatives' | 'ai' | 'root' | null;

const ArabicLanguagePlatform = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [activeGrammarTool, setActiveGrammarTool] = useState<GrammarTool>(null);
  const [activeMorphologyTool, setActiveMorphologyTool] = useState<MorphologyTool>(null);

  // الحروف والكلمات العربية العائمة
  const floatingChars = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

  const sections = [
    {
      id: 'grammar' as Section,
      title: 'النحو',
      subtitle: 'علم الإعراب والتركيب',
      icon: <BookOpen className="w-10 h-10" />,
      gradient: 'from-amber-900/30 via-yellow-800/20 to-amber-700/30',
      borderGradient: 'from-amber-500 to-yellow-600',
      textColor: 'text-amber-200',
      hoverTextColor: 'group-hover:text-amber-100',
      bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
      chars: ['ا', 'ل', 'ن', 'ح', 'و']
    },
    {
      id: 'morphology' as Section,
      title: 'الصرف',
      subtitle: 'علم بنية الكلمة',
      icon: <Sparkles className="w-10 h-10" />,
      gradient: 'from-purple-900/30 via-violet-800/20 to-purple-700/30',
      borderGradient: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-200',
      hoverTextColor: 'group-hover:text-purple-100',
      bgImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
      chars: ['ا', 'ل', 'ص', 'ر', 'ف']
    },
    {
      id: 'prosody' as Section,
      title: 'العروض',
      subtitle: 'علم أوزان الشعر',
      icon: <Music className="w-10 h-10" />,
      gradient: 'from-emerald-900/30 via-teal-800/20 to-emerald-700/30',
      borderGradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-200',
      hoverTextColor: 'group-hover:text-emerald-100',
      bgImage: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&q=80',
      chars: ['ا', 'ل', 'ع', 'ر', 'و', 'ض']
    },
    {
      id: 'criticism' as Section,
      title: 'النقد الأدبي',
      subtitle: 'علم تحليل النصوص',
      icon: <MessageSquare className="w-10 h-10" />,
      gradient: 'from-rose-900/30 via-pink-800/20 to-rose-700/30',
      borderGradient: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-200',
      hoverTextColor: 'group-hover:text-rose-100',
      bgImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',
      chars: ['ا', 'ل', 'ن', 'ق', 'د']
    },
    {
      id: 'rhetoric' as Section,
      title: 'البلاغة',
      subtitle: 'علم الفصاحة والبيان',
      icon: <Feather className="w-10 h-10" />,
      gradient: 'from-blue-900/30 via-sky-800/20 to-blue-700/30',
      borderGradient: 'from-blue-500 to-sky-600',
      textColor: 'text-blue-200',
      hoverTextColor: 'group-hover:text-blue-100',
      bgImage: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80',
      chars: ['ا', 'ل', 'ب', 'ل', 'ا', 'غ', 'ة']
    }
  ];

  const grammarTools = [
    { 
      id: 'ai-assistant' as GrammarTool, 
      title: 'المساعد الذكي للغة العربية',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'مساعد ذكي لفهم قواعد اللغة العربية'
    },
    { 
      id: 'smart-syntax' as GrammarTool, 
      title: 'المساعد الذكي للإعراب',
      icon: <Book className="w-6 h-6" />,
      description: 'أداة ذكية لإعراب الجمل والكلمات'
    },
    { 
      id: 'foundation' as GrammarTool, 
      title: 'أساسيات النحو',
      icon: <Scroll className="w-6 h-6" />,
      description: 'تعلم أساسيات النحو من الصفر'
    }
  ];

  const morphologyTools = [
    { 
      id: 'derivatives' as MorphologyTool, 
      title: 'المشتقات',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'استكشف المشتقات والأوزان'
    },
    { 
      id: 'ai' as MorphologyTool, 
      title: 'مساعد الصرف الذكي',
      icon: <Book className="w-6 h-6" />,
      description: 'مساعد ذكي لعلم الصرف'
    },
    { 
      id: 'root' as MorphologyTool, 
      title: 'أداة الجذور',
      icon: <Pen className="w-6 h-6" />,
      description: 'اكتشف جذور الكلمات العربية'
    }
  ];

  const renderContent = () => {
    if (!activeSection) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => setActiveSection(section.id)}
              className={`group relative h-[280px] rounded-xl overflow-hidden cursor-pointer ${section.borderColor} ${section.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              <div className="absolute inset-0">
                <div className={`absolute inset-0 bg-gradient-radial ${section.color} opacity-90`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
                <div className="text-amber-300 mb-4 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {section.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    if (activeSection === 'grammar') {
      if (!activeGrammarTool) {
        return (
          <div className="space-y-4">
            {grammarTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveGrammarTool(tool.id)}
                className="p-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 hover:border-blue-500/50 cursor-pointer hover:scale-105 transition-all"
              >
                <h3 className="text-xl font-bold text-blue-300">{tool.title}</h3>
              </motion.div>
            ))}
          </div>
        );
      }

      switch (activeGrammarTool) {
        case 'ai-assistant':
          return <ArabicAIAssistant />;
        case 'smart-syntax':
          return <EnhancedGrammarAssistant />;
        case 'foundation':
          return <GrammarFoundation />;
      }
    }

    if (activeSection === 'morphology') {
      if (!activeMorphologyTool) {
        return (
          <div className="space-y-4">
            {morphologyTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveMorphologyTool(tool.id)}
                className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:border-purple-500/50 cursor-pointer hover:scale-105 transition-all"
              >
                <h3 className="text-xl font-bold text-purple-300">{tool.title}</h3>
              </motion.div>
            ))}
          </div>
        );
      }

      switch (activeMorphologyTool) {
        case 'derivatives':
          return <MorphologyDerivatives />;
        case 'ai':
          return <MorphologyAIAssistant />;
        case 'root':
          return <MorphologyRootTool />;
      }
    }

    if (activeSection === 'prosody') {
      return <ArabicProsody />;
    }

    if (activeSection === 'criticism') {
      return <LiteraryReview />;
    }

    return (
      <div className="text-center py-12">
        <p className="text-white/70 text-xl">قريباً...</p>
      </div>
    );
  };

  const handleBack = () => {
    if (activeGrammarTool) {
      setActiveGrammarTool(null);
    } else if (activeMorphologyTool) {
      setActiveMorphologyTool(null);
    } else if (activeSection) {
      setActiveSection(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900/40 to-amber-950 text-right" dir="rtl">
      <main className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-white to-amber-500">
              علوم اللغة العربية
            </h1>
            <div className="w-16 h-1 bg-amber-500/50 mx-auto mb-4"></div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              منصة متكاملة لدراسة وإتقان علوم اللغة العربية
            </p>
          </motion.div>

          {/* Back Button */}
          {(activeSection || activeGrammarTool || activeMorphologyTool) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleBack}
              className="mb-6 px-6 py-3 bg-amber-600/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              رجوع
            </motion.button>
          )}

          {/* Content */}
          <div className="min-h-[600px]">
            {renderContent()}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ArabicLanguagePlatform;