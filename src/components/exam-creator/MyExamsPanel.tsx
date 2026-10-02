import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BarChart3, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listMyExams, setExamActive, type MyExamRow } from "@/lib/examCreator/api";
import ExamResultsDialog from "./ExamResultsDialog";

export default function MyExamsPanel() {
  const { toast } = useToast();
  const [rows, setRows] = useState<MyExamRow[] | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<MyExamRow | null>(null);

  useEffect(() => {
    listMyExams().then(setRows).catch((e) => { setErr(e.message); setRows([]); });
  }, []);

  if (rows === null) return <Loader2 className="mx-auto h-5 w-5 animate-spin" />;
  if (err) {
    const missing = /relation|does not exist|schema cache/i.test(err);
    return <p className="text-xs text-muted-foreground">{missing ? "ميزة الامتحانات الإلكترونية تحتاج تطبيق migration قاعدة البيانات أولاً." : `تعذّر تحميل امتحاناتك: ${err}`}</p>;
  }
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">امتحاناتي المنشورة</h3>
      {rows.map((r) => (
        <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <div className="truncate font-medium">{r.title}</div>
            <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar")} · {r.exam.questions.length} سؤال</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "مفتوح" : "مغلق"}</Badge>
            <label className="flex items-center gap-1 text-xs">
              <Switch checked={r.is_active} onCheckedChange={async (v) => {
                try { await setExamActive(r.id, v); setRows(rows.map((x) => (x.id === r.id ? { ...x, is_active: v } : x))); }
                catch (e: any) { toast({ title: "⚠️ تعذّر التحديث", description: e.message, variant: "destructive" }); }
              }} />
            </label>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/exam/${r.token}`); toast({ title: "✅ تم نسخ الرابط" }); }}>
              <Copy className="ml-1 h-4 w-4" />الرابط
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(r)}><BarChart3 className="ml-1 h-4 w-4" />النتائج ({r.submissions})</Button>
          </div>
        </Card>
      ))}
      {open && <ExamResultsDialog open onClose={() => setOpen(null)} examId={open.id} title={open.title} questions={open.exam.questions} />}
    </div>
  );
}
