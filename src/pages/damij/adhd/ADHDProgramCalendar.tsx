import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, Lock, Share2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ADHDProgramCalendar: React.FC = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [prog, setProg] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => { (async () => {
    const { data: p } = await supabase.from('adhd_programs').select('*').eq('id', programId).maybeSingle();
    setProg(p);
    const { data: d } = await supabase.from('adhd_program_days').select('*').eq('program_id', programId).order('day_index');
    setDays(d ?? []);
  })(); }, [programId]);

  if (!prog) return <div className="p-12 text-center" dir="rtl">جارٍ التحميل…</div>;

  const completedCount = days.filter(d=>d.status==='completed').length;
  const share = async () => {
    const url = `${window.location.origin}/damij/adhd/share/program/${prog.share_token}`;
    await navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-4xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع</button>
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{prog.child_name}</h1>
            <p className="text-sm opacity-90">{prog.weeks} أسابيع · {prog.daily_minutes} دقيقة/يوم · أُنجز {completedCount}/{days.length}</p>
          </div>
          <button onClick={share} className="bg-white/20 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Share2 className="w-4 h-4" /> مشاركة</button>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-white" style={{ width: `${days.length?(completedCount/days.length)*100:0}%` }} />
        </div>
      </div>

      <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" /> أيام البرنامج</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
        {days.map(d => {
          const completed = d.status === 'completed';
          const today = new Date().toISOString().slice(0,10);
          const locked = d.scheduled_for > today && !completed;
          return (
            <Link key={d.id} to={locked ? '#' : `/damij/adhd/program/${programId}/day/${d.id}`}
              onClick={(e)=>{ if(locked){ e.preventDefault(); toast.info('سيُفتح في موعده'); } }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center border-2 transition-all
                ${completed ? 'bg-emerald-500 text-white border-emerald-600' : locked ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-[hsl(var(--damij-primary))] border-[hsl(var(--damij-warm))]/40 hover:shadow-lg'}`}>
              {completed ? <CheckCircle2 className="w-6 h-6 mb-1" /> : locked ? <Lock className="w-5 h-5 mb-1" /> : <span className="text-xl font-bold">{d.day_index}</span>}
              <span className="text-[10px]">يوم {d.day_index}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default ADHDProgramCalendar;
