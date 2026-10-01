import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, BarChart3, Copy, ExternalLink, FileDown, Globe, Loader2, Printer, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadExamPdf, openPrintWindow, type PdfMode } from "@/lib/examCreator/pdfExport";
import { publishOnlineExam } from "@/lib/examCreator/api";
import type { GeneratedExam, OnlineSettings } from "@/lib/examCreator/types";
import ExamResultsDialog from "./ExamResultsDialog";

interface Props { exam: GeneratedExam; onBack: () => void }

export default function StepPublish({ exam, onBack }: Props) {
  const { toast } = useToast();
  const [pdfBusy, setPdfBusy] = useState<PdfMode | null>(null);
  const [pdfProgress, setPdfProgress] = useState("");
  const [pubBusy, setPubBusy] = useState(false);
  const [published, setPublished] = useState<{ id: string; link: string } | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [os, setOs] = useState<OnlineSettings>({
    durationMinutes: exam.meta.durationMinutes || 45, showResult: "score", shuffleQuestions: true,
    shuffleOptions: true, requireClass: false, allowRetake: false, instructions: "",
  });

  // نرقّم الأسئلة 1..n بعد أي حذف
  const finalExam = (): GeneratedExam => ({ ...exam, questions: exam.questions.map((q, i) => ({ ...q, id: i + 1 })) });

  const pdf = async (mode: PdfMode) => {
    setPdfBusy(mode); setPdfProgress("");
    try {
      await downloadExamPdf(finalExam(), mode, (d, t) => setPdfProgress(`صفحة ${d} من ${t}`));
      toast({ title: "✅ تم تنزيل PDF" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "⚠️ تعذّر إنشاء PDF", description: e?.message, variant: "destructive" });
    } finally { setPdfBusy(null); setPdfProgress(""); }
  };

  const print = (mode: PdfMode) => {
    if (!openPrintWindow(finalExam(), mode)) {
      toast({ title: "⚠️ النافذة محجوبة", description: "اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة", variant: "destructive" });
    }
  };

  const publish = async () => {
    setPubBusy(true);
    try {
      const r = await publishOnlineExam(finalExam(), os);
      setPublished(r);
      toast({ title: "✅ تم إنشاء رابط الامتحان" });
    } catch (e: any) {
      toast({ title: "⚠️ تعذّر النشر", description: e?.message, variant: "destructive" });
    } finally { setPubBusy(false); }
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ title: "✅ تم نسخ الرابط" }); };
  const share = async () => {
    if (!published) return;
    const text = `امتحان: ${exam.title}\n${published.link}`;
    if (navigator.share) { try { await navigator.share({ title: exam.title, text, url: published.link }); return; } catch { /* ألغى */ } }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const setO = <K extends keyof OnlineSettings>(k: K, v: OnlineSettings[K]) => setOs({ ...os, [k]: v });
  const hasManual = exam.questions.some((q) => q.type === "short_answer" || q.type === "essay");

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-lg font-bold"><FileDown className="h-5 w-5 text-primary" />تنزيل PDF</div>
        <p className="text-sm text-muted-foreground">ورقة امتحان منسّقة بصفحات A4: رأس رسمي، أقسام مرقّمة، جداول وأشكال بجودة عالية، ونموذج إجابة منفصل للمعلم. الأزرار الأولى تنزّل الملف مباشرة (صورة لكل صفحة)، وزر «أعلى جودة» يفتح الطباعة لحفظ PDF بنص حقيقي.</p>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!!pdfBusy} onClick={() => pdf("student")}>
            {pdfBusy === "student" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <FileDown className="ml-2 h-4 w-4" />}ورقة الطالب
          </Button>
          <Button variant="secondary" disabled={!!pdfBusy} onClick={() => pdf("key")}>
            {pdfBusy === "key" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <FileDown className="ml-2 h-4 w-4" />}نموذج الإجابة
          </Button>
          <Button variant="outline" disabled={!!pdfBusy} onClick={() => pdf("both")}>
            {pdfBusy === "both" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <FileDown className="ml-2 h-4 w-4" />}الاثنان في ملف واحد
          </Button>
          {pdfProgress && <span className="self-center text-sm text-muted-foreground">{pdfProgress}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => print("student")}><Printer className="ml-2 h-4 w-4" />PDF بأعلى جودة (موصى به)</Button>
          <Button variant="ghost" onClick={() => print("both")}>مع نموذج الإجابة</Button>
          <span className="text-xs text-muted-foreground">نص حقيقي قابل للتحديد وحجم صغير؛ في نافذة الطباعة اختر «حفظ كـ PDF».</span>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-lg font-bold"><Globe className="h-5 w-5 text-primary" />رابط الامتحان الإلكتروني</div>
        {!published ? (
          <>
            <p className="text-sm text-muted-foreground">أي شخص معه الرابط يستطيع أداء الامتحان من جوال أو حاسوب. الأسئلة تُعرض بلا إجابات، والتصحيح يتم على الخادم.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>زمن الامتحان (دقيقة، 0 = بلا حد)</Label>
                <Input type="number" min={0} max={600} value={os.durationMinutes}
                  onChange={(e) => setO("durationMinutes", Math.max(0, Math.min(600, parseInt(e.target.value || "0", 10) || 0)))} />
              </div>
              <div className="space-y-1">
                <Label>ما يراه الطالب بعد التسليم</Label>
                <Select value={os.showResult} onValueChange={(v) => setO("showResult", v as OnlineSettings["showResult"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا شيء (تأكيد التسليم فقط)</SelectItem>
                    <SelectItem value="score">العلامة فقط</SelectItem>
                    <SelectItem value="score_answers">العلامة مع الإجابات الصحيحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["shuffleQuestions", "خلط ترتيب الأسئلة لكل طالب"],
                ["shuffleOptions", "خلط ترتيب الخيارات"],
                ["requireClass", "اشتراط كتابة الصف/الشعبة"],
                ["allowRetake", "السماح بإعادة التسليم بنفس الاسم"],
              ] as const).map(([k, label]) => (
                <label key={k} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  {label}<Switch checked={os[k]} onCheckedChange={(v) => setO(k, v)} />
                </label>
              ))}
            </div>
            <Textarea placeholder="تعليمات تظهر للطالب قبل البدء (اختياري)" value={os.instructions} maxLength={600}
              onChange={(e) => setO("instructions", e.target.value)} />
            {hasManual && <Alert><AlertDescription className="text-sm">أسئلة الإجابة القصيرة والمقالية لا تُصحَّح آلياً؛ ستجد إجابات الطلاب في صفحة النتائج لتصحيحها.</AlertDescription></Alert>}
            <Button disabled={pubBusy} onClick={publish}>
              {pubBusy ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Globe className="ml-2 h-4 w-4" />}أنشئ رابط الامتحان
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={published.link} dir="ltr" className="font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
              <Button variant="outline" size="icon" onClick={() => copy(published.link)} aria-label="نسخ الرابط"><Copy className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={share}><Share2 className="ml-2 h-4 w-4" />مشاركة (واتساب...)</Button>
              <Button variant="outline" onClick={() => window.open(published.link, "_blank", "noopener")}><ExternalLink className="ml-2 h-4 w-4" />فتح الامتحان</Button>
              <Button variant="outline" onClick={() => setResultsOpen(true)}><BarChart3 className="ml-2 h-4 w-4" />نتائج الطلاب</Button>
            </div>
            <p className="text-xs text-muted-foreground">تجد هذا الامتحان لاحقاً في «امتحاناتي المنشورة» بصفحة الرفع، ويمكنك إغلاقه أو إعادة فتحه.</p>
            <ExamResultsDialog open={resultsOpen} onClose={() => setResultsOpen(false)} examId={published.id} title={exam.title} questions={finalExam().questions} />
          </div>
        )}
      </Card>

      <Button variant="outline" onClick={onBack}><ArrowRight className="ml-2 h-4 w-4" />رجوع للمراجعة</Button>
    </div>
  );
}
