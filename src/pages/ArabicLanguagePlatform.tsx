import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Music, MessageSquare, Feather, ArrowRight } from 'lucide-react';
import ArabicAIAssistant from '@/components/arabic/ArabicAIAssistant';
import EnhancedGrammarAssistant from '@/components/arabic/EnhancedGrammarAssistant';
import GrammarFoundation from '@/components/arabic/GrammarFoundation';
import MorphologyDerivatives from '@/components/arabic/MorphologyDerivatives';
import MorphologyAIAssistant from '@/components/arabic/MorphologyAIAssistant';
import MorphologyRootTool from '@/components/arabic/MorphologyRootTool';

type Section = 'grammar' | 'morphology' | 'prosody' | 'criticism' | 'rhetoric' | null;
type GrammarTool = 'ai-assistant' | 'smart-syntax' | 'foundation' | null;
type MorphologyTool = 'derivatives' | 'ai' | 'root' | null;

const ArabicLanguagePlatform = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [activeGrammarTool, setActiveGrammarTool] = useState<GrammarTool>(null);
  const [activeMorphologyTool, setActiveMorphologyTool] = useState<MorphologyTool>(null);

  const sections = [
    {
      id: 'grammar' as Section,
      title: 'النحو',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
      hoverBorderColor: 'hover:border-blue-500/50'
    },
    {
      id: 'morphology' as Section,
      title: 'الصرف',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-purple-600/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
      hoverBorderColor: 'hover:border-purple-500/50'
    },
    {
      id: 'prosody' as Section,
      title: 'العروض',
      icon: <Music className="w-8 h-8" />,
      color: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      hoverBorderColor: 'hover:border-green-500/50'
    },
    {
      id: 'criticism' as Section,
      title: 'النقد الأدبي',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'from-amber-600/20 to-orange-600/20',
      borderColor: 'border-amber-500/30',
      hoverBorderColor: 'hover:border-amber-500/50'
    },
    {
      id: 'rhetoric' as Section,
      title: 'البلاغة',
      icon: <Feather className="w-8 h-8" />,
      color: 'from-rose-600/20 to-pink-600/20',
      borderColor: 'border-rose-500/30',
      hoverBorderColor: 'hover:border-rose-500/50'
    }
  ];

  const grammarTools = [
    { id: 'ai-assistant' as GrammarTool, title: 'المساعد الذكي للغة العربية' },
    { id: 'smart-syntax' as GrammarTool, title: 'المساعد الذكي للإعراب' },
    { id: 'foundation' as GrammarTool, title: 'أساسيات النحو' }
  ];

  const morphologyTools = [
    { id: 'derivatives' as MorphologyTool, title: 'المشتقات' },
    { id: 'ai' as MorphologyTool, title: 'مساعد الصرف الذكي' },
    { id: 'root' as MorphologyTool, title: 'أداة الجذور' }
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