
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Sparkles, Zap, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ModernWelcomeScreenProps {
  onNavigate: (tab: 'welcome' | 'private' | 'group') => void;
  user: any;
}

const ModernWelcomeScreen = ({ onNavigate, user }: ModernWelcomeScreenProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* خلفية التوهج */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 rounded-3xl" />
      
      {/* العنوان الرئيسي */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="inline-block p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full backdrop-blur-sm border border-purple-500/30 mb-6"
        >
          <Sparkles className="w-16 h-16 text-cyan-300" />
        </motion.div>
        
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
        >
          مرحباً {user?.username || 'بك'}! 
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          استكشف عالم المحادثات المطور مع واجهة مستقبلية وتجربة تفاعلية فريدة
        </motion.p>
      </motion.div>

      {/* بطاقات الخيارات */}
      <motion.div
        variants={itemVariants}
        className="grid md:grid-cols-2 gap-8 max-w-4xl w-full"
      >
        {/* بطاقة المحادثات الخاصة */}
        <motion.div
          whileHover={{ scale: 1.05, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-500 cursor-pointer h-64"
            onClick={() => onNavigate('private')}
          >
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-12 h-12 text-cyan-300" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">المحادثات الخاصة</h3>
                <p className="text-cyan-200 text-sm leading-relaxed">
                  تواصل مع أصدقائك في محادثات خاصة آمنة مع واجهة مطورة وميزات متقدمة
                </p>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                ابدأ المحادثة
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* بطاقة المحادثات الجماعية */}
        <motion.div
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-500 cursor-pointer h-64"
            onClick={() => onNavigate('group')}
          >
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-12 h-12 text-purple-300" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-6 h-6 text-pink-400" />
                  </motion.div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">المحادثات الجماعية</h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  انضم إلى مجتمعات نشطة وشارك في مناقشات جماعية مع واجهة تفاعلية مبهرة
                </p>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                <Users className="w-5 h-5 mr-2" />
                انضم للمجموعات
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* إحصائيات سريعة */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid grid-cols-3 gap-6 max-w-md"
      >
        {[
          { icon: MessageSquare, label: 'رسالة', count: '2.5K+', color: 'text-cyan-400' },
          { icon: Users, label: 'مستخدم', count: '150+', color: 'text-purple-400' },
          { icon: Zap, label: 'غرفة نشطة', count: '12', color: 'text-pink-400' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, delay: index * 0.5 }}
              className={`inline-block p-3 rounded-full bg-gray-800/50 border border-gray-600/30 mb-2`}
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </motion.div>
            <div className={`text-lg font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ModernWelcomeScreen;
