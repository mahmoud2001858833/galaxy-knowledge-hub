import React, { useRef, useState } from 'react';
import { 
  FileText, Download, Printer, Copy, Check, Sparkles, BookOpen, 
  Calendar, Layers, ShieldCheck, Share2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportElementToPdf } from '@/lib/pdfExport';

export interface StructuredAISection {
  title: string;
  icon?: string;
  content: string;
  formula?: string;
}

export interface StructuredAIDocument {
  title: string;
  subjectTitle: string;
  subjectKey: 'math' | 'physics' | 'chemistry' | 'biology';
  date: string;
  summary: string;
  sections: StructuredAISection[];
  keyFormulas?: string[];
  selfCheckQuestions?: string[];
}

interface AIDocumentExporterProps {
  document: StructuredAIDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const AIDocumentExporter: React.FC<AIDocumentExporterProps> = ({
  document,
  isOpen,
  onClose
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    toast.info('جاري إعداد وإنشاء ملف الـ PDF عالي الدقة...');
    try {
      await exportElementToPdf(printAreaRef.current, `${document.subjectKey}-lesson-${document.title.slice(0, 15)}.pdf`);
      toast.success('تم تحميل وتصدير ملف الـ PDF بنجاح!');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تصدير ملف الـ PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadMarkdown = () => {
    let md = `# منصة غالاكسي المعرفية - الدليل التعليمي الشامل\n`;
    md += `**المادة:** ${document.subjectTitle} | **التاريخ:** ${document.date}\n`;
    md += `## الموضوع: ${document.title}\n\n`;
    md += `### الخلاصة المركزة:\n${document.summary}\n\n`;

    document.sections.forEach((sec, idx) => {
      md += `### ${idx + 1}. ${sec.title}\n`;
      if (sec.formula) md += `$$\n${sec.formula}\n$$\n\n`;
      md += `${sec.content}\n\n`;
    });

    if (document.keyFormulas && document.keyFormulas.length > 0) {
      md += `### القوانين والمعادلات المطبقة:\n`;
      document.keyFormulas.forEach(f => md += `- ${f}\n`);
      md += `\n`;
    }

    if (document.selfCheckQuestions && document.selfCheckQuestions.length > 0) {
      md += `### أسئلة اختبر فهمك:\n`;
      document.selfCheckQuestions.forEach((q, i) => md += `${i + 1}. ${q}\n`);
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.subjectKey}-lesson-${Date.now()}.md`;
    a.click();
    toast.success('تم تصدير ملف Markdown بنجاح!');
  };

  const handleCopyText = () => {
    let text = `${document.subjectTitle} - ${document.title}\n\n${document.summary}\n\n`;
    document.sections.forEach(s => {
      text += `[${s.title}]\n${s.content}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم نسخ النص الكامل للدراسة');
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-purple-400 font-mono tracking-wider block">
                GALAXY KNOWLEDGE HUB • DOCUMENT GENERATOR
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                إنشاء وتصدير ملف الدرس: {document.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs gap-1.5 font-bold"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'جاري التصدير...' : 'تصدير PDF'}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadMarkdown}
              className="border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs gap-1.5 hidden sm:flex"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ملف MD</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyText}
              className="border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="w-9 h-9 p-0 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Printable Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40">
          <div 
            ref={printAreaRef}
            className="w-full max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 print:shadow-none print:m-0 print:p-4"
          >
            {/* Document Header Plate */}
            <div className="border-b-2 border-purple-600 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-purple-700 tracking-widest uppercase block mb-1">
                  منصة غالاكسي المعرفية • الدليل التعليمي الشامل
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {document.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  المادة: <span className="text-purple-700 font-bold">{document.subjectTitle}</span>
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 font-mono space-y-1">
                <div>التاريخ: {document.date}</div>
                <div className="text-emerald-700 font-bold flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-4 h-4" />
                  <span>معتمد تربوياً بالذكاء الاصطناعي</span>
                </div>
              </div>
            </div>

            {/* Document Summary Lead */}
            {document.summary && (
              <div className="p-4 rounded-xl bg-purple-50 border-r-4 border-purple-600 text-slate-800 text-sm leading-relaxed">
                <span className="font-bold text-purple-900 block mb-1">الخلاصة التمهيدية للموضوع:</span>
                {document.summary}
              </div>
            )}

            {/* Modular Sections */}
            <div className="space-y-6">
              {document.sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>{section.title}</span>
                  </h3>

                  {section.formula && (
                    <div className="p-3 rounded-lg bg-slate-100 font-mono text-slate-900 text-sm md:text-base text-left overflow-x-auto" dir="ltr">
                      {section.formula}
                    </div>
                  )}

                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Key Formulas Summary */}
            {document.keyFormulas && document.keyFormulas.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">القوانين والمعادلات المرجعية:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700 font-mono" dir="ltr">
                  {document.keyFormulas.map((formula, fIdx) => (
                    <li key={fIdx} className="text-right">{formula}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Self-check questions */}
            {document.selfCheckQuestions && document.selfCheckQuestions.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-950 text-sm">أسئلة وتطبيقات للتقييم الذاتي:</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-amber-900">
                  {document.selfCheckQuestions.map((q, qIdx) => (
                    <li key={qIdx}>{q}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Document Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 font-mono">
              منصة غالاكسي المعرفية © {new Date().getFullYear()} • تم إنشاء هذا الملف التفاعلي آلياً لخدمة الطلبة والباحثين
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
