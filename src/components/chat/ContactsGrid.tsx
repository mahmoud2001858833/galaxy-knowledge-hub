
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserPlus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactsGridProps {
  contacts: any[];
  onSelectContact: (contact: any) => void;
  onAddContact: () => void;
  onBack: () => void;
}

const ContactsGrid = ({ contacts, onSelectContact, onAddContact, onBack }: ContactsGridProps) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
        >
          <MessageSquare className="h-4 w-4 ml-2" />
          <span>العودة للمحادثات</span>
        </Button>
        <h2 className="text-xl font-bold text-white">جهات الاتصال</h2>
        <Button 
          variant="outline"
          onClick={onAddContact}
          className="bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/50"
        >
          <UserPlus className="h-4 w-4 ml-2" />
          <span>إضافة جهة</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
        {contacts.length > 0 ? (
          contacts.map(contact => (
            <motion.div
              key={contact.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 hover:from-blue-900/30 hover:to-purple-900/30 border border-blue-500/20 hover:border-blue-500/40 rounded-lg overflow-hidden shadow cursor-pointer transition-all"
              onClick={() => onSelectContact(contact)}
            >
              <div className="p-4 flex items-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 ml-4 border-2 border-slate-700/40">
                    {contact.avatar_url ? (
                      <AvatarImage src={contact.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800 text-lg">
                        {contact.username[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {/* مؤشر حالة الاتصال */}
                  <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-900 ${
                    contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{contact.username}</h3>
                  <p className="text-xs text-blue-300">{contact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                </div>
              </div>
              <div className="bg-blue-900/30 p-2 flex justify-center">
                <span className="text-sm text-blue-300">انقر للمحادثة</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center bg-blue-900/20 rounded-lg p-10">
            <Users className="h-16 w-16 text-blue-500/40 mb-4" />
            <p className="text-white text-lg mb-2">لا توجد جهات اتصال</p>
            <p className="text-blue-300/80 mb-6 text-center">لم تقم بإضافة أي جهات اتصال بعد</p>
            <Button 
              onClick={onAddContact}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 ml-2" />
              <span>إضافة جهة اتصال</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsGrid;
