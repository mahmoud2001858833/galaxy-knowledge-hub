import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, UploadCloud, FileText, X, Wand2 } from "lucide-react";
import { ACCEPT, MAX_FILES } from "@/lib/examCreator/fileUtils";

interface Props {
  files: File[];
  busy: boolean;
  stage: string;
  onAdd: (list: File[]) => void;
  onRemove: (i: number) => void;
  onAnalyze: () => void;
}

export default function StepUpload({ files, busy, stage, onAdd, onRemove, onAnalyze }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); onAdd(Array.from(e.dataTransfer.files)); }}
        onClick={() => !busy && ref.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          over ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"
        }`}
      >
        <UploadCloud className="mx-auto mb-3 h-12 w-12 text-primary/70" />
        <p className="text-lg font-semibold">ارفع كتابك أو ملزمتك هنا</p>
        <p className="mt-1 text-sm text-muted-foreground">اسحب الملف أو اضغط للاختيار — PDF · Word · نص · صورة (حتى {MAX_FILES} ملفات)</p>
        <p className="mt-1 text-xs text-muted-foreground">الملفات الكبيرة جداً مقبولة (حتى 400MB)؛ تُقرأ محلياً في متصفحك</p>
        <input ref={ref} type="file" multiple hidden accept={ACCEPT}
          onChange={(e) => { if (e.target.files) onAdd(Array.from(e.target.files)); e.target.value = ""; }} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <Card key={`${f.name}-${i}`} className="flex items-center justify-between p-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-sm">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <Button size="icon" variant="ghost" disabled={busy} onClick={() => onRemove(i)}><X className="h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      )}

      <Button className="w-full" size="lg" disabled={busy || files.length === 0} onClick={onAnalyze}>
        {busy ? (<><Loader2 className="ml-2 h-5 w-5 animate-spin" />{stage || "جارٍ المعالجة..."}</>)
          : (<><Wand2 className="ml-2 h-5 w-5" />حلّل الملف وقسّمه إلى وحدات</>)}
      </Button>
    </div>
  );
}
