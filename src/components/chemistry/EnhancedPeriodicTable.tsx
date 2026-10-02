
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FilterX, Filter, Sun, Moon, Info, Atom, Zap, Target, Activity } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { completePeriodicElements } from '@/data/complete-periodic-elements';
import { elementGroups, Element, ElementType } from '@/types/periodic-table';
import ElementComparison from './ElementComparison';
import CompletePeriodicTable from './CompletePeriodicTable';

const EnhancedPeriodicTable = () => {
  const [activeTab, setActiveTab] = useState('complete-table');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 backdrop-blur-xl">
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            الجدول الدوري التفاعلي الشامل
          </h1>
          <p className="text-white/70 text-center">استكشف جميع العناصر الـ 118 وقارن بين خصائصها</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg border border-white/20 p-1">
            <TabsTrigger 
              value="complete-table" 
              className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Atom className="h-4 w-4 mr-2" />
              الجدول الدوري الكامل
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Target className="h-4 w-4 mr-2" />
              مقارنة العناصر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complete-table"

 className="mt-6">
            <CompletePeriodicTable />
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <ElementComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedPeriodicTable;
