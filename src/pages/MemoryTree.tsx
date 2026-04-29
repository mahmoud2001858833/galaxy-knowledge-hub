import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, RefreshCcw, Network, AlertTriangle, Wand2,
  Cog, Trees, Palette, Hammer, Calendar, Users, Target,
  PlayCircle, FileText, Presentation, Image as ImageIcon, Download,
  CheckCircle2, ArrowDown,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const ASSETS = '/memory-tree';

const concepts = [
  { icon: Brain, title: 'التدريب', color: 'from-emerald-500 to-green-700',
    desc: 'يُلقّن النموذج البيانات مرارًا حتى يستوعب الأنماط ويُكوّن معرفته الأولى.' },
  { icon: Sparkles, title: 'التعزيز', color: 'from-amber-500 to-yellow-600',
    desc: 'مكافأة الإجابات الصحيحة تُرسّخها في الذاكرة وتُقوّي مساراتها العصبية.' },
  { icon: RefreshCcw, title: 'الاسترجاع', color: 'from-sky-500 to-blue-700',
    desc: 'استدعاء المعلومة المخزّنة عند الحاجة عبر مفاتيح وسياقات مرتبطة بها.' },
  { icon: Network, title: 'الترابط', color: 'from-violet-500 to-purple-700',
    desc: 'ربط المفاهيم ببعضها يُكوّن شبكة معرفية تُسهّل الفهم العميق.' },
  { icon: AlertTriangle, title: 'التحيّز', color: 'from-rose-500 to-red-700',
    desc: 'تكرار بيانات مُنحازة يجعل النموذج يُفضّل اتجاهًا على آخر بشكل غير عادل.' },
  { icon: Wand2, title: 'الهلوسة', color: 'from-fuchsia-500 to-pink-700',
    desc: 'حين يخترع النموذج معلومات لا أساس لها، فيُنتج إجابات واثقة لكنها خاطئة.' },
];

const steps = [
  { n: '1', title: 'التحضير', desc: 'يجهّز الطالب الشجرة والمفاتيح ويتعرّف على وحداتها الميكانيكية.' },
  { n: '2', title: 'التدريب', desc: 'يُدخل البيانات (بطاقات/رموز) ويُكرّر العملية لتثبيت المعلومة.' },
  { n: '3', title: 'التكرار', desc: 'يُعيد الإدخال لتقوية الروابط ومحاكاة فكرة التعزيز.' },
  { n: '4', title: 'الاسترجاع', desc: 'يُحرّك آلية الاستدعاء فيُخرج النموذج المعلومة المخزّنة.' },
  { n: '5', title: 'الترابط', desc: 'يربط مفهومين أو أكثر فتُضيء الشجرة المسار المشترك بينهما.' },
  { n: '6', title: 'الهلوسة', desc: 'يُجرّب إدخال بيانات ناقصة فيرى كيف يخترع النموذج إجابات غير دقيقة.' },
];

const anatomy = [
  { part: 'الجذور الخشبية', concept: 'البيانات الأولية', detail: 'مصدر المعلومة الذي يتغذّى منه النموذج.' },
  { part: 'الجذع والتروس', concept: 'الخوارزمية', detail: 'محرّك المعالجة الذي يحوّل البيانات إلى معرفة.' },
  { part: 'الأغصان الملوّنة', concept: 'الشبكة العصبية', detail: 'تفرّعات الترابط بين المفاهيم المختلفة.' },
  { part: 'الأوراق الدوّارة', concept: 'الذاكرة النشطة', detail: 'تخزين مؤقّت للمعلومات قابلة للاستدعاء.' },
  { part: 'الثمار الملوّنة (CMY)', concept: 'المخرجات', detail: 'النتائج النهائية التي يُنتجها النموذج.' },
  { part: 'مفتاح الهلوسة', concept: 'الخطأ المُتعمّد', detail: 'يُظهر للطالب كيف تنشأ الإجابات الخاطئة.' },
];

