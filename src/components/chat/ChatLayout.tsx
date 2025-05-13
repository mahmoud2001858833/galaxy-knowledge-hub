
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
        {/* قائمة جهات الاتصال الثابتة */}
        <div className="hidden md:block w-64 ml-8 flex-shrink-0">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 sticky top-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">جهات الاتصال</h3>
                <Users className="text-blue-400 h-5 w-5" />
              </div>
              
              {/* مربع البحث */}
              <div className="relative mb-4">
                <div className="flex gap-2">
                  <Input 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="ابحث عن مستخدمين..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="bg-blue-900/30 border-blue-500/30" 
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    <Search className="h-4 w-4 text-blue-400" />
                  </Button>
                </div>
              </div>
              
              {/* نتائج البحث */}
              {searchResults.length > 0 && (
                <div className="mb-4 border-b border-white/10 pb-4">
                  <h4 className="text-sm text-white/70 mb-2">نتائج البحث</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            {result.avatar_url ? (
                              <AvatarImage src={result.avatar_url} />
                            ) : (
                              <AvatarFallback className="bg-blue-900/50">{result.username[0]}</AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-white text-sm">{result.username}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                          onClick={() => addContact(result.id)}
                        >
                          إضافة
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* قائمة جهات الاتصال */}
              {contacts.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="flex items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      onClick={() => {
                        // المنطق الخاص بفتح محادثة خاصة مع جهة الاتصال
                      }}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        {contact.avatar_url ? (
                          <AvatarImage src={contact.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-blue-900/50">{contact.username[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{contact.username}</p>
                        <p className="text-white/50 text-xs">اضغط للمحادثة</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-white/50">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد جهات اتصال</p>
                  <p className="text-xs mt-1">ابحث عن مستخدمين جدد للإضافة</p>
                </div>
              )}
            </CardContent>
          </Card>
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

        {/* البحث عن جهات اتصال (للشاشات الصغيرة) */}
        <div className="fixed bottom-8 right-8 md:hidden">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => {
              // منطق فتح قائمة البحث في الشاشات الصغيرة
            }}
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
