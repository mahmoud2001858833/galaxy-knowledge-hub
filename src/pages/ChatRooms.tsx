
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Enable real-time functionality on tables
    const setupRealtime = async () => {
      try {
        // Get current user
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
      } catch (error) {
        console.error('Error setting up realtime:', error);
      }
    };

    setupRealtime();
  }, [navigate, toast]);

  return <ChatLayout />;
};

export default ChatRooms;
