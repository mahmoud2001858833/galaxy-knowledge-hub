import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, FileQuestion, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PasswordProtection from "@/components/PasswordProtection";
import ChatMessage from "@/components/ChatMessage";
import UploadedSourcesTab from "@/components/UploadedSourcesTab";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

export default function JordanianAssistant() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  
  // Exam generation
  const [examSubject, setExamSubject] = useState("");
  const [examGrade, setExamGrade] = useState("");
  const [examContent, setExamContent] = useState("");
  const [examQuestionTypes, setExamQuestionTypes] = useState("");
  const [examQuestionCount, setExamQuestionCount] = useState("10");
  const [generatedExam, setGeneratedExam] = useState("");
  const [generatingExam, setGeneratingExam] = useState(false);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('jordanian_assistant_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    const savedName = localStorage.getItem('jordanian_assistant_student_name');
    const savedGrade = localStorage.getItem('jordanian_assistant_student_grade');
    if (savedName) setStudentName(savedName);
    if (savedGrade) setGrade(savedGrade);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAuthSuccess = () => {
    sessionStorage.setItem('jordanian_assistant_auth', 'true');
    setIsAuthenticated(true);
  };

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
      title: "✅ تم حفظ معلوماتك",
      description: "يمكنك الآن بدء طرح الأسئلة",
    });
  };

  const handleAskQuestion = async () => {
    if (!studentName || !grade) {
      toast({
        title: "يرجى إدخال معلوماتك أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!currentQuestion.trim()) {
      toast({
        title: "يرجى كتابة سؤال",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: currentQuestion,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      console.log('Searching in textbooks...');
      const { data: searchData, error: searchError } = await supabase.functions.invoke(
        'jordanian-assistant-search',
        {
          body: { 
            question: currentQuestion,
            grade: grade,
          }
        }
      );

      if (searchError) {
        console.error('Search error:', searchError);
        throw new Error('فشل البحث في الكتب');
      }

      const searchResults = searchData?.results || [];
      
      if (searchResults.length === 0) {
        const noSourceMessage: Message = {
          role: "assistant",
          content: "عذراً، لم يتم تزويد النظام بهذا المصدر بعد. يرجى الانتظار والمحاولة في وقت لاحق. نعمل على إضافة المزيد من الكتب المدرسية.",
        };
        setMessages(prev => [...prev, noSourceMessage]);
        setLoading(false);
        return;
      }

      console.log('Generating answer...');
      const { data: answerData, error: answerError } = await supabase.functions.invoke(
        'jordanian-assistant-answer',
        {
          body: {
            question: currentQuestion,
            searchResults: searchResults,
            studentName: studentName,
            grade: grade,
          },
          headers: user ? { 'x-user-id': user.id } : {},
        }
      );

      if (answerError) {
        console.error('Answer error:', answerError);
        throw new Error('فشل توليد الإجابة');
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: answerData.answer,
        sources: answerData.sources || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: `حدث خطأ: ${error.message || 'خطأ غير متوقع'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSource = (source: any) => {
    setSelectedSource(source);
    setShowSourceDialog(true);
  };

  const generateExamQuestions = async () => {
    if (!examSubject || !examGrade || !examContent) {
      toast({
        title: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setGeneratingExam(true);
    setGeneratedExam("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-exam-questions', {
        body: {
          subject: examSubject,
          grade: examGrade,
          content: examContent,
          questionTypes: examQuestionTypes || "أسئلة متنوعة",
          questionCount: parseInt(examQuestionCount) || 10,
        }
      });

      if (error) {
        console.error('Exam generation error:', error);
        throw new Error(error.message || 'فشل توليد الأسئلة');
      }

      if (data?.exam) {
        setGeneratedExam(data.exam);
        toast({
          title: "✅ تم إنشاء ورقة الامتحان",
          description: "يمكنك الآن تحميلها أو نسخها",
        });
      } else {
        throw new Error('لم يتم إرجاع أسئلة');
      }

    } catch (error: any) {
      console.error('Error generating exam:', error);
      toast({
        title: "خطأ في إنشاء الامتحان",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setGeneratingExam(false);
    }
  };

  const downloadExam = () => {
    if (!generatedExam) return;

    const blob = new Blob([generatedExam], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ورقة_امتحان_${examSubject}_${examGrade}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return <PasswordProtection onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              مساعدك الأردني الذكي
            </h1>
            <p className="text-muted-foreground">
              احصل على إجابات من الكتب المدرسية الأردنية باستخدام الذكاء الاصطناعي
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                معلومات الطالب
              </CardTitle>
              <CardDescription>
                أدخل معلوماتك مرة واحدة وسيتم حفظها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الطالب</Label>
                  <Input
                    placeholder="أدخل اسمك"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الصف</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={saveStudentInfo} className="w-full">
                حفظ المعلومات
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">
                <FileQuestion className="w-4 h-4 ml-2" />
                طرح الأسئلة
              </TabsTrigger>
              <TabsTrigger value="exam">
                <Sparkles className="w-4 h-4 ml-2" />
                إنشاء امتحان
              </TabsTrigger>
              <TabsTrigger value="sources">
                <Sparkles className="w-4 h-4 ml-2" />
                المصادر المرفوعة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle>اطرح سؤالك</CardTitle>
                  <CardDescription>
                    اسأل أي سؤال من المنهاج الأردني وسأجيبك اعتماداً على الكتب المدرسية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 h-[400px] overflow-y-auto border rounded-lg p-4 bg-muted/30 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>ابدأ بطرح سؤالك...</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => (
                          <ChatMessage
                            key={idx}
                            role={msg.role}
                            content={msg.content}
                            sources={msg.sources}
                            onViewSource={handleViewSource}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب سؤالك هنا..."
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleAskQuestion()}
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAskQuestion} 
                      disabled={loading || !currentQuestion.trim()}
                      size="icon"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exam">
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء ورقة امتحان</CardTitle>
                  <CardDescription>
                    أنشئ ورقة امتحان مخصصة بناءً على المحتوى المطلوب
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>المادة</Label>
                      <Input
                        placeholder="مثال: اللغة العربية"
                        value={examSubject}
                        onChange={(e) => setExamSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الصف</Label>
                      <Select value={examGrade} onValueChange={setExamGrade}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"].map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>محتوى الامتحان</Label>
                    <Textarea
                      placeholder="اكتب المواضيع أو الوحدات المطلوبة..."
                      value={examContent}
                      onChange={(e) => setExamContent(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>أنواع الأسئلة</Label>
                      <Input
                        placeholder="مثال: اختيار من متعدد، صح وخطأ"
                        value={examQuestionTypes}
                        onChange={(e) => setExamQuestionTypes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عدد الأسئلة</Label>
                      <Input
                        type="number"
                        min="5"
                        max="50"
                        value={examQuestionCount}
                        onChange={(e) => setExamQuestionCount(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={generateExamQuestions} 
                    disabled={generatingExam}
                    className="w-full"
                  >
                    {generatingExam ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري إنشاء الامتحان...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 ml-2" />
                        إنشاء ورقة امتحان
                      </>
                    )}
                  </Button>

                  {generatedExam && (
                    <div className="space-y-4">
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle className="text-lg">ورقة الامتحان</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-4 rounded-lg max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-arabic text-sm leading-relaxed">
                              {generatedExam}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                      <Button onClick={downloadExam} className="w-full">
                        تحميل ورقة الامتحان
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources">
              <UploadedSourcesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>المصدر</DialogTitle>
          </DialogHeader>
          {selectedSource && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">الكتاب: {selectedSource.bookName}</p>
                <p className="text-sm text-muted-foreground">المادة: {selectedSource.subject}</p>
                {selectedSource.pageNumber && (
                  <p className="text-sm text-muted-foreground">الصفحة: {selectedSource.pageNumber}</p>
                )}
              </div>
              {selectedSource.fileUrl && (
                <iframe
                  src={selectedSource.fileUrl}
                  className="w-full h-[600px] border rounded-lg"
                  title="PDF Viewer"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
