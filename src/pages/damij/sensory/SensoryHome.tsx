import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Eye, Ear, Hand, Brain, Image as ImageIcon, Vibrate, Activity, Languages, Mic, Type, Wand2 } from 'lucide-react';
import DamijSEO from '@/components/damij/DamijSEO';

const SensoryHome: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto">
    <DamijSEO
      title="الجسر الحسّي العكسي — منصة دامج"
      description="الجسر الحسّي العكسي من منصة دامج: تحويل تلقائي لأي محتوى تعليمي إلى الحاسة المتاحة لكل طالب — نص مبسّط، صوت، إشارة، أو بريل."
      path="/damij/sensory"
      keywords="الجسر الحسي, تكيف المحتوى التعليمي, منصة دامج الجسر الحسي"
    />
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-4">
        <Sparkles className="w-4 h-4" /><span className="text-sm font-bold">الجوهر المبتكر — حلٌّ واحد لجميع الإعاقات</span>
      </div>
      <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-4">الجسر الحسّي العكسي</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 max-w-3xl mx-auto leading-relaxed">
        ارفع أي محتوى تعليمي (نص، صورة، فيديو، صوت، PDF) وسيتم تحويله تلقائياً إلى الحاسة المتاحة لكل طالب —
        نص مبسّط، صوت، إشارة، أو بريل.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {[
        { to: null, icon: Ear, t: 'للأصم', d: 'نص مبسّط + بطاقات PECS + أفاتار إشارة' },
        { to: null, icon: Eye, t: 'للكفيف', d: 'نطق صوتي + وصف الصور + بريل' },
        { to: '/damij/sensory/image-tactile', icon: ImageIcon, t: 'صورة → وصف صوتي', d: 'تحليل صورة ووصفها صوتياً مع نموذج تعليمي قابل للطباعة' },
        { to: '/damij/sensory/adaptive-ui', icon: Wand2, t: 'الواجهة التكيّفية الذكية', d: 'ألوان وأحجام وسرعة عرض تتغيّر تلقائياً وفق حالتك' },
      ].map(({ to, icon: Icon, t, d }) => {
        const inner = (
          <>
            <Icon className="w-10 h-10 text-[hsl(var(--damij-accent-2))] mx-auto mb-3" />
            <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2">{t}</h3>
            <p className="text-sm text-[hsl(var(--damij-text))]/70">{d}</p>
          </>
        );
        return to ? (
          <Link key={t} to={to} className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 text-center hover:-translate-y-1 hover:shadow-md transition-all block">
            {inner}
          </Link>
        ) : (
          <div key={t} className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 text-center">
            {inner}
          </div>
        );
      })}
    </div>

    <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
      {[
        { to: '/damij/sensory/profile', bg: 'bg-gradient-to-br from-slate-50 to-slate-100', accent: 'text-slate-700', border: 'border-slate-200', icons: [Upload], title: 'المحوّل الحسّي العام', desc: 'ارفع نص/صوت/فيديو/PDF وحوّله للحاسة المناسبة', wide: false },
        { to: '/damij/sensory/image-tactile', bg: 'bg-gradient-to-br from-purple-50 to-blue-50', accent: 'text-purple-800', border: 'border-purple-100', icons: [ImageIcon], title: 'صورة → وصف صوتي تفاعلي ✨ جديد', desc: 'تحليل صورة + وصف صوتي تفصيلي + نموذج تعليمي قابل للطباعة', wide: false },
        { to: '/damij/sensory/unified-comm', bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50', accent: 'text-emerald-800', border: 'border-emerald-100', icons: [Languages, Hand, Eye, Ear], title: 'التواصل والتكامل · 4 صيغ متزامنة ✨ جديد', desc: 'إدخال موحّد لنفس المحتوى بأربع صيغ متزامنة (نص / صوت / بريل / لغة إشارة) — صفّ شامل بمعلّم واحد.', wide: true },
        { to: '/damij/sensory/tri-sense', bg: 'bg-gradient-to-br from-fuchsia-50 via-purple-50 to-blue-50', accent: 'text-fuchsia-800', border: 'border-fuchsia-100', icons: [Mic, Type, Hand], title: 'ثلاثي الحواس · صوت + نص + إشارة ✨ جديد', desc: 'تفريغ المحاضرات تلقائياً مع علامات زمنية دقيقة، ومنطقة مخصّصة لعرض لغة الإشارة لطلاب الصمّ.', wide: true },
        { to: '/damij/sensory/adaptive-ui', bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50', accent: 'text-amber-800', border: 'border-amber-100', icons: [Wand2, Eye, Type], title: 'الواجهة التكيّفية الذكية ✨ جديد', desc: 'تغيّر الألوان والأحجام وسرعة العرض وكثافة المحفّزات تلقائياً وفق ملفك الحسّي وحالتك اللحظية (وقت اليوم + الإضاءة المحيطة).', wide: true },
        { to: '/damij/sensory/log', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', accent: 'text-teal-800', border: 'border-teal-100', icons: [Activity], title: 'سجل التفاعل والتعلّم المستمر', desc: 'شاهد أدواتك المفضّلة، علامات الإجهاد، والاختصارات — يتعلّم النظام تلقائياً ليخصّص تجربتك', wide: true },
      ].map(({ to, bg, accent, border, icons, title, desc, wide }) => (
        <Link
          key={to}
          to={to}
          className={`relative p-6 rounded-2xl ${bg} ${accent} shadow-sm border ${border} hover:-translate-y-1 hover:shadow-md transition-all ${wide ? 'sm:col-span-2' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            {icons.map((Icon, i) => <Icon key={i} className={`w-7 h-7 ${accent}`}/>)}
          </div>
          <h3 className={`font-bold text-lg mb-1 ${accent}`}>{title}</h3>
          <p className="text-sm text-slate-600/90">{desc}</p>
        </Link>
      ))}
    </div>
  </div>
);
export default SensoryHome;
