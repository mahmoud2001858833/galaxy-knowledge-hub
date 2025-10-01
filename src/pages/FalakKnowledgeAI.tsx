import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Image as ImageIcon, Video, Sparkles, Brain, BookOpen, Target, Eye, Upload, X, Loader2, User, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  step?: number;
  hasImage?: boolean;
  imageUrl?: string;
  videoSuggestions?: VideoSuggestion[];
  relatedQuestions?: string[];
}

interface VideoSuggestion {
  title: string;
  url: string;
  thumbnail?: string;
}

const FalakKnowledgeAI = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user for personalization
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        setCurrentUser({
          ...session.user,
          username: profile?.username || 'الطالب'
        });
      }
    };

    getCurrentUser();

    // Welcome message
    setMessages([{
      id: '1',
      type: 'system',
      content: `🌌 أهلاً وسهلاً بك في فلك المعرفة الذكي!\n\nأنا مساعدك الذكي المتخصص في دعم المنهاج الأردني. سأقوم بمساعدتك بشكل تفصيلي خلال أربع خطوات:\n\n🎯 تحليل السؤال بدقة\n🔍 فحص تفصيلي مع الشرح\n💡 النصائح والإرشادات\n✨ الإجابة الكاملة والشاملة\n\nيمكنني تحليل الصور والإجابة على أسئلتك. اسأل عن أي موضوع تريد!`,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "خطأ",
          description: "حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
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

  const sendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText || "تحليل الصورة المرفقة",
      timestamp: new Date(),
      hasImage: !!selectedImage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let imageBase64 = '';
      if (selectedImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedImage);
        });
      }

      const userName = currentUser?.username || 'الطالب';

      const response = await supabase.functions.invoke('falak-knowledge-ai', {
        body: {
          message: inputText,
          image: imageBase64,
          userName: userName,
          hasImage: !!selectedImage
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'خطأ في الاتصال');
      }

      const aiResponse = response.data;

      // Add all step messages immediately
      const steps = aiResponse.steps || [];
      const allMessages: Message[] = [];
      
      steps.forEach((step: string, i: number) => {
        allMessages.push({
          id: `${Date.now()}-step-${i}`,
          type: 'ai',
          content: step,
          timestamp: new Date(),
          step: i + 1
        });
      });
      
      // Add final answer
      allMessages.push({
        id: `${Date.now()}-final`,
        type: 'ai',
        content: aiResponse.finalAnswer,
        timestamp: new Date(),
        videoSuggestions: aiResponse.videoSuggestions || [],
        relatedQuestions: aiResponse.relatedQuestions || []
      });

      setMessages(prev => [...prev, ...allMessages]);
      setIsLoading(false);
      removeImage();

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-indigo-950 via-purple-900 to-black" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={400} />
        {/* Cosmic nebula effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2/3 left-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
          
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 mb-4"
            >
              <span className="text-4xl">🌌</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500 mb-4">
              فلك المعرفة الذكي
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
              مساعد ذكي متقدم يدعم المنهاج الأردني بتقنيات فضائية حديثة
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Button
                onClick={() => navigate('/student-progress')}
                className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Target className="w-4 h-4 ml-2" />
                تقييم مستوى الطالب
              </Button>
              <Button
                onClick={() => navigate('/study-schedule-creator')}
                className="bg-gradient-to-r from-green-600/80 to-blue-600/80 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <GraduationCap className="w-4 h-4 ml-2" />
                إنشاء جدول دراسي
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Chat Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 mb-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 shadow-2xl shadow-indigo-500/10"
        >
          <div className="h-96 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-indigo-500/50 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl relative ${
                    message.type === 'user'
                      ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                      : message.type === 'system'
                      ? 'bg-purple-900/40 border border-purple-500/50 text-purple-100'
                      : 'bg-gray-800/50 border border-gray-600/50 text-gray-100'
                  }`}>
                    {message.step && (
                      <div className="flex items-center mb-2 text-indigo-300">
                        {message.step === 1 && <Target className="w-4 h-4 ml-2" />}
                        {message.step === 2 && <Eye className="w-4 h-4 ml-2" />}
                        {message.step === 3 && <Brain className="w-4 h-4 ml-2" />}
                        {message.step === 4 && <Sparkles className="w-4 h-4 ml-2" />}
                        <span className="text-sm font-semibold">الخطوة {message.step}</span>
                      </div>
                    )}
                    
                    {message.type === 'user' && currentUser && (
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 ml-2 text-indigo-300" />
                        <span className="text-sm text-indigo-300">{currentUser.username}</span>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {message.hasImage && (
                      <div className="mt-2">
                        <ImageIcon className="w-4 h-4 text-indigo-400 inline ml-1" />
                        <span className="text-xs text-indigo-400">صورة مرفقة</span>
                      </div>
                    )}

                    {message.imageUrl && (
                      <div className="mt-4 text-center">
                        <img
                          src={message.imageUrl}
                          alt="Generated"
                          className="max-w-full h-auto rounded-lg border border-indigo-500/30"
                        />
                      </div>
                    )}
                    
                    {message.videoSuggestions && message.videoSuggestions.length > 0 && (
                      <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                        <div className="flex items-center mb-2">
                          <Video className="w-4 h-4 ml-2 text-purple-300" />
                          <span className="text-sm font-semibold text-purple-300">فيديوهات مقترحة:</span>
                        </div>
                        <div className="space-y-1">
                          {message.videoSuggestions.map((video, idx) => (
                            <a
                              key={idx}
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-purple-200 hover:text-purple-100 hover:underline"
                            >
                              • {video.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.relatedQuestions && message.relatedQuestions.length > 0 && (
                      <div className="mt-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                        <div className="flex items-center mb-2">
                          <BookOpen className="w-4 h-4 ml-2 text-indigo-300" />
                          <span className="text-sm font-semibold text-indigo-300">أسئلة ذات صلة:</span>
                        </div>
                        <div className="space-y-1">
                          {message.relatedQuestions.map((question, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInputText(question)}
                              className="block text-xs text-indigo-200 hover:text-indigo-100 hover:underline text-right w-full"
                            >
                              • {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] p-4 rounded-2xl bg-gray-800/50 border border-gray-600/50 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  <span className="text-sm text-gray-300">جاري التفكير...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Image Preview */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 relative inline-block"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-32 max-h-32 rounded-lg border-2 border-indigo-500/50"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
          
          {/* Input Area */}
          <div className="flex gap-2">
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/30"
              title="رفع صورة"
            >
              <Upload className="w-4 h-4" />
            </Button>
            
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اسأل أي سؤال عن المنهاج الأردني أو ارفع صورة للتحليل..."
              className="flex-1 min-h-[50px] bg-gray-900/50 border-indigo-500/30 text-white placeholder:text-gray-400 resize-none"
              rows={2}
            />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </motion.div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-purple-400 ml-3" />
              <h3 className="text-xl font-bold text-white">تتبع تقدم الطالب</h3>
            </div>
            <p className="text-purple-100 mb-4">اكتشف نقاط القوة والضعف واحصل على خطط تدريب مخصصة</p>
            <Button 
              onClick={() => navigate('/student-progress')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              ابدأ التقييم
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-900/30 to-cyan-900/30 border-indigo-500/30 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <GraduationCap className="w-6 h-6 text-indigo-400 ml-3" />
              <h3 className="text-xl font-bold text-white">جدولة الدراسة</h3>
            </div>
            <p className="text-indigo-100 mb-4">أنشئ جدولاً دراسياً احترافياً مخصصاً لاحتياجاتك</p>
            <Button 
              onClick={() => navigate('/study-schedule')}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              إنشاء الجدول
            </Button>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FalakKnowledgeAI;