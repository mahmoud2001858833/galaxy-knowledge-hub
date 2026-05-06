import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, School, Pill, ListChecks, ExternalLink } from 'lucide-react';

const SECTIONS = [
  {
    icon: ListChecks,
    title: 'تدخلات سلوكية (Behavioral)',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    items: [
      'نظام النقاط/التعزيز (Token Economy) — تعزيز فوري ومتدرّج للسلوكيات الإيجابية.',
      'بطاقة التقرير اليومي (Daily Report Card) — متابعة 3-5 أهداف سلوكية يومياً.',
      'تجاهل السلوكيات الطفيفة + مدح فوري للسلوكيات المرغوبة.',
      'إعطاء تعليمات مختصرة ومباشرة (جملة واحدة، تواصل بصري).',
      'استراحة منظّمة (Time-out) للأطفال 4-12 سنة عند الضرورة.',
    ],
  },
  {
    icon: School,
    title: 'تكييفات صفّية (CDC/AAP)',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    items: [
      'مقعد قريب من المعلم بعيداً عن النوافذ والباب.',
      'تقسيم الواجبات الطويلة إلى أجزاء قصيرة مع نقاط تحقّق.',
      'تمديد وقت الاختبارات بنسبة 25-50%.',
      'استخدام جداول مرئية وتذكيرات مكتوبة.',
      'السماح بحركة منظّمة (تمارين تمدد كل 20 دقيقة).',
      'تعليمات مكتوبة + شفهية + توضيحية في آنٍ واحد.',
    ],
  },
  {
    icon: Home,
    title: 'الروتين المنزلي',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    items: [
      'جدول يومي مرئي بالصور للأطفال.',
      'مكان دراسة مخصّص خالٍ من المشتّتات.',
      'نوم منتظم 9-11 ساعة (اضطراب النوم يضاعف الأعراض).',
      'تمارين هوائية يومية 30-60 دقيقة (تحسّن الانتباه).',
      'تحديد وقت الشاشات وتقليله قبل النوم بساعتين.',
    ],
  },
  {
    icon: Pill,
    title: 'معلومات تثقيفية عن الأدوية (للعلم فقط)',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    items: [
      'المنشّطات (Stimulants): Methylphenidate, Amphetamines — الخط الأول للأعمار ≥6 سنوات.',
      'غير المنشّطات (Non-stimulants): Atomoxetine, Guanfacine, Clonidine.',
      'الفعالية ~70-80% مع المنشّطات حسب NICE/AAP.',
      'الآثار الجانبية الشائعة: انخفاض الشهية، صعوبة النوم، صداع.',
      '⚠ لا تبدأ أو تعدّل أي دواء إلا بإشراف طبيب نفسي/أعصاب.',
    ],
  },
];

const SOURCES = [
  { name: 'AAP Clinical Practice Guideline (2019)', url: 'https://publications.aap.org/pediatrics/article/144/4/e20192528' },
  { name: 'NICE Guideline NG87', url: 'https://www.nice.org.uk/guidance/ng87' },
  { name: 'CHADD — Behavioral Therapy', url: 'https://chadd.org/about-adhd/behavioral-treatments/' },
  { name: 'CDC — ADHD Treatment', url: 'https://www.cdc.gov/adhd/treatment/' },
];

const ADHDInterventions: React.FC = () => {
  const nav = useNavigate();
  return (
    <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto" dir="rtl">
      <button onClick={() => nav('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">التدخلات</h1>
        <p className="text-[hsl(var(--damij-text))]/70">قائمة مبنية على إرشادات AAP 2019 و NICE NG87 و CHADD.</p>
      </header>

      <div className="space-y-4 mb-8">
        {SECTIONS.map((s) => (
          <div key={s.title} className={`p-5 rounded-2xl border ${s.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <s.icon className="w-6 h-6" />
              <h2 className="font-bold text-lg">{s.title}</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed">
              {s.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10">
        <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">المصادر العلمية</h3>
        <ul className="space-y-2">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[hsl(var(--damij-warm))] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ADHDInterventions;
