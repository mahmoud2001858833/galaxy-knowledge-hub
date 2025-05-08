
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
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
        }
      } catch (error) {
        console.error('خطأ في التحقق من المستخدم:', error);
        toast({
          title: "حدث خطأ",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    };

    checkUser();
    
    // Set page title
    document.title = "المحادثات - منصة تعليمية";
    
    return () => {
      // Reset title when unmounting
      document.title = "منصة تعليمية";
    };
  }, [navigate, toast]);
  
  return <ChatLayout />;
};

export default ChatRooms;
