
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
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950" dir="rtl">
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
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500 mb-0">
              المجلة العلمية
            </h1>
            
            <UploadJournalDrawer />
          </div>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في المجلة العلمية! هنا يمكنك العثور على مقالات ودراسات علمية في مختلف التخصصات.
          </p>

          <Tabs defaultValue="physics" dir="rtl" onValueChange={(value) => setActiveSubject(value as SubjectType)}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="physics">الفيزياء</TabsTrigger>
              <TabsTrigger value="chemistry">الكيمياء</TabsTrigger>
              <TabsTrigger value="biology">الأحياء</TabsTrigger>
              <TabsTrigger value="mathematics">الرياضيات</TabsTrigger>
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
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScientificJournal;
