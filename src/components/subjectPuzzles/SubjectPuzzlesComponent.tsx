
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubjectPuzzlesList from './SubjectPuzzlesList';
import PuzzleDifficultySelector from './PuzzleDifficultySelector';

type SubjectType = "physics" | "chemistry" | "biology" | "mathematics";
type DifficultyType = "all" | "easy" | "medium" | "hard";

const SubjectPuzzlesComponent: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectType>("physics");
  const [difficulty, setDifficulty] = useState<DifficultyType>("all");
  const [showDifficultySelector, setShowDifficultySelector] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Reset difficulty selector visibility when changing subjects
  useEffect(() => {
    setShowDifficultySelector(false);
    setDifficulty("all");
  }, [activeSubject]);

  const subjectIcons = {
    physics: "⚛️",
    chemistry: "🧪",
    biology: "🧬",
    mathematics: "🧮"
  };
  
  const subjectNames = {
    physics: "الفيزياء",
    chemistry: "الكيمياء",
    biology: "الأحياء",
    mathematics: "الرياضيات"
  };
  
  const subjectGradients = {
    physics: "from-indigo-500 via-purple-500 to-indigo-400",
    chemistry: "from-teal-500 via-cyan-500 to-teal-400",
    biology: "from-emerald-500 via-green-500 to-emerald-400",
    mathematics: "from-amber-500 via-orange-500 to-amber-400"
  };

  const handleDifficultySelection = (selectedDifficulty: DifficultyType) => {
    setDifficulty(selectedDifficulty);
    setShowDifficultySelector(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 mb-10"
    >
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl">
        <CardContent className="p-6">
          <Tabs 
            defaultValue="physics" 
            value={activeSubject} 
            onValueChange={(value) => setActiveSubject(value as SubjectType)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="w-full">
                <h2 className="text-2xl font-bold text-white mb-6 text-right">
                  المواد التعليمية
                </h2>
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-transparent p-1 h-auto">
                  {Object.entries(subjectIcons).map(([key, icon]) => (
                    <TabsTrigger 
                      key={key}
                      value={key} 
                      className={`py-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-${key}-600 data-[state=active]:to-${key}-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 bg-white/5 hover:bg-white/15 transition-all duration-300 border border-white/10 backdrop-blur-xl text-lg font-medium h-auto`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-3xl">{icon}</span>
                        <span className="text-base">{subjectNames[key as SubjectType]}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            
            {/* Subject content */}
            {Object.keys(subjectIcons).map((subject) => (
              <TabsContent 
                key={subject} 
                value={subject} 
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="mb-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                  >
                    {/* Difficulty Selector */}
                    <PuzzleDifficultySelector
                      subject={subject}
                      selectedDifficulty={difficulty}
                      onSelectDifficulty={(diff) => handleDifficultySelection(diff as DifficultyType)}
                    />
                  </motion.div>
                </div>

                <motion.div
                  key={`${subject}-${difficulty}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 gap-8 items-start"
                >
                  <SubjectPuzzlesList subject={subject} difficulty={difficulty} />
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubjectPuzzlesComponent;
