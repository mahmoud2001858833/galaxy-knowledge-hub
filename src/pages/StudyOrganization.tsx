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
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-green-400 dark:via-white dark:to-green-500 mb-4">
            تنظيم الدراسة
          </h1>
          
          <p className="text-slate-600 dark:text-white/80 text-lg mb-8">
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
              <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl h-auto shadow-sm dark:shadow-none">
                <TabsTrigger 
                  value="monthly" 
                  className="flex flex-col items-center py-3 text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-green-600/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-green-300 rounded-lg data-[state=active]:shadow-sm"
                >
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-sm font-medium">الجداول الشهرية</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="daily" 
                  className="flex flex-col items-center py-3 text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-lg data-[state=active]:shadow-sm"
                >
                  <CalendarDays className="h-5 w-5 mb-1" />
                  <span className="text-sm font-medium">تنظيم الأيام</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="pomodoro" 
                  className="flex flex-col items-center py-3 text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 rounded-lg data-[state=active]:shadow-sm"
                >
                  <Clock className="h-5 w-5 mb-1" />
                  <span className="text-sm font-medium">تقنية بومودورو</span>
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
                <Card className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 shadow-md dark:shadow-none">
                  <CardHeader>
                    <CardTitle className="text-2xl text-emerald-700 dark:text-green-300 flex items-center gap-2">
                      <Calendar className="h-6 w-6" />
                      الجداول الشهرية
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-white/70">
                      خطط لشهر كامل وتتبع تقدمك في تحقيق أهدافك الدراسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonthlySchedule />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="daily" className="mt-0">
                <Card className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 shadow-md dark:shadow-none">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <CalendarDays className="h-6 w-6" />
                      تنظيم الأيام
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-white/70">
                      أضف جلسات الدراسة اليومية ونظم جدولك بشكل فعال
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudySchedule />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pomodoro" className="mt-0">
                <Card className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 shadow-md dark:shadow-none">
                  <CardHeader>
                    <CardTitle className="text-2xl text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <Clock className="h-6 w-6" />
                      تقنية بومودورو
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-white/70">
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
