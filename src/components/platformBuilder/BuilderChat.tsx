import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Code, Sparkles, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code_changes?: any;
  timestamp: Date;
}

interface BuilderChatProps {
  projectId: string;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const BuilderChat = ({ projectId, messages, onSendMessage, isLoading }: BuilderChatProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    
    try {
      await onSendMessage(message);
    } catch (error) {
      toast.error("فشل إرسال الرسالة");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "أنشئ صفحة هبوط عصرية",
    "أضف نموذج تواصل معنا",
    "صمم معرض صور جميل",
    "أضف قسم الخدمات",
    "اجعل التصميم داكن",
    "أضف أنيميشن للعناصر",
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  مرحباً بك في منشئ المنصات الذكي
                </h3>
                <p className="text-muted-foreground">
                  ابدأ بوصف المشروع الذي تريد إنشاءه، وسأساعدك في بنائه
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <>
                      <div className="prose prose-invert max-w-none text-sm">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      
                      {message.code_changes?.files && message.code_changes.files.length > 0 && (
                        <div className="mt-4 border-t border-border/50 pt-4">
                          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            <span>الملفات المُنشأة ({message.code_changes.files.length})</span>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {message.code_changes.files.map((file: any, i: number) => (
                              <div key={i} className="bg-black/30 rounded-lg p-3 border border-primary/20">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-primary font-mono flex items-center gap-2">
                                    {file.file_type === 'html' && '📄'}
                                    {file.file_type === 'css' && '🎨'}
                                    {file.file_type === 'js' && '⚡'}
                                    {file.file_type === 'py' && '🐍'}
                                    {file.file_type === 'cpp' && '⚙️'}
                                    {file.file_name}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(file.content);
                                      toast.success("تم نسخ الكود بنجاح");
                                    }}
                                  >
                                    <Copy className="w-3 h-3 ml-1" />
                                    نسخ
                                  </Button>
                                </div>
                                <pre className="text-xs overflow-x-auto bg-black/50 p-2 rounded max-h-32">
                                  <code className="text-muted-foreground">
                                    {file.content.slice(0, 300)}...
                                  </code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="text-xs opacity-50 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString('ar-SA')}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-4">
          <div className="text-sm text-muted-foreground mb-2">💡 اقتراحات:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب طلبك هنا... (Shift+Enter للسطر الجديد)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
