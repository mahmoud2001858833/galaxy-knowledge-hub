import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  Brain, Bot, Leaf, Building2, Accessibility, 
  Sparkles, Users, BookOpen, Zap, ArrowLeft,
  Eye, Ear, Hand, Monitor, Mic, Volume2,
  GraduationCap, Trophy, Rocket, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const competitionTracks = [
  {
    id: 'ai',
    title: 'الذكاء الاصطناعي وتعلّم الآلة',
    subtitle: 'AI & Machine Learning',
    description: 'مساعد ذكي متعدد المهام، توليد صور بالذكاء الاصطناعي، تقييم رسومات تلقائي، مساعد برمجة ذكي، وتحليل صور تعليمية.',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    features: ['مساعد ذروة العلم الذكي', 'توليد صور AI', 'تقييم رسومات بالذكاء الاصطناعي', 'مساعد البرمجة الذكي'],
    link: '/falak-knowledge-ai',
  },
  {
    id: 'robotics',
    title: 'الروبوتات وتقنيات البناء',
    subtitle: 'Robotics & Construction',
    description: 'محاكاة تفاعلية لتقنيات البناء الروبوتي والطباعة ثلاثية الأبعاد مع مقارنات تفصيلية بين البناء التقليدي والذكي.',
    icon: Bot,
    color: 'from-cyan-500 to-blue-600',
    bgGlow: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    features: ['روبوت البناء التفاعلي', 'محاكاة الطباعة ثلاثية الأبعاد', 'مقارنة البناء التقليدي vs الروبوتي'],
    link: '/smart-city/robotic-construction',
  },
  {
    id: 'sustainability',
    title: 'التقنيات المستدامة والخضراء',
    subtitle: 'Sustainable & Green Tech',
    description: 'حاسبة البصمة الكربونية، مشاريع إعادة التدوير، مؤشر الاستدامة الشخصي، ونظام تنبؤ بيئي ذكي.',
    icon: Leaf,
    color: 'from-emerald-500 to-green-600',
    bgGlow: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    features: ['حاسبة الكربون', 'مؤشر الاستدامة الشخصي', 'مستشار إعادة التدوير الذكي', 'لوحة التنبؤ البيئي'],
    link: '/environmental-sustainability',
  },
  {
    id: 'architecture',
    title: 'مستقبل التصميم المعماري',
    subtitle: 'Future of Architecture',
    description: 'تصميم معماري ذكي يولّد اقتراحات تصميمية بالذكاء الاصطناعي مع تصميم داخلي تفاعلي وتوصيات ديناميكية.',
    icon: Building2,
    color: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    features: ['التصميم المعماري الذكي', 'التصميم الداخلي التفاعلي', 'توليد صور معمارية بـ AI'],
    link: '/smart-city',
  },
  {
    id: 'inclusive',
    title: 'التعلّم الدامج وتقنيات الإعاقة',
    subtitle: 'Inclusive Education & Assistive Tech',
    description: 'نظام شامل لإمكانية الوصول يدعم ذوي الإعاقات البصرية والسمعية والحركية والإدراكية مع تحويل النص لكلام والعكس.',
    icon: Accessibility,
    color: 'from-pink-500 to-rose-600',
    bgGlow: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    features: ['تحويل النص إلى كلام', 'الإدخال الصوتي', 'أوضاع تعلم مخصصة', 'لغة الإشارة', 'اختصارات لوحة المفاتيح'],
    link: '/sign-language',
  },
];

const stats = [
  { label: 'منصة تعليمية', value: '50+', icon: BookOpen },
  { label: 'محاكاة علمية', value: '40+', icon: Zap },
  { label: 'أداة ذكاء اصطناعي', value: '15+', icon: Brain },
  { label: 'مادة دراسية', value: '8+', icon: GraduationCap },
];

const techStack = [
  { name: 'React + TypeScript', desc: 'واجهة أمامية حديثة' },
  { name: 'Supabase', desc: 'قاعدة بيانات وتوثيق' },
  { name: 'Google Gemini AI', desc: 'ذكاء اصطناعي متقدم' },
  { name: 'Framer Motion', desc: 'حركات سلسة' },
  { name: 'Tailwind CSS', desc: 'تصميم متجاوب' },
  { name: 'Lovable AI', desc: 'بناء ذكي' },
];

