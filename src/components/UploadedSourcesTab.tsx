import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Upload, FileText, Plus, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContentSummary {
  grade: string;
  subject: string;
  semester: string;
  units: number;
  lessons: number;
  pages: number;
}

const GRADES = [
  "الصف الأول",
  "الصف الثاني", 
  "الصف الثالث",
  "الصف الرابع",
  "الصف الخامس",
  "الصف السادس",
  "الصف السابع",
  "الصف الثامن",
  "الصف التاسع",
  "الصف العاشر",
  "الصف الحادي عشر",
  "الصف الثاني عشر"
];

const SUBJECTS = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "علوم الأرض",
  "التاريخ",
  "الجغرافيا",
  "التربية الإسلامية",
  "التربية الوطنية",
  "الحاسوب",
  "الثقافة المالية"
];

const SEMESTERS = ["الفصل الأول", "الفصل الثاني"];

export default function UploadedSourcesTab() {
  const [contentSummaries, setContentSummaries] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [unitName, setUnitName] = useState("");
  const [lessonNumber, setLessonNumber] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [pageContent, setPageContent] = useState("");

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

      const summaryMap = new Map<string, any>();
      
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
          });
        }
        
        const summary = summaryMap.get(key);
        summary.units.add(row.unit_number);
        summary.lessons.add(`${row.unit_number}-${row.lesson_number}`);
        summary.pages.add(row.page_number);
      });

      const summaries = Array.from(summaryMap.values()).map(s => ({
        ...s,
        units: s.units.size,
        lessons: s.lessons.size,
        pages: s.pages.size,
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

  const handleSubmit = async () => {
    if (!grade || !subject || !semester || !unitNumber || !unitName || !lessonNumber || !lessonName || !pageNumber || !pageContent) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('jordanian_textbook_content')
        .insert({
          grade,
          subject,
          semester,
          unit_number: parseInt(unitNumber),
          unit_name: unitName,
          lesson_number: parseInt(lessonNumber),
          lesson_name: lessonName,
          page_number: parseInt(pageNumber),
          page_content: pageContent,
          created_by: user?.id || null,
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم رفع المحتوى بنجاح",
      });

      // Reset form
      setUnitNumber("");
      setUnitName("");
      setLessonNumber("");
      setLessonName("");
      setPageNumber("");
      setPageContent("");
      
      // Reload content
      loadContent();
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          المصادر المتاحة
        </CardTitle>
        <CardDescription>
          المحتوى النصي المتوفر في النظام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <Collapsible open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                رفع محتوى جديد
              </span>
              {isUploadOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="p-4 rounded-lg border border-border bg-card space-y-4">
              {/* Row 1: Grade, Subject, Semester */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">الصف *</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">المادة *</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semester">الفصل *</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">رقم الوحدة *</Label>
                  <Input 
                    id="unitNumber"
                    type="number"
                    min="1"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="مثال: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitName">اسم الوحدة *</Label>
                  <Input 
                    id="unitName"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="مثال: الوحدة الأولى"
                  />
                </div>
              </div>

              {/* Row 3: Lesson */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonNumber">رقم الدرس *</Label>
                  <Input 
                    id="lessonNumber"
                    type="number"
                    min="1"
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(e.target.value)}
                    placeholder="مثال: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonName">اسم الدرس *</Label>
                  <Input 
                    id="lessonName"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    placeholder="مثال: الدرس الأول"
                  />
                </div>
              </div>

              {/* Row 4: Page */}
              <div className="space-y-2">
                <Label htmlFor="pageNumber">رقم الصفحة *</Label>
                <Input 
                  id="pageNumber"
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  placeholder="مثال: 15"
                  className="md:w-1/3"
                />
              </div>

              {/* Row 5: Content */}
              <div className="space-y-2">
                <Label htmlFor="pageContent">محتوى الصفحة *</Label>
                <Textarea 
                  id="pageContent"
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  placeholder="اكتب أو الصق محتوى الصفحة هنا..."
                  className="min-h-[200px]"
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ المحتوى
                  </>
                )}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Content List */}
        {contentSummaries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا يوجد محتوى مرفوع حالياً</p>
            <p className="text-sm mt-2">استخدم النموذج أعلاه لرفع محتوى جديد</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-foreground">المحتوى المتوفر ({contentSummaries.length})</h3>
            {contentSummaries.map((content, index) => (
              <Card key={index} className="border bg-gradient-to-br from-card to-muted/20">
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
                        <div className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
                          <FileText className="w-4 h-4 mb-1 text-blue-600" />
                          <span className="font-bold text-lg">{content.units}</span>
                          <span className="text-xs text-muted-foreground">وحدة</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
                          <FileText className="w-4 h-4 mb-1 text-green-600" />
                          <span className="font-bold text-lg">{content.lessons}</span>
                          <span className="text-xs text-muted-foreground">درس</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
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
