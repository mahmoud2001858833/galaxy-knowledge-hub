import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Send, Image as ImageIcon, Sparkles, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  username: string;
  user_type: string;
  message_text: string;
  image_url: string | null;
  created_at: string;
}

const ClassChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    grade: string;
    section: string;
    schoolName: string;
    username: string;
    userType: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if user is teacher or parent based on route
  const isTeacher = location.pathname.includes('/teacher/chat');

  useEffect(() => {
    fetchUserInfoAndMessages();
  }, []);

  useEffect(() => {
    if (userInfo) {
      subscribeToMessages();
    }
  }, [userInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserInfoAndMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      let userData;
      if (isTeacher) {
        const { data, error } = await supabase
          .from('teachers')
          .select('teacher_name, school_name, homeroom_class')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !data) {
          navigate('/teacher-registration');
          return;
        }

        // Extract grade and section from homeroom_class (e.g., "8أ" -> grade: "8", section: "أ")
        const match = data.homeroom_class.match(/^(\d+)(.+)$/);
        const grade = match ? match[1] : '';
        const section = match ? match[2] : '';

        userData = {
          grade,
          section,
          schoolName: data.school_name,
          username: data.teacher_name,
          userType: 'teacher'
        };
      } else {
        const { data, error } = await supabase
          .from('parents')
          .select('parent_name, grade, section, school_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !data) {
          navigate('/parent-registration');
          return;
        }

        userData = {
          grade: data.grade,
          section: data.section,
          schoolName: data.school_name,
          username: data.parent_name,
          userType: 'parent'
        };
      }

      setUserInfo(userData);

      // Fetch messages for this class
      const { data: messagesData, error: messagesError } = await supabase
        .from('class_chat_messages')
        .select('*')
        .eq('grade', userData.grade)
        .eq('section', userData.section)
        .eq('school_name', userData.schoolName)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!userInfo) return;

    const channel = supabase
      .channel('class-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'class_chat_messages',
          filter: `grade=eq.${userInfo.grade},section=eq.${userInfo.section},school_name=eq.${userInfo.schoolName}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          
          // Play notification sound
          const audio = new Audio('/message-notification.mp3');
          audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() && !imageFile) {
      return;
    }

    if (!userInfo) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `chat/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('class_chat_messages')
        .insert({
          user_id: user.id,
          username: userInfo.username,
          user_type: userInfo.userType,
          grade: userInfo.grade,
          section: userInfo.section,
          school_name: userInfo.schoolName,
          message_text: messageText.trim(),
          image_url: imageUrl
        });

      if (error) throw error;

      setMessageText('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال الرسالة',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-teal-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="دردشة الصف - جسر التواصل"
        description="الدردشة المباشرة مع المعلمين وأولياء الأمور"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-4xl mx-auto h-[calc(100vh-300px)] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(isTeacher ? '/teacher-dashboard' : '/parent-dashboard')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              {t.common.back}
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-white to-cyan-500">
                {t.communicationBridge.chat.title}
              </h1>
              <p className="text-white/70">الصف {userInfo?.grade}{userInfo?.section}</p>
            </div>
          </motion.div>

          {/* Messages Area */}
          <div className="flex-1 bg-background/10 backdrop-blur-sm border border-teal-500/30 rounded-xl overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-white/60 py-12">
                  {t.communicationBridge.chat.noMessages}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          message.user_type === 'teacher' 
                            ? 'bg-blue-500/30 text-blue-300' 
                            : 'bg-teal-500/30 text-teal-300'
                        }`}>
                          {message.user_type === 'teacher' ? t.communicationBridge.chat.teacher : t.communicationBridge.chat.parent}
                        </span>
                        <span className="text-white font-semibold">{message.username}</span>
                      </div>
                      <div className="bg-background/30 rounded-lg p-3 max-w-[80%]">
                        {message.message_text && (
                          <p className="text-white mb-2">{message.message_text}</p>
                        )}
                        {message.image_url && (
                          <img 
                            src={message.image_url} 
                            alt="Shared" 
                            className="rounded-lg max-w-full max-h-64 object-contain"
                          />
                        )}
                        <p className="text-white/40 text-xs mt-2">
                          {new Date(message.created_at).toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-teal-500/30 p-4">
              {imageFile && (
                <div className="mb-2 text-white/70 text-sm">
                  صورة محددة: {imageFile.name}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="icon"
                  className="bg-background/30 border-teal-500/30 hover:bg-background/50"
                >
                  <ImageIcon size={20} className="text-teal-400" />
                </Button>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t.communicationBridge.chat.typeMessage}
                  className="bg-background/30 border-teal-500/30 text-white flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || (!messageText.trim() && !imageFile)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Send size={20} />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClassChat;