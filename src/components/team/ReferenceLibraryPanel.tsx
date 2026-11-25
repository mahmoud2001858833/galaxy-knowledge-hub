import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Download, Loader2, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  deleteReferenceBook,
  downloadReferenceBook,
  ingestBook,
  listReferenceBooks,
  type BookStatus,
  type ReferenceBook,
} from '@/lib/referenceBooks/api';
import { BOOK_ACCEPT, validateBookFile } from '@/lib/referenceBooks/extract';
import { BOOK_GRADES, BOOK_SEMESTERS, BOOK_SUBJECTS } from '@/lib/referenceBooks/options';
import { ReferenceAssistant } from '@/components/referenceBooks/ReferenceAssistant';
import { errorMessage, formatDate, useTeamMembers } from './teamApi';

const STATUS_LABEL: Record<BookStatus, string> = {
  uploading: 'قيد الرفع',
  processing: 'قيد المعالجة',
  ready: 'جاهز للذكاء الاصطناعي',
  failed: 'فشلت المعالجة',
};

const formatSize = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

interface QueueItem {
  id: number;
  file: File;
  title: string;
  grade: string;
  subject: string;
  semester: string;
  phase: string;
  fraction: number;
  state: 'draft' | 'waiting' | 'running' | 'done' | 'error';
  error?: string;
}

