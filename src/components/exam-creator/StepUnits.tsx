import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Table2 } from "lucide-react";
import type { UnitInfo } from "@/lib/examCreator/types";

interface Props {
  units: UnitInfo[];
  fileNames: string[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onAll: (all: boolean) => void;
  onToggleFile: (fileIndex: number, on: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function StepUnits({ units, fileNames, selected, onToggle, onAll, onToggleFile, onBack, onNext }: Props) {
  const multi = fileNames.length > 1;
  const groups = fileNames.map((name, fi) => ({ fi, name, list: units.filter((u) => u.fileIndex === fi) })).filter((g) => g.list.length > 0);
  const usedFiles = new Set(units.filter((u) => selected.has(u.id)).map((u) => u.fileIndex)).size;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          قسّم الذكاء الاصطناعي الملف إلى <b>{units.length}</b> وحدة. اختر وحدة أو أكثر؛ لن تُؤخذ الأسئلة إلا منها.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onAll(true)}>تحديد الكل</Button>
          <Button size="sm" variant="outline" onClick={() => onAll(false)}>إلغاء التحديد</Button>
        </div>
      </div>

      {multi && usedFiles > 1 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          سيُنشأ امتحان <b>مدمج</b> من {usedFiles} ملفات. يمكنك اختيار طريقة توزيع الأسئلة بينها في الخطوة التالية.
        </div>
      )}

      <div className="space-y-5">
        {groups.map((g) => {
          const allOn = g.list.every((u) => selected.has(u.id));
          return (
            <section key={g.fi} className="space-y-2">
              {multi && (
                <div className="flex items-center justify-between gap-2 border-b pb-1">
                  <h3 className="truncate font-bold"><bdi>{g.name}</bdi></h3>
                  <Button size="sm" variant="ghost" onClick={() => onToggleFile(g.fi, !allOn)}>{allOn ? "إلغاء تحديد الملف" : "تحديد كل وحدات الملف"}</Button>
                </div>
              )}
              {g.list.map((u) => {
                const on = selected.has(u.id);
                return (
                  <Card key={u.id} onClick={() => onToggle(u.id)}
                    className={`flex cursor-pointer items-start gap-3 p-4 transition-colors ${on ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                    <Checkbox checked={on} onCheckedChange={() => onToggle(u.id)} className="mt-1" onClick={(e) => e.stopPropagation()} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="font-semibold">{u.title}</div>
                      {u.summary && <p className="text-sm text-muted-foreground">{u.summary}</p>}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {u.pageStart && <Badge variant="outline">ص {u.pageStart}{u.pageEnd && u.pageEnd !== u.pageStart ? `–${u.pageEnd}` : ""}</Badge>}
                        {u.hasFigures && <Badge variant="secondary" className="gap-1"><ImageIcon className="h-3 w-3" />فيها أشكال</Badge>}
                        {u.hasTables && <Badge variant="secondary" className="gap-1"><Table2 className="h-3 w-3" />فيها جداول</Badge>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack}><ArrowRight className="ml-2 h-4 w-4" />رجوع</Button>
        <Button disabled={selected.size === 0} onClick={onNext}>
          التالي ({selected.size} وحدة)<ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
