
import React from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface ContactSearchDialogProps {
  isContactSearchOpen: boolean;
  setIsContactSearchOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchUsers: () => void;
  isSearching: boolean;
  searchResults: any[];
  addContact: (contactId: string) => void;
}

const ContactSearchDialog = ({
  isContactSearchOpen,
  setIsContactSearchOpen,
  searchQuery,
  setSearchQuery,
  handleSearchUsers,
  isSearching,
  searchResults,
  addContact
}: ContactSearchDialogProps) => {
  return (
    <Dialog open={isContactSearchOpen} onOpenChange={setIsContactSearchOpen}>
      <DialogContent className="bg-gradient-to-br from-indigo-950 to-violet-950 border-indigo-800/50 max-w-md shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">إضافة جهة اتصال</DialogTitle>
          <DialogDescription className="text-white/70">
            ابحث عن مستخدم بالاسم وأضفه إلى جهات اتصالك
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="ابحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-indigo-900/40 border-indigo-700 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchUsers();
              }
            }}
          />
          <Button 
            onClick={handleSearchUsers} 
            disabled={isSearching || !searchQuery.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[300px]">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between bg-indigo-900/30 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 ml-2">
                      {result.avatar_url ? (
                        <AvatarImage src={result.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-indigo-800">
                          {result.username[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-white">{result.username}</span>
                  </div>
                  <Button
                    onClick={() => addContact(result.id)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-4 text-white/70">
              لم يتم العثور على أي نتائج
            </div>
          ) : null}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsContactSearchOpen(false)}
            className="border-indigo-500/30 text-white hover:bg-indigo-800/30"
          >
            <X className="h-4 w-4 ml-1" />
            <span>إغلاق</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSearchDialog;
