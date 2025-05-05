
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const ChatLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
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

        setUser(session.user);
        setLoading(false);
      } catch (error) {
        console.error('خطأ في التحقق من المستخدم:', error);
        toast({
          title: "حدث خطأ",
          description: "يرجى المحاولة مرة أخرى لاحقاً",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    checkUser();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-cyan-900/40 to-cyan-950" dir="rtl">
        <StarField />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-cyan-900/40 to-cyan-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-cyan-500 mb-8 text-center">
            غرف المحادثة
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
            <Tabs defaultValue="group" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="group" className="flex items-center gap-2 py-3">
                  <Users className="h-5 w-5" />
                  <span>المحادثات الجماعية</span>
                </TabsTrigger>
                <TabsTrigger value="private" className="flex items-center gap-2 py-3">
                  <MessageSquare className="h-5 w-5" />
                  <span>المحادثات الخاصة</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="group" className="animate-fade-in">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                >
                  <GroupChat user={user} />
                </motion.div>
              </TabsContent>

              <TabsContent value="private" className="animate-fade-in">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                >
                  <PrivateChat user={user} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatLayout;
