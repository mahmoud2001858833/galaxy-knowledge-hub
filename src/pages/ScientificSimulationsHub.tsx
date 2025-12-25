import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Info, Atom, Zap, Sparkles, Waves, Beaker, Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, FlaskConical, Battery, Microscope, Heart, Rocket, Mountain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

const ScientificSimulationsHub = () => {
  const navigate = useNavigate();
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'الكل', icon: '🔬' },
    { id: 'physics', name: 'الفيزياء', icon: '⚛️' },
    { id: 'chemistry', name: 'الكيمياء', icon: '🧪' },
    { id: 'biology', name: 'الأحياء', icon: '🧬' },
    { id: 'astronomy', name: 'الفلك', icon: '🌌' },
    { id: 'math', name: 'الرياضيات', icon: '📐' },
    { id: 'electronics', name: 'الإلكترونيات', icon: '💡' },
  ];

  const simulations: Simulation[] = [
    {
      id: 'blackbody-radiation',
      title: 'إشعاع الجسم الأسود',
      description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع الطيف المرئي وأدوات حسابية',
      icon: <Atom className="w-8 h-8" />,
      color: 'from-purple-600 to-blue-600',
      route: '/simulation/blackbody-radiation',
      category: 'physics',
      features: ['التمثيل البياني', 'حاسبات الطاقة', 'مساعد ذكي']
    },
    {
      id: 'build-atom',
      title: 'بناء الذرة',
      description: 'بناء الذرات من خلال سحب وإفلات الجسيمات الذرية',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-orange-600 to-red-600',
      route: '/simulation/build-atom',
      category: 'physics',
      features: ['سحب وإفلات', 'تحديد العنصر تلقائياً', 'معلومات تفصيلية']
    },
    {
      id: 'lhc-simulation',
      title: 'مصادم الهدرونات الكبير',
      description: 'محاكاة متقدمة لمصادم الهدرونات مع تصادمات البروتونات',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-cyan-500 to-purple-600',
      route: '/lhc-simulation',
      category: 'physics',
      features: ['تسريع الجسيمات', 'كشف البوزونات', 'طاقة 13 TeV']
    },
    {
      id: 'electromagnetic-waves',
      title: 'الموجات الكهرومغناطيسية',
      description: 'استكشاف الطيف الكهرومغناطيسي الكامل',
      icon: <Waves className="w-8 h-8" />,
      color: 'from-red-500 to-purple-600',
      route: '/electromagnetic-waves',
      category: 'physics',
      features: ['الطيف الكامل', 'التحكم بالتردد', 'تطبيقات عملية']
    },
    {
      id: 'nuclear-reactions',
      title: 'التفاعلات النووية',
      description: 'محاكاة الانشطار والاندماج النووي',
      icon: <Atom className="w-8 h-8" />,
      color: 'from-green-500 to-blue-500',
      route: '/nuclear-reactions',
      category: 'physics',
      features: ['انشطار اليورانيوم', 'اندماج الديوتيريوم', 'مقارنة الطاقة']
    },
    {
      id: 'chemical-reactions',
      title: 'التفاعلات الكيميائية 3D',
      description: 'محاكاة تفاعلية ثلاثية الأبعاد للتفاعلات الكيميائية',
      icon: <Beaker className="w-8 h-8" />,
      color: 'from-purple-500 to-blue-500',
      route: '/chemical-reactions',
      category: 'chemistry',
      features: ['30+ تفاعل', 'رسوم 3D', 'كسر الروابط']
    },
    {
      id: 'analytical-chemistry',
      title: 'الكيمياء التحليلية',
      description: 'المعايرة وقياس pH والكروماتوغرافيا',
      icon: <FlaskConical className="w-8 h-8" />,
      color: 'from-emerald-600 to-teal-500',
      route: '/simulation/analytical-chemistry',
      category: 'chemistry',
      features: ['معايرة حمض-قاعدة', 'قياس pH', 'التحليل الطيفي']
    },
    {
      id: 'electrochemistry',
      title: 'الكيمياء الكهربائية',
      description: 'الخلايا الجلفانية والتحليل الكهربائي',
      icon: <Battery className="w-8 h-8" />,
      color: 'from-amber-600 to-yellow-500',
      route: '/simulation/electrochemistry',
      category: 'chemistry',
      features: ['الخلايا الجلفانية', 'التحليل الكهربائي', 'خلايا الوقود']
    },
    {
      id: 'genetics-lab',
      title: 'مختبر الوراثة',
      description: 'مربع بونيت وتضاعف DNA',
      icon: <Dna className="w-8 h-8" />,
      color: 'from-pink-500 to-red-500',
      route: '/simulation/genetics-lab',
      category: 'biology',
      features: ['مربع بونيت', 'تضاعف DNA', 'الطفرات']
    },
    {
      id: 'molecular-biology',
      title: 'البيولوجيا الجزيئية',
      description: 'تضاعف DNA والنسخ والترجمة',
      icon: <Microscope className="w-8 h-8" />,
      color: 'from-violet-600 to-fuchsia-500',
      route: '/simulation/molecular-biology',
      category: 'biology',
      features: ['تضاعف DNA', 'النسخ', 'PCR']
    },
    {
      id: 'human-body',
      title: 'جسم الإنسان',
      description: 'استكشاف أجهزة الجسم البشري',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-red-600 to-pink-500',
      route: '/simulation/human-body',
      category: 'biology',
      features: ['الجهاز الدوري', 'التنفسي', 'العصبي']
    },
    {
      id: 'ecosystem',
      title: 'النظام البيئي',
      description: 'نظام بيئي حي مع السلسلة الغذائية',
      icon: <TreeDeciduous className="w-8 h-8" />,
      color: 'from-green-600 to-lime-500',
      route: '/simulation/ecosystem',
      category: 'biology',
      features: ['السلسلة الغذائية', 'التعداد السكاني', 'العوامل البيئية']
    },
    {
      id: 'solar-system',
      title: 'النظام الشمسي 3D',
      description: 'محاكاة 3D كاملة للنظام الشمسي',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-indigo-500 to-pink-500',
      route: '/simulation/solar-system-3d',
      category: 'astronomy',
      features: ['تحكم 360°', 'معلومات الكواكب', 'حزام الكويكبات']
    },
    {
      id: 'advanced-astronomy',
      title: 'الفلك المتقدم',
      description: 'الكسوف والخسوف وأطوار القمر',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-indigo-600 to-purple-500',
      route: '/simulation/advanced-astronomy',
      category: 'astronomy',
      features: ['كسوف الشمس', 'خسوف القمر', 'قوانين كبلر']
    },
    {
      id: 'fourier-series',
      title: 'سلسلة فورييه',
      description: 'حساب وتمثيل سلسلة فورييه',
      icon: <Activity className="w-8 h-8" />,
      color: 'from-indigo-500 to-pink-600',
      route: '/fourier-series',
      category: 'math',
      features: ['دوال قطعية', 'ظاهرة غيبس', 'أنيميشن']
    },
    {
      id: '3d-function-visualizer',
      title: 'الدوال ثلاثية الأبعاد',
      description: 'عرض الدوال الرياضية في الفضاء 3D',
      icon: <Box className="w-8 h-8" />,
      color: 'from-emerald-500 to-cyan-600',
      route: '/3d-function-visualizer',
      category: 'math',
      features: ['عرض 1D/2D/3D', 'تدوير تفاعلي', '15+ مثال']
    },
    {
      id: 'circuit-builder',
      title: 'بناء الدوائر الكهربائية',
      description: 'مختبر افتراضي لبناء الدوائر',
      icon: <Cpu className="w-8 h-8" />,
      color: 'from-blue-500 to-teal-500',
      route: '/simulation/circuit-builder-advanced',
      category: 'electronics',
      features: ['سحب وإفلات', '9+ مكونات', 'تحليل حي']
    },
    {
      id: 'digital-electronics',
      title: 'الإلكترونيات الرقمية',
      description: 'بوابات المنطق والعدادات',
      icon: <Cpu className="w-8 h-8" />,
      color: 'from-slate-600 to-zinc-500',
      route: '/simulation/digital-electronics',
      category: 'electronics',
      features: ['بوابات المنطق', 'الجامع النصفي', 'خلية الذاكرة']
    },
    {
      id: 'electromagnetism',
      title: 'الكهرومغناطيسية',
      description: 'المجال المغناطيسي والحث الكهرومغناطيسي',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-purple-600 to-cyan-500',
      route: '/simulation/electromagnetism',
      category: 'physics',
      features: ['المجال المغناطيسي', 'الملفات', 'البوصلات']
    },
    {
      id: 'waves-sound',
      title: 'الموجات والصوت',
      description: 'محاكاة الموجات الصوتية وتأثير دوبلر',
      icon: <Waves className="w-8 h-8" />,
      color: 'from-green-600 to-blue-500',
      route: '/simulation/waves-sound',
      category: 'physics',
      features: ['تأثير دوبلر', 'تداخل الموجات', 'تشغيل الصوت']
    },
    {
      id: 'optics-lab',
      title: 'مختبر البصريات',
      description: 'الأشعة الضوئية مع العدسات والمرايا',
      icon: <Sun className="w-8 h-8" />,
      color: 'from-yellow-500 to-red-500',
      route: '/simulation/optics-lab',
      category: 'physics',
      features: ['العدسات', 'المرايا', 'المناشير']
    },
    {
      id: 'projectile-motion',
      title: 'حركة المقذوفات',
      description: 'محاكاة حركة المقذوفات والبندول',
      icon: <Target className="w-8 h-8" />,
      color: 'from-green-500 to-teal-500',
      route: '/simulation/projectile-motion',
      category: 'physics',
      features: ['زوايا مختلفة', 'البندول', 'مقاومة الهواء']
    },
    {
      id: 'quantum-mechanics',
      title: 'ميكانيكا الكم',
      description: 'الشق المزدوج والنفق الكمي',
      icon: <Atom className="w-8 h-8" />,
      color: 'from-pink-600 to-indigo-500',
      route: '/simulation/quantum-mechanics',
      category: 'physics',
      features: ['الشق المزدوج', 'النفق الكمي', 'التراكب']
    },
    {
      id: 'earth-sciences',
      title: 'علوم الأرض',
      description: 'الزلازل والبراكين والصفائح التكتونية',
      icon: <Mountain className="w-8 h-8" />,
      color: 'from-amber-700 to-red-600',
      route: '/simulation/earth-sciences',
      category: 'physics',
      features: ['الزلازل', 'البراكين', 'الصفائح']
    },
    {
      id: 'rocket-science',
      title: 'علوم الفضاء',
      description: 'إطلاق الصواريخ والمدارات الفضائية',
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-sky-600 to-indigo-500',
      route: '/simulation/rocket-science',
      category: 'astronomy',
      features: ['إطلاق الصواريخ', 'المدارات', 'الهبوط']
    },
  ];

  const filteredSimulations = activeCategory === 'all' 
    ? simulations 
    : simulations.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      <StarField />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/education')}
              className="mb-6 text-white/70 hover:text-white"
            >
              <ArrowLeft className="ml-2 w-5 h-5" />
              العودة للمنصات التعليمية
            </Button>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                التجارب العلمية التفاعلية
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              اكتشف عالم العلوم من خلال محاكاة تفاعلية ثلاثية الأبعاد
            </p>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </motion.div>

          {/* Simulations Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredSimulations.map((sim, index) => (
                <motion.div
                  key={sim.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedSimulation(sim)}
                  className="group cursor-pointer"
                >
                  <div className={`relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br ${sim.color} p-1`}>
                    <div className="absolute inset-[1px] bg-slate-900/90 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-sm">
                      {/* Icon */}
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${sim.color} text-white`}>
                          {sim.icon}
                        </div>
                        <span className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                          {categories.find(c => c.id === sim.category)?.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                          {sim.title}
                        </h3>
                        <p className="text-sm text-white/60 line-clamp-2">
                          {sim.description}
                        </p>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(sim.route);
                          }}
                          className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          المحاكاة
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSimulation(sim);
                          }}
                          className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          معلومات
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Modal */}
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
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10"
            >
              <button
                onClick={() => setSelectedSimulation(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${selectedSimulation.color} text-white mb-6`}>
                {selectedSimulation.icon}
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                {selectedSimulation.title}
              </h2>

              <p className="text-white/70 mb-6">
                {selectedSimulation.description}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">المميزات:</h3>
                <ul className="space-y-2">
                  {selectedSimulation.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(selectedSimulation.route)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                >
                  <Play className="w-5 h-5 ml-2" />
                  بدء المحاكاة
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSimulation(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ScientificSimulationsHub;
