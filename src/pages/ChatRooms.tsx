
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

        // إعداد قناة الوقت الحقيقي للرسائل الجماعية
        const groupMessagesChannel = supabase.channel('group-messages-channel')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'group_messages' 
          }, payload => {
            console.log('تم استلام تغيير في رسائل المجموعات:', payload);
          })
          .subscribe(status => {
            if (status === 'SUBSCRIBED') {
              console.log('تم الاشتراك في قناة رسائل المجموعات بنجاح');
            } else {
              console.error('فشل في الاشتراك بقناة رسائل المجموعات:', status);
            }
          });
        
        // إعداد قناة الوقت الحقيقي للرسائل الخاصة
        const privateMessagesChannel = supabase.channel('private-messages-channel')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'private_messages' 
          }, payload => {
            console.log('تم استلام تغيير في الرسائل الخاصة:', payload);
          })
          .subscribe(status => {
            if (status === 'SUBSCRIBED') {
              console.log('تم الاشتراك في قناة الرسائل الخاصة بنجاح');
            } else {
              console.error('فشل في الاشتراك بقناة الرسائل الخاصة:', status);
            }
          });
        
        return () => {
          supabase.removeChannel(groupMessagesChannel);
          supabase.removeChannel(privateMessagesChannel);
        };
      } catch (error) {
        console.error('خطأ في إعداد الوقت الحقيقي:', error);
      }
    };

    setupRealtime();
  }, [navigate, toast]);

  return <ChatLayout />;
};

export default ChatRooms;
