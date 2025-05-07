
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // تهيئة الاتصال بالوقت الحقيقي
    const setupRealtime = async () => {
      try {
        // التحقق من تسجيل دخول المستخدم
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "يجب تسجيل الدخول",
            description: "يرجى تسجيل الدخول للوصول إلى غرف المحادثة",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // إعداد البث المباشر للجدول
        const { error } = await supabase.rpc('enable_realtime', {
          table_name: 'group_messages'
        }).single();

        if (error) {
          console.error("خطأ في تهيئة الوقت الحقيقي:", error);
        } else {
          console.log("تم تهيئة الوقت الحقيقي بنجاح");
        }
        
      } catch (error) {
        console.error('Error setting up realtime:', error);
      }
    };

    setupRealtime();
  }, [navigate, toast]);

  return <ChatLayout />;
};

export default ChatRooms;
