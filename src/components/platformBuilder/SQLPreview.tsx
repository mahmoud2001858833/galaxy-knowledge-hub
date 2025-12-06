import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Table,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SQLPreviewProps {
  sql: string;
  projectId?: string;
}

export const SQLPreview = ({ sql, projectId = "esifpjjehdnpkhyilctv" }: SQLPreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      toast.success("تم نسخ SQL بنجاح");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل نسخ SQL");
    }
  };

  const openSQLEditor = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank');
  };

  // تحليل SQL لاستخراج أسماء الجداول
  const extractTableNames = (sqlCode: string): string[] => {
    const tableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/gi;
    const tables: string[] = [];
    let match;
    while ((match = tableRegex.exec(sqlCode)) !== null) {
      tables.push(match[1]);
    }
    return tables;
  };

  const tableNames = extractTableNames(sql);
  const lines = sql.split('\n');
  const previewLines = lines.slice(0, 10).join('\n');
  const hasMore = lines.length > 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">SQL للجداول المطلوبة</h4>
            <p className="text-xs text-muted-foreground">انسخ وألصق في Supabase SQL Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-xs">{copied ? 'تم النسخ' : 'نسخ'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openSQLEditor}
            className="h-8 gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-xs hidden sm:inline">SQL Editor</span>
          </Button>
        </div>
      </div>

      {/* Tables Info */}
      {tableNames.length > 0 && (
        <div className="p-3 border-b border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-foreground">الجداول التي سيتم إنشاؤها:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tableNames.map((table, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs"
              >
                {table}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* SQL Code */}
      <div className="relative">
        <ScrollArea className={isExpanded ? 'max-h-[400px]' : 'max-h-[200px]'}>
          <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto" dir="ltr">
            <code>{isExpanded ? sql : previewLines}{hasMore && !isExpanded && '\n...'}</code>
          </pre>
        </ScrollArea>
        
        {hasMore && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 ml-1" />
                  إخفاء
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  عرض الكود كاملاً ({lines.length} سطر)
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* RLS Notice */}
      <div className="p-3 bg-amber-500/10 border-t border-amber-500/20">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-400 mb-0.5">Row Level Security (RLS)</p>
            <p className="text-xs text-muted-foreground">
              تم تضمين سياسات أمان للجداول. تأكد من تفعيل RLS بعد تنفيذ SQL.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
