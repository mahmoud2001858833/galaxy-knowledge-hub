import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ChevronDown, ChevronUp, Info, XCircle } from "lucide-react";
import type { ExamDiagnostics } from "@/lib/examCreator/types";

const GROUPS: { label: string; keys: string[] }[] = [
  { label: "رُفضت بعد التدقيق مقابل ملفك", keys: ["verify_invalid"] },
  { label: "أسئلة مكررة", keys: ["duplicate"] },
  { label: "بلا اقتباس يثبتها من الملف", keys: ["no_evidence"] },
  { label: "صياغة غير صالحة (خيارات/إجابة/فراغ)", keys: ["bad_type", "empty_question_or_answer", "mcq_options_not_4", "mcq_answer_not_in_options", "bad_true_false", "fill_blank_without_blank"] },
  { label: "مشكلة في ربط شكل أو جدول", keys: ["invalid_figure", "invalid_table", "mentions_missing_figure", "mentions_missing_table", "unknown_figure_id", "unknown_table_id", "visual_round_without_visual", "visual_over_plan", "figure_overused", "table_overused", "figure_image_missing"] },
];

function Row({ label, asked, found, used, noun }: { label: string; asked: number; found: number; used: number; noun: string }) {
  if (asked === 0 && found === 0 && used === 0) return null;
  const good = asked === 0 || used >= asked;
  let why = "";
  if (!good) {
    why = found === 0
      ? `لم يُرصد أي ${noun} صالح في الصفحات المختارة، فلم يُدرج.`
      : `رُصد ${found} لكن لم يتحقق العدد المطلوب بعد التدقيق؛ جرّب وحدات فيها ${noun}اً أكثر أو قلّل العدد المطلوب.`;
  }
  return (
    <div className="flex items-start gap-2 text-sm">
      {good ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
      <div>
        <b>{label}:</b> طُلب {asked} · رُصد {found} · أُدرج في الأسئلة <b>{used}</b>
        {why && <div className="text-xs text-muted-foreground">{why}</div>}
      </div>
    </div>
  );
}

export default function DiagnosticsPanel({ d }: { d: ExamDiagnostics }) {
  const [open, setOpen] = useState(false);
  const droppedTotal = Object.values(d.dropped).reduce((a, b) => a + b, 0);
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4 text-primary" />تقرير الأشكال والجداول والجودة</div>
        <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>{open ? <>إخفاء <ChevronUp className="mr-1 h-4 w-4" /></> : <>تفاصيل <ChevronDown className="mr-1 h-4 w-4" /></>}</Button>
      </div>

      <div className="space-y-2">
        <Row label="الأشكال" noun="شكل" asked={d.asked.figures} found={d.catalog.figures} used={d.delivered.figures} />
        <Row label="الجداول" noun="جدول" asked={d.asked.tables} found={d.catalog.tables} used={d.delivered.tables} />
      </div>

      {open && (
        <div className="space-y-3 border-t pt-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">أشكال رصدها الذكاء الاصطناعي: {d.discovered.figures}</Badge>
            <Badge variant="outline">جداول رصدها: {d.discovered.tables}</Badge>
            <Badge variant="outline">قصّ لم يجتز الفحص: {d.cropRejected.length}</Badge>
            {(d.discovered.stats.unfaithfulTables ?? 0) > 0 && <Badge variant="outline">جداول لم يطابق نقلها الأصل: {d.discovered.stats.unfaithfulTables}</Badge>}
            {(d.discovered.stats.tooLargeFigures ?? 0) > 0 && <Badge variant="outline">صناديق تغطي صفحة كاملة (رُفضت): {d.discovered.stats.tooLargeFigures}</Badge>}
            {d.duplicatesRemoved > 0 && <Badge variant="outline">مكرر بين الدفعات: {d.duplicatesRemoved}</Badge>}
            {d.batches.total > 1 && <Badge variant="outline">الدفعات: {d.batches.total - d.batches.failed}/{d.batches.total}</Badge>}
          </div>

          {d.cropRejected.length > 0 && (
            <div>
              <div className="mb-1 font-semibold">أشكال رُفضت عند القص:</div>
              <ul className="list-inside list-disc text-xs text-muted-foreground">
                {d.cropRejected.map((r) => <li key={r.id}>{r.id}: {r.reason}</li>)}
              </ul>
            </div>
          )}

          {droppedTotal > 0 && (
            <div>
              <div className="mb-1 font-semibold">أسئلة حُذفت ({droppedTotal}):</div>
              <ul className="list-inside list-disc text-xs text-muted-foreground">
                {GROUPS.map((g) => {
                  const n = g.keys.reduce((s, k) => s + (d.dropped[k] ?? 0), 0);
                  return n ? <li key={g.label}>{g.label}: {n}</li> : null;
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
