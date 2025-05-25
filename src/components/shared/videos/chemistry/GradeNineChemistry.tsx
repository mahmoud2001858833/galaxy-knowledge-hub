
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FlaskConical, Zap, ArrowRight } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import MetalsActivityUnit from './units/MetalsActivityUnit';
import ElectrochemistryUnit from './units/ElectrochemistryUnit';

interface GradeNineChemistryProps {
  onBack: () => void;
}

const GradeNineChemistry = ({ onBack }: GradeNineChemistryProps) => {
  const { t, dir } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const units = [
    {
      id: 'metals-activity',
      title: 'الوحدة الأولى: نشاط الفلزات',
      icon: <FlaskConical className="w-10 h-10 text-orange-400" />,
      color: 'from-orange-500/20 to-red-500/30',
      borderColor: 'border-orange-500/30 hover:border-orange-500/60',
      lessons: 2,
      videos: 9
    },
    {
      id: 'electrochemistry',
      title: 'الوحدة الثانية: الكيمياء الكهربائية',
      icon: <Zap className="w-10 h-10 text-yellow-400" />,
      color: 'from-yellow-500/20 to-orange-500/30',
      borderColor: 'border-yellow-500/30 hover:border-yellow-500/60',
      lessons: 2,
      videos: 11
    }
  ];

  if (selectedUnit === 'metals-activity') {
    return <MetalsActivityUnit onBack={() => setSelectedUnit(null)} />;
  }

  if (selectedUnit === 'electrochemistry') {
    return <ElectrochemistryUnit onBack={() => setSelectedUnit(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
        >
          &larr; العودة للصفوف
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-500 mb-4">
          الصف التاسع - الكيمياء
        </h2>
        <p className="text-white/70">اختر الوحدة التي تريد دراستها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit) => (
          <Card 
            key={unit.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${unit.color} ${unit.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedUnit(unit.id)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                  {unit.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                  {unit.title}
                </h3>
                
                <div className="flex flex-col gap-2 mb-6 text-white/80 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{unit.lessons} دروس</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    <span>{unit.videos} فيديو</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  <span>ابدأ التعلم</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GradeNineChemistry;