const materials = [
  { icon: Trees, label: 'خشب مُعاد تدويره' },
  { icon: Cog, label: 'مجموعة تروس متنوّعة' },
  { icon: Palette, label: 'أصباغ CMY طبيعية' },
  { icon: Hammer, label: 'أدوات تجميع يدوية' },
  { icon: Sparkles, label: 'إضاءة LED خفيفة' },
  { icon: Network, label: 'أسلاك ربط ملوّنة' },
  { icon: ImageIcon, label: 'بطاقات بيانات تعليمية' },
  { icon: Brain, label: 'دليل المعلّم المرفق' },
];

const kpis = [
  { value: '+85%', label: 'تحسّن الفهم المفاهيمي' },
  { value: '180', label: 'دينار · ميزانية تقديرية' },
  { value: '4', label: 'أسابيع تنفيذ' },
  { value: '6', label: 'مفاهيم AI تفاعلية' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

const MemoryTree: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F5EDD8] text-[#2C1810]">
      <SEO
        title="شجرة الذاكرة - مشروع تعليمي لتجسيد الذكاء الاصطناعي"
        description="شجرة الذاكرة: مشروع تفاعلي من حديقة الحسن التعليمية يُجسّد المفاهيم الستة للذكاء الاصطناعي (التدريب، التعزيز، الاسترجاع، الترابط، التحيّز، الهلوسة) عبر شجرة ميكانيكية يدوية."
        keywords="شجرة الذاكرة, الذكاء الاصطناعي, حديقة الحسن, ذروة العلم, مشروع تعليمي, مدرسة عنبه"
      />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F3A2E] via-[#2D5841] to-[#1F3A2E]" />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, #C9A24A 0%, transparent 40%), radial-gradient(circle at 80% 70%, #5C3A1E 0%, transparent 50%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <Badge className="bg-[#C9A24A] text-[#2C1810] border-0 px-4 py-1.5 text-sm mb-6">
              حديقة الحسن التعليمية × ذروة العلم
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-l from-[#F5EDD8] via-[#FFE9A8] to-[#C9A24A] bg-clip-text text-transparent leading-tight"
          >
            شجرة الذاكرة
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-xl md:text-2xl text-[#F5EDD8]/90 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            مشروع تعليمي تفاعلي يُجسّد المفاهيم الستة للذكاء الاصطناعي
            عبر شجرة ميكانيكية مصنوعة يدويًا من مواد مُعاد تدويرها.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-[#C9A24A] hover:bg-[#B8902F] text-[#2C1810] font-bold text-lg px-8 py-6 rounded-2xl shadow-2xl"
              onClick={() => document.getElementById('media')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <PlayCircle className="w-5 h-5 ml-2" />
              شاهد الفيديو
            </Button>
            <a href={`${ASSETS}/Memory_Tree_Official_Proposal.pdf`} download>
              <Button
                size="lg" variant="outline"
                className="border-2 border-[#F5EDD8] text-[#F5EDD8] hover:bg-[#F5EDD8] hover:text-[#1F3A2E] font-bold text-lg px-8 py-6 rounded-2xl bg-transparent"
              >
                <Download className="w-5 h-5 ml-2" />
                المقترح الرسمي PDF
              </Button>
            </a>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="mt-16"
          >
            <ArrowDown className="w-8 h-8 mx-auto text-[#C9A24A]" />
          </motion.div>
        </div>
      </section>

      {/* WHAT IS IT */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <Badge className="bg-[#1F3A2E] text-[#F5EDD8] mb-4">عن المشروع</Badge>
            <h2 className="text-4xl font-bold mb-6 text-[#1F3A2E]">ما هي شجرة الذاكرة؟</h2>
            <p className="text-lg leading-loose text-[#5C3A1E]">
              شجرة الذاكرة مجسّم تعليمي ميكانيكي يحاكي طريقة عمل عقل الذكاء الاصطناعي.
              يتفاعل معها الطالب بنفسه: يُدخل البيانات، يُحرّك التروس، ويُشاهد كيف
              تتكوّن المعرفة، تُسترجع، تترابط، وأحيانًا تُخطئ. تجربة حسّية كاملة
              تُحوّل المفاهيم المجرّدة إلى لمسة وحركة ولون.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="outline" className="border-[#C9A24A] text-[#5C3A1E]">مواد مُعاد تدويرها</Badge>
              <Badge variant="outline" className="border-[#C9A24A] text-[#5C3A1E]">صديق للبيئة</Badge>
              <Badge variant="outline" className="border-[#C9A24A] text-[#5C3A1E]">تفاعلي بالكامل</Badge>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#C9A24A]">
              <img
                src={`${ASSETS}/memory-tree-hero.jpg`}
                alt="شجرة الذاكرة - مشروع تعليمي"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONCEPTS */}
      <section className="py-20 px-4 bg-[#1F3A2E] text-[#F5EDD8]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge className="bg-[#C9A24A] text-[#2C1810] mb-4">المفاهيم الستة</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">عقل الذكاء الاصطناعي</h2>
            <p className="text-lg text-[#F5EDD8]/70 max-w-2xl mx-auto">
              ست مفاتيح أساسية تُفسّر كيف يتعلّم الذكاء الاصطناعي ويُفكّر — ويُخطئ.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {concepts.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-sm border border-[#C9A24A]/30 hover:border-[#C9A24A] transition-all p-6 rounded-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#C9A24A]/20">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <c.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-[#FFE9A8]">{c.title}</h3>
                  <p className="text-[#F5EDD8]/80 leading-relaxed">{c.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MECHANISM */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge className="bg-[#1F3A2E] text-[#F5EDD8] mb-4">آلية التطبيق</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1F3A2E]">كيف يعمل المشروع؟</h2>
            <p className="text-lg text-[#5C3A1E]/80">ستّ خطوات يُجريها الطالب بنفسه على الشجرة</p>
          </motion.div>

          <div className="relative">
            <div className="absolute right-8 md:right-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C9A24A] via-[#1F3A2E] to-[#C9A24A] md:translate-x-1/2" />

            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start gap-6 mb-10 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="absolute right-8 md:right-1/2 md:translate-x-1/2 -translate-x-0 -mr-6 md:-mr-7 mt-2 w-14 h-14 rounded-full bg-[#C9A24A] text-[#2C1810] font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-[#F5EDD8] z-10">
                  {s.n}
                </div>
                <Card className="mr-24 md:mr-0 md:w-[44%] p-6 rounded-2xl border-2 border-[#C9A24A]/30 bg-white shadow-md hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold text-[#1F3A2E] mb-2">{s.title}</h3>
                  <p className="text-[#5C3A1E] leading-relaxed">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ANATOMY TABLE */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#F5EDD8] to-[#EDDFB8]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="bg-[#5C3A1E] text-[#F5EDD8] mb-4">التشريح العلمي</Badge>
            <h2 className="text-4xl font-bold text-[#1F3A2E]">من القطعة الخشبية إلى المفهوم الذكي</h2>
          </motion.div>

          <motion.div {...fadeUp}>
            <Card className="overflow-hidden border-2 border-[#C9A24A] rounded-2xl shadow-xl">
              <div className="grid grid-cols-12 bg-[#1F3A2E] text-[#F5EDD8] font-bold text-sm md:text-base">
                <div className="col-span-4 p-4 text-right border-l border-[#C9A24A]/40">القطعة</div>
                <div className="col-span-3 p-4 text-right border-l border-[#C9A24A]/40">المفهوم</div>
                <div className="col-span-5 p-4 text-right">التفسير</div>
              </div>
              {anatomy.map((row, i) => (
                <div
                  key={row.part}
                  className={`grid grid-cols-12 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F5EDD8]/50'} text-sm md:text-base`}
                >
                  <div className="col-span-4 p-4 font-semibold text-[#1F3A2E] border-l border-[#C9A24A]/20">{row.part}</div>
                  <div className="col-span-3 p-4 text-[#C9A24A] font-bold border-l border-[#C9A24A]/20">{row.concept}</div>
                  <div className="col-span-5 p-4 text-[#5C3A1E]">{row.detail}</div>
                </div>
              ))}
            </Card>
          </motion.div>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="bg-[#1F3A2E] text-[#F5EDD8] mb-4">الموارد والمستلزمات</Badge>
            <h2 className="text-4xl font-bold text-[#1F3A2E]">ما يحتاجه المشروع</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {materials.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="p-5 rounded-2xl border-2 border-[#C9A24A]/30 bg-white hover:border-[#C9A24A] hover:shadow-lg transition-all flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1F3A2E] flex items-center justify-center flex-shrink-0">
                    <m.icon className="w-6 h-6 text-[#C9A24A]" />
                  </div>
                  <span className="text-[#1F3A2E] font-semibold">{m.label}</span>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Project board */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div {...fadeUp}>
              <Card className="p-6 rounded-2xl border-2 border-[#1F3A2E]/20 bg-gradient-to-br from-white to-[#F5EDD8] h-full">
                <Users className="w-8 h-8 text-[#1F3A2E] mb-3" />
                <h3 className="text-xl font-bold mb-3 text-[#1F3A2E]">فريق العمل</h3>
                <ul className="space-y-2 text-[#5C3A1E]">
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#C9A24A] flex-shrink-0" /> مُشرف تربوي</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#C9A24A] flex-shrink-0" /> طالب مُصمّم</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#C9A24A] flex-shrink-0" /> طالب مُنفّذ</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#C9A24A] flex-shrink-0" /> فنّان للزخرفة</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <Card className="p-6 rounded-2xl border-2 border-[#1F3A2E]/20 bg-gradient-to-br from-white to-[#F5EDD8] h-full">
                <Calendar className="w-8 h-8 text-[#1F3A2E] mb-3" />
                <h3 className="text-xl font-bold mb-3 text-[#1F3A2E]">الجدول الزمني</h3>
                <ul className="space-y-2 text-[#5C3A1E]">
                  <li><span className="font-bold text-[#C9A24A]">الأسبوع 1:</span> التصميم والقياسات</li>
                  <li><span className="font-bold text-[#C9A24A]">الأسبوع 2:</span> القصّ والتجميع</li>
                  <li><span className="font-bold text-[#C9A24A]">الأسبوع 3:</span> التركيب والميكانيكا</li>
                  <li><span className="font-bold text-[#C9A24A]">الأسبوع 4:</span> الاختبار والعرض</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <Card className="p-6 rounded-2xl border-2 border-[#1F3A2E]/20 bg-gradient-to-br from-white to-[#F5EDD8] h-full">
                <Target className="w-8 h-8 text-[#1F3A2E] mb-3" />
                <h3 className="text-xl font-bold mb-3 text-[#1F3A2E]">الميزانية التقديرية</h3>
                <p className="text-4xl font-black text-[#C9A24A] mb-2">~180 د.أ</p>
                <p className="text-sm text-[#5C3A1E]">تشمل المواد الأساسية، الأدوات، الأصباغ، والإكسسوارات. قابلة للتخفيض باستخدام مواد متوفّرة محليًا.</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="py-16 px-4 bg-[#1F3A2E] text-[#F5EDD8]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-[#C9A24A] mb-2">{k.value}</div>
              <div className="text-sm md:text-base text-[#F5EDD8]/80">{k.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MEDIA GALLERY */}
      <section id="media" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="bg-[#5C3A1E] text-[#F5EDD8] mb-4">معرض الوسائط</Badge>
            <h2 className="text-4xl font-bold text-[#1F3A2E]">شاهد، استكشف، حمّل</h2>
          </motion.div>

          <Tabs defaultValue="video" dir="rtl" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-[#EDDFB8] p-1 rounded-2xl h-auto mb-6">
              <TabsTrigger value="video" className="rounded-xl data-[state=active]:bg-[#1F3A2E] data-[state=active]:text-[#F5EDD8] py-3">
                <PlayCircle className="w-4 h-4 ml-2" /> فيديو
              </TabsTrigger>
              <TabsTrigger value="poster" className="rounded-xl data-[state=active]:bg-[#1F3A2E] data-[state=active]:text-[#F5EDD8] py-3">
                <ImageIcon className="w-4 h-4 ml-2" /> بوستر
              </TabsTrigger>
              <TabsTrigger value="ppt" className="rounded-xl data-[state=active]:bg-[#1F3A2E] data-[state=active]:text-[#F5EDD8] py-3">
                <Presentation className="w-4 h-4 ml-2" /> عرض تقديمي
              </TabsTrigger>
              <TabsTrigger value="pdf" className="rounded-xl data-[state=active]:bg-[#1F3A2E] data-[state=active]:text-[#F5EDD8] py-3">
                <FileText className="w-4 h-4 ml-2" /> مقترح رسمي
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video">
              <Card className="p-4 rounded-2xl border-2 border-[#C9A24A] bg-black">
                <video
                  controls
                  className="w-full rounded-xl"
                  src={`${ASSETS}/memory-tree-explainer_v5.mp4`}
                  poster={`${ASSETS}/memory-tree-hero.jpg`}
                />
              </Card>
            </TabsContent>

            <TabsContent value="poster">
              <Card className="p-4 rounded-2xl border-2 border-[#C9A24A] bg-white text-center">
                <img
                  src={`${ASSETS}/memory-tree-poster_v3.png`}
                  alt="بوستر شجرة الذاكرة"
                  className="w-full rounded-xl mb-4"
                />
                <a href={`${ASSETS}/memory-tree-poster_v3.pdf`} download>
                  <Button className="bg-[#1F3A2E] hover:bg-[#2D5841] text-[#F5EDD8]">
                    <Download className="w-4 h-4 ml-2" /> حمّل البوستر PDF
                  </Button>
                </a>
              </Card>
            </TabsContent>

            <TabsContent value="ppt">
              <Card className="p-10 rounded-2xl border-2 border-[#C9A24A] bg-white text-center">
                <Presentation className="w-20 h-20 text-[#C9A24A] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#1F3A2E] mb-2">عرض تقديمي PowerPoint</h3>
                <p className="text-[#5C3A1E] mb-6">12 شريحة احترافية تشرح المشروع بالكامل</p>
                <a href={`${ASSETS}/memory-tree-presentation_v3.pptx`} download>
                  <Button size="lg" className="bg-[#1F3A2E] hover:bg-[#2D5841] text-[#F5EDD8]">
                    <Download className="w-4 h-4 ml-2" /> حمّل العرض التقديمي
                  </Button>
                </a>
              </Card>
            </TabsContent>

            <TabsContent value="pdf">
              <Card className="p-10 rounded-2xl border-2 border-[#C9A24A] bg-white text-center">
                <FileText className="w-20 h-20 text-[#C9A24A] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#1F3A2E] mb-2">المقترح الرسمي</h3>
                <p className="text-[#5C3A1E] mb-6">وثيقة 11 صفحة موجّهة للمجلس الأعلى للعلوم والتكنولوجيا</p>
                <a href={`${ASSETS}/Memory_Tree_Official_Proposal.pdf`} download>
                  <Button size="lg" className="bg-[#1F3A2E] hover:bg-[#2D5841] text-[#F5EDD8]">
                    <Download className="w-4 h-4 ml-2" /> حمّل المقترح الرسمي
                  </Button>
                </a>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#1F3A2E] via-[#5C3A1E] to-[#1F3A2E] text-[#F5EDD8] text-center">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <Trees className="w-16 h-16 text-[#C9A24A] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">من فكرة إلى شجرة تنبض بالمعرفة</h2>
          <p className="text-lg text-[#F5EDD8]/80 leading-relaxed mb-8">
            شجرة الذاكرة ليست مجرّد مجسّم، بل تجربة حسّية تُعيد تعريف كيف نُدرّس
            الذكاء الاصطناعي للجيل القادم. مشروع يجمع بين الاستدامة، التعليم، والإبداع.
          </p>
          <p className="text-sm text-[#C9A24A] font-bold">
            تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default MemoryTree;
