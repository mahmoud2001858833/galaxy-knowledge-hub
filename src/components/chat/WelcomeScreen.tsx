
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  setIsContactSearchOpen: (isOpen: boolean) => void;
  lastContact: any;
  setSelectedContact: (contact: any) => void;
  setShowContactsList?: (show: boolean) => void;
}

const WelcomeScreen = ({ setIsContactSearchOpen, lastContact, setSelectedContact, setShowContactsList }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20 shadow-lg overflow-hidden w-full max-w-3xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">المحادثات الخاصة</h2>
                <p className="text-blue-300 mb-4">تواصل مع جهات اتصالك بسهولة عبر محادثات خاصة وآمنة</p>
              </div>
              
              {lastContact && (
                <div className="bg-blue-900/30 rounded-lg p-5 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3">آخر جهة اتصال</h3>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 ml-4">
                      {lastContact.avatar_url ? (
                        <AvatarImage src={lastContact.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-800">
                          {lastContact.username[0]}
                        </AvatarFallback>
                      )}
                      {lastContact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900" />
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{lastContact.username}</p>
                      <p className="text-xs text-blue-300">{lastContact.isOnline ? "متصل الآن" : "غير متصل"}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedContact(lastContact)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                  >
                    بدء المحادثة
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-1 gap-6 w-full">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-900/20 hover:bg-blue-800/40 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-blue-500/30"
                  onClick={() => setShowContactsList?.(true)}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-800/50 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">اختيار جهات الاتصال</h3>
                  <p className="text-blue-300/80 text-center mt-3 text-sm">عرض قائمة جهات الاتصال لبدء محادثة خاصة</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-900/20 hover:bg-blue-800/40 transition-all rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-blue-500/30"
                  onClick={() => setIsContactSearchOpen(true)}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-800/50 flex items-center justify-center mb-4">
                    <UserPlus className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">إضافة جهة اتصال</h3>
                  <p className="text-blue-300/80 text-center mt-3 text-sm">إضافة جهة اتصال جديدة للتواصل معها</p>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
