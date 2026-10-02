import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { listSubmissions, type SubmissionRow } from "@/lib/examCreator/api";
import type { ExamQuestion } from "@/lib/examCreator/types";
import { QTYPE_LABEL } from "@/lib/examCreator/types";

interface Props { open: boolean; onClose: () => void; examId: string; title: string; questions: ExamQuestion[] }

const csvCell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // يمنع حقن الصيغ عند فتح الملف في Excel
  return `"${s.replace(/"/g, '""')}"`;
};

export default function ExamResultsDialog({ open, onClose, examId, title, questions }: Props) {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setErr("");
    try { setRows(await listSubmissions(examId)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { if (open) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open, examId]);

  const exportCsv = () => {
    const head = ["الاسم", "الصف/الشعبة", "العلامة الآلية", "من", "أسئلة تحتاج تصحيحاً يدوياً", "الزمن (دقيقة)", "وقت التسليم"];
    const lines = rows.map((r) => [
      r.student_name, r.student_info?.class ?? "", r.auto_score, r.auto_total, r.manual_pending,
      r.time_taken_seconds != null ? Math.round(r.time_taken_seconds / 60) : "", new Date(r.submitted_at).toLocaleString("ar"),
    ].map(csvCell).join(","));
    const blob = new Blob(["\ufeff" + [head.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `نتائج - ${title}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto" dir="rtl">
        <DialogHeader><DialogTitle>نتائج: {title}</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className="ml-1 h-4 w-4" />تحديث</Button>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!rows.length}><Download className="ml-1 h-4 w-4" />تصدير CSV</Button>
        </div>
        {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
        {err && <p className="text-sm text-destructive">{err}</p>}
        {!loading && !err && rows.length === 0 && <p className="py-6 text-center text-muted-foreground">لا توجد تسليمات بعد.</p>}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-right">
                <th className="p-2">الطالب</th><th className="p-2">الصف</th><th className="p-2">العلامة الآلية</th>
                <th className="p-2">تصحيح يدوي</th><th className="p-2">الزمن</th><th className="p-2">التسليم</th><th />
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="border-b">
                      <td className="p-2 font-medium">{r.student_name}</td>
                      <td className="p-2">{r.student_info?.class ?? ""}</td>
                      <td className="p-2">{r.auto_score} / {r.auto_total}</td>
                      <td className="p-2">{r.manual_pending ? `${r.manual_pending} سؤال` : "—"}</td>
                      <td className="p-2">{r.time_taken_seconds != null ? `${Math.round(r.time_taken_seconds / 60)} د` : ""}</td>
                      <td className="p-2 text-xs">{new Date(r.submitted_at).toLocaleString("ar")}</td>
                      <td className="p-2"><Button size="sm" variant="ghost" onClick={() => setOpenId(openId === r.id ? null : r.id)}>{openId === r.id ? "إخفاء" : "الإجابات"}</Button></td>
                    </tr>
                    {openId === r.id && (
                      <tr><td colSpan={7} className="bg-muted/30 p-3">
                        <div className="space-y-2">
                          {questions.map((q, i) => (
                            <div key={q.id} className="rounded border bg-background p-2 text-xs">
                              <div className="font-semibold">{i + 1}) [{QTYPE_LABEL[q.type]}] {q.question}</div>
                              <div>إجابة الطالب: <b>{r.answers?.[String(q.id)] || "—"}</b></div>
                              <div className="text-green-700 dark:text-green-400">الصحيحة: {q.answer}</div>
                            </div>
                          ))}
                        </div>
                      </td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
