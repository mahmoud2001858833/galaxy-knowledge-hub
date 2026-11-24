import React, { useState } from 'react';
import { BookOpen, Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askLibrary, type ReferenceSource } from '@/lib/referenceBooks/api';
import { ReferenceSourceDialog } from './ReferenceSourceDialog';

/** Test assistant: answers only from the uploaded library and shows which book/page each answer came from. */
export const ReferenceAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; sources: ReferenceSource[] } | null>(null);
  const [open, setOpen] = useState<ReferenceSource | null>(null);

  const ask = async () => {
    if (question.trim().length < 2 || loading) return;
    setLoading(true);
    try {
      setResult(await askLibrary(question.trim()));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذّر الحصول على إجابة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm" dir="rtl">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-black text-foreground">جرّب الذكاء الاصطناعي على المكتبة</h3>
          <p className="text-xs text-muted-foreground">يجيب من الكتب المرفوعة فقط، ويبيّن الكتاب والصفحة. يقرأ النص المحفوظ مسبقاً، فلا يعيد قراءة الملف.</p>
        </div>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="اسأل عن شيء موجود في الكتب المرفوعة..." maxLength={500} />
        <Button type="submit" disabled={loading || question.trim().length < 2} className="bg-gradient-to-r from-brand-from to-brand-to text-primary-foreground">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        </Button>
      </form>

      {result && (
        <div className="mt-4 space-y-3">
          <p className="whitespace-pre-wrap rounded-2xl border border-border bg-background p-4 text-sm leading-7 text-foreground">{result.answer}</p>
          {result.sources.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground">المصادر (اضغط لعرض الصفحة):</p>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((s, i) => (
                  <button
                    key={`${s.bookId}-${i}`}
                    type="button"
                    onClick={() => setOpen(s)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-accent"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    [{i + 1}] {s.bookTitle.slice(0, 40)}
                    {s.pageNumber ? ` — ص ${s.pageNumber}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ReferenceSourceDialog source={open} onClose={() => setOpen(null)} />
    </section>
  );
};
