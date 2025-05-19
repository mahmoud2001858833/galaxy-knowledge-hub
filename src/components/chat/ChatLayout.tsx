
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import UserChatProfile from './UserChatProfile';
import { MessageSquare, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ChatLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('');
  const [showChatSelector, setShowChatSelector] = useState(true);
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
    setShowChatSelector(false);
  };

  // Reset to selector view
  const handleBackToSelector = () => {
    setActiveTab('');
    setShowChatSelector(true);
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

  // Listen for select contact events
  useEffect(() => {
    const handleSelectContact = (event: any) => {
      if (event.detail && event.detail.contactId) {
        // Switch to private chat tab and pass selected contact
        setActiveTab('private');
        setShowChatSelector(false);
      }
    };
    
    document.addEventListener('select-contact', handleSelectContact);
    
    return () => {
      document.removeEventListener('select-contact', handleSelectContact);
    };
  }, []);

  // Animated selector containers for better visual appeal
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full h-full min-h-[100%] flex flex-col overflow-hidden">
      {showChatSelector ? (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="flex flex-col w-full h-full bg-gradient-to-br from-indigo-950/40 to-violet-950/40 backdrop-blur-lg p-6 rounded-lg border border-indigo-500/20"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-indigo-400 mb-8"
          >
            اختر نوع المحادثة
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer"
              onClick={() => handleTabChange('private')}
            >
              <Card className="h-full bg-gradient-to-br from-indigo-900/40 to-indigo-800/30 border-indigo-500/30 hover:from-indigo-800/50 hover:to-indigo-700/40 hover:border-indigo-500/50 transition-all duration-300 shadow-lg">
                <CardContent className="p-10 flex flex-col items-center justify-center h-full">
                  <div className="h-24 w-24 rounded-full bg-indigo-900/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <MessageSquare className="h-12 w-12 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">المحادثات الخاصة</h3>
                  <p className="text-indigo-300/90 text-center">تواصل مع أصدقائك وزملائك بشكل خاص ومباشر</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer"
              onClick={() => handleTabChange('group')}
            >
              <Card className="h-full bg-gradient-to-br from-emerald-900/40 to-emerald-800/30 border-emerald-500/30 hover:from-emerald-800/50 hover:to-emerald-700/40 hover:border-emerald-500/50 transition-all duration-300 shadow-lg">
                <CardContent className="p-10 flex flex-col items-center justify-center h-full">
                  <div className="h-24 w-24 rounded-full bg-emerald-900/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <Users className="h-12 w-12 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">المحادثات الجماعية</h3>
                  <p className="text-emerald-300/90 text-center">شارك في محادثات جماعية مع العديد من المستخدمين</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <Tabs 
          value={activeTab}
          className="w-full h-full flex flex-col"
        >
          <div className="flex justify-between items-center mb-4 px-4 pt-4 bg-gradient-to-r from-indigo-900/30 to-violet-900/30 rounded-t-lg border-b border-indigo-500/20 pb-4">
            <Button 
              variant="outline" 
              onClick={handleBackToSelector}
              className="bg-indigo-900/30 border-indigo-500/30 hover:bg-indigo-800/50"
            >
              <span>العودة للقائمة الرئيسية</span>
            </Button>
            
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-indigo-300">
              {activeTab === 'private' ? 'المحادثات الخاصة' : 'المحادثات الجماعية'}
            </h2>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden w-full"
            >
              <TabsContent value="private" className="m-0 h-full w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 h-full w-full gap-4">
                  <div className="lg:col-span-3 h-full">
                    <PrivateChat user={user} />
                  </div>
                  <div className="hidden lg:block">
                    <UserChatProfile user={user} profile={profile} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="group" className="m-0 h-full w-full">
                <div className="grid grid-cols-1 h-full w-full">
                  <div className="h-full w-full">
                    <GroupChat user={user} />
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      )}
    </div>
  );
};

export default ChatLayout;
