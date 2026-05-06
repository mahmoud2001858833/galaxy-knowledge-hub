import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Layers, ShieldAlert, Clock } from 'lucide-react';

const ITEMS = [
  { to: '/damij/adhd/training/focus', icon: Target, title: 'باني التركيز', desc: 'Pomodoro متدرّج 5→25 دقيقة', ready: true, color: 'from-emerald-500 to-teal-500' },
  { to: '#', icon: Layers, title: 'مدرّب الذاكرة العاملة', desc: 'مهام Dual N-Back', ready: false, color: 'from-blue-500 to-indigo-500' },
  { to: '#', icon: ShieldAlert, title: 'لعبة الكفّ (Stop-Signal)', desc: 'تدريب التحكم بالاندفاع', ready: false, color: 'from-rose-500 to-pink-500' },
  { to: '#', icon: Clock, title: 'إدراك الوقت', desc: 'تقدير الفترات الزمنية (Barkley)', ready: false, color: 'from-amber-500 to-orange-500' },
];

const ADHDTrainingHub: React.FC = () => {
  const nav = useNavigate();
  return (
    <div className="px-6 pt-12 pb-12 max-w-4xl mx-auto" dir="rtl">
      <button onClick={() => nav('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">التدريب العلاجي التكيّفي</h1>
        <p className="text-[hsl(var(--damij-text))]/70">تمارين معرفية مبنية على Russell Barkley و CHADD لتحسين الوظائف التنفيذية.</p>
      </header>
      <div className="grid sm:grid-cols-2 gap-4">
        {ITEMS.map((it) => (
          <Link
            key={it.title}
            to={it.ready ? it.to : '#'}
            onClick={(e) => !it.ready && e.preventDefault()}
            className={`p-5 rounded-2xl bg-white border border-[hsl(var(--damij-primary))]/10 hover:shadow-lg transition ${!it.ready ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.color} text-white flex items-center justify-center mb-3 shadow`}>
              <it.icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[hsl(var(--damij-primary))]">{it.title}</h3>
              {!it.ready && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">قريباً</span>}
            </div>
            <p className="text-sm text-[hsl(var(--damij-text))]/70">{it.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ADHDTrainingHub;
