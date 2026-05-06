import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ClipboardList, Beaker, ArrowLeft } from 'lucide-react';

const ClinicalLab: React.FC = () => {
  return (
    <div className="px-6 pt-12 pb-16 max-w-5xl mx-auto" dir="rtl">
      <div className="text-center mb-10">
        <FlaskConical className="w-14 h-14 mx-auto text-[hsl(var(--damij-accent-2))] mb-3" />
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">ابدأ تجربة سريرية</h1>
        <p className="text-slate-600">اختر نمط التجربة الذي يناسبك</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/damij/clinical/cases"
          className="group p-7 rounded-3xl bg-white border-2 border-[hsl(var(--damij-primary))]/15 hover:border-[hsl(var(--damij-primary))]/50 shadow-lg hover:shadow-2xl transition-all">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-2">تجربة جاهزة</h3>
          <p className="text-slate-600 leading-relaxed mb-4">اختر حالة من المكتبة ثم بروتوكولاً قياسياً معتمداً (ACLS، تعديل سلوكي، تواصل…). موجَّهة بخطوات واضحة.</p>
          <div className="flex items-center gap-2 text-[hsl(var(--damij-primary))] font-bold group-hover:gap-3 transition-all">
            <span>اختر حالة</span><ArrowLeft className="w-4 h-4" />
          </div>
        </Link>

        <Link to="/damij/clinical/free"
          className="group p-7 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-accent-2))]/10 to-white border-2 border-[hsl(var(--damij-accent-2))]/30 hover:border-[hsl(var(--damij-accent-2))]/60 shadow-lg hover:shadow-2xl transition-all">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-4">
            <Beaker className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[hsl(var(--damij-accent-2))] mb-2">تجربة حرّة</h3>
          <p className="text-slate-600 leading-relaxed mb-4">صمّم تجربتك من الصفر: اختر التدخّل/الجهاز، أدخل تفاصيله بحرّية، اختر المريض المستهدَف، وراقب النتائج وردّ الفعل.</p>
          <div className="flex items-center gap-2 text-[hsl(var(--damij-accent-2))] font-bold group-hover:gap-3 transition-all">
            <span>ابدأ التصميم</span><ArrowLeft className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
export default ClinicalLab;
