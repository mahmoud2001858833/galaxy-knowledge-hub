import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, ClipboardList, ArrowRight } from 'lucide-react';

// Lab landing — directs to choose a case first
const ClinicalLab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="px-6 pt-12 pb-16 max-w-3xl mx-auto text-center" dir="rtl">
      <FlaskConical className="w-16 h-16 mx-auto text-[hsl(var(--damij-accent-2))] mb-4" />
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-3">ابدأ تجربة سريرية</h1>
      <p className="text-slate-600 mb-6">اختر حالة من المكتبة ثم اختر بروتوكولاً مناسباً لبدء جلسة محاكاة تفاعلية.</p>
      <Link to="/damij/clinical/cases" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold">
        <ClipboardList className="w-5 h-5" /> اختر حالة
      </Link>
    </div>
  );
};
export default ClinicalLab;
