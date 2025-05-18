
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactsGridProps {
  contacts: any[];
  onSelectContact: (contact: any) => void;
  onAddContact: () => void;
  onBack: () => void;
}

const ContactsGrid = ({ contacts, onSelectContact, onAddContact, onBack }: ContactsGridProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full flex flex-col p-6 bg-gradient-to-br from-purple-950 to-slate-950 rounded-lg overflow-hidden chat-background"
    >
      {/* شريط العنوان */}
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-purple-900/50 backdrop-blur-md p-4 rounded-lg border border-purple-500/30">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة للمحادثات</span>
        </Button>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-300">جهات الاتصال</h2>
        <Button 
          variant="outline"
          onClick={onAddContact}
          className="bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
        >
          <UserPlus className="h-4 w-4 ml-2" />
          <span>إضافة جهة</span>
        </Button>
      </div>
      
      {/* شبكة جهات الاتصال */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-auto pb-4 fade-in">
        {contacts.length > 0 ? (
          contacts.map(contact => (
            <motion.div
              key={contact.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/20 hover:from-purple-800/40 hover:to-purple-800/30 border border-purple-500/30 hover:border-purple-400/50 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all"
              onClick={() => onSelectContact(contact)}
            >
              <div className="p-5 flex flex-col items-center">
                <div className="relative mb-3">
                  <Avatar className="h-20 w-20 border-2 border-purple-600/40 shadow-glow-purple">
                    {contact.avatar_url ? (
                      <AvatarImage src={contact.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800 text-lg">
                        {contact.username ? contact.username[0].toUpperCase() : '؟'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {/* مؤشر حالة الاتصال مع تأثير نبض للمتصلين */}
                  <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-purple-900 ${
                    contact.isOnline 
                      ? 'bg-teal-500 animate-pulse' 
                      : 'bg-gray-400'
                  }`} />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-1">{contact.username}</h3>
                  <p className="text-sm text-teal-300">{contact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                </div>
              </div>
              <div className="bg-purple-900/40 p-3 flex justify-center border-t border-purple-500/20">
                <span className="text-sm text-purple-300 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  بدء المحادثة
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            variants={itemVariants}
            className="col-span-full flex flex-col items-center justify-center bg-purple-900/20 rounded-lg p-12 border border-purple-500/20"
          >
            <Users className="h-20 w-20 text-purple-500/40 mb-6" />
            <p className="text-white text-xl mb-3">لا توجد جهات اتصال</p>
            <p className="text-purple-300/80 mb-8 text-center">لم تقم بإضافة أي جهات اتصال بعد</p>
            <Button 
              onClick={onAddContact}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-glow-sm"
            >
              <UserPlus className="h-4 w-4 ml-2" />
              <span>إضافة جهة اتصال</span>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ContactsGrid;
