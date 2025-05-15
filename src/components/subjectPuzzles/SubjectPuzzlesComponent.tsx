
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubjectPuzzlesList from './SubjectPuzzlesList';

type SubjectType = "physics" | "chemistry" | "biology" | "mathematics";

const SubjectPuzzlesComponent: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectType>("physics");
  const { toast } = useToast();

  return (
    <div className="mb-10">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
        <CardContent className="p-6">
          <Tabs 
            defaultValue="physics" 
            value={activeSubject} 
            onValueChange={(value) => setActiveSubject(value as SubjectType)}
          >
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="physics" className="data-[state=active]:bg-subject-physics-primary">الفيزياء</TabsTrigger>
              <TabsTrigger value="chemistry" className="data-[state=active]:bg-subject-chemistry-primary">الكيمياء</TabsTrigger>
              <TabsTrigger value="biology" className="data-[state=active]:bg-subject-biology-primary">الأحياء</TabsTrigger>
              <TabsTrigger value="mathematics" className="data-[state=active]:bg-subject-mathematics-primary">الرياضيات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="physics">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="physics" />
              </div>
            </TabsContent>
            
            <TabsContent value="chemistry">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="chemistry" />
              </div>
            </TabsContent>
            
            <TabsContent value="biology">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="biology" />
              </div>
            </TabsContent>
            
            <TabsContent value="mathematics">
              <div className="grid grid-cols-1 gap-8 items-start">
                <SubjectPuzzlesList subject="mathematics" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectPuzzlesComponent;
