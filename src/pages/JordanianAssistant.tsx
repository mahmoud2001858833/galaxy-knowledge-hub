import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, FileQuestion, Sparkles, Download, Copy, ImagePlus, X, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PasswordProtection from "@/components/PasswordProtection";
import UploadedSourcesTab from "@/components/UploadedSourcesTab";
import ChatMessage from "@/components/ChatMessage";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  imageUrl?: string;
}

export default function JordanianAssistant() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Exam generation
  const [examSubject, setExamSubject] = useState("");
  const [examGrade, setExamGrade] = useState("");
  const [examContent, setExamContent] = useState("");
  const [examQuestionTypes, setExamQuestionTypes] = useState("");
  const [examQuestionCount, setExamQuestionCount] = useState("10");
  const [generatedExam, setGeneratedExam] = useState("");
  const [generatingExam, setGeneratingExam] = useState(false);
  const [copiedExam, setCopiedExam] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('jordanian_assistant_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      checkOnboarding();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkOnboarding = () => {
    const savedName = localStorage.getItem('jordanian_assistant_student_name');
    const savedGrade = localStorage.getItem('jordanian_assistant_student_grade');
    
    if (savedName && savedGrade) {
      setStudentName(savedName);
      setGrade(savedGrade);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  };

  const handleAuthSuccess = () => {
    sessionStorage.setItem('jordanian_assistant_auth', 'true');
    setIsAuthenticated(true);
    checkOnboarding();
  };

  const saveStudentInfo = () => {
    if (!studentName.trim() || !grade) {
      toast({
        title: "⚠️ معلومات ناقصة",
        description: "يرجى إدخال الاسم والصف للمتابعة",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('jordanian_assistant_student_name', studentName);
    localStorage.setItem('jordanian_assistant_student_grade', grade);
    
    toast({
      title: "✅ تم الحفظ",
      description: "تم حفظ معلوماتك بنجاح",
    });
  };

  const handleViewSource = (source: any) => {
    setSelectedSource(source);
    setShowSourceDialog(true);
  };

  const handleOnboardingComplete = () => {
    if (!studentName.trim() || !grade) {
      toast({
        title: "⚠️ معلومات ناقصة",
        description: "يرجى إدخال الاسم والصف للمتابعة",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('jordanian_assistant_student_name', studentName);
    localStorage.setItem('jordanian_assistant_student_grade', grade);
    setShowOnboarding(false);
    
    toast({
      title: "✅ مرحباً بك!",
      description: `أهلاً ${studentName}، يمكنك الآن بدء طرح الأسئلة`,
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "⚠️ حجم الصورة كبير",
          description: "يرجى اختيار صورة أصغر من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() && !selectedImage) {
      toast({
        title: "⚠️ يرجى كتابة سؤال أو إرفاق صورة",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: currentQuestion || "ما هو المفهوم في هذه الصورة؟",
      imageUrl: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setLoading(true);

    try {
      // Call the answer function directly - it will handle textbook retrieval
      console.log('Generating answer from uploaded textbooks...');
      const { data: answerData, error: answerError } = await supabase.functions.invoke(
        'jordanian-assistant-answer',
        {
          body: {
            question: currentQuestion,
            studentName: studentName,
            grade: grade,
          }
        }
      );

      // Check if the response contains an error message
      if (answerData?.error) {
        throw new Error(answerData.error);
      }

      if (answerError) {
        console.error('Answer error:', answerError);
        throw new Error('فشل الاتصال بالخادم');
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
        content: `⚠️ ${error.message || 'خطأ غير متوقع'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
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
          contentRange: examContent,
          questionTypes: examQuestionTypes || "أسئلة متنوعة",
          questionCount: parseInt(examQuestionCount) || 10,
        }
      });

      // Check if the response contains an error message
      if (data?.error) {
        throw new Error(data.error);
      }

      if (error) {
        console.error('Exam generation error:', error);
        throw new Error('فشل الاتصال بالخادم');
      }

      if (data?.examPaper) {
        setGeneratedExam(data.examPaper);
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
        title: "⚠️ خطأ في إنشاء الامتحان",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setGeneratingExam(false);
    }
  };

  const copyExam = async () => {
    if (!generatedExam) return;
    
    try {
      await navigator.clipboard.writeText(generatedExam);
      setCopiedExam(true);
      toast({
        title: "✅ تم النسخ",
        description: "تم نسخ الامتحان إلى الحافظة",
      });
      setTimeout(() => setCopiedExam(false), 2000);
    } catch (error) {
      toast({
        title: "⚠️ فشل النسخ",
        description: "حدث خطأ أثناء النسخ",
        variant: "destructive",
      });
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
                      <div className="flex gap-2">
                        <Button onClick={copyExam} className="flex-1" variant="outline">
                          <Copy className="w-4 h-4 ml-2" />
                          {copiedExam ? 'تم النسخ ✓' : 'نسخ الامتحان'}
                        </Button>
                        <Button onClick={downloadExam} className="flex-1">
                          <Download className="w-4 h-4 ml-2" />
                          تحميل الامتحان
                        </Button>
                      </div>
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
