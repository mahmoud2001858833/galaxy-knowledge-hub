
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, FlaskConical, BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import AtomicStructureUnit from './units/AtomicStructureUnit';
import AcidsBasesUnit from './units/AcidsBasesUnit';

interface GradeNineFirstSemesterProps {
  onBack: () => void;
}

const GradeNineFirstSemester = ({ onBack }: GradeNineFirstSemesterProps) => {
  const { t, dir } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const units = [
    {
      id: 'atomic-structure',
      title: 'الوحدة الأولى: بِنية الذرَّة',
      icon: <Atom className="w-10 h-10 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/30',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      lessons: 2,
      videos: 12
    },
    {
      id: 'acids-bases',
      title: 'الوحدة الثانية: الحموض والقواعد والأملاح',
      icon: <FlaskConical className="w-10 h-10 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      lessons: 2,
      videos: 10
    }
  ];

  if (selectedUnit === 'atomic-structure') {
    return <AtomicStructureUnit onBack={() => setSelectedUnit(null)} />;
  }

  if (selectedUnit === 'acids-bases') {
    return <AcidsBasesUnit onBack={() => setSelectedUnit(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
        >
          &larr; العودة للفصول
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-500 mb-4">
          📘 الفصل الأول - الكيمياء
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

export default GradeNineFirstSemester;
