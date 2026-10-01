import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { TableView } from "@/components/exam-creator/QuestionPreview";
import { callFn } from "@/lib/examCreator/api";
import { LETTERS, QTYPE_LABEL, type QType, type TableData } from "@/lib/examCreator/types";

interface PubQuestion {
  id: number; type: QType; question: string; options?: string[]; table?: TableData; figure?: { url: string; caption?: string };
}
interface PubExam {
  title: string; subject?: string; grade?: string; schoolName?: string;
  settings: { durationMinutes: number; shuffleQuestions: boolean; shuffleOptions: boolean; requireClass: boolean; instructions: string };
  questions: PubQuestion[];
}
interface SubmitResult {
  showResult: "none" | "score" | "score_answers"; score?: number; total?: number; pendingManual?: number;
  review?: { id: number; grade: "correct" | "wrong" | "manual"; correctAnswer: string; explanation: string; yourAnswer: string }[];
}

// خلط ثابت (نفس الترتيب بعد تحديث الصفحة)
function seeded(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffled<T>(arr: T[], rnd: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const ss = {
  get: (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  del: (k: string) => { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
};

export default function OnlineExam() {
  const { token = "" } = useParams();
  const [exam, setExam] = useState<PubExam | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const startRef = useRef<number>(0);
  const key = (s: string) => `exam:${token}:${s}`;

  useEffect(() => {
    callFn<PubExam>("online-exam", { action: "get", token }).then((e) => {
      setExam(e);
      const savedName = ss.get(key("name")), st = Number(ss.get(key("start")) || 0);
      if (savedName && st) {
        setName(savedName); setCls(ss.get(key("cls")) ?? ""); startRef.current = st; setStarted(true);
        try { setAnswers(JSON.parse(ss.get(key("answers")) || "{}")); } catch { /* ignore */ }
      }
    }).catch((e) => setLoadErr(e.message || "تعذّر تحميل الامتحان"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const view = useMemo(() => {
    if (!exam) return [];
    const rnd = seeded(`${token}|${name.trim().toLowerCase()}`);
    const qs = exam.settings.shuffleQuestions ? shuffled(exam.questions, rnd) : exam.questions;
    return qs.map((q) => ({
      ...q,
      options: q.options && exam.settings.shuffleOptions ? shuffled(q.options, seeded(`${token}|${name.trim().toLowerCase()}|${q.id}`)) : q.options,
    }));
  }, [exam, name, token]);

  const submit = useCallback(async (auto = false) => {
    if (!exam || submitting) return;
    setSubmitting(true); setSubmitErr("");
    try {
      const res = await callFn<SubmitResult>("online-exam", {
        action: "submit", token, student: { name: name.trim(), class: cls.trim() },
        answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
        timeTakenSeconds: Math.round((Date.now() - startRef.current) / 1000),
      });
      ["name", "cls", "start", "answers"].forEach((k) => ss.del(key(k)));
      setResult(res);
    } catch (e: any) {
      setSubmitErr(auto ? `انتهى الوقت لكن تعذّر التسليم: ${e.message}` : e.message);
    } finally { setSubmitting(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, submitting, token, name, cls, answers]);

  const submitRef = useRef(submit);
  submitRef.current = submit;

  // المؤقت
  useEffect(() => {
    if (!started || !exam || result) return;
    const total = exam.settings.durationMinutes * 60;
    if (!total) return;
    const tick = () => {
      const left = Math.max(0, total - Math.floor((Date.now() - startRef.current) / 1000));
      setRemaining(left);
      if (left === 0) submitRef.current(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [started, exam, result]);

  const setAnswer = (id: number, v: string) => {
    setAnswers((a) => { const n = { ...a, [id]: v }; ss.set(key("answers"), JSON.stringify(n)); return n; });
  };

  const start = () => {
    if (!name.trim()) return;
    startRef.current = Date.now();
    ss.set(key("name"), name.trim()); ss.set(key("cls"), cls.trim()); ss.set(key("start"), String(startRef.current));
    setStarted(true);
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-right text-slate-900 dark:bg-[#050714] dark:text-white" dir="rtl">
      <div className="mx-auto max-w-3xl space-y-5">{children}</div>
    </div>
  );

  if (loadErr) return shell(<Alert variant="destructive"><AlertDescription className="text-base">{loadErr}</AlertDescription></Alert>);
  if (!exam) return shell(<Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin" />);

  // ───── النتيجة ─────
  if (result) {
    return shell(
      <>
        <Card className="space-y-3 p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
          <h1 className="text-2xl font-bold">تم تسليم إجاباتك</h1>
          {result.showResult === "none" && <p className="text-muted-foreground">شكراً {name}. سيصلك المعلم بالنتيجة.</p>}
          {result.score !== undefined && (
            <>
              <p className="text-4xl font-black">{result.score} / {result.total}</p>
              <p className="text-sm text-muted-foreground">علامة الأسئلة المصحَّحة آلياً{result.pendingManual ? ` — و${result.pendingManual} سؤال سيصحّحه المعلم يدوياً` : ""}.</p>
            </>
          )}
        </Card>
        {result.review && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold">مراجعة الإجابات</h2>
            {view.map((q, i) => {
              const r = result.review!.find((x) => x.id === q.id)!;
              return (
                <Card key={q.id} className="space-y-1 p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    {r.grade === "correct" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : r.grade === "wrong" ? <XCircle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-amber-600" />}
                    {i + 1}) {q.question}
                  </div>
                  <div>إجابتك: <b>{r.yourAnswer || "—"}</b></div>
                  <div className="text-green-700 dark:text-green-400">الإجابة الصحيحة: {r.correctAnswer}</div>
                  {r.explanation && <div className="text-muted-foreground">{r.explanation}</div>}
                </Card>
              );
            })}
          </div>
        )}
      </>,
    );
  }

  // ───── شاشة البدء ─────
  if (!started) {
    return shell(
      <Card className="space-y-4 p-6">
        {exam.schoolName && <p className="text-center text-sm text-muted-foreground">{exam.schoolName}</p>}
        <h1 className="text-center text-2xl font-black">{exam.title}</h1>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {exam.subject && <Badge variant="secondary">{exam.subject}</Badge>}
          {exam.grade && <Badge variant="secondary">{exam.grade}</Badge>}
          <Badge variant="outline">{exam.questions.length} سؤال</Badge>
          {exam.settings.durationMinutes > 0 && <Badge variant="outline">{exam.settings.durationMinutes} دقيقة</Badge>}
        </div>
        {exam.settings.instructions && <Alert><AlertDescription className="whitespace-pre-line">{exam.settings.instructions}</AlertDescription></Alert>}
        <div className="space-y-2">
          <Input placeholder="اسمك الكامل *" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={exam.settings.requireClass ? "الصف / الشعبة *" : "الصف / الشعبة (اختياري)"} value={cls} maxLength={60} onChange={(e) => setCls(e.target.value)} />
        </div>
        {exam.settings.durationMinutes > 0 && <p className="text-xs text-muted-foreground">يبدأ العدّ التنازلي عند الضغط على «ابدأ» ويُسلَّم الامتحان تلقائياً عند انتهاء الوقت.</p>}
        <Button size="lg" className="w-full" disabled={!name.trim() || (exam.settings.requireClass && !cls.trim())} onClick={start}>ابدأ الامتحان</Button>
      </Card>,
    );
  }

  // ───── الامتحان ─────
  const answered = view.filter((q) => (answers[q.id] ?? "").trim()).length;
  const mmss = remaining === null ? "" : `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return shell(
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border bg-background/95 px-4 py-2 shadow-sm backdrop-blur">
        <div className="min-w-0"><div className="truncate font-bold">{exam.title}</div><div className="text-xs text-muted-foreground">{name} · أجبتَ {answered} من {view.length}</div></div>
        {remaining !== null && <div className={`flex items-center gap-1 font-mono text-lg font-bold ${remaining < 60 ? "text-destructive" : ""}`}><Clock className="h-4 w-4" />{mmss}</div>}
      </div>

      {view.map((q, i) => (
        <Card key={q.id} className="space-y-3 p-5">
          <div className="flex items-center gap-2"><Badge>{i + 1}</Badge><span className="text-xs text-muted-foreground">{QTYPE_LABEL[q.type]}</span></div>
          <p className="leading-loose">{q.question}</p>
          {q.table && <TableView table={q.table} />}
          {q.figure && (
            <figure className="space-y-1">
              <div className="inline-block max-w-full rounded-lg border bg-white p-2"><img src={q.figure.url} alt={q.figure.caption || "شكل"} className="max-h-80 max-w-full object-contain" /></div>
              {q.figure.caption && <figcaption className="text-xs text-muted-foreground">{q.figure.caption}</figcaption>}
            </figure>
          )}

          {q.type === "multiple_choice" && (
            <div className="space-y-2" role="radiogroup">
              {q.options?.map((o, oi) => (
                <label key={o} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${answers[q.id] === o ? "border-primary bg-primary/10" : "hover:bg-muted/50"}`}>
                  <input type="radio" name={`q${q.id}`} checked={answers[q.id] === o} onChange={() => setAnswer(q.id, o)} />
                  <span className="font-semibold">{LETTERS[oi]}.</span><span>{o}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === "true_false" && (
            <div className="flex gap-3">
              {["صح", "خطأ"].map((v) => (
                <Button key={v} type="button" variant={answers[q.id] === v ? "default" : "outline"} className="flex-1" onClick={() => setAnswer(q.id, v)}>{v}</Button>
              ))}
            </div>
          )}
          {q.type === "fill_blank" && <Input placeholder="اكتب الإجابة" value={answers[q.id] ?? ""} maxLength={300} onChange={(e) => setAnswer(q.id, e.target.value)} />}
          {(q.type === "short_answer" || q.type === "essay") && (
            <Textarea placeholder="اكتب إجابتك" value={answers[q.id] ?? ""} maxLength={4000} className={q.type === "essay" ? "min-h-[160px]" : "min-h-[80px]"} onChange={(e) => setAnswer(q.id, e.target.value)} />
          )}
        </Card>
      ))}

      {submitErr && <Alert variant="destructive"><AlertDescription>{submitErr}</AlertDescription></Alert>}
      <Button size="lg" className="w-full" disabled={submitting} onClick={() => {
        if (answered < view.length && !window.confirm(`لم تُجب عن ${view.length - answered} سؤال. هل تريد التسليم؟`)) return;
        submit();
      }}>
        {submitting ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : null}تسليم الامتحان
      </Button>
    </>,
  );
}
