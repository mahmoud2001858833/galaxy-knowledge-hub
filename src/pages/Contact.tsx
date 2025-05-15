
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactForm from '@/components/contact/ContactForm';
import AdminMessagesPanel from '@/components/contact/AdminMessagesPanel';

const Contact = () => {
  const [activeTab, setActiveTab] = useState<string>('user');
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500">
              تواصل معنا
            </h1>
            <p className="text-white text-lg mt-2">
              يمكنك التواصل معنا عبر النموذج التالي، وسنقوم بالرد عليك في أقرب وقت ممكن
            </p>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="user">إرسال شكوى</TabsTrigger>
              <TabsTrigger value="admin">لوحة المشرف</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user" className="w-full">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <ContactForm />
              </div>
            </TabsContent>
            
            <TabsContent value="admin" className="w-full">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <AdminMessagesPanel />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
