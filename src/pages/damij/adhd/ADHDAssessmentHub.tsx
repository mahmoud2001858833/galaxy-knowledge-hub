import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Eye, Layers, ShieldAlert } from 'lucide-react';

const TESTS = [
  { to: '/damij/adhd/assessment/cpt', icon: Brain, title: 'اختبار CPT', desc: 'الانتباه المستمر · على غرار Conners CPT-3', ready: true, color: 'from-violet-500 to-fuchsia-500' },
  { to: '/damij/adhd/assessment/nback', icon: Layers, title: 'N-Back', desc: 'الذاكرة العاملة · 1-back و 2-back', ready: true, color: 'from-blue-500 to-indigo-500' },
  { to: '/damij/adhd/assessment/stroop', icon: Eye, title: 'Stroop', desc: 'الكفّ المعرفي · ألوان متضاربة', ready: true, color: 'from-emerald-500 to-teal-500' },
  { to: '/damij/adhd/assessment/gonogo', icon: ShieldAlert, title: 'Go / No-Go', desc: 'التحكم بالاندفاع · أخطاء اندفاع', ready: true, color: 'from-rose-500 to-pink-500' },
];

const ADHDAssessmentHub: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع للنظام
      </button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">التقييم العصبي-النفسي</h1>
        <p className="text-[hsl(var(--damij-text))]/70">
          اختبارات أداء فعلية تقيس الوظائف التنفيذية المتأثرة في ADHD. النتائج تُحفظ للمقارنة الطولية.
        </p>
      </header>
      <div className="grid sm:grid-cols-2 gap-4">
        {TESTS.map((t) => (
          <Link
            key={t.title}
            to={t.ready ? t.to : '#'}
            onClick={(e) => { if (!t.ready) e.preventDefault(); }}
            className={`p-5 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 hover:shadow-lg transition ${!t.ready ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center mb-3 shadow`}>
              <t.icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[hsl(var(--damij-primary))]">{t.title}</h3>
              {!t.ready && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">قريباً</span>}
            </div>
            <p className="text-sm text-[hsl(var(--damij-text))]/70">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ADHDAssessmentHub;
