
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, MessageSquare, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  setIsContactSearchOpen: (isOpen: boolean) => void;
  lastContact: any;
  setSelectedContact: (contact: any) => void;
  setShowContactsList: (show: boolean) => void;
}

const WelcomeScreen = ({ 
  setIsContactSearchOpen, 
  lastContact, 
  setSelectedContact, 
  setShowContactsList 
}: WelcomeScreenProps) => {
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
      className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-emerald-950 to-teal-900 rounded-lg overflow-hidden chat-background relative"
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

      <motion.div 
        className="bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border-emerald-500/30 shadow-glow-emerald rounded-xl overflow-hidden w-full max-w-5xl"
        variants={itemVariants}
      >
        <div className="p-8">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 text-center mb-8"
            variants={itemVariants}
          >
            مرحبًا بك في المحادثات الخاصة
          </motion.h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات المحادثة */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 mb-3">المحادثات الخاصة</h2>
                <p className="text-emerald-300 mb-4">تواصل مع جهات اتصالك بسهولة عبر محادثات خاصة وآمنة</p>
              </div>
              
              {lastContact && (
                <motion.div 
                  className="bg-emerald-900/30 backdrop-blur-sm rounded-lg p-6 mb-4 border border-emerald-500/30 shadow-glow-sm"
                  variants={itemVariants}
                  whileHover={{ boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)" }}
                >
                  <h3 className="text-xl font-semibold text-white mb-4">آخر جهة اتصال</h3>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 ml-4 border-2 border-emerald-500/40 shadow-glow-sm">
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
                    بدء المحادثة
                  </Button>
                </motion.div>
              )}
            </motion.div>
            
            {/* خيارات الاتصال الرئيسية */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <div className="grid grid-cols-1 gap-6 w-full">
                {/* خيار اختيار جهات الاتصال - مُحسن وأكثر بروزاً */}
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-emerald-800/50 to-teal-800/30 hover:from-emerald-700/60 hover:to-teal-700/40 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer border-2 border-emerald-500/40 hover:border-emerald-400/60 shadow-lg"
                  onClick={() => setShowContactsList(true)}
                  variants={itemVariants}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/60 flex items-center justify-center mb-5 shadow-glow-emerald">
                    <Users className="h-12 w-12 text-emerald-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">اختيار جهات الاتصال</h3>
                  <p className="text-emerald-200/80 text-center text-base">عرض جميع جهات الاتصال وبدء محادثة فورية</p>
                  <div className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                    انقر للاختيار
                  </div>
                </motion.div>
                
                {/* خيار إضافة جهة اتصال جديدة */}
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(20, 184, 166, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-teal-800/40 to-emerald-800/30 hover:from-teal-700/50 hover:to-emerald-700/40 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer border border-teal-500/30 hover:border-teal-500/50 shadow-md"
                  onClick={() => setIsContactSearchOpen(true)}
                  variants={itemVariants}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600/80 to-emerald-600/60 flex items-center justify-center mb-4 shadow-glow-sm">
                    <UserPlus className="h-8 w-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">إضافة جهة اتصال جديدة</h3>
                  <p className="text-teal-200/80 text-center text-sm">البحث عن مستخدمين وإضافتهم لقائمة جهات الاتصال</p>
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
