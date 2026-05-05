import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AutismTherapy: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const hasProfile = localStorage.getItem('autism_active_profile');
    if (hasProfile) navigate('/damij/autism/plan', { replace: true });
  }, [navigate]);

  return (
    <div className="px-6 pt-12 pb-16 max-w-3xl mx-auto text-center" dir="rtl">
      <Sparkles className="w-16 h-16 mx-auto text-[hsl(var(--damij-accent-2))] mb-4" />
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-3">العلاج التفاعلي بالذكاء الاصطناعي</h1>
      <p className="text-[hsl(var(--damij-text))]/75 mb-6 leading-relaxed">
        يُولّد الذكاء الاصطناعي خطة علاج تفاعلية مكوّنة من 4 مراحل وعشرات الألعاب المخصّصة لنوع التوحد ومستوى الدعم الخاص بكل حالة.
      </p>
      <button onClick={() => navigate('/damij/autism/diagnosis')}
        className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold">
        ابدأ بالتشخيص للحصول على خطتك
      </button>
    </div>
  );
};

export default AutismTherapy;
