import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import tawjihiLogo from '@/assets/tawjihi-logo.jpg';

const JordanTawjihi = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<'first' | 'second' | null>(null);

  const subjects = [
    {
      id: 'history',
      title: 'التاريخ',
      gradient: 'from-amber-600/20 to-yellow-600/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      route: '/jordan-tawjihi/history',
      icon: '📜'
    },
    {
      id: 'religion',
      title: 'التربية الإسلامية',
      gradient: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      route: '/jordan-tawjihi/religion',
      icon: '🕌'
    },
    {
      id: 'english',
      title: 'اللغة الإنجليزية',
      gradient: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      route: '/jordan-tawjihi/english',
      icon: '🇬🇧'
    },
    {
      id: 'arabic',
      title: 'اللغة العربية',
      gradient: 'from-purple-600/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      route: '/jordan-tawjihi/arabic',
      icon: '📖'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-orange-900/40 via-yellow-900/30 to-blue-950 bg-fixed" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <img 
                src={tawjihiLogo} 
                alt="التوجيهي الأردني" 
                className="h-40 w-auto rounded-2xl shadow-2xl shadow-orange-500/50 border-4 border-orange-500/30"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 blur-xl"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
          >
            التوجيهي الأردني
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto"
          >
            منصة شاملة لطلاب التوجيهي في الأردن - جميع المواد والموارد التعليمية
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedGrade ? (
            <motion.div
              key="grade-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, x: -100, rotateY: -30 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.03, y: -10 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500/40 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden group"
                  onClick={() => setSelectedGrade('first')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <CardContent className="p-10 text-center relative">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <GraduationCap className="w-24 h-24 mx-auto mb-6 text-blue-400 drop-shadow-lg" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">الصف الأول ثانوي</h2>
                    <p className="text-white/80 text-lg">اختر هذا الخيار للدخول إلى مواد الصف الأول ثانوي</p>
                    <motion.div 
                      className="mt-6 inline-block px-6 py-2 bg-blue-500/30 rounded-full text-white font-semibold"
                      whileHover={{ scale: 1.1 }}
                    >
                      ابدأ الآن →
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100, rotateY: 30 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.03, y: -10 }}
              >
                <Card 
                  className="relative bg-gradient-to-br from-gray-600/20 to-gray-700/20 border-2 border-gray-500/40 cursor-not-allowed overflow-hidden opacity-75"
                >
                  <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="bg-yellow-500/90 text-gray-900 px-8 py-4 rounded-2xl text-2xl font-bold flex items-center gap-3 shadow-2xl"
                    >
                      <Clock className="w-8 h-8" />
                      قريباً
                    </motion.div>
                  </div>
                  <CardContent className="p-10 text-center relative">
                    <GraduationCap className="w-24 h-24 mx-auto mb-6 text-gray-400 drop-shadow-lg" />
                    <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">الصف الثاني ثانوي</h2>
                    <p className="text-white/60 text-lg">سيتم إضافة مواد الصف الثاني ثانوي قريباً</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="subjects-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
              >
                <Button
                  onClick={() => setSelectedGrade(null)}
                  variant="outline"
                  className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                  size="lg"
                >
                  ← العودة لاختيار الصف
                </Button>
                <motion.h2 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
                >
                  {selectedGrade === 'first' ? 'الصف الأول ثانوي' : 'الصف الثاني ثانوي'}
                </motion.h2>
                <p className="text-white/80 text-lg mt-3">اختر المادة للدخول إلى المحتوى التعليمي</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 100, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ scale: 1.05, y: -15 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`relative bg-gradient-to-br ${subject.gradient} border-2 ${subject.borderColor} cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
                      onClick={() => navigate(`${subject.route}?grade=${selectedGrade}`)}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <CardContent className="p-8 relative">
                        <div className="flex items-center gap-6">
                          <motion.div
                            className={`text-6xl`}
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          >
                            {subject.icon}
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{subject.title}</h3>
                            <p className="text-white/80 text-sm">انقر للدخول إلى المادة</p>
                          </div>
                          <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <BookOpen className={`w-8 h-8 ${subject.iconColor}`} />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default JordanTawjihi;
