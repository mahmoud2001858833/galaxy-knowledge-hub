
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  setIsContactSearchOpen: (isOpen: boolean) => void;
  lastContact: any;
  setSelectedContact: (contact: any) => void;
  setShowContactsList: (show: boolean) => void;
  onStartChat: () => void;
}

const WelcomeScreen = ({ 
  setIsContactSearchOpen, 
  lastContact, 
  setSelectedContact, 
  setShowContactsList,
  onStartChat 
}: WelcomeScreenProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-950 to-teal-900 rounded-lg overflow-hidden chat-background relative min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* زر إضافة جهة اتصال في الزاوية العلوية اليمنى */}
      <motion.div
        className="absolute top-6 right-6 z-10"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsContactSearchOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3 rounded-full shadow-xl border border-emerald-400/30 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <motion.div 
        className="bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border-emerald-500/30 shadow-glow-emerald rounded-xl overflow-hidden w-full max-w-2xl"
        variants={itemVariants}
      >
        <div className="p-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 mb-8"
            variants={itemVariants}
          >
            مرحبًا في المحادثات الخاصة
          </motion.h1>
          
          <motion.p 
            className="text-emerald-300 text-lg mb-12"
            variants={itemVariants}
          >
            تواصل مع جهات اتصالك بسهولة عبر محادثات خاصة وآمنة
          </motion.p>

          {/* زر البدء الرئيسي - الوحيد */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-12"
          >
            <Button
              onClick={onStartChat}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-16 py-8 text-2xl font-bold rounded-2xl shadow-2xl border border-emerald-400/30 transform transition-all duration-300"
            >
              <MessageSquare className="w-8 h-8 mr-4" />
              تفضل بالدخول للمحادثة
            </Button>
          </motion.div>

          {/* آخر جهة اتصال */}
          {lastContact && (
            <motion.div 
              className="bg-emerald-900/30 backdrop-blur-sm rounded-lg p-6 mt-8 border border-emerald-500/30 shadow-glow-sm"
              variants={itemVariants}
              whileHover={{ boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)" }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">آخر محادثة</h3>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 ml-4 border-2 border-emerald-500/40 shadow-glow-sm">
                  {lastContact.avatar_url ? (
                    <AvatarImage src={lastContact.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-emerald-600 to-teal-800 text-lg">
                      {lastContact.username ? lastContact.username[0].toUpperCase() : '؟'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-white text-lg">{lastContact.username}</p>
                  <p className="text-sm text-emerald-300">{lastContact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelectedContact(lastContact)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md"
              >
                <MessageSquare className="h-4 w-4 ml-2" />
                متابعة المحادثة
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
