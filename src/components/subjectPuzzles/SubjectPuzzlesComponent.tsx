
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubjectPuzzlesList from './SubjectPuzzlesList';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type SubjectType = "physics" | "chemistry" | "biology" | "mathematics";
type DifficultyType = "all" | "easy" | "medium" | "hard";

const SubjectPuzzlesComponent: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectType>("physics");
  const [difficulty, setDifficulty] = useState<DifficultyType>("all");
  const { toast } = useToast();

  const subjectIcons = {
    physics: "⚛️",
    chemistry: "🧪",
    biology: "🧬",
    mathematics: "🧮"
  };
  
  const subjectGradients = {
    physics: "from-indigo-500 via-purple-500 to-indigo-400",
    chemistry: "from-teal-500 via-cyan-500 to-teal-400",
    biology: "from-emerald-500 via-green-500 to-emerald-400",
    mathematics: "from-amber-500 via-orange-500 to-amber-400"
  };

  const difficultyStyles = {
    all: {
      bg: "bg-gradient-to-r from-slate-700 to-slate-500",
      text: "text-white",
      shadow: "shadow-slate-500/20"
    },
    easy: {
      bg: "bg-gradient-to-r from-green-600 to-emerald-500",
      text: "text-white", 
      shadow: "shadow-green-500/20"
    },
    medium: {
      bg: "bg-gradient-to-r from-yellow-600 to-amber-500",
      text: "text-white",
      shadow: "shadow-yellow-500/20"
    },
    hard: {
      bg: "bg-gradient-to-r from-red-600 to-rose-500",
      text: "text-white",
      shadow: "shadow-red-500/20"
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 mb-10"
    >
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 overflow-hidden">
        <CardContent className="p-6">
          <Tabs 
            defaultValue="physics" 
            value={activeSubject} 
            onValueChange={(value) => setActiveSubject(value as SubjectType)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="w-full md:w-auto">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white/5 p-1 backdrop-blur-md">
                  <TabsTrigger 
                    value="physics" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-800/20 bg-white/10 hover:bg-white/15 transition-all duration-300 border border-white/5 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{subjectIcons.physics}</span>
                      <span>الفيزياء</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chemistry" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-800/20 bg-white/10 hover:bg-white/15 transition-all duration-300 border border-white/5 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{subjectIcons.chemistry}</span>
                      <span>الكيمياء</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="biology" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-800/20 bg-white/10 hover:bg-white/15 transition-all duration-300 border border-white/5 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{subjectIcons.biology}</span>
                      <span>الأحياء</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mathematics" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-800/20 bg-white/10 hover:bg-white/15 transition-all duration-300 border border-white/5 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{subjectIcons.mathematics}</span>
                      <span>الرياضيات</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="w-full md:w-auto">
                <Select 
                  value={difficulty} 
                  onValueChange={(value) => setDifficulty(value as DifficultyType)}
                >
                  <SelectTrigger className={`w-full md:w-44 backdrop-blur-md border-white/20 ${difficultyStyles[difficulty].bg} ${difficultyStyles[difficulty].text} shadow-lg ${difficultyStyles[difficulty].shadow}`}>
                    <div className="flex items-center gap-2">
                      {difficulty === "all" && <span>جميع المستويات</span>}
                      {difficulty === "easy" && <span>سهل</span>}
                      {difficulty === "medium" && <span>متوسط</span>}
                      {difficulty === "hard" && <span>صعب</span>}
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                    <SelectItem value="all" className="text-white hover:bg-white/20 focus:bg-white/10">جميع المستويات</SelectItem>
                    <SelectItem value="easy" className="text-green-400 hover:bg-green-900/20 focus:bg-green-900/30">سهل</SelectItem>
                    <SelectItem value="medium" className="text-yellow-400 hover:bg-yellow-900/20 focus:bg-yellow-900/30">متوسط</SelectItem>
                    <SelectItem value="hard" className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/30">صعب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="physics" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="physics" difficulty={difficulty} />
              </div>
            </TabsContent>
            
            <TabsContent value="chemistry" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="chemistry" difficulty={difficulty} />
              </div>
            </TabsContent>
            
            <TabsContent value="biology" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="biology" difficulty={difficulty} />
              </div>
            </TabsContent>
            
            <TabsContent value="mathematics" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="mathematics" difficulty={difficulty} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubjectPuzzlesComponent;
