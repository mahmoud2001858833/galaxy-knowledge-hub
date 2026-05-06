import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Copy, CheckCircle2, Bell, BellOff, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportElementToPdf } from '@/lib/pdfExport';

const AutismChildPage: React.FC = () => {
  const { token } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { (async () => {
    if (!token) return;
    const { data: prog } = await supabase.from('autism_programs').select('*').eq('share_token', token).maybeSingle();
    setProgram(prog);
    if (prog) {
      const { data: ds } = await supabase.from('autism_program_days').select('*').eq('program_id', prog.id).order('day_index');
      setDays(ds || []);
      const { data: rs } = await supabase.from('autism_day_reports').select('*').in('day_id', (ds || []).map((d: any) => d.id));
      const map: Record<string, any> = {};
      (rs || []).forEach((r: any) => { map[r.day_id] = r; });
      setReports(map);
    }
    setLoading(false);
  })(); }, [token]);

  // Realtime notifications when a new day report is inserted
  useEffect(() => {
    if (!program || days.length === 0) return;
    const dayIds = new Set(days.map(d => d.id));
    const channel = supabase
      .channel(`autism-child-${program.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'autism_day_reports' }, (payload: any) => {
        const row = payload.new;
        if (!dayIds.has(row.day_id)) return;
        setReports(prev => ({ ...prev, [row.day_id]: row }));
        const day = days.find(d => d.id === row.day_id);
        const title = `🎉 يوم جديد مكتمل: ${day?.theme_ar ?? ''}`;
        const body = `الدرجة ${Math.round(row.score)}/100 — ${row.summary_ar?.slice(0, 80) ?? ''}`;
        toast.success(title, { description: body });
        if (notifEnabled && 'Notification' in window && Notification.permission === 'granted') {
          try { new Notification(title, { body, icon: '/favicon.ico' }); } catch {}
        }
        try { new Audio('/message-notification.mp3').play().catch(() => {}); } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [program, days, notifEnabled]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) { toast.error('متصفحك لا يدعم الإشعارات'); return; }
    const p = await Notification.requestPermission();
    if (p === 'granted') { setNotifEnabled(true); toast.success('تم تفعيل إشعارات تقدم الطفل'); }
    else toast.error('تم رفض الإشعارات');
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try { await exportElementToPdf(printRef.current, `child-progress-${program?.title_ar || ''}.pdf`); toast.success('تم التنزيل'); }
    catch { toast.error('تعذّر إنشاء PDF'); }
    finally { setExporting(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!program) return <div className="text-center pt-20">رابط غير صالح</div>;

  const completedCount = Object.keys(reports).length;
  const avgScore = Object.values(reports).reduce((a: number, r: any) => a + (r.score ?? 0), 0) / Math.max(1, completedCount);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20" dir="rtl">
      <div ref={printRef}>
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--damij-primary))]">{program.title_ar}</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">{program.summary_ar}</p>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-white border text-center">
            <div className="text-2xl font-bold">{program.total_days}</div>
            <div className="text-xs text-slate-500">إجمالي الأيام</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-2xl font-bold text-emerald-700">{completedCount}</div>
            <div className="text-xs text-slate-500">مكتمل</div>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center">
            <div className="text-2xl font-bold text-sky-700">{Math.round(avgScore)}</div>
            <div className="text-xs text-slate-500">متوسط الأداء</div>
          </div>
        </div>

        <div className="space-y-2">
          {days.map(d => {
            const r = reports[d.id];
            return (
              <div key={d.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] font-bold flex items-center justify-center">{d.day_index}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{d.theme_ar}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{d.focus_skill_ar}{r ? ` • ${r.summary_ar}` : ''}</div>
                </div>
                {r && <div className="flex items-center gap-1 text-emerald-700 text-sm font-bold shrink-0"><CheckCircle2 className="w-4 h-4" /> {Math.round(r.score)}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('تم نسخ الرابط'); }}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm inline-flex items-center gap-1">
          <Copy className="w-4 h-4" /> نسخ الرابط
        </button>
        <button onClick={enableNotifications}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm inline-flex items-center gap-1">
          {notifEnabled ? <Bell className="w-4 h-4 text-emerald-600" /> : <BellOff className="w-4 h-4" />}
          {notifEnabled ? 'الإشعارات مفعّلة' : 'تفعيل إشعارات الوالدين'}
        </button>
        <button onClick={exportPdf} disabled={exporting}
          className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold inline-flex items-center gap-1">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          تصدير PDF
        </button>
      </div>
    </div>
  );
};

export default AutismChildPage;
