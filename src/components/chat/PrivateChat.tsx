
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
  Clock,
  Menu
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [sortOrder, setSortOrder] = useState<'name' | 'activity'>('activity');
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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

  // Contact navigation functions
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
            lastActivity: contactCreationTimes[profile.id] || new Date().toISOString(),
            isOnline: Math.random() > 0.5 // Simulate online status (replace with real status later)
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
        variant: "destructive"
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
      
      // After fetching messages, scroll to bottom
      setTimeout(() => {
        if (isAutoScroll) {
          scrollToBottom();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل، يرجى المحاولة مرة أخرى",
        variant: "destructive"
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
      
      // Turn on auto-scroll after sending a message
      setIsAutoScroll(true);
      
      // Add the new message to UI immediately for better UX
      const newMessage = {
        id: Date.now().toString(),
        sender_id: user.id,
        receiver_id: currentContact.id,
        message_text: message.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
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
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن المستخدمين",
        variant: "destructive"
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
        toast({
          title: "جهة الاتصال موجودة بالفعل",
          description: "لقد أضفت هذا المستخدم بالفعل إلى جهات اتصالك",
          variant: "warning"
        });
        return;
      }

      // Add contact
      const { error } = await supabase
        .from('contacts')
        .insert([{ user_id: user.id, contact_id: contactId }]);

      if (error) throw error;

      toast({
        title: "تمت إضافة جهة الاتصال",
        description: "تمت إضافة المستخدم إلى جهات اتصالك بنجاح",
        variant: "success"
      });

      // Refresh contacts
      fetchContacts();
      setIsContactSearchOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ في إضافة جهة الاتصال",
        description: "حدث خطأ أثناء إضافة جهة الاتصال، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  // Message rendering - Facebook Messenger style
  const renderMessage = (msg) => {
    const isCurrentUser = msg.sender_id === user?.id;
    
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
            {selectedContact?.avatar_url ? (
              <AvatarImage src={selectedContact.avatar_url} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
                {selectedContact?.username?.[0] || '?'}
              </AvatarFallback>
            )}
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-sm max-w-[75%] ${
              isCurrentUser
                ? 'bg-messenger-blue text-white rounded-tr-none'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white text-black rounded-tl-none'
            }`}
            style={isCurrentUser ? 
              { background: 'linear-gradient(135deg, #00B2FF 0%, #006AFF 100%)' } : 
              {} 
            }
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
        
        {isCurrentUser && (
          <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
                {user?.username?.[0] || '?'}
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </motion.div>
    );
  };

  // Contact card component (Facebook Messenger style)
  const ContactCard = ({ contact, isSelected, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-blue-600/20 border border-blue-500/40'
          : 'hover:bg-blue-900/20 border border-transparent'
      }`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 ml-3 border-2 border-slate-700/40">
          {contact.avatar_url ? (
            <AvatarImage src={contact.avatar_url} />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800 text-lg">
              {contact.username[0]}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Online status indicator */}
        <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
          contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </div>
      
      <div className="truncate text-right flex flex-col flex-1">
        <div className="font-medium text-white text-sm">{contact.username}</div>
        <div className="text-xs text-white/50 truncate max-w-[180px]">
          {new Date(contact.lastActivity).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
    </motion.button>
  );

  // Render mobile contacts as sheet
  const renderMobileContacts = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden fixed top-5 left-5 z-50 rounded-full bg-blue-600/90 shadow-lg hover:bg-blue-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-gradient-to-b from-blue-950/95 to-blue-900/95 border-slate-700 p-0 w-[280px]">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">جهات الاتصال</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-blue-800/50"
                >
                  {sortOrder === 'name' ? <Mail className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gradient-to-br from-blue-950/90 to-purple-950/90 border-blue-800/50">
                <DropdownMenuItem onClick={() => {
                  setSortOrder('name');
                  toggleSortOrder();
                }} className="flex gap-2 text-xs text-white hover:bg-blue-800/50">
                  <Mail className="h-3 w-3" />
                  <span>ترتيب حسب الاسم</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSortOrder('activity');
                  toggleSortOrder();
                }} className="flex gap-2 text-xs text-white hover:bg-blue-800/50">
                  <Clock className="h-3 w-3" />
                  <span>ترتيب حسب النشاط</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="relative flex-1 overflow-hidden">
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
            
            <div className="flex-1 overflow-hidden p-2 space-y-1" ref={contactsAreaRef}>
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      // Close the sheet
                      document.querySelector('[data-state="open"] button[data-radix-collection-item]')?.click();
                    }}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <User className="h-12 w-12 text-blue-500/40 mb-3" />
                  <p className="text-white/50">لا توجد جهات اتصال</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsContactSearchOpen(true);
                      // Close the sheet
                      document.querySelector('[data-state="open"] button[data-radix-collection-item]')?.click();
                    }}
                    className="mt-4 text-xs border-blue-500/30 hover:bg-blue-800/30"
                  >
                    <Plus className="h-3 w-3 ml-1" />
                    إضافة جهة اتصال
                  </Button>
                </div>
              )}
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
          
          <div className="p-4 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              className="w-full border-blue-500/30 hover:bg-blue-900/30"
              onClick={() => {
                setIsContactSearchOpen(true);
                // Close the sheet
                document.querySelector('[data-state="open"] button[data-radix-collection-item]')?.click();
              }}
            >
              <UserPlus className="h-4 w-4 ml-2" />
              <span>إضافة جهة اتصال</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex h-full">
      {/* Mobile contacts sheet */}
      {isMobile && renderMobileContacts()}
      
      {/* Desktop contacts sidebar */}
      {!isMobile && (
        <div className="w-80 bg-gradient-to-b from-blue-950/90 to-purple-950/90 backdrop-blur-md border-l border-white/10 flex flex-col h-full">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">جهات الاتصال</h3>
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
                }} className="flex gap-2 text-xs text-white hover:bg-blue-800/50">
                  <Mail className="h-3 w-3" />
                  <span>ترتيب حسب الاسم</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSortOrder('activity');
                  toggleSortOrder();
                }} className="flex gap-2 text-xs text-white hover:bg-blue-800/50">
                  <Clock className="h-3 w-3" />
                  <span>ترتيب حسب النشاط</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            
            <div className="flex-1 overflow-hidden py-2 px-2" ref={contactsAreaRef}>
              <div className="space-y-1">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      isSelected={selectedContact?.id === contact.id}
                      onClick={() => setSelectedContact(contact)}
                    />
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
          
          <div className="p-3 border-t border-white/10">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsContactSearchOpen(true)}
              className="w-full border-blue-500/30 hover:bg-blue-800/30"
            >
              <UserPlus className="h-4 w-4 ml-2" />
              <span>إضافة جهة اتصال</span>
            </Button>
          </div>
        </div>
      )}

      {/* Chat content */}
      <div className="flex-1 bg-gradient-to-br from-blue-950/60 to-purple-950/60 backdrop-blur-md flex flex-col overflow-hidden relative">
        {selectedContact ? (
          <>
            {/* Chat header - Facebook Messenger style */}
            <div className="p-3 border-b border-white/10 bg-blue-900/30 flex items-center justify-between shadow-md">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3 border-2 border-blue-500/30">
                  {selectedContact.avatar_url ? (
                    <AvatarImage src={selectedContact.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
                      {selectedContact.username[0]}
                    </AvatarFallback>
                  )}
                  {selectedContact.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900" />
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{selectedContact.username}</h3>
                  <p className="text-xs text-blue-300">{selectedContact.isOnline ? 'متصل الآن' : 'غير متصل'}</p>
                </div>
              </div>
            </div>

            {/* Navigation arrows for messages */}
            <div className="fixed left-4 bottom-24 z-10 flex flex-col gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50 h-8 w-8"
                onClick={scrollToTop}
                title="التنقل لأول الرسائل"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-blue-900/40 border-blue-500/30 hover:bg-blue-800/50 h-8 w-8"
                onClick={scrollToBottom}
                title="التنقل لآخر الرسائل"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages area - Facebook Messenger style */}
            <ScrollArea 
              className="flex-1 px-4 py-6 overflow-y-auto" 
              onScroll={(e) => {
                const target = e.currentTarget;
                const isScrolledNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
                setIsAutoScroll(isScrolledNearBottom);
              }}
            >
              <div className="space-y-2 min-h-full">
                <div ref={messagesStartRef} />
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-10">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-blue-500/40 mx-auto mb-2" />
                      <p className="text-white/50">ابدأ المحادثة مع {selectedContact.username}</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map(renderMessage)}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input - Facebook Messenger style */}
            <div className="p-3 border-t border-white/10 bg-blue-900/30">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  placeholder="اكتب رسالة..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-blue-800/20 border-blue-700/30 text-white rounded-full px-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || isMessageSending}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 flex items-center justify-center shadow-md"
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
      </div>

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchUsers();
                }
              }}
            />
            <Button 
              onClick={handleSearchUsers} 
              disabled={isSearching || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="max-h-[300px]">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between bg-blue-900/30 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 ml-2">
                        {result.avatar_url ? (
                          <AvatarImage src={result.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
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
