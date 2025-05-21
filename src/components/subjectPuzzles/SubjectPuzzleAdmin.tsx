
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectPuzzlesList from './SubjectPuzzlesList';
import SubjectPuzzleForm from './SubjectPuzzleForm';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

interface SubjectPuzzleAdminProps {
  subject: string;
  onSuccess?: () => void;
  onPuzzleAdded?: () => Promise<void>;
}

const SubjectPuzzleAdmin = ({ subject, onSuccess, onPuzzleAdded }: SubjectPuzzleAdminProps) => {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("add");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  const handlePuzzleAdded = async () => {
    // Switch to the manage tab after adding
    setActiveTab("manage");
    // Trigger a refresh of the puzzles list
    setRefreshTrigger(prev => prev + 1);
    
    // Call both callbacks if provided
    if (onSuccess) {
      onSuccess();
    }
    
    if (onPuzzleAdded) {
      await onPuzzleAdded();
    }
    
    toast.success(t.admin.newAdded);
  };

  // Listen for Supabase realtime events
  useEffect(() => {
    const channel = supabase
      .channel('subject_puzzles_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'subject_puzzles' 
        }, 
        () => {
          console.log('New puzzle detected via realtime, refreshing list');
          setRefreshTrigger(prev => prev + 1);
          
          if (onSuccess) {
            onSuccess();
          }
          
          if (onPuzzleAdded) {
            onPuzzleAdded();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onSuccess, onPuzzleAdded]);
  
  return (
    <motion.div 
      className="glass-card rounded-2xl p-8 space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      dir={dir}
    >
      <div className="flex items-center justify-between">
        <div className={`bg-subject-${subject}-primary/30 p-2 rounded-full`}>
          <PlusCircle className={`text-subject-${subject}-primary h-6 w-6`} />
        </div>
        <h3 className={`text-2xl font-bold text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {t.admin.panel}
        </h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger 
            value="add" 
            className={`text-white data-[state=active]:bg-subject-${subject}-primary`}
          >
            {t.puzzles.addPuzzle}
          </TabsTrigger>
          <TabsTrigger 
            value="manage" 
            className={`text-white data-[state=active]:bg-subject-${subject}-primary`}
          >
            {t.puzzles.managePuzzles}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="mt-0">
          <SubjectPuzzleForm 
            subject={subject} 
            onSuccess={handlePuzzleAdded} 
          />
        </TabsContent>
        
        <TabsContent value="manage" className="mt-0">
          <SubjectPuzzlesList 
            subject={subject}
            refreshTrigger={refreshTrigger} 
            onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SubjectPuzzleAdmin;
