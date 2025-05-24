
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Clock, Mail, UserPlus, ChevronUp, ChevronDown, User, Plus, ArrowLeft, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContactCard from './ContactCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

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
          size="sm"
          className="md:hidden fixed top-4 left-4 z-50 rounded-full bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md shadow-xl hover:from-blue-700 hover:to-purple-700 border border-white/20 p-3 min-w-[48px] min-h-[48px]"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="bg-gradient-to-b from-blue-950/98 to-purple-950/98 border-slate-700 p-0 w-[95vw] max-w-none backdrop-blur-xl"
      >
        <div className="flex flex-col h-full">
          {/* Header with improved mobile design */}
          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">جهات الاتصال</h3>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsContactSearchOpen(true)}
                  className="bg-blue-800/30 hover:bg-blue-700/40 text-white border border-blue-500/30 px-3 py-2"
                >
                  <Search className="h-4 w-4 ml-1" />
                  بحث
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-blue-800/30 hover:bg-blue-700/40 text-white border border-blue-500/30 px-3 py-2"
                    >
                      {sortOrder === 'name' ? <Mail className="h-4 w-4 ml-1" /> : <Clock className="h-4 w-4 ml-1" />}
                      ترتيب
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gradient-to-br from-blue-950/95 to-purple-950/95 border-blue-800/50 backdrop-blur-md">
                    <DropdownMenuItem onClick={() => {
                      setSortOrder('name');
                      toggleSortOrder();
                    }} className="flex gap-2 text-white hover:bg-blue-800/50 px-4 py-3">
                      <Mail className="h-4 w-4" />
                      <span>ترتيب حسب الاسم</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSortOrder('activity');
                      toggleSortOrder();
                    }} className="flex gap-2 text-white hover:bg-blue-800/50 px-4 py-3">
                      <Clock className="h-4 w-4" />
                      <span>ترتيب حسب النشاط</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Navigation buttons for contacts - larger for mobile */}
            <div className="flex justify-center gap-4">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={scrollContactsUp}
                className="bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50 px-4 py-2 text-white"
              >
                <ChevronUp className="h-5 w-5 ml-1" />
                للأعلى
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={scrollContactsDown}
                className="bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/50 px-4 py-2 text-white"
              >
                <ChevronDown className="h-5 w-5 ml-1" />
                للأسفل
              </Button>
            </div>
          </div>
          
          {/* Contacts list with improved mobile scrolling */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3" ref={contactsAreaRef}>
                {contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ContactCard
                        contact={contact}
                        isSelected={selectedContact?.id === contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          // Close the sheet after selection
                          const sheetCloseButton = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLButtonElement | null;
                          if (sheetCloseButton) sheetCloseButton.click();
                        }}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <User className="h-16 w-16 text-blue-500/40 mb-4" />
                    <p className="text-white/70 text-lg mb-2">لا توجد جهات اتصال</p>
                    <p className="text-white/50 text-sm mb-6">ابدأ بإضافة أول جهة اتصال</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsContactSearchOpen(true);
                        const sheetCloseButton = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLButtonElement | null;
                        if (sheetCloseButton) sheetCloseButton.click();
                      }}
                      className="border-blue-500/30 hover:bg-blue-800/30 text-white px-6 py-3"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة جهة اتصال
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Footer with add contact button */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md">
            <Button 
              variant="outline" 
              className="w-full border-blue-500/30 hover:bg-blue-900/30 text-white py-3 text-lg font-medium"
              onClick={() => {
                setIsContactSearchOpen(true);
                const sheetCloseButton = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLButtonElement | null;
                if (sheetCloseButton) sheetCloseButton.click();
              }}
            >
              <UserPlus className="h-5 w-5 ml-2" />
              إضافة جهة اتصال جديدة
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileContactsList;
