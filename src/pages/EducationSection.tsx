import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, GraduationCap, Play, Info, X, Atom, Zap, Sparkles, Waves, Beaker, Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, FlaskConical, Battery, Microscope, Heart, Rocket, Mountain, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import educationBg from '@/assets/education-section.jpg';

const clickSound = '/message-notification.mp3';

interface Simulation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  category: string;
  features: string[];
}

const EducationSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showExperiments, setShowExperiments] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  const { t, dir } = useLanguage();

  const platforms = [
    {
      title: t.platformCategories.environmental,
      icon: "🌱",
      description: t.platformCategories.environmentalDescription,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      link: "/environmental-sustainability"
    },
    {
      title: "بتك BTEC",
      icon: "💻",
      description: "منصة التعليم المهني - تكنولوجيا المعلومات، البرمجة، والتطوير",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-orange-600/20 to-red-600/20",
      borderColor: "border-orange-500/30",
      link: "/btec"
    },
    {
      title: t.platformCategories.literary,
      icon: "📚",
      description: t.platformCategories.literaryDescription,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      link: "/literary-platforms"
    },
    {
      title: t.platformCategories.scientific,
      icon: "🔬",
      description: t.platformCategories.scientificDescription,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      link: "/scientific-platforms"
    },
  ];

  // قائمة التجارب العلمية
  const simulations: Simulation[] = [
    {
      id: 'blackbody-radiation',
      title: 'إشعاع الجسم الأسود',
      description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود',
      icon: <Atom className="w-6 h-6" />,
      color: 'from-purple-600 to-blue-600',
      route: '/simulation/blackbody-radiation',
      category: 'physics',
      features: ['التمثيل البياني', 'حاسبات الطاقة', 'مساعد ذكي']
    },
    {
      id: 'build-atom',
      title: 'بناء الذرة',
      description: 'بناء الذرات من خلال سحب وإفلات الجسيمات',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-orange-600 to-red-600',
      route: '/simulation/build-atom',
      category: 'physics',
      features: ['سحب وإفلات', 'تحديد العنصر تلقائياً', 'معلومات تفصيلية']
    },
    {
      id: 'lhc-simulation',
      title: 'مصادم الهدرونات الكبير',
      description: 'محاكاة متقدمة لمصادم الهدرونات',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-cyan-500 to-purple-600',
      route: '/lhc-simulation',
      category: 'physics',
      features: ['تسريع الجسيمات', 'كشف البوزونات', 'طاقة 13 TeV']
    },
    {
      id: 'electromagnetic-waves',
      title: 'الموجات الكهرومغناطيسية',
      description: 'استكشاف الطيف الكهرومغناطيسي الكامل',
      icon: <Waves className="w-6 h-6" />,
      color: 'from-red-500 to-purple-600',
      route: '/electromagnetic-waves',
      category: 'physics',
      features: ['الطيف الكامل', 'التحكم بالتردد', 'تطبيقات عملية']
    },
    {
      id: 'nuclear-reactions',
      title: 'التفاعلات النووية',
      description: 'محاكاة الانشطار والاندماج النووي',
      icon: <Atom className="w-6 h-6" />,
      color: 'from-green-500 to-blue-500',
      route: '/nuclear-reactions',
      category: 'physics',
      features: ['انشطار اليورانيوم', 'اندماج الديوتيريوم', 'مقارنة الطاقة']
    },
    {
      id: 'chemical-reactions',
      title: 'التفاعلات الكيميائية 3D',
      description: 'محاكاة تفاعلية ثلاثية الأبعاد للتفاعلات',
      icon: <Beaker className="w-6 h-6" />,
      color: 'from-purple-500 to-blue-500',
      route: '/chemical-reactions',
      category: 'chemistry',
      features: ['30+ تفاعل', 'رسوم 3D', 'كسر الروابط']
    },
    {
      id: 'analytical-chemistry',
      title: 'الكيمياء التحليلية',
      description: 'المعايرة وقياس pH والكروماتوغرافيا',
      icon: <FlaskConical className="w-6 h-6" />,
      color: 'from-emerald-600 to-teal-500',
      route: '/simulation/analytical-chemistry',
      category: 'chemistry',
      features: ['معايرة حمض-قاعدة', 'قياس pH', 'التحليل الطيفي']
    },
    {
      id: 'electrochemistry',
      title: 'الكيمياء الكهربائية',
      description: 'الخلايا الجلفانية والتحليل الكهربائي',
      icon: <Battery className="w-6 h-6" />,
      color: 'from-amber-600 to-yellow-500',
      route: '/simulation/electrochemistry',
      category: 'chemistry',
      features: ['الخلايا الجلفانية', 'التحليل الكهربائي', 'خلايا الوقود']
    },
    {
      id: 'genetics-lab',
      title: 'مختبر الوراثة',
      description: 'مربع بونيت وتضاعف DNA',
      icon: <Dna className="w-6 h-6" />,
      color: 'from-pink-500 to-red-500',
      route: '/simulation/genetics-lab',
      category: 'biology',
      features: ['مربع بونيت', 'تضاعف DNA', 'الطفرات']
    },
    {
      id: 'molecular-biology',
      title: 'البيولوجيا الجزيئية',
      description: 'تضاعف DNA والنسخ والترجمة',
      icon: <Microscope className="w-6 h-6" />,
      color: 'from-violet-600 to-fuchsia-500',
      route: '/simulation/molecular-biology',
      category: 'biology',
      features: ['تضاعف DNA', 'النسخ', 'PCR']
    },
    {
      id: 'human-body',
      title: 'جسم الإنسان',
      description: 'استكشاف أجهزة الجسم البشري',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-600 to-pink-500',
      route: '/simulation/human-body',
      category: 'biology',
      features: ['الجهاز الدوري', 'التنفسي', 'العصبي']
    },
    {
      id: 'ecosystem',
      title: 'النظام البيئي',
      description: 'نظام بيئي حي مع السلسلة الغذائية',
      icon: <TreeDeciduous className="w-6 h-6" />,
      color: 'from-green-600 to-lime-500',
      route: '/simulation/ecosystem',
      category: 'biology',
      features: ['السلسلة الغذائية', 'التعداد السكاني', 'العوامل البيئية']
    },
    {
      id: 'solar-system',
      title: 'النظام الشمسي 3D',
      description: 'محاكاة 3D كاملة للنظام الشمسي',
      icon: <Globe className="w-6 h-6" />,
      color: 'from-indigo-500 to-pink-500',
      route: '/simulation/solar-system-3d',
      category: 'astronomy',
      features: ['تحكم 360°', 'معلومات الكواكب', 'حزام الكويكبات']
    },
    {
      id: 'circuit-builder',
      title: 'بناء الدوائر الكهربائية',
      description: 'مختبر افتراضي لبناء الدوائر',
      icon: <Cpu className="w-6 h-6" />,
      color: 'from-blue-500 to-teal-500',
      route: '/simulation/circuit-builder-advanced',
      category: 'electronics',
      features: ['سحب وإفلات', '9+ مكونات', 'تحليل حي']
    },
    {
      id: 'optics-lab',
      title: 'مختبر البصريات',
      description: 'الأشعة الضوئية مع العدسات والمرايا',
      icon: <Sun className="w-6 h-6" />,
      color: 'from-yellow-500 to-red-500',
      route: '/simulation/optics-lab',
      category: 'physics',
      features: ['العدسات', 'المرايا', 'المناشير']
    },
    {
      id: 'projectile-motion',
      title: 'حركة المقذوفات',
      description: 'محاكاة حركة المقذوفات والبندول',
      icon: <Target className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      route: '/simulation/projectile-motion',
      category: 'physics',
      features: ['زوايا مختلفة', 'البندول', 'مقاومة الهواء']
    },
    {
      id: 'quantum-mechanics',
      title: 'ميكانيكا الكم',
      description: 'الشق المزدوج والنفق الكمي',
      icon: <Atom className="w-6 h-6" />,
      color: 'from-pink-600 to-indigo-500',
      route: '/simulation/quantum-mechanics',
      category: 'physics',
      features: ['الشق المزدوج', 'النفق الكمي', 'التراكب']
    },
    {
      id: 'rocket-science',
      title: 'علوم الفضاء',
      description: 'إطلاق الصواريخ والمدارات الفضائية',
      icon: <Rocket className="w-6 h-6" />,
      color: 'from-sky-600 to-indigo-500',
      route: '/simulation/rocket-science',
      category: 'astronomy',
      features: ['إطلاق الصواريخ', 'المدارات', 'الهبوط']
    },
  ];

  return (
    <div className="min-h-screen relative" dir={dir}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={educationBg} 
          alt="Education Section"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/85 to-blue-950/90" />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      {/* Platforms Grid */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              قسم التعليم
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.5 + index * 0.1,
                }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  playSound();
                  navigate(platform.link);
                }}
                className={`group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer border-2 ${platform.borderColor} transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40`}
              >
                {/* Background Image */}
                <motion.div 
                  className="absolute inset-0"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.6 }}
                >
                  <img 
                    src={platform.image} 
                    alt={platform.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-90`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/60 to-transparent" />
                </motion.div>

                {/* Content */}
                <div className="absolute inset-0 p-6 z-10 flex flex-col justify-end items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="text-7xl mb-4 filter drop-shadow-2xl"
                  >
                    {platform.icon}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">
                    {platform.title}
                  </h3>

                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    {platform.description}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600/50 to-emerald-600/50 border border-green-400/50 rounded-full text-white text-sm font-semibold backdrop-blur-sm"
                  >
                    <span>استكشف</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* قسم التجارب العلمية الكامل */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            {/* عنوان قسم التجارب */}
            <motion.div
              onClick={() => {
                playSound();
                setShowExperiments(!showExperiments);
              }}
              whileHover={{ scale: 1.02 }}
              className="relative cursor-pointer rounded-3xl overflow-hidden border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
              
              <div className="relative z-10 p-8 flex flex-col items-center text-center">
                <motion.div
                  animate={{ rotate: showExperiments ? 180 : 0 }}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <ChevronDown className="w-6 h-6 text-white" />
                </motion.div>

                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/30">
                  <Atom className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-4xl font-bold text-white mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    التجارب العلمية التفاعلية
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl">
                  محاكاة وتجارب علمية تفاعلية في الفيزياء والكيمياء والأحياء
                </p>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mt-6 text-cyan-400"
                >
                  <span className="text-sm">اضغط لعرض التجارب</span>
                </motion.div>
              </div>
            </motion.div>

            {/* شبكة التجارب العلمية */}
            <AnimatePresence>
              {showExperiments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {simulations.map((sim, index) => (
                      <motion.div
                        key={sim.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -5, scale: 1.05 }}
                        className="group cursor-pointer"
                      >
                        <div className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${sim.color} p-[2px]`}>
                          <div className="absolute inset-[2px] bg-slate-900/95 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
                            {/* Icon */}
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${sim.color} text-white mb-2 shadow-lg`}>
                              {sim.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-xs font-bold text-white text-center mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                              {sim.title}
                            </h3>

                            {/* Hover Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSound();
                                  navigate(sim.route);
                                }}
                                className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                                title="الدخول للتجربة"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSound();
                                  setSelectedSimulation(sim);
                                }}
                                className="p-1.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors"
                                title="معلومات"
                              >
                                <Info className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* زر عرض كل التجارب */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mt-8"
                  >
                    <button
                      onClick={() => {
                        playSound();
                        navigate('/scientific-simulations');
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>عرض جميع التجارب</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Modal for Simulation Info */}
      <AnimatePresence>
        {selectedSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedSimulation(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br ${selectedSimulation.color} p-1`}
            >
              <div className="bg-slate-900 rounded-3xl p-6">
                {/* Close button */}
                <button
                  onClick={() => setSelectedSimulation(null)}
                  className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Content */}
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${selectedSimulation.color} text-white mb-4`}>
                    {selectedSimulation.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedSimulation.title}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {selectedSimulation.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {selectedSimulation.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        playSound();
                        navigate(selectedSimulation.route);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      ابدأ التجربة
                    </button>
                    <button
                      onClick={() => setSelectedSimulation(null)}
                      className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default EducationSection;