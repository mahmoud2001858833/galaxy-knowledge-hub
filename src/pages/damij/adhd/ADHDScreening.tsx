import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileCheck2 } from 'lucide-react';
import { INSTRUMENTS } from '@/features/adhd/screening/instruments';

const ADHDScreening: React.FC = () => {
  const navigate = useNavigate();
  const list = Object.values(INSTRUMENTS);

  return (
    <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto" dir="rtl">
      <button
        onClick={() => navigate('/damij/adhd')}
        className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 hover:opacity-80"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع للنظام
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">الفحص التشخيصي</h1>
        <p className="text-[hsl(var(--damij-text))]/70">
          اختر الأداة المناسبة حسب عمر الشخص ومن سيكمل الاستبيان. يتم احتساب النتيجة وفق نقاط القطع الرسمية،
          ثم يُولَّد تقرير ذكاء اصطناعي تفريقي.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((inst) => (
          <Link
            key={inst.key}
            to={`/damij/adhd/screening/${inst.key}`}
            className="group p-5 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 hover:border-[hsl(var(--damij-warm))]/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--damij-warm))]/15 text-[hsl(var(--damij-warm))] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[hsl(var(--damij-primary))]">{inst.title}</h3>
                <p className="text-[11px] text-[hsl(var(--damij-text))]/55">
                  العمر {inst.ageRange} · يكمله: {inst.completedBy === 'parent' ? 'الوالد' : inst.completedBy === 'teacher' ? 'المعلم' : 'الشخص نفسه'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed mb-3">
              {inst.description}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[hsl(var(--damij-warm))] font-semibold flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" /> {inst.items.length} بنداً
              </span>
              <span className="text-[hsl(var(--damij-text))]/50">{inst.source}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ADHDScreening;
