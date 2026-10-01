import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UploadCloud, FileText, X, Copy, Printer, Eye, EyeOff, Sparkles, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DIFFICULTY_AR,
  QTYPE_META,
  examToPrintHtml,
  examToText,
  type ExamFromFileResponse,
  type QType,
} from "./examFromFileTypes";

const MAX_FILES = 5;
const MAX_INLINE_MB = 10; // أكبر ملف PDF/صورة نرسله كما هو للذكاء الاصطناعي
const MAX_TOTAL_INLINE_BYTES = 14 * 1024 * 1024;
const MAX_FILE_MB = 30;
const LETTERS = ["أ", "ب", "ج", "د"];

interface PreparedFile {
  name: string;
  mimeType?: string;
  base64?: string;
  text?: string;
  approxBytes: number;
}

const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error(`تعذّرت قراءة الملف ${file.name}`));
    r.readAsDataURL(file);
  });

async function prepareFile(file: File): Promise<PreparedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`الملف "${file.name}" أكبر من ${MAX_FILE_MB} ميجابايت`);
  }

  const imageMime: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  };

  // صور و PDF: يقرؤها الذكاء الاصطناعي مباشرة (يدعم الملفات الممسوحة والعربية)
  if (ext === "pdf" || imageMime[ext]) {
    if (file.size <= MAX_INLINE_MB * 1024 * 1024) {
      return {
        name: file.name,
        mimeType: ext === "pdf" ? "application/pdf" : imageMime[ext],
        base64: await readBase64(file),
        approxBytes: file.size,
      };
    }
    if (ext !== "pdf") throw new Error(`الصورة "${file.name}" أكبر من ${MAX_INLINE_MB} ميجابايت`);
    // PDF كبير: استخرج النص محلياً
  }

  if (["pdf", "docx", "txt", "md"].includes(ext)) {
    const { fileParserService } = await import("@/services/fileParserService");
    const parsed = await fileParserService.parseFile(file);
    const text = parsed.extractedText?.trim() ?? "";
    if (text.length < 80 || fileParserService.isCorruptedPdfText(text, file.name)) {
      throw new Error(`لم أستطع استخراج نص مقروء من "${file.name}". جرّب نسخة أصغر أو ملف DOCX/صورة.`);
    }
    return { name: file.name, text, approxBytes: 0 };
  }

  throw new Error(`صيغة "${file.name}" غير مدعومة. المسموح: PDF, DOCX, TXT, MD, PNG, JPG, WEBP`);
}

