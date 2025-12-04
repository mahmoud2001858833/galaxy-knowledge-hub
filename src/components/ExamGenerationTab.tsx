import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, FileQuestion, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ExamGenerationTabProps {
  grade: string;
}

export default function ExamGenerationTab({ grade: defaultGrade }: ExamGenerationTabProps) {
  const [grade, setGrade] = useState(defaultGrade);
  const [subject, setSubject] = useState("");
  const [contentType, setContentType] = useState("book");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [contentDescription, setContentDescription] = useState(""); // صندوق الوصف الجديد
  const [questionTypes, setQuestionTypes] = useState("");
  const [questionCount, setQuestionCount] = useState("10");
  const [generatedQuestions, setGeneratedQuestions] = useState("");
  const [generatedAnswers, setGeneratedAnswers] = useState("");
  const [generating, setGenerating] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (subject && contentType === "unit") {
      fetchUnits();
    } else if (subject && contentType === "lesson") {
      fetchLessons();
    }
  }, [subject, contentType]);

  const fetchUnits = async () => {
    const { data, error } = await supabase
      .from('jordanian_textbook_content')
      .select('unit_number, unit_name')
      .eq('grade', grade)
      .eq('subject', subject)
      .order('unit_number');

    if (!error && data) {
      const uniqueUnits = Array.from(
        new Map(data.map(item => [item.unit_number, item])).values()
      );
      setAvailableUnits(uniqueUnits);
    }
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('jordanian_textbook_content')
      .select('unit_number, unit_name, lesson_number, lesson_name')
      .eq('grade', grade)
      .eq('subject', subject)
      .order('unit_number')
      .order('lesson_number');

    if (!error && data) {
      const uniqueLessons = Array.from(
        new Map(data.map(item => [`${item.unit_number}-${item.lesson_number}`, item])).values()
      );
      setAvailableLessons(uniqueLessons);
    }
  };

  const handleGenerateExam = async () => {
    if (!subject || !questionTypes || !questionCount) {
      toast({
        title: "⚠️ معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (contentType === "unit" && selectedUnits.length === 0) {
      toast({
        title: "⚠️ اختر وحدة",
        description: "يرجى اختيار وحدة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (contentType === "lesson" && selectedLessons.length === 0) {
      toast({
        title: "⚠️ اختر درس",
        description: "يرجى اختيار درس واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      let contentRange = "الكتاب كاملاً";
      
      if (contentType === "unit") {
        contentRange = `الوحدات: ${selectedUnits.join(", ")}`;
      } else if (contentType === "lesson") {
        contentRange = `الدروس: ${selectedLessons.join(", ")}`;
      }

      const { data, error } = await supabase.functions.invoke('generate-exam-questions', {
        body: {
          subject,
          grade,
          contentRange,
          contentType,
          selectedUnits: contentType === "unit" ? selectedUnits : undefined,
          selectedLessons: contentType === "lesson" ? selectedLessons : undefined,
          contentDescription: contentDescription.trim() || undefined, // إرسال الوصف
          questionTypes,
          questionCount: parseInt(questionCount),
        }
      });

      if (error) throw error;

      if (data.examPaper && data.examPaper !== 'لم يتوفر الكتاب') {
        // Split questions and answers
        const parts = data.examPaper.split(/الإجابات النموذجية|نموذج الإجابة|الإجابات/i);
        setGeneratedQuestions(parts[0]?.trim() || data.examPaper);
        setGeneratedAnswers(parts[1]?.trim() || "");

        toast({
          title: "✅ تم إنشاء الامتحان",
          description: `تم إنشاء ${questionCount} سؤال بنجاح`,
        });
      } else {
        toast({
          title: "⚠️ لم يتوفر المحتوى",
          description: data.examPaper || "لم يتم تزويد النظام بهذا المصدر بعد",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error generating exam:', error);
      toast({
        title: "⚠️ خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الامتحان",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ تم النسخ",
      description: `تم نسخ ${type} إلى الحافظة`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>الصف</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الصف السابع">الصف السابع</SelectItem>
              <SelectItem value="الصف الثامن">الصف الثامن</SelectItem>
              <SelectItem value="الصف التاسع">الصف التاسع</SelectItem>
              <SelectItem value="الصف العاشر">الصف العاشر</SelectItem>
              <SelectItem value="الأول ثانوي">الأول ثانوي</SelectItem>
              <SelectItem value="الثاني ثانوي">الثاني ثانوي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>المادة</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="اللغة العربية">اللغة العربية</SelectItem>
              <SelectItem value="اللغة الإنجليزية">اللغة الإنجليزية</SelectItem>
              <SelectItem value="الرياضيات">الرياضيات</SelectItem>
              <SelectItem value="الفيزياء">الفيزياء</SelectItem>
              <SelectItem value="الكيمياء">الكيمياء</SelectItem>
              <SelectItem value="الأحياء">الأحياء</SelectItem>
              <SelectItem value="التاريخ">التاريخ</SelectItem>
              <SelectItem value="الجغرافيا">الجغرافيا</SelectItem>
              <SelectItem value="التربية الإسلامية">التربية الإسلامية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>نطاق المحتوى</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="اختر النطاق" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="book">الكتاب كاملاً</SelectItem>
              <SelectItem value="unit">وحدات محددة</SelectItem>
              <SelectItem value="lesson">دروس محددة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {contentType === "unit" && availableUnits.length > 0 && (
          <Card className="p-4 space-y-2 max-h-48 overflow-y-auto">
            <Label>اختر الوحدات (يمكن اختيار أكثر من واحدة)</Label>
            {availableUnits.map((unit) => (
              <div key={unit.unit_number} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`unit-${unit.unit_number}`}
                  checked={selectedUnits.includes(`الوحدة ${unit.unit_number}`)}
                  onCheckedChange={(checked) => {
                    const unitName = `الوحدة ${unit.unit_number}`;
                    if (checked) {
                      setSelectedUnits([...selectedUnits, unitName]);
                    } else {
                      setSelectedUnits(selectedUnits.filter(u => u !== unitName));
                    }
                  }}
                />
                <label htmlFor={`unit-${unit.unit_number}`} className="cursor-pointer">
                  الوحدة {unit.unit_number}: {unit.unit_name}
                </label>
              </div>
            ))}
          </Card>
        )}

        {contentType === "lesson" && availableLessons.length > 0 && (
          <Card className="p-4 space-y-2 max-h-48 overflow-y-auto">
            <Label>اختر الدروس (يمكن اختيار أكثر من واحد)</Label>
            {availableLessons.map((lesson) => (
              <div key={`${lesson.unit_number}-${lesson.lesson_number}`} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`lesson-${lesson.unit_number}-${lesson.lesson_number}`}
                  checked={selectedLessons.includes(`الوحدة ${lesson.unit_number} - الدرس ${lesson.lesson_number}`)}
                  onCheckedChange={(checked) => {
                    const lessonName = `الوحدة ${lesson.unit_number} - الدرس ${lesson.lesson_number}`;
                    if (checked) {
                      setSelectedLessons([...selectedLessons, lessonName]);
                    } else {
                      setSelectedLessons(selectedLessons.filter(l => l !== lessonName));
                    }
                  }}
                />
                <label htmlFor={`lesson-${lesson.unit_number}-${lesson.lesson_number}`} className="cursor-pointer">
                  الوحدة {lesson.unit_number} - الدرس {lesson.lesson_number}: {lesson.lesson_name}
                </label>
              </div>
            ))}
          </Card>
        )}

        {/* صندوق الوصف الجديد */}
        <div className="space-y-2">
          <Label>وصف نطاق المحتوى (اختياري)</Label>
          <Textarea
            placeholder="مثال: من الوحدة الأولى للوحدة الثالثة - الفصل الأول، أو من الدرس الأول للدرس الخامس..."
            value={contentDescription}
            onChange={(e) => setContentDescription(e.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            اكتب هنا تفاصيل إضافية عن نطاق الامتحان مثل: الفصل الدراسي، الوحدات المحددة، أو أي ملاحظات أخرى
          </p>
        </div>

        <div className="space-y-2">
          <Label>نوع الأسئلة</Label>
          <Input
            placeholder="مثال: اختيار متعدد، أسئلة مقالية، صح وخطأ"
            value={questionTypes}
            onChange={(e) => setQuestionTypes(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>عدد الأسئلة</Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleGenerateExam}
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جارٍ إنشاء الامتحان...
            </>
          ) : (
            <>
              <FileQuestion className="ml-2 h-4 w-4" />
              إنشاء الامتحان
            </>
          )}
        </Button>
      </div>

      {(generatedQuestions || generatedAnswers) && (
        <div className="space-y-4">
          {generatedQuestions && (
            <Card className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">الأسئلة</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedQuestions, "الأسئلة")}
                >
                  <Copy className="ml-2 h-4 w-4" />
                  نسخ
                </Button>
              </div>
              <Textarea
                value={generatedQuestions}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
            </Card>
          )}

          {generatedAnswers && (
            <Card className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">الإجابات النموذجية</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedAnswers, "الإجابات")}
                >
                  <Copy className="ml-2 h-4 w-4" />
                  نسخ
                </Button>
              </div>
              <Textarea
                value={generatedAnswers}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
