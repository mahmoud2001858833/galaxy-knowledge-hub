
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, UserPlus, Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ContactSearchDialog from './ContactSearchDialog';

interface ContactsListProps {
  selectedContact: any;
  setSelectedContact: (contact: any) => void;
  onBackToWelcome: () => void;
  currentUser: any;
}

const ContactsList = ({ selectedContact, setSelectedContact, onBackToWelcome, currentUser }: ContactsListProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // استعلام مبسط لجلب جهات الاتصال
      const { data: contactsData, error } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (contactsData && contactsData.length > 0) {
        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // جلب معلومات المستخدمين
        const { data: profilesData, error: profilesError } = await supabase
          .from('users_profiles')
          .select('id, username, avatar_url')
          .in('id', contactIds);

        if (profilesError) throw profilesError;

        const formattedContacts = profilesData?.map(profile => ({
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          isOnline: Math.random() > 0.5 // محاكاة حالة الاتصال
        })) || [];

        setContacts(formattedContacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (contactId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { error } = await supabase
        .from('contacts')
        .insert([{ user_id: session.user.id, contact_id: contactId }]);

      if (error) throw error;

      loadContacts();
      return true;
    } catch (error) {
      console.error('Error adding contact:', error);
      return false;
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-950 to-teal-900">
      {/* الرأس */}
      <div className="bg-gradient-to-r from-emerald-800/50 to-teal-800/50 backdrop-blur-sm border-b border-emerald-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBackToWelcome}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            العودة
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">جهات الاتصال</h2>
            {currentUser && (
              <p className="text-emerald-300 text-sm">
                <User className="w-4 h-4 inline mr-1" />
                {currentUser.username}
              </p>
            )}
          </div>
          
          <Button
            onClick={() => setIsContactSearchOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            إضافة
          </Button>
        </div>

        {/* شريط البحث */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث عن جهات الاتصال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-emerald-900/30 border-emerald-500/50 text-white placeholder-emerald-300"
          />
        </div>
      </div>

      {/* قائمة جهات الاتصال */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-emerald-300">جاري التحميل...</div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="w-16 h-16 text-emerald-400/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد جهات اتصال</h3>
            <p className="text-emerald-300 mb-6">ابدأ بإضافة جهات اتصال جديدة للمحادثة</p>
            <Button
              onClick={() => setIsContactSearchOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              إضافة جهة اتصال
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedContact?.id === contact.id
                    ? 'bg-emerald-600/50 border border-emerald-400/50'
                    : 'bg-emerald-900/20 hover:bg-emerald-800/30 border border-emerald-500/20 hover:border-emerald-400/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-emerald-500/40">
                      {contact.avatar_url ? (
                        <AvatarImage src={contact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-emerald-600 text-white">
                          {contact.username?.[0]?.toUpperCase() || '؟'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{contact.username}</h3>
                    <p className="text-sm text-emerald-300">
                      {contact.isOnline ? 'متصل الآن' : 'غير متصل'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة البحث */}
      {isContactSearchOpen && (
        <ContactSearchDialog
          isContactSearchOpen={isContactSearchOpen}
          setIsContactSearchOpen={setIsContactSearchOpen}
          searchQuery=""
          setSearchQuery={() => {}}
          handleSearchUsers={() => {}}
          isSearching={false}
          searchResults={[]}
          addContact={addContact}
        />
      )}
    </div>
  );
};

export default ContactsList;
