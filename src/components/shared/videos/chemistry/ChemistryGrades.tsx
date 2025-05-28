
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, FlaskConical } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import GradeTenChemistry from './GradeTenChemistry';
import GradeNineChemistry from './GradeNineChemistry';
import GradeElevenChemistry from './GradeElevenChemistry';

const ChemistryGrades = () => {
  const { t, dir } = useLanguage();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const grades = [
    {
      id: 'grade-9',
      title: 'الصف التاسع',
      icon: <BookOpen className="w-8 h-8 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      units: 4,
      lessons: 6,
      videos: 42
    },
    {
      id: 'grade-10',
      title: 'الصف العاشر',
      icon: <FlaskConical className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/30',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      units: 5,
      lessons: 10,
      videos: 50
    },
    {
      id: 'grade-11',
      title: 'الأول ثانوي',
      icon: <GraduationCap className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/30',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      units: 2,
      lessons: 6,
      videos: 28
    }
  ];

  if (selectedGrade === 'grade-9') {
    return <GradeNineChemistry onBack={() => setSelectedGrade(null)} />;
  }

  if (selectedGrade === 'grade-10') {
    return (
      <div className="space-y-6 relative">
        {/* Teacher Credit */}
        <div className="absolute top-0 left-4 z-10">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2">
            <p className="text-white/80 text-sm font-medium">فيديوهات للأستاذ ليث دبابسة</p>
          </div>
        </div>
        <GradeTenChemistry onBack={() => setSelectedGrade(null)} />
      </div>
    );
  }

  if (selectedGrade === 'grade-11') {
    return <GradeElevenChemistry onBack={() => setSelectedGrade(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-500 mb-4">
          اختر الصف الدراسي
        </h2>
        <p className="text-white/70">اختر الصف الذي تريد مشاهدة فيديوهاته التعليمية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <Card 
            key={grade.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${grade.color} ${grade.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedGrade(grade.id)}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                {grade.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{grade.title}</h3>
              
              <div className="space-y-1 text-white/70 text-sm mb-4">
                <div>{grade.units} وحدات</div>
                <div>{grade.lessons} دروس</div>
                <div>{grade.videos} فيديو</div>
              </div>
              
              <div className="mt-auto">
                <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  استكشف المحتوى
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChemistryGrades;
