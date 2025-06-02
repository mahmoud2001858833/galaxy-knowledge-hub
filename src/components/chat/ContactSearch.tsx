
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
}

const ContactSearch = ({ isOpen, onClose, onContactAdded }: ContactSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

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

  const addContact = async (contactId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('contacts')
        .insert([{ user_id: session.user.id, contact_id: contactId }]);

      if (error) throw error;

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة جهة الاتصال بنجاح",
      });

      onContactAdded();
      onClose();
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-950 to-slate-950 border-purple-800/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">البحث عن جهات اتصال</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ابحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-purple-900/40 border-purple-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-purple-900/30 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.username[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-white">{user.username}</span>
                </div>
                <Button
                  onClick={() => addContact(user.id)}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <div className="text-center py-4 text-white/70">
              لم يتم العثور على نتائج
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSearch;
