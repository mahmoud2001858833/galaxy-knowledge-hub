import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Eye, Ear, Hand, Brain, Image as ImageIcon, Vibrate, Activity, Languages, Mic, Type, Wand2 } from 'lucide-react';

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

    <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
      <Link to="/damij/sensory/profile" className="p-6 rounded-2xl bg-[hsl(var(--damij-primary))] text-white shadow-xl hover:-translate-y-1 transition-all">
        <Upload className="w-8 h-8 mb-2"/>
        <h3 className="font-bold text-lg mb-1">المحوّل الحسّي العام</h3>
        <p className="text-sm opacity-90">ارفع نص/صوت/فيديو/PDF وحوّله للحاسة المناسبة</p>
      </Link>
      <Link to="/damij/sensory/image-tactile" className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl hover:-translate-y-1 transition-all">
        <div className="flex items-center gap-2 mb-2"><ImageIcon className="w-7 h-7"/><Vibrate className="w-6 h-6"/></div>
        <h3 className="font-bold text-lg mb-1">صورة → وصف صوتي + لمسي ✨ جديد</h3>
        <p className="text-sm opacity-90">تحليل صورة + وصف صوتي + نموذج لمسي للطباعة + اهتزاز تفاعلي</p>
      </Link>
      <Link to="/damij/sensory/unified-comm" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white shadow-xl hover:-translate-y-1 transition-all sm:col-span-2">
        <div className="flex items-center gap-2 mb-2"><Languages className="w-7 h-7"/><Hand className="w-6 h-6"/><Eye className="w-6 h-6"/><Ear className="w-6 h-6"/></div>
        <h3 className="font-bold text-lg mb-1">التواصل والتكامل · 4 صيغ متزامنة ✨ جديد</h3>
        <p className="text-sm opacity-90">إدخال موحّد لنفس المحتوى بأربع صيغ متزامنة (نص / صوت / بريل / لغة إشارة) — صفّ شامل بمعلّم واحد.</p>
      </Link>
      <Link to="/damij/sensory/tri-sense" className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600 text-white shadow-xl hover:-translate-y-1 transition-all sm:col-span-2 ring-2 ring-fuchsia-400/40">
        <div className="flex items-center gap-2 mb-2"><Mic className="w-7 h-7"/><Type className="w-6 h-6"/><Hand className="w-6 h-6"/></div>
        <h3 className="font-bold text-lg mb-1">ثلاثي الحواس · صوت + نص + إشارة ✨ جديد</h3>
        <p className="text-sm opacity-90">تفريغ المحاضرات تلقائياً مع علامات زمنية دقيقة، ومنطقة مخصّصة لعرض لغة الإشارة لطلاب الصمّ.</p>
      </Link>
      <Link to="/damij/sensory/log" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl hover:-translate-y-1 transition-all sm:col-span-2">
        <Activity className="w-7 h-7 mb-2"/>
        <h3 className="font-bold text-lg mb-1">سجل التفاعل والتعلّم المستمر</h3>
        <p className="text-sm opacity-90">شاهد أدواتك المفضّلة، علامات الإجهاد، والاختصارات — يتعلّم النظام تلقائياً ليخصّص تجربتك</p>
      </Link>
    </div>
  </div>
);
export default SensoryHome;
