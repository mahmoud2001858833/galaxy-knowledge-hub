import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Music, MessageSquare, Feather } from 'lucide-react';

type Section = 'grammar' | 'morphology' | 'prosody' | 'criticism' | 'rhetoric';

const ArabicLanguagePlatform = () => {
  const navigate = useNavigate();
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
      chars: ['ا', 'ل', 'ن', 'ح', 'و'],
      path: '/arabic-platform/grammar'
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
      chars: ['ا', 'ل', 'ص', 'ر', 'ف'],
      path: '/arabic-platform/morphology'
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
      chars: ['ا', 'ل', 'ع', 'ر', 'و', 'ض'],
      path: '/arabic-platform/prosody'
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
      chars: ['ا', 'ل', 'ن', 'ق', 'د'],
      path: '/arabic-platform/criticism'
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
      chars: ['ا', 'ل', 'ب', 'ل', 'ا', 'غ', 'ة'],
      path: '/arabic-platform/rhetoric'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 text-right relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
        }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingChars.slice(0, 12).map((char, idx) => (
          <motion.div
            key={idx}
            className="absolute text-6xl font-bold text-amber-500/10"
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
        <motion.div className="max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-16 text-center">
            <motion.h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              علوم اللغة العربية
            </motion.h1>
            <motion.div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6 rounded-full" initial={{ width: 0 }} animate={{ width: 96 }} transition={{ duration: 0.8, delay: 0.3 }} />
            <motion.p className="text-xl md:text-2xl text-amber-100/80 max-w-3xl mx-auto font-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              منصة متكاملة لدراسة وإتقان علوم اللغة العربية
            </motion.p>
          </motion.div>

          <div className="min-h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div key={section.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }} onClick={() => navigate(section.path)} className="group relative h-[340px] rounded-2xl overflow-hidden cursor-pointer elegant-card">
                  <div className="absolute inset-0">
                    <img src={section.bgImage} alt={section.title} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} backdrop-blur-sm`}></div>
                    <div className={`absolute inset-0 bg-gradient-to-t ${section.gradient} opacity-60`}></div>
                  </div>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.borderGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {section.chars.map((char, idx) => (
                      <motion.span key={idx} className={`absolute text-4xl font-bold ${section.textColor} opacity-30 arabic-float`} style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%`, animationDelay: `${idx * 0.5}s`, animationDuration: `${6 + Math.random() * 3}s` }}>
                        {char}
                      </motion.span>
                    ))}
                  </div>
                  <div className="absolute inset-0 p-8 z-10 flex flex-col justify-between">
                    <div className={`${section.textColor} group-hover:scale-110 transition-transform duration-300 self-end`}>{section.icon}</div>
                    <div className="text-right">
                      <h3 className={`text-3xl font-bold ${section.textColor} ${section.hoverTextColor} transition-colors duration-300 mb-2 arabic-glow`}>{section.title}</h3>
                      <p className="text-white/70 text-sm">{section.subtitle}</p>
                      <motion.div className={`mt-4 h-1 bg-gradient-to-l ${section.borderGradient} rounded-full`} initial={{ width: 0 }} whileHover={{ width: '100%' }} transition={{ duration: 0.3 }} />
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ArabicLanguagePlatform;
