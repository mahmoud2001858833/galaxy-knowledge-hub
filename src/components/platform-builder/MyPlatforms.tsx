import { Eye, Download, Trash2, ExternalLink, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SavedPlatform {
  id: string;
  name: string;
  description: string;
  html: string;
  createdAt: string;
  analysis?: any;
  files?: Array<{ path: string; content: string; language: string }>;
}

interface Props {
  platforms: SavedPlatform[];
  onView: (p: SavedPlatform) => void;
  onDelete: (id: string) => void;
}

export default function MyPlatforms({ platforms, onView, onDelete }: Props) {
  if (platforms.length === 0) {
    return (
      <div className="text-center py-16 text-white/50">
        <Database className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>لا توجد منصات محفوظة بعد. ابدأ بإنشاء منصتك الأولى!</p>
      </div>
    );
  }

  const download = (p: SavedPlatform) => {
    const blob = new Blob([p.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${p.name || "platform"}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const openInNewTab = (p: SavedPlatform) => {
    const blob = new Blob([p.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platforms.map((p) => (
        <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 transition group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{p.name}</h3>
              <p className="text-xs text-white/50 mt-1">
                {new Date(p.createdAt).toLocaleString("ar-EG")}
              </p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
          <p className="text-sm text-white/70 line-clamp-2 mb-4 min-h-[40px]">{p.description}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10" onClick={() => onView(p)}>
              <Eye className="w-4 h-4 ml-1" /> معاينة
            </Button>
            <Button size="sm" variant="outline" className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10" onClick={() => openInNewTab(p)}>
              <ExternalLink className="w-4 h-4 ml-1" /> فتح
            </Button>
            <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10" onClick={() => download(p)}>
              <Download className="w-4 h-4 ml-1" /> تحميل
            </Button>
            <Button size="sm" variant="outline" className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10" onClick={() => onDelete(p.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
