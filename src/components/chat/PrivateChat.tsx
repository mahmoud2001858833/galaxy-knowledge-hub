
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

  // Handlers for the contacts grid
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setShowContactsList(false);
  };

  const handleBackToChat = () => {
    setShowContactsList(false);
  };

  if (showContactsList) {
    return (
      <ContactsGrid
        contacts={contacts}
        onSelectContact={handleSelectContact}
        onAddContact={() => setIsContactSearchOpen(true)}
        onBack={handleBackToChat}
      />
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
