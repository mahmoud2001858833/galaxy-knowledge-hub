import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { TableView } from "@/components/exam-creator/QuestionPreview";
import { adminGetQuestions, type AdminHistoryRow } from "@/lib/examCreator/history";
import { DIFFICULTY_AR, LETTERS, QTYPE_LABEL, type ExamQuestion } from "@/lib/examCreator/types";

export default function ExamDetailDialog({ row, onClose }: { row: AdminHistoryRow | null; onClose: () => void }) {
  const [qs, setQs] = useState<ExamQuestion[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!row) return;
    setQs(null); setErr("");
    adminGetQuestions(row).then((r) => setQs(r.questions)).catch((e) => setErr(e.message));
  }, [row]);

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-h-[88vh] max-w-3xl overflow-y-auto text-right">
        <DialogHeader><DialogTitle>{row?.title}</DialogTitle></DialogHeader>
        {row && (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>أنشأه: <b className="text-foreground">{row.owner_name || "—"}</b> {row.owner_email && <span dir="ltr">({row.owner_email})</span>}</p>
            <p>{new Date(row.created_at).toLocaleString("ar")} · {row.question_count} سؤال</p>
            {row.request && <p>طلب المعلم الخاص: «{row.request}»</p>}
          </div>
        )}
        {!qs && !err && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="space-y-3">
          {qs?.map((q, i) => (
            <Card key={q.id ?? i} className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{i + 1}</Badge>
                <Badge variant="secondary">{QTYPE_LABEL[q.type]}</Badge>
                <Badge variant="outline">{DIFFICULTY_AR[q.difficulty]}</Badge>
                {q.unit && <Badge variant="outline" className="max-w-[14rem] truncate">{q.unit}</Badge>}
              </div>
              <p className="leading-loose">{q.question}</p>
              {q.table && <TableView table={q.table} />}
              {q.figure?.url && <img src={q.figure.url} alt={q.figure.caption} className="max-h-60 max-w-full rounded border bg-white object-contain p-1" />}
              {q.figure && !q.figure.url && <p className="text-xs text-muted-foreground">شكل من الصفحة {q.figure.page} {q.figure.caption ? `— ${q.figure.caption}` : ""} (لم تُحفظ صورته لأن الامتحان لم يُنشر إلكترونياً)</p>}
              {q.options && (
                <ul className="space-y-1">
                  {q.options.map((o, oi) => (
                    <li key={oi} className={`rounded px-2 py-0.5 text-sm ${o === q.answer ? "bg-green-100 font-semibold text-green-900 dark:bg-green-900/30 dark:text-green-200" : ""}`}>{LETTERS[oi]}. {o}</li>
                  ))}
                </ul>
              )}
              {!q.options && <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-900 dark:bg-green-900/30 dark:text-green-200"><b>الإجابة:</b> {q.answer}</p>}
              <p className="text-xs text-muted-foreground"><b>الدليل:</b> «{q.evidence}»{q.location ? ` — ${q.location}` : ""}</p>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
