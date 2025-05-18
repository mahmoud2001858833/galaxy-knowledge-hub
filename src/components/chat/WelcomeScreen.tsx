
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  setIsContactSearchOpen: (isOpen: boolean) => void;
  lastContact: any;
  setSelectedContact: (contact: any) => void;
  setShowContactsList?: (show: boolean) => void;
}

const WelcomeScreen = ({ setIsContactSearchOpen, lastContact, setSelectedContact, setShowContactsList }: WelcomeScreenProps) => {
  // تأثيرات الحركة للعناصر
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
      className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-purple-950 to-slate-900 rounded-lg overflow-hidden chat-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border-purple-500/30 shadow-glow-purple rounded-xl overflow-hidden w-full max-w-5xl"
        variants={itemVariants}
      >
        <div className="p-8">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-300 text-center mb-8"
            variants={itemVariants}
          >
            مرحبًا بك في غرف المحادثة
          </motion.h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات المحادثة */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-300 mb-3">المحادثات الخاصة</h2>
                <p className="text-purple-300 mb-4">تواصل مع جهات اتصالك بسهولة عبر محادثات خاصة وآمنة</p>
              </div>
              
              {lastContact && (
                <motion.div 
                  className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 mb-4 border border-purple-500/30 shadow-glow-sm"
                  variants={itemVariants}
                  whileHover={{ boxShadow: "0 0 25px rgba(147, 51, 234, 0.3)" }}
                >
                  <h3 className="text-xl font-semibold text-white mb-4">آخر جهة اتصال</h3>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 ml-4 border-2 border-purple-500/40 shadow-glow-sm">
                      {lastContact.avatar_url ? (
                        <AvatarImage src={lastContact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800 text-lg">
                          {lastContact.username ? lastContact.username[0].toUpperCase() : '؟'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-white text-lg">{lastContact.username}</p>
                      <p className="text-sm text-teal-300">{lastContact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedContact(lastContact)}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-md"
                  >
                    <MessageSquare className="h-4 w-4 ml-2" />
                    بدء المحادثة
                  </Button>
                </motion.div>
              )}
            </motion.div>
            
            {/* خيارات الاتصال */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <div className="grid grid-cols-1 gap-6 w-full">
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(147, 51, 234, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-purple-900/30 hover:bg-purple-800/40 transition-all rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer border border-purple-500/30 hover:border-purple-500/50 shadow-md"
                  onClick={() => setShowContactsList?.(true)}
                  variants={itemVariants}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-800/80 to-purple-700/50 flex items-center justify-center mb-5 shadow-glow-purple">
                    <Users className="h-12 w-12 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">اختيار جهات الاتصال</h3>
                  <p className="text-purple-300/80 text-center mt-2 text-base">عرض قائمة جهات الاتصال لبدء محادثة خاصة</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(147, 51, 234, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-purple-900/30 hover:bg-purple-800/40 transition-all rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer border border-purple-500/30 hover:border-purple-500/50 shadow-md"
                  onClick={() => setIsContactSearchOpen(true)}
                  variants={itemVariants}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-800/80 to-purple-700/50 flex items-center justify-center mb-5 shadow-glow-purple">
                    <UserPlus className="h-12 w-12 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">إضافة جهة اتصال</h3>
                  <p className="text-purple-300/80 text-center mt-2 text-base">إضافة جهة اتصال جديدة للتواصل معها</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
