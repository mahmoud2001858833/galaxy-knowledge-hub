
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectJournalsGrid from '@/components/scientificJournal/SubjectJournalsGrid';
import UploadJournalDrawer from '@/components/scientificJournal/UploadJournalDrawer';
import { SubjectType } from '@/components/shared/types/educationalContentTypes';

const ScientificJournal = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectType>('physics');
  
  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b ${
      activeSubject === 'physics' ? 'from-blue-900/40 to-blue-950' :
      activeSubject === 'chemistry' ? 'from-purple-900/40 to-purple-950' :
      activeSubject === 'biology' ? 'from-green-900/40 to-green-950' :
      activeSubject === 'mathematics' ? 'from-cyan-900/40 to-cyan-950' :
      activeSubject === 'arabic' ? 'from-amber-900/40 to-amber-950' :
      'from-rose-900/40 to-rose-950'
    }`} dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-4xl font-bold bg-clip-text text-transparent ${
              activeSubject === 'physics' ? 'bg-gradient-to-r from-blue-400 via-white to-blue-500' :
              activeSubject === 'chemistry' ? 'bg-gradient-to-r from-purple-400 via-white to-purple-500' :
              activeSubject === 'biology' ? 'bg-gradient-to-r from-green-400 via-white to-green-500' :
              activeSubject === 'mathematics' ? 'bg-gradient-to-r from-cyan-400 via-white to-cyan-500' :
              activeSubject === 'arabic' ? 'bg-gradient-to-r from-amber-400 via-white to-amber-500' :
              'bg-gradient-to-r from-rose-400 via-white to-rose-500'
            }`}>
              المجلة العلمية
            </h1>
            
            <UploadJournalDrawer />
          </div>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في المجلة العلمية! هنا يمكنك العثور على مقالات ودراسات علمية في مختلف التخصصات.
          </p>

          <Tabs 
            defaultValue="physics" 
            dir="rtl" 
            value={activeSubject}
            onValueChange={(value) => setActiveSubject(value as SubjectType)}
          >
            <TabsList className="grid grid-cols-6 mb-8">
              <TabsTrigger value="physics" className="data-[state=active]:bg-blue-600">الفيزياء</TabsTrigger>
              <TabsTrigger value="chemistry" className="data-[state=active]:bg-purple-600">الكيمياء</TabsTrigger>
              <TabsTrigger value="biology" className="data-[state=active]:bg-green-600">الأحياء</TabsTrigger>
              <TabsTrigger value="mathematics" className="data-[state=active]:bg-cyan-600">الرياضيات</TabsTrigger>
              <TabsTrigger value="arabic" className="data-[state=active]:bg-amber-600">اللغة العربية</TabsTrigger>
              <TabsTrigger value="english" className="data-[state=active]:bg-rose-600">اللغة الإنجليزية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="physics">
              <SubjectJournalsGrid subject="physics" />
            </TabsContent>
            
            <TabsContent value="chemistry">
              <SubjectJournalsGrid subject="chemistry" />
            </TabsContent>
            
            <TabsContent value="biology">
              <SubjectJournalsGrid subject="biology" />
            </TabsContent>
            
            <TabsContent value="mathematics">
              <SubjectJournalsGrid subject="mathematics" />
            </TabsContent>
            
            <TabsContent value="arabic">
              <SubjectJournalsGrid subject="arabic" />
            </TabsContent>
            
            <TabsContent value="english">
              <SubjectJournalsGrid subject="english" />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScientificJournal;
