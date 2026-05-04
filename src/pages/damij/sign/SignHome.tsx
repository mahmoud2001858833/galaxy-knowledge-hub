import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';

const cards = [
  { to: '/damij/sign/translator', icon: Hand, title: 'المترجم الفوري', desc: 'كاميرا ⟶ نص/صوت، ونص/صوت ⟶ أفاتار إشارة 3D.' },
  { to: '/damij/sign/dictionary', icon: BookOpen, title: 'قاموس الإشارة العالمي', desc: 'قاموس مرئي يدعم +100 لغة منطوقة و6 أنظمة إشارة.' },
  { to: '/damij/sign/learn', icon: GraduationCap, title: 'تعلّم لغة الإشارة', desc: 'دروس تفاعلية متدرجة من الأبجدية إلى الجمل.' },
];

const SignHome: React.FC = () => (
  <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto">
    <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-3">مترجم لغة الإشارة العالمي</h1>
    <p className="text-lg text-[hsl(var(--damij-text))]/75 mb-10 max-w-3xl">
      جسر تواصل ثنائي الاتجاه بين الصمّ والمجتمع، يدعم أكثر من 100 لغة منطوقة وستة أنظمة إشارة عالمية.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map(({ to, icon: Icon, title, desc }) => (
        <Link key={to} to={to} className="group p-7 rounded-3xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:border-[hsl(var(--damij-primary))]/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center mb-5">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-2">{title}</h3>
          <p className="text-[hsl(var(--damij-text))]/70 leading-relaxed mb-4">{desc}</p>
          <div className="flex items-center gap-2 text-[hsl(var(--damij-accent-2))] font-semibold group-hover:gap-3 transition-all">
            <span>افتح</span><ArrowLeft className="w-4 h-4" />
          </div>
        </Link>
      ))}
    </div>
  </div>
);
export default SignHome;
