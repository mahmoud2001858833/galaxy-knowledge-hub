
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="flex-1 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20 shadow-lg overflow-hidden w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات المحادثة */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mb-3">المحادثات الخاصة</h2>
                <p className="text-blue-300 mb-4">تواصل مع جهات اتصالك بسهولة عبر محادثات خاصة وآمنة</p>
              </div>
              
              {lastContact && (
                <motion.div 
                  className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-5 mb-4 border border-blue-500/20 shadow-xl"
                  variants={itemVariants}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">آخر جهة اتصال</h3>
                  <div className="flex items-center">
                    <Avatar className="h-14 w-14 ml-4 border-2 border-blue-500/30">
                      {lastContact.avatar_url ? (
                        <AvatarImage src={lastContact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-800 text-lg">
                          {lastContact.username ? lastContact.username[0].toUpperCase() : '؟'}
                        </AvatarFallback>
                      )}
                      {lastContact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900 animate-pulse" />
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{lastContact.username}</p>
                      <p className="text-xs text-blue-300">{lastContact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedContact(lastContact)}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
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
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-900/20 hover:bg-blue-800/40 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-blue-500/30"
                  onClick={() => setShowContactsList?.(true)}
                  variants={itemVariants}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-800/50 flex items-center justify-center mb-4 shadow-md">
                    <Users className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">اختيار جهات الاتصال</h3>
                  <p className="text-blue-300/80 text-center mt-3 text-sm">عرض قائمة جهات الاتصال لبدء محادثة خاصة</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-900/20 hover:bg-blue-800/40 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-blue-500/30"
                  onClick={() => setIsContactSearchOpen(true)}
                  variants={itemVariants}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-800/50 flex items-center justify-center mb-4 shadow-md">
                    <UserPlus className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">إضافة جهة اتصال</h3>
                  <p className="text-blue-300/80 text-center mt-3 text-sm">إضافة جهة اتصال جديدة للتواصل معها</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeScreen;
