
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedEnglishAIAssistant from '@/components/english/EnhancedEnglishAIAssistant';
import SmartTranslator from '@/components/english/SmartTranslator';
import EnhancedSpeechAssistant from '@/components/english/EnhancedSpeechAssistant';
import EnglishScholarsEncyclopedia from '@/components/english/EnglishScholarsEncyclopedia';
import { ArrowLeft, ArrowRight, Bot, Languages, Globe, Headphones, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

const EnglishLanguage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'ar' | 'en'>('en');
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = {
    ar: {
      title: "منصة اللغة الإنجليزية المتطورة",
      subtitle: "تعلم وأتقن اللغة الإنجليزية مع أدواتنا الذكية والتفاعلية المطورة",
      backToLiterary: "العودة للمنصات الأدبية",
      backToMain: "العودة للقائمة الرئيسية",
      switchToEnglish: "English",
      switchToArabic: "العربية",
      aiAssistant: "المساعد الذكي الإنجليزي",
      aiAssistantDescription: "مساعد ذكي متخصص في تعلم اللغة الإنجليزية وقواعدها مع إجابات صوتية",
      smartTranslator: "المترجم الذكي المتطور",
      smartTranslatorDescription: "ترجمة ذكية للنصوص والصور مع مولد النصوص الإنجليزية المحترف",
      speechAssistant: "المساعد الذكي للنطق والتحدث",
      speechAssistantDescription: "طور مهاراتك في النطق والتحدث باللغة الإنجليزية مع تدريبات تفاعلية متقدمة",
      scholarsEncyclopedia: "موسوعة علماء اللغة الإنجليزية",
      scholarsEncyclopediaDescription: "اكتشف عمالقة اللغة الإنجليزية الذين شكلوا تطورها عبر التاريخ"
    },
    en: {
      title: "Advanced English Language Platform",
      subtitle: "Learn and master English with our enhanced intelligent and interactive tools",
      backToLiterary: "Back to Literary Platforms",
      backToMain: "Back to Main Menu",
      switchToEnglish: "English",
      switchToArabic: "العربية",
      aiAssistant: "Enhanced English AI Assistant",
      aiAssistantDescription: "An intelligent assistant specialized in English language learning with voice responses",
      smartTranslator: "Advanced Smart Translator",
      smartTranslatorDescription: "Smart translation for texts and images with professional English text generator",
      speechAssistant: "Enhanced Speech & Pronunciation Coach",
      speechAssistantDescription: "Master English pronunciation and speaking skills with advanced interactive training",
      scholarsEncyclopedia: "English Language Scholars Encyclopedia",
      scholarsEncyclopediaDescription: "Discover the giants of English language who shaped its evolution throughout history"
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';
  
  const features = [
    {
      title: currentLang.aiAssistant,
      icon: <Bot className="w-8 h-8" />,
      description: currentLang.aiAssistantDescription,
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      component: "ai-assistant"
    },
    {
      title: currentLang.smartTranslator,
      icon: <Languages className="w-8 h-8" />,
      description: currentLang.smartTranslatorDescription,
      color: "from-purple-600/20 to-indigo-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      component: "translator"
    },
    {
      title: currentLang.speechAssistant,
      icon: <Headphones className="w-8 h-8" />,
      description: currentLang.speechAssistantDescription,
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      hoverBorderColor: "hover:border-green-500/50",
      component: "speech"
    },
    {
      title: currentLang.scholarsEncyclopedia,
      icon: <GraduationCap className="w-8 h-8" />,
      description: currentLang.scholarsEncyclopediaDescription,
      color: "from-amber-600/20 to-orange-600/20",
      borderColor: "border-amber-500/30",
      hoverBorderColor: "hover:border-amber-500/50",
      component: "scholars"
    }
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'ai-assistant':
        return <EnhancedEnglishAIAssistant language={language} />;
      case 'translator':
        return <SmartTranslator language={language} />;
      case 'speech':
        return <EnhancedSpeechAssistant language={language} />;
      case 'scholars':
        return <EnglishScholarsEncyclopedia language={language} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${textAlign} bg-gradient-to-b from-indigo-900/40 to-indigo-950`} dir={dir}>
      <SEO 
        title="منصة اللغة الإنجليزية - Learn English"
        description="تعلم الإنجليزية مع منصة فلك المعرفة - مساعد ذكي، مترجم ذكي، تدريب النطق، وموسوعة علماء اللغة الإنجليزية"
        keywords="تعلم الإنجليزية, اللغة الإنجليزية, قواعد الإنجليزية, مترجم عربي انجليزي, تحسين النطق, محادثة إنجليزية, English learning, grammar, translation, speaking"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
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
            className="mb-10"
          >
            <div className={`flex items-center gap-4 mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => navigate('/literary-platforms')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                {currentLang.backToLiterary}
              </button>
              
              {/* Language Toggle */}
              <div className="flex items-center gap-2 ml-auto">
                <Globe className="w-5 h-5 text-white/70" />
                <Button
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                >
                  {language === 'ar' ? currentLang.switchToEnglish : currentLang.switchToArabic}
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-indigo-500">
                {currentLang.title}
              </h1>
              <div className="w-16 h-1 bg-indigo-500/50 mx-auto mb-4"></div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                {currentLang.subtitle}
              </p>
            </div>
          </motion.div>

          {!activeComponent ? (
            /* Features Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
                  onClick={() => setActiveComponent(feature.component)}
                  className={`group relative h-[300px] md:h-[350px] rounded-xl overflow-hidden cursor-pointer ${feature.borderColor} ${feature.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-105`}
                >
                  {/* Background */}
                  <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-radial ${feature.color} opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 to-transparent"></div>
                  </div>
                  
                  <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
                    <div className="text-indigo-300 mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <button 
                      className="px-6 py-2 bg-indigo-600/30 border border-indigo-500/50 rounded-full text-indigo-300 hover:bg-indigo-600/50 transition-all duration-300 hover:scale-105"
                    >
                      {language === 'ar' ? 'استكشف' : 'Explore'}
                    </button>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-400/10 to-indigo-500/0"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-400/20 to-transparent"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Active Component */
            <div className="min-h-[600px]">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setActiveComponent(null)}
                className="mb-6 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 hover:bg-indigo-600/30 transition-colors"
              >
                {dir === 'rtl' ? '←' : '←'} {currentLang.backToMain}
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {renderActiveComponent()}
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EnglishLanguage;
