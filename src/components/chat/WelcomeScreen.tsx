
import React from 'react';
import { User, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  setIsContactSearchOpen: (isOpen: boolean) => void;
  lastContact: any;
  setSelectedContact: (contact: any) => void;
}

const WelcomeScreen = ({ setIsContactSearchOpen, lastContact, setSelectedContact }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex justify-center items-center p-4 bg-gradient-to-br from-blue-950/60 to-purple-950/60">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full space-y-6"
      >
        <div className="text-center mb-8">
          <MessageSquare className="h-16 w-16 text-blue-400/70 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">مرحباً بك في الدردشات الخاصة</h1>
          <p className="text-blue-300 mt-2">تواصل مع أصدقائك وزملائك بسهولة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lastContact ? (
            <Card className="border-blue-500/30 bg-blue-900/30 backdrop-blur-sm shadow-xl hover:shadow-blue-500/5 hover:bg-blue-800/30 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">آخر جهة اتصال</h3>
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white">
                      {lastContact.username[0]}
                    </div>
                    {lastContact.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-blue-900" />
                    )}
                  </div>
                  <div className="mr-3 truncate">
                    <p className="font-medium text-white">{lastContact.username}</p>
                    <p className="text-xs text-blue-300/80">
                      {lastContact.isOnline ? 'متصل الآن' : 'آخر ظهور ' + new Date(lastContact.lastActivity).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedContact(lastContact)}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                >
                  متابعة المحادثة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-500/30 bg-blue-900/30 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <User className="h-12 w-12 text-blue-400/70 mb-3" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد محادثات سابقة</h3>
                <p className="text-blue-300/80 text-center mb-4">أضف جهات اتصال للبدء بالمحادثة</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-500/30 bg-blue-900/30 backdrop-blur-sm shadow-xl hover:shadow-blue-500/5 hover:bg-blue-800/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-800/40 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">اختيار جهة اتصال</h3>
              <p className="text-blue-300/80 mb-4">اختر جهة اتصال من قائمتك أو أضف جهة جديدة للبدء بالمحادثة</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // تشغيل زر القائمة لفتح قائمة جهات الاتصال
                    const menuButton = document.querySelector('[data-radix-collection-item]') as HTMLButtonElement | null;
                    if (menuButton) menuButton.click();
                  }}
                  className="w-full border-blue-500/30 hover:bg-blue-700/30"
                >
                  اختيار جهة
                </Button>
                <Button 
                  onClick={() => setIsContactSearchOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  إضافة جديدة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
