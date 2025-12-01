import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCode, Copy, Check, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProjectFile {
  id?: string;
  file_name: string;
  content: string;
  file_type: string;
}

interface BuilderCodeViewProps {
  files: ProjectFile[];
  onUpdateFile?: (fileId: string, newContent: string) => void;
}

export const BuilderCodeView = ({ files, onUpdateFile }: BuilderCodeViewProps) => {
  const [selectedFile, setSelectedFile] = useState(files[0]?.file_name || "");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const currentFile = files.find(f => f.file_name === selectedFile);

  const handleCopy = async (fileName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      toast.success(`تم نسخ ${fileName}`);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      toast.error("فشل النسخ");
    }
  };

  const handleDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`تم تحميل ${fileName}`);
  };

  const getFileIcon = (fileType: string) => {
    const icons: Record<string, string> = {
      html: '📄',
      css: '🎨',
      js: '⚡',
      json: '📋',
    };
    return icons[fileType] || '📄';
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileCode className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد ملفات بعد</h3>
        <p className="text-muted-foreground">
          ابدأ بالحديث مع المساعد لإنشاء ملفات المشروع
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* File Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-card overflow-x-auto">
        {files.map((file) => (
          <Button
            key={file.file_name}
            variant={selectedFile === file.file_name ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedFile(file.file_name)}
            className="gap-2 whitespace-nowrap"
          >
            <span>{getFileIcon(file.file_type)}</span>
            <span>{file.file_name}</span>
          </Button>
        ))}
      </div>

      {/* Code Content */}
      {currentFile && (
        <motion.div
          key={selectedFile}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50">
            <div className="text-sm text-muted-foreground">
              {currentFile.file_name}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(currentFile.file_name, currentFile.content)}
                className="gap-2"
              >
                {copiedFile === currentFile.file_name ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden md:inline">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden md:inline">نسخ</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(currentFile.file_name, currentFile.content)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">تحميل</span>
              </Button>
            </div>
          </div>

          {/* Code Display */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 text-slate-50">
            <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
};
