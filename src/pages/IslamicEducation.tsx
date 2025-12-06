import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Calendar, History, Book, Sparkles } from 'lucide-react';

const IslamicEducation = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const sections = [
    {
      title: "السنوات الهجرية وأحداثها",
      titleEn: "Hijri Years & Events",
      icon: Calendar,
      image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop",
      color: "from-emerald-600/30 to-teal-600/30",
      borderColor: "border-emerald-500/30",
      hoverBorderColor: "hover:border-emerald-500/60",
      description: "استكشف الأحداث التاريخية الإسلامية من خلال السنوات الهجرية",
      descriptionEn: "Explore Islamic historical events through Hijri years",
      link: "/islamic-education/hijri-events"
    },
    {
      title: "أحداث الفترات التاريخية",
      titleEn: "Historical Eras Events",
      icon: History,
      image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop",
      color: "from-amber-600/30 to-orange-600/30",
      borderColor: "border-amber-500/30",
      hoverBorderColor: "hover:border-amber-500/60",
      description: "قارن بين الفترات التاريخية واكتشف تطور العادات والقوانين",
      descriptionEn: "Compare historical periods and discover evolution of customs and laws",
      link: "/islamic-education/historical-eras"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-emerald-950/60 to-slate-950`} dir={dir}>
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with back button */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <button
              onClick={() => navigate('/literary-platforms')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {t.common.back}
            </button>
            
            <div className="text-center relative">
              {/* Islamic decorative pattern */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-96 h-96 border-4 border-emerald-400 rotate-45 rounded-3xl"></div>
                <div className="absolute w-80 h-80 border-4 border-amber-400 rotate-12 rounded-3xl"></div>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block mb-6"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-2xl flex items-center justify-center border border-emerald-400/30 backdrop-blur-sm">
                  <Book className="w-12 h-12 text-emerald-300" />
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-white to-amber-300">
                التربية الإسلامية
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500/50 to-amber-500/50 mx-auto mb-4 rounded-full"></div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                استكشف التاريخ الإسلامي وأحداثه العظيمة عبر العصور
              </p>
            </div>
          </motion.div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.2, duration: 0.5 }}
                  onClick={() => navigate(section.link)}
                  className={`group relative h-[320px] md:h-[380px] rounded-2xl overflow-hidden cursor-pointer ${section.borderColor} ${section.hoverBorderColor} border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.02]`}
                >
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0">
                    <img 
                      src={section.image} 
                      alt={section.title} 
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent"></div>
                  </div>
                  
                  {/* Islamic Pattern Overlay */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rotate-45 rounded-xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rotate-12 rounded-xl"></div>
                  </div>
                  
                  <div className="absolute inset-0 p-8 z-10 flex flex-col justify-end">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-emerald-200 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-white/80 text-base leading-relaxed mb-6">
                        {section.description}
                      </p>
                      
                      <button className="px-6 py-3 bg-emerald-600/30 border border-emerald-400/50 rounded-xl text-emerald-200 hover:bg-emerald-600/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 group/btn">
                        <span>استكشاف</span>
                        {dir === 'rtl' ? 
                          <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" /> : 
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        }
                      </button>
                    </motion.div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-400/10 to-amber-500/10"></div>
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

export default IslamicEducation;
