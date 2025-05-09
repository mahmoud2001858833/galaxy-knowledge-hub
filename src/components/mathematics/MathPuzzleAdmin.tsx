
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PuzzlesList from './PuzzlesList';
import PuzzleForm from './PuzzleForm';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MathPuzzleAdmin = () => {
  const [activeTab, setActiveTab] = useState<string>("add");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  const handlePuzzleAdded = () => {
    // Switch to the manage tab after adding
    setActiveTab("manage");
    // Trigger a refresh of the puzzles list
    setRefreshTrigger(prev => prev + 1);
    toast.success("تم إضافة اللغز بنجاح!");
  };

  // Listen for Supabase realtime events
  useEffect(() => {
    const channel = supabase
      .channel('puzzles_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'puzzles' 
        }, 
        () => {
          console.log('New puzzle detected via realtime, refreshing list');
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <motion.div 
      className="glass-card rounded-2xl p-8 space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="bg-subject-math-primary/30 p-2 rounded-full">
          <PlusCircle className="text-subject-math-primary h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold text-white text-right">لوحة إدارة الألغاز</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="add" className="text-white data-[state=active]:bg-subject-math-primary">
            إضافة لغز جديد
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-white data-[state=active]:bg-subject-math-primary">
            إدارة الألغاز
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="mt-0">
          <PuzzleForm onSuccess={handlePuzzleAdded} />
        </TabsContent>
        
        <TabsContent value="manage" className="mt-0">
          <PuzzlesList refreshTrigger={refreshTrigger} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default MathPuzzleAdmin;
