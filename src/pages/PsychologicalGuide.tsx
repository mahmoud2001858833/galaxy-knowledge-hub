import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Loader2, Brain, Heart, Sparkles, BookOpen, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  redirectTo?: string;
  redirectMessage?: string;
  suggestions?: Array<{
    type: string;
    title: string;
    url: string;
    icon: string;
  }>;
}

const moods = [
  { emoji: '😠', label: 'غاضب', value: 'angry', color: 'from-red-500 to-orange-500' },
  { emoji: '😌', label: 'هادئ', value: 'calm', color: 'from-green-500 to-teal-500' },
  { emoji: '😊', label: 'سعيد', value: 'happy', color: 'from-yellow-500 to-pink-500' }
];

const sideMenuOptions = [
  {
    title: 'مشكلة فهم الدراسة',
    icon: BookOpen,
    description: 'أفضل طرق الدراسة والمراجعة',
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    title: 'مشكلة تنظيم الوقت',
    icon: Brain,
    description: 'أفضل طرق تنظيم الوقت',
    gradient: 'from-pink-600 to-rose-600'
  }
];

const PsychologicalGuide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'salah' | 'mood' | 'chat'>('salah');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (step === 'salah') {
      const timer = setTimeout(() => {
        setStep('mood');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setStep('chat');
    setMessages([{
      id: '1',
      role: 'ai',
      content: 'هَدِّي نفسك، وقولي شو المشكلة؟ 💙'
    }]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await supabase.functions.invoke('psychological-guide-ai', {
        body: {
          message: inputText,
          mood: selectedMood,
          conversationHistory
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        role: 'ai',
        content: response.data.answer,
        redirectTo: response.data.redirectTo,
        redirectMessage: response.data.redirectMessage,
        suggestions: response.data.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: 'عذراً، حدث خطأ. حاول مرة أخرى.'
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

  const handleSideMenuOption = (option: typeof sideMenuOptions[0]) => {
    const message = option.title === 'مشكلة فهم الدراسة' 
      ? 'عندي مشكلة في فهم الدراسة' 
      : 'عندي مشكلة في تنظيم الوقت';
    
    setInputText(message);
    setShowSideMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-950 via-indigo-900 to-black" dir="rtl">
      <SEO 
        title="مرشدك النفسي - ذروة العلم"
        description="مرشد نفسي ذكي يساعدك في فهم مشاعرك وتوجيهك للقسم المناسب في المنصة"
        keywords="مرشد نفسي, دعم نفسي, توجيه طلابي, صحة نفسية, ذروة العلم"
      />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={500} />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-6xl">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 mb-4 w-fit"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للرئيسية
        </Button>

        <AnimatePresence mode="wait">
          {step === 'salah' && (
            <motion.div
              key="salah"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-1 flex items-center justify-center"
            >
              <Card className="p-12 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-xl">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="text-6xl mb-6">🤲</div>
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400">
                    صلِّ على النبي ﷺ
                  </h2>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center"
            >
              <Card className="p-12 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 backdrop-blur-xl max-w-2xl w-full">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 mb-4">
                    <Heart className="w-10 h-10 text-purple-300" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    كيف هو مزاجك اليوم؟
                  </h2>
                  <p className="text-purple-200">اختر ما يعبر عن شعورك الحالي</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {moods.map((mood, index) => (
                    <motion.button
                      key={mood.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMoodSelect(mood.value)}
                      className={`p-8 rounded-2xl bg-gradient-to-br ${mood.color} hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 border border-white/20`}
                    >
                      <div className="text-6xl mb-3">{mood.emoji}</div>
                      <div className="text-white font-bold text-xl">{mood.label}</div>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex gap-4"
            >
              {/* Side Menu */}
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 space-y-4"
              >
                <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30 backdrop-blur-xl">
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-6 h-6 text-purple-300 ml-2" />
                    <h3 className="text-xl font-bold text-white">قائمة المساعدة</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {sideMenuOptions.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSideMenuOption(option)}
                        className={`w-full p-4 rounded-xl bg-gradient-to-r ${option.gradient} text-white text-right hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-start">
                          <option.icon className="w-5 h-5 ml-3 mt-1" />
                          <div>
                            <div className="font-bold mb-1">{option.title}</div>
                            <div className="text-sm opacity-90">{option.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Chat Area */}
              <Card className="flex-1 p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 backdrop-blur-xl flex flex-col">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 mb-3">
                    <Brain className="w-8 h-8 text-purple-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">مرشدك النفسي</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                            : 'bg-gray-800/50 border border-gray-600/50 text-gray-100'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed mb-2">
                            {message.content}
                          </div>

                          {message.redirectTo && (
                            <Button
                              onClick={() => navigate(message.redirectTo!)}
                              className="w-full mt-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            >
                              {message.redirectMessage}
                            </Button>
                          )}

                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm font-semibold text-purple-300 mb-2">
                                محتوى مقترح:
                              </div>
                              {message.suggestions.map((suggestion, idx) => (
                                <a
                                  key={idx}
                                  href={suggestion.url}
                                  target={suggestion.url.startsWith('http') ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 transition-colors border border-purple-500/30"
                                >
                                  <span className="text-2xl ml-3">{suggestion.icon}</span>
                                  <span className="text-sm text-purple-200">{suggestion.title}</span>
                                  <ExternalLink className="w-4 h-4 mr-auto text-purple-400" />
                                </a>
                              ))}
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

                <div className="flex gap-2">
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                  
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب هنا ما يدور في بالك..."
                    className="flex-1 min-h-[50px] bg-gray-900/50 border-purple-500/30 text-white placeholder:text-gray-400 resize-none"
                    rows={2}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default PsychologicalGuide;
