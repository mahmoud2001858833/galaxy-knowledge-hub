import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, ExternalLink, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Textbook {
  id: string;
  book_name: string;
  subject: string;
  grade: string;
  semester: string;
  file_url: string;
  is_active: boolean;
  created_at: string;
}

export default function UploadedSourcesTab() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jordanian_textbooks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTextbooks(data || []);
    } catch (error: any) {
      console.error('Error loading textbooks:', error);
      toast({
        title: "خطأ في تحميل المصادر",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>المصادر المرفوعة</CardTitle>
        <CardDescription>
          جميع الكتب المدرسية المتوفرة في النظام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-200">
            <strong>✓ النظام يعمل:</strong> الذكاء الاصطناعي الآن يقرأ محتوى الكتب المرفوعة مباشرة باستخدام Google Gemini.
            <br />
            جميع الإجابات تأتي فقط من الكتب المرفوعة للصف المحدد.
          </AlertDescription>
        </Alert>

        {textbooks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد كتب مرفوعة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {textbooks.map((book) => (
              <Card key={book.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{book.book_name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{book.grade}</Badge>
                        <Badge variant="outline">{book.subject}</Badge>
                        <Badge variant="outline">{book.semester}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        تاريخ الإضافة: {new Date(book.created_at).toLocaleDateString('ar')}
                      </p>
                    </div>
                    {book.file_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(book.file_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        فتح الكتاب
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
