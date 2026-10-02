import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Pencil, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeUnits } from "@/lib/examCreator/api";
import { prepareFile } from "@/lib/examCreator/fileUtils";
import {
  deleteLibraryRow, downloadLibraryFile, insertLibraryRow, LIBRARY_ACCEPT, listLibrary, updateLibraryRow, uploadToLibrary, type LibraryRow,
} from "@/lib/examCreator/library";
import { sanitizeCachedUnits } from "@/lib/examCreator/mergeUnits";
import type { UnitInfo } from "@/lib/examCreator/types";

type Phase = "idle" | "upload" | "analyze" | "save";
const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** تقسيم الملف إلى وحدات مرة واحدة (يُخزَّن ويُعاد استعماله لكل المستخدمين بلا تكلفة ذكاء اصطناعي). */
async function analyzeFile(file: File, onMsg: (m: string) => void) {
  const prep = await prepareFile(file, onMsg);
  onMsg("الذكاء الاصطناعي يقسّم الملف إلى وحدات...");
  const res = await analyzeUnits([prep]);
  const units: UnitInfo[] = res.units.map((u) => ({ ...u, fileIndex: 0 }));
  const maxPage = units.reduce((m, u) => Math.max(m, u.pageEnd ?? 0), 0);
  return { units, pages: prep.large?.numPages ?? (maxPage || null), subject: res.subjectGuess, grade: res.gradeGuess };
}

