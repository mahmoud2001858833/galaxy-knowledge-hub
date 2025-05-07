
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Video } from 'lucide-react';
import StudySchedule from '@/components/studyOrganization/StudySchedule';
import PomodoroTimer from '@/components/studyOrganization/PomodoroTimer';
import RelaxationVideos from '@/components/studyOrganization/RelaxationVideos';

const StudyOrganization = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  
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
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-white to-green-500 mb-8">
            تنظيم الدراسة
          </h1>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في قسم تنظيم الدراسة! هنا يمكنك العثور على أدوات متنوعة تساعدك على تنظيم وقتك وزيادة إنتاجيتك أثناء الدراسة.
          </p>

          <Tabs 
            defaultValue="schedule" 
            dir="rtl" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-xl">
                <TabsTrigger value="schedule" className="flex flex-col items-center py-3">
                  <CalendarDays className="h-5 w-5 mb-1" />
                  الجداول الدراسية
                </TabsTrigger>
                <TabsTrigger value="pomodoro" className="flex flex-col items-center py-3">
                  <Clock className="h-5 w-5 mb-1" />
                  تقنية بومودورو
                </TabsTrigger>
                <TabsTrigger value="relaxation" className="flex flex-col items-center py-3">
                  <Video className="h-5 w-5 mb-1" />
                  فيديوهات استرخاء
                </TabsTrigger>
              </TabsList>
            </div>
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TabsContent value="schedule" className="mt-0">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-green-300">الجداول الدراسية</CardTitle>
                    <CardDescription className="text-white/70">
                      نظم وقتك ودراستك عبر إنشاء جداول دراسية مخصصة
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
                    <CardTitle className="text-2xl text-green-300">تقنية بومودورو</CardTitle>
                    <CardDescription className="text-white/70">
                      استخدم تقنية بومودورو لزيادة التركيز والإنتاجية في الدراسة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PomodoroTimer />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="relaxation" className="mt-0">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-green-300">فيديوهات استرخاء</CardTitle>
                    <CardDescription className="text-white/70">
                      استمتع بفيديوهات استرخاء للراحة بين فترات المذاكرة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RelaxationVideos />
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
