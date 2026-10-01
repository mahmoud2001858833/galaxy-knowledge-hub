import { useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeUnits, generateExam } from "@/lib/examCreator/api";
import { cropAllFigures, MAX_FILES, MAX_TOTAL_INLINE_BYTES, prepareFile, type PreparedFile } from "@/lib/examCreator/fileUtils";
import type { AnalyzeResponse, GeneratedExam } from "@/lib/examCreator/types";
import StepUpload from "./StepUpload";
import StepUnits from "./StepUnits";
import StepSettings, { DEFAULT_SETTINGS, type SettingsState } from "./StepSettings";
import StepReview from "./StepReview";
import StepPublish from "./StepPublish";
import MyExamsPanel from "./MyExamsPanel";

const STEPS = ["رفع الملف", "اختيار الوحدات", "الأسئلة والطلب", "المراجعة", "PDF والرابط"];

export default function ExamCreatorWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [prepared, setPrepared] = useState<PreparedFile[]>([]);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [gen, setGen] = useState<{ requested: number; dropped: number; warnings: string[] } | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");

  const fail = (title: string, e: any) => toast({ title, description: e?.message || "حدث خطأ غير متوقع", variant: "destructive" });

  const resetDerived = () => { setPrepared([]); setAnalysis(null); setSelected(new Set()); setExam(null); setGen(null); };

  const addFiles = (list: File[]) => {
    const merged = [...files];
    for (const f of list) {
      if (merged.length >= MAX_FILES) { toast({ title: "⚠️ الحد الأقصى", description: `${MAX_FILES} ملفات كحد أقصى`, variant: "destructive" }); break; }
      if (!merged.some((m) => m.name === f.name && m.size === f.size)) merged.push(f);
    }
    setFiles(merged);
    resetDerived();
  };

  const analyze = async () => {
    setBusy(true);
    try {
      setStage("جارٍ قراءة الملفات...");
      const prep: PreparedFile[] = [];
      for (const f of files) prep.push(await prepareFile(f));
      if (prep.reduce((s, p) => s + (p.payload.base64 ? Math.floor(p.payload.base64.length * 0.75) : 0), 0) > MAX_TOTAL_INLINE_BYTES) {
        throw new Error("مجموع حجم الملفات كبير (الحد 14 ميجابايت). قلّل عدد الملفات أو حجمها.");
      }
      prep.filter((p) => p.note).forEach((p) => toast({ title: `ℹ️ ${p.name}`, description: p.note }));

      setStage("الذكاء الاصطناعي يقرأ الملف ويقسّمه إلى وحدات...");
      const res = await analyzeUnits(prep);
      setPrepared(prep);
      setAnalysis(res);
      setSelected(new Set(res.units.length === 1 ? [res.units[0].id] : []));
      setSettings((s) => ({ ...s, subject: s.subject || res.subjectGuess, grade: s.grade || res.gradeGuess }));
      setExam(null); setGen(null);
      setStep(1);
    } catch (e) {
      fail("⚠️ تعذّر تحليل الملف", e);
    } finally { setBusy(false); setStage(""); }
  };

  const generate = async () => {
    if (!analysis) return;
    setBusy(true);
    try {
      setStage("الذكاء الاصطناعي يصيغ الأسئلة ثم يدقّقها مقابل ملفك (قد يستغرق دقيقة)...");
      const units = analysis.units.filter((u) => selected.has(u.id));
      const canFigures = prepared.some((p) => p.figurable);
      const res = await generateExam({
        files: prepared, units, counts: settings.counts, difficulty: settings.difficulty, language: settings.language,
        grade: settings.grade, subject: settings.subject, request: settings.request,
        includeFigures: settings.includeFigures && canFigures, includeTables: settings.includeTables,
      });

      let questions = res.exam.questions;
      const warnings = [...res.warnings];
      if (questions.some((q) => q.figure)) {
        setStage("جارٍ استخراج الأشكال من ملفك الأصلي...");
        const cropped = await cropAllFigures(prepared, questions, (d, t) => setStage(`جارٍ استخراج الأشكال من ملفك الأصلي (${d}/${t})...`));
        questions = cropped.questions;
        if (cropped.removed) warnings.push(`حُذف ${cropped.removed} سؤال لأن شكله تعذّر استخراجه من الملف بدقة.`);
      }
      if (questions.length === 0) throw new Error("لم يبقَ أي سؤال صالح بعد استخراج الأشكال. جرّب بدون أشكال أو بوحدات أخرى.");

      setExam({
        title: res.exam.title, questions,
        meta: { schoolName: settings.schoolName, teacherName: settings.teacherName, subject: settings.subject, grade: settings.grade, durationMinutes: settings.durationMinutes },
      });
      setGen({ requested: res.requested, dropped: res.dropped, warnings });
      setStep(3);
    } catch (e) {
      fail("⚠️ تعذّر إنشاء الامتحان", e);
    } finally { setBusy(false); setStage(""); }
  };

  const selectedUnits = analysis?.units.filter((u) => selected.has(u.id)) ?? [];
  const canGo = (i: number) => !busy && (i === 0 || (i === 1 && !!analysis) || (i === 2 && !!analysis && selected.size > 0) || (i >= 3 && !!exam));

  return (
    <div className="space-y-8" dir="rtl">
      <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => {
          const done = i < step;
          return (
            <li key={label}>
              <button type="button" disabled={!canGo(i) || i === step} onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  i === step ? "border-primary bg-primary text-primary-foreground" : done ? "border-primary/40 text-primary hover:bg-primary/10" : "text-muted-foreground"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${i === step ? "bg-white/20" : "bg-muted"}`}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 0 && (
        <>
          <StepUpload files={files} busy={busy} stage={stage} onAdd={addFiles}
            onRemove={(i) => { setFiles(files.filter((_, j) => j !== i)); resetDerived(); }} onAnalyze={analyze} />
          <MyExamsPanel />
        </>
      )}

      {step === 1 && analysis && (
        <StepUnits units={analysis.units} fileNames={files.map((f) => f.name)} selected={selected}
          onToggle={(id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
          onAll={(all) => setSelected(all ? new Set(analysis.units.map((u) => u.id)) : new Set())}
          onBack={() => setStep(0)} onNext={() => setStep(2)} />
      )}

      {step === 2 && analysis && (
        <StepSettings s={settings} onChange={setSettings} busy={busy} stage={stage}
          canFigures={prepared.some((p) => p.figurable)}
          unitsHaveFigures={selectedUnits.some((u) => u.hasFigures)} unitsHaveTables={selectedUnits.some((u) => u.hasTables)}
          onBack={() => setStep(1)} onGenerate={generate} />
      )}

      {step === 3 && exam && gen && (
        <StepReview exam={exam} requested={gen.requested} dropped={gen.dropped} warnings={gen.warnings}
          showAnswers={showAnswers} onShowAnswers={setShowAnswers} onChange={setExam}
          onBack={() => setStep(2)} onNext={() => setStep(4)} />
      )}

      {step === 4 && exam && <StepPublish exam={exam} onBack={() => setStep(3)} />}
    </div>
  );
}
