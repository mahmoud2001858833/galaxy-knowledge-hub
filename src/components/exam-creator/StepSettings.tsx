import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { QTYPE_META, type QType } from "@/lib/examCreator/types";

export interface SettingsState {
  counts: Record<QType, number>;
  difficulty: string;
  language: string;
  grade: string;
  subject: string;
  request: string;
  includeFigures: boolean;
  includeTables: boolean;
  schoolName: string;
  teacherName: string;
  durationMinutes: number;
}

export const DEFAULT_SETTINGS: SettingsState = {
  counts: { multiple_choice: 6, true_false: 2, fill_blank: 2, short_answer: 0, essay: 0 },
  difficulty: "mixed", language: "auto", grade: "", subject: "", request: "",
  includeFigures: true, includeTables: true, schoolName: "", teacherName: "", durationMinutes: 45,
};

const PRESETS: { label: string; counts: Record<QType, number> }[] = [
  { label: "سريع (10)", counts: { multiple_choice: 6, true_false: 2, fill_blank: 2, short_answer: 0, essay: 0 } },
  { label: "اختبار قصير (20)", counts: { multiple_choice: 10, true_false: 4, fill_blank: 4, short_answer: 2, essay: 0 } },
  { label: "نهائي (30)", counts: { multiple_choice: 12, true_false: 6, fill_blank: 6, short_answer: 4, essay: 2 } },
];

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
  busy: boolean;
  stage: string;
  onBack: () => void;
  onGenerate: () => void;
}

export default function StepSettings({ s, onChange, canFigures, unitsHaveFigures, unitsHaveTables, busy, stage, onBack, onGenerate }: Props) {
  const total = Object.values(s.counts).reduce((a, b) => a + b, 0);
  const set = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => onChange({ ...s, [k]: v });
  const setCount = (k: QType, v: string) =>
    set("counts", { ...s.counts, [k]: Math.max(0, Math.min(50, parseInt(v || "0", 10) || 0)) });

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-base">عدد الأسئلة ونوعها <span className="text-muted-foreground">(المجموع: {total} — الحد الأقصى 50)</span></Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => <Button key={p.label} size="sm" variant="outline" onClick={() => set("counts", p.counts)}>{p.label}</Button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {QTYPE_META.map(({ key, label, hint }) => (
            <div key={key} className="space-y-1">
              <span className="text-xs font-medium">{label}</span>
              <Input type="number" min={0} max={50} value={s.counts[key]} onChange={(e) => setCount(key, e.target.value)} />
              {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
            </div>
          ))}
        </div>
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
              {!canFigures && " غير متاح: الملف نصي/Word أو كبير؛ ارفع PDF أصغر من 10MB أو صورة."}
              {canFigures && !unitsHaveFigures && " (لم يُرصد في الوحدات المختارة أشكال واضحة)"}
            </p>
          </div>
          <Switch checked={s.includeFigures && canFigures} disabled={!canFigures} onCheckedChange={(v) => set("includeFigures", v)} />
        </div>
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
      </Card>

      <Card className="space-y-3 p-4">
        <Label className="text-base">بيانات رأس الامتحان (تظهر في PDF)</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="اسم المدرسة" value={s.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
          <Input placeholder="اسم المعلم" value={s.teacherName} onChange={(e) => set("teacherName", e.target.value)} />
          <Input placeholder="المادة" value={s.subject} onChange={(e) => set("subject", e.target.value)} />
          <Input placeholder="الصف" value={s.grade} onChange={(e) => set("grade", e.target.value)} />
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">زمن الامتحان بالدقائق</Label>
            <Input type="number" min={0} max={600} value={s.durationMinutes}
              onChange={(e) => set("durationMinutes", Math.max(0, Math.min(600, parseInt(e.target.value || "0", 10) || 0)))} />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={busy} onClick={onBack}><ArrowRight className="ml-2 h-4 w-4" />رجوع</Button>
        <Button size="lg" disabled={busy || total < 1} onClick={onGenerate}>
          {busy ? (<><Loader2 className="ml-2 h-5 w-5 animate-spin" />{stage || "جارٍ الإنشاء..."}</>)
            : (<><Sparkles className="ml-2 h-5 w-5" />أنشئ الامتحان ({total} سؤال)</>)}
        </Button>
      </div>
    </div>
  );
}
