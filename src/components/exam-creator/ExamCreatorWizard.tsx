import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeUnits, generateExam } from "@/lib/examCreator/api";
import {
  buildGenerationFiles, cropAllFigures, MAX_FILES, prepareFile, shrinkToBudget, type PreparedFile,
} from "@/lib/examCreator/fileUtils";
import { saveHistory, updateHistory, type HistorySource } from "@/lib/examCreator/history";
import { downloadLibraryFile, listLibrary, type LibraryRow } from "@/lib/examCreator/library";
import { mergeUnitLists, sanitizeCachedUnits } from "@/lib/examCreator/mergeUnits";
import type { AnalyzeResponse, GeneratedExam, UnitInfo } from "@/lib/examCreator/types";
import StepUpload, { type Source } from "./StepUpload";
import StepUnits from "./StepUnits";
import StepSettings, { DEFAULT_SETTINGS, type SettingsState } from "./StepSettings";
import StepReview from "./StepReview";
import StepPublish from "./StepPublish";
import MyExamsPanel from "./MyExamsPanel";

const STEPS = ["اختيار الملفات", "اختيار الوحدات", "الأسئلة والطلب", "المراجعة", "PDF والرابط"];
const srcName = (s: Source) => (s.kind === "library" ? s.row.title : s.file.name);

