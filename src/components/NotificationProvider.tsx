import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherSchool, setTeacherSchool] = useState<string | null>(null);

  useEffect(() => {
    // Get current user and check if they're a teacher
    const initializeNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Check if user is a teacher
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('school_name')
        .eq('user_id', user.id)
        .single();

      if (teacherData) {
        setIsTeacher(true);
        setTeacherSchool(teacherData.school_name);
      }
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    if (!isTeacher || !teacherSchool) return;

    // Subscribe to new messages in class chat
    const channel = supabase
      .channel('teacher-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'class_chat_messages',
          filter: `school_name=eq.${teacherSchool}`
        },
        (payload: any) => {
          // Don't show notification for teacher's own messages
          if (payload.new.user_id !== userId && payload.new.user_type === 'parent') {
            // Play notification sound
            const audio = new Audio('/message-notification.mp3');
            audio.play().catch(err => console.log('Audio play failed:', err));

            // Show toast notification
            toast({
              title: "رسالة جديدة من ولي أمر",
              description: `${payload.new.username}: ${payload.new.message_text.substring(0, 50)}${payload.new.message_text.length > 50 ? '...' : ''}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isTeacher, teacherSchool, userId, toast]);

  return <>{children}</>;
};
