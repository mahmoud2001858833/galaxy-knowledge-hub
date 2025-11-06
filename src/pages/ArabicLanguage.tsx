
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArabicAIAssistant from '@/components/arabic/ArabicAIAssistant';
import ArabicScholars from '@/components/arabic/ArabicScholars';
import EnhancedGrammarAssistant from '@/components/arabic/EnhancedGrammarAssistant';
import ArabicPoets from '@/components/arabic/ArabicPoets';
import ArabicEssayWriter from '@/components/arabic/ArabicEssayWriter';
import ArabicQuestionBank from '@/components/arabic/ArabicQuestionBank';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Bot, Users, PenTool, Feather, BookOpen } from 'lucide-react';

const ArabicLanguage = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const features = [
    {
      title: "علوم اللغة العربية",
      icon: <BookOpen className="w-8 h-8" />,
      description: "منصة متكاملة تشمل النحو، الصرف، العروض، النقد الأدبي، والبلاغة مع أدوات ذكية",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      component: "language-sciences"
    },
    {
      title: "المساعد الذكي للغة العربية",
      icon: <Bot className="w-8 h-8" />,
      description: "مساعد ذكي متخصص في النحو والصرف والبلاغة العربية",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      component: "ai-assistant"
    },
    {
      title: "شعراء العرب",
      icon: <Feather className="w-8 h-8" />,
      description: "موسوعة شاملة لأعلام الشعر العربي عبر التاريخ مع قصائدهم ومعلوماتهم",
      color: "from-rose-600/20 to-pink-600/20",
      borderColor: "border-rose-500/30",
      hoverBorderColor: "hover:border-rose-500/50",
      component: "poets"
    },
    {
      title: "موسوعة علماء اللغة العربية",
      icon: <Users className="w-8 h-8" />,
      description: "تعرف على أعلام النحو والأدب والبلاغة عبر التاريخ",
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      hoverBorderColor: "hover:border-green-500/50",
      component: "scholars"
    },
    {
      title: "المساعد الذكي للإعراب",
      icon: <PenTool className="w-8 h-8" />,
      description: "تحليل نحوي دقيق 100% للجمل العربية مع شرح مفصل للإعراب",
      color: "from-amber-600/20 to-orange-600/20",
      borderColor: "border-amber-500/30",
      hoverBorderColor: "hover:border-amber-500/50",
      component: "grammar"
    },
    {
      title: "التعبير",
      icon: <PenTool className="w-8 h-8" />,
      description: "تدريب على كتابة التعبير وتصحيحه تلقائياً",
      color: "from-indigo-600/20 to-blue-600/20",
      borderColor: "border-indigo-500/30",
      hoverBorderColor: "hover:border-indigo-500/50",
      component: "essay"
    },
    {
      title: "بنك الأسئلة",
      icon: <Bot className="w-8 h-8" />,
      description: "توليد أسئلة تعليمية بالذكاء الاصطناعي",
      color: "from-teal-600/20 to-green-600/20",
      borderColor: "border-teal-500/30",
      hoverBorderColor: "hover:border-teal-500/50",
      component: "questions"
    }
  ];

  const [activeComponent, setActiveComponent] = React.useState<string | null>(null);

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'language-sciences':
        navigate('/arabic-platform');
        return null;
      case 'ai-assistant':
        return <ArabicAIAssistant />;
      case 'poets':
        return <ArabicPoets />;
      case 'scholars':
        return <ArabicScholars />;
      case 'grammar':
        return <EnhancedGrammarAssistant />;
      case 'essay':
        return <ArabicEssayWriter />;
      case 'questions':
        return <ArabicQuestionBank />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b from-amber-900/40 to-amber-950`} dir={dir}>
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
            <button
              onClick={() => navigate('/literary-platforms')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              العودة للمنصات الأدبية
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-white to-amber-500">
                منصة اللغة العربية المحسنة
              </h1>
              <div className="w-16 h-1 bg-amber-500/50 mx-auto mb-4"></div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                منصة شاملة ومحسنة لتعلم وإتقان اللغة العربية بجميع فروعها
              </p>
            </div>
          </motion.div>

          {!activeComponent ? (
            /* Features Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  onClick={() => setActiveComponent(feature.component)}
                  className={`group relative h-[280px] rounded-xl overflow-hidden cursor-pointer ${feature.borderColor} ${feature.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-105`}
                >
                  {/* Background */}
                  <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-radial ${feature.color} opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 to-transparent"></div>
                  </div>
                  
                  <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
                    <div className="text-amber-300 mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <button 
                      className="px-6 py-2 bg-amber-600/30 border border-amber-500/50 rounded-full text-amber-300 hover:bg-amber-600/50 transition-all duration-300 hover:scale-105"
                    >
                      استكشاف محسن
                    </button>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-400/10 to-amber-500/0"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-amber-400/20 to-transparent"></div>
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
                className="mb-6 px-4 py-2 bg-amber-600/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors"
              >
                ← العودة للقائمة الرئيسية
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

export default ArabicLanguage;
