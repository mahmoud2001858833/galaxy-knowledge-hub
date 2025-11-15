import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Image as ImageIcon, FileQuestion, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function JordanianAssistant() {
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showSourcesDialog, setShowSourcesDialog] = useState(false);
  
  // Exam generation
  const [examSubject, setExamSubject] = useState("");
  const [examGrade, setExamGrade] = useState("");
  const [examContent, setExamContent] = useState("");
  const [examQuestionTypes, setExamQuestionTypes] = useState("");
  const [examQuestionCount, setExamQuestionCount] = useState("10");
  const [generatedExam, setGeneratedExam] = useState("");
  const [generatingExam, setGeneratingExam] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load student info from localStorage (permanent storage)
    const savedName = localStorage.getItem('jordanian_assistant_student_name');
    const savedGrade = localStorage.getItem('jordanian_assistant_student_grade');
    if (savedName) setStudentName(savedName);
    if (savedGrade) setGrade(savedGrade);
  }, []);

  const saveStudentInfo = () => {
    if (!studentName || !grade) {
      toast({
        title: "يرجى إدخال الاسم والصف",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('jordanian_assistant_student_name', studentName);
    localStorage.setItem('jordanian_assistant_student_grade', grade);
    toast({
      title: "✅ تم حفظ معلوماتك للأبد",
      description: "يمكنك الآن بدء طرح الأسئلة",
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAskQuestion = async () => {
    if (!studentName || !grade) {
      toast({
        title: "يرجى إدخال معلوماتك أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!question && !imageFile) {
      toast({
        title: "يرجى كتابة سؤال أو رفع صورة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnswer("");
    setSources([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // If there's an image, analyze it first
      let questionText = question;
      if (imageFile) {
        console.log('Analyzing image...');
        const reader = new FileReader();
        const imageBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(imageFile);
        });

        const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
          'jordanian-assistant-analyze-image',
          {
            body: { imageBase64, question: questionText, grade }
          }
        );

        if (analysisError) {
          console.error('Image analysis error:', analysisError);
          throw new Error('فشل تحليل الصورة: ' + analysisError.message);
        }
        questionText = analysisData.analysis + "\n\n" + questionText;
        console.log('Image analyzed successfully');
      }

      // Search for relevant content
      console.log('Searching textbooks...');
      const { data: searchData, error: searchError } = await supabase.functions.invoke(
        'jordanian-assistant-search',
        {
          body: { question: questionText, grade }
        }
      );

      if (searchError) {
        console.error('Search error:', searchError);
        throw new Error('فشل البحث في الكتب: ' + searchError.message);
      }

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error('لم يتم العثور على محتوى مناسب في الكتب المدرسية');
      }

      console.log('Found results:', searchData.results.length);

      // Generate answer
      console.log('Getting answer from AI...');
      const { data: answerData, error: answerError } = await supabase.functions.invoke(
        'jordanian-assistant-answer',
        {
          body: {
            question: questionText,
            searchResults: searchData.results,
            studentName,
            grade
          },
          headers: {
            'x-user-id': user?.id || ''
          }
        }
      );

      if (answerError) {
        console.error('Answer error:', answerError);
        throw new Error('فشل الحصول على الإجابة: ' + answerError.message);
      }

      if (!answerData?.answer) {
        throw new Error('لم يتم الحصول على إجابة من الذكاء الاصطناعي');
      }

      console.log('Answer received successfully');
      setAnswer(answerData.answer);
      setSources(answerData.sources || []);

      toast({
        title: "✅ تم الإجابة على سؤالك",
        description: "يمكنك الاطلاع على المصادر بالضغط على زر 'المصادر'",
      });

    } catch (error: any) {
      console.error('Error in handleAskQuestion:', error);
      toast({
        title: "❌ خطأ في الإجابة",
        description: error.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setAnswer("");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const generateExamQuestions = async () => {
    if (!examSubject || !examGrade || !examContent || !examQuestionTypes) {
      toast({
        title: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    setGeneratingExam(true);
    setGeneratedExam("");

    try {
      console.log('Generating exam questions...');
      const { data, error } = await supabase.functions.invoke('generate-exam-questions', {
        body: {
          subject: examSubject,
          grade: examGrade,
          contentRange: examContent,
          questionTypes: examQuestionTypes,
          questionCount: parseInt(examQuestionCount)
        }
      });

      if (error) {
        console.error('Exam generation error:', error);
        throw new Error('فشل إنشاء الورقة الامتحانية: ' + error.message);
      }

      if (!data?.examPaper) {
        throw new Error('لم يتم إنشاء الورقة الامتحانية');
      }

      console.log('Exam generated successfully');
      setGeneratedExam(data.examPaper);

      toast({
        title: "✅ تم إنشاء الورقة الامتحانية",
        description: "يمكنك تحميلها أو طباعتها الآن",
      });

    } catch (error: any) {
      console.error('Error in generateExamQuestions:', error);
      toast({
        title: "❌ خطأ في إنشاء الورقة",
        description: error.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setGeneratedExam("");
    } finally {
      setGeneratingExam(false);
    }
  };

  const downloadExam = () => {
    const blob = new Blob([generatedExam], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `امتحان-${examSubject}-${examGrade}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🇯🇴 مساعدك الأردني
            </h1>
            <p className="text-muted-foreground text-lg">
              مساعد ذكي متخصص في المنهاج الأردني - يجيب من الكتب المدرسية حصرياً
            </p>
          </div>

          {/* Student Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>معلومات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>اسم الطالب</Label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <Label>الصف</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="العاشر">العاشر</SelectItem>
                      <SelectItem value="الحادي عشر">الحادي عشر</SelectItem>
                      <SelectItem value="الثاني عشر">الثاني عشر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={saveStudentInfo}>
                حفظ المعلومات
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="questions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">طرح الأسئلة</TabsTrigger>
              <TabsTrigger value="exam">إنشاء امتحان</TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              {/* Question Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    اسأل سؤالك
                  </CardTitle>
                  <CardDescription>
                    سيتم الإجابة من الكتب المدرسية الأردنية لصفك فقط
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>سؤالك</Label>
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="اكتب سؤالك هنا..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>أو ارفع صورة السؤال (اختياري)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 max-w-xs rounded-lg"
                      />
                    )}
                  </div>

                  <Button
                    onClick={handleAskQuestion}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري البحث في الكتب...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        اسأل المساعد
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Answer Display */}
              {answer && (
                <Card className="mt-6 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        الإجابة
                      </div>
                      {sources.length > 0 && (
                        <Dialog open={showSourcesDialog} onOpenChange={setShowSourcesDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <BookOpen className="h-4 w-4" />
                              المصادر ({sources.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                مصادر الإجابة
                              </DialogTitle>
                              <DialogDescription>
                                الكتب المدرسية التي تم الاستعانة بها في الإجابة
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {sources.map((source, idx) => (
                                <Card key={idx} className="border-primary/20">
                                  <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                      <div className="bg-primary/10 p-2 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <h4 className="font-semibold text-lg">{source.bookName}</h4>
                                        <div className="flex flex-wrap gap-2">
                                          <Badge variant="secondary">{source.subject}</Badge>
                                          <Badge variant="outline">{source.grade || grade}</Badge>
                                        </div>
                                        {source.pageNumber && (
                                          <p className="text-sm text-muted-foreground">
                                            الصفحة: {source.pageNumber}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                      {answer}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Exam Generation Tab */}
            <TabsContent value="exam" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5" />
                    إنشاء ورقة امتحانية
                  </CardTitle>
                  <CardDescription>
                    قم بإنشاء أسئلة امتحانية من المنهاج الأردني
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>المادة</Label>
                      <Select value={examSubject} onValueChange={setExamSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Chemistry">الكيمياء</SelectItem>
                          <SelectItem value="Physics">الفيزياء</SelectItem>
                          <SelectItem value="Biology">الأحياء</SelectItem>
                          <SelectItem value="Mathematics">الرياضيات</SelectItem>
                          <SelectItem value="Arabic">اللغة العربية</SelectItem>
                          <SelectItem value="English">اللغة الإنجليزية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>الصف</Label>
                      <Select value={examGrade} onValueChange={setExamGrade}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="العاشر">العاشر</SelectItem>
                          <SelectItem value="الحادي عشر">الحادي عشر</SelectItem>
                          <SelectItem value="الثاني عشر">الثاني عشر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>المحتوى (الوحدات أو الفصول)</Label>
                    <Input
                      value={examContent}
                      onChange={(e) => setExamContent(e.target.value)}
                      placeholder="مثال: حتى الوحدة الثانية"
                    />
                  </div>

                  <div>
                    <Label>وصف نوع الأسئلة</Label>
                    <Textarea
                      value={examQuestionTypes}
                      onChange={(e) => setExamQuestionTypes(e.target.value)}
                      placeholder="مثال: أسئلة اختيار من متعدد وأسئلة مقالية"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>عدد الأسئلة</Label>
                    <Input
                      type="number"
                      value={examQuestionCount}
                      onChange={(e) => setExamQuestionCount(e.target.value)}
                      min="1"
                      max="50"
                    />
                  </div>

                  <Button
                    onClick={generateExamQuestions}
                    disabled={generatingExam}
                    className="w-full"
                  >
                    {generatingExam ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري إنشاء الأسئلة...
                      </>
                    ) : (
                      <>
                        <FileQuestion className="w-4 h-4 mr-2" />
                        إنشاء ورقة الامتحان
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedExam && (
                <Card>
                  <CardHeader>
                    <CardTitle>ورقة الامتحان</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans">
                        {generatedExam}
                      </pre>
                    </div>
                    <Button onClick={downloadExam} className="w-full">
                      تحميل ورقة الامتحان
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}