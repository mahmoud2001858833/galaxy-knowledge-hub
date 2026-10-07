import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Database, FileText, Loader2, Sparkles, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Progress as RunProgress } from "@/lib/examCreator/batchGenerate";
import { defaultHeader, shrinkLogo } from "@/lib/examCreator/teacherProfile";
import { jordanHeaderHtml } from "@/lib/examCreator/pdfExport";
import { MAX_BANK_QUESTIONS, MAX_EXAM_QUESTIONS, QTYPE_META, type CreatorMode, type ExamHeader, type QType } from "@/lib/examCreator/types";

export interface SettingsState {
  mode: CreatorMode;
  counts: Record<QType, number>;
  figureQuestions: number;
  tableQuestions: number;
  difficulty: string;
  language: string;
  distribution: "by_unit" | "by_file";
  grade: string;
  subject: string;
  request: string;
  includeFigures: boolean;
  includeTables: boolean;
  /** تدقيق كل سؤال مقابل الملف (أدق لكنه أبطأ) */
  verify: boolean;
  schoolName: string;
  teacherName: string;
  durationMinutes: number;
  header: ExamHeader;
}

export const DEFAULT_SETTINGS: SettingsState = {
  mode: "exam", figureQuestions: 2, tableQuestions: 2,
  counts: { multiple_choice: 6, true_false: 2, fill_blank: 2, short_answer: 0, essay: 0 },
  difficulty: "mixed", language: "auto", distribution: "by_unit", grade: "", subject: "", request: "",
  includeFigures: true, includeTables: true, verify: true, schoolName: "", teacherName: "", durationMinutes: 45, header: defaultHeader(),
};

const PRESETS: Record<CreatorMode, { label: string; counts: Record<QType, number> }[]> = {
  exam: [
    { label: "سريع (10)", counts: { multiple_choice: 6, true_false: 2, fill_blank: 2, short_answer: 0, essay: 0 } },
    { label: "اختبار قصير (20)", counts: { multiple_choice: 10, true_false: 4, fill_blank: 4, short_answer: 2, essay: 0 } },
    { label: "نهائي (30)", counts: { multiple_choice: 12, true_false: 6, fill_blank: 6, short_answer: 4, essay: 2 } },
    { label: "شامل (60)", counts: { multiple_choice: 30, true_false: 12, fill_blank: 10, short_answer: 6, essay: 2 } },
    { label: "أقصى (100)", counts: { multiple_choice: 50, true_false: 20, fill_blank: 15, short_answer: 10, essay: 5 } },
  ],
  bank: [
    { label: "200 سؤال", counts: { multiple_choice: 120, true_false: 40, fill_blank: 24, short_answer: 12, essay: 4 } },
    { label: "500 سؤال", counts: { multiple_choice: 300, true_false: 100, fill_blank: 60, short_answer: 30, essay: 10 } },
    { label: "600 سؤال", counts: { multiple_choice: 360, true_false: 120, fill_blank: 70, short_answer: 40, essay: 10 } },
    { label: "1000 سؤال", counts: { multiple_choice: 600, true_false: 200, fill_blank: 120, short_answer: 60, essay: 20 } },
  ],
};

const REQUEST_IDEAS = [
  "اجعل الأسئلة تطبيقية وتقيس الفهم لا الحفظ",
  "ركّز على التعريفات والمصطلحات العلمية",
  "أدرج أسئلة تعتمد على الجداول الموجودة في الملف",
  "أدرج أسئلة تعتمد على الأشكال والمخططات الموجودة في الملف",
  "اجعل المشتتات في الاختيار من متعدد قريبة من الإجابة الصحيحة",
];

interface Props {
  s: SettingsState;
  onChange: (s: SettingsState) => void;
  canFigures: boolean;
  unitsHaveFigures: boolean;
  unitsHaveTables: boolean;
  filesUsed: number;
  busy: boolean;
  stage: string;
  progress: RunProgress | null;
  onCancel: () => void;
  onBack: () => void;
  onGenerate: () => void;
}

