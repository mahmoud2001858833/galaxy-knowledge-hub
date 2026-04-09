import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Code2, FolderOpen, Wrench, Lightbulb, Rocket } from 'lucide-react';
import { SEO } from '@/components/SEO';

const BTECInformationTechnology = () => {
  const navigate = useNavigate();
  
  const sections = [
    {
      title: "البرمجة",
      subtitle: "Programming",
      icon: Code2,
      description: "مساعد ذكي، تعاريف مهمة، وتحويل العمليات الرياضية إلى كود",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      link: "/btec/it/programming"
    },
    {
      title: "مشاريع الطلبة",
      subtitle: "Student Projects",
      icon: FolderOpen,
      description: "عرض ورفع مشاريع الطلبة مع إمكانية الإعجاب والتقييم",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      link: "/btec/it/student-projects"
    },
    {
      title: "تصليح الكودات",
      subtitle: "Code Fixer",
      icon: Wrench,
      description: "اكتشف الأخطاء وصححها بمساعدة الذكاء الاصطناعي",
      color: "from-red-600/20 to-orange-600/20",
      borderColor: "border-red-500/30",
      link: "/btec/it/code-fixer"
    },
    {
      title: "نصائح للتطوير",
      subtitle: "Development Tips",
      icon: Lightbulb,
      description: "احصل على نصائح وتقييم خبير لمشروعك",
      color: "from-yellow-600/20 to-green-600/20",
      borderColor: "border-yellow-500/30",
      link: "/btec/it/dev-tips"
    },
    {
      title: "طور هذه المنصة بيدك",
      subtitle: "Build Your Platform",
      icon: Rocket,
      description: "أنشئ عالمك الخاص داخل المنصة بمساعدة الذكاء الاصطناعي",
      color: "from-indigo-600/20 to-purple-600/20",
      borderColor: "border-indigo-500/30",
      link: "/btec/it/build-platform"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="تكنولوجيا المعلومات - بتك BTEC"
        description="قسم تكنولوجيا المعلومات في منصة بتك - البرمجة، مشاريع الطلبة، تصليح الكودات، نصائح التطوير"
        keywords="تكنولوجيا معلومات, برمجة, كود, مشاريع, AI, ذكاء اصطناعي"
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
          {/* Back Button */}
          <button
            onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/');
            }}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowRight size={20} />
            {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة لذروة العلم'}
          </button>

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
              تكنولوجيا المعلومات
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6"></div>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              اختر القسم الذي تريد استكشافه وتعلم البرمجة بطريقة احترافية
            </p>
          </motion.div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  onClick={() => navigate(section.link)}
                  className={`group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer ${section.borderColor} border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105`}
                >
                  {/* Background */}
                  <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-radial ${section.color} opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent"></div>
                  </div>
                  
                  <div className="absolute inset-0 p-6 z-10 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 p-4 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      {section.subtitle}
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-400/10 to-blue-500/0"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BTECInformationTechnology;
