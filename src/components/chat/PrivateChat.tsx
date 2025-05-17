import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useContacts } from './hooks/useContacts';
import { useMessages } from './hooks/useMessages';
import { useSearch } from './hooks/useSearch';
import ContactsList from './ContactsList';
import MobileContactsList from './MobileContactsList';
import ChatInterface from './ChatInterface';
import ContactSearchDialog from './ContactSearchDialog';
import WelcomeScreen from './WelcomeScreen';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, UserPlus, Users } from 'lucide-react';

const PrivateChat = ({ user }) => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showContactsList, setShowContactsList] = useState(false);
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
        fetchMessages();
      }
    }
  });

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
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
  }, [user, selectedContact]);

  // Scroll functions
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

  // Get the last contacted person for welcome screen
  const getLastContact = () => {
    if (contacts.length === 0) return null;
    return contacts[0]; // Already sorted by activity
  };

  if (showContactsList) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowContactsList(false)}
            className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
          >
            <MessageSquare className="h-4 w-4 ml-2" />
            <span>العودة للمحادثات</span>
          </Button>
          <h2 className="text-xl font-bold text-white">جهات الاتصال</h2>
          <Button 
            variant="outline"
            onClick={() => setIsContactSearchOpen(true)}
            className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
          >
            <UserPlus className="h-4 w-4 ml-2" />
            <span>إضافة جهة</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <motion.div
                key={contact.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 hover:from-blue-900/30 hover:to-purple-900/30 border border-blue-500/20 hover:border-blue-500/40 rounded-lg overflow-hidden shadow cursor-pointer transition-all"
                onClick={() => {
                  setSelectedContact(contact);
                  setShowContactsList(false);
                }}
              >
                <div className="p-4 flex items-center">
                  <div className="relative">
                    <Avatar className="h-16 w-16 ml-4 border-2 border-slate-700/40">
                      {contact.avatar_url ? (
                        <AvatarImage src={contact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800 text-lg">
                          {contact.username[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {/* مؤشر حالة الاتصال */}
                    <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-900 ${
                      contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{contact.username}</h3>
                    <p className="text-xs text-blue-300">{contact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                  </div>
                </div>
                <div className="bg-blue-900/30 p-2 flex justify-center">
                  <span className="text-sm text-blue-300">انقر للمحادثة</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center bg-blue-900/20 rounded-lg p-10">
              <Users className="h-16 w-16 text-blue-500/40 mb-4" />
              <p className="text-white text-lg mb-2">لا توجد جهات اتصال</p>
              <p className="text-blue-300/80 mb-6 text-center">لم تقم بإضافة أي جهات اتصال بعد</p>
              <Button 
                onClick={() => setIsContactSearchOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 ml-2" />
                <span>إضافة جهة اتصال</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Mobile contacts list */}
      {isMobile && (
        <MobileContactsList 
          contacts={contacts}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          setIsContactSearchOpen={setIsContactSearchOpen}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          toggleSortOrder={toggleSortOrder}
          contactsAreaRef={contactsAreaRef}
          scrollContactsUp={scrollContactsUp}
          scrollContactsDown={scrollContactsDown}
        />
      )}
      
      {/* Desktop contacts sidebar */}
      {!isMobile && selectedContact && (
        <ContactsList 
          contacts={contacts}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          setIsContactSearchOpen={setIsContactSearchOpen}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          toggleSortOrder={toggleSortOrder}
          contactsAreaRef={contactsAreaRef}
          scrollContactsUp={scrollContactsUp}
          scrollContactsDown={scrollContactsDown}
        />
      )}

      {/* Vertical separator between contacts and chat */}
      {!isMobile && selectedContact && <Separator orientation="vertical" className="h-full bg-blue-500/20" />}

      {/* Chat content */}
      {selectedContact ? (
        <ChatInterface 
          selectedContact={selectedContact}
          messages={messages}
          message={message}
          setMessage={setMessage}
          handleSendMessage={sendMessage}
          isMessageSending={isMessageSending}
          messagesEndRef={messagesEndRef}
          messagesStartRef={messagesStartRef}
          scrollToBottom={scrollToBottom}
          scrollToTop={scrollToTop}
          isAutoScroll={isAutoScroll}
          setIsAutoScroll={setIsAutoScroll}
          user={user}
        />
      ) : (
        <WelcomeScreen 
          setIsContactSearchOpen={setIsContactSearchOpen}
          lastContact={getLastContact()}
          setSelectedContact={setSelectedContact}
          setShowContactsList={setShowContactsList}
        />
      )}

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
