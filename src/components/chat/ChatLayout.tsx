import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import { User, Users, Search, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import UserChatProfile from './UserChatProfile';

const ChatLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('group');
  const [forceRefresh, setForceRefresh] = useState(0);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

        // جلب قائمة جهات الاتصال
        fetchContacts(session.user.id);
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

  const fetchContacts = async (userId: string) => {
    try {
      // جلب جهات الاتصال
      const { data, error } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        const contactIds = data.map(contact => contact.contact_id);
        
        // جلب معلومات المستخدمين
        const { data: usersData, error: usersError } = await supabase
          .from('users_profiles')
          .select('*')
          .in('id', contactIds);
          
        if (usersError) throw usersError;
        
        setContacts(usersData || []);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('خطأ في جلب جهات الاتصال:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      // البحث عن المستخدمين من خلال اسم المستخدم
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .ilike('username', `%${searchTerm}%`)
        .limit(10);
        
      if (error) throw error;
      
      // استبعاد المستخدم الحالي والمستخدمين الموجودين بالفعل في جهات الاتصال
      const contactIds = contacts.map(contact => contact.id);
      const filteredResults = data?.filter(profile => 
        profile.id !== user.id && !contactIds.includes(profile.id)
      ) || [];
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('خطأ في البحث عن المستخدمين:', error);
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addContact = async (contactId: string) => {
    try {
      // التحقق من وجود جهة الاتصال
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', contactId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        toast({
          title: "جهة الاتصال موجودة بالفعل",
          description: "هذا المستخدم موجود بالفعل في جهات الاتصال الخاصة بك",
          variant: "default",
        });
        return;
      }
      
      // إضافة جهة الاتصال
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({ user_id: user.id, contact_id: contactId });
        
      if (insertError) throw insertError;
      
      // تحديث قائمة جهات الاتصال
      fetchContacts(user.id);
      
      // إزالة المستخدم من نتائج البحث
      setSearchResults(prev => prev.filter(user => user.id !== contactId));
      
      toast({
        title: "تمت إضافة جهة الاتصال",
        description: "تمت إضافة المستخدم إلى جهات الاتصال الخاصة بك بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('خطأ في إضافة جهة الاتصال:', error);
      toast({
        title: "خطأ في إضافة جهة الاتصال",
        description: "حدث خطأ أثناء إضافة جهة الاتصال",
        variant: "destructive",
      });
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
          <Link 
            to="/auth"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md inline-block transition-colors shadow-md"
          >
            تسجيل الدخول / إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">      
      <div className="flex mt-4">
        {/* Show profile information in a separate section */}
        <div className="hidden md:block w-64 ml-8">
          {user && userProfile && (
            <UserChatProfile user={user} profile={userProfile} />
          )}
        </div>
        
        {/* محتوى المحادثات */}
        <div className="flex-1">
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
