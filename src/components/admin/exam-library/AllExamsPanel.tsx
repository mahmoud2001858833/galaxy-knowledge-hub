import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BarChart3, ChevronLeft, ChevronRight, Copy, Eye, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExamResultsDialog from "@/components/exam-creator/ExamResultsDialog";
import {
  adminDeleteExam, adminGetQuestions, adminListHistory, adminSetOnlineActive, type AdminHistoryRow,
} from "@/lib/examCreator/history";
import type { ExamQuestion } from "@/lib/examCreator/types";
import ExamDetailDialog from "./ExamDetailDialog";

const PAGE = 25;

export default function AllExamsPanel() {
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminHistoryRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<AdminHistoryRow | null>(null);
  const [results, setResults] = useState<{ row: AdminHistoryRow; questions: ExamQuestion[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setRows(null); setErr("");
    try {
      const r = await adminListHistory(PAGE, p * PAGE);
      setRows(r.rows); setTotal(r.total);
    } catch (e: any) { setErr(e.message); setRows([]); }
  }, []);
  useEffect(() => { load(page); }, [page, load]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows ?? [];
    return (rows ?? []).filter((r) => [r.title, r.owner_name, r.owner_email, r.subject, r.grade].some((x) => (x ?? "").toLowerCase().includes(s)));
  }, [rows, q]);

  const online = (rows ?? []).filter((r) => r.online_exam_id).length;
  const subs = (rows ?? []).reduce((s, r) => s + r.submissions, 0);

  const toggle = async (r: AdminHistoryRow, v: boolean) => {
    if (!r.online_exam_id) return;
    try { await adminSetOnlineActive(r.online_exam_id, v); setRows((x) => x!.map((y) => (y.id === r.id ? { ...y, online_active: v } : y))); }
    catch (e: any) { toast({ title: "⚠️ تعذّر التحديث", description: e.message, variant: "destructive" }); }
  };

  const openResults = async (r: AdminHistoryRow) => {
    setBusy(r.id);
    try { const { questions } = await adminGetQuestions(r); setResults({ row: r, questions }); }
    catch (e: any) { toast({ title: "⚠️ تعذّر فتح النتائج", description: e.message, variant: "destructive" }); }
    finally { setBusy(null); }
  };

  const remove = async (r: AdminHistoryRow) => {
    if (!window.confirm(`حذف امتحان «${r.title}»${r.online_exam_id ? " ورابطه ونتائج طلابه" : ""} نهائياً؟`)) return;
    setBusy(r.id);
    try { await adminDeleteExam(r); toast({ title: "✅ تم الحذف" }); load(page); }
    catch (e: any) { toast({ title: "⚠️ تعذّر الحذف", description: e.message, variant: "destructive" }); }
    finally { setBusy(null); }
  };

  const srcText = (r: AdminHistoryRow) =>
    (r.sources ?? []).map((s) => (s.kind === "library" ? `📚 ${s.title}` : `📎 ${s.name}`)).join("، ") || "—";

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center"><div className="text-2xl font-black">{total}</div><div className="text-xs text-muted-foreground">امتحان مُنشأ</div></Card>
        <Card className="p-3 text-center"><div className="text-2xl font-black">{online}</div><div className="text-xs text-muted-foreground">برابط إلكتروني (في هذه الصفحة)</div></Card>
        <Card className="p-3 text-center"><div className="text-2xl font-black">{subs}</div><div className="text-xs text-muted-foreground">تسليم طالب (في هذه الصفحة)</div></Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pr-9" placeholder="بحث باسم المعلم أو بريده أو عنوان الامتحان..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" onClick={() => load(page)} aria-label="تحديث"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {rows === null && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
      {err && <p className="text-sm text-destructive">{/function|does not exist|schema cache/i.test(err) ? "طبّق migration السجل أولاً (20261002130000_exam_history_admin.sql)." : err}</p>}
      {rows && shown.length === 0 && !err && <p className="py-8 text-center text-muted-foreground">لا توجد امتحانات{q ? " مطابقة" : " بعد"}.</p>}

      <div className="space-y-3">
        {shown.map((r) => (
          <Card key={r.id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground">
                  {r.owner_name || "مستخدم"} {r.owner_email && <span dir="ltr">· {r.owner_email}</span>} · {new Date(r.created_at).toLocaleString("ar")}
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <Badge variant="outline">{r.question_count} سؤال</Badge>
                  {r.grade && <Badge variant="secondary">{r.grade}</Badge>}
                  {r.subject && <Badge variant="secondary">{r.subject}</Badge>}
                  {(r.sources?.length ?? 0) > 1 && <Badge>ملفات مدمجة ({r.sources.length})</Badge>}
                </div>
                <div className="truncate text-xs text-muted-foreground">المصادر: {srcText(r)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {r.online_exam_id ? (
                  <>
                    <label className="flex items-center gap-1 text-xs">
                      <Switch checked={!!r.online_active} onCheckedChange={(v) => toggle(r, v)} />{r.online_active ? "مفتوح" : "مغلق"}
                    </label>
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/exam/${r.online_token}`); toast({ title: "✅ تم نسخ الرابط" }); }}>
                      <Copy className="ml-1 h-4 w-4" />الرابط
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => openResults(r)}><BarChart3 className="ml-1 h-4 w-4" />النتائج ({r.submissions})</Button>
                  </>
                ) : <Badge variant="secondary">بلا رابط إلكتروني</Badge>}
                <Button size="sm" variant="outline" onClick={() => setDetail(r)}><Eye className="ml-1 h-4 w-4" />عرض</Button>
                <Button size="sm" variant="ghost" className="text-destructive" disabled={busy === r.id} onClick={() => remove(r)}><Trash2 className="ml-1 h-4 w-4" />حذف</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {total > PAGE && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronRight className="h-4 w-4" />السابق</Button>
          <span className="text-sm">صفحة {page + 1} من {pages}</span>
          <Button size="sm" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>التالي<ChevronLeft className="h-4 w-4" /></Button>
        </div>
      )}

      <ExamDetailDialog row={detail} onClose={() => setDetail(null)} />
      {results && results.row.online_exam_id && (
        <ExamResultsDialog open onClose={() => setResults(null)} examId={results.row.online_exam_id} title={results.row.title} questions={results.questions} />
      )}
    </div>
  );
}
