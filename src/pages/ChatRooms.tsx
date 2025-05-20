
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from '@/components/chat/ChatLayout';
import { UserPlus } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "يجب تسجيل الدخول",
            description: "يرجى تسجيل الدخول للوصول إلى غرف المحادثة",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        setUserId(session.user.id);
      } catch (error) {
        console.error('خطأ في التحقق من المستخدم:', error);
        toast({
          title: "حدث خطأ",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    };

    checkUser();
    
    // Set page title
    document.title = "المحادثات - منصة تعليمية";
    
    return () => {
      document.title = "منصة تعليمية";
    };
  }, [navigate]);
  
  // Improve real-time message notification system
  useEffect(() => {
    if (!userId) return;
    
    // Improve channel for private messages
    const messagesChannel = supabase.channel('messages-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        } as any, 
        (payload) => {
          if (document.hidden) {
            setHasNewMessages(true);
            playNotificationSound();
          }
          
          // Broadcast general update event
          const globalEvent = new CustomEvent('global-chat-update');
          document.dispatchEvent(globalEvent);
        }
      )
      .subscribe();
    
    // Improve handling of notification visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setHasNewMessages(false);
        
        // Broadcast general update event
        const globalEvent = new CustomEvent('global-chat-update');
        document.dispatchEvent(globalEvent);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for general update events
    const handleGlobalUpdate = () => {
      refreshMessages();
    };
    
    document.addEventListener('global-chat-update', handleGlobalUpdate);
    
    return () => {
      supabase.removeChannel(messagesChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('global-chat-update', handleGlobalUpdate);
    };
  }, [userId]);

  // Effect for new message title
  useEffect(() => {
    if (hasNewMessages) {
      document.title = "🔔 رسالة جديدة - منصة تعليمية";
    } else {
      document.title = "المحادثات - منصة تعليمية";
    }
    
    return () => {
      document.title = "منصة تعليمية";
    };
  }, [hasNewMessages]);
  
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/message-notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.error('Error playing sound:', err));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };
  
  const refreshMessages = () => {
    const refreshEvent = new CustomEvent('refresh-messages');
    document.dispatchEvent(refreshEvent);
  };
  
  // Add contact functionality
  const handleAddContact = async () => {
    if (!contactEmail.trim() || !userId) return;
    
    setIsAddingContact(true);
    setErrorMessage('');
    
    try {
      // Search user by username
      const { data: userData, error: userError } = await supabase
        .from('users_profiles')
        .select('id, username')
        .ilike('username', contactEmail.trim());
        
      if (userError) throw userError;
      
      // Find matching user
      const foundUser = userData?.length > 0 ? userData[0] : null;
      
      if (!foundUser) {
        setErrorMessage('لم يتم العثور على مستخدم بهذا الاسم');
        return;
      }
      
      // Ensure user is not adding themselves
      if (foundUser.id === userId) {
        setErrorMessage('لا يمكنك إضافة نفسك كجهة اتصال');
        return;
      }
      
      // Check if contact already exists
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('contact_id', foundUser.id);
        
      if (checkError) throw checkError;
      
      if (existingContact && existingContact.length > 0) {
        setErrorMessage('جهة الاتصال موجودة مسبقًا');
        return;
      }
      
      // Add contact
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          contact_id: foundUser.id
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة ${foundUser.username} إلى جهات اتصالك`,
      });
      
      setContactEmail('');
      setIsAddContactOpen(false);
      refreshMessages();
      
    } catch (error: any) {
      console.error('Error adding contact:', error);
      setErrorMessage('حدث خطأ أثناء إضافة جهة الاتصال');
    } finally {
      setIsAddingContact(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-950 to-purple-950 z-50 overflow-hidden">
      {/* Full height chat interface */}
      <div className="w-full h-full overflow-hidden">
        <ChatLayout />
      </div>
      
      {/* Floating action button to add contact */}
      <Button 
        onClick={() => setIsAddContactOpen(true)}
        className="fixed right-4 bottom-4 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        size="icon"
      >
        <UserPlus className="h-6 w-6" />
      </Button>
      
      {/* Add contact dialog */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-purple-950 border-blue-800/50 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">إضافة جهة اتصال</DialogTitle>
            <DialogDescription className="text-white/70">
              أدخل اسم المستخدم الذي تريد إضافته إلى جهات اتصالك
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="أدخل اسم المستخدم"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-blue-900/40 border-blue-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errorMessage && (
                <p className="text-red-400 text-sm">{errorMessage}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleAddContact}
              disabled={isAddingContact || !contactEmail.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
            >
              {isAddingContact ? 'جاري الإضافة...' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatRooms;