export default function ExamFromFilePanel({ defaultGrade = "" }: { defaultGrade?: string }) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [counts, setCounts] = useState<Record<QType, number>>({
    multiple_choice: 5, true_false: 3, fill_blank: 2, short_answer: 0, essay: 0,
  });
  const [difficulty, setDifficulty] = useState("mixed");
  const [language, setLanguage] = useState("auto");
  const [grade, setGrade] = useState(defaultGrade);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<ExamFromFileResponse | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const addFiles = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list);
    setFiles((prev) => {
      const merged = [...prev];
      for (const f of incoming) {
        if (merged.length >= MAX_FILES) {
          toast({ title: "⚠️ الحد الأقصى", description: `يمكن رفع ${MAX_FILES} ملفات كحد أقصى`, variant: "destructive" });
          break;
        }
        if (!merged.some((m) => m.name === f.name && m.size === f.size)) merged.push(f);
      }
      return merged;
    });
  }, [toast]);

  const setCount = (k: QType, v: string) => {
    const n = Math.max(0, Math.min(50, parseInt(v || "0", 10) || 0));
    setCounts((c) => ({ ...c, [k]: n }));
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      toast({ title: "⚠️ ارفع ملفاً", description: "ارفع الملف الذي تريد إنشاء الامتحان منه", variant: "destructive" });
      return;
    }
    if (total < 1 || total > 50) {
      toast({ title: "⚠️ عدد الأسئلة", description: "اختر من 1 إلى 50 سؤالاً بمجموع الأنواع", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      setStage("جارٍ قراءة الملفات...");
      const prepared: PreparedFile[] = [];
      for (const f of files) prepared.push(await prepareFile(f));
      if (prepared.reduce((s, p) => s + p.approxBytes, 0) > MAX_TOTAL_INLINE_BYTES) {
        throw new Error("مجموع حجم الملفات كبير جداً (الحد 14 ميجابايت). قلّل عدد الملفات أو حجمها.");
      }

      setStage("الذكاء الاصطناعي يقرأ الملف ويصيغ الأسئلة ثم يتحقق منها (قد يستغرق دقيقة)...");
      const { data, error } = await supabase.functions.invoke("generate-exam-from-file", {
        body: {
          files: prepared.map(({ approxBytes: _a, ...rest }) => rest),
          counts,
          difficulty,
          language,
          grade: grade.trim() || undefined,
          subject: subject.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      if (error) {
        // حاول استخراج رسالة الخطأ الفعلية من الدالة
        let msg = error.message;
        try {
          const body = await (error as any).context?.json?.();
          if (body?.error) msg = body.error;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);

      setResult(data as ExamFromFileResponse);
      toast({ title: "✅ تم إنشاء الامتحان", description: `${data.delivered} سؤال من الملف المرفق` });
    } catch (e: any) {
      console.error("exam-from-file:", e);
      toast({ title: "⚠️ تعذّر إنشاء الامتحان", description: e.message || "حدث خطأ غير متوقع", variant: "destructive" });
    } finally {
      setGenerating(false);
      setStage("");
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "✅ تم النسخ", description: label });
  };

  const print = (withAnswers: boolean) => {
    if (!result) return;
    const w = window.open("", "_blank");
    if (!w) {
      toast({ title: "⚠️ النافذة محجوبة", description: "اسمح بالنوافذ المنبثقة ثم أعد المحاولة", variant: "destructive" });
      return;
    }
    w.document.write(examToPrintHtml(result.exam, withAnswers));
    w.document.close();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Alert>
        <AlertDescription className="text-sm">
          ارفع ملفاً (PDF / Word / نص / صورة) وسيُنشأ الامتحان من محتوى الملف فقط دون أي معلومة من خارجه،
          وكل سؤال يأتي مع اقتباس من الملف يثبت إجابته، ويُدقَّق تلقائياً قبل عرضه.
        </AlertDescription>
      </Alert>

      {/* رفع الملفات */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"
        }`}
      >
        <UploadCloud className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">اسحب الملف هنا أو اضغط للاختيار</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, TXT, MD, PNG, JPG — حتى {MAX_FILES} ملفات</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <Card key={`${f.name}-${i}`} className="flex items-center justify-between p-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* عدد الأسئلة لكل نوع */}
      <div className="space-y-2">
        <Label>عدد الأسئلة لكل نوع <span className="text-muted-foreground">(المجموع: {total})</span></Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {QTYPE_META.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Input type="number" min={0} max={50} value={counts[key]} onChange={(e) => setCount(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>مستوى الصعوبة</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mixed">متنوع</SelectItem>
              <SelectItem value="easy">سهل</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="hard">صعب</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>لغة الامتحان</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">نفس لغة الملف</SelectItem>
              <SelectItem value="العربية">العربية</SelectItem>
              <SelectItem value="English">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>الصف (اختياري)</Label>
          <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="مثال: الصف العاشر" />
        </div>
        <div className="space-y-2">
          <Label>المادة (اختياري)</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثال: الأحياء" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>ملاحظات إضافية (اختياري)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثال: ركّز على الفصل الثاني، أو اجعل الأسئلة تطبيقية..."
          className="min-h-[70px]"
        />
      </div>

      <Button className="w-full" onClick={handleGenerate} disabled={generating || files.length === 0}>
        {generating ? (
          <><Loader2 className="ml-2 h-4 w-4 animate-spin" />{stage || "جارٍ المعالجة..."}</>
        ) : (
          <><Sparkles className="ml-2 h-4 w-4" />أنشئ الامتحان من الملف</>
        )}
      </Button>

      {/* النتيجة */}
      {result && (
        <div className="space-y-4">
          {result.warnings.map((w, i) => (
            <Alert key={i} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">{result.exam.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAnswers((s) => !s)}>
                {showAnswers ? <EyeOff className="ml-1 h-4 w-4" /> : <Eye className="ml-1 h-4 w-4" />}
                {showAnswers ? "إخفاء الإجابات" : "إظهار الإجابات"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy(examToText(result.exam, false), "نسخة الطالب")}>
                <Copy className="ml-1 h-4 w-4" />نسخ (بدون إجابات)
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy(examToText(result.exam, true), "الامتحان مع الإجابات")}>
                <Copy className="ml-1 h-4 w-4" />نسخ (مع الإجابات)
              </Button>
              <Button size="sm" variant="outline" onClick={() => print(false)}>
                <Printer className="ml-1 h-4 w-4" />طباعة / PDF للطالب
              </Button>
              <Button size="sm" onClick={() => print(true)}>
                <Printer className="ml-1 h-4 w-4" />طباعة مع الإجابات
              </Button>
            </div>
          </div>

          {result.exam.questions.map((q) => (
            <Card key={q.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">سؤال {q.id}</Badge>
                <Badge variant="outline">{QTYPE_META.find((t) => t.key === q.type)?.label}</Badge>
                <Badge variant="outline">{DIFFICULTY_AR[q.difficulty]}</Badge>
              </div>
              <p className="leading-relaxed">{q.question}</p>

              {q.type === "multiple_choice" && q.options && (
                <ul className="space-y-1 pr-2">
                  {q.options.map((o, i) => {
                    const correct = showAnswers && o === q.answer;
                    return (
                      <li key={i} className={`rounded px-2 py-1 text-sm ${correct ? "bg-green-100 font-semibold text-green-900 dark:bg-green-900/30 dark:text-green-200" : ""}`}>
                        {LETTERS[i]}. {o}
                      </li>
                    );
                  })}
                </ul>
              )}

              {showAnswers && q.type !== "multiple_choice" && (
                <p className="rounded bg-green-100 px-2 py-1 text-sm text-green-900 dark:bg-green-900/30 dark:text-green-200">
                  <b>الإجابة:</b> {q.answer}
                </p>
              )}

              {showAnswers && (
                <div className="space-y-1 border-t pt-2 text-xs text-muted-foreground">
                  {q.explanation && <p><b>ملاحظة التصحيح:</b> {q.explanation}</p>}
                  <p><b>الدليل من الملف:</b> «{q.evidence}»{q.location ? ` — ${q.location}` : ""}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
