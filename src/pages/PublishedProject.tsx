import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function PublishedProject() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    loadPublishedProject();
  }, [slug]);

  const loadPublishedProject = async () => {
    try {
      if (!slug) {
        setError("معرف المشروع غير صحيح");
        return;
      }

      const { data, error } = await supabase.functions.invoke('serve-published-project', {
        body: { slug },
      });

      if (error) throw error;

      if (!data || !data.project) {
        setError("المشروع غير موجود");
        return;
      }

      const files = data.files || [];
      
      // Find main HTML file
      const htmlFile = files.find((f: any) => 
        f.file_name === 'index.html' || 
        f.file_name.endsWith('/index.html') ||
        f.file_type === 'html'
      );
      
      // Collect ALL CSS files
      const cssFiles = files.filter((f: any) => 
        f.file_type === 'css' || 
        f.file_name.endsWith('.css')
      );
      const allCss = cssFiles.map((f: any) => `/* ${f.file_name} */\n${f.content}`).join('\n\n');
      
      // Collect ALL JS files
      const jsFiles = files.filter((f: any) => 
        f.file_type === 'js' || 
        f.file_type === 'javascript' ||
        f.file_name.endsWith('.js')
      );
      const allJs = jsFiles.map((f: any) => `// ${f.file_name}\n${f.content}`).join('\n\n');

      const htmlBody = htmlFile?.content || '<div style="padding: 40px; text-align: center; color: #666;">محتوى غير متوفر</div>';

      // Check if HTML already has full document structure
      if (htmlBody.trim().toLowerCase().startsWith('<!doctype')) {
        let fullHTML = htmlBody;
        
        // Inject CSS before </head>
        if (allCss) {
          fullHTML = fullHTML.replace('</head>', `<style>\n${allCss}\n</style>\n</head>`);
        }
        
        // Inject JS before </body>
        if (allJs) {
          fullHTML = fullHTML.replace('</body>', `<script>\ntry {\n${allJs}\n} catch(e) { console.error('Script error:', e); }\n</script>\n</body>`);
        }
        
        setHtmlContent(fullHTML);
      } else {
        // Build complete HTML document
        const fullHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.project.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    ${allCss}
  </style>
</head>
<body>
  ${htmlBody}
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
        setHtmlContent(fullHTML);
      }
    } catch (error) {
      console.error('Error loading published project:', error);
      setError("فشل تحميل المشروع");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">خطأ</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={htmlContent}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      title="Published Project"
    />
  );
}
