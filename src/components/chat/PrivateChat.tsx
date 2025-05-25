
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
import ContactsGrid from './ContactsGrid';

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

  // Listen for select contact events from parent
  useEffect(() => {
    const handleSelectContact = (event: any) => {
      if (event.detail && event.detail.contactId) {
        const contact = contacts.find(c => c.id === event.detail.contactId);
        if (contact) {
          setSelectedContact(contact);
          setShowContactsList(false);
        }
      }
    };
    
    document.addEventListener('select-contact', handleSelectContact);
    
    return () => {
      document.removeEventListener('select-contact', handleSelectContact);
    };
  }, [contacts]);

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

  // Enhanced scroll functions
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

  // Enhanced contact navigation functions
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

  const getLastContact = () => {
    if (contacts.length === 0) return null;
    return contacts[0];
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setShowContactsList(false);
  };

  const handleBackToChat = () => {
    setShowContactsList(false);
  };

  // Enhanced send message function for mobile
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isMessageSending) return;
    
    // Prevent accidental contact search opening
    if (message.trim().startsWith('@')) {
      setMessage(message);
      return;
    }
    
    sendMessage(message);
    setIsAutoScroll(true);
    
    setTimeout(scrollToBottom, 100);
  };

  if (showContactsList && isMobile) {
    return (
      <div className="h-full">
        <ContactsGrid
          contacts={contacts}
          onSelectContact={handleSelectContact}
          onAddContact={() => setIsContactSearchOpen(true)}
          onBack={handleBackToChat}
        />
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full overflow-hidden ${isMobile ? 'bg-gradient-to-br from-slate-950 to-purple-950' : 'bg-gradient-to-br from-indigo-950/30 to-purple-950/30'}`}>
      {/* Enhanced mobile contacts list */}
      {isMobile && selectedContact && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowContactsList(true)}
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            👥
          </button>
        </div>
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

      {!isMobile && selectedContact && <Separator orientation="vertical" className="h-full bg-blue-500/20" />}

      {/* Enhanced chat content */}
      {selectedContact ? (
        <div className="flex-1 h-full overflow-hidden flex flex-col">
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
