
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Clock, Mail, UserPlus, ChevronUp, ChevronDown, User, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContactCard from './ContactCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileContactsListProps {
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

const MobileContactsList = ({ 
  contacts,
  selectedContact,
  setSelectedContact,
  setIsContactSearchOpen,
  sortOrder,
  setSortOrder,
  toggleSortOrder,
  contactsAreaRef,
  scrollContactsUp,
  scrollContactsDown
}: MobileContactsListProps) => {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "icon"}
          className={`md:hidden fixed top-5 left-5 z-50 rounded-full bg-blue-600/90 shadow-lg hover:bg-blue-700 ${isMobile ? 'p-2' : ''}`}
        >
          <Menu className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={`bg-gradient-to-b from-blue-950/95 to-blue-900/95 border-slate-700 p-0 ${isMobile ? 'w-[90vw] max-w-[320px]' : 'w-[280px]'}`}>
        <div className="flex flex-col h-full">
          <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-slate-700/50 flex justify-between items-center`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-white`}>جهات الاتصال</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "icon"}
                  className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} text-white hover:bg-blue-800`}
                >
                  {sortOrder === 'name' ? <Mail className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} /> : <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />}
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
          
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute left-1/2 top-1 -translate-x-1/2 z-10">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={scrollContactsUp}
                className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} rounded-full bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50`}
              >
                <ChevronUp className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </Button>
            </div>
            
            <div className={`flex-1 overflow-hidden ${isMobile ? 'p-1 space-y-1' : 'p-2 space-y-1'}`} ref={contactsAreaRef}>
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      // Close the sheet
                      const sheetCloseButton = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLButtonElement | null;
                      if (sheetCloseButton) sheetCloseButton.click();
                    }}
                  />
                ))
              ) : (
                <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-8' : 'py-10'}`}>
                  <User className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-blue-500/40 mb-3`} />
                  <p className={`text-white/50 ${isMobile ? 'text-sm' : ''}`}>لا توجد جهات اتصال</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsContactSearchOpen(true);
                      // Close the sheet
                      const sheetCloseButton = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLButtonElement | null;
                      if (sheetCloseButton) sheetCloseButton.click();
                    }}
                    className={`mt-4 ${isMobile ? 'text-xs' : 'text-xs'} border-blue-500/30 hover:bg-blue-800/30`}
                  >
                    <Plus className={`${isMobile ? 'h-3 w-3 ml-1' : 'h-3 w-3 ml-1'}`} />
                    إضافة جهة اتصال
                  </Button>
                </div>
              )}
            </div>
            
            <div className="absolute left-1/2 bottom-1 -translate-x-1/2 z-10">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={scrollContactsDown}
                className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} rounded-full bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50`}
              >
                <ChevronDown className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </Button>
            </div>
          </div>
          
          <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-slate-700/50`}>
            <Button 
              variant="outline" 
              className="w-full border-blue-500/30 hover:bg-blue-900/30"
              size={isMobile ? "sm" : "default"}
              onClick={() => {
                setIsContactSearchOpen(true);
                // Close the sheet
                const sheetCloseButton = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLButtonElement | null;
                if (sheetCloseButton) sheetCloseButton.click();
              }}
            >
              <UserPlus className={`${isMobile ? 'h-3 w-3 ml-1' : 'h-4 w-4 ml-2'}`} />
              <span className={`${isMobile ? 'text-sm' : ''}`}>إضافة جهة اتصال</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileContactsList;
