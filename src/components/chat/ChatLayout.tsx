
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import UserChatProfile from './UserChatProfile';
import { MessageSquareMore, Users } from 'lucide-react';

const ChatLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('private');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return;
        }

        setUser(session.user);

        const { data, error } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (session) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshMessages = () => {
      console.log("Message refresh event received in ChatLayout");
    };
    
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, []);

  return (
    <div className="rounded-lg overflow-hidden h-[calc(100vh-240px)] min-h-[500px] flex flex-col">
      <Tabs 
        defaultValue="private" 
        value={activeTab}
        onValueChange={handleTabChange} 
        className="w-full h-full flex flex-col"
      >
        <div className="flex justify-center mb-4">
          <TabsList className="bg-blue-900/30 border border-blue-800/30 p-1">
            <TabsTrigger 
              value="private" 
              className="data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white flex items-center gap-1"
            >
              <MessageSquareMore className="h-4 w-4" />
              <span>المحادثات الخاصة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="group" 
              className="data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              <span>المحادثات الجماعية</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'private' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'private' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            <TabsContent value="private" className="m-0 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-4">
                <div className="lg:col-span-3 h-full">
                  <PrivateChat user={user} />
                </div>
                <div className="hidden lg:block">
                  <UserChatProfile user={user} profile={profile} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="group" className="m-0 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-4">
                <div className="lg:col-span-4 h-full">
                  <GroupChat user={user} />
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default ChatLayout;
