import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Terminal, X } from "lucide-react";
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
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string }>>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Supabase credentials for preview
  const SUPABASE_URL = 'https://esifpjjehdnpkhyilctv.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaWZwamplaGRucGtoeWlsY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQ5NDYsImV4cCI6MjA2MDc1MDk0Nn0.xfaLcyAgvZx2yKsNAdf94cuNZQfXPGQcAYb1xiSYI7k';

  const generatePreviewHTML = () => {
    // جمع جميع ملفات HTML
    const htmlFiles = files.filter(f => f.file_type === 'html');
    const mainHtml = htmlFiles.find(f => 
      f.file_name === 'index.html' || 
      f.file_name.endsWith('/index.html')
    ) || htmlFiles[0];

    // جمع كل ملفات CSS
    const cssFiles = files.filter(f => 
      f.file_type === 'css' || 
      f.file_name.endsWith('.css')
    );
    const allCss = cssFiles.map(f => `/* ===== ${f.file_name} ===== */\n${f.content}`).join('\n\n');

    // جمع كل ملفات JS بالترتيب الصحيح
    const jsFiles = files.filter(f => 
      f.file_type === 'js' || 
      f.file_type === 'javascript' || 
      f.file_name.endsWith('.js')
    );
    
    // ترتيب الملفات: config أولاً، ثم supabase-client، ثم toast، ثم auth، الخ
    const sortOrder = ['config', 'supabase-client', 'toast', 'auth-guard', 'auth', 'storage', 'crud', 'ui', 'router', 'utils', 'app'];
    const sortedJsFiles = [...jsFiles].sort((a, b) => {
      const aName = a.file_name.replace(/.*\//, '').replace('.js', '');
      const bName = b.file_name.replace(/.*\//, '').replace('.js', '');
      const aIndex = sortOrder.findIndex(s => aName.includes(s));
      const bIndex = sortOrder.findIndex(s => bName.includes(s));
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    
    const allJs = sortedJsFiles.map(f => `// ===== ${f.file_name} =====\n${f.content}`).join('\n\n');

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
    .container { text-align: center; padding: 2rem; }
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

    // Console override للتقاط الأخطاء
    const consoleOverride = `
<script>
  // Override console for debugging
  (function() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    function sendToParent(type, args) {
      try {
        window.parent.postMessage({
          type: 'console',
          logType: type,
          message: Array.from(args).map(a => {
            if (typeof a === 'object') return JSON.stringify(a, null, 2);
            return String(a);
          }).join(' ')
        }, '*');
      } catch (e) {}
    }
    
    console.log = function() { sendToParent('log', arguments); originalLog.apply(console, arguments); };
    console.error = function() { sendToParent('error', arguments); originalError.apply(console, arguments); };
    console.warn = function() { sendToParent('warn', arguments); originalWarn.apply(console, arguments); };
    
    window.onerror = function(msg, url, line, col, error) {
      sendToParent('error', ['Error: ' + msg + ' at line ' + line]);
      return false;
    };
  })();
</script>
`;

    // إذا كان HTML يحتوي على doctype كامل
    if (mainHtml.content.trim().toLowerCase().startsWith('<!doctype')) {
      let htmlContent = mainHtml.content;
      
      // إضافة Supabase SDK ومكتبات أخرى
      const headInjection = `
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.tailwindcss.com"></script>
${consoleOverride}
<style>
${allCss}
</style>
</head>`;
      htmlContent = htmlContent.replace('</head>', headInjection);
      
      // إضافة JS مع معالجة الأخطاء
      const jsInjection = `
<script>
// Supabase initialization
const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_KEY = '${SUPABASE_KEY}';

try {
  if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase initialized');
  }
} catch (e) {
  console.error('Supabase init error:', e);
}

// Page navigation helper
window.navigateTo = function(page) {
  console.log('Navigating to:', page);
  // في Preview، نعرض رسالة لأن التنقل الفعلي غير متاح
  if (typeof Toast !== 'undefined') {
    Toast.info('في المعاينة: التنقل إلى ' + page);
  } else {
    alert('سيتم التنقل إلى: ' + page);
  }
};

// Wait for DOM then run scripts
document.addEventListener('DOMContentLoaded', function() {
  try {
${allJs}
    console.log('✅ All scripts loaded');
  } catch (error) {
    console.error('Script error:', error.message);
  }
});
</script>
</body>`;
      htmlContent = htmlContent.replace('</body>', jsInjection);
      
      return htmlContent;
    }

    // إنشاء HTML كامل من الصفر
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة المشروع</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  ${consoleOverride}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      direction: rtl;
      min-height: 100vh;
    }
    ${allCss}
  </style>
</head>
<body>
  ${mainHtml.content}
  
  <script>
    // Supabase initialization
    const SUPABASE_URL = '${SUPABASE_URL}';
    const SUPABASE_KEY = '${SUPABASE_KEY}';
    
    try {
      if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase initialized');
      }
    } catch (e) {
      console.error('Supabase init error:', e);
    }
    
    // Page navigation helper
    window.navigateTo = function(page) {
      console.log('Navigating to:', page);
      if (typeof Toast !== 'undefined') {
        Toast.info('في المعاينة: التنقل إلى ' + page);
      }
    };
    
    // Run all scripts
    document.addEventListener('DOMContentLoaded', function() {
      try {
${allJs}
        console.log('✅ All scripts loaded');
      } catch (error) {
        console.error('Script error:', error.message);
      }
    });
  </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [files]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        setConsoleLogs(prev => [...prev.slice(-49), {
          type: event.data.logType,
          message: event.data.message
        }]);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const viewModes = [
    { mode: 'desktop' as const, icon: Monitor, width: '100%', label: 'سطح المكتب' },
    { mode: 'tablet' as const, icon: Tablet, width: '768px', label: 'تابلت' },
    { mode: 'mobile' as const, icon: Smartphone, width: '375px', label: 'موبايل' },
  ];

  const handleRefresh = () => {
    setConsoleLogs([]);
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
            variant={showConsole ? "default" : "outline"}
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
            className="gap-2"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden md:inline">Console</span>
            {consoleLogs.filter(l => l.type === 'error').length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-1.5 rounded-full">
                {consoleLogs.filter(l => l.type === 'error').length}
              </span>
            )}
          </Button>
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
              <span className="hidden md:inline">فتح المشروع</span>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-1 flex items-center justify-center p-4 bg-muted/20 ${showConsole ? 'h-2/3' : 'h-full'}`}>
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
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"
                title="Preview"
              />
            </div>
          </motion.div>
        </div>

        {/* Console Panel */}
        {showConsole && (
          <div className="h-1/3 border-t border-border bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-slate-900">
              <span className="text-sm font-medium text-slate-300">Console</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConsoleLogs([])}
                  className="h-6 text-xs text-slate-400 hover:text-white"
                >
                  مسح
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConsole(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 font-mono text-xs">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-4">لا توجد رسائل</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`py-1 px-2 border-b border-slate-800 ${
                      log.type === 'error' ? 'text-red-400 bg-red-950/30' :
                      log.type === 'warn' ? 'text-yellow-400 bg-yellow-950/30' :
                      'text-slate-300'
                    }`}
                  >
                    <span className="opacity-50">[{log.type}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
