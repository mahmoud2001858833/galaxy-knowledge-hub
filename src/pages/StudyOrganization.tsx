import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Calendar } from 'lucide-react';
import StudySchedule from '@/components/studyOrganization/StudySchedule';
import PomodoroTimer from '@/components/studyOrganization/PomodoroTimer';
import MonthlySchedule from '@/components/studyOrganization/MonthlySchedule';

const StudyOrganization = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-green-900/40 to-green-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-white to-green-500 mb-4">
            تنظيم الدراسة
          </h1>
          
          <p className="text-white/80 text-lg mb-8">
            نظم وقتك وزد إنتاجيتك مع أدوات تنظيم الدراسة المتقدمة
          </p>

          <Tabs 
            defaultValue="monthly" 
            dir="rtl" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-white/5 border border-white/10">
                <TabsTrigger 
                  value="monthly" 
                  className="flex flex-col items-center py-3 data-[state=active]:bg-green-600/30 data-[state=active]:text-green-300"
                >
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-sm">الجداول الشهرية</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="daily" 
                  className="flex flex-col items-center py-3 data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-300"
                >
                  <CalendarDays className="h-5 w-5 mb-1" />
                  <span className="text-sm">تنظيم الأيام</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="pomodoro" 
                  className="flex flex-col items-center py-3 data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300"
                >
                  <Clock className="h-5 w-5 mb-1" />
                  <span className="text-sm">تقنية بومودورو</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TabsContent value="monthly" className="mt-0">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-green-300 flex items-center gap-2">
                      <Calendar className="h-6 w-6" />
                      الجداول الشهرية
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      خطط لشهر كامل وتتبع تقدمك في تحقيق أهدافك الدراسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonthlySchedule />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="daily" className="mt-0">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-300 flex items-center gap-2">
                      <CalendarDays className="h-6 w-6" />
                      تنظيم الأيام
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      أضف جلسات الدراسة اليومية ونظم جدولك بشكل فعال
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudySchedule />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pomodoro" className="mt-0">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-purple-300 flex items-center gap-2">
                      <Clock className="h-6 w-6" />
                      تقنية بومودورو
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      استخدم تقنية بومودورو لزيادة التركيز مع تنبيهات صوتية واضحة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PomodoroTimer />
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyOrganization;
