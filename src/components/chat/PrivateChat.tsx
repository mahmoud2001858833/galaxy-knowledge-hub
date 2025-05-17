import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import {
  User,
  Send,
  Search,
  UserPlus,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Mail,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PrivateChat = ({ user }) => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<Record<string, any>>({});
  const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMessageSending, setIsMessageSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const contactsAreaRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isContactsVisible, setIsContactsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState<'name' | 'activity'>('name');

  // Subscribe to new messages
  useRealtimeMessages({
    userId: user?.id,
    onNewMessage: () => {
      if (selectedContact) {
        fetchMessages(selectedContact.id);
      }
    }
  });

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    }
  }, [messages, isAutoScroll]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshMessages = () => {
      if (user && selectedContact) {
        fetchMessages(selectedContact.id);
      }
      fetchContacts();
    };

    document.addEventListener('refresh-messages', handleRefreshMessages);

    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, [user, selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // New functions for contacts navigation
  const scrollContactsUp = () => {
    if (contactsAreaRef.current) {
      contactsAreaRef.current.scrollBy({
        top: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollContactsDown = () => {
    if (contactsAreaRef.current) {
      contactsAreaRef.current.scrollBy({
        top: 200,
        behavior: 'smooth'
      });
    }
  };

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, created_at')
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      if (contactsData) {
        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // Create a map of contact creation times
        const contactCreationTimes = {};
        contactsData.forEach(contact => {
          contactCreationTimes[contact.contact_id] = contact.created_at;
        });
        
        // Fetch user profiles for these contacts
        const { data: profilesData, error: profilesError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', contactIds);

        if (profilesError) throw profilesError;
        
        if (profilesData) {
          // Create a map of profiles for easy access
          const profilesMap: Record<string, any> = {};
          const enhancedProfiles = profilesData.map(profile => ({
            ...profile,
            lastActivity: contactCreationTimes[profile.id] || new Date().toISOString()
          }));
          
          enhancedProfiles.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
          
          // Sort contacts based on current sort order
          const sortedContacts = [...enhancedProfiles].sort((a, b) => {
            if (sortOrder === 'name') {
              return a.username.localeCompare(b.username);
            } else {
              return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
            }
          });
          
          setAllProfiles(profilesMap);
          setContacts(sortedContacts);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "خطأ في تحميل جهات الاتصال",
        description: "حدث خطأ أثناء تحميل جهات الاتصال، يرجى المحاولة مرة أخرى",
      });
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'name' ? 'activity' : 'name';
    setSortOrder(newOrder);
    
    // Re-sort the contacts based on the new order
    const sortedContacts = [...contacts].sort((a, b) => {
      if (newOrder === 'name') {
        return a.username.localeCompare(b.username);
      } else {
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });
    
    setContacts(sortedContacts);
  };

  const fetchMessages = async (contactId: string) => {
    if (!user || !contactId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل، يرجى المحاولة مرة أخرى",
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !selectedContact || isMessageSending) return;

    setIsMessageSending(true);
    try {
      // Capture the contact here to ensure we don't lose reference
      const currentContact = selectedContact;

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: currentContact.id,
            message_text: message.trim()
          }
        ]);

      if (error) throw error;
      
      // Clear input but maintain the same chat
      setMessage('');
      
      // تأكيد من التمرير لأسفل بعد إرسال الرسالة
      setIsAutoScroll(true);
      
      // Add the new message to UI immediately for better UX
      const newMessage = {
        id: Date.now().toString(), // Temporary ID
        sender_id: user.id,
        receiver_id: currentContact.id,
        message_text: message.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Then fetch messages after a short delay
      setTimeout(() => {
        fetchMessages(currentContact.id);
      }, 300);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsMessageSending(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن المستخدمين",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addContact = async (contactId) => {
    try {
      // Check if contact already exists
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', contactId);

      if (checkError) throw checkError;

      if (existingContact && existingContact.length > 0) {
        toast.warning({
          title: "جهة الاتصال موجودة بالفعل",
          description: "لقد أضفت هذا المستخدم بالفعل إلى جهات اتصالك",
        });
        return;
      }

      // Add contact
      const { error } = await supabase
        .from('contacts')
        .insert([{ user_id: user.id, contact_id: contactId }]);

      if (error) throw error;

      toast.success({
        title: "تمت إضافة جهة الاتصال",
        description: "تمت إضافة المستخدم إلى جهات اتصالك بنجاح",
      });

      // Refresh contacts
      fetchContacts();
      setIsContactSearchOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error({
        title: "خطأ في إضافة جهة الاتصال",
        description: "حدث خطأ أثناء إضافة جهة الاتصال، يرجى المحاولة مرة أخرى",
      });
    }
  };

  // Improved message rendering
  const renderMessage = (msg) => {
    const isCurrentUser = msg.sender_id === user?.id;
    
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`max-w-[80%] px-4 py-2 rounded-lg shadow-md ${
              isCurrentUser
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-bl-none'
            }`}
          >
            {msg.message_text}
          </div>
          <span className="text-xs text-white/40 mt-1 mx-1">
            {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </motion.div>
    );
  };

  // Toggle contacts visibility for mobile
  const toggleContacts = () => {
    setIsContactsVisible(prev => !prev);
  };

  return (
    <div className="flex h-full">
      {/* Contacts sidebar - now completely separate with enhanced styling */}
      <div className={`w-80 bg-gradient-to-b from-blue-950/80 to-purple-950/80 backdrop-blur-sm border-l border-white/10 overflow-hidden flex flex-col h-full transition-all duration-300 ${isContactsVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-medium text-white">جهات الاتصال</h3>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  {sortOrder === 'name' ? <Mail className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gradient-to-br from-blue-950/90 to-purple-950/90 border-blue-800/50">
                <DropdownMenuItem onClick={() => {
                  setSortOrder('name');
                  toggleSortOrder();
                }} className="flex gap-2 text-xs text-white">
                  <Mail className="h-3 w-3" />
                  <span>ترتيب حسب الاسم</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSortOrder('activity');
                  toggleSortOrder();
                }} className="flex gap-2 text-xs text-white">
                  <Clock className="h-3 w-3" />
                  <span>ترتيب حسب النشاط</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsContactSearchOpen(true)}
              className="text-white hover:bg-white/10"
              title="إضافة جهة اتصال"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col relative">
          {/* Navigation arrows for contacts */}
          <div className="absolute left-1/2 top-1 -translate-x-1/2 z-10">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={scrollContactsUp}
              className="h-6 w-6 rounded-full bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden" ref={contactsAreaRef}>
            <div className="p-2 space-y-1">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <motion.button
                    key={contact.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedContact(contact);
                      // On mobile, auto-hide contacts after selection
                      if (window.innerWidth < 768) {
                        setIsContactsVisible(false);
                      }
                    }}
                    className={`w-full flex items-center p-3 rounded-md transition-all ${
                      selectedContact?.id === contact.id
                        ? 'bg-gradient-to-r from-blue-900/60 to-blue-800/60 border border-blue-500/40 shadow-lg shadow-blue-900/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Avatar className="h-10 w-10 ml-3 ring-2 ring-offset-2 ring-offset-blue-950 ring-blue-500/30">
                      {contact.avatar_url ? (
                        <AvatarImage src={contact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
                          {contact.username[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="truncate text-right flex flex-col">
                      <div className="font-medium text-white text-sm">{contact.username}</div>
                      <div className="text-xs text-white/50">
                        {new Date(contact.lastActivity).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <User className="h-12 w-12 text-blue-500/40 mb-3" />
                  <p className="text-white/50">لا توجد جهات اتصال</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsContactSearchOpen(true)}
                    className="mt-4 text-xs border-blue-500/30 hover:bg-blue-800/30"
                  >
                    <Plus className="h-3 w-3 ml-1" />
                    إضافة جهة اتصال
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute left-1/2 bottom-1 -translate-x-1/2 z-10">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={scrollContactsDown}
              className="h-6 w-6 rounded-full bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat content - now separate from contacts with enhanced styling */}
      <Card className="flex-1 bg-gradient-to-br from-blue-950/60 to-purple-950/60 backdrop-blur-sm border-white/10 flex flex-col overflow-hidden relative">
        <CardHeader className="p-4 flex-row justify-between items-center border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between w-full">
            {/* Toggle contacts button for mobile */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleContacts}
              className="text-white hover:bg-white/10 md:hidden"
              title="عرض/إخفاء جهات الاتصال"
            >
              <User className="h-5 w-5" />
            </Button>
            
            {selectedContact ? (
              <CardTitle className="text-white flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-blue-950 ring-blue-500/30">
                  {selectedContact.avatar_url ? (
                    <AvatarImage src={selectedContact.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
                      {selectedContact.username[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>{selectedContact.username}</span>
              </CardTitle>
            ) : (
              <CardTitle className="text-white">المحادثة الخاصة</CardTitle>
            )}
            
            <div className="w-10"></div> {/* Empty space for alignment */}
          </div>
        </CardHeader>

        {selectedContact ? (
          <>
            {/* أزرار التنقل للرسائل */}
            <div className="fixed left-4 bottom-24 z-50 flex flex-col gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50"
                onClick={scrollToTop}
                title="التنقل لأول الرسائل"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50"
                onClick={scrollToBottom}
                title="التنقل لآخر الرسائل"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages area - optimized for large number of messages */}
            <ScrollArea 
              className="flex-1 p-4" 
              onScroll={(e) => {
                // أوقف التمرير التلقائي إلى الأسفل إذا مرر المستخدم لأعلى يدوياً
                const target = e.currentTarget;
                const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
                setIsAutoScroll(isScrolledNearBottom);
              }}
            >
              <div className="space-y-1 min-h-full">
                <div ref={messagesStartRef} />
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-10">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-blue-500/40 mx-auto mb-2" />
                      <p className="text-white/50">ابدأ المحادثة مع {selectedContact.username}</p>
                    </div>
                  </div>
                ) : (
                  <div className="pb-2">
                    {messages.map(renderMessage)}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="اكتب رسالة..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || isMessageSending}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <User className="h-16 w-16 text-blue-500/70 mx-auto" />
              <h3 className="text-xl font-medium text-white">اختر جهة اتصال</h3>
              <p className="text-white/50">اختر جهة اتصال من القائمة لبدء المحادثة</p>
              
              <Button 
                variant="outline" 
                onClick={() => setIsContactSearchOpen(true)}
                className="mt-4 border-blue-500/30 hover:bg-blue-800/30"
              >
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة جهة اتصال جديدة
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Contact search dialog */}
      <Dialog open={isContactSearchOpen} onOpenChange={setIsContactSearchOpen}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-purple-950 border-blue-800/50 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">إضافة جهة اتصال</DialogTitle>
            <DialogDescription className="text-white/70">
              ابحث عن مستخدم بالاسم وأضفه إلى جهات اتصالك
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="ابحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-blue-900/40 border-blue-700 text-white"
            />
            <Button 
              onClick={handleSearchUsers} 
              disabled={isSearching || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="max-h-[300px] overflow-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between bg-blue-900/30 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 ml-2">
                        {result.avatar_url ? (
                          <AvatarImage src={result.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
                            {result.username[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-white">{result.username}</span>
                    </div>
                    <Button
                      onClick={() => addContact(result.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-4 text-white/70">
                لم يتم العثور على أي نتائج
              </div>
            ) : null}
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContactSearchOpen(false)}
              className="border-blue-500/30 text-white hover:bg-blue-800/30"
            >
              <X className="h-4 w-4 ml-1" />
              <span>إغلاق</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivateChat;
