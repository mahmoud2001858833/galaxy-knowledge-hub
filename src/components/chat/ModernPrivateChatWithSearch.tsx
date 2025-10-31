import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, UserPlus, Loader2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Contact {
  id: string;
  username: string;
  avatar_url: string | null;
}

const ModernPrivateChatWithSearch = ({ user }: { user: any }) => {
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);
  const [allUsers, setAllUsers] = useState<Contact[]>([]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .neq('id', user.id);

      if (error) throw error;
      setAllUsers(data || []);
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(allUsers);
      return;
    }

    const filtered = allUsers.filter(u =>
      u.username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleAddContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: contactId
        });

      if (error) throw error;

      toast({
        title: 'تم بنجاح!',
        description: 'تم إضافة جهة الاتصال'
      });
      
      setSearchOpen(false);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setSearchOpen(true)}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        إضافة جهات اتصال جديدة
      </Button>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="bg-gradient-to-br from-purple-950 to-slate-950 border-purple-800/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center justify-between">
              البحث عن مستخدمين
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-white/50" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ابحث عن اسم المستخدم..."
                className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {searching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    لا توجد نتائج
                  </div>
                ) : (
                  searchResults.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={contact.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                            {contact.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white font-medium">{contact.username}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddContact(contact.id)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModernPrivateChatWithSearch;
