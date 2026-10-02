import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked, Loader2, Search, Zap } from "lucide-react";
import type { LibraryRow } from "@/lib/examCreator/library";
import { sanitizeCachedUnits } from "@/lib/examCreator/mergeUnits";

interface Props {
  rows: LibraryRow[] | null;
  error: string;
  selected: Set<string>;
  disabled?: boolean;
  onToggle: (row: LibraryRow) => void;
}

const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const ALL = "__all__";

export default function LibraryPicker({ rows, error, selected, disabled, onToggle }: Props) {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState(ALL);
  const [subject, setSubject] = useState(ALL);

  const grades = useMemo(() => Array.from(new Set((rows ?? []).map((r) => r.grade).filter(Boolean))) as string[], [rows]);
  const subjects = useMemo(() => Array.from(new Set((rows ?? []).map((r) => r.subject).filter(Boolean))) as string[], [rows]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (rows ?? []).filter((r) =>
      (grade === ALL || r.grade === grade) && (subject === ALL || r.subject === subject) &&
      (!s || [r.title, r.description, r.subject, r.grade].some((x) => (x ?? "").toLowerCase().includes(s))));
  }, [rows, q, grade, subject]);

  if (rows === null) return <Loader2 className="mx-auto my-8 h-6 w-6 animate-spin" />;
  if (error) return <p className="py-6 text-center text-sm text-muted-foreground">تعذّر تحميل مكتبة المنصة. يمكنك رفع ملفاتك بدلاً منها.</p>;
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <BookMarked className="mx-auto mb-2 h-8 w-8 opacity-50" />
        لا توجد ملفات في مكتبة المنصة بعد. ارفع ملفك من التبويب الآخر.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pr-9" placeholder="ابحث في المكتبة..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {grades.length > 0 && (
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-40"><SelectValue placeholder="الصف" /></SelectTrigger>
            <SelectContent><SelectItem value={ALL}>كل الصفوف</SelectItem>{grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {subjects.length > 0 && (
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-40"><SelectValue placeholder="المادة" /></SelectTrigger>
            <SelectContent><SelectItem value={ALL}>كل المواد</SelectItem>{subjects.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      {shown.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">لا نتائج مطابقة.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {shown.map((r) => {
          const on = selected.has(r.id);
          const units = sanitizeCachedUnits(r.units);
          return (
            <Card key={r.id} onClick={() => !disabled && onToggle(r)}
              className={`flex cursor-pointer items-start gap-3 p-3 transition-colors ${on ? "border-primary bg-primary/5" : "hover:border-primary/50"} ${disabled ? "opacity-60" : ""}`}>
              <Checkbox checked={on} disabled={disabled} className="mt-1" onCheckedChange={() => onToggle(r)} onClick={(e) => e.stopPropagation()} />
              <div className="min-w-0 space-y-1">
                <div className="font-semibold leading-snug">{r.title}</div>
                {r.description && <p className="line-clamp-2 text-xs text-muted-foreground">{r.description}</p>}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {r.grade && <Badge variant="secondary">{r.grade}</Badge>}
                  {r.subject && <Badge variant="secondary">{r.subject}</Badge>}
                  {r.page_count ? <Badge variant="outline">{r.page_count} صفحة</Badge> : null}
                  <Badge variant="outline">{fmtSize(r.size_bytes)}</Badge>
                  {units && <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3" />{units.length} وحدة جاهزة</Badge>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