const inclusiveFeatures = [
  { icon: Eye, title: 'الإعاقة البصرية', desc: 'تكبير النصوص، تباين عالي، قارئ شاشة' },
  { icon: Ear, title: 'الإعاقة السمعية', desc: 'ترجمة بلغة الإشارة، نصوص مرئية' },
  { icon: Hand, title: 'الإعاقة الحركية', desc: 'تنقل بلوحة المفاتيح، واجهة مبسطة' },
  { icon: Monitor, title: 'الإعاقة الإدراكية', desc: 'محتوى مبسّط، تعليمات واضحة' },
  { icon: Mic, title: 'الإدخال الصوتي', desc: 'تحويل الكلام إلى نص في كل المساعدين' },
  { icon: Volume2, title: 'النطق التلقائي', desc: 'قراءة النصوص بصوت عربي واضح' },
];

const GJUCompetition = () => {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir={dir}>
      <SEO
        title="ذروة العلم × GJU 3030 - مستقبل التكنولوجيا"
        description="مشاركة منصة ذروة العلم في مسابقة التقدّم التكنولوجي GJU 3030 تحت شعار مستقبل التكنولوجيا - الجامعة الألمانية الأردنية"
        keywords="GJU 3030, مسابقة, تكنولوجيا, ذروة العلم, مستقبل التكنولوجيا, الجامعة الألمانية الأردنية"
      />
      <StarField />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/3 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Competition Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-semibold">مسابقة التقدّم التكنولوجي GJU 3030</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-l from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  ذروة العلم
                </span>
                <br />
                <span className="text-white/90 text-3xl md:text-5xl">
                  × مستقبل التكنولوجيا
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-6 leading-relaxed">
                منصة تعليمية تفاعلية شاملة تدمج الذكاء الاصطناعي في كل جانب من جوانب التعلّم،
                <br className="hidden md:block" />
                من المحاكاة العلمية إلى التعلّم الدامج وتقنيات ذوي الإعاقة
              </p>

              <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-10">
                <Globe className="w-4 h-4" />
                <span>الجامعة الألمانية الأردنية - German Jordanian University</span>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center"
                >
                  <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Competition Tracks */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                محاور المسابقة المُغطّاة
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                تغطي منصة ذروة العلم 5 محاور رئيسية من محاور المسابقة بأدوات فعلية وتجارب حقيقية
              </p>
            </motion.div>

            <div className="grid gap-6 md:gap-8">
              {competitionTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className={`relative group rounded-3xl border ${track.borderColor} bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:bg-white/[0.05] transition-all duration-500`}>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 ${track.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center shadow-lg`}>
                        <track.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                          <h3 className="text-xl md:text-2xl font-bold text-white">{track.title}</h3>
                          <span className="text-xs text-white/30 font-mono">{track.subtitle}</span>
                        </div>
                        <p className="text-white/50 mb-4 leading-relaxed">{track.description}</p>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {track.features.map((feature, fi) => (
                            <span
                              key={fi}
                              className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-white/70"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        <Link to={track.link}>
                          <Button
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10 gap-2 px-0"
                          >
                            <span>جرّب الآن</span>
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Inclusive Education Section */}
        <section className="py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-900/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 mb-6">
                <Accessibility className="w-4 h-4 text-pink-400" />
                <span className="text-pink-300 text-sm">التعلّم الدامج</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                تعليم شامل للجميع
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                نظام إمكانية وصول متكامل يضمن تجربة تعليمية متساوية لجميع الطلاب بغض النظر عن قدراتهم
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {inclusiveFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group p-6 rounded-2xl border border-pink-500/10 bg-white/[0.02] hover:bg-pink-500/5 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                التقنيات المُستخدمة
              </h2>
              <p className="text-white/40 text-sm">البنية التحتية التي تدعم المنصة</p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-center"
                >
                  <div className="text-white font-semibold text-sm">{tech.name}</div>
                  <div className="text-white/30 text-xs mt-1">{tech.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/20 via-cyan-900/10 to-emerald-900/20 p-10 md:p-16 text-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10">
                <Rocket className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  ابدأ استكشاف المنصة الآن
                </h2>
                <p className="text-white/50 max-w-lg mx-auto mb-8">
                  جرّب جميع أدوات ومنصات ذروة العلم التعليمية واستمتع بتجربة تعلّم فريدة من نوعها
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-l from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl text-lg font-semibold">
                    الصفحة الرئيسية
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GJUCompetition;