const MetaSelect: React.FC<{ label: string; value: string; options: readonly string[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="h-9 text-sm" aria-label={label}>
      <SelectValue placeholder={label} />
    </SelectTrigger>
    <SelectContent dir="rtl">
      {options.map((o) => (
        <SelectItem key={o} value={o}>
          {o}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/** Reference-library tab: upload-team members add books; only leads see the full catalogue and the files. */
export const ReferenceLibraryPanel: React.FC<{ me: string; isLead: boolean }> = ({ me, isLead }) => {
  const { members } = useTeamMembers();
  const [books, setBooks] = useState<ReferenceBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ReferenceBook | null>(null);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    try {
      setBooks(await listReferenceBooks());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);

  const patch = (id: number, p: Partial<QueueItem>) => setQueue((q) => q.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const queueRef = useRef(queue);
  queueRef.current = queue;
  const chain = useRef<Promise<void>>(Promise.resolve());

  const runOne = useCallback(async (id: number) => {
    const it = queueRef.current.find((x) => x.id === id);
    if (!it) return;
    patch(id, { state: 'running' });
    try {
      await ingestBook(it.file, it.title.trim(), { grade: it.grade, subject: it.subject, semester: it.semester }, (p) =>
        patch(id, { phase: p.phase, fraction: p.fraction }),
      );
      patch(id, { state: 'done', phase: 'اكتملت المعالجة', fraction: 1 });
    } catch (e) {
      patch(id, { state: 'error', error: errorMessage(e) });
    }
    await reload();
  }, [reload]);

  const startUpload = (id: number) => {
    patch(id, { state: 'waiting', phase: 'في الانتظار' });
    chain.current = chain.current.then(() => runOne(id));
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const items: QueueItem[] = [];
    for (const file of Array.from(files)) {
      const bad = validateBookFile(file);
      if (bad) {
        toast.error(bad);
        continue;
      }
      items.push({
        id: nextId.current++, file, title: file.name.replace(/\.[^.]+$/, ''), grade: '', subject: '', semester: '',
        phase: '', fraction: 0, state: 'draft',
      });
    }
    if (!items.length) return;
    setQueue((q) => [...q, ...items]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const uploaderName = useMemo(() => {
    const m = new Map(members.map((x) => [x.user_id, x.display_name || x.email]));
    return (id: string) => (id === me ? 'أنت' : m.get(id) || 'عضو');
  }, [members, me]);

  const onDownload = async (b: ReferenceBook) => {
    setBusyId(b.id);
    try {
      window.open(await downloadReferenceBook(b.id), '_blank', 'noopener');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async () => {
    const b = toDelete;
    if (!b) return;
    setToDelete(null);
    setBusyId(b.id);
    try {
      await deleteReferenceBook(b.id);
      toast.success('حُذف الكتاب من المكتبة والتخزين');
      await reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const active = queue.filter((q) => q.state === 'running' || q.state === 'waiting');

  return (
    <div className="space-y-5" dir="rtl">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-black text-foreground">مكتبة المراجع</h2>
            <p className="text-sm text-muted-foreground">
              ارفع كتباً ومراجع (PDF، Word، أو صور ممسوحة) ليقرأها الذكاء الاصطناعي ويستعين بها في أجوبته. الحد الأقصى 500 ميجابايت للملف.
            </p>
          </div>
        </div>

        <input ref={inputRef} type="file" multiple accept={BOOK_ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <Button type="button" onClick={() => inputRef.current?.click()} className="bg-gradient-to-r from-brand-from to-brand-to text-primary-foreground">
          <Upload className="ml-2 h-4 w-4" aria-hidden />
          اختر ملفات للرفع
        </Button>
        {active.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-warning">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            لا تغلق هذه الصفحة حتى تنتهي المعالجة: قراءة النص تتم في متصفحك.
          </p>
        )}

        {queue.length > 0 && (
          <ul className="mt-4 space-y-3">
            {queue.map((q) => (
              <li key={q.id} className="rounded-2xl border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <Input
                    value={q.title}
                    disabled={q.state !== 'draft'}
                    onChange={(e) => patch(q.id, { title: e.target.value })}
                    className="h-8 max-w-sm text-sm font-bold"
                    placeholder="اسم الكتاب"
                    aria-label="اسم الكتاب"
                  />
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {formatSize(q.file.size)}
                    {q.state === 'draft' && (
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setQueue((x) => x.filter((i) => i.id !== q.id))} aria-label="إزالة">
                        <X className="h-4 w-4" aria-hidden />
                      </Button>
                    )}
                  </span>
                </div>
                {q.state === 'draft' ? (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <MetaSelect label="الصف" value={q.grade} options={BOOK_GRADES} onChange={(v) => patch(q.id, { grade: v })} />
                      <MetaSelect label="المادة" value={q.subject} options={BOOK_SUBJECTS} onChange={(v) => patch(q.id, { subject: v })} />
                      <MetaSelect label="الفصل" value={q.semester} options={BOOK_SEMESTERS} onChange={(v) => patch(q.id, { semester: v })} />
                    </div>
                    <Button
                      type="button"
                      className="mt-3 bg-gradient-to-r from-brand-from to-brand-to text-primary-foreground"
                      disabled={!q.title.trim() || !q.grade || !q.subject || !q.semester}
                      onClick={() => startUpload(q.id)}
                    >
                      <Upload className="ml-2 h-4 w-4" aria-hidden />
                      ابدأ الرفع
                    </Button>
                  </>
                ) : q.state === 'error' ? (
                  <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                    <AlertTriangle className="h-4 w-4" aria-hidden />
                    {q.error}
                  </p>
                ) : (
                  <>
                    <Progress value={Math.round(q.fraction * 100)} className="h-2" />
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {q.state === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                      {q.state === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />}
                      {q.phase}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReferenceAssistant />

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-base font-black text-foreground">{isLead ? `كل الكتب المرفوعة (${books.length})` : `ما رفعته أنت (${books.length})`}</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : books.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">لا توجد كتب بعد.</p>
        ) : (
          <ul className="divide-y divide-border">
            {books.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(b.size_bytes)} · {formatDate(b.created_at)}
                    {isLead && ` · ${uploaderName(b.uploaded_by)}`}
                    {b.status === 'ready' && b.total_pages ? ` · ${b.total_pages} صفحة` : ''}
                    {[b.grade, b.subject, b.semester].filter(Boolean).length > 0 && ` · ${[b.grade, b.subject, b.semester].filter(Boolean).join(' · ')}`}
                  </p>
                  {b.status === 'failed' && b.error_message && <p className="mt-1 text-xs text-destructive">{b.error_message}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={b.status === 'failed' ? 'destructive' : b.status === 'ready' ? 'default' : 'secondary'}>{STATUS_LABEL[b.status]}</Badge>
                  {isLead && (
                    <>
                      <Button size="icon" variant="outline" disabled={busyId === b.id} onClick={() => void onDownload(b)} aria-label="تنزيل الملف الأصلي">
                        {busyId === b.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
                      </Button>
                      <Button size="icon" variant="outline" disabled={busyId === b.id} onClick={() => setToDelete(b)} aria-label="حذف الكتاب">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف «{toDelete?.title}»؟</AlertDialogTitle>
            <AlertDialogDescription>سيُحذف الملف من التخزين ويتوقف الذكاء الاصطناعي عن استخدام نصه. لا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete()}>حذف نهائي</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
