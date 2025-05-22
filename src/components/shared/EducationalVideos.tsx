
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import PhysicsVideos from './videos/PhysicsVideos';
import ChemistryVideos from './videos/ChemistryVideos';
import BiologyVideos from './videos/BiologyVideos';
import MathematicsVideos from './videos/MathematicsVideos';

const EducationalVideos = () => {
  const { t, dir } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<string>("physics");

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500 mb-4">
          {t.resources.educationalVideos}
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          {t.resources.educationalVideosDescription}
        </p>
      </div>

      <Tabs 
        defaultValue={selectedTab} 
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="physics" className="data-[state=active]:bg-subject-physics-primary">
            {t.subjects.subjectTitle.physics}
          </TabsTrigger>
          <TabsTrigger value="chemistry" className="data-[state=active]:bg-subject-chemistry-primary">
            {t.subjects.subjectTitle.chemistry}
          </TabsTrigger>
          <TabsTrigger value="biology" className="data-[state=active]:bg-subject-biology-primary">
            {t.subjects.subjectTitle.biology}
          </TabsTrigger>
          <TabsTrigger value="mathematics" className="data-[state=active]:bg-subject-mathematics-primary">
            {t.subjects.subjectTitle.mathematics}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physics" className="focus-visible:outline-none focus-visible:ring-0">
          <PhysicsVideos />
        </TabsContent>
        
        <TabsContent value="chemistry" className="focus-visible:outline-none focus-visible:ring-0">
          <ChemistryVideos />
        </TabsContent>
        
        <TabsContent value="biology" className="focus-visible:outline-none focus-visible:ring-0">
          <BiologyVideos />
        </TabsContent>
        
        <TabsContent value="mathematics" className="focus-visible:outline-none focus-visible:ring-0">
          <MathematicsVideos />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationalVideos;