export default function ExamCreatorWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [sources, setSources] = useState<Source[]>([]);
  const [library, setLibrary] = useState<LibraryRow[] | null>(null);
  const [libraryError, setLibraryError] = useState("");
  const [prepared, setPrepared] = useState<PreparedFile[]>([]);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [gen, setGen] = useState<{ requested: number; dropped: number; warnings: string[] } | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");

  // مكتبة المنصة: المنشور فقط (RLS يُظهر المسودات للأدمن، فنُرشّح هنا ليرى الأدمن ما يراه المستخدمون)
  useEffect(() => {
    listLibrary().then((r) => setLibrary(r.filter((x) => x.is_published))).catch((e) => { setLibraryError(e.message); setLibrary([]); });
  }, []);

  const fail = (title: string, e: any) => toast({ title, description: e?.message || "حدث خطأ غير متوقع", variant: "destructive" });
  const resetDerived = () => { setPrepared([]); setAnalysis(null); setSelected(new Set()); setExam(null); setGen(null); setHistoryId(null); };

  const room = () => {
    if (sources.length >= MAX_FILES) { toast({ title: "⚠️ الحد الأقصى", description: `${MAX_FILES} ملفات كحد أقصى في الامتحان الواحد`, variant: "destructive" }); return false; }
    return true;
  };

  const addFiles = (list: File[]) => {
    const next = [...sources];
    for (const f of list) {
      if (next.length >= MAX_FILES) { room(); break; }
      if (!next.some((s) => s.kind === "upload" && s.file.name === f.name && s.file.size === f.size)) next.push({ key: `u:${f.name}:${f.size}`, kind: "upload", file: f });
    }
    setSources(next);
    resetDerived();
  };

  const toggleLibrary = (row: LibraryRow) => {
    if (sources.some((s) => s.kind === "library" && s.row.id === row.id)) setSources(sources.filter((s) => !(s.kind === "library" && s.row.id === row.id)));
    else if (room()) setSources([...sources, { key: `l:${row.id}`, kind: "library", row }]);
    resetDerived();
  };

  const analyze = async () => {
    setBusy(true);
    try {
      const prep: PreparedFile[] = [];
      const cached = new Map<number, UnitInfo[]>();
      for (let i = 0; i < sources.length; i++) {
        const s = sources[i];
        if (s.kind === "library") {
          setStage(`تنزيل «${s.row.title}»...`);
          const f = await downloadLibraryFile(s.row, (p) => setStage(`تنزيل «${s.row.title}» ${p}%`));
          prep.push(await prepareFile(f, setStage));
          const cu = sanitizeCachedUnits(s.row.units);
          if (cu) cached.set(i, cu);
        } else {
          setStage(`قراءة «${s.file.name}»...`);
          prep.push(await prepareFile(s.file, setStage));
        }
      }
      const fitted = await shrinkToBudget(prep, setStage);
      fitted.filter((p) => p.note).forEach((p) => toast({ title: `ℹ️ ${p.name}`, description: p.note }));

      // الملفات غير المقسَّمة مسبقاً فقط تذهب للذكاء الاصطناعي
      const need = fitted.map((_, i) => i).filter((i) => !cached.has(i));
      const lists: { fileIndex: number; units: UnitInfo[] }[] = [...cached].map(([fileIndex, units]) => ({ fileIndex, units }));
      let language = "", subjectGuess = "", gradeGuess = "";
      if (need.length) {
        setStage("الذكاء الاصطناعي يقرأ الملفات ويقسّمها إلى وحدات...");
        const res = await analyzeUnits(need.map((i) => fitted[i]));
        need.forEach((gi, local) => lists.push({ fileIndex: gi, units: res.units.filter((u) => u.fileIndex === local) }));
        language = res.language; subjectGuess = res.subjectGuess; gradeGuess = res.gradeGuess;
      }
      const units = mergeUnitLists(lists);
      if (units.length === 0) throw new Error("لم أستطع استخراج وحدات من الملفات المختارة.");

      const firstLib = sources.find((s): s is Extract<Source, { kind: "library" }> => s.kind === "library");
      setPrepared(fitted);
      setAnalysis({ units, language, subjectGuess, gradeGuess });
      setSelected(new Set(units.length === 1 ? [units[0].id] : []));
      setSettings((s) => ({ ...s, subject: s.subject || firstLib?.row.subject || subjectGuess, grade: s.grade || firstLib?.row.grade || gradeGuess }));
      setExam(null); setGen(null); setHistoryId(null);
      setStep(1);
    } catch (e) {
      fail("⚠️ تعذّر تحليل الملفات", e);
    } finally { setBusy(false); setStage(""); }
  };

  const generate = async () => {
    if (!analysis) return;
    setBusy(true);
    try {
      const units = analysis.units.filter((u) => selected.has(u.id));
      const canFigures = prepared.some((p) => p.figurable);
      const filesUsed = new Set(units.map((u) => u.fileIndex)).size;

      const gf = await buildGenerationFiles(prepared, units, setStage);
      gf.notes.forEach((n) => toast({ title: "ℹ️ ملف كبير", description: n }));
      setStage("الذكاء الاصطناعي يصيغ الأسئلة ثم يدقّقها مقابل ملفاتك (قد يستغرق دقيقة)...");
      const res = await generateExam({
        payloads: gf.payloads, units, counts: settings.counts, difficulty: settings.difficulty, language: settings.language,
        distribution: filesUsed > 1 ? settings.distribution : "by_unit",
        grade: settings.grade, subject: settings.subject, request: settings.request,
        includeFigures: settings.includeFigures && canFigures, includeTables: settings.includeTables,
      });

      let questions = res.exam.questions;
      const warnings = [...res.warnings];
      if (questions.some((q) => q.figure)) {
        setStage("جارٍ استخراج الأشكال من ملفاتك الأصلية...");
        const cropped = await cropAllFigures(prepared, questions, (d, t) => setStage(`جارٍ استخراج الأشكال من ملفاتك الأصلية (${d}/${t})...`));
        questions = cropped.questions;
        if (cropped.removed) warnings.push(`حُذف ${cropped.removed} سؤال لأن شكله تعذّر استخراجه من الملف بدقة.`);
      }
      if (questions.length === 0) throw new Error("لم يبقَ أي سؤال صالح بعد استخراج الأشكال. جرّب بدون أشكال أو بوحدات أخرى.");

      const built: GeneratedExam = {
        title: res.exam.title, questions,
        meta: { schoolName: settings.schoolName, teacherName: settings.teacherName, subject: settings.subject, grade: settings.grade, durationMinutes: settings.durationMinutes },
      };
      setExam(built);
      setGen({ requested: res.requested, dropped: res.dropped, warnings });

      // سجل المنصة: يُحفظ كل امتحان يُنشأ ليراجعه الأدمن (الفشل لا يوقف العمل)
      const hs: HistorySource[] = sources.map((s) => (s.kind === "library"
        ? { kind: "library", id: s.row.id, title: s.row.title } : { kind: "upload", name: s.file.name, size: s.file.size }));
      setHistoryId(await saveHistory(built, hs, settings.request, {
        counts: settings.counts, difficulty: settings.difficulty, language: settings.language, distribution: settings.distribution,
        units: units.map((u) => ({ title: u.title, file: srcName(sources[u.fileIndex]) })),
      }));
      setStep(3);
    } catch (e) {
      fail("⚠️ تعذّر إنشاء الامتحان", e);
    } finally { setBusy(false); setStage(""); }
  };

  const selectedUnits = analysis?.units.filter((u) => selected.has(u.id)) ?? [];
  const filesUsed = useMemo(() => new Set(selectedUnits.map((u) => u.fileIndex)).size, [selectedUnits]);
  const canGo = (i: number) => !busy && (i === 0 || (i === 1 && !!analysis) || (i === 2 && !!analysis && selected.size > 0) || (i >= 3 && !!exam));
  const fileNames = sources.map(srcName);

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
          <StepUpload sources={sources} library={library} libraryError={libraryError} busy={busy} stage={stage}
            onAddFiles={addFiles} onToggleLibrary={toggleLibrary}
            onRemove={(key) => { setSources(sources.filter((s) => s.key !== key)); resetDerived(); }} onAnalyze={analyze} />
          <MyExamsPanel />
        </>
      )}

      {step === 1 && analysis && (
        <StepUnits units={analysis.units} fileNames={fileNames} selected={selected}
          onToggle={(id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
          onAll={(all) => setSelected(all ? new Set(analysis.units.map((u) => u.id)) : new Set())}
          onToggleFile={(fi, on) => setSelected((s) => {
            const n = new Set(s);
            analysis.units.filter((u) => u.fileIndex === fi).forEach((u) => (on ? n.add(u.id) : n.delete(u.id)));
            return n;
          })}
          onBack={() => setStep(0)} onNext={() => setStep(2)} />
      )}

      {step === 2 && analysis && (
        <StepSettings s={settings} onChange={setSettings} busy={busy} stage={stage}
          canFigures={prepared.some((p) => p.figurable)} filesUsed={filesUsed}
          unitsHaveFigures={selectedUnits.some((u) => u.hasFigures)} unitsHaveTables={selectedUnits.some((u) => u.hasTables)}
          onBack={() => setStep(1)} onGenerate={generate} />
      )}

      {step === 3 && exam && gen && (
        <StepReview exam={exam} requested={gen.requested} dropped={gen.dropped} warnings={gen.warnings}
          showAnswers={showAnswers} onShowAnswers={setShowAnswers} onChange={setExam}
          onBack={() => setStep(2)} onNext={() => { updateHistory(historyId, exam); setStep(4); }} />
      )}

      {step === 4 && exam && <StepPublish exam={exam} historyId={historyId} onBack={() => setStep(3)} />}
    </div>
  );
}
