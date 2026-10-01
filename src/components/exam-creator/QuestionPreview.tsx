import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ImageOff, Pencil, Check, Trash2, FileSearch } from "lucide-react";
import { DIFFICULTY_AR, LETTERS, QTYPE_LABEL, type ExamQuestion, type TableData } from "@/lib/examCreator/types";

export function TableView({ table }: { table: TableData }) {
  return (
    <div className="my-3 overflow-x-auto rounded-lg border">
      {table.caption && <div className="bg-muted/50 px-3 py-1 text-center text-xs text-muted-foreground">{table.caption}</div>}
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr>{table.headers.map((h, i) => <th key={i} className="border-b bg-slate-800 px-3 py-2 font-semibold text-white">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-muted/40" : ""}>
              {r.map((c, j) => <td key={j} className="border-t px-3 py-1.5">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  q: ExamQuestion;
  index: number;
  showAnswer: boolean;
  onChange: (q: ExamQuestion) => void;
  onDelete: () => void;
}

export default function QuestionPreview({ q, index, showAnswer, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ExamQuestion>(q);

  const start = () => { setDraft(q); setEditing(true); };
  const save = () => {
    const d = { ...draft, question: draft.question.trim(), answer: draft.answer.trim() };
    if (d.type === "multiple_choice" && d.options) {
      d.options = d.options.map((o) => o.trim());
      if (!d.options.includes(d.answer)) d.answer = d.options[0];
    }
    onChange(d);
    setEditing(false);
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>سؤال {index + 1}</Badge>
          <Badge variant="secondary">{QTYPE_LABEL[q.type]}</Badge>
          <Badge variant="outline">{DIFFICULTY_AR[q.difficulty]}</Badge>
          {q.unit && <Badge variant="outline" className="max-w-[16rem] truncate">{q.unit}</Badge>}
        </div>
        <div className="flex gap-1">
          {editing ? (
            <Button size="sm" onClick={save}><Check className="ml-1 h-4 w-4" />حفظ</Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={start}><Pencil className="ml-1 h-4 w-4" />تعديل</Button>
          )}
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="ml-1 h-4 w-4" />حذف</Button>
        </div>
      </div>

      {editing ? (
        <Textarea value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} className="min-h-[80px]" />
      ) : (
        <p className="leading-loose">{q.question}</p>
      )}

      {q.table && <TableView table={q.table} />}

      {q.figure && (
        <div className="space-y-1">
          {q.figure.dataUrl ? (
            <div className="inline-block max-w-full rounded-lg border bg-white p-2">
              <img src={q.figure.dataUrl} alt={q.figure.caption} className="max-h-72 max-w-full object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-destructive"><ImageOff className="h-4 w-4" />تعذّر استخراج الشكل</div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <FileSearch className="h-3.5 w-3.5" />
            <span>مقصوص من الملف الأصلي — صفحة {q.figure.page}{q.figure.caption ? ` — ${q.figure.caption}` : ""}</span>
            {q.figure.revealsAnswer && (
              <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />قد تكشف تسمياتُ الشكل الإجابةَ</Badge>
            )}
            <Button size="sm" variant="link" className="h-auto p-0 text-xs text-destructive" onClick={() => onChange({ ...q, figure: undefined })}>
              إزالة الشكل
            </Button>
          </div>
        </div>
      )}

      {q.type === "multiple_choice" && q.options && (
        editing ? (
          <div className="space-y-2">
            {draft.options!.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name={`ans-${q.id}`} checked={draft.answer === o}
                  onChange={() => setDraft({ ...draft, answer: o })} aria-label={`الخيار ${LETTERS[i]} هو الصحيح`} />
                <span className="w-5 text-sm">{LETTERS[i]}.</span>
                <Input value={o} onChange={(e) => {
                  const opts = [...draft.options!];
                  const wasAnswer = draft.answer === o;
                  opts[i] = e.target.value;
                  setDraft({ ...draft, options: opts, answer: wasAnswer ? e.target.value : draft.answer });
                }} />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-1 pr-1">
            {q.options.map((o, i) => (
              <li key={i} className={`rounded px-2 py-1 text-sm ${showAnswer && o === q.answer ? "bg-green-100 font-semibold text-green-900 dark:bg-green-900/30 dark:text-green-200" : ""}`}>
                {LETTERS[i]}. {o}
              </li>
            ))}
          </ul>
        )
      )}

      {editing && q.type !== "multiple_choice" && (
        <Input value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} placeholder="الإجابة الصحيحة" />
      )}
      {editing && (
        <Textarea value={draft.explanation ?? ""} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} placeholder="شرح الإجابة / نقاط التصحيح" className="min-h-[60px]" />
      )}

      {!editing && showAnswer && (
        <div className="space-y-1 border-t pt-2 text-sm">
          {q.type !== "multiple_choice" && (
            <p className="rounded bg-green-100 px-2 py-1 text-green-900 dark:bg-green-900/30 dark:text-green-200"><b>الإجابة:</b> {q.answer}</p>
          )}
          {q.explanation && <p className="text-muted-foreground"><b>الشرح:</b> {q.explanation}</p>}
          <p className="text-xs text-muted-foreground"><b>الدليل من الملف:</b> «{q.evidence}»{q.location ? ` — ${q.location}` : ""}</p>
        </div>
      )}
    </Card>
  );
}
