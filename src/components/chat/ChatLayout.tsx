
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import UserChatProfile from './UserChatProfile';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const ChatLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('group');
  const [forceRefresh, setForceRefresh] = useState(0);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    
    // الاستماع للتحديثات
    const handleRefreshMessages = () => {
      // إعادة تحميل الصفحة تلقائيًا 
      setForceRefresh(prev => prev + 1);
    };
    
    document.addEventListener('refresh-messages', handleRefreshMessages);
    
    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, []);
  
  // إعادة تحميل عند التحديث القسري
  useEffect(() => {
    if (forceRefresh > 0) {
      checkUser();
    }
  }, [forceRefresh]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // جلب بيانات الملف الشخصي
        const { data: profile, error: profileError } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('خطأ في جلب بيانات الملف الشخصي:', profileError);
        } else {
          setUserProfile(profile);
        }
      } else {
        // توجيه المستخدم إلى صفحة تسجيل الدخول
        toast({
          title: "يجب تسجيل الدخول",
          description: "يرجى تسجيل الدخول لاستخدام المحادثات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('خطأ في التحقق من المستخدم:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="bg-gradient-to-r from-blue-950/70 to-purple-950/70 p-6 rounded-xl border border-blue-500/20 text-center max-w-md shadow-lg">
          <h3 className="text-xl font-bold text-white mb-2">يجب تسجيل الدخول</h3>
          <p className="text-white/70 mb-4">
            يرجى تسجيل الدخول للوصول إلى غرف المحادثة
          </p>
          <a 
            href="/auth"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md inline-block transition-colors shadow-md"
          >
            تسجيل الدخول / إنشاء حساب
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* زر الملف الشخصي */}
      <div className="absolute left-0 top-0 z-10">
        <Button
          onClick={() => setShowUserProfile(prev => !prev)}
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${showUserProfile ? 'bg-blue-600 text-white' : 'bg-blue-900/20 border-blue-500/30'}`}
        >
          <User className="h-4 w-4" />
          <span>الملف الشخصي</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-8 mt-12">
        {/* عرض الملف الشخصي */}
        {showUserProfile && (
          <div className="w-full lg:w-1/4 mb-6">
            <UserChatProfile user={user} profile={userProfile} />
          </div>
        )}
        
        {/* عرض المحادثات */}
        <div className={`${showUserProfile ? 'w-full lg:w-3/4' : 'w-full'}`}>
          <Tabs defaultValue="group" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 p-1">
              <TabsTrigger 
                value="group" 
                className={`text-right ${activeTab === 'group' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'data-[state=inactive]:text-white/70'}`}
              >
                المحادثات الجماعية
              </TabsTrigger>
              <TabsTrigger 
                value="private" 
                className={`text-right ${activeTab === 'private' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'data-[state=inactive]:text-white/70'}`}
              >
                المحادثات الخاصة
              </TabsTrigger>
            </TabsList>
            <TabsContent value="group" className="space-y-4">
              <GroupChat user={user} key={`group-${forceRefresh}`} />
            </TabsContent>
            <TabsContent value="private" className="space-y-4">
              <PrivateChat user={user} key={`private-${forceRefresh}`} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
