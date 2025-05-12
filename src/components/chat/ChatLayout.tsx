
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';

const ChatLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('group');
  const [forceRefresh, setForceRefresh] = useState(0); // إضافة متغير للتحديث القسري
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    
    // الاستماع للتحديثات
    const handleRefreshMessages = () => {
      console.log("تم استلام حدث تحديث الرسائل في تخطيط المحادثة");
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
      console.log("تنفيذ التحديث القسري للتخطيط", forceRefresh);
      checkUser();
    }
  }, [forceRefresh]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
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
        <div className="bg-white/5 p-6 rounded-xl text-center max-w-md">
          <h3 className="text-xl font-bold text-white mb-2">يجب تسجيل الدخول</h3>
          <p className="text-white/70 mb-4">
            يرجى تسجيل الدخول للوصول إلى غرف المحادثة
          </p>
          <a 
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block transition-colors"
          >
            تسجيل الدخول / إنشاء حساب
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="group" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="group" className="text-right">المحادثات الجماعية</TabsTrigger>
          <TabsTrigger value="private" className="text-right">المحادثات الخاصة</TabsTrigger>
        </TabsList>
        <TabsContent value="group" className="space-y-4">
          <GroupChat user={user} key={`group-${forceRefresh}`} />
        </TabsContent>
        <TabsContent value="private" className="space-y-4">
          <PrivateChat user={user} key={`private-${forceRefresh}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatLayout;
