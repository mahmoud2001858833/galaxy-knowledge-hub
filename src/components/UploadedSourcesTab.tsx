import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, AlertCircle, Upload, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContentSummary {
  grade: string;
  subject: string;
  semester: string;
  units: number;
  lessons: number;
  pages: number;
}

export default function UploadedSourcesTab() {
  const [contentSummaries, setContentSummaries] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jordanian_textbook_content')
        .select('grade, subject, semester, unit_number, lesson_number, page_number');

      if (error) throw error;

      // Group data by grade, subject, semester
      const summaryMap = new Map<string, ContentSummary>();
      
      (data || []).forEach((row: any) => {
        const key = `${row.grade}|${row.subject}|${row.semester}`;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            grade: row.grade,
            subject: row.subject,
            semester: row.semester,
            units: new Set<number>(),
            lessons: new Set<string>(),
            pages: new Set<number>(),
          } as any);
        }
        
        const summary = summaryMap.get(key)!;
        (summary.units as any).add(row.unit_number);
        (summary.lessons as any).add(`${row.unit_number}-${row.lesson_number}`);
        (summary.pages as any).add(row.page_number);
      });

      // Convert Sets to counts
      const summaries = Array.from(summaryMap.values()).map(s => ({
        ...s,
        units: (s.units as any).size,
        lessons: (s.lessons as any).size,
        pages: (s.pages as any).size,
      }));

      setContentSummaries(summaries);
    } catch (error: any) {
      console.error('Error loading content:', error);
      toast({
        title: "خطأ في تحميل المحتوى",
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
        <CardTitle>المصادر المتاحة</CardTitle>
        <CardDescription>
          المحتوى النصي المتوفر في النظام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-200">
            <strong>✓ نظام جديد:</strong> يستخدم المساعد الأردني الآن نظام رفع نصوص مباشر بدلاً من استخراج النصوص من PDF.
            <br />
            هذا يضمن دقة عالية في الإجابات مع ذكر رقم الوحدة والدرس والصفحة لكل إجابة.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={() => navigate('/upload-jordanian-content')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          size="lg"
        >
          <Upload className="w-5 h-5 ml-2" />
          رفع محتوى جديد
        </Button>

        {contentSummaries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا يوجد محتوى مرفوع حالياً</p>
            <p className="text-sm mt-2">استخدم الزر أعلاه لرفع محتوى جديد</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contentSummaries.map((content, index) => (
              <Card key={index} className="border-2 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{content.subject}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="font-semibold">{content.grade}</Badge>
                        <Badge variant="outline">{content.semester}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          <FileText className="w-4 h-4 mb-1 text-blue-600" />
                          <span className="font-bold text-lg">{content.units}</span>
                          <span className="text-xs text-muted-foreground">وحدة</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          <FileText className="w-4 h-4 mb-1 text-green-600" />
                          <span className="font-bold text-lg">{content.lessons}</span>
                          <span className="text-xs text-muted-foreground">درس</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          <FileText className="w-4 h-4 mb-1 text-purple-600" />
                          <span className="font-bold text-lg">{content.pages}</span>
                          <span className="text-xs text-muted-foreground">صفحة</span>
                        </div>
                      </div>
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
