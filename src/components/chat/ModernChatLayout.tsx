
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Settings, Search, Plus, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ModernPrivateChat from './ModernPrivateChat';
import ModernGroupChat from './ModernGroupChat';
import ModernWelcomeScreen from './ModernWelcomeScreen';

interface ModernChatLayoutProps {
  user: any;
}

const ModernChatLayout = ({ user }: ModernChatLayoutProps) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'private' | 'group'>('welcome');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const tabVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-black z-50 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute mt-32 text-cyan-300 text-xl font-bold"
        >
          جاري تحميل المحادثات...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden flex flex-col"
    >
      {/* خلفية الجسيمات المتحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* شريط التبويبات المطور */}
      <motion.div
        variants={tabVariants}
        className="relative z-10 p-4 flex-shrink-0"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <motion.h1
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
              >
                منصة المحادثات المطورة
              </motion.h1>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-full"
                >
                  <Settings className="w-4 h-4 text-purple-300" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 rounded-full"
                >
                  <Search className="w-4 h-4 text-cyan-300" />
                </Button>
              </div>
            </div>

            {/* أزرار التبويبات المطورة */}
            <div className="flex gap-3">
              {[
                { id: 'welcome', label: 'الرئيسية', icon: Star, color: 'from-yellow-400 to-orange-500' },
                { id: 'private', label: 'المحادثات الخاصة', icon: MessageSquare, color: 'from-cyan-400 to-blue-500' },
                { id: 'group', label: 'المحادثات الجماعية', icon: Users, color: 'from-purple-400 to-pink-500' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl border-2 border-white/30"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* محتوى التبويبات - إصلاح العرض الكامل والتمرير */}
      <div className="flex-1 px-4 pb-4 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <ModernWelcomeScreen 
                onNavigate={setActiveTab}
                user={user}
              />
            </motion.div>
          )}

          {activeTab === 'private' && (
            <motion.div
              key="private"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <ModernPrivateChat user={user} />
            </motion.div>
          )}

          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <ModernGroupChat user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ModernChatLayout;
