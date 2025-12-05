import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectFile {
  file_name: string;
  content: string;
  file_type: string;
}

interface BuilderPreviewProps {
  files: ProjectFile[];
  isPublished: boolean;
  publishUrl?: string;
}

export const BuilderPreview = ({ files, isPublished, publishUrl }: BuilderPreviewProps) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generatePreviewHTML = () => {
    // جمع جميع ملفات HTML
    const htmlFiles = files.filter(f => f.file_type === 'html');
    const mainHtml = htmlFiles.find(f => 
      f.file_name === 'index.html' || 
      f.file_name.endsWith('/index.html')
    ) || htmlFiles[0];

    // جمع كل ملفات CSS (من أي مجلد)
    const cssFiles = files.filter(f => 
      f.file_type === 'css' || 
      f.file_name.endsWith('.css')
    );
    const allCss = cssFiles.map(f => `/* ${f.file_name} */\n${f.content}`).join('\n\n');

    // جمع كل ملفات JS (من أي مجلد)
    const jsFiles = files.filter(f => 
      f.file_type === 'js' || 
      f.file_type === 'javascript' || 
      f.file_name.endsWith('.js')
    );
    const allJs = jsFiles.map(f => `// ${f.file_name}\n${f.content}`).join('\n\n');

    if (!mainHtml) {
      return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { color: white; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🚀</div>
    <h1>لم يتم إنشاء أي محتوى بعد</h1>
    <p>ابدأ بالتحدث مع المساعد لإنشاء مشروعك</p>
  </div>
</body>
</html>
      `;
    }

    // إذا كان HTML يحتوي بالفعل على doctype كامل
    if (mainHtml.content.trim().toLowerCase().startsWith('<!doctype')) {
      let htmlContent = mainHtml.content;
      
      // إضافة CSS قبل إغلاق head
      if (allCss) {
        const cssInjection = `<style>\n${allCss}\n</style>\n</head>`;
        htmlContent = htmlContent.replace('</head>', cssInjection);
      }
      
      // إضافة JS قبل إغلاق body
      if (allJs) {
        const jsInjection = `<script>\ntry {\n${allJs}\n} catch (e) { console.error('Script error:', e); }\n</script>\n</body>`;
        htmlContent = htmlContent.replace('</body>', jsInjection);
      }
      
      return htmlContent;
    }

    // إنشاء HTML كامل من الصفر
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    ${allCss}
  </style>
</head>
<body>
  ${mainHtml.content}
  <script>
    try {
      ${allJs}
    } catch (error) {
      console.error('Script error:', error);
    }
  </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [files]);

  const viewModes = [
    { mode: 'desktop' as const, icon: Monitor, width: '100%', label: 'سطح المكتب' },
    { mode: 'tablet' as const, icon: Tablet, width: '768px', label: 'تابلت' },
    { mode: 'mobile' as const, icon: Smartphone, width: '375px', label: 'موبايل' },
  ];

  const handleRefresh = () => {
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">تحديث</span>
          </Button>
          {isPublished && publishUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publishUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">فتح المشروع المنشور</span>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
        <motion.div
          key={viewMode}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          <div
            style={{
              width: viewModes.find(v => v.mode === viewMode)?.width,
              maxWidth: '100%',
              height: '100%',
            }}
            className="bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <iframe
              key={previewKey}
              ref={iframeRef}
              srcDoc={generatePreviewHTML()}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              title="Preview"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
