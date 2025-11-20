import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, ExternalLink, AlertCircle, FileText, Check } from "lucide-react";
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
  extracted_text: string | null;
}

export default function UploadedSourcesTab() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jordanian_textbooks')
        .select('id, book_name, subject, grade, semester, file_url, is_active, created_at, extracted_text')
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

  const extractText = async (textbookId: string) => {
    setExtracting(prev => ({ ...prev, [textbookId]: true }));
    
    try {
      toast({
        title: "جاري استخراج النصوص",
        description: "قد يستغرق هذا بضع دقائق...",
      });

      const { data, error } = await supabase.functions.invoke('extract-textbook-text', {
        body: { textbookId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "تم استخراج النصوص بنجاح",
          description: `تم استخراج ${data.textLength} حرف من الكتاب`,
        });
        
        // Reload textbooks to show updated status
        await loadTextbooks();
      } else {
        throw new Error(data.error || 'فشل استخراج النصوص');
      }
    } catch (error: any) {
      console.error('Error extracting text:', error);
      toast({
        title: "خطأ في استخراج النصوص",
        description: error.message || 'حدث خطأ أثناء استخراج النصوص',
        variant: "destructive",
      });
    } finally {
      setExtracting(prev => ({ ...prev, [textbookId]: false }));
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
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-200">
            <strong>✓ نظام OCR:</strong> يستخدم المساعد الأردني تقنية OCR لاستخراج النصوص من الكتب المرفوعة.
            <br />
            اضغط على زر "استخراج النصوص" لكل كتاب لتفعيل الإجابة الدقيقة من محتوى الكتب.
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
                      <div className="flex items-center gap-2 mt-2">
                        {book.extracted_text ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <Check className="w-3 h-3 ml-1" />
                            تم استخراج النصوص
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            لم يتم استخراج النصوص
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
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
                      {!book.extracted_text && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => extractText(book.id)}
                          disabled={extracting[book.id]}
                          className="flex items-center gap-2"
                        >
                          {extracting[book.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جاري الاستخراج...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              استخراج النصوص
                            </>
                          )}
                        </Button>
                      )}
                    </div>
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
