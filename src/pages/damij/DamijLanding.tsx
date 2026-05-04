import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, Activity, Sparkles, Hand, FlaskConical, Layers, BookMarked } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';

const DamijLanding: React.FC = () => {
  return (
    <div>
      <section className="relative overflow-hidden pt-20 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">منصة دامج — التعليم الدامج والتشخيص الذكي</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[hsl(var(--damij-primary))] mb-4 leading-tight">دامج</h1>
          <p className="text-2xl md:text-3xl text-[hsl(var(--damij-accent-2))] font-bold mb-4">
            حِسٌّ بديل، فرصة متساوية، علم بلا حواجز
          </p>
          <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-3xl mx-auto leading-relaxed">
            ستة محاور متكاملة لخدمة كل طفل: مترجم لغة الإشارة العالمي، الجسر الحسّي العكسي، تشخيص وعلاج التوحّد و ADHD،
            مترجم بريل عالمي، ومختبر محاكاة سريرية للبحث العلمي.
          </p>
        </motion.div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SystemCard to="/damij/sign" icon={Hand} title="مترجم لغة الإشارة" description="إشارة ↔ نص/صوت بأكثر من 100 لغة وستة أنظمة إشارة عالمية." accent="hsl(var(--damij-primary))" delay={0.05} />
          <SystemCard to="/damij/sensory" icon={Layers} title="الجسر الحسّي العكسي ⭐" description="ارفع أي محتوى وحوّله تلقائياً إلى الحاسة المتاحة لكل طالب." accent="hsl(var(--damij-accent-2))" delay={0.1} />
          <SystemCard to="/damij/autism" icon={Brain} title="التوحّد — تشخيص بالألعاب" description="تقييم وعلاج تفاعلي وفق DSM-5 و M-CHAT-R و ADOS-2." accent="hsl(var(--damij-warm))" delay={0.15} />
          <SystemCard to="/damij/adhd" icon={Activity} title="ADHD — تركيز وانضباط" description="فحص تفريقي وتمارين Stroop/N-Back/CPT مُلَعْبَنة." accent="hsl(var(--damij-accent-2))" delay={0.2} />
          <SystemCard to="/damij/braille" icon={Eye} title="بريل العالمي" description="نص ⟷ بريل لأي لغة، OCR لبريل، ودروس تفاعلية." accent="hsl(var(--damij-primary))" delay={0.25} />
          <SystemCard to="/damij/clinical" icon={FlaskConical} title="مختبر المحاكاة السريرية" description="بيئة افتراضية للبحث العلمي وتجريب بروتوكولات التقييم والعلاج." accent="hsl(var(--damij-warm))" delay={0.3} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-[hsl(var(--damij-accent-2))]/5 border border-[hsl(var(--damij-primary))]/10 text-center">
          <BookMarked className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">مبنية على مصادر موثّقة</h2>
          <p className="text-[hsl(var(--damij-text))]/75 mb-4">DSM-5-TR · M-CHAT-R · ADOS-2 · Conners-3 · WHO ICF-CY · UNESCO · Unicode Braille · WFD</p>
          <a href="/damij/sources" className="inline-block px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold">تصفّح المراجع العلمية</a>
        </div>
      </section>
    </div>
  );
};

export default DamijLanding;
