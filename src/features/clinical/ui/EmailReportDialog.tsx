import React, { useState } from 'react';
import { Loader2, Mail, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'damij_clinical_report_emails';

interface Props {
  reportId: string;
  trigger?: React.ReactNode;
}

const EmailReportDialog: React.FC<Props> = ({ reportId, trigger }) => {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[""]'); } catch { return ['']; }
  });
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const clean = emails.map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (!clean.length) { toast.error('أدخل بريداً صحيحاً'); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-email-report', {
        body: { reportId, toEmails: clean, note: note.trim() || undefined },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      toast.success(`📧 أُرسل التقرير إلى ${clean.length} بريد`);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر الإرسال');
    } finally { setSending(false); }
  };

  return (
    <>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}>
        {trigger || (
          <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center gap-1">
            <Mail className="w-4 h-4" /> إرسال بالبريد
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} dir="rtl"
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-[hsl(var(--damij-primary))] flex items-center gap-2">
                <Mail className="w-5 h-5" /> إرسال التقرير بالبريد
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2 mb-3">
              {emails.map((e, i) => (
                <div key={i} className="flex gap-2">
                  <input value={e} onChange={ev => setEmails(emails.map((x, j) => j === i ? ev.target.value : x))}
                    type="email" placeholder="parent@example.com"
                    className="flex-1 px-3 py-2 rounded-lg border bg-white text-sm" dir="ltr" />
                  {emails.length > 1 && (
                    <button onClick={() => setEmails(emails.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg border text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setEmails([...emails, ''])}
                className="text-xs flex items-center gap-1 text-[hsl(var(--damij-accent-2))] font-bold">
                <Plus className="w-3 h-3" /> إضافة بريد آخر
              </button>
            </div>

            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="ملاحظة قصيرة (اختياري)…" rows={2}
              className="w-full px-3 py-2 rounded-lg border bg-white text-sm mb-4 resize-none" />

            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border bg-white font-bold text-sm">إلغاء</button>
              <button onClick={send} disabled={sending}
                className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailReportDialog;
