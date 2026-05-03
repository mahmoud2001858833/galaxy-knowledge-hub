import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, Activity, Sparkles, Hand, FileText, HeartHandshake, Stethoscope } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';
import FeatureCard from '@/components/damij/FeatureCard';

const DamijLanding: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">منصة دامج للتعليم الخاص الذكي</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[hsl(var(--damij-primary))] mb-6 leading-tight">
            دامج
          </h1>
          <p className="text-2xl md:text-3xl text-[hsl(var(--damij-accent-2))] font-bold mb-4">
            تعليم يحتضن كل طفل
          </p>
          <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto leading-relaxed">
            منصة متكاملة تجمع بين دمج لغة بريل للمكفوفين، تشخيص وعلاج اضطراب طيف التوحد،
            والتشخيص التفريقي لاضطراب فرط الحركة وتشتت الانتباه — في بيئة واحدة آمنة وودودة.
          </p>
        </motion.div>
      </section>

      {/* 3 systems */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <SystemCard
            to="/damij/braille"
            icon={Eye}
            title="نظام بريل الدامج"
            description="تحويل النصوص إلى بريل والعكس، ودروس تعليمية تفاعلية تساعد المكفوفين على الاندماج في الصف."
            accent="hsl(var(--damij-primary))"
            delay={0.1}
          />
          <SystemCard
            to="/damij/autism"
            icon={Brain}
            title="نظام التوحد"
            description="تحديد نوع التوحد عبر تقييمات ذكية، وتقديم برامج علاجية تفاعلية مبنية على الألعاب."
            accent="hsl(var(--damij-accent-2))"
            delay={0.2}
          />
          <SystemCard
            to="/damij/adhd"
            icon={Activity}
            title="نظام فرط الحركة (ADHD)"
            description="تشخيص تفريقي لاضطراب فرط الحركة وتشتت الانتباه، مع تمارين علاجية لتحسين التركيز."
            accent="hsl(var(--damij-warm))"
            delay={0.3}
          />
        </div>
      </section>

      {/* Features bar */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[hsl(var(--damij-primary))] mb-10">
            مزايا المنصة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={Stethoscope} title="تشخيص ذكي" description="أدوات تقييم مبنية على معايير علمية معتمدة." />
            <FeatureCard icon={HeartHandshake} title="علاج تفاعلي" description="ألعاب وأنشطة علاجية مصممة لكل حالة." />
            <FeatureCard icon={Hand} title="تحويل الإشارة ↔ نص" description="جسر تواصل بين الطلاب الصم وزملائهم." />
            <FeatureCard icon={FileText} title="تقارير لولي الأمر" description="متابعة دورية لتقدم الطفل وتطوره." />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DamijLanding;
