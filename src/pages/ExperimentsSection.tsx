import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Play, Info, Atom, Zap, Sparkles, Waves, Beaker, Activity, Box, Sun, Cpu, Target, Globe, Dna, TreeDeciduous, FlaskConical, Battery, Microscope, Heart, Rocket, Eye, Layers, Mountain, Flame, Droplets, Circle, Clock, Aperture } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';

const clickSound = '/message-notification.mp3';

interface Simulation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  features: string[];
}

const ExperimentsSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const simulations: Simulation[] = [
    { id: 'blackbody-radiation', title: 'إشعاع الجسم الأسود', description: 'محاكاة تفاعلية متطورة لإشعاع الجسم الأسود مع الطيف المرئي وأدوات حسابية ومساعد ذكي', icon: <Atom className="w-6 h-6" />, color: 'from-purple-600 to-blue-600', route: '/simulation/blackbody-radiation', features: ['التمثيل البياني مع الطيف المرئي', 'حاسبات الطول الموجي والتردد والطاقة', 'مساعد ذكي للفيزياء'] },
    { id: 'build-atom', title: 'بناء الذرة', description: 'بناء الذرات من خلال سحب وإفلات الجسيمات الذرية واكتشاف خصائص العناصر', icon: <Zap className="w-6 h-6" />, color: 'from-orange-600 to-red-600', route: '/simulation/build-atom', features: ['سحب وإفلات البروتونات والنيوترونات', 'تحديد العنصر تلقائياً', 'واجهة ثلاثية الأبعاد'] },
    { id: 'lhc-simulation', title: 'مصادم الهدرونات الكبير', description: 'محاكاة متقدمة تفاعلية لمصادم الهدرونات الكبير مع تصادمات البروتونات', icon: <Sparkles className="w-6 h-6" />, color: 'from-cyan-500 to-purple-600', route: '/lhc-simulation', features: ['تسريع الجسيمات', 'تصادمات 13 TeV', 'كشف البوزونات'] },
    { id: 'electromagnetic-waves', title: 'الموجات الكهرومغناطيسية', description: 'استكشاف الطيف الكهرومغناطيسي الكامل من موجات الراديو إلى أشعة غاما', icon: <Waves className="w-6 h-6" />, color: 'from-red-500 to-purple-600', route: '/electromagnetic-waves', features: ['الطيف الكامل بالألوان الحقيقية', 'التحكم بالتردد والطول الموجي', 'تطبيقات عملية'] },
    { id: 'nuclear-reactions', title: 'التفاعلات النووية', description: 'محاكاة الانشطار والاندماج النووي مع تأثيرات بصرية مذهلة', icon: <Atom className="w-6 h-6" />, color: 'from-green-500 to-blue-500', route: '/nuclear-reactions', features: ['انشطار اليورانيوم-235', 'اندماج الديوتيريوم-تريتيوم', 'مقارنة الطاقة'] },
    { id: 'chemical-reactions', title: 'التفاعلات الكيميائية 3D', description: 'محاكاة تفاعلية ثلاثية الأبعاد للتفاعلات الكيميائية', icon: <Beaker className="w-6 h-6" />, color: 'from-purple-500 to-blue-500', route: '/chemical-reactions', features: ['30+ تفاعل كيميائي', 'رسوم 3D متقدمة', 'تصور الروابط الكيميائية'] },
    { id: 'fourier-series', title: 'سلسلة فورييه', description: 'حساب وتمثيل سلسلة فورييه مع كشف ظاهرة غيبس', icon: <Activity className="w-6 h-6" />, color: 'from-indigo-500 to-pink-600', route: '/fourier-series', features: ['دوال عادية وقطعية', '10+ أمثلة جاهزة', 'أنيميشن تطور التقريب'] },
    { id: '3d-function-visualizer', title: 'الدوال ثلاثية الأبعاد', description: 'عرض الدوال الرياضية في الفضاء ثلاثي الأبعاد', icon: <Box className="w-6 h-6" />, color: 'from-emerald-500 to-cyan-600', route: '/3d-function-visualizer', features: ['عرض 1D, 2D, 3D', 'تدوير تفاعلي', '15+ مثال جاهز'] },
    { id: 'optics-lab', title: 'مختبر البصريات', description: 'محاكاة تفاعلية للأشعة الضوئية مع العدسات والمرايا والمناشير', icon: <Sun className="w-6 h-6" />, color: 'from-yellow-500 to-red-500', route: '/simulation/optics-lab', features: ['عدسات محدبة ومقعرة', 'المرايا والمناشير', 'قوانين الانكسار'] },
    { id: 'circuit-builder', title: 'بناء الدوائر الكهربائية', description: 'مختبر افتراضي متقدم لبناء الدوائر مع نظام أسلاك حقيقي', icon: <Cpu className="w-6 h-6" />, color: 'from-blue-500 to-teal-500', route: '/simulation/circuit-builder-advanced', features: ['نظام أسلاك حقيقي', '9+ مكونات', 'تحليل حي للتيار'] },
    { id: 'projectile-motion', title: 'حركة المقذوفات', description: 'محاكاة شاملة لحركة المقذوفات والبندول والسقوط الحر', icon: <Target className="w-6 h-6" />, color: 'from-green-500 to-teal-500', route: '/simulation/projectile-motion', features: ['زوايا مختلفة', 'البندول البسيط', 'مقاومة الهواء'] },
    { id: 'solar-system', title: 'النظام الشمسي 3D', description: 'محاكاة 3D كاملة مع React Three Fiber وتحكم كاميرا 360°', icon: <Globe className="w-6 h-6" />, color: 'from-indigo-500 to-pink-500', route: '/simulation/solar-system-3d', features: ['تحكم كاميرا 360°', 'شمس متوهجة', 'حلقات زحل'] },
    { id: 'genetics-lab', title: 'مختبر الوراثة', description: 'محاكاة تفاعلية لمربع بونيت وتضاعف DNA والطفرات الجينية', icon: <Dna className="w-6 h-6" />, color: 'from-pink-500 to-red-500', route: '/simulation/genetics-lab', features: ['مربع بونيت', 'تضاعف DNA', 'الطفرات الجينية'] },
    { id: 'ecosystem', title: 'النظام البيئي', description: 'نظام بيئي حي مع كائنات متحركة وتوازن السكان', icon: <TreeDeciduous className="w-6 h-6" />, color: 'from-green-600 to-lime-500', route: '/simulation/ecosystem', features: ['السلسلة الغذائية', 'التعداد السكاني', 'الكوارث الطبيعية'] },
    { id: 'electromagnetism', title: 'الكهرومغناطيسية', description: 'محاكاة المجال المغناطيسي والحث الكهرومغناطيسي', icon: <Zap className="w-6 h-6" />, color: 'from-purple-600 to-cyan-500', route: '/simulation/electromagnetism', features: ['المجال حول الأسلاك', 'الملفات', 'قاعدة اليد اليمنى'] },
    { id: 'waves-sound', title: 'الموجات والصوت', description: 'محاكاة الموجات الصوتية وتأثير دوبلر والتداخل', icon: <Waves className="w-6 h-6" />, color: 'from-green-600 to-blue-500', route: '/simulation/waves-sound', features: ['أنواع الموجات', 'تأثير دوبلر', 'تداخل الموجات'] },
    { id: 'static-electricity', title: 'الكهرباء الساكنة', description: 'قانون كولوم والمجال الكهربائي ومولد فان دي غراف', icon: <Sparkles className="w-6 h-6" />, color: 'from-yellow-600 to-red-500', route: '/simulation/static-electricity', features: ['قانون كولوم', 'خطوط المجال', 'مولد فان دي غراف'] },
    { id: 'advanced-astronomy', title: 'الفلك المتقدم', description: 'محاكاة الكسوف والخسوف وأطوار القمر والمدارات', icon: <Globe className="w-6 h-6" />, color: 'from-indigo-600 to-pink-500', route: '/simulation/advanced-astronomy', features: ['كسوف الشمس', 'خسوف القمر', 'قوانين كبلر'] },
    { id: 'quantum-mechanics', title: 'ميكانيكا الكم', description: 'تجربة الشق المزدوج والنفق الكمي والتراكب', icon: <Atom className="w-6 h-6" />, color: 'from-pink-600 to-indigo-500', route: '/simulation/quantum-mechanics', features: ['الشق المزدوج', 'النفق الكمي', 'التراكب الكمي'] },
    { id: 'analytical-chemistry', title: 'الكيمياء التحليلية', description: 'محاكاة المعايرة وقياس pH والكروماتوغرافيا', icon: <FlaskConical className="w-6 h-6" />, color: 'from-emerald-600 to-teal-500', route: '/simulation/analytical-chemistry', features: ['معايرة حمض-قاعدة', 'قياس pH', 'التحليل الطيفي'] },
    { id: 'electrochemistry', title: 'الكيمياء الكهربائية', description: 'الخلايا الجلفانية والتحليل الكهربائي والتآكل', icon: <Battery className="w-6 h-6" />, color: 'from-amber-600 to-yellow-500', route: '/simulation/electrochemistry', features: ['الخلايا الجلفانية', 'التحليل الكهربائي', 'خلايا الوقود'] },
    { id: 'molecular-biology', title: 'البيولوجيا الجزيئية', description: 'تضاعف DNA والنسخ والترجمة وتفاعل PCR', icon: <Microscope className="w-6 h-6" />, color: 'from-violet-600 to-fuchsia-500', route: '/simulation/molecular-biology', features: ['تضاعف DNA', 'النسخ والترجمة', 'تفاعل PCR'] },
    { id: 'human-body', title: 'جسم الإنسان', description: 'استكشاف أجهزة الجسم: الدوران، التنفس، العصبي، الهضمي', icon: <Heart className="w-6 h-6" />, color: 'from-red-600 to-pink-500', route: '/simulation/human-body', features: ['الجهاز الدوري', 'الجهاز التنفسي', 'الجهاز العصبي'] },
    { id: 'advanced-nuclear', title: 'الفيزياء النووية المتقدمة', description: 'الاضمحلال الإشعاعي والانشطار والاندماج وعمر النصف', icon: <Atom className="w-6 h-6" />, color: 'from-lime-600 to-emerald-500', route: '/simulation/advanced-nuclear', features: ['اضمحلال ألفا وبيتا', 'الانشطار النووي', 'عمر النصف'] },
    { id: 'digital-electronics', title: 'الإلكترونيات الرقمية', description: 'بوابات المنطق والجامعات والعدادات وخلايا الذاكرة', icon: <Cpu className="w-6 h-6" />, color: 'from-slate-600 to-zinc-500', route: '/simulation/digital-electronics', features: ['بوابات AND, OR, NOT', 'الجامع النصفي', 'عداد 8-بت'] },
    { id: 'earth-sciences', title: 'علوم الأرض', description: 'محاكاة الزلازل والبراكين والصفائح التكتونية', icon: <Mountain className="w-6 h-6" />, color: 'from-amber-700 to-red-600', route: '/simulation/earth-sciences', features: ['محاكاة الزلازل', 'ثوران البراكين', 'دورة الصخور'] },
    { id: 'rocket-science', title: 'علوم الصواريخ والفضاء', description: 'إطلاق الصواريخ والمدارات الفضائية وهبوط المركبات', icon: <Rocket className="w-6 h-6" />, color: 'from-sky-600 to-indigo-500', route: '/simulation/rocket-science', features: ['إطلاق الصاروخ', 'المدارات الفضائية', 'الهبوط'] },
    { id: 'advanced-optics', title: 'البصريات المتقدمة', description: 'تشتت المنشور والعدسات والتداخل والاستقطاب', icon: <Eye className="w-6 h-6" />, color: 'from-cyan-600 to-emerald-500', route: '/simulation/advanced-optics', features: ['تشتت الضوء', 'تداخل الشقين', 'الاستقطاب'] },
    { id: 'materials-science', title: 'علوم المواد', description: 'البنية البلورية والسبائك واختبارات الإجهاد', icon: <Layers className="w-6 h-6" />, color: 'from-stone-600 to-zinc-500', route: '/simulation/materials-science', features: ['البنية البلورية', 'تكوين السبائك', 'اختبار الإجهاد'] },
    { id: 'thermodynamics', title: 'الديناميكا الحرارية', description: 'محاكاة الغاز المثالي ومحرك كارنو وانتقال الحرارة', icon: <Flame className="w-6 h-6" />, color: 'from-orange-600 to-red-600', route: '/simulation/thermodynamics', features: ['الغاز المثالي', 'محرك كارنو', 'التوصيل والحمل والإشعاع'] },
    { id: 'fluid-mechanics', title: 'الموائع وقوى الطفو', description: 'قانون أرخميدس وباسكال وبرنولي مع محاكاة تفاعلية', icon: <Droplets className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', route: '/simulation/fluid-mechanics', features: ['قانون أرخميدس', 'قانون باسكال', 'معادلة برنولي'] },
    { id: 'circular-motion', title: 'الحركة الدائرية والجاذبية', description: 'حركة دائرية منتظمة وغير منتظمة ومدارات الأقمار الصناعية', icon: <Circle className="w-6 h-6" />, color: 'from-violet-500 to-purple-600', route: '/simulation/circular-motion', features: ['القوة المركزية', 'الأقمار الصناعية', 'حركة غير منتظمة'] },
    { id: 'special-relativity', title: 'النسبية الخاصة', description: 'تمدد الزمن وتقلص الطول وتكافؤ الكتلة والطاقة E=mc²', icon: <Clock className="w-6 h-6" />, color: 'from-yellow-500 to-orange-500', route: '/simulation/special-relativity', features: ['تمدد الزمن', 'تقلص الطول', 'E = mc²'] },
    { id: 'interference-diffraction', title: 'التداخل والحيود', description: 'تجربة يونج وحيود الشق الواحد وحلقات نيوتن', icon: <Aperture className="w-6 h-6" />, color: 'from-indigo-500 to-pink-500', route: '/simulation/interference-diffraction', features: ['الشق المزدوج', 'الشق الواحد', 'حلقات نيوتن'] },
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={200} />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      <main className="flex-1 relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 mx-auto"
            >
              <ArrowRight size={20} />
              العودة للرئيسية
            </button>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/30">
              <Atom className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                التجارب العلمية التفاعلية
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {simulations.length} تجربة علمية تفاعلية في الفيزياء والكيمياء والأحياء وعلوم الأرض والفضاء
            </p>
          </motion.div>

          {/* Experiments Grid - Premium Squares */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {simulations.map((sim, index) => (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, type: "spring", stiffness: 120 }}
                whileHover={{ y: -10, scale: 1.06 }}
                className="group perspective-1000"
              >
                <div className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${sim.color} p-[1.5px] shadow-lg shadow-black/30 group-hover:shadow-xl group-hover:shadow-cyan-500/20 transition-shadow duration-500`}>
                  {/* Animated border glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${sim.color} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 -z-10`} />
                  
                  <div className="absolute inset-[1.5px] bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-800/95 rounded-2xl p-3 flex flex-col items-center justify-between backdrop-blur-sm overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8" />
                    </div>

                    {/* Top section - Icon */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-2">
                      <motion.div 
                        className={`p-3 rounded-xl bg-gradient-to-br ${sim.color} text-white mb-3 shadow-lg ring-2 ring-white/10 group-hover:ring-white/25 transition-all duration-300`}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        {sim.icon}
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-[11px] font-bold text-white/90 text-center line-clamp-2 group-hover:text-white transition-colors leading-relaxed px-1">
                        {sim.title}
                      </h3>
                    </div>

                    {/* Bottom section - Action Buttons */}
                    <div className="flex gap-1.5 relative z-10 w-full pb-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound();
                          navigate(sim.route);
                        }}
                        className="flex-1 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all text-[9px] font-bold flex items-center justify-center gap-1 shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/40"
                      >
                        <Play className="w-2.5 h-2.5" />
                        استخدم
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound();
                          setSelectedSimulation(sim);
                        }}
                        className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-all text-[9px] font-bold flex items-center justify-center gap-1 border border-white/10 hover:border-white/25"
                      >
                        <Info className="w-2.5 h-2.5" />
                        معلومات
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

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
                <button
                  onClick={() => setSelectedSimulation(null)}
                  className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

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

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {selectedSimulation.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        playSound();
                        navigate(selectedSimulation.route);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      استخدم الآن
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

export default ExperimentsSection;
