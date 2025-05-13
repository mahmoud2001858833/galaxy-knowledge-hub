
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import {
  User,
  Send,
  Search,
  UserPlus,
  X,
  Plus,
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
  const { toast } = useToast();

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
    scrollToBottom();
  }, [messages]);

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

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      if (contactsData) {
        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // Fetch user profiles for these contacts
        const { data: profilesData, error: profilesError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', contactIds);

        if (profilesError) throw profilesError;
        
        if (profilesData) {
          // Create a map of profiles for easy access
          const profilesMap: Record<string, any> = {};
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
          
          setAllProfiles(profilesMap);
          setContacts(profilesData);
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
          variant: "default"
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

  return (
    <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 flex flex-col overflow-hidden">
      <CardHeader className="p-4 flex-row justify-between items-center border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsContactSearchOpen(true)}
            className="text-white hover:bg-white/10"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
          
          {selectedContact ? (
            <CardTitle className="text-white flex items-center gap-3">
              <Avatar className="h-8 w-8">
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

      <div className="grid grid-cols-4 h-[calc(100%-64px)]">
        {/* Contacts sidebar */}
        <div className="col-span-1 border-l border-white/10 overflow-hidden flex flex-col">
          <div className="p-2 flex justify-between items-center bg-white/5">
            <span className="text-sm font-medium text-white/80 mr-2">جهات الاتصال</span>
          </div>
          <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <motion.button
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full flex items-center p-2 rounded-md transition-all ${
                        selectedContact?.id === contact.id
                          ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Avatar className="h-8 w-8 ml-2">
                        {contact.avatar_url ? (
                          <AvatarImage src={contact.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800">
                            {contact.username[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="truncate text-right">
                        <div className="font-medium text-white text-sm">{contact.username}</div>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
                    <User className="h-10 w-10 text-blue-500/40 mb-2" />
                    <p className="text-white/50 text-sm">لا توجد جهات اتصال</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsContactSearchOpen(true)}
                      className="mt-3 text-xs border-blue-500/30 hover:bg-blue-800/30"
                    >
                      <Plus className="h-3 w-3 ml-1" />
                      إضافة جهة اتصال
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Chat content */}
        <div className="col-span-3 flex flex-col h-full overflow-hidden">
          {selectedContact ? (
            <>
              {/* Messages area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-1 min-h-full">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-10">
                      <div className="text-center">
                        <User className="h-12 w-12 text-blue-500/40 mx-auto mb-2" />
                        <p className="text-white/50">ابدأ المحادثة مع {selectedContact.username}</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(renderMessage)
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
        </div>
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
    </Card>
  );
};

export default PrivateChat;
