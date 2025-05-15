
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

  const difficultyColors = {
    all: "bg-gradient-to-r from-gray-400 to-gray-600",
    easy: "bg-gradient-to-r from-green-400 to-green-600",
    medium: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    hard: "bg-gradient-to-r from-red-400 to-red-600"
  };

  return (
    <div className="mb-10">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
        <CardContent className="p-6">
          <Tabs 
            defaultValue="physics" 
            value={activeSubject} 
            onValueChange={(value) => setActiveSubject(value as SubjectType)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <TabsList className="grid grid-cols-4 mb-4 md:mb-0 md:w-auto">
                <TabsTrigger value="physics" className="data-[state=active]:bg-subject-physics-primary">الفيزياء</TabsTrigger>
                <TabsTrigger value="chemistry" className="data-[state=active]:bg-subject-chemistry-primary">الكيمياء</TabsTrigger>
                <TabsTrigger value="biology" className="data-[state=active]:bg-subject-biology-primary">الأحياء</TabsTrigger>
                <TabsTrigger value="mathematics" className="data-[state=active]:bg-subject-mathematics-primary">الرياضيات</TabsTrigger>
              </TabsList>
              
              <Select 
                value={difficulty} 
                onValueChange={(value) => setDifficulty(value as DifficultyType)}
              >
                <SelectTrigger className={`w-44 border-white/20 ${difficultyColors[difficulty]} text-white`}>
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent className="bg-white/10 backdrop-blur-lg border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/20">جميع المستويات</SelectItem>
                  <SelectItem value="easy" className="text-green-400 hover:bg-green-900/20">سهل</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400 hover:bg-yellow-900/20">متوسط</SelectItem>
                  <SelectItem value="hard" className="text-red-400 hover:bg-red-900/20">صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TabsContent value="physics">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="physics" difficulty={difficulty} />
              </div>
            </TabsContent>
            
            <TabsContent value="chemistry">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="chemistry" difficulty={difficulty} />
              </div>
            </TabsContent>
            
            <TabsContent value="biology">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="biology" difficulty={difficulty} />
              </div>
            </TabsContent>
            
            <TabsContent value="mathematics">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="mathematics" difficulty={difficulty} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectPuzzlesComponent;
