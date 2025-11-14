import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      route: '/jordan-tawjihi/history'
    },
    {
      id: 'religion',
      title: 'التربية الإسلامية',
      gradient: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      route: '/jordan-tawjihi/religion'
    },
    {
      id: 'english',
      title: 'اللغة الإنجليزية',
      gradient: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      route: '/jordan-tawjihi/english'
    },
    {
      id: 'arabic',
      title: 'اللغة العربية',
      gradient: 'from-purple-600/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      route: '/jordan-tawjihi/arabic'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-blue-950 bg-fixed" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-glow-purple mb-4">
            التوجيهي الأردني
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            منصة شاملة لطلاب التوجيهي في الأردن
          </p>
        </motion.div>

        {!selectedGrade ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 cursor-pointer hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
                onClick={() => setSelectedGrade('first')}
              >
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-20 h-20 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white mb-2">الصف الأول ثانوي</h2>
                  <p className="text-white/70">اختر هذا الخيار للدخول إلى مواد الصف الأول ثانوي</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30 cursor-pointer hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300"
                onClick={() => setSelectedGrade('second')}
              >
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-20 h-20 mx-auto mb-4 text-green-400" />
                  <h2 className="text-3xl font-bold text-white mb-2">الصف الثاني ثانوي</h2>
                  <p className="text-white/70">اختر هذا الخيار للدخول إلى مواد الصف الثاني ثانوي</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 text-center"
            >
              <Button
                onClick={() => setSelectedGrade(null)}
                variant="outline"
                className="mb-4"
              >
                ← العودة لاختيار الصف
              </Button>
              <h2 className="text-3xl font-bold text-white">
                {selectedGrade === 'first' ? 'الصف الأول ثانوي' : 'الصف الثاني ثانوي'}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`bg-gradient-to-br ${subject.gradient} border ${subject.borderColor} cursor-pointer hover:shadow-xl hover:shadow-${subject.iconColor}/50 transition-all duration-300`}
                    onClick={() => navigate(`${subject.route}?grade=${selectedGrade}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <BookOpen className={`w-12 h-12 ${subject.iconColor}`} />
                        <div>
                          <h3 className="text-2xl font-bold text-white">{subject.title}</h3>
                          <p className="text-white/70 text-sm">انقر للدخول إلى المادة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default JordanTawjihi;
