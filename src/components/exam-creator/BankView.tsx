import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Database, Download, Printer, RotateCcw, Search, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuestionPreview from "./QuestionPreview";
import { applyFilter, bankStats, pickFromBank } from "@/lib/examCreator/bankSelect";
import { emptyCounts, sumCounts, type Counts } from "@/lib/examCreator/batchPlan";
import { openPrintWindow } from "@/lib/examCreator/pdfExport";
import { DIFFICULTY_AR, LETTERS, MAX_EXAM_QUESTIONS, QTYPE_LABEL, QTYPE_META, type ExamQuestion, type GeneratedExam, type QType } from "@/lib/examCreator/types";

const PER_PAGE = 20;
const ALL = "__all__";

interface Props {
  bank: GeneratedExam;
  saving: "idle" | "saving" | "saved" | "error";
  backLabel: string;
  onChange: (b: GeneratedExam) => void;
  onBuildExam: (exam: GeneratedExam, requested: number) => void;
  onBack: () => void;
}

const csvCell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // يمنع حقن الصيغ عند فتح الملف في Excel
  return `"${s.replace(/"/g, '""')}"`;
};

function download(name: string, mime: string, content: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

const stripImages = (qs: ExamQuestion[]) => qs.map((q) => ({ ...q, figure: q.figure ? { ...q.figure, dataUrl: undefined } : undefined }));

export default function BankView({ bank, saving, backLabel, onChange, onBuildExam, onBack }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [diff, setDiff] = useState(ALL);
  const [vis, setVis] = useState(ALL);
  const [page, setPage] = useState(0);
  const [useFilter, setUseFilter] = useState(true);

  const stats = useMemo(() => bankStats(bank.questions), [bank.questions]);
  const units = Object.keys(stats.byUnit);

  const filtered = useMemo(() => {
    let r = applyFilter(bank.questions, {
      search, units: unit === ALL ? undefined : [unit], difficulty: diff === ALL ? undefined : [diff as any],
      withVisuals: vis === "only" ? "only" : vis === "none" ? "none" : "any",
    });
    if (type !== ALL) r = r.filter((q) => q.type === type);
    return r;
  }, [bank.questions, search, unit, type, diff, vis]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = filtered.slice(cur * PER_PAGE, (cur + 1) * PER_PAGE);

  // ───── إنشاء امتحان من البنك ─────
  const poolForExam = useFilter ? filtered : bank.questions;
  const available = useMemo(() => {
    const a: Record<string, number> = {};
    poolForExam.forEach((q) => { a[q.type] = (a[q.type] ?? 0) + 1; });
    return a;
  }, [poolForExam]);
  const [counts, setCounts] = useState<Counts>(() => {
    const c = emptyCounts();
    const tot = bank.questions.length || 1;
    (Object.keys(c) as QType[]).forEach((t) => { c[t] = Math.round(((stats.byType[t] ?? 0) / tot) * 30); });
    return c;
  });
  const examTotal = sumCounts(counts);

  const build = () => {
    const { picked, short } = pickFromBank(poolForExam, counts, Date.now());
    if (picked.length === 0) { toast({ title: "⚠️ لا أسئلة كافية", description: "غيّر الفلتر أو الأعداد.", variant: "destructive" }); return; }
    if (Object.keys(short).length) {
      toast({ title: "ℹ️ البنك لا يكفي لبعض الأنواع", description: Object.entries(short).map(([t, n]) => `${QTYPE_LABEL[t as QType]}: ينقص ${n}`).join(" — ") });
    }
    const questions = picked.map((q, i) => ({ ...q, id: i + 1 }));
    onBuildExam({ title: `${bank.title} — امتحان`, questions, meta: bank.meta }, examTotal);
  };

  const exportJson = () => download(`${bank.title}.json`, "application/json", JSON.stringify({ title: bank.title, questions: stripImages(bank.questions) }, null, 1));
  const exportCsv = () => {
    const head = ["#", "النوع", "الوحدة", "الصعوبة", "السؤال", "أ", "ب", "ج", "د", "الإجابة", "الشرح", "المصدر", "شكل", "جدول"];
    const rows = bank.questions.map((q, i) => [
      i + 1, QTYPE_LABEL[q.type], q.unit ?? "", DIFFICULTY_AR[q.difficulty], q.question, ...[0, 1, 2, 3].map((k) => q.options?.[k] ?? ""),
      q.answer, q.explanation ?? "", `${q.location ?? ""} «${q.evidence}»`, q.figure ? "نعم" : "", q.table ? "نعم" : "",
    ].map(csvCell).join(","));
    download(`${bank.title}.csv`, "text/csv;charset=utf-8", "\ufeff" + [head.map(csvCell).join(","), ...rows].join("\n"));
  };
  const printBank = () => {
    if (!openPrintWindow({ ...bank, questions: bank.questions.map((q, i) => ({ ...q, id: i + 1 })) }, "bank")) {
      toast({ title: "⚠️ النافذة محجوبة", description: "اسمح بالنوافذ المنبثقة ثم أعد المحاولة", variant: "destructive" });
    }
  };

  const reset = () => { setSearch(""); setUnit(ALL); setType(ALL); setDiff(ALL); setVis(ALL); setPage(0); };

  return (
    <div className="space-y-5">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-lg font-bold"><Database className="h-5 w-5 text-primary" />
            <Input value={bank.title} onChange={(e) => onChange({ ...bank, title: e.target.value })} className="w-72 font-bold" aria-label="عنوان البنك" />
          </div>
          <span className="text-xs text-muted-foreground">
            {saving === "saving" ? "جارٍ الحفظ..." : saving === "saved" ? "✓ محفوظ تلقائياً في «بنوك أسئلتي»" : saving === "error" ? "⚠️ تعذّر الحفظ التلقائي" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="text-sm">{stats.total} سؤال</Badge>
          {QTYPE_META.map((t) => stats.byType[t.key] ? <Badge key={t.key} variant="secondary">{t.label}: {stats.byType[t.key]}</Badge> : null)}
          {(["easy", "medium", "hard"] as const).map((d) => stats.byDiff[d] ? <Badge key={d} variant="outline">{DIFFICULTY_AR[d]}: {stats.byDiff[d]}</Badge> : null)}
          {stats.visuals > 0 && <Badge variant="outline">بأشكال/جداول: {stats.visuals}</Badge>}
          <Badge variant="outline">{units.length} وحدة</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="ml-1 h-4 w-4" />CSV (Excel)</Button>
          <Button size="sm" variant="outline" onClick={exportJson}><Download className="ml-1 h-4 w-4" />JSON</Button>
          <Button size="sm" variant="outline" onClick={printBank}><Printer className="ml-1 h-4 w-4" />طباعة / PDF بالإجابات</Button>
        </div>
      </Card>

      {/* إنشاء امتحان من البنك */}
      <Card className="space-y-3 border-primary/40 p-4">
        <div className="flex items-center gap-2 font-bold"><Shuffle className="h-5 w-5 text-primary" />أنشئ امتحاناً عشوائياً من هذا البنك (بلا انتظار ولا تكلفة)</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {QTYPE_META.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <span className="text-xs font-medium">{label} <span className="text-muted-foreground">(متاح {available[key] ?? 0})</span></span>
              <Input type="number" min={0} max={MAX_EXAM_QUESTIONS} value={counts[key]}
                onChange={(e) => setCounts({ ...counts, [key]: Math.max(0, Math.min(MAX_EXAM_QUESTIONS, parseInt(e.target.value || "0", 10) || 0)) })} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm"><Switch checked={useFilter} onCheckedChange={setUseFilter} />السحب من نتائج الفلتر الحالي فقط ({filtered.length} سؤال)</label>
          <Button disabled={examTotal < 1 || examTotal > MAX_EXAM_QUESTIONS} onClick={build}>
            <Shuffle className="ml-2 h-4 w-4" />اسحب امتحاناً ({examTotal} سؤال{examTotal > MAX_EXAM_QUESTIONS ? ` — الحد ${MAX_EXAM_QUESTIONS}` : ""})
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">يُوزَّع السحب بالتساوي على الوحدات، وفي كل مرة تحصل على امتحان مختلف. ثم تراجعه وتنزّله PDF أو تنشره برابط.</p>
      </Card>

      {/* الفلتر */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pr-9" placeholder="ابحث في الأسئلة والإجابات..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={unit} onValueChange={(v) => { setUnit(v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="الوحدة" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>كل الوحدات</SelectItem>{units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="النوع" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>كل الأنواع</SelectItem>{QTYPE_META.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={diff} onValueChange={(v) => { setDiff(v); setPage(0); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="الصعوبة" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>كل المستويات</SelectItem>{(["easy", "medium", "hard"] as const).map((d) => <SelectItem key={d} value={d}>{DIFFICULTY_AR[d]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={vis} onValueChange={(v) => { setVis(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="شكل/جدول" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>الكل</SelectItem><SelectItem value="only">بأشكال/جداول فقط</SelectItem><SelectItem value="none">بلا أشكال/جداول</SelectItem></SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={reset} aria-label="مسح الفلتر"><RotateCcw className="h-4 w-4" /></Button>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} سؤال مطابق</div>
      <div className="space-y-3">
        {shown.map((q, i) => (
          <QuestionPreview key={q.id} q={q} index={cur * PER_PAGE + i} showAnswer
            onChange={(nq) => onChange({ ...bank, questions: bank.questions.map((x) => (x.id === q.id ? nq : x)) })}
            onDelete={() => onChange({ ...bank, questions: bank.questions.filter((x) => x.id !== q.id) })} />
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">لا أسئلة مطابقة.</p>}
      </div>

      {filtered.length > PER_PAGE && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronRight className="h-4 w-4" />السابق</Button>
          <span className="text-sm">صفحة {cur + 1} من {pages}</span>
          <Button size="sm" variant="outline" disabled={cur + 1 >= pages} onClick={() => setPage(cur + 1)}>التالي<ChevronLeft className="h-4 w-4" /></Button>
        </div>
      )}

      <Button variant="outline" onClick={onBack}><RotateCcw className="ml-2 h-4 w-4" />{backLabel}</Button>
    </div>
  );
}