export default function LibraryManager() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<LibraryRow[] | null>(null);
  const [err, setErr] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [desc, setDesc] = useState("");
  const [publish, setPublish] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState("");
  const [busyRow, setBusyRow] = useState<string | null>(null);
  const [edit, setEdit] = useState<LibraryRow | null>(null);

  const load = () => listLibrary().then(setRows).catch((e) => { setErr(e.message); setRows([]); });
  useEffect(() => { load(); }, []);

  const pick = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const upload = async () => {
    if (!file || !title.trim()) return;
    try {
      setPhase("upload"); setPct(0);
      const path = await uploadToLibrary(file, setPct);

      setPhase("analyze"); setMsg("جارٍ قراءة الملف...");
      let units: UnitInfo[] | null = null, pages: number | null = null, sg = "", gg = "";
      try {
        const a = await analyzeFile(file, setMsg);
        units = a.units; pages = a.pages; sg = a.subject; gg = a.grade;
      } catch (e: any) {
        toast({ title: "ℹ️ تعذّر التقسيم التلقائي", description: `سيُحفظ الملف، وسيُقسَّم عند أول استخدام. (${e.message})` });
      }

      setPhase("save");
      const row = await insertLibraryRow({
        title, description: desc, subject: subject || sg, grade: grade || gg, file, storage_path: path,
        page_count: pages, units, is_published: publish,
      });
      setRows((r) => [row, ...(r ?? [])]);
      toast({ title: "✅ تم رفع الملف", description: publish ? "صار متاحاً لكل المستخدمين." : "محفوظ كمسودة؛ انشره عندما تريد." });
      setFile(null); setTitle(""); setSubject(""); setGrade(""); setDesc("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      toast({ title: "⚠️ تعذّر رفع الملف", description: e.message, variant: "destructive" });
    } finally { setPhase("idle"); setMsg(""); }
  };

  const togglePublish = async (r: LibraryRow, v: boolean) => {
    try { await updateLibraryRow(r.id, { is_published: v }); setRows((x) => x!.map((y) => (y.id === r.id ? { ...y, is_published: v } : y))); }
    catch (e: any) { toast({ title: "⚠️ تعذّر التحديث", description: e.message, variant: "destructive" }); }
  };

  const reanalyze = async (r: LibraryRow) => {
    setBusyRow(r.id);
    try {
      const f = await downloadLibraryFile(r, (p) => setMsg(`تنزيل ${p}%`));
      const a = await analyzeFile(f, setMsg);
      await updateLibraryRow(r.id, { units: a.units, page_count: a.pages });
      setRows((x) => x!.map((y) => (y.id === r.id ? { ...y, units: a.units, page_count: a.pages } : y)));
      toast({ title: "✅ أُعيد تقسيم الملف", description: `${a.units.length} وحدة` });
    } catch (e: any) { toast({ title: "⚠️ تعذّر التحليل", description: e.message, variant: "destructive" }); }
    finally { setBusyRow(null); setMsg(""); }
  };

  const remove = async (r: LibraryRow) => {
    if (!window.confirm(`حذف «${r.title}» نهائياً؟ لن يظهر للمستخدمين بعد الآن (الامتحانات التي أُنشئت منه تبقى).`)) return;
    setBusyRow(r.id);
    try { await deleteLibraryRow(r); setRows((x) => x!.filter((y) => y.id !== r.id)); toast({ title: "✅ تم الحذف" }); }
    catch (e: any) { toast({ title: "⚠️ تعذّر الحذف", description: e.message, variant: "destructive" }); }
    finally { setBusyRow(null); }
  };

  const saveEdit = async () => {
    if (!edit) return;
    try {
      await updateLibraryRow(edit.id, { title: edit.title.trim(), subject: edit.subject?.trim() || null, grade: edit.grade?.trim() || null, description: edit.description?.trim() || null });
      setRows((x) => x!.map((y) => (y.id === edit.id ? edit : y)));
      setEdit(null);
    } catch (e: any) { toast({ title: "⚠️ تعذّر الحفظ", description: e.message, variant: "destructive" }); }
  };

  const busy = phase !== "idle";

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-lg font-bold"><UploadCloud className="h-5 w-5 text-primary" />رفع ملف جديد للمكتبة</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label>الملف (PDF / Word / نص / صورة)</Label>
            <Input ref={fileRef} type="file" accept={LIBRARY_ACCEPT} disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
            {file && <p className="text-xs text-muted-foreground">{file.name} — {fmtSize(file.size)}</p>}
          </div>
          <Input placeholder="عنوان الملف في المكتبة *" value={title} maxLength={200} disabled={busy} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="المادة (اختياري، يُخمَّن تلقائياً)" value={subject} disabled={busy} onChange={(e) => setSubject(e.target.value)} />
          <Input placeholder="الصف (اختياري، يُخمَّن تلقائياً)" value={grade} disabled={busy} onChange={(e) => setGrade(e.target.value)} />
          <label className="flex items-center justify-between rounded-lg border px-3 text-sm">
            نشر للمستخدمين فور الرفع <Switch checked={publish} disabled={busy} onCheckedChange={setPublish} />
          </label>
          <Textarea className="sm:col-span-2" placeholder="وصف مختصر (اختياري)" value={desc} maxLength={1000} disabled={busy} onChange={(e) => setDesc(e.target.value)} />
        </div>

        {phase === "upload" && (<div className="space-y-1"><Progress value={pct} /><p className="text-xs text-muted-foreground">جارٍ الرفع... {pct}%</p></div>)}
        {phase === "analyze" && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{msg || "جارٍ التحليل..."}</p>}
        {phase === "save" && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />جارٍ الحفظ...</p>}

        <Button disabled={busy || !file || !title.trim()} onClick={upload}>
          {busy ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <UploadCloud className="ml-2 h-4 w-4" />}ارفع وقسّم الملف إلى وحدات
        </Button>
        <p className="text-xs text-muted-foreground">يُقسَّم الملف إلى وحدات مرة واحدة هنا، فيبدأ المستخدمون باختيار الوحدات مباشرة بلا انتظار.</p>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">ملفات المكتبة {rows ? `(${rows.length})` : ""}</h3>
        {rows === null && <Loader2 className="mx-auto h-5 w-5 animate-spin" />}
        {err && <p className="text-sm text-destructive">{/relation|does not exist|schema cache/i.test(err) ? "طبّق migration المكتبة أولاً (20261002120000_exam_library.sql)." : err}</p>}
        {rows?.length === 0 && !err && <p className="py-6 text-center text-muted-foreground">لا توجد ملفات بعد.</p>}
        {rows?.map((r) => {
          const units = sanitizeCachedUnits(r.units);
          return (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <FileText className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 space-y-1">
                  <div className="truncate font-semibold">{r.title}</div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {r.grade && <Badge variant="secondary">{r.grade}</Badge>}
                    {r.subject && <Badge variant="secondary">{r.subject}</Badge>}
                    <Badge variant="outline">{fmtSize(r.size_bytes)}</Badge>
                    {r.page_count ? <Badge variant="outline">{r.page_count} صفحة</Badge> : null}
                    <Badge variant={units ? "outline" : "destructive"}>{units ? `${units.length} وحدة` : "بلا تقسيم"}</Badge>
                  </div>
                  {r.description && <p className="line-clamp-2 text-xs text-muted-foreground">{r.description}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={r.is_published} disabled={busyRow === r.id} onCheckedChange={(v) => togglePublish(r, v)} />
                  {r.is_published ? "منشور" : "مسودة"}
                </label>
                <Button size="sm" variant="outline" disabled={busyRow === r.id} onClick={() => setEdit({ ...r })}><Pencil className="ml-1 h-4 w-4" />تعديل</Button>
                <Button size="sm" variant="outline" disabled={busyRow === r.id} onClick={() => reanalyze(r)}>
                  {busyRow === r.id ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-1 h-4 w-4" />}{busyRow === r.id && msg ? msg : "إعادة التقسيم"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" disabled={busyRow === r.id} onClick={() => remove(r)}><Trash2 className="ml-1 h-4 w-4" />حذف</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle>تعديل بيانات الملف</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <Input value={edit.title} maxLength={200} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="العنوان" />
              <Input value={edit.subject ?? ""} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} placeholder="المادة" />
              <Input value={edit.grade ?? ""} onChange={(e) => setEdit({ ...edit, grade: e.target.value })} placeholder="الصف" />
              <Textarea value={edit.description ?? ""} maxLength={1000} onChange={(e) => setEdit({ ...edit, description: e.target.value })} placeholder="الوصف" />
            </div>
          )}
          <DialogFooter><Button disabled={!edit?.title.trim()} onClick={saveEdit}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