export default function StepSettings({ s, onChange, canFigures, unitsHaveFigures, unitsHaveTables, filesUsed, busy, stage, progress, onCancel, onBack, onGenerate }: Props) {
  const isBank = s.mode === "bank";
  const maxTotal = isBank ? MAX_BANK_QUESTIONS : MAX_EXAM_QUESTIONS;
  const total = Object.values(s.counts).reduce((a, b) => a + b, 0);
  const batches = Math.ceil(total / 12);
  // ~40ث للطلب مع التدقيق (~25ث بدونه) ويعمل 2–4 طلبات معاً
  const minutes = Math.max(1, Math.ceil((batches * (s.verify ? 40 : 25)) / (isBank ? 3 : 2.5) / 60));
  const set = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => onChange({ ...s, [k]: v });
  const setCount = (k: QType, v: string) =>
    set("counts", { ...s.counts, [k]: Math.max(0, Math.min(maxTotal, parseInt(v || "0", 10) || 0)) });
  const switchMode = (m: CreatorMode) => {
    if (m === s.mode) return;
    onChange({ ...s, mode: m, counts: PRESETS[m][m === "bank" ? 1 : 1].counts });
  };
  const clampVis = (v: string) => Math.max(0, Math.min(total, parseInt(v || "0", 10) || 0));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {([
          ["exam", "امتحان", `ورقة امتحان جاهزة حتى ${MAX_EXAM_QUESTIONS} سؤالاً، للطباعة أو برابط إلكتروني`, FileText],
          ["bank", "بنك أسئلة", `مخزون كبير حتى ${MAX_BANK_QUESTIONS} سؤال تُسحب منه امتحانات عشوائية متعددة`, Database],
        ] as const).map(([m, t, d, Icon]) => (
          <button key={m} type="button" disabled={busy} onClick={() => switchMode(m)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-right transition-colors ${s.mode === m ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><span className="block font-bold">{t}</span><span className="text-xs text-muted-foreground">{d}</span></span>
          </button>
        ))}
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-base">عدد الأسئلة ونوعها <span className={total > maxTotal ? "text-destructive" : "text-muted-foreground"}>(المجموع: {total} — الحد الأقصى {maxTotal})</span></Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS[s.mode].map((p) => <Button key={p.label} size="sm" variant="outline" onClick={() => set("counts", p.counts)}>{p.label}</Button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {QTYPE_META.map(({ key, label, hint }) => (
            <div key={key} className="space-y-1">
              <span className="text-xs font-medium">{label}</span>
              <Input type="number" min={0} max={maxTotal} value={s.counts[key]} onChange={(e) => setCount(key, e.target.value)} />
              {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
            </div>
          ))}
        </div>
        {total > 25 && (
          <p className="text-xs text-muted-foreground">
            يُولَّد على نحو {batches} دفعة صغيرة (2–4 بالتوازي حسب ما تسمح به حصة الذكاء الاصطناعي) بزمن تقريبي {minutes} دقيقة{s.verify ? "، وتُدقَّق كل دفعة مقابل ملفاتك" : ""} وتُحذف الأسئلة المكررة.
            {isBank && " يُحفظ البنك تدريجياً فلا يضيع ما أُنجز إن توقفت."}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>مستوى الصعوبة</Label>
            <Select value={s.difficulty} onValueChange={(v) => set("difficulty", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">متنوع (30% سهل / 50% متوسط / 20% صعب)</SelectItem>
                <SelectItem value="easy">سهل</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="hard">صعب</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>لغة الامتحان</Label>
            <Select value={s.language} onValueChange={(v) => set("language", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">نفس لغة الملف</SelectItem>
                <SelectItem value="العربية">العربية</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filesUsed > 1 && (
        <Card className="space-y-3 p-4">
          <Label className="text-base">توزيع الأسئلة بين الملفات ({filesUsed} ملفات مدمجة)</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["by_unit", "حسب الوحدات المختارة", "كل وحدة تأخذ نصيباً متساوياً (الملف الذي فيه وحدات أكثر يظهر أكثر)."],
              ["by_file", "بالتساوي بين الملفات", "كل ملف ينال نصيباً متقارباً مهما كان عدد وحداته المختارة."],
            ] as const).map(([v, t, d]) => (
              <button key={v} type="button" onClick={() => set("distribution", v)}
                className={`rounded-lg border p-3 text-right transition-colors ${s.distribution === v ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                <div className="font-semibold">{t}</div><div className="text-xs text-muted-foreground">{d}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-3 p-4">
        <Label className="text-base">طلب خاص للذكاء الاصطناعي (اختياري)</Label>
        <Textarea value={s.request} maxLength={1500} onChange={(e) => set("request", e.target.value)} className="min-h-[90px]"
          placeholder="مثال: اجعل نصف الأسئلة تطبيقية، وركّز على القوانين والتعريفات..." />
        <div className="flex flex-wrap gap-2">
          {REQUEST_IDEAS.map((t) => (
            <Button key={t} size="sm" variant="secondary" className="h-auto whitespace-normal py-1 text-xs"
              onClick={() => set("request", s.request ? `${s.request}\n${t}` : t)}>+ {t}</Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">الطلب يُنفَّذ ضمن قاعدة ثابتة: الأسئلة من الوحدات المختارة في ملفك فقط.</p>
      </Card>

      <Card className="space-y-4 p-4">
        <Label className="text-base">الجداول والأشكال العلمية</Label>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-medium">أشكال وصور من الملف الأصلي</div>
            <p className="text-xs text-muted-foreground">
              لا يرسم الذكاء الاصطناعي الصور (فهو لا يضمن دقتها العلمية). بدلاً من ذلك يحدد الشكل المناسب في ملفك فيُقصّ منه كما هو بدقة عالية.
              {!canFigures && " غير متاح: الملفات المرفوعة نصية (Word/TXT)؛ احفظ ملفك PDF لتفعيلها."}
              {canFigures && !unitsHaveFigures && " (لم يُرصد في الوحدات المختارة أشكال واضحة)"}
            </p>
          </div>
          <Switch checked={s.includeFigures && canFigures} disabled={!canFigures} onCheckedChange={(v) => set("includeFigures", v)} />
        </div>
        {s.includeFigures && canFigures && (
          <label className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            عدد الأسئلة التي يجب أن تحتوي شكلاً من الملف
            <Input type="number" className="w-24" min={0} max={total} value={s.figureQuestions} onChange={(e) => set("figureQuestions", clampVis(e.target.value))} />
          </label>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-medium">جداول بيانات من الملف</div>
            <p className="text-xs text-muted-foreground">
              تُنقل الجداول خلية بخلية من ملفك ثم تُدقَّق مقابله؛ أي جدول فيه اختلاف يُحذف سؤاله.
              {!unitsHaveTables && " (لم يُرصد في الوحدات المختارة جداول واضحة)"}
            </p>
          </div>
          <Switch checked={s.includeTables} onCheckedChange={(v) => set("includeTables", v)} />
        </div>
        {s.includeTables && (
          <label className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            عدد الأسئلة التي يجب أن تحتوي جدولاً من الملف
            <Input type="number" className="w-24" min={0} max={total} value={s.tableQuestions} onChange={(e) => set("tableQuestions", clampVis(e.target.value))} />
          </label>
        )}
        <p className="text-xs text-muted-foreground">يُرصد أولاً ما في وحداتك من أشكال وجداول فعلية، ثم تُكتب الأسئلة الملزمة عليها في جولة مخصصة. إن لم يوجد ما يكفي ستُخبرك المراجعة بالسبب بدقة.</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-medium">تدقيق كل سؤال مقابل الملف</div>
            <p className="text-xs text-muted-foreground">يحذف الأسئلة التي لا يدعمها الملف. إيقافه يسرّع الإنشاء بنحو الثلث، وتبقى الأسئلة مبنية على اقتباس من الملف لكن بلا فحص ثانٍ — مناسب لبنوك الأسئلة الكبيرة.</p>
          </div>
          <Switch checked={s.verify} onCheckedChange={(v) => set("verify", v)} />
        </div>
      </Card>

      <HeaderCard s={s} onChange={onChange} total={total} />

      {busy && progress && (
        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span>
              أُنجز <b>{progress.questions}</b> من {progress.target} سؤالاً — الدفعات {progress.batchesDone}/{progress.batches}
              {progress.etaSeconds ? ` — المتبقي نحو ${progress.etaSeconds >= 90 ? `${Math.ceil(progress.etaSeconds / 60)} دقيقة` : `${progress.etaSeconds} ثانية`}` : ""}
            </span>
            <Button size="sm" variant="outline" onClick={onCancel}><X className="ml-1 h-4 w-4" />إيقاف وإبقاء ما أُنجز</Button>
          </div>
          <Progress value={Math.min(100, (progress.questions / Math.max(1, progress.target)) * 100)} />
          {progress.waitSeconds > 0 && (
            <p className="text-xs text-amber-600">⏳ الذكاء الاصطناعي يطلب التمهّل (حدّ المعدّل): استئناف خلال {progress.waitSeconds} ثانية. هذا طبيعي مع الحصة المجانية.</p>
          )}
          {progress.failed > 0 && <p className="text-xs text-muted-foreground">دفعات تعذّرت: {progress.failed} (يُعوَّض نقصها تلقائياً في نهاية العملية)</p>}
          {progress.lastError && <p className="text-xs text-muted-foreground" dir="auto">آخر ملاحظة: {progress.lastError}</p>}
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={busy} onClick={onBack}><ArrowRight className="ml-2 h-4 w-4" />رجوع</Button>
        <Button size="lg" disabled={busy || total < 1 || total > maxTotal} onClick={onGenerate}>
          {busy ? (<><Loader2 className="ml-2 h-5 w-5 animate-spin" />{stage || "جارٍ الإنشاء..."}</>)
            : (<><Sparkles className="ml-2 h-5 w-5" />{isBank ? `أنشئ بنك الأسئلة (${total} سؤال)` : `أنشئ الامتحان (${total} سؤال)`}</>)}
        </Button>
      </div>
    </div>
  );
}

function HeaderCard({ s, onChange, total }: { s: SettingsState; onChange: (s: SettingsState) => void; total: number }) {
  const h = s.header;
  const setH = <K extends keyof ExamHeader>(k: K, v: ExamHeader[K]) => onChange({ ...s, header: { ...h, [k]: v } });
  const set = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => onChange({ ...s, [k]: v });
  const html = jordanHeaderHtml({
    title: "عنوان الامتحان", questions: Array.from({ length: total }, (_, i) => ({ id: i } as any)),
    meta: { schoolName: s.schoolName, teacherName: s.teacherName, subject: s.subject, grade: s.grade, durationMinutes: s.durationMinutes, header: h },
  }, "student");
  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label className="text-base">ترويسة الامتحان (تظهر في PDF)</Label>
          <p className="text-xs text-muted-foreground">تُحفظ بياناتك على هذا الجهاز وتُملأ تلقائياً في امتحاناتك القادمة؛ غيّرها متى شئت لكل معلم أو مدرسة.</p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg bg-muted p-1 text-xs">
          {([["jordan", "نمط وزارة التربية الأردنية"], ["simple", "بسيطة"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setH("style", k)}
              className={`rounded-md px-3 py-1.5 ${h.style === k ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {h.style === "jordan" && <Input placeholder="مديرية التربية والتعليم (مثل: لواء المزار الشمالي)" value={h.directorate} onChange={(e) => setH("directorate", e.target.value)} />}
        <Input placeholder="اسم المدرسة" value={s.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
        <Input placeholder="اسم المعلم" value={s.teacherName} onChange={(e) => set("teacherName", e.target.value)} />
        <Input placeholder="المادة" value={s.subject} onChange={(e) => set("subject", e.target.value)} />
        <Input placeholder="الصف (مثل: العاشر)" value={s.grade} onChange={(e) => set("grade", e.target.value)} />
        {h.style === "jordan" && (<>
          <Input placeholder="الشعبة (مثل: أ)" value={h.section} onChange={(e) => setH("section", e.target.value)} />
          <Input placeholder="اسم الامتحان (مثل: الامتحان الشهري الأول)" value={h.examName} onChange={(e) => setH("examName", e.target.value)} />
          <Select value={h.semester || "none"} onValueChange={(v) => setH("semester", v === "none" ? "" : (v as ExamHeader["semester"]))}>
            <SelectTrigger><SelectValue placeholder="الفصل الدراسي" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون فصل</SelectItem>
              <SelectItem value="الأول">الفصل الدراسي الأول</SelectItem>
              <SelectItem value="الثاني">الفصل الدراسي الثاني</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="العام الدراسي (2026/2027)" value={h.academicYear} onChange={(e) => setH("academicYear", e.target.value)} dir="ltr" className="text-right" />
          <Input placeholder="تاريخ الامتحان (مثل: 2026/10/20)" value={h.examDate} onChange={(e) => setH("examDate", e.target.value)} />
          <div className="space-y-1">
            <Label className="text-xs">العلامة الكلية (اتركها 0 لتساوي عدد الأسئلة)</Label>
            <Input type="number" min={0} max={1000} value={h.totalMarks} onChange={(e) => setH("totalMarks", Math.max(0, Math.min(1000, parseInt(e.target.value || "0", 10) || 0)))} />
          </div>
        </>)}
        <div className="space-y-1">
          <Label className="text-xs">زمن الامتحان بالدقائق</Label>
          <Input type="number" min={0} max={600} value={s.durationMinutes}
            onChange={(e) => set("durationMinutes", Math.max(0, Math.min(600, parseInt(e.target.value || "0", 10) || 0)))} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">الشعار الرسمي (ارفع صورة الشعار فيظهر في ترويسة الامتحان وفي PDF)</Label>
          <div className="flex items-center gap-3">
            <Input type="file" accept="image/*" className="max-w-xs text-xs"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setH("logoDataUrl", await shrinkLogo(f)); } catch (err: any) { alert(err?.message ?? "تعذّر رفع الشعار"); } } }} />
            {h.logoDataUrl && (<>
              <img src={h.logoDataUrl} alt="الشعار" className="h-12 w-auto max-w-[96px] rounded border bg-white object-contain p-1" />
              <Button type="button" size="sm" variant="outline" onClick={() => setH("logoDataUrl", "")}>إزالة</Button>
            </>)}
          </div>
        </div>
      </div>

      {h.style === "jordan" && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">معاينة الترويسة</Label>
          <div className="overflow-hidden rounded-lg border bg-white p-3 text-slate-900" dir="rtl" style={{ fontFamily: "Cairo, Tahoma, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </Card>
  );
}
