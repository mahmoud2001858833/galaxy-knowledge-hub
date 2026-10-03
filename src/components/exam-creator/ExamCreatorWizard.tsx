import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeUnits, discoverVisuals, uploadFigureImages, verifyCropsApi } from "@/lib/examCreator/api";
import { runBatches } from "@/lib/examCreator/batchGenerate";
import { sumCounts } from "@/lib/examCreator/batchPlan";
import {
  buildGenerationFiles, cropFiguresTight, MAX_FILES, prepareFile, shrinkToBudget, type CropReject, type CropResult, type PreparedFile,
} from "@/lib/examCreator/fileUtils";
import { loadBank, saveHistory, updateHistory, type HistorySource } from "@/lib/examCreator/history";
import { downloadLibraryFile, listLibrary, type LibraryRow } from "@/lib/examCreator/library";
import { mergeUnitLists, sanitizeCachedUnits } from "@/lib/examCreator/mergeUnits";
import type { AnalyzeResponse, Catalog, ExamDiagnostics, GeneratedExam, UnitInfo } from "@/lib/examCreator/types";
import StepUpload, { type Source } from "./StepUpload";
import StepUnits from "./StepUnits";
import StepSettings, { DEFAULT_SETTINGS, type SettingsState } from "./StepSettings";
import StepReview from "./StepReview";
import StepPublish from "./StepPublish";
import BankView from "./BankView";
import MyExamsPanel from "./MyExamsPanel";

