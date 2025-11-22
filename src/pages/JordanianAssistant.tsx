import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Sparkles, ImagePlus, X, Settings, MessageSquarePlus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import UploadedSourcesTab from "@/components/UploadedSourcesTab";
import ChatMessage from "@/components/ChatMessage";
import OnboardingDialog from "@/components/OnboardingDialog";
import ExamGenerationTab from "@/components/ExamGenerationTab";
import { motion, AnimatePresence } from "framer-motion";
import { ConversationsGrid } from "@/components/ConversationsGrid";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  imageUrl?: string;
}

export default function JordanianAssistant() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Image generation
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSubject, setImageSubject] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  
  // Sources password protection
  const [showSourcesPassword, setShowSourcesPassword] = useState(false);
  const [sourcesPasswordVerified, setSourcesPasswordVerified] = useState(false);
  const [sourcesPasswordInput, setSourcesPasswordInput] = useState("");
  
  // Conversations management
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkUserInfo();
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkUserInfo = async () => {
    const savedName = localStorage.getItem('jordanian_assistant_student_name');
    const savedGrade = localStorage.getItem('jordanian_assistant_student_grade');
    const savedSemester = localStorage.getItem('jordanian_assistant_student_semester');
    
    if (savedName && savedGrade && savedSemester) {
      setStudentName(savedName);
      setGrade(savedGrade);
      setSemester(savedSemester);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  };

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jordanian_assistant_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          sources: msg.sources as any[],
          imageUrl: msg.image_url,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const createNewConversation = async (firstMessage: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const title = firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...' 
        : firstMessage;

      const { data, error } = await supabase
        .from('jordanian_conversations')
        .insert({
          user_id: user.id,
          title,
          first_message: firstMessage,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveChatMessage = async (message: Message) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create new conversation if this is the first user message
      if (!currentConversationId && message.role === 'user') {
        const newConvId = await createNewConversation(message.content);
        if (newConvId) {
          setCurrentConversationId(newConvId);
        }
      }

      await supabase
        .from('jordanian_assistant_chat_history')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
          image_url: message.imageUrl,
          sources: message.sources,
          conversation_id: currentConversationId,
        });

      // Update conversation timestamp
      if (currentConversationId) {
        await supabase
          .from('jordanian_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const handleOnboardingComplete = (name: string, grade: string, semester: string) => {
    setStudentName(name);
    setGrade(grade);
    setSemester(semester);
    setShowOnboarding(false);
  };

  const handleUpdateInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('jordanian_assistant_users')
          .upsert({
            user_id: user.id,
            student_name: studentName,
            grade,
            semester,
          });

        if (error) throw error;
      }

      localStorage.setItem('jordanian_assistant_student_name', studentName);
      localStorage.setItem('jordanian_assistant_student_grade', grade);
      localStorage.setItem('jordanian_assistant_student_semester', semester);
      
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث معلوماتك بنجاح",
      });
      
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating info:', error);
      toast({
        title: "⚠️ خطأ",
        description: "حدث خطأ أثناء تحديث المعلومات",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion.trim() && !selectedImage) return;

    // Check if user wants to generate image
    const imageKeywords = ["أنشئ صورة", "ارسم", "صور لي", "اعمل صورة", "وضح بالصورة", "ارسم لي", "صمم صورة"];
    const shouldGenerateImage = imageKeywords.some(keyword => currentQuestion.toLowerCase().includes(keyword));

    if (shouldGenerateImage && !selectedImage) {
      // Extract image description and generate automatically
      const userMessage: Message = {
        role: "user",
        content: currentQuestion,
      };
      setMessages(prev => [...prev, userMessage]);
      saveChatMessage(userMessage);
      
      setCurrentQuestion("");
      await generateEducationalImageFromChat(currentQuestion);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: selectedImage 
        ? `[تم رفع صورة]\n${currentQuestion || "قم بتحليل هذه الصورة"}` 
        : currentQuestion,
    };

    setMessages(prev => [...prev, userMessage]);
    saveChatMessage(userMessage);
    setCurrentQuestion("");
    setLoading(true);

    try {
      let imageBase64 = imagePreview;

      const { data, error } = await supabase.functions.invoke('jordanian-assistant-answer', {
        body: {
          question: currentQuestion || "قم بتحليل هذه الصورة",
          studentName,
          grade,
          subject: imageSubject,
          imageBase64,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "عذراً، لم أتمكن من معالجة السؤال",
        sources: data.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      saveChatMessage(assistantMessage);

      clearImage();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "⚠️ خطأ",
        description: error.message || "حدث خطأ أثناء معالجة السؤال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEducationalImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "⚠️ أدخل وصف الصورة",
        description: "يرجى كتابة وصف الصورة التي تريد إنشاءها",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImage(true);
    setShowImageDialog(false);

    // Add loading message
    const loadingMessage: Message = {
      role: "assistant",
      content: "🎨 جاري إنشاء الصورة التعليمية...",
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-educational-image', {
        body: {
          prompt: imagePrompt,
          subject: imageSubject || "عام",
          grade,
        }
      });

      if (error) throw error;

      if (data.imageBase64) {
        const imageMessage: Message = {
          role: "assistant",
          content: `تم إنشاء الصورة التعليمية: ${imagePrompt}`,
          imageUrl: data.imageBase64,
        };

        // Replace loading message with actual image
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = imageMessage;
          return newMessages;
        });
        saveChatMessage(imageMessage);

        toast({
          title: "✅ تم إنشاء الصورة",
          description: "تم إنشاء الصورة التعليمية بنجاح",
        });
      }

      setImagePrompt("");
      setImageSubject("");
    } catch (error: any) {
      console.error('Error generating image:', error);
      // Remove loading message on error
      setMessages(prev => prev.slice(0, -1));
      toast({
        title: "⚠️ خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الصورة",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateEducationalImageFromChat = async (prompt: string) => {
    setGeneratingImage(true);

    // Add loading message
    const loadingMessage: Message = {
      role: "assistant",
      content: "🎨 جاري إنشاء الصورة التعليمية...",
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-educational-image', {
        body: {
          prompt,
          subject: "عام",
          grade,
        }
      });

      if (error) throw error;

      if (data.imageBase64) {
        const imageMessage: Message = {
          role: "assistant",
          content: `تم إنشاء الصورة التعليمية`,
          imageUrl: data.imageBase64,
        };

        // Replace loading message with actual image
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = imageMessage;
          return newMessages;
        });
        saveChatMessage(imageMessage);

        toast({
          title: "✅ تم إنشاء الصورة",
          description: "تم إنشاء الصورة التعليمية بنجاح",
        });
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      // Remove loading message on error
      setMessages(prev => prev.slice(0, -1));
      toast({
        title: "⚠️ خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الصورة",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleViewSource = (source: any) => {
    setSelectedSource(source);
    setShowSourceDialog(true);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    toast({
      title: "✅ محادثة جديدة",
      description: "تم بدء محادثة جديدة",
    });
  };

  const handleClearHistory = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع المحادثات؟")) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Delete all conversations (cascade will delete messages)
        await supabase
          .from('jordanian_conversations')
          .delete()
          .eq('user_id', user.id);
      }
      
      setMessages([]);
      setCurrentConversationId(null);
      toast({
        title: "✅ تم المسح",
        description: "تم مسح جميع المحادثات بنجاح",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "⚠️ خطأ",
        description: "حدث خطأ أثناء مسح المحادثات",
        variant: "destructive",
      });
    }
  };

  const loadAllConversations = async () => {
    setLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "⚠️ خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('jordanian_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setAllConversations(data || []);
      setShowHistoryDialog(true);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "⚠️ خطأ",
        description: "حدث خطأ أثناء تحميل المحادثات",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSourcesTabClick = () => {
    if (!sourcesPasswordVerified) {
      setShowSourcesPassword(true);
      return false;
    }
    return true;
  };

  const verifySourcesPassword = () => {
    if (sourcesPasswordInput === "mahmoud") {
      setSourcesPasswordVerified(true);
      setShowSourcesPassword(false);
      setSourcesPasswordInput("");
      toast({
        title: "✅ تم التحقق",
        description: "تم فتح المصادر بنجاح",
      });
    } else {
      toast({
        title: "⚠️ كلمة سر خاطئة",
        description: "يرجى إدخال كلمة السر الصحيحة",
        variant: "destructive",
      });
    }
  };

  if (showOnboarding) {
    return <OnboardingDialog open={showOnboarding} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-6xl mx-auto shadow-xl border-2">
            <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    🎓 مساعدك الأردني الذكي
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    مرحباً {studentName} - {grade} - {semester}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadAllConversations} title="المحادثات السابقة" disabled={loadingHistory}>
                    {loadingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : "📜"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNewChat} title="محادثة جديدة">
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearHistory} title="مسح السجل">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="chat">المساعد الذكي</TabsTrigger>
                  <TabsTrigger value="exam">إنشاء امتحان</TabsTrigger>
                  <TabsTrigger 
                    value="sources" 
                    onClick={(e) => {
                      if (!handleSourcesTabClick()) {
                        e.preventDefault();
                      }
                    }}
                  >
                    المصادر المتاحة
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChatMessage
                            role={msg.role}
                            content={msg.content}
                            sources={msg.sources}
                            imageUrl={msg.imageUrl}
                            onViewSource={handleViewSource}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center"
                      >
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <Card className="p-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-32 rounded"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 left-1"
                          onClick={clearImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Card>
                    </motion.div>
                  )}

                  {/* Input Area */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || generatingImage}
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowImageDialog(true)}
                        disabled={loading || generatingImage}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>

                      <Input
                        placeholder="اكتب سؤالك هنا..."
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                        disabled={loading || generatingImage}
                        className="flex-1"
                      />

                      <Button 
                        onClick={handleSubmit}
                        disabled={loading || generatingImage || (!currentQuestion.trim() && !selectedImage)}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </TabsContent>

                <TabsContent value="exam">
                  <ExamGenerationTab grade={grade} />
                </TabsContent>

                <TabsContent value="sources">
                  {sourcesPasswordVerified ? (
                    <UploadedSourcesTab />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">يرجى إدخال كلمة السر للوصول إلى المصادر</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />

      {/* Image Generation Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✨ إنشاء صورة تعليمية</DialogTitle>
            <DialogDescription>
              صف الصورة التعليمية التي تريد إنشاءها
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="مثال: صورة توضح دورة الماء في الطبيعة"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={4}
            />

            <Input
              placeholder="المادة (اختياري)"
              value={imageSubject}
              onChange={(e) => setImageSubject(e.target.value)}
            />

            <Button 
              onClick={generateEducationalImage}
              disabled={generatingImage}
              className="w-full"
            >
              {generatingImage ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارٍ الإنشاء...
                </>
              ) : (
                <>
                  <Sparkles className="ml-2 h-4 w-4" />
                  إنشاء الصورة
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚙️ تعديل المعلومات</DialogTitle>
          </DialogHeader>

          <OnboardingDialog 
            open={showSettings} 
            onComplete={(name, grade, semester) => {
              setStudentName(name);
              setGrade(grade);
              setSemester(semester);
              setShowSettings(false);
              handleUpdateInfo();
            }}
            initialName={studentName}
            initialGrade={grade}
            initialSemester={semester}
          />
        </DialogContent>
      </Dialog>

      {/* Sources Password Dialog */}
      <Dialog open={showSourcesPassword} onOpenChange={setShowSourcesPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔒 المصادر محمية</DialogTitle>
            <DialogDescription>
              يرجى إدخال كلمة السر للوصول إلى المصادر المتاحة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="كلمة السر"
              value={sourcesPasswordInput}
              onChange={(e) => setSourcesPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && verifySourcesPassword()}
            />
            <Button onClick={verifySourcesPassword} className="w-full">
              تحقق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversations History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-6xl max-h-[85vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl">📜 سجل المحادثات السابقة</DialogTitle>
            <DialogDescription>
              اختر محادثة لعرض تفاصيلها
            </DialogDescription>
          </DialogHeader>
          {loadingHistory ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : allConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <MessageSquarePlus className="h-16 w-16 mb-4 opacity-20" />
              <p>لا توجد محادثات سابقة</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <ConversationsGrid
                conversations={allConversations}
                onConversationClick={(conversationId) => {
                  setShowHistoryDialog(false);
                  navigate(`/conversation/${conversationId}`);
                }}
              />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Source Dialog */}
      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📖 المصدر</DialogTitle>
          </DialogHeader>
          {selectedSource && (
            <div className="space-y-2">
              <p><strong>الكتاب:</strong> {selectedSource.bookName}</p>
              <p><strong>الوحدة:</strong> {selectedSource.unitName}</p>
              <p><strong>الدرس:</strong> {selectedSource.lessonName}</p>
              <p><strong>الصفحة:</strong> {selectedSource.pageNumber}</p>
              <Card className="p-4 bg-muted">
                <p className="whitespace-pre-wrap">{selectedSource.content}</p>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
