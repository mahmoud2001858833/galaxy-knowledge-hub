import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import AIAssistantTab from './programming/AIAssistantTab';
import MathToCodeTab from './programming/MathToCodeTab';
import ConceptsTab from './programming/ConceptsTab';
import StudentProjectsTab from './programming/StudentProjectsTab';
import CodeFixerTab from './programming/CodeFixerTab';
import DevTipsTab from './programming/DevTipsTab';
import BuildPlatformTab from './programming/BuildPlatformTab';

const ProgrammingSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai-assistant');

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" dir="rtl">
      <SEO 
        title="البرمجة - تكنولوجيا المعلومات"
        description="منصة برمجية متطورة مع مساعد ذكي، تصحيح الأكواد، وبناء المشاريع"
        keywords="برمجة, AI, مساعد ذكي, تصحيح كود, تطوير برمجيات"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate('/btec/information-technology')}
            variant="outline"
            className="mb-6 gap-2 bg-white/5 hover:bg-white/10 border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة لتكنولوجيا المعلومات
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-l from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              منصة البرمجة المتطورة
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              مساعد ذكي، تصحيح الأكواد، تحويل الرياضيات لكود، وبناء منصاتك الخاصة
            </p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 gap-2 bg-white/5 p-2 rounded-xl mb-8">
            <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
              مساعد الذكاء الاصطناعي
            </TabsTrigger>
            <TabsTrigger value="concepts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              المفاهيم البرمجية
            </TabsTrigger>
            <TabsTrigger value="math-to-code" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-500">
              رياضيات إلى كود
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500">
              مشاريع الطلاب
            </TabsTrigger>
            <TabsTrigger value="code-fixer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500">
              تصحيح الكود
            </TabsTrigger>
            <TabsTrigger value="dev-tips" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              نصائح التطوير
            </TabsTrigger>
            <TabsTrigger value="build-platform" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500">
              بناء منصة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-assistant">
            <AIAssistantTab />
          </TabsContent>

          <TabsContent value="concepts">
            <ConceptsTab />
          </TabsContent>

          <TabsContent value="math-to-code">
            <MathToCodeTab />
          </TabsContent>

          <TabsContent value="projects">
            <StudentProjectsTab />
          </TabsContent>

          <TabsContent value="code-fixer">
            <CodeFixerTab />
          </TabsContent>

          <TabsContent value="dev-tips">
            <DevTipsTab />
          </TabsContent>

          <TabsContent value="build-platform">
            <BuildPlatformTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProgrammingSection;
