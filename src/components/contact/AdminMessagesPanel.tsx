
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  created_at: string;
  message_text: string;
  parsed_message?: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
}

const AdminMessagesPanel = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // تحليل محتوى الرسائل
      const parsedMessages = data?.map(msg => {
        try {
          const parsedText = JSON.parse(msg.message_text);
          return {
            ...msg,
            parsed_message: parsedText
          };
        } catch (e) {
          // إذا لم يكن محتوى الرسالة بصيغة JSON
          return {
            ...msg,
            parsed_message: {
              name: "غير معروف",
              email: "غير معروف",
              subject: "غير معروف",
              message: msg.message_text
            }
          };
        }
      });

      setMessages(parsedMessages || []);
    } catch (error) {
      console.error("خطأ في جلب الرسائل:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الرسائل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === "mahmoud200") {
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "تم تفعيل وضع المشرف"
      });
    } else {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    }
    setPassword("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center my-8">
        <Button onClick={() => setIsPasswordDialogOpen(true)}>
          دخول المشرف
        </Button>

        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">تسجيل دخول المشرف</DialogTitle>
              <DialogDescription className="text-right">
                يرجى إدخال كلمة المرور للوصول إلى لوحة الرسائل
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-4 my-4">
              <Input
                placeholder="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>

            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={!password}
              >
                تسجيل الدخول
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 my-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">لوحة الرسائل</h2>
          <Button onClick={fetchMessages}>تحديث</Button>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 my-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">لوحة الرسائل ({messages.length})</h2>
        <div className="space-x-2 space-x-reverse">
          <Button onClick={fetchMessages} variant="outline">تحديث</Button>
          <Button onClick={() => setIsAuthenticated(false)} variant="destructive">تسجيل الخروج</Button>
        </div>
      </div>
      
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {message.parsed_message?.subject || "بدون موضوع"}
                  </CardTitle>
                  <span className="text-xs text-white/60">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 border-b border-white/10 pb-2">
                  <div className="flex justify-between items-center text-sm text-white/80">
                    <span>{message.parsed_message?.name}</span>
                    <a href={`mailto:${message.parsed_message?.email}`} className="text-blue-400 hover:underline">
                      {message.parsed_message?.email}
                    </a>
                  </div>
                </div>
                <p className="text-right whitespace-pre-wrap">
                  {message.parsed_message?.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white/5 backdrop-blur-sm rounded-lg">
          <p className="text-xl text-white/60">لا توجد رسائل حتى الآن</p>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPanel;
