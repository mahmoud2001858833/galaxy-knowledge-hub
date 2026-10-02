import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, FileText, Layers, Loader2, UploadCloud, Wand2, X } from "lucide-react";
import { ACCEPT, MAX_FILES } from "@/lib/examCreator/fileUtils";
import type { LibraryRow } from "@/lib/examCreator/library";
import LibraryPicker from "./LibraryPicker";

export type Source =
  | { key: string; kind: "upload"; file: File }
  | { key: string; kind: "library"; row: LibraryRow };

interface Props {
  sources: Source[];
  library: LibraryRow[] | null;
  libraryError: string;
  busy: boolean;
  stage: string;
  onAddFiles: (list: File[]) => void;
  onToggleLibrary: (row: LibraryRow) => void;
  onRemove: (key: string) => void;
  onAnalyze: () => void;
}

const mb = (b: number) => (b / 1024 / 1024).toFixed(2);

export default function StepUpload({ sources, library, libraryError, busy, stage, onAddFiles, onToggleLibrary, onRemove, onAnalyze }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const hasLibrary = (library?.length ?? 0) > 0;
  const selectedLib = new Set(sources.filter((s): s is Extract<Source, { kind: "library" }> => s.kind === "library").map((s) => s.row.id));
  const needsAI = sources.some((s) => s.kind === "upload" || !(s.kind === "library" && s.row.units));

  return (
    <div className="space-y-5">
      <Tabs defaultValue={hasLibrary ? "library" : "upload"} key={hasLibrary ? "with-lib" : "no-lib"}>
        <TabsList className="grid h-auto w-full grid-cols-2 bg-muted text-muted-foreground">
          <TabsTrigger value="library" className="gap-2"><BookMarked className="h-4 w-4" />من مكتبة المنصة{hasLibrary ? ` (${library!.length})` : ""}</TabsTrigger>
          <TabsTrigger value="upload" className="gap-2"><UploadCloud className="h-4 w-4" />رفع ملفاتي</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-4">
          <LibraryPicker rows={library} error={libraryError} selected={selectedLib} disabled={busy} onToggle={onToggleLibrary} />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); onAddFiles(Array.from(e.dataTransfer.files)); }}
            onClick={() => !busy && ref.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              over ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"}`}
          >
            <UploadCloud className="mx-auto mb-3 h-12 w-12 text-primary/70" />
            <p className="text-lg font-semibold">ارفع كتابك أو ملزمتك هنا</p>
            <p className="mt-1 text-sm text-muted-foreground">اسحب الملف أو اضغط للاختيار — PDF · Word · نص · صورة</p>
            <p className="mt-1 text-xs text-muted-foreground">الملفات الكبيرة جداً مقبولة (حتى 400MB)؛ تُقرأ محلياً في متصفحك</p>
            <input ref={ref} type="file" multiple hidden accept={ACCEPT}
              onChange={(e) => { if (e.target.files) onAddFiles(Array.from(e.target.files)); e.target.value = ""; }} />
          </div>
        </TabsContent>
      </Tabs>

      {sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">الملفات المختارة ({sources.length} من {MAX_FILES})</span>
            {sources.length > 1 && <Badge className="gap-1"><Layers className="h-3 w-3" />امتحان مدمج من {sources.length} ملفات</Badge>}
          </div>
          {sources.map((s) => (
            <Card key={s.key} className="flex items-center justify-between p-3">
              <div className="flex min-w-0 items-center gap-2">
                {s.kind === "library" ? <BookMarked className="h-4 w-4 shrink-0 text-primary" /> : <FileText className="h-4 w-4 shrink-0 text-primary" />}
                <span className="truncate text-sm"><bdi>{s.kind === "library" ? s.row.title : s.file.name}</bdi></span>
                <Badge variant={s.kind === "library" ? "secondary" : "outline"} className="shrink-0 text-[10px]">{s.kind === "library" ? "من المكتبة" : "مرفوع"}</Badge>
                <span dir="ltr" className="shrink-0 text-xs text-muted-foreground">{mb(s.kind === "library" ? s.row.size_bytes : s.file.size)} MB</span>
              </div>
              <Button size="icon" variant="ghost" disabled={busy} onClick={() => onRemove(s.key)}><X className="h-4 w-4" /></Button>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground">
            يمكنك الجمع بين ملفات المكتبة وملفاتك: تُقسَّم كلها إلى وحدات تختار منها، ويخرج امتحان واحد من الملفات المختارة.
            {!needsAI && " ملفات المكتبة مقسَّمة مسبقاً، فتنتقل مباشرة إلى اختيار الوحدات."}
          </p>
        </div>
      )}

      <Button className="w-full" size="lg" disabled={busy || sources.length === 0} onClick={onAnalyze}>
        {busy ? (<><Loader2 className="ml-2 h-5 w-5 animate-spin" />{stage || "جارٍ المعالجة..."}</>)
          : (<><Wand2 className="ml-2 h-5 w-5" />{needsAI ? "حلّل الملفات وقسّمها إلى وحدات" : "اعرض وحدات الملفات"}</>)}
      </Button>
    </div>
  );
}
