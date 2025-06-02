import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import ContactSearchDialog from './ContactSearchDialog';
import ContactsList from './ContactsList';
import ChatInterface from './ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ChatLayout = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'contacts' | 'chat'>('welcome');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);
  const [showContactsList, setShowContactsList] = useState(false);
  const [lastContact, setLastContact] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setCurrentUser(profile);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // بدء المحادثة من الشاشة الرئيسية
  const handleStartChat = () => {
    setCurrentView('contacts');
    setShowContactsList(true);
  };

  // اختيار جهة اتصال
  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    setCurrentView('chat');
    setShowContactsList(false);
  };

  // العودة للقائمة الرئيسية
  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setSelectedContact(null);
    setShowContactsList(false);
  };

  // العودة لقائمة جهات الاتصال
  const handleBackToContacts = () => {
    setCurrentView('contacts');
    setShowContactsList(true);
    setSelectedContact(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-950 to-purple-950">
      <AnimatePresence mode="wait">
        {currentView === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <WelcomeScreen
              setIsContactSearchOpen={setIsContactSearchOpen}
              lastContact={lastContact}
              setSelectedContact={handleSelectContact}
              setShowContactsList={setShowContactsList}
              onStartChat={handleStartChat}
            />
          </motion.div>
        )}

        {currentView === 'contacts' && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <ContactsList
              selectedContact={selectedContact}
              setSelectedContact={handleSelectContact}
              onBackToWelcome={handleBackToWelcome}
              currentUser={currentUser}
            />
          </motion.div>
        )}

        {currentView === 'chat' && selectedContact && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <ChatInterface
              selectedContact={selectedContact}
              onBackToContacts={handleBackToContacts}
              currentUser={currentUser}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة البحث عن جهات الاتصال */}
      {isContactSearchOpen && (
        <ContactSearchDialog
          isContactSearchOpen={isContactSearchOpen}
          setIsContactSearchOpen={setIsContactSearchOpen}
          searchQuery=""
          setSearchQuery={() => {}}
          handleSearchUsers={() => {}}
          isSearching={false}
          searchResults={[]}
          addContact={() => {}}
        />
      )}
    </div>
  );
};

export default ChatLayout;
