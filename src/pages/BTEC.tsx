import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Code, Palette, Briefcase, Cog } from 'lucide-react';
import { SEO } from '@/components/SEO';

const BTEC = () => {
  const navigate = useNavigate();
  
  const fields = [
    {
      title: "تكنولوجيا معلومات",
      subtitle: "Information Technology",
      icon: Code,
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      link: "/btec/information-technology"
    },
    {
      title: "فن وتصميم",
      subtitle: "Art & Design",
      icon: Palette,
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      link: "#"
    },
    {
      title: "إدارة أعمال",
      subtitle: "Business Management",
      icon: Briefcase,
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      hoverBorderColor: "hover:border-green-500/50",
      link: "#"
    },
    {
      title: "الهندسة",
      subtitle: "Engineering",
      icon: Cog,
      color: "from-orange-600/20 to-red-600/20",
      borderColor: "border-orange-500/30",
      hoverBorderColor: "hover:border-orange-500/50",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="بتك BTEC - منصة التعليم المهني"
        description="منصة بتك BTEC للتعليم المهني - تكنولوجيا المعلومات، الفن والتصميم، إدارة الأعمال، والهندسة"
        keywords="بتك, BTEC, تعليم مهني, تكنولوجيا معلومات, برمجة, فن, تصميم, إدارة أعمال, هندسة"
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
            className="mb-16 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-purple-400">
              بتك الأردني
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              منصة التعليم المهني المتقدمة - اختر مجالك وابدأ رحلتك التعليمية
            </p>
          </motion.div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {fields.map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  onClick={() => field.link !== "#" && navigate(field.link)}
                  className={`group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer ${field.borderColor} ${field.hoverBorderColor} border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 ${field.link === "#" ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-radial ${field.color} opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent"></div>
                  </div>
                  
                  <div className="absolute inset-0 p-8 z-10 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 p-4 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                      <Icon className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {field.title}
                    </h3>
                    <p className="text-lg text-white/70 mb-4">
                      {field.subtitle}
                    </p>
                    {field.link !== "#" && (
                      <button className="px-6 py-2 bg-blue-600/30 border border-blue-500/50 rounded-full text-blue-300 text-sm hover:bg-blue-600/50 transition-colors">
                        استكشف المجال
                      </button>
                    )}
                    {field.link === "#" && (
                      <span className="text-sm text-white/50">قريباً</span>
                    )}
                  </div>
                  
                  {/* Hover glow effect */}
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

export default BTEC;
