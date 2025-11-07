import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIForArt = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "كيف بدأ الفن؟",
    "ما هي أهم الحركات الفنية في التاريخ؟",
    "كيف أطور مهاراتي في الرسم؟",
    "ما الفرق بين الفن الكلاسيكي والمعاصر؟",
    "من هم أعظم الفنانين في التاريخ؟",
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("art-ai-assistant", {
        body: { question: input },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error("فشل الحصول على الإجابة");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            الذكاء الاصطناعي للفن
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            اسأل أي سؤال عن تاريخ الفن، الفنانين، التقنيات، أو كيفية تطوير مهاراتك الفنية
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                اختر سؤالاً من الأسئلة المقترحة أو اكتب سؤالك الخاص:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-right h-auto py-3 px-4"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIForArt;
