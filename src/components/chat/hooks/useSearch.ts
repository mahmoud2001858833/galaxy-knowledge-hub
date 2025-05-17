
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSearch = (userId: string | null) => {
  const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search for users
  const handleSearchUsers = async () => {
    if (!searchQuery.trim() || !userId) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', userId);

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

  return {
    isContactSearchOpen,
    setIsContactSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    handleSearchUsers
  };
};
