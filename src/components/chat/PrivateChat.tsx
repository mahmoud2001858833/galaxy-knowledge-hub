
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useContacts } from './hooks/useContacts';
import { useMessages } from './hooks/useMessages';
import { useSearch } from './hooks/useSearch';
import ContactsList from './ContactsList';
import ChatInterface from './ChatInterface';
import ContactSearchDialog from './ContactSearchDialog';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PrivateChat = ({ user }) => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const contactsAreaRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { 
    contacts,
    sortOrder, 
    setSortOrder, 
    toggleSortOrder, 
    fetchContacts,
    addContact
  } = useContacts(user?.id);
  
  const {
    messages,
    message,
    setMessage,
    sendMessage,
    fetchMessages,
    isMessageSending
  } = useMessages(user?.id, selectedContact);
  
  const {
    isContactSearchOpen,
    setIsContactSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearchUsers,
    isSearching
  } = useSearch(user?.id);

  // Enhanced mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
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
        fetchMessages();
        
        if (isAutoScroll) {
          setTimeout(scrollToBottom, 100);
        }
      }
    }
  });

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (isAutoScroll && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isAutoScroll]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshMessages = () => {
      if (user && selectedContact) {
        fetchMessages();
      }
      fetchContacts();
    };

    document.addEventListener('refresh-messages', handleRefreshMessages);

    return () => {
      document.removeEventListener('refresh-messages', handleRefreshMessages);
    };
  }, [user, selectedContact, fetchMessages, fetchContacts]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const scrollToTop = () => {
    if (messagesStartRef.current) {
      messagesStartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollContactsUp = () => {
    if (contactsAreaRef.current) {
      contactsAreaRef.current.scrollBy({
        top: isMobile ? -300 : -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollContactsDown = () => {
    if (contactsAreaRef.current) {
      contactsAreaRef.current.scrollBy({
        top: isMobile ? 300 : 200,
        behavior: 'smooth'
      });
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isMessageSending) return;
    
    sendMessage(message);
    setIsAutoScroll(true);
    
    setTimeout(scrollToBottom, 100);
  };

  // Welcome screen with elegant enter button
  if (!selectedContact) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-6">
        <Card className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border-indigo-500/30 shadow-2xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">المحادثات الخاصة</h2>
              <p className="text-indigo-300/80">ابدأ محادثة خاصة مع أصدقائك</p>
            </div>
            
            <Button
              onClick={() => setIsContactSearchOpen(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              الدخول والبحث عن جهات الاتصال
            </Button>
          </CardContent>
        </Card>
        
        <ContactSearchDialog 
          isContactSearchOpen={isContactSearchOpen}
          setIsContactSearchOpen={setIsContactSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchUsers={handleSearchUsers}
          isSearching={isSearching}
          searchResults={searchResults}
          addContact={addContact}
        />
      </div>
    );
  }

  const handleBackToWelcome = () => {
    setSelectedContact(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-gray-900/90 to-slate-900/90">
      {/* Contacts sidebar - separate and elegant */}
      <div className="w-80 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-r border-slate-700/50 flex flex-col">
        {/* Contacts header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              جهات الاتصال
            </h3>
            <Button
              onClick={() => setIsContactSearchOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contacts list */}
        <ContactsList 
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          onBackToWelcome={handleBackToWelcome}
          currentUser={user}
        />
      </div>

      <Separator orientation="vertical" className="h-full bg-slate-700/50" />

      {/* Chat area - separate and focused */}
      <div className="flex-1 h-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-900/50 to-gray-900/50">
        <ChatInterface 
          selectedContact={selectedContact}
          messages={messages}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          isMessageSending={isMessageSending}
          messagesEndRef={messagesEndRef}
          messagesStartRef={messagesStartRef}
          scrollToBottom={scrollToBottom}
          scrollToTop={scrollToTop}
          isAutoScroll={isAutoScroll}
          setIsAutoScroll={setIsAutoScroll}
          user={user}
        />
      </div>

      {/* Contact search dialog */}
      <ContactSearchDialog 
        isContactSearchOpen={isContactSearchOpen}
        setIsContactSearchOpen={setIsContactSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchUsers={handleSearchUsers}
        isSearching={isSearching}
        searchResults={searchResults}
        addContact={addContact}
      />
    </div>
  );
};

export default PrivateChat;
