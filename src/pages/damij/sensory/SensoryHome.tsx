import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Eye, Ear, Hand, Brain } from 'lucide-react';

const SensoryHome: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-4">
        <Sparkles className="w-4 h-4" /><span className="text-sm font-bold">الجوهر المبتكر — حلٌّ واحد لجميع الإعاقات</span>
      </div>
      <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-4">الجسر الحسّي العكسي</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-3xl mx-auto leading-relaxed">
        ارفع أي محتوى تعليمي (نص، صورة، فيديو، صوت، PDF) وسيتم تحويله تلقائياً إلى الحاسة المتاحة لكل طالب —
        نص مبسّط، صوت، إشارة، بريل، أو اهتزاز إيقاعي.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {[
        { icon: Ear, t: 'للأصم', d: 'نص مبسّط + بطاقات PECS + أفاتار إشارة' },
        { icon: Eye, t: 'للكفيف', d: 'نطق صوتي + وصف الصور + بريل' },
        { icon: Hand, t: 'للأصم-الكفيف', d: 'بريل ملموس + اهتزاز إيقاعي' },
        { icon: Brain, t: 'للتوحّد/ADHD', d: 'تبسيط لغوي + إزالة المشتتات' },
      ].map(({ icon: Icon, t, d }) => (
        <div key={t} className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 text-center">
          <Icon className="w-10 h-10 text-[hsl(var(--damij-accent-2))] mx-auto mb-3" />
          <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2">{t}</h3>
          <p className="text-sm text-[hsl(var(--damij-text))]/70">{d}</p>
        </div>
      ))}
    </div>

    <div className="text-center">
      <Link to="/damij/sensory/profile" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
        <Upload className="w-6 h-6" /> ابدأ — أنشئ ملفك الحسّي ثم ارفع المحتوى
      </Link>
    </div>
  </div>
);
export default SensoryHome;
