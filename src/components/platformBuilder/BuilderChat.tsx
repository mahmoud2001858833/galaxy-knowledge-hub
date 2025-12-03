import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  FileCode2, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  Folder
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code_changes?: {
    filesCount?: number;
    files?: Array<{
      file_name: string;
      file_type: string;
      content: string;
    }>;
  };
  timestamp: Date;
}

interface BuilderChatProps {
  projectId: string;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  supabaseConnected?: boolean;
}

const CodeBlock = ({ fileName, fileType, content }: { fileName: string; fileType: string; content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("تم نسخ الكود");
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageIcon = (type: string) => {
    const icons: Record<string, string> = {
      'html': '🌐',
      'css': '🎨',
      'js': '⚡',
      'py': '🐍',
      'php': '🐘',
      'cpp': '⚙️',
      'json': '📋',
    };
    return icons[type] || '📄';
  };

  const lines = content.split('\n');
  const previewLines = lines.slice(0, 8).join('\n');
  const hasMore = lines.length > 8;

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 my-2">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span>{getLanguageIcon(fileType)}</span>
          <span className="text-sm font-mono text-slate-300">{fileName}</span>
          <Badge variant="outline" className="text-xs bg-slate-700 border-slate-600">
            {fileType.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-slate-400 hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className={isExpanded ? 'max-h-[400px]' : 'max-h-[200px]'}>
        <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto">
          <code>{isExpanded ? content : previewLines}{hasMore && !isExpanded && '\n...'}</code>
        </pre>
      </ScrollArea>
      {hasMore && !isExpanded && (
        <div className="px-3 py-1.5 bg-slate-800 border-t border-slate-700">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-primary hover:underline"
          >
            عرض {lines.length - 8} سطر إضافي
          </button>
        </div>
      )}
    </div>
  );
};

export const BuilderChat = ({ 
  projectId, 
  messages, 
  onSendMessage, 
  isLoading,
  supabaseConnected = false 
}: BuilderChatProps) => {
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
    "أنشئ منصة تعليمية مع تسجيل دخول",
    "أنشئ صفحة هبوط عصرية بأنيميشن",
    "أضف لوحة تحكم مع إحصائيات",
    "أنشئ نظام إدارة مهام كامل",
    "أضف مساعد ذكي بالذكاء الاصطناعي",
    "أنشئ متجر إلكتروني مع سلة شراء",
  ];

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">المساعد الذكي</h3>
              <p className="text-xs text-muted-foreground">أنشئ منصات متكاملة</p>
            </div>
          </div>
          {supabaseConnected && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
              Supabase متصل
            </Badge>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  مرحباً بك في منشئ المنصات
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  أخبرني ماذا تريد أن أبني لك، وسأنشئ منصة متكاملة مع كود احترافي.
                  {supabaseConnected && (
                    <span className="block mt-1 text-green-500">
                      ✨ Supabase متصل - سأستخدم قاعدة بياناتك الحقيقية!
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground px-4 py-3'
                        : 'bg-secondary/50 text-secondary-foreground p-4'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    ) : (
                      <div className="space-y-3">
                        {/* AI Response Text */}
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        
                        {/* Generated Files Display */}
                        {message.code_changes?.files && message.code_changes.files.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Folder className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-sm">
                                الملفات المُنشأة ({message.code_changes.files.length})
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {message.code_changes.files.slice(0, 5).map((file, idx) => (
                                <CodeBlock
                                  key={idx}
                                  fileName={file.file_name}
                                  fileType={file.file_type}
                                  content={file.content}
                                />
                              ))}
                              
                              {message.code_changes.files.length > 5 && (
                                <div className="text-center py-2">
                                  <Badge variant="secondary" className="text-xs">
                                    +{message.code_changes.files.length - 5} ملفات أخرى
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Files count badge (fallback) */}
                        {message.code_changes?.filesCount && message.code_changes.filesCount > 0 && !message.code_changes.files && (
                          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                            <FileCode2 className="w-4 h-4 text-primary" />
                            <Badge variant="secondary" className="text-xs">
                              {message.code_changes.filesCount} ملف تم إنشاؤه
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-xs opacity-50 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString('ar-SA')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            اقتراحات للبدء:
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(suggestion)}
                className="text-xs h-7 bg-background/50"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="px-4 pb-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>جاري إنشاء المشروع...</span>
          </motion.div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="صف المشروع الذي تريد إنشاءه... (Shift+Enter للسطر الجديد)"
            className="min-h-[50px] max-h-[150px] resize-none bg-background/50 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
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