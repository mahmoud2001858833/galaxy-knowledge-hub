import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Atom, Target, Sparkles, BookOpen } from 'lucide-react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import ElementComparison from './ElementComparison';
import CompletePeriodicTable from './CompletePeriodicTable';

const EnhancedPeriodicTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('complete-table');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300 font-sans" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
            <Atom className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin-slow" />
            <span>المنظومة التفاعلية الشاملة للكيمياء العامة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            الجدول الدوري التفاعلي الحديث
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            استكشف العناصر الـ 118 مع فحص التوزيع الإلكتروني، الكهروسلبية، طاقة التأين، والتدرج الدوري بدقة علمية فائقة وتصميم خفيف عالي الأداء.
          </p>
        </motion.div>

        {/* Tab Controls */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-1 rounded-2xl shadow-xs">
              <TabsTrigger 
                value="complete-table" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400 text-slate-600 dark:text-slate-400 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <Atom className="h-4 w-4 ml-2 text-cyan-500" />
                الجدول الدوري الكامل (118 عنصراً)
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 text-slate-600 dark:text-slate-400 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <Target className="h-4 w-4 ml-2 text-purple-500" />
                مختبر المقارنة المتقدم
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="complete-table" className="mt-0 focus-visible:outline-none">
            <CompletePeriodicTable />
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 focus-visible:outline-none">
            <ElementComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedPeriodicTable;
