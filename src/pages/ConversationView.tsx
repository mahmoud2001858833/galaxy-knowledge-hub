import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any;
  image_url?: string;
  created_at: string;
}

const ConversationView = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationTitle, setConversationTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);

      // Load conversation details
      const { data: conversation, error: convError } = await supabase
        .from('jordanian_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      
      setConversationTitle(conversation.title);

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('jordanian_assistant_chat_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(messagesData?.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        sources: msg.sources as any,
        image_url: msg.image_url,
        created_at: msg.created_at,
      })) || []);
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast.error('حدث خطأ في تحميل المحادثة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/jordanian-assistant')}
            className="hover:bg-primary/10"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{conversationTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {messages.length} رسالة
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)] rounded-lg border bg-card/50 backdrop-blur-sm p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                  imageUrl={message.image_url}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ConversationView;