const srcName = (s: Source) => (s.kind === "library" ? s.row.title : s.file.name);
type Progress = { batchesDone: number; batches: number; questions: number; target: number };

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
  const [bank, setBank] = useState<GeneratedExam | null>(null);
  const [bankSave, setBankSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [view3, setView3] = useState<"review" | "bank">("review");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [gen, setGen] = useState<{ requested: number; dropped: number; warnings: string[] } | null>(null);
  const [diag, setDiag] = useState<ExamDiagnostics | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    listLibrary().then((r) => setLibrary(r.filter((x) => x.is_published))).catch((e) => { setLibraryError(e.message); setLibrary([]); });
  }, []);

  const fail = (title: string, e: any) => toast({ title, description: e?.message || "حدث خطأ غير متوقع", variant: "destructive" });
  const resetDerived = () => { setPrepared([]); setAnalysis(null); setSelected(new Set()); setExam(null); setBank(null); setGen(null); setDiag(null); setHistoryId(null); setView3("review"); };

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
      setExam(null); setBank(null); setGen(null); setDiag(null); setHistoryId(null);
      setStep(1);
    } catch (e) {
      fail("⚠️ تعذّر تحليل الملفات", e);
    } finally { setBusy(false); setStage(""); }
  };

  const historySources = (): HistorySource[] =>
    sources.map((s) => (s.kind === "library" ? { kind: "library", id: s.row.id, title: s.row.title } : { kind: "upload", name: s.file.name, size: s.file.size }));

  const generate = async () => {
    if (!analysis) return;
    setBusy(true); setProgress(null);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const units = analysis.units.filter((u) => selected.has(u.id));
      const isBank = settings.mode === "bank";
      const total = sumCounts(settings.counts);
      const canFigures = prepared.some((p) => p.figurable);
      const filesUsed = new Set(units.map((u) => u.fileIndex)).size;

      const gf = await buildGenerationFiles(prepared, units, setStage);
      gf.notes.forEach((n) => toast({ title: "ℹ️ ملف كبير", description: n }));

      // ───── 1) رصد الأشكال والجداول الفعلية في الوحدات، وقصّ الأشكال بدقة وفحصها ─────
      const wantFig = settings.includeFigures && canFigures && settings.figureQuestions > 0;
      const wantTbl = settings.includeTables && settings.tableQuestions > 0;
      const catalog: Catalog = { figures: [], tables: [] };
      let discovered: ExamDiagnostics["discovered"] = { figures: 0, tables: 0, stats: {} };
      let cropRejected: CropReject[] = [];
      let figureImages = new Map<string, CropResult>();
      const warnings: string[] = [];

      if (wantFig || wantTbl) {
        setStage("الذكاء الاصطناعي يرصد الأشكال والجداول الموجودة في وحداتك...");
        try {
          const d = await discoverVisuals(gf.payloads, units, wantFig, wantTbl);
          discovered = { figures: d.figures.length, tables: d.tables.length, stats: d.stats };
          catalog.tables = d.tables;
          if (d.figures.length) {
            const jobs = d.figures.map((f) => ({ id: f.id, fileIndex: f.fileIndex, page: f.page, box: f.box, caption: f.caption }));
            const cr = await cropFiguresTight(prepared, jobs, verifyCropsApi, setStage);
            figureImages = cr.results; cropRejected = cr.rejected;
            catalog.figures = d.figures.filter((f) => cr.results.has(f.id));
          }
        } catch (e: any) {
          warnings.push(`تعذّر رصد الأشكال والجداول: ${e?.message ?? "خطأ"}. أُنشئت الأسئلة النصية فقط.`);
        }
      }

      // ───── 2) توليد الأسئلة على دفعات ─────
      setStage(isBank ? "جارٍ بناء البنك على دفعات متوازية..." : total > 25 ? "جارٍ إنشاء الامتحان على دفعات..." : "الذكاء الاصطناعي يصيغ الأسئلة ثم يدقّقها مقابل ملفاتك (قد يستغرق دقيقة)...");
      setProgress({ batchesDone: 0, batches: Math.ceil(total / (isBank ? 30 : 25)), questions: 0, target: total });

      const meta = { schoolName: settings.schoolName, teacherName: settings.teacherName, subject: settings.subject, grade: settings.grade, durationMinutes: settings.durationMinutes };
      const hs = historySources();
      const baseTitle = `${settings.subject || "بنك"} — بنك أسئلة`;
      let bankHist: string | null = null, lastSaved = 0, chain: Promise<void> = Promise.resolve();
      const options = { kind: isBank ? "bank" : "exam", counts: settings.counts, difficulty: settings.difficulty, language: settings.language, distribution: settings.distribution,
        units: units.map((u) => ({ title: u.title, file: srcName(sources[u.fileIndex]) })) };

      const res = await runBatches({
        base: {
          payloads: gf.payloads, difficulty: settings.difficulty, language: settings.language,
          distribution: filesUsed > 1 ? settings.distribution : "by_unit", grade: settings.grade, subject: settings.subject, request: settings.request,
          includeFigures: wantFig && catalog.figures.length > 0, includeTables: wantTbl && catalog.tables.length > 0,
        },
        units, counts: settings.counts, catalog,
        minFigureQuestions: wantFig ? Math.min(settings.figureQuestions, total) : 0,
        minTableQuestions: wantTbl ? Math.min(settings.tableQuestions, total) : 0,
        figureImages, batchSize: isBank ? 30 : 25, concurrency: isBank ? 3 : 2, signal: ac.signal,
        onProgress: setProgress,
        onPartial: isBank ? (qs) => {
          if (qs.length - lastSaved < 40 && qs.length < total) return; // حفظ تدريجي كل ~40 سؤالاً
          lastSaved = qs.length;
          const snap: GeneratedExam = { title: baseTitle, questions: qs.map((q, i) => ({ ...q, id: i + 1 })), meta };
          chain = chain.then(async () => {
            setBankSave("saving");
            if (!bankHist) bankHist = await saveHistory(snap, hs, settings.request, options); else await updateHistory(bankHist, snap);
            setBankSave(bankHist ? "saved" : "error");
          });
          return chain;
        } : undefined,
      });
      await chain;

      if (res.questions.length === 0) throw new Error(ac.signal.aborted ? "أُوقف الإنشاء قبل ظهور أي سؤال." : "لم يُنشأ أي سؤال صالح. جرّب وحدات أخرى أو قلّل القيود.");
      if (res.cancelled) toast({ title: "⏹ أُوقف الإنشاء", description: `أُبقي ما أُنجز: ${res.questions.length} من ${total} سؤالاً.` });

      const built: GeneratedExam = { title: res.title || baseTitle, questions: res.questions, meta };
      const d = res.diagnostics;
      const askedFig = wantFig ? Math.min(settings.figureQuestions, total) : 0;
      const askedTbl = wantTbl ? Math.min(settings.tableQuestions, total) : 0;
      if (askedFig > d.delivered.figures) warnings.push(`طلبتَ ${askedFig} أسئلة بأشكال وأُدرج ${d.delivered.figures}. افتح «تقرير الأشكال والجداول» أدناه لمعرفة السبب.`);
      if (askedTbl > d.delivered.tables) warnings.push(`طلبتَ ${askedTbl} أسئلة بجداول وأُدرج ${d.delivered.tables}. افتح «تقرير الأشكال والجداول» أدناه لمعرفة السبب.`);

      setDiag({
        catalog: { figures: catalog.figures.length, tables: catalog.tables.length }, asked: { figures: askedFig, tables: askedTbl },
        delivered: d.delivered, dropped: d.dropped, discovered, cropRejected, batches: d.batches, duplicatesRemoved: d.duplicatesRemoved,
      });
      setGen({ requested: total, dropped: Object.values(d.dropped).reduce((a, b) => a + b, 0), warnings: [...warnings, ...res.warnings] });

      if (isBank) {
        // الحفظ النهائي: رفع صور الأشكال وربطها ثم تحديث السجل
        let finalBank = built;
        setBankSave("saving");
        try {
          const folder = `bank-${(bankHist ?? crypto.randomUUID()).slice(0, 8)}`;
          const up = await uploadFigureImages(built.questions, folder);
          const urlById = new Map(up.map((q) => [q.id, q.figure?.url]));
          finalBank = { ...built, questions: built.questions.map((q) => (q.figure ? { ...q, figure: { ...q.figure, url: urlById.get(q.id) } } : q)) };
          const hid = bankHist ?? (await saveHistory(finalBank, hs, settings.request, options));
          bankHist = hid;
          await updateHistory(hid, finalBank);
          setBankSave(hid ? "saved" : "error");
        } catch (e) { console.warn("bank persist failed:", e); setBankSave("error"); }
        setBank(finalBank); setExam(null); setHistoryId(bankHist); setView3("bank");
      } else {
        setExam(built); setBank(null); setView3("review");
        setHistoryId(await saveHistory(built, hs, settings.request, options));
      }
      setStep(3);
    } catch (e) {
      fail("⚠️ تعذّر الإنشاء", e);
    } finally { setBusy(false); setStage(""); setProgress(null); abortRef.current = null; }
  };

  const openBank = async (id: string) => {
    setBusy(true); setStage("فتح البنك...");
    try {
      const b = await loadBank(id);
      setBank(b); setExam(null); setHistoryId(id); setGen(null); setDiag(null); setBankSave("saved"); setView3("bank"); setStep(3);
    } catch (e) { fail("⚠️ تعذّر فتح البنك", e); }
    finally { setBusy(false); setStage(""); }
  };

  const buildFromBank = async (e: GeneratedExam, requested: number) => {
    setExam(e); setGen({ requested, dropped: 0, warnings: [] }); setDiag(null); setView3("review");
    setHistoryId(await saveHistory(e, historySources(), "", { kind: "exam", fromBank: historyId }));
    toast({ title: "✅ سُحب الامتحان من البنك", description: `${e.questions.length} سؤالاً — راجعه ثم نزّله أو انشره.` });
  };

  const selectedUnits = analysis?.units.filter((u) => selected.has(u.id)) ?? [];
  const filesUsed = useMemo(() => new Set(selectedUnits.map((u) => u.fileIndex)).size, [selectedUnits]);
  const hasResult = !!exam || !!bank;
  const canGo = (i: number) => !busy && (i === 0 || (i === 1 && !!analysis) || (i === 2 && !!analysis && selected.size > 0) || (i === 3 && hasResult) || (i === 4 && !!exam));
  const fileNames = sources.map(srcName);
  const steps = ["اختيار الملفات", "اختيار الوحدات", "الأسئلة والطلب", view3 === "bank" && bank ? "البنك" : "المراجعة", "PDF والرابط"];

  return (
    <div className="space-y-8" dir="rtl">
      <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {steps.map((label, i) => {
          const done = i < step;
          return (
            <li key={i}>
              <button type="button" disabled={!canGo(i) || i === step} onClick={() => { if (i === 3) setView3(exam && view3 !== "bank" ? "review" : bank ? "bank" : "review"); setStep(i); }}
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
          <MyExamsPanel onOpenBank={openBank} />
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
        <StepSettings s={settings} onChange={setSettings} busy={busy} stage={stage} progress={progress}
          onCancel={() => abortRef.current?.abort()}
          canFigures={prepared.some((p) => p.figurable)} filesUsed={filesUsed}
          unitsHaveFigures={selectedUnits.some((u) => u.hasFigures)} unitsHaveTables={selectedUnits.some((u) => u.hasTables)}
          onBack={() => setStep(1)} onGenerate={generate} />
      )}

      {step === 3 && view3 === "bank" && bank && (
        <BankView bank={bank} saving={bankSave} backLabel={analysis ? "تعديل الإعدادات وإنشاء بنك جديد" : "العودة"}
          onChange={(b) => { setBank(b); if (historyId) updateHistory(historyId, b); }}
          onBuildExam={buildFromBank} onBack={() => setStep(analysis ? 2 : 0)} />
      )}

      {step === 3 && view3 === "review" && exam && gen && (
        <StepReview exam={exam} requested={gen.requested} dropped={gen.dropped} warnings={gen.warnings} diagnostics={diag}
          backLabel={bank ? "العودة إلى البنك" : "تعديل الإعدادات وإعادة التوليد"}
          showAnswers={showAnswers} onShowAnswers={setShowAnswers} onChange={setExam}
          onBack={() => { if (bank) setView3("bank"); else setStep(2); }}
          onNext={() => { updateHistory(historyId, exam); setStep(4); }} />
      )}

      {step === 4 && exam && <StepPublish exam={exam} historyId={historyId} onBack={() => { setView3("review"); setStep(3); }} />}
    </div>
  );
}
