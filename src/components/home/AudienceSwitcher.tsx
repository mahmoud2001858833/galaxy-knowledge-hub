import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ClipboardCheck, GraduationCap, School, Users, type LucideIcon } from 'lucide-react';

interface Audience {
  id: string;
  icon: LucideIcon;
  label: string;
  headline: string;
  points: string[];
  links: { label: string; to: string }[];
}

const AUDIENCES: Audience[] = [
  {
    id: 'student',
    icon: GraduationCap,
    label: 'الطالب',
    headline: 'افهم الدرس، تدرّب، وجرّب بيدك',
    points: [
      'مساعد يشرح من كتابك المدرسي ويذكر المصدر',
      'تحديات وألغاز في كل مادة مع لوحة صدارة',
      'مختبرات تفاعلية بدل الحفظ النظري',
      'جدول دراسي ومراجعة متباعدة قبل الامتحان',
    ],
    links: [
      { label: 'التعلّم والمنهاج', to: '/learn' },
      { label: 'أدوات الطالب', to: '/tools' },
    ],
  },
  {
    id: 'teacher',
    icon: ClipboardCheck,
    label: 'المعلم',
    headline: 'امتحانات بنمط الوزارة في دقائق',
    points: [
      'امتحان حتى 100 سؤال أو بنك أسئلة حتى 1000 سؤال من ملفك',
      'كل سؤال مرفق باقتباس يثبت إجابته من الملف',
      'رابط إلكتروني يصحّح تلقائياً، أو PDF للطباعة',
      'ماسح يصحّح أوراق الامتحان بالكاميرا',
    ],
    links: [
      { label: 'منشئ الامتحانات', to: '/exam-creator' },
      { label: 'الامتحانات والتقييم', to: '/exams' },
    ],
  },
  {
    id: 'parent',
    icon: Users,
    label: 'ولي الأمر',
    headline: 'تابع ابنك دون أن تسأل كل يوم',
    points: ['الواجبات ومواعيد تسليمها', 'ملاحظات المعلمين على أداء ابنك', 'محادثة مباشرة مع المعلم', 'أخبار المدرسة وإعلاناتها'],
    links: [{ label: 'جسر التواصل', to: '/communication-bridge' }],
  },
  {
    id: 'school',
    icon: School,
    label: 'المدرسة',
    headline: 'مجتمع مدرسي رقمي متكامل',
    points: ['مجلة مدرسية وأخبار', 'منتدى للطلبة ومعرض للفن والاستدامة', 'متابعة مشاريع المعلمين وإنجازاتهم', 'شراكة مؤسسية لاستخدام المنصة مع طلبتك'],
    links: [
      { label: 'المجتمع المدرسي', to: '/school' },
      { label: 'الشراكات المؤسسية', to: '/institutional-partnerships' },
    ],
  },
];

export const AudienceSwitcher: React.FC = () => {
  const [active, setActive] = useState(AUDIENCES[0].id);
  const a = AUDIENCES.find((x) => x.id === active) ?? AUDIENCES[0];

  return (
    <section aria-labelledby="audience-title">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">لمن المنصة؟</span>
        <h2 id="audience-title" className="text-3xl font-black tracking-tight sm:text-4xl">
          تجربة مصمّمة لكل دور
        </h2>
      </div>

      <div className="mx-auto mb-6 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-border bg-card p-1.5" role="tablist">
        {AUDIENCES.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === active}
            onClick={() => setActive(id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              id === active ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={a.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="grid items-center gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_1.2fr]"
        >
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white shadow-lg shadow-brand-to/20">
              <a.icon className="h-7 w-7" aria-hidden />
            </div>
            <h3 className="text-2xl font-black leading-snug">{a.headline}</h3>
            <div className="flex flex-wrap gap-3">
              {a.links.map((l) => (
                <Link key={l.to} to={l.to} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                  {l.label}
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {a.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 rounded-2xl bg-muted/60 p-4 text-sm font-semibold leading-relaxed">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
