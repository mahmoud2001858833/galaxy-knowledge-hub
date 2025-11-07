
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash } from "lucide-react";

interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const AdminMessagesPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (data && !error) {
      setIsAdmin(true);
      fetchMessages();
    } else {
      setIsAdmin(false);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
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


  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageToDelete);
      
      if (error) throw error;
      
      setMessages(messages.filter(msg => msg.id !== messageToDelete));
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الرسالة بنجاح",
      });
      setMessageToDelete(null);
      setDeleteConfirmationOpen(false);
    } catch (error: any) {
      console.error("خطأ في حذف الرسالة:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة حذف الرسالة",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA');
  };

  if (!isAdmin) {
    return (
      <div className="flex justify-center my-8 bg-white/5 backdrop-blur-sm rounded-lg p-8">
        <div className="text-center">
          <p className="text-xl text-white/80 mb-2">لوحة الرسائل - للمشرفين فقط</p>
          <p className="text-white/60">يجب أن تكون مشرفاً للوصول إلى هذه الصفحة</p>
        </div>
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
        <Button onClick={fetchMessages} variant="outline">تحديث</Button>
      </div>
      
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex-1 text-right">
                    {message.subject}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">
                      {formatDate(message.created_at)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        setMessageToDelete(message.id);
                        setDeleteConfirmationOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 border-b border-white/10 pb-2">
                  <div className="flex justify-between items-center text-sm text-white/80">
                    <span>{message.name}</span>
                    <a href={`mailto:${message.email}`} className="text-blue-400 hover:underline">
                      {message.email}
                    </a>
                  </div>
                </div>
                <p className="text-right whitespace-pre-wrap">
                  {message.message}
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

      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من رغبتك في حذف هذه الرسالة؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmationOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteMessage}
            >
              حذف الرسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessagesPanel;
