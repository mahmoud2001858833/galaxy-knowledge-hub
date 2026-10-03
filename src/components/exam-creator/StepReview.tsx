import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, ArrowLeft, Eye, RotateCcw, ShieldCheck } from "lucide-react";
import QuestionPreview from "./QuestionPreview";
import type { ExamDiagnostics, GeneratedExam } from "@/lib/examCreator/types";
import DiagnosticsPanel from "./DiagnosticsPanel";

interface Props {
  exam: GeneratedExam;
  requested: number;
  dropped: number;
  warnings: string[];
  diagnostics: ExamDiagnostics | null;
  backLabel: string;
  showAnswers: boolean;
  onShowAnswers: (v: boolean) => void;
  onChange: (e: GeneratedExam) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function StepReview({ exam, requested, dropped, warnings, diagnostics, backLabel, showAnswers, onShowAnswers, onChange, onBack, onNext }: Props) {
  const figCount = exam.questions.filter((q) => q.figure?.dataUrl).length;
  const tblCount = exam.questions.filter((q) => q.table).length;

  return (
    <div className="space-y-4">
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription className="text-sm leading-relaxed">
          <b>راجع الامتحان قبل اعتماده.</b> كل سؤال مرفق باقتباس من ملفك ودُقّق آلياً (حُذف {dropped} سؤال لم يجتز التدقيق).
          {figCount > 0 && <> الأشكال ({figCount}) مقصوصة من ملفك الأصلي لا مرسومة بالذكاء الاصطناعي. </>}
          {tblCount > 0 && <> الجداول ({tblCount}) منقولة منه. </>}
          التدقيق الآلي لا يغني عن نظرة المعلم، خاصة في الجداول والأشكال والمسائل الحسابية.
        </AlertDescription>
      </Alert>

      {diagnostics && <DiagnosticsPanel d={diagnostics} />}

      {warnings.map((w, i) => (
        <Alert key={i} variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{w}</AlertDescription></Alert>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input value={exam.title} onChange={(e) => onChange({ ...exam, title: e.target.value })} className="max-w-md text-lg font-bold" aria-label="عنوان الامتحان" />
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4" /> إظهار الإجابات
          <Switch checked={showAnswers} onCheckedChange={onShowAnswers} />
          <span className="text-muted-foreground">({exam.questions.length} من {requested})</span>
        </div>
      </div>

      <div className="space-y-3">
        {exam.questions.map((q, i) => (
          <QuestionPreview key={q.id} q={q} index={i} showAnswer={showAnswers}
            onChange={(nq) => onChange({ ...exam, questions: exam.questions.map((x) => (x.id === q.id ? nq : x)) })}
            onDelete={() => onChange({ ...exam, questions: exam.questions.filter((x) => x.id !== q.id) })} />
        ))}
        {exam.questions.length === 0 && <p className="py-8 text-center text-muted-foreground">حُذفت كل الأسئلة. ارجع وأعد التوليد.</p>}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}><RotateCcw className="ml-2 h-4 w-4" />{backLabel}</Button>
        </div>
        <Button disabled={exam.questions.length === 0} onClick={onNext}>
          اعتماد والانتقال للتنزيل والنشر<ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
