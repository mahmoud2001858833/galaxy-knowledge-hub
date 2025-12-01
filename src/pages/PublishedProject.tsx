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
      const htmlFile = files.find((f: any) => f.file_name === 'index.html' || f.file_type === 'html');
      const cssFile = files.find((f: any) => f.file_name === 'style.css' || f.file_type === 'css');
      const jsFile = files.find((f: any) => f.file_name === 'script.js' || f.file_type === 'js');

      const html = htmlFile?.content || '<div style="padding: 20px; text-align: center;">محتوى غير متوفر</div>';
      const css = cssFile?.content || '';
      const js = jsFile?.content || '';

      const fullHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.project.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (error) {
      console.error('Script error:', error);
    }
  </script>
</body>
</html>
      `;

      setHtmlContent(fullHTML);
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
