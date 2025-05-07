
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

        // إعداد قناة الوقت الحقيقي للجدول
        const channel = supabase.channel('schema-db-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'group_messages' 
          }, payload => {
            console.log('تم استلام تغيير في الوقت الحقيقي:', payload);
          })
          .subscribe(status => {
            if (status === 'SUBSCRIBED') {
              console.log('تم تهيئة الوقت الحقيقي بنجاح');
            } else {
              console.error('فشل في الاشتراك بالوقت الحقيقي:', status);
            }
          });
        
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up realtime:', error);
      }
    };

    setupRealtime();
  }, [navigate, toast]);

  return <ChatLayout />;
};

export default ChatRooms;
