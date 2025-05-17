
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Plus, ChevronUp, ChevronDown, Clock, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContactCard from './ContactCard';

interface ContactsListProps {
  contacts: any[];
  selectedContact: any;
  setSelectedContact: (contact: any) => void;
  setIsContactSearchOpen: (isOpen: boolean) => void;
  sortOrder: 'name' | 'activity';
  setSortOrder: (order: 'name' | 'activity') => void;
  toggleSortOrder: () => void;
  contactsAreaRef: React.RefObject<HTMLDivElement>;
  scrollContactsUp: () => void;
  scrollContactsDown: () => void;
}

const ContactsList = ({
  contacts,
  selectedContact,
  setSelectedContact,
  setIsContactSearchOpen,
  sortOrder,
  setSortOrder,
  toggleSortOrder,
  contactsAreaRef,
  scrollContactsUp,
  scrollContactsDown,
}: ContactsListProps) => {
  const [showAllContacts, setShowAllContacts] = useState(false);

  // Get visible contacts (limited or all)
  const getVisibleContacts = () => {
    if (showAllContacts || contacts.length <= 5) {
      return contacts;
    }
    return contacts.slice(0, 5);
  };

  return (
    <div className="w-80 bg-gradient-to-b from-blue-950/90 to-purple-950/90 backdrop-blur-md border-l border-white/10 flex flex-col h-full sticky top-0 max-h-[calc(100vh-64px)] overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">جهات الاتصال</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10"
            >
              {sortOrder === 'name' ? <Mail className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gradient-to-br from-blue-950/90 to-purple-950/90 border-blue-800/50">
            <DropdownMenuItem onClick={() => {
              setSortOrder('name');
              toggleSortOrder();
            }} className="flex gap-2 text-xs text-white hover:bg-blue-800/50">
              <Mail className="h-3 w-3" />
              <span>ترتيب حسب الاسم</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSortOrder('activity');
              toggleSortOrder();
            }} className="flex gap-2 text-xs text-white hover:bg-blue-800/50">
              <Clock className="h-3 w-3" />
              <span>ترتيب حسب النشاط</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Navigation arrows for contacts */}
        <div className="absolute left-1/2 top-1 -translate-x-1/2 z-10">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={scrollContactsUp}
            className="h-6 w-6 rounded-full bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 h-full py-2 px-2">
          <div ref={contactsAreaRef} className="space-y-1">
            {contacts.length > 0 ? (
              <>
                {getVisibleContacts().map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
                
                {/* Show more/less button when contacts > 5 */}
                {contacts.length > 5 && (
                  <div className="flex justify-center mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAllContacts(!showAllContacts)}
                      className="w-full text-xs text-white/70 hover:text-white hover:bg-blue-800/30 flex items-center justify-center gap-1"
                    >
                      {showAllContacts ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" /> 
                          <span>عرض أقل</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          <span>عرض المزيد ({contacts.length - 5})</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <User className="h-12 w-12 text-blue-500/40 mb-3" />
                <p className="text-white/50">لا توجد جهات اتصال</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsContactSearchOpen(true)}
                  className="mt-4 text-xs border-blue-500/30 hover:bg-blue-800/30"
                >
                  <Plus className="h-3 w-3 ml-1" />
                  إضافة جهة اتصال
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="absolute left-1/2 bottom-1 -translate-x-1/2 z-10">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={scrollContactsDown}
            className="h-6 w-6 rounded-full bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3 border-t border-white/10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsContactSearchOpen(true)}
          className="w-full border-blue-500/30 hover:bg-blue-800/30"
        >
          <Plus className="h-4 w-4 ml-2" />
          <span>إضافة جهة اتصال</span>
        </Button>
      </div>
    </div>
  );
};

export default ContactsList;
