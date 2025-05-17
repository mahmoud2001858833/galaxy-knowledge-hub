
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useContacts = (userId: string | null) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<Record<string, any>>({});
  const [sortOrder, setSortOrder] = useState<'name' | 'activity'>('activity');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, created_at')
        .eq('user_id', userId);

      if (contactsError) throw contactsError;

      if (contactsData) {
        const contactIds = contactsData.map(contact => contact.contact_id);
        
        // Create a map of contact creation times
        const contactCreationTimes: Record<string, string> = {};
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
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle sort order
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

  // Add contact
  const addContact = async (contactId: string) => {
    try {
      if (!userId) return;
      
      // Check if contact already exists
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
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
        .insert([{ user_id: userId, contact_id: contactId }]);

      if (error) throw error;

      toast({
        title: "تمت إضافة جهة الاتصال",
        description: "تمت إضافة المستخدم إلى جهات اتصالك بنجاح",
        variant: "success"
      });

      // Refresh contacts
      fetchContacts();
      return true;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ في إضافة جهة الاتصال",
        description: "حدث خطأ أثناء إضافة جهة الاتصال، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      return false;
    }
  };

  // Effect to fetch contacts when userId changes
  useEffect(() => {
    if (userId) {
      fetchContacts();
    }
  }, [userId]);

  return {
    contacts,
    allProfiles,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    fetchContacts,
    addContact,
    isLoading
  };
};
