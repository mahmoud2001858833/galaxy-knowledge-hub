
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectImagesGrid from '@/components/visualLibrary/SubjectImagesGrid';
import UploadImageDrawer from '@/components/visualLibrary/UploadImageDrawer';
import { SubjectType } from '@/components/shared/types/educationalContentTypes';

const VisualLibrary = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectType>('physics');
  
  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b ${
      activeSubject === 'physics' ? 'from-blue-900/40 to-blue-950' :
      activeSubject === 'chemistry' ? 'from-purple-900/40 to-purple-950' :
      activeSubject === 'biology' ? 'from-green-900/40 to-green-950' :
      'from-cyan-900/40 to-cyan-950'
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
              'bg-gradient-to-r from-cyan-400 via-white to-cyan-500'
            }`}>
              المكتبة المرئية
            </h1>
            
            <UploadImageDrawer />
          </div>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في المكتبة المرئية! هنا يمكنك العثور على صور تعليمية لمختلف المواضيع العلمية.
          </p>

          <Tabs 
            defaultValue="physics" 
            dir="rtl" 
            value={activeSubject}
            onValueChange={(value) => setActiveSubject(value as SubjectType)}
          >
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="physics" className="data-[state=active]:bg-blue-600">الفيزياء</TabsTrigger>
              <TabsTrigger value="chemistry" className="data-[state=active]:bg-purple-600">الكيمياء</TabsTrigger>
              <TabsTrigger value="biology" className="data-[state=active]:bg-green-600">الأحياء</TabsTrigger>
              <TabsTrigger value="mathematics" className="data-[state=active]:bg-cyan-600">الرياضيات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="physics">
              <SubjectImagesGrid subject="physics" />
            </TabsContent>
            
            <TabsContent value="chemistry">
              <SubjectImagesGrid subject="chemistry" />
            </TabsContent>
            
            <TabsContent value="biology">
              <SubjectImagesGrid subject="biology" />
            </TabsContent>
            
            <TabsContent value="mathematics">
              <SubjectImagesGrid subject="mathematics" />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VisualLibrary;
